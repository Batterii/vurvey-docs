# Topic Graph (Insights)

The **Insights** tab on every campaign is a live, interactive map of the ideas people are talking about in your responses. As answers come in — whether typed, recorded on video, or simulated by an AI persona — the Topic Graph automatically pulls out the entities, concepts, feelings, and relationships that show up in the text and draws them as a visual network.

Think of it as "what is this campaign *actually* about?" at a glance, with the ability to zoom into any topic or entity to see the raw participant quotes behind it.

## Who this is for

- **Researchers** scanning a campaign that already has hundreds of responses and wanting an overview without reading every transcript.
- **Stakeholders** who want a visual summary of a study without going deep into individual answers.
- **Marketing / product teams** spotting emergent themes they didn't explicitly ask about.
- **Campaign authors** watching an active campaign fill in live during a launch or AI-population simulation.

No manual tagging. No pre-built ontology decisions. The graph builds itself from whatever the respondents say.

## Where to find it

Open any campaign. You'll see the tab bar across the top:

| Tab | When it lights up |
|-----|-------------------|
| Build | Always |
| Configure | Always |
| Audience | Always |
| Launch | Always |
| Results | Once responses start arriving |
| Analyze | Once responses start arriving |
| Summary | Once responses start arriving |
| **Insights** | **Once the Topic Graph is enabled for your workspace (default: on)** |

Click **Insights** to open the graph.

## Turning the feature on or off for your workspace

Topic Graph is **on by default** for every workspace. An admin can turn it off if your team doesn't want to run the extra AI extraction for cost or privacy reasons.

1. Go to **Settings → General**
2. Scroll to the **Topic Graph** toggle
3. Flip it off to disable for the whole workspace, or leave on (default)

When the toggle is off, the Insights tab is hidden on every campaign in that workspace, and no entity-extraction work runs behind the scenes.

::: tip Why default to on?
The graph earns its value the moment the first substantive response arrives. Making it opt-out means a new workspace gets the feature automatically and admins only need to think about it if they want to disable it for a specific reason.
:::

## Reading the graph

### The canvas

Each small pill is an **entity** — a person, product, feature, emotion, topic, organization, or any other concept the extractor found in a response. Pills are colored by type (Person = green, Product = blue, Feature = pink, and so on — see the legend on the right).

Lines between pills are **relationships** (`TOPIC_RELATED`). A thicker or more-frequent line means the two entities showed up together in responses more often.

Larger glowing circles are **themes** — clusters of closely-related entities that the system grouped using community detection. A theme labeled "HydrationIngredients" with 12 members is telling you that 12 entities all tend to appear together in the same responses.

### The side panel

On the right you'll find:

| Control | What it does |
|---------|--------------|
| **Search** | Type any entity or theme name. Matches stay fully visible and everything else dims down so the hit stands out. Clear the box to restore the full graph. |
| **Min confidence** | Filter out extractions the AI wasn't sure about. Default 0.6 (range 0.50–0.95). Slide right to show only high-confidence entities. |
| **Show edge labels** | Toggle relationship labels on or off. Edges are currently labeled `RELATED_TO` — we're working on surfacing the richer relationship types (`USES`, `CAUSES`, `MENTIONS_ALONGSIDE`) that the extractor already captures. |
| **Reset layout** | Re-runs the physics simulation so nodes spread out from scratch. Useful after zooming or after a lot of new nodes have streamed in. |
| **Counter** | Running total: `N themes · N entities · N edges`. The themes count is hidden when every cluster has only one member — which happens for graphs with few relationships, where the clustering step has nothing to group together. |
| **Entity Types** | Color legend for the ontology the AI generated for this specific campaign. Campaigns created before the feature shipped use a 9-type default ontology (Person, Organization, Product, Concept, Location, Event, Brand, Feature, Sentiment) until their first campaign-specific ontology is generated. |

### Interactions

