import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

const repoRoot = new URL("..", import.meta.url).pathname;

async function readGuide(file) {
  return fs.readFile(path.join(repoRoot, "docs", "guide", file), "utf8");
}

test("docs cover staged SharePoint dataset import and workspace configuration", async () => {
  const [settings, datasets, integrations, quickReference] = await Promise.all([
    readGuide("settings.md"),
    readGuide("datasets.md"),
    readGuide("integrations.md"),
    readGuide("quick-reference.md"),
  ]);

  const allDocs = [settings, datasets, integrations, quickReference].join("\n");

  assert.match(allDocs, /SharePoint/);
  assert.match(settings, /Microsoft SharePoint/);
  assert.match(settings, /tenant id/i);
  assert.match(settings, /Application \(Client\) ID/i);
  assert.match(datasets, /Import from SharePoint/);
  assert.match(datasets, /SharePoint files/i);
  assert.match(integrations, /SharePoint/);
  assert.match(quickReference, /Import from SharePoint/);
});
