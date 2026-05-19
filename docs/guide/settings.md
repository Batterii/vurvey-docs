---
title: Settings
---

# Settings

The Settings area is the workspace's self-service control surface — identity, session policy, AI models, integrations, brand templates, and developer API apps. It is **per-workspace**, so switching workspaces switches which settings you're editing.

This page is **out of date in older revisions** — the Settings shell now exposes **five** sub-navigation tabs (not two) and General Settings has grown an Integrations section, a Topic Graph toggle, an Enforce SSO option, and an Appearance Settings panel. The rewrite below is current to `master`.

![General Settings — Session, Identity, Plan, Integrations](/screenshots/settings/01-general-settings.png?optional=1)
![Force logout modal (session timeout)](/screenshots/settings/02-force-logout-modal.png?optional=1)
![AI Models page](/screenshots/settings/03-ai-models.png?optional=1)
![Brand Templates page (conditional)](/screenshots/settings/04-brand-templates.png?optional=1)
![Developer API Apps page](/screenshots/settings/05-api-apps.png?optional=1)
![SharePoint card (conditional)](/screenshots/settings/06-sharepoint-card.png?optional=1)
![Synthesio card (conditional)](/screenshots/settings/07-synthesio-card.png?optional=1)
![Tremendous card (conditional)](/screenshots/settings/08-tremendous-card.png?optional=1)
![Topic Graph workspace toggle](/screenshots/settings/09-topic-graph-toggle.png?optional=1)
![Enforce SSO option (conditional)](/screenshots/settings/10-enforce-sso.png?optional=1)

---

## Sub-navigation

Document title: **Vurvey - Workspace Settings**. Sub-nav header: **Settings**.

| Tab | Route | Icon | Visibility |
|---|---|---|---|
| **General settings** | `/{workspaceId}/settings` | Settings gear | Always (default landing). |
| **AI Models** | `/{workspaceId}/settings/ai-models` | Models | Always. |
| **Integrations** | `/{workspaceId}/settings/integrations` | Linked services | Tab **renders in the sub-nav** but the route is **not mounted** in `workspace-routes.tsx`. Clicking it does not load a working integrations hub today — use the integration cards inside General Settings or [Account & Profile → Integrations](/guide/account#integrations-me-integrations) when Composio is enabled. _This is a known UI/route mismatch._ |
| **Brand Templates** | `/{workspaceId}/settings/brand-templates` | Notes/edit | Only when `workspace.customTemplatesEnabled` is true. Direct navigation to the route with the flag off `<Navigate to=".." relative="path" replace />`s back to General Settings. |
| **Developer API Apps** | `/{workspaceId}/settings/api-apps` | Code XML | Always (the route is mounted unconditionally; the underlying Developer API features may still be gated by workspace API-management permissions). |

::: warning Integrations tab vs Integrations cards
The **Integrations** tab in the sub-nav is currently a dead link in master — the route isn't wired up. The cards labelled _Tremendous_, _Synthesio_, and _SharePoint_ that you may have heard about live inside **General Settings** instead, near the bottom of the page (conditional on the workspace's integration flags).
:::

::: info "API Apps" route correction
Earlier docs said the Developer API Apps page is at the **top-level `/api-apps`** route. That was wrong. The correct route is **`/settings/api-apps`** (a child of the Settings shell). The component (`ApiManagementContent`) is the same one used elsewhere; only the path was misdescribed.
:::

---

## General Settings

The default landing tab. The current page renders these sections in order, separated by horizontal rules.

### 1. Session Timeout

Description: _"Configure the session timeout settings for your workspace. Set the time limit for inactivity before users are automatically logged out of the platform."_

Display:
- `No Limit` (when `workspace.forceLogout = false`), or
- `{N} minutes` (when `forceLogout = true`, where N is `forceLogoutPeriodMin` or default 15).

Edit via the **Edit** button → opens the **Force User Logout Modal**:

