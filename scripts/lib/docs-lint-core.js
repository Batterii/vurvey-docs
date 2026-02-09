import fs from "fs/promises";
import path from "path";

export function isHttpLink(href) {
  return /^https?:\/\//i.test(href);
}

export function stripHashAndQuery(href) {
  return href.split("#")[0].split("?")[0];
}

export function isOptionalHref(href) {
  // Allow optional screenshots/docs refs without failing CI.
  // Intended use: append `?optional=1` to image src.
  return /\boptional=1\b/.test(href);
}

export async function fileExists(p) {
  try {
    const st = await fs.stat(p);
    return st.isFile();
  } catch {
    return false;
  }
}

export async function listMarkdownFiles(dir) {
  const out = [];
  const entries = await fs.readdir(dir, {withFileTypes: true});
  for (const ent of entries) {
    if (ent.name.startsWith(".vitepress")) continue;
    if (ent.name === "node_modules") continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      out.push(...(await listMarkdownFiles(full)));
    } else if (ent.isFile() && ent.name.endsWith(".md")) {
      out.push(full);
    }
  }
  return out;
}

export function extractMarkdownLinks(md) {
  // Captures:
  // - images: ![alt](href)
  // - links: [text](href)
  // - html imgs: <img src="href" ...>
  // - vue imgs: <img :src="'href'" ...>
  const hrefs = [];
  const mdLinkRe = /!?\[[^\]]*\]\(([^)\s]+)(?:\s+\"[^\"]*\")?\)/g;
  // Avoid matching Vue bindings like ":src=..." by requiring "src" not be preceded by ":".
  const htmlImgRe = /<img[^>]+(?<!:)src\s*=\s*["']([^"']+)["'][^>]*>/gi;
  const vueImgReDouble = /<img[^>]+:src\s*=\s*"([^"]+)"[^>]*>/gi;
  const vueImgReSingle = /<img[^>]+:src\s*=\s*'([^']+)'[^>]*>/gi;

  for (const m of md.matchAll(mdLinkRe)) hrefs.push(m[1]);
  for (const m of md.matchAll(htmlImgRe)) hrefs.push(m[1]);
  for (const m of md.matchAll(vueImgReDouble)) {
    let v = m[1];
    // :src is usually a JS expression, commonly a string literal.
    // We only support simple quoted literals so docs-lint can still validate paths.
    if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) {
      v = v.slice(1, -1);
    }
    hrefs.push(v);
  }
  for (const m of md.matchAll(vueImgReSingle)) {
    let v = m[1];
    if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) {
      v = v.slice(1, -1);
    }
    hrefs.push(v);
  }
  return hrefs;
}

export function resolveDocLinkTarget({docsRoot, fromFile, href}) {
  // VitePress behavior:
  // - /guide/foo -> docs/guide/foo.md
  // - /guide/ -> docs/guide/index.md
  // - relative links are relative to current file directory
  const raw = stripHashAndQuery(href);
  if (!raw) return null;

  if (raw.startsWith("/")) {
    const abs = path.join(docsRoot, raw);
    if (raw.endsWith("/")) return `${abs}index.md`;
    if (raw.endsWith(".md")) return abs;
    return `${abs}.md`;
  }

  const baseDir = path.dirname(fromFile);
  const abs = path.resolve(baseDir, raw);
  if (raw.endsWith("/")) return path.join(abs, "index.md");
  if (raw.endsWith(".md")) return abs;
  // Support links like ./foo (no extension)
  return `${abs}.md`;
}

export function resolveScreenshotTarget({publicRoot, href}) {
  // In docs markdown we use absolute paths like /screenshots/...
  const raw = stripHashAndQuery(href);
  if (!raw) return null;

  // VitePress base is /vurvey-docs/ but markdown generally uses /screenshots/...
  // Handle both.
  const normalized = raw.startsWith("/vurvey-docs/") ? raw.slice("/vurvey-docs".length) : raw;
  if (!normalized.startsWith("/screenshots/")) return null;

  return path.join(publicRoot, normalized);
}

export async function lintDocs({repoRoot, docsRoot, publicRoot}) {
  const mdFiles = await listMarkdownFiles(docsRoot);
  const problems = [];

  for (const file of mdFiles) {
    const content = await fs.readFile(file, "utf8");
    const hrefs = extractMarkdownLinks(content);

    for (const href of hrefs) {
      if (!href) continue;
      if (href.startsWith("mailto:")) continue;
      if (isHttpLink(href)) continue;

      const screenshotTarget = resolveScreenshotTarget({publicRoot, href});
      if (screenshotTarget) {
        if (isOptionalHref(href)) continue;
        const ok = await fileExists(screenshotTarget);
        if (!ok) {
          problems.push({
            type: "missing-screenshot",
            file,
            href,
            target: screenshotTarget,
          });
        }
        continue;
      }

      // Only lint internal doc links that look like docs pages.
      const looksLikeDoc =
        href.startsWith("/") ||
        href.startsWith("./") ||
        href.startsWith("../") ||
        href.endsWith(".md");
      if (!looksLikeDoc) continue;

      const target = resolveDocLinkTarget({docsRoot, fromFile: file, href});
      if (!target) continue;
      const ok = await fileExists(target);
      if (!ok) {
        problems.push({type: "broken-link", file, href, target});
      }
    }
  }

  // Provide stable, debug-friendly sort order for callers.
  problems.sort((a, b) => {
    const af = path.relative(repoRoot, a.file);
    const bf = path.relative(repoRoot, b.file);
    if (af !== bf) return af.localeCompare(bf);
    const ah = a.href || "";
    const bh = b.href || "";
    if (ah !== bh) return ah.localeCompare(bh);
    return String(a.type).localeCompare(String(b.type));
  });

  return problems;
}
