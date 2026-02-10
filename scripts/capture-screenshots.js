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
 *   VURVEY_EMAIL       - Login email (required)
 *   VURVEY_PASSWORD    - Login password (required)
 *   VURVEY_URL         - Base URL (default: https://staging.vurvey.dev)
 *   HEADLESS           - Run headless (default: true)
 *   CAPTURE_PARALLEL   - Number of parallel page workers (default: 4, set to 1 for sequential)
 */

import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {buildWorkspaceUrl, extractWorkspaceIdFromUrl} from './lib/vurvey-url.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Centralized timing configuration – tune these to balance speed vs. reliability.
const TIMING = {
  postNavDelay: 500,           // was 2500ms – wait after page.goto before idle check
  networkIdleTime: 800,        // was 2000ms – how long network must be quiet
  networkIdleTimeout: 5000,    // was 15000ms – max wait for network idle
  loaderPollInterval: 200,     // was 500ms – how often to check for spinners
  loaderTimeout: 5000,         // was 15000ms – max wait for loaders to clear
  preScreenshotDelay: 200,     // was 800ms – settle time before capturing
  postClickDelay: 500,         // was 1500-2500ms – wait after clicking UI elements
  builderStepWait: 600,        // was 1800ms – wait after navigating builder steps
  contentWaitTimeout: 8000,    // was 10000-15000ms – max wait for content selectors
  retryBackoff: 400,           // was 800ms – base backoff per retry attempt
  loginPostRedirect: 1500,     // was 2500ms – wait after login redirect
};

// Configuration
const CONFIG = {
  baseUrl: process.env.VURVEY_URL || 'https://staging.vurvey.dev',
  credentials: {
    email: process.env.VURVEY_EMAIL,
    password: process.env.VURVEY_PASSWORD
  },
  fallbackWorkspaceId: process.env.VURVEY_WORKSPACE_ID || '07e5edb5-e739-4a35-9f82-cc6cec7c0193',
  strict: process.env.CAPTURE_STRICT === 'true',
  screenshotsDir: path.join(__dirname, '..', 'docs', 'public', 'screenshots'),
  artifactsDir: path.join(__dirname, '..', 'qa-output', 'capture-screenshots'),
  viewport: { width: 1920, height: 1080 },
  headless: process.env.HEADLESS !== 'false',
  timeout: 90000,
  retries: 3,
  parallel: Math.max(1, parseInt(process.env.CAPTURE_PARALLEL, 10) || 4),
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

async function waitForNetworkIdle(page, timeout = TIMING.networkIdleTimeout) {
  try {
    await page.waitForNetworkIdle({ idleTime: TIMING.networkIdleTime, timeout });
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
      await delay(TIMING.postNavDelay);
      await waitForNetworkIdle(page);
      await waitForLoaders(page);
    } catch (e) {
      console.log(`  ⚠ Navigation error: ${e.message}`);
      if (attempt < maxAttempts) {
        await takeArtifactScreenshot(page, `retry-nav-${label || 'page'}-${attempt}`);
        await delay(TIMING.retryBackoff * attempt);
        continue;
      }
      await takeArtifactScreenshot(page, `error-nav-${label || 'page'}`);
      return false;
    }

    if (!(await pageHasGlobalError(page))) return true;

    console.log('  ⚠ Page shows global error state');
    if (attempt < maxAttempts) {
      await takeArtifactScreenshot(page, `retry-error-${label || 'page'}-${attempt}`);
      await delay(TIMING.retryBackoff * attempt);
      continue;
    }
    await takeArtifactScreenshot(page, `error-global-${label || 'page'}`);
    return false;
  }
  return false;
}

async function waitForContent(page, selectors, timeout = TIMING.contentWaitTimeout) {
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

async function waitForLoaders(page, timeout = TIMING.loaderTimeout) {
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
    await delay(TIMING.loaderPollInterval);
  }
  console.log('  ⚠ Loader timeout (continuing)');
}

async function takeScreenshot(page, name, subdir = '') {
  const dir = subdir ? path.join(CONFIG.screenshotsDir, subdir) : CONFIG.screenshotsDir;
  ensureDir(dir);
  const filepath = path.join(dir, `${name}.png`);

  // Wait for any loaders to complete
  try {
    await waitForLoaders(page, TIMING.loaderTimeout);
  } catch {
    // Ignore loader wait issues (context destroyed, etc).
  }
  await delay(TIMING.preScreenshotDelay);

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

async function clickByAriaLabel(page, label, timeout = 5000) {
  const startTime = Date.now();
  const norm = String(label).trim().toLowerCase();

  while (Date.now() - startTime < timeout) {
    const clicked = await page.evaluate((needle) => {
      const els = Array.from(document.querySelectorAll('[aria-label]'));
      const el = els.find((e) => {
        const al = (e.getAttribute('aria-label') || '').trim().toLowerCase();
        if (al !== needle) return false;
        const st = window.getComputedStyle(e);
        return st.display !== 'none' && st.visibility !== 'hidden' && st.opacity !== '0';
      });
      if (!el) return false;
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
    await delay(TIMING.postClickDelay);
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
  await delay(TIMING.postNavDelay);

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
    await delay(TIMING.postClickDelay);
    await takeScreenshot(page, '00b-email-login-clicked', 'home');
  }

  // Fill email
  console.log('  Filling credentials...');
  await delay(TIMING.postClickDelay);

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
  await delay(TIMING.loginPostRedirect);
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
      await delay(TIMING.postClickDelay);
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
  ]);

  await takeScreenshot(page, '01-chat-main', 'home');

  // Capture the welcome header (visible before any messages are sent)
  try {
    const hasWelcome = await waitForContent(page, [
      '[class*="welcomeHeader" i]',
      '[class*="welcome" i]',
      '[class*="chatWelcome" i]',
    ], 3000);
    if (hasWelcome) {
      await takeScreenshot(page, '02-chat-welcome-header', 'home');
    }
  } catch (e) {
    console.log('  Could not capture welcome header');
  }

  // Capture the toolbar chip area (Agents, Sources, Images, Tools buttons)
  await takeScreenshot(page, '03-chat-toolbar', 'home');

  // Capture conversation sidebar if visible
  await delay(TIMING.postClickDelay);
  await takeScreenshot(page, '04-conversation-sidebar', 'home');

  // Try clicking toolbar buttons to capture their dropdowns/modals
  // Agents button
  try {
    const agentsClicked = await clickFirstVisible(page, [
      'button[aria-label*="agent" i]',
      '[class*="toolbarChip" i] button',
      '[data-testid*="agent-button"]',
    ]) || await clickButtonByText(page, 'agents', 3000);
    if (agentsClicked) {
      await delay(TIMING.postClickDelay);
      await waitForLoaders(page);
      await takeScreenshot(page, '05-agents-dropdown', 'home');
      // Close by pressing Escape
      await page.keyboard.press('Escape').catch(() => {});
      await delay(300);
    }
  } catch (e) {
    console.log('  Could not capture agents dropdown');
  }

  // Sources button (folder icon)
  try {
    const sourcesClicked = await clickFirstVisible(page, [
      'button[aria-label*="source" i]',
      'button[aria-label*="folder" i]',
      '[data-testid*="sources-button"]',
    ]) || await clickButtonByText(page, 'sources', 3000);
    if (sourcesClicked) {
      await delay(TIMING.postClickDelay);
      await waitForLoaders(page);
      await takeScreenshot(page, '06-sources-dropdown', 'home');
      await page.keyboard.press('Escape').catch(() => {});
      await delay(300);
    }
  } catch (e) {
    console.log('  Could not capture sources dropdown');
  }

  // Images button (picture icon)
  try {
    const imagesClicked = await clickFirstVisible(page, [
      'button[aria-label*="image" i]',
      '[data-testid*="image-button"]',
    ]) || await clickButtonByText(page, 'images', 3000);
    if (imagesClicked) {
      await delay(TIMING.postClickDelay);
      await waitForLoaders(page);
      await takeScreenshot(page, '07-images-dropdown', 'home');
      await page.keyboard.press('Escape').catch(() => {});
      await delay(300);
    }
  } catch (e) {
    console.log('  Could not capture images dropdown');
  }

  // Tools button (sliders icon)
  try {
    const toolsClicked = await clickFirstVisible(page, [
      'button[aria-label*="tool" i]',
      '[data-testid*="tools-button"]',
    ]) || await clickButtonByText(page, 'tools', 3000);
    if (toolsClicked) {
      await delay(TIMING.postClickDelay);
      await waitForLoaders(page);
      await takeScreenshot(page, '08-tools-dropdown', 'home');
      await page.keyboard.press('Escape').catch(() => {});
      await delay(300);
    }
  } catch (e) {
    console.log('  Could not capture tools dropdown');
  }

  // Upload button (+)
  try {
    const uploadClicked = await clickFirstVisible(page, [
      'button[aria-label*="upload" i]',
      '[data-testid*="upload-button"]',
      '[class*="uploadButton" i]',
    ]);
    if (uploadClicked) {
      await delay(TIMING.postClickDelay);
      await takeScreenshot(page, '09-upload-button', 'home');
      await page.keyboard.press('Escape').catch(() => {});
      await delay(300);
    }
  } catch (e) {
    console.log('  Could not capture upload button');
  }

  // Try to capture an existing conversation with a response
  try {
    const convClicked = await page.evaluate(() => {
      const items = document.querySelectorAll('[class*="conversation"] a, [class*="chatItem"] a, nav a[href*="/chat/"]');
      if (items.length > 0) {
        items[0].click();
        return true;
      }
      return false;
    });
    if (convClicked) {
      await delay(TIMING.postClickDelay);
      await waitForNetworkIdle(page);
      await waitForLoaders(page);
      await takeScreenshot(page, '10-chat-with-response', 'home');

      // Try to capture chat actions by hovering over a response
      const responseEl = await page.$('[class*="responseBubble" i], [class*="response-bubble" i], [class*="assistantMessage" i]');
      if (responseEl) {
        await responseEl.hover();
        await delay(TIMING.postClickDelay);
        await takeScreenshot(page, '11-chat-actions', 'home');
      }
    }
  } catch (e) {
    console.log('  Could not capture conversation with response');
  }

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
  ]);

  await takeScreenshot(page, '01-agents-gallery', 'agents');

  // Try search interaction
  const searchInput = await page.$('input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i]');
  if (searchInput) {
    await searchInput.click();
    await delay(TIMING.preScreenshotDelay);
    await takeScreenshot(page, '02-agents-search', 'agents');
  }

  // Try to capture agent filters (sort, type, model, status)
  try {
    const filterClicked = await clickFirstVisible(page, [
      '[class*="filterButton" i]',
      'button[aria-label*="filter" i]',
      '[data-testid*="filter"]',
      '[class*="sort" i] button',
    ]) || await clickButtonByText(page, 'filter', 3000) || await clickButtonByText(page, 'sort', 3000);
    if (filterClicked) {
      await delay(TIMING.postClickDelay);
      await takeScreenshot(page, '03-agent-filters', 'agents');
      await page.keyboard.press('Escape').catch(() => {});
      await delay(300);
    }
  } catch (e) {
    console.log('  Could not capture agent filters');
  }

  // Try clicking an agent card to show detail drawer
  try {
    const agentCard = await page.$('[data-testid="agent-card"], [class*="agentCard"], [class*="personaCard"]');
    if (agentCard) {
      await agentCard.click();
      await delay(TIMING.postClickDelay);
      await waitForNetworkIdle(page);
      await waitForLoaders(page);
      await takeScreenshot(page, '04-agent-detail-drawer', 'agents');

      // Try to capture the chat interface within the drawer
      try {
        const chatInput = await page.$('[class*="drawer" i] textarea, [class*="drawer" i] [class*="chatInput" i]');
        if (chatInput) {
          await takeScreenshot(page, '04a-agent-drawer-chat', 'agents');
        }
      } catch (e) {
        console.log('  Could not capture agent drawer chat');
      }

      // Close the drawer
      await page.keyboard.press('Escape').catch(() => {});
      await delay(300);
    }
  } catch (e) {
    console.log('  Could not capture agent detail drawer');
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

    await delay(TIMING.postClickDelay);
    await waitForNetworkIdle(page);
    await waitForLoaders(page);

    // Check if there's a type selection screen first
    const hasTypeSelection = await waitForContent(page, [
      '[class*="typeSelection" i]',
      '[class*="agentType" i]',
      '[class*="moldSelection" i]',
    ], 3000);
    if (hasTypeSelection) {
      await takeScreenshot(page, '05a-agent-type-selection', 'agents');
      // Click first type option to proceed
      const typeClicked = await clickFirstVisible(page, [
        '[class*="typeCard" i]',
        '[class*="typeOption" i]',
        '[class*="moldCard" i]',
      ]) || await clickButtonByText(page, 'assistant', 3000);
      if (typeClicked) {
        await delay(TIMING.postClickDelay);
        await waitForNetworkIdle(page);
        await waitForLoaders(page);
      }
    }

    await takeScreenshot(page, '05-builder-objective', 'agents');

    // Builder uses circular icon buttons with aria-label attributes for step nav.
    // "Instructions" step is labeled "Optional Settings" in the UI.
    const steps = [
      { ariaLabel: 'Facets', shot: '06-builder-facets' },
      { ariaLabel: 'Optional Settings', shot: '07-builder-instructions' },
      { ariaLabel: 'Identity', shot: '08-builder-identity' },
      { ariaLabel: 'Appearance', shot: '09-builder-appearance' },
      { ariaLabel: 'Review', shot: '10-builder-review' }
    ];

    for (const step of steps) {
      // Primary: click the step's circular nav button via aria-label
      // Fallback: click Next/Continue text button at bottom of page
      const moved =
        (await clickByAriaLabel(page, step.ariaLabel, 3000)) ||
        (await clickButtonByText(page, 'next', 2500)) ||
        (await clickButtonByText(page, 'continue', 2500));
      if (!moved) {
        console.log(`  ⚠ Could not navigate to builder step: ${step.ariaLabel}`);
        continue;
      }
      await delay(TIMING.builderStepWait);
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
  ]);

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
      await delay(TIMING.postClickDelay);
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
      await delay(TIMING.postClickDelay);
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
      await delay(TIMING.postClickDelay);
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
        await delay(TIMING.postClickDelay);
        await waitForNetworkIdle(page);
        await waitForLoaders(page);
        await takeScreenshot(page, '06a-mold-details', 'people');
      }
      break;
    }
  } catch (e) {
    console.log(`  Could not capture molds: ${e.message}`);
  }

  // Import flow: try to find and click import button on humans page
  try {
    for (const p of ['/people/humans', '/audience/community']) {
      const humansUrl = getWorkspaceUrl(p);
      if (!(await gotoWithRetry(page, humansUrl, { label: 'people-import' }))) continue;
      const importClicked =
        (await clickButtonByText(page, 'import', 2500)) ||
        (await clickButtonByText(page, 'add', 2500)) ||
        (await clickFirstVisible(page, [
          'button[aria-label*="import" i]',
          '[data-testid*="import"]',
        ]));
      if (importClicked) {
        await delay(TIMING.postClickDelay);
        await waitForLoaders(page);
        await takeScreenshot(page, '07-import-flow', 'people');
        await page.keyboard.press('Escape').catch(() => {});
        await delay(300);
      }
      break;
    }
  } catch (e) {
    console.log(`  Could not capture import flow: ${e.message}`);
  }

  // Filter/Search UI on humans page
  try {
    for (const p of ['/people/humans', '/audience/community']) {
      const humansUrl = getWorkspaceUrl(p);
      if (!(await gotoWithRetry(page, humansUrl, { label: 'people-filters' }))) continue;
      const searchInput = await page.$('input[type="search"], input[placeholder*="search" i]');
      if (searchInput) {
        await searchInput.click();
        await delay(TIMING.preScreenshotDelay);
        await takeScreenshot(page, '08-people-search', 'people');
      }
      break;
    }
  } catch (e) {
    console.log(`  Could not capture people search/filter: ${e.message}`);
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
  ]);

  await takeScreenshot(page, '01-campaigns-gallery', 'campaigns');

  // Try to capture a campaign card close-up by clicking the first campaign
  let surveyId = null;
  try {
    // Find and click the first campaign card link
    const campaignClicked = await page.evaluate(() => {
      // Look for clickable campaign cards/links
      const selectors = [
        '[data-testid="campaign-card"] a',
        '[class*="campaignCard"] a',
        '[class*="surveyCard"] a',
        '[class*="campaign"] a[href*="survey"]',
        'a[href*="/survey/"]',
      ];
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) {
          el.click();
          return true;
        }
      }
      // Fallback: click any card-like element
      const cards = document.querySelectorAll('[class*="campaignCard"], [class*="surveyCard"], [class*="card" i]');
      for (const card of cards) {
        const link = card.querySelector('a');
        if (link && link.href.includes('survey')) {
          link.click();
          return true;
        }
        if (card.onclick || card.closest('a')) {
          card.click();
          return true;
        }
      }
      return false;
    });

    if (campaignClicked) {
      await delay(TIMING.postClickDelay);
      await waitForNetworkIdle(page);
      await waitForLoaders(page);

      // Extract survey ID from the URL
      const surveyMatch = page.url().match(/\/survey\/([a-f0-9-]+)/i);
      if (surveyMatch) {
        surveyId = surveyMatch[1];
        console.log(`  ✓ Opened campaign, survey ID: ${surveyId}`);
      }

      await takeScreenshot(page, '02-campaign-detail', 'campaigns');
    }
  } catch (e) {
    console.log(`  Could not open campaign card: ${e.message}`);
  }

  // If we have a survey ID, navigate through all campaign tabs
  if (surveyId) {
    // Build Tab - Questions
    try {
      const buildUrl = getWorkspaceUrl(`/survey/${surveyId}/questions`);
      if (await gotoWithRetry(page, buildUrl, { label: 'campaign-build' })) {
        await waitForContent(page, [
          '[class*="questionEditor" i]',
          '[class*="questionNav" i]',
          '[class*="questionPanel" i]',
          '[class*="formBuilder" i]',
          'textarea',
        ]);
        await takeScreenshot(page, '06-build-questions', 'campaigns');

        // Try to show the Add Question dropdown (question type selector)
        try {
          const addQClicked =
            (await clickButtonByText(page, 'add question', 3000)) ||
            (await clickFirstVisible(page, [
              '[data-testid*="add-question"]',
              '[class*="addQuestion" i]',
              'button[aria-label*="add question" i]',
            ]));
          if (addQClicked) {
            await delay(TIMING.postClickDelay);
            await takeScreenshot(page, '07-question-type-selector', 'campaigns');

            // Try clicking each question type to capture its editor
            const questionTypes = [
              { name: 'video', label: 'Video', shot: '08-question-video' },
              { name: 'multiple choice', label: 'Multiple Choice', shot: '09-question-multiple-choice' },
              { name: 'multiselect', label: 'Multiselect', shot: '10-question-multiselect' },
              { name: 'ranking', label: 'Ranking', shot: '11-question-ranking' },
              { name: 'star rating', label: 'Star Rating', shot: '12-question-star-rating' },
              { name: 'opinion slider', label: 'Opinion Slider', shot: '13-question-opinion-slider' },
              { name: 'short text', label: 'Short Text', shot: '14-question-short-text' },
              { name: 'long text', label: 'Long Text', shot: '15-question-long-text' },
              { name: 'number', label: 'Number', shot: '16-question-number' },
              { name: 'image upload', label: 'Image Upload', shot: '17-question-image-upload' },
              { name: 'pdf upload', label: 'PDF Upload', shot: '18-question-pdf-upload' },
              { name: 'video upload', label: 'Video Upload', shot: '19-question-video-upload' },
              { name: 'scan', label: 'Scan', shot: '20-question-scan-barcode' },
            ];

            for (const qt of questionTypes) {
              try {
                // Re-open the add question dropdown for each type
                const reopened =
                  (await clickButtonByText(page, 'add question', 2000)) ||
                  (await clickFirstVisible(page, [
                    '[data-testid*="add-question"]',
                    '[class*="addQuestion" i]',
                  ]));
                if (!reopened) break;
                await delay(TIMING.postClickDelay);

                // Click the specific question type
                const typeClicked = await clickButtonByText(page, qt.name, 2500);
                if (typeClicked) {
                  await delay(TIMING.postClickDelay);
                  await waitForNetworkIdle(page);
                  await waitForLoaders(page);
                  await takeScreenshot(page, qt.shot, 'campaigns');
                  console.log(`  ✓ Captured question type: ${qt.label}`);
                } else {
                  // Close dropdown for next attempt
                  await page.keyboard.press('Escape').catch(() => {});
                  await delay(200);
                }
              } catch (e) {
                console.log(`  Could not capture question type ${qt.label}: ${e.message}`);
                await page.keyboard.press('Escape').catch(() => {});
                await delay(200);
              }
            }
          }
        } catch (e) {
          console.log(`  Could not capture question type selector: ${e.message}`);
        }
      }
    } catch (e) {
      console.log(`  Could not capture Build tab: ${e.message}`);
    }

    // Configure Tab - Campaign settings
    try {
      const configUrl = getWorkspaceUrl(`/survey/${surveyId}/settings`);
      if (await gotoWithRetry(page, configUrl, { label: 'campaign-configure' })) {
        await waitForContent(page, [
          '[class*="settings" i]',
          '[class*="surveySettings" i]',
          'form',
          'input',
        ]);
        await takeScreenshot(page, '21-configure-settings', 'campaigns');
      }
    } catch (e) {
      console.log(`  Could not capture Configure tab: ${e.message}`);
    }

    // Audience Tab - Participant management
    try {
      const audienceUrl = getWorkspaceUrl(`/survey/${surveyId}/audience`);
      if (await gotoWithRetry(page, audienceUrl, { label: 'campaign-audience' })) {
        await waitForContent(page, [
          '[class*="audience" i]',
          '[class*="participant" i]',
          '[class*="surveyParticipant" i]',
          'table',
          'button',
        ]);
        await takeScreenshot(page, '22-audience-management', 'campaigns');
      }
    } catch (e) {
      console.log(`  Could not capture Audience tab: ${e.message}`);
    }

    // Launch Tab - Pre-launch checklist
    try {
      const launchUrl = getWorkspaceUrl(`/survey/${surveyId}/launch`);
      if (await gotoWithRetry(page, launchUrl, { label: 'campaign-launch' })) {
        await waitForContent(page, [
          '[class*="launch" i]',
          '[class*="checklist" i]',
          '[class*="finalize" i]',
          '[class*="launchPage" i]',
          'button',
        ]);
        await takeScreenshot(page, '23-launch-checklist', 'campaigns');
      }
    } catch (e) {
      console.log(`  Could not capture Launch tab: ${e.message}`);
    }

    // Results Tab - Response viewer (may require campaign to be Open/Closed)
    try {
      const resultsUrl = getWorkspaceUrl(`/survey/${surveyId}/results`);
      if (await gotoWithRetry(page, resultsUrl, { label: 'campaign-results' })) {
        await waitForContent(page, [
          '[class*="results" i]',
          '[class*="response" i]',
          '[class*="chart" i]',
          'table',
        ], 5000);
        await takeScreenshot(page, '24-results-responses', 'campaigns');
      }
    } catch (e) {
      console.log(`  Could not capture Results tab: ${e.message}`);
    }

    // Analyze Tab - Data table view
    try {
      const analyzeUrl = getWorkspaceUrl(`/survey/${surveyId}/analyze`);
      if (await gotoWithRetry(page, analyzeUrl, { label: 'campaign-analyze' })) {
        await waitForContent(page, [
          '[class*="resultsTable" i]',
          '[class*="analyze" i]',
          'table',
        ], 5000);
        await takeScreenshot(page, '25-analyze-data-table', 'campaigns');
      }
    } catch (e) {
      console.log(`  Could not capture Analyze tab: ${e.message}`);
    }

    // Summary Tab - AI insights
    try {
      const summaryUrl = getWorkspaceUrl(`/survey/${surveyId}/summary`);
      if (await gotoWithRetry(page, summaryUrl, { label: 'campaign-summary' })) {
        await waitForContent(page, [
          '[class*="summary" i]',
          '[class*="quickSummary" i]',
          '[class*="insight" i]',
          '[class*="markdown" i]',
        ], 5000);
        await takeScreenshot(page, '26-summary-ai-insights', 'campaigns');
      }
    } catch (e) {
      console.log(`  Could not capture Summary tab: ${e.message}`);
    }
  }

  // Sub-pages (navigate back to campaigns section)
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
  ]);

  await takeScreenshot(page, '01-datasets-main', 'datasets');

  // Create Dataset modal
  try {
    const opened =
      (await clickButtonByText(page, 'create dataset', 3500)) ||
      (await clickButtonByText(page, 'create', 3500));
    if (opened) {
      await delay(TIMING.postClickDelay);
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

  // Navigate back to datasets and try to open a dataset detail view
  try {
    if (await gotoWithRetry(page, datasetsUrl, { label: 'datasets-return' })) {
      // Click the first dataset card to open detail view
      const datasetClicked = await page.evaluate(() => {
        const selectors = [
          '[data-testid="dataset-card"] a',
          '[class*="datasetCard"] a',
          '[class*="trainingSet"] a',
          'a[href*="/datasets/"]',
          'a[href*="/training-set/"]',
        ];
        for (const sel of selectors) {
          const el = document.querySelector(sel);
          if (el) {
            el.click();
            return true;
          }
        }
        // Fallback: click any dataset card
        const cards = document.querySelectorAll('[class*="datasetCard"], [class*="trainingSet"], [class*="card" i]');
        for (const card of cards) {
          const link = card.querySelector('a');
          if (link) {
            link.click();
            return true;
          }
          if (card.onclick) {
            card.click();
            return true;
          }
        }
        return false;
      });

      if (datasetClicked) {
        await delay(TIMING.postClickDelay);
        await waitForNetworkIdle(page);
        await waitForLoaders(page);
        await waitForContent(page, [
          '[class*="datasetDetail" i]',
          '[class*="trainingSetDetail" i]',
          '[class*="fileTable" i]',
          'table',
        ], 5000);
        await takeScreenshot(page, '04-dataset-detail', 'datasets');

        // Try to capture the upload dialog
        try {
          const uploadClicked =
            (await clickButtonByText(page, 'add files', 2500)) ||
            (await clickButtonByText(page, 'upload', 2500)) ||
            (await clickFirstVisible(page, [
              '[data-testid*="upload"]',
              '[class*="uploadButton" i]',
              'button[aria-label*="upload" i]',
            ]));
          if (uploadClicked) {
            await delay(TIMING.postClickDelay);
            await takeScreenshot(page, '05-upload-dialog', 'datasets');
            await page.keyboard.press('Escape').catch(() => {});
            await delay(300);
          }
        } catch (e) {
          console.log('  Could not capture upload dialog');
        }

        // Capture dataset with documents (should already be showing files table)
        await takeScreenshot(page, '06-dataset-with-documents', 'datasets');
      }
    }
  } catch (e) {
    console.log(`  Could not capture dataset detail: ${e.message}`);
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
  ]);

  await takeScreenshot(page, '01-workflows-main', 'workflows');

  // Try to click into an existing workflow for detail view
  let workflowDetailCaptured = false;
  try {
    const workflowClicked = await page.evaluate(() => {
      const selectors = [
        '[data-testid="workflow-card"] a',
        '[class*="workflowCard"] a',
        'a[href*="/workflow/"]',
        'a[href*="/orchestration/"]',
      ];
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el && !el.href?.includes('/flows') && !el.href?.includes('/templates') && !el.href?.includes('/upcoming') && !el.href?.includes('/conversations')) {
          el.click();
          return true;
        }
      }
      // Fallback: click first card
      const cards = document.querySelectorAll('[class*="workflowCard"], [class*="orchestrationCard"]');
      for (const card of cards) {
        const link = card.querySelector('a');
        if (link) {
          link.click();
          return true;
        }
        card.click();
        return true;
      }
      return false;
    });

    if (workflowClicked) {
      await delay(TIMING.postClickDelay);
      await waitForNetworkIdle(page);
      await waitForLoaders(page);

      // Check if we got a workflow detail/builder view
      const hasCanvas = await waitForContent(page, [
        '[class*="reactFlow" i]',
        '[class*="canvas" i]',
        '[class*="builder" i]',
        '[class*="workflowDetail" i]',
        'canvas',
      ], 5000);

      if (hasCanvas) {
        await takeScreenshot(page, '06-workflow-detail', 'workflows');
        workflowDetailCaptured = true;

        // Try to capture a node being edited
        try {
          const nodeClicked = await clickFirstVisible(page, [
            '[class*="agentTaskNode" i]',
            '[class*="react-flow__node" i]',
            '[data-testid*="node"]',
          ]);
          if (nodeClicked) {
            await delay(TIMING.postClickDelay);
            await waitForLoaders(page);
            await takeScreenshot(page, '07-workflow-node-editor', 'workflows');
          }
        } catch (e) {
          console.log('  Could not capture node editor');
        }
      }
    }
  } catch (e) {
    console.log(`  Could not capture workflow detail: ${e.message}`);
  }

  // Workflow Builder (best-effort): open from /workflow/flows and click create/new.
  if (!workflowDetailCaptured) {
    try {
      const flowsUrl = getWorkspaceUrl('/workflow/flows');
      if (await gotoWithRetry(page, flowsUrl, { label: 'workflow-flows' })) {
        const opened =
          (await clickButtonByText(page, 'create flow', 3000)) ||
          (await clickButtonByText(page, 'new flow', 3000)) ||
          (await clickButtonByText(page, 'create', 3000)) ||
          (await clickButtonByText(page, 'new', 3000));
        if (opened) {
          await delay(TIMING.postClickDelay);
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

  // Try to capture run history/detail from the conversations page
  try {
    const conversationsUrl = getWorkspaceUrl('/workflow/conversations');
    if (await gotoWithRetry(page, conversationsUrl, { label: 'workflow-conversations-detail' })) {
      // Try clicking first conversation/run to see detail
      const runClicked = await clickFirstVisible(page, [
        'table tbody tr',
        '[class*="conversationItem" i]',
        '[class*="runItem" i]',
        'a[href*="/workflow/"]',
      ]);
      if (runClicked) {
        await delay(TIMING.postClickDelay);
        await waitForNetworkIdle(page);
        await waitForLoaders(page);
        await takeScreenshot(page, '08-workflow-run-detail', 'workflows');
      }
    }
  } catch (e) {
    console.log(`  Could not capture workflow run detail: ${e.message}`);
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
  ]);

  await takeScreenshot(page, '01-general-settings', 'settings');

  // AI Models sub-page
  try {
    const aiUrl = getWorkspaceUrl('/workspace/settings/ai-models');
    if (await gotoWithRetry(page, aiUrl, { label: 'settings-ai-models' })) {
      await waitForContent(page, [
        '[class*="aiModel" i]',
        '[class*="modelCard" i]',
        '[class*="model" i]',
        'input',
      ]);
      await takeScreenshot(page, '02-ai-models', 'settings');
    }
  } catch (e) {
    console.log(`  Could not capture AI models: ${e.message}`);
  }

  // Members sub-page
  try {
    const membersUrl = getWorkspaceUrl('/workspace/members');
    if (await gotoWithRetry(page, membersUrl, { label: 'settings-members' })) {
      await waitForContent(page, [
        'table',
        '[class*="member" i]',
        '[class*="workspaceMembers" i]',
      ]);
      await takeScreenshot(page, '03-members', 'settings');
    }
  } catch (e) {
    console.log(`  Could not capture members: ${e.message}`);
  }

  // API Management sub-page (may be feature-flagged off)
  try {
    const apiUrl = getWorkspaceUrl('/workspace/settings/api-management');
    if (await gotoWithRetry(page, apiUrl, { label: 'settings-api-management' })) {
      // Check if we're still on the api-management page (might redirect if disabled)
      if (page.url().includes('api-management')) {
        await takeScreenshot(page, '04-api-management', 'settings');
      }
    }
  } catch (e) {
    console.log(`  Could not capture API management: ${e.message}`);
  }

  // Billing/Plan sub-page (may be accessible via General settings)
  try {
    // Some workspaces show billing info within General or as a separate tab
    if (await gotoWithRetry(page, settingsUrl, { label: 'settings-billing' })) {
      // Scroll down to see plan card or billing section
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await delay(TIMING.postClickDelay);
      await takeScreenshot(page, '05-billing-plan', 'settings');
    }
  } catch (e) {
    console.log(`  Could not capture billing: ${e.message}`);
  }

  return true;
}

async function captureBranding(page) {
  console.log('\n Capturing Branding...');

  // Branding routes are under /workspace/branding/
  const brandingUrl = getWorkspaceUrl('/workspace/branding');
  if (!(await gotoWithRetry(page, brandingUrl, { label: 'branding' }))) return false;

  await waitForContent(page, [
    'form',
    'input',
    '[class*="brand" i]',
    '[class*="form" i]',
  ]);

  await takeScreenshot(page, '01-brand-settings', 'branding');

  // Sub-pages
  const subPages = [
    { path: '/workspace/branding/reviews', name: '02-reviews' },
    { path: '/workspace/branding/reels', name: '03-reels' },
    { path: '/workspace/branding/questions', name: '04-questions' },
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
  ]);

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
  ]);

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
  ]);

  await takeScreenshot(page, '01-integrations-main', 'integrations');
  return true;
}

