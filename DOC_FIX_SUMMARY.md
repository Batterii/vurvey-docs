# Documentation Fix Summary

## What Was Changed

Updated terminology in `docs/guide/agents.md` at line 153 from "agent builder" to "Generate Agent dialog" to accurately reflect the actual UI workflow.

**Specific change:**
- **Before**: "**Edit Agent** — Open the agent builder to make changes (requires Edit permission)"
- **After**: "**Edit Agent** — Open the Generate Agent dialog to make changes (requires Edit permission)"

## Why It Fixes the Issue

The documentation previously stated that clicking **Edit Agent** opens "the agent builder" directly. However, the actual UI flow shows that clicking this action opens the **Generate Agent** modal/dialog first, as verified in the source code at `vurvey-web-manager/src/agents/components/generate-agent-modal/index.tsx:136`.

The corrected text now reads "Generate Agent dialog" which matches the user's actual experience. When users click **Edit Agent**, they first encounter the "Generate Agent" modal as the initial entry point, not the full builder interface.

This fix ensures the documentation accurately describes the UI flow that users experience when editing agents.

## Which File and Section Were Modified

**File:** `docs/guide/agents.md`

**Section:** "Agent Card Actions" (within the "Viewing Agent Details" section)

**Lines Changed:** 151-159 (specifically line 153)

**Change Type:** DOC_ISSUE - Terminology correction to match actual UI

**Confidence:** 0.95 (per automated analysis)

## Verification

The fix was verified against:
- **Source code reference**: `vurvey-web-manager/src/agents/components/generate-agent-modal/index.tsx:136`
- **QA test**: "Agents: Create UI visible"
- **Classification**: DOC_ISSUE
- **Timestamp**: 2026-02-12T03:36:00Z
