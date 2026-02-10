/**
 * Vurvey Documentation Screenshot Capture Script
 *
 * This script automates capturing screenshots of the Vurvey platform
 * for documentation purposes. Designed to run in CI/CD environments.
 *
 * Usage:
 *   node scripts/capture-screenshots.js
 *
 * Environment Variables:
 *   VURVEY_EMAIL    - Login email (required)
 *   VURVEY_PASSWORD - Login password (required)
 *   VURVEY_URL      - Base URL (default: https://staging.vurvey.dev)
 *   HEADLESS        - Run headless (default: true)
 */

import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {buildWorkspaceUrl, extractWorkspaceIdFromUrl} from './lib/vurvey-url.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  baseUrl: process.env.VURVEY_URL || 'https://staging.vurvey.dev',
  credentials: {
    email: process.env.VURVEY_EMAIL,
    password: process.env.VURVEY_PASSWORD
  },
  fallbackWorkspaceId: process.env.VURVEY_WORKSPACE_ID || null,
  strict: process.env.CAPTURE_STRICT === 'true',
  screenshotsDir: path.join(__dirname, '..', 'docs', 'public', 'screenshots'),
  artifactsDir: path.join(__dirname, '..', 'qa-output', 'capture-screenshots'),
  viewport: { width: 1920, height: 1080 },
  headless: process.env.HEADLESS !== 'false',
  timeout: 90000,
  retries: 3
};

// Store extracted workspace ID after login
let workspaceId = null;

// Utility functions
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function takeArtifactScreenshot(page, name) {
  try {
    ensureDir(CONFIG.artifactsDir);
    const safe = String(name).replace(/[^a-z0-9-_]/gi, '-').toLowerCase();
    const filepath = path.join(CONFIG.artifactsDir, `${safe}-${Date.now()}.png`);
    await page.screenshot({ path: filepath, fullPage: false }).catch(() => {});
    console.log(`  ✓ Artifact screenshot: ${path.relative(path.join(__dirname, '..'), filepath)}`);
    return filepath;
  } catch {
    return null;
  }
}

async function waitForNetworkIdle(page, timeout = 15000) {
  try {
    await page.waitForNetworkIdle({ idleTime: 2000, timeout });
  } catch (e) {
    console.log('  Network idle timeout (continuing)');
  }
}

async function pageHasGlobalError(page) {
  try {
    const text = await page.evaluate(() => (document.body?.innerText || '').toLowerCase());
    return text.includes('failed to fetch') || text.includes('an error occurred') || text.includes('something went wrong');
  } catch {
    return false;
  }
}

async function gotoWithRetry(page, url, { label, retries = 2 } = {}) {
  const maxAttempts = Math.max(1, retries + 1);
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`  Navigating to: ${url}${label ? ` (${label})` : ''} [attempt ${attempt}/${maxAttempts}]`);
    try {
      // 'networkidle2' can be flaky on SPAs with websockets/long-polling. Use a
      // looser navigation signal and then explicitly wait for loaders/content.
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: CONFIG.timeout });
      await delay(2500);
      await waitForNetworkIdle(page);
      await waitForLoaders(page);
    } catch (e) {
      console.log(`  ⚠ Navigation error: ${e.message}`);
      if (attempt < maxAttempts) {
        await takeArtifactScreenshot(page, `retry-nav-${label || 'page'}-${attempt}`);
        await delay(800 * attempt);
        continue;
      }
      await takeArtifactScreenshot(page, `error-nav-${label || 'page'}`);
      return false;
    }

    if (!(await pageHasGlobalError(page))) return true;

    console.log('  ⚠ Page shows global error state');
    if (attempt < maxAttempts) {
      await takeArtifactScreenshot(page, `retry-error-${label || 'page'}-${attempt}`);
      await delay(800 * attempt);
      continue;
    }
    await takeArtifactScreenshot(page, `error-global-${label || 'page'}`);
    return false;
  }
  return false;
}

async function waitForContent(page, selectors, timeout = 10000) {
  for (const selector of selectors) {
    try {
      await page.waitForSelector(selector, { visible: true, timeout });
      console.log(`  ✓ Found content: ${selector}`);
      return true;
    } catch (e) {
      continue;
    }
  }
  return false;
}

