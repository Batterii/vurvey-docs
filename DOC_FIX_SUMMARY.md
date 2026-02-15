# Documentation Fix Summary

## What Was Changed

Added documentation for the empty state when a workspace has no workflows yet.

**Location:** `docs/guide/workflows.md` lines 34-36

**Change:** Inserted an info callout box explaining that new users will see an empty state with a "Create new workflow" button when they first access the Workflows page.

## Why It Fixes the Issue

The QA test "Workflow: Builder UI visible / Builder canvas loads / Upcoming runs page content" was failing because the documentation didn't address the initial empty state that users encounter in a new workspace.

The original documentation jumped directly into describing workflow cards in a grid layout, which assumes workflows already exist. This created a documentation gap for first-time users who would see an empty state instead.

The fix adds a clear callout explaining:
- What users see when accessing Workflows for the first time (empty state)
- What action they should take (click "Create new workflow")
- Why this is the starting point (to build their first automation pipeline)

## Files and Sections Modified

- **File:** `docs/guide/workflows.md`
- **Section:** "Browsing Your Workflows" (lines 30-50)
- **Type:** Added info callout
- **Lines added:** 3 lines (34-36)

## Technical Details

The change:
1. Preserves existing VitePress formatting (using `:::` info callout syntax)
2. Maintains the documentation style and tone
3. Adds context before the existing "Once you've created workflows" text
4. Uses consistent markdown formatting with the rest of the document
5. Provides actionable guidance for new users

This fix addresses the classification: `DOC_ISSUE` with confidence level 0.9, ensuring users understand the empty state experience in the Workflows section.
