---
title: Welcome to Vurvey
---

# Welcome to Vurvey

Vurvey is the **AI-Powered-by-People™** consumer insights platform. We combine the speed of large-language-model AI with the depth of real human perspectives — collected through video surveys, structured campaigns, and curated datasets — so you can get from a research question to a defensible insight in hours instead of weeks.

This guide is the single source of truth for how every part of Vurvey works. It's automatically regenerated from the product code each night, so docs and product stay in sync. If you find something wrong, file an issue against the `vurvey-docs` repo.

![Vurvey Home — chat with an Agent on the workspace surface](/screenshots/home/01-chat-main.png)

::: tip How to use this guide
- **First time on the platform?** Start with [Logging In](/guide/login), then [Home](/guide/home).
- **Looking for a specific feature?** Use the left sidebar — every area of the product has its own page.
- **Confused by a button or status?** The Constraints, Troubleshooting, and FAQ sections of each guide are the fastest path to an answer.
- **An admin or implementation engineer?** Skip ahead to [Settings](/guide/settings), [Super Admin (Enterprise)](/guide/admin), and [Implementation](/guide/implementation).
:::

---

## What you can do with Vurvey

| Capability | What it means in practice |
|---|---|
| **Talk to AI Agents** about your data, your brand, and your research questions | The [Home](/guide/home) chat surface lets you attach campaign responses, datasets, web tools, and image generation in one conversation. |
| **Run video-based research campaigns** | Build [Campaigns](/guide/campaigns) that collect rich qualitative video responses; let AI summarize and cluster them. |
| **Build structured knowledge bases** | Upload documents, videos, audio, and reports to [Datasets](/guide/datasets) so Agents can ground responses in your facts. |
| **Automate recurring research with multi-step pipelines** | [Workflows](/guide/workflows) chain prompts, tools, and outputs into reusable orchestrations. |
| **Deploy entire research systems as reusable Capabilities** | [Capabilities](/guide/capabilities) package workflows + schedules + dashboards + structured object types into one-click-deploy blueprints. |
| **Reach your audience precisely** | [People](/guide/people) manages segments and audiences for campaign targeting. |
| **Manage brand identity end-to-end** | [Branding](/guide/branding) sets the brand record (logo, colors, M3 themes); [Brand Companions](/guide/brand-companions) publishes them to public-facing embeds. |
| **Capture and process brand mentions** | [Mentions](/guide/mentions) reviews community feedback; the Synthesio integration ingests external social-listening data. |
| **Showcase responses as polished video reels** | [Reels](/guide/reels) turns the best moments into branded share-link videos, with optional Sensemake-powered auto-assembly. |
| **Reward respondents at scale** | [Rewards](/guide/rewards) sends Tremendous-backed payouts (gift cards, ACH, PayPal) tied to campaign completion. |
| **Connect your stack** | [Integrations](/guide/integrations) covers Composio (per-user tool connections) and Workspace Enterprise integrations (admin-managed connectors with sync runs). |

::: info "AI Powered by People" — what it actually means
Most of what Vurvey produces is grounded in **actual respondent voices**. Citations on every chat response trace claims back to specific quotes from real people. Workflow outputs come with Evidence badges showing the source freetext. The platform's job is to make that grounding visible — not to manufacture answers from training data alone. See [Sources & Citations](/guide/sources-and-citations) for the full attribution model.
:::

---

## Finding your way around

Once you log in, you land on **Home** (the AI chat surface). The left sidebar holds primary navigation; the workspace dropdown at the top holds admin and enterprise areas.

