---
title: Capabilities
---

# Capabilities

**Capabilities** are Vurvey's reusable, scheduled, multi-workflow research pipelines. A Capability turns a research objective ("Track brand sentiment monthly") into a deployable system that runs on a schedule, chains multiple AI workflows together, and produces structured outputs (Insights, Concepts, Evaluations) that other parts of the platform can consume.

Think of a Capability as a packaged "research-as-a-system" — what you'd build by hand with a Workflow, a Schedule, an Object Type, a Dashboard, and the glue between them, but pre-assembled, named, and inline-editable.

::: warning Multiple feature flags govern this area
Capabilities is **doubly flag-gated**:
- `autonomousCapabilitiesEnabled` (workspace) — required for `/capabilities/*` routes to render at all. Without it, the route redirects to the workspace home.
- `chatbotEnabled` (workspace) — required _additionally_ for the **Capabilities** entry to appear in the left navigation. Both flags must be true to see the link.
- `capabilityWave3BackendEnabled` (workspace) — toggles between the **legacy** (single-page Deployments list + Deployment detail) and the **Wave 3** experience (Home + Blueprints + Object Libraries + Inline-editable Detail). Most new product work targets Wave 3.

All three flags are workspace-scoped, all three are flipped by Vurvey staff (no Settings UI), and the documentation below assumes Wave 3 is on unless noted.
:::

![Capabilities home — library of deployed capabilities](/screenshots/capabilities/01-capabilities-main.png?optional=1)
![Blueprint library — pre-built capability patterns](/screenshots/capabilities/02-blueprints.png?optional=1)
![Object Types library](/screenshots/capabilities/03-object-types.png?optional=1)
![Insights Library (Wave 3)](/screenshots/capabilities/04-insights-library.png?optional=1)
![Blueprint preview — "You give it", "You get", pipeline diagram](/screenshots/capabilities/05-blueprint-preview.png?optional=1)
![Capability detail — pipeline timeline + Dashboard / Workflows tabs](/screenshots/capabilities/06-capability-detail.png?optional=1)
![Capability workflow detail — last run, next run, schedule editor](/screenshots/capabilities/07-workflow-detail.png?optional=1)

---

## Mental model

```text
   Blueprint
      │ (deploy)
      ▼
   Capability ─────┐
   (status: DRAFT  │
    → ACTIVE       │
    → PAUSED       │── Workflow A (head, scheduled)
    → ARCHIVED)    │── Workflow B (downstream, runs on A completion)
                   │── Workflow C (downstream)
                   │
                   ▼
              Object Type
              produces typed structured outputs:
                   ┌── Insights
                   ├── Concepts
                   └── Evaluations
```

A Capability owns: a name, an objective, a sequence of Workflows organized into phases, a schedule (on the head workflow), and a Dashboard (the analysis surface for its outputs). Workflows produce **typed objects** (Insights/Concepts/Evaluations) into Workspace Object Libraries where other Capabilities, Agents, and analyses can read them.

---

## Routes (Wave 3)

The route ordering in `capabilities-routes.tsx` is **deliberately specific** — library and workflow routes must be declared before the `/:slug` catch-all, or `/insights` etc. fall through to the slug lookup, find no capability named "insights", and render _"Capability not found."_ The source carries a multi-line comment about this bug because it shipped once and was reported.

| Route | Page | Wave-3 only? |
|---|---|---|
| `/capabilities` | **Capabilities Home** (`CapabilitiesHomePage`) | Wave 3 — legacy shows `CapabilityDeploymentsList` here |
| `/capabilities/object-types` | Object Types library (`ObjectTypesList`) | Available in both |
| `/capabilities/blueprints` | Blueprint library (`BlueprintLibraryPage`) | Wave 3 — redirects to `/capabilities` if v3 is off |
| `/capabilities/blueprints/:id` | Blueprint preview (`BlueprintPreviewPage`) | Wave 3 — same redirect |
| `/capabilities/insights` | Insights Library (`WorkspaceObjectLibraryPage`) | Wave 3 — same redirect |
| `/capabilities/concepts` | Concepts Library | Wave 3 — same redirect |
| `/capabilities/evaluations` | Evaluations Library | Wave 3 — same redirect |
| `/capabilities/:slug/workflows/:orchestrationId` | Capability Workflow Detail | Wave 3 — same redirect |
| `/capabilities/:slug` | Capability Detail (v3) or Capability Deployment (legacy) | Both — wrapper picks the right component based on `capabilityWave3BackendEnabled` |

