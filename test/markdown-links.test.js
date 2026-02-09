import test from "node:test";
import assert from "node:assert/strict";

import {extractMarkdownLinks} from "../scripts/lib/docs-lint-core.js";

test("extractMarkdownLinks: empty markdown -> []", () => {
  assert.deepEqual(extractMarkdownLinks(""), []);
});

test("extractMarkdownLinks: plain text -> []", () => {
  assert.deepEqual(extractMarkdownLinks("hello world"), []);
});

test("extractMarkdownLinks: basic link", () => {
  assert.deepEqual(extractMarkdownLinks("[A](/guide/agents)"), ["/guide/agents"]);
});

test("extractMarkdownLinks: basic image", () => {
  assert.deepEqual(extractMarkdownLinks("![Alt](/screenshots/home.png)"), ["/screenshots/home.png"]);
});

test("extractMarkdownLinks: link with title", () => {
  assert.deepEqual(extractMarkdownLinks('[A](/guide/agents "Agents")'), ["/guide/agents"]);
});

test("extractMarkdownLinks: image with title", () => {
  assert.deepEqual(extractMarkdownLinks('![Alt](/screenshots/home.png "Home")'), ["/screenshots/home.png"]);
});

test("extractMarkdownLinks: multiple markdown links", () => {
  const md = "[A](/a) and [B](/b) and ![C](/c.png)";
  assert.deepEqual(extractMarkdownLinks(md), ["/a", "/b", "/c.png"]);
});

test("extractMarkdownLinks: ignores reference-style links (not supported)", () => {
  const md = "[A][ref]\n\n[ref]: /guide/agents\n";
  assert.deepEqual(extractMarkdownLinks(md), []);
});

test("extractMarkdownLinks: captures querystring", () => {
  assert.deepEqual(extractMarkdownLinks("[A](/guide/agents?x=1)"), ["/guide/agents?x=1"]);
});

test("extractMarkdownLinks: captures hash", () => {
  assert.deepEqual(extractMarkdownLinks("[A](/guide/agents#sec)"), ["/guide/agents#sec"]);
});

test("extractMarkdownLinks: captures mailto (filtering happens later)", () => {
  assert.deepEqual(extractMarkdownLinks("[Email](mailto:test@example.com)"), ["mailto:test@example.com"]);
});

test("extractMarkdownLinks: captures http link (filtering happens later)", () => {
  assert.deepEqual(extractMarkdownLinks("[Site](https://example.com)"), ["https://example.com"]);
});

test("extractMarkdownLinks: html img with double quotes", () => {
  assert.deepEqual(extractMarkdownLinks('<img src="/screenshots/a.png" alt="x">'), ["/screenshots/a.png"]);
});

test("extractMarkdownLinks: html img with single quotes", () => {
  assert.deepEqual(extractMarkdownLinks("<img alt='x' src='/screenshots/a.png'>"), ["/screenshots/a.png"]);
});

test("extractMarkdownLinks: html img attributes out of order", () => {
  assert.deepEqual(extractMarkdownLinks('<img class="c" src="/screenshots/a.png" />'), ["/screenshots/a.png"]);
});

test("extractMarkdownLinks: html img uppercase SRC", () => {
  assert.deepEqual(extractMarkdownLinks('<img SRC="/screenshots/a.png">'), ["/screenshots/a.png"]);
});

test("extractMarkdownLinks: html img ignores missing src", () => {
  assert.deepEqual(extractMarkdownLinks("<img alt='x'>"), []);
});

test("extractMarkdownLinks: html img captures external URL", () => {
  assert.deepEqual(extractMarkdownLinks('<img src="https://example.com/a.png">'), ["https://example.com/a.png"]);
});

test("extractMarkdownLinks: vue img :src with single-quoted string literal", () => {
  assert.deepEqual(
    extractMarkdownLinks("<img :src=\"'/screenshots/a.png?optional=1'\" @error=\"$event.target.remove()\">"),
    ["/screenshots/a.png?optional=1"],
  );
});

test("extractMarkdownLinks: vue img :src with double-quoted string literal", () => {
  assert.deepEqual(
    extractMarkdownLinks("<img :src='\"/screenshots/a.png\"' />"),
    ["/screenshots/a.png"],
  );
});

test("extractMarkdownLinks: vue img :src with non-literal expression is returned verbatim", () => {
  assert.deepEqual(
    extractMarkdownLinks("<img :src=\"getUrl('/screenshots/a.png')\" />"),
    ["getUrl('/screenshots/a.png')"],
  );
});

test("extractMarkdownLinks: markdown link with spaces in parens is not captured (current behavior)", () => {
  assert.deepEqual(extractMarkdownLinks("[A](/a b)"), []);
});

test("extractMarkdownLinks: markdown link with closing paren in URL is truncated (current behavior)", () => {
  assert.deepEqual(extractMarkdownLinks("[A](/a(b))"), ["/a(b"]);
});

test("extractMarkdownLinks: multiline markdown still matches", () => {
  const md = [
    "Intro",
    "",
    "[A](/a)",
    "",
    "![B](/b.png)",
  ].join("\n");
  assert.deepEqual(extractMarkdownLinks(md), ["/a", "/b.png"]);
});

test("extractMarkdownLinks: matches empty alt text", () => {
  assert.deepEqual(extractMarkdownLinks("![](/a.png)"), ["/a.png"]);
});

test("extractMarkdownLinks: matches empty link text", () => {
  assert.deepEqual(extractMarkdownLinks("[](/a)"), ["/a"]);
});

test("extractMarkdownLinks: ignores malformed markdown", () => {
  assert.deepEqual(extractMarkdownLinks("[A](/a"), []);
});

test("extractMarkdownLinks: handles many links without crashing", () => {
  const parts = [];
  for (let i = 0; i < 50; i++) parts.push(`[L${i}](/p/${i})`);
  const hrefs = extractMarkdownLinks(parts.join(" "));
  assert.equal(hrefs.length, 50);
  assert.equal(hrefs[0], "/p/0");
  assert.equal(hrefs[49], "/p/49");
});