- **Click a theme** to enter it — the graph reshapes to show just the entities inside that cluster, plus any cross-cluster edges.
- **Click an entity** to open the **drill-in drawer** on the right. You'll see the entity's name, type, how many mentions it has, any aliases, the theme it belongs to (when clustering has grouped it), and a list of the original participant quotes that produced it (newest-first, capped at 20). The entity name is highlighted inline in each quote.
- **Scroll wheel / trackpad** zooms in and out. **Click and drag the empty canvas** to pan.
- **Zoom In / Zoom Out / Fit View** buttons in the bottom-left corner give you keyboard- and click-friendly alternatives to the scroll wheel. Fit View is the fastest way back to the full graph after you've drilled in.
- **Minimap** in the bottom-right shows where your current viewport sits inside the full graph. Click a spot on the minimap to jump there.
- **Click outside any node** to reset focus.

### Privacy: the PII redaction pill

If an entity looks like it could identify a real person (email addresses, phone numbers, matches to an actual respondent's name from the participant list), the graph renders it as `[redacted]` in red. The underlying quote is still there in the drawer so you can read context without surfacing identifying detail in the network view.

## Live vs. finished campaigns

The Insights tab works for both.

**Open campaigns** (still accepting responses) show a pulsing **Live** indicator in the corner and the graph animates as new responses come in. Every incoming answer — whether from a real person submitting the survey, a mailing-list participant, or an AI-persona simulation you launched from the Audience tab — runs through the extractor within a few seconds and the resulting nodes stream onto the canvas in place without you having to reload.

**Closed campaigns** show a static graph reflecting everything that was ever extracted. Results are still interactive (search, drill-in, re-run layout), the view just stops updating.

## What the graph can (and can't) catch

The extractor pulls signal from any text it can see:

- **Long-text** typed answers — best case, most signal.
- **Short-text** answers (even 10–20 characters) — works if there are recognizable proper nouns or branded concepts.
- **Video answers** — the extractor reads the joined transcript, so you get the same quality as a typed response. Transcripts are pulled automatically from the video pipeline.
- **Multiple-choice / rating / ranking** answers — not extracted. These are already structured — use the Results tab.
- **File uploads** — not extracted.

::: tip Wait before deep-analyzing
The per-answer extraction takes 5–30 seconds depending on response length. Themes are re-clustered in larger batches every minute. For a live AI-simulation of 100 personas, expect the full graph to settle within 2–3 minutes after the last response lands.
:::

## Common questions

**Is this the same as the Analyze tab?** No. Analyze is a structured question-by-question view with word clouds and aggregate sentiment. Insights is a cross-question network view of entities and how they relate. They complement each other — Analyze tells you what people said about question 4; Insights tells you which ideas keep recurring across every question.

**Why is my graph empty on a campaign with 50 responses?** A few possibilities: (1) The campaign was launched before the Topic Graph feature shipped; the existing responses haven't been extracted yet. New responses on the same campaign will extract automatically, but the backlog stays empty until we run a one-off backfill — contact support. (2) Topic Graph was turned off in Workspace Settings before the responses arrived — turn it on and re-extract. (3) The responses are all multiple-choice with no free text. (4) The free-text answers are all very short (under 5 words each); the extractor skips them by design.

**Can I download the graph?** Not yet. It's a read-only, live view for now. If you want to export the list of entities for downstream work, use the Analyze tab or Export Responses (.csv) from the Results tab.

**How much does this cost in credits?** Extraction is included. There are no per-response credits for Topic Graph beyond the usual campaign launch costs.

**Can I edit what the graph finds?** Not directly. The extraction is automatic per response. If a specific entity is mislabeled or misspelled, opening its drill-in drawer and reading the quotes will usually show you why (the responses themselves worded it that way). The dedup step merges near-duplicates (`Lotion` and `Moisturizer`) when they're semantically close, but it preserves aliases so both surface in search.

**Does it work across languages?** Yes — the extractor follows the language of the answer itself. A campaign with mixed English/Spanish responses will produce entities in whichever language each response was in.

## Need help?

If the Insights tab doesn't load, the graph stays blank for a campaign that has answers, or you see a PII-redacted entity that you believe shouldn't be redacted, contact support at the usual channel — include the campaign ID from the URL and a screenshot.
