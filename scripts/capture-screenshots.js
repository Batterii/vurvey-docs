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
 *   VURVEY_WORKSPACE_ID - Preferred workspace ID for all captures (default: DEMO workspace)
 *   VURVEY_BENCHMARK_AGENT_BUILDER_ID - Agent builder-v2 ID used for benchmark captures
 *   VURVEY_AGENT_BUILDER_ID - Optional fallback agent ID for builder-v2 captures
 *   VURVEY_MAGIC_REEL_ID - Reel ID used for reel editor capture
 *   HEADLESS           - Run headless (default: true)
 *   CAPTURE_PARALLEL   - Number of parallel page workers (default: 4, set to 1 for sequential)
 *   CAPTURE_ONLY       - Comma-separated section names to run (e.g. "agents,people")
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
  workspaceIdOverride: process.env.VURVEY_WORKSPACE_ID || '07e5edb5-e739-4a35-9f82-cc6cec7c0193',
  fallbackWorkspaceId: process.env.VURVEY_WORKSPACE_ID || '07e5edb5-e739-4a35-9f82-cc6cec7c0193',
  benchmarkAgentBuilderId: process.env.VURVEY_BENCHMARK_AGENT_BUILDER_ID || 'b06c8939-4fc1-40e7-830e-099f3439a70a',
  benchmarkAgentName: process.env.VURVEY_BENCHMARK_AGENT_NAME || 'Devils Advocate',
  fallbackAgentBuilderId: process.env.VURVEY_AGENT_BUILDER_ID || null,
  magicReelId: process.env.VURVEY_MAGIC_REEL_ID || '9e00f530-2f5d-4c5d-803e-2e131e1f80c4',
  strict: process.env.CAPTURE_STRICT === 'true',
  screenshotsDir: path.join(__dirname, '..', 'docs', 'public', 'screenshots'),
  artifactsDir: path.join(__dirname, '..', 'qa-output', 'capture-screenshots'),
  viewport: { width: 1920, height: 1080 },
  headless: process.env.HEADLESS !== 'false',
  timeout: 90000,
  retries: 3,
  parallel: Math.max(1, parseInt(process.env.CAPTURE_PARALLEL, 10) || 4),
  captureOnly: (process.env.CAPTURE_ONLY || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
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

async function waitForBodyTextAny(page, phrases, timeout = TIMING.contentWaitTimeout) {
  const normalized = (phrases || [])
    .map((p) => String(p || '').trim().toLowerCase())
    .filter(Boolean);
  if (!normalized.length) return false;

  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const bodyText = await page.evaluate(() => (document.body?.innerText || '').toLowerCase());
      if (normalized.some((p) => bodyText.includes(p))) return true;
    } catch {
      // Ignore transient context errors during navigation and keep polling.
    }
    await delay(250);
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

async function hasRenderableMainContent(page) {
  try {
    return await page.evaluate(() => {
      const root =
        document.querySelector('main, [role="main"], #root main, [class*="main-content" i], [class*="page-content" i]') ||
        document.body;
      const clone = root.cloneNode(true);
      clone
        .querySelectorAll('nav, aside, [class*="sidebar" i], [aria-label*="navigation" i]')
        .forEach((el) => el.remove());

      const text = (clone.innerText || '').replace(/\s+/g, ' ').trim();
      const hasStructuredContent = !!clone.querySelector(
        'table, form, textarea, canvas, [contenteditable="true"], [data-testid*="card"], [class*="card" i], [class*="grid" i], [class*="list" i], [class*="chat" i], [class*="message" i]'
      );
      const iconOnly = !!clone.querySelector('svg, [class*="icon" i]') && text.length < 40 && !hasStructuredContent;

      if (iconOnly) return false;
      return hasStructuredContent || text.length >= 80;
    });
  } catch {
    // If DOM probing fails, do not block the capture.
    return true;
  }
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

  if (await pageHasGlobalError(page)) {
    console.log(`  ⚠ Skipping screenshot (${subdir}/${name}.png): page is in a global error state`);
    await takeArtifactScreenshot(page, `skip-global-${subdir}-${name}`);
    return null;
  }

  const hasContent = await hasRenderableMainContent(page);
  if (!hasContent) {
    console.log(`  ⚠ Skipping screenshot (${subdir}/${name}.png): insufficient page content`);
    await takeArtifactScreenshot(page, `skip-empty-${subdir}-${name}`);
    return null;
  }

  try {
    await page.screenshot({ path: filepath, fullPage: false });
  } catch (e) {
    console.log(`  ⚠ Screenshot failed (${name}): ${e.message}`);
    return null;
  }
  console.log(`  ✓ Screenshot: ${subdir}/${name}.png`);
  return filepath;
}

async function hasOpenRightSideDrawer(page) {
  try {
    return await page.evaluate(() => {
      const candidates = Array.from(
        document.querySelectorAll(
          '[class*="drawer" i], [class*="slideout" i], [class*="sidepanel" i], [class*="side-panel" i], [data-testid*="drawer" i]'
        )
      );
      return candidates.some((el) => {
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
        const rect = el.getBoundingClientRect();
        if (rect.width < 260 || rect.height < 280) return false;
        // Treat only right-edge panels as drawers so centered modals are ignored.
        return rect.left > window.innerWidth * 0.6;
      });
    });
  } catch {
    return false;
  }
}

async function closeRightSideDrawer(page, context = '') {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const open = await hasOpenRightSideDrawer(page);
    if (!open) return true;

    console.log(`  ⚠ Closing open right drawer${context ? ` (${context})` : ''} [attempt ${attempt}/3]`);
    // Try escape first (most drawer implementations support it).
    await page.keyboard.press('Escape').catch(() => {});
    await delay(220);

    // Then attempt an explicit close button click inside the right panel.
    await page.evaluate(() => {
      const drawers = Array.from(
        document.querySelectorAll(
          '[class*="drawer" i], [class*="slideout" i], [class*="sidepanel" i], [class*="side-panel" i], [data-testid*="drawer" i]'
        )
      ).filter((el) => {
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 260 && rect.height > 280 && rect.left > window.innerWidth * 0.6;
      });

      for (const drawer of drawers) {
        const drawerRect = drawer.getBoundingClientRect();
        const buttons = Array.from(drawer.querySelectorAll('button, [role="button"]'));
        const closeBtn = buttons.find((el) => {
          const style = window.getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
          const rect = el.getBoundingClientRect();
          if (rect.width < 14 || rect.height < 14) return false;

          const label = `${el.getAttribute('aria-label') || ''} ${el.getAttribute('title') || ''} ${el.textContent || ''}`.trim().toLowerCase();
          const nearTopRight = rect.top <= drawerRect.top + 92 && rect.left >= drawerRect.right - 120;
          return (
            label.includes('close') ||
            label.includes('dismiss') ||
            label.includes('cancel') ||
            label === 'x' ||
            nearTopRight
          );
        });
        if (closeBtn) {
          closeBtn.click();
          return;
        }
      }
    }).catch(() => {});

    await delay(220);
  }

  return !(await hasOpenRightSideDrawer(page));
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

/**
 * Click a button/menu-item by text, but ONLY within a specific container selector.
 * Prevents accidental clicks on similarly-named elements elsewhere on the page.
 */
async function clickButtonByTextInContainer(page, text, containerSelector, timeout = 5000) {
  const startTime = Date.now();
  const norm = String(text).trim().toLowerCase();

  while (Date.now() - startTime < timeout) {
    const clicked = await page.evaluate((needle, containerSel) => {
      const containers = Array.from(document.querySelectorAll(containerSel));
      for (const container of containers) {
        const st = window.getComputedStyle(container);
        if (st.display === 'none' || st.visibility === 'hidden' || st.opacity === '0') continue;
        const els = Array.from(container.querySelectorAll("button, a, [role='button'], [role='menuitem'], li"));
        const el = els.find((e) => {
          const elText = (e.textContent || '').trim().toLowerCase();
          // Use exact match or startsWith to avoid partial matches like "video" matching "Add image or video"
          return elText === needle || elText.startsWith(needle);
        });
        if (!el) continue;
        const elSt = window.getComputedStyle(el);
        if (elSt.display === 'none' || elSt.visibility === 'hidden' || elSt.opacity === '0') continue;
        el.click();
        return true;
      }
      return false;
    }, norm, containerSelector);

    if (clicked) return true;
    await delay(250);
  }

  return false;
}

/**
 * Dismiss any open modal/dialog by pressing Escape and waiting for it to close.
 */
async function dismissAnyModal(page) {
  for (let i = 0; i < 3; i++) {
    const hasModal = await page.evaluate(() => {
      const modals = document.querySelectorAll(
        '[role="dialog"], [class*="modal" i], [class*="overlay" i][class*="open" i], [class*="Dialog" i]'
      );
      return Array.from(modals).some((el) => {
        const st = window.getComputedStyle(el);
        return st.display !== 'none' && st.visibility !== 'hidden' && st.opacity !== '0';
      });
    }).catch(() => false);

    if (!hasModal) return true;
    await page.keyboard.press('Escape').catch(() => {});
    await delay(400);
  }
  return false;
}

/**
 * Check if the current page URL includes an expected path segment.
 * Returns false if the page was silently redirected away.
 */
function isOnExpectedRoute(page, expectedPathSegment) {
  const url = page.url();
  return url.includes(expectedPathSegment);
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

  // Extract workspace ID from URL/session and then apply workspace override.
  const currentUrl = page.url();
  workspaceId = await resolveWorkspaceId(page);

  if (workspaceId) console.log(`  ✓ Resolved workspace ID: ${workspaceId}`);
  else console.log(`  ⚠ Could not resolve workspace ID from URL/session. Current URL: ${currentUrl}`);

  if (CONFIG.workspaceIdOverride) {
    if (workspaceId && workspaceId !== CONFIG.workspaceIdOverride) {
      console.log(`  ⚠ Switching from resolved workspace ${workspaceId} to configured workspace ${CONFIG.workspaceIdOverride}`);
    }
    workspaceId = CONFIG.workspaceIdOverride;
    const workspaceHomeUrl = getWorkspaceUrl('/');
    await gotoWithRetry(page, workspaceHomeUrl, { label: 'workspace-override-home', retries: 1 });
    await waitForNetworkIdle(page);
    await waitForLoaders(page);
  }

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

  // Upload/attach button (the + button to the left of the text input)
  try {
    const uploadClicked = await clickFirstVisible(page, [
      'button[aria-label*="upload" i]',
      'button[aria-label*="attach" i]',
      'button[aria-label*="add" i]',
      '[data-testid*="upload-button"]',
      '[data-testid*="attach-button"]',
      '[class*="uploadButton" i]',
      '[class*="attachButton" i]',
    ]);
    if (uploadClicked) {
      await delay(TIMING.postClickDelay);
      await waitForLoaders(page);
      // Verify something changed (dropdown/popover appeared)
      const hasUploadUI = await waitForContent(page, [
        '[role="menu"]', '[class*="dropdown" i]', '[class*="popover" i]',
        '[class*="upload" i]', '[class*="attach" i]',
      ], 3000);
      if (hasUploadUI) {
        await takeScreenshot(page, '09-upload-button', 'home');
      } else {
        console.log('  ⚠ Upload button clicked but no UI appeared');
      }
      await page.keyboard.press('Escape').catch(() => {});
      await delay(300);
    } else {
      console.log('  ⚠ Could not find upload/attach button');
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

  // For the search screenshot, type a search term to show the filter in action
  try {
    const searchInput = await page.$('input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i]');
    if (searchInput) {
      await searchInput.click();
      await delay(200);
      await searchInput.type('Storyteller', { delay: 40 });
      await delay(TIMING.postClickDelay);
      await waitForNetworkIdle(page);
      await waitForLoaders(page);
      await takeScreenshot(page, '02-agents-search', 'agents');
      // Clear the search to restore gallery
      await searchInput.click({ clickCount: 3 }); // select all
      await page.keyboard.press('Backspace');
      await delay(TIMING.postClickDelay);
      await waitForNetworkIdle(page);
      await waitForLoaders(page);
    } else {
      // Fallback: capture the same gallery view
      await takeScreenshot(page, '02-agents-search', 'agents');
    }
  } catch (e) {
    console.log(`  Could not capture search: ${e.message}`);
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

  const captureBenchmarkFromEditView = async () => {
    const benchmarkBlockedPhrases = [
      'add facet values before running a benchmark',
      'server connection required for benchmark',
    ];

    const isBenchmarkBlocked = async (timeout = 2500) =>
      waitForBodyTextAny(page, benchmarkBlockedPhrases, timeout);

    const closeBenchmarkModal = async () => {
      await page.keyboard.press('Escape').catch(() => {});
      await delay(300);
      await page.evaluate(() => {
        const candidates = Array.from(
          document.querySelectorAll(
            '[role="dialog"] button, [role="dialog"] [role="button"], [class*="modal" i] button, [class*="modal" i] [role="button"]'
          )
        );
        const closeButton = candidates.find((el) => {
          const style = window.getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
          const label = `${el.getAttribute('aria-label') || ''} ${el.getAttribute('title') || ''} ${el.textContent || ''}`.trim().toLowerCase();
          return label === 'x' || label.includes('close') || label.includes('dismiss');
        });
        if (closeButton) closeButton.click();
      }).catch(() => {});
      await delay(300);
    };

    const openBenchmarkModal = async () => {
      const evaluateClicked =
        (await clickButtonByText(page, 'evaluate', 5000)) ||
        (await clickFirstVisible(page, [
          'button[aria-label*="evaluate" i]',
          '[class*="evaluate" i] button',
          '[class*="evaluate" i]',
        ]));

      if (!evaluateClicked) {
        return false;
      }

      await delay(TIMING.postClickDelay);
      await waitForNetworkIdle(page);
      await waitForLoaders(page);
      return await waitForBodyTextAny(
        page,
        ['agent benchmark', 'simulated interview', 'start benchmark'],
        10000
      );
    };

    // Open Agent Benchmark via Evaluate button and capture key states.
    let benchmarkOpened = false;
    let capturedStartState = false;
    const maxModalAttempts = 4;
    for (let modalAttempt = 1; modalAttempt <= maxModalAttempts; modalAttempt++) {
      benchmarkOpened = await openBenchmarkModal();
      if (!benchmarkOpened) break;

      // Let transient banners settle; if still blocked, re-open the modal.
      await delay(1200);
      await waitForLoaders(page, 5000);

      const blockedAtOpen = await isBenchmarkBlocked(1800);
      if (blockedAtOpen && modalAttempt < maxModalAttempts) {
        console.log(`  ⚠ Benchmark modal blocked at open (attempt ${modalAttempt}/${maxModalAttempts}); reopening...`);
        await closeBenchmarkModal();
        await delay(900);
        continue;
      }

      await takeScreenshot(page, '04c-agent-benchmark-start', 'agents');
      capturedStartState = true;
      break;
    }

    if (!benchmarkOpened) {
      console.log('  ⚠ Evaluate action did not open Agent Benchmark modal');
      return { started: false, results: false, reason: 'no-modal' };
    }

    if (!capturedStartState) {
      // Fallback: preserve at least one start-state shot for docs diagnostics.
      await takeScreenshot(page, '04c-agent-benchmark-start', 'agents');
    }

    let benchmarkInProgress = false;
    const maxStartAttempts = 3;
    let startedAtLeastOnce = false;

    for (let attempt = 1; attempt <= maxStartAttempts; attempt++) {
      const startBenchmarkClicked =
        (await clickButtonByText(page, 'start benchmark', 6000)) ||
        (await clickButtonByText(page, 'start', 3000));

      if (!startBenchmarkClicked) {
        console.log('  ⚠ Could not start benchmark run');
        return { started: false, results: false, reason: 'no-start-button' };
      }

      await delay(TIMING.postClickDelay);
      await waitForNetworkIdle(page);
      await waitForLoaders(page);

      const benchmarkBlocked = await isBenchmarkBlocked(4000);
      if (benchmarkBlocked) {
        if (attempt < maxStartAttempts) {
          console.log(`  ⚠ Benchmark start blocked (attempt ${attempt}/${maxStartAttempts}); retrying...`);
          await closeBenchmarkModal();
          await delay(1000);
          const reopened = await openBenchmarkModal();
          if (!reopened) {
            return { started: false, results: false, reason: 'reopen-failed' };
          }
          await delay(2500);
          continue;
        }
        console.log('  ⚠ Benchmark cannot start for this agent (facet/server prerequisite not met)');
        return { started: false, results: false, reason: 'blocked' };
      }

      benchmarkInProgress = await page
        .waitForFunction(() => {
          const text = (document.body?.innerText || '').toLowerCase();
          const hasEvaluator = text.includes('evaluator');
          const hasStartButton = Array.from(document.querySelectorAll('button, [role="button"]')).some((el) => {
            const style = window.getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
            return (el.textContent || '').toLowerCase().includes('start benchmark');
          });
          return hasEvaluator || !hasStartButton;
        }, { timeout: 45000 })
        .then(() => true)
        .catch(() => false);

      if (benchmarkInProgress) {
        startedAtLeastOnce = true;
        break;
      }

      if (attempt < maxStartAttempts) {
        console.log(`  ⚠ Benchmark run state not detected (attempt ${attempt}/${maxStartAttempts}); retrying...`);
        await delay(2500);
      }
    }

    if (benchmarkInProgress) {
      // Avoid capturing the transient "Evaluator is thinking..." placeholder frame.
      await delay(5500);
      await page.waitForFunction(() => {
        const text = (document.body?.innerText || '').toLowerCase();
        return !text.includes('evaluator is thinking');
      }, { timeout: 30000 }).catch(() => {});
      await waitForLoaders(page, 5000);
      await takeScreenshot(page, '04d-agent-benchmark-run', 'agents');
    } else {
      console.log('  ⚠ Benchmark run state did not appear');
      return { started: false, results: false, reason: 'no-run-state' };
    }

    const benchmarkResultsReady = await waitForBodyTextAny(
      page,
      ['score breakdown', 'evaluation feedback', 'out of 100', 'excellent'],
      180000
    );
    if (benchmarkResultsReady) {
      await page.waitForFunction(() => {
        const body = document.body?.innerText || '';
        const text = body.toLowerCase();
        const hasScore = text.includes('score breakdown') || text.includes('out of 100');
        const hasFeedbackSection = text.includes('evaluation feedback');
        const hasAction = text.includes('run again') || text.includes('view conversation');
        const metrics = ['objective alignment', 'tool usage', 'robustness', 'edge cases'];
        const metricCount = metrics.filter((m) => text.includes(m)).length;
        const feedbackTail = body.split(/evaluation feedback/i)[1] || '';
        const feedbackLoaded = feedbackTail.replace(/\s+/g, ' ').trim().length > 80;
        return hasScore && hasFeedbackSection && hasAction && metricCount >= 3 && feedbackLoaded;
      }, { timeout: 90000 }).catch(() => {});

      // Give charts and long feedback text a final render window before capture.
      await delay(1500);
      await waitForLoaders(page, 8000);
      await takeScreenshot(page, '04e-agent-benchmark-results', 'agents');
      return { started: startedAtLeastOnce, results: true, reason: null };
    } else {
      console.log('  ⚠ Benchmark results were not ready within timeout');
      return { started: startedAtLeastOnce, results: false, reason: 'results-timeout' };
    }
  };

  // Capture the detail drawer from the gallery card.
  try {
    const clickedAgent = await page.evaluate(() => {
      const selectorSets = [
        '[data-testid="agent-card"]',
        '[class*="agentCard"]',
        '[class*="personaCard"]',
      ];
      let cards = [];
      for (const sel of selectorSets) {
        cards = Array.from(document.querySelectorAll(sel));
        if (cards.length) break;
      }
      const target = cards.find((el) => {
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 80 && rect.height > 80;
      });
      if (!target) return false;
      target.click();
      return true;
    });

    if (clickedAgent) {
      await delay(TIMING.postClickDelay);
      await waitForNetworkIdle(page);
      await waitForLoaders(page);
      await takeScreenshot(page, '04-agent-detail-drawer', 'agents');

      const chatInput = await page.$('[class*="drawer" i] textarea, [class*="drawer" i] [class*="chatInput" i]');
      if (chatInput) {
        await takeScreenshot(page, '04a-agent-drawer-chat', 'agents');
      }
    } else {
      console.log('  ⚠ Could not find any clickable agent card for detail drawer capture');
    }
  } catch (e) {
    console.log(`  ⚠ Could not capture agent detail drawer: ${e.message}`);
  }

  await closeRightSideDrawer(page, 'after-detail-drawer');

  // Use a known benchmark-ready agent in DEMO for edit and benchmark captures.
  let reachedEditView = false;
  let benchmarkStateCaptured = false;
  const benchmarkBuilderId = CONFIG.benchmarkAgentBuilderId || CONFIG.fallbackAgentBuilderId;

  if (benchmarkBuilderId) {
    const benchmarkBuilderUrl = getWorkspaceUrl(`/agents/builder-v2/${benchmarkBuilderId}`);
    const reachedBenchmarkBuilder = await gotoWithRetry(page, benchmarkBuilderUrl, {
      label: 'agents-benchmark-builder',
      retries: 1,
    });

    if (reachedBenchmarkBuilder) {
      await waitForNetworkIdle(page);
      await waitForLoaders(page);
      const onEditView =
        page.url().includes('/agents/builder-v2/') ||
        page.url().includes('/agents/builder/') ||
        (await waitForBodyTextAny(page, ['vurvey ai agent credential', 'agent credential', 'deactivate'], 8000));

      if (onEditView) {
        reachedEditView = true;
        const expectedAgentName = String(CONFIG.benchmarkAgentName || '').trim().toLowerCase();

        const waitForBenchmarkAgentIdentity = async (timeout = 18000) => {
          return await page.waitForFunction((expected) => {
            const body = (document.body?.innerText || '').toLowerCase();
            const hasCredentialShell = body.includes('vurvey ai agent credential') || body.includes('agent credential');
            if (!hasCredentialShell) return false;

            if (expected) {
              return body.includes(expected);
            }

            // Fallback for environments that don't configure an expected name.
            return body.includes('agent credential') && !body.includes('untitled agent');
          }, { timeout }, expectedAgentName)
            .then(() => true)
            .catch(() => false);
        };

        let agentIdentityReady = await waitForBenchmarkAgentIdentity(14000);
        if (!agentIdentityReady) {
          // Agent details can hydrate several seconds after the credential shell.
          await delay(2200);
          await waitForLoaders(page, 8000);
          agentIdentityReady = await waitForBenchmarkAgentIdentity(12000);
        }

        if (!agentIdentityReady) {
          console.log('  ⚠ Benchmark agent identity not ready; reloading credential route once');
          const reloadOk = await gotoWithRetry(page, benchmarkBuilderUrl, {
            label: 'agents-benchmark-builder-reload',
            retries: 1,
          });
          if (reloadOk) {
            await waitForNetworkIdle(page);
            await waitForLoaders(page, 8000);
            await waitForBenchmarkAgentIdentity(18000);
          }
        }

        await takeScreenshot(page, '04b-agent-edit-credential', 'agents');
        const benchmarkResult = await captureBenchmarkFromEditView();
        benchmarkStateCaptured = Boolean(benchmarkResult?.started);
        if (!benchmarkStateCaptured) {
          console.log(`  ⚠ Could not capture benchmark run state (${benchmarkResult?.reason || 'unknown'})`);
        }
      } else {
        console.log(`  ⚠ Benchmark agent route opened but credential view was not detected: ${benchmarkBuilderUrl}`);
      }
    } else {
      console.log(`  ⚠ Could not open configured benchmark agent route: ${benchmarkBuilderUrl}`);
    }
  } else {
    console.log('  ⚠ No benchmark agent builder ID configured');
  }

  if (!benchmarkStateCaptured) {
    console.log('  ⚠ Could not capture a full benchmark run state');
  }

  // --- Capture builder steps from the Edit Agent flow (not the Create modal). ---
  // The builder-v2 VIEW page has an "Edit Agent" button that opens the multi-step
  // builder flow (Objective → Facets → Optional Settings → Identity → Appearance → Review).
  // The "Create Agent" button on the gallery now opens a simple "Generate Agent" modal
  // which does not have multi-step navigation.
  let capturedBuilderSteps = false;
  if (reachedEditView && benchmarkBuilderId) {
    try {
      // Navigate fresh to the builder-v2 VIEW page to ensure a clean state
      // (the benchmark modal may have left overlays or changed page state).
      const benchmarkBuilderUrl = getWorkspaceUrl(`/agents/builder-v2/${benchmarkBuilderId}`);
      const reachedView = await gotoWithRetry(page, benchmarkBuilderUrl, {
        label: 'agents-builder-for-edit',
        retries: 2,
      });

      if (reachedView) {
        await waitForNetworkIdle(page);
        await waitForLoaders(page);

        // Wait for the VIEW page to fully render with the agent credential section.
        await waitForBodyTextAny(page, ['deactivate', 'activate', 'edit'], 8000);

        // Click "Edit" to enter the multi-step builder flow.
        // The builder-v2 VIEW page shows an "Edit" button (may also say "Edit Agent").
        const editClicked =
          (await clickButtonByText(page, 'edit agent', 3000)) ||
          (await clickButtonByText(page, 'edit', 3000)) ||
          (await clickFirstVisible(page, [
            'button[data-testid*="edit" i]',
            'button[aria-label*="edit" i]',
          ]));
        if (editClicked) {
          await delay(TIMING.postClickDelay);
          await waitForNetworkIdle(page);
          await waitForLoaders(page);

          // Wait for the builder flow navigation to appear (step buttons with aria-labels).
          const flowNavReady = await waitForBodyTextAny(
            page,
            ['objective', 'facets'],
            8000
          );
          if (!flowNavReady) {
            console.log('  ⚠ Builder flow navigation did not appear after clicking Edit Agent');
          }

          // The first step (Objective) is already active after clicking Edit Agent.
          await takeScreenshot(page, '05-builder-objective', 'agents');

          // Navigate through remaining builder steps using direct URL navigation.
          // Each step maps to /agents/builder-v2/{id}/{stepSlug} per
          // useAgentBuilderNavigation in the frontend source.
          const steps = [
            { slug: 'facets', shot: '06-builder-facets', contentHints: ['facet', 'add facet'] },
            { slug: 'instructions', shot: '07-builder-instructions', contentHints: ['instruction', 'behavior'] },
            { slug: 'identity', shot: '08-builder-identity', contentHints: ['name', 'biography', 'voice'] },
            { slug: 'appearance', shot: '09-builder-appearance', contentHints: ['appearance', 'avatar', 'image'] },
            { slug: 'review', shot: '10-builder-review', contentHints: ['review', 'credential', 'summary'] }
          ];

          for (const step of steps) {
            const stepUrl = getWorkspaceUrl(`/agents/builder-v2/${benchmarkBuilderId}/${step.slug}`);
            const reached = await gotoWithRetry(page, stepUrl, {
              label: `agents-builder-step-${step.slug}`,
              retries: 2,
            });
            if (!reached) {
              console.log(`  ⚠ Could not navigate to builder step: ${step.slug}`);
              continue;
            }
            await waitForNetworkIdle(page);
            await waitForLoaders(page, 8000);

            // Wait for step-specific content to render (not just the page shell)
            const hasStepContent = await waitForBodyTextAny(page, step.contentHints, 10000);
            if (!hasStepContent) {
              console.log(`  ⚠ Builder step ${step.slug} content not detected — retrying`);
              // Retry once with a page reload
              await gotoWithRetry(page, stepUrl, { label: `agents-builder-step-${step.slug}-retry`, retries: 1 });
              await waitForNetworkIdle(page);
              await waitForLoaders(page, 10000);
              await waitForBodyTextAny(page, step.contentHints, 12000);
            }

            // Verify we have renderable content (not just a loading icon)
            const hasContent = await hasRenderableMainContent(page);
            if (!hasContent) {
              console.log(`  ⚠ Skipping builder step ${step.slug} — no renderable content`);
              continue;
            }

            await takeScreenshot(page, step.shot, 'agents');
          }

          capturedBuilderSteps = true;
        } else {
          console.log('  ⚠ Could not find "Edit Agent" button on builder-v2 view');
        }
      }
    } catch (e) {
      console.log(`  ⚠ Could not capture builder steps from edit view: ${e.message}`);
    }
  }

  if (!capturedBuilderSteps) {
    console.log('  ⚠ Builder step screenshots not captured (edit flow unavailable)');
  }

  // Return to gallery from builder/edit view.
  await gotoWithRetry(page, agentsUrl, { label: 'agents-return-from-edit', retries: 1 });
  await waitForLoaders(page);
  await closeRightSideDrawer(page, 'after-return-from-edit');

  // Capture the "Generate Agent" modal (the current Create Agent flow).
  try {
    const opened =
      (await clickButtonByText(page, 'create agent', 4000)) ||
      (await clickButtonByText(page, 'create', 4000));

    if (opened) {
      await delay(TIMING.postClickDelay);
      await waitForNetworkIdle(page);
      await waitForLoaders(page);

      // Check if we got a modal (Generate Agent) or navigated to the Classic Builder page
      const isModal = await page.evaluate(() => {
        const dialogs = document.querySelectorAll('[role="dialog"], [class*="modal" i]');
        return Array.from(dialogs).some((el) => {
          const st = window.getComputedStyle(el);
          return st.display !== 'none' && st.visibility !== 'hidden' && st.opacity !== '0';
        });
      }).catch(() => false);

      if (isModal) {
        console.log('  ✓ Generate Agent modal detected');
      } else {
        console.log('  ⚠ Create Agent opened Classic Builder page instead of modal');
      }

      await takeScreenshot(page, '05a-create-agent-modal', 'agents');
    } else {
      console.log('  ⚠ Could not open Create Agent modal');
    }
  } catch (e) {
    console.log(`  Could not capture Create Agent modal: ${e.message}`);
  }

  // Return to Agents list
  await gotoWithRetry(page, agentsUrl, { label: 'agents-return' });
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
          // Verify we actually reached the People section (not redirected to Home)
          const pathSegment = p.split('/').filter(Boolean).pop(); // e.g. "humans", "lists"
          if (!isOnExpectedRoute(page, 'people') && !isOnExpectedRoute(page, 'audience')) {
            console.log(`  ⚠ Redirected away from ${p} — skipping ${subPage.name}`);
            continue;
          }
          // Wait for actual page content (not just any input/button)
          await waitForContent(page, [
            'table', '[class*="population" i]', '[class*="crm" i]',
            '[class*="humans" i]', '[class*="list" i]', '[class*="properties" i]',
          ], 8000);
          await waitForLoaders(page, 5000);
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
    // Contact profile: click the name link in the first row on humans page.
    for (const p of ['/people/humans', '/audience/community']) {
      const humansUrl = getWorkspaceUrl(p);
      if (!(await gotoWithRetry(page, humansUrl, { label: 'people-humans' }))) continue;

      // Verify we're on the humans page (not redirected to Home)
      if (!isOnExpectedRoute(page, 'people') && !isOnExpectedRoute(page, 'audience')) {
        console.log('  ⚠ Redirected away from humans page — skipping contact profile');
        continue;
      }

      // Wait for the table to load
      await waitForContent(page, ['table tbody tr'], 8000);

      // Click the NAME link in the first column, not the action menu button
      const clicked = await page.evaluate(() => {
        const row = document.querySelector('table tbody tr');
        if (!row) return false;
        // Target the first cell's link (the name link)
        const firstCell = row.querySelector('td:first-child');
        if (firstCell) {
          const nameLink = firstCell.querySelector('a');
          if (nameLink) {
            nameLink.click();
            return true;
          }
        }
        // Fallback: click the first <a> tag that looks like a profile link
        const links = Array.from(row.querySelectorAll('a'));
        const profileLink = links.find((a) => {
          const href = a.getAttribute('href') || '';
          return href.includes('profile') || href.includes('contact') || href.includes('human');
        });
        if (profileLink) {
          profileLink.click();
          return true;
        }
        // Last resort: click the row itself (may open profile or context menu)
        row.click();
        return true;
      });
      if (!clicked) continue;
      await delay(TIMING.postClickDelay);
      await waitForNetworkIdle(page);
      await waitForLoaders(page);

      // Verify we navigated to a profile page (not just opened a context menu)
      const hasProfileContent = await waitForContent(page, [
        '[class*="profile" i]',
        '[class*="contactDetail" i]',
        '[class*="humanDetail" i]',
        '[class*="basicInfo" i]',
      ], 5000);
      if (!hasProfileContent) {
        console.log('  ⚠ Click did not navigate to contact profile — may have opened context menu');
      }

      await takeScreenshot(page, '03a-contact-profile', 'people');
      break;
    }
  } catch (e) {
    console.log(`  Could not capture contact profile: ${e.message}`);
  }

  try {
    // Segment builder: switch to Segments view first, then open create segment.
    for (const p of ['/people/lists', '/audience/lists']) {
      const listsUrl = getWorkspaceUrl(p);
      if (!(await gotoWithRetry(page, listsUrl, { label: 'people-lists' }))) continue;

      // Verify we're on the right page
      if (!isOnExpectedRoute(page, 'people') && !isOnExpectedRoute(page, 'audience')) {
        console.log('  ⚠ Redirected away from lists page — skipping segment builder');
        continue;
      }

      // First, try to switch from "Lists" to "Segments" view using the dropdown/toggle
      const switchedToSegments =
        (await clickButtonByText(page, 'segments', 2500)) ||
        (await clickFirstVisible(page, [
          '[data-testid*="segment-tab"]',
          '[class*="segmentTab" i]',
          'button[aria-label*="segment" i]',
        ]));
      if (switchedToSegments) {
        await delay(TIMING.postClickDelay);
        await waitForLoaders(page);
      }

      // Now try to open the segment builder
      const opened =
        (await clickButtonByText(page, 'create segment', 2500)) ||
        (await clickButtonByText(page, 'new segment', 2500));

      if (!opened) {
        // If no segment-specific button found, the "New" button in segments view should work
        const newClicked = await clickButtonByText(page, 'new', 2500);
        if (!newClicked) continue;
      }

      await delay(TIMING.postClickDelay);
      await waitForNetworkIdle(page);
      await waitForLoaders(page);

      // Dismiss if we accidentally opened a "New List" dialog instead
      const isListDialog = await page.evaluate(() => {
        const dialogs = document.querySelectorAll('[role="dialog"], [class*="modal" i]');
        return Array.from(dialogs).some((el) => {
          const st = window.getComputedStyle(el);
          if (st.display === 'none' || st.visibility === 'hidden' || st.opacity === '0') return false;
          const text = (el.textContent || '').toLowerCase();
          return text.includes('list name') && !text.includes('segment');
        });
      }).catch(() => false);

      if (isListDialog) {
        console.log('  ⚠ Opened "New List" dialog instead of Segment Builder — dismissing');
        await dismissAnyModal(page);
        await delay(300);
        continue;
      }

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

      // Wait for campaign detail content to actually render (tab bar, title, etc.)
      await waitForContent(page, [
        '[class*="surveyTabs" i]',
        '[class*="campaignTabs" i]',
        '[class*="tabNavigation" i]',
        '[class*="questionEditor" i]',
        'nav[class*="tab" i]',
      ], 12000);
      await waitForLoaders(page, 8000);

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
                // Dismiss any lingering modal/dialog from a previous iteration
                await dismissAnyModal(page);
                await delay(200);

                // Re-open the add question dropdown for each type
                const reopened =
                  (await clickButtonByText(page, 'add question', 2000)) ||
                  (await clickFirstVisible(page, [
                    '[data-testid*="add-question"]',
                    '[class*="addQuestion" i]',
                  ]));
                if (!reopened) {
                  console.log(`  ⚠ Could not reopen Add Question dropdown for ${qt.label}`);
                  break;
                }
                await delay(TIMING.postClickDelay);

                // Click the specific question type WITHIN the dropdown/menu container only.
                // This prevents matching unrelated elements like "Add image or video" links.
                const dropdownSelectors = [
                  '[role="menu"]',
                  '[role="listbox"]',
                  '[class*="dropdown" i]',
                  '[class*="popover" i]',
                  '[class*="menuList" i]',
                  '[class*="questionType" i]',
                ];
                let typeClicked = await clickButtonByTextInContainer(page, qt.name, dropdownSelectors.join(', '), 2500);

                // Fallback: try matching menu items with a data-testid or role="menuitem"
                if (!typeClicked) {
                  typeClicked = await page.evaluate((needle) => {
                    const items = Array.from(document.querySelectorAll('[role="menuitem"], [role="option"]'));
                    const match = items.find((el) => {
                      const text = (el.textContent || '').trim().toLowerCase();
                      return text === needle || text.startsWith(needle);
                    });
                    if (!match) return false;
                    const st = window.getComputedStyle(match);
                    if (st.display === 'none' || st.visibility === 'hidden' || st.opacity === '0') return false;
                    match.click();
                    return true;
                  }, qt.name.toLowerCase());
                }

                if (typeClicked) {
                  await delay(TIMING.postClickDelay);
                  await waitForNetworkIdle(page);
                  await waitForLoaders(page);

                  // Verify we didn't accidentally open a modal (like "Add Image")
                  const accidentalModal = await page.evaluate(() => {
                    const modals = document.querySelectorAll('[role="dialog"], [class*="modal" i]');
                    return Array.from(modals).some((el) => {
                      const st = window.getComputedStyle(el);
                      if (st.display === 'none' || st.visibility === 'hidden' || st.opacity === '0') return false;
                      const text = (el.textContent || '').toLowerCase();
                      return text.includes('add image') || text.includes('upload an image');
                    });
                  }).catch(() => false);

                  if (accidentalModal) {
                    console.log(`  ⚠ Accidental modal opened for ${qt.label} — dismissing`);
                    await dismissAnyModal(page);
                    await delay(200);
                    continue;
                  }

                  await takeScreenshot(page, qt.shot, 'campaigns');
                  console.log(`  ✓ Captured question type: ${qt.label}`);
                } else {
                  console.log(`  ⚠ Could not click question type: ${qt.label}`);
                  // Close dropdown for next attempt
                  await page.keyboard.press('Escape').catch(() => {});
                  await delay(200);
                }
              } catch (e) {
                console.log(`  Could not capture question type ${qt.label}: ${e.message}`);
                await dismissAnyModal(page);
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
        // Wait for the table structure first
        await waitForContent(page, [
          '[class*="resultsTable" i]',
          '[class*="analyze" i]',
          'table',
        ], 8000);
        // Then wait longer for actual data rows to populate
        await waitForContent(page, [
          'table tbody tr',
          '[class*="tableRow" i]',
          '[class*="dataRow" i]',
        ], 15000);
        await waitForLoaders(page, 8000);
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
        if (subPage.path === '/campaigns/magic-reels') {
          await waitForContent(page, [
            'input[placeholder*="search reels" i]',
            'button',
            'table tbody tr',
            '[class*="reel" i]',
          ], 10000);
        }
        await takeScreenshot(page, subPage.name, 'campaigns');

        if (subPage.path === '/campaigns/magic-reels' && CONFIG.magicReelId) {
          const reelEditorUrl = getWorkspaceUrl(`/reel/${CONFIG.magicReelId}`);
          const openedReelEditor = await gotoWithRetry(page, reelEditorUrl, { label: 'campaigns-magic-reel-editor', retries: 1 });
          if (openedReelEditor) {
            await waitForBodyTextAny(
              page,
              ['save & publish', 'add video', 'reel duration', 'published'],
              15000
            );
            await waitForLoaders(page, 10000);
            await delay(600);
            await takeScreenshot(page, '05a-magic-reel-editor', 'campaigns');
          } else {
            console.log(`  ⚠ Could not open reel editor route for reel ${CONFIG.magicReelId}`);
          }
        }
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
      // Wait for dataset cards to re-appear on All Datasets tab
      await waitForContent(page, [
        '[data-testid="dataset-card"]',
        '[class*="datasetCard"]',
        '[class*="trainingSet"]',
      ], 5000);

      // Click a dataset card to open detail view — PREFER "Demo-Dataset" by name, then any with files
      // Dataset cards are <div> elements with onClick handlers (not <a> tags)
      const datasetClicked = await page.evaluate(() => {
        const cardSelectors = ['[data-testid="dataset-card"]', '[class*="datasetCard"]', '[class*="trainingSet"]'];
        let allCards = [];
        for (const sel of cardSelectors) {
          allCards = Array.from(document.querySelectorAll(sel));
          if (allCards.length) break;
        }
        if (!allCards.length) return false;

        // First priority: find "Demo-Dataset" by name
        const demoDatasetCard = allCards.find((card) => {
          const text = (card.textContent || '');
          return text.includes('Demo-Dataset') || text.includes('Demo Dataset');
        });

        // Second priority: prefer a card that shows a non-zero file count
        const cardWithFiles = allCards.find((card) => {
          const text = (card.textContent || '');
          const countMatch = text.match(/(\d+)\s*(file|document|item)/i);
          return countMatch && parseInt(countMatch[1], 10) > 0;
        });

        // Also try to avoid QA automation datasets by checking the name
        const nonQaCard = allCards.find((card) => {
          const text = (card.textContent || '').toLowerCase();
          return !text.includes('qa-auto') && !text.includes('qa automation');
        });

        const target = demoDatasetCard || cardWithFiles || nonQaCard || allCards[0];
        target.click();
        return true;
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

  // Try to open a workflow detail (Build tab) by clicking a workflow card
  // Workflow cards are <div> elements with onClick handlers (not <a> tags)
  let workflowDetailCaptured = false;
  try {
    const cardClicked = await page.evaluate(() => {
      const card = document.querySelector('[data-testid="workflow-card"]');
      if (card) {
        card.click();
        return true;
      }
      // Fallback: click any element with workflow card class
      const classCards = document.querySelectorAll('[class*="workflowCard"], [class*="orchestration"]');
      for (const c of classCards) {
        c.click();
        return true;
      }
      return false;
    });

    if (cardClicked) {
      console.log('  Clicked workflow card, waiting for detail page...');
      await delay(TIMING.postClickDelay);
      await waitForNetworkIdle(page);
      await waitForLoaders(page);

      // Wait for the ReactFlow canvas or builder content (Build tab)
      const hasCanvas = await waitForContent(page, [
        '[class*="reactFlow" i]',
        '[class*="react-flow" i]',
        '[class*="canvas" i]',
        '[class*="builder" i]',
        '[class*="topBar" i]',
      ], 8000);

      if (hasCanvas) {
        await takeScreenshot(page, '06-workflow-build-tab', 'workflows');
        workflowDetailCaptured = true;

        // Try to capture a node being edited (may require double-click)
        try {
          // First try a single click on a node
          const nodeEl = await page.$('[class*="agentTaskNode" i], [class*="react-flow__node" i], [data-testid*="node"]');
          if (nodeEl) {
            // Try double-click to open the editor (some UIs require it)
            await nodeEl.click({ clickCount: 2 });
            await delay(TIMING.postClickDelay * 2);
            await waitForNetworkIdle(page);
            await waitForLoaders(page);

            // Wait for an editor panel/drawer/sidebar to appear
            const hasEditorPanel = await waitForContent(page, [
              '[class*="nodeEditor" i]',
              '[class*="sidePanel" i]',
              '[class*="taskEditor" i]',
              '[class*="drawer" i][class*="open" i]',
              '[class*="nodeDetail" i]',
            ], 5000);

            if (!hasEditorPanel) {
              // Fallback: try single click (some UIs use single click for selection)
              await nodeEl.click();
              await delay(TIMING.postClickDelay);
              await waitForLoaders(page);
            }

            await takeScreenshot(page, '07-workflow-node-editor', 'workflows');
          }
        } catch (e) {
          console.log('  Could not capture node editor');
        }

        // Click the "View" tab to show completed workflow results
        try {
          const viewClicked =
            (await clickFirstVisible(page, ['[data-testid="workflow-view-tab-button"]'], 3000)) ||
            (await clickButtonByText(page, 'View', 3000));
          if (viewClicked) {
            await delay(TIMING.postClickDelay);
            await waitForNetworkIdle(page);
            await waitForLoaders(page);
            await takeScreenshot(page, '06a-workflow-view-tab', 'workflows');
          } else {
            console.log('  View tab not clickable (workflow may not have completed runs)');
          }
        } catch (e) {
          console.log(`  Could not capture View tab: ${e.message}`);
        }
      } else {
        console.log('  Workflow detail loaded but no canvas/builder found');
        await takeScreenshot(page, '06-workflow-build-tab', 'workflows');
        workflowDetailCaptured = true;
      }
    } else {
      console.log('  No workflow cards found on main page');
    }
  } catch (e) {
    console.log(`  Could not capture workflow detail: ${e.message}`);
  }

  // Workflow Create dialog (from gallery) — captures the creation modal.
  // The actual canvas is captured via 06-workflow-build-tab when clicking an existing card.
  try {
    const mainLoaded = await gotoWithRetry(page, workflowUrl, { label: 'workflow-for-create-dialog' });
    if (mainLoaded) {
      await waitForContent(page, [
        '[data-testid="workflow-card"]', '[class*="workflowCard"]',
        '[class*="flow"]', 'button',
      ], 5000);
      const opened =
        (await clickButtonByText(page, 'create workflow', 3000)) ||
        (await clickButtonByText(page, 'create flow', 3000)) ||
        (await clickButtonByText(page, 'new flow', 3000)) ||
        (await clickButtonByText(page, 'create', 3000));
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
    console.log(`  Could not capture workflow create dialog: ${e.message}`);
  }

  // Sub-pages - navigate via tab clicks from the main workflow page for reliability.
  // Direct URL navigation can redirect to Home if the route isn't recognized.
  const subPages = [
    { path: '/workflow/upcoming', tabText: 'upcoming', name: '03-upcoming-runs' },
    { path: '/workflow/templates', tabText: 'templates', name: '04-workflow-templates' },
    { path: '/workflow/conversations', tabText: 'conversations', name: '05-workflow-conversations' }
  ];

  for (const subPage of subPages) {
    try {
      // First try: navigate to main workflow page and click the tab
      const mainWorkflowLoaded = await gotoWithRetry(page, workflowUrl, { label: `workflow-nav-${subPage.name}` });
      if (!mainWorkflowLoaded) continue;

      await waitForContent(page, [
        '[data-testid="workflow-card"]', '[class*="workflowCard"]',
        '[class*="flow"]', '[class*="orchestration"]',
      ], 5000);

      // Click the appropriate tab
      const tabClicked = await clickButtonByText(page, subPage.tabText, 3000);
      if (tabClicked) {
        await delay(TIMING.postClickDelay);
        await waitForNetworkIdle(page);
        await waitForLoaders(page);

        // Verify we're still in the workflow section
        if (isOnExpectedRoute(page, 'workflow')) {
          // Wait for sub-page specific content
          await waitForContent(page, [
            'table', '[class*="card" i]', '[class*="template" i]',
            '[class*="conversation" i]', '[class*="upcoming" i]',
            '[class*="empty" i]', '[class*="noData" i]',
          ], 8000);
          await takeScreenshot(page, subPage.name, 'workflows');
        } else {
          console.log(`  ⚠ Tab click for ${subPage.name} redirected away from workflow section`);
        }
      } else {
        // Fallback: try direct URL navigation
        const subUrl = getWorkspaceUrl(subPage.path);
        if (await gotoWithRetry(page, subUrl, { label: `workflow-${subPage.name}` })) {
          if (isOnExpectedRoute(page, 'workflow')) {
            await waitForContent(page, ['table', '[class*="card" i]', 'button'], 8000);
            await takeScreenshot(page, subPage.name, 'workflows');
          } else {
            console.log(`  ⚠ Direct navigation to ${subPage.path} redirected — skipping ${subPage.name}`);
          }
        }
      }
    } catch (e) {
      console.log(`  Could not capture ${subPage.name}: ${e.message}`);
    }
  }

  // Try to capture run history/detail from the conversations page.
  // We scope clicks to the MAIN content area to avoid clicking sidebar conversations.
  try {
    // Navigate to workflow conversations via tab click (more reliable than direct URL)
    const mainLoaded = await gotoWithRetry(page, workflowUrl, { label: 'workflow-for-run-detail' });
    if (mainLoaded) {
      await waitForContent(page, [
        '[data-testid="workflow-card"]', '[class*="workflowCard"]',
        '[class*="flow"]', '[class*="orchestration"]',
      ], 5000);
      const tabClicked = await clickButtonByText(page, 'conversations', 3000);
      if (tabClicked) {
        await delay(TIMING.postClickDelay);
        await waitForNetworkIdle(page);
        await waitForLoaders(page);
      }

      if (isOnExpectedRoute(page, 'workflow')) {
        // Wait for conversation items in the main content area
        await waitForContent(page, [
          'table tbody tr',
          '[class*="conversationItem" i]',
          '[class*="runItem" i]',
        ], 8000);

        // Click a conversation item ONLY in the main content area (not sidebar)
        const runClicked = await page.evaluate(() => {
          // Target the main content area (exclude sidebar/nav)
          const main = document.querySelector('main, [role="main"], [class*="mainContent" i], [class*="page-content" i]');
          const container = main || document.body;

          // Try table rows first
          const row = container.querySelector('table tbody tr');
          if (row) {
            const link = row.querySelector('a');
            if (link) { link.click(); return true; }
            row.click();
            return true;
          }

          // Try conversation/run item cards
          const items = container.querySelectorAll('[class*="conversationItem" i], [class*="runItem" i]');
          for (const item of items) {
            const st = window.getComputedStyle(item);
            if (st.display === 'none' || st.visibility === 'hidden') continue;
            item.click();
            return true;
          }

          return false;
        });

        if (runClicked) {
          await delay(TIMING.postClickDelay);
          await waitForNetworkIdle(page);
          await waitForLoaders(page);

          // Verify we're on a workflow detail page, not a general chat
          if (isOnExpectedRoute(page, 'workflow')) {
            await takeScreenshot(page, '08-workflow-run-detail', 'workflows');
          } else {
            console.log('  ⚠ Run click navigated outside workflow section — skipping run detail');
          }
        }
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

  // Billing/Plan info is already visible in General Settings (01-general-settings.png)
  // so we no longer capture a separate duplicate screenshot for it.

  return true;
}

async function captureForecast(page) {
  console.log('\n Capturing Forecast...');

  const forecastUrl = getWorkspaceUrl('/forecast');
  if (!(await gotoWithRetry(page, forecastUrl, { label: 'forecast' }))) {
    console.log('  ⚠ Forecast route is unavailable for this workspace. Skipping forecast capture.');
    return true;
  }

  // Check if we were redirected (feature flag off)
  const currentUrl = page.url();
  if (!currentUrl.includes('forecast')) {
    console.log('  ⚠ Forecast appears to be feature-flagged off (redirected). Skipping.');
    return true; // Not a failure, just gated
  }

  const hasForecastContent = await waitForContent(page, [
    '[class*="forecast" i]',
    '[class*="chart" i]',
    'canvas',
    'table',
  ]);
  if (!hasForecastContent) {
    console.log('  ⚠ Forecast page loaded without expected content. Skipping forecast capture.');
    return true;
  }

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
  const dirs = ['home', 'agents', 'people', 'campaigns', 'datasets', 'workflows', 'settings', 'forecast', 'rewards', 'integrations'];
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
      } else if (CONFIG.workspaceIdOverride) {
        workspaceId = CONFIG.workspaceIdOverride;
        console.log(`  ✓ Using configured workspace ID: ${workspaceId}`);
      } else if (CONFIG.fallbackWorkspaceId) {
        workspaceId = CONFIG.fallbackWorkspaceId;
        console.log(`  ✓ Using fallback workspace ID: ${workspaceId}`);
      } else {
        throw new Error('Could not determine workspace ID. Set VURVEY_WORKSPACE_ID env var as fallback.');
      }
    }

    if (CONFIG.workspaceIdOverride && workspaceId !== CONFIG.workspaceIdOverride) {
      workspaceId = CONFIG.workspaceIdOverride;
      console.log(`  ✓ Enforcing configured workspace ID: ${workspaceId}`);
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
      ["forecast", captureForecast],
      ["rewards", captureRewards],
      ["integrations", captureIntegrations],
    ];

    const selectedCaptures = CONFIG.captureOnly.length
      ? allCaptures.filter(([name]) => CONFIG.captureOnly.includes(name))
      : allCaptures;

    if (!selectedCaptures.length) {
      throw new Error(
        `No matching capture sections for CAPTURE_ONLY=${process.env.CAPTURE_ONLY}`
      );
    }

    /** @type {{name: string, ok: boolean}[]} */
    let captureResults;

    if (CONFIG.parallel <= 1) {
      // Sequential fallback – single worker processes everything.
      captureResults = await runWorker(browser, selectedCaptures, 'worker-1');
    } else {
      // Distribute captures across workers. Groups are load-balanced so the
      // heaviest sections (people, agents) each get their own worker.
      const workerGroups = distributeCaptures(selectedCaptures, CONFIG.parallel);

      console.log(`\n  Distributing ${selectedCaptures.length} sections across ${workerGroups.length} workers...`);
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