async function waitForLoaders(page, timeout = 15000) {
  const loaderSelectors = [
    '[class*="loading"]',
    '[class*="spinner"]',
    '[class*="skeleton"]',
    '[data-testid*="loading"]',
    '[data-testid*="skeleton"]'
  ];

  console.log('  Waiting for loaders to disappear...');
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    let hasLoaders = false;
    try {
      hasLoaders = await page.evaluate((selectors) => {
        for (const sel of selectors) {
          const elements = document.querySelectorAll(sel);
          for (const el of elements) {
            const style = window.getComputedStyle(el);
            if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
              return true;
            }
          }
        }
        return false;
      }, loaderSelectors);
    } catch {
      // Navigation can still be in-flight or the execution context can be torn down.
      // Treat as "no loaders" to avoid blocking or failing captures.
      return;
    }

    if (!hasLoaders) {
      console.log('  ✓ Loaders cleared');
      return;
    }
    await delay(500);
  }
  console.log('  ⚠ Loader timeout (continuing)');
}

async function takeScreenshot(page, name, subdir = '') {
  const dir = subdir ? path.join(CONFIG.screenshotsDir, subdir) : CONFIG.screenshotsDir;
  ensureDir(dir);
  const filepath = path.join(dir, `${name}.png`);

  // Wait for any loaders to complete
  try {
    await waitForLoaders(page, 8000);
  } catch {
    // Ignore loader wait issues (context destroyed, etc).
  }
  await delay(800);

  try {
    await page.screenshot({ path: filepath, fullPage: false });
  } catch (e) {
    console.log(`  ⚠ Screenshot failed (${name}): ${e.message}`);
    return null;
  }
  console.log(`  ✓ Screenshot: ${subdir}/${name}.png`);
  return filepath;
}

async function clickButtonByText(page, text, timeout = 8000) {
  const startTime = Date.now();
  const norm = String(text).trim().toLowerCase();

  while (Date.now() - startTime < timeout) {
    const clicked = await page.evaluate((needle) => {
      const els = Array.from(document.querySelectorAll("button, a, [role='button'], [role='menuitem']"));
      const el = els.find((e) => (e.textContent || "").trim().toLowerCase().includes(needle));
      if (!el) return false;
      const st = window.getComputedStyle(el);
      if (st.display === "none" || st.visibility === "hidden" || st.opacity === "0") return false;
      el.click();
      return true;
    }, norm);

    if (clicked) return true;
    await delay(250);
  }

  return false;
}

async function clickFirstVisible(page, selectors) {
  return await page.evaluate((selectors) => {
    for (const sel of selectors) {
      const els = Array.from(document.querySelectorAll(sel));
      const el = els.find((e) => {
        const st = window.getComputedStyle(e);
        if (st.display === "none" || st.visibility === "hidden" || st.opacity === "0") return false;
        const r = e.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      });
      if (el) {
        el.click();
        return true;
      }
    }
    return false;
  }, selectors);
}

async function safeClick(page, selectors) {
  for (const selector of selectors) {
    try {
      const element = await page.$(selector);
      if (element) {
        await element.click();
        return true;
      }
    } catch (e) {
      continue;
    }
  }

  return await page.evaluate((selectors) => {
    for (const sel of selectors) {
      if (sel.includes(':has-text')) {
        const text = sel.match(/:has-text\("(.+?)"\)/)?.[1];
        if (text) {
          const elements = Array.from(document.querySelectorAll('button, a'));
          const match = elements.find(el => el.textContent?.toLowerCase().includes(text.toLowerCase()));
          if (match) {
            match.click();
            return true;
          }
        }
      }
    }
    return false;
  }, selectors);
}

async function fillInput(page, value, selectors) {
  for (const selector of selectors) {
    try {
      const input = await page.$(selector);
      if (input) {
        await input.click();
        await delay(100);
        await input.type(value, { delay: 30 });
        return true;
      }
    } catch (e) {
      continue;
    }
  }

  return await page.evaluate((value, selectors) => {
    for (const sel of selectors) {
      const input = document.querySelector(sel);
      if (input) {
        input.focus();
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }
    }
    return false;
  }, value, selectors);
}

function extractWorkspaceId(url) {
  return extractWorkspaceIdFromUrl(url);
}

async function submitFormForSelector(page, selector) {
  return await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return false;
    const form = el.closest('form');
    if (!form) return false;
    if (typeof form.requestSubmit === 'function') {
      form.requestSubmit();
      return true;
    }
    const submit = form.querySelector('button[type="submit"], input[type="submit"]');
    if (submit) {
      submit.click();
      return true;
    }
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    return true;
  }, selector);
}

