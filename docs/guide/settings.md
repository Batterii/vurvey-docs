# Settings

The Settings section lets you configure your workspace, manage team members, browse available AI models, and control workspace-level preferences. Access Settings from the workspace dropdown menu in the top-right corner of the app.

![General Settings](/screenshots/settings/01-general-settings.png)

## Navigation

The Settings area includes several tabs:

| Tab | Route | Purpose |
|-----|-------|---------|
| **General** | `/:workspaceId/workspace/settings` | Workspace name, avatar, session timeout, plan info |
| **AI Models** | `/:workspaceId/workspace/settings/ai-models` | Browse available AI models by category |
| **Members** | `/:workspaceId/workspace/members` | Invite users, manage roles, remove members |
| **API Management** | `/:workspaceId/workspace/settings/api-management` | Apigee API key management (currently disabled in some builds) |

::: info API Terminology
In the codebase, **Workspace** is the same concept the UI calls "Workspace." Settings management uses GraphQL mutations like `UPDATE_WORKSPACE` and `GET_WORKSPACE`.
:::

## General Settings

The General tab controls your workspace's basic configuration.

### Workspace Identity

**Workspace Name**
- Change your workspace's display name
- Appears in the header and navigation throughout the app
- No length restrictions, but keep it concise for readability

**Workspace Avatar**
- Upload a logo or icon to represent your workspace
- Displayed in the top-left corner of the application
- Supported formats: PNG, JPG, SVG
- Square images work best

### Session Management

**Inactivity Timeout**
- Enable or disable automatic sign-out after a period of inactivity
- Configure the timeout duration in minutes (default: 30 minutes)
- When enabled, users are automatically logged out if they leave the app idle
- Security best practice for shared or public computers

::: tip When to Enable Session Timeout
Enable inactivity timeout if:
- Your team accesses Vurvey from shared workstations
- You handle sensitive consumer research data
- Compliance requirements mandate automatic session expiration

Leave it disabled if your team works from dedicated, secured devices and finds re-authentication disruptive.
:::

### Perlin Sphere Animation

Configure the animated 3D sphere that appears on the Home screen:
- **Enable/disable** the animation entirely
- Customize visual appearance and behavior
- The sphere provides visual interest on the landing screen

### Plan Information

View your current subscription plan and billing status. This section is read-only in General Settings. To change plans or manage billing, enterprise managers can access plan management through the admin area.

### Tremendous Rewards Integration

If your workspace has Tremendous rewards configured, this section displays:
- **Tremendous API status** — whether the integration is active
- **Available funding sources** — which payment methods are configured
- **Configuration controls** — set up or modify the Tremendous integration

To configure Tremendous:
1. Click **Set up Tremendous**
2. Enter your Tremendous API key
3. Select funding sources
4. Save your configuration

Once configured, you can manage reward distribution from the [Rewards](/guide/rewards) page.

## AI Models Browser

![AI Models Browser](/screenshots/settings/02-ai-models.png)

The **AI Models** tab provides a catalog of all AI models available in your workspace, organized by category.

### Model Categories

| Category | Description | Example Models |
|----------|-------------|---------------|
| **Text Generation** | Language models for conversations, analysis, writing | GPT-4o, Claude, Gemini Pro |
| **Image Generation** | Visual content creation models | DALL-E, Imagen, Stable Diffusion, Nano Banana |
| **Vision** | Models that analyze and understand images | Gemini Pro Vision, GPT-4o Vision |
| **Audio/Speech** | Transcription and audio analysis | Whisper, speech-to-text models |
| **Specialized** | Domain-specific or fine-tuned models | Custom research models, analysis specialists |

### Browsing Models

- **Search** — Filter models by name or capability
- **Category filter** — View models within a specific category
- **Model cards** — Each card shows the model name, provider, capabilities, and availability status

### How Models Are Used

Models selected in this browser become available when:
- Creating agents (you choose which model powers each agent)
- Running workflows (administrators can select models per workflow step)
- Using chat with model override (if enabled)

::: tip Model Selection Strategy
- **Faster models** (like Gemini Flash) work well for everyday tasks and high-volume usage
- **More capable models** (like GPT-4o or Claude) excel at complex analysis, creative work, and nuanced instructions
- **Vision models** are required when agents need to analyze images or video content
- **Specialized models** may be custom-tuned for specific research domains in your workspace
:::

## Member Management

![Member Management](/screenshots/settings/03-members.png)

The **Members** tab lets you invite teammates, assign roles, and manage workspace access.

### Inviting Users

1. Click **Invite Users** or **+ Add** (button varies by plan)
2. Enter email addresses (one per line, or comma-separated)
3. Select a role for the new members
4. Click **Send Invitations**

Invited users receive an email with a registration link. Once they complete registration, they appear in the members list.

::: warning Trial and Pending Plans
If your workspace is on a Trial or Pending plan, you may see an upgrade banner instead of the "Add Users" button. Upgrade your plan to invite additional members.
:::

### Workspace Roles

| Role | Permissions |
|------|-------------|
| **Owner** | Full control including billing, plan changes, workspace deletion, and ownership transfer |
| **Administrator** | Can manage members, update workspace settings, and manage labels — cannot change billing or delete the workspace |
| **Manager** | Can access all features and create content — cannot manage members or workspace settings |

