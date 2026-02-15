# Documentation Fix Summary

## Change Applied

**File:** `docs/guide/agents.md`
**Section:** Creating an Agent (lines 151-159)
**Date:** 2026-02-15

## What Was Changed

Updated terminology from "Generate Agent modal" to "Generate Agent dialog" to match the actual UI component implementation.

### Specific Changes
- Line 155: Changed "Generate Agent modal" → "Generate Agent dialog"
- Line 157: Changed "Generate Agent modal" → "Generate Agent dialog" (in tip box header)

## Why This Fixes the Issue

The QA test "Agents: Create UI visible" identified a terminology mismatch between the documentation and the actual UI. The source code implementation uses a dialog component, not a modal, for the agent creation flow.

The fix ensures documentation accurately reflects:

1. Clicking **+ Create Agent** opens a **Generate Agent dialog** first
2. This dialog presents two options: quick AI generation OR manual configuration via the builder
3. The terminology matches the actual component type in the implementation

The fix aligns the documentation with the verified UI implementation found in `vurvey-web-manager/src/agents/components/generate-agent-modal/index.tsx:136`.

## Related QA Test

This fix addresses the QA test: **"Agents: Create UI visible"**

## Classification

- **Type**: DOC_ISSUE
- **Confidence**: 0.95
- **Timestamp**: 2026-02-12T03:36:00Z

## Files Modified

- `docs/guide/agents.md` (lines 151-159)
