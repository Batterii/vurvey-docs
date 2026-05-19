---
title: Implementation
---

# Implementation

**Implementation** is the enterprise setup area for the platform's most consequential configuration surfaces — the things that quietly shape every workspace's experience: the **taxonomy** of attributes that segment People, the **system prompts** that drive every Agent, the **personalities** (Molds) that personas inherit traits from, and the **YAML pipelines** that bulk-seed agents into workspaces during onboarding.

It sits between [Settings](/guide/settings) (per-workspace, customer-facing) and [Super Admin](/guide/admin) (cross-platform Vurvey Labs work). Implementation is for **enterprise managers and implementation engineers** — the people doing setup work for an account before it goes live, or making platform-wide editorial changes that ripple into every customer workspace.

> 📷 _Screenshot pending: Implementation layout with sub-navigation_
> 📷 _Screenshot pending: Taxonomy Management — Facet Editor_
> 📷 _Screenshot pending: System Prompts_
> 📷 _Screenshot pending: Create agents from YAML_
> 📷 _Screenshot pending: Create Agent Personalities_
> 📷 _Screenshot pending: Molds list (feature-flagged)_
> 📷 _Screenshot pending: Mold Builder (feature-flagged)_

::: warning Internal-only feature
Like Super Admin, Implementation is for Vurvey Labs staff and a small set of enterprise customer-success roles. It is not part of a customer's day-to-day workspace experience. If you're a workspace admin looking for member/billing/integration controls, go to [Settings](/guide/settings). If you're looking for cross-workspace administration (brands, templates, SSO), go to [Super Admin](/guide/admin).
:::

---

## Access control

A single route guard (`ImplementationRouteGuard`) wraps every Implementation page. It checks `isEnterpriseManagerOrImplementation` from the user context. If you fail the check:

- A failure toast appears: _**"You do not have permissions to access this page"**_
- The router navigates you up one level (`<Navigate to=".." replace />`) — typically out of `/implementation/*` and back to the workspace home

There is no in-page "access denied" screen and no deep-linkable login challenge — the redirect is silent past the toast.

**Practical roles that pass:** Enterprise Manager and Implementation. Customer Owners and Admins do _not_ pass this check by default — that's a deliberate separation between customer admin work (Settings) and platform implementation work (this page).

Document title once you land: **Vurvey - Implementation**. Layout theme: dark.

---

## Navigation & routes

The Implementation shell renders a `Header` titled _"Implementation"_ above a single `ButtonGroup` of tabs. The right-hand `<Outlet />` mounts the active sub-page.

| Tab | Route | Icon | Notes |
|---|---|---|---|
| **Taxonomy Management** | `/implementation/taxonomy` | Layers (3) | Default landing — `/implementation` redirects here. |
| **System Prompts** | `/implementation/system-prompts` | Edit-note | |
| **Create agents from YAML files** | `/implementation/add-agents-via-yaml` | Persona | |
| **Create Agent Personalities** | `/implementation/agent-personalities` | Companion faces | |
| **Molds** _(conditional)_ | `/implementation/molds` | AI chip | Only visible when the `moldBuilder` feature flag is on. Direct navigation to molds routes with the flag off redirects to `/implementation/taxonomy`. |

::: tip Feature flag: `moldBuilder`
The **Molds** tab is gated by the `moldBuilder` workspace feature flag (read via `useFeatureFlag({flagName: "moldBuilder"})`). When the flag is **off** for the active workspace, the tab is hidden from the sub-navigation AND any direct navigation to `/implementation/molds/*` redirects to `/implementation/taxonomy`. The Molds sub-routes (`create`, `:moldId`, `:moldId/edit`, `:moldId/builder`) are all gated by the same wrapper.

**To enable for a workspace:** flip `moldBuilder` on that workspace's feature flags. There is no Settings UI for this — engineering owns the toggle. Once on, the Molds tab appears and all sub-routes resolve. The Agent Personalities tab continues to work regardless of this flag — they are related concepts but separately gated (see [The "Mold" vs "Personality" overlap](#the-mold-vs-personality-overlap) below).
:::

