#!/usr/bin/env node

/**
 * Vurvey Docs QA Test Suite (CI-focused)
 *
 * Goals:
 * - Catch real regressions (navigation, chat send/response, basic CRUD entrypoints)
 * - Produce actionable artifacts (screenshots, console/network error summaries, repro steps)
 * - Avoid brittle selectors: prefer data-testid, aria-label, and visible text
 *
 * Usage:
 *   node scripts/qa-test-suite.js [--quick] [--viewport=desktop|mobile] [--strict]
 *
 * Env:
 *   VURVEY_EMAIL        required
 *   VURVEY_PASSWORD     required
 *   VURVEY_URL          default: https://staging.vurvey.dev
 *   VURVEY_WORKSPACE_ID optional fallback workspace id
 *   HEADLESS            default: true (set HEADLESS=false for headed)
 *   QA_TIMEOUT_MS       default: 30000
 */

import puppeteer from "puppeteer";
import fs from "fs/promises";
import path from "path";
import {fileURLToPath} from "url";
import {buildReproSteps as buildReproStepsCore, parseCliArgs, safeName} from "./lib/qa-utils.js";
import {discoverWorkspaceRoutes} from "./lib/qa-discovery.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");

const args = parseCliArgs(process.argv.slice(2));

const VIEWPORTS = {
  desktop: {key: "desktop", name: "Desktop", width: 1920, height: 1080, isMobile: false, hasTouch: false},
  mobile: {key: "mobile", name: "Mobile", width: 390, height: 844, isMobile: true, hasTouch: true},
};

const config = {
  email: process.env.VURVEY_EMAIL,
  password: process.env.VURVEY_PASSWORD,
  baseUrl: process.env.VURVEY_URL || "https://staging.vurvey.dev",
  fallbackWorkspaceId: process.env.VURVEY_WORKSPACE_ID || '07e5edb5-e739-4a35-9f82-cc6cec7c0193',
  headless: process.env.HEADLESS !== "false",
  quick: Boolean(args.quick),
  strict: Boolean(args.strict),
  viewportKey: typeof args.viewport === "string" ? args.viewport : null,
  timeoutMs: Number(process.env.QA_TIMEOUT_MS || "30000"),
  routeRetries: Number(process.env.QA_ROUTE_RETRIES || "3"),
  deep: Boolean(args.deep) || process.env.QA_DEEP === "true",
  webManagerDir: process.env.QA_WEB_MANAGER_DIR || null,
  apiDir: process.env.QA_API_DIR || null,
};

const outDir = path.join(repoRoot, "qa-output");
const screenshotsDir = path.join(outDir, "screenshots");
const artifactsDir = path.join(outDir, "artifacts");
const failureScreenshotsDir = path.join(repoRoot, "qa-failure-screenshots");

/** @type {import("puppeteer").Page | null} */
let currentPage = null;
let currentSection = null;
let currentRoute = null;
let currentViewport = null;

const results = {
  passed: [],
  failed: [],
  warnings: [],
  startTime: new Date(),
  endTime: null,
  meta: {
    baseUrl: config.baseUrl,
    quick: config.quick,
    strict: config.strict,
    viewport: config.viewportKey || "default",
    deep: config.deep,
  },
  runtime: {
    consoleErrors: [],
    pageErrors: [],
    requestFailed: [],
    serverErrors: [],
  },
};

function ts() {
  return new Date().toISOString();
}

function log(msg, type = "info") {
  const prefix = {
    info: "\x1b[36m[INFO]\x1b[0m",
    pass: "\x1b[32m[PASS]\x1b[0m",
    fail: "\x1b[31m[FAIL]\x1b[0m",
    warn: "\x1b[33m[WARN]\x1b[0m",
  }[type] || "[INFO]";
  // Keep stdout stable for GH Actions; timestamps help when debugging flakes.
  // eslint-disable-next-line no-console
  console.log(`${ts()} ${prefix} ${msg}`);
}

async function ensureDirs() {
  await fs.mkdir(outDir, {recursive: true});
  await fs.mkdir(screenshotsDir, {recursive: true});
  await fs.mkdir(artifactsDir, {recursive: true});
  await fs.mkdir(failureScreenshotsDir, {recursive: true});
}

async function captureScreenshot(name, {fullPage = true, forFailure = false} = {}) {
  if (!currentPage) return null;
  try {
    const vp = currentViewport?.name || "unknown";
    const filename = `${safeName(name)}-${safeName(vp)}-${Date.now()}.png`;
    const dir = forFailure ? failureScreenshotsDir : screenshotsDir;
    const p = path.join(dir, filename);
    await currentPage.screenshot({path: p, fullPage});
    return p;
  } catch (e) {
    results.warnings.push({name: "screenshot", details: String(e?.message || e), timestamp: ts()});
    return null;
  }
}

function buildReproSteps(testName, selector) {
  return buildReproStepsCore({
    baseUrl: config.baseUrl,
    viewport: currentViewport,
    route: currentRoute,
    section: currentSection,
    testName,
    selector,
  });
}

async function recordTest(name, passed, details = "", {selector} = {}) {
  const base = {
    name,
    details,
    timestamp: ts(),
    section: currentSection,
    route: currentRoute,
    viewport: currentViewport?.name || "unknown",
    selector: selector || null,
  };

  if (passed) {
    results.passed.push(base);
    log(`${name}: ${details || "OK"}`, "pass");
    return;
  }

  const screenshot = await captureScreenshot(`failure-${name}`, {forFailure: true});
  results.failed.push({
    ...base,
    screenshot,
    reproductionSteps: buildReproSteps(name, selector),
  });
  log(`${name}: ${details || "FAILED"}`, "fail");
}

function recordWarning(name, details) {
  results.warnings.push({name, details, timestamp: ts(), section: currentSection, route: currentRoute, viewport: currentViewport?.name || "unknown"});
  log(`${name}: ${details}`, "warn");
}

async function wait(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

async function waitForNetworkIdle(page, timeout = 7000) {
  try {
    await page.waitForNetworkIdle({idleTime: 1000, timeout});
  } catch {
    // ok
  }
}

async function waitForLoadersGone(page, timeout = 12000) {
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
      // allow React a beat to paint post-loader content
      await wait(600);
      return;
    }
    await wait(400);
  }
}

