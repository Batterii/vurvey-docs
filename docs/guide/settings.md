# Settings

The Settings section is where you configure workspace-level options, manage team members, browse available AI models, and (for enterprise workspaces) manage API access.

## Overview

![General Settings](/screenshots/settings/01-general-settings.png)

Settings control how your entire workspace operates. From session timeouts and workspace branding to team member roles and AI model selection, this is your workspace's control center.

::: info API Term: Workspace
In the Vurvey API and codebase, Settings pages are part of `workspace-settings`. This documentation uses "workspace" and "Settings" interchangeably when referring to these configuration pages.
:::

## Navigation

Access **Settings** from the workspace dropdown menu in the top-right corner of the app (click your workspace avatar). The Settings section has multiple tabs:

| Tab | Description |
|-----|-------------|
| **General settings** | Workspace name, avatar, session timeout, billing plan, and Tremendous rewards configuration |
| **AI Models** | Browse available AI models organized by category |
| **API Management** | Create and manage API keys (enterprise only, may be disabled) |

**Related pages:**
- **Workspace Members** — Manage team members, roles, and invitations (accessible via workspace dropdown → "Manage Users")

---

## General Settings

The default settings page includes several configuration sections:

### Session Timeout

Configure automatic logout settings for your workspace. When enabled, users are automatically logged out after a specified period of inactivity.

**Configuration options:**
- **Enable/Disable** — Toggle automatic timeout
- **Timeout duration** — Set the number of minutes before logout (default values vary by plan)

::: tip Security Best Practice
Enable session timeout for workspaces handling sensitive consumer data. Set a reasonable timeout (15-30 minutes) that balances security with user convenience.
:::

### Workspace Name

Customize your workspace by giving it a unique name. This name is visible to all members of your workspace and appears in the top-left corner of the app.

**To update:**
1. Click **Edit** next to the current workspace name
2. Enter the new name
3. Click **Save**

::: warning Unique Names
Workspace names must be unique across your organization. If you're part of an enterprise account with multiple workspaces, choose descriptive names like "Beauty Research - Q1 2025" or "Product Team - EMEA" to avoid confusion.
:::

### Workspace Avatar

Upload an avatar to represent your workspace visually. Choose an image that reflects the essence of your team or project for easy recognition across the platform.

**Supported formats:** JPG, PNG
**Recommended size:** Square images work best (at least 256x256px)

### Current Plan

View the details of your current subscription plan, including the features available to you and your team.

**Plan information shown:**
- **Plan name** (e.g., Enterprise, Pro, Trial)
- **Enhanced security and support** (for Enterprise plans)
- **Billing status**

Click through to your billing portal to upgrade or modify your plan.

### Tremendous Rewards Configuration

If your workspace uses the Tremendous integration for participant incentives, configure your reward settings here.

**Configuration steps:**
1. Click **Edit** or **Configure** in the Tremendous section
2. Enter your Tremendous API key
3. Select your default funding source
4. Choose default reward currency (USD, EUR, CAD, THB, CNY, SEK, GBP)
5. Save

::: tip Using Tremendous for Campaign Incentives
Tremendous integrates with Vurvey Campaigns to automatically send monetary rewards to participants who complete your surveys. Set up Tremendous here, then configure reward amounts per campaign in the Launch flow.

See the [Rewards](/guide/rewards) page for detailed Tremendous configuration and management.
:::

---

## AI Models

![AI Models Browser](/screenshots/settings/02-ai-models.png)

The AI Models page lets you browse all available AI models in your workspace, organized by category.

### Model Categories

Models are grouped into categories for easy browsing:

| Category | Types of Models |
|----------|-----------------|
| **Text Generation** | GPT-4o, Claude, Gemini 3 Flash/Pro, and other LLMs |
| **Image Generation** | DALL-E, Stable Diffusion, Imagen, Midjourney |
| **Video Generation** | Google Veo, Runway, and other video AI models |
| **Audio** | Text-to-speech and audio generation models |
| **Multimodal** | Models that handle text, image, and video inputs |

### Model Information

Each model card shows:
- **Model name** — Official name and version
- **Provider** — Company that created the model (OpenAI, Anthropic, Google, etc.)
- **Category** — Primary use case
- **Availability** — Whether the model is available in your workspace

### Filtering and Search