async function resolveWorkspaceId(page) {
  // 1) direct from URL
  let id = extractWorkspaceId(page.url());
  if (id) return id;

  // 2) click into a workspace if we're on a picker/landing page
  const clickedWorkspace = await page.evaluate(() => {
    const uuidRe = /\/[a-f0-9-]{36}(?:\/|$)/i;
    const links = Array.from(document.querySelectorAll('a[href^="/"]'));
    const target = links.find((a) => uuidRe.test(a.getAttribute('href') || ''));
    if (!target) return false;
    target.click();
    return true;
  });
  if (clickedWorkspace) {
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
    await delay(1500);
    id = extractWorkspaceId(page.url());
    if (id) return id;
  }

  // 3) localStorage hinting
  try {
    id = await page.evaluate(() => {
      const uuidRe = /^[a-f0-9-]{36}$/i;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k) continue;
        const v = localStorage.getItem(k);
        if (!v) continue;
        if (uuidRe.test(v)) return v;
        const m = v.match(/[a-f0-9-]{36}/i);
        if (m) return m[0];
      }
      return null;
    });
  } catch {
    // ignore
  }
  if (id) return id;

  // 4) probe common routes (some builds will redirect into /{workspaceId}/...)
  const probes = ['/agents', '/people', '/datasets', '/workflow'];
  for (const p of probes) {
    const ok = await gotoWithRetry(page, `${CONFIG.baseUrl}${p}`, { label: `resolve${p}`, retries: 1 });
    if (!ok) continue;
    id = extractWorkspaceId(page.url());
    if (id) return id;
  }

  return null;
}

// Login function
async function login(page) {
  console.log('\n Login...');
  if (!CONFIG.credentials.email || !CONFIG.credentials.password) {
    throw new Error('Missing credentials: set VURVEY_EMAIL and VURVEY_PASSWORD');
  }

  if (!(await gotoWithRetry(page, CONFIG.baseUrl, { label: 'login', retries: 2 }))) {
    throw new Error(`Could not load login page at ${CONFIG.baseUrl}`);
  }
  await delay(1200);

  // Capture login page
  await takeScreenshot(page, '00-login-page', 'home');

  // Click "Sign in with email"
  console.log('  Looking for email login button...');
  const emailLoginClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, a'));
    const btn = buttons.find(b => b.textContent?.toLowerCase().includes('sign in with email'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });

  if (emailLoginClicked) {
    console.log('  ✓ Clicked email login');
    await delay(2000);
    await takeScreenshot(page, '00b-email-login-clicked', 'home');
  }

  // Fill email
  console.log('  Filling credentials...');
  await delay(1500);

  const emailSelectors = [
    'input[type="email"]',
    'input[name="email"]',
    'input[placeholder*="email" i]',
    'input[placeholder*="Email"]',
    'input:not([type="password"]):not([type="hidden"])'
  ];

  const emailFilled = await fillInput(page, CONFIG.credentials.email, emailSelectors);
  if (!emailFilled) {
    throw new Error('Could not fill email field');
  }

  // Submit the owning form if possible (less flaky than "find a button").
  await delay(350);
  const didSubmitEmail =
    (await submitFormForSelector(page, 'input[type="email"]')) ||
    (await clickButtonByText(page, 'next', 3500)) ||
    (await clickButtonByText(page, 'continue', 3500));

  if (!didSubmitEmail) {
    console.log('  ⚠ Could not confidently submit email step (continuing)');
  }

  // Wait for password step
  await page
    .waitForSelector('input[type="password"]', { visible: true, timeout: 20000 })
    .catch(() => {});

  // Fill password
  const passwordSelectors = [
    'input[type="password"]',
    'input[name="password"]',
    'input[placeholder*="password" i]'
  ];

  const passwordFilled = await fillInput(page, CONFIG.credentials.password, passwordSelectors);
  if (!passwordFilled) {
    throw new Error('Could not fill password field');
  }

  // Submit password step
  await delay(350);
  const didSubmitPassword =
    (await submitFormForSelector(page, 'input[type="password"]')) ||
    (await clickButtonByText(page, 'log in', 3500)) ||
    (await clickButtonByText(page, 'login', 3500)) ||
    (await clickButtonByText(page, 'sign in', 3500));

  if (!didSubmitPassword) {
    console.log('  ⚠ Could not confidently submit password step (continuing)');
  }

  // Wait for redirect
  console.log('  Waiting for login to complete...');
  await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
  await delay(2500);
  await waitForNetworkIdle(page);
  await waitForLoaders(page);

  // Extract workspace ID from URL
  const currentUrl = page.url();
  workspaceId = await resolveWorkspaceId(page);

  if (workspaceId) console.log(`  ✓ Resolved workspace ID: ${workspaceId}`);
  else console.log(`  ⚠ Could not resolve workspace ID from URL/session. Current URL: ${currentUrl}`);

  await takeScreenshot(page, '03-after-login', 'home');

  if (currentUrl.includes(CONFIG.baseUrl.replace('https://', '')) && !currentUrl.includes('login')) {
    console.log('  ✓ Login successful');
  } else {
    console.log(`  ⚠ Login may have failed. URL: ${currentUrl}`);
  }
}