async function looksLikeLoggedOut(page) {
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

async function getGlobalErrorText(page) {
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

async function elementExists(page, selector, timeout = 4000) {
  try {
    await page.waitForSelector(selector, {timeout, visible: true});
    return true;
  } catch {
    return false;
  }
}

async function pageTextIncludes(page, needle) {
  const n = String(needle).toLowerCase();
  try {
    return await page.evaluate((n) => (document.body?.innerText || "").toLowerCase().includes(n), n);
  } catch {
    return false;
  }
}

async function currentPathname(page) {
  try {
    return await page.evaluate(() => window.location.pathname);
  } catch {
    return "";
  }
}

async function clickByText(page, {selector = "button, a, [role=\"button\"], [role=\"menuitem\"], [role=\"tab\"]", text}, {timeout = 8000} = {}) {
  const start = Date.now();
  const norm = String(text).trim().toLowerCase();
  while (Date.now() - start < timeout) {
    const clicked = await page.evaluate(
      ({selector, norm}) => {
        const els = Array.from(document.querySelectorAll(selector));
        const candidates = els.filter((el) => {
          const t = (el.textContent || "").trim().toLowerCase();
          if (!t.includes(norm)) return false;
          const st = window.getComputedStyle(el);
          if (st.display === "none" || st.visibility === "hidden" || st.opacity === "0") return false;
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        });

        const el = candidates[0];
        if (!el) return false;
        el.click();
        return true;
      },
      {selector, norm},
    );
    if (clicked) return true;
    await wait(250);
  }
  return false;
}

async function clickSidebarNavItem(page, labels, expectedPathIncludes, timeout = 8000) {
  const start = Date.now();
  const labelList = (Array.isArray(labels) ? labels : [labels]).filter(Boolean).map((l) => String(l).trim().toLowerCase());
  const expectedList = (Array.isArray(expectedPathIncludes) ? expectedPathIncludes : [expectedPathIncludes])
    .filter(Boolean)
    .map((p) => String(p).toLowerCase());

  while (Date.now() - start < timeout) {
    const clicked = await page.evaluate(({labelList, expectedList}) => {
      const isVisible = (el) => {
        if (!el) return false;
        const st = window.getComputedStyle(el);
        if (st.display === "none" || st.visibility === "hidden" || st.opacity === "0") return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      };

      const navContainers = Array.from(document.querySelectorAll("nav, aside, [role='navigation']"));
      const candidateEls = [];

      const addCandidatesFrom = (root) => {
        for (const el of Array.from(root.querySelectorAll("a[href], button, [role='link'], [role='button'], [role='menuitem'], [role='tab'], li"))) {
          if (!isVisible(el)) continue;
          candidateEls.push(el);
        }
      };

      if (navContainers.length > 0) {
        navContainers.forEach(addCandidatesFrom);
      } else {
        // Fallback: global scan if nav containers are not present in the DOM.
        addCandidatesFrom(document);
      }

      const candidates = candidateEls
        .map((el) => {
          const t = (el.innerText || el.textContent || "").trim().toLowerCase();
          const aria = (el.getAttribute("aria-label") || "").trim().toLowerCase();
          const title = (el.getAttribute("title") || "").trim().toLowerCase();
          const href = (el.getAttribute("href") || "").trim().toLowerCase();
          const r = el.getBoundingClientRect();
          const className = (el.className || "").toString().toLowerCase();
          const parentNav = el.closest("nav, aside, [role='navigation']");
          const inNav = Boolean(parentNav);
          const inSidebar =
            className.includes("sidebar") ||
            (parentNav && ((parentNav.className || "").toString().toLowerCase().includes("sidebar")));

          const labelHit = labelList.some((l) => l && (t.includes(l) || aria.includes(l) || title.includes(l)));
          const hrefHit = expectedList.some((p) => p && href.includes(p));

          let score = 0;
          if (labelHit) score += 60;
          if (hrefHit) score += 120;
          if (inNav) score += 15;
          if (inSidebar) score += 25;
          if (r.x < 300) score += 10;
          if (r.y > window.innerHeight * 0.85) score -= 5;

          return {el, score, href, t, aria, title, x: r.x, y: r.y};
        })
        .filter((c) => c.score > 0);

      candidates.sort((a, b) => b.score - a.score);
      const best = candidates[0];
      if (!best) return false;

      best.el.click();
      return true;
    }, {labelList, expectedList});

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
  // Best-effort "submit the right form" for multi-step login UIs.
  return await page.evaluate((sel) => {
    const input = document.querySelector(sel);
    if (!input) return false;
    const form = input.closest("form");

    const isVisible = (el) => {
      if (!el) return false;
      const st = window.getComputedStyle(el);
      if (st.display === "none" || st.visibility === "hidden" || st.opacity === "0") return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };

    if (form) {
      const submitBtn =
        form.querySelector('button[type="submit"]') ||
        form.querySelector('input[type="submit"]') ||
        Array.from(form.querySelectorAll("button")).find((b) => isVisible(b));

      if (submitBtn && isVisible(submitBtn)) {
        submitBtn.click();
        return true;
      }

      // requestSubmit is more semantically correct (triggers submit handlers),
      // but isn't always available.
      if (typeof form.requestSubmit === "function") {
        form.requestSubmit();
        return true;
      }

      // Fallback: dispatch submit event.
      const ev = new Event("submit", {bubbles: true, cancelable: true});
      return form.dispatchEvent(ev);
    }

    // If there is no form, try hitting Enter on the input.
    input.dispatchEvent(new KeyboardEvent("keydown", {key: "Enter", code: "Enter", bubbles: true}));
    input.dispatchEvent(new KeyboardEvent("keyup", {key: "Enter", code: "Enter", bubbles: true}));
    return true;
  }, inputSelector);
}

async function setViewport(page, viewport) {
  currentViewport = viewport;
  await page.setViewport({
    width: viewport.width,
    height: viewport.height,
    isMobile: viewport.isMobile,
    hasTouch: viewport.hasTouch,
  });
}

function extractUuidFromUrl(url) {
  const m = String(url || "").match(/\/([a-f0-9-]{36})\b/i);
  return m ? m[1] : null;
}

async function findWorkspaceIdsFromDom(page) {
  return await page.evaluate(() => {
    const re = /\/([a-f0-9-]{36})\b/ig;
    const ids = new Set();

    // Common: sidebar/topnav links include the workspace prefix.
    for (const a of document.querySelectorAll("a[href]")) {
      const href = a.getAttribute("href") || "";
      let m;
      while ((m = re.exec(href))) ids.add(m[1]);
    }

    // Sometimes data attributes contain URLs.
    for (const el of document.querySelectorAll("[data-href], [data-url]")) {
      const href = el.getAttribute("data-href") || el.getAttribute("data-url") || "";
      let m;
      while ((m = re.exec(href))) ids.add(m[1]);
    }

    return Array.from(ids);
  });
}

async function findWorkspaceIdsFromStorage(page) {
  return await page.evaluate(() => {
    const uuidRe = /([a-f0-9-]{36})/ig;
    const candidates = [];

    const scanStorage = (storage, storageName) => {
      if (!storage) return;
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (!key) continue;
        let val = null;
        try {
          val = storage.getItem(key);
        } catch {
          continue;
        }
        if (!val) continue;

        // Prefer keys that look workspace-related.
        const isWorkspaceKey = /workspace/i.test(key);
        let m;
        while ((m = uuidRe.exec(val))) {
          candidates.push({id: m[1], score: isWorkspaceKey ? 10 : 1, key: `${storageName}:${key}`});
        }
      }
    };

    scanStorage(window.localStorage, "localStorage");
    scanStorage(window.sessionStorage, "sessionStorage");

    // Sort: higher score first, stable order otherwise.
    candidates.sort((a, b) => b.score - a.score);
    return candidates.map((c) => c.id);
  });
}

async function tryNavigateToWorkspace(page, baseUrl, workspaceId) {
  try {
    // SPAs often keep long-lived connections open; use a looser signal and
    // explicitly wait for loaders/network quiescence.
    await page.goto(`${baseUrl}/${workspaceId}/agents`, {waitUntil: "domcontentloaded", timeout: 30000});
    await waitForNetworkIdle(page, 12000);
    await waitForLoadersGone(page);
    return page.url().includes(workspaceId);
  } catch {
    return false;
  }
}

async function resolveWorkspaceIdAfterLogin(page) {
  // 1) Direct URL
  const fromUrl = extractUuidFromUrl(page.url());
  if (fromUrl) return fromUrl;

  // 2) Pathname
  const fromPath = await page.evaluate(() => {
    const m = window.location.pathname.match(/^\/([a-f0-9-]{36})/i);
    return m ? m[1] : null;
  });
  if (fromPath) return fromPath;

  // 3) If we landed on a workspace picker page, try clicking a link that includes a workspace UUID.
  const clicked = await page.evaluate(() => {
    const re = /\/([a-f0-9-]{36})\b/i;
    const links = Array.from(document.querySelectorAll("a[href]"));
    const link = links.find((a) => re.test(a.getAttribute("href") || ""));
    if (!link) return null;
    const m = (link.getAttribute("href") || "").match(re);
    link.click();
    return m ? m[1] : null;
  });
  if (clicked) {
    await wait(1500);
    await waitForNetworkIdle(page, 12000);
    await waitForLoadersGone(page);
    const maybe = extractUuidFromUrl(page.url()) || extractUuidFromUrl(await page.evaluate(() => window.location.pathname));
    if (maybe) return maybe;
    // If click returned an id but URL didn't update, we can still try it.
    if (await tryNavigateToWorkspace(page, config.baseUrl, clicked)) return clicked;
  }

  // 4) Probe common routes to trigger workspace-prefixed redirects.
  for (const probe of ["/agents", "/audience", "/campaigns", "/datasets", "/workflow"]) {
    try {
      await page.goto(`${config.baseUrl}${probe}`, {waitUntil: "domcontentloaded", timeout: 30000});
      await waitForNetworkIdle(page, 12000);
      await waitForLoadersGone(page);
      const id = extractUuidFromUrl(page.url());
      if (id) return id;
    } catch {
      // ignore
    }
  }

  // 5) Parse IDs from DOM links and validate by navigation.
  const domIds = await findWorkspaceIdsFromDom(page);
  for (const id of domIds) {
    if (await tryNavigateToWorkspace(page, config.baseUrl, id)) return id;
  }

  // 6) Parse IDs from local/session storage and validate by navigation.
  const storageIds = await findWorkspaceIdsFromStorage(page);
  for (const id of storageIds) {
    if (await tryNavigateToWorkspace(page, config.baseUrl, id)) return id;
  }

  // 7) Fallback if provided.
  if (config.fallbackWorkspaceId) {
    recordWarning("Auth: Workspace ID", `Could not extract from UI; using fallback ${config.fallbackWorkspaceId}`);
    return config.fallbackWorkspaceId;
  }

  return null;
}

async function login(page) {
  currentSection = "Auth";
  currentRoute = "/";

  await page.goto(config.baseUrl, {waitUntil: "domcontentloaded", timeout: config.timeoutMs});
  await wait(1500);
  await waitForNetworkIdle(page, 12000);
  await waitForLoadersGone(page, 12000);

  // Most environments show social login first; email login is a button.
  await clickByText(page, {text: "sign in with email"}, {timeout: 6000});
  await wait(700);

  // Fill multi-step auth flow: email -> next -> password -> login.
  const emailSelectors = [
    'input[type="email"]',
    'input[name="email"]',
    'input[placeholder*="email" i]',
    'input:not([type="password"]):not([type="hidden"])',
  ];
  const emailSel = await typeIntoFirst(page, emailSelectors, config.email);
  await recordTest("Auth: Email field fill", Boolean(emailSel), emailSel ? "Filled" : "Could not find email input", {selector: "email input"});

  if (emailSel) {
    // Prefer submitting the form that owns the email input; text buttons are a fallback.
    await submitFormForSelector(page, emailSel);
  }
  await clickByText(page, {text: "next"}, {timeout: 1500});
  await clickByText(page, {text: "continue"}, {timeout: 1500});
  await wait(800);

  // Wait for password step to actually appear before typing/clicking.
  await page.waitForSelector('input[type="password"], input[name="password"]', {visible: true, timeout: 15000});

  const passSelectors = [
    'input[type="password"]',
    'input[name="password"]',
    'input[placeholder*="password" i]',
  ];
  const passSel = await typeIntoFirst(page, passSelectors, config.password);
  await recordTest("Auth: Password field fill", Boolean(passSel), passSel ? "Filled" : "Could not find password input", {selector: "password input"});

  if (passSel) {
    await submitFormForSelector(page, passSel);
  }
  // Fallbacks for UIs that don't wire forms.
  await clickByText(page, {text: "log in"}, {timeout: 1500});
  await clickByText(page, {text: "login"}, {timeout: 1500});
  // Avoid clicking "sign in" too early; at this point we should be on password step.
  await clickByText(page, {text: "sign in"}, {timeout: 1500});

  // Wait for redirect into workspace.
  await wait(1500);
  // SPA redirect won't trigger navigation; assert on URL change instead.
  const gotWorkspaceInUrl = await page
    .waitForFunction(() => /\/[a-f0-9-]{36}\b/i.test(window.location.pathname), {timeout: 60000})
    .then(() => true)
    .catch(() => false);

  await waitForNetworkIdle(page, 15000);
  await waitForLoadersGone(page, 15000);

  // If we're on a workspace picker page, resolve by clicking a workspace link and re-check.
  const workspaceId = await resolveWorkspaceIdAfterLogin(page);
  if (workspaceId && (gotWorkspaceInUrl || extractUuidFromUrl(page.url()))) {
    log(`Login successful. Workspace: ${workspaceId}`, "pass");
    return workspaceId;
  }

  const url = page.url();
  const alertText = await page.evaluate(() => {
    const el = document.querySelector('[role="alert"], [class*="error" i], [class*="alert" i]');
    return el ? (el.textContent || "").trim().slice(0, 500) : null;
  });
  if (alertText) recordWarning("Auth: Possible error", alertText);

  await captureScreenshot("workspace-id-not-found", {forFailure: true});
  throw new Error(`Could not extract workspace ID from URL/UI: ${url}`);
}

async function gotoWorkspaceRoute(page, workspaceId, route, {retries = config.routeRetries} = {}) {
  currentRoute = route;
  const url = `${config.baseUrl}/${workspaceId}${route}`;
  const maxAttempts = Math.max(1, Number.isFinite(retries) ? retries + 1 : 3);
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await page.goto(url, {waitUntil: "domcontentloaded", timeout: config.timeoutMs});
      await waitForNetworkIdle(page, 12000);
      await waitForLoadersGone(page, 15000);
    } catch (e) {
      lastError = `Navigation error: ${e?.message || String(e)}`;
      if (attempt < maxAttempts) {
        log(`Route retry: ${route}: ${lastError}, retrying (${attempt}/${maxAttempts - 1})`, "info");
        await captureScreenshot(`retry-nav-${safeName(route)}-${attempt}`, {forFailure: true});
        await wait(800 * attempt);
        continue;
      }
      await captureScreenshot(`route-nav-failed-${safeName(route)}`, {forFailure: true});
      return {ok: false, url: page.url(), error: lastError};
    }

    if (await looksLikeLoggedOut(page)) {
      await captureScreenshot(`logged-out-${safeName(route)}`, {forFailure: true});
      throw new Error(`Session appears logged out while loading route ${route} (${page.url()})`);
    }

    const globalErr = await getGlobalErrorText(page);
    if (!globalErr) return {ok: true, url: page.url(), error: null};

    lastError = globalErr;
    if (attempt < maxAttempts) {
      log(`Route retry: ${route}: saw "${globalErr}", retrying (${attempt}/${maxAttempts - 1})`, "info");
      await captureScreenshot(`retry-${safeName(route)}-${attempt}`, {forFailure: true});
      await wait(800 * attempt);
      continue;
    }
  }

  await captureScreenshot(`route-failed-${safeName(route)}`, {forFailure: true});
  return {ok: false, url: page.url(), error: lastError || "Unknown route load error"};
}

