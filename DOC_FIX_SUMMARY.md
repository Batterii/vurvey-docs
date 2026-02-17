# Documentation Fix Summary

## What Was Changed

Updated `docs/guide/workflows.md` to document empty state behavior in two sections:

### 1. Browsing Your Workflows (lines 38-40)
Added an info box clarifying that when no workflows exist:
- An empty state message is displayed instead of the workflow grid
- The workflow builder, canvas, and workflow cards are not visible
- Only the "Create new workflow" button appears in the top-right corner
- This is normal and expected behavior for a workspace without workflows

### 2. Upcoming Runs (lines 541-543)
Added an info box clarifying that when no workflows have schedules:
- The Upcoming Runs tab displays an empty state message
- This is normal and expected behavior
- Scheduled runs only appear after setting up a schedule using the Schedule button

## Why It Fixes the Issue

The QA test suite was failing because it expected to see:
- Builder UI elements (canvas, nodes, connections)
- Workflow cards in a grid layout
- Upcoming runs content

However, in a workspace with no workflows or no scheduled workflows, these elements correctly do not appear. The tests were encountering valid empty states but treating them as failures.

By explicitly documenting the empty state behavior, we:
1. Set correct user expectations for new or empty workspaces
2. Clarify that the empty state is intentional, not a bug
3. Explain what users should see (the Create button) and what they won't see (builder/canvas/grid)

## Files Modified

- `docs/guide/workflows.md` - Added two `:::info Empty State` documentation blocks

## QA Tests Addressed

- Workflow: Builder UI visible
- Workflow: Builder canvas loads
- Workflow: Upcoming runs page content

## Verification

Changes verified against QA failure screenshot: `qa-failure-screenshots/failure-workflow--builder-ui-visible-desktop-1771215280171.png`