// Run a list of capture functions on a dedicated page, returning results.
async function runWorker(browser, captures, workerLabel) {
  const page = await browser.newPage();
  await page.setViewport(CONFIG.viewport);
  page.setDefaultTimeout(CONFIG.timeout);

  /** @type {{name: string, ok: boolean}[]} */
  const results = [];
  try {
    for (const [name, fn] of captures) {
      try {
        console.log(`\n[${workerLabel}] Starting: ${name}`);
        const ok = await fn(page);
        results.push({ name, ok: ok !== false });
      } catch (e) {
        results.push({ name, ok: false });
        console.log(`  ⚠ [${workerLabel}] Capture '${name}' threw: ${e?.message || String(e)}`);
        await takeArtifactScreenshot(page, `capture-throw-${name}`);
      }
    }
  } finally {
    await page.close().catch(() => {});
  }
  return results;
}

// Main execution
async function main() {
  console.time('Total screenshot capture');
  console.log('==========================================');
  console.log('  Vurvey Documentation Screenshot Tool');
  console.log('==========================================');
  console.log(`\nTarget: ${CONFIG.baseUrl}`);
  console.log(`Headless: ${CONFIG.headless}`);
  console.log(`Output: ${CONFIG.screenshotsDir}`);
  console.log(`Strict: ${CONFIG.strict}`);
  console.log(`Parallel workers: ${CONFIG.parallel}`);

  // Ensure screenshot directories exist
  const dirs = ['home', 'agents', 'people', 'campaigns', 'datasets', 'workflows', 'settings', 'branding', 'forecast', 'rewards', 'integrations'];
  dirs.forEach(dir => ensureDir(path.join(CONFIG.screenshotsDir, dir)));
  ensureDir(CONFIG.artifactsDir);

  const browser = await puppeteer.launch({
    headless: CONFIG.headless ? 'new' : false,
    defaultViewport: CONFIG.viewport,
    protocolTimeout: 300_000, // 5 min CDP timeout (default 180s too short for heavy pages like Agent Builder)
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      `--window-size=${CONFIG.viewport.width},${CONFIG.viewport.height}`
    ]
  });

  // Login on a dedicated page (shares cookies/storage with all pages in the same context).
  const loginPage = await browser.newPage();
  await loginPage.setViewport(CONFIG.viewport);
  loginPage.setDefaultTimeout(CONFIG.timeout);

  try {
    await login(loginPage);

    // Ensure we have a workspace ID before continuing
    if (!workspaceId) {
      console.log('\n  Attempting to extract workspace ID from current page...');
      workspaceId = await resolveWorkspaceId(loginPage);
      if (workspaceId) {
        console.log(`  ✓ Found workspace ID: ${workspaceId}`);
      } else if (CONFIG.fallbackWorkspaceId) {
        workspaceId = CONFIG.fallbackWorkspaceId;
        console.log(`  ✓ Using fallback workspace ID: ${workspaceId}`);
      } else {
        throw new Error('Could not determine workspace ID. Set VURVEY_WORKSPACE_ID env var as fallback.');
      }
    }

    // Close the login page – we no longer need it.
    await loginPage.close().catch(() => {});

    // Define all capture functions.
    const allCaptures = [
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
    let captureResults;

    if (CONFIG.parallel <= 1) {
      // Sequential fallback – single worker processes everything.
      captureResults = await runWorker(browser, allCaptures, 'worker-1');
    } else {
      // Distribute captures across workers. Groups are load-balanced so the
      // heaviest sections (people, agents) each get their own worker.
      const workerGroups = distributeCaptures(allCaptures, CONFIG.parallel);

      console.log(`\n  Distributing ${allCaptures.length} sections across ${workerGroups.length} workers...`);
      for (let i = 0; i < workerGroups.length; i++) {
        console.log(`    Worker ${i + 1}: ${workerGroups[i].map(([n]) => n).join(', ')}`);
      }

      const settled = await Promise.allSettled(
        workerGroups.map((group, i) => runWorker(browser, group, `worker-${i + 1}`))
      );

      captureResults = [];
      for (const result of settled) {
        if (result.status === 'fulfilled') {
          captureResults.push(...result.value);
        } else {
          console.log(`  ⚠ Worker failed: ${result.reason?.message || String(result.reason)}`);
        }
      }
    }

    const failed = captureResults.filter((r) => !r.ok).map((r) => r.name);
    console.timeEnd('Total screenshot capture');
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
    await takeArtifactScreenshot(loginPage, 'capture-error').catch(() => {});
    if (CONFIG.strict) process.exit(1);
    console.log('  ⚠ Non-strict mode: exiting 0 despite screenshot capture error');
  } finally {
    await browser.close();
  }
}

