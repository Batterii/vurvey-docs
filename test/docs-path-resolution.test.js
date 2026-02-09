import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

import {
  isHttpLink,
  isOptionalHref,
  stripHashAndQuery,
  resolveDocLinkTarget,
  resolveScreenshotTarget,
} from "../scripts/lib/docs-lint-core.js";

const docsRoot = "/repo/docs";
const publicRoot = "/repo/docs/public";
const fromFile = "/repo/docs/guide/agents.md";

for (const {href, expected} of [
  {href: "https://example.com", expected: true},
  {href: "http://example.com", expected: true},
  {href: "HTTP://example.com", expected: true},
  {href: "/guide/agents", expected: false},
  {href: "mailto:test@example.com", expected: false},
]) {
  test(`isHttpLink: ${href}`, () => {
    assert.equal(isHttpLink(href), expected);
  });
}

for (const {href, expected} of [
  {href: "/a#b", expected: "/a"},
  {href: "/a?x=1", expected: "/a"},
  {href: "/a?x=1#b", expected: "/a"},
  {href: "/a#b?x=1", expected: "/a"},
  {href: "/a", expected: "/a"},
  {href: "", expected: ""},
  {href: "#only", expected: ""},
  {href: "?only=1", expected: ""},
  {href: "a/b/c#d", expected: "a/b/c"},
  {href: "a/b/c?d=e", expected: "a/b/c"},
]) {
  test(`stripHashAndQuery: ${JSON.stringify(href)}`, () => {
    assert.equal(stripHashAndQuery(href), expected);
  });
}

for (const {href, expected} of [
  {href: "/screenshots/a.png?optional=1", expected: true},
  {href: "/screenshots/a.png?x=1&optional=1", expected: true},
  {href: "/screenshots/a.png?x=1&optional=12", expected: false},
  {href: "/screenshots/a.png", expected: false},
  {href: "/a?optional=1", expected: true},
  {href: "/a?Optional=1", expected: false},
]) {
  test(`isOptionalHref: ${href}`, () => {
    assert.equal(isOptionalHref(href), expected);
  });
}

for (const {href, expected} of [
  {href: "/guide/agents", expected: path.join(docsRoot, "/guide/agents.md")},
  {href: "/guide/agents.md", expected: path.join(docsRoot, "/guide/agents.md")},
  {href: "/guide/", expected: path.join(docsRoot, "/guide/index.md")},
  {href: "/guide", expected: path.join(docsRoot, "/guide.md")},
  {href: "/guide/agents#intro", expected: path.join(docsRoot, "/guide/agents.md")},
  {href: "./people", expected: "/repo/docs/guide/people.md"},
  {href: "./people.md", expected: "/repo/docs/guide/people.md"},
  {href: "../index", expected: "/repo/docs/index.md"},
  {href: "../", expected: "/repo/docs/index.md"},
  {href: "../guide/", expected: "/repo/docs/guide/index.md"},
]) {
  test(`resolveDocLinkTarget: ${href}`, () => {
    const target = resolveDocLinkTarget({docsRoot, fromFile, href});
    assert.equal(target, expected);
  });
}

test("resolveDocLinkTarget: empty after strip -> null", () => {
  assert.equal(resolveDocLinkTarget({docsRoot, fromFile, href: "#only"}), null);
});

for (const {href, expected} of [
  {href: "/screenshots/a.png", expected: path.join(publicRoot, "/screenshots/a.png")},
  {href: "/screenshots/a.png#x", expected: path.join(publicRoot, "/screenshots/a.png")},
  {href: "/screenshots/a.png?x=1", expected: path.join(publicRoot, "/screenshots/a.png")},
  {href: "/vurvey-docs/screenshots/a.png", expected: path.join(publicRoot, "/screenshots/a.png")},
  {href: "/vurvey-docs/screenshots/a.png?optional=1", expected: path.join(publicRoot, "/screenshots/a.png")},
  {href: "./screenshots/a.png", expected: null},
  {href: "/assets/a.png", expected: null},
  {href: "", expected: null},
]) {
  test(`resolveScreenshotTarget: ${JSON.stringify(href)}`, () => {
    const target = resolveScreenshotTarget({publicRoot, href});
    assert.equal(target, expected);
  });
}