// Helper to build workspace-scoped URLs
function getWorkspaceUrl(path) {
  if (!workspaceId) console.log(`  ⚠ No workspace ID available, using path: ${path}`);
  return buildWorkspaceUrl({baseUrl: CONFIG.baseUrl, workspaceId, routePath: path});
}

// Page capture functions
async function captureHome(page) {
  console.log('\n Capturing Home (Chat Interface)...');

  // Home is at /{workspaceId}/ (the index route)
  const homeUrl = getWorkspaceUrl('/');
  if (!(await gotoWithRetry(page, homeUrl, { label: 'home' }))) return false;

  // Check for error state before capturing
  const hasError = await page.evaluate(() => {
    const pageText = document.body?.innerText || '';
    return pageText.includes('Something went wrong') ||
           pageText.includes('Error') && pageText.includes('error');
  });

  if (hasError) {
    console.log('  ⚠ Home page shows error state - trying to find a working conversation...');

    // Try clicking on a conversation from the sidebar to get a working view
    const conversationClicked = await page.evaluate(() => {
      // Look for conversation items in sidebar
      const items = document.querySelectorAll('[class*="conversation"], [class*="chat-item"], [data-testid*="conversation"]');
      for (const item of items) {
        if (item.click) {
          item.click();
          return true;
        }
      }
      return false;
    });

    if (conversationClicked) {
      console.log('  ✓ Clicked on a conversation');
      await delay(3000);
      await waitForNetworkIdle(page);
      await waitForLoaders(page);
    }
  }

  // Wait for chat interface elements
  await waitForContent(page, [
    '[data-testid="chat-input"]',
    'textarea',
    '[class*="chatInput"]',
    '[class*="chat-view"]',
    '[placeholder*="Ask"]'
  ], 15000);

  await takeScreenshot(page, '01-chat-main', 'home');

  // Capture conversation sidebar if visible
  await delay(1000);
  await takeScreenshot(page, '04-conversation-sidebar', 'home');
  return true;
}

async function captureAgents(page) {
  console.log('\n Capturing Agents...');

  // Agents are at /{workspaceId}/agents
  const agentsUrl = getWorkspaceUrl('/agents');
  if (!(await gotoWithRetry(page, agentsUrl, { label: 'agents' }))) return false;

  // Wait for agent cards to load
  await waitForContent(page, [
    '[data-testid="agent-card"]',
    '[class*="agentCard"]',
    '[class*="personaCard"]',
    '[class*="assistant"]'
  ], 15000);

  await takeScreenshot(page, '01-agents-gallery', 'agents');

  // Try search interaction
  const searchInput = await page.$('input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i]');
  if (searchInput) {
    await searchInput.click();
    await delay(500);
    await takeScreenshot(page, '02-agents-search', 'agents');
  }

  // Try clicking an agent card to show detail panel
  try {
    const agentCard = await page.$('[data-testid="agent-card"], [class*="agentCard"], [class*="personaCard"]');
    if (agentCard) {
      await agentCard.click();
      await delay(3000);
      await waitForNetworkIdle(page);
      await waitForLoaders(page);
      await takeScreenshot(page, '04-agent-detail', 'agents');
    }
  } catch (e) {
    console.log('  Could not capture agent detail');
  }

  // Try opening Agent Builder and capturing step screenshots (best-effort).
  try {
    const opened =
      (await clickButtonByText(page, 'create agent', 4000)) ||
      (await clickButtonByText(page, 'create', 4000));

    if (!opened) {
      console.log('  ⚠ Could not open Agent Builder');
      return;
    }

    await delay(2500);
    await waitForNetworkIdle(page);
    await waitForLoaders(page);
    await takeScreenshot(page, '05-builder-objective', 'agents');

    const steps = [
      { label: 'Facets', shot: '06-builder-facets' },
      { label: 'Instructions', shot: '07-builder-instructions' },
      { label: 'Identity', shot: '08-builder-identity' },
      { label: 'Appearance', shot: '09-builder-appearance' },
      { label: 'Review', shot: '10-builder-review' }
    ];

    for (const step of steps) {
      const moved =
        (await clickButtonByText(page, step.label, 2500)) ||
        (await clickButtonByText(page, 'next', 2500)) ||
        (await clickButtonByText(page, 'continue', 2500));
      if (!moved) {
        console.log(`  ⚠ Could not navigate to builder step: ${step.label}`);
        continue;
      }
      await delay(1800);
      await waitForNetworkIdle(page);
      await waitForLoaders(page);
      await takeScreenshot(page, step.shot, 'agents');
    }

    // Return to Agents list
    await gotoWithRetry(page, agentsUrl, { label: 'agents-return' });
  } catch (e) {
    console.log(`  Could not capture agent builder: ${e.message}`);
  }
  return true;
}

