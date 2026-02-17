# Admin (Enterprise)

The Admin section provides super-admin tools for managing workspaces, users, content, and system configuration across your Vurvey enterprise deployment.

:::warning Enterprise Feature
Admin features are only available to **Enterprise Managers** and **Vurvey Support** roles. Regular workspace administrators do not have access to this section.

If you need admin access, contact your Vurvey account manager.
:::

## Overview

The Admin section includes **11 specialized management pages** organized into logical groups:

### Workspace Management
- **Dashboard** - Analytics and KPIs
- **Manage Brands** - Brand configuration across workspaces
- **Global Campaign Templates** - Reusable survey templates
- **SSO Providers** - Single Sign-On configuration

### System Management
- **Taxonomy Management** - Facets, constraints, and data structure
- **System Prompts** - AI prompt templates and versioning
- **Manage Agents** - Cross-workspace agent administration
- **Manage Agents 2.0** - Next-generation agent management

### Data Management
- **Manage Surveys/Campaigns** - Campaign administration

### Organizational
- **Manage Workspaces** - Workspace settings and billing
- **Manage Vurvey Employees** - Internal team member management

## Accessing Admin Features

1. Navigate to your workspace
2. Click the **profile menu** in the top-right
3. Select **Super Admin** (only visible to Enterprise Managers)
4. Admin navigation opens with 11 pages

:::info Permission Check
If you see "Access Denied" when trying to access `/admin`, you don't have Enterprise Manager or Support role. Contact your Vurvey administrator.
:::

## Dashboard

View workspace-wide analytics and KPIs.

### Features
- **Embedded Metabase dashboard** with interactive visualizations
- Real-time metrics across all workspaces
- Usage statistics and trends
- System health indicators

### Common Metrics
- Total active workspaces
- User activity levels
- Campaign response rates
- API usage patterns
- Storage consumption

## Manage Brands

Administer brand profiles across all workspaces.

### Features
- **Search and filter** brands by workspace, plan, status
- **Bulk operations**: Show/hide multiple brands
- **Verification status** management
- **Plan-based filtering**: Free, Starter, Professional, Enterprise
- **Offline assist** configuration
- **Anonymous access** settings

### Workflows

**Verify a brand:**
1. Search for brand by name
2. Check brand profile completeness
3. Toggle **Verified** status
4. Brand shows verification badge

**Bulk hide brands:**
1. Use filters to find target brands
2. Select multiple brands via checkboxes
3. Click **Bulk Hide**
4. Confirm action
5. Brands hidden from public view

### Filters
- **Plan type**: FREE, STARTER, PROFESSIONAL, ENTERPRISE
- **Verification status**: Verified, Unverified
- **Offline assist enabled**: Yes, No
- **Anonymous access**: Enabled, Disabled

## Global Campaign Templates

Create and manage reusable campaign templates available to all workspaces.

### Features
- **Template library**: Browse all global templates
- **Manage templates**: Create, edit, and delete templates
- **Survey linking**: Associate templates with base surveys
- **Category organization**: Group templates by type
- **Preview**: View template structure before deployment

### Workflows

**Create global template:**
1. Click **Create Template**
2. Name template (e.g., "Product Feedback Survey")
3. Link to existing survey or build from scratch
4. Configure template variables
5. Save and publish
6. Template available to all workspaces

**Clone template:**
1. Find template in list
2. Click **Clone**
3. Modify for new use case
4. Save as new template

## SSO Providers

Configure Single Sign-On authentication providers for enterprise workspaces.

### Features
- **Manage providers**: Create, update, and delete SSO configurations
- **Domain management**: Associate domains with providers
- **Active/inactive toggle**: Enable/disable providers
- **Multiple SSO methods**: SAML, OAuth2, OpenID Connect
- **Test authentication**: Validate SSO configuration

### Configuration Fields

| Field | Description |
|-------|-------------|
| **Provider Name** | Display name (e.g., "Acme Corp SSO") |
| **Domain** | Email domain for auto-detection (e.g., "acme.com") |
| **Provider Type** | SAML, OAuth2, or OpenID Connect |
| **Config** | JSON configuration (metadata URL, certificates, etc.) |
| **Active** | Enable/disable this provider |

### Workflows

**Add SSO provider:**
1. Click **Create Provider**
2. Enter provider name and domain
3. Select provider type (SAML recommended)
4. Paste configuration JSON or metadata URL
5. Test authentication flow
6. Set to **Active**
7. Users with matching email domain auto-routed to SSO

**Update provider:**
1. Click provider in list
2. Edit configuration fields
3. Test changes
4. Save updates
5. Existing users unaffected (re-authentication required)

## Taxonomy Management

Manage facets, constraints, and data taxonomies used across the platform.

