/**
 * Shared utilities for the screenshot capture pipeline.
 *
 * Extracted here so they can be unit-tested independently of Puppeteer.
 */

/**
 * Validation failure reasons that are transient (race conditions with page loading)
 * and worth retrying. These failures typically resolve once the SPA finishes rendering.
 *
 * Non-retryable failures include route mismatches, unexpected routes, and global error
 * states — these indicate a navigation or server problem, not a timing issue.
 */
const RETRYABLE_REASONS = new Set([
  'visible loaders present',
  'animated centered loading state detected',
  'centered loading state detected',
  'missing required text',
  'missing required selector',
  'insufficient content text',
  'insufficient structured content',
  'insufficient loaded images',
  'insufficient page content',
  'expected dialog not visible',
  'expected menu not visible',
]);

/**
 * Returns true if the given validation failure reason is likely transient
 * and the screenshot capture should be retried after additional wait time.
 */
export function isRetryableValidationFailure(reason) {
  if (!reason) return false;
  // Check exact matches first
  if (RETRYABLE_REASONS.has(reason)) return true;
  // Also match parameterized reasons like "insufficient content text (50 < 100)"
  for (const prefix of RETRYABLE_REASONS) {
    if (reason.startsWith(prefix)) return true;
  }
  return false;
}

export function diagnosticsHasRenderableMainContent(diagnostics = {}) {
  const structuredCount = Number(diagnostics.structuredCount || 0);
  const mainTextLength = Number(diagnostics.mainTextLength || 0);
  const centeredSpinnerCount = Number(diagnostics.centeredSpinnerCount || 0);
  const hasStructuredContent = structuredCount > 0;
  const iconOnly = centeredSpinnerCount > 0 && mainTextLength < 40 && !hasStructuredContent;

  if (iconOnly) return false;
  if (centeredSpinnerCount > 0 && mainTextLength < 300 && structuredCount <= 4) {
    return false;
  }
  return hasStructuredContent || mainTextLength >= 80;
}

export function isBlockingVisibleLoader(diagnostics = {}) {
  return Number(diagnostics.visibleLoaderCount || 0) > 0 && !diagnosticsHasRenderableMainContent(diagnostics);
}

export function isBlockingCenteredSpinner(diagnostics = {}) {
  const hasCenteredSpinner =
    Number(diagnostics.animatedCenteredSpinnerCount || 0) > 0 ||
    Number(diagnostics.centeredSpinnerCount || 0) > 0;

  return hasCenteredSpinner && !diagnosticsHasRenderableMainContent(diagnostics);
}