| Section | Where it lives | What's it for |
|---|---|---|
| **Home** | Left sidebar | AI chat workspace — your default working surface. _Requires `chatbotEnabled`._ |
| **Agents** | Left sidebar | Browse, create, and configure AI Agents. _Requires `chatbotEnabled`._ |
| **People** | Left sidebar | Manage participants and audience segments. |
| **Campaigns** | Left sidebar | Video surveys and other research campaigns. |
| **Datasets** | Left sidebar | Upload files for AI Agents to analyze. _Requires `chatbotEnabled`._ |
| **Workflow** _(Beta)_ | Left sidebar (when enabled) | Multi-step automation pipelines. |
| **Capabilities** | Left sidebar (when enabled) | Packaged research systems with schedules and outputs. _Requires `autonomousCapabilitiesEnabled` + `chatbotEnabled` together._ |
| **Forecast** | Left sidebar (when enabled) | Forward-looking analytics. _Currently a UI prototype on demo data — see [Forecast](/guide/forecast)._ |
| **Branding** | Left sidebar | Brand profile, feedback questions, brand reviews. |
| **Brand Companions** | Left sidebar (admin only) | Public Brand Companion agents + their API apps + metrics. |
| **Mentions** | Left sidebar (admin only) | Brand-directed community feedback + Magic Topics. |
| **Reels** | Inside Campaigns → Magic Reels | Build highlight videos from responses. |
| **Account & Profile** | Avatar → Personal Profile | Per-user identity, dark mode, Composio integrations, ToS. |
| **Settings** | Workspace dropdown | Workspace-level configuration: session timeout, AI models, integrations, brand templates, API apps. |
| **Implementation** _(staff)_ | Workspace dropdown | Enterprise editorial: taxonomy, system prompts, agent personalities, Molds. |
| **Super Admin (Enterprise)** _(staff)_ | Workspace dropdown | Cross-workspace administration: brands, templates, workspaces, employees, SSO, credit rates. |

::: tip Workspace switcher
The bottom of the left sidebar shows your current workspace and lets you switch to another workspace you belong to. Each workspace is a fully separate environment — its own agents, campaigns, datasets, people, and members. Settings changes affect only the active workspace.
:::

---

## Two web apps, one platform

Vurvey ships as **two separate web applications** that share Firebase Auth but have different surfaces:

| App | Who uses it | Where it lives | Code |
|---|---|---|---|
| **Vurvey Manager** | Researchers, admins, Vurvey staff | Workspace URLs (`app.vurvey.dev`, `staging.vurvey.dev`, `*.vurvey.dev`) | `vurvey-web-manager` |
| **Vurvey Responder** | Survey-takers, community respondents | Survey deep links | `vurvey-web-responder` |

Most of this guide focuses on the Manager app — that's where research work happens. The Responder app is documented in [Logging In](/guide/login#vurvey-responder-login-survey-takers), which is also where you'll see notes about responder-specific concerns (5-provider login, survey context preservation, mobile-first design).

---

## Key concepts (quick reference)

### Agents

![Agents Gallery](/screenshots/agents/01-agents-gallery.png)

AI personas with their own instructions, capabilities, datasets, and personality. An Agent might be _"Beauty Trends Analyst for Gen Z"_ or _"Sustainable Packaging Expert"_. → [Agents](/guide/agents)

### People

![People Management](/screenshots/people/01-people-main.png)

Your research participants, organized into lists and segments. Audiences feed campaign targeting. → [People](/guide/people)

### Campaigns

![Campaigns Gallery](/screenshots/campaigns/01-campaigns-gallery.png)

Structured research projects — video surveys, text surveys, or hybrids. Where real consumer responses come in. → [Campaigns](/guide/campaigns)

### Datasets

![Datasets View](/screenshots/datasets/01-datasets-main.png)

Knowledge bases of documents, videos, audio, and reports. Attach to Agents so they can answer questions from your facts. → [Datasets](/guide/datasets)

### Workflows _(Beta)_

![Workflows View](/screenshots/workflows/01-workflows-main.png)

Multi-step automation pipelines that combine prompts, tools, and structured outputs into reusable orchestrations. → [Workflows](/guide/workflows)

### Capabilities

Packaged research systems — workflows + schedules + dashboards + object types — deployed from blueprints or built from scratch. → [Capabilities](/guide/capabilities)

### Topic Graph (Insights)

