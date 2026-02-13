# Documentation Fix Summary

## What Was Changed

Updated the "Creating an Agent" section in `docs/guide/agents.md` (lines 151-159) to accurately reflect the actual UI flow.

### Specific Changes:

1. **Tip box title**: Changed from "Agent Builder Options" to "Generate Agent Options"
2. **Context description**: Changed from "After clicking Create Agent, you have two paths:" to "The Generate Agent dialog offers two paths:"
3. **Second option label**: Changed from "**Agent Builder**" to "**Open Builder**" to match the actual UI button text

## Why It Fixes the Issue

The original documentation incorrectly suggested that clicking "Create Agent" would directly present "Agent Builder" options. In reality:
- Clicking "+ Create Agent" opens the **Generate Agent dialog** first
- This dialog is a modal that appears before the builder
- The dialog offers two choices: quick generation or opening the full builder
- The button label is "Open Builder", not "Agent Builder"

The fix aligns the documentation with the actual UI implementation found in `vurvey-web-manager/src/agents/components/generate-agent-modal/index.tsx:136`.

## Which File and Section Were Modified

- **File**: `docs/guide/agents.md`
- **Section**: "Creating an Agent"
- **Lines**: 151-159
- **Classification**: DOC_ISSUE
- **Confidence**: 0.95
- **Verified Against**: vurvey-web-manager source code