::: info Wave 3 routes redirect, not 404
If `capabilityWave3BackendEnabled` is off, Wave 3 routes redirect to `/{workspaceId}/capabilities` rather than 404. The user lands on the legacy home page. This is deliberate — the v3 flag flip is meant to be transparent for end users on the same URLs.
:::

---

## The Capabilities home page (`/capabilities`)

The library of deployed Capabilities for your workspace.

### Header

- Title: **Living intelligence, deployed**
- **+ New capability** button — opens the create flow. Routes to either the Blueprint Library (Wave 3) or the create form (legacy).

### Capability cards

Each card shows:

- **Name** and optional description.
- **Status badge** — typically **Configured** for fully-set-up capabilities, or status-specific badges for DRAFT/ACTIVE/PAUSED/ARCHIVED.
- **Active runs** count (e.g. _"2 running"_) when applicable.
- **Last run** relative timestamp.
- **Card menu (`⋮`)** with **Edit details** and **Delete**.

::: tip DRAFT cards appear last
The home sort places DRAFT capabilities **after** ACTIVE/PAUSED/ARCHIVED ones so the most "alive" capabilities are highest. This is a small but deliberate sort rule that prevents drafts from cluttering the working area.
:::

### Empty state

> **No capabilities yet**
>
> [Browse blueprints]

The CTA opens the Blueprint Library where you start from a pre-built pattern.

---

## Blueprint library (`/capabilities/blueprints`) — Wave 3

Blueprints are **pre-built capability patterns** — a captured set of workflows, prompts, schedules, and object types that produce a predictable research outcome. Deploy a blueprint, customize a few inputs, activate, and you have a working capability without designing the pipeline yourself.

The library is browsable, searchable, and tag-filterable. Each blueprint card carries:

- **Plain-language description** of what the blueprint does.
- **Tags** for filtering ("Brand Tracking", "Innovation Discovery", "Consumer Sentiment", etc.).
- **Pipeline preview** — how many phases, what produces what.
- **Expected outputs** — the typed object types this blueprint emits.
- **Example use cases** — sample roles or teams that use it.

You can also click **Build from scratch** to skip the blueprint library and assemble your own pipeline from raw workflows.

---

## Blueprint preview (`/capabilities/blueprints/:id`) — Wave 3

Click into a blueprint to see the full preview before deploying.

| Section | What it answers |
|---|---|
| **Pipeline diagram** | Which workflow phases run, in what order, with which inputs flowing where. |
| **You give it** | The research objective or seed input the capability needs. (E.g. _"A brand name and a list of competitors"_.) |
| **You get** | The typed objects produced per run, with example shapes. (E.g. _"5–10 Concepts per run, scored and tagged"_.) |
| **Used by** | Example roles or teams — _"Insights teams running monthly competitive scans"_. |
| **Recent output** | Example output from a previous run on a demo workspace, when available. |

Click **Use this blueprint** to deploy a fresh capability from the template. The server runs `deploy-blueprint.service` which:

1. Creates a Capability record (status: `DRAFT`).
2. Materializes the workflows declared in the blueprint (one per phase).
3. Resolves input bindings (`input-binding-resolver.service`) so downstream phases know which upstream outputs to consume.
4. Connects schedule defaults via `schedule-bridge.service` (head workflow only — downstream workflows fire on upstream completion).
5. Returns the new capability for the user to customize.

The deployed capability lands on the **Capability Detail Page** in DRAFT status, ready for naming and customization before activation.

---

## Capability detail page (`/capabilities/:slug`)

The detail page wraps `CapabilityDetailPage` (Wave 3) or `CapabilityDeploymentPage` (legacy) based on the workspace's `capabilityWave3BackendEnabled` flag. The two have different layouts but the same conceptual content.

### Status lifecycle

