---
title: Sources & Citations
---

# Sources & Citations

Vurvey's job is _AI Powered by People_ — every claim an Agent makes should be traceable back to a real human voice, file, or external source. That guarantee is implemented through **two distinct attribution pipelines**, both surfaced as on-screen citations:

| Pipeline | Where you see it | Backed by |
|---|---|---|
| **Chat grounding & citations** | Inline superscripts and the **Powered by N sources** section under any Agent chat response | Per-message grounding data + the chat-citations table (migration `20241205232734_add-citations-to-chat-messages.ts`, Dec 2024) |
| **Structured Output Evidence badges** | A small "Evidence" pill in the top-right of every bound element in a dashboard or workflow output | A post-run extractor that runs `emit_structured_output_with_evidence` (migration `20260518000001_wrap-structured-output-with-citations.ts`, May 2026) |

This page covers both, plus how you control **which sources are available** to an Agent in the first place.

![Sources control in the canvas/home toolbar](/screenshots/sources-and-citations/01-sources-control.png?optional=1)
![Sources modal — Campaigns / Datasets / All files tabs](/screenshots/sources-and-citations/02-sources-modal.png?optional=1)
![Powered by N sources expanded in a chat response](/screenshots/sources-and-citations/03-powered-by.png?optional=1)
![Inline citation superscript in a chat response](/screenshots/sources-and-citations/04-inline-citations.png?optional=1)
![Evidence badge on a structured output element (closed)](/screenshots/sources-and-citations/05-evidence-badge.png?optional=1)
![Evidence popover with quotes and source links](/screenshots/sources-and-citations/06-evidence-popover.png?optional=1)

---

## Part 1 — Choosing Sources (the input side)

Before citations can appear, an Agent needs to know what content it's allowed to draw on. That's what the **Sources** control does.

### Quick dropdown

From the Home or Canvas chat toolbar, the **Sources** button opens a small dropdown letting you:

- **Attach Datasets** — opens the Datasets sub-section of the full Sources modal.
- **Attach Campaigns** — opens the Campaigns sub-section.
- **Toggle a source on/off** — keeps the attachment but removes it from the active context for the next message.

### Full Sources modal

Clicking through to the full modal exposes three top-level tabs:

| Tab | What's inside |
|---|---|
| **Campaigns** | Every campaign in the workspace you have access to. Picking a campaign attaches its responses + question summaries. |
| **Datasets** | Every dataset (training set) you have access to. Picking a dataset attaches its files, videos, and audios. |
| **All files** | A unified view of every individual file/video/audio across datasets. Useful for attaching just a specific document instead of the whole dataset. |

### What the conversation actually stores

The chat source state can hold a finer-grained mix than the top-level tabs suggest:

- Campaigns
- Specific campaign **questions** (drill into a campaign to attach individual questions)
- Datasets (training sets)
- Individual files
- Individual videos
- Individual audios

You may not see "Questions" or "Files" as top-level tabs, but the underlying state supports them via drill-in pages and saved conversation state. So a single conversation can carry a mix of campaign and dataset context across different granularities.

::: tip Narrower sources = more traceable answers
The temptation is to attach everything and let the model figure it out. Resist it. Narrower source sets produce more accurate citations because there's less competing context, and the **Powered by** section becomes a meaningful audit trail rather than a sprawling list.
:::

---

## Part 2 — Chat citations (`Powered by N sources`)

When you send a message to an Agent with attached sources, the response may render a **Powered by** footer once grounding data is available.

### What the section can render

```text
┌─────────────────────────────────────────────────────────────┐
│  Agent response text appears here, possibly with inline      │
│  ⁽¹⁾ ⁽²⁾ superscript citation markers when enabled.          │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│  ⓘ Powered by 4 sources                                  ▾  │
│  ─────────────────────────────────────────────────────────  │
│  • Campaign answer — "Holiday 2025 / Why did you switch …"   │
│  • Question summary — "Most-mentioned features"              │
│  • Dataset file — "Q4-2025-report.pdf · p. 12"               │
│  • Web source — "https://example.com/article-title"          │
└─────────────────────────────────────────────────────────────┘
```