### Features
- **5 management tabs**:
  - **Facet Editor**: Create and modify facets
  - **Constraints**: Define validation rules
  - **Versions**: Track taxonomy history
  - **Sync**: Synchronize across systems
  - **AI Recommend**: AI-suggested facet values
- **Facet hierarchy**: Parent-child relationships
- **Constraint rules**: WARN or BLOCK severity
- **Version control**: Rollback capability
- **Sync logs**: Audit trail for changes

### Workflows

**Create new facet:**
1. Go to **Facet Editor** tab
2. Click **Create Facet**
3. Name facet (e.g., "Age Group")
4. Add facet values (e.g., "18-24", "25-34", "35-44")
5. Set parent facet if hierarchical
6. Save facet
7. Available in People→Molds

**Add constraint rule:**
1. Go to **Constraints** tab
2. Click **Add Constraint**
3. Select facets to validate
4. Define rule logic
5. Set severity (WARN or BLOCK)
6. Save rule
7. System enforces during mold configuration

## System Prompts

Manage AI prompt templates used across Vurvey features.

### Features
- **Prompt library**: All system prompts in one place
- **Version control**: Track prompt iterations
- **Category organization**: Agent, Workflow, Chat, Analysis, etc.
- **Template variables**: Typed placeholders (string, number, etc.)
- **Status management**: DRAFT, PUBLISHED, ARCHIVED
- **Duplicate for iteration**: Copy and modify quickly

### Prompt Fields

| Field | Description |
|-------|-------------|
| **Name** | Prompt identifier |
| **Category** | Agent, Workflow, Chat, Analysis, System |
| **Template** | Prompt text with {{variables}} |
| **Variables** | Variable name, type, description |
| **Status** | DRAFT, PUBLISHED, ARCHIVED |
| **Version** | Numeric version (auto-incremented) |
| **Creator** | User who created prompt |

### Workflows

**Create system prompt:**
1. Click **Create Prompt**
2. Name prompt (e.g., "Agent Biography Generator")
3. Select category
4. Write prompt template with {{variables}}
5. Define variable types (string, number, boolean)
6. Set status to DRAFT
7. Test prompt with sample data
8. Publish when ready

**Version a prompt:**
1. Find existing prompt
2. Click **Duplicate**
3. Modify template
4. Increment version number
5. Save as new version
6. Archive old version if replacing

## Manage Agents

Super-admin agent management across all workspaces.

### Features
- **Workspace selector**: Choose which workspace to manage
- **Paginated table**: 100 agents per page
- **Bulk operations**:
  - Delete multiple agents
  - Toggle hidden status
  - Mark as "Vurvey official" agents
- **YAML import**: Batch create agents from configuration files
- **YAML import rules**: Apply patterns across imports
- **Hidden agent management**: Show/hide agents in workspace

### Workflows

**Bulk delete agents:**
1. Select workspace from dropdown
2. Agents table loads
3. Check boxes for agents to delete
4. Click **Delete Selected**
5. Confirm deletion
6. Agents removed from workspace

**YAML import:**
1. Prepare YAML file with agent definitions
2. Click **Import YAML**
3. Select population (if agent uses facets)
4. Upload YAML file
5. System validates structure
6. Click **Import**
7. Agents created in selected workspace

**Toggle Vurvey flag:**
1. Select agents in table
2. Click **Mark as Vurvey Agent**
3. Internal flag applied
4. Agents marked for special handling

## Manage Agents 2.0

Next-generation agent administration (requires feature flag).

:::info Feature Flag Required
This page only appears if `agentBuilderV2Active` is enabled in the workspace.
:::

### Features
- Similar to "Manage Agents" but for V2 agent architecture
- Enhanced search and filtering
- Improved bulk operations
- Advanced agent configuration options

## Manage Surveys/Campaigns

Super-admin campaign management across workspaces.

### Features
- **Workspace selector**: Choose workspace
- **Paginated survey table**: All campaigns for workspace
- **Bulk clone**: Copy surveys to other workspaces
- **Search and filter**: Find campaigns quickly
- **Metadata display**: ID, name, status, question count

### Workflows

**Clone survey to multiple workspaces:**
1. Select source workspace
2. Find survey in table
3. Click **Clone**
4. Select target workspaces (multi-select)
5. Click **Clone to Selected Workspaces**
6. Surveys copied with all questions and settings
7. Original survey unchanged

## Manage Workspaces

Administer all workspaces, billing, and credits.

### Features
- **Workspace listing**: All enterprise workspaces
- **Search and filter**: By plan, owner, status
- **Credit management**:
  - View credit history
  - Add credits to workspace
  - Set effective dates
  - Batch credit updates
- **Workspace settings editor**: Modify configuration
- **Status indicators**: Visible, verified flags

### Workflows