Use the search bar to find specific models by name or provider. Category filters let you narrow results by model type.

::: tip Model Selection in Agents and Workflows
The models shown here are available when creating Agents or configuring Workflow steps. Your workspace plan determines which models you can access. Enterprise plans typically have access to the full model library.
:::

---

## Workspace Members

![Workspace Members](/screenshots/settings/03-members.png)

Manage your team members, invite new users, and control access permissions.

**Access:** Workspace dropdown menu → **Manage Users**

### Member Table

The members table shows all users in your workspace:

| Column | Description |
|--------|-------------|
| **Name** | Member's full name and email address |
| **Role** | Administrator, Manager, or Owner |
| **Status** | Active, Pending (invitation sent), or Inactive |
| **Last Active** | When the member last used the workspace |
| **Actions** | Change role or remove member |

### User Roles

| Role | Permissions |
|------|-------------|
| **Owner** | Full access — can manage billing, delete workspace, transfer ownership |
| **Administrator** | Can invite/remove users, manage workspace settings, access all features |
| **Manager** | Can create and manage content (agents, campaigns, workflows), but cannot manage billing or workspace-level settings |

::: warning Owner vs Administrator
**Owners** have financial responsibility and can delete the workspace. **Administrators** have full feature access but cannot modify billing or delete the workspace. Use Administrator role for most team leads.
:::

### Inviting New Members

1. Click **+ Invite Users** or **Add Users** (button label may vary by plan)
2. Enter one or more email addresses
3. Select the role for each invitee
4. Click **Send Invitations**

Invited users receive an email with a link to join. They appear as "Pending" in the members table until they accept.

### Changing Member Roles

1. Click the three-dot menu (⋯) next to a member's name
2. Select **Change Role**
3. Choose the new role from the dropdown
4. Confirm

### Removing Members

1. Click the three-dot menu (⋯) next to a member's name
2. Select **Remove from Workspace**
3. Confirm removal

**What happens when you remove a member:**
- They lose access to the workspace immediately
- Content they created (agents, campaigns, workflows) remains in the workspace
- If they were the only owner, you'll be prompted to transfer ownership first

::: tip Trial and Pending Plans
If your workspace is on a Trial or Pending plan, the **Add Users** button may be replaced with an **Upgrade** banner. You'll need to upgrade to a paid plan to invite additional team members.
:::

### Member Management Best Practices

| Practice | Why It Matters |
|----------|----------------|
| **Assign the minimum role needed** | Prevents accidental changes to billing or workspace deletion |
| **Review members quarterly** | Remove inactive users to keep your team list current |
| **Use Administrator role for team leads** | Gives them full feature access without financial risk |
| **Transfer ownership before departing** | Ensures continuity when the workspace owner leaves |

::: warning Cannot Edit Your Own Account
You cannot change your own role or remove yourself from the workspace. Ask another Administrator or Owner to make changes to your account. To leave a workspace, contact your workspace owner to remove you.
:::

---

## API Management

::: info Enterprise Only
API Management is available for enterprise workspaces. The feature may be disabled in some builds.
:::

![API Management](/screenshots/settings/04-api-management.png?optional=1)

The API Management page lets you create and manage API keys for programmatic access to the Vurvey platform via Apigee.

### Creating API Keys

1. Click **Create API Key**
2. Enter a name for the app/integration
3. Provide your email address
4. Click **Create**
5. Copy the generated API key and store it securely

::: warning Store Keys Securely
API keys are shown only once at creation. Store them in a secure password manager or secrets vault. If you lose a key, you'll need to revoke it and create a new one.
:::

### Managing Existing Keys

The API Management page shows all your API apps in a table:

| Column | Description |
|--------|-------------|
| **App Name** | Name you gave the app |
| **API Key** | The key (partially obscured for security) |
| **Created** | When the key was created |
| **Status** | Active or Revoked |
| **Actions** | Revoke or delete |

### Revoking API Keys

If a key is compromised or no longer needed:

1. Click **Revoke** next to the key
2. Confirm revocation

Revoked keys can no longer authenticate API requests. Services using the revoked key will receive authentication errors.

::: tip Programmatic Workspace Creation
API keys enable programmatic workspace creation and management via REST endpoints. This is useful for integrations with tools like Zapier or custom automation scripts. See the Vurvey API documentation for endpoint details.
:::

---

## Best Practices

