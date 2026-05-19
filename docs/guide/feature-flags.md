---
title: Feature Flags Reference
---

# Feature Flags Reference

The most comprehensive reference of every Vurvey feature flag — what it gates, how it's set, what its default state is, and where to find the relevant feature doc. This is an alphabetical, lifecycle-oriented complement to [What's New](/guide/whats-new) (chronological) and [Quick Reference → workspace feature flags](/guide/quick-reference#workspace-feature-flags-cheat-sheet) (cheat-sheet).

::: tip Why so many flags?
Vurvey ships continuously. New features land behind flags so they can be enabled per-workspace during soak rollouts, dialed back if issues arise, and graduated when stable. Most flags eventually become default-on or get removed entirely — the table below reflects the current state.
:::

---

## How flags are set

Vurvey has **four distinct flag mechanisms**, each with different semantics:

| Mechanism | Where it lives | How to set | Read pattern |
|---|---|---|---|
| **Workspace boolean fields** | Columns on the `workspaces` table in vurvey-api | Vurvey staff via Super Admin → Manage Workspaces OR direct database update | `workspace.someEnabled` in React, `Workspace.query()` in API |
| **LaunchDarkly-style runtime flags** | LaunchDarkly (or equivalent runtime evaluation service) | LaunchDarkly dashboard, evaluated per-user / per-workspace | `useFeatureFlag({flagName: "..."})` in React |
| **In-app workspace settings toggles** | Same workspace boolean fields, but exposed as a customer-facing toggle | Settings UI (e.g. Topic Graph toggle in General Settings) | Same as workspace boolean fields |
| **Build-time toggles** | `config.featureToggles.*` in source code | Code-level constant set at deploy time | `config.featureToggles.enforcesso` etc. |

The distinction matters: workspace booleans are persistent per-workspace; runtime flags can be flipped instantly across many workspaces at once.

---

## Alphabetical flag reference

### `agentbuilderwithgenerationflow`

| | |
|---|---|
| **Type** | Runtime (LaunchDarkly) |
| **What it gates** | The newer guided Agent Builder flow with AI-generated persona facets |
| **Default** | Variable per-workspace |
| **Doc** | [Agents → Creating an Agent](/guide/agents#creating-an-agent) |

### `aiInsightsEnabled`

| | |
|---|---|
| **Type** | Workspace boolean |
| **What it gates** | AI-generated insights surfaces (e.g. Campaign Summary tab, Capabilities Insights Object Type rendering) |
| **Default** | On for most workspaces |
| **Notes** | Tied to `aiSimulationEnabled` for some surfaces |

### `aiPersonaOpenFgaPermissionsActive`

| | |
|---|---|
| **Type** | Runtime (LaunchDarkly) |
| **What it gates** | Whether OpenFGA-based per-resource permissions are active for AI Personas (Agents) |
| **Default** | On after soak rollout |
| **Doc** | [Permissions & Sharing](/guide/permissions-and-sharing#layer-2-per-resource-sharing-openfga-backed) |
| **Notes** | One of four `*OpenFgaPermissionsActive` flags that staggered the OpenFGA migration per resource type |

### `aiSimulationEnabled`

| | |
|---|---|
| **Type** | Workspace boolean |
| **What it gates** | AI Population simulation features on campaigns (the synthetic-respondent flow) |
| **Default** | Variable |
| **Doc** | [People](/guide/people), [Concept Simulations](/guide/concept-simulations) |

### `aiWorkflowOpenFgaPermissionsActive`

| | |
|---|---|
| **Type** | Runtime (LaunchDarkly) |
| **What it gates** | OpenFGA-based permissions for Workflows (AiOrchestrations) |
| **Default** | On after soak |
| **Doc** | [Permissions & Sharing](/guide/permissions-and-sharing) |

### `apiManagementEnabled`

| | |
|---|---|
| **Type** | Workspace boolean |
| **What it gates** | Whether the Developer API Apps page is functional (the route is always mounted) |
| **Default** | On for most workspaces |
| **Doc** | [Settings → Developer API Apps](/guide/settings#developer-api-apps-settings-api-apps), [Developer & API Reference](/guide/developer-reference) |

### `appLimitsEnabled`

| | |
|---|---|
| **Type** | Workspace boolean |
| **What it gates** | Whether quota / usage limits are enforced for this workspace |
| **Default** | Off for legacy workspaces; on for plans with quotas |
| **Notes** | Tied to `isLimitEnabled` checks on specific resources |

### `audiofileuploadenabled`

| | |
|---|---|
| **Type** | Runtime (LaunchDarkly) |
| **What it gates** | Audio file uploads in Datasets and Campaign responses |
| **Default** | Variable |
| **Doc** | [Datasets](/guide/datasets), [Campaigns](/guide/campaigns) |

### `autoChartsEnabled`

| | |
|---|---|
| **Type** | Workspace boolean |
| **What it gates** | Auto-generated charts on campaign analysis surfaces |
| **Default** | Variable |

### `autonomousCapabilitiesEnabled`

| | |
|---|---|
| **Type** | Workspace boolean |
| **What it gates** | The `/capabilities/*` route tree |
| **Default** | Off (request via CSM) |
| **Doc** | [Capabilities → Mental model](/guide/capabilities#mental-model) |
| **Notes** | Combined with `chatbotEnabled` for the Capabilities nav link to appear |

### `campaignprogresssubscription`

| | |
|---|---|
| **Type** | Runtime (LaunchDarkly) |
| **What it gates** | Real-time live-progress subscription updates on running campaigns |
| **Default** | Variable |
| **Doc** | [Campaigns](/guide/campaigns) |

### `capabilityBuilderV2Enabled`

| | |
|---|---|
| **Type** | Workspace boolean |
| **What it gates** | The Prompt Form Canvas (Capability Builder V2) at `/workflow/flows/:id/prompt-form` |
| **Default** | Off (soak rollout) |
| **Doc** | [Prompt Form Canvas](/guide/prompt-form-canvas) |

### `capabilityWave3BackendEnabled`

| | |
|---|---|
| **Type** | Workspace boolean |
| **What it gates** | Wave-3 vs legacy Capabilities backend / UI |
| **Default** | Off (rollout in progress) |
| **Doc** | [Capabilities](/guide/capabilities), [What's New](/guide/whats-new#capabilities-wave-3-backend-capabilitywave3backendenabled) |

### `centrifugo`

| | |
|---|---|
| **Type** | Runtime (LaunchDarkly) |
| **What it gates** | Use of Centrifugo for real-time event delivery (alternative to graphql-ws subscriptions) |
| **Default** | Variable; staged migration |
| **Notes** | Internal-infrastructure flag; not customer-facing |

### `chatbotEnabled`

| | |
|---|---|
| **Type** | Workspace boolean |
| **What it gates** | Home / Agents / Datasets nav entries + the Capabilities link condition |
| **Default** | On |
| **Doc** | [Home](/guide/home), [Canvas & Image Studio](/guide/canvas-and-image-studio) |

### `chatmodelselectoractive`

| | |
|---|---|
| **Type** | Runtime (LaunchDarkly) |
| **What it gates** | The Model selector control in the chat toolbar |
| **Default** | Variable |
| **Doc** | [Home → Model selector](/guide/home#model-selector) |

### `completeprofileprompting`

| | |
|---|---|
| **Type** | Runtime (LaunchDarkly) |
| **What it gates** | The "fill in your profile" prompting flow and required-field indicators on Personal Information |
| **Default** | Variable |
| **Doc** | [Account & Profile](/guide/account#general-settings-me) |

### `composioEnabled`

| | |
|---|---|
| **Type** | Workspace boolean (with two-layer cache) |
| **What it gates** | Personal Profile → Integrations tab + Composio per-user connections |
| **Default** | Off (request via CSM) |
| **Doc** | [Integrations → Composio](/guide/integrations#composio-per-user-tool-connections) |
| **Notes** | Backed by `composio-workspace-gating.ts` with permanent-true / 5-min-false TTL cache + 10k LRU |

### `createpopulations`

| | |
|---|---|
| **Type** | Runtime (LaunchDarkly) |
| **What it gates** | Whether users can create new Populations from the People surface |
| **Default** | Variable per role |

### `customRewardGroupsActive`

| | |
|---|---|
| **Type** | Runtime (LaunchDarkly) |
| **What it gates** | Custom reward groupings beyond standard Tremendous campaigns |
| **Default** | Variable |
| **Doc** | [Rewards](/guide/rewards) |

### `customTemplatesEnabled`

| | |
|---|---|
| **Type** | Workspace boolean |
| **What it gates** | The Brand Templates tab in Settings |
| **Default** | Off (request via CSM) |
| **Doc** | [Settings → Brand Templates](/guide/settings#brand-templates-settings-brand-templates-conditional) |

### `deltaSyncEnabled`

| | |
|---|---|
| **Type** | Workspace boolean |
| **What it gates** | Incremental sync optimization for SharePoint and similar integrations |
| **Default** | On where applicable |
| **Doc** | [Settings → SharePoint Card](/guide/settings#sharepoint-card) |

### `enablegeneralpopulations`

| | |
|---|---|
| **Type** | Runtime (LaunchDarkly) |
| **What it gates** | General Populations on the People → Populations index + the `/populations/general/:id` detail route |
| **Default** | Variable |
| **Doc** | [General Populations](/guide/general-populations) |

### `enablenewagentnames`

| | |
|---|---|
| **Type** | Runtime (LaunchDarkly) |
| **What it gates** | UI aliases: Consumer Persona → Advocate, Product → Brand Companion |
| **Default** | Variable per workspace |
| **Doc** | [Agents → Agent Types](/guide/agents#agent-types-choosing-the-right-one) |

### `enforcesso`

| | |
|---|---|
| **Type** | **Build-time** toggle (not workspace-scoped) |
| **What it gates** | The Enforce SSO option in General Settings (also gated by Owner/Admin/staff role) |
| **Default** | Build-dependent |
| **Doc** | [Settings → Enforce SSO](/guide/settings#5-enforce-sso-conditional) |
| **Notes** | This is a `config.featureToggles.enforcesso` constant, not a workspace flag |

### `forecastEnabled` / `forecast_enabled`

| | |
|---|---|
| **Type** | Workspace boolean (camelCase in GraphQL, snake_case in DB) |
| **What it gates** | The Forecast nav and `/forecast/*` route |
| **Default** | Off |
| **Doc** | [Forecast](/guide/forecast) |
| **Notes** | The entire Forecast feature is a UI prototype on demo data — enabling the flag doesn't connect a real backend |

### `guestModeEnabled`

| | |
|---|---|
| **Type** | Workspace boolean |
| **What it gates** | Whether the workspace can have Guest-role members |
| **Default** | Variable |
| **Doc** | [Permissions & Sharing](/guide/permissions-and-sharing) |
| **Notes** | Distinct from `shouldUseGuestMode` (a per-user-context flag for limited-access user states) |

### `moldBuilder`

| | |
|---|---|
| **Type** | Runtime (LaunchDarkly) |
| **What it gates** | Molds tab in Implementation, plus all `/implementation/molds/*` route variants |
| **Default** | Off |
| **Doc** | [Implementation → Molds](/guide/implementation#molds-implementation-molds-feature-flagged) |

### `moveusagetoworkspacetab`

| | |
|---|---|
| **Type** | Runtime (LaunchDarkly) |
| **What it gates** | Hides the Usage tab from the Campaigns tab strip (moves it to workspace-level) |
| **Default** | Variable |
| **Doc** | [Campaigns → Navigation Tabs](/guide/campaigns#navigation-tabs) |

### `outputStudioEnabled`

| | |
|---|---|
| **Type** | Workspace boolean |
| **What it gates** | The Output Studio at `/workflow/flows/:id/output-studio` and the per-history Output Studio view |
| **Default** | Off (Phase 6E soak rollout) |
| **Doc** | [Output Studio](/guide/output-studio) |
| **Notes** | `useIsOutputStudioEnabled()` is a stub returning false on current branch; real check on sibling branch waiting to merge |

### `personaconversationcredits`

| | |
|---|---|
| **Type** | Runtime (LaunchDarkly) |
| **What it gates** | Per-persona conversation credit billing + the Billed badge on the chat toolbar |
| **Default** | Variable per plan |
| **Doc** | [Home → Population Persona Modal](/guide/home#the-population-persona-modal) |

### `selectallcheckboxesenabledinchat`

| | |
|---|---|
| **Type** | Runtime (LaunchDarkly) |
| **What it gates** | "Select All" checkboxes in chat-side workflows for batch selection |
| **Default** | Variable |

### `selectpersonafrompopulation`

| | |
|---|---|
| **Type** | Runtime (LaunchDarkly) |
| **What it gates** | The persona-from-population selection control in chat |
| **Default** | Variable |
| **Doc** | [Home → Population Persona Modal](/guide/home#the-population-persona-modal) |

### `sharepointEnabled`

| | |
|---|---|
| **Type** | Workspace boolean |
| **What it gates** | SharePoint card in General Settings + SharePoint Connect modal + Datasets SharePoint import flow |
| **Default** | Off (request via CSM) |
| **Doc** | [Settings → SharePoint Card](/guide/settings#sharepoint-card), [Datasets](/guide/datasets) |

### `simulationsactive`

| | |
|---|---|
| **Type** | Runtime (LaunchDarkly) |
| **What it gates** | Concept Simulations at `/people/simulations/*` |
| **Default** | Off |
| **Doc** | [Concept Simulations](/guide/concept-simulations) |

### `surveyOpenFgaPermissionsActive`

| | |
|---|---|
| **Type** | Runtime (LaunchDarkly) |
| **What it gates** | OpenFGA-based permissions for Surveys (Campaigns) |
| **Default** | On after soak |
| **Doc** | [Permissions & Sharing](/guide/permissions-and-sharing) |

### `synthesioEnabled`

| | |
|---|---|
| **Type** | Workspace boolean |
| **What it gates** | Synthesio card in General Settings + Synthesio integration flows |
| **Default** | Off |
| **Doc** | [Mentions → Synthesio](/guide/mentions#3-synthesio-social-listening-mentions), [Settings → Synthesio Card](/guide/settings#synthesio-card) |

### `taskrichinputenabled`

| | |
|---|---|
| **Type** | Runtime (LaunchDarkly) |
| **What it gates** | Rich-input support in Workflow Task nodes (beyond plain text) |
| **Default** | Variable |
| **Doc** | [Workflows](/guide/workflows) |

### `toolsEnabled`

| | |
|---|---|
| **Type** | Workspace boolean |
| **What it gates** | Whether the Tools dropdown is shown in the chat toolbar |
| **Default** | On for most workspaces |
| **Doc** | [Canvas & Image Studio → Tools dropdown](/guide/canvas-and-image-studio#tools-dropdown) |

### `topicGraphEnabled`

| | |
|---|---|
| **Type** | Workspace boolean (also exposed as a Settings UI toggle) |
| **What it gates** | Insights tab on every campaign + the `exploreTopicGraph` chat tool |
| **Default** | On for new workspaces |
| **Doc** | [Topic Graph](/guide/topic-graph), [Settings → Topic Graph Toggle](/guide/settings#4-topic-graph-toggle) |
| **Notes** | The only workspace flag exposed to customers as a Settings-UI toggle |

### `trainingSetOpenFgaPermissionsActive`

| | |
|---|---|
| **Type** | Runtime (LaunchDarkly) |
| **What it gates** | OpenFGA-based permissions for Training Sets (Datasets) |
| **Default** | On after soak |
| **Doc** | [Permissions & Sharing](/guide/permissions-and-sharing) |

### `videoInsights`

| | |
|---|---|
| **Type** | Runtime (LaunchDarkly) |
| **What it gates** | Video-level insights extraction beyond standard transcript analysis |
| **Default** | Variable |
| **Doc** | [Campaigns](/guide/campaigns) |

### `workflowEnabled`

| | |
|---|---|
| **Type** | Workspace boolean |
| **What it gates** | The Workflow (Beta) nav entry and `/workflow/*` routes |
| **Default** | Variable |
| **Doc** | [Workflows](/guide/workflows) |

### `workflowReportAiImprovements`

| | |
|---|---|
| **Type** | Runtime (LaunchDarkly) |
| **What it gates** | AI-driven improvements to the Workflow Report editor |
| **Default** | Variable |
| **Doc** | [Workflow Runs & Reports](/guide/workflow-runs) |

### `workflowscheduling`

| | |
|---|---|
| **Type** | Runtime (LaunchDarkly) |
| **What it gates** | Workflow-level scheduling (separate from Capability-level scheduling on the head workflow) |
| **Default** | Variable |
| **Doc** | [Workflows → Scheduling](/guide/workflows#scheduling-workflows) |

### `workflowtemplatesandvariables`

| | |
|---|---|
| **Type** | Runtime (LaunchDarkly) |
| **What it gates** | The Workflow Templates tab + Variable Sets feature |
| **Default** | Variable |
| **Doc** | [Workflows → Templates](/guide/workflows#templates), [Workflows → Variables Node](/guide/workflows#variables-node) |

---

## Flags by category

For quick browsing, the same flags organized by what kind of feature they gate.

### Navigation / area-gating flags

These hide entire nav items or route trees when off:

- `chatbotEnabled` — Home, Agents, Datasets, Capabilities link
- `workflowEnabled` — Workflow nav + routes
- `autonomousCapabilitiesEnabled` — Capabilities routes
- `apiManagementEnabled` — Developer API Apps functionality
- `forecastEnabled` — Forecast nav (UI prototype only)
- `simulationsactive` — Concept Simulations area
- `composioEnabled` — Integrations tab in Personal Profile

### UI-feature flags

These add or remove specific UI controls within otherwise-enabled areas:

- `enablenewagentnames` — Agent type label aliases
- `chatmodelselectoractive` — Model selector in chat toolbar
- `toolsEnabled` — Tools dropdown in chat
- `audiofileuploadenabled` — Audio uploads in Datasets and Campaigns
- `videoInsights` — Video-insights extraction
- `taskrichinputenabled` — Rich input in Workflow tasks
- `selectallcheckboxesenabledinchat` — Batch-selection in chat
- `selectpersonafrompopulation` — Persona-from-population selector
- `completeprofileprompting` — Profile-completion prompts
- `moveusagetoworkspacetab` — Usage tab location

### Wave / version flags

These pick between a legacy and a newer experience:

- `capabilityWave3BackendEnabled` — Wave 3 vs legacy Capabilities backend
- `capabilityBuilderV2Enabled` — Prompt Form Canvas (V2 capability authoring)
- `outputStudioEnabled` — Output Studio (V2 capability output authoring)
- `agentbuilderwithgenerationflow` — Newer guided Agent Builder
- `aiPersonaOpenFgaPermissionsActive` / `aiWorkflowOpenFgaPermissionsActive` / `surveyOpenFgaPermissionsActive` / `trainingSetOpenFgaPermissionsActive` — OpenFGA per-resource permission rollout

### Integration flags

These gate specific third-party or workspace-level integrations:

- `composioEnabled` — Composio per-user tool connections
- `synthesioEnabled` — Synthesio social-listening
- `sharepointEnabled` — SharePoint Connect for Dataset imports
- `deltaSyncEnabled` — Incremental sync optimization

### Billing / quota flags

- `appLimitsEnabled` — Quota / usage limit enforcement
- `personaconversationcredits` — Per-persona conversation credit billing
- `customRewardGroupsActive` — Custom reward groupings beyond standard Tremendous

### Internal-infrastructure flags

Not customer-facing — these toggle internal infrastructure behavior:

- `centrifugo` — Centrifugo real-time event delivery migration
- `campaignprogresssubscription` — Campaign progress live subscriptions

### Specialty flags

Niche feature toggles that don't fit other categories:

- `aiInsightsEnabled` — AI-generated insights
- `aiSimulationEnabled` — AI Population simulation
- `autoChartsEnabled` — Auto-generated charts
- `createpopulations` — Population creation permission
- `enablegeneralpopulations` — General (platform-curated) Populations
- `customTemplatesEnabled` — Brand Templates tab
- `moldBuilder` — Implementation → Molds tab
- `topicGraphEnabled` — Insights tab + Topic Graph chat tool
- `workflowReportAiImprovements` — AI-improved Workflow Report editor
- `workflowscheduling` — Workflow-level scheduling
- `workflowtemplatesandvariables` — Workflow Templates + Variable Sets
- `guestModeEnabled` — Guest-role membership support

### Build-time toggles

These are NOT workspace flags — they're code-level constants set at deploy:

- `enforcesso` — Whether Enforce SSO option appears in General Settings (also gated by role)

---

## Soak-rollout patterns

Several flags follow a recognizable rollout pattern:

1. **Phase 1 — Default off platform-wide.** Code merges with the flag off; nothing changes for any workspace.
2. **Phase 2 — Vurvey staff workspaces enabled.** Internal testing on real data.
3. **Phase 3 — Friendly customer pilots.** Selected customers volunteer to test new features.
4. **Phase 4 — Broad rollout.** Most workspaces flipped on.
5. **Phase 5 — Default-on for new workspaces.** New signups get it automatically.
6. **Phase 6 — Default-on for all workspaces.** Existing workspaces auto-flip.
7. **Phase 7 — Flag retired.** Code branch removed; feature is permanent.

Most flags in this reference are between Phase 3 and Phase 5. The `OpenFgaPermissionsActive` family has mostly reached Phase 6.

If you're a Vurvey CSM asked _"when will customer X get feature Y?"_, the answer depends on which phase the flag is in. Talk to engineering for the current rollout phase.

---

## How to check a flag's state for a workspace

### From the app

There's no in-app UI showing the full flag state of your workspace today. The closest is **Settings → General Settings** where the visible toggles and integration cards reflect a few of the workspace booleans.

### From engineering / staff

For Vurvey staff with access:

- **Workspace booleans**: Query the `workspaces` table directly, or use Super Admin → Manage Workspaces → workspace detail view
- **Runtime flags**: Check the LaunchDarkly dashboard for the workspace's flag-state snapshot

### From the GraphQL API

The `workspace` GraphQL type exposes the boolean fields directly — `workspace.chatbotEnabled`, `workspace.composioEnabled`, etc. See the schema in vurvey-api for the canonical list.

Runtime LaunchDarkly flags are NOT exposed via GraphQL — they're evaluated per-request on the client.

---

## Cross-references

- [What's New](/guide/whats-new) — chronological view of feature additions (this page is alphabetical)
- [Quick Reference → Workspace feature flags](/guide/quick-reference#workspace-feature-flags-cheat-sheet) — short cheat-sheet table
- [Settings → workspace feature flags](/guide/settings#workspace-flags-you-may-encounter) — Settings-focused view
- [Platform Architecture](/guide/architecture) — where flags fit in the stack
- [Developer & API Reference](/guide/developer-reference) — programmatic flag access
- [Permissions & Sharing](/guide/permissions-and-sharing) — the OpenFGA rollout flags
- [Glossary](/guide/glossary) — terminology
- [About This Documentation](/guide/automation-and-qa) — how this doc stays current