**Add credits to workspace:**
1. Search for workspace by name
2. Click workspace row
3. Go to **Credits** tab
4. Click **Add Credits**
5. Enter credit amount
6. Set effective date
7. (Optional) Add note
8. Save
9. Credits available to workspace immediately

**Update workspace settings:**
1. Find workspace in list
2. Click **Edit Settings**
3. Modify feature flags, limits, or configuration
4. Save changes
5. Workspace updated in real-time

### Filter Options
- **Plan**: FREE, STARTER, PROFESSIONAL, ENTERPRISE
- **Owner**: Filter by workspace owner name/email
- **Created date**: Date range filtering
- **Status**: Active, Inactive, Trial, Suspended

## Manage Vurvey Employees

Internal team member management and role assignments.

### Features
- **Employee listing**: All Vurvey staff members
- **Manage employees**: Create and delete employees
- **Role management**: Change employee roles
- **Permission sync**: Permissions updated automatically
- **Audit trail**: Track employee actions

### Workflows

**Create employee:**
1. Click **Create Employee**
2. Enter email address
3. Select role:
   - Enterprise Manager
   - Support
   - Developer
   - Analyst
4. Set permissions
5. Save
6. Employee receives invitation email

**Change employee role:**
1. Find employee in list
2. Click **Change Role**
3. Select new role
4. Confirm change
5. Permissions updated immediately
6. Permissions synced automatically

**Delete employee:**
1. Select employee in table
2. Click **Delete**
3. Confirm deletion
4. Access revoked immediately
5. Audit log entry created

## Common Admin Workflows

### Onboard New Enterprise Customer

1. **Create workspace** in Manage Workspaces
2. **Add credits** for initial allocation
3. **Configure SSO** if required
4. **Create brand profile** in Manage Brands
5. **Clone campaign templates** to new workspace
6. **Assign agents** via Manage Agents
7. **Verify setup** via Dashboard metrics

### Troubleshoot Workspace Issue

1. **Check Dashboard** for anomalies
2. **Review workspace settings** in Manage Workspaces
3. **Check credit balance** and usage
4. **Verify SSO configuration** if auth issues
5. **Review agent/campaign setup** for content issues
6. **Check system prompts** for AI behavior issues

### Monthly Enterprise Review

1. Open **Dashboard** for overview
2. Review **workspace credits** and add as needed
3. Check **brand verification** statuses
4. Update **global campaign templates** based on feedback
5. Archive old **system prompts**
6. Review **employee access** and adjust roles

## Best Practices

### Security
- **Principle of least privilege**: Grant minimum necessary access
- **Regular audits**: Review employee access quarterly
- **SSO for all**: Enforce SSO for enterprise workspaces
- **Monitor Dashboard**: Check for unusual activity weekly

### Data Management
- **Version everything**: Use version control for prompts and taxonomy
- **Test before publishing**: Validate changes in test workspace first
- **Document changes**: Add notes to credit adjustments and setting updates
- **Backup configurations**: Export SSO and taxonomy configs regularly

### Team Coordination
- **Communication**: Notify teams before major system changes
- **Change log**: Maintain log of admin actions
- **Scheduled maintenance**: Plan taxonomy/prompt updates during low-traffic periods
- **Emergency contacts**: Keep list of super-admins for critical issues

## FAQ

**Q: Can I delegate admin access to workspace administrators?**
A: No. Admin access requires Enterprise Manager or Support role, which only Vurvey staff can grant. Workspace administrators have limited admin capabilities within their own workspace.

**Q: What happens if I delete a system prompt that's in use?**
A: Active prompts should be archived, not deleted. Deleting an in-use prompt may cause errors. Always archive and create a new version instead.

**Q: Can I roll back taxonomy changes?**
A: Yes, use the Versions tab in Taxonomy Management to view history and restore previous versions.

**Q: How do I add a new workspace plan tier?**
A: Workspace plan configuration is handled at the application level. Contact Vurvey engineering to add new plan types.

**Q: Can I bulk-update agent configurations?**
A: Yes, use YAML import with import rules to batch-update agents across workspaces.

**Q: What's the difference between Manage Agents and Manage Agents 2.0?**
A: Manage Agents handles V1 (classic) agents. Manage Agents 2.0 is for the new guided agent builder architecture. Use the appropriate page based on the agent version.

**Q: How do I debug SSO authentication failures?**
A: Check the SSO provider configuration for correct metadata URLs and certificates. Use the Test Authentication feature. Review auth logs in the workspace's audit trail.

**Q: Can I limit a workspace's API usage?**
A: Yes, set rate limits and quotas in Manage Workspaces → Edit Settings → API Limits.

## Related Features

- [Settings](/guide/settings) - Workspace-level configuration
- [Permissions & Sharing](/guide/permissions-and-sharing) - Understanding access control
- [Agents](/guide/agents) - Agent creation and management
- [Campaigns](/guide/campaigns) - Campaign template creation
