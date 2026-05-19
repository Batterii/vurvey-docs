---
title: Topic Graph Explorer (Chat Tool)
---

# Topic Graph Explorer (Chat Tool)

The **`exploreTopicGraph`** chat tool lets the AI query a campaign's Topic Graph via five Graph-RAG-style operations. When you ask questions like "what themes emerged in our brand audit?" or "how does pricing connect to customer satisfaction?", this is the tool the AI calls to ground its answer in your actual data. This doc covers what each operation does, when the AI uses it, and how to interpret the results.

::: tip Audience
This doc is for engineers integrating with the chat backend, advanced workspace admins debugging "why did the AI answer this way?", and curious power users who want to understand the graph operations that drive their citations. End users see the results — themes, entities, citations — without needing to know about the underlying operations.
:::

::: warning Flag note: `topicGraphEnabled`
The Topic Graph Explorer tool is only available in workspaces with `topicGraphEnabled: true`. Without it, the chat backend simply doesn't register this tool. See [Topic Graph](/guide/topic-graph) for how to enable it and [Feature Flags Reference](/guide/feature-flags#topicgraphenabled) for the broader feature flag landscape.
:::

---

## What it is

`exploreTopicGraph` is a **single Vercel AI SDK tool with five operations** that gives the AI Graph-RAG-style access to the Neo4j Topic Graph behind each campaign. The graph contains:

- **TopicEntity** nodes — concepts, products, concerns, benefits extracted from responses
- **Theme** nodes — Louvain-clustered groups of related entities
- **TOPIC_RELATED** edges — semantic relationships between entities

The AI uses this tool to answer questions about themes, entities, sentiment rollups, relationships, and supporting evidence — instead of guessing from training data, it pulls real data from your campaign.

---

## When the AI invokes it

You don't manually trigger this tool — it's auto-selected by the AI when:

1. Your message references a campaign
2. The campaign has Topic Graph processing complete
3. Your workspace has `topicGraphEnabled`
4. Your question is about themes, entities, sentiment, or relationships

The AI is instructed via the tool's description to "call summary first to orient yourself" unless it already has specific IDs. So a typical conversation might invoke `summary` once at the start of analysis, then drill in via the other operations.

---

## The five operations

### 1. `summary` — top-level orientation

> 📷 _Screenshot pending: Chat showing AI calling summary with results displayed as themes list + entity-type distribution + top entities_

| Input | Required |
|---|---|
| `campaignId` | Yes |
| `operation: "summary"` | Yes |

**What it returns:**

- **Top themes** — Louvain-clustered themes with member counts, dominant entity type, label, color
- **Entity-type distribution** — how many entities of each type (Product, Concern, Benefit, etc.)
- **Top-mentioned entities** — the most-referenced entities across the campaign
- **Sentiment rollup** — aggregate benefit/concern counts

**When the AI uses it:**
- First operation in any new Topic Graph exploration
- When the user asks "what stood out?" or "what's the campaign about?"
- When the AI lacks specific IDs and needs entry-point context

**Sample summary response (paraphrased):**

```
"The top themes in this campaign are 'Pricing concerns' (245 mentions),
 'Product quality' (198 mentions), and 'Customer service' (167 mentions).
 The most-mentioned entities are 'subscription' (89), 'mobile app' (74),
 and 'support team' (62). Overall sentiment leans negative with 312
 concerns vs 178 benefits."
```

### 2. `theme_details` — drill into a theme

> 📷 _Screenshot pending: Chat showing theme details — entities + sample answers for a theme_

| Input | Required |
|---|---|
| `campaignId` | Yes |
| `operation: "theme_details"` | Yes |
| `themeId` | Yes |
| `limit` | Optional (defaults vary) |

**What it returns:**

- **Member entities** — entities that belong to this theme (up to limit)
- **Sample answers** — supporting survey-response excerpts
- **Theme metadata** — label, dominant entity type, color, member count

**When the AI uses it:**
- After `summary`, when the user wants to know "what's in the pricing theme?"
- To gather supporting quotes for a claim
- To list the specific entities driving a theme

**Special: synthetic theme IDs**

The frontend uses **synthetic theme IDs** for entity-type fallback when a campaign has no Louvain themes yet (or when grouping by type makes more sense). These IDs have the prefix `type:` — e.g. `type:Product`, `type:Concern`. The tool accepts these AS IF they were real theme IDs and groups results by that entity type.

This keeps the AI's behavior identical whether the user is exploring real clusters or type-grouped fallbacks — no special case in the prompt.