### Behavior details

- **The label is clickable.** Click anywhere on **Powered by N sources** to expand/collapse the source list. A chevron (`›`) on the right indicates expandability.
- **The info icon (ⓘ) opens a tooltip** linking out to the grounding help article.
- **Loading state.** The answer text can appear before grounding is fully ready. In that interim you may see _"Powered by..."_ or _"Loading sources..."_ — the API streams the response text first and finalises the source list a beat later.
- **`See how this works` chip** — when expanded, the section can include a small link explaining the grounding pipeline.
- **The Citations toggle** — a separate per-message action that inserts/removes the inline `⁽ⁿ⁾` superscripts in the response text. Only present when the message actually has grounding entries.

### Source types in the grounding section

| Type | Where it came from | What the entry shows |
|---|---|---|
| **Campaign answer** | A specific response in an attached campaign | Campaign name + question prompt + a short quote |
| **Question summary** | The aggregated summary for one question | Campaign name + question text |
| **Dataset file** | A PDF / document in an attached dataset | Dataset name + filename + page number when available |
| **Dataset video** | A video transcript chunk | Dataset name + video title + timestamp |
| **Dataset audio** | An audio transcript chunk | Dataset name + audio file + timestamp |
| **Web source** | An external URL the agent retrieved via a tool | Page title + URL |

A single response can mix internal (campaign + dataset) and external (web) sources. This is the normal case for Agents with both knowledge-base access and web tools enabled.

### Tool-naming

When an Agent invokes the workspace retrieval tool, the tool-call shows up in some surfaces as **Search Knowledge Base** — a friendly alias for the underlying RAG call against your datasets and campaigns.

### Inline superscript citations

Toggle on Citations in the message actions to inject `⁽¹⁾` `⁽²⁾` superscript markers into the response text. The markers map back to entries in the Powered-by list (positions are generated from `grounding_support` offsets returned by the model).

### Backend tolerance

The chat citation pipeline is intentionally tolerant of imperfect upstream data:

- If the message includes `grounding_support`, the app uses it directly.
- If only `grounding` is present (no support shape), the backend can still synthesize a basic citations structure.
- If neither is present, the message renders without a Powered-by section — no error, no warning.

That means citations show up wherever the underlying provider gave us enough data to surface them, and the absence of citations isn't a failure — it's just a less-grounded answer.

---

## Part 3 — Structured Output Evidence badges (workflow outputs, dashboards)

When a Workflow produces a **structured output** (a card-based dashboard, a JSON export, an exported deliverable), every field-bound element gets its own evidence badge. This is a separate pipeline from chat citations.

### The post-run extractor

On the API side, `WorkflowProcessor` runs a separate post-step after the run reaches `status === 'completed'` and before the `ORCHESTRATION_COMPLETED` event fires:

1. The workflow's freetext Markdown report exists at this point.
2. The published **OutputSpec** declares a structured schema (fields with keys like `confidenceScore`, `topThemes`, `keyTakeaways`, etc.).
3. The extractor forces a single Claude tool call (`emit_structured_output_with_evidence`) using `claude-sonnet-4-5` with `max_tokens: 4096`.
4. The tool's schema is compiled from the OutputSpec's `schema.fields` so the model **cannot drift outside the contract**.
5. The result is `{ value, citations[] }` per field — i.e. each emitted field comes with ≥1 supporting citation drawn from the freetext.

::: tip Extraction is best-effort by design
The extractor is intentionally optional. If it fails, the run still completes — the original freetext Markdown report is always the fallback. The renderer surfaces missing fields as placeholders rather than rejecting the whole payload. This means a partial structured output is better than no output.
:::

### Citation type (frontend & backend stay in sync)

```ts
type Citation = {
  quote: string;        // 1-3 sentence verbatim snippet from the freetext
  sourceUrl?: string;   // a URL/link if the run output included one
  sourceTitle?: string; // a title if the run output included one
};

type CitationsByField = Record<string, Citation[]>;  // keyed by SchemaField.key
```

