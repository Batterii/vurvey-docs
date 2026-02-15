# Documentation Fix Summary

## What Was Changed

Updated the warning box in the Populations section of `docs/guide/people.md` (lines 37-41) to clarify that seeing a "Stay tuned!" message is **expected behavior** when the Populations feature is not enabled for a workspace.

## Why It Fixes the Issue

**Before:** The warning suggested that the feature "will be enabled for your workspace soon," which:
- Implied the feature would automatically be activated
- Set incorrect expectations about timing
- Didn't acknowledge this as normal/expected state

**After:** The warning now:
- Explicitly states the "Stay tuned!" message is expected behavior
- Clarifies the feature has not been activated (not "in development")
- Provides actionable guidance (contact account manager/support)
- Removes ambiguous promise of "soon"

This addresses the QA test failure where the page showed the "Stay tuned" empty state, which was being flagged but is actually correct behavior for workspaces without the feature enabled.

## Files and Sections Modified

- **File:** `docs/guide/people.md`
- **Section:** Populations (lines 37-41)
- **Change type:** Clarification of expected behavior
- **Warning box title:** Changed from "Feature In Development" to "Feature Availability"

## Related QA Test

This fix addresses the QA test: **"People: Page content present"** which was detecting the empty state but the documentation wasn't clear that this was expected.
