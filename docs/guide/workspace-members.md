---
title: Workspace Members & Roles
---

# Workspace Members & Roles

The **Workspace Members** page is where administrators invite, manage, and remove team members within a Vurvey workspace. This doc covers the full member-management surface — inviting users, the four role types, editing roles, transferring workspace ownership, and removing members.

> 📷 _Screenshot pending: Workspace Members page — table with name / email / role columns + filters + invite button_

---

## How to reach it

**Settings → Members** (within the Workspace Settings container).

The page title is "Vurvey - Manage Users" (set on the document title). The route requires you to have the appropriate workspace role — viewing is permitted to all members, but invite / edit / remove actions are gated by your permissions.

---

## The four workspace roles

> 📷 _Screenshot pending: Invite modal RadioGroup showing all four roles with descriptions_

| Role | Can do | Constraints |
|---|---|---|
| **Owner** | Manage billing, users, campaigns, and creators | Exactly one Owner per workspace. Selectable in the invite radio only if the current user is themselves an Owner. |
| **Administrator** (Admin) | Manage users, campaigns, and creators | Can add and remove members, edit roles (except making Owner). Selectable by any member with edit permissions. |
| **Manager** | Manage campaigns and see full creator information | Default role for new invites. Cannot manage members. |
| **Guest** | Interact with public AI Agents | Only available when the workspace has `guestModeEnabled` true. Excluded from role-edit dropdown when guest mode is off. Cannot be transferred ownership. |

