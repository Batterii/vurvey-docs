# Implementation

Implementation is the enterprise setup area for platform configuration surfaces that are separate from normal workspace settings and Super Admin.

## Access

Implementation appears from the workspace dropdown for users with enterprise-manager or implementation access. Users without that access are blocked by the implementation route guard.

Open it from **workspace dropdown > Implementation** or by using `/implementation`. The index route redirects to `/implementation/taxonomy`.

## Current Navigation

![Taxonomy Management](/screenshots/implementation/01-taxonomy-management.png?optional=1)

The current Implementation navigation includes:

| Page | Route | Purpose |
|---|---|---|
| **Taxonomy Management** | `/implementation/taxonomy` | Manage taxonomy and facet structures |
| **System Prompts** | `/implementation/system-prompts` | Manage platform prompt configuration |
| **Create agents from YAML files** | `/implementation/add-agents-via-yaml` | Add agents from YAML definitions |
| **Create Agent Personalities** | `/implementation/agent-personalities` | Manage reusable agent personality definitions |
| **Molds** | `/implementation/molds` | Manage reusable persona molds when `moldBuilder` is enabled |

The **Molds** navigation item appears only when the `moldBuilder` feature flag is enabled. If the flag is off, direct Molds routes redirect back to Taxonomy Management.

## Taxonomy Management

Taxonomy Management is the default Implementation page. It is organized into tabs:

| Tab | Purpose |
|---|---|
| **Facet Editor** | View and edit taxonomy facets and values |
| **Constraint Rules** | Manage rules that constrain or weight facet combinations |
| **Versions** | Review taxonomy versions |
| **Sync Logs** | Review taxonomy synchronization history |
| **Add Facet** | Upload or paste YAML and ask AI to recommend taxonomy changes |

The Add Facet flow supports both file upload and pasted YAML. It can optionally return the full updated taxonomy before applying a recommended update.

## System Prompts

![System Prompts](/screenshots/implementation/02-system-prompts.png?optional=1)

System Prompts is a searchable prompt management table. The current page supports:

- search
- category filter
- status filter with **Active**, **Draft**, and **Archived**
- create/edit prompt modal
- archive, restore, and duplicate actions

## Create Agents From YAML Files

![Create agents from YAML](/screenshots/implementation/03-agents-yaml.png?optional=1)

The YAML import page starts with **Select a workspace in which to import agents:**. After a workspace is selected, it exposes:

- **Create from .yaml**
- **Import Rules**

This surface is for controlled agent seeding across workspaces, not normal agent creation. Most users should create agents from [Agents](/guide/agents).

## Create Agent Personalities

![Create Agent Personalities](/screenshots/implementation/04-agent-personalities.png?optional=1)

Agent Personalities manages reusable personality definitions used by persona generation. The current page supports:

- search
- **Create Personality**
- table selection
- **Delete Selected**
- edit, delete, and publish actions for individual rows

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
