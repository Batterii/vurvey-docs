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
  'centered loading state detected',
  'missing required text',
  'missing required selector',
  'insufficient content text',
  'insufficient structured content',
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
