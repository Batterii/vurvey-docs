---
title: Sources & Citations
---

# Sources & Citations

Vurvey's source and citation system is built around two ideas:

1. You choose which workspace content the AI can use
2. The UI shows grounded source references when a response has grounding data

## Choosing Sources

From the Home/Canvas toolbar, the **Sources** control is the entry point for workspace data.

The quick dropdown currently lets you:

- **Attach Datasets**
- **Attach Campaigns**
- turn sources on or off

When you open the full modal, the current top-level navigation is centered on:

- **Campaigns**
- **Datasets**
- **All files**

The underlying source state can also include:

- campaign questions
- individual files
- videos
- audios

Those are handled through drill-in pages and saved conversation state rather than always appearing as top-level tabs.

## What Gets Attached to a Conversation

The current chat source state can store:

- campaigns
- questions
- training sets (datasets)
- files
- videos
- audios

That means a conversation can carry a mix of survey and dataset context, even when the visible modal entry points begin with Campaigns or Datasets.

## How Citations Appear in the UI

When a message has grounding data, the response UI can show:

- a **Powered by** section
- a **Citations** toggle in the message actions
- inline superscript citation markers when citations are turned on

The **Citations** action is not always present. In current master, it only renders when the message actually has grounding entries attached to it.

The **Powered by** section can appear in a loading state first. In current master, the UI explicitly supports a delayed grounding experience with:

- `Powered by...`
- `Loading sources...`

That means the answer text can appear before the full grounded-source section finishes loading.

### Powered by Interactions

The **Powered by** label itself is interactive. In the current UI:

- the label expands and collapses the grounding section
- the info icon opens a tooltip linking to the grounding help article
- the expanded section shows a **See how this works** chip/link

## What the Grounding Section Can Contain

The current grounding UI can render these source types:

| Source type | Current label path |
|---|---|
| Campaign answer grounding | Campaign/answer entry |
| Question-summary grounding | Question entry |
| Dataset file grounding | Dataset entry |
| Dataset video grounding | Dataset entry |
| Dataset audio grounding | Dataset entry |
| Web source grounding | Web entry |

So a single response can show a mix of internal workspace sources and web sources, depending on how the response was generated.

## Inline Citations

When citations are toggled on, the renderer inserts inline superscripts based on grounding positions. In the current web app, those markers are generated from grounding offsets and then mapped back to grounding entries in the response UI.

## Important Backend Behavior

The current backend supports a few citation paths:

- if `grounding_support` is present, the app uses it directly
- if `grounding` exists without `grounding_support`, the backend can still synthesize a basic citations structure
- tool-friendly naming maps workspace retrieval to **Search Knowledge Base**

That is why citations can still appear in cases where the model/provider did not return a perfect explicit citation payload.

## Practical Advice for Better Grounding

- Attach only the campaigns or datasets relevant to the question
- Prefer narrower source sets when you want more traceable answers
- Turn citations on when reviewing factual claims, quotes, or counts
- Expand **Powered by** to inspect exactly which source entries were attached to the answer

## What This Guide Avoids Claiming

To stay accurate with master, this page does not assume:

- that every source type is always shown as a primary tab in the source modal
- that citations appear instantly with the answer every time
- that all grounded runs behave like a single citation pipeline

The implemented behavior is more flexible: source selection is conversation-state driven, and citations render when grounding data is available to the message UI.
