---
title: Capabilities
---

# Capabilities

Capabilities are workspace-level AI systems that turn a research objective into a reusable pipeline. A capability can be built from a blueprint or from scratch, configured with workflows, then activated and run on a schedule or on demand.

::: tip Feature Availability
Capabilities appear only when your workspace has both chat and autonomous capabilities enabled. Some blueprint and dashboard experiences are part of the newer capability rollout and may not appear in every workspace yet.
:::

## Opening Capabilities

Use the left sidebar and click **Capabilities**.

If Capabilities are not enabled for your workspace, the app returns you to the workspace home page.

## Capability Library

![Capabilities library](/screenshots/capabilities/01-capabilities-main.png?optional=1)

The Capabilities home page is the main library for deployed and draft capabilities.

| Area | What It Shows |
|---|---|
| Header | **Living intelligence, deployed** and the **+ New capability** button |
| Capability cards | Capability name, optional description, **Configured** status badge, and relative update time |
| Card menu | **Edit details** and **Delete** |
| Empty state | **No capabilities yet** with **Browse blueprints** |

Capability cards use status labels such as **Configured** when the capability has its required setup.

## Blueprint Library

![Capability blueprints](/screenshots/capabilities/02-blueprints.png?optional=1)

Click **Browse blueprints** or open the blueprints route to start from a pre-built capability pattern.

Blueprints can include:

- A plain-language description of the research objective
- Tags for filtering the library
- A preview of the capability pipeline
- Expected outputs for each run
- Example use cases

You can also choose **Build from scratch** when you do not want to start from a template.

## Blueprint Preview

A blueprint detail page shows how the capability will work before you create it.

| Section | What It Means |
|---|---|
| Pipeline diagram | The workflow phases that will run |
| You give it | The research objective or input the capability expects |
| You get | The typed objects and outputs produced per run |
| Used by | Example roles or teams that can use the capability |
| Recent output | Example output from a run, when available |

Click **Use this blueprint** to create a capability from the blueprint.

## Capability Detail Page

Open a capability card to manage the individual capability.

The detail page shows:

- Current status, such as **DRAFT**, **ACTIVE**, **PAUSED**, or **ARCHIVED**
- The capability objective
- Schedule information
- Pipeline phase timeline
- A broken-state banner when the capability needs attention
- **Dashboard** and **Workflows** tabs

Draft capabilities can show an editable name field and an **Activate** button. Active capabilities can show **Run now**.

## Dashboard Tab

The Dashboard tab is the analysis surface for capability output.

Depending on capability state and workspace configuration, you may see:

- A disabled dashboard state for draft capabilities
- **Load FISH template**
- **Build dashboard**
- **Edit dashboard**

## Workflows Tab

The Workflows tab lists the workflows inside the capability pipeline.

Each workflow card can show:

- Workflow name and role
- Pipeline phase
- Output object type
- Schedule context
- Last run state

Use **Open** on a workflow card to inspect that workflow in the capability-scoped workflow detail page.

## Capability-Scoped Workflow Detail

Capability workflow details are opened from a capability, not from the standalone Workflow builder. The page path follows this pattern:

`/capabilities/:capabilitySlug/workflows/:orchestrationId`

The page includes:

- Breadcrumb back to the parent capability
- Phase number and total phase count
- Workflow name and role
- **Edit workflow definition**, which opens `/workflow/flows/:orchestrationId`
- Last run timestamp, status, completion count, and average run duration
- Next scheduled run
- Schedule editor for head workflows that support scheduling
- Output type chips for objects the workflow produces

Downstream workflows do not calculate their own next run. They run when the upstream workflow completes.

## Schedule Editor

The schedule editor supports these presets:

| Preset | Behavior |
|---|---|
| **Daily 9am** | Recommended default daily run |
| **Every hour** | Runs once per hour |
| **Weekly Monday 9am** | Runs every Monday morning |
| **Monthly** | Runs once per month |
| **Custom** | Placeholder for custom schedule support |

Advanced per-workflow schedule customization is not fully exposed yet.

## Object Types

![Object types](/screenshots/capabilities/03-object-types.png?optional=1)

The **Object Types** route lists object definitions used by capabilities. These describe the structured objects that capability workflows can produce and pass between phases.

The current page includes:

- **Object types** heading
- **New type** action
- cards for existing type definitions
- an empty state that says **No object types yet** when the workspace has none

## Object Libraries

When the newer capability backend is enabled, Capabilities also mounts object-library routes for:

- **Insights** at `/capabilities/insights`
- **Concepts** at `/capabilities/concepts`
- **Evaluations** at `/capabilities/evaluations`

These pages show structured objects produced by capability workflows.

![Insights Library](/screenshots/capabilities/04-insights-library.png?optional=1)

The object libraries share a consistent pattern:

| Library | What it shows |
|---|---|
| **Insights Library** | Insight cards and discovery output produced across the workspace |
| **Concepts Library** | Concept cards produced by capability workflows |
| **Evaluations Library** | Scored concept or evaluation cards, sorted by score when available |

Each library includes:

- back link to Capabilities
- search input
- category filter when categories exist
- count pill for filtered items
- object-detail modal when a card is opened

If the required object type definitions are not configured or no matching objects exist, these routes can show a valid empty state instead of cards.

## Related Guides

- [Workflows](/guide/workflows)
- [Home](/guide/home)
- [People](/guide/people)