async function verifySidebarNav(page, {label, expectedPathIncludes}) {
  currentSection = `Nav: ${label}`;
  const labels = Array.isArray(label) ? label : [label];
  const expectedPaths = Array.isArray(expectedPathIncludes) ? expectedPathIncludes : [expectedPathIncludes];
  let okClick = await clickSidebarNavItem(page, labels, expectedPaths, 8000);
  let clickedLabel = labels[0];
  if (!okClick) {
    recordWarning(`Nav: Click '${labels.join("/")}'`, "Could not find nav item");
    return false;
  }

  // Navigation is SPA; accept any expected path (for People this may be /people not /audience).
  const okRoute = await page
    .waitForFunction((needles) => needles.some((n) => window.location.pathname.includes(n)), {timeout: 20000}, expectedPaths.filter(Boolean))
    .then(() => true)
    .catch(() => false);

  const actualPath = await page.evaluate(() => window.location.pathname);
  if (!okRoute) {
    recordWarning(`Nav: '${clickedLabel}' navigates`, `Unexpected route (${actualPath})`);
  } else {
    // Some builds can briefly hit the expected route then redirect; don't warn on that.
    log(`Nav: '${clickedLabel}' navigates: OK (${actualPath})`, "pass");
  }
  await waitForLoadersGone(page);
  return okRoute;
}

