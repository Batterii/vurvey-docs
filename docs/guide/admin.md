# Admin (Enterprise)

::: warning Enterprise-Only Feature
The Admin section is only available to **Enterprise Manager** users. If you don't see Admin in your workspace dropdown menu, your account does not have enterprise-level access.
:::

The Admin section provides system-wide management capabilities for Vurvey platform administrators, including workspace management, brand administration, template configuration, and system-level settings.

## Overview

Admin capabilities let you:
- Manage multiple workspaces and their feature flags
- Oversee brand profiles across the platform
- Configure campaign and workflow templates
- Manage agents and AI personas globally
- Configure SSO providers for enterprise authentication
- Administer system prompts and taxonomy settings
- Manage Vurvey employee accounts

Access Admin from the workspace dropdown menu in the header (visible only to Enterprise Manager users).

::: info Enterprise Route Guard
Admin routes are protected by the `EnterpriseRouteGuard`. Non-enterprise users who attempt to access admin routes are redirected with an error message.
:::

## Admin Navigation

The Admin section includes 11 main pages, all lazy-loaded for performance:

| Page | Purpose | Route |
|------|---------|-------|
| **Dashboard** | Analytics and metrics overview | `/:workspaceId/admin` |
| **Brand Management** | Search, filter, and bulk-update brands | `/:workspaceId/admin/brands` |
| **Campaign Templates** | CRUD for campaign templates | `/:workspaceId/admin/campaign-templates` |
| **Agents Admin** | Workspace-scoped agent management | `/:workspaceId/admin/agents` |
| **Agents V2 Admin** | Advanced agent management | `/:workspaceId/admin/agents-v2` |
| **Surveys Admin** | Workspace-scoped survey management | `/:workspaceId/admin/surveys` |
| **SSO Providers** | Configure SAML and OAuth providers | `/:workspaceId/admin/sso-providers` |
| **Workspace Management** | Bulk workspace feature updates | `/:workspaceId/admin/workspaces` |
| **System Prompts** | CRUD for system-level prompts | `/:workspaceId/admin/system-prompts` |
| **Taxonomy Management** | Facet editor, constraints, versions | `/:workspaceId/admin/taxonomy` |
| **Vurvey Employees** | Employee account CRUD and roles | `/:workspaceId/admin/employees` |

## Dashboard

The Dashboard provides a high-level analytics view powered by Metabase.

**What You See:**
- Embedded Metabase iframe with key metrics
- Workspace usage statistics
- User engagement trends
- Platform health indicators

**Typical Metrics:**
- Total workspaces and active users
- Campaign volume and response rates
- AI usage (agent interactions, workflow runs)
- Storage and compute consumption

The dashboard refreshes automatically and pulls real-time data from the Vurvey platform database.

## Brand Management

Search, filter, and bulk-manage brand profiles across all workspaces.

### Features

- **Search brands** — Find brands by name, URL, or workspace
- **Filter** — By category, country, or status
- **Bulk update** — Change categories, countries, or other attributes for multiple brands
- **View details** — Click any brand to see its full profile
- **Edit** — Update brand information (name, description, logo, colors)

### Common Tasks

**Find all brands in a specific category:**
1. Navigate to Admin → Brand Management
2. Use the category filter dropdown
3. Select the category (e.g., "Beauty & Personal Care")
4. Review the filtered list

**Bulk-update brand countries:**
1. Search or filter to find the brands you want to update
2. Select brands using checkboxes
3. Click **Bulk Update**
4. Choose the attribute to update (e.g., "Countries")
5. Select the new value(s)
6. Confirm

**Audit brand completeness:**
1. Sort brands by completeness score
2. Identify brands with incomplete profiles
3. Reach out to workspace owners to complete their brand information

## Campaign Templates

Manage pre-built campaign templates that users can deploy as starting points.

### Template Operations

| Operation | Description |
|-----------|-------------|
| **Create** | Build a new campaign template with questions and settings |
| **Update** | Modify an existing template |
| **Delete** | Remove a template from the library |
| **Link Survey** | Associate a template with a specific survey |
| **Publish** | Make a template available to all workspaces |
| **Unpublish** | Hide a template from the template library |

### Template Structure

Each template includes:
- **Name and description** — What the template is for
- **Category** — Template type (e.g., Brand Health, Product Feedback, Market Research)
- **Questions** — Pre-configured question set
- **Settings** — Default campaign configuration (access level, completion requirements)
- **Target audience** — Suggested use case and participant profile

### Creating a New Template

