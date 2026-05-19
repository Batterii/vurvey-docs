---
title: Permissions & Sharing
---

# Permissions & Sharing

Vurvey's authorization model has **two layers**:

1. **Workspace roles** — a coarse-grained role on the user's identity (`REGULAR_USER`, `ENTERPRISE_MANAGER`, `SUPPORT`, `IMPLEMENTATION`, `SERVICE_ACCOUNT`). These gate entire areas of the app (Super Admin, Implementation, etc.).
2. **Per-resource sharing** — fine-grained access on individual resources (Agents, Campaigns, Datasets, Workflows). These are stored as relationship tuples in **OpenFGA**, Auth0's relationship-based access-control engine. The Share dialog you see in the UI is a window into those OpenFGA tuples.

Understanding the boundary between the two is the difference between "I can't open this dataset" (per-resource sharing) and "I can't see the Admin tab" (workspace role).

> 📷 _Screenshot pending: Share dialog — General Access dropdown_
> 📷 _Screenshot pending: Share dialog — invite a member_
> 📷 _Screenshot pending: Share dialog — restricted access state_
> 📷 _Screenshot pending: Share dialog — wide access (viewer)_
> 📷 _Screenshot pending: No permission view_

---

## Layer 1: Workspace roles

Defined in `UserRole` GraphQL enum, with five values:

