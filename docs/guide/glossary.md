---
title: Glossary
---

# Glossary

Alphabetical reference for every Vurvey-specific term, internal name, and acronym. If you encounter something unfamiliar elsewhere in the guide, search here first.

For role-specific terms see also [Permissions & Sharing → Workspace roles](/guide/permissions-and-sharing#layer-1-workspace-roles). For feature-flag names see [Settings → workspace flags](/guide/settings#workspace-flags-you-may-encounter) and [What's New → Active feature-flag rollouts](/guide/whats-new#active-feature-flag-rollouts).

---

## A

**Advocate** — UI alias for the **Consumer Persona** agent type when `enablenewagentnames` is enabled. See [Agents → Agent types](/guide/agents#agent-types-choosing-the-right-one).

**Agent** — An AI persona configured with a name, system prompt, capabilities, datasets, and personality. Same record as a `Persona` (the GraphQL type is `AiPersona`). See [Agents](/guide/agents).

**`AiOrchestration`** — Internal model name for a Workflow. The GraphQL `id` field on a Workflow is `aiOrchestrationId`. See [Workflows](/guide/workflows).

**`AiPersona`** — Internal model name for an Agent. Has fields including `isBrandCompanion`, `brandCompanionMetricsEnabled`, `instructions`, `workspaceApiApp`. See [Agents](/guide/agents), [Brand Companions](/guide/brand-companions).

**`alias` (Dataset)** — The display field used in the Share dialog title for Datasets, distinct from `name`. See [Permissions & Sharing → Per-resource sharing](/guide/permissions-and-sharing#layer-2-per-resource-sharing-openfga-backed).

**API App** — Workspace API credential, either **Public** (Brand Companion embeds, allowed-domains required) or **Developer** (backend integrations). Managed at `/settings/api-apps`. See [Brand Companions → API App types](/guide/brand-companions#api-app-types-public-vs-developer) and [Settings → Developer API Apps](/guide/settings#developer-api-apps-settings-api-apps).

**`apiManagementEnabled`** — Workspace feature flag gating whether the Developer API Apps page is functional (the route is always mounted).

**`autonomousCapabilitiesEnabled`** — Workspace feature flag gating the `/capabilities/*` route tree. Combined with `chatbotEnabled` for the nav link visibility.

---

## B

**BigQuery** — Google's analytics data warehouse. The `datawarehouse-*` GCFs feed it. Internal admin BI dashboards (visible in [Super Admin → Dashboard](/guide/admin#dashboard-admin)) are built on top.

**Blueprint** — A pre-built Capability template — workflows, prompts, schedules, object types captured as a deployable unit. Browse them at `/capabilities/blueprints`. See [Capabilities → Blueprint library](/guide/capabilities#blueprint-library-capabilities-blueprints-wave-3).

**Brand** — A workspace's brand identity record (`brands` table). One brand per workspace; created by Vurvey staff during onboarding. See [Branding](/guide/branding).

**Brand Companion** — An AI persona flagged `is_brand_companion = true`, given a Public-type Workspace API App, and embedded publicly on the customer's site. UI alias for the **Product** agent type when `enablenewagentnames` is on. See [Brand Companions](/guide/brand-companions).

**Brand Companion Theme Creator** — Staff-only Material Design 3 palette generator inside Brand Settings. Generates ~30 tonal tokens per mode (light + dark) from a single source color. See [Branding → Brand Companion Themes](/guide/branding#brand-companion-themes-vurvey-staff-only).

**Brand Templates** — Workspace-scoped campaign template library. Gated by `customTemplatesEnabled`. Distinct from **Global Campaign Templates** in Super Admin.

**`brand_companion_metrics_enabled`** — Per-persona boolean controlling whether nightly conversation-rollup jobs run for a Brand Companion. Independent of `is_brand_companion`. Migration: `20260414170725_add-brand-companion-to-ai-personas.ts`.

**BullMQ** — Redis-backed job queue used by vurvey-api workers. Three primary queues: `light-cpu-queue`, heavy, and sandbox. See [Platform Architecture → Worker topology](/guide/architecture#vurvey-api-worker-topology).

---

## C

**`can_view` / `can_edit` / `can_delete` / `can_manage` / `can_manage_schedules`** — The five underlying OpenFGA permission primitives the Share dialog compresses to Viewer / Editor. See [Permissions & Sharing → Five permission primitives](/guide/permissions-and-sharing#five-permission-primitives-under-the-hood).

**Campaign** — A research survey (`surveys` table). The user-facing rename; older parts of the code still say "survey". See [Campaigns](/guide/campaigns).

**Campaign Insights tab** — See **Insights tab**.

**Capability** — A reusable AI system packaging Workflows + schedules + dashboards + structured object types. Deploy from a Blueprint or build from scratch. Status enum: DRAFT, ACTIVE, PAUSED, ARCHIVED. See [Capabilities](/guide/capabilities).

**`capabilityWave3BackendEnabled`** — Workspace flag toggling between legacy `CapabilityDeploymentsList` and Wave 3 (`CapabilitiesHomePage` + Blueprint library + Object libraries). See [Wave 3](#w).

**`chatbotEnabled`** — Workspace flag gating the Home / Agents / Datasets nav entries + the Capabilities link condition.

**Citation** — Reference to a source on a chat response or structured-output element. Two pipelines: **chat citations** (Powered-by-N-sources + inline `⁽ⁿ⁾` superscripts) and **structured-output Evidence badges**. See [Sources & Citations](/guide/sources-and-citations).

**`CloudReelDetails`** — Auto-reel pipeline output containing sentiment scores, opinion clusters, and keyword analysis for a Reel auto-generated by `sensemake-creator-reel`. See [Reels → Auto-generated reels](/guide/reels#auto-generated-reels-the-magic-in-magic-reels).

**Code path** (System Prompt) — The immutable `code` field on a System Prompt record. Application code looks up prompts by this code at runtime. Renaming breaks every consumer. See [Implementation → System Prompts](/guide/implementation#system-prompts-implementation-system-prompts).

**Composio** — Auth0-acquired tool-integration layer Vurvey uses for per-user OAuth/API connections (Slack, Notion, Gmail, etc.). Three supported auth schemes: OAuth2, ApiKey, BearerToken. See [Integrations](/guide/integrations#composio-per-user-tool-connections).

**`composioEnabled`** — Workspace flag gating Personal Profile → Integrations tab and Composio connections. Backed by a two-layer cache (column-existence permanent-true / 5-min-false TTL + 10k-entry LRU). See [Composio gating cache](/guide/integrations#how-to-reach-it).

**Concept** — Built-in Capability Object Type for hypotheses / ideas / product variants. Surfaces in the Concepts Library at `/capabilities/concepts`. See [Capabilities → Object Types](/guide/capabilities#object-types-capabilities-object-types).

**`ConversationCompletionRateBetaV1`** — The metric key used by the Brand Companion Metrics page. "Beta V1" indicates the definition may evolve. See [Brand Companions → Metrics](/guide/brand-companions#brand-companion-metrics-page).

**`customTemplatesEnabled`** — Workspace flag gating the Brand Templates tab in Settings.

---

## D

**Dataset** — A collection of files (documents, videos, audio) the AI can reference. GraphQL model: `TrainingSet`. The Share dialog title uses the `alias` field rather than `name`. See [Datasets](/guide/datasets).

**`datawarehouse-*` GCFs** — Cloud Functions that aggregate platform data into BigQuery (creator rank, conversation tokens, fact tables). Feed internal Metabase dashboards.

**Developer App** — A Workspace API App of type **Developer**, created from `/settings/api-apps`. Server-to-server credentials with no persona link, no required allowed-domains, supports credential regeneration. See [Brand Companions → API App types](/guide/brand-companions#api-app-types-public-vs-developer).

**DIRECT mode** (Workspace Enterprise integration) — Live API access on every request, vs. **FALLBACK mode** (cached snapshots). See [Integrations → Workspace Enterprise](/guide/integrations#workspace-enterprise-integrations).

**Discovery Engine** — A Forecast surface (currently mock-data) with Predefined and Upload modes for surfacing patterns from forecast data. See [Forecast → Discover](/guide/forecast#discover-the-discovery-engine-forecast-discover).

---

## E

**`enablenewagentnames`** — Workspace flag that aliases Consumer Persona → Advocate and Product → Brand Companion in the UI.

**`enforcesso`** — Build-time feature toggle (not workspace-scoped) gating the **Enforce SSO** option in General Settings.

**ENTERPRISE_MANAGER** — A GraphQL `UserRole` value identifying Vurvey Labs enterprise staff. Passes `isAdminRole` and `isEnterpriseManagerOrImplementation` checks. See [Permissions & Sharing → Workspace roles](/guide/permissions-and-sharing#layer-1-workspace-roles).

**Evaluation** — Built-in Capability Object Type for scored judgements on Concepts or Insights. Surfaces in the Evaluations Library (sorted by score). See [Capabilities → Object Types](/guide/capabilities#object-types-capabilities-object-types).

**Evidence badge** — The "Evidence" pill on every bound element of a structured-output dashboard. Click opens a popover with quotes + safe-URL'd source links. See [Sources & Citations → Part 3](/guide/sources-and-citations#part-3-structured-output-evidence-badges-workflow-outputs-dashboards).

**`exploreTopicGraph`** — The Vercel AI SDK tool that exposes Topic Graph navigation to chat Agents. Five operations: summary, theme_details, entity_search, neighborhood, path. See [Topic Graph → Explorer chat tool](/guide/topic-graph#the-topic-graph-explorer-chat-tool-agents-can-navigate-the-graph).

---

## F

**Facets** (Agent) — Demographic and personality traits configured on an Agent. See [Agents → Facets](/guide/agents#how-to-create-an-agent).

**`feedbackSurvey`** — The brand-feedback survey backing the Branding → Reviews and Mentions → All Mentions pages. Auto-created on first feedback response. See [Branding → Reviews](/guide/branding#reviews-branding-reviews).

**Firebase Auth** — Identity layer for both Manager and Responder apps. Stores password / OAuth tokens. See [Logging In](/guide/login).

**Forecast** — Workspace area at `/forecast/*`. **Currently a UI prototype** with no backend pipeline — see [Forecast](/guide/forecast).

**`forecast_enabled`** — Workspace flag gating the Forecast nav. Defaults off.

---

## G

**GCF** — Google Cloud Function. Vurvey's out-of-band processing (Sensemake AI, Salesforce, brand setup, content moderation) runs as GCFs. See [Platform Architecture → GCF subsystems](/guide/architecture#gcf-subsystems).

**GCS** — Google Cloud Storage. Holds uploaded files (dataset documents, response videos, reels).

**Gemini 3 Flash** — The LLM used for per-answer entity extraction in the Topic Graph pipeline. Cheap and fast. See [Topic Graph → Architecture](/guide/topic-graph#architecture-what-s-behind-the-magic).

**Generic Permissions modal** — The shared share-dialog component used by Agents, Workflows, Datasets, and Campaigns. **Reels do NOT use this** — they use a purpose-built Share Link side panel. See [Permissions & Sharing](/guide/permissions-and-sharing).

**Global Campaign Templates** — Cross-workspace template library managed in Super Admin. Distinct from workspace-scoped Brand Templates.

**Grounding** — The mechanism by which AI responses cite specific source content. See [Sources & Citations](/guide/sources-and-citations).

**Guest mode** — A workspace-context flag (`shouldUseGuestMode`) reducing a user's surface. Hides Personal Profile tab strip + Dark Mode + Mentions / Brand Companions nav. See [Account & Profile → Guest mode](/guide/account#the-three-tabs).

---

## H

**halfvec** — pgvector half-precision vector type used by the Topic Graph's `EntityDeduplicator` for semantic-similarity merging.

**Highlights** (Sensemake) — Sentence-level scored moments extracted from videos by Sensemake. Power the **Highlights only** filter in Reels' Search Videos modal and the auto-reel pipeline. See [Reels → Auto-generated reels](/guide/reels#auto-generated-reels-the-magic-in-magic-reels).

**Home** (the page) — The default landing surface in Vurvey Manager — chat with Agents. See [Home](/guide/home).

---

## I

**`IMPLEMENTATION`** (`UserRole`) — Vurvey Labs implementation engineer role. Passes `isEnterpriseManagerOrImplementation`. See [Permissions & Sharing → Workspace roles](/guide/permissions-and-sharing#layer-1-workspace-roles).

**Implementation (the workspace area)** — Staff-only editorial surface for taxonomy, system prompts, YAML agent imports, and agent personalities. See [Implementation](/guide/implementation).

**`incentiveAmount` / `incentiveCurrency`** — Per-campaign fields that pre-fill the Send Reward modal when filtering to that one campaign. See [Rewards → Send Reward modal](/guide/rewards#send-reward-modal).

**`InsertMention`** — Internal React component for the `@mention` picker popup in chat composers.

**Insight** — Built-in Capability Object Type for distilled findings. Surfaces in the Insights Library at `/capabilities/insights`. Distinct from the **Insights tab** on campaigns (which is the Topic Graph). See [Capabilities → Object Types](/guide/capabilities#object-types-capabilities-object-types).

**Insights tab** (Campaign) — The Topic Graph tab on every campaign. Live entity-and-theme network from extracted responses. Workspace-gated by `topicGraphEnabled`. See [Topic Graph](/guide/topic-graph).

**`isAdminRole`** — User-context predicate identifying users who can reach Super Admin / Brand Companions / Mentions areas. Typically `ENTERPRISE_MANAGER` or `SUPPORT` `UserRole`. See [Permissions & Sharing → Workspace roles](/guide/permissions-and-sharing#layer-1-workspace-roles).

**`isBrandCompanion`** — Per-persona boolean flag promoting an Agent into the Brand Companions grid. Migration: `20260414170725_add-brand-companion-to-ai-personas.ts`.

**`isEnterpriseManagerOrImplementation`** — User-context predicate gating Implementation routes. See [Implementation → Access control](/guide/implementation#access-control).

**`isOnVurveySubdomain`** — Manager-app sign-in state controlling whether Terms & Conditions / Privacy links render on the Initial screen.

**`isSupportOrEnterpriseRole`** — User-context predicate gating staff-only sections (e.g. Brand Companion Themes). See [Branding](/guide/branding#brand-companion-themes-vurvey-staff-only).

---

## L

**Lists** (People) — Static, manually-managed contact groups in People. Distinct from **Segments**.

**Live indicator** (Topic Graph) — Pulsing badge on the Insights tab when a campaign is still accepting responses. See [Topic Graph → Live vs finished](/guide/topic-graph#live-vs-finished-campaigns).

**Louvain** — A graph-theory community-detection algorithm. Vurvey uses Neo4j GDS Louvain to cluster Topic Graph entities into themes. When Louvain finds no clusters, the UI falls back to synthetic `type:` groupings. See [Topic Graph → Synthetic type-groupings](/guide/topic-graph#synthetic-type-groupings-when-louvain-has-nothing-to-cluster).

---

## M

**Magic Reels** — The Reels feature. "Magic" specifically refers to the auto-assembly pipeline backed by the `sensemake-creator-reel` GCF. See [Reels](/guide/reels).

**Magic Topics** — A coming-soon analysis tab in Mentions. Currently a placeholder `EmptyState`. Not feature-flagged — no toggle activates it. See [Mentions → Magic Topics](/guide/mentions#1-3-magic-topics-tab).

**Manager (app)** — The `vurvey-web-manager` web app for researchers and admins. Distinct from the Responder app. See [Logging In](/guide/login).

**Material 3** — Google's design system. The Brand Companion Theme Creator generates Material 3 tonal palettes. See [Branding → Brand Companion Themes](/guide/branding#brand-companion-themes-vurvey-staff-only).

**Mentions** (workspace area) — Admin-only workspace surface at `/mentions/*` containing All Mentions and Magic Topics tabs. Distinct from the `@mention` chat syntax and from Synthesio-imported mentions. See [Mentions](/guide/mentions).

**`@mention` (chat syntax)** — Type `@` in any chat composer to open the persona picker. Prefix-match, multi-word support, word-boundary safety. See [Mentions → @mention syntax](/guide/mentions#2-mention-syntax-in-chat).

**Mold** — A reusable persona template (`pm_mold` table). Same data as Agent Personalities but with a separate Implementation builder UI gated by `moldBuilder`. See [Implementation → Molds](/guide/implementation#molds-implementation-molds-feature-flagged).

**`moldBuilder`** — Workspace flag gating the Molds tab in Implementation.

---

## N

**Nano Banana** — Vurvey's proprietary fast image-generation model, available in the Images dropdown.

**Neo4j** — Graph database storing the Topic Graph (`TopicEntity`, `Theme` nodes, `TOPIC_RELATED` edges).

---

## O

**Object Library** — Wave 3 Capability surface listing Insights / Concepts / Evaluations produced by capability workflows. See [Capabilities → Object Libraries](/guide/capabilities#object-libraries-wave-3-capabilities-insights-concepts-evaluations).

**Object Type** — A Zod-validated schema defining the shape of structured objects produced by capability workflows. Built-ins: Insight, Concept, Evaluation. See [Capabilities → Object Types](/guide/capabilities#object-types-capabilities-object-types).

**Omni Mode** — Vurvey's default chat mode where the AI auto-selects which tools and sources to use based on the question.

**OpenFGA** — Auth0's relationship-based authorization engine. Stores per-resource permission tuples as the source of truth for sharing decisions. See [Permissions & Sharing → Per-resource sharing](/guide/permissions-and-sharing#layer-2-per-resource-sharing-openfga-backed).

**Output Studio** — The structured-output authoring + rendering surface for capability workflows. Has a dedicated `output-studio-export-worker`. See [Capabilities](/guide/capabilities).

**OutputSpec** — A workflow's structured-output schema declaration with versioned `schema.fields`. Drives the post-run `emit_structured_output_with_evidence` extractor. See [Sources & Citations → Post-run extractor](/guide/sources-and-citations#the-post-run-extractor).

---

## P

**pgvector** — PostgreSQL extension for vector similarity search. Used by the Topic Graph `EntityDeduplicator` (with `halfvec` type) for semantic dedup.

**PII Scrubber** — Server-side entity-extraction step that redacts person names, emails, and phones from extracted Topic Graph entities. See [Topic Graph → PII redaction](/guide/topic-graph#privacy-the-pii-redaction-pill).

**Personalities** (Agent) — Reusable personality kits stored in `pm_mold` and managed at `/implementation/agent-personalities`. Same underlying data as Molds. See [Implementation → Agent Personalities](/guide/implementation#create-agent-personalities-implementation-agent-personalities).

**Persona** — A user-visible synonym for **Agent** in some contexts (Population Persona, AI persona simulation). Internal GraphQL type is `AiPersona`.

**`pm_mold`** — The PostgreSQL table backing Agent Personalities AND Molds. Same data, two UIs.

**Populations** — Audience groupings in People. Two kinds: Brand Populations and Vurvey Populations.

**Population persona** — A persona representing a population in chat (Home / Canvas Populations chip). Switches the conversation to persona-mode; clears other tools/sources/images.

**Public App** — A Workspace API App of type **Public**, created from a Brand Companion card. Persona-linked. **Domains required** — empty allowlist = embed inaccessible. See [Brand Companions → API App types](/guide/brand-companions#api-app-types-public-vs-developer).

**`Powered by N sources`** — The chat-citation footer below an AI response. See [Sources & Citations → Chat citations](/guide/sources-and-citations#part-2-chat-citations-powered-by-n-sources).

---

## R

**`readPrivate`** — OpenFGA permission gating who can view a Reel's password value (not who can view the Reel publicly).

**`REGULAR_USER`** — The default `UserRole` for customer accounts. Customer Workspace Owner / Admin / Manager are workspace-scoped ACL roles on a `REGULAR_USER`. See [Permissions & Sharing → Workspace roles](/guide/permissions-and-sharing#layer-1-workspace-roles).

**Reel** — An editable highlight video built from campaign responses or uploaded source media. Status: Draft / Processing / Published / Unpublished Changes / Failed. See [Reels](/guide/reels).

**`ReelDisplayMode`** — `LIGHT` or `DARK`. Controls share-page background. See [Reels → Share Link panel](/guide/reels#sharing-the-share-link-side-panel).

**`ReelVideoStatus`** — Enum tracking published-video lifecycle.

**`requiresPassword`** (Reel) — Boolean controlling whether the public `/share/:reelId` page demands a password. See [Reels → Server-side password semantics](/guide/reels#server-side-password-semantics).

**Responder (app)** — The `vurvey-web-responder` web app for survey-takers. Mobile-first, 5-provider login. See [Logging In → Responder](/guide/login#vurvey-responder-login-survey-takers).

---

## S

**`safeHttpUrl`** — Frontend helper that allowlists `http:` and `https:` schemes for LLM-emitted citation URLs. Prevents `javascript:` and `data:` URL XSS in popovers. See [Sources & Citations → Security](/guide/sources-and-citations#security-llm-generated-urls-in-citation-popovers).

**Sensemake** — Internal Vurvey AI service at `sensemake.vurvey.dev`. Powers highlight extraction for auto-reels, per-campaign / per-question insights, and various analytics aggregations. Consumed by `sensemake-*` GCFs.

**`sensemake-creator-reel`** — Python GCF that calls Sensemake to assemble auto-reels. See [Reels → Auto-generated reels](/guide/reels#auto-generated-reels-the-magic-in-magic-reels).

**Segment** (People) — Dynamic audience group with automatic membership based on rules. Distinct from **Lists**.

**`SERVICE_ACCOUNT`** — A `UserRole` for bot identities used for programmatic API access. Backs Developer API Apps' server-to-server calls. See [Permissions & Sharing → Workspace roles](/guide/permissions-and-sharing#layer-1-workspace-roles).

**SharePoint Connect** — Workspace integration card in General Settings letting admins import SharePoint files into Datasets. Gated by `sharepointEnabled` flag AND `sharepointSettings` permission. See [Settings → SharePoint card](/guide/settings#sharepoint-card).

**`sharepointSettings`** — Workspace permission required to manage the SharePoint connection (literal substring match on `permissions[]`).

**`shouldUseGuestMode`** — User-context flag indicating guest mode. See [Guest mode](#g).

**`SignUpModalReducer`** — Manager app's login state machine: Initial / Email / Password / RecoverPassword / CheckYourEmail / SignUp.

**`SignUpFlowReducer`** — Responder app's equivalent state reducer.

**Source** (chat) — Any attached campaign / dataset / file in a chat conversation. Three controls: Quick Dropdown, Sources Modal, and per-conversation state.

**SSO** — Single Sign-On. Managed via Super Admin → SSO Providers. Domain-based routing triggers `?reason=sso-required` redirect to the Manager login. See [Super Admin → SSO Providers](/guide/admin#sso-providers-admin-sso-providers).

**Structured Research Import** — Workspace Enterprise integration pattern: upload CSV/JSON → field mapping → preview → validate → execute → save template. See [Integrations → Structured Research Import](/guide/integrations#structured-research-import).

**`SUPPORT`** — A `UserRole` for Vurvey Labs support staff. Same admin-area access as `ENTERPRISE_MANAGER`; has an `isSupportPermissionInSync` shadow flag. See [Super Admin → Manage Vurvey employees](/guide/admin#manage-vurvey-employees-admin-vurvey-employees).

**Super Admin** — Vurvey Labs cross-workspace administration area at `/admin/*`. Distinct from customer workspace admin. See [Super Admin](/guide/admin).

**Survey** — The internal GraphQL/database name for a Campaign. UI everywhere says "Campaign".

**Synthesio** — Third-party social-listening platform. The Synthesio integration imports brand mentions into a `"Synthesio Mentions"` workspace Dataset. See [Mentions → Synthesio](/guide/mentions#3-synthesio-social-listening-mentions).

**`synthesioEnabled`** — Workspace flag gating the Synthesio card in General Settings.

**Synthetic theme** — Topic Graph fallback grouping by entity type (e.g. `type:Product`) when GDS Louvain finds no real clusters. See [Topic Graph → Synthetic type-groupings](/guide/topic-graph#synthetic-type-groupings-when-louvain-has-nothing-to-cluster).

**System Prompt** — Platform-wide reusable LLM prompt indexed by `code`. Status: Draft / Active / Archived. Versioned per record. Managed at `/implementation/system-prompts`. See [Implementation → System Prompts](/guide/implementation#system-prompts-implementation-system-prompts).

---

## T

**Taxonomy** — Platform-wide controlled vocabulary of facets and values used to segment People. Edits stage a delta; **Sync** publishes. See [Implementation → Taxonomy](/guide/implementation#taxonomy-management-implementation-taxonomy).

**Theme** (Topic Graph) — A cluster of related entities identified by Louvain community detection. Larger glowing circles on the Insights tab.

**`Theme` node** (Neo4j) — Database label for theme records in the Topic Graph storage.

**Topic Graph** — Live interactive map of entities and themes extracted per campaign. The Insights tab on every campaign. See [Topic Graph](/guide/topic-graph).

**`topicGraphEnabled`** — Workspace flag gating the Insights tab AND the `exploreTopicGraph` chat tool. Default on for new workspaces.

**`TOPIC_RELATED`** — Neo4j relationship type connecting `TopicEntity` nodes in the Topic Graph.

**`TopicEntity`** — Neo4j node label for individual entities in the Topic Graph.

**Tremendous** — Third-party payouts platform. Powers Rewards. Supports gift cards, ACH, PayPal, charity donations. ~2.5% fee per payout. See [Rewards](/guide/rewards).

**`tremendousSettings`** — Workspace permission (substring match) gating Rewards header buttons (Configure / Enable / Disable / Disconnect).

**`TrainingSet`** — Internal model name for a Dataset. The Share dialog uses the `alias` field on this. See [Datasets](/guide/datasets).

---

## U

**Upcoming Runs** — Workflow tab listing scheduled-but-not-yet-fired workflow runs.

**Unsaved Changes Handler** (Image Studio) — Component that intercepts navigation away from a modified image with a confirm dialog.

**`UserRole`** — GraphQL enum: `REGULAR_USER`, `ENTERPRISE_MANAGER`, `SUPPORT`, `IMPLEMENTATION`, `SERVICE_ACCOUNT`. Distinct from per-workspace ACL roles. See [Permissions & Sharing → Workspace roles](/guide/permissions-and-sharing#layer-1-workspace-roles).

---

## V

**Veo 3.1** — Google's video generation model used by Image Studio's Convert to Video. See [Canvas & Image Studio → Convert to Video](/guide/canvas-and-image-studio#convert-to-video-panel).

**`VideoAspectRatio`** — Enum: `Landscape` (16:9) or `Portrait` (9:16). Used by Veo 3.1 video config.

**VitePress** — The static-site generator powering this docs site. See [About This Documentation](/guide/automation-and-qa).

**Vurvey Copilot** — Internal Vurvey Labs productivity tool implemented as `vurvey-copilot` GCF. Not customer-facing. See [Platform Architecture → GCF subsystems](/guide/architecture#gcf-subsystems).

**Vurvey Labs** — The company. Distinct from any single customer workspace.

---

## W

**Wave 3** — The current major iteration of the Capability backend (Wave 3 = inline-editable detail page, Blueprint library, Object libraries). Toggled by the `capabilityWave3BackendEnabled` workspace flag. See [Capabilities](/guide/capabilities).

**Web Research** — Workspace toolbar tool (Tools dropdown) for general web search. One of seven external tools (with TikTok, Reddit, LinkedIn, YouTube, X/Twitter, Instagram). See [Canvas & Image Studio → Tools dropdown](/guide/canvas-and-image-studio#tools-dropdown).

**Workflow** — A multi-step AI orchestration. Underlying model: `AiOrchestration`. Status states: Pending / Running / Paused / Completed / Failed / Cancelled. See [Workflows](/guide/workflows).

**Workspace** — A multi-tenant container holding agents, campaigns, datasets, members, and brand. Customers can have multiple workspaces; each is fully isolated. See [Settings](/guide/settings) for workspace-level configuration.

**Workspace Enterprise integration** — Admin-managed workspace-scoped connector (DIRECT or FALLBACK mode) with sync runs and Structured Research Import support. Distinct from Composio per-user connections. See [Integrations → Workspace Enterprise](/guide/integrations#workspace-enterprise-integrations).

**`WorkspaceApiApp`** — The model backing API App records, with `appType: Public | Developer`.

---

## Y

**YAML import** — Bulk agent-creation flow in Implementation. Workspace selector → manifest upload → cache eviction + refetch. See [Implementation → YAML importer](/guide/implementation#create-agents-from-yaml-files-implementation-add-agents-via-yaml).

---

## Z

**Zod** — JavaScript schema-validation library. Used in the OutputSpec extractor (`emit_structured_output_with_evidence`) for structured-output validation and in Object Type definitions.

---

## Where to go next

- [Quick Reference](/guide/quick-reference) — task-oriented cheat sheet
- [Common Recipes](/guide/recipes) — end-to-end research workflows
- [Platform Architecture](/guide/architecture) — how the four repos fit together
- [What's New](/guide/whats-new) — recent additions and coming-soon items
- [About This Documentation](/guide/automation-and-qa) — how this site stays current