> The view-layer `Citation` type explicitly mirrors the API's. The frontend `types.ts` carries a comment: _"Keep these in sync — any change to the API-side shape must land in this file too."_ If you're an engineer touching either side, edit both.

### How elements get the badge

The `OutputRenderer` wraps the surface adapter in a `<CitationsProvider citations={...}>` carrying the full `CitationsByField` map. Each element renderer is wrapped in `<ElementWithCitations element={...}>`, which:

- Reads citations for that element's `fieldKey` via `useCitationsForField`.
- Skips wrapping entirely (no badge) for element types that don't bind to a field: `customLayout`, `divider`, `divider-with-label`.
- For everything else, adds a `position: relative` container and places the `CitationsBadge` at `position: absolute` top-right.

This means element renderers themselves stay unchanged — they don't have to "opt in" to citations.

### The Evidence badge interaction

| Interaction | Behavior |
|---|---|
| **Click the pill** | Opens a click-to-open popover (NOT a hover tooltip — the popover has focusable content). |
| **Popover position** | `z-index: 30`, floats above sibling elements. The badge itself sits at `z-index: 2`. |
| **Popover contents** | A list of citations, each showing the verbatim quote and (when present) a clickable source link. |
| **Escape key** | Closes the popover. |
| **Outside click** | Closes the popover. |
| **Focus return** | On close, focus is restored to the badge trigger button (accessibility-correct). |

#### Accessibility

- `aria-haspopup="dialog"` and `aria-expanded` on the trigger button
- `role="dialog"` and `aria-label` on the popover
- `aria-label` on the trigger is built from a humanized `fieldKey`: `confidenceScore` → _"confidence score"_, `topThemes` → _"top themes"_. This avoids screen readers announcing nine identical _"Evidence button"_ entries on a multi-element dashboard.

### Empty state

A badge with zero citations still renders, with an "empty-state copy" inside the popover. This is intentional: the absence of supporting evidence is itself a signal to the reader that this particular field is more inferred than directly grounded.

---

## Security: LLM-generated URLs in citation popovers

This is worth its own section because the threat is real.

The `sourceUrl` on a citation is **LLM-generated**. An adversarial input to the workflow could cause a model to emit something like `javascript:alert(document.cookie)` as a citation URL. If the popover rendered that string in a clickable `<a href>`, clicking it would execute the JavaScript in the user's session.

`target="_blank" rel="noopener noreferrer"` **does not** neutralize `javascript:` URLs — those attributes only affect cross-origin window relationships, not URL scheme execution.

The citations renderer therefore uses a `safeHttpUrl(raw)` helper:

```ts
function safeHttpUrl(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}
```

- Only `http:` and `https:` URLs are rendered as clickable links.
- `javascript:`, `data:`, relative paths, and malformed URLs are rendered as **text only**.
- The raw `sourceUrl` is still shown to the user, so they can audit it — they just can't click it.

If you're contributing UI that renders citation URLs anywhere else (e.g. exports, chat surfaces), use this allowlist pattern.

---

## How the two pipelines compare

| | **Chat citations** | **Structured Output Evidence badges** |
|---|---|---|
| **Where rendered** | Under a chat response bubble | On every bound element of an OutputRenderer surface |
| **Granularity** | One source list per message, optional inline `⁽ⁿ⁾` superscripts in the text | One badge per field-bound element |
| **Backed by** | `grounding`/`grounding_support` returned with the message | A separate post-run `emit_structured_output_with_evidence` tool call |
| **Source types** | Campaign answers, question summaries, dataset files/videos/audios, web | Verbatim quotes from the freetext report (with optional URL/title metadata) |
| **Failure mode** | Just renders no Powered-by — answer text still appears | Renderer falls back to placeholders; freetext Markdown report is always available too |
| **Trigger** | Inherent in chat message return | Post-run extraction step (best-effort) |
| **Surface** | `vurvey-web-manager/src/canvas/...` | `vurvey-web-manager/src/output-renderer/...` |
| **Migration that added it** | `20241205232734_add-citations-to-chat-messages` (Dec 2024) | `20260518000001_wrap-structured-output-with-citations` (May 2026) |