::: info Legacy URL redirects
Older `/people/molds/*` URLs were redirected into the Implementation Molds routes when the Mold concept moved out of the People area. If you have a bookmark from the People era, expect a one-time redirect into `/implementation/molds/...`. Once the redirect runs, the new URL is your starting point.
:::

---

## Taxonomy Management (`/implementation/taxonomy`)

The taxonomy is the controlled vocabulary that segments [People](/guide/people) — the facets (e.g. "Age", "Income Bracket", "Coffee Preference") and the values inside each facet. It's also the source of truth for the constraints that prevent nonsensical combinations (e.g. "Vegan" + "Heavy Beef Eater").

Five tabs across the top:

| Tab | Icon | What it does |
|---|---|---|
| **Facet Editor** | Pen-edit | View and edit taxonomy facets and their values. Each facet has a name, description, tier (priority), scale type, and selection mode. Editing a facet stages a change that will be applied on the next sync. |
| **Constraint Rules** | Settings-gear | Create / edit / delete rules that constrain or weight facet combinations. A constraint encodes "if facet A has value X, then facet B should/shouldn't have value Y". |
| **Versions** | Clock-time | Browse the historical sequence of taxonomy versions. The most recent version is highlighted as **Current**. Useful for diffing what changed when. |
| **Sync Logs** | File-text | Per-run history of synchronization operations: timestamp, who ran it, notes, outcome (success / failure / partial). Useful for forensics ("when did the Age facet change?"). |
| **Add Facet** | Spark/AI stars | The **AI Recommend Panel** — upload or paste YAML representing a domain (a brief or research dossier) and have AI suggest new facets, values, and rules. Optionally returns the full updated taxonomy before applying. |

### The Sync flow

Taxonomy edits don't write directly. They stage a delta. To publish:

