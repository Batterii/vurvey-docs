---
title: What's New
---

# What's New

A running catalog of recent platform additions, feature-flag rollouts, and coming-soon features across Vurvey. This page is updated alongside doc rewrites — see [About This Documentation](/guide/automation-and-qa) for how the auto-update pipeline works.

If you're looking for general onboarding, start at the [Introduction](/guide/). For a comprehensive cheat sheet, see [Quick Reference](/guide/quick-reference).

---

## Recently shipped

### Topic Graph Insights tab on campaigns
- **What it is:** A live, interactive map of entities and themes extracted from campaign responses. Click into any entity to see the participant quotes that produced it.
- **Workspace gate:** `topicGraphEnabled` (default on).
- **Where to use it:** Every campaign now has an **Insights** tab in the per-campaign tab bar.
- **Behind the scenes:** Pub/Sub event → BullMQ light-CPU queue → Gemini 3 Flash extraction → PiiScrubber → pgvector dedup → Neo4j storage → 500ms-debounced subscription. GDS Louvain clustering runs in a periodic batch job.
- **Read:** [Topic Graph (Insights)](/guide/topic-graph), [Settings → Topic Graph Toggle](/guide/settings#4-topic-graph-toggle), and the [Campaigns → Navigation Tabs](/guide/campaigns#navigation-tabs) table.

### `exploreTopicGraph` chat tool for Agents
- **What it is:** Five graph operations (summary, theme_details, entity_search, neighborhood, path) that Agents can call during chat to walk a campaign's Topic Graph.
- **How to enable:** Bind the capability to an Agent in the Agent Builder; requires the workspace `topicGraphEnabled` flag.
- **Read:** [Topic Graph → Explorer chat tool](/guide/topic-graph#the-topic-graph-explorer-chat-tool-agents-can-navigate-the-graph).

### Capabilities Wave 3 backend (`capabilityWave3BackendEnabled`)
- **What changed:** New Capability backend with inline-editable detail page, Blueprint Library, three workspace Object Libraries (Insights, Concepts, Evaluations), and structured-output Evidence badges.
- **Workspace gate:** `capabilityWave3BackendEnabled` toggles between Wave 3 and the legacy `CapabilityDeploymentsList` / `CapabilityDeploymentPage` surfaces.
- **Read:** [Capabilities](/guide/capabilities).

### Material 3 Theme Creator for Brand Companions
- **What it is:** A staff-only tool that generates a full Material Design 3 tonal palette (~30 tokens per mode, light + dark) from a single source color. Lazy-loaded via `@material/material-color-utilities`.
- **Visibility:** Gated by `isSupportOrEnterpriseRole(user.role)`.
- **Read:** [Branding → Brand Companion Themes](/guide/branding#brand-companion-themes-vurvey-staff-only).

### Sources & Citations dual pipeline
- **Chat citations** (existing): `Powered by N sources` block with inline `⁽ⁿ⁾` superscripts and `Citations` toggle. Backed by per-message grounding data.
- **Structured Output Evidence badges** (newer, May 2026 — migration `20260518000001_wrap-structured-output-with-citations.ts`): A click-to-open popover on every bound element of a dashboard or export, with `safeHttpUrl` security allowlist preventing LLM-emitted `javascript:` URLs.
- **Read:** [Sources & Citations](/guide/sources-and-citations).

### Brand Companion data model
- **Two new fields on `ai_personas`** (migration `20260414170725_add-brand-companion-to-ai-personas.ts`, April 2026):
  - `is_brand_companion` — boolean flag promoting a persona into the Brand Companions grid + Public API app workflow.
  - `brand_companion_metrics_enabled` — separately controls whether nightly conversation rollups compute (avoids expensive default-on metrics).
- **Read:** [Brand Companions](/guide/brand-companions).

### Image Studio: Convert to Video (Google Veo 3.1)
- **What it is:** Image-to-video generation using Google's Veo 3.1 model. Configurable duration (4/6/8s), aspect ratio (16:9 / 9:16), sample count (1–4), seed, negative prompt, person-generation safety control, and a Gemini-driven "enhance prompt" toggle on by default.
- **Read:** [Canvas & Image Studio → Convert to Video panel](/guide/canvas-and-image-studio#convert-to-video-panel).

### Workspace integration platform expansion
- **Composio per-user connections** with 3 auth schemes (OAuth2, ApiKey, BearerToken — OAuth1 and Basic removed from schema).
- **Workspace Enterprise integrations** (admin-managed): connector configs, sync runs with `INTEGRATION_SYNC_PROGRESS_UPDATES` subscription, Structured Research Imports with template support.
- **Workspace gating cache** with permanent-true / 5-min false TTL + 10k LRU.
- **Read:** [Integrations](/guide/integrations).

### Manager + Responder login parity (Responder gains 5 providers)
- The Responder app now offers 5 sign-in providers (Google, Microsoft, Apple, Email, SSO) versus the Manager's 2 (Google, Email + SSO redirect).
- Survey context preserved across login via `surveyId` localStorage.
- Verify Email loop polls every 3 seconds and fires analytics events on verification.
- **Read:** [Logging In](/guide/login).

### Auto-Reel pipeline ("Magic" in Magic Reels)
- **What it is:** A Python Cloud Function (`vurvey-gcf-scripts/sensemake-creator-reel`) that calls the Sensemake API (`sensemake.vurvey.dev`) to extract sentence-level highlights from a user's video corpus, produces a `CloudReelDetails` summary (sentiment, opinions, keywords), and auto-assembles a Reel from top-scored highlights.
- **Read:** [Reels → Auto-generated reels](/guide/reels#auto-generated-reels-the-magic-in-magic-reels).

### Forecast (UI prototype on demo data)
- **Status:** UI prototype only — no backend pipeline. Entire feature uses Apollo `MockedProvider` with hardcoded `START_DATE` 2022-01-01.
- **Workspace gate:** `forecast_enabled` (default off). Flipped by Vurvey staff.
- **Read:** [Forecast](/guide/forecast).

---

## Active feature-flag rollouts

Per-workspace flags managed by Vurvey staff. See [Settings → workspace flags](/guide/settings#workspace-flags-you-may-encounter) for the canonical table.

| Flag | What it gates | Default for new workspaces |
|---|---|---|
| `chatbotEnabled` | Home / Agents / Datasets navigation + Capabilities link | On |
| `topicGraphEnabled` | Insights tab on campaigns + `exploreTopicGraph` chat tool | On |
| `autonomousCapabilitiesEnabled` | `/capabilities/*` routes | Off (request via CSM) |
| `capabilityWave3BackendEnabled` | Wave-3 UI vs legacy `CapabilityDeploymentsList` | Off (rollout in progress) |
| `composioEnabled` | Personal Profile → Integrations tab + Composio connections | Off (request via CSM) |
| `synthesioEnabled` | Synthesio card in General Settings | Off |
| `sharepointEnabled` | SharePoint card in General Settings | Off |
| `forecast_enabled` | Forecast nav | Off |
| `customTemplatesEnabled` | Brand Templates tab in Settings | Off |
| `moldBuilder` | Molds tab in Implementation | Off |
| `agentBuilderV2Active` | Manage Agents 2.0 in Super Admin | Off |
| `apiManagementEnabled` | Developer API Apps page functionality | On for most workspaces |
| `enablenewagentnames` | Aliases Consumer Persona → Advocate, Product → Brand Companion | Variable |
| `enforcesso` _(build-time)_ | Enforce SSO option in General Settings | Build-dependent |

---

## Coming soon

Features that exist as scaffolding (route mounted, empty state shipped, or behind a flag) but are not fully functional yet. **Do not promise these to customers** unless your CSM confirms timing.

### Magic Topics
- **Where:** [Mentions → Magic Topics tab](/guide/mentions#1-3-magic-topics-tab).
- **Status:** Route is wired, `EmptyState` ships with the copy _"Identify important themes and topics that people are talking about the most. Coming soon."_ No backend analysis pipeline.
- **Not currently feature-flagged** — turning a flag on does not activate it. Wait for the changelog announcement.

### Custom cron schedules in Capabilities
- **Where:** [Capabilities → Schedule editor](/guide/capabilities#schedule-editor).
- **Status:** The Custom preset is a placeholder. Use Daily/Hourly/Weekly/Monthly for now.

### Capabilities → Optimize
- **Where:** `/capabilities/:slug/optimize` (only reachable via direct URL).
- **Status:** Empty `<div />`. The route exists but the component isn't implemented. Inverse-forecast surface ("given a target, what inputs do we need?") is the long-term intent.

### Forecast backend pipeline
- **Where:** [Forecast](/guide/forecast).
- **Status:** Entire feature is mock-data only. No engineering ETA for a real pipeline.

### Save Custom View on Forecast
- **Where:** [Forecast → main view](/guide/forecast#the-main-forecast-view-forecast).
- **Status:** Button renders, click is a TODO no-op.

### Settings → Integrations tab
- **Where:** [Settings → Sub-navigation](/guide/settings#sub-navigation).
- **Status:** Tab exists in sub-nav but the route is not mounted in `workspace-routes.tsx`. Known UI/route mismatch — use the integration cards in General Settings or [Account & Profile → Integrations](/guide/account#integrations-me-integrations) instead.

### Richer edge labels in Topic Graph
- **Where:** [Topic Graph → Reading the graph](/guide/topic-graph#reading-the-graph).
- **Status:** Edge labels currently render as `RELATED_TO`. Richer relationship types (`USES`, `CAUSES`, `MENTIONS_ALONGSIDE`) exist in the extractor and will surface as future UI work.

### Topic Graph export
- **Where:** [Topic Graph](/guide/topic-graph).
- **Status:** Read-only live view today. For exports, use Analyze or Results CSV.

### Population persona switching in chat
- **Where:** [Home → Population persona modal](/guide/home#the-population-persona-modal).
- **Status:** Feature is gated by a feature flag; persona conversation credits / Billed badge behavior depends on workspace setup.

---

## Doc-side changes (May 2026 doc-improvement run)

For context if you've been here a while and the docs feel different:

- **26 docs rewritten or surgically enhanced** in late May 2026, adding ~6,000 net new lines of source-code-validated content.
- **Every feature doc now points outward** to a "Where X fits in the broader platform" matrix cross-referencing the surfaces it touches (12–13 specific cross-links per matrix).
- **Topic Graph guide added to the sidebar** under Features (previously untracked).
- **Settings → Sub-navigation table corrected** — the page has 5 tabs, not 2 as older docs claimed.
- **`/api-apps` route corrected** to `/settings/api-apps` (it's a Settings child, not a top-level workspace route or a Brand Companions sub-route).
- **Mentions split into 3 concepts** — workspace area, `@mention` chat syntax, and Synthesio social-listening (previously conflated).
- **Reels gains a dedicated Share Link side panel section** with server-side password semantics, light/dark display mode, and a security note on LLM-URL handling.
- **Permissions & Sharing rewritten with two-layer model** (UserRole + OpenFGA) explicitly distinguishing customer Workspace Owner from `ENTERPRISE_MANAGER`/`SUPPORT`/`IMPLEMENTATION` roles.

---

## How to find out what changed when

- **Git history:** `git log` on the docs repo shows every change with a detailed commit message. The May 2026 doc-improvement commits include source-code citations for each fact.
- **GitHub releases:** Vurvey doesn't currently publish per-release notes in this repo. Ask your CSM for product release notes.
- **Sibling repo changelogs:** The `vurvey-web-manager` and `vurvey-api` repos have their own commit histories; major behavior changes typically include a related migration file with a date prefix (e.g. `20260518000001_*` for the structured-output citations enhancement).

---

## Where to go from here

- [Quick Reference](/guide/quick-reference) — cheat sheet for the current state of the platform
- [Introduction](/guide/) — guided entry for new users
- [About This Documentation](/guide/automation-and-qa) — how this site stays current
- [Settings → workspace feature flags](/guide/settings#workspace-flags-you-may-encounter) — canonical flag table
- [Permissions & Sharing](/guide/permissions-and-sharing) — the two-layer model that gates almost everything
