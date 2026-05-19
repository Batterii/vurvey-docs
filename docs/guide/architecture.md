---
title: Platform Architecture
---

# Platform Architecture

A bird's-eye view of how Vurvey is built. This page is for engineers, Vurvey Labs staff onboarding, curious admins, and anyone tracing a feature from UI through to the database. If you're a customer looking for product help, the rest of this guide (especially the [Introduction](/guide/)) is a better starting point.

::: tip This page exists to map names to repos
When something breaks or a feature is misbehaving, the first question is _"where in the stack is this happening?"_ This page is meant to make that question one click away.
:::

---

## The four repositories

Vurvey is split across four Git repositories that compose a single platform:

| Repository | What lives here |
|---|---|
| **`vurvey-web-manager`** | The Manager web app — researchers, admins, and Vurvey staff use this. React + TypeScript + Vite. All of the UI documented elsewhere in this guide lives here. |
| **`vurvey-web-responder`** | The Responder web app — survey-takers and community respondents use this. React + TypeScript. Different login flow (5 providers), mobile-first, and survey-context preservation via `localStorage`. See [Logging In → Responder](/guide/login#vurvey-responder-login-survey-takers). |
| **`vurvey-api`** | The backend GraphQL + REST API. Node/TS. Owns the database, the GraphQL schema, the workers (light / heavy / sandbox), and most platform services. |
| **`vurvey-gcf-scripts`** | Google Cloud Functions — Python and Node — that handle out-of-band work too heavy for the API workers. Includes the Sensemake AI pipeline, Salesforce integration, brand setup, data warehouse aggregations, and content moderation. |

A fifth repository, **`vurvey-docs`** (this one), is the documentation site. See [About This Documentation](/guide/automation-and-qa).

```
┌──────────────────────────────────────────────────────────────────────┐
│  Browsers and respondent devices                                      │
│  ┌──────────────────────────┐  ┌──────────────────────────────────┐   │
│  │  vurvey-web-manager      │  │  vurvey-web-responder            │   │
│  │  (researchers + admins)  │  │  (survey-takers)                 │   │
│  └────────────┬─────────────┘  └─────────────┬────────────────────┘   │
└───────────────┼─────────────────────────────-┼──────────────────────-┘
                │                                │
                ▼                                ▼
            ┌──────────────────────────────────────┐
            │  vurvey-api  (Apollo GraphQL + REST) │
            │  - Resolvers / Mutations             │
            │  - GraphQL subscriptions (graphql-ws)│
            │  - REST endpoints                    │
            └──────────────┬───────────────────────┘
                           │
        ┌──────────────────┼───────────────────────────────────────┐
        ▼                  ▼                                       ▼
┌─────────────────┐   ┌──────────────────────┐         ┌──────────────────────────────┐
│  PostgreSQL     │   │  BullMQ + Redis      │         │  Neo4j (Topic Graph)         │
│  (canonical DB) │   │  - light-cpu-queue   │         │  TopicEntity / Theme nodes,  │
│                 │   │  - heavy queue       │         │  TOPIC_RELATED edges         │
│                 │   │  - sandbox queue     │         │                              │
│                 │   └─────────┬────────────┘         └──────────────────────────────┘
│                 │             │                                       ▲
│                 │   ┌─────────▼───────────────┐                       │
│                 │   │  optimized-light-worker │── extractTopicGraph ──┘
│                 │   │  batterii-light-worker  │
│                 │   │  batterii-heavy-worker  │
│                 │   │  batterii-sandbox-worker│
│                 │   └────────────┬────────────┘
│                 │                │
└────────┬────────┘                ▼
         │                  ┌─────────────────────┐
         │   ┌──────────────│  GCP Pub/Sub        │
         │   │              │  topic vurvey-events│
         │   │              └──────────┬──────────┘
         │   │                         │
         │   ▼                         ▼
         │  ┌──────────────────────────────────────────┐
         │  │  vurvey-gcf-scripts (Cloud Functions)    │
         │  │  - sensemake-* (Sensemake AI pipeline)   │
         │  │  - vurvey-salesforce-integration         │
         │  │  - vurvey-brand-setup                    │
         │  │  - vurvey-concept-testing                │
         │  │  - vurvey-copilot                        │
         │  │  - vurvey-kg (knowledge graph)           │
         │  │  - vurvey-workflow                       │
         │  │  - datawarehouse-* (analytics aggs)      │
         │  │  - scanning-* (moderation)               │
         │  │  - sendgrid-brand-invites                │
         │  └────────────────────────┬─────────────────┘
         │                           │
         └───────────────────────────┘
            shared canonical DB write paths
```

---

## vurvey-api worker topology

The API ships with multiple worker binaries that each consume a different BullMQ queue:

| Worker | Queue | What it handles |
|---|---|---|
| **`batterii-api.ts`** | (request thread) | The Apollo GraphQL + REST server. Synchronous request handling. |
| **`optimized-light-worker.ts`** | `vurvey:bull:light-cpu-queue` | Fast jobs that need fresh code paths: entity extraction for Topic Graph, post-run output-spec extraction, lightweight LLM calls. |
| **`batterii-light-worker.ts`** | Legacy light queue | Mirrored cases preserved for legacy paths; new development goes to `optimized-light-worker`. |
| **`batterii-heavy-worker.ts`** | Heavy queue | Large LLM workloads, long-running analyses. |
| **`batterii-sandbox-worker.ts`** | Sandbox queue | Capability-tool sandboxes — see [Capabilities](/guide/capabilities). |
| **`output-studio-export-worker.ts`** | Dedicated | Output Studio export rendering. |
| **`population-generation-worker.ts`** | Dedicated | AI population generation jobs for People → Populations. |
| **`queue-state-metrics-collector.ts`** | (metrics) | Reports queue depth + latency metrics. |
| **`redis-queue-metrics-exporter.ts`** | (metrics) | Exports queue health to monitoring. |

Each worker is its own deployable. Workers can scale independently — bursts of Topic Graph extraction don't block heavy capability runs, and vice-versa.

---

## Data stores

| Store | What's in it |
|---|---|
| **PostgreSQL** | The canonical relational database: workspaces, users, agents (`ai_personas`), campaigns (`surveys`), responses, datasets (`training_sets`), reels, etc. Run via Cloud SQL. |
| **Redis** | BullMQ queue backend + caching layer. |
| **Neo4j** | The Topic Graph store: `TopicEntity` and `Theme` nodes, `TOPIC_RELATED` edges. Queried by the `exploreTopicGraph` chat tool. |
| **GCS (Google Cloud Storage)** | Uploaded files (datasets, videos, reels, image-studio uploads). |
| **Firebase** | Auth (identity); used by both Manager and Responder apps. |
| **OpenFGA** | Auth0's relationship-based authorization engine. Per-resource permission tuples (see [Permissions & Sharing](/guide/permissions-and-sharing#layer-2-per-resource-sharing-openfga-backed)). |
| **BigQuery / Data Warehouse** | Long-term analytics + the data-warehouse aggregation GCFs feed this. |

---

## Cross-cutting platform services

These vurvey-api services power features across many docs:

| Service | Responsibility | Documented in |
|---|---|---|
| **`personaManager`** | Resolves `@mentions` to personas at chat time; manages agent runtime configuration. | [Mentions → @mention syntax](/guide/mentions#2-mention-syntax-in-chat) |
| **`context-graph`** | Topic Graph extraction, deduplication, clustering, and the `exploreTopicGraph` chat tool. | [Topic Graph](/guide/topic-graph) |
| **`grounding`** | Citation hydration for chat responses (campaign answers, dataset files, web sources). | [Sources & Citations](/guide/sources-and-citations) |
| **`output-spec/extraction`** | Post-run structured-output extractor for workflows; produces Evidence-badge-backing citations. | [Sources & Citations → Part 3](/guide/sources-and-citations#part-3-structured-output-evidence-badges-workflow-outputs-dashboards) |
| **`capability`** | Capability lifecycle (deploy from blueprint, materialize, activate, schedule, run). | [Capabilities](/guide/capabilities) |
| **`composio`** | Composio per-user tool connections + the workspace gating cache. | [Integrations](/guide/integrations) |
| **`synthesio`** | Synthesio mention ingestion and document formatter. | [Mentions → Synthesio](/guide/mentions#3-synthesio-social-listening-mentions) |
| **`reel`** + workers | Reel rendering pipeline. | [Reels](/guide/reels) |
| **`survey`** / `feedback-survey` | Campaign + feedback-survey lifecycle. | [Campaigns](/guide/campaigns), [Branding → Questions](/guide/branding#questions-branding-questions) |
| **`training-set`** | Dataset model + processing. | [Datasets](/guide/datasets) |
| **`workspace-rewards-tremendous`** | Tremendous integration for Rewards. | [Rewards](/guide/rewards) |
| **`workspace-api-app`** | Workspace API App provisioning (Public for Brand Companions, Developer for backend). | [Brand Companions](/guide/brand-companions), [Settings → Developer API Apps](/guide/settings#developer-api-apps-settings-api-apps) |

Plus a few service-layer paths worth knowing:

- **`services/output-spec/extraction/structured-output-extractor.ts`** — forces a `claude-sonnet-4-5` tool call (`emit_structured_output_with_evidence`) per workflow run to produce typed structured output + citations.
- **`services/context-graph/topic-graph-explorer-tool.ts`** — five-operation Vercel AI SDK tool exposing the Topic Graph to chat Agents.
- **`services/composio/composio-workspace-gating.ts`** — the two-layer cache (column-existence permanent-true / 5-min-false TTL + per-workspace flag with 10k LRU) for the workspace `composioEnabled` flag.

---

## GCF subsystems

The Cloud Functions in `vurvey-gcf-scripts` break out by domain. A user-facing feature usually has at least one GCF in its lifecycle.

| GCF (selected) | What it does | User-facing surface |
|---|---|---|
| **`sensemake-creator-reel`** | Calls Sensemake API to extract highlights from a creator's videos and auto-assembles a Reel. | [Reels → Auto-generated reels](/guide/reels#auto-generated-reels-the-magic-in-magic-reels) |
| **`sensemake-create-campaign-insights`** | Generates campaign-level Insights from response transcripts. | Campaign Insights / Summary tabs |
| **`sensemake-create-campaign-summary`** | Generates the AI summary on the Campaign → Summary tab. | [Campaigns → Summary tab](/guide/campaigns#navigation-tabs) |
| **`sensemake-create-question-insights`** / `-gen2` | Per-question insight extraction. | Campaign → Analyze tab |
| **`sensemake-create-question-keywords`** / `-v2` | Per-question keyword extraction. | Campaign → Analyze tab |
| **`sensemake-process-document`** | Document ingestion for Datasets. | [Datasets](/guide/datasets) |
| **`sensemake-process-transcripts`** | Video / audio transcription. | Campaign response transcripts |
| **`sensemake-process-video-metrics`** | Video metric processing (readability, sentiment, syntax). | Internal analytics |
| **`sensemake-train-data`** + `-trigger` | Training-set ingestion pipeline. | [Datasets](/guide/datasets) |
| **`vurvey-salesforce-integration`** | Pulls Salesforce data via `simple_salesforce`, writes to Postgres. | Customer-specific brand setup automation |
| **`vurvey-brand-setup`** | Bulk brand-setup automation triggered by Pub/Sub. | Brand onboarding flow |
| **`vurvey-concept-testing`** + `-parser` + `-checker` | Concept-testing simulation pipeline. | People → Simulations (when enabled) |
| **`vurvey-copilot`** | Copilot LLM agent for Vurvey-staff productivity. | Internal Vurvey staff tool |
| **`vurvey-kg`** | Knowledge graph ingestion (separate from Topic Graph). | Cross-workspace knowledge surfaces |
| **`vurvey-workflow`** | Workflow-trigger handler. | [Workflows](/guide/workflows) |
| **`datawarehouse-*`** | Analytics aggregations into BigQuery (creator rank, conversation tokens, fact tables). | Internal admin BI / Metabase dashboard in Super Admin |
| **`scanning-handle-quarantine`** / `-sort-clean-output` | Content moderation for uploaded media. | Dataset / response upload pipelines |
| **`sendgrid-brand-invites`** | Brand-invitation emails via SendGrid. | Member invitation flow |
| **`fix-missing-document-id`** | One-off data-repair tool. | Internal ops |
| **`flet-chatbot-example`** | Example chatbot built on Flet — reference / prototyping. | Not user-facing |

The `sensemake-*` family talks to `sensemake.vurvey.dev` — Vurvey's internal AI service that powers highlight extraction, transcript processing, and per-question analytics. This is the same service the Sensemake-creator-reel GCF uses (see [Reels](/guide/reels#auto-generated-reels-the-magic-in-magic-reels)).

---

## Event flow: a real example

When a respondent submits an answer to a campaign question, here's what happens across the platform — a useful trace to keep in mind when debugging:

```
Respondent (web-responder) → POST submit answer
        ↓
vurvey-api saves Answer row (Postgres)
        ↓
AnswerCreated event published on event bus
        ↓
   ┌──┴──────────────────────────────────┐
   ▼                                     ▼
GCP Pub/Sub vurvey-events                local EventEmitter
   ↓                                     ↓
context-graph event hooks check          (in-process subscribers)
gate (word-count + text-present)
   ↓
enqueue extractTopicGraphEntities job
on vurvey:bull:light-cpu-queue
   ↓
optimized-light-worker picks up job:
  - load Answer + transcript fallback
  - loadOntologyForSurvey() ← campaign_graph_ontology
  - entityExtractor.extractEntities() ← Gemini 3 Flash via Vertex
  - PiiScrubber.scan() — redact person names/emails/phones
  - EntityDeduplicator.mergeOrInsert() ← pgvector halfvec dedup
  - neo4jClient.upsertTopicRelationships(surveyId, edges)
  - campaignGraphPublisher.publishEntityDeltas() ← 500ms-debounced
   ↓
eventBus.publish({type: 'TopicGraphUpdated', surveyId, deltas})
   ↓
   ┌──────┴──────────────────────┐
   ▼                             ▼
GCP Pub/Sub vurvey-events       local EventEmitter
   ↓
api pod receives, re-emits locally
   ↓
broadcastIterator() picks up event
   ↓
graphql-ws subscription pushes delta to clients
   ↓
Campaign Insights tab updates in real-time
```

Additional events fire in parallel for sensemake-creator-reel-style flows, datawarehouse aggregations, etc. — but the Topic Graph path is the most visible to end users.

---

## Environments

Vurvey runs three primary environments:

| Environment | URL | Purpose |
|---|---|---|
| **Production** | `app.vurvey.dev` | Customer-facing |
| **Staging** | `staging.vurvey.dev` | Pre-production; the docs nightly screenshot job runs against this |
| **Experimental** | `experimental.vurvey.dev` | Internal feature exploration; very fast-moving |

Each environment has its own database, Firebase project, Neo4j instance, GCS buckets, OpenFGA store, and BullMQ Redis. Accounts are NOT shared between environments — a staging account is not a prod account.

---

## How docs reflect the architecture

The [About This Documentation](/guide/automation-and-qa) page covers the docs-side automation. The relevant point for architecture:

- The nightly Claude editorial pass uses the **staging environment** for screenshots and QA testing.
- When a QA failure is classified as `CODE_BUG`, the bug-report payload is dispatched to the sibling repo (`vurvey-web-manager` or `vurvey-api` typically) via `repository-dispatch` — the routing is part of the failure analyzer's prompt.
- GCF-side bugs are NOT auto-routed today; they're flagged for human triage.

---

## Where to go from here

- [Introduction](/guide/) — high-level product overview
- [About This Documentation](/guide/automation-and-qa) — how docs stay in sync with this stack
- [Topic Graph](/guide/topic-graph) — the most architecturally interesting user-facing feature
- [Capabilities](/guide/capabilities) — Wave 3 backend, blueprint deployment, structured output schemas
- [Sources & Citations](/guide/sources-and-citations) — dual citation pipelines, `safeHttpUrl` security
- [Integrations](/guide/integrations) — Composio vs Workspace Enterprise architecture
- [Permissions & Sharing](/guide/permissions-and-sharing) — UserRole + OpenFGA two-layer model
- [Super Admin](/guide/admin) — administering this architecture across customer workspaces
- [Implementation](/guide/implementation) — staff editorial surface for taxonomy, prompts, agent personalities
