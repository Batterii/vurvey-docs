---
title: Developer & API Reference
---

# Developer & API Reference

For engineers building **against** the Vurvey platform — embedding Brand Companions, integrating workspace data into other tools, automating workflows via API, or developing custom Composio connectors. This page consolidates the programmatic-access content scattered across the customer-facing guides.

::: tip Are you a customer admin or a developer?
- **Customer admin** with no engineering work: stay in [Settings](/guide/settings), [Brand Companions](/guide/brand-companions), and [Integrations](/guide/integrations).
- **Developer/engineer**: this page is for you.
- **Vurvey Labs engineer**: see [Platform Architecture](/guide/architecture) for the internal stack.
:::

---

## Two API App types

Vurvey exposes API access via **Workspace API Apps**, which come in two distinct types with very different semantics:

| | **Public App** | **Developer App** |
|---|---|---|
| **Created from** | Brand Companion card → Manage API Key → **Enable API App** | `/settings/api-apps` page → **Create API App** |
| **Linked to** | A specific persona (`personaId` on the record) | The workspace as a whole (no persona link) |
| **Required `allowedDomains`** | ✓ **Yes** — empty list = embed inaccessible | Optional; for CORS, not a gating mechanism |
| **Use case** | Public embed of a Brand Companion on a customer-facing site | Server-to-server API access for backend integrations |
| **Credential rotation** | Restricted (avoids breaking every live embed) | Free regenerate from the card |
| **Visible on** | Brand Companion modal + `/settings/api-apps` | Only `/settings/api-apps` |
| **Auth scheme** | OAuth client credentials backed by `consumerKey` | Same plus client-secret rotation |
| **Per-resource permissions** | OpenFGA tuples on the persona | OpenFGA tuples on workspace-scoped resources |

Both types share the same underlying `WorkspaceApiApp` model in vurvey-api. The `appType` enum (`Public | Developer`) is the discriminator.