| Status | Meaning | Available actions |
|---|---|---|
| **DRAFT** | Just deployed (or just edited) — not running on schedule | Inline-editable name and config, **Activate** button, **Delete** |
| **ACTIVE** | Live; running on its schedule (or on demand) | **Run now**, **Pause**, **Archive**, schedule editor |
| **PAUSED** | Schedule suspended; existing runs complete but no new ones start | **Resume**, **Archive** |
| **ARCHIVED** | Hidden from the home view; data preserved | **Restore** (returns to PAUSED) |

The activation handler is `activate-capability.service`. It validates the capability's configuration (required input bindings, attached object types, schedule sanity), flips the status to ACTIVE, and registers the head workflow's schedule with the scheduler.

### Page layout

- **Status header** (DRAFT/ACTIVE/PAUSED/ARCHIVED badge).
- **Editable name** (Wave 3 only, on DRAFT) — click to edit inline.
- **Objective** — the research question this capability answers.
- **Schedule** — preset or custom (see Schedule Editor below).
- **Pipeline phase timeline** — visual of the workflows that run, in order. Phase number per workflow.
- **Broken-state banner** — when a downstream phase fails or a dependency is missing, a banner explains what's broken with a link to the offending workflow.
- **Dashboard tab** — analysis surface for capability outputs (see below).
- **Workflows tab** — the workflows that compose the pipeline (see below).

### Dashboard tab

The dashboard is the analysis surface that turns capability outputs into a presentable view (charts, cards, etc.). State depends on capability status:

| Capability state | Dashboard tab shows |
|---|---|
| DRAFT | A disabled state with prompts to activate. No data yet, no dashboard to build. |
| ACTIVE, no template | **Build dashboard** CTA — opens the dashboard builder. |
| ACTIVE, FISH template available | **Load FISH template** — auto-builds a dashboard from a canonical FISH (Focus, Insight, Story, Hypothesis) template. |
| ACTIVE, dashboard built | **Edit dashboard** — opens the same builder pre-loaded with the current dashboard. |

### Workflows tab

A list of the workflows in the capability's pipeline, in phase order. Each card shows:

