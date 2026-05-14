# Implementation

Implementation is the enterprise setup area for platform configuration surfaces that are separate from normal workspace settings and Super Admin.

## Access

Implementation appears from the workspace dropdown for users with enterprise-manager or implementation access. Users without that access are blocked by the implementation route guard.

Open it from **workspace dropdown > Implementation** or by using `/implementation`. The index route redirects to `/implementation/taxonomy`.

## Current Navigation

The current Implementation navigation includes:

| Page | Route | Purpose |
|---|---|---|
| **Taxonomy Management** | `/implementation/taxonomy` | Manage taxonomy and facet structures |
| **System Prompts** | `/implementation/system-prompts` | Manage platform prompt configuration |
| **Create agents from YAML files** | `/implementation/add-agents-via-yaml` | Add agents from YAML definitions |
| **Create Agent Personalities** | `/implementation/agent-personalities` | Manage reusable agent personality definitions |
| **Molds** | `/implementation/molds` | Manage reusable persona molds when `moldBuilder` is enabled |

The **Molds** navigation item appears only when the `moldBuilder` feature flag is enabled. If the flag is off, direct Molds routes redirect back to Taxonomy Management.

## Molds Routes

Molds are an Implementation tool in current master, not a People tab. Legacy `/people/molds/*` URLs redirect into the Implementation Molds route.

Current Molds routes include:

| Route | Purpose |
|---|---|
| `/implementation/molds` | Molds list |
| `/implementation/molds/create` | Create a mold |
| `/implementation/molds/:moldId` | Open a mold |
| `/implementation/molds/:moldId/edit` | Edit a mold |
| `/implementation/molds/:moldId/builder` | Open the mold builder |

## Relationship to Super Admin

Super Admin handles platform administration such as brands, campaign templates, workspaces, employees, agents, surveys, SSO providers, and credits rates.

Implementation handles taxonomy, system prompts, YAML agent creation, agent personalities, and feature-flagged Molds.

## Related Pages

- [Super Admin](/guide/admin)
- [People](/guide/people)
- [Agents](/guide/agents)