async function capturePeople(page) {
  console.log('\n Capturing People (Audience)...');

  // Newer builds use /people/* routes; older builds used /audience/*.
  const baseCandidates = ['/people', '/audience'];
  let baseUrl = null;
  for (const p of baseCandidates) {
    const u = getWorkspaceUrl(p);
    if (await gotoWithRetry(page, u, { label: `people-base-${p}` })) {
      baseUrl = u;
      break;
    }
  }
  if (!baseUrl) return false;

  // Wait for content to load
  await waitForContent(page, [
    '[class*="crm"]',
    '[class*="population"]',
    '[data-testid*="population"]',
    'table',
    '[class*="list"]'
  ], 15000);

  await takeScreenshot(page, '01-people-main', 'people');

  // Sub-pages (try /people first, then /audience).
  const subPages = [
    { paths: ['/people/populations', '/audience/populations'], name: '02-populations' },
    { paths: ['/people/humans', '/audience/community'], name: '03-humans' },
    { paths: ['/people/lists', '/audience/lists'], name: '04-lists-segments' },
    { paths: ['/people/properties', '/audience/properties'], name: '05-properties' },
  ];

  for (const subPage of subPages) {
    try {
      let did = false;
      for (const p of subPage.paths) {
        const subUrl = getWorkspaceUrl(p);
        if (await gotoWithRetry(page, subUrl, { label: subPage.name })) {
          await takeScreenshot(page, subPage.name, 'people');
          did = true;
          break;
        }
      }
      if (!did) console.log(`  ⚠ Could not capture ${subPage.name}`);
    } catch (e) {
      console.log(`  Could not capture ${subPage.name}: ${e.message}`);
    }
  }

  // Optional deep captures (best-effort): population charts, contact profile, segment builder, molds.
  try {
    // Population charts: open first population card/row.
    for (const p of ['/people/populations', '/audience/populations']) {
      const popUrl = getWorkspaceUrl(p);
      if (!(await gotoWithRetry(page, popUrl, { label: 'people-populations' }))) continue;
      const opened = await clickFirstVisible(page, ['[class*="card" i]', 'table tbody tr', '[role="row"]']);
      if (!opened) continue;
      await delay(2500);
      await waitForNetworkIdle(page);
      await waitForLoaders(page);
      await takeScreenshot(page, '02a-population-charts', 'people');
      break;
    }
  } catch (e) {
    console.log(`  Could not capture population charts: ${e.message}`);
  }

  try {
    // Contact profile: click first row on humans page.
    for (const p of ['/people/humans', '/audience/community']) {
      const humansUrl = getWorkspaceUrl(p);
      if (!(await gotoWithRetry(page, humansUrl, { label: 'people-humans' }))) continue;
      const clicked = await page.evaluate(() => {
        const row = document.querySelector("table tbody tr");
        if (!row) return false;
        const link = row.querySelector("a, button");
        if (link) {
          link.click();
          return true;
        }
        row.click();
        return true;
      });
      if (!clicked) continue;
      await delay(2500);
      await waitForNetworkIdle(page);
      await waitForLoaders(page);
      await takeScreenshot(page, '03a-contact-profile', 'people');
      break;
    }
  } catch (e) {
    console.log(`  Could not capture contact profile: ${e.message}`);
  }

  try {
    // Segment builder: open create segment.
    for (const p of ['/people/lists', '/audience/lists']) {
      const listsUrl = getWorkspaceUrl(p);
      if (!(await gotoWithRetry(page, listsUrl, { label: 'people-lists' }))) continue;
      const opened =
        (await clickButtonByText(page, 'create segment', 2500)) ||
        (await clickButtonByText(page, 'new segment', 2500)) ||
        (await clickButtonByText(page, 'create', 2500)) ||
        (await clickButtonByText(page, 'new', 2500));
      if (!opened) continue;
      await delay(2500);
      await waitForNetworkIdle(page);
      await waitForLoaders(page);
      await takeScreenshot(page, '04a-segment-builder', 'people');
      break;
    }
  } catch (e) {
    console.log(`  Could not capture segment builder: ${e.message}`);
  }

  try {
    // Molds: enterprise-only, optional.
    for (const p of ['/people/molds', '/audience/molds']) {
      const moldsUrl = getWorkspaceUrl(p);
      if (!(await gotoWithRetry(page, moldsUrl, { label: 'people-molds' }))) continue;
      const hasMoldsText = await page.evaluate(() => (document.body?.innerText || '').toLowerCase().includes('mold'));
      if (!hasMoldsText) continue;
      await takeScreenshot(page, '06-molds', 'people');
      const opened = await clickFirstVisible(page, ['table tbody tr', '[class*="card" i]']);
      if (opened) {
        await delay(2500);
        await waitForNetworkIdle(page);
        await waitForLoaders(page);
        await takeScreenshot(page, '06a-mold-details', 'people');
      }
      break;
    }
  } catch (e) {
    console.log(`  Could not capture molds: ${e.message}`);
  }
  return true;
}

