# Documentation Fix Summary

## What Was Changed

Updated terminology in the "Creating an Agent" section of `docs/guide/agents.md` (lines 151-161) to match the actual UI flow.

### Specific Changes:
1. Changed "launch the Agent Builder" to "open the Generate Agent dialog"
2. Changed "The builder walks you through" to "The dialog walks you through"
3. Changed "The top of the builder shows" to "The top of the dialog shows"

## Why This Fixes the Issue

The documentation previously indicated that clicking "+ Create Agent" would directly launch the "Agent Builder". However, the actual UI flow shows a "Generate Agent" modal/dialog first (as verified in `vurvey-web-manager/src/agents/components/generate-agent-modal/index.tsx:136`).

This fix aligns the documentation with the current UI implementation, ensuring users have accurate expectations about what interface they'll see when creating an agent.

## Which File and Section Were Modified

**File:** `docs/guide/agents.md`

**Section:** "Creating an Agent" (lines 151-161)

**Subsection:** "Builder Navigation" header (line 159)

## Classification

- **Type:** DOC_ISSUE
- **Confidence:** 0.95
- **QA Test:** "Agents: Create UI visible"
- **Timestamp:** 2026-02-12T03:36:00Z