![Topic Graph view](/screenshots/topic-graph/01-graph.png?optional=1)

Live, interactive map of ideas in a campaign — entities, concepts, feelings, and relationships visualized as a graph. The Insights tab on every campaign when the workspace toggle is on. → [Topic Graph](/guide/topic-graph)

### Branding & Brand Companions

Brand identity (logo, colors, M3 themes, feedback questions) plus the public-embed surface (Brand Companions) that publishes Agents to your customer-facing site. → [Branding](/guide/branding), [Brand Companions](/guide/brand-companions)

### Mentions

The community-feedback review queue (admin-only) plus the Synthesio social-listening integration plus the `@mention` chat syntax for routing messages to specific Agents. Three distinct concepts under one name. → [Mentions](/guide/mentions)

### Rewards

Tremendous-backed payouts for campaign respondents. Three send paths (single, multi-select, select-all-by-filter), four supported currencies, and a 2.5% Tremendous fee. → [Rewards](/guide/rewards)

### Reels

Editable highlight videos built from campaign responses. The "Magic" in Magic Reels is the auto-assembly pipeline powered by the Sensemake API. → [Reels](/guide/reels)

---

## Getting started — by role

### I'm a researcher / analyst
1. [Log in](/guide/login) (Manager app)
2. [Explore Home](/guide/home) — try a question with no sources attached, then attach a Dataset and see the difference
3. [Browse Agents](/guide/agents) — see what your team has built
4. [Upload a Dataset](/guide/datasets) — even a single PDF; experience how grounding changes responses
5. [Create or open a Campaign](/guide/campaigns) — see how respondent data flows into Agents and Reels