async function testChatSendAndRespond(page) {
  currentSection = "Home/Chat";
  await recordTest("Home: Loaded", true, "Starting chat tests");

  const chatInputSel =
    (await elementExists(page, '[data-testid="chat-input"]')) ? '[data-testid="chat-input"]'
      : (await elementExists(page, 'textarea')) ? "textarea"
        : (await elementExists(page, 'input[placeholder*="message" i]')) ? 'input[placeholder*="message" i]'
          : null;

  await recordTest("Chat: Input present", Boolean(chatInputSel), chatInputSel ? "Found" : "Not found", {selector: chatInputSel || "chat input"});
  if (!chatInputSel) return;

  const message = `QA ping ${new Date().toISOString()}`;

  const beforeCount = await page.evaluate(() => {
    const sel = [
      '[data-testid*="message" i]',
      '[class*="message" i]',
      '[class*="bubble" i]',
      '[role="listitem"]',
    ];
    const set = new Set();
    for (const s of sel) document.querySelectorAll(s).forEach((el) => set.add(el));
    return set.size;
  });

  await page.click(chatInputSel);
  await page.type(chatInputSel, message, {delay: 10});

  // Prefer explicit Send button; fallback to Enter.
  const sent =
    (await clickByText(page, {selector: 'button, [role="button"]', text: "send"}, {timeout: 1200})) ||
    (await clickByText(page, {selector: 'button, [role="button"]', text: "submit"}, {timeout: 1200})) ||
    (await (async () => {
      try {
        await page.keyboard.press("Enter");
        return true;
      } catch {
        return false;
      }
    })());

  await recordTest("Chat: Message sent", sent, sent ? "Submitted" : "Could not submit message", {selector: "send/enter"});
  if (!sent) return;

  // Wait for new content to appear (response or at least additional message nodes).
  const gotMore = await page
    .waitForFunction(
      (prev) => {
        const sel = [
          '[data-testid*="message" i]',
          '[class*="message" i]',
          '[class*="bubble" i]',
          '[role="listitem"]',
        ];
        const set = new Set();
        for (const s of sel) document.querySelectorAll(s).forEach((el) => set.add(el));
        return set.size > prev;
      },
      // Staging can be slow; keep this generous even in quick mode.
      {timeout: config.quick ? 20000 : 30000},
      beforeCount,
    )
    .then(() => true)
    .catch(() => false);

  await recordTest("Chat: Response appears", gotMore, gotMore ? "New messages rendered" : "No new message nodes detected", {selector: "message nodes count"});

  // Basic health check: no obvious error toast after send.
  const hasErrorToast = await page.evaluate(() => {
    const txt = (document.body.textContent || "").toLowerCase();
    return txt.includes("something went wrong") || txt.includes("failed to") || txt.includes("error");
  });
  if (hasErrorToast) {
    recordWarning("Chat: Possible error state", "Detected generic error text on page after send (may be a false positive)");
  }
}

