import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

import {discoverWorkspaceRoutes} from "../scripts/lib/qa-discovery.js";
import {withTempDir} from "./helpers/tmp.js";

async function write(p, content) {
  await fs.mkdir(path.dirname(p), {recursive: true});
  await fs.writeFile(p, content, "utf8");
}

test("discoverWorkspaceRoutes: returns empty when dir missing", async () => {
  const {routes, scannedFiles} = await discoverWorkspaceRoutes({webManagerDir: "/does-not-exist"});
  assert.deepEqual(routes, []);
  assert.equal(scannedFiles, 0);
});

test("discoverWorkspaceRoutes: extracts core section routes from route-like files", async () => {
  await withTempDir(async (dir) => {
    const repo = path.join(dir, "vurvey-web-manager");
    const src = path.join(repo, "src");

    await write(path.join(src, "routes.ts"), `
      export const routes = [
        "/agents",
        "/agents/templates",
        "/audience",
        "/audience/community",
        "/campaigns",
        "/datasets",
        "/workflow/flows",
      ];
    `);

    await write(path.join(src, "not-routes.txt"), `"/agents/should-not-scan"`);
    await write(path.join(src, "components", "Nav.tsx"), `
      const x = "/workflow/templates";
      const y = "/workflow/upcoming/";
    `);

    const {routes, scannedFiles} = await discoverWorkspaceRoutes({webManagerDir: repo});
    assert.ok(scannedFiles >= 2);
    assert.ok(routes.includes("/agents"));
    assert.ok(routes.includes("/audience/community"));
    assert.ok(routes.includes("/workflow/templates"));
    assert.ok(routes.includes("/workflow/upcoming"));
  });
});

test("discoverWorkspaceRoutes: normalizes trailing slashes", async () => {
  await withTempDir(async (dir) => {
    const repo = path.join(dir, "vurvey-web-manager");
    const src = path.join(repo, "src");
    await write(path.join(src, "router.ts"), `export const r = "/workflow/upcoming/";`);
    const {routes} = await discoverWorkspaceRoutes({webManagerDir: repo});
    assert.deepEqual(routes, ["/workflow/upcoming"]);
  });
});