1. Navigate to Admin → Campaign Templates
2. Click **+ Create Template**
3. Enter template name and description
4. Select a category
5. Add questions (one at a time or import from an existing survey)
6. Configure default settings
7. Save the template
8. Publish to make it available to users

**Template Best Practices:**
- Keep question sets focused (5–10 questions recommended)
- Include clear instructions in the template description
- Test the template by deploying it in a test workspace
- Document intended use cases

## Agents Admin

Manage AI agents across workspaces with advanced filtering and bulk operations.

### Features

- **Workspace selector** — View agents from a specific workspace or all workspaces
- **YAML import** — Bulk-create agents from YAML configuration files
- **Bulk management** — Delete, publish, or update multiple agents at once
- **Search and filter** — Find agents by name, type, model, or status

### Workspace Selector

The workspace dropdown lets you:
- View agents in a specific workspace
- See all agents across all workspaces (enterprise view)
- Filter to agents you own or manage

### YAML Import

Import agent configurations in bulk:

```yaml
agents:
  - name: "Market Analyst"
    type: "Assistant"
    objective: "Analyze market trends and consumer behavior"
    model: "gpt-4o"
    status: "published"

  - name: "Gen Z Shopper"
    type: "Consumer Persona"
    facets:
      age: 22
      location: "Los Angeles, CA"
      income: "$35,000"
    status: "draft"
```

1. Navigate to Admin → Agents Admin
2. Click **Import YAML**
3. Paste or upload your YAML file
4. Review the preview
5. Click **Import**
6. Agents are created in the selected workspace

### Bulk Operations

Select multiple agents and:
- **Publish** — Activate all selected agents
- **Unpublish** — Deactivate all selected agents
- **Delete** — Remove agents permanently
- **Change model** — Update the AI model for all selected agents
- **Update permissions** — Bulk-assign OpenFGA permissions

## Agents V2 Admin

Advanced agent management for V2 agents (new agent builder format).

### Features

- **Search** — Find agents by name or ID
- **Select** — Multi-select for bulk actions
- **Delete** — Remove V2 agents
- **Copy** — Duplicate agents to other workspaces
- **Permission management** — Control access across workspaces

### V2 vs. V1 Agents

| Aspect | V1 Agents | V2 Agents |
|--------|-----------|-----------|
| **Builder** | Original single-page builder | New step-by-step wizard |
| **Validation** | All-at-once | Step-by-step |
| **Facets** | Limited facet support | Full facet hierarchy with molds |
| **Status** | Active/Inactive | Draft/Published |
| **Permissions** | Workspace-only | OpenFGA granular permissions |

V2 is the recommended format for new agents. V1 agents still work but may be deprecated in the future.

## Surveys Admin

Manage surveys (campaigns) across workspaces.

### Features

- **Workspace selector** — View surveys from specific workspaces
- **Clone surveys** — Duplicate surveys to other workspaces
- **Bulk operations** — Publish, close, or archive multiple surveys
- **Search** — Find surveys by name, creator, or status

### Common Use Cases

**Clone a successful survey to multiple workspaces:**
1. Find the source survey
2. Click **Clone**
3. Select target workspaces
4. Confirm
5. The survey is duplicated to all selected workspaces

**Archive old surveys in bulk:**
1. Filter to surveys closed more than 1 year ago
2. Select all
3. Click **Archive**
4. Confirm

## SSO Providers

Configure Single Sign-On (SSO) providers for enterprise authentication.

::: info What is SSO?
Single Sign-On lets users log in to Vurvey using their company credentials (e.g., Google Workspace, Microsoft 365, Okta). This centralizes authentication and simplifies access management for large organizations.
:::

### SSO Provider Configuration

Each provider requires:
- **Provider name** — Display name (e.g., "Acme Corp SSO")
- **Domain** — Email domain to match (e.g., "acme.com")
- **Configuration** — SAML metadata or OAuth client credentials
- **Active status** — Enable or disable the provider

### Supported SSO Methods

| Method | Use Case |
|--------|----------|
| **SAML 2.0** | Enterprise identity providers (Okta, OneLogin, Azure AD) |
| **OAuth2** | Google Workspace, Microsoft 365 |
| **Custom** | Proprietary SSO systems |

### Creating an SSO Provider

1. Navigate to Admin → SSO Providers
2. Click **+ Create Provider**
3. Enter provider name and domain
4. Choose SSO method (SAML or OAuth)
5. Upload SAML metadata or enter OAuth credentials
6. Test the configuration
7. Activate the provider

