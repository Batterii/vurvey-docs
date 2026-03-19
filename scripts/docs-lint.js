#!/usr/bin/env node

/**
 * VitePress docs linter (fast, repo-local, CI-friendly).
 *
 * Checks:
 * - Referenced screenshot assets under docs/public/ exist
 * - Internal doc links resolve to an existing .md page
 *
 * Usage:
 *   node scripts/docs-lint.js
 */

import path from "path";
import {fileURLToPath} from "url";
import {lintDocs, isHardError} from "./lib/docs-lint-core.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");
const docsRoot = path.join(repoRoot, "docs");
const publicRoot = path.join(docsRoot, "public");

async function main() {
  const problems = await lintDocs({repoRoot, docsRoot, publicRoot});

  if (problems.length === 0) {
    console.log("docs-lint: OK");
    process.exit(0);
  }

  const hardErrors = problems.filter(isHardError);
  const warnings = problems.filter((p) => !isHardError(p));

  // Always print warnings (invalid-screenshot from capture report)
  if (warnings.length > 0) {
    console.warn(`docs-lint: ${warnings.length} warning(s) (screenshot capture quality)`);
    for (const p of warnings) {
      const relFile = path.relative(repoRoot, p.file);
      const relTarget = path.relative(repoRoot, p.target);
      const detail = p.detail ? ` (${p.detail})` : "";
      console.warn(`  ⚠ [${p.type}] ${relFile}: ${p.href} -> ${relTarget}${detail}`);
    }
  }

  // Hard errors block CI
  if (hardErrors.length > 0) {
    console.error(`docs-lint: ${hardErrors.length} error(s) found`);
    for (const p of hardErrors) {
      const relFile = path.relative(repoRoot, p.file);
      const relTarget = path.relative(repoRoot, p.target);
      const detail = p.detail ? ` (${p.detail})` : "";
      console.error(`- [${p.type}] ${relFile}: ${p.href} -> ${relTarget}${detail}`);
    }
    process.exit(1);
  }

  // Only warnings — exit successfully
  console.log("docs-lint: OK (with warnings)");
  process.exit(0);
}

main().catch((err) => {
  console.error(`docs-lint: fatal: ${err?.stack || err?.message || String(err)}`);
  process.exit(1);
});
