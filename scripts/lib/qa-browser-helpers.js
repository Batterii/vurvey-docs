/**
 * Shared browser helpers for Vurvey QA scripts.
 *
 * Provides reusable login, navigation, and DOM-query utilities
 * consumed by both qa-test-suite.js and qa-doc-validator.js.
 */

/**
 * Small delay helper.
 * @param {number} ms
 */
export async function wait(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

/**
 * Wait until in-flight network requests settle.
 * @param {import("puppeteer").Page} page
 * @param {number} timeout
 */
export async function waitForNetworkIdle(page, timeout = 7000) {
  try {
    await page.waitForNetworkIdle({idleTime: 1000, timeout});
  } catch {
    // ok – SPA websockets keep connections alive
  }
}

/**
 * Wait for all visible loading indicators to disappear.
 * @param {import("puppeteer").Page} page
 * @param {number} timeout
 */
export async function waitForLoadersGone(page, timeout = 12000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const hasLoaders = await page.evaluate(() => {
      const sel = [
        '[class*="loading" i]',
        '[class*="spinner" i]',
        '[class*="skeleton" i]',
        '[data-testid*="loading" i]',
        '[data-testid*="skeleton" i]',
        '[aria-busy="true"]',
      ];
      for (const s of sel) {
        const els = document.querySelectorAll(s);
        for (const el of els) {
          const st = window.getComputedStyle(el);
          if (st.display !== "none" && st.visibility !== "hidden" && st.opacity !== "0") return true;
        }
      }
      return false;
    });
    if (!hasLoaders) {
      await wait(600);
      return;
    }
    await wait(400);
  }
}

/**
 * Check if the page looks like the user has been logged out.
 * @param {import("puppeteer").Page} page
 * @returns {Promise<boolean>}
 */
export async function looksLikeLoggedOut(page) {
  try {
    return await page.evaluate(() => {
      const email = document.querySelector('input[type="email"], input[name="email"]');
      if (!email) return false;
      const st = window.getComputedStyle(email);
      if (st.display === "none" || st.visibility === "hidden" || st.opacity === "0") return false;
      return true;
    });
  } catch {
    return false;
  }
}

/**
 * Return a global-error message if the page is showing one, else null.
 * @param {import("puppeteer").Page} page
 * @returns {Promise<string|null>}
 */
export async function getGlobalErrorText(page) {
  try {
    return await page.evaluate(() => {
      const text = (document.body?.innerText || "").trim();
      if (!text) return null;
      const lower = text.toLowerCase();
      if (lower.includes("failed to fetch")) return "Failed to fetch";
      if (lower.includes("an error occurred")) return "An error occurred";
      if (lower.includes("something went wrong")) return "Something went wrong";
      return null;
    });
  } catch {
    return null;
  }
}

/**
 * Wait for a CSS selector to become visible.
 * @param {import("puppeteer").Page} page
 * @param {string} selector
 * @param {number} timeout
 * @returns {Promise<boolean>}
 */
export async function elementExists(page, selector, timeout = 4000) {
  try {
    await page.waitForSelector(selector, {timeout, visible: true});
    return true;
  } catch {
    return false;
  }
}

/**
 * Check whether the visible body text includes a needle (case-insensitive).
 * @param {import("puppeteer").Page} page
 * @param {string} needle
 * @returns {Promise<boolean>}
 */
export async function pageTextIncludes(page, needle) {
  const n = String(needle).toLowerCase();
  try {
    return await page.evaluate((n) => (document.body?.innerText || "").toLowerCase().includes(n), n);
  } catch {
    return false;
  }
}

/**
 * Navigate to a workspace-scoped route with retry logic.
 * @param {import("puppeteer").Page} page
 * @param {string} workspaceId
 * @param {string} route - e.g. "/agents"
 * @param {object} opts
 * @param {string} opts.baseUrl
 * @param {number} [opts.retries]
 * @param {number} [opts.timeoutMs]
 * @returns {Promise<{ok: boolean, url: string, error: string|null}>}
 */
export async function gotoWorkspaceRoute(page, workspaceId, route, {baseUrl, retries = 3, timeoutMs = 30000} = {}) {
  const url = `${baseUrl}/${workspaceId}${route}`;
  const maxAttempts = Math.max(1, retries + 1);
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await page.goto(url, {waitUntil: "domcontentloaded", timeout: timeoutMs});
      await waitForNetworkIdle(page, 12000);
      await waitForLoadersGone(page, 15000);
    } catch (e) {
      lastError = `Navigation error: ${e?.message || String(e)}`;
      if (attempt < maxAttempts) {
        await wait(800 * attempt);
        continue;
      }
      return {ok: false, url: page.url(), error: lastError};
    }

    if (await looksLikeLoggedOut(page)) {
      return {ok: false, url: page.url(), error: "Session appears logged out"};
    }

    const globalErr = await getGlobalErrorText(page);
    if (!globalErr) return {ok: true, url: page.url(), error: null};

    lastError = globalErr;
    if (attempt < maxAttempts) {
      await wait(800 * attempt);
      continue;
    }
  }

  return {ok: false, url: page.url(), error: lastError || "Unknown route load error"};
}