| Control | Effect |
|---|---|
| **Enforce timeout** switch | Toggles `workspace.forceLogout`. |
| **Minutes** number input | Sets `workspace.forceLogoutPeriodMin` (only enabled when the switch is on). |
| **Save** | Calls `UPDATE_WORKSPACE` with `{forceLogout, forceLogoutPeriodMin}` and closes. |
| **Cancel** | Discards changes and closes. |

When enabled, the policy is enforced platform-wide for every user in the workspace.

### 2. Workspace Name

Display: the current `workspace.name` as a large subheader plus an **Edit** button. Edit opens the **Change Workspace Name Modal** — a single-input modal with **Save** / **Cancel**.

### 3. Workspace Avatar

Display: the current avatar (using `workspace.logo.thumbnail` if set, falling back to first-name-initial of workspace name). **Edit** opens the **Edit Picture Modal**:

- Title: **Workspace avatar**
- Description: _"Upload an avatar to represent your workspace visually."_
- On save, calls `CREATE_WORKSPACE_LOGO` → `UPDATE_WORKSPACE` with `{logoId}` → triggers `refetchQueries: ["GetWorkspace"]` so the new logo appears immediately.

### 4. Topic Graph Toggle

Description: _"When enabled, campaigns in this workspace show a live topic graph under the Insights tab."_

A single `Switch` bound to `workspace.topicGraphEnabled`. Toggling calls `SET_TOPIC_GRAPH_ENABLED`:

- **Optimistic update**: the switch flips immediately on the client.
- **Rollback on error**: if the mutation fails, the switch reverts and a failure toast appears.
- **Refetch**: `WORKSPACE_TOPIC_GRAPH_FLAG` query is refetched so any other component watching the flag sees the new value.

::: tip Why a workspace toggle?
The Topic Graph (see [Topic Graph (Insights)](/guide/topic-graph)) is a relatively expensive analysis pipeline. Workspaces that don't use it can keep it off to skip the per-campaign computation. The default is on for new workspaces; some legacy workspaces may have it off and not realize they're missing the Insights tab on campaigns.
:::

### 5. Enforce SSO (conditional)

Visible only when **both**:

- `config.featureToggles.enforcesso` is true (build-time / env feature toggle).
- The current user is Vurvey Support/Enterprise staff, OR is a workspace Owner, OR is a workspace Administrator.

Description: _"When enabled, members must sign in through your configured SSO provider."_