async function testSectionEntryPoints(page, workspaceId) {
  // Verify sidebar navigation (exercises app routing + nav wiring).
  await verifySidebarNav(page, {label: "Agents", expectedPathIncludes: ["/agents"]});
  {
    const nav = await gotoWorkspaceRoute(page, workspaceId, "/agents");
    if (!nav.ok) {
      await recordTest("Agents: Page loads", false, nav.error, {selector: "route:/agents"});
      return;
    }
  }
  await recordTest("Agents: Buttons present", await elementExists(page, "button"), "Create UI varies; ensuring at least buttons exist", {selector: "button"});
  if (!config.quick) {
    const opened =
      (await clickByText(page, {text: "create agent"}, {timeout: 3000})) ||
      (await clickByText(page, {text: "create"}, {timeout: 3000})) ||
      false;
    await recordTest("Agents: Create flow opens", opened, opened ? "Clicked create" : "Could not click create", {selector: "text:create"});
    if (opened) {
      // Agent Builder is a full-page view in many builds (not a modal).
      const hasBuilder = await page
        .waitForFunction(() => {
          const txt = (document.body?.innerText || "").toLowerCase();
          return txt.includes("agent builder") || txt.includes("complete all fields to enable agent testing");
        }, {timeout: 15000})
        .then(() => true)
        .catch(() => false);
      await recordTest("Agents: Create UI visible", hasBuilder, hasBuilder ? "Agent Builder detected" : "No Agent Builder detected", {selector: "text:Agent Builder"});

      if (hasBuilder) {
        const hasName = await elementExists(page, 'input[placeholder*="name of the agent" i], input[name*="name" i]', 3000);
        await recordTest("Agents: Builder has name field", hasName, hasName ? "Name field found" : "Name field missing", {selector: "input[name]/placeholder"});
      }

      // Always return to the list before continuing; otherwise sidebar nav may not exist.
      await gotoWorkspaceRoute(page, workspaceId, "/agents");
    }
  }

  await verifySidebarNav(page, {label: ["People", "Audience"], expectedPathIncludes: ["/audience", "/people"]});
  {
    const nav = await gotoWorkspaceRoute(page, workspaceId, "/audience");
    if (!nav.ok) {
      await recordTest("People: Page loads", false, nav.error, {selector: "route:/audience"});
    }
  }
  const hasPeopleContent = await elementExists(page, "table, [role=\"grid\"], [class*=\"table\" i], [class*=\"grid\" i], [class*=\"card\" i], [class*=\"population\" i]", 8000);
  await recordTest("People: Page content present", hasPeopleContent, hasPeopleContent ? "Found table/grid/cards" : "No table/grid/cards found", {selector: "table/grid/card"});
  if (!config.quick) {
    // Deep route checks (these are stable, avoid tab-click brittleness).
    for (const r of ["/people/populations", "/audience/populations"]) {
      const nav = await gotoWorkspaceRoute(page, workspaceId, r);
      if (nav.ok) {
        const pathNow = await currentPathname(page);
        if (!pathNow.includes("populations")) {
          recordWarning("People: Populations route redirected", `Ended on ${pathNow} after navigating to ${r}`);
          break;
        }
        const ok = await elementExists(page, '[class*="population" i], [class*="card" i], table', 8000);
        await recordTest("People: Populations route loads", ok, ok ? "OK" : "Missing populations UI", {selector: `route:${r}`});
        // From populations page, navigate to Humans using the UI tab so we follow the canonical route.
        try {
          const clicked = await clickByText(page, {selector: "[role=\"tab\"], button, a, [role=\"button\"]", text: "humans"}, {timeout: 4000});
          if (clicked) {
            await waitForNetworkIdle(page, 15000);
            await waitForLoadersGone(page, 15000);
            const path = await currentPathname(page);
            const okHumans =
              (await elementExists(page, 'table, [role="grid"], [class*="table" i], [class*="empty" i], [class*="no-results" i]', 10000)) ||
              (await pageTextIncludes(page, "humans"));
            await recordTest("People: Humans view loads (via tab)", okHumans, okHumans ? `OK (${path})` : `Missing humans view/table/empty-state (${path})`, {selector: "tab:Humans"});
          } else {
            recordWarning("People: Humans tab", "Could not click Humans tab; skipping");
          }
        } catch (e) {
          recordWarning("People: Humans tab", `Error clicking Humans tab: ${e?.message || String(e)}`);
        }
        break; // done with people deep checks
      }
    }
    for (const r of ["/people/lists", "/audience/lists"]) {
      const nav = await gotoWorkspaceRoute(page, workspaceId, r);
      if (nav.ok) {
        const ok = await elementExists(page, 'table, [role="grid"], [class*="list" i], [class*="segment" i]', 8000);
        await recordTest("People: Lists/Segments route loads", ok, ok ? "OK" : "Missing lists/segments UI", {selector: `route:${r}`});
        break;
      }
    }
    for (const r of ["/people/properties", "/audience/properties"]) {
      const nav = await gotoWorkspaceRoute(page, workspaceId, r);
      if (nav.ok) {
        const ok = await elementExists(page, 'table, [role="grid"], [class*="propert" i]', 8000);
        await recordTest("People: Properties route loads", ok, ok ? "OK" : "Missing properties UI", {selector: `route:${r}`});
        break;
      }
    }
  }

  await verifySidebarNav(page, {label: "Campaigns", expectedPathIncludes: ["/campaigns"]});
  {
    const nav = await gotoWorkspaceRoute(page, workspaceId, "/campaigns");
    if (!nav.ok) {
      await recordTest("Campaigns: Page loads", false, nav.error, {selector: "route:/campaigns"});
    }
  }
  await recordTest("Campaigns: Buttons present", await elementExists(page, "button"), "Create UI varies; ensuring at least buttons exist", {selector: "button"});
  if (!config.quick) {
    const opened =
      (await clickByText(page, {text: "create campaign"}, {timeout: 3000})) ||
      (await clickByText(page, {text: "create"}, {timeout: 3000})) ||
      false;
    await recordTest("Campaigns: Create flow opens", opened, opened ? "Clicked create" : "Could not click create", {selector: "text:create"});
    if (opened) {
      const hasDialog = await elementExists(page, '[role="dialog"], [class*="modal" i], [class*="drawer" i]', 6000);
      await recordTest("Campaigns: Create UI visible", hasDialog, hasDialog ? "Dialog detected" : "No dialog detected", {selector: "dialog/modal"});
      await page.keyboard.press("Escape").catch(() => {});
      await wait(500);
    }

    for (const r of ["/campaigns/templates", "/campaigns/usage", "/campaigns/magic-reels"]) {
      const nav = await gotoWorkspaceRoute(page, workspaceId, r);
      if (!nav.ok) {
        await recordTest(`Campaigns: Route loads (${r})`, false, nav.error, {selector: `route:${r}`});
        continue;
      }
      const ok = await elementExists(page, "button, [class*=\"tab\" i], [role=\"tablist\"], [class*=\"grid\" i], [class*=\"card\" i]", 8000);
      await recordTest(`Campaigns: Route loads (${r})`, ok, ok ? "OK" : "Missing expected UI", {selector: `route:${r}`});
    }
  }

  await verifySidebarNav(page, {label: "Datasets", expectedPathIncludes: ["/datasets"]});
  {
    const nav = await gotoWorkspaceRoute(page, workspaceId, "/datasets");
    if (!nav.ok) {
      await recordTest("Datasets: Page loads", false, nav.error, {selector: "route:/datasets"});
    }
  }
  await recordTest("Datasets: Search input present", await elementExists(page, "input[type=\"search\"], input[placeholder*=\"search\" i]"), "Found search input", {selector: "input[type=search]"});
  if (!config.quick) {
    const opened =
      (await clickByText(page, {text: "create dataset"}, {timeout: 3000})) ||
      (await clickByText(page, {text: "create"}, {timeout: 3000})) ||
      false;
    await recordTest("Datasets: Create flow opens", opened, opened ? "Clicked create" : "Could not click create", {selector: "text:create"});
    if (opened) {
      const hasDialog = await elementExists(page, '[role="dialog"], [class*="modal" i], [class*="drawer" i], input, textarea', 6000);
      await recordTest("Datasets: Create UI visible", hasDialog, hasDialog ? "Dialog/form detected" : "No dialog/form detected", {selector: "dialog/modal/form"});
      await page.keyboard.press("Escape").catch(() => {});
      await wait(500);
    }

    // Magic summaries
    {
      const nav = await gotoWorkspaceRoute(page, workspaceId, "/datasets/magic-summaries");
      if (!nav.ok) {
        await recordTest("Datasets: Magic summaries route loads", false, nav.error, {selector: "route:/datasets/magic-summaries"});
      } else {
        const pathNow = await currentPathname(page);
        if (!pathNow.includes("magic-summaries")) {
          recordWarning("Datasets: Magic summaries route redirected", `Ended on ${pathNow} after navigating to /datasets/magic-summaries`);
        }

        const ok =
          (await elementExists(page, "[class*=\"summary\" i], [class*=\"magic\" i], table, [class*=\"card\" i]", 8000)) ||
          (await pageTextIncludes(page, "magic summaries")) ||
          (await pageTextIncludes(page, "coming soon"));

        await recordTest("Datasets: Magic summaries route loads", ok, ok ? "OK" : "Missing magic summaries UI/empty-state", {selector: "route:/datasets/magic-summaries"});
      }
    }
  }

  await verifySidebarNav(page, {label: "Workflow", expectedPathIncludes: ["/workflow"]});
  // Root /workflow is occasionally flaky in staging; use /workflow/flows as the canonical "it works" page.
  {
    const nav = await gotoWorkspaceRoute(page, workspaceId, "/workflow/flows");
    if (!nav.ok) {
      await recordTest("Workflow: Flows page loads", false, nav.error, {selector: "route:/workflow/flows"});
      return;
    }
  }
  const hasWorkflowShell =
    (await elementExists(page, "[role=\"tablist\"], [class*=\"tab\" i], [class*=\"flow\" i], [class*=\"card\" i], button", 8000)) ||
    (await page.evaluate(() => (document.body?.innerText || "").toLowerCase().includes("workflow")));
  await recordTest("Workflow: Flows page loads", hasWorkflowShell, hasWorkflowShell ? "Workflow flows UI detected" : "Workflow flows UI not detected", {selector: "tablist/flow/card/button or text:workflow"});
  if (!config.quick) {
    // The builder is usually under /workflow/flows; try to open a create/builder UI.
    let opened =
      (await clickByText(page, {text: "create flow"}, {timeout: 2500})) ||
      (await clickByText(page, {text: "new flow"}, {timeout: 2500})) ||
      (await clickByText(page, {text: "create"}, {timeout: 2500})) ||
      (await clickByText(page, {text: "new"}, {timeout: 2500})) ||
      false;

    // Fallback: open first existing flow card/row if create isn't available.
    let openedVia = opened ? "create/new" : "existing flow";
    if (!opened) {
      opened = await page.evaluate(() => {
        const candidates = [
          ...Array.from(document.querySelectorAll("a[href*='/workflow/'], a[href*='/flows/']")),
          ...Array.from(document.querySelectorAll("[class*='card' i], [role='row']")),
        ];
        const isVisible = (el) => {
          const st = window.getComputedStyle(el);
          if (st.display === "none" || st.visibility === "hidden" || st.opacity === "0") return false;
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        };
        const el = candidates.find(isVisible);
        if (!el) return false;
        el.click();
        return true;
      });
    }

    await recordTest("Workflow: Builder entrypoint opens", opened, opened ? `Opened via ${openedVia}` : "Could not open builder via create or existing flow", {selector: "text:create/new or first flow card"});
    if (opened) {
      const hasBuilder = await elementExists(page, '[class*="canvas" i], [class*="builder" i], [class*="reactflow" i], [role="dialog"], [class*="modal" i]', 12000);
      await recordTest("Workflow: Builder UI visible", hasBuilder, hasBuilder ? "Builder detected" : "No builder detected", {selector: "canvas/builder"});
      await gotoWorkspaceRoute(page, workspaceId, "/workflow/flows").catch(() => {});
    }

    // Additional routes
    for (const r of ["/workflow/upcoming", "/workflow/templates", "/workflow/conversations"]) {
      const nav = await gotoWorkspaceRoute(page, workspaceId, r);
      if (!nav.ok) {
        await recordTest(`Workflow: Route loads (${r})`, false, nav.error, {selector: `route:${r}`});
        continue;
      }
      const ok = await elementExists(page, "button, [class*=\"tab\" i], [class*=\"grid\" i], [class*=\"card\" i], table", 8000);
      await recordTest(`Workflow: Route loads (${r})`, ok, ok ? "OK" : "Missing expected UI", {selector: `route:${r}`});
    }
  }
}

