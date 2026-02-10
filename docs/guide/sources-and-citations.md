---
title: Sources & Citations
---

# Sources & Citations

When you use Vurvey's AI to analyze your research data, you need to trust that the answers are grounded in real evidence -- not just made up. This page explains how Vurvey connects AI responses back to your actual data, and how you can verify the claims it makes.

## Why This Matters for Research

In consumer insights and market research, every finding needs to be traceable. If your AI assistant says "65% of respondents preferred the new packaging," you need to know:

- **Where** that number came from (which campaign, which question, which file)
- **Whether** the AI is summarizing real data or making a general statement
- **How** to verify the claim against your source materials

Vurvey's citation system gives you that traceability. When the AI uses your data to answer a question, it can show you exactly which sources informed its response.

## How AI Uses Your Data

Vurvey's AI draws on three types of information, depending on which chat modes you have turned on:

### Chat Mode (Default)
The AI uses its general knowledge and your conversation history. It does not search your uploaded files or campaign results. This is ideal for brainstorming, drafting, and general questions.

### My Data Mode
When you turn on **My Data**, the AI searches through the specific campaigns, datasets, and files you've selected. It retrieves relevant passages, quotes, and data points from your actual research materials to inform its answers. This is where citations become most valuable.

### Web Mode
When you turn on **Web**, the AI searches the internet for current information. This is useful for competitive intelligence, trend research, and validating your findings against external sources.

::: tip Combine Modes for Richer Analysis
Turn on **My Data + Web** together to get answers that blend your internal research findings with external market context. This is especially powerful for competitive analysis and trend validation.
:::

## Selecting Your Sources

When **My Data** is turned on, a Sources panel appears where you can choose exactly which data the AI should search. Your options include:

- **Campaigns** -- Survey responses and all associated metadata
- **Questions** -- Specific question-level data from your campaigns
- **Datasets** -- Collections of uploaded files (documents, spreadsheets, media)
- **Individual files** -- Specific documents within a dataset

### How Source Selection Affects Your Results

| What You Select | What You Get | Best For |
|---|---|---|
| **One campaign** | Focused, consistent findings tied to that study | Executive summaries, quick readouts |
| **Two campaigns** | Comparative insights across studies | Before/after studies, segment comparisons |
| **One labeled dataset** | Structured answers from organized files | Internal knowledge bases, research libraries |
| **Everything** | Broad context, but potentially more noise | Discovery, exploratory analysis |

::: tip Keep It Focused
For the most accurate and citation-rich responses, select just one or two sources at a time. The narrower your source selection, the more precise and traceable the AI's answers will be.
:::

## How Citations Appear

When the AI uses your data to answer a question, look for the **Citations** button below the response. Clicking it reveals:

- **Which sources were used** -- the specific campaigns, datasets, or files the AI drew from
- **Where specific claims came from** -- connections between individual statements and their source materials

![Citations button under AI response](/screenshots/home/03-after-login.png)

This gives you a clear audit trail from the AI's conclusion back to your original data.

## Getting Better Citations

The way you phrase your questions has a big impact on how well the AI cites its sources. Here are prompting strategies that encourage detailed, traceable answers:

### Ask for Structured Output with Sources

```text
Give me 5 themes from this campaign. For each theme:
- 2 supporting quotes from respondents
- Which question each quote came from
- A confidence rating (high / medium / low)
```

### Constrain the AI to Your Data

```text
Only use the selected sources. If you can't find support
in the data, say so rather than guessing.
```

### Request a Citation Table

```text
Create a table with these columns:
Theme | Supporting Evidence | Source | Segment (if known)
```

### Compare Across Studies

```text
Compare Campaign A vs Campaign B:
- What changed the most between the two?
- Which audience segments diverged?
- What should we investigate next?
Include citations for every claim.
```

## Common Research Workflows

### Executive Readout in 30 Minutes

1. Go to **Home** and turn on **My Data** mode
2. Select the campaign you just closed
3. Ask: "Summarize the top themes with supporting quotes and recommended next steps"
4. Review the citations to verify key claims
5. Copy the output into your presentation, keeping citations as backup

### Competitive Comparison

1. Turn on both **My Data** and **Web** modes
2. Select your internal campaign or dataset as the data source
3. Ask: "Compare what our respondents said about [topic] with current market trends"
4. The AI will blend your internal findings with external context

### Building a Knowledge Agent

1. Create a **Dataset** organized around one domain (a product category, industry, or brand)
2. Label your files clearly so the AI can find relevant content quickly
3. Create an **Agent** and connect that dataset to it (see the [Agents](/guide/agents) guide)
4. When chatting with that agent, ask questions that reference the dataset -- the AI will cite specific files

## Verifying AI Claims

Even with citations, it's good practice to verify important findings:

1. **Check the citation source** -- Click the Citations button and confirm the referenced source matches what you expect
2. **Read the original** -- Go to the cited campaign or dataset and review the raw data yourself
3. **Cross-reference** -- Ask the same question with different source selections to see if findings are consistent
4. **Ask for specifics** -- If a claim seems vague, follow up with "Show me the exact quotes that support this"
5. **Test with constraints** -- Ask the AI to only use a single source and compare the output to a broader query

## Troubleshooting

### The AI's answer seems generic with no citations

- **Narrow your sources**: Select just one campaign or dataset instead of everything
- **Ask for evidence explicitly**: Add "with supporting quotes" or "cite your sources" to your prompt
- **Check file status**: Make sure your dataset files show "Success" status -- files still processing can't be searched

### The AI cited the wrong source

- **Name the source in your prompt**: Say "Using only the Q4 Packaging Study, tell me..."
- **Ask it to list sources first**: "Before answering, list which sources you're using"
- **Reduce the number of selected sources** to eliminate confusion

### The AI missed something you know is in your data

- **Use the same language**: Match the terms that appear in your source files (question text, labels, column headers)
- **Ask for a targeted search**: "Search for all mentions of [keyword] and return matching excerpts with their sources"
- **Check your source selection**: Make sure the relevant campaign or dataset is actually selected in the Sources panel

## Related Guides

- [Home](/guide/home) -- Full guide to the chat interface
- [Datasets](/guide/datasets) -- How to upload and organize files for AI analysis
- [Campaigns](/guide/campaigns) -- Creating and managing research surveys
- [Agents](/guide/agents) -- Building AI personas with specialized knowledge
- [Permissions & Sharing](/guide/permissions-and-sharing) -- Controlling who can access your research
