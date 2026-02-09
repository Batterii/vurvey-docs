export function extractWorkspaceIdFromUrl(url) {
  try {
    const u = new URL(url);
    const m = u.pathname.match(/^\/([a-f0-9-]{36})(?:\/|$)/i);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

export function buildWorkspaceUrl({baseUrl, workspaceId, routePath}) {
  const p = routePath?.startsWith("/") ? routePath : `/${routePath || ""}`;
  const base = String(baseUrl || "").replace(/\/+$/, "");
  if (!workspaceId) return `${base}${p}`;
  return `${base}/${workspaceId}${p}`;
}

