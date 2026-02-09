import fs from "fs/promises";
import path from "path";

function isLikelyRouteFile(p) {
  const lower = p.toLowerCase();
  if (!/\.(tsx?|jsx?)$/.test(lower)) return false;
  if (lower.includes("/node_modules/")) return false;
  // Bias toward where routes are usually defined.
  return lower.includes("route") || lower.includes("routes") || lower.includes("router") || lower.includes("nav");
}

async function* walk(dir) {
  const entries = await fs.readdir(dir, {withFileTypes: true});
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "node_modules" || ent.name.startsWith(".")) continue;
      yield* walk(full);
    } else if (ent.isFile()) {
      yield full;
    }
  }
}

function extractCandidateRoutesFromText(text) {
  // Pull out string literals that look like route paths.
  // This is intentionally conservative: we only want core app sections.
  const out = [];
  const re = /['"`](\/(?:agents|audience|campaigns|datasets|workflow)(?:\/[a-z0-9\-_/.:]+)?)['"`]/gi;
  for (const m of text.matchAll(re)) out.push(m[1]);
  return out;
}

function normalizeRoute(r) {
  if (!r || typeof r !== "string") return null;
  if (!r.startsWith("/")) return null;
  // Strip trailing slash (except root "/").
  if (r.length > 1 && r.endsWith("/")) return r.slice(0, -1);
  return r;
}

export async function discoverWorkspaceRoutes({webManagerDir}) {
  if (!webManagerDir) return {routes: [], scannedFiles: 0};

  const srcDir = path.join(webManagerDir, "src");
  try {
    const st = await fs.stat(srcDir);
    if (!st.isDirectory()) return {routes: [], scannedFiles: 0};
  } catch {
    return {routes: [], scannedFiles: 0};
  }

  const routes = new Set();
  let scannedFiles = 0;

  for await (const p of walk(srcDir)) {
    if (!isLikelyRouteFile(p)) continue;
    scannedFiles++;
    let text = "";
    try {
      text = await fs.readFile(p, "utf8");
    } catch {
      continue;
    }
    for (const r of extractCandidateRoutesFromText(text)) {
      const norm = normalizeRoute(r);
      if (!norm) continue;
      routes.add(norm);
    }
  }

  // Prefer deterministic order; keep it bounded so deep mode doesn't explode runtime.
  const sorted = [...routes].sort();
  const capped = [];
  const perPrefixCap = new Map();
  for (const r of sorted) {
    const prefix = r.split("/").slice(0, 2).join("/") || "/";
    const n = perPrefixCap.get(prefix) || 0;
    if (n >= 25) continue;
    perPrefixCap.set(prefix, n + 1);
    capped.push(r);
  }

  return {routes: capped, scannedFiles};
}

