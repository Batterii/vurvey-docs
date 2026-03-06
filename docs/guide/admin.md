# Super Admin

The enterprise-only admin area is labeled **Super Admin** in the current UI.

In `vurvey-web-manager` master, the page header and menu label use **Super Admin**, not just `Admin`.

## Access

This section is restricted to enterprise-manager or support-style access. Users without that access are redirected out of the page.

## Current Navigation

The current Super Admin page renders two button groups.

Always-visible pages:

| Page | Purpose |
|---|---|
| **Dashboard** | High-level admin landing page |
| **Manage Brands** | Brand administration |
| **Global Campaign Templates** | Shared campaign templates |
| **SSO Providers** | Single sign-on providers |
| **Taxonomy Management** | Taxonomy and facet administration |
| **System Prompts** | Platform prompt management |
| **Manage Workspaces** | Workspace administration |
| **Manage Vurvey employees** | Internal employee administration |
| **Manage Agents** | Cross-workspace agent administration |
| **Manage Surveys/Campaigns** | Campaign administration |
| **Manage Credits Rates** | Credits-rate management |

Conditional page:

| Page | Condition |
|---|---|
| **Manage Agents 2.0** | Only shown when `agentBuilderV2Active` is enabled |

So the practical count is:

- **11** always-visible pages
- **12** when `Manage Agents 2.0` is enabled

## Important Current-State Notes

- Older docs that count 11 pages but list **Manage Agents 2.0** while omitting **Manage Credits Rates** are out of date
- The UI title is **Super Admin**
- `Manage Agents 2.0` is feature-flag dependent

## What This Section Is For

Super Admin is for platform-wide administration rather than day-to-day workspace research work. It is where enterprise operators manage:

- org-wide configuration
- identity and SSO setup
- taxonomy structures
- system prompts
- shared templates
- workspace-level administration across many workspaces

## Implemented Menus and Modals

Some of the most important current admin interaction surfaces are deeper than the Super Admin landing nav:

### Manage Vurvey employees

The current employee-management page includes:

- an **Add Employee** action
- a filter panel
- row menus with **Sync permissions**, **Update role**, and **Delete**
- an **Update Employee Role** modal
- a delete confirmation modal

### Manage Agents

The current agent-management flow includes an **Agent Actions** modal. One of the implemented actions there is **Clone to Workspace**.

### Global Campaign Templates

Global campaign template rows expose a contextual menu with:

- **Update**
- **Delete**

## Related Pages

- [Settings](/guide/settings) for normal workspace-level administration
- [Integrations](/guide/integrations) for workspace connection management