See [Brand Companions → API App types](/guide/brand-companions#api-app-types-public-vs-developer) for the customer-facing UX, and [Settings → Developer API Apps](/guide/settings#developer-api-apps-settings-api-apps) for the management page.

---

## Service Accounts (programmatic identities)

Developer API Apps authenticate as a special `UserRole`: **`SERVICE_ACCOUNT`**.

From the GraphQL schema's `UserRole` enum documentation:
> _"A service account with the same permissions as a regular user. Service accounts are used for programmatic access to Public APIs."_

Practical implications:

| | Service Account | Regular User |
|---|---|---|
| **Identity** | Backed by a Developer-type API App credential, NOT a person | Backed by a Firebase Auth identity (Google / Email / Microsoft / Apple / SSO) |
| **Authentication** | API key + client secret OR OAuth client credentials | Interactive login + session token |
| **Audit trail** | Actions logged as the Service Account, separate from any human | Actions logged as the human |
| **Workspace membership** | Created in a specific workspace, scoped to that workspace | Can be invited to many workspaces |
| **Per-resource permissions** | Standard OpenFGA tuples (Viewer / Editor) | Same model |
| **Best for** | CI/CD systems, scheduled scripts, programmatic queries | Humans doing research, admin tasks |

::: tip Don't use a personal token for bots
If a script needs to call the Vurvey API on behalf of "your team", create a Service Account, not a user impersonation. Audit trails and credential rotation are dramatically cleaner.
:::

See [Permissions & Sharing → Workspace roles](/guide/permissions-and-sharing#layer-1-workspace-roles) for the full `UserRole` enum.

---

## Public-API base URLs

Vurvey runs three primary environments — pick the right base URL for the env you're targeting:

| Environment | API base URL | Manager URL |
|---|---|---|
| **Production** | `https://api.vurvey.dev/` | `app.vurvey.dev` |
| **Staging** | `https://api-staging.vurvey.dev/` | `staging.vurvey.dev` |
| **Experimental** | `https://api-experimental.vurvey.dev/` | `experimental.vurvey.dev` |

Each environment has its **own** Firebase project, database, OpenFGA store, and BullMQ Redis. Accounts and API apps from one environment do **not** work in another — you must provision separately.

For the full environment topology, see [Platform Architecture → Environments](/guide/architecture#environments).

---

## GraphQL vs REST

Vurvey's primary API surface is **GraphQL** (Apollo). A small number of REST endpoints exist for specific flows (file upload, workspace info, certain integration callbacks).

| Surface | When to use |
|---|---|
| **GraphQL endpoint** | Default for query/mutation work. Self-documenting via introspection (in lower envs). Use any standard GraphQL client. |
| **REST endpoints** | Specific flows — file upload, OAuth callbacks, webhook event delivery. Limited surface; documented per-flow. |
| **graphql-ws subscriptions** | Real-time event streams (Topic Graph deltas, Workflow run progress, chat message streaming). See [Platform Architecture → Worker topology](/guide/architecture#vurvey-api-worker-topology). |

::: warning Introspection is environment-specific
The GraphQL schema is introspectable on staging and experimental for debugging; production introspection is restricted. Develop against staging and verify on production with explicit operation strings.
:::

---

## Authentication patterns

### Pattern 1: Browser-app sessions (Firebase Auth)

User signs in via the Manager or Responder app. Firebase Auth issues a session token used in the `Authorization: Bearer <firebase-id-token>` header for subsequent API calls.

- **Use when**: A real human is interacting through the UI. The two web apps (Manager, Responder) handle this automatically.
- **Renewal**: Firebase refresh tokens auto-renew the ID token; the app handles this.

See [Logging In](/guide/login).

### Pattern 2: Developer API App credentials

A Developer App's `consumerKey` + `clientSecret` are used to obtain a Service Account session token (typically via OAuth client-credentials flow).

- **Use when**: A backend system (cron job, webhook receiver, CI/CD) needs to call the API.
- **Created from**: `/settings/api-apps` → **Create API App** → choose `Developer` app type.
- **Rotation**: Use the card's **Regenerate Client Secret** action. Old secret is invalidated immediately.

### Pattern 3: Public API App (Brand Companion embed)

A Public App's `consumerKey` is embedded in the customer's website to bootstrap the Brand Companion conversation. The embed itself handles auth opaquely.

- **Use when**: Embedding a Brand Companion publicly. The embed handles session creation; you only provide the Client ID.
- **Created from**: Brand Companion card → **Manage API Key** → **Enable API App**.
- **Rotation**: Restricted. Prefer creating a new app + migrating the embed over regenerating a Public app's secret.

---

## Common workflows for developers

### Fetch a workspace's campaigns

```graphql
query GetCampaigns($workspaceId: ID!) {
  surveys(workspaceId: $workspaceId, limit: 50) {
    items {
      id
      name
      status
      createdAt
      incentiveAmount
      incentiveCurrency
    }
  }
}
```

`Survey` is the internal name for `Campaign`. See [Glossary → Survey](/guide/glossary#s).

### Listen for Topic Graph updates

```graphql
subscription TopicGraphUpdates($campaignId: ID!) {
  topicGraphUpdated(campaignId: $campaignId) {
    deltas {
      entities { id name type confidence mentionCount }
      edges { sourceId targetId weight }
      themes { id label memberCount }
    }
  }
}
```

The subscription delivers 500ms-debounced deltas. See [Topic Graph → Architecture](/guide/topic-graph#architecture-what-s-behind-the-magic) for the upstream pipeline.

### Trigger a Workflow run via mutation

Workflows are `AiOrchestration` records server-side. Use the appropriate mutation in your environment's GraphQL schema (`triggerWorkflowRun` or similar) with the workflow's ID + input variables.

### Use the Topic Graph as a Graph-RAG tool from your own AI

The `exploreTopicGraph` tool is shipped as a Vercel AI SDK tool definition in vurvey-api at `src/services/context-graph/topic-graph-explorer-tool.ts`. If you're building a custom agent that should have similar capabilities, that file is the reference.

---

## Embed: Brand Companion on your site

The Brand Companion embed is a JavaScript widget initialized with a Client ID. The official integration script is environment-specific; ask your CSM for the snippet for your target environment.

Minimum requirements:

1. The persona must have `is_brand_companion = true` in the database (toggled in Agent Builder).
2. A Public App must be created (Brand Companion card → Enable API App).
3. **At least one origin must be in the `allowedDomains` allowlist** — empty allowlist = embed silently refuses to mount.
4. The Client ID is what you pass to the embed snippet.

See [Brand Companions → End-to-end launch](/guide/brand-companions#end-to-end-shipping-a-brand-companion-to-your-site) for the full launch flow.

---

## Composio integration authoring

If you want to develop a **new tool** that Vurvey agents can use via Composio, the path is through Composio's own catalog (not via Vurvey directly). Composio's docs cover tool authoring; once your tool is in Composio's catalog, Vurvey users with `composioEnabled` workspaces can connect it like any other Composio tool.

For workspace-internal **Workspace Enterprise integrations** (custom connectors with sync schedules, structured-research imports), see [Integrations → Workspace Enterprise integrations](/guide/integrations#workspace-enterprise-integrations). The connector schema is:

```ts
interface IntegrationConnector {
  id: string;
  key: string;          // stable identifier
  displayName: string;
  description?: string;
  category: string;
  authSchemes: string[];
  capabilities: { /* connector-specific */ };
  configSchema: {
    required: string[];
    properties: Record<string, ConfigSchemaField>;
  };
  secretFields: string[];   // treated as write-only after first save
  isActive: boolean;
}
```

Workspace integration mutations available:

- `CREATE_WORKSPACE_INTEGRATION`
- `UPDATE_WORKSPACE_INTEGRATION` (leave secret fields blank to keep saved)
- `TEST_WORKSPACE_INTEGRATION` (validates credentials, returns `{valid, message, errors[]}`)
- `TRIGGER_WORKSPACE_INTEGRATION_SYNC`
- `DELETE_WORKSPACE_INTEGRATION`
- `PREVIEW_STRUCTURED_RESEARCH_IMPORT` / `VALIDATE` / `EXECUTE` / `SAVE_TEMPLATE`

Plus the `INTEGRATION_SYNC_PROGRESS_UPDATES` subscription for live run progress.

---

## Webhooks & event delivery

Vurvey emits a number of events to internal Pub/Sub topics (notably `vurvey-events`). External webhook delivery is currently limited and integration-specific — talk to your CSM if you need event-driven external triggers. The internal event-bus types live in `vurvey-api/src/common/event-bus/types/`.

Notable internal event types:

- **`TopicGraphUpdated`** — fires on every entity-delta batch (500ms debounced). See [Topic Graph → Architecture](/guide/topic-graph#architecture-what-s-behind-the-magic).
- **`AnswerCreated`** — fires when a campaign response lands.
- **`ORCHESTRATION_COMPLETED`** — fires when a Workflow / Capability run finishes (after structured-output extraction).

Internal Pub/Sub is GCP-native and consumed by per-pod subscriptions. External-facing webhooks are not a self-service feature today.

---

## Rate limits & quotas

Vurvey doesn't currently publish a fixed-rate-limit number, but practical considerations:

- **LLM token costs** are billed per-workspace via the credit system. Heavy automation can burn credits fast — monitor in [Super Admin → Manage Credits Rates](/guide/admin#manage-credits-rates-admin-credits-rates) if you have access.
- **BullMQ worker concurrency** is per-environment and shared across all users. Bursts of work may queue.
- **Composio rate limits** are per-user and per-tool; consult Composio's docs.
- **External tool rate limits** (Web Research, TikTok, Reddit, etc.) are inherited from the upstream services. Heavy use may hit upstream throttles.
- **Tremendous fee** of ~2.5% applies to all reward payouts (not a rate limit; a per-transaction fee). See [Rewards](/guide/rewards#tremendous-fee-notice).
- **5-minute false TTL** on the `composioEnabled` workspace flag cache means flag flips propagate within minutes, not instantly. See [Composio gating cache](/guide/integrations#how-to-reach-it).

If you're hitting unexpected limits in your integration, capture the time-window and the offending API operation IDs and open a support ticket.

---

## Operational considerations

### Credentials hygiene

- **Never commit `clientSecret` to source control.** Use environment variables or a secret manager.
- **Rotate Developer App secrets quarterly** at minimum. The Regenerate Client Secret button is fast.
- **Audit Public App allowed-domains lists** — stale domains creep in. Treat them like a CSP.
- **Use Service Accounts for bots**, not personal accounts. Removes a person from the audit trail's hot path.

### LLM-emitted URL safety

If your application surfaces citation links produced by Vurvey Agents (e.g. integrating Powered-by-N-sources content into your own UI), implement the same `safeHttpUrl` allowlist Vurvey uses:

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

The model can emit `javascript:`/`data:` URIs in citation `sourceUrl` fields. `target="_blank" rel="noopener noreferrer"` does **NOT** neutralize them. See [Sources & Citations → Security](/guide/sources-and-citations#security-llm-generated-urls-in-citation-popovers).

### Testing against staging

- Sign in to `staging.vurvey.dev` with an account provisioned in the staging Firebase project.
- The docs site's nightly screenshot pipeline runs against staging — so the screenshots in this guide reflect staging UI.
- Don't try to use a production API App in staging or vice versa — credentials are environment-scoped.

### Production deploy

- Confirm allowed-domains include all production origins before flipping a Brand Companion to live.
- Treat Service-Account credential rotation as a deploy event — coordinate with whichever services consume the credential.
- Use a Public App per brand surface (don't reuse one Public App across multiple distinct customer-facing properties).

---

## Cross-references for related work

- [Brand Companions](/guide/brand-companions) — end-to-end Brand Companion publishing flow
- [Settings → Developer API Apps](/guide/settings#developer-api-apps-settings-api-apps) — API App management UI
- [Permissions & Sharing](/guide/permissions-and-sharing) — workspace roles and OpenFGA tuples
- [Integrations](/guide/integrations) — Composio + Workspace Enterprise customers'-side view
- [Topic Graph](/guide/topic-graph) — `exploreTopicGraph` chat tool reference
- [Sources & Citations](/guide/sources-and-citations) — `safeHttpUrl` allowlist + dual citation pipelines
- [Platform Architecture](/guide/architecture) — full stack view, worker topology, environments
- [Common Recipes → Brand Companion launch](/guide/recipes#recipe-2-build-a-brand-companion-and-publish-it-to-your-site) — step-by-step launch
- [Common Recipes → Composio Slack connection](/guide/recipes#recipe-8-add-a-composio-tool-connection-so-an-agent-can-act-through-it) — example integration flow
- [What's New](/guide/whats-new) — recent platform additions including capability flags
- [Glossary](/guide/glossary) — terminology

---

## Getting help (developer-specific)

- **API integration questions**: Open a GitHub issue tagged `developer-question` on `vurvey-docs` for documentation issues, or contact your Vurvey CSM for product-specific integration support.
- **Bug in the API**: File against the relevant repo (`vurvey-api` for backend, `vurvey-web-manager` for UI). Include the request ID from the response headers if available.
- **Composio tool authoring**: Refer to Composio's own developer documentation; Vurvey doesn't own that surface.
- **Need a new Workspace Enterprise connector**: Talk to engineering — connector catalog additions go through Vurvey Labs.
