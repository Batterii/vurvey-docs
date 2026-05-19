---
title: Forecast
---

# Forecast

**Forecast** is Vurvey's experimental workspace area for structured forecasting, model comparison, validation, and discovery-style insight surfacing. The intent is to let brand teams ask forward-looking questions ("how will Demand for X look over the next 8 quarters in NA?") and get a chart + an AI-generated written analysis in one place — fed by the same agentic stack that powers Agents and Workflows.

::: danger Important: Forecast is currently a UI prototype on demo data
The entire Forecast experience renders against an **Apollo `MockedProvider`** seeded by `forecast-mock-provider.tsx`. There is **no backend forecast pipeline yet** — the chart values, items, geographies, confidence levels, and AI analysis are all served from in-app fixtures backed by a hardcoded start date of **2022-01-01**.

A blue **Demo data preview** banner appears on every Forecast page making this explicit. **Do not treat the numbers as live**, and do not pipe them into reports or stakeholder decks as if they were. When a real pipeline ships, this banner will be removed and the doc will be updated.

Ticket [VU-5480](https://vurvey.atlassian.net/browse/VU-5480) added this banner specifically to prevent confusion during enterprise demos on the Batterii workspace.
:::

![Forecast main view with inputs, chart, and AI analysis](/screenshots/forecast/01-forecast-main.png?optional=1)
![Demo Data Preview banner](/screenshots/forecast/02-demo-data-banner.png?optional=1)
![Select Models to Compare modal](/screenshots/forecast/03-select-models-modal.png?optional=1)
![Discovery Engine — Predefined mode](/screenshots/forecast/04-discover-predefined.png?optional=1)
![Discovery Engine — Upload mode](/screenshots/forecast/05-discover-upload.png?optional=1)
![Model Validation view](/screenshots/forecast/06-model-validation.png?optional=1)

---

## Availability and how to turn it on

Forecast is gated by a workspace-level boolean feature flag: **`workspaces.forecast_enabled`** (defaults to `false`). The flag was introduced in vurvey-api migration `20251119144236_add-forecast-flag-to-workspace.ts` on **November 19, 2025**.

| State | Behavior |
|---|---|
| `forecast_enabled = false` (default) | Forecast nav item is hidden. Loading `/forecast` directly redirects to the workspace home. |
| `forecast_enabled = true` | Forecast nav item appears. Loading `/forecast` renders the prototype (demo data banner included). |

**The flag is not currently exposed in any user-visible Settings UI.** To turn it on for your workspace:

1. Ask your Vurvey CSM or open a support ticket referencing this workspace name + ID.
2. They will flip the flag (admin operation against vurvey-api).
3. Refresh the app — Forecast appears in the left navigation.

Because no real pipeline is connected, the practical reason to enable Forecast today is **internal product review or customer demos** — not running production forecasts. Treat enablement requests accordingly.

::: tip For Vurvey engineers reading this
The flag flip is a straight UPDATE on `workspaces.forecast_enabled` (no GraphQL mutation exposed). For local development, the easiest way to see the page is to start the API with the workspace flag pre-seeded, or to update via psql. The feature does not require any tenant-specific configuration beyond the flag.
:::

---

## Routes

The Forecast area mounts five routes. **Only the main `/forecast` view is exposed in the page's button-group sub-navigation** — the other four exist in the router but you currently reach them by typing the URL directly, by deep-link, or via in-page actions on the main view that have not yet been wired up.

| Route | Page | Status |
|---|---|---|
| `/forecast` | **Forecast View** — main inputs + chart + analysis | Mock-data preview |
| `/forecast/model-validation` | **Model Validation** — inputs + a validation-chart section | Mock-data preview |
| `/forecast/model-comparison` | **Model Comparison** — empty state → Select Models modal → comparison chart | Mock-data preview |
| `/forecast/discover` | **Discovery Engine** — Predefined / Upload modes | Mock-data preview |
| `/forecast/optimize` | **Optimize** | **Empty placeholder** — renders an empty `<div />` only |

::: info Why are sub-routes mounted but not navigable?
The product surface is being built incrementally. The shell ships with the routes wired so engineers and demo operators can preview work-in-progress views, but the sub-navigation is intentionally limited to one option until the views are production-ready. Expect new button-group entries (e.g. "Compare", "Discover") to appear as those views ship.
:::

The shell itself is `ForecastPage`:

- Document title set on mount: **Vurvey - Forecast**
- Sub-nav header: **Forecast** with one button-group entry: _Forecast_ (icon: `PresentationChartUserAnalysisIcon`, tooltip: _"View and manage your forecasts"_)
- Demo Data Banner renders above the `<Outlet />`, so every sub-page inherits the banner

---

## The main Forecast view (`/forecast`)

Three vertically stacked sections inside a single content column.

### Section 1 — Forecast Inputs

A four-up grid of `SelectInput` dropdowns:

| Input | What it does | Options sourced from |
|---|---|---|
| **Item** | The metric or product to forecast (e.g. "Headphones — Premium"). | Mock `forecastItems` query |
| **Time Granularity** | Temporal scale of the forecast bins. | Hardcoded list: **Weekly, Monthly, Quarterly, Yearly** (`TIME_GRANULARITY_OPTIONS`) |
| **Geography** | The geography filter. Choices depend on the selected Item — different items expose different geographies. | Derived from the chosen Item's `geographies` array |
| **Confidence Level** | The confidence-interval setting used by the analysis. | Mock `confidenceLevels` query |

Below the grid:

- **Apply & Regenerate** — applies the local input state to the live query. Disabled when nothing has changed since the last apply and when the items query has errored.
- **Save Custom View** — currently wired to a **TODO no-op**. The button renders, accepts clicks, and does nothing. Do not promise users that saved views work today.

The inputs hold a local-state mirror (`localInputs`) so you can change multiple controls before clicking Apply — the chart and analysis don't refetch until Apply.

### Section 2 — Chart

The `ChartSection` component renders the visual forecast (line chart with confidence bands) for the currently-applied inputs. Because data comes from the mock provider, hovering, zooming, and tooltip behavior is real even though the underlying values are not.

### Section 3 — AI Analysis

Below the chart:

- **Start Conversation** button (outlined, small) — intended to hand the current forecast off to the Home chat surface so you can ask follow-up questions to an Agent. The hand-off itself is part of the mock surface today.
- A `MarkdownViewer` renders `forecastAnalysis.markdown` (`MOCK_FORECAST_ANALYSIS_MARKDOWN`). This is a long-form, multi-section narrative explaining the chart in plain English.

The analysis re-fetches automatically when **Item** and **Geography** are both selected (other inputs nudge the variables but the query is skipped without item + geography). Loading shows a spinner; errors trigger a toast (_"Failed to load forecast analysis"_) and an inline `ForecastErrorDisplay`.

---

## Model Comparison (`/forecast/model-comparison`)

Reached by typing the URL or following a future deep link.

### Empty state

When no models have been selected, an **EmptyState** invites you to click **Select Models** — which opens the modal.

### Select Models to Compare modal

Reached from the empty state or from the **Edit Selection** button on the populated comparison chart.

| Element | Behavior |
|---|---|
| **Header counter** | _"N/7 models"_ — live count of currently-selected models. **Cap is 7.** _Older docs that mention a limit of 5 are outdated._ |
| **Model list** | Each row is a `ComparisonModel` (mock data). Click to toggle selection. Selected rows are highlighted. |
| **Clear All** | Resets the in-modal selection to empty. |
| **Cancel** | Closes the modal without saving. If you have unsaved changes, a **Confirm Exit** modal asks before discarding. |
| **Submit** | Saves the selection back to the page and closes the modal. |

### Comparison chart

After save:

- **ModelComparisonChart** renders the selected models on a shared axis.
- A **Time Granularity** selector (defaults to **monthly**) re-bins the visualization without refetching.
- **Edit Selection** reopens the Select Models modal with the current selection pre-loaded.

---

## Model Validation (`/forecast/model-validation`)

Same input row as the main forecast view (`ForecastInputs` is shared), but instead of a forecast chart + analysis it renders a **ValidationChartSection** — an actual-vs-predicted style view for verifying model fit on historical data.

This page does not yet have an analysis pane. Loading and error states match the main view: `LoadingContainer` during initial items load, `ForecastErrorDisplay` if the items query errors.

---

## Discover — the Discovery Engine (`/forecast/discover`)

Discovery is intended to **automatically surface insights** from forecast data — patterns, anomalies, opportunities — without you having to ask a specific question first. Header: _"Discovery Engine"_. Description: _"Automatically surface insights from your forecast data. Select an insight type to view discovered patterns."_

A **Discovery Mode Switch** at the top of the page toggles between two modes.

### Predefined mode

- Loads a server-side library of insight types (mock data today).
- The controls panel exposes filters relevant to the chosen insight type.
- Insights stream into the main content area as cards/charts depending on the type.
- Loading indicators use the standard `Spinner` and disable controls until the data is back.

### Upload mode

- Lets you upload a **CSV file** containing your own series data.
- The mutation is `UPLOAD_DISCOVERY_CSV` (mocked today; real upload flow will likely include a server-side parsing + schema-detection step).
- After upload, the controls and content panes mirror the Predefined mode: pick an insight type, view the patterns it detects.

A short rendering quirk: while either mode is loading, the controls panel renders a `Spinner` instead of the controls themselves, and the content area renders nothing. This is intentional — controls are not safe to interact with mid-load.

---

## Optimize (`/forecast/optimize`)

The route exists but the component is a literal empty `<div />`. Navigating here will give you a blank workspace area below the sub-nav. **Do not point customers at this route.**

When Optimize ships, it will replace this placeholder; the route name suggests an inverse-forecast surface ("given a target, what inputs do we need?").

---

## Behind the flag

When a user with `forecast_enabled = false` lands on `/forecast`, the page short-circuits in a `useEffect`:

```tsx
if (!forecastEnabled) {
  navigate("/", {state: {workspace: true}});
}
```

So they end up on the workspace home. There is **no in-page "you don't have access" message** — the redirect is silent.

The flag only controls the **shell**. Even when off, the routes are mounted in code; you just can't reach them through the UI. If you somehow deep-link to `/forecast/discover` with the flag off, the parent shell redirects you home before the child page mounts.

---

## Constraints & limitations

- **Demo data only, everywhere.** The entire feature uses `ForecastMockProvider` (Apollo `MockedProvider`). No values are connected to live data.
- **No saved views.** The **Save Custom View** button is a TODO no-op. Do not promise this behavior.
- **No persistence between sessions.** Refreshing the page resets all selections to defaults (the inputs provider does not write back to local storage).
- **Optimize is empty.** The route exists but renders nothing.
- **Sub-routes are URL-only.** The sub-navigation exposes only the main Forecast tab; Compare, Validate, Discover, Optimize require URL or deep-link entry.
- **The flag has no UI toggle.** Enable via support / engineering.
- **Model Comparison cap is 7 models.** Older internal references to a 5-model cap are stale.
- **Time granularity is hardcoded** to Weekly / Monthly / Quarterly / Yearly. No custom bin widths.
- **Geographies are item-scoped.** Selecting an item filters the Geography dropdown to that item's allowlist. You cannot mix arbitrary item+geography pairs.
- **The forecast analysis query is skipped** until both Item and Geography are selected. Until then, the analysis pane stays empty.

---

## Best practices

- **Lead with the banner.** When demoing Forecast to a customer or stakeholder, point at the **Demo data preview** banner first. It costs ten seconds and prevents confusion downstream.
- **Don't screenshot Forecast for slide decks** unless your slide deliberately frames it as a prototype. The chart values look real enough to be embarrassing later.
- **Use Forecast as a vehicle for conversation, not a source of truth.** When the **Start Conversation** hand-off lands, the workflow will be "look at the forecast → ask an Agent in chat". That's the loop to design for.
- **Treat sub-routes as preview surfaces.** If you find yourself adding deep links to Validation or Discover into customer-facing material, double-check with product first — those views may move.
- **Suggest the right alternatives** when a customer asks about real forecasting. For trend analysis on Vurvey data today, use [Datasets](/guide/datasets) + [Agents](/guide/agents) with statistical analysis tools, or [Workflows](/guide/workflows) for repeatable analyses.

---

## FAQ

#### Is the Forecast data real?
**No.** Every value, item, geography, confidence level, and AI narrative is served from a client-side Apollo `MockedProvider`. The hardcoded series start date is 2022-01-01. The Demo Data Preview banner on every page is the authoritative signal.

#### When will the real forecast pipeline ship?
There is no public date yet. Watch the changelog and `#vurvey-product`. When it lands, the banner will disappear from every Forecast page, the workspace flag may move into a Settings toggle, and a live backend will replace `ForecastMockProvider` in the routing tree.

#### How do I enable Forecast for my workspace?
Ask your Vurvey CSM or open a support ticket. The toggle is a database flag (`workspaces.forecast_enabled = true`); there is no Settings UI for it today. There's no per-user toggle — it's workspace-wide.

#### Can I disable Forecast for myself if my workspace has it on?
Not individually. The flag is workspace-scoped. You can ignore the nav item; users without admin role on workspace-level changes can't flip it off.

#### Will my forecast inputs persist if I refresh?
No. Inputs reset to defaults on refresh. Don't rely on session continuity until persistence ships.

#### Why doesn't the Save Custom View button do anything?
It's a TODO placeholder. The handler exists, accepts clicks, and is a literal empty function. Saved views are not implemented.

#### How many models can I compare?
**Up to 7** in the Select Models modal. The header counter shows your current count out of 7. Old references to 5 are stale.

#### What happens to my unsaved selections if I close the Select Models modal?
The modal opens a **Confirm Exit** dialog asking whether to discard. Cancel returns you to the selection; Confirm closes without saving.

#### Can I upload my own CSV for analysis?
In **Discover → Upload mode**, yes — but the upload mutation (`UPLOAD_DISCOVERY_CSV`) is mocked. The UI accepts the file; nothing is sent to a real backend yet.

#### Does Forecast respect dataset-level access controls?
Today it does not need to — there is no real data. When the pipeline ships, expect Forecast to inherit standard workspace + dataset access rules.

#### Will my workflow agents be able to consume forecast outputs?
That is the long-term intent (the **Start Conversation** hand-off + downstream Workflow steps). Today, no — the analysis is rendered Markdown on a mocked client.

#### How do I tell which environment I'm in?
Demo data is identical across staging, experimental, and production. The banner tells you you're on demo data regardless of environment. If you need a sanity-check that you're on the right env, look at the URL.

#### Is there an admin view for Forecast usage?
No usage metrics are emitted from the mock surface. When the real pipeline ships, expect telemetry to come with it.

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| Forecast nav item missing | Workspace `forecast_enabled` is false. Open a ticket to enable. |
| `/forecast` redirects to home | Same root cause — flag is off. |
| Inputs load but Chart and Analysis are empty | You haven't selected **Item** and **Geography**. The analysis query is skipped until both are set. |
| Apply & Regenerate button is disabled | Either no inputs changed since last apply, or the items query errored. Refresh the page if errored. |
| **Save Custom View** does nothing | Expected — it's a TODO no-op. Do not file as a bug. |
| Comparison page says "N/7" but Submit is disabled | You must select at least one model. The cap is 7; the floor is 1. |
| Confirm Exit modal won't go away | You're stuck on the inner-most dialog. Click **Cancel** on the outer Select Models modal first, or hit Escape twice. |
| `/forecast/optimize` is a blank page | Expected — the route renders an empty `<div />`. Optimize is not implemented. |
| Discovery is "stuck" loading | The mock provider has a `delay: 500`–`1000`ms simulating realism. Wait a beat. If it never settles, check console for a mock-mismatch error (real variable combinations should be matched by `variableMatcher`). |
| Demo data banner says "demo" but the customer thinks it's live | Walk through this doc with them — specifically the "**Forecast is currently a UI prototype**" disclosure at the top. |
| I can't find Forecast in Settings to enable | There is no Settings toggle. Enablement is a backend flag flip; contact your CSM. |

---

## Related guides

- [Datasets](/guide/datasets) — current home for trend analysis on real Vurvey data
- [Agents](/guide/agents) — pair an Agent with a Dataset for ad-hoc analytical questions
- [Workflows](/guide/workflows) — automate repeatable analyses that will eventually consume Forecast outputs
- [Home](/guide/home) — where the **Start Conversation** hand-off from Forecast will land
- [Settings](/guide/settings) — workspace-level configuration; Forecast's flag will likely surface here when the real pipeline ships
- [Permissions & Sharing](/guide/permissions-and-sharing) — how the flag interacts with workspace roles (workspace-wide, no per-user override)
