---
title: Permissions & Sharing
---

# Permissions & Sharing

Vurvey is built for team research. This page explains how to share your work with colleagues, control who can see and change things, and keep your research data secure.

## How Access Works in Vurvey

Everything in Vurvey lives inside a **workspace** -- a shared environment for your team or project. Everyone in your workspace can see the resources that have been shared with them, but access to individual items (agents, campaigns, datasets, and workflows) is controlled by permissions.

There are different levels of access you can grant to team members:

| Access Level | What the Person Can Do |
|---|---|
| **View** | Open and read the resource, use it where applicable (e.g., chat with an agent) |
| **Edit** | Make changes to the resource's settings and content |
| **Share** | Grant or change other people's access to the resource |
| **Remove** | Permanently delete the resource |

::: tip Not Everyone Needs Full Access
Most collaborators only need **View** or **Edit** access. Reserve **Share** access for project leads who need to manage the team, and be cautious with **Remove** access to prevent accidental data loss.
:::

## Sharing with Your Team

### How to Share a Resource

The process is similar across agents, campaigns, datasets, and workflows:

1. Open the resource (or find it in the list and open its menu)
2. Click **Share**
3. Search for and add the team members you want to share with
4. Choose the access level for each person
5. Save your changes

If you don't see a **Share** option, you may not have sharing access for that resource. Ask the owner or your workspace administrator to share it with you or grant you sharing access.

### Common Sharing Scenarios

**Sharing for review**: You've built an agent or set up a campaign and want a colleague to review it before launch.
- Grant them **View** access so they can look without changing anything
- Collect their feedback, then make changes yourself

**Sharing for collaboration**: You're working on a project together and both need to make changes.
- Grant them **Edit** access so you can both iterate on the resource
- Use clear naming conventions to keep track of versions (e.g., "Q1 Packaging Study v2")

**Handing off ownership**: A project is moving to a different team lead who needs full control.
- Grant them **Share** access (along with **Edit**) so they can manage the resource going forward
- They'll be able to add or remove other team members as needed

## What You Can Share

| Resource | What Gets Shared |
|---|---|
| **Agents** | The agent's configuration, personality, knowledge sources, and appearance. Others can chat with a shared agent. |
| **Campaigns** | The survey setup, questions, and collected responses. Useful for team analysis of results. |
| **Datasets** | The collection of files and any labels or organization you've applied. Others can use shared datasets in their conversations. |
| **Workflows** | The automated pipeline design and its execution history. Collaborators can help refine or monitor workflow runs. |

## Workspace Roles

Your workspace may have different roles that determine your baseline access:

- **Members** can view and use resources that have been shared with them, create their own resources, and share what they own
- **Administrators** have broader access to manage workspace settings, invite new members, and oversee all resources

If you're unsure about your role, check with your workspace administrator.

## Privacy and Data Security

### Workspaces Are Isolated

Each workspace is a separate, private environment. People in one workspace cannot see resources from another workspace, even if they belong to both. This means:

- Your research data stays within your workspace
- Sharing only works within the same workspace
- Switching workspaces gives you a completely separate set of resources

### Who Can See Your Data

- **Resources you create** are visible to you by default. Others can see them only if you share explicitly.
- **Campaign responses** are tied to the campaign and follow its sharing permissions
- **Dataset files** follow the dataset's sharing permissions -- if someone can access the dataset, they can access the files inside it
- **Chat conversations** are private to you unless the conversation involves a shared agent in a shared context

## Best Practices for Team Research

### Keep Things Organized

- **Use clear naming conventions**: Include the project name, date, or version in resource names (e.g., "2024-Q1 Snack Packaging - Consumer Persona" or "Holiday Campaign v3")
- **Label your datasets**: Apply consistent labels to files within datasets so team members can understand what's inside
- **Archive old work**: When a campaign is complete or an agent is no longer needed, archive it rather than deleting it to preserve the historical record

### Manage Access Thoughtfully

- **Start with View access** and upgrade to Edit only when someone needs to make changes
- **Limit Remove access** to prevent accidental deletion -- archive resources instead when possible
- **Review sharing periodically**: When team members change roles or leave a project, update their access
- **Duplicate before experimenting**: If you want to try significant changes to a shared resource, make a copy first so you don't disrupt others

### Collaborate Effectively

- **Agree on naming conventions** at the start of a project so shared resources are easy to find
- **Designate an owner** for key resources so there's always someone responsible for access management
- **Communicate changes**: When you make significant edits to a shared resource, let your team know

## Troubleshooting

### I can't edit something that worked before

Common causes:
- Your access level was changed by the resource owner
- The resource was re-shared with different permissions
- Your workspace role changed

**What to do**: Ask the resource owner or your workspace administrator to check your access level.

### I can't see something my teammate can see

- Make sure you're in the **same workspace** -- workspaces are isolated environments
- Ask your teammate to **share the specific resource** with you
- Check if the resource was recently moved or archived

### I can't find the Share option

- You may only have **View** or **Edit** access, which doesn't include sharing permissions
- Ask the resource owner to either share it on your behalf or grant you **Share** access

### Someone accidentally deleted something

- Contact your workspace administrator immediately -- they may be able to help recover the resource
- For the future, consider limiting **Remove** access to project leads only

## Related Guides

- [Agents](/guide/agents) -- Creating and managing AI personas
- [Campaigns](/guide/campaigns) -- Running research surveys
- [Datasets](/guide/datasets) -- Uploading and organizing files
- [Workflow](/guide/workflows) -- Building automated research pipelines
- [Sources & Citations](/guide/sources-and-citations) -- How AI references your data
