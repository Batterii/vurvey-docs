---
title: Permissions & Sharing
---

# Permissions & Sharing

Vurvey supports item-level sharing for the resources people collaborate on most often:

- Agents
- Campaigns
- Datasets
- Workflows

The current sharing UI is narrower than some older documentation and internal permission names suggest. In `vurvey-web-manager` master, the share dialog exposes **Viewer** and **Editor** as the user-selectable access levels, plus workspace-wide access controls.

## How the Share Dialog Works

Each supported resource opens the same generic sharing modal. The modal includes:

- A **copy link** action
- **General Access**
- An **Add people** field
- A per-person permission selector

The core pattern is:

1. choose the workspace-wide access state
2. optionally add individual people
3. set their **Viewer** or **Editor** role
4. copy the shared link if you need to send it directly

## General Access

The top of the modal controls workspace-wide visibility.

In the current UI, **General Access** is a dropdown trigger with two states:

- **Restricted access**: only explicitly added people can open the resource
- **Wide access**: anyone in the workspace can open it

Only when **Wide access** is selected does the secondary workspace-role selector appear. That selector lets you choose:

- **Viewer**
- **Editor**

## Individual Access

The invite row in the current dialog is:

- **Add people** chips/input
- a **Viewer / Editor** dropdown
- an **Add** button

When you add individual workspace members, the current UI lets you choose:

- **Viewer**
- **Editor**

Existing member rows can also show:

- an **Owner** label for the owner entry
- a **Remove** action
- disabled permission controls with tooltips when the member is the owner or when general access is already set to **Editor**

## What Viewer vs Editor Means

The exact behavior depends on the resource, but the practical split is:

| Level | Typical behavior |
|---|---|
| **Viewer** | Open the item, inspect it, and use it where the UI allows read access |
| **Editor** | Modify the item in addition to viewing it |

Examples:

- On **Agents**, viewers can open and use the agent; editors can change its configuration
- On **Datasets**, viewers can browse and use the dataset; editors can add files and edit dataset details
- On **Workflows**, viewers can inspect the workflow; editors can modify the workflow itself
- On **Campaigns**, viewers can inspect the campaign and its results; editors can make changes allowed by campaign state

## Important Detail About Internal Permissions

Under the hood, the permission model still includes lower-level capabilities such as:

- `can_view`
- `can_edit`
- `can_delete`
- `can_manage`
- `can_manage_schedules`

Those internal permission names are not the same thing as the choices shown in the current share dialog. For day-to-day sharing, the UI currently reduces that complexity to **Viewer** and **Editor**.

## Resources That Support This Share Flow

The generic permissions modal is wired to these resource types in the current app:

| Resource | Supported |
|---|---|
| **Agent** | Yes |
| **Campaign** | Yes |
| **Dataset** | Yes |
| **Workflow** | Yes |

## Practical Collaboration Guidance

- Use **Restricted access** when the resource should stay with a small project group
- Use **Wide access + Viewer** when the whole workspace should be able to reference the item safely
- Use **Editor** sparingly on shared production resources
- Use the **Copy link** action when you want to send someone directly to an already-shared item
- If someone needs deletion or ownership-style control, that is handled by the resource's action menus and underlying permissions, not by a separate `Share` level in the modal

## Workspace Roles vs Shared Resource Access

Workspace roles and per-resource sharing are different layers:

- Workspace roles control baseline administrative capabilities
- Share dialogs control who can open or edit a specific resource

Someone can be a workspace member and still have no access to a particular dataset, agent, campaign, or workflow until it is shared or given wide access.