async function captureCampaigns(page) {
  console.log('\n Capturing Campaigns...');

  // Campaigns are at /{workspaceId}/campaigns
  const campaignsUrl = getWorkspaceUrl('/campaigns');
  if (!(await gotoWithRetry(page, campaignsUrl, { label: 'campaigns' }))) return false;

  // Wait for campaign cards
  await waitForContent(page, [
    '[data-testid="campaign-card"]',
    '[class*="campaignCard"]',
    '[class*="surveyCard"]',
    '[class*="campaign"]'
  ], 15000);

  await takeScreenshot(page, '01-campaigns-gallery', 'campaigns');

  // Sub-pages
  const subPages = [
    { path: '/campaigns/templates', name: '03-templates' },
    { path: '/campaigns/usage', name: '04-usage' },
    { path: '/campaigns/magic-reels', name: '05-magic-reels' }
  ];

  for (const subPage of subPages) {
    try {
      const subUrl = getWorkspaceUrl(subPage.path);
      if (await gotoWithRetry(page, subUrl, { label: `campaigns-${subPage.name}` })) {
        await takeScreenshot(page, subPage.name, 'campaigns');
      }
    } catch (e) {
      console.log(`  Could not capture ${subPage.name}: ${e.message}`);
    }
  }
  return true;
}

async function captureDatasets(page) {
  console.log('\n Capturing Datasets...');

  // Datasets are at /{workspaceId}/datasets
  const datasetsUrl = getWorkspaceUrl('/datasets');
  if (!(await gotoWithRetry(page, datasetsUrl, { label: 'datasets' }))) return false;

  // Wait for dataset cards
  await waitForContent(page, [
    '[data-testid="dataset-card"]',
    '[class*="datasetCard"]',
    '[class*="trainingSet"]',
    '[class*="dataset"]'
  ], 15000);

  await takeScreenshot(page, '01-datasets-main', 'datasets');

  // Create Dataset modal
  try {
    const opened =
      (await clickButtonByText(page, 'create dataset', 3500)) ||
      (await clickButtonByText(page, 'create', 3500));
    if (opened) {
      await delay(1500);
      await waitForNetworkIdle(page);
      await waitForLoaders(page);
      await takeScreenshot(page, '02-create-modal', 'datasets');
      await page.keyboard.press('Escape').catch(() => {});
      await delay(400);
    }
  } catch (e) {
    console.log(`  Could not capture create dataset modal: ${e.message}`);
  }

  // Magic Summaries tab
  try {
    const magicSummariesUrl = getWorkspaceUrl('/datasets/magic-summaries');
    if (await gotoWithRetry(page, magicSummariesUrl, { label: 'datasets-magic-summaries' })) {
      await takeScreenshot(page, '03-magic-summaries', 'datasets');
    }
  } catch (e) {
    console.log(`  Could not capture magic summaries: ${e.message}`);
  }
  return true;
}