**Testing SSO:**
1. Open an incognito browser window
2. Navigate to the Vurvey login page
3. Enter an email address with the SSO domain
4. Verify you're redirected to the SSO provider
5. Complete the SSO login flow
6. Verify you land back in Vurvey as authenticated

### Managing SSO Providers

- **Edit** — Update provider configuration or domain
- **Delete** — Remove the provider (existing users keep their accounts but must use email/password)
- **Enable/Disable** — Temporarily turn off SSO without deleting

## Workspace Management

Bulk-update workspace feature flags and settings.

### Features

- **Feature flag updates** — Enable or disable features for multiple workspaces
- **Credit management** — Adjust AI usage credits
- **Bulk workspace creation** — Provision many workspaces from a CSV
- **Search and filter** — Find workspaces by name, plan, or owner

### Feature Flags

Common feature flags you can toggle:

| Flag | Description |
|------|-------------|
| `chatbotEnabled` | Enable/disable AI chat and Home page |
| `forecastEnabled` | Enable/disable Forecast module |
| `workflowscheduling` | Allow scheduled workflow runs |
| `agentBuilderV2Active` | Use V2 agent builder instead of V1 |
| `dashboardGenerator` | Enable Dashboard nav item |

### Bulk Feature Update

1. Filter workspaces (e.g., all Pro plan workspaces)
2. Select the workspaces to update
3. Click **Bulk Update**
4. Choose the feature flag to modify
5. Set to enabled or disabled
6. Confirm
7. Changes apply immediately

## System Prompts

Manage system-level prompts used by agents and workflows.

### Prompt Structure

Each system prompt includes:
- **Name** — Identifier for the prompt
- **Content** — The actual prompt text
- **Version** — For tracking changes over time
- **Category** — Prompt type (agent behavior, workflow instruction, etc.)
- **Active status** — Whether this prompt is currently in use

### Prompt Operations

- **Create** — Add a new system prompt
- **Update** — Modify an existing prompt
- **Version** — Save a new version while preserving the old one
- **Delete** — Remove a prompt (blocked if in use)

### Use Cases

**Update agent default instructions:**
1. Find the "Agent Default Instruction" prompt
2. Click **Edit**
3. Modify the prompt text
4. Save as a new version
5. All new agents created after this point use the updated prompt

**Test prompt variations:**
1. Create a new version of an existing prompt
2. Activate the new version in a test workspace
3. Compare agent behavior with old vs. new prompts
4. If successful, roll out to all workspaces

## Taxonomy Management

Configure the facet hierarchy, constraints, and versions used for persona agents and molds.

### Sub-Pages

| Tab | Purpose |
|-----|---------|
| **Facet Editor** | Create and edit facet categories and values |
| **Constraints** | Define rules that limit facet combinations |
| **Versions** | Manage taxonomy versions over time |
| **Sync** | Synchronize taxonomy changes across workspaces |
| **AI Recommend** | AI-powered facet value suggestions |

### Facet Editor

Facets define the characteristics of persona agents (age, income, values, behaviors, etc.).

**Facet hierarchy:**
- **Category** (e.g., Demographics)
  - **Facet** (e.g., Age)
    - **Values** (e.g., 18-24, 25-34, 35-44)

**Editing facets:**
1. Navigate to Admin → Taxonomy → Facet Editor
2. Select a category
3. Click **+ Add Facet** or edit an existing one
4. Enter facet name and description
5. Add values (discrete options or range)
6. Save

### Constraints

Constraints prevent illogical facet combinations. For example:
- "Income: $200k+" should not combine with "Age: 18-24" (unlikely)
- "Life Stage: Retired" should not combine with "Employment: Full-time"

**Constraint severity:**
- **WARN** — Show a warning but allow the combination
- **BLOCK** — Prevent the combination entirely

**Creating a constraint:**
1. Navigate to Admin → Taxonomy → Constraints
2. Click **+ Create Constraint**
3. Define the conflicting facet combination
4. Set severity (WARN or BLOCK)
5. Enter a human-readable explanation
6. Save

### Versions

Taxonomy evolves over time. Versions let you:
- Track changes to facets and constraints
- Roll back to previous versions
- Test new taxonomy structures before deploying

**Version management:**
- **Create new version** — Snapshot the current taxonomy
- **Activate version** — Switch the active taxonomy version
- **Compare versions** — See what changed between versions

### Sync

Push taxonomy updates to all workspaces or specific workspace groups.

