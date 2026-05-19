---
title: Common Recipes
---

# Common Recipes

Step-by-step end-to-end research workflows that combine multiple Vurvey features. If feature guides answer _"how does X work?"_, this page answers _"how do I do {real-world task} from start to finish?"_

Each recipe lists the prerequisites, the step-by-step flow with cross-links to detailed guides, and notes on common pitfalls.

::: tip This page exists to chain features together
Individual feature guides cover their surface in depth. This page shows how to chain them into actual research outcomes. If a recipe says "now click Add Reel" — the deeper detail lives in [Reels](/guide/reels) and the matrix of cross-references at the bottom of every page.
:::

---

## Recipe 1 — Test a new product concept from scratch

**Goal:** You have a new product concept brief and want consumer reactions to it within a week.

**Prerequisites:**
- A workspace with at least one Agent created
- A brand record connected ([Branding](/guide/branding))
- An audience or known target consumer group ([People](/guide/people))

### Steps

1. **Upload the concept brief.** Open [Datasets](/guide/datasets), create a new dataset called something like _"Q1 Concept Brief"_, and upload the brief PDF.

2. **Have an Agent pressure-test the brief.** Open [Home](/guide/home), click **Sources**, attach the Q1 Concept Brief dataset, and ask an Agent: _"Read this concept brief. Identify the 5 strongest consumer concerns you'd expect, with specific quotes from the brief that suggest each concern. Be skeptical."_

3. **Create the campaign.** Open [Campaigns](/guide/campaigns), click **Create Campaign**, structure it around 4–6 questions:
   - 1 short-text screener (to filter for relevant respondents)
   - 2–3 video questions (record an emotional first reaction; explain what would make this product appealing)
   - 1 ranked question (top features in order of importance)
   - 1 long-text question (what would prevent you from buying this)