async function captureWorkflows(page) {
  console.log('\n Capturing Workflows...');

  // Workflows are at /{workspaceId}/workflow (singular, NOT /workflows)
  const workflowUrl = getWorkspaceUrl('/workflow');
  if (!(await gotoWithRetry(page, workflowUrl, { label: 'workflow' }))) return false;

  // Wait for workflow cards
  await waitForContent(page, [
    '[data-testid="workflow-card"]',
    '[class*="workflowCard"]',
    '[class*="flow"]',
    '[class*="orchestration"]'
  ], 15000);

  await takeScreenshot(page, '01-workflows-main', 'workflows');

  // Workflow Builder (best-effort): open from /workflow/flows and click create/new.
  try {
    const flowsUrl = getWorkspaceUrl('/workflow/flows');
    if (await gotoWithRetry(page, flowsUrl, { label: 'workflow-flows' })) {
      const opened =
        (await clickButtonByText(page, 'create flow', 3000)) ||
        (await clickButtonByText(page, 'new flow', 3000)) ||
        (await clickButtonByText(page, 'create', 3000)) ||
        (await clickButtonByText(page, 'new', 3000));
      if (opened) {
        await delay(2000);
        await waitForNetworkIdle(page);
        await waitForLoaders(page);
        await takeScreenshot(page, '02-workflow-builder', 'workflows');
        await page.keyboard.press('Escape').catch(() => {});
        await delay(400);
      }
    }
  } catch (e) {
    console.log(`  Could not capture workflow builder: ${e.message}`);
  }

  // Sub-pages - corrected routes from code analysis
  const subPages = [
    { path: '/workflow/upcoming', name: '03-upcoming-runs' },    // Fixed route
    { path: '/workflow/templates', name: '04-workflow-templates' },
    { path: '/workflow/conversations', name: '05-workflow-conversations' }
  ];

  for (const subPage of subPages) {
    try {
      const subUrl = getWorkspaceUrl(subPage.path);
      if (await gotoWithRetry(page, subUrl, { label: `workflow-${subPage.name}` })) {
        await takeScreenshot(page, subPage.name, 'workflows');
      }
    } catch (e) {
      console.log(`  Could not capture ${subPage.name}: ${e.message}`);
    }
  }
  return true;
}

// ── New section capture functions ──────────────────────────────────

async function captureSettings(page) {
  console.log('\n Capturing Settings...');

  const settingsUrl = getWorkspaceUrl('/workspace/settings');
  if (!(await gotoWithRetry(page, settingsUrl, { label: 'settings' }))) return false;

  await waitForContent(page, [
    'form',
    'input',
    '[class*="settings" i]',
    '[class*="form" i]',
  ], 15000);

  await takeScreenshot(page, '01-general-settings', 'settings');

  // AI Models sub-page
  try {
    const aiUrl = getWorkspaceUrl('/workspace/settings/ai-models');
    if (await gotoWithRetry(page, aiUrl, { label: 'settings-ai-models' })) {
      await takeScreenshot(page, '02-ai-models', 'settings');
    }
  } catch (e) {
    console.log(`  Could not capture AI models: ${e.message}`);
  }

  // Members sub-page
  try {
    const membersUrl = getWorkspaceUrl('/workspace/members');
    if (await gotoWithRetry(page, membersUrl, { label: 'settings-members' })) {
      await takeScreenshot(page, '03-members', 'settings');
    }
  } catch (e) {
    console.log(`  Could not capture members: ${e.message}`);
  }

  return true;
}

async function captureBranding(page) {
  console.log('\n Capturing Branding...');

  const brandingUrl = getWorkspaceUrl('/branding');
  if (!(await gotoWithRetry(page, brandingUrl, { label: 'branding' }))) return false;

  await waitForContent(page, [
    'form',
    'input',
    '[class*="brand" i]',
    '[class*="form" i]',
  ], 15000);

  await takeScreenshot(page, '01-brand-settings', 'branding');

  // Sub-pages
  const subPages = [
    { path: '/branding/reviews', name: '02-reviews' },
    { path: '/branding/reels', name: '03-reels' },
  ];

  for (const subPage of subPages) {
    try {
      const subUrl = getWorkspaceUrl(subPage.path);
      if (await gotoWithRetry(page, subUrl, { label: `branding-${subPage.name}` })) {
        await takeScreenshot(page, subPage.name, 'branding');
      }
    } catch (e) {
      console.log(`  Could not capture ${subPage.name}: ${e.message}`);
    }
  }

  return true;
}

async function captureForecast(page) {
  console.log('\n Capturing Forecast...');

  const forecastUrl = getWorkspaceUrl('/forecast');
  if (!(await gotoWithRetry(page, forecastUrl, { label: 'forecast' }))) return false;

  // Check if we were redirected (feature flag off)
  const currentUrl = page.url();
  if (!currentUrl.includes('forecast')) {
    console.log('  ⚠ Forecast appears to be feature-flagged off (redirected). Skipping.');
    return true; // Not a failure, just gated
  }

  await waitForContent(page, [
    '[class*="forecast" i]',
    '[class*="chart" i]',
    'canvas',
    'table',
  ], 15000);

  await takeScreenshot(page, '01-forecast-main', 'forecast');
  return true;
}