1. Click **Preview Sync** — calls the `previewSync` mutation and opens a **Sync Preview Modal** showing every adds / updates / removes.
2. Review the preview. If you want to apply, click **Sync Now**.
3. The **Sync Modal** opens with two fields:
   - **Notes** (free text — what you're changing and why)
   - **Force sync** checkbox — bypasses certain safety checks (e.g. removing a facet that has live People segmented on it). Use sparingly.
4. Click **Execute Sync** — calls `executeSync` with your notes and the force flag.
5. On success, the Sync Preview modal and Sync modal both close, and the Current version, Versions, and Sync Logs queries refetch.

There's also an `executeSyncFromJson` mutation path that lets you ship a JSON payload directly rather than executing the staged delta — used during recovery scenarios.

### AI Recommend (Add Facet tab)

This is where YAML domain briefs become taxonomy proposals.

1. Switch to the **Add Facet** tab.
2. Upload a `.yaml` file or paste YAML into the text area.
3. Click **Recommend** — the `recommendFacet` mutation routes the YAML through an LLM that produces a `RecommendFacetTaxonomyResult` containing proposed facets, values, constraint rules, and a high-level summary.
4. Optionally tick **Return Full Taxonomy** to see the merged-with-current preview, not just the additions.
5. Review the recommendation. If it looks right, accept it — the additions get staged as a delta you can then preview and sync via the normal flow.

::: tip AI recommendations are staged, not auto-applied
Even with `recommendFacet`, nothing reaches production until you Preview → Sync. The AI is an editor's suggestion, not a publishing step.
:::

### Constraint Rules tab

A constraint rule has the rough shape: `if {facetA, valueX} then {facetB} should/must {include/exclude} {valueY}` plus an operator (`ConstraintOperator`).

Actions:
- **Create Rule** — opens a builder for a new rule
- Per-row **Edit** — opens the rule in the builder pre-filled
- Per-row **Delete** — removes the rule

All three actions stage a change; they don't take effect until the next Sync.

### Versions tab

The Versions table lists every taxonomy version with timestamps and notes. Click a row to see its full snapshot. The Current Version banner above the table reminds you which version is live.

### Sync Logs tab

Append-only audit log. Filter by date range, user, and status. If a sync fails partially, the row expands to show which facets/rules failed and why.

---

## System Prompts (`/implementation/system-prompts`)

The platform-wide library of system prompts that Agents draw from. Every Agent gets its instructions from a combination of: its own persona-level prompt, the relevant System Prompt(s) keyed by category, and any chat-time context.

### The model

Each row is a **System Prompt** with these fields:

| Field | Type | Meaning |
|---|---|---|
| `code` | string | Stable identifier (e.g. `agent.research.summarize`). Used as the lookup key from code paths that pull a system prompt. |
| `name` | string | Human-readable label. |
| `description` | string | What this prompt is for. |
| `category` | `SystemPromptCategory` | Coarse-grained bucket (e.g. `RESEARCH`, `CHAT`, `WORKFLOW`). |
| `subcategory` | string (optional) | Finer slicing inside the category. |
| `template` | string | The actual prompt text, with `{{variable}}` placeholders. |
| `variables` | `{name, type, required, description}[]` | Schema for the placeholders. |
| `status` | `Active` / `Draft` / `Archived` | Lifecycle. Only Active prompts are pulled at runtime. |
| `version` | number | Monotonic. Increments on every save. |
| `createdAt` / `updatedAt` | timestamp | Audit info. |
| `createdBy` / `updatedBy` | `{id, firstName, lastName}` | Audit info. |

### Toolbar

- **Search** (debounced) — filters by name, code, or description (server-side).
- **Category filter** — populated from the `SYSTEM_PROMPT_CATEGORIES` query; defaults to "All Categories".
- **Status filter** — "All Statuses" / Active / Draft / Archived.
- **Create Prompt** button — opens the **System Prompt Modal** in create mode.

The page fetches up to **100 prompts at a time** (`limit: 100`) with `cache-and-network` policy so changes show up immediately.

### Row actions (`⋮` dropdown)

- **Edit** (PenEditIcon) — opens the System Prompt Modal pre-filled with the row.
- **Duplicate** (CopyDocumentsIcon) — opens a confirmation modal asking for a new `code` (the modal also pre-fills a suggested code with a `-copy` suffix). On confirm, runs `SYSTEM_PROMPT_DUPLICATE`. The clone is created as `Draft` by default.
- **Archive** (BinDeleteIcon) — opens a confirmation modal; on confirm, runs `SYSTEM_PROMPT_ARCHIVE`. Archived prompts are filtered out of runtime resolution but are still visible in the Archived status filter.
- **Restore** (ReloadArrowIcon) — only visible for Archived rows; runs `SYSTEM_PROMPT_RESTORE` and the prompt returns to Active (or Draft, depending on its prior state).

### Lifecycle (Status)

- **Draft** — being written. Not pulled at runtime. Save anytime; no side-effects.
- **Active** — the canonical version, used at runtime. Only one Active row per `code` at a time. Promoting a Draft to Active automatically archives the previous Active for the same code.
- **Archived** — soft-removed. Stays queryable via the Archived filter for audit; not used at runtime.

::: warning Code immutability
The `code` field is the stable lookup key used by application code. Renaming it breaks every call site. Treat it as immutable post-launch; if you must rename, do a coordinated change with engineering to update consumers, then promote a new prompt and archive the old.
:::

---

## Create agents from YAML files (`/implementation/add-agents-via-yaml`)

Bulk-create AI personas in a target workspace from a YAML manifest. This is the platform's **onboarding-time agent seeder** — meant for shipping a curated set of agents into a fresh customer workspace, not for casual day-to-day agent creation (do that in [Agents](/guide/agents)).

### Flow

1. **Select a workspace in which to import agents** — a searchable dropdown lists every workspace on the platform (up to 100 per page, with debounced server search).
2. Once a workspace is selected, two buttons appear:
   - **Import Rules** — opens the **YAML Import Rules Modal** describing what fields the manifest supports, what's required vs optional, and the rough YAML schema. Read this _first_ if you've never used the importer.
   - **Create from .yaml** — opens the **YAML Import Modal**, which accepts either a file upload or pasted YAML.
3. The import modal validates the manifest, shows what will be created, and runs the import on confirm.
4. On success, the page calls `cleanupCache(["aiPersonasForWorkspace", "aiPersonasPaginated", "aiPersonas"])` and refetches `GET_PERSONAS` + `GET_PAGINATED_PM_POPULATIONS` so the target workspace immediately sees the new agents.
5. If the cache refresh fails (rare), a toast appears: _"Agents were created successfully, but the list failed to refresh. Please refresh the page to see the new agents."_

### What the YAML supports

The full schema is documented in the Import Rules modal in-app and evolves over time, but at minimum each agent entry includes:

- Persona-level fields: `name`, `description`, `instructions` (system prompt or pointer to a System Prompt code), avatar/picture references, capability flags
- Optional dataset bindings (which Datasets the agent has access to)
- Optional brand companion / population flags
- Optional cross-references between agents (e.g. "this agent uses that agent as a tool")

Reach for [Agents](/guide/agents) for normal one-off creation; reach for YAML when you're seeding 20+ agents in a consistent pattern.

---

## Create Agent Personalities (`/implementation/agent-personalities`)

Personalities are reusable, named character archetypes that other personas can inherit. Think of them as "personality kits" — _"The Skeptic"_, _"The Optimistic CTO"_, _"The Methodical Researcher"_ — defining tone, viewpoint, and conversational style without being tied to a specific domain.

Internally, personalities are stored in the **`pm_mold`** table (Persona Manager Mold). This is the same underlying table as the Molds tab below — see [The "Mold" vs "Personality" overlap](#the-mold-vs-personality-overlap) for the nuance.

### Toolbar

- **Search** — filter by personality name.
- **Create Personality** (PlusIcon) — opens the **Personality Modal** in create mode. Capture name, description, traits, and any reference content.

### Table

Multi-select-capable; each row exposes:

- **Edit** — re-open in the Personality Modal.
- **Delete** — opens the **Confirm Delete Personalities Modal** (uses `ConfirmActionModal`). Bulk delete works the same way via **Delete Selected** in the toolbar (visible only when at least one row is selected).
- **Publish** — calls `PM_MOLD_PUBLISH`. A published personality becomes available to bind to personas; an unpublished personality is editor-only and can't be assigned downstream. Toast on success: _"Personality published successfully"_. Toast on failure: _"Failed to publish personality"_.

### Mutations & queries

- `PM_MOLD_DELETE` — deletes a personality (used by single and bulk paths via `Promise.all`).
- `PM_MOLD_PUBLISH` — flips a personality from Draft → Published.
- The table refresh is keyed (`tableKey` state increments after mutations) so the underlying paginated list re-fetches cleanly.

### Behavior notes

- The page title is `Vurvey - Implementation - Agent Personalities` (more specific than the rest of Implementation).
- Bulk delete uses `Promise.all`, so individual failures are reported aggregately — if any item in the batch fails, the toast will say so but the deletes that did succeed remain.

---

## Molds (`/implementation/molds`) — _feature-flagged_

The **Molds** area is the dedicated builder UI for creating and editing molds. It's the long-form companion to the table-based Agent Personalities view.

| Route | Component | Purpose |
|---|---|---|
| `/implementation/molds` | `MoldsPage` | List of every mold, with create/edit/delete affordances. |
| `/implementation/molds/create` | `MoldBuilderPage` | Build a new mold from scratch. |
| `/implementation/molds/:moldId` | `MoldBuilderPage` | View a mold (read-only or open-to-edit, depending on state). |
| `/implementation/molds/:moldId/edit` | `MoldBuilderPage` | Edit a mold. |
| `/implementation/molds/:moldId/builder` | `MoldBuilderPage` | Full builder canvas — multi-step authoring flow with previews, samples, and AI assistance. |

All five routes are wrapped by the `moldBuilder` feature-flag check (see the callout above). With the flag off, every one of them redirects to `/implementation/taxonomy`.

### The builder

`MoldBuilderPage` is wired up with the `MoldBuilderContext` — a React context that tracks the current draft, the in-flight preview, the streaming sample subscription, and the publish state. Specifically:

- **Preview** (`pm-mold-preview` mutation + GraphQL subscription) — generate a synthetic example persona based on the current mold draft. Subscribes to incremental progress events so you see the persona stream in over a few seconds rather than wait for a final blob.
- **Sample** (`pm-mold-sample` mutation + subscription) — produce a richer multi-turn sample conversation from the mold, demonstrating how a real persona would behave. Also streamed via subscription.
- **Publish** — flips the draft mold to published; same effect as the Publish action on Agent Personalities.

::: tip Why subscriptions for previews?
LLM-driven generation is multi-second work. Showing a streaming progress feed (rather than a spinner) makes the wait feel productive and lets the editor course-correct early. The subscription protocol is the same one used by Agent chat and Campaign analysis — `pm-mold-preview` and `pm-mold-sample` are just two more streams.
:::

---

## The "Mold" vs "Personality" overlap

These two surfaces share the same underlying data (`pm_mold` table and GraphQL types) but exist for two different workflows:

| | **Agent Personalities** (`/agent-personalities`) | **Molds** (`/molds`) |
|---|---|---|
| **Audience** | Anyone with Implementation access | Same, but only when `moldBuilder` is enabled |
| **Granularity** | Table-based: quick list, quick edits, bulk operations | Builder-based: multi-step authoring with previews and samples |
| **Feature-flagged?** | No | Yes (`moldBuilder`) |
| **Best for** | Renaming, deleting, publishing existing personalities; small text-only edits in a modal | Authoring a new personality from scratch; deep iteration with AI-assisted previews |
| **Mutations used** | `PM_MOLD_DELETE`, `PM_MOLD_PUBLISH` (plus modal-internal create/update) | `PM_MOLD_PREVIEW`, `PM_MOLD_SAMPLE`, plus the same publish/delete |

If you're a customer-success rep onboarding a new account: stay in Agent Personalities. If you're building reference personality kits that need iteration: use Molds (once the flag is on for that workspace).

---

## How Implementation pages interact with the rest of Vurvey

```text
                           ┌─────────────────────────────┐
                           │  Implementation             │
                           │  (Enterprise / Vurvey-only) │
                           └──────┬──────────────────────┘
                                  │
       ┌───────────────────┬──────┴──────┬───────────────────────┐
       ▼                   ▼             ▼                       ▼
┌─────────────┐  ┌────────────────┐  ┌──────────────┐  ┌──────────────────┐
│ Taxonomy    │  │ System Prompts │  │ YAML Importer│  │ Personalities /  │
│ (facets,    │  │ (template lib  │  │ (workspace   │  │ Molds (reusable  │
│  rules,     │  │  used at chat  │  │  seeding via │  │  character kits  │
│  versions)  │  │  runtime)      │  │  manifest)   │  │  bound to        │
└──────┬──────┘  └────────┬───────┘  └──────┬───────┘  │  personas)       │
       │                  │                 │           └────────┬─────────┘
       ▼                  ▼                 ▼                    │
┌────────────┐   ┌────────────────┐  ┌────────────────┐         ▼
│  People    │   │   Agents       │  │  Agents        │  ┌────────────────┐
│  segments  │   │   (chat,       │  │  (workspace    │  │  Agents,       │
│            │   │    canvas,     │  │   seeded list) │  │  Population    │
│            │   │    workflows)  │  │                │  │  Agents        │
└────────────┘   └────────────────┘  └────────────────┘  └────────────────┘
```

Translation:

- A change to the **taxonomy** ripples into who appears in [People](/guide/people) and how segmentation works across all workspaces.
- A change to a **system prompt** ripples into the behavior of any Agent (or Workflow, or Workflow node) whose code path looks up that prompt by `code`.
- A **YAML import** ships agents into a specific workspace — the customer sees them immediately.
- A new **Personality / Mold** becomes assignable to personas; existing personas need to be edited to inherit it (it doesn't retroactively re-bind).

---

## Constraints & limitations

- **Enterprise / Implementation role only.** All routes are guarded; customer admins do not have access.
- **`moldBuilder` is workspace-scoped.** The flag governs sub-nav visibility AND route resolution; enabling per-workspace is the only path today.
- **Taxonomy changes don't take effect until Sync.** Edits stage a delta; the live taxonomy doesn't move until you Preview → Execute Sync.
- **Force-sync is a hammer.** It bypasses safety checks like "this facet has live People segmented on it". Use only when you understand the downstream impact.
- **System Prompt code is immutable in practice.** Renaming breaks every code path that pulls the prompt by `code`. If you must rename, coordinate with engineering.
- **System Prompt query limit is 100 per page.** No infinite scroll; refine search/filters if your library exceeds that.
- **YAML Import requires a target workspace.** Without one selected, the Create / Import Rules buttons don't appear.
- **YAML Import cache invalidation is best-effort.** If the post-import refresh fails, the user gets a toast asking them to manually refresh — the import itself still succeeded.
- **Personalities and Molds share `pm_mold`** — deleting or unpublishing in one view affects the other. Use the same source-of-truth mental model.
- **Mold previews and samples are streamed.** Closing the page mid-stream may leave the server still working briefly; the next preview supersedes it.

---

## Best practices

- **Run a Preview before every Sync.** Sync Logs will tell you _what_ changed; the preview tells you _what's about to change_. Don't skip it for non-trivial deltas.
- **Write sync notes that future-you will thank present-you for.** _"Adding Coffee Brewing Methods facet for Q2 espresso launch"_ beats _"add facet"_ in the Sync Logs.
- **Publish System Prompts incrementally.** Save as Draft, share the `code` with engineering for a test integration, _then_ promote to Active. Promoting straight from a manually-typed draft is a known way to break runtime behavior.
- **Use Duplicate, not Edit, when you want to A/B a prompt.** Duplicate gives you a Draft clone with a new code so the old Active stays in place — your A/B can run side-by-side.
- **YAML over manual creation past ~5 agents.** Five hand-clicked persona creations is fine. Twenty hand-clicked persona creations is a YAML manifest waiting to happen.
- **Personalities first, Personas second.** Build the personality kits in this area, _then_ have authors bind them in the Agent Builder. Going the other way creates orphan one-offs you'll never reuse.
- **Don't enable `moldBuilder` on production workspaces casually.** The builder is the more complex surface — let CSMs handle setup until customers ask for self-service.
- **When in doubt, ask the customer's CSM** before flipping any of these. Implementation changes propagate fast and visibly.

---

## FAQ

#### What's the difference between Implementation and Super Admin?
[Super Admin](/guide/admin) administers the platform's tenants and operational data (workspaces, brands, employees, billing rates, SSO providers, cross-workspace agents). Implementation administers the platform's _editorial_ surfaces (taxonomy, prompts, agent kits, YAML seeding). Both are gated behind staff-level access but they serve different work.

#### Why are taxonomies "synced" instead of saved directly?
Because the taxonomy is platform-wide editorial data — wrong edits affect every workspace. The Preview / Sync pattern forces a deliberate review step. It also means concurrent editors can stage changes without stepping on each other; the conflicts surface in the preview.

#### Can a workspace owner reach Implementation?
Only if they also have the platform-level `isEnterpriseManagerOrImplementation`. Customer-side owners do not by default. This is intentional — Implementation lets you change the rules of the game; customer admins should be playing the game, not editing it.

#### What does the `moldBuilder` flag actually gate?
The **Molds** tab in the sub-nav and the entire `/implementation/molds/*` URL tree. With the flag off, those routes redirect to Taxonomy Management. The Agent Personalities page is _not_ gated by this flag — it works regardless. The two surfaces share the same data; the flag only hides the dedicated builder UI.

#### Are Agent Personalities the same as Molds?
Same data, different UI. Personalities is the lightweight table view; Molds is the rich builder. See [The "Mold" vs "Personality" overlap](#the-mold-vs-personality-overlap).

#### How do I know which System Prompt is being used at runtime for a given Agent?
The Agent's instructions reference prompts by `code`. Check the Agent's persona configuration in [Agent Builder](/guide/agents) — if it references a System Prompt code, find that code in this page's table. Only Active rows resolve at runtime.

#### Can I roll back a taxonomy sync?
Yes — the Versions tab keeps full snapshots. Open the version you want to restore, then either Sync From JSON (with that version's JSON) or stage the equivalent deltas through the editor. There's no one-click "rollback to version N" today — but the data to do it manually is there.

#### Why does the AI Recommend tab take so long?
Because it's calling an LLM on a YAML domain brief that can be substantial. Five to thirty seconds is normal. Don't refresh the page mid-recommendation; the result is stateless on the client.

#### Can I import agents from YAML directly into multiple workspaces at once?
Not today — the import UI requires picking one target workspace per import. For multi-workspace seeding, run the import multiple times. (Engineering occasionally scripts cross-workspace seeds via direct GraphQL — ask if that fits your use case.)

#### What happens if I delete a Personality that's bound to live personas?
The personas remain (their inherited copy of the personality is baked into the persona record at bind time). The deletion only prevents future bindings. If you want to also "un-bind" from existing personas, that's a per-persona edit.

#### My Sync failed partway through — what now?
Open the Sync Logs tab, find the failed row, and expand to see which facets or rules failed and why. Most partial failures stem from constraint conflicts (e.g. removing a facet value that a constraint rule still references). Fix the conflicting rule, then re-Preview and re-Execute.

#### How is "version" different between System Prompts and Taxonomy?
- System Prompt `version` is a per-row monotonic counter — every save increments it. It's metadata; runtime always resolves by Active status, not by version number.
- Taxonomy versions are full immutable snapshots of the entire taxonomy at a sync point. The Versions tab lists them; the Current Version banner indicates which is live.

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| `/implementation` redirects you with toast _"You do not have permissions"_ | Your role isn't Enterprise Manager or Implementation. Talk to a Manager. |
| Molds tab isn't showing up | `moldBuilder` workspace feature flag is off. Engineering owns the toggle. |
| Sync Now button is disabled | The Preview has not been opened, OR the staged delta is empty (no pending changes). Make at least one facet/rule edit first. |
| Preview takes very long, then errors | Common: a malformed constraint rule references a deleted facet value. Fix the rule, re-Preview. |
| AI Recommend returns nothing useful | YAML is too thin or too vague. Recommend works best on rich domain briefs with examples and definitions. |
| System Prompt Duplicate creates a row with an unexpected code | The duplicate modal allows you to override the auto-suggested `-copy` suffix. If you submit too fast you may not see the suggestion update — open the modal, confirm the code in the input. |
| Archive on a System Prompt didn't remove it from runtime | Archive runs server-side; client cache may show it stale. Refresh, then check the Active filter. If still appearing, you may have multiple Active rows for the same `code` (forbidden state — call engineering). |
| YAML Import says success but agents don't appear in workspace | The post-import cache refresh failed silently. Refresh the target workspace's Agents page manually. The toast wording covers this case. |
| Mold preview stream stops mid-way | The preview subscription dropped. Click Preview again. If repeated, capture network logs and report — preview subscriptions go through the same channel as chat streams, so a flaky upstream affects both. |
| Personality publish failed | Could be a validation rule (e.g. minimum description length) or a transient backend error. The toast reads _"Failed to publish personality"_; check console for the actual error message. |
| Force-sync still rejected | Force only bypasses certain warnings; structural impossibilities (e.g. circular constraints) will still fail. The Sync Logs row will explain. |

---

## Related guides

- [Super Admin](/guide/admin) — cross-workspace operational administration (the sibling of this page)
- [People](/guide/people) — the consumer of taxonomy work; segmentation flows here
- [Agents](/guide/agents) — the consumer of System Prompts and Personalities/Molds
- [Workflows](/guide/workflows) — chat nodes consume System Prompts via the same `code` lookup pattern
- [Settings](/guide/settings) — customer-side workspace settings (Implementation is the staff-side counterpart)
- [Permissions & Sharing](/guide/permissions-and-sharing) — the broader role model behind `isEnterpriseManagerOrImplementation`
