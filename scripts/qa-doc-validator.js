#!/usr/bin/env node

/**
 * Vurvey Documentation Accuracy Validator (docs-as-spec)
 *
 * Reads each guide markdown file, extracts testable claims
 * (routes, screenshots, UI element references), and verifies
 * them against the live staging app.
 *
 * Usage:
 *   node scripts/qa-doc-validator.js
 *
 * Env:
 *   VURVEY_EMAIL        required
 *   VURVEY_PASSWORD     required
 *   VURVEY_URL          default: https://staging.vurvey.dev
 *   VURVEY_WORKSPACE_ID preferred workspace id for route/UI checks
 *   HEADLESS            default: true
 */

import puppeteer from "puppeteer";
import fs from "fs/promises";
import path from "path";
import {fileURLToPath} from "url";
import {
  login,
  gotoWorkspaceRoute,
  elementExists,
  pageTextIncludes,
  waitForLoadersGone,
  waitForNetworkIdle,
  wait,
} from "./lib/qa-browser-helpers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");
const docsDir = path.join(repoRoot, "docs", "guide");
const screenshotsDir = path.join(repoRoot, "docs", "public", "screenshots");
const outDir = path.join(repoRoot, "qa-output");

const config = {
  email: process.env.VURVEY_EMAIL,
  password: process.env.VURVEY_PASSWORD,
  baseUrl: process.env.VURVEY_URL || "https://staging.vurvey.dev",
  preferredWorkspaceId: process.env.VURVEY_WORKSPACE_ID || '07e5edb5-e739-4a35-9f82-cc6cec7c0193',
  headless: process.env.HEADLESS !== "false",
  timeoutMs: 30000,
};

// ─── Claim Extraction ──────────────────────────────────────────────

/**
 * @typedef {{type: string, value: string, source: string, line: number}} Claim
 */

/**
 * Parse a single guide markdown file and extract testable claims.
 * @param {string} filePath
 * @returns {Promise<Claim[]>}
 */
async function extractClaims(filePath) {
  let text;
  try {
    text = await fs.readFile(filePath, "utf8");
  } catch {
    return [];
  }

  const claims = [];
  const basename = path.basename(filePath);
  const lines = text.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Screenshot references: ![alt](/vurvey-docs/screenshots/...)
    const imgRe = /!\[.*?\]\((\/vurvey-docs\/screenshots\/[^)]+)\)/g;
    for (const m of line.matchAll(imgRe)) {
      // Strip ?optional=1 for path check
      const imgPath = m[1].split("?")[0];
      claims.push({type: "screenshot", value: imgPath, source: basename, line: lineNum});
    }

    // Route references in inline code: `/:workspaceId/agents` or `/agents`
    const routeRe = /`(\/(?::workspaceId\/)?(?:agents|audience|people|campaigns|datasets|workflow|workspace|settings|branding|forecast|rewards|mentions|admin|integrations|canvas|survey|reel|me)(?:\/[a-z0-9\-_/.:]*)?)`/gi;
    for (const m of line.matchAll(routeRe)) {
      let route = m[1];
      // Normalize :workspaceId prefix away
      route = route.replace(/^\/:workspaceId/, "");
      if (route) claims.push({type: "route", value: route, source: basename, line: lineNum});
    }

    // UI element claims: **Bold Button Text** pattern (buttons, tabs, fields)
    const boldRe = /\*\*([A-Z][A-Za-z0-9 &]+)\*\*/g;
    for (const m of line.matchAll(boldRe)) {
      const text = m[1].trim();
      // Only consider short phrases (likely UI labels)
      if (text.length >= 3 && text.length <= 40 && !text.includes(".") && !text.includes(":")) {
        // Heuristic: if the surrounding text says "click", "button", "tab", it's likely a UI element
        const ctx = line.toLowerCase();
        if (ctx.includes("click") || ctx.includes("button") || ctx.includes("tab") || ctx.includes("field") || ctx.includes("select")) {
          claims.push({type: "ui_element", value: text, source: basename, line: lineNum});
        }
      }
    }
  }

  return claims;
}

// ─── Claim Verification ────────────────────────────────────────────

/**
 * Verify a screenshot claim by checking the file exists and is non-zero.
 * @param {Claim} claim
 * @returns {Promise<{verified: boolean, detail: string}>}
 */
