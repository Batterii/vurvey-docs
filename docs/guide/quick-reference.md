---
title: Quick Reference
---

# Quick Reference

A practical cheat sheet for getting things done in Vurvey. Bookmark this page for fast answers to "where do I find that?" and "how do I do this?"

If you can't find something here, check the **left sidebar** — there's a dedicated guide for every product area.

---

## Two apps, one platform

| App | URL | Who uses it | Login providers |
|---|---|---|---|
| **Manager** | `app.vurvey.dev`, `*.vurvey.dev` | Researchers, admins, Vurvey staff | Google + Email (+SSO via redirect) |
| **Responder** | Survey deep links | Survey-takers, community members | Google + Microsoft + Apple + Email + SSO (5 providers) |

This guide focuses on the Manager. The Responder is documented in [Logging In → Responder login](/guide/login#vurvey-responder-login-survey-takers).

---

## Navigation

| Item | Where it lives | Notes / gating |
|---|---|---|
| **Home** | Left sidebar | AI chat workspace. _Requires `chatbotEnabled`._ |
| **Agents** | Left sidebar | Manage AI personas. _Requires `chatbotEnabled`._ |
| **People** | Left sidebar | Audience populations, segments, lists, properties. |
| **Campaigns** | Left sidebar | Research surveys + Magic Reels + Topic Graph Insights. |
| **Datasets** | Left sidebar | Knowledge base files. _Requires `chatbotEnabled`._ |
| **Forecast** | Left sidebar | _Requires `forecast_enabled`. UI prototype on demo data — see [Forecast](/guide/forecast)._ |
| **Workflow** _(Beta)_ | Left sidebar | Multi-step automation. |
| **Capabilities** | Left sidebar | Reusable AI systems. _Requires `autonomousCapabilitiesEnabled` + `chatbotEnabled` together._ |
| **Branding** | Left sidebar | Brand profile, brand-feedback reviews, brand questions. |
| **Brand Companions** | Left sidebar (admin) | Public Brand Companion agents + their metrics. |
| **Mentions** | Left sidebar (admin) | Brand-directed feedback + Magic Topics (coming soon). |
| **Reels** | Campaigns → Magic Reels | Highlight-video editor. |
| **Personal Profile** | Avatar → Personal Profile | Per-user identity, dark mode, integrations, ToS. |
| **Settings** | Workspace dropdown | Workspace identity, AI models, integrations, brand templates, **Developer API Apps**, session timeout. |
| **Implementation** _(staff)_ | Workspace dropdown | Taxonomy, system prompts, YAML imports, agent personalities, Molds. |
| **Super Admin (Enterprise)** _(staff)_ | Workspace dropdown | Cross-workspace administration. |
| **Members** | Workspace dropdown → Members (not in Settings sub-nav) | Member admin, role changes, ownership transfer. |

---

## Common tasks at a glance

### Getting answers fast

| Task | Where | Steps |
|---|---|---|
| Ask the AI a quick question | Home | Type your question, press Enter |
| Chat with a specific agent | Home | Click Agents chip, select agent |
| Use `@mention` to route a message | Home | Type `@` + agent name; pick from the popup; Enter to insert |
| Analyze your own data | Home | Click Sources, attach Campaigns/Datasets, ask |
| Search the web | Home | Click Tools → Web Research |
| Generate images | Home | Click Images, pick model, describe |
| Get a forecast (demo) | Forecast | Select Item / Geography → Apply & Regenerate |
| Use the Topic Graph from chat | Home | Agents with the `exploreTopicGraph` capability auto-use it; or open Campaigns → Insights tab manually |

### Creating and managing content

| Task | Where | Notes |
|---|---|---|
| Create an agent | Agents | **+ Create Agent** flow |
| Upload files for AI analysis | Datasets | Open a dataset → Add Files (supports SharePoint import if `sharepointEnabled`) |
| Launch a survey | Campaigns | Create Campaign → fill steps → Launch |
| Build a Reel | Campaigns → Magic Reels | **+ Add Reel**, then **+ Add Video** in the editor |
| Connect a Composio tool | Personal Profile → Integrations | Browse, click Connect, pick OAuth/API Key/Bearer Token |
| Build an audience | People → Populations | Manage Brand and Vurvey populations |
| Set up automation | Workflow | Create new workflow → design pipeline |
| Deploy a Capability | Capabilities | **+ New** or Browse Blueprints |
| Update brand profile | Branding | Identity + colors + Theme Creator (staff) |
| Review brand feedback | Branding → Reviews OR Mentions → All mentions | Same component, same data |
| Configure Tremendous rewards | Rewards (or Settings → Tremendous card) | First-time setup goes through Rewards page |
| Manage API credentials | Settings → Developer API Apps (`/settings/api-apps`) | Public for embeds, Developer for backend |
| Update profile | Personal Profile | Image, info, dark mode, delete account |
| Implementation work | Workspace dropdown → Implementation | Staff only (Enterprise Manager / Implementation roles) |

::: warning Route correction
The Developer API Apps page is at **`/settings/api-apps`**, NOT a top-level `/api-apps` route or a sub-route of `/brand-companions`. Earlier docs misstated this. See [Settings → Developer API Apps](/guide/settings#developer-api-apps-settings-api-apps).
:::

### Sharing and collaboration

| Task | Where | How |
|---|---|---|
| Share an agent / campaign / dataset / workflow | Resource's three-dot menu | Generic Share dialog with **General Access** (Restricted/Wide) + per-person Viewer/Editor |
| Share a reel | Reel editor → Share | Dedicated share-link side panel (NOT the generic dialog) — light/dark mode, optional password |
| Invite a team member | Workspace dropdown → Members | Add Users → Invite Members modal |
| Set permissions | Any share dialog | Viewer (read), Editor (read+write); General Access for workspace-wide |
| Change session timeout | Settings → Session Timeout | Force logout policy, per-workspace |

::: tip Reels are the one resource that doesn't use the generic Share dialog
Reels use a purpose-built **Share Link side panel** with light/dark display mode, optional password protection, and a public `/share/:reelId` URL. The generic Permissions modal (Viewer/Editor) doesn't apply. See [Reels → Sharing](/guide/reels#sharing-the-share-link-side-panel).
:::

### Finding things

| Task | Where |
|---|---|
| Search agents / campaigns / datasets / reels | Search field at the top of each list |
| View past conversations | Home → Conversations panel → View all |
| Browse capability blueprints | Capabilities → Blueprints |
| Find brand feedback responses | Branding → Reviews OR Mentions → All mentions |
| Find an Integration connection | Personal Profile → Integrations |
| Find a workflow's runs | Workflow → individual workflow → Runs tab |
| Find a Reel's share link | Reel editor → Share button (after first publish) |
| Find a SharePoint connection | Settings → General Settings → SharePoint card |

### Exporting data

| Task | Where | Format |
|---|---|---|
| Export campaign responses | Campaign results page | CSV, PDF |
| Download video responses | Campaign results → individual response | MP4 |
| Export transcripts | Campaign results → individual response | Text |
| Copy chat response | Home → response menu | Clipboard text |
| Export chat conversation | Home → conversation menu | Markdown / PDF / DOCX |
| Download a published Reel | Reel editor → ⋮ → Download | MP4 |

---

## Chat toolbar (Home / Canvas)

| Button | Icon | What it does |
|---|---|---|
| **Agents** | People | Pick which Agent answers |
| **Populations** | (conditional) | Pick a population persona (when feature-flag on) |
| **Sources** | Folder | Attach Datasets / Campaigns / Files / Videos / Audios |
| **Images** | Picture | Image-generation model picker + on/off toggle |
| **Tools** | Sliders | Web Research / TikTok / Reddit / LinkedIn / YouTube / X / Instagram |
| **Model** | (conditional) | Override the agent's default LLM (feature-flag gated) |

**Image models**: Nano Banana, OpenAI, Google Imagen, Stable Diffusion (workspace-provisioned).

**Slash composer (`/`)** opens a contextual tool/image quick-pick.

---

## Image Studio (`/{workspaceId}/image-studio`)

| Action | What it does |
|---|---|
| **Select** (➕ pencil) | Paint a mask area to change |
| **Un-select** (➖ pencil) | Remove paint from selection |
| **Reset selection** | Clear all masking |
| **Enhance** | AI improves details / textures (no prompt) |
| **Upscale** | AI bumps resolution (no prompt) |
| **Remove** | Erase masked area (no prompt) |
| **Convert to Video** | **Google Veo 3.1** — 4/6/8s, 16:9 or 9:16, 1–4 samples |
| **Send (prompt)** | Apply text prompt to masked area |
| **Alt + R** | Reset to Original (keyboard shortcut, when applicable) |
| **Brush size slider** | 16–160 px range |

---

## @mentions in chat

| Behavior | Detail |
|---|---|
| Trigger | Type `@` |
| Filter | **Prefix-match** (case-insensitive). `@Da` finds "Data Analyst" but `@Analyst` does not. |
| Navigation | ↑/↓ keys, Enter to insert, Click also inserts |
| Multi-word names | Fully supported via the multi-word remark plugin |
| Hover the chip | Shows the AgentCard popup |
| Email/URL safety | The word-boundary regex prevents `support@vurvey.com` triggering a mention |

---

## Topic Graph (Insights tab on campaigns)

| Action | Detail |
|---|---|
| Open | Campaigns → individual campaign → **Insights** tab |
| Workspace gate | `topicGraphEnabled` in Settings → General Settings |
| Min Confidence slider | Default 0.6, range 0.50–0.95 |
| Search | Highlight matches, dim rest |
| Click theme | Zoom into cluster |
| Click entity | Open Entity Detail Drawer (quotes, sources, aliases) |
| Synthetic `type:` themes | UI fallback when Louvain has nothing to cluster |
| Agent-side access | **`exploreTopicGraph`** chat tool with 5 ops (summary, theme_details, entity_search, neighborhood, path) |

---

## Agent Types

| Type | Best for |
|---|---|
| **Assistant** | General-purpose Q&A and research tasks |
| **Consumer Persona** _(or **Advocate**)_ | Simulated consumer perspectives |
| **Product** _(or **Brand Companion**)_ | Product-specific expertise + public embeds |
| **Visual Generator** | Image generation / creative content |

The `enablenewagentnames` flag aliases Consumer Persona → **Advocate** and Product → **Brand Companion**. Assistant and Visual Generator are unchanged.

---

## AI Models (Catalog)

| Model | Speed | Best for |
|---|---|---|
| **Gemini Flash** | Fastest | Everyday tasks, quick analysis, general Q&A |
| **Gemini Pro** | Medium | Deep reasoning, image/video analysis |
| **Claude (4.x family)** | Medium | Staying in character, nuanced instructions, natural writing |
| **GPT-4o** | Medium | Broad general knowledge, creative tasks |

Model availability depends on workspace provisioning. Browse the catalog at **Settings → AI Models** — empty state is legitimate for workspaces using legacy defaults.

---

## People section tabs

| Tab | What it contains |
|---|---|
| **Populations** | Brand + Vurvey audience populations |
| **Simulations** | Concept simulation setup + results (when enabled) |
| **Humans** | Individual contact records |
| **Lists & Segments** | Reusable static lists + dynamic segments |
| **Properties** | Custom attributes for contacts |

::: info Molds moved
Molds are no longer a People tab — they live under **Implementation → Molds** when `moldBuilder` is on. Legacy `/people/molds/*` URLs redirect to `/implementation/molds/*`.
:::

---

## Question Types

| Type | Respondent action | Best for |
|---|---|---|
| **Video Recording** | Record 15s–5min video | Rich qualitative, emotion |
| **Video Upload** | Upload pre-recorded | Demos, at-home usage |
| **Picture Upload** | Upload images | Packaging, displays, receipts |
| **PDF Upload** | Upload documents | Supporting docs |
| **Choice** | Pick one | Demographics, single selection |
| **Multiple Choice** | Pick many | Multi-factor, interests |
| **Ranked** | Drag to order | Priority, preference |
| **Short Text** | Brief text | Quick reactions |
| **Long Text** | Detailed text | Opinions, explanations |
| **Number** | Numeric value | Quantities, frequencies |
| **Star Rating** | Star scale | Satisfaction strength |
| **Slider** | Range value | NPS, likelihood |
| **Barcode** | Scan code | Product ID, usage tracking |

---

## Statuses across the platform

### Campaign

| Status | Meaning |
|---|---|
| **Draft** | Not live; edit freely |
| **Open** | Collecting responses |
| **Closed** | Done collecting |
| **Blocked** | Temporarily paused |
| **Archived** | Inactive but preserved |

### Dataset file

| Status | Meaning |
|---|---|
| **Uploaded** | Received, awaiting processing |
| **Processing** | AI analyzing |
| **Success** | Ready to use |
| **Failed** | Click retry |

### Workflow run

| Status | Meaning |
|---|---|
| **Pending** | Queued |
| **Running** | Executing |
| **Paused** | Manually paused |
| **Completed** | Finished successfully |
| **Failed** | Check Run tab for details |
| **Cancelled** | Manually stopped |

### Capability

| Status | Meaning |
|---|---|
| **DRAFT** | Being configured (cards sort last on Home) |
| **ACTIVE** | Running on schedule |
| **PAUSED** | Schedule suspended |
| **ARCHIVED** | Preserved, hidden from default view |

### Reel

| Status | Meaning |
|---|---|
| **Draft** | Never published |
| **Processing** | Render in flight |
| **Published** | Public share + Download available |
| **Unpublished Changes** | Published but edited again — re-publish to update |
| **Failed** | Render failed — retry Save & Publish |

---

## File format support

### Documents
PDF, DOCX, TXT, MD, CSV, JSON

### Presentations / spreadsheets
PPTX, XLSX

### Video and audio
MP4, MOV, MP3, WAV (Reels upload supports MP4, MOV, MPEG4, AVI)

### Images
PNG, JPG, GIF, WEBP

### Size limits

| Category | Max |
|---|---|
| Documents | 50 MB |
| Images | 10 MB |
| Audio | 25 MB |
| Video | 100 MB |

---

## Permission Levels

The Share dialog exposes 2 levels per user, but server-side has 5 underlying primitives. See [Permissions & Sharing](/guide/permissions-and-sharing).

| Surfaced level | Maps to (internal) | Meaning |
|---|---|---|
| **Viewer** | `can_view` | Read-only access |
| **Editor** | `can_edit` (+ `can_view`) | Read + write |
| _(no UI exposure)_ | `can_delete` | Delete the resource (usually owner) |
| _(no UI exposure)_ | `can_manage` | Manage sharing (usually owner) |
| _(no UI exposure)_ | `can_manage_schedules` | Workflow-specific |

### Workspace roles (`UserRole`)

| Role | Notes |
|---|---|
| `REGULAR_USER` | Customer users (Owner/Admin/Member ACL is on top of this) |
| `ENTERPRISE_MANAGER` | Vurvey Labs enterprise staff |
| `SUPPORT` | Vurvey Labs support staff |
| `IMPLEMENTATION` | Vurvey Labs implementation engineers |
| `SERVICE_ACCOUNT` | Bot identity for programmatic API access |

::: tip Workspace admin vs Vurvey staff admin
Customer workspace Owner / Admin / Manager / Guest are **per-workspace ACL entries** on `REGULAR_USER` accounts. They are NOT the same as `ENTERPRISE_MANAGER`/`SUPPORT`/`IMPLEMENTATION` GraphQL roles. See [Permissions & Sharing](/guide/permissions-and-sharing#layer-1-workspace-roles).
:::

---

## Currencies (Rewards / Tremendous)

| Code | Name |
|---|---|
| USD | United States Dollars |
| EUR | Euro |
| CAD | Canadian Dollars |
| GBP | British Pounds |

Tremendous applies a ~2.5% fee per payout (NOT shown in the in-app Pay total).

---

## Keyboard shortcuts

| Action | Shortcut |
|---|---|
| Send a message | Enter |
| New line in composer | Shift + Enter |
| New conversation | Click `+` |
| Reset to Original (Image Studio) | Alt + R |
| Open @mention picker (composer) | `@` |
| Open quick-pick (composer) | `/` |

---

## Workspace feature flags (cheat sheet)

Most flags are flipped by Vurvey staff via Super Admin → Manage Workspaces. See [Settings → workspace flags](/guide/settings#workspace-flags-you-may-encounter) for the canonical table.

| Flag | What it gates |
|---|---|
| `chatbotEnabled` | Home / Agents / Datasets nav + Capabilities link (with autonomous flag) |
| `autonomousCapabilitiesEnabled` | `/capabilities/*` routes |
| `capabilityWave3BackendEnabled` | Legacy vs Wave-3 Capabilities backend |
| `forecast_enabled` | Forecast nav |
| `composioEnabled` | Personal Profile → Integrations tab + Composio per-user connections |
| `synthesioEnabled` | Synthesio card in General Settings |
| `sharepointEnabled` | SharePoint card in General Settings |
| `topicGraphEnabled` | Insights tab on campaigns + `exploreTopicGraph` chat tool |
| `customTemplatesEnabled` | Brand Templates tab in Settings |
| `apiManagementEnabled` | Developer API Apps functionality |
| `moldBuilder` | Molds tab in Implementation |
| `agentBuilderV2Active` | Manage Agents 2.0 in Super Admin |
| `enablenewagentnames` | Aliases Consumer Persona → Advocate, Product → Brand Companion |
| `enforcesso` _(build-time)_ | Enforce SSO option |

---

## Common popups, modals, and side panels

| Surface | Where it appears | What it contains |
|---|---|---|
| **Agent selector** | Home / Canvas | Filter chips, search, **Choose agent** commit |
| **Sources modal** | Home / Canvas | Campaigns / Datasets / All files tabs + drill-in pages |
| **@mention popup** | Composer | Prefix-filtered persona list (↑/↓ + Enter) |
| **Upload Files** | Datasets / Home | Drag-drop or pick; followed by Create new dataset |
| **Generate Agent** | Agents | Role brief, personality, facet review, generation progress |
| **Brand Settings** | Branding | Identity, colors (4 user slots + M3 token reserved set), ThemeCreator (staff) |
| **Brand Companion API App** | Brand Companion card → Manage API Key | Public app type, allowed domains, credentials |
| **Send Reward** | Rewards | Amount, currency, **Choose payment source** toggle, Pay (total) |
| **Tremendous Integrate** | Settings or Rewards | API Key step → Default campaign + funding step |
| **Disconnect Tremendous** | Rewards header | Confirmation modal |
| **Reel Add Video** | Reel editor | Upload Video / Search Videos / Media Library |
| **Reel Clip Editor** | Reel editor | Transcript or slider trimming + Save/Cancel |
| **Reel Share Link** | Reel editor → Share | Light/dark mode, optional password, copy URL |
| **Edit Picture** | Anywhere with images | Upload, crop, zoom + Save |
| **Force User Logout** | Settings → Session Timeout | Switch + minutes |
| **Tremendous Reward** | Rewards | Amount + currency + payment-source override + Pay (total) |
| **Confirm Action** | Many places | Generic confirmation for destructive operations |
| **Permissions** (generic) | Agents/Datasets/Campaigns/Workflows | General Access + Add people + Viewer/Editor |
| **Composio Auth chooser** | Integrations | OAuth (Login) / API Key / Bearer Token |
| **SSO Modal** | Super Admin → SSO Providers | Name, domain, active, config |
| **YAML Import** | Implementation → Create agents from YAML | Workspace picker → Upload + Rules modal |
| **Personality / Mold** | Implementation → Agent Personalities / Molds | Create / Edit / Publish / Delete |

---

## Tips for effective AI prompting

### Be specific
_"Tell me about my data"_ → _"What are the top 3 themes from my Q1 packaging survey, with supporting quotes for each?"_

### Request a format
Ask for tables, bullet points, numbered lists, or executive summaries.

### Narrow your sources
Attach one campaign or dataset at a time for focused answers.

### Ask for evidence
Include _"with supporting quotes"_ or _"cite your sources"_ in your prompt.

### Iterate and drill down
_"Tell me more about the second theme"_ or _"Break that down by age group"_.

### Set constraints
_"Only use data from female respondents aged 25–34."_

### Use templates

| Task | Prompt template |
|---|---|
| **Theme extraction** | _"Identify the top [N] themes from [source]. For each theme, provide 2-3 supporting quotes."_ |
| **Executive summary** | _"Write a [length] executive summary of [source] suitable for [audience]."_ |
| **Comparison** | _"Compare [source A] vs [source B]. What are the key differences and similarities?"_ |
| **Sentiment analysis** | _"Analyze the sentiment across all responses in [source]. Break down by positive, negative, and neutral."_ |
| **Recommendation** | _"Based on the findings in [source], provide [N] actionable recommendations for [team/goal]."_ |
| **Trend identification** | _"What trends or patterns emerge when looking at [source] over time?"_ |
| **Topic Graph exploration** | _"Use the topic graph to find what connects [entity A] and [entity B]."_ — for Agents with `exploreTopicGraph` |

---

## Troubleshooting quick fixes

### Chat isn't responding
1. Check internet connection
2. Refresh the page
3. Try a different browser
4. Clear cache and cookies
5. Check ad blockers / extensions

### File upload failed
1. Confirm format is supported
2. Check size limit
3. Retry
4. Split large files
5. Check connection stability

### Campaign won't launch
1. Confirm required fields
2. Verify credit balance
3. Add at least one question
4. Preview to spot issues
5. Look for validation errors

### Dataset stuck on "Processing"
1. Wait — large video files take time (up to 30 min)
2. Refresh for latest status
3. Click retry on Failed files
4. Contact support if stuck longer

### Reel publish failed
1. Confirm every clip is at least 1 second long
2. Retry Save & Publish
3. If persistent, recheck source videos
4. For mass-failure across reels, check service status

### Topic Graph empty
1. Workspace `topicGraphEnabled` is on?
2. Were responses captured BEFORE the feature shipped? (No backfill by default — contact support)
3. Are all responses multiple-choice? (extractor needs free text)
4. Are answers very short (<5 words)?

### `@mention` not recognized
1. Persona must be in the active chat surface
2. Prefix matches, not contains
3. Subtle Unicode differences (smart quotes, en-dashes) prevent matches
4. Multiple personas with overlapping name prefix? Longest match wins

### Agent responses seem off
1. Review prompt + capabilities
2. Check attached datasets
3. Try a different model (Settings → AI Models)
4. Test with simpler questions
5. Inspect the agent's facets / personality bindings

### Can't share with a teammate
1. They have an account in your workspace?
2. You have manage rights on the resource?
3. Search by email or name in the dialog
4. Ask your admin

### Search results seem outdated
1. Web Research returns what's currently online
2. Rephrase the query
3. Include explicit dates: _"in the last 30 days"_

---

## Glossary

| Term | Meaning |
|---|---|
| **Agent** | An AI persona configured with prompts, capabilities, and knowledge |
| **Population** | A group of synthetic or real participants for research |
| **Campaign** | A research survey / study that collects responses |
| **Dataset** | A collection of files the AI can analyze and reference |
| **Workflow** | An automated multi-step AI process |
| **Capability** | A reusable AI system packaging workflows + schedules + outputs |
| **Brand Companion** | A persona flagged as Brand Companion + given a Public API app for embedding |
| **API App** | Workspace API credential. **Public** = Brand Companion embed; **Developer** = backend integration |
| **Credits** | Currency for AI operations |
| **Facets** | Demographic + personality traits defining an agent |
| **Magic Reels** | The Reels feature; "Magic" refers to the auto-assembly path via the Sensemake GCF |
| **Workspace** | Shared environment your team collaborates in (multiple per organization possible) |
| **Mold** | A reusable persona template (`pm_mold` table; same data as Agent Personalities) |
| **Segment** | Dynamic audience group with automatic membership rules |
| **List** | Static, manually managed contact group |
| **Sources** | Campaigns / datasets / files attached to a chat conversation |
| **Citation** | Reference showing which source the AI used (chat) or Evidence pill (dashboard) |
| **Stimulus** | Image / video / AR model shown to respondents alongside a question |
| **OpenFGA** | Auth0's relationship-based authorization engine; the source of truth for per-resource permissions |
| **Tremendous** | Third-party payout platform powering Rewards |
| **Synthesio** | Social-listening platform; integration imports brand mentions into a Dataset |
| **Composio** | Per-user tool-integration layer (Slack, Notion, Gmail, etc.) |
| **Sensemake** | Internal Vurvey API (`sensemake.vurvey.dev`) used for highlight extraction in auto-reels and Topic Graph |
| **Veo 3.1** | Google's video generation model used for Image Studio → Convert to Video |
| **Gemini 3 Flash** | LLM used for per-answer entity extraction in Topic Graph |
| **Topic Graph** | Live interactive map of entities + themes per campaign |
| **Insights tab** | The Topic Graph surface on every campaign |
| **Magic Topics** | A coming-soon analysis tab in Mentions (not the same as Capability's Insights) |
| **Service Account** | Bot identity (`SERVICE_ACCOUNT` UserRole) for programmatic API access |
| **OpenAPI / GraphQL** | The two API surfaces — REST-ish for the Developer API apps, GraphQL internally |
| **Wave 3** | Internal name for the current Capabilities backend revision (`capabilityWave3BackendEnabled`) |

---

## Getting help

- **Ask the AI**: Home chat can answer questions about your data and how features work
- **Browse the docs**: Sidebar has a dedicated guide for each section
- **Shortcuts**: `@` for mentions, `/` for tools, **Shift + Enter** for multi-line, **Alt + R** in Image Studio
- **Contact support**: Reach out to your workspace administrator or Vurvey support team
- **Open an issue**: [github.com/Batterii/vurvey-docs/issues](https://github.com/Batterii/vurvey-docs/issues) for doc typos, broken links, or factual errors

---

**Looking for more detail?** Full guides in the sidebar:

- [Logging In](/guide/login) — Manager + Responder login flows
- [Home](/guide/home) — AI chat surface
- [Agents](/guide/agents) — Creating personas
- [Campaigns](/guide/campaigns) — Research surveys (all question types)
- [Topic Graph (Insights)](/guide/topic-graph) — Live network of campaign entities + the `exploreTopicGraph` chat tool
- [Datasets](/guide/datasets) — Files, SharePoint imports
- [People](/guide/people) — Audiences and segments
- [Workflows](/guide/workflows) — Automation
- [Capabilities](/guide/capabilities) — Reusable AI systems (Wave 3)
- [Branding](/guide/branding) — Brand identity, Material 3 themes (staff)
- [Brand Companions](/guide/brand-companions) — Public Agents + API apps
- [Mentions](/guide/mentions) — Three concepts: workspace area, `@mention` syntax, Synthesio
- [Reels](/guide/reels) — Magic Reels editor + auto-pipeline
- [Forecast](/guide/forecast) — UI prototype on demo data
- [Rewards](/guide/rewards) — Tremendous payouts
- [Canvas & Image Studio](/guide/canvas-and-image-studio) — Editor + Veo 3.1 video gen
- [Settings](/guide/settings) — Workspace identity, API apps, integrations
- [Account & Profile](/guide/account) — Personal settings
- [Integrations](/guide/integrations) — Composio + Workspace Enterprise
- [Sources & Citations](/guide/sources-and-citations) — Attribution model (chat + structured output)
- [Permissions & Sharing](/guide/permissions-and-sharing) — Two-layer model (UserRole + OpenFGA)
- [Super Admin (Enterprise)](/guide/admin) — Cross-workspace administration
- [Implementation](/guide/implementation) — Taxonomy, prompts, YAML, Molds
- [About This Documentation](/guide/automation-and-qa) — How these docs are maintained