async function captureRewards(page) {
  console.log('\n Capturing Rewards...');

  const rewardsUrl = getWorkspaceUrl('/rewards');
  if (!(await gotoWithRetry(page, rewardsUrl, { label: 'rewards' }))) return false;

  await waitForContent(page, [
    '[class*="reward" i]',
    '[class*="tremendous" i]',
    'table',
    'button',
  ], 15000);

  await takeScreenshot(page, '01-rewards-main', 'rewards');
  return true;
}

async function captureIntegrations(page) {
  console.log('\n Capturing Integrations...');

  // Try /settings/integrations first, then /integrations
  let loaded = false;
  for (const p of ['/settings/integrations', '/integrations']) {
    const url = getWorkspaceUrl(p);
    if (await gotoWithRetry(page, url, { label: 'integrations' })) {
      loaded = true;
      break;
    }
  }
  if (!loaded) return false;

  await waitForContent(page, [
    '[class*="integration" i]',
    '[class*="connection" i]',
    '[class*="tool" i]',
    'table',
  ], 15000);

  await takeScreenshot(page, '01-integrations-main', 'integrations');
  return true;
}

// Main execution
async function main() {
  console.log('==========================================');
  console.log('  Vurvey Documentation Screenshot Tool');
  console.log('==========================================');
  console.log(`\nTarget: ${CONFIG.baseUrl}`);
  console.log(`Headless: ${CONFIG.headless}`);
  console.log(`Output: ${CONFIG.screenshotsDir}`);
  console.log(`Strict: ${CONFIG.strict}`);

  // Ensure screenshot directories exist
  const dirs = ['home', 'agents', 'people', 'campaigns', 'datasets', 'workflows', 'settings', 'branding', 'forecast', 'rewards', 'integrations'];
  dirs.forEach(dir => ensureDir(path.join(CONFIG.screenshotsDir, dir)));
  ensureDir(CONFIG.artifactsDir);

  const browser = await puppeteer.launch({
    headless: CONFIG.headless ? 'new' : false,
    defaultViewport: CONFIG.viewport,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      `--window-size=${CONFIG.viewport.width},${CONFIG.viewport.height}`
    ]
  });

  const page = await browser.newPage();
  await page.setViewport(CONFIG.viewport);

  // Set a longer default timeout
  page.setDefaultTimeout(CONFIG.timeout);

  try {
    await login(page);

    // Ensure we have a workspace ID before continuing
    if (!workspaceId) {
      console.log('\n  Attempting to extract workspace ID from current page...');
      workspaceId = await resolveWorkspaceId(page);
      if (workspaceId) {
        console.log(`  ✓ Found workspace ID: ${workspaceId}`);
      } else if (CONFIG.fallbackWorkspaceId) {
        workspaceId = CONFIG.fallbackWorkspaceId;
        console.log(`  ✓ Using fallback workspace ID: ${workspaceId}`);
      } else {
        throw new Error('Could not determine workspace ID. Set VURVEY_WORKSPACE_ID env var as fallback.');
      }
    }

    const captures = [
      ["home", captureHome],
      ["agents", captureAgents],
      ["people", capturePeople],
      ["campaigns", captureCampaigns],
      ["datasets", captureDatasets],
      ["workflows", captureWorkflows],
      ["settings", captureSettings],
      ["branding", captureBranding],
      ["forecast", captureForecast],
      ["rewards", captureRewards],
      ["integrations", captureIntegrations],
    ];

    /** @type {{name: string, ok: boolean}[]} */
    const captureResults = [];
    for (const [name, fn] of captures) {
      try {
        const ok = await fn(page);
        captureResults.push({name, ok: ok !== false});
      } catch (e) {
        captureResults.push({name, ok: false});
        console.log(`  ⚠ Capture '${name}' threw: ${e?.message || String(e)}`);
        await takeArtifactScreenshot(page, `capture-throw-${name}`);
      }
    }

    const failed = captureResults.filter((r) => !r.ok).map((r) => r.name);
    if (failed.length) {
      console.log('\n==========================================');
      console.log(` Screenshot capture finished with failures: ${failed.join(", ")}`);
      console.log(' See qa-output/capture-screenshots/ for retry/error artifacts.');
      console.log('==========================================\n');
      if (CONFIG.strict) process.exit(1);
    } else {
      console.log('\n==========================================');
      console.log(' All screenshots captured successfully!');
      console.log('==========================================\n');
    }

  } catch (error) {
    console.error('\n Error during screenshot capture:', error.message);
    await takeArtifactScreenshot(page, 'capture-error');
    if (CONFIG.strict) process.exit(1);
    console.log('  ⚠ Non-strict mode: exiting 0 despite screenshot capture error');
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
