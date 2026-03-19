/**
 * Tests for screenshot capture retry logic and lint error classification.
 *
 * These tests verify:
 * 1. isRetryableValidationFailure correctly classifies transient vs permanent failures
 * 2. isHardError correctly separates blocking errors from soft warnings
 * 3. lintDocs treats invalid-screenshot as non-blocking when capture report is present
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

import {lintDocs, isHardError} from "../scripts/lib/docs-lint-core.js";
import {isRetryableValidationFailure} from "../scripts/lib/capture-utils.js";
import {withTempDir} from "./helpers/tmp.js";

async function write(p, content) {
  await fs.mkdir(path.dirname(p), {recursive: true});
  await fs.writeFile(p, content, "utf8");
}

// --- isRetryableValidationFailure tests ---

test("isRetryableValidationFailure: visible loaders is retryable", () => {
  assert.equal(isRetryableValidationFailure("visible loaders present"), true);
});

test("isRetryableValidationFailure: centered loading state is retryable", () => {
  assert.equal(isRetryableValidationFailure("centered loading state detected"), true);
});

test("isRetryableValidationFailure: missing required text is retryable", () => {
  assert.equal(isRetryableValidationFailure("missing required text"), true);
});

test("isRetryableValidationFailure: missing required selector is retryable", () => {
  assert.equal(isRetryableValidationFailure("missing required selector"), true);
});

test("isRetryableValidationFailure: insufficient content text is retryable", () => {
  assert.equal(isRetryableValidationFailure("insufficient content text"), true);
});

test("isRetryableValidationFailure: parameterized insufficient content is retryable", () => {
  assert.equal(isRetryableValidationFailure("insufficient content text (50 < 100)"), true);
});

test("isRetryableValidationFailure: insufficient structured content is retryable", () => {
  assert.equal(isRetryableValidationFailure("insufficient structured content (0 < 2)"), true);
});

test("isRetryableValidationFailure: expected dialog not visible is retryable", () => {
  assert.equal(isRetryableValidationFailure("expected dialog not visible"), true);
});

test("isRetryableValidationFailure: expected menu not visible is retryable", () => {
  assert.equal(isRetryableValidationFailure("expected menu not visible"), true);
});

test("isRetryableValidationFailure: route mismatch is NOT retryable", () => {
  assert.equal(isRetryableValidationFailure("route mismatch (https://staging.vurvey.dev/login)"), false);
});

test("isRetryableValidationFailure: unexpected route is NOT retryable", () => {
  assert.equal(isRetryableValidationFailure("unexpected route (https://staging.vurvey.dev/foo)"), false);
});

test("isRetryableValidationFailure: global-error-state is NOT retryable", () => {
  assert.equal(isRetryableValidationFailure("global-error-state"), false);
});

test("isRetryableValidationFailure: unexpected selector present is NOT retryable", () => {
  assert.equal(isRetryableValidationFailure("unexpected selector present"), false);
});

test("isRetryableValidationFailure: unexpected text present is NOT retryable", () => {
  assert.equal(isRetryableValidationFailure("unexpected text present"), false);
});

test("isRetryableValidationFailure: null/undefined/empty returns false", () => {
  assert.equal(isRetryableValidationFailure(null), false);
  assert.equal(isRetryableValidationFailure(undefined), false);
  assert.equal(isRetryableValidationFailure(""), false);
});

// --- isHardError tests ---

test("isHardError: missing-screenshot is a hard error", () => {
  assert.equal(isHardError({type: "missing-screenshot"}), true);
});

test("isHardError: broken-link is a hard error", () => {
  assert.equal(isHardError({type: "broken-link"}), true);
});

test("isHardError: invalid-screenshot is NOT a hard error", () => {
  assert.equal(isHardError({type: "invalid-screenshot"}), false);
});

test("isHardError: unknown types are treated as hard errors", () => {
  assert.equal(isHardError({type: "some-future-type"}), true);
});

// --- lintDocs with capture report: invalid-screenshot classification ---

test("lintDocs: invalid-screenshot from capture report is type invalid-screenshot", async () => {
  await withTempDir(async (repoRoot) => {
    const docsRoot = path.join(repoRoot, "docs");
    const publicRoot = path.join(docsRoot, "public");

    // Create a doc with a screenshot reference
    await write(path.join(docsRoot, "index.md"), "![x](/screenshots/agents/01-list.png)\n");
    // Create the screenshot file (it exists on disk)
    await write(path.join(publicRoot, "screenshots/agents/01-list.png"), "png");
    // Create a capture report marking it as invalid
    await write(
      path.join(repoRoot, "qa-output", "capture-screenshots", "capture-report.json"),
      JSON.stringify({
        screenshots: [
          {path: "agents/01-list.png", ok: false, reason: "visible loaders present"},
        ],
      }),
    );

    // Enable capture report
    const origEnv = process.env.DOCS_LINT_USE_CAPTURE_REPORT;
    process.env.DOCS_LINT_USE_CAPTURE_REPORT = "true";
    try {
      const problems = await lintDocs({repoRoot, docsRoot, publicRoot});
      assert.equal(problems.length, 1);
      assert.equal(problems[0].type, "invalid-screenshot");
      assert.equal(problems[0].detail, "visible loaders present");
      // This should NOT be a hard error
      assert.equal(isHardError(problems[0]), false);
    } finally {
      if (origEnv === undefined) {
        delete process.env.DOCS_LINT_USE_CAPTURE_REPORT;
      } else {
        process.env.DOCS_LINT_USE_CAPTURE_REPORT = origEnv;
      }
    }
  });
});

test("lintDocs: missing-screenshot is still a hard error even with capture report", async () => {
  await withTempDir(async (repoRoot) => {
    const docsRoot = path.join(repoRoot, "docs");
    const publicRoot = path.join(docsRoot, "public");

    // Doc references a screenshot that doesn't exist on disk at all
    await write(path.join(docsRoot, "index.md"), "![x](/screenshots/missing.png)\n");

    const origEnv = process.env.DOCS_LINT_USE_CAPTURE_REPORT;
    process.env.DOCS_LINT_USE_CAPTURE_REPORT = "true";
    try {
      const problems = await lintDocs({repoRoot, docsRoot, publicRoot});
      assert.equal(problems.length, 1);
      assert.equal(problems[0].type, "missing-screenshot");
      assert.equal(isHardError(problems[0]), true);
    } finally {
      if (origEnv === undefined) {
        delete process.env.DOCS_LINT_USE_CAPTURE_REPORT;
      } else {
        process.env.DOCS_LINT_USE_CAPTURE_REPORT = origEnv;
      }
    }
  });
});

test("lintDocs: ok screenshot in capture report produces no problem", async () => {
  await withTempDir(async (repoRoot) => {
    const docsRoot = path.join(repoRoot, "docs");
    const publicRoot = path.join(docsRoot, "public");

    await write(path.join(docsRoot, "index.md"), "![x](/screenshots/agents/01-list.png)\n");
    await write(path.join(publicRoot, "screenshots/agents/01-list.png"), "png");
    await write(
      path.join(repoRoot, "qa-output", "capture-screenshots", "capture-report.json"),
      JSON.stringify({
        screenshots: [{path: "agents/01-list.png", ok: true}],
      }),
    );

    const origEnv = process.env.DOCS_LINT_USE_CAPTURE_REPORT;
    process.env.DOCS_LINT_USE_CAPTURE_REPORT = "true";
    try {
      const problems = await lintDocs({repoRoot, docsRoot, publicRoot});
      assert.deepEqual(problems, []);
    } finally {
      if (origEnv === undefined) {
        delete process.env.DOCS_LINT_USE_CAPTURE_REPORT;
      } else {
        process.env.DOCS_LINT_USE_CAPTURE_REPORT = origEnv;
      }
    }
  });
});

test("lintDocs: mixed hard errors and soft warnings are correctly classified", async () => {
  await withTempDir(async (repoRoot) => {
    const docsRoot = path.join(repoRoot, "docs");
    const publicRoot = path.join(docsRoot, "public");

    await write(
      path.join(docsRoot, "index.md"),
      [
        "![x](/screenshots/exists-but-invalid.png)",
        "![y](/screenshots/totally-missing.png)",
        "[z](/guide/nonexistent)",
      ].join("\n"),
    );
    await write(path.join(publicRoot, "screenshots/exists-but-invalid.png"), "png");
    await write(
      path.join(repoRoot, "qa-output", "capture-screenshots", "capture-report.json"),
      JSON.stringify({
        screenshots: [
          {path: "exists-but-invalid.png", ok: false, reason: "centered loading state detected"},
        ],
      }),
    );

    const origEnv = process.env.DOCS_LINT_USE_CAPTURE_REPORT;
    process.env.DOCS_LINT_USE_CAPTURE_REPORT = "true";
    try {
      const problems = await lintDocs({repoRoot, docsRoot, publicRoot});
      assert.equal(problems.length, 3);

      const hardErrors = problems.filter(isHardError);
      const warnings = problems.filter((p) => !isHardError(p));

      assert.equal(hardErrors.length, 2);
      assert.equal(warnings.length, 1);
      assert.equal(warnings[0].type, "invalid-screenshot");
      assert.equal(warnings[0].detail, "centered loading state detected");
    } finally {
      if (origEnv === undefined) {
        delete process.env.DOCS_LINT_USE_CAPTURE_REPORT;
      } else {
        process.env.DOCS_LINT_USE_CAPTURE_REPORT = origEnv;
      }
    }
  });
});

test("lintDocs: capture report not found does not crash", async () => {
  await withTempDir(async (repoRoot) => {
    const docsRoot = path.join(repoRoot, "docs");
    const publicRoot = path.join(docsRoot, "public");

    await write(path.join(docsRoot, "index.md"), "![x](/screenshots/ok.png)\n");
    await write(path.join(publicRoot, "screenshots/ok.png"), "png");

    const origEnv = process.env.DOCS_LINT_USE_CAPTURE_REPORT;
    process.env.DOCS_LINT_USE_CAPTURE_REPORT = "true";
    try {
      // No capture report file exists — should not crash
      const problems = await lintDocs({repoRoot, docsRoot, publicRoot});
      assert.deepEqual(problems, []);
    } finally {
      if (origEnv === undefined) {
        delete process.env.DOCS_LINT_USE_CAPTURE_REPORT;
      } else {
        process.env.DOCS_LINT_USE_CAPTURE_REPORT = origEnv;
      }
    }
  });
});

test("lintDocs: multiple invalid-screenshot reasons from capture report", async () => {
  await withTempDir(async (repoRoot) => {
    const docsRoot = path.join(repoRoot, "docs");
    const publicRoot = path.join(docsRoot, "public");

    await write(
      path.join(docsRoot, "index.md"),
      [
        "![a](/screenshots/a.png)",
        "![b](/screenshots/b.png)",
        "![c](/screenshots/c.png)",
      ].join("\n"),
    );
    await write(path.join(publicRoot, "screenshots/a.png"), "png");
    await write(path.join(publicRoot, "screenshots/b.png"), "png");
    await write(path.join(publicRoot, "screenshots/c.png"), "png");
    await write(
      path.join(repoRoot, "qa-output", "capture-screenshots", "capture-report.json"),
      JSON.stringify({
        screenshots: [
          {path: "a.png", ok: false, reason: "visible loaders present"},
          {path: "b.png", ok: false, reason: "missing required text"},
          {path: "c.png", ok: true},
        ],
      }),
    );

    const origEnv = process.env.DOCS_LINT_USE_CAPTURE_REPORT;
    process.env.DOCS_LINT_USE_CAPTURE_REPORT = "true";
    try {
      const problems = await lintDocs({repoRoot, docsRoot, publicRoot});
      assert.equal(problems.length, 2);
      // Both should be soft warnings
      assert.ok(problems.every((p) => !isHardError(p)));
      assert.equal(problems[0].detail, "visible loaders present");
      assert.equal(problems[1].detail, "missing required text");
    } finally {
      if (origEnv === undefined) {
        delete process.env.DOCS_LINT_USE_CAPTURE_REPORT;
      } else {
        process.env.DOCS_LINT_USE_CAPTURE_REPORT = origEnv;
      }
    }
  });
});
