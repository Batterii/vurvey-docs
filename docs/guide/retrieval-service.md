---
title: Retrieval Service (RAG)
---

# Retrieval Service (RAG)

The **Retrieval Service** — internally `vurvey-retriever` — is the engine behind Vurvey's semantic search, citation-grounded answers, and dataset / campaign lookups inside chat. It's a standalone Python HTTP Cloud Function that the main API calls as a tool every time the AI needs to look something up. This doc covers how it works, what filters it supports, how it scores results, and how to interpret its responses.

::: tip Audience
This is primarily a reference for engineers and integrators building AI experiences that need to query Vurvey's knowledge stores. Most product users never interact with it directly — they see its output as "citations" in chat answers (see [Sources & Citations](/guide/sources-and-citations)). But understanding how it works helps explain why some queries return certain results.
:::

---

## What it does

When a user asks "what are customers saying about our latest launch?" in a Vurvey chat, the conversation goes roughly like this:

1. The chat backend (`vurvey-copilot`) decides this question needs grounded data.
2. It calls the retriever via HTTP with a **query string**, a **workspace ID**, an optional set of **filters** (e.g. "only campaigns from the last 30 days"), and a **distance threshold**.
3. The retriever:
   - Sanitizes the query
   - Generates an embedding for it
   - Runs a BigQuery vector search across the workspace's indexed documents (Datasets + Campaign answers)
   - Optionally reranks the top K via Vertex AI
   - Filters by OpenFGA permissions (so users only see what they're allowed to)
   - Returns a list of relevant text passages with citations
4. The chat backend uses those passages to ground the AI's answer (with citations linking back to source).

The retriever is **stateless** — every call is independent. No conversation history; the caller passes everything needed.

---

## Where it lives

| Aspect | Detail |
|---|---|
| **Repo** | github.com/batterii/vurvey-retriever |
| **Type** | Python HTTP Cloud Function (functions-framework) |
| **Runtime** | `python310` in GCF (deploy workflow pin); local dev uses Python 3.11 |
| **Main file** | `retriever_service.py` (~42KB — the bulk of the logic) |
| **Permissions** | `permissions.py` — OpenFGA-backed access control |
| **Reranking** | `reranker.py` — Vertex AI reranker integration |
| **Storage** | BigQuery (embeddings + metadata), PostgreSQL (some metadata) |

The retriever is a **sibling repo** of vurvey-api, not a subtree — it deploys independently.

### Deployment environments

| Branch | Project | Function name | Notes |
|---|---|---|---|
| `staging` | vurvey-development | `vurvey-retriever-staging` | Pre-production testing |
| `experimental` | vurvey-development | `vurvey-retriever-experimental` | Beta features / experiments |
| `release` | vurvey-production | `vurvey-retriever-prod` | Production |

Each environment has its own VPC connector so deploys from one branch never overwrite another cluster.

---

## The request payload

The retriever expects a JSON POST with these fields:

### Required

| Field | Type | Purpose |
|---|---|---|
| `query` or `prompt` | string | Natural-language query to embed and search |
| `workspace` or `workspaceId` | GUID | Workspace/tenant identifier (maps to BigQuery dataset) |

### Common optional fields

| Field | Default | Purpose |
|---|---|---|
| `queries` | `[]` | Array of alternate phrasings; each runs as a separate search, results deduplicated |
| `dataset` or `filters` | `[]` | Filter array (see below) |
| `retrievalType` | `chunks` | `chunks` for chunk-level passages, `pages` for page aggregates |
| `limit` | 50 | Top K results to request from the vector search |
| `distance` | 0.55 | Cosine similarity threshold — only results closer than this are kept |
| `sources` | both | Restrict to `datasets` (files/training sets), `campaigns` (survey answers), or both |
| `searchMode` | `semantic` | `semantic` (vector), `lexical` (keyword), or `hybrid` (merged) |
| `hybridAlpha` | 0.5 | When `searchMode: hybrid`, weight between vector and keyword (0=lexical, 1=semantic) |
| `conversationId` | — | Conversation GUID — used to resolve the requesting user for permission checks |
| `userId` | — | Explicit user ID for permissions (bypasses conversation lookup) |
| `includeVectors` | false | If true, response includes embedding vectors (large; usually omit) |
| `checkPermissions` | **true** | Enforce OpenFGA permission filtering |
| `maxPerFile` | — | Cap results per file to ensure variety |
| `maxPerAnswer` | — | Cap results per survey answer to ensure variety |
| `reranker` | `none` | `vertex` enables Vertex AI reranking; `none` disables |
| `rerankerTopK` | — | Number of top results to send through the reranker |

::: warning checkPermissions defaults to true
The retriever defaults to enforcing OpenFGA permissions — meaning a user's results are filtered to what they have access to. Callers can pass `checkPermissions: false` to bypass this, but doing so is **dangerous** outside of trusted server-to-server contexts. The default-true protects against accidental over-disclosure.
:::

---

## The filter language

The `dataset` / `filters` array is a list of `{filter_id, filter_value}` objects. Filters supported:

### Resource ID filters

| Filter ID | Filters by |
|---|---|
| `fileID` | A specific uploaded file |
| `videoID` | A specific video |
| `collectionID` | A specific dataset collection |
| `questionID` | A specific campaign question's answers |
| `answerID` | A specific answer |
| `userID` | A specific user's content |
| `campaignID` | A specific campaign |

### Metadata filters

| Filter ID | Filters by |
|---|---|
| `fileType` | MIME-type-style file category (e.g. `pdf`, `mp4`) |
| `model` | AI model that processed the content (e.g. `claude-3-5`) |
| `uploadedBy` | The user who uploaded the source content |

### Date range filters

| Filter ID | Behavior |
|---|---|
| `createdAfter` | ISO date — content created after this |
| `createdBefore` | ISO date — content created before this |
| `dtAfter` | Alias for createdAfter (legacy) |
| `dtBefore` | Alias for createdBefore (legacy) |

### Sentiment range filters

For analyzing emotional content tone:

| Filter ID | Description |
|---|---|
| `positiveGte` / `positiveLte` | Positive-sentiment score |
| `negativeGte` / `negativeLte` | Negative-sentiment score |
| `neutralGte` / `neutralLte` | Neutral-sentiment score |
| `compoundGte` / `compoundLte` | Compound (overall) sentiment score |

### Quality filters

For filtering out low-quality / noisy content:

| Filter ID | Description |
|---|---|
| `language` | ISO language code (e.g. `en`, `es`) |
| `clarityGte` | Minimum clarity score (0-1) — filters out unclear text |
| `salienceGte` | Minimum salience score — filters out generic / non-specific content |
| `perplexityLte` | Maximum perplexity — filters out noisy / nonsensical content |
| `toxicityLte` | Maximum toxicity — filters out abusive / problematic content |

---

## The response payload

```json
{
  "query": "How are customers reacting to the newest product launch?",
  "workspaceId": "workspace-guid",
  "retrievalType": "chunks",
  "limit": 25,
  "distanceThreshold": 0.55,
  "resultCount": 3,
  "results": [
    {
      "id": "document-id",
      "fileID": "file-guid",
      "collectionID": "collection-guid",
      "text": "Raw passage text…",
      "vector": [0.12, 0.04, "…"],
      "distance": 0.78,
      "rank_score": 0.78
    }
  ],
  "metadata": {
    "projectId": "vurvey-development",
    "sanitizedQuery": "…",
    "sanitizedQueries": ["…"],
    "hadSanitizationIssues": false,
    "sanitizationWarnings": [],
    "permissionContext": {
      "checked": true,
      "userId": "user-guid",
      "source": "conversation"
    },
    "filtersApplied": [],
    "sourcesRequested": ["datasets", "campaigns"],
    "searchMode": "hybrid",
    "maxPerFile": 5,
    "maxPerAnswer": 3,
    "hybridAlpha": 0.5,
    "reranker": "vertex",
    "rerankerTopK": 25,
    "queryStats": [
      {
        "source": "datasets:chunks",
        "jobId": "bq-job-id",
        "bytesProcessed": 123456,
        "cacheHit": false,
        "elapsedMs": 87
      }
    ],
    "elapsedMs": 132
  }
}
```

### Result fields

| Field | Meaning |
|---|---|
| `id` | Internal document ID |
| `fileID` | Source file ID (if applicable) |
| `collectionID` | Source collection ID (dataset / training set) |
| `text` | Raw passage text |
| `vector` | Embedding (omitted if `includeVectors: false`) |
| `distance` | Cosine similarity score (lower = closer match in raw vector space; higher = better) |
| `rank_score` | Final reranked score (if reranker was applied; otherwise same as distance) |

Additional fields may be included depending on the source type — e.g. campaign answers include `questionID`, `answerID`, `respondentName`; video chunks include `videoID`, `startTime`, `endTime`.

### Metadata fields

| Field | Meaning |
|---|---|
| `projectId` | GCP project the retriever is running in |
| `sanitizedQuery` | Query after PII / profanity scrubbing |
| `hadSanitizationIssues` | Whether sanitization changed anything |
| `permissionContext` | Who's making the request and how OpenFGA was checked |
| `filtersApplied` | Resolved filters (with normalized values) |
| `queryStats` | Per-BigQuery-job stats (bytes processed, cache hit, elapsed time) |
| `elapsedMs` | Total request time |

The metadata is intentionally verbose — for debugging "why did I get these results?" or "why was this slow?" questions.

---

## How results are scored

### Semantic mode (default)

1. The query is embedded using the same embedding model as the corpus.
2. BigQuery vector search returns the top K nearest results (by cosine similarity).
3. Results above the `distance` threshold (default 0.55) are kept.
4. Per-source caps (`maxPerFile`, `maxPerAnswer`) prune over-represented sources.
5. Optionally, Vertex AI reranking re-orders the top K based on contextual relevance.

### Lexical mode

Uses BigQuery's full-text search instead of vector similarity. Useful for exact-phrase or token-overlap queries that vector search can miss (e.g. specific product names, error codes).

### Hybrid mode

Runs BOTH searches and merges the score lists using `hybridAlpha`:

```
final_score = (semantic_score * hybridAlpha) + (lexical_score * (1 - hybridAlpha))
```

Default `hybridAlpha: 0.5` weights them equally. Adjust toward 1.0 for more semantic emphasis, 0.0 for more lexical.

---

## How permissions are enforced

By default (`checkPermissions: true`), the retriever:

1. Resolves the requesting user — from `userId` (explicit) or `conversationId` (lookup by conversation owner).
2. Queries OpenFGA: "what resources does this user have view permission on?"
3. Filters the BigQuery query to only return results from those resources.
4. Returns only allowed results.

This means the same query from two different users can return different result sets — by design. Users without access to a particular campaign won't see citations from it.

Bypassing this (`checkPermissions: false`) should ONLY be done in trusted server-to-server contexts where the caller is doing its own permission check downstream.

---

## Constraints & limitations

- **Default distance threshold is 0.55.** Lower (e.g. 0.40) returns more results but more noise. Higher (e.g. 0.70) returns fewer but more relevant.
- **Default limit is 50.** Higher limits cost more BigQuery time. Cap at 100 in practice.
- **`maxPerFile` / `maxPerAnswer` prevent monoculture results.** Without caps, one chatty document can dominate.
- **Reranking is opt-in.** It costs extra (Vertex AI call) and adds latency (~100-300ms). Use when result quality matters more than latency.
- **No cross-workspace search.** Each request specifies one workspace ID; you can't query across multiple workspaces in a single call.
- **Vector search uses BigQuery's ANN (approximate nearest neighbor).** Results are "good enough" not perfect; very-similar-but-rare matches may be missed.
- **Sanitization is automatic and not configurable.** Queries with potentially-malicious patterns get scrubbed. Check `hadSanitizationIssues` in the response if results seem off.
- **Sentiment + quality filters require pre-computed scores.** Content uploaded before scoring was rolled out may not have these — filtering by them may exclude old content.
- **OpenFGA permission check adds latency.** Typically +30-80ms; in cold-cache cases may add more.
- **The function runs in a VPC.** It can only be called from within the GCP VPC; not from arbitrary public IPs.
- **Cold-start latency is 1-3 seconds.** First request after idle may be slow; subsequent requests are fast.
- **No streaming response.** The retriever returns the complete result set at once. For large limits, this can be a large payload (especially with `includeVectors: true`).
- **No retry mechanism in the retriever.** Callers must implement their own retry logic for transient failures.

---

## Best practices (for engineers)

- **Tune `distance` per use case.** Strict (0.65-0.70) for citation-grounding; loose (0.40-0.50) for exploratory queries.
- **Use `maxPerFile` for diverse results.** When the AI needs to "compare opinions," monoculture is the enemy.
- **Enable reranking only when latency budget allows.** It noticeably improves quality but costs time.
- **Use `queries` (alternate phrasings) for ambiguous prompts.** Vurvey internally rephrases user intent into 2-3 variations to catch different framings.
- **Set `includeVectors: false` unless you need them.** Vectors are large; including them when not needed wastes bandwidth.
- **Cache responses where appropriate.** Identical query + same workspace + same filters = same result (assuming the underlying data hasn't changed). Cache the response key.
- **Don't bypass permissions casually.** `checkPermissions: false` is for server-to-server only.
- **Use `sources: ["datasets"]` or `["campaigns"]`** when you know the target. Single-source queries are faster.
- **For debugging, examine `queryStats`.** If `bytesProcessed` is huge, your filters are too loose. If `cacheHit: false` on a repeated query, BigQuery cache wasn't warm.
- **Set `conversationId` when in a chat context.** It enables consistent permission resolution across the conversation.

---

## FAQ

#### Why doesn't every chat use the retriever?
The chat backend decides whether to invoke retrieval based on the question. Pure-opinion or general-knowledge questions don't need it. Questions involving "my data," "my campaign," "in our workspace" trigger it.

#### What's the difference between `chunks` and `pages`?
- **chunks**: Returns text passages typically 200-500 tokens. Best for precise citation.
- **pages**: Returns aggregated page-level summaries. Best for "what's this whole document about?"

#### What's the difference between semantic, lexical, and hybrid?
- **Semantic**: "Find passages about disappointment with our service." Captures synonyms, paraphrases.
- **Lexical**: "Find passages containing 'SKU 12345'." Captures exact tokens.
- **Hybrid**: Best of both; recommended default for production.

#### Why are my results sometimes empty?
1. Distance threshold too strict (try lowering).
2. Filters too restrictive (try removing them).
3. Permission filtering excluded everything (the user doesn't have access).
4. The corpus genuinely doesn't have relevant content.

Check the response's `filtersApplied` and `queryStats` for clues.

#### How is the corpus indexed?
Datasets are processed by `sensemake-process-document` → embedded via `embedding-v2-backfill` → stored in BigQuery. Campaign answers go through a similar pipeline (`sensemake-create-question-insights*`). See [Cloud Functions Reference](/guide/cloud-functions).

#### Can I search the corpus directly without the chat?
Not via end-user UI. The retriever is callable from the [Vurvey CLI](/guide/cli) via `vurvey graphql` (issuing the underlying GraphQL mutation that wraps the retriever) or via the API directly.

#### Why is the API key for the retriever different from the main API key?
It's not — the retriever is called server-to-server by `vurvey-api`, not by the public API. End-user requests don't reach it directly.

#### How big can the response be?
For 50 results with `includeVectors: true`, expect ~5-10 MB. Without vectors, ~50-500 KB.

#### What happens if BigQuery is slow?
The retriever times out after ~60 seconds. Caller (`vurvey-api`) must handle the timeout — typically falls back to a non-grounded answer.

#### Does the retriever work in multi-language scenarios?
Yes — embeddings are multilingual. The `language` filter lets you restrict to specific language content.

#### Can I add my own custom filter type?
Yes, but it requires extending `retriever_service.py` and redeploying. Talk to engineering.

#### Why does the same query give different results in staging vs production?
Different corpora — staging has staging data, production has production data. Also, the embedding model and reranker may differ slightly between environments.

#### Is the retriever idempotent?
Yes — same inputs always give the same outputs (modulo timing of underlying data changes). Safe to retry.

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| Retriever returns no results | Lower `distance` threshold; remove restrictive filters; verify user has permissions on the target resources |
| Latency is high | Lower `limit`; disable reranking; verify warm BigQuery cache; check `queryStats.elapsedMs` |
| Permission denied | User not in workspace, or OpenFGA tuples missing for the resource |
| Result text is sanitized / scrubbed | Sanitization flagged it; check `sanitizationWarnings` in response metadata |
| Cold-start delay > 3s | First request after idle; subsequent requests should be faster |
| BigQuery timeout | Query plan is too expensive — add more selective filters |
| Distance scores don't match my expectations | Different embedding model? Different sanitization? Check `sanitizedQuery` vs original |
| Reranker returns same order as before | reranker may be disabled (`reranker: "none"`) or insufficient candidates above threshold |
| 502 / 503 errors | Function instance under load — retry with exponential backoff |
| Wrong workspace data returned | Check `workspaceId` is correct; multi-workspace users can pass the wrong one |
| OpenFGA lookup fails | Conversation ID invalid, or user not in conversation — pass `userId` explicitly |

---

## Cross-references

- [Sources & Citations](/guide/sources-and-citations) — user-facing UI for the citations the retriever provides
- [Datasets](/guide/datasets) — the file / dataset side of the corpus
- [Campaigns](/guide/campaigns) — the response side of the corpus
- [Cloud Functions Reference](/guide/cloud-functions) — `sensemake-process-document`, `embedding-v2-backfill`, and other functions that populate the corpus
- [Permissions & Sharing](/guide/permissions-and-sharing) — OpenFGA permission model that gates retrieval
- [Topic Graph](/guide/topic-graph) — companion knowledge graph for entity-level lookups
- [Developer & API Reference](/guide/developer-reference) — for the GraphQL endpoints the chat backend exposes
- [Vurvey CLI](/guide/cli) — `vurvey graphql` can issue retriever-backed queries
- [Architecture](/guide/architecture) — where the retriever fits in the platform
- [Feature Flags Reference](/guide/feature-flags) — flags that affect retrieval behavior
- [Glossary](/guide/glossary) — RAG / vector search / cosine similarity definitions