// Distribute captures across N workers with load-balanced grouping.
// Heavy sections (people, agents) get dedicated workers when possible.
function distributeCaptures(captures, numWorkers) {
  if (numWorkers <= 1) return [captures];

  // Estimated relative weights for load balancing (higher = heavier).
  const weights = {
    campaigns: 10, // massive expansion: tabs, question types, results
    people: 5,     // many sub-pages + deep captures
    agents: 5,     // builder steps + detail drawer + filters
    home: 4,       // chat toolbar buttons + conversations
    workflows: 4,  // detail view + node editor + run history
    datasets: 3,   // detail view + upload dialog
    settings: 2,   // sub-pages + billing
    branding: 2,   // 4 sub-pages
    forecast: 1,
    rewards: 1,
    integrations: 1,
  };

  // Sort captures by weight descending so heavy ones get assigned first.
  const sorted = [...captures].sort(
    (a, b) => (weights[b[0]] || 1) - (weights[a[0]] || 1)
  );

  // Greedy assignment: always add next capture to the lightest worker.
  const groups = Array.from({ length: numWorkers }, () => []);
  const groupWeights = new Array(numWorkers).fill(0);

  for (const capture of sorted) {
    const minIdx = groupWeights.indexOf(Math.min(...groupWeights));
    groups[minIdx].push(capture);
    groupWeights[minIdx] += weights[capture[0]] || 1;
  }

  // Remove empty groups (when captures < workers).
  return groups.filter((g) => g.length > 0);
}

main().catch(console.error);
