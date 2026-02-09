import test from "node:test";
import assert from "node:assert/strict";

import {buildReproSteps, parseCliArgs, safeName} from "../scripts/lib/qa-utils.js";

test("parseCliArgs: empty -> {}", () => {
  assert.deepEqual(parseCliArgs([]), {});
});

test("parseCliArgs: ignores non -- args", () => {
  assert.deepEqual(parseCliArgs(["foo", "bar"]), {});
});

test("parseCliArgs: parses boolean flags", () => {
  assert.deepEqual(parseCliArgs(["--quick", "--strict"]), {quick: true, strict: true});
});

test("parseCliArgs: parses --k=v", () => {
  assert.deepEqual(parseCliArgs(["--viewport=mobile"]), {viewport: "mobile"});
});

test("parseCliArgs: keeps string 'false' as string", () => {
  assert.deepEqual(parseCliArgs(["--headless=false"]), {headless: "false"});
});

test("safeName: lowercases and replaces non-alnum", () => {
  assert.equal(safeName("Hello, World!"), "hello--world-");
});

test("safeName: handles numbers", () => {
  assert.equal(safeName("A1 B2"), "a1-b2");
});

test("buildReproSteps: includes base steps and test name", () => {
  const steps = buildReproSteps({baseUrl: "https://x", testName: "T"});
  assert.equal(steps[0], "1. Navigate to https://x");
  assert.equal(steps[1], "2. Log in with test credentials");
  assert.equal(steps.at(-2), "6. Test: T");
});

test("buildReproSteps: includes viewport/route/selector when provided", () => {
  const steps = buildReproSteps({
    baseUrl: "https://x",
    viewport: {name: "Desktop", width: 10, height: 20},
    route: "/a",
    section: "S",
    testName: "T",
    selector: "button",
  });
  assert.ok(steps.some((s) => s.includes("Set viewport: Desktop (10x20)")));
  assert.ok(steps.some((s) => s.includes("Go to: /a")));
  assert.ok(steps.some((s) => s.includes("Target selector/text: button")));
  assert.equal(steps.at(-1), "7. Section: S");
});

