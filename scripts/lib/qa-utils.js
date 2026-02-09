export function parseCliArgs(argv) {
  return (argv || []).reduce((acc, arg) => {
    if (!String(arg).startsWith("--")) return acc;
    const [k, v] = String(arg).slice(2).split("=");
    acc[k] = v ?? true;
    return acc;
  }, /** @type {Record<string, string|boolean>} */ ({}));
}

export function safeName(s) {
  return String(s).replace(/[^a-z0-9]/gi, "-").toLowerCase();
}

export function buildReproSteps({baseUrl, viewport, route, section, testName, selector}) {
  const steps = [
    `1. Navigate to ${baseUrl}`,
    `2. Log in with test credentials`,
  ];
  if (viewport) steps.push(`3. Set viewport: ${viewport.name} (${viewport.width}x${viewport.height})`);
  if (route) steps.push(`4. Go to: ${route}`);
  if (selector) steps.push(`5. Target selector/text: ${selector}`);
  steps.push(`6. Test: ${testName}`);
  steps.push(`7. Section: ${section || "Unknown"}`);
  return steps;
}

