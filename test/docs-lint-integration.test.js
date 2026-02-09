import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

import {lintDocs} from "../scripts/lib/docs-lint-core.js";
import {withTempDir} from "./helpers/tmp.js";

async function write(p, content) {
  await fs.mkdir(path.dirname(p), {recursive: true});
  await fs.writeFile(p, content, "utf8");
}

test("lintDocs: no problems for empty docs tree", async () => {
  await withTempDir(async (repoRoot) => {
    const docsRoot = path.join(repoRoot, "docs");
    const publicRoot = path.join(docsRoot, "public");
    await fs.mkdir(docsRoot, {recursive: true});
    const problems = await lintDocs({repoRoot, docsRoot, publicRoot});
    assert.deepEqual(problems, []);
  });
});

test("lintDocs: flags missing screenshot assets", async () => {
  await withTempDir(async (repoRoot) => {
    const docsRoot = path.join(repoRoot, "docs");
    const publicRoot = path.join(docsRoot, "public");
    await write(path.join(docsRoot, "index.md"), "![x](/screenshots/missing.png)\n");
    const problems = await lintDocs({repoRoot, docsRoot, publicRoot});
    assert.equal(problems.length, 1);
    assert.equal(problems[0].type, "missing-screenshot");
    assert.equal(problems[0].href, "/screenshots/missing.png");
  });
});

test("lintDocs: does not flag optional screenshots (?optional=1)", async () => {
  await withTempDir(async (repoRoot) => {
    const docsRoot = path.join(repoRoot, "docs");
    const publicRoot = path.join(docsRoot, "public");
    await write(path.join(docsRoot, "index.md"), "![x](/screenshots/missing.png?optional=1)\n");
    const problems = await lintDocs({repoRoot, docsRoot, publicRoot});
    assert.deepEqual(problems, []);
  });
});

test("lintDocs: does not flag existing screenshot assets", async () => {
  await withTempDir(async (repoRoot) => {
    const docsRoot = path.join(repoRoot, "docs");
    const publicRoot = path.join(docsRoot, "public");
    await write(path.join(docsRoot, "index.md"), "![x](/screenshots/ok.png)\n");
    await write(path.join(publicRoot, "screenshots/ok.png"), "png");
    const problems = await lintDocs({repoRoot, docsRoot, publicRoot});
    assert.deepEqual(problems, []);
  });
});

test("lintDocs: flags broken absolute doc links", async () => {
  await withTempDir(async (repoRoot) => {
    const docsRoot = path.join(repoRoot, "docs");
    const publicRoot = path.join(docsRoot, "public");
    await write(path.join(docsRoot, "index.md"), "[Agents](/guide/agents)\n");
    const problems = await lintDocs({repoRoot, docsRoot, publicRoot});
    assert.equal(problems.length, 1);
    assert.equal(problems[0].type, "broken-link");
    assert.equal(problems[0].href, "/guide/agents");
  });
});

test("lintDocs: accepts absolute doc links when target exists", async () => {
  await withTempDir(async (repoRoot) => {
    const docsRoot = path.join(repoRoot, "docs");
    const publicRoot = path.join(docsRoot, "public");
    await write(path.join(docsRoot, "index.md"), "[Agents](/guide/agents)\n");
    await write(path.join(docsRoot, "guide/agents.md"), "# Agents\n");
    const problems = await lintDocs({repoRoot, docsRoot, publicRoot});
    assert.deepEqual(problems, []);
  });
});

test("lintDocs: flags broken relative doc links", async () => {
  await withTempDir(async (repoRoot) => {
    const docsRoot = path.join(repoRoot, "docs");
    const publicRoot = path.join(docsRoot, "public");
    await write(path.join(docsRoot, "guide/a.md"), "[B](./b)\n");
    const problems = await lintDocs({repoRoot, docsRoot, publicRoot});
    assert.equal(problems.length, 1);
    assert.equal(problems[0].type, "broken-link");
    assert.equal(problems[0].href, "./b");
  });
});

test("lintDocs: ignores http, mailto, and anchor-only links", async () => {
  await withTempDir(async (repoRoot) => {
    const docsRoot = path.join(repoRoot, "docs");
    const publicRoot = path.join(docsRoot, "public");
    await write(
      path.join(docsRoot, "index.md"),
      [
        "[x](https://example.com)",
        "[x](mailto:test@example.com)",
        "[x](#section)",
      ].join("\n"),
    );
    const problems = await lintDocs({repoRoot, docsRoot, publicRoot});
    assert.deepEqual(problems, []);
  });
});

test("lintDocs: normalizes /vurvey-docs/screenshots/* into publicRoot/screenshots", async () => {
  await withTempDir(async (repoRoot) => {
    const docsRoot = path.join(repoRoot, "docs");
    const publicRoot = path.join(docsRoot, "public");
    await write(path.join(docsRoot, "index.md"), "![x](/vurvey-docs/screenshots/a.png)\n");
    await write(path.join(publicRoot, "screenshots/a.png"), "png");
    const problems = await lintDocs({repoRoot, docsRoot, publicRoot});
    assert.deepEqual(problems, []);
  });
});

test("lintDocs: sort order is stable (by file then href)", async () => {
  await withTempDir(async (repoRoot) => {
    const docsRoot = path.join(repoRoot, "docs");
    const publicRoot = path.join(docsRoot, "public");
    await write(path.join(docsRoot, "b.md"), "![x](/screenshots/z.png)\n");
    await write(path.join(docsRoot, "a.md"), "![x](/screenshots/a.png)\n");
    const problems = await lintDocs({repoRoot, docsRoot, publicRoot});
    assert.equal(problems.length, 2);
    assert.equal(path.basename(problems[0].file), "a.md");
    assert.equal(problems[0].href, "/screenshots/a.png");
    assert.equal(path.basename(problems[1].file), "b.md");
  });
});