---

## Constraints & limitations

- **Sources are conversation-scoped.** Attaching a dataset in one conversation does not attach it everywhere — each conversation has its own source state.
- **Citations are only as good as the model's response.** If the model didn't produce grounding signals for a particular sentence, that sentence won't get a superscript even if the conversation has sources attached.
- **Inline superscripts depend on `grounding_support`.** Without per-offset support data, the inline-citation toggle won't have positions to insert markers at.
- **Web sources are tool-driven.** They appear only when the Agent has and uses a web-retrieval tool. Many agents don't.
- **Structured-output evidence is best-effort.** A failed extraction does not block the run, but it also means some runs render with empty evidence popovers.
- **Citation URLs are LLM-generated**, so they're subject to model fabrication. `safeHttpUrl` neutralizes the worst attack vector but cannot validate the link points to a real page — always treat citation links as advisory, not authoritative.
- **Hover does not open the popover.** Evidence popovers are click-to-open by design (focusable content).
- **No drag-to-resize on popovers.** They use fixed widths set by stylesheet.
- **Citation snippets are short (1-3 sentences).** Long supporting passages are truncated in the popover.
- **No multi-message citation context.** Each chat message owns its own grounding; there's no "cite this from three messages ago."

---

## Best practices

- **Attach narrow source sets.** Five focused sources produce better citations than fifty broad ones. The model has less to wade through and is more likely to ground specific claims.
- **Use Datasets for stable knowledge bases**, Campaigns for "the freshest community voice", and Web tools only when external corroboration is needed.
- **Turn citations on when reviewing factual claims, quotes, or counts.** Off is fine for brainstorming.
- **Expand Powered by to audit which sources got referenced.** If a campaign you expected didn't appear, the model didn't draw from it — adjust your prompt or rephrase the question.
- **For dashboards, click each Evidence badge before exporting** — that's the audit trail you'd want in a stakeholder review.
- **Don't rely on the raw URL text in citation popovers.** Click only the underlined ones (those passed the `safeHttpUrl` allowlist).
- **Sync the two `Citation` type definitions.** If you change one (in `vurvey-api/src/services/output-spec/extraction/structured-output-extractor.ts`), change the other (in `vurvey-web-manager/src/output-renderer/citations/types.ts`).
- **Prefer "Question summary" sources over "Campaign answer" sources** when summarizing a campaign. Summaries are tighter and produce cleaner citations.

---

## FAQ

#### Why don't I see citations on every Agent response?
Two reasons: (1) the message didn't have grounding data from the model/provider, or (2) the conversation had no sources attached. Citations are emergent — they appear when grounding signals are present, not by default.

#### Why does "Powered by..." stay visible for a moment without a number?
Streaming. The answer text comes through first; the grounded source list finishes a beat later. _"Powered by..."_ / _"Loading sources..."_ is the placeholder while we wait.

#### Are Evidence badges the same as Powered-by citations?
No. Powered-by is the chat-bubble grounding section (one list per message). Evidence badges are per-element pills on structured outputs (dashboards, exports). Different pipelines, different code paths, both surface attribution.

#### Can I get inline citation superscripts on structured output elements?
Not today — superscripts are a chat-bubble feature. Structured output uses the Evidence badge popover instead.

#### What's a "field key"?
The internal identifier for a structured-output field as declared in its OutputSpec — e.g. `confidenceScore`, `topThemes`. Evidence badges attach by field key, so an element bound to `confidenceScore` reads `citations["confidenceScore"]`.

#### Can a citation point to multiple places?
A single `Citation` is one quote with at most one URL and title. A field can have many citations (`Citation[]`), so the popover lists all of them. Chat citations work similarly — each superscript maps to one grounding entry, but a message can have many.

#### Why are citation URLs sometimes shown as plain text instead of links?
The URL failed the `safeHttpUrl` allowlist — it wasn't `http:` or `https:`, or it didn't parse cleanly. The raw text is still shown so you can audit the URL, but you can't click it. This protects against LLM-generated `javascript:` URLs.