### Workspace Configuration

| Setting | Recommended Approach |
|---------|---------------------|
| **Session timeout** | Enable for workspaces with sensitive data; 30 minutes is a good balance |
| **Workspace name** | Use descriptive names that include the team, project, or region |
| **Workspace avatar** | Choose a recognizable image (team logo, project icon) for easy identification |
| **Plan upgrades** | Review feature needs quarterly and upgrade if you're hitting limits |

### Team Management

| Practice | Details |
|----------|---------|
| **Onboard with Manager role** | Start new team members as Managers; promote to Administrator only when needed |
| **Document role changes** | Keep a log of who has Administrator access and why |
| **Regular access reviews** | Quarterly review of who has access and what role they need |
| **Offboarding checklist** | Remove departing team members immediately; transfer ownership of their content if needed |

---

## Troubleshooting

### Cannot Invite New Users

**Symptoms:** "Add Users" button is disabled or shows "Upgrade" instead.

**Solution:** Check your workspace plan. Trial and Pending plans may have user limits. Upgrade to a paid plan to invite additional team members.

---

### Session Timeout Not Working

**Symptoms:** Users are not being logged out after the configured timeout period.

**Solution:** Verify that session timeout is enabled in General settings. Check that the timeout duration is set to a reasonable value (e.g., 30 minutes). If issues persist, try toggling the feature off and back on.

---

### Cannot Change Own Role or Remove Yourself

**Symptoms:** Options to edit your own account are disabled.

**Explanation:** This is expected behavior. Users cannot modify their own permissions or remove themselves from the workspace. Ask another Administrator or Owner to make changes to your account.

---

### Tremendous Rewards Not Appearing in Campaigns

**Symptoms:** The Tremendous reward option is missing when launching campaigns.

**Solution:**
1. Verify Tremendous is configured in General Settings
2. Confirm your Tremendous API key is valid
3. Check that you've selected a default funding source
4. Ensure the currency is set

If configuration looks correct but the issue persists, check your Tremendous account status and API key permissions.

---

### API Key Creation Fails

**Symptoms:** Error when trying to create a new API key.

**Solution:** Verify that API Management is enabled for your workspace (enterprise feature). Check that you have Administrator or Owner permissions. If the issue persists, contact support — there may be a limit on the number of API keys your workspace can create.

---

## Frequently Asked Questions

::: details Can I have multiple workspaces?
Yes. Click your workspace name in the top-right corner to see all workspaces you're a member of. You can switch between them instantly. If you have 7 or fewer workspaces, they appear in a dropdown. With 8+, you'll see a modal with a search feature.
:::

::: details What happens if I delete my workspace?
Deleting a workspace permanently removes all data — agents, campaigns, workflows, datasets, responses, and team member access. This action cannot be undone. Only Owners can delete workspaces. Consider archiving instead by closing all active campaigns and removing team members.
:::

::: details Can I change the workspace owner?
Yes. Only the current Owner can transfer ownership. Go to Members, find the member you want to promote, and select "Transfer Ownership." The new owner must accept the transfer. You'll become an Administrator after the transfer completes.
:::

::: details How do I upgrade my plan?
Click **Current Plan** in General Settings to view plan details. Click through to the billing portal to see upgrade options. Choose the plan that fits your team size and feature needs, then complete the upgrade flow. Changes are effective immediately.
:::

::: details What if I forget to configure session timeout before sharing sensitive research?
You can enable session timeout at any time. Once enabled, all active sessions will respect the new timeout duration. Users who are currently logged in will be logged out after the configured period of inactivity.
:::

::: details Can I reuse revoked API keys?
No. Once an API key is revoked, it cannot be reactivated. Create a new API key if you need access again. This ensures that potentially compromised keys cannot be re-enabled accidentally.
:::

---

## Related Pages

- [Rewards](/guide/rewards) — Detailed Tremendous configuration and participant incentive management
- [Permissions & Sharing](/guide/permissions-and-sharing) — Control access to specific agents, campaigns, and datasets

---

## Next Steps

- [Invite your team members](#workspace-members) to start collaborating
- [Configure Tremendous rewards](#tremendous-rewards-configuration) if you'll be running incentivized campaigns
- [Browse available AI models](#ai-models) to understand which models power your agents and workflows
- [Set up session timeout](#session-timeout) to improve workspace security