async function verifyScreenshot(claim) {
  // /vurvey-docs/screenshots/... maps to docs/public/screenshots/...
  const rel = claim.value.replace(/^\/vurvey-docs\/screenshots\//, "");
  const fullPath = path.join(screenshotsDir, rel);
  try {
    const stat = await fs.stat(fullPath);
    if (stat.size > 0) {
      return {verified: true, detail: `exists (${stat.size} bytes)`};
    }
    return {verified: false, detail: "File exists but is 0 bytes"};
  } catch {
    return {verified: false, detail: "File not found"};
  }
}

/**
 * Verify a route claim by navigating and checking for non-error state.
 * @param {import("puppeteer").Page} page
 * @param {string} workspaceId
 * @param {Claim} claim
 * @returns {Promise<{verified: boolean, detail: string}>}
 */
async function verifyRoute(page, workspaceId, claim) {
  const nav = await gotoWorkspaceRoute(page, workspaceId, claim.value, {
    baseUrl: config.baseUrl,
    retries: 1,
    timeoutMs: config.timeoutMs,
  });
  if (!nav.ok) {
    return {verified: false, detail: nav.error || "Navigation failed"};
  }
  // Generic "page looks loaded" heuristic
  const hasContent = await elementExists(page, "main, h1, h2, button, a[href], table, [role='grid']", 6000);
  if (!hasContent) {
    return {verified: false, detail: "Page loaded but no meaningful content detected"};
  }
  return {verified: true, detail: "Route loads with content"};
}

/**
 * Verify a UI element claim by checking if text exists on the current page.
 * (Navigates to the page implied by the source doc first.)
 * @param {import("puppeteer").Page} page
 * @param {Claim} claim
 * @returns {Promise<{verified: boolean, detail: string}>}
 */
async function verifyUiElement(page, claim) {
  const found = await pageTextIncludes(page, claim.value);
  if (found) return {verified: true, detail: "Text found on page"};
  return {verified: false, detail: `Text "${claim.value}" not found on current page`};
}

// ─── Main ──────────────────────────────────────────────────────────

async function main() {
  if (!config.email || !config.password) {
    console.error("Error: VURVEY_EMAIL and VURVEY_PASSWORD required");
    process.exit(1);
  }

  await fs.mkdir(outDir, {recursive: true});

  // 1. Parse all guide markdown files
  console.log("Phase 1: Extracting testable claims from documentation...");
  let files;
  try {
    files = (await fs.readdir(docsDir)).filter((f) => f.endsWith(".md"));
  } catch {
    console.log("No docs/guide/ directory found. Nothing to validate.");
    process.exit(0);
  }

  /** @type {Map<string, Claim[]>} */
  const claimsByPage = new Map();
  let totalClaims = 0;

  for (const file of files) {
    const claims = await extractClaims(path.join(docsDir, file));
    if (claims.length > 0) {
      claimsByPage.set(file, claims);
      totalClaims += claims.length;
    }
  }

  console.log(`  Found ${totalClaims} testable claims across ${claimsByPage.size} pages`);

  if (totalClaims === 0) {
    console.log("No claims to verify.");
    await writeReports({pages: [], summary: {totalPages: 0, totalClaims: 0, verified: 0, failed: 0, skipped: 0}});
    process.exit(0);
  }

  // 2. Verify screenshot claims (no browser needed)
  console.log("\nPhase 2: Verifying screenshot references...");
  const screenshotResults = [];
  for (const [page, claims] of claimsByPage) {
    for (const claim of claims.filter((c) => c.type === "screenshot")) {
      const result = await verifyScreenshot(claim);
      screenshotResults.push({claim, ...result});
      const icon = result.verified ? "✓" : "✗";
      console.log(`  ${icon} [${page}:${claim.line}] ${claim.value} — ${result.detail}`);
    }
  }

  // 3. Launch browser for route + UI verification
  console.log("\nPhase 3: Verifying routes and UI elements against staging...");
  const browser = await puppeteer.launch({
    headless: config.headless,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const browserPage = await browser.newPage();
  await browserPage.setViewport({width: 1920, height: 1080});

  let workspaceId;
  try {
    workspaceId = await login(browserPage, {
      baseUrl: config.baseUrl,
      email: config.email,
      password: config.password,
      fallbackWorkspaceId: config.preferredWorkspaceId,
      preferredWorkspaceId: config.preferredWorkspaceId,
      timeoutMs: config.timeoutMs,
    });
    console.log(`  Logged in. Workspace: ${workspaceId}`);
  } catch (e) {
    console.error(`  Login failed: ${e.message}`);
    await browser.close();
    process.exit(1);
  }

  // Map doc filenames to primary routes for context.
  const docToRoute = {
    "home.md": "/",
    "agents.md": "/agents",
    "people.md": "/audience",
    "campaigns.md": "/campaigns",
    "datasets.md": "/datasets",
    "workflows.md": "/workflow/flows",
    "settings.md": "/workspace/settings",
    "branding.md": "/branding",
    "forecast.md": "/forecast",
    "rewards.md": "/rewards",
    "integrations.md": "/settings/integrations",
    "reels.md": "/reel",
    "admin.md": "/admin",
    "canvas-and-image-studio.md": "/canvas",
  };

  /** @type {Array<{page: string, claims: number, verified: number, failed: number, skipped: number, details: Array}>} */
  const pageResults = [];

  for (const [pageName, claims] of claimsByPage) {
    const details = [];
    let verified = 0;
    let failed = 0;
    let skipped = 0;

    // Navigate to the primary route for this doc before checking UI elements.
    const primaryRoute = docToRoute[pageName];
    if (primaryRoute) {
      await gotoWorkspaceRoute(browserPage, workspaceId, primaryRoute, {
        baseUrl: config.baseUrl,
        retries: 1,
        timeoutMs: config.timeoutMs,
      });
    }

    for (const claim of claims) {
      let result;
      try {
        switch (claim.type) {
          case "screenshot":
            // Already verified above
            result = screenshotResults.find((r) => r.claim === claim) || {verified: false, detail: "skipped"};
            break;
          case "route":
            result = await verifyRoute(browserPage, workspaceId, claim);
            // Navigate back to primary route after checking
            if (primaryRoute) {
              await gotoWorkspaceRoute(browserPage, workspaceId, primaryRoute, {
                baseUrl: config.baseUrl,
                retries: 1,
                timeoutMs: config.timeoutMs,
              }).catch(() => {});
            }
            break;
          case "ui_element":
            result = await verifyUiElement(browserPage, claim);
            break;
          default:
            result = {verified: false, detail: `Unknown claim type: ${claim.type}`};
        }
      } catch (e) {
        result = {verified: false, detail: `Error: ${e?.message || String(e)}`};
      }

      if (result.verified) verified++;
      else failed++;

      details.push({
        type: claim.type,
        value: claim.value,
        line: claim.line,
        verified: result.verified,
        detail: result.detail,
      });

      const icon = result.verified ? "✓" : "✗";
      console.log(`  ${icon} [${pageName}:${claim.line}] ${claim.type}: ${claim.value} — ${result.detail}`);
    }

    pageResults.push({page: pageName, claims: claims.length, verified, failed, skipped, details});
  }

  await browser.close();

  // 4. Generate reports
  const totalVerified = pageResults.reduce((s, p) => s + p.verified, 0);
  const totalFailed = pageResults.reduce((s, p) => s + p.failed, 0);
  const totalSkipped = pageResults.reduce((s, p) => s + p.skipped, 0);
  const accuracy = totalClaims > 0 ? ((totalVerified / totalClaims) * 100).toFixed(1) : "N/A";

  const summary = {totalPages: pageResults.length, totalClaims, verified: totalVerified, failed: totalFailed, skipped: totalSkipped, accuracy: `${accuracy}%`};

  await writeReports({pages: pageResults, summary});

  console.log("\n" + "=".repeat(60));
  console.log("DOCUMENTATION VALIDATION SUMMARY");
  console.log("=".repeat(60));
  console.log(`Pages: ${summary.totalPages}`);
  console.log(`Claims: ${summary.totalClaims}`);
  console.log(`Verified: ${summary.verified}`);
  console.log(`Failed: ${summary.failed}`);
  console.log(`Accuracy: ${summary.accuracy}`);
  console.log("=".repeat(60));
}

async function writeReports({pages, summary}) {
  // JSON report
  const jsonPath = path.join(outDir, "doc-validation-report.json");
  await fs.writeFile(jsonPath, JSON.stringify({summary, pages}, null, 2));
  console.log(`\nJSON report: ${jsonPath}`);

  // Markdown report
  let md = `# Documentation Validation Report\n\n`;
  md += `**Generated**: ${new Date().toISOString()}\n`;
  md += `**Target**: ${config.baseUrl}\n\n`;
  md += `## Summary\n\n`;
  md += `| Metric | Value |\n|--------|-------|\n`;
  md += `| Pages validated | ${summary.totalPages} |\n`;
  md += `| Total claims | ${summary.totalClaims} |\n`;
  md += `| Verified | ${summary.verified} |\n`;
  md += `| Failed | ${summary.failed} |\n`;
  md += `| Accuracy | ${summary.accuracy} |\n\n`;

  if (pages.length > 0) {
    md += `## Per-Page Results\n\n`;
    md += `| Page | Claims | Verified | Failed | Accuracy |\n`;
    md += `|------|--------|----------|--------|----------|\n`;
    for (const p of pages) {
      const acc = p.claims > 0 ? ((p.verified / p.claims) * 100).toFixed(0) + "%" : "N/A";
      md += `| ${p.page} | ${p.claims} | ${p.verified} | ${p.failed} | ${acc} |\n`;
    }
    md += `\n`;

    // Failed claims detail
    const failures = pages.flatMap((p) => p.details.filter((d) => !d.verified).map((d) => ({page: p.page, ...d})));
    if (failures.length > 0) {
      md += `## Failed Claims\n\n`;
      for (const f of failures) {
        md += `- **${f.page}:${f.line}** [${f.type}] \`${f.value}\` — ${f.detail}\n`;
      }
    }
  }

  const mdPath = path.join(outDir, "doc-validation-report.md");
  await fs.writeFile(mdPath, md);
  console.log(`Markdown report: ${mdPath}`);
}

main().catch((e) => {
  console.error(`Fatal error: ${e?.message || String(e)}`);
  process.exit(1);
});
