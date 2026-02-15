# Documentation Fix Summary

## Change Applied

**File:** `docs/guide/people.md`
**Section:** Populations (lines 39-41)
**Date:** 2026-02-13
**Classification:** DOC_ISSUE
**Confidence:** 98%

## What Was Changed

Added a warning banner to the **Populations** section to inform users that the feature is currently in development:

```markdown
::: warning Feature In Development
The Populations feature is currently being refined and may not be available in all workspaces. If you see a "Stay tuned!" message, this feature will be enabled for your workspace soon.
:::
```

The banner was inserted immediately after the section header and before the screenshot reference.

## Why This Fixes the Issue

The documentation previously described Populations as a fully functional feature with detailed coverage of:
- Population cards, grids, and browsing functionality
- Detailed charts view (donut charts, bar charts, treemaps)
- Population analytics and persona carousels
- Creating and managing populations

However, the actual staging UI shows an empty state with the message: **"Stay tuned! We're working on unveiling the new populations feature in your workspace"**

This discrepancy created a mismatch between documented capabilities and actual user experience.

## Verified Against

- Screenshot evidence showing the "Stay tuned!" empty state message
- QA tests confirming the page loads but feature is not fully available
  - ✅ People: Page content present
  - ✅ People: Populations route loads

## Impact

Users reading the documentation will now be properly informed that:
1. The Populations feature is still being refined
2. It may not be available in their workspace yet
3. If they see a "Stay tuned!" message, the feature will be enabled soon

This prevents confusion and sets appropriate expectations while the feature is being rolled out across workspaces.