| Role | Used for |
|---|---|
| `REGULAR_USER` | The default. Customer workspace members (owners, admins, viewers — all map to this at the workspace-role level; finer admin distinctions live in workspace ACLs). |
| `ENTERPRISE_MANAGER` | Vurvey Labs staff who manage enterprise workspaces. Passes the `isEnterpriseManagerOrImplementation` and `isAdminRole` checks; can reach [Super Admin](/guide/admin) and [Implementation](/guide/implementation). |
| `SUPPORT` | Vurvey Labs support staff. Same admin-area access as Enterprise Manager, with an `isSupportPermissionInSync` shadow flag tracking OpenFGA propagation (see [Super Admin → Manage Vurvey employees](/guide/admin#manage-vurvey-employees-admin-vurvey-employees)). |
| `IMPLEMENTATION` | Vurvey Labs implementation engineers. Same access as Enterprise Manager via the `isEnterpriseManagerOrImplementation` check. |
| `SERVICE_ACCOUNT` | _"A service account with the same permissions as a regular user. Service accounts are used for programmatic access to Public APIs."_ — i.e. a bot identity behind your developer API apps. |

::: warning Customer admin vs Vurvey staff admin
"Workspace Owner" and "Workspace Admin" (which you see in the Members list under workspace Settings) are **not** the same as `ENTERPRISE_MANAGER`/`SUPPORT`. Customer-side admin is captured by a workspace-scoped ACL row on a `REGULAR_USER`, not by their `UserRole`. The `UserRole` only goes up to `ENTERPRISE_MANAGER`/`SUPPORT`/`IMPLEMENTATION` for Vurvey Labs staff.
:::

### Workspace-role gates around the app

Several pages run an early check against the user's `UserRole`. If they fail, you see a toast and get redirected silently. The high-impact ones:

| Area | Check | Code path |
|---|---|---|
| [Super Admin](/guide/admin) (`/admin/*`) | `isAdminRole` — typically `ENTERPRISE_MANAGER` or `SUPPORT` | `admin/containers/admin-page` |
| [Implementation](/guide/implementation) (`/implementation/*`) | `isEnterpriseManagerOrImplementation` | `context/permissions/implementation-route-guard.tsx` |
| [Brand Companions](/guide/brand-companions) (`/brand-companions/*`) | `isAdminRole` | `brand-companions/index.tsx` |
| [Mentions](/guide/mentions) (`/mentions/*`) | `isAdminRole` | `mentions/containers/mentions-page` |
| Brand Companion Themes (in [Branding](/guide/branding)) | `isSupportOrEnterpriseRole(user.role)` | `branding/containers/brand-settings` |
| [Forecast](/guide/forecast) (`/forecast/*`) | Per-workspace `forecast_enabled` flag (which is itself flipped by staff) | `forecast/containers/forecast-page` |

These are all silent-redirect checks. Customers who don't have access don't see a denial screen — they don't see the entry point at all.

---

## Layer 2: Per-resource sharing (OpenFGA-backed)

Four resource types support the **Share** dialog today, each routed through the same shared `GenericPermissionsModal` component:

| Resource | UI label | Internal model | Modal title example | Copy-link URL |
|---|---|---|---|---|
| **Agent** | Persona | `AiPersona` | _Share "Customer Insights" agent_ | `/agents/builder?id={personaId}` |
| **Workflow** | Workflow | `AiOrchestration` | _Share "Weekly Report" workflow_ | `/workflow/flows/{workflowId}` |
| **Dataset** | Training set | `TrainingSet` | _Share "Q4 Survey Data" dataset_ (uses the dataset's `alias` field) | `/datasets/dataset/{datasetId}` |
| **Campaign** | Survey | `Survey` | _Share "Holiday 2025" campaign_ | `/{workspaceId}/survey/{surveyId}/questions` |

Each entity has its own GraphQL queries and mutations, but they all conform to the same `EntityConfig` interface — so the UI behavior is identical across the four. The only differences are the modal title and the copy-link path.

### Two access levels in the UI: Editor / Viewer

The Share dialog surfaces just two access levels per user:

| Level | Practical behavior |
|---|---|
| **Viewer** | Read-only. Can open the item, browse its contents, and use it where read access is enough (e.g. chat with an Agent, query a Dataset). |
| **Editor** | Read + write. Can also modify the item's configuration, files, structure, etc. |

These map to underlying OpenFGA tuples on the server.

### Five permission primitives under the hood

The `PERMISSIONS` enum on the client matches OpenFGA relations on the server:

| Primitive | Internal name | Roughly equivalent to |
|---|---|---|
| **View** | `can_view` | Read-only access |
| **Edit** | `can_edit` | Read + write configuration |
| **Delete** | `can_delete` | Remove the resource |
| **Manage** | `can_manage` | Full admin including sharing changes |
| **Manage Schedules** | `can_manage_schedules` | Workflow-specific: can edit run schedules |

The Share dialog **does not** expose Delete or Manage as separate options; they ride along with implicit roles (e.g. the owner has all five). The two-button simplification is intentional UX, not a missing feature.

::: info Owners are special
The user who created a resource is the **Owner**. In the Share dialog, the owner row is labeled "Owner" and its permission selector is disabled — you can't downgrade an owner from the share dialog. To change ownership, use the resource's own action menu (where supported) or contact Vurvey support.
:::

---

## The Share dialog, end to end

Trigger: every supported resource has a Share / sharing-icon entry in its action menu or detail view. Clicking it opens the `GenericPermissionsModal`.

### Title row + Copy link

The modal title reads `Share "{name}" {resourceType}` (or `Share "{alias}" dataset` for datasets — datasets use the `alias` field, not `name`).

A **Copy link** button (with the `CopyDocumentsIcon`) places the resource's deep-link URL on your clipboard. The URL is generated per-entity using each `EntityConfig.generateCopyUrl`. Pasting this URL into a chat / email is the most common way to direct a teammate at a shared resource.

### General Access section

The top section of the modal lets you set the workspace-wide visibility of the resource. It uses a `Dropdown` with two options:

| Option | Icon | Description shown | Effect |
|---|---|---|---|
| **Restricted access** | 🔒 Lock | _"Only added users can view"_ | The resource is hidden from anyone not explicitly added below. |
| **Wide access** | 🌐 Globe | _"Anyone in the workspace can view"_ (or `"…can edit"` depending on level) | Every workspace member gets the chosen level. Defaults to **Viewer** when first switched on. |

When **Wide access** is selected, a secondary `SelectInput` appears with **Viewer** / **Editor**. Choosing Editor at wide level means _every member can modify_ — use sparingly.

If you switch from Wide → Restricted, the per-member rows you've added are preserved; only the broadcast bit is turned off.

### Invite Section

Below General Access, the Invite Section lets you add individual workspace members:

- **Add people** chip-input — picks from the workspace's member list (loaded server-side, all pages eagerly fetched in batches of 50).
- **Viewer / Editor** dropdown — the level the new member will get.
- **Add** button — applies the chosen level to every chip currently in the input.

### Member list

Below the invite section, every existing share row is listed with:

- **Avatar + name + email** (Users) or **Group name** (groups, when supported)
- **Permission selector** — `Viewer` / `Editor`, OR disabled in two cases:
  - The member is the **Owner** (labeled and locked).
  - **General Access is Editor** — i.e. everyone in the workspace is already at Editor level, so per-member controls are redundant.
- **Remove** action — un-shares the row. For the Owner, Remove is disabled.

::: tip Groups are first-class members
Beyond user members, OpenFGA can store group members (entire teams) with the same `OpenFgaGroupMemberType` shape. Group rows show a group name and no email — they grant the role to every user in the group. Group-based sharing is an enterprise feature surfaced through workspace-level configuration.
:::

### Loading & error states

- **Loading** — when the entity-members query is in flight, the body shows a spinner.
- **Network-only fetch** — each open of the modal re-queries (`fetchPolicy: "network-only"`) so you always see the current state, not a stale cache.
- **No-permission view** — if you open the Share dialog on a resource you don't have manage rights on, the modal swaps to a NoPermissionView with the message:
  > _"You don't have the necessary permission to manage this resource's permissions."_
  > _"Please contact your admin or owner to request access."_
  > [Close]

---

## How the layers compose

A user's effective access on a specific resource = the **union** of:

- **Their workspace role's implicit rights** (Owner/Admin have manage on most things; Member has nothing by default).
- **Wide access** on the resource (if set, grants the chosen level to every workspace member).
- **Their individual share row** (overrides Wide if more permissive).
- **Their group's share row** (also accumulates).

If any layer grants the access, they have it. If none do, they don't.

```
              ┌─────────────────────────────────────┐
              │       Effective access              │
              │  (UNION of all layers below)        │
              └─────────────────────────────────────┘
                                ▲
        ┌───────────────┬───────┴───────┬────────────────┐
        │               │               │                │
┌───────────────┐ ┌──────────────┐ ┌─────────────┐ ┌─────────────────┐
│ Workspace     │ │ Wide access  │ │ Individual  │ │ Group           │
│ role (Owner / │ │ (off / view  │ │ share row   │ │ share row       │
│ Admin / etc.) │ │  / editor)   │ │ (view/edit) │ │ (view/edit)     │
└───────────────┘ └──────────────┘ └─────────────┘ └─────────────────┘
```

The Share dialog edits the middle three layers. The leftmost (workspace role) is edited from **Settings → Members**.

---

## Special permission flows referenced by other features

### OpenFGA-denied error interception

Several pages (notably [Branding → Questions](/guide/branding#questions-branding-questions)) wrap their mutation calls with an `interceptOpenfgaError` helper. The helper:

1. Inspects the GraphQL error for an OpenFGA-permission-denied shape.
2. If matched, sets `isOpenfgaPermissionsDenied` on a context provider, which can swap the page into a permissions-denied view.
3. Otherwise falls through to the normal toast pipeline.

This lets the platform consistently distinguish "you don't have permission" errors from "the server blew up" errors.

### Guest mode

A separate workspace context flag (`shouldUseGuestMode`) reduces the user's surface even when their workspace role is valid. Guest mode is mainly used for limited-access user states (e.g. embedded experiences). It:

- Hides the Personal Profile sub-navigation tab strip (see [Account & Profile](/guide/account#the-three-tabs)).
- Hides the Dark Mode toggle.
- Limits other features through inline checks scattered across the app.

Guest mode is not the same as "Viewer" — it operates at the user-context level, not the per-resource sharing level.

### Workspace feature flags

Several features are gated by per-workspace booleans (independent of user role or resource sharing):

| Flag | Gated feature |
|---|---|
| `forecast_enabled` | [Forecast](/guide/forecast) area |
| `composioEnabled` | Integrations tab on [Account & Profile](/guide/account#integrations-me-integrations) + [Integrations](/guide/integrations) menus |
| `moldBuilder` | Molds tab in [Implementation](/guide/implementation#molds-implementation-molds-feature-flagged) |
| `agentBuilderV2Active` | Manage Agents 2.0 in [Super Admin](/guide/admin#manage-agents-2-0-admin-agents-v2-feature-flagged) |
| `apiManagementEnabled` | Developer API Apps page in [Brand Companions](/guide/brand-companions#api-app-types-public-vs-developer) |

None of these flags are exposed in customer-visible Settings — they are flipped by Vurvey staff via Manage Workspaces or direct database update.

---

## Constraints & limitations

- **Customer admin and Vurvey staff admin are different concepts.** A customer Owner is a `REGULAR_USER` with workspace-ACL admin rights, not an `ENTERPRISE_MANAGER`.
- **The Share dialog reduces 5 permissions to 2.** `can_delete`, `can_manage`, `can_manage_schedules` ride along with implicit roles; you can't set them granularly per-user from the dialog.
- **Owners cannot be removed from the Share dialog.** Their row is locked. Transfer ownership through the resource's own UI (where available) or via support.
- **Datasets use `alias`, not `name`, in modal titles.** A subtle but real difference if your dataset's display name differs from its alias.
- **Service Accounts are roles for bots, not humans.** Create them via the Developer API Apps page; the resulting identity is a `SERVICE_ACCOUNT` `UserRole`.
- **Wide access defaults to Viewer.** Switching from Restricted to Wide does not jump straight to Editor.
- **Group sharing is enterprise-only.** Standard workspaces work with user-level sharing.
- **Re-opening the Share dialog refetches from the network.** No optimistic caching — every open is a round-trip.
- **OpenFGA tuple changes are not always instant.** For Vurvey Labs staff, the **Sync permissions** action in the employees table exists precisely because OpenFGA propagation can lag (see [Super Admin](/guide/admin#manage-vurvey-employees-admin-vurvey-employees)).

---

## Best practices

- **Default to Restricted.** Open up only when there's a clear reason. Wide access is convenient until someone deletes the only campaign that mattered.
- **Wide-Viewer is the safe sweet spot** for resources that everyone should be _able to use_ but only specific people should be _able to change_.
- **Wide-Editor on production resources is a footgun.** A new hire today is an editor tomorrow.
- **Use Copy Link to share, not the URL bar.** The dialog's link is the canonical deep-link; URL-bar links from a sub-view (e.g. an agent builder step) may not survive sharing.
- **Audit large-team workspaces every quarter.** Wide-Editor sharings creep in. The Share dialog is the only UI for per-resource cleanup.
- **Don't conflate workspace role with sharing.** A workspace Owner can still be locked out of a specific dataset that was never explicitly shared with them — but Owner can typically re-share to themselves through the dataset's underlying ACL.
- **For programmatic access, use Service Accounts**, not personal API tokens, so machine-driven mutations don't show up as a human in your audit trail.
- **When a teammate says "I can't see X"**: ask "are you on the right workspace?" first, then check the resource's share dialog for them.

---

## FAQ

#### What's the difference between "Owner" and "Editor"?
**Owner** is the original creator (or whoever ownership has been transferred to). They have every permission including `can_delete` and `can_manage`. **Editor** can modify but not necessarily delete or change sharing. The dialog shows Owner as a locked label; Editor is selectable.

#### Why can't I un-share myself from a resource?
If you're the Owner, the Remove action is disabled. Ownership transfer (where supported) is the mechanism. If you're not the owner but still can't remove yourself, your workspace role may have a baseline that grants access regardless of the share row.

#### What's the difference between "Restricted" and "Wide" access?
**Restricted** means only explicitly-added members (the rows below in the dialog) can open the resource. **Wide** means every workspace member can — at the level you choose in the secondary dropdown (Viewer or Editor). Wide access is a single workspace-level setting; it doesn't override per-user rows (you can still grant individual Editor rights even when Wide is Viewer).

#### Why are my individual member controls disabled when General Access is "Editor"?
Because every workspace member is already at Editor level via Wide access. Granting an additional per-user Editor would be a no-op. If you switch Wide back to Viewer, the per-user controls become editable again.

#### What's a Service Account?
A bot identity used for programmatic API access. Same permissions as a `REGULAR_USER`, but created via the Developer API Apps flow. Your code authenticates as the Service Account and the audit log reflects that — preferable to using a human's personal token for machine work.

#### Where do I see all my workspace's members?
**Settings → Members.** That's the canonical list. The Share dialog's invite picker is fed from the same source.

#### Does sharing a Workflow share its Agents and Datasets too?
No. Each is shared independently. A teammate with access to a Workflow but not to one of its referenced Agents will see a permission error when the Workflow tries to use that Agent. Share each resource the workflow depends on, or use Wide-Viewer on the dependencies.

#### What happens when I delete a member from the workspace?
Their per-resource shares are removed at the workspace level. Their account record stays (you can re-invite). For permanent removal of their data, the user has to delete their own account or you have to contact Vurvey support.

#### Are SSO-provisioned users treated differently?
For sharing purposes, no — they're regular workspace members. Their identity provider governs who they are; OpenFGA governs what they can do on Vurvey resources.

#### Why does my admin not have access to a specific dataset?
Workspace admin permissions don't automatically grant per-resource access. They _can_ grant themselves access through the dataset's share dialog (most admin roles have that capability), but the access isn't implicit. Open the dialog and add them, or change General Access to Wide.

#### What is OpenFGA, and why should I care?
OpenFGA (formerly Auth0 FGA) is a relationship-based authorization engine. Vurvey stores resource-share state as OpenFGA "tuples" (relationships like `user:alice has editor on agent:123`). The reason to care: it's the source of truth for "who can do what" — everything you see in the Share dialog is a friendly view over OpenFGA tuples.

#### Why is the "Sync permissions" action on Vurvey staff sometimes needed?
OpenFGA tuple propagation isn't always instant, especially for newly-provisioned Support users. The Sync action forces the platform to re-write the staff member's expected tuples. See [Super Admin → Manage Vurvey employees](/guide/admin#manage-vurvey-employees-admin-vurvey-employees).

#### Can I share with someone outside my workspace?
No. The invite picker pulls only from the workspace members list. To share with an external user, first add them to the workspace (Settings → Members → Invite), then share the resource.

#### How can I tell if a resource is shared with the whole workspace?
Open the Share dialog. If General Access is **Wide access** (with the globe icon), the workspace can see it; otherwise it's **Restricted access** (lock icon).

#### What happens to shared resources when the owner leaves the company?
The owner's user record stays unless explicitly deleted. The resources remain accessible to anyone they were shared with. To formally transfer ownership, Vurvey staff can rewrite the OpenFGA owner tuple (file a support ticket).

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| Share button missing | The resource you're looking at may not support sharing (only Agents, Workflows, Datasets, Campaigns do), or you lack the permission to manage shares. |
| Share dialog opens to the NoPermissionView | You lack `can_manage` (or equivalent) on the resource. Ask the owner or a workspace admin. |
| Copy link gives me a URL that goes to a 404 | The recipient may not have access — the URL is just a deep-link, not a magic auth token. Share the resource with them first. |
| "Wide access" selector is missing | You're in Restricted mode. Switch to Wide access first; the secondary selector appears. |
| Cannot change a member's permission level | They're the Owner, OR General Access is Editor (which would render the per-user override redundant). |
| Removing a user does nothing | They have access via Wide access too — Restricting the access level removes the broadcast; the per-user removal only affects their explicit row. |
| My new member can't see the resource | (a) Refresh — OpenFGA propagation can have a brief lag. (b) Confirm the right workspace. (c) Check that you actually clicked **Add**, not just typed into the chip input. |
| Member list seems short | Workspace members are paginated 50 at a time and eagerly loaded behind the scenes. If a specific person isn't appearing, they may not actually be in the workspace. |
| Sharing a Workflow doesn't grant access to its Agent | Expected. Share the Agent (and any Datasets, Capabilities) the Workflow references separately. |
| `isAdminRole` toast on a customer admin | Customer workspace admin is not `isAdminRole`. Only Vurvey Labs `ENTERPRISE_MANAGER`/`SUPPORT`/`IMPLEMENTATION` pass that check. |
| Resource permission seems stuck after a change | Re-open the Share dialog — it fetches network-only on open. If still wrong, check the OpenFGA model deployment (Vurvey engineering operation). |

---

## Related guides

- [Settings](/guide/settings) — workspace members list and workspace role assignment
- [Account & Profile](/guide/account) — guest mode interactions with personal profile
- [Super Admin](/guide/admin) — `isAdminRole` gating and staff-only flag flips
- [Implementation](/guide/implementation) — `isEnterpriseManagerOrImplementation` gating
- [Brand Companions](/guide/brand-companions) — Public-vs-Developer API apps; Service Accounts
- [Agents](/guide/agents) / [Workflows](/guide/workflows) / [Datasets](/guide/datasets) / [Campaigns](/guide/campaigns) — the four resources supporting the Share dialog
- [Branding](/guide/branding) — OpenFGA Questions gate and interceptOpenfgaError pattern