### I'm a brand or marketing manager
1. [Set up your Brand](/guide/branding) — name, logo, colors
2. [Configure brand feedback questions](/guide/branding#questions-branding-questions) — the survey behind All Mentions
3. [Review community-directed feedback](/guide/mentions) — process reviews into [Reels](/guide/reels)
4. [Deploy a Brand Companion](/guide/brand-companions) when you're ready to ship one to your site

### I'm a workspace admin
1. [Settings](/guide/settings) — name, avatar, session timeout, Topic Graph toggle, AI models
2. Invite members and manage roles in [Settings → Manage Users](/guide/settings#where-manage-users-lives-not-here)
3. Configure [Rewards (Tremendous)](/guide/rewards) if you're paying respondents
4. Connect [Integrations](/guide/integrations) (Composio, Synthesio, SharePoint) as needed
5. Set up [SSO](/guide/admin#sso-providers-admin-sso-providers) for your domain

### I'm an enterprise / implementation engineer
1. [Implementation](/guide/implementation) — taxonomy, system prompts, YAML agent imports, agent personalities (Molds)
2. [Super Admin (Enterprise)](/guide/admin) — cross-workspace administration, employees, credit rates
3. [Permissions & Sharing](/guide/permissions-and-sharing) — understand the two-layer auth model
4. [Capabilities](/guide/capabilities) — design blueprints that customers can deploy

### I'm building an integration or API app
1. [Brand Companions → API App types](/guide/brand-companions#api-app-types-public-vs-developer) — Public vs Developer app types
2. [Settings → Developer API Apps](/guide/settings#developer-api-apps-settings-api-apps) — workspace-scoped API management
3. [Permissions → Service Accounts](/guide/permissions-and-sharing#layer-1-workspace-roles) — bot identities for programmatic access
4. [Integrations → Workspace Enterprise](/guide/integrations#workspace-enterprise-integrations) — custom connector architecture

---

## Example: Testing a New Product Concept

A realistic flow for a brand manager exploring consumer reactions to a new skincare line:

1. **Upload the concept brief** to a Dataset.
2. **Chat with a Beauty-trends Agent** on the Home page, attaching the brief, asking it to identify potential consumer concerns based on your category.
3. **Create a Campaign** with video survey questions (4–6 questions, mixing closed and open-ended) to gather real consumer reactions.
4. **Reach respondents** via [People](/guide/people) segments matching your target.
5. **Review responses** on the campaign's Insights tab ([Topic Graph](/guide/topic-graph)) and ask your Agent to summarize key themes.
6. **Turn the strongest responses into Reels** for stakeholder share-outs.
7. **Build a Workflow** to automatically generate weekly insight summaries as new responses come in.
8. **Promote the Workflow to a Capability** when this process should become a reusable system for the entire team.
9. **Reward your respondents** via [Rewards](/guide/rewards) → Tremendous payouts.

---

## Feature flags glossary

Vurvey ships many features behind workspace-level feature flags. Flags are flipped by Vurvey staff via [Super Admin → Manage Workspaces](/guide/admin#manage-workspaces-admin-workspaces) — there is no customer-facing toggle for most of them. If you're missing a feature you expect to have, check the flag with your CSM first.

| Flag | What it gates |
|---|---|
| `chatbotEnabled` | Home, Agents, Datasets nav entries (and Capabilities sub-condition) |
| `autonomousCapabilitiesEnabled` | The `/capabilities/*` route tree (combines with `chatbotEnabled` for the nav link) |
| `capabilityWave3BackendEnabled` | Wave-3 vs legacy Capabilities backend / UI |
| `forecast_enabled` | The Forecast nav entry and route |
| `composioEnabled` | Account & Profile → Integrations tab + Composio per-user connections |
| `synthesioEnabled` | Synthesio card in Settings → General Settings |
| `sharepointEnabled` | SharePoint card in Settings → General Settings |
| `topicGraphEnabled` | The Insights tab on every campaign (toggleable in Settings) |
| `customTemplatesEnabled` | Brand Templates tab in Settings |
| `apiManagementEnabled` | Whether the Developer API Apps page is functional (route is always mounted) |
| `moldBuilder` | Molds tab in Implementation |
| `agentBuilderV2Active` | Manage Agents 2.0 in Super Admin |
| `customTemplatesEnabled` | Brand Templates tab in Settings |
| `enforcesso` _(build-time)_ | Enforce SSO option in General Settings (gated AND by Owner/Admin role) |

When in doubt about any flag, ask your CSM to check what's enabled. See also each feature guide for its specific flag-enabling instructions.

---

## Getting help

- **Ask your AI Agent** — the chat interface is a great first stop for questions about your own data
- **Browse the sidebar** — every product area has a dedicated guide
- **[Quick Reference](/guide/quick-reference)** — cheat sheet for common tasks
- **[Permissions & Sharing](/guide/permissions-and-sharing)** — when "I can't see X" turns out to be a permission issue
- **Workspace admin / CSM** — for account, billing, or feature-flag questions
- **Open a [GitHub issue](https://github.com/Batterii/vurvey-docs/issues)** against this docs repo — typo, broken link, or factual inaccuracy

---

## Next steps

Ready to dive in?

1. [Log in to your account](/guide/login)
2. [Explore the Home chat interface](/guide/home)
3. [Create your first Agent](/guide/agents)
4. [Upload data to Datasets](/guide/datasets)
5. [Explore Capabilities](/guide/capabilities) — once you have a few Agents and Datasets to wire together
6. [Quick Reference](/guide/quick-reference) — cheat sheet of common tasks across the platform

---

## Site conventions

This documentation site has a few conventions worth knowing:

- **Bold paths** like `/settings/api-apps` are URL routes — type them after your workspace URL to deep-link.
- **`code-style names`** are internal identifiers (feature flag names, GraphQL types, table columns). They're useful when troubleshooting with support.
- **Linked feature names** like [Mentions](/guide/mentions) jump to the relevant guide.
- **`?optional=1`** in screenshot paths means a screenshot hasn't been captured yet — the doc is current to code, just missing an image. They will fill in over time as the automated screenshot pipeline catches up.
- **The "★ Insight" callouts in PRs** are commentary from the docs-generation system explaining notable findings. Not user-facing — they show up in commit messages, not the rendered site.
