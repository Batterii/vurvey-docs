---
title: Super Admin (Enterprise)
---

# Super Admin (Enterprise)

**Super Admin** is the cross-workspace administrative area for Vurvey Labs employees and enterprise operators. It is mounted at `/admin/*` and is the place where things that affect _the platform_ (rather than a single workspace's research work) are configured: brand catalog, global templates, SSO, Vurvey employees, credit rates, cross-workspace agent administration, and Metabase-powered usage analytics.

> The page is labelled **Super Admin** in the UI; the URLs and codepaths use `admin`. Both names refer to the same thing.

![Super Admin landing (Metabase dashboard iframe)](/screenshots/admin/01-metabase-dashboard.png?optional=1)
![Manage Vurvey Employees](/screenshots/admin/02-manage-employees.png?optional=1)
![Update Employee Role modal](/screenshots/admin/03-update-employee-role-modal.png?optional=1)
![Manage Workspaces](/screenshots/admin/04-manage-workspaces.png?optional=1)
![Manage Brands](/screenshots/admin/05-manage-brands.png?optional=1)
![Global Campaign Templates](/screenshots/admin/06-campaign-templates.png?optional=1)
![SSO Providers](/screenshots/admin/07-sso-providers.png?optional=1)
![Manage Agents (with Agent Actions modal)](/screenshots/admin/08-manage-agents.png?optional=1)
![Manage Credits Rates](/screenshots/admin/09-credits-rates.png?optional=1)
![Manage Agents 2.0 (feature-flagged)](/screenshots/admin/10-manage-agents-v2.png?optional=1)

::: warning Internal-only feature
Super Admin is reserved for Vurvey Labs staff and a small set of enterprise support roles. It is not part of the customer-facing product experience. If you are a workspace admin and stumbled onto this doc looking for normal admin tasks (members, billing, integrations), go to [Settings](/guide/settings) instead.
:::

---

## Access control

Two gates govern who can reach Super Admin:

1. **`isAdminRole` check on the user context.** Anyone who fails this check is shown the toast _"You do not have access to this page"_ and immediately navigated to the workspace root (`/`). There is no in-page denial screen.
2. **Specific permissions per sub-page.** Even if you can land on `/admin`, individual sub-pages can have stricter requirements. For example, **Manage Vurvey employees** depends on the `vurveyEmployees:*` permission set; **Manage Credits Rates** is gated by `personaConversationCreditsEnabled` from the billing context for certain advanced views.

Document title once you land: **Vurvey - Admin**.

::: info Legacy URL redirects
A small helper component, `AdminRedirect`, handles legacy admin URLs without a workspace prefix (e.g. `/admin/brands` typed by an old bookmark). It transparently rewrites the URL to the workspace-scoped form (`/{workspaceId}/admin/brands`) on mount, preserving the search string and hash. You'll see a brief _"Redirecting to admin…"_ stub on the way.
:::

---

## Sub-navigation

The Super Admin shell renders **two button groups** in its `PageSubNavigation` header. The split is intentional — the left group is configuration-style work (templates, providers, brands); the right group is operational management (workspaces, employees, agents, surveys, billing).

### Left group — configuration

| Tab | Route | Icon |
|---|---|---|
| **Dashboard** | `/admin` (index) | Charts/Usage |
| **Manage Brands** | `/admin/brands` | User profile |
| **Global Campaign Templates** | `/admin/campaign-templates` | Table-template-edit |
| **SSO Providers** | `/admin/sso-providers` | Pen edit |
| **Manage Agents 2.0** _(conditional)_ | `/admin/agents-v2` | Persona |

### Right group — operations

| Tab | Route | Icon |
|---|---|---|
| **Manage Workspaces** | `/admin/workspaces` | Horn/Megaphone |
| **Manage Vurvey employees** | `/admin/vurvey-employees` | Community users |
| **Manage Agents** | `/admin/agents` | Persona |
| **Manage Surveys/Campaigns** | `/admin/surveys` | Horn/Megaphone |
| **Manage Credits Rates** | `/admin/credits-rates` | Pen edit |

**Practical count:** 9 always-visible tabs; 10 when **Manage Agents 2.0** is enabled. The split into two groups is purely visual — there's no permission or capability difference between left and right.

::: tip Feature flag: `agentBuilderV2Active`
The **Manage Agents 2.0** tab is gated by the `agentBuilderV2Active` workspace feature flag (read via `useFeatureFlag({flagName: "agentBuilderV2Active"})`). When off, the tab simply doesn't render in the sub-nav. The `/admin/agents-v2` route stays mounted in the router either way — but reaching it without the flag on means you bounced through the Super Admin shell and landed on a working page that may be partial/unstable. Don't promise this view to customers until the flag flips on platform-wide.

To enable for a workspace: flip `agentBuilderV2Active` on the workspace's feature flags (workspace flag table; not exposed in a customer-visible Settings UI). Ask engineering or check the workspace flag admin tooling.
:::

---

## Dashboard (`/admin`)

The landing page of Super Admin is an **embedded Metabase iframe**, not a custom Vurvey-built dashboard. It loads a signed URL via the `metabaseDashboardUrl` GraphQL query (`fetchPolicy: "network-only"` so the URL stays fresh) and renders Metabase full-bleed.

| State | What you see |
|---|---|
| URL returned successfully | The Metabase dashboard embedded as a 100%-width-and-height iframe with `allowFullScreen`. Anything you can do in Metabase you can do from inside this iframe (filters, drill-down, export). |
| Query errored | A small heading: **"The metabase dashboard couldn't be accessed."** No retry button — refresh the page to attempt again. |
| Initial load | Blank (the component returns an empty fragment until the URL or error arrives). |

The dashboard content itself is managed in Metabase, not in this repo. If you need a chart added or changed, talk to whoever owns the Vurvey Metabase instance.

---

## Manage Brands (`/admin/brands`)

A flat administrative view of every brand record in the platform. Brands are the visual/identity entities used by [Branding](/guide/branding) and connected to workspaces. From here, ops staff can audit brand records across all workspaces, look up which workspace owns a brand, and intervene when a brand is misconfigured.

Typical row actions (depending on permission) include editing the brand record and viewing the workspace that owns it. This view does not create new brands — those originate from inside a workspace.

---

## Global Campaign Templates (`/admin/campaign-templates`)

The shared template library that every workspace can clone from when creating a new campaign. Templates here are visible across the entire platform (subject to permission scoping). Each row exposes a contextual `⋮` menu with:

- **Update** — edit the template's metadata, questions, and configuration
- **Delete** — remove the template from the global library

Templates live alongside per-workspace templates; updating a global template does NOT push changes to past clones — clones are independent the moment they're created.

---

## SSO Providers (`/admin/sso-providers`)

Where Vurvey Labs configures Single Sign-On providers (Okta, Azure AD, Google Workspace, etc.) at the platform level. Each row in the table is a **provider configuration** that customer workspaces can be associated with by **domain**.

### Columns

| Column | What it is |
|---|---|
| **Provider Name** | Display name (e.g. _"Customer-X-Okta"_). |
| **Domain** | The email domain that triggers SSO routing (e.g. `customerx.com`). |
| **Active** | Badge showing _active_ or _inactive_. Inactive providers exist but won't route users. |
| **Config** | The serialized configuration object (often dropped down for inspection). |
| _(no header)_ | `⋮` dropdown with **Edit** and **Delete**. |

### Search

A search input filters the list by `providerName` (case-insensitive substring). No multi-field search.

### Modals

- **Add SSO Provider** (button) — opens the **SSO Modal** in create mode. Fields: provider name, domain, active toggle, config JSON.
- **Edit** (row action) — opens the same modal pre-filled, in update mode.
- **Delete** (row action) — opens a **Confirm Action** modal. Confirming triggers the `SSO_PROVIDER_DELETE` mutation and refetches.

### Mutations

- `SSO_PROVIDER_CREATE` — adds a new provider
- `SSO_PROVIDER_UPDATE` — updates an existing provider (no refetch — relies on cache update)
- `SSO_PROVIDER_DELETE` — removes a provider (refetches the list)

---

## Manage Workspaces (`/admin/workspaces`)

Cross-platform workspace administration. From here, support staff can look up any workspace (by name, id, or owner email), inspect its settings, see who its members are, and intervene when something is off (workspace flag flips, brand reassignment, feature toggles). Some sub-modals here are the same components used in the customer-facing Settings page — they just operate on whichever workspace you select instead of "current".

This is also the path for enabling workspace-level feature flags that aren't exposed in customer UI — for example flipping `forecast_enabled`, `agentBuilderV2Active`, `composioEnabled`, etc. See [Forecast](/guide/forecast) for one such flag.

---

## Manage Vurvey employees (`/admin/vurvey-employees`)

The internal directory of Vurvey Labs employees with platform-level access (not customer users). Document the access path for Support and Manager-tier internal staff.

### Toolbar

- **Search Employees** input (debounced) — filters the table by the search value (the server-side filter accepts `searchValue` and applies it to name + email).
- **Add Employee** button (filled, `+` icon) — opens the **Create Employees** modal. Disabled while any mutation on the page is in flight.
- **Filter** button (outlined, funnel icon) — opens the **Filter Panel** sidebar (described below).

### Table (100 rows per page, paginated)

| Column | Sortable | Notes |
|---|---|---|
| **Name** | ✓ asc/desc | The display name on the employee record. |
| **Email** | ✓ asc/desc | Corporate email (matches the SSO identity). |
| **Role** | — | One of **Support** or **Manager**. |
| **Status** | ✓ asc/desc | One of **Pending**, **Registered**, **Confirmed** (matches `UserStatus`). |
| **OpenFGA permissions synced?** | — | _Yes_ or _No_. For Support-role employees, _No_ is rendered with a not-synced color; _Yes_ with a synced color. Manager-role employees always show without color (sync isn't expected to apply the same way). |
| **Actions** | — | `⋮` dropdown. See below. |

### Row actions (`⋮` dropdown)

The menu items are conditionally included:

- **Sync permissions** (RocketLaunchIcon) — only appears when the row's role is `SUPPORT` AND `isSupportPermissionInSync = false`. Calls `UPDATE_SINGLE_VURVEY_EMPLOYEE_SYNC_STATUS_MUTATION` and shows a toast _"Synced openFGA permissions for employee 'name@vurvey.com'"_ on success.
- **Update role** (PenEditIcon) — opens the **Change Vurvey Employee Role** modal. Hidden when the row is the current user (you can't change your own role).
- **Delete** (BinDeleteIcon) — opens the **Delete User Confirm** modal. Hidden when the row is the current user.

When the row is **your own** and there are no other actions, the trigger displays a tooltip: _"You cannot perform actions on your own account"_, and the dropdown is fully disabled.

### Filter Panel (sidebar)

Opens on the right side of the page. Title: **Filter**. Theme: purple.

| Field | Options |
|---|---|
| **Status** | Not filtered / Pending / Registered / Confirmed |
| **Support Permission In Sync** | Not filtered / Yes / No |

Buttons:

- **Apply Filters** — filled; label changes to **"Apply Filters (N)"** when N filters are populated. Applies and closes the panel; resets to page 0.
- **Clear Filters** — outlined; resets all filter state and closes the panel.

Filter state is two-tier: unsaved changes (`unsavedFilter`) and applied (`filter`). The table refetches on apply, not on every keystroke.

### Modals

- **Create Employees Modal** — invite/create new internal users. Bulk mode (multiple emails at once).
- **Change Vurvey Employee Role Modal** — toggle between Support and Manager. Wired to `UPDATE_SINGLE_VURVEY_EMPLOYEE_MUTATION`. On success, toast: _"Updated role for employee 'name'"_.
- **Delete User Confirm Modal** — irreversible delete; sets `isDeleting` while the mutation runs so all other actions are disabled.

---

## Manage Agents (`/admin/agents`)

Cross-workspace administration of AI personas (Agents). From here, support staff can find a persona by id or name, look up which workspace owns it, and run platform-level actions that wouldn't be available from inside the owning workspace.

### Agent Actions modal

Each row exposes an `⋮` action. The flagship action exposed today is **Clone to Workspace** — copies the agent (instructions, knowledge bindings, capabilities) into a target workspace. Useful for templating "platinum" reference agents from the demo workspace into customer workspaces.

Other actions surface in the Agent Actions modal as the platform grows — keep an eye on this page for new entries (delete-across-workspaces, mass-update, persona-type conversions, etc.).

---

## Manage Agents 2.0 (`/admin/agents-v2`) — _feature-flagged_

A reimagined agent management UI under the `agentBuilderV2Active` workspace feature flag. When the flag is on, the tab appears in the sub-navigation; when off, the tab is hidden but the route still resolves.

**Why feature-flagged:** v2 introduces a new internal data model and a UI overhaul. Until the v2 path is fully validated on a meaningful customer base, v1 remains the default. The v1 page (`/admin/agents`) is unchanged and remains available regardless of the v2 flag.

**To enable:** flip `agentBuilderV2Active` on the workspace's feature flag record. There's no Settings UI for this — engineering owns the toggle. Migrating a workspace involves accepting that v2's internal IDs and lineage tracking may diverge from v1; plan accordingly.

---

## Manage Surveys/Campaigns (`/admin/surveys`)

Platform-wide view of every campaign (formerly "Survey") in every workspace. Filters by workspace, status, and creator. Row actions typically include:

- **Clone Survey** modal — duplicate a campaign across workspaces with optional response inclusion. Useful for promoting a customer's hand-built campaign into the global templates library, or for spinning up a debug copy.
- **YAML Import** modal — bulk-create campaigns from a YAML manifest. Accompanied by a YAML Import Rules modal that describes what the supported manifest fields are.
- **Manage Hidden** modal — toggle a campaign's hidden flag (used to soft-archive a campaign without deleting responses).
- **Manage "is Vurvey"** modal — flag whether a campaign was created by Vurvey staff vs a customer (used in some attribution and analytics filters).

---

## Manage Credits Rates (`/admin/credits-rates`)

The platform-level credit pricing schedule. **Credits** are the unit that powers most Vurvey AI operations (LLM calls, agent runs, video transcription); a workspace burns credits and is billed based on the active rate when the credit was burned. This page is where the rate table is maintained.

### The three sections

Rates are grouped by their `effectiveDate` relative to now:

| Section | Definition |
|---|---|
| **Current rate** | The single rate whose `effectiveDate <= now` and where no other rate has a later `effectiveDate` that is still ≤ now. Exactly one row, or none if no rates are configured. |
| **Future rates** | All rates with `effectiveDate > now`, sorted ascending (most-upcoming first). |
| **Historical rates** | All rates with `effectiveDate < now` and not the current rate, sorted descending (most recent first). Hidden by default behind a **Show Historical** toggle. |

A rate flips from future → current → historical automatically as time passes — there is no manual "activate" action.

### Actions

- **Create Credit Rate** (button) → opens **Create Credit Rate Modal**. Fields include the rate name, the credit-to-currency multipliers, and the `effectiveDate`. Saving creates a new row that immediately classifies into one of the three sections based on its effective date.
- **Edit** (row action) → opens **Edit Credit Rate Modal** pre-filled with the row's data.
- **Delete** (row action) → opens a **Confirm Action** modal. On confirm, calls `DELETE_CREDIT_RATE`. Be careful: deleting a historical rate that has already been billed against does not retroactively change past billing — billed credits remain at their original rate.

### Billing-context flag

The page reads `personaConversationCreditsEnabled` from `useBillingContext`. When this is enabled, additional rate columns (e.g. per-conversation pricing) become visible. The flag is a workspace-level billing setting — flip it in workspace flags to expose the relevant columns.

---

## What this section is _not_ for

- **Day-to-day workspace research work** — that's [Campaigns](/guide/campaigns), [Datasets](/guide/datasets), [Agents](/guide/agents), [Workflows](/guide/workflows).
- **Workspace-level settings (members, billing, integrations)** — those live under [Settings](/guide/settings).
- **Taxonomy, system prompts, agent personalities, Molds** — these live under [Implementation](/guide/implementation), not Super Admin. (Older docs that put them here are out of date.)

---

## Constraints & limitations

- **Toast-driven access denial.** When you fail the `isAdminRole` check, the toast fires and you are redirected. There is no static "access denied" page you can deep-link to.
- **You cannot act on your own employee record.** The Manage Vurvey employees actions are conditionally hidden for the current user.
- **Metabase iframe is single-failure.** If the Metabase URL query errors, you see an inline error with no automatic retry — refresh the page.
- **Manage Agents 2.0 is feature-flagged.** Don't promise it to customers until the workspace flag is on.
- **Deleting a credit rate is not retroactive.** Past invoices billed against the deleted rate stand.
- **Sub-page sort and filter state is per-session.** Refreshing the page resets filters and sort to defaults.
- **Search in employees, SSO, and agents is name-only.** No combined name+email or domain+config search.
- **Legacy URL redirect happens once.** If you re-type a legacy URL after the redirect, you skip the redirect entirely (because the workspace-scoped URL is now your starting point).

---

## Best practices

- **Use the Metabase dashboard for usage questions, not GraphQL ad-hoc.** The dashboard is curated and consistent across staff; ad-hoc queries diverge.
- **Always confirm workspace identity** before flipping flags in Manage Workspaces. Workspaces with similar names exist; the IDs are the source of truth.
- **Sync OpenFGA permissions** for new Support hires before sending them their first ticket. The Sync Permissions action exists because the OpenFGA propagation isn't always immediate on user creation.
- **Schedule credit-rate changes in advance.** Set the `effectiveDate` to a future midnight rather than "now"; gives invoicing pipelines time to pick up the change cleanly.
- **Don't delete SSO providers without first checking domain ownership.** A misconfigured delete can lock out an entire customer org.
- **Prefer "Inactive" over Delete on SSO.** The Active toggle achieves the same routing effect without a destructive action.
- **Update global templates carefully.** Updates do not propagate to existing clones in customer workspaces — the customer keeps the old version of the template. This is by design (you don't want to push schema changes into live workspaces), but it means template hygiene is on the publisher.

---

## FAQ

#### Why is the page called "Super Admin" but the URL says `/admin`?
Historical naming. The UI label was promoted to "Super Admin" to distinguish from workspace-level admin (which lives in Settings); the routes stayed as `/admin`. Both refer to the same place.

#### Can a workspace owner reach Super Admin?
Only if they also have the platform-level `isAdminRole`. Most customer-side workspace owners do not — Super Admin is for Vurvey Labs staff. Workspace owners reach _workspace_ admin via Settings.

#### How do I tell whether a user has `isAdminRole`?
Check the user record in Manage Vurvey Employees — Support and Manager roles both satisfy the check. Customer-side users will not appear in that list at all.

#### Why is "Manage Agents 2.0" not showing up for me?
The `agentBuilderV2Active` workspace feature flag is off. Engineering owns the toggle. Once on, the tab appears in the left sub-nav group.

#### Where do I configure Taxonomy / System Prompts / Molds?
[Implementation](/guide/implementation). They were previously thought of as admin tasks but live in their own area now.

#### Can I disable an SSO provider without deleting it?
Yes — use the **Active** toggle in the SSO Modal. Inactive providers stay configured but don't route users.

#### What's the difference between Manage Agents and Manage Agents 2.0?
Same domain (cross-workspace agent administration), different UI generation. v1 is the production path today; v2 is the next-gen UI behind the `agentBuilderV2Active` flag.

#### Why can't I delete myself from the employee table?
By design — accidental self-lockout would brick the platform for staff. You'd need another admin to remove your record.

#### How are credit rates linked to billing?
Each rate has an `effectiveDate`. When a workspace burns credits, the rate active at that timestamp is what they're billed against. Future rates are visible in the table for planning; historical rates are kept so past billing can be audited.

#### Can I bulk-import campaigns?
Yes, via the YAML Import modal on Manage Surveys/Campaigns. The YAML Import Rules modal documents the manifest format.

#### How do I look up which workspace a brand belongs to?
Manage Brands → row action **View Workspace** (or similar — UI text varies).

#### Does Manage Workspaces show deleted workspaces?
No by default. Filters exist to include archived/deleted workspaces; the UI defaults to active only.

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| `/admin` shows the toast _"You do not have access to this page"_ | Your user record doesn't satisfy `isAdminRole`. Talk to a Manager or Engineering. |
| Metabase iframe says _"couldn't be accessed"_ | `metabaseDashboardUrl` query errored. Refresh; if persistent, the Metabase instance or its embed signing service is down. |
| Manage Agents 2.0 tab is missing | `agentBuilderV2Active` flag is off for your current workspace context. The flag is workspace-scoped. |
| Sync permissions action doesn't appear in dropdown | The row's role isn't Support, OR the row already shows _"Yes"_ in OpenFGA permissions synced. |
| Can't sort by Role | Role column is intentionally not sortable (two-value field). |
| "Apply Filters" is showing zero results | The filter combination is too tight. Click Clear Filters and start over. |
| Edit SSO Modal won't save | The `config` JSON failed validation. Inspect the field — config must be parseable JSON matching the provider's expected schema. |
| Deleting a credit rate didn't change historical billing | Correct behavior — deletes are not retroactive. Past billing stays at the rate active at the time. |
| Clone Survey modal hangs on submit | Cross-workspace clones can take a moment with large response sets. Watch the toast; the mutation can run for tens of seconds for large campaigns. |
| `/admin/...` URL bookmark from before workspaces existed | The `AdminRedirect` component will re-route once. After that, your URL is the workspace-scoped form. |
| Manage Workspaces shows no rows | Filter is set too narrowly (e.g. archived-only). Adjust filters. |

---

## Related guides

- [Settings](/guide/settings) — customer-facing workspace settings, members, billing, integrations
- [Integrations](/guide/integrations) — workspace-level connection management (Synthesio, Tremendous, Composio, etc.)
- [Branding](/guide/branding) — the brand records administered from Manage Brands
- [Implementation](/guide/implementation) — where taxonomy, system prompts, agent personalities, and Molds live (previously thought of as admin)
- [Forecast](/guide/forecast) — example of a workspace feature gated by a Super-Admin-only flag flip (`forecast_enabled`)
- [Permissions & Sharing](/guide/permissions-and-sharing) — the broader role and permission model that backs `isAdminRole`
- [Brand Companions](/guide/brand-companions) — `/api-apps` lives at workspace scope but is administered alongside Manage Brands at platform scope
