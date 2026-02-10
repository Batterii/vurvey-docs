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
| **View** | Open and read the resource, use it where applicable (e.g., chat with an agent, view campaign results) |
| **Edit** | Make changes to the resource's settings and content |
| **Share** | Grant or change other people's access to the resource |
| **Remove** | Permanently delete the resource |

::: tip Not Everyone Needs Full Access
Most collaborators only need **View** or **Edit** access. Reserve **Share** access for project leads who need to manage the team, and be cautious with **Remove** access to prevent accidental data loss.
:::

## Permission Matrix

Here's what each permission level allows across different resource types:

### Agents

| Action | View | Edit | Share | Remove |
|---|---|---|---|---|
| Chat with the agent | Yes | Yes | Yes | Yes |
| See agent configuration | Yes | Yes | Yes | Yes |
| Modify agent settings, facets, rules | No | Yes | Yes | Yes |
| Change connected datasets | No | Yes | Yes | Yes |
| Activate / deactivate | No | Yes | Yes | Yes |
| Share with others | No | No | Yes | Yes |
| Delete the agent | No | No | No | Yes |

### Campaigns

| Action | View | Edit | Share | Remove |
|---|---|---|---|---|
| View campaign details | Yes | Yes | Yes | Yes |
| View responses and results | Yes | Yes | Yes | Yes |
| Start AI conversation about results | Yes | Yes | Yes | Yes |
| Edit questions and settings | No | Yes | Yes | Yes |
| Launch / close the campaign | No | Yes | Yes | Yes |
| Export data | Yes | Yes | Yes | Yes |
| Share with others | No | No | Yes | Yes |
| Delete the campaign | No | No | No | Yes |

### Datasets

| Action | View | Edit | Share | Remove |
|---|---|---|---|---|
| Browse files | Yes | Yes | Yes | Yes |
| Use in AI conversations | Yes | Yes | Yes | Yes |
| Upload new files | No | Yes | Yes | Yes |
| Edit labels | No | Yes | Yes | Yes |
| Delete files | No | Yes | Yes | Yes |
| Share with others | No | No | Yes | Yes |
| Delete the dataset | No | No | No | Yes |

### Workflows

| Action | View | Edit | Share | Remove |
|---|---|---|---|---|
| View workflow design | Yes | Yes | Yes | Yes |
| View past executions | Yes | Yes | Yes | Yes |
| Run the workflow | Yes | Yes | Yes | Yes |
| Edit workflow design | No | Yes | Yes | Yes |
| Change schedule | No | Yes | Yes | Yes |
| Share with others | No | No | Yes | Yes |
| Delete the workflow | No | No | No | Yes |

## Sharing with Your Team

### How to Share a Resource

The process is similar across agents, campaigns, datasets, and workflows:

1. Open the resource (or find it in the list and open its menu)
2. Click **Share**
3. The sharing dialog opens, showing current access settings
4. Search for and add the team members you want to share with
5. Choose the access level for each person
6. Save your changes

<img
  :src="'/screenshots/settings/04-share-dialog.png'"
  alt="Share dialog"
  @error="$event.target.remove()"
/>

If you don't see a **Share** option, you may not have sharing access for that resource. Ask the owner or your workspace administrator to share it with you or grant you sharing access.

### General Access vs. Individual Access

When sharing, you can set access at two levels:

| Level | Description |
|---|---|
| **General Access** | Set a default permission level for everyone in your workspace (e.g., "Everyone can View") |
| **Individual Access** | Grant specific people higher or lower access than the general setting |

::: tip Start with General Access
For most resources, set General Access to **View** so your whole team can find and reference the work. Then grant **Edit** access only to the people who actively need to make changes.
:::

### Common Sharing Scenarios

#### Sharing for review
You've built an agent or set up a campaign and want a colleague to review it before launch.
- Grant them **View** access so they can look without changing anything
- Collect their feedback, then make changes yourself