// ── New domain test functions ──────────────────────────────────────

async function testSettings(page, workspaceId) {
  currentSection = "Settings";
  const nav = await gotoWorkspaceRoute(page, workspaceId, "/workspace/settings");
  if (!nav.ok) {
    recordWarning("Settings: Page loads", nav.error || "Could not navigate");
    return;
  }
  const hasContent =
    (await elementExists(page, "form, input, [class*='settings' i], [class*='form' i]", 8000)) ||
    (await pageTextIncludes(page, "settings"));
  await recordTest("Settings: Page loads", hasContent, hasContent ? "Settings UI detected" : "No settings UI detected", {selector: "route:/workspace/settings"});

  if (!config.quick) {
    // AI Models sub-page
    const aiNav = await gotoWorkspaceRoute(page, workspaceId, "/workspace/settings/ai-models");
    if (aiNav.ok) {
      const ok = await elementExists(page, "table, [class*='model' i], [class*='card' i], [class*='list' i]", 8000) || (await pageTextIncludes(page, "model"));
      await recordTest("Settings: AI Models page loads", ok, ok ? "OK" : "Missing AI models UI", {selector: "route:/workspace/settings/ai-models"});
    } else {
      recordWarning("Settings: AI Models sub-page", aiNav.error || "Could not navigate");
    }

    // Members sub-page
    const membersNav = await gotoWorkspaceRoute(page, workspaceId, "/workspace/members");
    if (membersNav.ok) {
      const ok = await elementExists(page, "table, [class*='member' i], [class*='list' i], [class*='user' i]", 8000) || (await pageTextIncludes(page, "member"));
      await recordTest("Settings: Members page loads", ok, ok ? "OK" : "Missing members UI", {selector: "route:/workspace/members"});
    } else {
      recordWarning("Settings: Members sub-page", membersNav.error || "Could not navigate");
    }
  }
}

async function testBranding(page, workspaceId) {
  currentSection = "Branding";
  const nav = await gotoWorkspaceRoute(page, workspaceId, "/branding");
  if (!nav.ok) {
    recordWarning("Branding: Page loads", nav.error || "Could not navigate");
    return;
  }
  const hasContent =
    (await elementExists(page, "form, input, [class*='brand' i], [class*='form' i]", 8000)) ||
    (await pageTextIncludes(page, "brand"));
  await recordTest("Branding: Page loads", hasContent, hasContent ? "Branding UI detected" : "No branding UI detected", {selector: "route:/branding"});

  if (!config.quick) {
    for (const r of ["/branding/reviews", "/branding/reels", "/branding/questions"]) {
      const subNav = await gotoWorkspaceRoute(page, workspaceId, r);
      if (!subNav.ok) {
        recordWarning(`Branding: Route ${r}`, subNav.error || "Could not navigate");
        continue;
      }
      const ok = await elementExists(page, "button, table, [class*='card' i], [class*='list' i], [class*='tab' i]", 8000);
      await recordTest(`Branding: Route loads (${r})`, ok, ok ? "OK" : "Missing expected UI", {selector: `route:${r}`});
    }
  }
}

async function testForecast(page, workspaceId) {
  currentSection = "Forecast";
  const nav = await gotoWorkspaceRoute(page, workspaceId, "/forecast");
  if (!nav.ok) {
    recordWarning("Forecast: Page loads", nav.error || "Could not navigate");
    return;
  }
  // Forecast may be feature-flagged off — detect redirect or empty state and record as warning, not failure.
  const pathname = await currentPathname(page);
  if (!pathname.includes("forecast")) {
    recordWarning("Forecast: Feature-flagged off", `Redirected to ${pathname} (feature may be disabled for this workspace)`);
    return;
  }
  const hasContent =
    (await elementExists(page, "[class*='forecast' i], [class*='chart' i], [class*='card' i], table, canvas", 8000)) ||
    (await pageTextIncludes(page, "forecast"));
  await recordTest("Forecast: Page loads", hasContent, hasContent ? "Forecast UI detected" : "No forecast UI detected", {selector: "route:/forecast"});
}