#### Can I customize the look of the Evidence badge?
Not via the UI. The badge is a shared component (`CitationsBadge`). If you're an engineer, you can override styles via `citations-badge.module.scss`.

#### Can I disable citations entirely?
Not as a top-level toggle. You can turn off the inline-superscript citations per message, and Powered-by is hidden when no grounding data exists. Evidence badges are always rendered on elements that have a field key.

#### Are citations stored permanently?
Chat citations are persisted on the message record (`citations` column added in the Dec 2024 migration). Structured-output citations are stored as part of the run's structured output JSON.

#### Will the Evidence popover work in a printed PDF export?
The export surface adapter renders citations differently — typically as a per-element footnote list rather than an interactive popover. The information is preserved; the interaction is not.

#### Why does the extractor use Sonnet 4.5 instead of Opus?
_"Sonnet 4.5 is the cheap default — extraction is short-context, schema-constrained, and called once per run, so we don't need Opus tier reasoning here."_ — per the source comment. The constrained schema does the hard work; the model just has to map freetext to fields.

#### Can extraction fail?
Yes, and that's expected. If it fails, the run still completes, the freetext Markdown report remains available, and the rendered output uses placeholders for missing fields. Failures here MUST NOT block run completion.

#### Where do "Web sources" come from?
From Agent tools that retrieve external URLs (web search, fetch, browse). The agent must have those tools enabled. If an agent doesn't have a web-retrieval tool, its responses will never include Web grounding entries.

#### Why does "Search Knowledge Base" show up in some tool-call logs?
It's the user-friendly alias for the workspace retrieval tool — the same one that fetches campaign and dataset chunks for grounding. The internal tool name is different; the display name is normalized so users see a consistent label.

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| Powered-by section never appears | The conversation has no sources attached, OR the message returned no grounding data from the provider. Try attaching a focused dataset and re-asking. |
| Inline superscripts toggle is missing | The message has no grounding entries. The toggle only renders when there are entries to map markers to. |
| "Powered by..." stays forever | The grounding finalisation didn't return. Refresh the page to see the persisted state; if still missing, the chat-citations pipeline failed for that message (no UX-blocking error). |
| Evidence badge shows but popover is empty | The field had no citations from the extractor. Either the freetext didn't support that field strongly enough, or extraction partially failed. The element still rendered the value; the popover is empty by design. |
| Evidence badge link doesn't open in a new tab | The URL failed `safeHttpUrl` (non-http/https scheme). The text is shown but the click is disabled. |
| Source attached but agent didn't use it | The model didn't reach for that source for this specific question. Try rephrasing more specifically, or narrow the attached source set to make the relevant one easier to find. |
| Citations on a dashboard but freetext report is missing | Possible — the legacy freetext report is the fallback path for runs that don't use the structured-output spec. If the spec is published, you get structured + citations; if not, you get freetext only. |
| Popover closed but focus is somewhere unexpected | The focus-return logic should put you back on the badge trigger. If not, file a bug — accessibility regression. |
| Chat citations look duplicated | A single source can back multiple text spans, so the same entry can appear in the list and in multiple superscripts. Expected. |
| Web sources appearing on an internal-only agent | The agent has a web-retrieval tool enabled even though you didn't expect it. Check the agent's capability bindings. |

---

## Related guides

- [Agents](/guide/agents) — the entities that produce citations; their capability bindings determine which source types they can retrieve from
- [Datasets](/guide/datasets) — one of the two primary internal source types
- [Campaigns](/guide/campaigns) — the other primary internal source type
- [Workflows](/guide/workflows) — produce the structured outputs that surface Evidence badges
- [Capabilities](/guide/capabilities) — which tools an agent has, including web retrieval
- [Home](/guide/home) — the chat surface where Powered-by appears most often
- [Topic Graph (Insights)](/guide/topic-graph) — adjacent attribution surface for campaign response themes
- [Permissions & Sharing](/guide/permissions-and-sharing) — what sources a user is allowed to attach in the first place