4. **Set the incentive.** Configure `incentiveAmount` and `incentiveCurrency` on the campaign — this pre-fills the [Rewards](/guide/rewards#send-reward-modal) modal later.

5. **Target the audience.** On the Audience tab, attach an existing Population or import a List of qualified contacts ([People → Lists & Segments](/guide/people)).

6. **Launch.**

7. **Watch the Insights tab fill in.** Open the campaign's **Insights** tab — see [Topic Graph](/guide/topic-graph). As responses arrive, entities and themes appear in the network view. Filter by **Min confidence** = 0.7 once you have ~30 responses.

8. **Process feedback into Reels.** Open [Branding → Reviews](/guide/branding#reviews-branding-reviews) or [Mentions → All Mentions](/guide/mentions#1-2-all-mentions-tab) — both show the same brand-feedback dataset. Click into the strongest responses → **Create Reel** to build a stakeholder share-out video. See [Reels](/guide/reels).

9. **Reward respondents.** Open [Rewards](/guide/rewards). Filter by your campaign, optionally check **Completes Only**, then bulk-select and click **Send Rewards (N)** — Tremendous handles the payout.

10. **Ask an Agent for a synthesis.** Back at [Home](/guide/home), attach the campaign as a source and ask: _"Summarize the top 3 themes from this campaign with supporting quotes. Then rank the concerns from highest to lowest priority for our product team."_

**Common pitfalls:**
- ❌ Don't attach the concept brief AND the campaign at the same time on the first analytical question — narrower sources produce sharper answers. See [Sources & Citations → Best practices](/guide/sources-and-citations#best-practices).
- ❌ Don't launch without testing in Preview mode first ([Campaigns → Launching](/guide/campaigns#launching-campaigns)).

---

## Recipe 2 — Build a Brand Companion and publish it to your site

**Goal:** Embed an AI-powered brand companion on your customer-facing website that can answer product questions in your brand voice.

**Prerequisites:**
- Admin access (the `/brand-companions` area is admin-gated)
- A working domain you control where the companion will live
- Your brand record set up in [Branding](/guide/branding)

### Steps

1. **Build the Agent.** Open [Agents](/guide/agents), click **+ Create Agent**, give it a clear name and a tight system prompt focused on your product domain. Bind 1–3 dataset(s) covering your product docs, FAQ, and brand voice.

2. **Toggle the Brand Companion flag.** In the Agent's settings, flip **Brand Companion = on**. Optionally also flip **Enable conversation metrics = on** so nightly rollups populate ([Brand Companions → How a persona becomes a Brand Companion](/guide/brand-companions#how-a-persona-becomes-a-brand-companion)).

3. **Open the Brand Companions area.** Navigate to **Brand Companions** in the left nav. Confirm your persona appears in the grid.

4. **Create the API App.** On the Agent's card, click **Manage API Key** → **Enable API App**. Toast confirms _"API app created"_.

5. **Add allowed domains.** In the same modal, click **Edit** on the domains section. Add the exact origins your embed will live on (e.g. `https://www.yourbrand.com`, `https://staging.yourbrand.com`). Click **Done**. See [Brand Companions → Manage API App modal](/guide/brand-companions#manage-api-app-modal).

6. **Generate the theme (Vurvey staff only).** If staff is helping you, they can use the [Material 3 Theme Creator](/guide/branding#brand-companion-themes-vurvey-staff-only) under Branding to dial in light + dark mode color tokens.

7. **Hand off the Client ID.** Copy the Client ID (`consumerKey`) from the modal and pass it to your front-end engineer along with the embed snippet.

8. **Verify the embed loads on production.** If you see a 403, double-check the allowlist — the most common cause is an origin mismatch.

9. **Open the Metrics tab.** After 24 hours, the first nightly rollup populates the [Brand Companion Metrics page](/guide/brand-companions#brand-companion-metrics-page). Watch the `ConversationCompletionRateBetaV1` chart over the next few days.

10. **Iterate on the Agent.** As you see real customer questions, refine the Agent's prompt and add more datasets. The embed updates automatically — no re-deploy.

**Common pitfalls:**
- ❌ Forgetting to add staging origins in Step 5 — your QA flow will silently 403.
- ❌ Subdomain wildcards (`*.yourbrand.com`) are not supported. List each origin explicitly.
- ❌ Don't `Regenerate Client Secret` on a Public-type app once you're live — it breaks every embed at once. See [Brand Companions → Constraints](/guide/brand-companions#constraints-limitations).

---

## Recipe 3 — Automate a weekly research summary as a Capability

**Goal:** Generate a stakeholder-ready summary of the past week's research activity every Monday morning, automatically.

**Prerequisites:**
- `chatbotEnabled` + `autonomousCapabilitiesEnabled` on the workspace
- At least one active Campaign collecting responses ongoing
- A clear sense of what you want the summary to contain

### Steps

1. **Sketch the workflow on paper.** Decide what inputs the summary needs (which campaigns? which time window?) and what output format you want (Markdown? PDF? Dashboard?).

2. **Browse Blueprints.** Open [Capabilities → Browse Blueprints](/guide/capabilities#blueprint-library-capabilities-blueprints-wave-3). Look for a "Weekly Research Summary" or similar pattern. If one exists, use it as your starting point.

3. **Build from scratch if no blueprint fits.** Create the capability's component workflows in [Workflows](/guide/workflows):
   - Workflow 1 (head): _"Fetch responses from {campaign} within the last 7 days, extract themes."_ Scheduled `Weekly Monday 9am`.
   - Workflow 2 (downstream): _"Summarize themes into a stakeholder-ready Markdown report."_

4. **Define the output schema.** Open [Capabilities → Object Types](/guide/capabilities#object-types-capabilities-object-types). Create a `WeeklyResearchSummary` type with fields like `executive_summary`, `top_themes[]`, `next_steps[]`. Save.

5. **Wire the schema into the workflow.** Bind your downstream workflow's output to the schema you just created. Now its outputs become typed `Insight` / `Concept` / `WeeklyResearchSummary` objects.

6. **Activate the capability.** Capability page → **Activate**. The activator validates everything (input bindings, schedule, schema) and flips status to `ACTIVE`.

7. **Wait for the next Monday 9am.** The head workflow runs. Workflow 2 fires when Workflow 1 completes. The output appears in the [Capability Dashboard tab](/guide/capabilities#capability-detail-page-capabilities-slug) and in the [Insights Library](/guide/capabilities#object-libraries-wave-3-capabilities-insights-concepts-evaluations).

8. **Share the dashboard.** Use the standard share dialog ([Permissions & Sharing](/guide/permissions-and-sharing)) to give stakeholders Viewer access.

**Common pitfalls:**
- ❌ Don't schedule the downstream workflow independently — it'll never fire. Only the head workflow has a schedule; downstream phases trigger on upstream completion. See [Capabilities → Schedule editor](/guide/capabilities#schedule-editor).
- ❌ Don't skip the Object Type — without one, your output is unstructured text and downstream consumers can't act on it.
- ❌ Test the workflow steps individually before activating the Capability. Use **Run now** on each in [Workflows](/guide/workflows) first.

---

## Recipe 4 — Pull external mentions into a Dataset for Agent analysis

**Goal:** Bring in Synthesio social-listening data so an Agent can answer questions about "what people are saying about our brand on Reddit / news / forums".

**Prerequisites:**
- Admin access (`sharepointSettings` permission isn't enough — Synthesio is admin-only)
- `synthesioEnabled` workspace flag (request via CSM)
- A Synthesio account with an API key and reporting unit

### Steps

1. **Get the workspace flag flipped.** Ask your CSM to enable `synthesioEnabled` on the workspace. Once on, you'll see the **Synthesio** card on the **Settings → General Settings** page.

2. **Connect Synthesio.** Open the Synthesio card on Settings → click **Configure**. Provide:
   - Synthesio **API key**
   - Synthesio **Reporting Unit ID** (which brand index to pull from)

3. **Run the first import.** Click **Start Import**. The first run is a full backfill (potentially hours for large brands). Watch the Import History table.

4. **Verify the dataset exists.** Open [Datasets](/guide/datasets). You'll see a new auto-created dataset: **"Synthesio Mentions"**. Each row is a `SynthesioMention` document with structured metadata (URL, channel, sentiment, author, date, language, country).

5. **Bind to an Agent.** Create or edit a "Brand Listening" Agent in [Agents](/guide/agents). In the dataset section, attach the Synthesio Mentions dataset.

6. **Ask the Agent questions.** In [Home](/guide/home) chat, with that Agent active and the Synthesio dataset implicitly bound, ask:
   - _"What was the dominant sentiment in our brand mentions last month?"_
   - _"Find the 5 highest-engagement Reddit threads mentioning us in the last 7 days."_
   - _"Which channel (news / Reddit / Twitter) shows the most negative sentiment?"_

7. **Cross-reference with internal campaigns.** Open [Home](/guide/home), attach both the Synthesio dataset AND a recent Campaign: _"Compare what real respondents told us in our Q1 campaign to what people are saying organically on Reddit. Where do they agree? Where do they diverge?"_

**Common pitfalls:**
- ❌ Don't attach Synthesio + every other dataset to one generic Agent. Sources work best narrow — keep this Agent focused on brand listening.
- ❌ Synthesio mentions are pulled (not pushed) — there's a sync cadence. Newest data may be hours behind. See [Mentions → Synthesio constraints](/guide/mentions#3-5-constraints-limits).

---

## Recipe 5 — Use the Topic Graph for cross-question synthesis

**Goal:** Find what ideas keep recurring across an entire multi-question campaign — without reading every transcript.

**Prerequisites:**
- A campaign with ≥30 responses (the Topic Graph needs signal to cluster)
- `topicGraphEnabled` workspace flag (default on)
- An Agent with the `exploreTopicGraph` capability bound (for chat-tool use)

### Steps

1. **Open the campaign's Insights tab.** See [Campaigns → Navigation Tabs](/guide/campaigns#navigation-tabs). The graph populates as responses arrive (see [Topic Graph → Live vs finished](/guide/topic-graph#live-vs-finished-campaigns)).

2. **Adjust Min Confidence.** Default 0.6. Push to 0.7 to filter out noise; drop to 0.55 if the graph feels too sparse.

3. **Find your top themes.** Look at the largest glowing circles. Click into each one. Read the entities inside.

4. **Drill into one theme's entities.** Click an entity → opens the Entity Detail Drawer. The drawer shows quotes from real respondents (newest-first, capped at 20) with the entity name highlighted inline. See [Topic Graph → Entity Detail Drawer](/guide/topic-graph#entity-detail-drawer).

5. **Use the chat tool for cross-theme analysis.** Open [Home](/guide/home) with a Topic-Graph-capable Agent. Ask:
   - _"Use the topic graph for this campaign to find what entities connect to both 'Vitamin C' and 'sensitive skin'."_ → triggers the `path` operation.
   - _"What's the dominant sentiment in the HydrationIngredients theme?"_ → triggers `theme_details`.
   - _"Find every entity that mentions our competitor."_ → triggers `entity_search`.

6. **Export specific quotes as Reels.** Once you've identified the strongest themes, drill into Reviews ([Branding → Reviews](/guide/branding#reviews-branding-reviews)) and create a Reel from the supporting quotes. See [Recipe 1, Step 8](#steps).

**Common pitfalls:**
- ❌ The Topic Graph won't show meaningful clusters with very few responses (under ~30). You'll see synthetic `type:Product` style groupings instead. See [Topic Graph → Synthetic type-groupings](/guide/topic-graph#synthetic-type-groupings-when-louvain-has-nothing-to-cluster).
- ❌ Don't expect the Topic Graph to feed from Datasets — it's campaign-response-scoped. See [Datasets → Topic Graph relationship](/guide/datasets) and [Topic Graph → Constraints](/guide/topic-graph#constraints-limitations).

---

## Recipe 6 — Onboard a new workspace member from invite to first conversation

**Goal:** Get a new teammate from an email invite to having their first meaningful Home chat conversation.

**Prerequisites:**
- You are a Workspace Owner / Admin
- The new person's email address

### Steps

1. **Invite them.** From the workspace dropdown, open **Members** (`/{workspaceId}/members`). Click **Add Users** → **Invite Members**. Type their email, pick a role (Manager is the standard non-owner default), click Add. See [Settings → Where Manage Users lives](/guide/settings#where-manage-users-lives-not-here).

2. **They sign up.** They receive an email; clicking takes them to the Manager app login. They sign in with Google or email — see [Logging In → Manager](/guide/login#vurvey-manager-login-researchers-admins).

3. **They land on Home.** First-time users see the greeting: _"Hi {name}! What might we create today?"_ See [Home → Getting Started](/guide/home#getting-started).

4. **Walk them through Personal Profile.** Point them at [Account & Profile](/guide/account) — fill in name, avatar, country (some defaults depend on this).

5. **Share a starter Agent.** Open one of your existing Agents → click Share → add their email → set to Viewer. See [Agents → Sharing](/guide/agents). They now see the Agent in their library.

6. **Share a starter Campaign + Dataset.** Same pattern. Pick a representative campaign and one well-organized dataset.

7. **Send them a sample prompt.** Slack / email them a real-world prompt to try with the shared Agent and Sources. Encourage attaching the dataset via [Sources](/guide/home#sources).

8. **Direct them to Quick Reference and Introduction.** [Quick Reference](/guide/quick-reference) is the cheat sheet; [Introduction](/guide/) is the role-based entry guide.

**Common pitfalls:**
- ❌ Don't grant Owner role to new hires by default — it lets them transfer ownership and lock people out. Start at Manager and elevate later if needed.
- ❌ Don't share everything in the workspace via Wide-Editor on every resource. Use Restricted access on production resources and grant Viewer broadly via the Share dialog.

---

## Recipe 7 — Set up Tremendous payouts for the first time

**Goal:** Reward respondents for completing campaigns. First-time setup.

**Prerequisites:**
- A Tremendous account ([tremendous.com](https://www.tremendous.com/)) with at least one funded campaign
- Admin role with the `tremendousSettings` permission
- At least one completed Vurvey campaign with responses you want to reward

### Steps

1. **Open the Rewards page.** Click **Rewards** in the left nav. You'll see an empty state with a **Configure Tremendous** button (assuming `tremendousSettings` permission). See [Rewards → States](/guide/rewards#three-workspace-states).

2. **Get a Tremendous API key.** In Tremendous, generate an API key with at least `campaigns:read`, `funding_sources:read`, and `rewards:create` scopes.

3. **Configure on the Tremendous Integrate modal.** Click **Configure Tremendous**. Paste the API key, click **Next**.

4. **Pick defaults.** Step 2 of the modal lists your Tremendous campaigns and funding sources. Pick the default ones — these become the pre-fills for every reward send. Click **Finish**.

5. **Verify the workspace state.** The Rewards page now shows the responses table. The header buttons read **Disable**, **Configure**, **Disconnect**.

6. **Send your first reward.** Open the action menu on any response row → **Send Reward**. The modal pre-fills using the campaign's `incentiveAmount` if you set one. Confirm the amount, currency, and click **Pay**. See [Rewards → Send Reward modal](/guide/rewards#send-reward-modal).

7. **Verify it sent.** Watch the Rewards column on the row — a new entry appears with status `pending` then transitions to `succeeded`/`delivered` as Tremendous processes.

8. **For bulk payouts.** Filter the table to **Completes Only** + the right campaign. Use the header checkbox to **Select All** for the filter, then click **Send Rewards (N)**. **Double-check the count** — Select All includes rows past page 1!

**Common pitfalls:**
- ❌ Don't forget Tremendous's ~2.5% fee — it's NOT included in the Pay total shown in the modal. See [Rewards → Tremendous fee notice](/guide/rewards#tremendous-fee-notice).
- ❌ **Select-all-by-filter** is filter-scoped, not page-scoped — verify the count in the button before clicking Pay. See [Rewards → Select-all-by-filter](/guide/rewards#path-3-select-all-by-filter).
- ❌ Don't issue rewards to deleted-user responses by accident — the Rewards page hard-excludes those (`excludeDeletedUsers: true`), but stay aware that's why some responses don't appear.

---

## Recipe 8 — Add a Composio tool connection so an Agent can act through it

**Goal:** Connect Slack to your account so an Agent can post messages on your behalf.

**Prerequisites:**
- `composioEnabled` workspace flag (request via CSM)
- A Slack workspace where you have permission to install apps
- An Agent that you want to gain Slack capability

### Steps

1. **Open Integrations.** Click your avatar → **Personal Profile** → **Integrations** tab. The Integration Hub lists supported tools, grouped by category. See [Integrations → Composio per-user connections](/guide/integrations#composio-per-user-tool-connections).

2. **Find Slack.** Use the search input or browse Communication category. Click the Slack card.

3. **Pick OAuth.** A small auth-scheme chooser opens. Slack typically supports OAuth2 — click **OAuth (Login)**. You'll be redirected to Slack's consent screen.

4. **Approve in Slack.** Pick the Slack workspace you want to grant access to. Slack redirects you back to `/me/integrations` with a success toast: _"Successfully connected Slack using OAuth."_ See [Integrations → Composio callback handler](/guide/integrations#the-composio-callback-handler).

5. **Bind the capability to your Agent.** Open the Agent in [Agent Builder](/guide/agents). In the Tools section, enable the Slack capability (workspace-integration tool). Save.

6. **Use it.** Open [Home](/guide/home), select the Agent, attach Sources if needed, and try a prompt: _"Read the attached campaign results and post a 3-paragraph summary to my #insights Slack channel."_ The Agent should call the Slack tool on your behalf.

7. **Verify in Slack.** The message arrives in the channel as your Slack user. The Agent in Vurvey reports back with the message ID or success confirmation.

**Common pitfalls:**
- ❌ If `composioEnabled` is off, the Integrations tab won't appear — Personal Profile sub-nav shows General Settings + Terms only. See [Account & Profile → Three tabs](/guide/account#the-three-tabs).
- ❌ Composio connections are per-user, not per-workspace. Your teammate needs to do their own setup.
- ❌ Don't share an Agent with a Slack capability and expect teammates' Slack tokens to work — they need their own Slack connection.

---

## Recipe 9 — Run a concept simulation with AI personas before launching to real respondents

**Goal:** Test a campaign on simulated AI personas to catch obvious issues before spending real respondent time.

**Prerequisites:**
- A draft campaign with all questions
- A People → Population set up with synthetic personas (or use a Vurvey demo population)

### Steps

1. **Open the campaign.** It should be in `Draft` status.

2. **Switch to the Audience tab.** Instead of selecting real respondents, pick an AI Population. See [People](/guide/people).

3. **Trigger the simulation.** A "Run simulation" or "Generate responses" button kicks the AI-population generation worker (`population-generation-worker.ts`) — see [Platform Architecture → Worker topology](/guide/architecture#vurvey-api-worker-topology).

4. **Wait for results.** Generation can take a few minutes for ~50 personas. Each persona "answers" your campaign as if they were a real respondent matching their facets.

5. **Review responses on the Results tab.** Treat them like real responses — they go through the same Topic Graph extraction (`exploreTopicGraph` works on simulated data too), the same Reels flow, the same Analyze tab.

6. **Look for issues.** Do the personas misunderstand a question? Skip a key constraint? That's a question-design bug — fix it now before real respondents see it.

7. **Once happy, re-target the audience to real respondents and launch.**

**Common pitfalls:**
- ❌ Don't treat simulation as a substitute for real responses. It's a stress-test of your QUESTION DESIGN, not a stand-in for actual consumer feedback.
- ❌ The Insights tab populates from simulated data too — useful for checking that themes extract sensibly, but the themes aren't real consumer voices.

---

## Recipe 10 — Use the Vurvey staff Implementation tools to deploy a new customer

**Goal:** _(Staff-only)_ Onboard a new enterprise customer with a curated agent library, brand setup, and Capability blueprints.

**Prerequisites:**
- Vurvey Labs `ENTERPRISE_MANAGER` or `IMPLEMENTATION` UserRole
- The new customer's workspace already provisioned in [Super Admin → Manage Workspaces](/guide/admin#manage-workspaces-admin-workspaces)
- A brand record attached ([Super Admin → Manage Brands](/guide/admin#manage-brands-admin-brands))

### Steps

1. **Open Implementation.** Workspace dropdown → **Implementation**. See [Implementation](/guide/implementation).

2. **Confirm taxonomy.** Open **Taxonomy Management** → Facet Editor. Check that the facets relevant to this customer's industry exist. If you need to add new ones, use the **AI Recommend** tab with a domain YAML brief.

3. **Sync taxonomy.** Use **Preview Sync** to confirm what'll change, then **Execute Sync** with notes explaining why. See [Implementation → Taxonomy Management](/guide/implementation#taxonomy-management-implementation-taxonomy).

4. **Set up agent personalities.** Open **Agent Personalities**. Create or import 5–10 personality kits the customer will want to use (e.g. "Skeptical Brand Manager", "Enthusiastic Gen Z Consumer", "Pragmatic CFO").

5. **Build the YAML agent manifest.** Author a YAML file with the 10–20 Agents you want pre-deployed. Each entry references a personality from Step 4 and binds the right datasets and capabilities.

6. **Bulk-import agents.** Open **Create agents from YAML files** → select the customer's workspace → upload the YAML. See [Implementation → YAML importer](/guide/implementation#create-agents-from-yaml-files-implementation-add-agents-via-yaml).

7. **Verify the agents landed.** Open the customer's workspace from the workspace switcher. Browse Agents.

8. **Deploy Capability blueprints.** From within the customer's workspace, open [Capabilities → Browse Blueprints](/guide/capabilities#blueprint-library-capabilities-blueprints-wave-3). Deploy 2–3 relevant blueprints in DRAFT state. Schedule for the customer to activate when they're ready.

9. **Flip workspace flags.** Back to Super Admin → Manage Workspaces. Turn on the appropriate workspace feature flags for the customer (e.g. `topicGraphEnabled`, `composioEnabled`, `forecast_enabled` based on contract).

10. **Hand off to the customer's CSM.** Walk through the curated agents, the deployed blueprints, and the feature-flag state.

**Common pitfalls:**
- ❌ Don't flip every flag for every customer — `forecast_enabled` is mock-data and `moldBuilder` is staff-only. See [What's New → Active feature-flag rollouts](/guide/whats-new#active-feature-flag-rollouts) for the canonical state.
- ❌ Don't change taxonomy without a Sync notes field explaining why. Future-you will thank you when auditing the Versions tab.

---

## Where to go next

- [Introduction](/guide/) — start here if you're new
- [Quick Reference](/guide/quick-reference) — cheat sheet for individual tasks
- [What's New](/guide/whats-new) — recent additions and coming-soon items
- [Platform Architecture](/guide/architecture) — how the whole stack fits together
- [About This Documentation](/guide/automation-and-qa) — how this site stays current
