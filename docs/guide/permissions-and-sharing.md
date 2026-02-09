---
title: Permissions & Sharing
---

# Permissions & Sharing

Vurvey uses resource-level permissions to control who can view, edit, share, and delete objects like Agents, Campaigns, Datasets, and Workflows.

This page explains the common permission levels you’ll see in the UI, how sharing typically works, and how to troubleshoot “permission denied” issues.

## The Common Permission Levels

Across most resources, you’ll see some combination of:

| Permission | What You Can Do | Typical UI Signals |
|------------|------------------|--------------------|
| **View** | Open the resource and use it (where applicable) | “View” option instead of “Edit” |
| **Edit** | Change configuration/content | “Edit” button/menu item is visible |
| **Manage** | Share with others / change permissions | “Share” action is visible |
| **Delete** | Permanently remove the resource | “Delete” action is visible (usually destructive/red) |

Notes:

- If you don’t have **Edit**, you may still be able to *use* the resource (for example: chat with an active Agent).
- If you don’t have **Manage**, you can’t grant permissions to other users.
- **Delete** is usually separate from **Edit** to reduce accidental data loss.

## What “Sharing” Usually Means

Sharing typically grants other workspace members access to a specific resource, with a selected permission level.

Common sharing patterns:

- **Share for collaboration**: give a teammate `Edit` so they can iterate with you.
- **Share for review**: give a stakeholder `View` so they can review without changing anything.
- **Share for ownership transfer**: give a lead `Manage` so they can control access and updates.

## How To Share a Resource (Typical Flow)

Exact UI details can vary by resource, but the common flow is:

1. Open the resource (or its card menu).
2. Click **Share**.
3. Add one or more users (or select “workspace-wide” access when available).
4. Choose the permission level(s) to grant.
5. Save/apply.

If you don’t see **Share**, you likely don’t have `Manage` permission for that resource.

## How Permissions Affect Actions

Here are common “why can’t I…” scenarios and the usual cause:

| Symptom | Likely Cause | Fix |
|--------|--------------|-----|
| “Edit” is missing | You only have View | Ask the owner/admin for `Edit` |
| “Share” is missing | You don’t have Manage | Ask for `Manage` or have the owner share |
| “Delete” is missing | You don’t have Delete | Ask for `Delete`, or request the owner delete |
| You can view but not use | Resource is inactive or you lack usage permission | Confirm it’s active/published; check workspace access |

## Best Practices (Team Hygiene)

- Prefer **least privilege**: `View` for reviewers, `Edit` for collaborators, `Manage` for owners.
- Avoid granting **Delete** broadly. Use `Deactivate`/`Archive` behaviors when available instead of deleting.
- If you need to experiment, **Copy/Duplicate** the resource first, then iterate on the copy.
- Use naming conventions that make shared resources easy to find and safe to use:
  - Example: `Q1-Packaging-ConceptTest-v1` or `Persona-MillennialParent-v2`.

## Use Cases

### Use Case: Cross-Functional Review Without Risk

Goal: product/brand/legal can review an Agent or Campaign without accidentally changing it.

- Share with `View`.
- Ask reviewers to leave feedback via comments/notes outside of the resource (or in a shared document).
- Apply changes yourself (or grant `Edit` to a designated collaborator).

### Use Case: Agency Collaboration

Goal: an external partner helps build Campaigns but shouldn’t manage workspace access.

- Grant `Edit` on the Campaign(s) and any required Datasets.
- Avoid `Manage` unless they are responsible for access control.
- Avoid `Delete`.

### Use Case: Delegated Ownership

Goal: transfer ongoing maintenance of a Workflow to another owner.

- Grant `Manage` (and usually `Edit`) to the new owner.
- Confirm they can see the Share dialog and adjust permissions.

## Troubleshooting

### “Permission denied” after it worked yesterday

Common causes:

- You were removed from the workspace (or changed roles).
- The resource was re-shared and your permission level changed.
- The resource owner deleted or deactivated it.

What to do:

1. Confirm you’re in the correct workspace.
2. Ask the owner/admin to verify your permissions on the specific resource.
3. If the issue affects multiple resources, it’s probably a workspace-role change.

### I can’t see something a teammate can see

- Confirm you’re looking at the same workspace (workspaces are isolated).
- Ask them to share the specific resource with you.

## Related Guides

- [Agents](/guide/agents)
- [Campaigns](/guide/campaigns)
- [Datasets](/guide/datasets)
- [Workflow](/guide/workflows)
- [Sources & Citations](/guide/sources-and-citations)

