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
import {lintDocs} from "./lib/docs-lint-core.js";

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

  console.error(`docs-lint: ${problems.length} problem(s) found`);
  for (const p of problems) {
    const relFile = path.relative(repoRoot, p.file);
    const relTarget = path.relative(repoRoot, p.target);
    console.error(`- [${p.type}] ${relFile}: ${p.href} -> ${relTarget}`);
  }
  process.exit(1);
}

main().catch((err) => {
  console.error(`docs-lint: fatal: ${err?.stack || err?.message || String(err)}`);
  process.exit(1);
});