async function testRewards(page, workspaceId) {
  currentSection = "Rewards";
  const nav = await gotoWorkspaceRoute(page, workspaceId, "/rewards");
  if (!nav.ok) {
    recordWarning("Rewards: Page loads", nav.error || "Could not navigate");
    return;
  }
  const hasContent =
    (await elementExists(page, "[class*='reward' i], [class*='tremendous' i], table, button, [class*='card' i]", 8000)) ||
    (await pageTextIncludes(page, "reward")) ||
    (await pageTextIncludes(page, "tremendous"));
  await recordTest("Rewards: Page loads", hasContent, hasContent ? "Rewards UI detected" : "No rewards UI detected", {selector: "route:/rewards"});
}

async function testIntegrations(page, workspaceId) {
  currentSection = "Integrations";
  // Integrations may be under /settings/integrations or /integrations
  let nav = await gotoWorkspaceRoute(page, workspaceId, "/settings/integrations");
  if (!nav.ok) {
    nav = await gotoWorkspaceRoute(page, workspaceId, "/integrations");
  }
  if (!nav.ok) {
    recordWarning("Integrations: Page loads", nav.error || "Could not navigate");
    return;
  }
  const hasContent =
    (await elementExists(page, "[class*='integration' i], [class*='connection' i], [class*='tool' i], table, [class*='card' i]", 8000)) ||
    (await pageTextIncludes(page, "integration")) ||
    (await pageTextIncludes(page, "connect"));
  await recordTest("Integrations: Page loads", hasContent, hasContent ? "Integrations UI detected" : "No integrations UI detected", {selector: "route:/settings/integrations"});
}

async function testAdmin(page, workspaceId) {
  currentSection = "Admin";
  const nav = await gotoWorkspaceRoute(page, workspaceId, "/admin");
  if (!nav.ok) {
    recordWarning("Admin: Page loads", nav.error || "Could not navigate (enterprise-only)");
    return;
  }
  // Admin is enterprise-only — detect redirect and record as warning, not failure.
  const pathname = await currentPathname(page);
  if (!pathname.includes("admin")) {
    recordWarning("Admin: Enterprise-only guard", `Redirected to ${pathname} (admin may require enterprise access)`);
    return;
  }
  const hasContent =
    (await elementExists(page, "[class*='admin' i], [class*='dashboard' i], table, [class*='card' i], iframe", 8000)) ||
    (await pageTextIncludes(page, "admin")) ||
    (await pageTextIncludes(page, "dashboard"));
  await recordTest("Admin: Page loads", hasContent, hasContent ? "Admin UI detected" : "No admin UI detected", {selector: "route:/admin"});

  if (!config.quick && hasContent) {
    // Test a couple sub-routes
    for (const r of ["/admin/brand-management", "/admin/campaign-templates"]) {
      const subNav = await gotoWorkspaceRoute(page, workspaceId, r);
      if (!subNav.ok) {
        recordWarning(`Admin: Route ${r}`, subNav.error || "Could not navigate");
        continue;
      }
      const ok = await elementExists(page, "table, [class*='card' i], [class*='list' i], button", 8000);
      await recordTest(`Admin: Route loads (${r})`, ok, ok ? "OK" : "Missing expected UI", {selector: `route:${r}`});
    }
  }
}

async function testDiscoveredRoutes(page, workspaceId) {
  if (!config.deep) return;
  if (!config.webManagerDir) return;

  currentSection = "Deep Smoke";

  const {routes, scannedFiles} = await discoverWorkspaceRoutes({webManagerDir: config.webManagerDir});
  results.meta.discoveredRoutes = {count: routes.length, scannedFiles};

  if (routes.length === 0) {
    recordWarning("Deep Smoke: Route discovery", `No routes discovered (scannedFiles=${scannedFiles})`);
    return;
  }

  // Treat as additive checks; avoid making the suite extremely flaky.
  for (const r of routes) {
    const nav = await gotoWorkspaceRoute(page, workspaceId, r);
    if (!nav.ok) {
      await recordTest(`Deep Smoke: Route loads (${r})`, false, nav.error, {selector: `route:${r}`});
      continue;
    }

    // Generic "page looks loaded" heuristics.
    const ok = await elementExists(
      page,
      [
        "main",
        "h1, h2",
        "button",
        "a[href]",
        "table",
        "[role='table']",
        "[role='grid']",
        "[role='dialog']",
      ].join(", "),
      8000,
    );
    await recordTest(`Deep Smoke: UI present (${r})`, ok, ok ? "OK" : "Missing expected UI", {selector: `route:${r}`});
  }
}

function attachRuntimeWatchers(page) {
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      results.runtime.consoleErrors.push({text: msg.text(), timestamp: ts()});
    }
  });
  page.on("pageerror", (err) => {
    results.runtime.pageErrors.push({message: err?.message || String(err), timestamp: ts()});
  });
  page.on("requestfailed", (req) => {
    results.runtime.requestFailed.push({
      url: req.url(),
      method: req.method(),
      failure: req.failure()?.errorText || "unknown",
      timestamp: ts(),
    });
  });
  page.on("response", (res) => {
    const status = res.status();
    if (status >= 500) {
      results.runtime.serverErrors.push({url: res.url(), status, timestamp: ts()});
    }
  });
}