#### Sharing for collaboration
You're working on a project together and both need to make changes.
- Grant them **Edit** access so you can both iterate on the resource
- Use clear naming conventions to keep track of versions (e.g., "Q1 Packaging Study v2")

#### Handing off ownership
A project is moving to a different team lead who needs full control.
- Grant them **Share** access (along with **Edit**) so they can manage the resource going forward
- They'll be able to add or remove other team members as needed

#### Team-wide read access
Your whole team needs to reference a dataset or use an agent, but only you should edit it.
- Set General Access to **View**
- Keep **Edit** access for yourself
- No need to add individuals -- the workspace-wide setting covers everyone

#### Restricting a sensitive resource
A dataset contains confidential competitive intelligence that only certain people should see.
- Set General Access to **No Access** (or leave it unshared)
- Individually add only the people who need access with appropriate permission levels

## What You Can Share

| Resource | What Gets Shared |
|---|---|
| **Agents** | The agent's configuration, personality, knowledge sources, and appearance. Others can chat with a shared agent. |
| **Campaigns** | The survey setup, questions, and collected responses. Useful for team analysis of results. |
| **Datasets** | The collection of files and any labels or organization you've applied. Others can use shared datasets in their conversations. |
| **Workflows** | The automated pipeline design and its execution history. Collaborators can help refine or monitor workflow runs. |

::: warning Sharing Cascades Down
When you share a campaign, the person also gets access to view its responses. When you share a dataset, the person can access the files inside it. Plan accordingly when sharing resources that contain sensitive data.
:::

## Workspace Roles

Your workspace may have different roles that determine your baseline access:

### Members
- Can view and use resources that have been shared with them
- Can create their own agents, campaigns, datasets, and workflows
- Can share resources they own
- Can manage their own profile and preferences

### Administrators
- Everything Members can do, plus:
- Manage workspace settings (name, branding, AI model configuration)
- Invite and remove workspace members
- Access the workspace members list
- Configure workspace-wide AI model availability
- Manage API keys and integrations
- View workspace-level usage analytics

If you're unsure about your role, check with your workspace administrator.

::: tip Who Should Be an Admin?
Typically, research team leads or project managers are workspace administrators. You usually need 1-2 admins per workspace -- enough to handle member management without giving too many people access to sensitive settings.
:::

## Member Management

### Inviting New Members

Workspace administrators can invite new members:

1. Navigate to workspace settings (gear icon)
2. Go to the **Members** section
3. Click **Invite** or **Add Member**
4. Enter the person's email address
5. Choose their role (Member or Administrator)
6. They'll receive an email invitation to join the workspace

### Removing Members

When someone leaves your team or no longer needs access:

1. Navigate to workspace settings > **Members**
2. Find the person in the members list
3. Click the three-dot menu next to their name
4. Select **Remove** to revoke their access

::: warning Before Removing Members
Before removing someone, check if they own any important resources (agents, campaigns, datasets, workflows). Consider transferring ownership or sharing those resources with someone else first, since removal will affect their owned resources.
:::

## Privacy and Data Security

### Workspaces Are Isolated

Each workspace is a separate, private environment. People in one workspace cannot see resources from another workspace, even if they belong to both. This means:

- Your research data stays within your workspace
- Sharing only works within the same workspace
- Switching workspaces gives you a completely separate set of resources
- There is no cross-workspace search or data access

### Who Can See Your Data

- **Resources you create** are visible to you by default. Others can see them only if you share explicitly or set General Access.
- **Campaign responses** are tied to the campaign and follow its sharing permissions
- **Dataset files** follow the dataset's sharing permissions -- if someone can access the dataset, they can access the files inside it
- **Chat conversations** are private to you unless the conversation involves a shared agent in a shared context
- **Workflow results** follow the workflow's sharing permissions

### Data Encryption

- All data is encrypted at rest and in transit
- File uploads are processed in isolated environments
- Authentication tokens are securely managed through industry-standard providers (Auth0)

### Compliance

