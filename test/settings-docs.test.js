import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test("settings guide includes Integrations section linking to dedicated integrations page", async () => {
  const settingsPath = path.join(__dirname, "..", "docs", "guide", "settings.md");
  const markdown = await fs.readFile(settingsPath, "utf8");

  assert.match(markdown, /^## Integrations$/m);
  assert.match(markdown, /\[Integrations\]\(\/guide\/integrations\)/);
});
