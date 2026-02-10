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

**Best for:** Creative brainstorming, writing drafts, general market knowledge questions, strategy discussions.

### My Data Mode
When you turn on **My Data**, the AI searches through the specific campaigns, datasets, and files you've selected. It retrieves relevant passages, quotes, and data points from your actual research materials to inform its answers. This is where citations become most valuable.

**Best for:** Analyzing survey results, finding specific quotes, generating evidence-based reports, answering questions about your research.

### Web Mode
When you turn on **Web**, the AI searches the internet for current information. This is useful for competitive intelligence, trend research, and validating your findings against external sources.

**Best for:** Competitive analysis, trend research, market context, validating internal findings.

::: tip Combine Modes for Richer Analysis
Turn on **My Data + Web** together to get answers that blend your internal research findings with external market context. This is especially powerful for competitive analysis and trend validation. For example: "How do our survey findings about sustainable packaging compare to industry trends?"
:::

## Selecting Your Sources

When **My Data** is turned on, a Sources panel appears where you can choose exactly which data the AI should search. Your options include:

### Source Types

| Source Type | What It Contains | When to Use |
|---|---|---|
| **Campaigns** | Survey responses, video transcripts, and all associated metadata | Analyzing survey results, finding respondent quotes |
| **Questions** | Specific question-level data from your campaigns | Focused analysis on how people answered a particular question |
| **Datasets** | Collections of uploaded files (documents, spreadsheets, media) | Referencing reports, research documents, competitive intel |
| **Individual files** | Specific documents within a dataset | Deep analysis of a single important document |
| **Videos** | Video content (auto-transcribed) | Finding specific moments in video responses |
| **Audio** | Audio files (auto-transcribed) | Searching through interview recordings |

### How Source Selection Affects Your Results

| What You Select | What You Get | Best For |
|---|---|---|
| **One campaign** | Focused, consistent findings tied to that study | Executive summaries, quick readouts |
| **Two campaigns** | Comparative insights across studies | Before/after studies, segment comparisons |
| **One labeled dataset** | Structured answers from organized files | Internal knowledge bases, research libraries |
| **A specific question** | Detailed breakdown of responses to that question | Question-level analysis, response coding |
| **Everything** | Broad context, but potentially more noise | Discovery, exploratory analysis |

::: tip Keep It Focused
For the most accurate and citation-rich responses, select just one or two sources at a time. The narrower your source selection, the more precise and traceable the AI's answers will be. If you select too many sources, the AI may draw from less relevant materials.
:::

### Source Selection Strategy

Follow this decision tree to pick the best sources:

1. **Do you need data from a specific survey?** → Select that Campaign
2. **Do you need answers to a particular question?** → Select that Question
3. **Do you need information from uploaded documents?** → Select the relevant Dataset or individual Files
4. **Are you comparing two studies?** → Select both Campaigns
5. **Are you exploring broadly?** → Select multiple sources, but expect less precise citations
6. **Not sure where to start?** → Start with one source and broaden if the AI says it can't find relevant information

## How Citations Appear

When the AI uses your data to answer a question, look for the **Citations** button below the response. Clicking it reveals:

- **Which sources were used** -- the specific campaigns, datasets, or files the AI drew from
- **Where specific claims came from** -- connections between individual statements and their source materials

![Citations button under AI response](/screenshots/home/03-after-login.png)

This gives you a clear audit trail from the AI's conclusion back to your original data.

### Inline Citations

When citations are available, you can toggle them on or off within the response text. With inline citations enabled:

- Specific claims show a numbered reference (e.g., [1], [2])
- Clicking a reference jumps to the source detail
- You can verify each claim independently

### Citation Detail View

Expanding the citations section shows:

| Element | What It Shows |
|---|---|
| **Source name** | Which campaign, dataset, or file was referenced |
| **Relevant excerpt** | The specific passage or data point used |
| **Context** | Where in the source material the information appears |

## How Semantic Search Works

When you ask a question with My Data mode enabled, the AI doesn't just look for exact keyword matches. It uses **semantic search**, which means it understands the meaning and intent behind your question.

