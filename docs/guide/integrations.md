---
title: Integrations
---

# Integrations

Vurvey has **two distinct integration models** that often get confused because they live next to each other:

| Model | What it is | Where it's configured | Who connects it |
|---|---|---|---|
| **Composio per-user connections** | OAuth/API-key tool connections (Slack, Notion, Gmail, Linear, etc.) that AI agents can use on *your* behalf | The **Integration Management Page** at `/me/integrations` | Each user, individually — connections follow the user, not the workspace |
| **Workspace Enterprise Integrations** | Workspace-scoped connectors with structured-research imports, sync runs, and admin-configured credentials | The **same page** at `/me/integrations` (workspace-integration section) | Admins, once per workspace — connections are shared with everyone |

Both surfaces render on the same page so users have a unified hub, but they have different lifecycles, different statuses, and different code paths.

Separately, there are **integration cards inside General Settings** for three workspace-flag-gated services (Tremendous, Synthesio, SharePoint). Those are documented in [Settings](/guide/settings#7-integrations-section-conditional) and are _not_ part of the integration hub on this page.

![Integration hub — Composio tools grid](/screenshots/integrations/01-integrations-main.png?optional=1)
![Connection-list item for Slack with Connect dropdown](/screenshots/integrations/02-connection-item.png?optional=1)
![Auth scheme chooser (OAuth / API Key / Bearer Token)](/screenshots/integrations/03-auth-chooser.png?optional=1)
![Workspace integration card](/screenshots/integrations/04-workspace-integration.png?optional=1)
![Structured Research Import wizard](/screenshots/integrations/05-research-import.png?optional=1)
![Composio callback toast — successful connect](/screenshots/integrations/06-callback-success.png?optional=1)

---

## How to reach it

The Integration Management Page is mounted at **`/me/integrations`** (component: `IntegrationManagementPage`).

| Entry point | Visible when |
|---|---|
| **Personal Profile → Integrations tab** | Workspace has `composioEnabled = true`. See [Account & Profile](/guide/account#integrations-me-integrations). |
| Direct URL `/me/integrations` | Same — the route exists in `me-routes.tsx` regardless, but the tab in the sub-nav only appears with the flag. |
| **Settings → Integrations tab** | The button exists in the Settings sub-nav but the route is not mounted in `workspace-routes.tsx`. Clicking it does not lead here today — this is a known UI/route mismatch. See [Settings](/guide/settings#sub-navigation). |

::: tip Workspace flag: `composioEnabled`
Enabling Composio for a workspace is a one-flag flip handled by Vurvey staff via [Super Admin → Manage Workspaces](/guide/admin#manage-workspaces-admin-workspaces). There is no Settings UI for this. Once flipped, every user in the workspace sees the **Integrations** tab on Personal Profile.

The backend gates `composioEnabled` reads with a two-layer cache (per-process column-existence check with permanent `true`/5-min `false` TTL, plus per-workspace flag cache up to 10k entries with LRU-style eviction) so a fresh flip propagates within minutes without a full restart.
:::

---

## Composio: per-user tool connections

The largest section of the page is the **Composio supported-tools catalog**. Composio is a third-party tool-integration layer that gives AI agents access to your accounts at services like Slack, Notion, Gmail, Linear, GitHub, etc.

### Auth schemes (3 supported)

Only three auth schemes are accepted by the current GraphQL schema:

| Constant | Display label | Use case |
|---|---|---|
| `Oauth2` | **OAuth** | Standard OAuth 2.0 flow — most consumer SaaS tools |
| `ApiKey` | **API Key** | Tools that issue a long-lived API key |
| `BearerToken` | **Bearer Token** | Tools that issue a bearer token (often LLM providers, internal services) |

::: warning Older docs may mention OAuth1 and Basic auth
Both were removed from the backend GraphQL schema. The frontend `ComposioAuthScheme` constant deliberately excludes them: _"Earlier iterations referenced OAUTH1 and BASIC here, but those were removed from the generated enum and the references caused TS2339 errors."_ If you see them mentioned anywhere, that doc is stale.
:::

### Browse → Connect flow

1. **Browse** the supported tools, grouped by category. The page exposes a search input that matches across tool name, description, and category (case-insensitive).
2. **Click Connect** on a tool card.
3. An **auth-scheme chooser** dialog opens with the schemes the tool supports — typically only one or two of the three. Options:
   - **OAuth (Login)** — opens the provider's OAuth consent screen in a redirect.
   - **API Key** — opens an inline form for the key.
   - **Bearer Token** — opens an inline form for the token.
   - **Cancel** — closes without connecting.
4. After you pick a method, the page requests a **provider-specific connect URL** via `GET_CONNECT_URL` and (for OAuth) redirects you out to the provider.
5. Some tools have **Expected Input Fields** (e.g. a Slack workspace ID, a Notion database key). The connection-list item renders these inputs inline before kicking off the connect URL. Required vs optional is taken from the tool's metadata (`expected_from_customer`, `required`, `default`, etc.).

### The Composio callback handler

After OAuth returns, the browser lands on `/me/integrations` with extra URL params:

| Param | Possible values |
|---|---|
| `composio_status` | `success`, `error`, or absent |
| `message` | Optional human-readable detail (typically only on failure) |
| `tool` | The connected tool's name |
| `auth_scheme` | `Oauth2`, `ApiKey`, `BearerToken`, or absent |

The `ComposioCallbackHandler` component reads these params, fires the right toast (_"Successfully connected Slack using OAuth."_, etc.), and **strips the params from the URL** so a refresh doesn't re-fire the toast. The toast wording uses the per-scheme `using` / `with` phrasing from `COMPOSIO_AUTH_SCHEME_TOAST_TEXT`.

### Connection states

A Composio connection (`ComposioUserConnection`) has these fields and statuses:

| Field | Meaning |
|---|---|
| `id` / `connectionId` | Internal & Composio-side IDs |
| `toolId` / `toolName` / `toolLogoUrl` | What this connection is for |
| `status` | `ACTIVE` / `ERROR` / `REVOKED` / `PENDING` |
| `authScheme` | The scheme used (renders as `via OAuth`, `via API Key`, `via Bearer Token` on the card) |
| `createdAt` | When the connection was established |

A connected card shows a `✓ Connected` badge, the auth scheme, and a **Disconnect** button.

### Disconnecting

Click Disconnect → confirmation modal warns: _"AI assistants will no longer be able to access this service on your behalf."_ → confirms → deletes the stored connection (`DELETE_CONNECTION`) → refreshes the user-connections query.

::: tip Disconnect = lose context, not data
Disconnecting removes the *connection*, not the data Vurvey has already pulled. Past chat responses that referenced a now-disconnected tool still show the answers; future requests just can't reach the service.
:::

---

## Workspace Enterprise Integrations

A second category surfaced on the same page: **workspace-scoped enterprise connectors** that go beyond per-user OAuth. These are admin-managed connections (e.g. a Salesforce instance, an enterprise data warehouse) backed by structured-research import pipelines.

### What's different from Composio

| | **Composio** | **Workspace Enterprise** |
|---|---|---|
| **Scope** | Per-user | Per-workspace |
| **Provisioning** | User-driven Connect button | Admin-driven Create / Update / Test / Trigger Sync |
| **Status set** | `ACTIVE` / `ERROR` / `REVOKED` / `PENDING` | `PENDING` / `ACTIVE` / `ERROR` / `DISCONNECTED` |
| **Mode** | n/a | `DIRECT` (live API access) or `FALLBACK` (cached snapshots) |
| **Sync model** | None — agent calls happen on demand | Periodic / on-demand syncs with `WorkspaceSyncRun` records |
| **Field model** | Tool-supplied expected fields | `ConnectorConfigSchema` with `required[]`, `properties{}`, `secretFields[]` |
| **Result schema** | Whatever the tool returns | Structured Research Import target fields |

### The connector model

`IntegrationConnector` describes what kinds of workspace-scoped integrations the platform supports:

```ts
{
  id, key, displayName, description, category,
  authSchemes: string[],
  capabilities: {...},          // what this connector can do
  configSchema: {
    required: ["api_key", "instance_url"],
    properties: { api_key: {type: "string", label: "API Key"}, ... }
  },
  secretFields: ["api_key"],    // fields treated as secrets, never shown after save
  isActive: boolean,
}
```

The integration UI uses `configSchema` to auto-generate the connector setup form: required fields get asterisks, `secretFields` are typed `password` and hidden after the first save (you can leave them blank to keep the saved value), and `properties` carries display labels.

### Lifecycle

1. **Create** — `CREATE_WORKSPACE_INTEGRATION` with workspace ID, connector key, mode, and config values.
2. **Test** — `TEST_WORKSPACE_INTEGRATION` validates credentials and reports a `WorkspaceIntegrationValidationResult` `{valid, message, errors[]}`.
3. **Activate** — once the test passes, the integration's `status` flips to `ACTIVE` and it becomes available for sync.
4. **Sync** — `TRIGGER_WORKSPACE_INTEGRATION_SYNC` kicks a `WorkspaceSyncRun`. Progress is streamed via the `INTEGRATION_SYNC_PROGRESS_UPDATES` GraphQL subscription:
   - `runId`, `status`, `progressPercent`, `progressMessage`, `updatedAt`
   - Subscription updates a progress bar live on the card.
5. **Update** — `UPDATE_WORKSPACE_INTEGRATION` lets admins change config; secret fields left blank keep their current values.
6. **Delete** — `DELETE_WORKSPACE_INTEGRATION_MUTATION` removes the integration; existing sync data may persist per the workspace's retention policy.

### Sync run history

Each integration card has an expandable history of `WorkspaceSyncRun` records:

| Field | What it shows |
|---|---|
| `id` | Run ID (useful in support tickets) |
| `status` | Run lifecycle (`PENDING`, `RUNNING`, `COMPLETED`, `FAILED`) |
| `triggerType` | What kicked it off (manual / scheduled / event) |
| `progressPercent` | 0–100 |
| `progressMessage` | A human-readable status line during the run |
| `summary` | Final summary after completion |
| `errorMessage` | If failed |
| `createdAt` / `updatedAt` | Timestamps |

---

## Structured Research Import

A specific pattern enabled by workspace integrations: importing structured research data (CSVs, JSON exports, etc.) into the platform with **field-mapping** between source columns and Vurvey target fields.

### Flow

1. **Preview** (`PREVIEW_STRUCTURED_RESEARCH_IMPORT`) — upload a file. The server reads the headers, returns:
   - `fileName`, `fileType`, `headers[]`, `totalRows`
   - `previewRows`: the first few rows as JSON objects
   - `suggestedMapping`: a per-column guess of which target field the column maps to (`StructuredImportTargetField`)
2. **Adjust the mapping** in the UI — drag source columns to target fields, override the suggestion when needed.
3. **Validate** (`VALIDATE_STRUCTURED_RESEARCH_IMPORT`) — server validates the mapping and content. Errors come back per row/field.
4. **Execute** (`EXECUTE_STRUCTURED_RESEARCH_IMPORT`) — runs the import. Results show up in the relevant target area (campaign responses, dataset rows, etc., depending on the mapping).
5. **Save as Template** (`SAVE_STRUCTURED_RESEARCH_IMPORT_TEMPLATE`) — captures the mapping for re-use. Future imports of the same source can skip steps 1–2 by loading the template.

### Run history

`GET_STRUCTURED_RESEARCH_IMPORT_RUNS` returns the history of imports. Each run has summary statistics, errors if any, and a link to the resulting data. `GET_STRUCTURED_RESEARCH_IMPORT_TEMPLATES` returns the templates a workspace has saved.

::: tip Templates save real time on repeat imports
A monthly CSV export from your CRM into a campaign always has the same columns. Save it as a template the first time; subsequent months are one click.
:::

---

## Tool categories

Both Composio tools and Workspace Connectors are grouped by category for browsing. The exact category list is not pinned in code — it evolves as new tools are added — but you'll typically see buckets like:

- Collaboration & Communication (Slack, Teams, Discord)
- Productivity & Project Management (Notion, Asana, Linear, Jira)
- Document & File Management (Google Drive, Dropbox, SharePoint)
- CRM (Salesforce, HubSpot)
- Sales & Customer Support (Zendesk, Intercom)
- HR & Recruiting (Greenhouse, BambooHR)
- Finance & Accounting (QuickBooks, Stripe)
- Developer Tools & DevOps (GitHub, GitLab, Bitbucket, Jenkins)
- Marketing & Social Media (Mailchimp, Twitter/X, LinkedIn)
- Analytics & Data (Mixpanel, Amplitude, Segment)
- AI & Machine Learning (OpenAI, Anthropic, Hugging Face)
- Design & Creative Tools (Figma, Canva)
- E-commerce (Shopify, WooCommerce)
- Education & LMS (Canvas, Moodle)
- Other / Miscellaneous (catch-all)

Tools that don't fit a defined category land in **Other Integrations**.

---

## How integrations show up elsewhere in the app

The page **manages connections**, but the connections themselves are consumed by other surfaces:

- **Workflow Agent Task cards** can use Composio connections — `use-composio-connections.ts` is the hook that lets a workflow node pick a tool to act through. See [Workflows](/guide/workflows).
- **Agent capabilities** — an Agent's [Capabilities](/guide/capabilities) determine which tools it can reach for during chat. Granting an agent access to a tool is _not_ the same as connecting that tool; both need to be in place.
- **Datasets and Campaigns** — Workspace Enterprise Integrations (notably structured research imports) drop data into these areas. The data then flows through the standard dataset/campaign pipelines including [Sources & Citations](/guide/sources-and-citations).

::: warning Connecting a tool does not auto-attach it to every agent
A Composio connection only authorizes Vurvey to talk to that service on your behalf. Whether an Agent actually reaches for the tool depends on the Agent's capability bindings and the conversation's context. If you connect Slack and your usual research Agent doesn't suddenly post messages there, that's expected — the Agent needs to be given the Slack capability first.
:::

---

## Constraints & limitations

- **Composio gating is workspace-level (`composioEnabled`)** but **the Integrations tab is per-user** — every user in an enabled workspace sees the tab; connections themselves are personal.
- **Workspace flag has cached propagation.** Up to 5 minutes for a `false → true` flip to be picked up by every running process (column-check cache).
- **Only 3 Composio auth schemes are valid** (Oauth2, ApiKey, BearerToken). Old docs mentioning OAuth1/Basic are stale.
- **The Settings → Integrations tab is broken** (button exists, route missing). Use the Personal Profile entry point. See [Settings → Sub-navigation](/guide/settings#sub-navigation).
- **Composio connections are per-user.** A workspace owner cannot connect Slack "on behalf of" their team — each user does their own.
- **Workspace Enterprise connections are per-workspace.** One admin sets up the connector once; the workspace shares it.
- **Disconnect is immediate.** No undo. Re-connecting later is a fresh OAuth/API-key flow.
- **Structured Research Import field mappings cannot be partially saved.** You either save the whole template or none of it.
- **Sync subscriptions are best-effort.** If a client loses the websocket mid-sync, the run still completes; only live progress UI is affected.
- **Some tools support multiple auth schemes; the page picks one per Connect.** To switch schemes, Disconnect and reconnect.

---

## Best practices

- **Connect only what you need.** Each connection is an authorization grant; the fewer, the smaller your attack surface.
- **Use OAuth where possible.** It's revocable from both sides, surfaces clear scopes, and rotates tokens automatically. API keys are static; bearer tokens are usually long-lived.
- **Workspace Enterprise integrations belong to admins, not power users.** They are config + credentials; the wrong person updating them breaks every downstream pipeline.
- **Save Structured Research Import templates** the first time. Future imports become one-click instead of remap-everything.
- **Watch sync runs to completion** the first time a workspace integration syncs. Mid-run failures are easier to debug live than from history.
- **Test before activating.** Use `TEST_WORKSPACE_INTEGRATION` before flipping the integration to ACTIVE — saves a failed sync run later.
- **Disconnect what you don't use.** Stale OAuth tokens are credential debt. Quarterly cleanup is a reasonable rhythm.
- **Treat secret fields as write-only.** Don't try to read them back from the UI; they're stored encrypted and the UI deliberately won't surface the value.

---

## FAQ

#### How is this page different from the integration cards in General Settings?
General Settings cards (Tremendous, Synthesio, SharePoint) are workspace-flag-gated services with bespoke setup flows. This page is for **Composio user connections** and **Workspace Enterprise connectors** — a different code path, a different data model, and per-user scoping for Composio.

#### Why don't I see the Integrations tab?
Either (a) the workspace doesn't have `composioEnabled = true`, or (b) you're in guest mode (which hides the entire Personal Profile sub-nav). Talk to your CSM about (a); switch workspaces about (b).

#### Why are OAuth1 and Basic not options?
They were removed from the backend GraphQL schema. The frontend constant deliberately excludes them so type-checks stay clean. Use OAuth2, API Key, or Bearer Token instead.

#### My Slack/Notion/etc. connection shows ERROR — what now?
Disconnect and reconnect. The token may have expired, been revoked on the provider side, or had its scopes changed. Reconnecting forces a fresh consent + token.

#### Why did my OAuth redirect dump me back at `/me/integrations` with a weird URL?
That's the `ComposioCallbackHandler` in action — it reads the `composio_status` and other params, shows a toast, and strips them from the URL. The momentary weird URL is intentional.

#### Can two users share a Composio connection?
Not in the per-user model. Each user does their own. For workspace-shared connectivity, look at the Workspace Enterprise Integration side of the page.

#### Why are workspace-level integrations and per-user integrations on the same page?
Convenience — both are "connections to external services" from a user's mental model, so they live in the same hub. Internally they're entirely separate systems.

#### How do I know which Agents will use a connection I just made?
Look at the Agent's [Capabilities](/guide/capabilities). The capability binding determines whether the Agent reaches for the tool. Connecting alone is necessary but not sufficient.

#### What's the difference between "DIRECT" and "FALLBACK" workspace integration modes?
- **DIRECT** — the integration is wired to call the live API on every request. Real-time data.
- **FALLBACK** — the integration relies on cached / synced snapshots rather than live calls. Slower-changing data, cheaper requests.

The choice depends on the connector and the rate-limit posture of the upstream service. Most modern API integrations use DIRECT.

#### Can I configure a sync schedule for workspace integrations?
The sync trigger model supports manual, scheduled, and event-driven runs (per `triggerType` on `WorkspaceSyncRun`). Schedule configuration UI varies per connector — check the per-connector card.

#### My structured research import suggests the wrong target field for some columns
That's why the mapping step exists. The suggested mapping is a heuristic, not authoritative. Override it before clicking Execute.

#### Where do I find the import I ran two weeks ago?
The `GET_STRUCTURED_RESEARCH_IMPORT_RUNS` history table lists every past run. Open it from the relevant connector card; runs are typically sorted newest-first.

#### Where do Composio connections live in the workflow side of the app?
The hook `use-composio-connections.ts` is what workflow nodes use to pick a connection at design time. See [Workflows](/guide/workflows). The hook reads the user's connections from the same source as this page.

#### Why is my workspace integration "ERROR" right after I created it?
Most common: the config schema's required fields weren't all set, OR the credentials don't pass the upstream provider's auth. Use `TEST_WORKSPACE_INTEGRATION` to get a structured error back, fix the config, then retry.

#### Does Synthesio show up here?
No — Synthesio is its own card in General Settings, not part of this Integration Hub. See [Settings → Synthesio Card](/guide/settings#synthesio-card) and [Mentions → Synthesio](/guide/mentions#3-synthesio-social-listening-mentions).

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| Integrations tab missing from Personal Profile | `composioEnabled` is false for this workspace. Talk to your CSM. |
| Direct URL `/me/integrations` works but the tab is hidden | Workspace context loaded the flag stale. Refresh the page; check Settings for the flag's current state. |
| Composio Connect spins forever | The `GET_CONNECT_URL` request hung or the provider's OAuth endpoint timed out. Try again in a minute. If repeated, the tool's Composio adapter may be broken — open a support ticket with the tool name. |
| Callback URL shows error params | Read the toast — the message is usually the provider's error. Common cases: insufficient scopes, denied consent, expired session at the provider. |
| Connection shows REVOKED | The provider revoked the token on its side. Reconnect. |
| Disconnect button missing | The card has no connection yet (you see Connect, not Disconnect). |
| Workspace integration sync stuck at 0% | The Composio/connector adapter never reported back. Check sync run history for an error message; if the run is hours old in PENDING, it's wedged — delete and recreate. |
| Test connection fails with "valid: false" | Read the `errors[]` array — typically a missing required field or wrong credential format. |
| Secret field appears blank after save | Expected — secret fields are write-only. Leave blank in Update to keep the saved value. |
| Structured Research Import preview shows wrong columns | Source file header row doesn't match your data. Re-export the file with proper headers. |
| Saved import template doesn't show up | Templates are workspace-scoped — confirm you're in the right workspace. |
| Different Vurvey users see different connections | Expected for Composio — connections are per-user. Workspace Enterprise integrations are shared. |

---

## Related guides

- [Account & Profile](/guide/account#integrations-me-integrations) — how to reach this page
- [Settings](/guide/settings) — workspace-level integration cards (Tremendous, Synthesio, SharePoint) live there
- [Mentions](/guide/mentions#3-synthesio-social-listening-mentions) — Synthesio setup specifics
- [Rewards](/guide/rewards) — Tremendous setup (the integration card here is just a shortcut)
- [Workflows](/guide/workflows) — workflow nodes that use Composio connections
- [Capabilities](/guide/capabilities) — Agent-side capability bindings that authorize tool usage
- [Datasets](/guide/datasets) — destination for many Workspace Enterprise sync runs
- [Campaigns](/guide/campaigns) — destination for Structured Research Imports of campaign-shaped data
- [Permissions & Sharing](/guide/permissions-and-sharing) — workspace roles that gate workspace-integration management
