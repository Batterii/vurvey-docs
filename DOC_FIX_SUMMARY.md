# Documentation Fix Summary

## Change Applied

**File:** `docs/guide/people.md`
**Section:** Populations (lines 37-117)
**Date:** 2026-02-14

## What Was Changed

Updated the **Populations** section to accurately reflect that this feature is under active development and not yet available to users.

### 1. Updated Warning Banner

Changed from:
> "The Populations feature is currently being refined and may not be available in all workspaces. If you see a 'Stay tuned!' message, this feature will be enabled for your workspace soon."

To:
> "The Populations feature is currently under active development and not yet available. If you see a 'Stay tuned! We're working on unveiling the new populations feature' message when navigating to this tab, this is expected. This feature will be enabled for your workspace in a future release."

### 2. Converted Present Tense to Future Tense

Changed all feature descriptions from present tense (implying availability) to future tense (indicating planned functionality):
- "Populations are" → "Populations will be"
- "Use them to simulate" → "you'll be able to use them to simulate"
- "Populations let you create" → "Populations will let you create"
- "Populations appear" → "Populations will appear"
- "The details page includes" → "The details page will include"
- "The charts view provides" → "The charts view will provide"
- "Donut charts show" → "Donut charts will show"
- And similar changes throughout all subsections

### 3. Marked Screenshots as Optional

- Changed `/screenshots/people/02-populations.png` to `/screenshots/people/02-populations.png?optional=1`
- Changed `/screenshots/people/02a-population-charts.png` to `/screenshots/people/02a-population-charts.png?optional=1`

This prevents documentation linting errors for missing screenshots of an unreleased feature.

## Why This Fixes the Issue

The QA test failure screenshot (`qa-failure-screenshots/failure-people--page-content-present-desktop-*.png`) showed that navigating to the Populations tab displays:

> "Stay tuned! We're working on unveiling the new populations feature"

This message clearly indicates the feature is not yet functional. However, the documentation was describing the feature as if it were fully available and operational, which would confuse users who encounter the "Stay tuned" message.

By converting the documentation to future tense and updating the warning banner, users will now understand that:
1. This is a planned feature, not a current one
2. Seeing the "Stay tuned" message is normal and expected behavior
3. The documentation describes how the feature **will** work once it's released

## Related QA Test

This fix addresses the QA test failure: **"People: Page content present / People: Populations route loads"**

## Classification

- **Issue Type**: DOC_ISSUE (documentation out of sync with actual application behavior)
- **Confidence**: 95% (high confidence based on QA test failure evidence)

## Verification

The fix can be verified by:
1. Reading the updated `docs/guide/people.md` file (lines 37-117)
2. Confirming all language is now future tense
3. Checking that the warning banner explicitly mentions the "Stay tuned" message as expected behavior
4. Validating that screenshots are marked as optional to prevent lint errors