### 3. `entity_search` — fuzzy name lookup

> 📷 _Screenshot pending: Chat showing entity search results for a query_

| Input | Required |
|---|---|
| `campaignId` | Yes |
| `operation: "entity_search"` | Yes |
| `query` | Yes |
| `entityTypes` | Optional filter (e.g. `["Product", "Concern"]`) |
| `limit` | Optional (max 50, defaults to ~10) |

**What it returns:**

- Matching entities (name + alias CONTAINS query, case-insensitive)
- For each: mention count + aliases + 1-hop neighborhood pre-expanded

**When the AI uses it:**
- User asks "what did people say about [some entity]?"
- AI needs to look up a specific brand / product / concept name
- Filtering: when the AI knows it wants only Products or only Concerns

**Sample query/response:**

```
Query: "subscription"
Filter: entityTypes: ["Product", "Concern"]
Results:
 - "subscription model" (Product, 89 mentions, aliases: ["subscription plan", "subs"])
 - "subscription pricing" (Concern, 34 mentions)
 - "subscription cancellation" (Concern, 22 mentions)
```

### 4. `neighborhood` — graph traversal

> 📷 _Screenshot pending: Chat showing the 2-hop neighborhood of an entity_

| Input | Required |
|---|---|
| `campaignId` | Yes |
| `operation: "neighborhood"` | Yes |
| `entityId` | Yes |
| `depth` | Optional, 1 or 2 (default 1) |
| `limit` | Optional (max 50) |

**What it returns:**

- All entities reachable within `depth` hops from `entityId`
- The edges (TOPIC_RELATED relationships) between them
- Edge weights (signal strength)

**When the AI uses it:**
- User asks "what's connected to X?"
- Building a 1- or 2-hop "context bubble" around a concept
- Investigating "what else came up when people talked about pricing?"

**Why depth is capped at 2:**
3+ hops in a connected graph explode quickly — a typical campaign's 2-hop neighborhood is already 20-100 entities; 3-hop could be hundreds. The cap is a guardrail against runaway responses.

### 5. `path` — shortest-path between two entities

> 📷 _Screenshot pending: Chat showing a path from entity A through intermediate entities to entity B_

| Input | Required |
|---|---|
| `campaignId` | Yes |
| `operation: "path"` | Yes |
| `fromEntityId` | Yes |
| `toEntityId` | Yes |
| `maxHops` | Optional, 1-6 (default 4) |

**What it returns:**

- The shortest TOPIC_RELATED path between the two entities
- All intermediate entities along the path
- Relationship types and weights for each edge

**When the AI uses it:**
- User asks "how does X relate to Y?"
- Multi-step reasoning: "what links pricing concerns to churn risk?"
- Cross-entity narrative-building

**If no path exists** (the two entities are in disconnected components), the operation returns an empty path with an explanation.

---

## Input schema (full)

```ts
{
  campaignId: string,                    // Required — the survey/campaign UUID
  operation: "summary" | "theme_details" | "entity_search" | "neighborhood" | "path",
  themeId?: string,                       // Required for theme_details
  entityId?: string,                      // Required for neighborhood
  query?: string,                         // Required for entity_search
  entityTypes?: string[],                 // Optional filter for entity_search
  fromEntityId?: string,                  // Required for path
  toEntityId?: string,                    // Required for path
  depth?: 1 | 2,                          // Optional, neighborhood depth (default 1)
  maxHops?: number,                       // Optional, 1-6 (default 4) for path
  limit?: number,                         // Optional, 1-50, defaults vary by op
}
```

---

## Output shape

Every operation returns the same shape:

```ts
{
  summary: string,                        // Human-readable summary the AI quotes
  operation: string,                       // Echoes which op was run
  data: Record<string, unknown>,           // Structured payload for follow-up ops
  grounding: AnswerGroundingEntry[]        // Citations — survey/question/user refs
}
```

### The `summary` field

A natural-language summary the AI can quote directly to the user. Vurvey's chat backend post-processes this and may quote it inline or use it as raw context.

### The `data` field

Structured operation-specific data:

- For `summary`: themes, entityTypeDistribution, topEntities, sentimentRollup
- For `theme_details`: themeId, label, memberEntities, sampleAnswers
- For `entity_search`: matchingEntities (with 1-hop neighborhoods)
- For `neighborhood`: rootEntity, entities, edges
- For `path`: fromEntity, toEntity, path (array of entities + edges)

