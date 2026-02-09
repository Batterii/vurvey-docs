---
title: Sources & Citations
---

# Sources & Citations

Vurvey’s chat can answer based on:

- The conversation context (what you and the agent have already discussed)
- Your workspace data (campaigns, datasets, files, etc.)
- The web (when web tooling is enabled)

This page explains how to control *what the agent is allowed to use*, how to get reproducible answers, and how to interpret citations/grounding.

## Mental Model

Think of every message as having two knobs:

1. **Mode(s)**: what kinds of retrieval/tools are permitted (Chat, My Data, Web).
2. **Sources**: which specific items are in-scope (which campaigns/datasets/files).

If you want high confidence output, you generally want:

- Narrow sources
- Explicit output requirements
- Citations enabled in the response (when available)

## Chat Modes

The Home (Chat) page exposes three primary modes:

| Mode | What It’s For | What Changes |
|------|---------------|--------------|
| **Chat** | Brainstorming, general questions, drafting | Uses conversation context and the agent’s general knowledge |
| **My Data** | Analysis grounded in *your* data | Enables retrieval over selected workspace sources |
| **Web** | Current events, competitive research, external references | Enables web tooling (when available) |

You can combine modes. A common “research” setup is **My Data + Web** to compare internal findings to external context.

## Source Types (My Data)

When **My Data** is enabled, the Sources panel can include:

- **Campaigns**: survey responses and metadata
- **Questions**: individual question-level slices
- **Training Sets / Datasets**: collections of uploaded files
- **Files**: individual documents/spreadsheets/media
- **Videos / Audio**: media sources when supported

### How Source Selection Affects Output

| Selection Strategy | What You Get | When to Use |
|-------------------|--------------|-------------|
| **One focused campaign** | Tight, consistent findings | Executive summaries, quick readouts |
| **Two campaigns (A vs B)** | Comparative insights | Before/after studies, segment experiments |
| **One dataset with labels** | Structured retrieval | Internal docs, playbooks, research libraries |
| **“All campaigns/datasets”** | Broad context but more noise | Discovery, exploratory analysis |

## Citations and Grounding

When the agent is using sources (My Data and/or Web), responses may include a grounding/citations section that shows:

- Which sources were used (campaigns/datasets/files/urls)
- Where specific claims came from

### How to Ask for Better Grounding

Use prompts that force traceability:

```text
Give me 5 themes. For each theme:
- 2 supporting quotes
- which campaign/question/file each quote came from
- a confidence rating (high/med/low)
```

```text
Only use the selected sources. If you can’t find support in the sources, say so.
```

```text
Create a table with:
theme | supporting evidence | source | segment (if known)
```

## Reproducible Analysis Prompts

If you want answers that are stable across runs and easy to share internally:

- Name the exact sources to use (one campaign/dataset at a time)
- Ask for a deterministic output structure (tables, bullet counts)
- Ask for explicit assumptions and unknowns

Examples:

```text
Using only Campaign X, summarize top 3 drivers of dissatisfaction.
Return:
1) Drivers (ranked)
2) Representative quotes (3 per driver)
3) Suggested follow-ups (5 questions)
```

```text
Compare Campaign A vs Campaign B:
- What changed the most?
- Which segments diverged?
- What should we do next?
Include citations for every claim that is not general knowledge.
```

## Common Use Cases

### Use Case: Executive Readout in 30 Minutes

1. Select the campaign you just closed.
2. Enable **My Data**.
3. Ask for “themes + quotes + what to do next”.
4. Export/copy the output into your deck, keeping citations for backup.

### Use Case: Competitive Comparison

1. Enable **My Data + Web**.
2. Select your internal campaign/dataset (My Data).
3. Ask for a comparison table (internal signals vs external positioning).

### Use Case: Build a “Knowledge Agent”

1. Organize a dataset (Training Set) around one domain (product, industry, brand).
2. Label files inside the dataset so retrieval is focused.
3. Connect that dataset to an Agent (see Agents guide).
4. In chat, ask for answers that cite the dataset first.

## Troubleshooting

### “No citations” or “it sounds generic”

- Reduce the number of sources (choose 1 campaign/dataset)
- Ask for quotes and explicit source references
- Make sure the files are fully processed (dataset file status shows success)

### “It cited the wrong thing”

- Specify the exact campaign/dataset by name in the prompt
- Ask the agent to list the sources it used before answering

### “It missed something that’s definitely in my data”

- Rephrase using the same terms that appear in the source (question text, labels, headings)
- Ask for a targeted search pass:
  - “Search for mentions of X and return matching excerpts with sources”

## Related Guides

- [Home (Chat)](/guide/home)
- [Datasets](/guide/datasets)
- [Campaigns](/guide/campaigns)
- [Agents](/guide/agents)
- [Permissions & Sharing](/guide/permissions-and-sharing)

