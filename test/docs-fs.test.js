import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

import {fileExists, listMarkdownFiles} from "../scripts/lib/docs-lint-core.js";
import {withTempDir} from "./helpers/tmp.js";

test("fileExists: returns true for a file", async () => {
  await withTempDir(async (dir) => {
    const p = path.join(dir, "a.txt");
    await fs.writeFile(p, "x");
    assert.equal(await fileExists(p), true);
  });
});

test("fileExists: returns false for a missing path", async () => {
  await withTempDir(async (dir) => {
    assert.equal(await fileExists(path.join(dir, "missing.txt")), false);
  });
});

test("fileExists: returns false for a directory", async () => {
  await withTempDir(async (dir) => {
    const p = path.join(dir, "d");
    await fs.mkdir(p);
    assert.equal(await fileExists(p), false);
  });
});

test("listMarkdownFiles: finds .md files recursively", async () => {
  await withTempDir(async (dir) => {
    await fs.mkdir(path.join(dir, "a/b"), {recursive: true});
    await fs.writeFile(path.join(dir, "root.md"), "# root");
    await fs.writeFile(path.join(dir, "a", "x.md"), "# x");
    await fs.writeFile(path.join(dir, "a/b", "y.md"), "# y");
    const files = (await listMarkdownFiles(dir)).sort();
    assert.deepEqual(files, [
      path.join(dir, "a", "x.md"),
      path.join(dir, "a/b", "y.md"),
      path.join(dir, "root.md"),
    ].sort());
  });
});

test("listMarkdownFiles: ignores .vitepress directory", async () => {
  await withTempDir(async (dir) => {
    await fs.mkdir(path.join(dir, ".vitepress"), {recursive: true});
    await fs.writeFile(path.join(dir, ".vitepress", "should-not.md"), "# no");
    const files = await listMarkdownFiles(dir);
    assert.deepEqual(files, []);
  });
});

test("listMarkdownFiles: ignores node_modules directory", async () => {
  await withTempDir(async (dir) => {
    await fs.mkdir(path.join(dir, "node_modules/pkg"), {recursive: true});
    await fs.writeFile(path.join(dir, "node_modules/pkg", "should-not.md"), "# no");
    const files = await listMarkdownFiles(dir);
    assert.deepEqual(files, []);
  });
});

test("listMarkdownFiles: ignores non-markdown files", async () => {
  await withTempDir(async (dir) => {
    await fs.writeFile(path.join(dir, "a.txt"), "x");
    await fs.writeFile(path.join(dir, "b.mdx"), "x");
    const files = await listMarkdownFiles(dir);
    assert.deepEqual(files, []);
  });
});