Future operations can reuse the same shape without breaking the chat backend's adapter.

### The `grounding` field

Every answer that was referenced gets emitted as an **answer-grounding entry**:

```ts
{
  type: 'answer',
  details: {
    id: string,
    questionId?: string,
    grounding_id: string,
    page: number,
    score: number,
    text: string,
  }
}
```

The chat backend's existing citation hydration pipeline picks these up automatically — no per-tool plumbing. Citations link back to the original survey question + respondent in [Sources & Citations](/guide/sources-and-citations).

---

## Permission and access checks

Before any operation runs, the tool performs three checks:

1. **Workspace ownership**: The `campaignId` must belong to `ctx.workspaceId`. Otherwise NotFoundError.
2. **Topic Graph enabled**: `isTopicGraphEnabledForWorkspace(workspaceId)` must return true. Otherwise InvalidOperationError.
3. **OpenFGA permission**: `authz.assertPermission(userId, 'campaign:{id}', 'can_view')` must succeed. Otherwise AccessDeniedError.

Plus a runtime check: if `neo4jClient.isConnected()` returns false, the tool returns a graceful empty result with the message "Topic graph is not available on this deployment yet."

---

## How it connects to the chat UX

When the AI invokes this tool mid-conversation:

1. The chat backend forwards the call to `exploreTopicGraph`.
2. The tool runs (typically 50-500ms depending on graph size).
3. The result's `summary` is exposed to the AI for use in the reply.
4. The `data` is available for follow-up calls (e.g. the AI sees a themeId in `summary.data.themes`, then makes a subsequent `theme_details` call).
5. The `grounding` is added to the conversation's citation set — the user sees clickable citation links in the AI's reply.
6. A **tool-call indicator** appears on the AI's response with the operation name and inputs — see [Chat Tools](/guide/chat-tools) for the visual treatment.

---

## Constraints & limitations

- **Workspace flag required.** Without `topicGraphEnabled`, the tool isn't registered.
- **Campaign must have graph data.** Brand-new or unprocessed campaigns return empty results.
- **Neo4j availability required.** If the database is disconnected, the tool returns a graceful empty result rather than failing.
- **Read-only.** No mutations possible through this tool.
- **Synthetic theme IDs are UI-side conventions.** The frontend's `SYNTHETIC_THEME_PREFIX` constant must stay in sync with the backend's.
- **Neighborhood depth capped at 2.** Higher would risk runaway result sizes.
- **Path maxHops capped at 6.** Reasonable for related-concept paths; longer paths typically don't carry meaningful semantics.
- **Limit capped at 50.** Larger result sets aren't useful for AI summarization.
- **Each operation is independent — the AI must orchestrate them.** No "do everything" mode.
- **The tool description is what teaches the AI.** Changing it shifts AI behavior significantly — handle with care.
- **Sentiment-rollup logic is op-specific.** Benefit/concern counts are simplified rollups; richer sentiment ranges require the [Retrieval Service](/guide/retrieval-service).
- **No cross-campaign queries.** Each call targets exactly one campaign.
- **Latency varies with graph size.** Small campaigns: ~50ms. Large campaigns with hundreds of themes: 500ms+.

---

## Best practices (for engineers + workspace admins)

- **Don't bypass `summary` for unfamiliar campaigns.** It gives the AI orientation that prevents wild-goose-chase exploration.
- **Use `entity_search` with `entityTypes` to narrow.** Skipping the filter returns results across all types — slower and noisier.
- **Pair `path` queries with explicit user intent.** "How does X relate to Y?" should use `path`; "what's near X?" should use `neighborhood`.
- **For debugging, examine the tool-call payload.** Click the indicator on the AI's response; see what inputs the AI sent vs. what the user typed.
- **Monitor `grounding` entries to verify citations.** If grounding is empty for a response, the AI is making unsupported claims.
- **Tune `limit` for chat-context budget.** Higher limits = more grounding entries = larger AI input context. Default values are sized for typical Sonnet-class models.
- **Avoid hot-loops of `entity_search` against the same campaign.** Repeated fuzzy lookups can degrade Neo4j performance under load.

---

## FAQ

#### How is this different from the standard retrieval tool?
- **`exploreTopicGraph`** queries the structured Neo4j Topic Graph — themes, entities, relationships.
- **Standard retrieval** (see [Retrieval Service](/guide/retrieval-service)) queries the BigQuery-stored embeddings of raw text — semantic search.