::: tip Guest role is flag-gated
The Guest role only appears in the invite radio, the role-edit dropdown, and the role-filter dropdown when `workspace.guestModeEnabled` is true. If you don't see "Guest" anywhere, your workspace doesn't have Guest mode enabled. See [Feature Flags Reference → guestModeEnabled](/guide/feature-flags#guestmodeenabled).
:::

---

## The Members table

> 📷 _Screenshot pending: Members table with all columns visible_

### Columns

| Column | Source | Behavior |
|---|---|---|
| **Name** | `member.name` | First + last name. Width: 300px. |
| **Email** | `member.email` | The email tied to the member's user record. Width: 200px. |
| **Role** | `member.workspaceRole` (lowercased) | Click to enter in-line edit mode (when you have edit permissions). |
| **Actions** | — | Edit / Remove dropdown |

### Filters and search

> 📷 _Screenshot pending: Filter and search bar_

Two filters at the top of the table:

| Filter | Behavior |
|---|---|
| **Name search** | Debounced search input. Filters by member's name (or email — implementation matches both). |
| **Role select** | Dropdown with "All roles", Administrator, Manager, Owner, and (if `guestModeEnabled`) Guest. |

### Sorting

The table supports sorting via the `WorkspaceMembersSort` enum on the GraphQL side. Typically:

- Default (server-determined order)
- Email ascending / descending
- Name ascending / descending
- Role ascending / descending

Click a column header to apply a sort.

### Pagination

- **Page size**: 100 members at a time.
- **Cursor-based**: Loads more via `handleFetchMore`.
- **Fetch policy**: `network-only` on first load, `cache-first` on subsequent — ensures you see fresh state on visit but doesn't refetch every keystroke.

---

## Inviting members

> 📷 _Screenshot pending: Invite Members modal — header, email input, role radio, banner, Add Member button_

Click **Invite Members** to open the invite modal.

::: warning Permissions
The Invite Members button is only enabled when your current role grants the "add" permission. Workspace role permissions are loaded as part of the workspace context.
:::

### Modal anatomy

| Section | Content |
|---|---|
| **Header** | "Invite Members" (or "Add Creators" for the alternate creator-invite flow) |
| **Subtitle** | "Copy/paste email addresses below. This will add new users to your team to help create campaigns, manage creators, and analyze feedback." |
| **Email tag input** | Type or paste emails; press Enter or comma to add as a tag |
| **Role radio group** | Select the workspace role to assign |
| **Tip banner** | "🥸 Use commas or press ENTER to separate addresses." |
| **Add Member button** | Disabled until at least one email is entered |

### Adding emails

- Type an email and hit **Enter** or **comma** to convert it into a tag.
- Paste a list of comma-separated emails — all of them are tagged automatically.
- Click the **×** on any tag to remove it.
- Emails are deduplicated and case-normalized (lowercased) before submission.

### Picking a role

The radio shows four options (or three if Guest mode is off):

| Option | Description shown | Disabled when |
|---|---|---|
| Owner | Manage billing, users, campaigns, and creators | You are not yourself an Owner — the radio option visibly greys out |
| Admin | Manage users, campaigns, and creators | (never disabled if you can invite) |
| Manager | Manage campaigns and see full creator information | (never disabled if you can invite) — DEFAULT |
| Guest | Interact with public AI Agents | Hidden entirely unless `guestModeEnabled` |

The default selection is **Manager**.

### Submitting

Click **Add Member** to send the invites. Each email gets an invite notification; once they accept they appear in the members table at the selected role.

The toast confirms: `"X Members invited"` where X is the count from the API response.

---

## Editing a role

> 📷 _Screenshot pending: Inline role-edit row with Select + Save + Cancel_

To change a member's role:

1. Click **Edit** in the actions dropdown for that row (or click the role itself if your workspace exposes inline editing).
2. The row converts to an inline editor: a Select with available role options, plus **Save** and **Cancel** controls.
3. Pick the new role and click **Save**.

### Which roles can you assign?

| Your role | Roles you can assign |
|---|---|
| Owner | Owner, Administrator, Manager, Guest (if enabled) |
| Administrator | Administrator, Manager, Guest (if enabled). Cannot promote to Owner. |
| Manager / Guest | Cannot edit roles |

::: tip Only Owners can create more Owners
The Owner option appears in the role-edit dropdown only if your own role is Owner. This means promoting someone to Owner is a two-step affair if you're an Admin — you'd need an existing Owner to do it, OR you'd need to receive the Owner role first via ownership transfer.
:::

### Save flow

The role update calls the `SET_WORKSPACE_ROLE` mutation. On success:

- Toast: "Role updated for user"
- Members query refetches (so the table reflects the new role)
- The inline editor closes

On failure, an error toast is shown but the member's row remains in edit mode so you can correct or cancel.

---

## Removing a member

> 📷 _Screenshot pending: Remove Member confirmation modal_

In the actions dropdown for a member's row, click **Remove** (Bin/Delete icon).

A confirmation modal opens. Confirm to remove the member. The mutation removes them via `REMOVE_WORKSPACE_MEMBER`.

::: warning Removed members lose access immediately
A removed member loses workspace access on the next page load — no grace period. Their existing campaigns, datasets, workflows, and AI personas remain in the workspace (owned by whoever previously owned them). If they were the owner of resources, see [Transferring resource ownership](#transferring-resource-ownership) before removing them.
:::

The toast confirms removal: "Member X removed" where X is the count from the API response.

You cannot remove yourself from a workspace via this surface — leaving a workspace as the current user is handled separately under Account settings.

---

## Transferring workspace ownership

> 📷 _Screenshot pending: Transfer Workspace Ownership modal — new owner select + resource type select_

Only the current Owner can initiate a workspace-ownership transfer. The modal is more granular than typical ownership-transfer flows — you can transfer **per-resource-type** rather than as a single global handoff.

### Modal anatomy

| Field | Purpose |
|---|---|
| **New owner** | Select input listing all eligible workspace members (all roles except Guest) |
| **Resource type to transfer** | Select input — one of CAMPAIGNS, DATASETS, WORKFLOWS, AI_PERSONAS |
| **Confirm button** | Executes the `TRANSFER_WORKSPACE_OWNERSHIP` mutation |

### Eligible new-owner list

- Loaded via `GET_WORKSPACE_MEMBERS_FOR_OWNERSHIP_TRANSFER` (no-cache fetch policy — always fresh).
- Sorted by email ascending.
- Page size: 1,000 members max in a single load.
- Excludes anyone with the GUEST role.
- Members with null name AND null email are filtered out.
- Each option shows: `"Name (email@x.com)"` or just the name/email if only one is present, or "Unknown User" if both are null but they made it through the prior filter (defensive fallback).

### What "transfer" actually means

The transfer mutation moves ownership of the **selected resource type** from the previous Owner to the new user. After the transfer:

| Resource | What changes |
|---|---|
| Workspace itself | Still owned by the original Owner unless that workspace-level ownership is transferred separately |
| Campaigns / Datasets / Workflows / AI Personas | The records change owner_id to point at the new user (when that resource type is selected) |

This per-type granularity lets you:
- Hand over only the campaigns to a new lead while keeping datasets owned by data-engineering
- Migrate AI Personas to a centralized account when an individual leaves
- Stage an organizational reshuffle one resource type at a time

After successful transfer, a toast confirms: `"Ownership transferred to <name or email>"`.

---

## Constraints & limitations

- **One Owner per workspace.** The Owner role can't be assigned to multiple members. To promote a new Owner you must use the Transfer Workspace Ownership flow.
- **You can only assign Owner if you ARE Owner.** Admins can't make Owners.
- **Guest role only exists if `guestModeEnabled` is true.** Otherwise the option disappears entirely from invite radio, role filter, and role-edit dropdown.
- **The members table loads 100 at a time.** Workspaces over 100 members must scroll to load more.
- **Bulk role editing is not supported.** Each role change is a separate save action.
- **Bulk delete is not supported.** Each removal opens its own confirmation modal.
- **Removed members keep ownership of their resources.** They lose access but their resources remain owned by them. Use Transfer Workspace Ownership BEFORE removing if you want to reassign.
- **No invite revocation in this UI.** If you invited someone by mistake, you can't cancel the invite — they'll accept and you'll need to remove them. (Email invites do expire eventually if not accepted.)
- **The members table doesn't show invite status (pending vs. accepted).** Only confirmed members appear here. Track pending invites via outbound emails or contact your CSM.
- **Permission checks are workspace-context-based.** Permissions come from the workspace context — if they're stale, the page may show buttons disabled even when you should have access. Refresh the page to re-fetch.
- **You cannot self-remove from this surface.** Leaving a workspace is done from Account settings.

---

## Best practices

- **Default new invites to Manager.** The radio defaults to Manager for a reason — most users don't need admin powers.
- **Use the role filter when auditing a large workspace.** Filter by "Administrator" to quickly see who has elevated access.
- **Transfer ownership of resources BEFORE removing a departing member.** Otherwise their resources become "orphaned" in the sense that no one else can edit them (only the workspace Owner has the override).
- **Use the per-resource transfer modal to stage handoffs.** A new team lead can take over Campaigns first, prove themselves, then take Workflows and Datasets later.
- **Use the email-paste flow for bulk onboarding.** Copy a column of emails from a spreadsheet, paste into the tag input — all are added at once.
- **Be deliberate with the Owner role.** Promoting someone to Owner is a one-way action from the Admin side — only the current Owner can undo it. Always confirm with the existing Owner before promotion.
- **Enable Guest mode only if you actually need it.** Guests interact with public AI Agents but have very limited platform access — it's a niche feature for sharing AI personas externally without full membership.
- **Document role-change reasons in your team's internal log.** The platform doesn't capture a reason field on role changes — outside-of-app documentation matters for compliance.

---

## FAQ

#### Can I have more than one Owner?
No. Exactly one Owner per workspace. To change Owners, use Transfer Workspace Ownership (Owner-only action).

#### What if my Owner left the company without transferring ownership?
Contact your CSM or Vurvey support. Vurvey staff can manually reassign workspace ownership on the backend.

#### What's the difference between Administrator and Owner?
- **Owner** = full control including billing.
- **Administrator** = all-of-the-above EXCEPT billing and certain Owner-only flows (like creating additional Owners, transferring ownership).

#### Can a Manager invite new members?
No. Inviting requires the "add" permission, which Manager doesn't have. Only Owner and Administrator can invite.

#### What happens to a removed member's owned campaigns?
They remain in the workspace, owned by the removed member's user record. Other admins can see them but cannot edit them unless the workspace Owner overrides or ownership is transferred. Best practice: transfer ownership BEFORE removing.

#### Can I invite someone with multiple roles at once?
No — each invite assigns exactly one role. To upgrade an invited member's role after they accept, edit it inline in the members table.

#### Why doesn't a user appear in the Transfer Ownership dropdown?
Most likely they're a Guest — Guests are filtered out by design. Confirm their role in the members table; if they're not a Guest, refresh the page (the modal uses a no-cache fetch policy but the members list may have been stale).

#### Can I make someone an Owner via invite?
Only if your own role is Owner. Otherwise the Owner radio option is disabled in the invite modal.

#### Is there an audit log of role changes?
Not exposed in this UI. The backend logs role changes — if you need an audit, contact your CSM.

#### What's the difference between this "Invite Members" flow and "Add Creators"?
Same modal component, different config:
- **`isMemberInvite: true`** → invites users as workspace members with a role (Owner/Admin/Manager/Guest)
- **`isMemberInvite: false`** → adds creators (respondents) to a contact list, no role selection, with the "Select Existing" dropdown for picking from prior contacts

#### Can I see how long a member has been in the workspace?
Not in this table today. The data exists in the backend (creation timestamp on the member record) but isn't surfaced.

#### How do I bulk-import members from a CSV?
Not natively supported. The workaround: copy the email column, paste into the invite modal's tag input — every comma-separated email becomes a tag.

#### Does inviting a member who already has a Vurvey account add them immediately?
Effectively yes — they get a notification and the membership is added to their account. They appear in your members table immediately after they accept (which may be instant if they're logged in).

#### Can two workspaces share members?
Yes. The same user can be a member of multiple workspaces simultaneously, each with potentially a different role. Workspace switching happens via the workspace selector in the app header.

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| Invite Members button is disabled | You don't have the "add" permission. Your role doesn't permit inviting. |
| Edit / Remove actions don't appear in the action dropdown | You don't have the "make" (edit) permission. |
| Owner option missing from the invite radio | You're not the current Owner. Only Owners can create Owners. |
| Guest option missing entirely | `guestModeEnabled` is false for your workspace. |
| Transfer Workspace Ownership unavailable | Only the current Owner can initiate ownership transfer. |
| Transfer Ownership new-owner select is empty | All other workspace members are Guests (excluded) or the GraphQL query failed. Check the console. |
| Role update fails with "Failed to update role" | The new role you selected is not allowed for your role to assign. E.g. an Admin trying to promote someone to Owner. |
| Member I just invited isn't showing up | They may not have accepted yet. The members table shows confirmed members only. |
| Removed member's resources still visible | Expected — removed members keep ownership of their resources. Use Transfer Ownership to reassign. |
| Members table shows stale roles after editing | Refetch the table by changing a filter (e.g. role filter to "All roles" and back). |
| Paste of comma-separated emails only adds the first one | Use commas OR newlines — the tag input parses both. Some browsers may strip pasted whitespace unusually; type them in manually if pasting fails. |
| Removed myself accidentally | You can't remove yourself from this surface. If somehow this happened, contact your CSM to restore access. |

---

## Cross-references

- [Permissions & Sharing](/guide/permissions-and-sharing) — the deeper permission model behind these roles (OpenFGA per-resource permissions complement workspace-level roles)
- [Account & Profile](/guide/account) — where to leave a workspace if you're the user (vs. removing others)
- [Settings](/guide/settings) — parent surface for all workspace-level settings
- [Admin (Enterprise)](/guide/admin) — Enterprise-tier features above and beyond standard role management
- [Feature Flags Reference](/guide/feature-flags) — `guestModeEnabled` and related flags
- [Login & Authentication](/guide/login) — SSO and enforce-SSO settings that affect who can become a member
- [Branding](/guide/branding) — branded invite emails (when workspace branding is enabled)
- [Glossary](/guide/glossary) — role / membership / ownership definitions