**Sync workflow:**
1. Make changes to the taxonomy
2. Test in a single workspace
3. Navigate to Admin → Taxonomy → Sync
4. Select target workspaces
5. Click **Sync Now**
6. Monitor sync progress
7. Verify changes propagated correctly

## Vurvey Employees

Manage internal employee accounts with elevated permissions.

### Features

- **CRUD operations** — Create, read, update, and delete employee accounts
- **Role management** — Assign enterprise manager, support, or admin roles
- **OpenFGA sync** — Synchronize employee permissions with the OpenFGA system
- **Account status** — Activate or deactivate employee accounts

### Employee Roles

| Role | Permissions |
|------|-------------|
| **Enterprise Manager** | Full admin access, workspace management, system configuration |
| **Support** | Read-only access for customer support, limited editing |
| **Admin** | Platform configuration, template management, no billing access |

### Creating an Employee Account

1. Navigate to Admin → Vurvey Employees
2. Click **+ Create Employee**
3. Enter name and email
4. Assign role
5. Set account status (Active/Inactive)
6. Save
7. The employee receives an invitation email

### OpenFGA Sync

After creating or updating employee accounts, sync with OpenFGA:

1. Click **Sync OpenFGA**
2. The system updates permissions across all workspaces
3. Employees can immediately access features based on their role

## Best Practices

### Enterprise Admin Guidelines

- **Limit enterprise manager access** — Only grant to trusted administrators
- **Document changes** — Keep a log of major configuration changes
- **Test in staging first** — Use a test workspace before bulk operations
- **Communicate updates** — Notify affected workspaces before making changes
- **Regular audits** — Review SSO providers, employee accounts, and permissions quarterly

### Security Considerations

- **SSO over passwords** — Encourage SSO for enterprise workspaces
- **Rotate employee credentials** — Update employee access when roles change
- **Monitor system prompts** — Changes affect all users; review carefully
- **Audit logs** — Check admin activity logs regularly

### Performance

- **Bulk operations** — Limit to 100 workspaces at a time for stability
- **Lazy loading** — Admin pages lazy-load to reduce initial load time
- **Metabase dashboard** — May take a few seconds to load; be patient

## Troubleshooting

**Can't access Admin section?**
You need the **Enterprise Manager** role. Contact your account administrator if you believe you should have access.

**SSO provider not working?**
- Verify the domain matches exactly (including subdomains)
- Check that the SAML metadata or OAuth credentials are correct
- Test with a different user to rule out account-specific issues
- Review SSO provider logs for error messages

**Bulk operation fails partway through?**
- Reduce batch size (fewer workspaces per operation)
- Check for permission errors in the affected workspaces
- Retry the failed workspaces individually

**Taxonomy sync doesn't propagate?**
- Verify target workspaces are active
- Check for constraint conflicts that might block the sync
- Review sync logs for error messages
- Try syncing to a single workspace first to isolate the issue

**Employee account can't log in?**
- Verify the account status is **Active**
- Check that OpenFGA permissions were synced
- Ensure the employee verified their email address
- Try resetting the employee's password

## Frequently Asked Questions

::: details Click to expand

**Q: Who can access the Admin section?**
A: Only users with the **Enterprise Manager** role. This role is assigned by Vurvey platform administrators.

**Q: Can I undo admin changes?**
A: Some changes (like system prompts versions) can be reverted. Others (like bulk deletions) are permanent. Always test changes in a non-production workspace first.

**Q: How do I become an Enterprise Manager?**
A: Contact Vurvey support or your account representative. Enterprise Manager access is granted as part of enterprise agreements.

**Q: Can I restrict Admin access to specific workspaces?**
A: No. Enterprise Managers have access to all workspaces on the platform. This is intentional for system-wide administration.

**Q: What happens if I delete a widely-used template?**
A: Existing campaigns created from that template are unaffected. Users can no longer create new campaigns from the deleted template.

**Q: Can I export admin data for reporting?**
A: The Metabase dashboard supports exports. Other admin pages may have export options (check for **Export** buttons).

**Q: How often should I sync taxonomy changes?**
A: Only when necessary. Frequent syncs can be disruptive. Batch changes and sync once every few weeks or months.

**Q: Can regular users see admin data?**
A: No. The admin section is completely hidden from non-enterprise users. They cannot see or access admin routes.
:::

## Next Steps

- [Configure workspace settings](/guide/settings)
- [Manage SSO for enterprise](/guide/login)
- [Create campaign templates](/guide/campaigns)
- [Build system-level agents](/guide/agents)