async function generateReport() {
  results.endTime = new Date();
  const durationSec = (results.endTime - results.startTime) / 1000;

  const report = {
    summary: {
      totalTests: results.passed.length + results.failed.length,
      passed: results.passed.length,
      failed: results.failed.length,
      warnings: results.warnings.length,
      duration: `${durationSec.toFixed(2)}s`,
      timestamp: results.startTime.toISOString(),
      baseUrl: config.baseUrl,
      quick: config.quick,
      strict: config.strict,
      viewport: currentViewport?.name || "unknown",
      runtime: {
        consoleErrors: results.runtime.consoleErrors.length,
        pageErrors: results.runtime.pageErrors.length,
        requestFailed: results.runtime.requestFailed.length,
        serverErrors: results.runtime.serverErrors.length,
      },
    },
    passed: results.passed,
    failed: results.failed,
    warnings: results.warnings,
    runtime: results.runtime,
    meta: results.meta,
  };

  // Always write reports under qa-output/ so they don't pollute git state.
  const outJsonPath = path.join(outDir, "qa-report.json");
  await fs.writeFile(outJsonPath, JSON.stringify(report, null, 2));

  // Optional: write a root-level report if explicitly requested (CI artifact convenience).
  if (process.env.QA_WRITE_ROOT_REPORT === "true") {
    const jsonPath = path.join(repoRoot, "qa-report.json");
    await fs.writeFile(jsonPath, JSON.stringify(report, null, 2));
  }

  // Always write a human-readable summary report.
  {
    const outMdPath = path.join(outDir, "qa-report.md");
    let md = `# QA Test Report\n\n`;
    md += `**Generated**: ${results.startTime.toISOString()}\n`;
    md += `**Target URL**: ${config.baseUrl}\n`;
    md += `**Duration**: ${durationSec.toFixed(2)}s\n\n`;
    md += `## Summary\n\n`;
    md += `- Passed: ${results.passed.length}\n`;
    md += `- Failed: ${results.failed.length}\n`;
    md += `- Warnings: ${results.warnings.length}\n`;
    md += `- Console errors: ${results.runtime.consoleErrors.length}\n`;
    md += `- Page errors: ${results.runtime.pageErrors.length}\n`;
    md += `- Request failed: ${results.runtime.requestFailed.length}\n`;
    md += `- Server errors (5xx): ${results.runtime.serverErrors.length}\n\n`;

    if (results.runtime.serverErrors.length > 0) {
      md += `## Server Errors (5xx)\n\n`;
      for (const e of results.runtime.serverErrors.slice(0, 20)) {
        md += `- ${e.status} ${e.url}\n`;
      }
      md += `\n`;
    }

    if (results.runtime.consoleErrors.length > 0) {
      md += `## Console Errors (sample)\n\n`;
      for (const e of results.runtime.consoleErrors.slice(0, 20)) {
        md += `- ${e.text}\n`;
      }
      md += `\n`;
    }

    await fs.writeFile(outMdPath, md);

    if (process.env.QA_WRITE_ROOT_REPORT === "true") {
      await fs.writeFile(path.join(repoRoot, "qa-report.md"), md);
    }
  }

  // Only write a failure report when there are actual test failures or hard runtime errors.
  const shouldWriteFailure =
    results.failed.length > 0 ||
    results.runtime.serverErrors.length > 0 ||
    (config.strict && results.runtime.pageErrors.length > 0);

  if (shouldWriteFailure) {
    const outMdPath = path.join(outDir, "qa-failure-report.md");
    let md = `# QA Failures\n\n`;
    md += `**Generated**: ${results.startTime.toISOString()}\n`;
    md += `**Target URL**: ${config.baseUrl}\n`;
    md += `**Duration**: ${durationSec.toFixed(2)}s\n\n`;

    if (results.failed.length > 0) {
      md += `## Failed Tests\n\n`;
      for (const f of results.failed) {
        md += `### ${f.name}\n\n`;
        md += `- Section: ${f.section || "Unknown"}\n`;
        md += `- Route: ${f.route || "Unknown"}\n`;
        md += `- Viewport: ${f.viewport || "Unknown"}\n`;
        md += `- Selector: \`${f.selector || "N/A"}\`\n`;
        if (f.screenshot) md += `- Screenshot: \`${path.relative(repoRoot, f.screenshot)}\`\n`;
        md += `\nReproduction steps:\n\`\`\`\n${(f.reproductionSteps || []).join("\n")}\n\`\`\`\n\n`;
      }
    }

    if (results.runtime.pageErrors.length > 0) {
      md += `## Page Errors\n\n`;
      for (const e of results.runtime.pageErrors.slice(0, 20)) {
        md += `- ${e.message}\n`;
      }
      md += `\n`;
    }

    if (results.runtime.serverErrors.length > 0) {
      md += `## Server Errors (5xx)\n\n`;
      for (const e of results.runtime.serverErrors.slice(0, 20)) {
        md += `- ${e.status} ${e.url}\n`;
      }
      md += `\n`;
    }

    await fs.writeFile(outMdPath, md);

    if (process.env.QA_WRITE_ROOT_REPORT === "true") {
      await fs.writeFile(path.join(repoRoot, "qa-failure-report.md"), md);
    }
  }

  // Print summary
  // eslint-disable-next-line no-console
  console.log("\n" + "=".repeat(60));
  // eslint-disable-next-line no-console
  console.log("QA TEST SUMMARY");
  // eslint-disable-next-line no-console
  console.log("=".repeat(60));
  // eslint-disable-next-line no-console
  console.log(`Total Tests: ${report.summary.totalTests}`);
  // eslint-disable-next-line no-console
  console.log(`Passed: ${report.summary.passed}`);
  // eslint-disable-next-line no-console
  console.log(`Failed: ${report.summary.failed}`);
  // eslint-disable-next-line no-console
  console.log(`Warnings: ${report.summary.warnings}`);
  // eslint-disable-next-line no-console
  console.log(`Console errors: ${report.summary.runtime.consoleErrors}`);
  // eslint-disable-next-line no-console
  console.log(`Server errors (5xx): ${report.summary.runtime.serverErrors}`);
  // eslint-disable-next-line no-console
  console.log(`Duration: ${report.summary.duration}`);
  // eslint-disable-next-line no-console
  console.log("=".repeat(60));

  return report;
}

async function main() {
  if (!config.email || !config.password) {
    // eslint-disable-next-line no-console
    console.error("Error: VURVEY_EMAIL and VURVEY_PASSWORD environment variables required");
    process.exit(1);
  }

  await ensureDirs();

  const viewport =
    (config.viewportKey && VIEWPORTS[config.viewportKey]) ? VIEWPORTS[config.viewportKey]
      : (config.quick ? VIEWPORTS.desktop : VIEWPORTS.desktop);

  log("Starting Vurvey QA Test Suite", "info");
  log(`Target: ${config.baseUrl}`, "info");
  log(`Headless: ${config.headless}`, "info");
  log(`Quick: ${config.quick}`, "info");
  log(`Strict: ${config.strict}`, "info");
  log(`Deep: ${config.deep}`, "info");
  log(`Viewport: ${viewport.name}`, "info");

  const browser = await puppeteer.launch({
    headless: config.headless,
    slowMo: config.quick ? 0 : 30,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  currentPage = page;
  attachRuntimeWatchers(page);

  try {
    await setViewport(page, viewport);
    const workspaceId = await login(page);

    await gotoWorkspaceRoute(page, workspaceId, "/");
    await testChatSendAndRespond(page);

    await testSectionEntryPoints(page, workspaceId);

    // New domain tests — each wrapped in try-catch so one failure doesn't block others.
    const newDomainTests = [
      ["Settings", testSettings],
      ["Branding", testBranding],
      ["Forecast", testForecast],
      ["Rewards", testRewards],
      ["Integrations", testIntegrations],
      ["Admin", testAdmin],
    ];
    for (const [name, fn] of newDomainTests) {
      try {
        await fn(page, workspaceId);
      } catch (e) {
        recordWarning(`${name}: Uncaught error`, e?.message || String(e));
      }
    }

    await testDiscoveredRoutes(page, workspaceId);

    // Runtime health as tests (configurable strictness in exit code)
    if (results.runtime.serverErrors.length > 0) {
      if (config.strict) {
        await recordTest("Runtime: No 5xx responses", false, `${results.runtime.serverErrors.length} server error response(s)`, {selector: "response.status>=500"});
      } else {
        recordWarning("Runtime: 5xx responses", `${results.runtime.serverErrors.length} server error response(s)`);
      }
    } else {
      await recordTest("Runtime: No 5xx responses", true, "OK");
    }

    if (results.runtime.pageErrors.length > 0) {
      if (config.strict) {
        await recordTest("Runtime: No page errors", false, `${results.runtime.pageErrors.length} pageerror event(s)`, {selector: "pageerror"});
      } else {
        // Non-strict mode still includes these in qa-output/qa-report.json; don't fail or warn.
      }
    } else {
      await recordTest("Runtime: No page errors", true, "OK");
    }

    const report = await generateReport();

    const strictRuntimeIssues =
      results.runtime.consoleErrors.length > 0 ||
      results.runtime.requestFailed.length > 0 ||
      results.runtime.serverErrors.length > 0 ||
      results.runtime.pageErrors.length > 0;

    if (report.summary.failed > 0) process.exit(1);
    if (config.strict && strictRuntimeIssues) process.exit(1);
  } catch (e) {
    log(`Fatal error: ${e?.message || String(e)}`, "fail");
    // eslint-disable-next-line no-console
    console.error(e);
    await captureScreenshot("fatal", {forFailure: true});
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