A `Switch` toggling `enforceSsoEnabled`. When on, password-based sign-in is blocked for workspace members; only the configured SSO provider can authenticate them. Configure the provider in [Super Admin → SSO Providers](/guide/admin#sso-providers-admin-sso-providers).

### 6. Current Plan

Renders a `PlanCard` showing the workspace's subscription tier, included features, and a path to upgrade or modify. The card is read-only here — billing changes are handled outside this page.

### 7. Integrations section _(conditional)_

This whole block only renders when at least one of these is true:

- The workspace has Tremendous reward settings (`isTremendousActive = workspaceRewardSettings.length > 0`).
- `workspace.synthesioEnabled` is true.
- `workspace.sharepointEnabled` is true.

When it renders, each card appears in order (if its condition holds):

#### Tremendous Card

For workspaces that have set up Tremendous payouts. Click to manage the connection. The first-time setup path is the [Rewards](/guide/rewards) page, not this card — the card only appears after a reward settings row exists.

#### Synthesio Card

For workspaces with `synthesioEnabled = true`. Description: _"Connect Synthesio to import social listening data — mentions, sentiment, and topics — directly into datasets for AI analysis."_

Status messages:
- _"Checking connection status..."_ during the `GET_SYNTHESIO_INTEGRATION` query.
- _"Unable to load connection status."_ on error.
- _"Not connected"_ when `integration?.isActive` is false.
- _"Connected • Last updated {timestamp}"_ when active.

The button opens the **SynthesioIntegrateModal** — see [Mentions → Synthesio Social-Listening Mentions](/guide/mentions#3-synthesio-social-listening-mentions) for the full setup flow.

#### SharePoint Card

For workspaces with `sharepointEnabled = true`. Description: _"Connect SharePoint so workspace admins can import files directly into datasets for indexing and embeddings without local downloads."_

Permission gate: the underlying connection-status query is **skipped** unless the current user has the `sharepointSettings` permission (literal string match on the workspace's `permissions[]` array). Without the permission, the card displays _"Workspace admin access required."_ as its status message.

When the user can manage SharePoint:
- _"Checking connection status..."_ during query.
- _"Unable to load connection status."_ on error.
- _"Not connected"_ when no client secret is set.
- _"Connected • Last validated {timestamp}"_ when the connection has been verified.

The configure button opens the **SharePoint Integrate Modal** — same flow described in the previous version of this doc (Tenant ID, Application Client ID, Client Secret Value, optional Site URL, Test Connection action). After a connection is saved, a **Delta Sync Section** appears below the card for managing incremental syncs.

### 8. Appearance Settings

A separate component at the bottom of General Settings — typically housing dark-mode and theme-related toggles that affect how the workspace renders for this user. Distinct from the personal Dark Mode toggle in [Account & Profile](/guide/account#3-dark-mode) — workspace appearance settings affect the workspace, not the individual user.

---

## AI Models (`/settings/ai-models`)

A searchable browser for the AI models provisioned to the workspace. The list is **workspace-driven** — different workspaces can have different model catalogues, and a legitimate state is _empty_.

### What you see

- A **search input** at the top.
- Models **grouped by category** (e.g. Generation, Embedding, Vision, etc.).
- A `ModelCard` per model with name, provider, version, and capability badges.
- Empty state when no models are provisioned for the workspace: _"No AI models available for this workspace."_

### What this page is not

It is **not** where you select which model an Agent uses — that happens in the Agent Builder (see [Agents](/guide/agents)). This page is a catalogue: "what's available?", not "which one is picked?".

::: tip Why a workspace can have an empty model list
Some enterprise workspaces are provisioned with explicit model curation — Vurvey staff choose which models the workspace can use. Until that curation is set up (or in workspaces using legacy default-model fallbacks), the page renders empty. This is expected, not a bug.
:::

---

## Brand Templates (`/settings/brand-templates`) — _conditional_

Visible only when `workspace.customTemplatesEnabled = true`. Direct navigation to the route with the flag off redirects you back to General Settings.

This is the workspace-scoped library of **campaign templates** owned by your workspace (as opposed to the cross-platform **Global Campaign Templates** managed in [Super Admin](/guide/admin#global-campaign-templates-admin-campaign-templates)). When enabled:

- The team can save campaigns as templates with reusable question structures, prompts, and configurations.
- New campaigns can be cloned from this library with one click.
- Templates are scoped to the workspace — different workspaces don't share Brand Templates with each other.

To enable for a workspace: flip `customTemplatesEnabled` via Super Admin → Manage Workspaces (or backend update). There is no Settings UI for this flag.

---

## Developer API Apps (`/settings/api-apps`)

The platform's workspace-scoped API key management surface. Mounts `ApiManagementContent`, the same component used by the Brand Companion **Manage API Key** modal but in the broader view (every API app for the workspace, both **Public** companion apps and **Developer** server-to-server apps).

### What's on the page

- **Sort** controls (by name, type, last used).
- **API Docs** link.
- **Create API App** button — opens the **Create API App Modal**, creates a `Developer`-type app with explicit `allowedDomains`.
- A table of every API app for this workspace, showing **Client ID** (consumerKey), app type, allowed domains, last validation timestamp.
- Per-row actions: **Edit** (manage allowed domains), **Regenerate Credentials** (where the app type allows), **Delete**.

See [Brand Companions → API App types: Public vs Developer](/guide/brand-companions#api-app-types-public-vs-developer) for the difference between the two app types you'll see here.

::: warning Page may be gated
While the route is always mounted, the underlying Developer API features may still require `apiManagementEnabled` on the workspace. If you see an "API Management not enabled" empty state, that's the workspace-level flag missing, not a permissions issue at this page.
:::

---

## Where Manage Users lives (not here)

**Manage Users / Workspace Members is a separate page** from the Settings sub-nav. It's mounted at `/{workspaceId}/members` (component `WorkspaceMembersPage`), reached typically through a header dropdown rather than the Settings tab strip. The Settings tab strip does not include a Members entry.

Features in Manage Users:

- Header actions: **Transfer Ownership**, **Add Users**.
- **Search Members** input.
- Role filter dropdown: **All roles**, **Administrator**, **Manager**, **Owner**, and optional **Guest** (only when guest mode is enabled).
- Upgrade banner during trial/pending-upgrade states.
- Per-row `⋮` menu: **Edit** (switches to inline role edit with Save/Cancel) and **Remove** (opens confirmation).
- **You cannot perform member-management actions on your own account** (same self-protection rule as [Super Admin → Manage Vurvey employees](/guide/admin#manage-vurvey-employees-admin-vurvey-employees)).

### Modals

| Modal | Behavior |
|---|---|
| **Invite Members** | Email tag-input, comma/Enter to commit, role radios for Owner / Admin / Manager / Guest (Guest conditional), **Add Member** action. |
| **Confirm deletion of user** | Removal with optional ownership-transfer selector when the target owns resources. |
| **Transfer Workspace Ownership** | User selector + a resource-type dropdown: **All resource types**, **Campaigns**, **Datasets**, **Workflows**, **Ai-personas**. Transfer can be scoped per resource type. |

### Roles (the customer-side view)

| Role | Capabilities |
|---|---|
| **Owner** | Highest. Can transfer ownership, change billing/plan, configure SSO enforcement, manage all members. |
| **Administrator** | Broad workspace administration — can manage members and most settings, can't transfer ownership. |
| **Manager** | Standard non-owner collaborator — full member capabilities but limited admin scope. |
| **Guest** | Only when guest mode is enabled for the workspace. Reduced-surface user (see [Account & Profile → guest mode](/guide/account#how-to-open-it)). |

::: tip Customer roles vs Vurvey-staff UserRole
These four roles are **per-workspace ACL entries** on `REGULAR_USER` accounts. They are **not** the same as the GraphQL `UserRole` enum (`REGULAR_USER`, `ENTERPRISE_MANAGER`, `SUPPORT`, `IMPLEMENTATION`, `SERVICE_ACCOUNT`). See [Permissions & Sharing](/guide/permissions-and-sharing#layer-1-workspace-roles) for the full breakdown.
:::

---

## Workspace flags you may encounter

Settings is the most flag-rich page in the app. Most flags don't have a Settings-UI toggle — they're flipped by Vurvey staff via [Super Admin → Manage Workspaces](/guide/admin#manage-workspaces-admin-workspaces). Settings just renders conditionally based on them.

| Flag | Surface affected |
|---|---|
| `forecast_enabled` | [Forecast](/guide/forecast) nav item |
| `composioEnabled` | [Account & Profile → Integrations](/guide/account#integrations-me-integrations) tab; integrations menus across the app |
| `synthesioEnabled` | Synthesio card in General Settings |
| `sharepointEnabled` | SharePoint card in General Settings |
| `topicGraphEnabled` | Insights tab on every campaign; toggled here in General Settings |
| `customTemplatesEnabled` | Brand Templates tab in Settings |
| `apiManagementEnabled` | Whether the Developer API Apps page is functional (route is always mounted) |
| `moldBuilder` | Molds tab in [Implementation](/guide/implementation#molds-implementation-molds-feature-flagged) |
| `agentBuilderV2Active` | Manage Agents 2.0 in Super Admin |

The integration cards (Tremendous, Synthesio, SharePoint) in General Settings are also conditional on their per-feature state — Tremendous requires existing `workspaceRewardSettings`, Synthesio requires `synthesioEnabled`, SharePoint requires `sharepointEnabled`. So a workspace can have the flag on and still not see the card if the underlying integration isn't set up yet.

---

## Constraints & limitations

- **The Integrations tab in the sub-nav is broken.** Route isn't wired in master. Don't promise customers an Integrations hub here — point them at General Settings cards or Account & Profile.
- **`/api-apps` is at `/settings/api-apps`**, not top-level. Earlier docs misstated this.
- **Brand Templates is feature-flagged.** Flag off = direct navigation redirects to General Settings.
- **Topic Graph toggle is optimistic.** A failed mutation rolls the switch back and toasts — there's no confirmation dialog.
- **Enforce SSO is double-gated** (build-time `enforcesso` toggle AND user role/ownership). Most workspaces never see the option.
- **Integration cards are conditional on per-feature flags AND state.** A flag-enabled workspace with no connection set up will see no card.
- **Session timeout is workspace-wide.** It applies to every member, including admins, including you. Set carefully.
- **SharePoint card respects `sharepointSettings` substring permission.** Non-admin viewers see "Workspace admin access required" rather than the connection status.
- **AI Models page is a catalog**, not a chooser. The Agent Builder is where you pick the model for a specific persona.
- **Manage Users is a separate page** at `/members`, not under Settings. Don't look for it in the sub-nav strip.

---

## Best practices

- **Set session timeout deliberately.** Too aggressive (5 min) and admins get logged out mid-meeting. Too loose (no limit) and stolen sessions are a real risk. 30–60 minutes is a reasonable default for most teams.
- **Lead with Topic Graph toggle awareness.** If your team complains "we don't see Insights on campaigns", check this toggle first.
- **Don't enable Enforce SSO until your SSO provider is verified.** Locking out the workspace because no one can authenticate is a real outage.
- **The Brand Templates library is yours, not Vurvey's.** Curate it as carefully as Global Campaign Templates curate the platform.
- **Audit Developer API Apps quarterly.** Stale Public-type apps with old client IDs pile up. Use the sort to find old ones; revoke what you don't recognize.
- **Treat the Workspace Avatar as part of brand identity.** It surfaces in workspace switchers and emails — a recognizable image saves seconds across hundreds of switches per week.
- **When setting up a workspace from scratch**, work top-down: identity (name, avatar) → Topic Graph → Integrations (Tremendous, Synthesio, SharePoint as needed) → Models check → templates → API apps. Following the page order is a reasonable runbook.
- **Use Personal Profile for per-user preferences**, not Workspace Settings. Dark Mode in Workspace Settings affects the workspace's appearance; Dark Mode in Personal Profile affects only your view.

---

## FAQ

#### Why is there only one workspace per Settings page?
Workspaces are tenants. You can only edit settings for the workspace you're currently in. Switch workspaces (top-left workspace switcher) to edit a different one.

#### Why does the Integrations tab go to a blank page?
Known issue — the tab is present in the sub-nav but the route isn't mounted in `workspace-routes.tsx`. Use the integration cards inside General Settings or [Account & Profile → Integrations](/guide/account#integrations-me-integrations) instead.

#### What's the difference between the Tremendous card here and the Rewards page?
Same data, different entry point. The Rewards page is the primary configuration surface (and the only one for first-time setup). The card here is a shortcut for workspaces that already have a Tremendous connection. See [Rewards](/guide/rewards#tremendous-integrate-modal-configure).

#### What's the difference between Personal Dark Mode and Workspace Appearance Settings?
Personal Dark Mode (in [Account & Profile](/guide/account#3-dark-mode)) is per-user — it follows you across devices. Workspace Appearance Settings (here, at the bottom of General Settings) are per-workspace and intended for tenant-level theming concerns.

#### How do I enable a workspace flag (forecast_enabled, sharepointEnabled, etc.)?
Open a Vurvey support ticket or talk to your CSM. The flags are flipped from Super Admin → Manage Workspaces (or backend update). There's no Settings UI for them.

#### Can I turn off Topic Graph for one campaign instead of the whole workspace?
No — the toggle is workspace-wide. If you need per-campaign control, that's a feature request.

#### Why can't I see the Enforce SSO option?
It requires both `config.featureToggles.enforcesso` (build/env-level) to be on AND your user to be a workspace Owner, Administrator, or Vurvey staff member. If you're an Owner but still don't see it, the build toggle is off for your environment.

#### Where did the API Management tab go?
There never was a separate "API Management" tab in the Settings sub-nav. The Developer API Apps tab IS the API management page. Older docs that called it API Management were referring to the same thing.

#### Is the Brand Templates page the same as the Global Campaign Templates in Super Admin?
No. Brand Templates is **workspace-scoped** — your team's reusable templates. Global Campaign Templates (in Super Admin) is **platform-wide** — templates available to every workspace.

#### What happens if I delete a Public API App from Developer API Apps that's used by a live Brand Companion embed?
The embed breaks. There's no soft-delete or grace period. See [Brand Companions](/guide/brand-companions#manage-api-app-modal) for safer credential rotation patterns.

#### Can I rename the workspace if I'm not the Owner?
Depends on your customer-side role. Administrators can typically rename; Managers usually cannot. The Edit button on the Workspace Name section is what gates that — if it's disabled, you don't have permission.

#### Will changing the session timeout log everyone out immediately?
No. The new policy applies to **future inactivity windows**. Already-active sessions continue until they next hit the (new) timeout.

#### Why does the SharePoint card sometimes say "Workspace admin access required" even though I'm an Admin?
The card checks the literal `sharepointSettings` substring on the workspace's permissions array, not your customer-side role. SharePoint setup is its own permission, typically granted to a subset of admins. Ask a Workspace Owner to grant it.

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| Integrations tab opens a blank page | Known: route not mounted. Use General Settings cards or Account & Profile → Integrations. |
| Brand Templates tab missing | `workspace.customTemplatesEnabled` is false. Open a support ticket to enable. |
| Brand Templates URL redirects me out | Same root cause — flag is off. Server-side `Navigate to=".." replace` runs in the route. |
| Tremendous card missing in General Settings | No `workspaceRewardSettings` row exists yet — first-time setup goes through the [Rewards](/guide/rewards) page, not this card. |
| Synthesio card missing | `workspace.synthesioEnabled` is false. Ask a CSM. |
| SharePoint card missing | `workspace.sharepointEnabled` is false. Ask a CSM. |
| SharePoint card shows "Workspace admin access required" | You lack the `sharepointSettings` permission. Ask a Workspace Owner. |
| Topic Graph toggle won't flip | Network or permission error. The optimistic update rolled back; toast should explain. Refresh and retry. |
| Enforce SSO option missing | Either the build toggle `enforcesso` is off, OR you're not Owner/Admin/Vurvey staff. Both gates must pass. |
| Cannot find Members | It's not in the Settings sub-nav. Use the workspace header dropdown → Members, or navigate to `/{workspaceId}/members` directly. |
| AI Models page is empty | The workspace has no models provisioned. Expected for some configurations; talk to a CSM if you expected models to be there. |
| Developer API Apps page shows "not enabled" | The workspace lacks `apiManagementEnabled`. The route is always mounted but the feature is gated. |
| Workspace name save fails with an error | A name collision or validation error. Try a more distinctive name. |
| Avatar upload spins forever | Media upload pipeline issue. Try a smaller image (under ~5MB), JPG or PNG. |
| New session timeout doesn't appear to apply | Existing sessions continue until next inactivity timeout. New behavior applies on next idle. |

---

## Related guides

- [Account & Profile](/guide/account) — per-user settings, separate from workspace settings
- [Admin (Enterprise)](/guide/admin) — where workspace flags are flipped and members are administered platform-wide
- [Permissions & Sharing](/guide/permissions-and-sharing) — workspace roles and per-resource sharing
- [Integrations](/guide/integrations) — the broader integration hub (where Composio surfaces); see also Account & Profile → Integrations
- [Rewards](/guide/rewards) — Tremendous setup and operations (primary surface for first-time setup)
- [Mentions → Synthesio](/guide/mentions#3-synthesio-social-listening-mentions) — full Synthesio setup flow
- [Brand Companions](/guide/brand-companions) — Public-vs-Developer API apps administered in `/settings/api-apps`
- [Topic Graph (Insights)](/guide/topic-graph) — the feature gated by the General Settings Topic Graph toggle
- [Forecast](/guide/forecast) — example of a workspace-flag-gated feature
- [Implementation](/guide/implementation) — staff-side equivalent of this page