For example, if you ask "What do consumers think about our pricing?" the AI will find relevant passages even if respondents used different words like "cost," "value," "expensive," "affordable," or "worth the money."

This makes it much easier to find relevant insights without needing to know the exact terms your respondents used.

::: tip Use Natural Language
Because semantic search understands meaning, you can ask questions naturally instead of trying to guess exact keywords. "What concerns do people have about the new product?" will find relevant responses even if nobody used the word "concerns" -- they might have said "worried," "hesitant," "unsure," or described their concern without using any of those words.
:::

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

### Ask for Verbatim Quotes

```text
Find 10 direct quotes from respondents about [topic].
For each quote, include:
- The exact words they used
- Which question they were answering
- Any demographic context available
```

### Request Quantitative Breakdowns

```text
How many respondents mentioned [topic]?
Break down by:
- Age group
- Gender
- Region (if available)
Cite the specific responses for each group.
```

### Challenge the AI to Prove Its Claims

```text
What evidence in the data supports the claim that
consumers prefer [option A] over [option B]?
Show me the strongest and weakest evidence.
```

## Common Research Workflows

### Executive Readout in 30 Minutes

1. Go to **Home** and click the **Sources** button
2. Select the campaign you just closed
3. Ask: "Summarize the top themes with supporting quotes and recommended next steps"
4. Review the citations to verify key claims
5. Ask follow-up: "Format this as a 3-paragraph executive summary suitable for a leadership presentation"
6. Copy the output into your presentation, keeping citations as backup

### Competitive Comparison

1. Enable both **Sources** (your internal data) and **Search** (web access) in the toolbar
2. Select your internal campaign or dataset as the data source
3. Ask: "Compare what our respondents said about [topic] with current market trends"
4. The AI will blend your internal findings with external context
5. Follow up: "Create a comparison table showing our findings vs. industry benchmarks"

### Building a Knowledge Agent

1. Create a **Dataset** organized around one domain (a product category, industry, or brand)
2. Label your files clearly so the AI can find relevant content quickly
3. Create an **Agent** and connect that dataset to it (see the [Agents](/guide/agents) guide)
4. When chatting with that agent, ask questions that reference the dataset -- the AI will cite specific files
5. Over time, add new files as research accumulates

### Cross-Campaign Trend Analysis

1. Select multiple campaigns from different time periods as sources
2. Ask: "What themes have changed between [Campaign A] and [Campaign B]?"
3. Follow up: "Which themes are growing stronger? Which are fading?"
4. Ask: "Create a trend summary with supporting evidence from each campaign"
5. Use citations to verify that the trends are real, not artifacts of different question wording

### Audience Segment Deep Dive

1. Select a campaign with demographic data
2. Ask: "How do responses differ between [Segment A] and [Segment B]?"
3. Follow up: "What are the unique concerns of each segment?"
4. Ask: "Which segment has the strongest brand loyalty? Show me the evidence."
5. Verify citations to ensure segment comparisons are based on actual response data

## Verifying AI Claims

Even with citations, it's good practice to verify important findings:

1. **Check the citation source** -- Click the Citations button and confirm the referenced source matches what you expect
2. **Read the original** -- Go to the cited campaign or dataset and review the raw data yourself
3. **Cross-reference** -- Ask the same question with different source selections to see if findings are consistent
4. **Ask for specifics** -- If a claim seems vague, follow up with "Show me the exact quotes that support this"
5. **Test with constraints** -- Ask the AI to only use a single source and compare the output to a broader query
6. **Check for recency** -- If your data spans multiple time periods, make sure the AI isn't mixing old and new findings
7. **Verify quantities** -- If the AI says "most respondents" or gives a percentage, ask it to show you the count

::: warning Be Skeptical of Precise Numbers
When the AI provides specific percentages or statistics, always verify them against your source data. The AI is very good at identifying themes and patterns, but quantitative claims should be double-checked, especially when the sample size is small.
:::

## Tips for Citation-Rich Responses