They complement each other. The AI typically uses both: graph for "what are the themes?" and retrieval for "find quotes that say X."

#### Why isn't the tool firing on my campaign?
Possible reasons:
1. Workspace lacks `topicGraphEnabled`.
2. Campaign has no graph data yet (background processing not complete).
3. Your prompt didn't trigger a Topic Graph-shaped intent.
4. The campaign belongs to a different workspace.
5. You don't have view permission on the campaign.

#### What's a Louvain theme?
A theme produced by the **Louvain community detection** algorithm — runs on the entity graph to cluster densely-connected entities into "themes." See [Topic Graph → Pipeline](/guide/topic-graph#pipeline).

#### What's the difference between Louvain themes and synthetic themes?
- **Louvain**: actual graph-clustered groupings (algorithm-driven).
- **Synthetic** (`type:Product` etc.): fallback grouping by entity type when Louvain hasn't run or when grouping by type is more useful.

Both work identically through the tool's `theme_details` operation.

#### Can the AI call `exploreTopicGraph` multiple times in one response?
Yes — the AI typically calls `summary` first, then drills in with subsequent calls based on what it found.

#### Why is my `path` operation returning empty?
The two entities are in disconnected components of the graph. Try a `neighborhood` from each entity to see what each is connected to.

#### How fresh is the data?
Topic Graph data updates as campaign responses come in via background processing pipelines (see [Cloud Functions Reference](/guide/cloud-functions)). New responses appear in the graph within minutes typically; major recomputations (re-clustering) happen on schedule.

#### Can I see what `exploreTopicGraph` returned for a past chat?
The tool-call indicator on AI replies shows the inputs and outputs. Click to expand. See [Chat Tools](/guide/chat-tools).

#### Does this tool draw credits?
Each tool invocation is a backend call. See [Credits & Usage](/guide/credits-and-usage) for the broader tool-cost model.

#### What if the campaign ID is wrong?
The tool throws `NotFoundError` and the AI gets an error message. The AI typically tells the user "I couldn't find that campaign."

#### Can I extend this tool with a sixth operation?
Yes — it's designed for additive edits. Each operation is a private function. Talk to engineering; the pattern is straightforward.

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| Tool not invoked at all | `topicGraphEnabled` workspace flag off, OR prompt didn't trigger Topic Graph intent |
| "Topic graph not enabled" error | Workspace flag is off — request enablement from CSM |
| "Topic graph not available" empty result | Neo4j disconnected — talk to engineering / Cloud Logging |
| Empty results for known-active campaign | Campaign hasn't had Topic Graph processing complete; check `sensemake-create-question-insights*` Cloud Logging |
| `path` returns empty | Entities in disconnected components |
| Limit cap (50) feels low | Tune per use case — but 50 is generally enough for chat context. Multiple calls > one huge call |
| Synthetic theme IDs not working | Frontend and backend's `SYNTHETIC_THEME_PREFIX` constants must match (`type:`) |
| Permission denied | OpenFGA tuples missing for `campaign:{id}` `can_view` for the user |
| Latency too high | Large graph; Neo4j query plan inefficient; talk to engineering with the query trace |
| Sentiment rollup feels wrong | Aggregate counts only — for nuanced sentiment use Retrieval Service with sentiment filters |
| Citations missing despite tool call | `grounding` field empty — check answerIds collection in the relevant operation |

---

## Cross-references

- [Topic Graph](/guide/topic-graph) — the parent feature surface
- [Chat Tools](/guide/chat-tools) — how tools generally work in chat
- [Retrieval Service](/guide/retrieval-service) — sibling tool for semantic text retrieval
- [Sources & Citations](/guide/sources-and-citations) — how the answer-grounding entries surface to users
- [Campaigns](/guide/campaigns) — campaigns are the source data
- [Cloud Functions Reference](/guide/cloud-functions) — `sensemake-*` functions populate the graph
- [Permissions & Sharing](/guide/permissions-and-sharing) — `can_view` check on campaigns
- [Architecture](/guide/architecture) — how the Topic Graph fits in the platform
- [Settings → Topic Graph Toggle](/guide/settings#4-topic-graph-toggle) — customer-facing enablement
- [Feature Flags Reference](/guide/feature-flags#topicgraphenabled) — flag details
- [Developer & API Reference](/guide/developer-reference) — for direct API consumers
- [Credits & Usage](/guide/credits-and-usage) — tool invocations draw credits
- [Glossary](/guide/glossary) — TopicEntity / Theme / Louvain / Graph-RAG definitions
