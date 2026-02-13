# Documentation Fix Summary

## What Was Changed

Added a warning banner to the Populations section of the People documentation (`docs/guide/people.md`) to inform users that the Populations feature is currently in development and may not be available in all workspaces.

## Why This Fixes the Issue

The documentation previously described Populations as a fully functional feature with cards, charts, and analytics. However, QA testing against the staging environment revealed that the UI displays an empty state with a "Stay tuned! We're working on unveiling the new populations feature in your workspace" message.

This mismatch between documentation and actual UI behavior would confuse users who visit the Populations tab expecting to see the features described in the docs. The warning banner now sets appropriate expectations and directs users to contact their account manager for more information.

## Which File and Section Were Modified

- **File**: `docs/guide/people.md`
- **Section**: Populations (lines 37-44)
- **Change**: Added a VitePress warning callout box immediately after the section header and screenshot reference, before the main descriptive text

## Technical Details

The warning uses VitePress's built-in warning callout syntax (`::: warning ... :::`) which renders as a visually distinct yellow/amber banner to draw user attention to the important notice about feature availability.