**Role Assignment:**
- Workspace owners can assign any role
- Administrators can change member roles (but cannot create or remove owners)
- Managers cannot change roles

### Member Actions

For each member in the list, you can:
- **Change role** — Click the role dropdown to assign a different role
- **Remove member** — Click the three-dot menu and select **Remove**

::: warning Cannot Edit Your Own Account
You cannot change your own role or remove yourself from the workspace. If you need to leave the workspace as an owner, transfer ownership to another member first.
:::

**Removing Members:**
When removing a member, you'll be prompted to handle content ownership. You can:
- Transfer their created content (agents, workflows, campaigns) to another member
- Leave content in place with original attribution

### Member List

The members table displays:
- **Name** — Member's full name
- **Email** — Member's email address
- **Role** — Current workspace role
- **Status** — Invited, Active, or other status indicators
- **Actions** — Three-dot menu for role changes and removal

Use the **Search** field to filter members by name or email. Use **Sort** to order by name, role, or join date.

## Labels Management

Workspace administrators can manage file tag labels used across datasets.

**Access:** Navigate to `/:workspaceId/datasets/labels` (linked from the Datasets page)

**Label Operations:**
- **Create labels** — Add new tags for organizing dataset files
- **Edit labels** — Rename existing tags
- **Delete labels** — Remove unused tags (fails if the label is currently in use)

::: warning Admin-Only Feature
Label management redirects non-administrators with a permission error toast. Only workspace administrators and owners can access this feature.
:::

## API Management

![API Management](/screenshots/settings/04-api-management.png?optional=1)

The **API Management** tab controls Apigee API keys for programmatic access to Vurvey.

::: warning Currently Disabled
API Management is currently disabled in some workspace builds. If you don't see this tab, API key management is not available in your workspace.
:::

**When enabled, you can:**
- View existing API keys (apps) for your workspace
- Create new API keys for integrations
- Revoke API keys when they're no longer needed

### API Key Operations

**Create an API Key:**
1. Click **Create API Key**
2. Enter an app name (descriptive identifier for this key)
3. The system generates a new Apigee developer account (if you don't have one) and app
4. Copy the API key and secret for use in your integration

**Revoke an API Key:**
1. Find the key in the list
2. Click **Revoke** or the delete icon
3. Confirm the action
4. The key immediately stops working

::: warning Revocation Is Immediate
Once you revoke an API key, any integrations using that key will fail immediately. Make sure to update your integrations before revoking keys.
:::

### Use Cases for API Access

API keys enable:
- **Workflow automation** — Trigger Vurvey workflows from external systems
- **Data export** — Pull campaign results or dataset contents programmatically
- **Workspace creation** — Provision new workspaces via API (Zapier integrations)
- **Third-party integrations** — Connect Vurvey to your data pipeline or business intelligence tools

## Billing and Plan

![Billing and Plan](/screenshots/settings/05-billing-plan.png?optional=1)

View your current plan, billing status, and subscription details. (Screenshot shows typical billing information for reference.)

**Displayed information:**
- Current plan name (Trial, Pro, Enterprise, etc.)
- Billing status (Active, Past Due, Cancelled, etc.)
- Subscription details (renewal date, payment method on file)
- Feature limits for your current plan

**Plan Changes:**
Enterprise managers can modify workspace plans through the admin area. Regular workspace administrators see read-only plan information here.

## Permission-Based UI

Settings pages adapt based on your role:

| Feature | Owner | Administrator | Manager |
|---------|-------|---------------|---------|
| Change workspace name/avatar | ✓ | ✓ | ✗ |
| Configure session timeout | ✓ | ✓ | ✗ |
| Manage members | ✓ | ✓ | ✗ |
| Change member roles | ✓ | ✓ | ✗ |
| Remove members | ✓ | ✓ | ✗ |
| Manage labels | ✓ | ✓ | ✗ |
| Configure Tremendous | ✓ | ✓ | ✗ |
| View billing/plan | ✓ | Read-only | Read-only |
| Change plan | ✓ (Enterprise Manager) | ✗ | ✗ |

## Troubleshooting

**Can't change workspace settings?**
Check your role. Only administrators and owners can modify workspace settings. Managers have read-only access.

**"You cannot edit your own account" error?**
This is expected behavior. You cannot change your own role or remove yourself. Ask another administrator or owner to make changes to your account.

**Label deletion fails?**
The label is currently in use on dataset files. Remove the label from all files first, then try deleting again.

**Invite button shows "Upgrade to invite users"?**
Your workspace is on a Trial or Pending plan. Upgrade to a paid plan to invite additional members.

**API Management tab missing?**
This feature is currently disabled in some workspace configurations. Contact your enterprise account manager if you need API access.

**Tremendous integration not saving?**
Verify your Tremendous API key is valid and has the correct permissions. Check that you've selected at least one funding source before saving.

**Session timeout not working?**
Make sure the feature is toggled **on** and you've saved your changes. The timeout value must be greater than zero. Test by waiting past the configured timeout period while idle.

## Next Steps

- [Manage team permissions and sharing](/guide/permissions-and-sharing)
- [Configure Tremendous rewards](/guide/rewards)
- [Set up third-party integrations](/guide/integrations)
- [Invite team members to collaborate](/guide/home)
