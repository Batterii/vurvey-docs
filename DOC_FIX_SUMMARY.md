# Documentation Fix Summary

## Change Applied

**File:** `docs/guide/agents.md`
**Section:** Creating an Agent (lines 151-159)
**Date:** 2026-02-13

## What Was Changed

Updated the terminology and description of the agent creation flow to match the actual UI behavior:

### Before
- Referred to opening the "Agent Builder" directly
- Mentioned "Agent Builder Options" in the tip box
- Used "Agent Builder" as one of the two paths

### After
- Correctly refers to opening the "Generate Agent modal"
- Changed tip box header to "Generate Agent Options"
- Updated the second path from "Agent Builder" to "Manual Configuration" to clarify that it opens the builder
- Changed "dialog" to "modal" to match actual UI component terminology

## Why This Fixes the Issue

The original documentation incorrectly described the create flow as opening the "Agent Builder" directly, when in reality:

1. Clicking **+ Create Agent** opens a **Generate Agent modal** first
2. This modal presents two options: quick AI generation OR manual configuration via the builder
3. The builder is not immediately shown—it's accessed through the "Manual Configuration" option

The fix aligns the documentation with the verified UI implementation found in `vurvey-web-manager/src/agents/components/generate-agent-modal/index.tsx:136`.

## Related QA Test

This fix addresses the QA test failure: **"Agents: Create UI visible"**

## Confidence Level

**95%** - Verified against actual source code implementation