- Workflow name and role.
- Pipeline phase number (1, 2, 3, …).
- Output object type (Insight / Concept / Evaluation / other).
- Schedule context (the head workflow's schedule applies to the whole pipeline).
- Last run state (succeeded / failed / running / not yet run).

Click **Open** on a card to open the **Capability-Scoped Workflow Detail** page.

---

## Capability workflow detail (`/capabilities/:slug/workflows/:orchestrationId`)

A workflow can be opened in two places: the standalone Workflow Builder OR the Capability-scoped Workflow Detail page. This is the Capability-scoped one.

### Header

- **Breadcrumb** back to the parent capability.
- **Phase N of M** (e.g. "Phase 2 of 4").
- **Workflow name and role**.
- **Edit workflow definition** — opens the standalone Workflow Builder at `/workflow/flows/:orchestrationId`. Use this to change the workflow's prompt, model, tools, etc.

### Body sections

- **Last run** block: timestamp, status, completion count, average run duration.
- **Next scheduled run** — only meaningful for **head** workflows. Downstream workflows don't have an independent schedule; they fire when the upstream phase completes.
- **Schedule editor** — head workflows only (see below).
- **Output type chips** — visual tags indicating what typed objects this workflow produces (e.g. _"Concept"_, _"Insight"_).

---

## Schedule editor

The schedule editor on a head workflow's detail page supports these presets:

| Preset | Cadence |
|---|---|
| **Daily 9am** | Once per day at 09:00 local. The recommended default. |
| **Every hour** | Once per hour, on the hour. |
| **Weekly Monday 9am** | Once per week, Monday at 09:00 local. |
| **Monthly** | Once per month. |
| **Custom** | Placeholder for cron-style custom schedules — full custom configuration is not exposed in the UI yet. |

The chosen preset translates to a cron expression via `schedule-bridge.service` and is registered against the workflow's head node.

::: warning Downstream workflows don't have their own schedule
A capability with five workflows in a sequence has **one** schedule — on the head workflow. Workflows 2 through 5 are triggered automatically when the previous phase completes. If you change the head workflow's schedule, the cadence of every downstream phase changes too (because the only way they run is via the head).
:::

---

## Object Types (`/capabilities/object-types`)

The library of **type definitions** used to describe the structured objects capability workflows can produce and pass between phases. Available in both legacy and Wave 3.

### What you see

- **Object types** heading.
- **+ New type** button — opens the type-definition editor.
- A card per defined object type, showing its name, key fields, and (when applicable) which capabilities currently produce it.
- Empty state: _"No object types yet"_ when the workspace has none.

### Why this matters

Without an object type, a workflow's output is unstructured text. With an object type, the output is a typed structure that:

- Has a Zod schema (validated server-side via `schemas.ts`).
- Can be filtered and sorted in the corresponding Object Library.
- Carries field-level Evidence citations (see [Sources & Citations](/guide/sources-and-citations#part-3-structured-output-evidence-badges-workflow-outputs-dashboards)).
- Can be consumed as input by downstream workflows via input bindings.

### Built-in types

Three object types ship as platform built-ins (Wave 3):

- **Insight** — a finding or observation distilled from research.
- **Concept** — an idea, product variant, or hypothesis to test.
- **Evaluation** — a scored judgement on a concept or insight.

Workspaces can extend these or define entirely custom types.

---

## Object Libraries (Wave 3) — `/capabilities/{insights, concepts, evaluations}`

Each Wave 3 workspace gets three pre-mounted libraries, one per built-in object type. They share the `WorkspaceObjectLibraryPage` component with a different `libraryType` prop.

| Library | Route | What's inside |
|---|---|---|
| **Insights Library** | `/capabilities/insights` | Insight cards produced by capability workflows across the workspace. |
| **Concepts Library** | `/capabilities/concepts` | Concept cards produced by capability workflows. |
| **Evaluations Library** | `/capabilities/evaluations` | Scored evaluation cards, sorted by score when score is present. |

Common page chrome:

- **Back** link to `/capabilities`.
- **Search** input — text match across name/description/tags.
- **Category filter** dropdown — populated from the categories assigned to items in this workspace.
- **Count pill** — _"Showing 24 of 312"_ when filters are applied.
- **Object-detail modal** — opens when a card is clicked, with full content + evidence.

If the underlying object type isn't yet defined in the workspace OR no items exist, the library renders a valid empty state rather than an error.

---

## Backend service layer

The capability platform is implemented as several services on the API side. You don't interact with these directly, but knowing they exist helps reason about behavior:

| Service | Responsibility |
|---|---|
| `deploy-blueprint.service` | Creates a Capability from a blueprint. Materializes workflows, resolves input bindings, sets up schedule defaults. |
| `activate-capability.service` | Validates a DRAFT capability and flips it to ACTIVE. Registers the head workflow's schedule. |
| `add-workflow-contextual.service` | Adds a workflow to a capability with phase-aware context (so it can read upstream outputs). |
| `input-binding-resolver.service` | At run time, resolves what each downstream phase reads from its upstream phase's outputs. |
| `materializer.service` | Turns the deployed capability into a concrete runnable plan. |
| `schedule-bridge.service` | Converts UI preset choices into cron expressions registered with the scheduler. |
| `concept-image-generator.service` | Generates illustrative images for Concepts (when image-generation is enabled). |
| `schemas` | Zod schemas validating object-type definitions and run outputs. |

The capability prompts (the LLM system prompts that drive the workflows behind a blueprint) live under `src/services/capability/prompts/`.

---

## Constraints & limitations

- **`autonomousCapabilitiesEnabled` AND `chatbotEnabled` must both be true** for the Capabilities link to appear in nav. Either flag off = no entry point.
- **Wave 3 routes redirect to `/capabilities`** when `capabilityWave3BackendEnabled` is off (not 404). Direct URLs from Wave 3 documentation will land you on the legacy home page.
- **Route ordering matters.** Library routes (insights/concepts/evaluations) and the workflow detail route MUST be declared before the `/:slug` catch-all. Don't rename or reshuffle without the test coverage in `capabilities-routes.test.tsx`.
- **The schedule lives on the head workflow only.** Downstream workflows don't have independent schedules.
- **Full custom cron schedules aren't exposed yet** — the **Custom** preset is a placeholder. Stick to the four named presets.
- **DRAFT capabilities don't run.** Even if a schedule is set, nothing fires until Activate.
- **Activated capabilities re-validate.** If you broke the pipeline after activating (deleted an object type, removed a workflow's prompt), the broken-state banner explains what to fix.
- **Object Type changes do not retroactively backfill.** Past run outputs keep their old shape; new runs use the new shape.
- **FISH dashboard template is opinionated.** Customize freely after loading, but understand it bakes in specific assumptions about Focus/Insight/Story/Hypothesis structure.
- **DELETE on a capability is destructive.** It removes the capability record, its dashboard, and its schedule. Past run outputs in the Object Libraries persist (they're owned by the workspace, not the capability) unless you also clean those up.
- **Wave 3 Object Libraries are workspace-scoped.** A capability in workspace A doesn't produce objects readable in workspace B.

---

## Best practices

- **Start from a blueprint, not from scratch.** Blueprints encode hard-won architecture (input bindings, phase sequencing, schedule defaults). Build from scratch only when no blueprint fits.
- **Use the DRAFT state for iteration.** Capabilities in DRAFT can be reshaped freely. Once ACTIVE, changes that break invariants surface as the broken-state banner.
- **Name capabilities for outcomes**, not for tools. _"Monthly Brand Sentiment Tracker"_ beats _"GPT-4 Workflow with Reddit Tool"_.
- **Define your own Object Types if blueprints' defaults don't fit.** A custom type carries through Evidence citations, dashboard binding, and downstream consumption — it pays back many times.
- **Pin the head workflow's schedule to a low-traffic hour** if your data ingestion is bursty.
- **Use Object Libraries as the audit trail.** A library card tracks which capability run produced it; pull cards into reviews when explaining how a recommendation was reached.
- **Pause rather than Delete** when in doubt. Pause preserves the schedule and config; Delete destroys them.
- **Activate at the END of a quarter, not the start** when running quarterly cadences. The first run lands at the end of the next period, giving you a clean baseline.
- **Test broken-state recovery in a non-production workspace.** Practice the recovery flow before doing it on a live customer pipeline.

---

## FAQ

#### Why don't I see Capabilities in my left navigation?
You need BOTH `autonomousCapabilitiesEnabled` AND `chatbotEnabled` on for the link to appear. Even with autonomous enabled, the link is hidden if chatbot is off. Talk to your CSM about both.

#### What's the difference between a Capability and a Workflow?
A **Workflow** is one orchestrated AI process — input → steps → output. A **Capability** is a packaged system that contains one or more workflows wired in phases, plus a schedule, an objective, and a dashboard. Capabilities are reusable; Workflows are reusable inside them.

#### What's a Blueprint?
A pre-built Capability template — workflows, object types, prompts, schedule defaults — captured as a deployable unit. Browse them in `/capabilities/blueprints`.

#### Why does my deployed blueprint still need configuration?
A blueprint provides defaults; some inputs (the seed objective, target brands, etc.) are still capability-specific and must be supplied before you Activate.

#### What are Insights, Concepts, and Evaluations?
The three built-in Object Types. Insights are observations distilled from research; Concepts are ideas/hypotheses to test; Evaluations are scored judgements. Capabilities produce them; Object Libraries store them.

#### What is the FISH template?
A canonical Focus/Insight/Story/Hypothesis dashboard template. Loading it auto-builds a structured analysis surface for capability outputs. Customize after loading.

#### Can I run a Capability ad-hoc, not on schedule?
Yes — **Run now** on an ACTIVE capability fires a one-off run outside the schedule.

#### Why does my downstream workflow not have a "Next run" timestamp?
By design. Downstream workflows in a capability pipeline don't have independent schedules; they run when the upstream phase completes. Only the head workflow has a Next-run time.

#### How do I change an Object Type once a Capability is producing it?
Edit the type in `/capabilities/object-types`. New runs use the new shape; existing outputs in the Object Libraries keep their old shape (no automatic backfill).

#### Can I move a Capability between workspaces?
No — Capabilities and their Object Libraries are workspace-scoped. To replicate a capability in another workspace, deploy from the same Blueprint there.

#### What's "Wave 3"?
The current major iteration of the capability backend (blueprints, object libraries, inline-editable detail page). Earlier iterations used a deployment-list / deployment-detail UX. The workspace-level flag `capabilityWave3BackendEnabled` toggles between them; new development targets Wave 3.

#### What happens when a downstream phase fails?
A broken-state banner appears on the Capability Detail page with a link to the failing workflow. The capability stays ACTIVE; subsequent scheduled runs will retry. Manually re-running the failed phase from its detail page is also an option.

#### Why does the Capability Library home page show DRAFT cards last?
Sort intentionally places DRAFTs after ACTIVE/PAUSED/ARCHIVED so the most "alive" capabilities are highest. Drafts that have been sitting unactivated for a while shouldn't crowd the working area.

#### Can two Capabilities share the same workflow?
A workflow is conceptually owned by its capability — but the underlying `AiOrchestration` could be referenced by multiple capabilities. In practice, the platform encourages one-capability-one-workflow-set; if you need shared subroutines, use Capabilities to model that rather than sharing AiOrchestration IDs.

#### What does "broken state" actually mean?
A capability is in broken state if a required input binding is missing (e.g. an upstream phase was deleted), a required Object Type is missing, or the activation invariants no longer hold. The Detail page surfaces the specific issue in the banner.

#### Are Capabilities visible to non-admin users?
Yes — visibility follows your workspace role. Anyone with workspace access can see Capabilities; whether they can deploy, activate, or edit depends on per-resource sharing (see [Permissions & Sharing](/guide/permissions-and-sharing)).

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| Capabilities link missing from nav | Either `autonomousCapabilitiesEnabled` or `chatbotEnabled` is off (or both). Both must be true. |
| `/capabilities` redirects to workspace home | `autonomousCapabilitiesEnabled` is off. Ask CSM. |
| `/capabilities/insights` shows "Capability not found." | Wave-3 backend is on but route ordering bug exists in your build. Update to current master. (Was a known shipping bug.) |
| `/capabilities/blueprints` redirects to `/capabilities` | `capabilityWave3BackendEnabled` is off — the blueprint flow is Wave-3-only. |
| Wave 3 page shows but library is empty | No items match the filter, or no items exist yet. Check Capability run history. |
| Activate fails with validation errors | Some required configuration is missing — read the error toast; common causes: empty objective, missing schedule on head workflow, dangling input binding. |
| Run now doesn't appear | Capability is not ACTIVE. DRAFT capabilities don't have Run now. |
| Next run time is "—" or missing | Workflow is downstream (depends on upstream completion) and has no independent schedule. Expected. |
| Schedule editor doesn't accept a custom cron | Custom preset is a placeholder; pick Daily/Hourly/Weekly/Monthly for now. |
| Dashboard tab shows nothing on ACTIVE capability | No dashboard built yet. Use **Build dashboard** or **Load FISH template**. |
| Broken-state banner won't go away after I "fixed" it | The banner re-evaluates on activation. Toggle to DRAFT → fix → Activate again to re-run validation. |
| Object Type edit didn't change existing run outputs | Expected. Type changes are forward-only; past outputs keep their old shape. |
| Capability disappeared from home | Either you Deleted it (no undo), or it was Archived (check the Archived view). |
| Card menu has no "Activate" | The capability is already ACTIVE (or PAUSED/ARCHIVED). Activate is a DRAFT-only action. |

---

## Related guides

- [Workflows](/guide/workflows) — the orchestrations that compose a Capability's pipeline
- [Agents](/guide/agents) — the personas that drive each workflow's chat steps
- [Datasets](/guide/datasets) — common input source for capability runs
- [Campaigns](/guide/campaigns) — another input source; capabilities can read campaign responses
- [Home](/guide/home) — chat surface where capability outputs surface in conversations
- [Topic Graph (Insights)](/guide/topic-graph) — a different "insights" concept (per-campaign topic discovery) — not to be confused with the Insights Object Library here
- [Sources & Citations](/guide/sources-and-citations#part-3-structured-output-evidence-badges-workflow-outputs-dashboards) — Evidence badges on capability dashboard outputs
- [Permissions & Sharing](/guide/permissions-and-sharing) — per-capability access control
- [Settings → Topic Graph toggle](/guide/settings#4-topic-graph-toggle) — the (differently-named) topic-graph workspace flag
- [Forecast](/guide/forecast) — an adjacent (mock-data) capability-like surface