/**
 * Perform login flow against the Vurvey staging app.
 * Returns the resolved workspace ID or throws.
 *
 * @param {import("puppeteer").Page} page
 * @param {object} config
 * @param {string} config.baseUrl
 * @param {string} config.email
 * @param {string} config.password
 * @param {string|null} [config.fallbackWorkspaceId]
 * @param {number} [config.timeoutMs]
 * @returns {Promise<string>} workspaceId
 */
export async function login(page, config) {
  const {baseUrl, email, password, fallbackWorkspaceId = null, timeoutMs = 30000} = config;

  await page.goto(baseUrl, {waitUntil: "domcontentloaded", timeout: timeoutMs});
  await wait(1500);
  await waitForNetworkIdle(page, 12000);
  await waitForLoadersGone(page, 12000);

  // Click "sign in with email" (social login splash).
  await clickByTextHelper(page, "sign in with email", 6000);
  await wait(700);

  // Fill email.
  const emailSelectors = [
    'input[type="email"]',
    'input[name="email"]',
    'input[placeholder*="email" i]',
    'input:not([type="password"]):not([type="hidden"])',
  ];
  const emailSel = await typeIntoFirst(page, emailSelectors, email);
  if (!emailSel) throw new Error("Could not find email input");

  await submitFormForSelector(page, emailSel);
  await clickByTextHelper(page, "next", 1500);
  await clickByTextHelper(page, "continue", 1500);
  await wait(800);

  await page.waitForSelector('input[type="password"], input[name="password"]', {visible: true, timeout: 15000});

  const passSelectors = ['input[type="password"]', 'input[name="password"]', 'input[placeholder*="password" i]'];
  const passSel = await typeIntoFirst(page, passSelectors, password);
  if (!passSel) throw new Error("Could not find password input");

  await submitFormForSelector(page, passSel);
  await clickByTextHelper(page, "log in", 1500);
  await clickByTextHelper(page, "login", 1500);
  await clickByTextHelper(page, "sign in", 1500);

  await wait(1500);
  await page.waitForFunction(() => /\/[a-f0-9-]{36}\b/i.test(window.location.pathname), {timeout: 60000}).catch(() => {});
  await waitForNetworkIdle(page, 15000);
  await waitForLoadersGone(page, 15000);

  // Resolve workspace ID.
  const extractUuid = (url) => {
    const m = String(url || "").match(/\/([a-f0-9-]{36})\b/i);
    return m ? m[1] : null;
  };

  let workspaceId = extractUuid(page.url());
  if (!workspaceId) {
    workspaceId = await page.evaluate(() => {
      const m = window.location.pathname.match(/^\/([a-f0-9-]{36})/i);
      return m ? m[1] : null;
    });
  }

  if (!workspaceId && fallbackWorkspaceId) {
    workspaceId = fallbackWorkspaceId;
  }

  if (!workspaceId) {
    throw new Error(`Could not extract workspace ID from URL: ${page.url()}`);
  }

  return workspaceId;
}

// ---- internal helpers ----

async function clickByTextHelper(page, text, timeout = 8000) {
  const start = Date.now();
  const norm = String(text).trim().toLowerCase();
  while (Date.now() - start < timeout) {
    const clicked = await page.evaluate(
      ({norm}) => {
        const els = Array.from(document.querySelectorAll('button, a, [role="button"], [role="menuitem"], [role="tab"]'));
        const el = els.find((e) => {
          const t = (e.textContent || "").trim().toLowerCase();
          if (!t.includes(norm)) return false;
          const st = window.getComputedStyle(e);
          if (st.display === "none" || st.visibility === "hidden" || st.opacity === "0") return false;
          const r = e.getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        });
        if (!el) return false;
        el.click();
        return true;
      },
      {norm},
    );
    if (clicked) return true;
    await wait(250);
  }
  return false;
}

async function typeIntoFirst(page, selectors, text) {
  for (const sel of selectors) {
    try {
      const el = await page.$(sel);
      if (!el) continue;
      await el.click({clickCount: 3});
      await wait(100);
      await page.type(sel, text, {delay: 20});
      return sel;
    } catch {
      // try next
    }
  }
  return null;
}

async function submitFormForSelector(page, inputSelector) {
  return await page.evaluate((sel) => {
    const input = document.querySelector(sel);
    if (!input) return false;
    const form = input.closest("form");
    if (!form) return false;
    const submitBtn = form.querySelector('button[type="submit"]') || form.querySelector('input[type="submit"]');
    if (submitBtn) {
      submitBtn.click();
      return true;
    }
    if (typeof form.requestSubmit === "function") {
      form.requestSubmit();
      return true;
    }
    form.dispatchEvent(new Event("submit", {bubbles: true, cancelable: true}));
    return true;
  }, inputSelector);
}