| Strategy | Why It Works |
|---|---|
| **Select fewer sources** | The AI focuses more deeply on each source |
| **Ask for quotes** | Forces the AI to ground claims in actual respondent language |
| **Request tables** | Structured output makes it easier to trace claims to evidence |
| **Name sources explicitly** | "Using only the Q4 study..." helps the AI stay on target |
| **Ask iteratively** | Start broad, then drill into specific areas for richer citations |
| **Specify the audience** | "Write this for a VP of Marketing" encourages evidence-backed claims |

## Troubleshooting

### The AI's answer seems generic with no citations

- **Narrow your sources**: Select just one campaign or dataset instead of everything
- **Ask for evidence explicitly**: Add "with supporting quotes" or "cite your sources" to your prompt
- **Check file status**: Make sure your dataset files show "Success" status -- files still processing can't be searched
- **Verify My Data mode is on**: Check that you've clicked the Sources button and selected actual sources
- **Rephrase your question**: Try using more specific terms that relate to your source content

### The AI cited the wrong source

- **Name the source in your prompt**: Say "Using only the Q4 Packaging Study, tell me..."
- **Ask it to list sources first**: "Before answering, list which sources you're using"
- **Reduce the number of selected sources** to eliminate confusion
- **Check for similarly named sources**: If you have "Q3 Study" and "Q4 Study," be explicit about which one

### The AI missed something you know is in your data

- **Use the same language**: Match the terms that appear in your source files (question text, labels, column headers)
- **Ask for a targeted search**: "Search for all mentions of [keyword] and return matching excerpts with their sources"
- **Check your source selection**: Make sure the relevant campaign or dataset is actually selected in the Sources panel
- **Try a different phrasing**: If "pricing concerns" doesn't work, try "cost," "value," "expensive," or related terms
- **Check file processing**: The file may show "Success" but content extraction may have missed certain sections (especially from image-heavy PDFs)

### Citations seem inconsistent between queries

- This can happen when sources contain overlapping information
- **Be more specific** in your question to guide the AI to the right source
- **Ask for source attribution**: "For each claim, tell me which specific file or campaign response it came from"
- **Run the same query twice** to check consistency -- if results vary significantly, narrow your sources

### AI says it can't find relevant information

- **Check source selection**: Make sure you've actually selected sources in the Sources panel
- **Broaden your question**: You may be asking something too specific -- try a more general query first
- **Verify file processing**: Check that all files show "Success" status in the dataset
- **Try different source types**: If a dataset isn't working, try selecting a campaign directly (or vice versa)

## Frequently Asked Questions

::: details Click to expand

**Q: Does the AI always provide citations?**
Citations appear when the AI draws on your selected sources (My Data mode). In regular Chat mode or Web mode, citations may not appear because the AI is using general knowledge or web results rather than your specific files.

**Q: Can I trust the citation accuracy?**
Citations point to real sources in your data, but always verify important claims. The AI identifies relevant passages accurately most of the time, but it may occasionally misinterpret context or draw connections that aren't quite right.

**Q: Why do I get different citations for the same question?**
The AI's search process has some variability. If you ask the same question twice, it may surface different relevant passages. This is normal -- your data may contain multiple relevant sections, and the AI samples from them.

**Q: Can I export citations with my conversation?**
When you copy or export a conversation, the citation references are included in the output. This makes it easy to share evidence-backed findings with stakeholders.

**Q: How does the AI decide which sources are most relevant?**
The AI uses semantic search to find passages that are conceptually similar to your question. It weighs relevance, recency, and specificity. More focused source selections lead to more relevant citations.

**Q: Do labels on dataset files affect citation quality?**
Yes. Well-labeled files help the AI narrow its search. If you label files with categories like "product: skincare" or "quarter: Q4-2024," the AI can more efficiently find relevant content.

**Q: Can I cite a specific respondent?**
When the AI cites campaign data, it can reference individual responses. However, respondent identity depends on what data was collected -- anonymous campaigns won't include personal identifiers.
:::

## Related Guides

- [Home](/guide/home) -- Full guide to the chat interface
- [Datasets](/guide/datasets) -- How to upload and organize files for AI analysis
- [Campaigns](/guide/campaigns) -- Creating and managing research surveys
- [Agents](/guide/agents) -- Building AI personas with specialized knowledge
- [Permissions & Sharing](/guide/permissions-and-sharing) -- Controlling who can access your research