- Data handling follows industry best practices for security
- Workspaces provide logical data isolation for multi-tenant environments

::: warning Privacy Reminder
Make sure any data you upload complies with your organization's data policies and relevant regulations (GDPR, CCPA, etc.). Avoid uploading personally identifiable information (PII) unless your organization has approved it and appropriate safeguards are in place.
:::

## Best Practices for Team Research

### Keep Things Organized

- **Use clear naming conventions**: Include the project name, date, or version in resource names (e.g., "2024-Q1 Snack Packaging - Consumer Persona" or "Holiday Campaign v3")
- **Label your datasets**: Apply consistent labels to files within datasets so team members can understand what's inside
- **Archive old work**: When a campaign is complete or an agent is no longer needed, archive it rather than deleting it to preserve the historical record
- **Create a naming standard**: Agree on a team-wide pattern like "[Year]-[Quarter]-[Project]-[Type]"

### Manage Access Thoughtfully

- **Start with View access** and upgrade to Edit only when someone needs to make changes
- **Limit Remove access** to prevent accidental deletion -- archive resources instead when possible
- **Review sharing periodically**: When team members change roles or leave a project, update their access
- **Duplicate before experimenting**: If you want to try significant changes to a shared resource, make a copy first so you don't disrupt others
- **Audit permissions quarterly**: Review who has access to what and clean up stale permissions

### Collaborate Effectively

- **Agree on naming conventions** at the start of a project so shared resources are easy to find
- **Designate an owner** for key resources so there's always someone responsible for access management
- **Communicate changes**: When you make significant edits to a shared resource, let your team know
- **Use View access for stakeholders**: Give executives and clients View access so they can see results without accidentally changing anything
- **Create shared workflow templates**: Build and share workflow patterns your team can duplicate and customize

### Recommended Team Setup

| Team Role | Suggested Permissions |
|---|---|
| **Research Lead** | Edit + Share on all project resources |
| **Research Analyst** | Edit on datasets and campaigns, View on agents and workflows |
| **Strategist** | View on everything, Edit on specific agents they use |
| **Executive Stakeholder** | View on campaign results and workflow outputs |
| **External Consultant** | View on specific resources only |

## Troubleshooting

### I can't edit something that worked before

Common causes:
- Your access level was changed by the resource owner
- The resource was re-shared with different permissions
- Your workspace role changed
- The resource may have been duplicated and you're looking at the copy

**What to do**: Ask the resource owner or your workspace administrator to check your access level.

### I can't see something my teammate can see

- Make sure you're in the **same workspace** -- workspaces are isolated environments
- Ask your teammate to **share the specific resource** with you
- Check if the resource was recently moved or archived
- Verify you're logged into the correct account

### I can't find the Share option

- You may only have **View** or **Edit** access, which doesn't include sharing permissions
- Ask the resource owner to either share it on your behalf or grant you **Share** access
- If you created the resource, you should always have Share access -- try refreshing the page

### Someone accidentally deleted something

- Contact your workspace administrator immediately -- they may be able to help recover the resource
- For the future, consider limiting **Remove** access to project leads only
- Use the **Archive** option instead of Delete whenever possible

### Share dialog isn't showing all team members

- The person you're looking for may not be a member of this workspace
- Ask your workspace administrator to invite them first
- Verify you're searching by their correct name or email address

### Changes I shared aren't visible to my teammate

- Ask them to refresh their browser page
- Check that they have the correct permission level (View may not show editing changes in real time)
- Ensure you saved your changes before the other person refreshed

## Related Guides

- [Agents](/guide/agents) -- Creating and managing AI personas
- [Campaigns](/guide/campaigns) -- Running research surveys
- [Datasets](/guide/datasets) -- Uploading and organizing files
- [Workflow](/guide/workflows) -- Building automated research pipelines
- [Sources & Citations](/guide/sources-and-citations) -- How AI references your data
- [Quick Reference](/guide/quick-reference) -- Fast answers to common questions
