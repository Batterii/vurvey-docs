---
title: General Populations
---

# General Populations

**General Populations** are platform-wide audience reference sets — Vurvey-curated populations covering broad demographic and behavioral segments (e.g. "US Gen Z women", "European luxury shoppers", "Australian millennial parents"). They differ from **Brand Populations** (your workspace's curated population) in that they're shared across the platform and used as a starting point for research targeting or AI-population simulation.

::: warning Feature-flag gated
General Populations are gated by `enablegeneralpopulations` — a workspace feature flag. When off, the General-Populations detail route at `/people/populations/general/:generalPopulationId` is guarded by `GeneralPopulationsRouteWithFeatureFlagGuard` and bounces the user to the Populations index with a failure toast: _"General populations are not enabled. You cannot access that page."_

Ask your CSM about enablement.
:::

> 📷 _Screenshot pending: Populations index with General Populations alongside Brand Populations_
> 📷 _Screenshot pending: General Population detail — visualization dashboard_
> 📷 _Screenshot pending: General Population detail — paginated persona table_
> 📷 _Screenshot pending: View Agent Details modal_
> 📷 _Screenshot pending: Visibility toggle (Vurvey-staff-only)_

---

## Brand vs General populations

| | **Brand Population** | **General Population** |
|---|---|---|
| **Created by** | Your workspace's team | Vurvey Labs |
| **Scope** | Workspace-specific (`PmPopulation`) | Platform-wide (`PmGeneralPopulation`) |
| **Visibility** | Visible to your workspace only | Visible to all workspaces where `enablegeneralpopulations` is on |
| **Editing** | Your workspace can edit | Read-only to customers; only Vurvey staff modify |
| **Use case** | Customer-specific audience curated to your brand's target | Broad reference demographics for early-stage research and simulations |
| **Card component** | `PopulationCard` | `GeneralPopulationCard` |
| **Detail route** | `/people/populations/:populationId` | `/people/populations/general/:generalPopulationId` |
| **Detail component** | `PopulationDetailsPage` | `GeneralPopulationDetailsPage` |

The Populations index at `/people/populations` renders BOTH kinds side-by-side when `enablegeneralpopulations` is on. The GraphQL `__typename` discriminator (`PmGeneralPopulation` vs `PmPopulation`) is what the page uses to choose between `GeneralPopulationCard` and `PopulationCard`.

---

## Routes

| Route | Purpose | Gating |
|---|---|---|
| `/people/populations` | Populations index showing both Brand and General populations | Default; General Populations appear when `enablegeneralpopulations` is on |
| `/people/populations/general/:generalPopulationId` | General Population detail page (`GeneralPopulationDetailsPage`) | `enablegeneralpopulations` flag — bounces to `../..` on failure |

The `defaultFilterValue` on the populations index also adapts: when `enablegeneralpopulations` is on, the filter starts at `ALL` (both kinds shown); when off, it starts at `WORKSPACE` (Brand Populations only).

---

## Detail page layout

The General Population Detail page (`GeneralPopulationDetailsPage`) renders the chosen population's content with:

| Element | Purpose |
|---|---|
| **Header** with back-arrow chevron | Returns to the populations index |
| **Population name + description** | What the population represents |
| **Vurvey Labs badge** (`VurveyLabsIconVolt`) | Visual indicator this is a platform-curated population |
| **Visibility status** (Vurvey staff only) | Whether the population is visible to other workspaces; staff can toggle |
| **View Agent Details modal trigger** | Click a persona to see its full Agent-style detail card |
| **Two view modes** (toggle between):
  - **Charts** — Visualization Dashboard with sentiment/demographic ring + persona carousel
  - **Table** — Paginated persona table for detail inspection |
| **`⋮` dropdown** (Vurvey staff only) | Toggle visibility on/off for other workspaces |

### Charts view

The **Visualization Dashboard** (`GeneralPopulationVisualizationDashboard`) renders demographic and facet-based visualizations of the population's personas:

- **Persona Carousel** — scrollable preview of representative personas
- **Facet category rings / charts** — derived from `build-general-population-categories.ts` and `resolve-facet-category.ts`
- **Faceted breakdowns** by demographic axes (age, gender, geography, behavior segments)
- **Persona slice details** on click — opens the **View Agent Details modal** for a specific persona

### Table view

The **Paginated Personas Table** (`GeneralPersonasPaginatedTable`) is the detail-inspection view:

- One row per persona (`PmGeneralPopulationPersonasQueryItem`)
- Persona name, demographic facets, behavior tags
- Click to open the **View Agent Details modal**
- Standard pagination via `buildGeneralPopulationPersonasQueryVariables`

---

## View Agent Details modal

Clicking any persona (from either view mode) opens the `ViewAgentDetailsModal` (shared component with the regular Population Details Page). The modal shows the persona's:

- Avatar + name
- Demographic facets
- Behavioral attributes
- Sample utterances or representative prompts

Because General Population personas are typed as `BaseAiPersona | PmGeneralPopulationPersonasQueryItem`, the modal renders a normalized view regardless of which population type the persona came from.

---

## Visibility (Vurvey staff only)

The `⋮` dropdown in the page header includes a **Toggle Visibility** action — but only renders when the current user passes `isEnterpriseManagerOrImplementation`. Customers (workspace `REGULAR_USER` accounts) don't see this option.

When toggled, the action calls the `TOGGLE_GENERAL_POPULATION_VISIBILITY` mutation, flipping whether the General Population is visible to workspaces beyond Vurvey Labs internal use.

| Icon | Meaning |
|---|---|
| `EyeIcon` | Currently visible to other workspaces |
| `EyeOffIcon` | Hidden (only visible to staff) |

Use cases:
- **Pre-launch curation** — staff build and test a new General Population while it's hidden; flip visibility when ready
- **Sunset** — older / less-relevant General Populations can be hidden without deletion
- **Customer-specific embargoes** — population data tied to a NDA can be staff-only

---

## Access errors

If the user tries to access a General Population they don't have permission to see (e.g. it's hidden and they're not staff), the `isGetGeneralPopulationByIdAccessDenied()` utility classifies the GraphQL error and the page shows an access-denied state instead of crashing.

This is the same pattern used for the standard `/populations/:populationId` route — graceful access-denied handling rather than uniform 500-style errors.

---

## Using General Populations downstream

Because General Populations are `PmGeneralPopulation` records (the same shape as `PmPopulation` for most consumers), they show up in:

- **People → Populations index** alongside Brand Populations
- **Concept Simulations builder Step 3** when picking the population to react to concepts — see [Concept Simulations](/guide/concept-simulations#step-3-population-create-concepts-simulation-population)
- **Campaign → Audience tab** when targeting an AI population for synthetic respondents — see [Campaigns → Navigation Tabs](/guide/campaigns#navigation-tabs)
- **Capabilities** that need a population input — selectable in their input bindings

Use them where you want broad reference data without curating your own.

---

## Constraints & limitations

- **`enablegeneralpopulations` workspace flag required.** Detail route bounces to `/people/populations` (with a failure toast) when off.
- **Read-only to customers.** You can browse, drill into, and use General Populations in research targeting — but you can't edit them. To customize, copy concepts into your own Brand Population.
- **Visibility toggle is staff-only.** Customers see only currently-visible General Populations; the toggle action requires `isEnterpriseManagerOrImplementation`.
- **General Populations are platform-curated.** Their data quality is Vurvey Labs' responsibility; if a population doesn't match your audience, talk to your CSM.
- **Two view modes only.** Charts (visualization dashboard) and Table — no map / list / detailed-export views.
- **Pagination limits apply.** The personas table uses standard cursor-based pagination; very large populations require scrolling/loading.
- **The populations index default filter changes** when `enablegeneralpopulations` is on (defaults to `ALL` instead of `WORKSPACE`) — that's the only UX shift you'll notice as a customer when the flag flips on.
- **GraphQL discriminator-based rendering**: `__typename === "PmGeneralPopulation"` is what tells the index to use `GeneralPopulationCard`. If a future code change adds new population types, expect the discriminator pattern to extend.

---

## Best practices

- **Use General Populations for early-stage exploratory work.** Before investing in a custom Brand Population, see if a General Population gets you 80% of the way.
- **Combine in concept simulations.** Run the same concepts against a General Population AND your Brand Population — surfacing where they diverge can reveal niche signals.
- **Customer-specific brands need Brand Populations.** General Populations are deliberately generic; if your research is about your unique customer base, build a Brand Population.
- **Treat General Population data as reference, not ground truth.** It's curated for broad applicability, not statistical validity for your specific question.
- **Don't try to edit them.** The detail page is intentionally read-only. Customizations come via copying personas into your own population.
- **Check the visibility state.** If a General Population disappears from your index, it may have been hidden by Vurvey staff — ask before assuming it's broken.

---

## FAQ

#### How do General Populations differ from Brand Populations?
**Brand Populations** are workspace-scoped and customer-edited; **General Populations** are platform-curated and read-only. The detail pages are similar but the data lifecycles are different. See the comparison table above.

#### Can I edit a General Population?
No — they're platform-curated and read-only to customers. To customize, build a Brand Population alongside.

#### Why don't I see General Populations on the Populations index?
`enablegeneralpopulations` workspace flag is off. Ask your CSM.

#### Why is the visibility toggle missing from my dropdown?
You're not Vurvey Labs staff (`ENTERPRISE_MANAGER` / `SUPPORT` / `IMPLEMENTATION` UserRole). Customers don't see the toggle.

#### Can I use a General Population in a real campaign?
Yes — they show up in campaign Audience tab targeting just like Brand Populations. But General Populations contain AI personas, not real respondents — use them for AI-simulation flows or as audience targeting reference, not as the actual respondent list.

#### What if I want a population that doesn't exist as a General Population?
Build a Brand Population in your workspace. If you think the gap is platform-wide (other workspaces would also benefit), suggest it to your CSM as a candidate for a future General Population.

#### Why does the populations index show both kinds together?
By design — the populations browsing experience is meant to span both kinds. The `__typename` discriminator picks the correct card component for each item. Filter to `WORKSPACE` or `GENERAL` if you want to see only one kind.

#### Are General Population personas the same as my Agents?
No. Personas in a General Population are population members (research targets, simulated respondents), not Agents you interact with conversationally. Agents are configured AI personas you author and chat with — see [Agents](/guide/agents).

#### Why are some General Populations hidden?
Vurvey staff hide them during pre-launch curation, sunsets of older versions, or for customer-specific embargoes. If a General Population you used last week is gone, ask your CSM whether it was hidden.

#### Can I export a General Population's personas?
Not natively from the UI. For analysis outside Vurvey, consult engineering — population-data exports may be available via GraphQL but aren't a customer-facing self-service feature.

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| `/people/populations/general/:id` redirects out with a toast | `enablegeneralpopulations` flag is off. |
| General Population I used yesterday is gone | Vurvey staff may have hidden it. Ask your CSM. |
| Visibility toggle missing | You're not Vurvey Labs staff. Customers don't see this action. |
| Access denied on a specific General Population | The population is in a hidden state and you don't pass `isEnterpriseManagerOrImplementation`. |
| Charts view shows no data | The population has no personas configured yet OR a transient query error — switch to Table view to confirm. |
| Table view shows zero rows | Same root cause as above; or the cursor-pagination failed to advance. Refresh. |
| View Agent Details modal opens empty | The persona record is missing fields — likely a curation incomplete state. Report to support with the persona ID. |
| Persona Carousel doesn't load | Network / data-fetch issue. Refresh; if persistent, try Table view as fallback. |

---

## Cross-references

- [People](/guide/people) — the parent area for both Brand and General Populations
- [Concept Simulations](/guide/concept-simulations) — Step 3 lets you pick a General Population as the simulation audience
- [Campaigns](/guide/campaigns) — Audience tab can target General Populations for AI-population simulation
- [Capabilities](/guide/capabilities) — capability blueprints may bind a General Population as an input
- [Settings → workspace feature flags](/guide/settings#workspace-flags-you-may-encounter) — `enablegeneralpopulations`
- [Permissions & Sharing](/guide/permissions-and-sharing#layer-1-workspace-roles) — `isEnterpriseManagerOrImplementation` gates the visibility toggle
- [Glossary → Population, General Population](/guide/glossary#p)
- [What's New](/guide/whats-new) — General Populations rollout status
