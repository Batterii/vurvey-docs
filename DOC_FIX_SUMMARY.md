# Documentation Fix Summary

## Issue Addressed
Updated the Populations section in the People guide to correctly indicate that the feature is not yet available, rather than describing it as a current capability.

## Changes Made

### File Modified
`docs/guide/people.md`

### Specific Changes (Lines 37-114)

1. **Main Warning Box (Line 39-41)**
   - Changed from: `warning Feature In Development`
   - Changed to: `danger Feature Not Yet Available`
   - Updated message to clearly state "not yet available" instead of "being refined"
   - Changed phrasing from "will be enabled for your workspace soon" to "is still being developed"

2. **Introduction Paragraph (Line 48)**
   - Changed: "Populations are" → "Populations will be"
   - Changed: "Use them to" → "When available, you'll be able to use them to"
   - Rewrote from present tense to future tense

3. **"Why Use Populations?" Section (Line 50)**
   - Added qualifier: "(When Available)" to heading
   - Changed: "Populations let you" → "Populations will let you"
   - Changed all present-tense verbs to future tense

4. **"Browsing Your Populations" Section (Line 58)**
   - Added qualifier: "(Planned Feature)" to heading
   - Changed: "Populations appear" → "When available, populations will appear"
   - Changed: "Each card shows" → "Each card will show"
   - Changed: "Use the search bar" → "You'll be able to use the search bar"
   - Changed: "Click the three-dot menu" → "You'll be able to click the three-dot menu"

5. **"Population Details" Section (Line 65)**
   - Added qualifier: "(Planned Feature)" to heading
   - Changed: "Click any population card to see" → "When available, you'll be able to click any population card to see"
   - Changed: "The details page includes" → "The details page will include"
   - Changed: "Use the category pills" → "You'll be able to use the category pills"
   - Changed: "Hover over" → "Hovering over...will show"

6. **"Understanding Population Analytics" Section (Line 79)**
   - Added qualifier: "(Planned Feature)" to heading
   - Changed: "The charts view provides" → "When available, the charts view will provide"

7. **"Creating Populations" Section (Line 113)**
   - Added qualifier: "(Planned Feature)" to heading
   - Changed: "Populations are typically created" → "When available, populations will typically be created"
   - Changed: "The Populations tab is" → "The Populations tab will be"

## Why This Fixes the Issue

The QA tests expected functional Populations UI, but screenshots show a "Stay tuned! We're working on unveiling the new populations feature" message. The original documentation described the feature in present tense as if it were available, creating a mismatch between expectations and reality.

By:
1. Upgrading the warning from `warning` to `danger` for higher visibility
2. Changing all present-tense descriptions to future tense
3. Adding "(When Available)" and "(Planned Feature)" qualifiers to subsection headings
4. Clearly stating the feature is "not yet available" rather than "in development"

Users will now have correct expectations that this is planned functionality, not a current capability.

## Test Coverage
This fix addresses the QA test failures:
- "People: Page content present"
- "People: Populations route loads"

Both tests expect functional UI but encounter the "coming soon" message. The documentation now accurately reflects this state.

## Verification
The fix was verified against the screenshot that shows: "Stay tuned! We're working on unveiling the new populations feature in your workspace" on the /audience route.
