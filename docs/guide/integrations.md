# Integrations

The Integrations module lets you connect third-party tools and services to Vurvey, enabling agents and workflows to access external data sources and take actions across your tech stack.

![Integrations Main](/screenshots/integrations/01-integrations-main.png)

## Overview

Integrations are powered by **Composio**, a unified integration framework that provides:
- Pre-built connectors for 100+ popular tools
- Secure OAuth2 and API key authentication
- Standardized actions across different platforms
- Real-time connection status monitoring

Access Integrations from **Settings → Integrations** or directly at `/:workspaceId/settings/integrations`.

::: info What is Composio?
Composio is an integration platform that provides standardized APIs for connecting to third-party services. Instead of building and maintaining individual integrations, Vurvey uses Composio to offer a wide range of pre-built connectors with consistent authentication and action interfaces.
:::

## Integration Categories

Integrations are organized into 15 categories:

| Category | Example Tools | Common Use Cases |
|----------|---------------|------------------|
| **CRM** | Salesforce, HubSpot, Pipedrive | Sync customer data, update contact records |
| **Project Management** | Asana, Trello, Monday, Jira | Create tasks from insights, update project status |
| **Communication** | Slack, Microsoft Teams, Discord | Send notifications, post updates |
| **Email** | Gmail, Outlook, SendGrid | Send automated emails, read inbox |
| **Calendar** | Google Calendar, Outlook Calendar | Schedule meetings, create events |
| **File Storage** | Google Drive, Dropbox, OneDrive | Upload/download files, sync data |
| **Social Media** | Twitter/X, LinkedIn, Facebook | Post content, monitor mentions |
| **Analytics** | Google Analytics, Mixpanel | Pull metrics, track events |
| **Marketing** | Mailchimp, HubSpot, Marketo | Manage campaigns, update lists |
| **E-commerce** | Shopify, WooCommerce, Stripe | Access order data, update inventory |
| **Support** | Zendesk, Intercom, Help Scout | Create tickets, respond to customers |
| **HR & Recruiting** | BambooHR, Greenhouse, Lever | Access employee data, manage candidates |
| **Development** | GitHub, GitLab, Jira | Create issues, manage repositories |
| **Finance** | QuickBooks, Xero, Stripe | Access financial data, create invoices |
| **Other** | Custom APIs, webhooks | Connect proprietary or specialized tools |

## Browsing Available Tools

The Integrations page displays all available connectors in a searchable, filterable grid.

### Tool Cards

Each integration card shows:
- **Tool logo and name**
- **Category** — which category it belongs to
- **Connection status** — whether you're currently connected
- **Available actions** — how many different operations the tool supports
- **Connect button** — to initiate authentication

### Filters

- **Category filter** — View only tools in a specific category
- **Connection status** — Show only connected tools or available tools
- **Search** — Find tools by name

## Connecting a Tool

### Authentication Methods

Integrations use one of three authentication approaches:

| Method | Description | User Experience |
|--------|-------------|-----------------|
| **OAuth2** | Secure third-party login | Redirects you to the tool's login page, then back to Vurvey |
| **API Key** | Direct API token entry | You copy an API key from the tool and paste it into Vurvey |
| **Bearer Token** | Token-based auth | You generate a token from the tool and enter it |

Most modern tools use OAuth2 for the smoothest experience.

### Connection Process (OAuth2)

1. Click **Connect** on the desired tool card
2. You're redirected to the tool's authorization page
3. Log in to the tool (if not already logged in)
4. Review the permissions Vurvey is requesting
5. Click **Authorize** or **Allow**
6. You're redirected back to Vurvey
7. The connection status updates to **Active**

### Connection Process (API Key/Bearer Token)

1. Click **Connect** on the desired tool card
2. A modal appears asking for your API key or token
3. Open the third-party tool in a new tab
4. Navigate to their API settings or developer section
5. Generate or copy your API key
6. Paste the key into the Vurvey modal
7. Click **Save**
8. The connection status updates to **Active** (or **Error** if the key was invalid)

### Callback URL

After OAuth2 authentication, tools redirect back to Vurvey at:
```
/:workspaceId/integrations/callback/composio
```

This route handles the OAuth callback and finalizes the connection.

## Managing Connections

### Connection States

| State | What It Means | Actions Available |
|-------|---------------|-------------------|
| **ACTIVE** | Successfully connected and working | Disconnect, test connection |
| **ERROR** | Connection failed or expired | Reconnect, disconnect |
| **REVOKED** | You or the tool revoked access | Reconnect |
| **PENDING** | Authorization in progress | Wait for completion |

### Reconnecting

If a connection shows **ERROR** or **REVOKED**:

1. Click **Reconnect** on the tool card
2. Follow the same authentication flow as initial connection
3. The connection refreshes and updates to **ACTIVE**

Common reasons for connection errors:
- API key expired or was regenerated
- OAuth token expired (most tools auto-refresh, but some require manual reauth)
- Permissions were changed in the third-party tool
- The tool's API was temporarily unavailable

### Disconnecting

To remove an integration:

1. Locate the connected tool
2. Click the **three-dot menu** or **Disconnect** button
3. Confirm the action
4. The connection is removed immediately

::: warning Disconnecting Active Integrations
If agents or workflows are using this connection, they will fail when trying to access the tool. Make sure to update any dependencies before disconnecting.
:::

## Using Integrations in Agents

Once connected, agents can use integration tools to perform actions.

### Enabling Tools for Agents

When creating or editing an agent:

1. Navigate to **Step 3: Optional Settings**
2. Scroll to the **Tools** section
3. Enable **Smart Tools** (if you want the agent to auto-select tools)
4. Or select **Manual Tools** and choose specific integrations

### Example Agent with Integrations

**"Slack Notifier" Agent:**
- **Mission:** "Monitor campaign responses and post summaries to the #research-updates Slack channel whenever new data arrives."
- **Tools enabled:** Slack integration
- **Datasets:** Connected to active campaigns
- **Rules:**
  - "Post to Slack only when response count increases by 10 or more"
  - "Include response count, top themes, and a link to the campaign"
  - "Format messages with Slack markdown for readability"

## Using Integrations in Workflows

Workflows can trigger integration actions as part of multi-step automations.

### Example Workflow with Integrations

**"Weekly Report to Leadership" Workflow:**

1. **Agent 1:** Analyze campaign responses from the past week
2. **Agent 2:** Create an executive summary
3. **Agent 3:** Post summary to the #leadership Slack channel
4. **Agent 4:** Create a Google Doc with the full report
5. **Agent 5:** Send a summary email via Gmail

Tools used: Slack, Google Drive, Gmail

## Supported Actions

Each integration provides a set of actions agents can perform. Common action types:

| Action Category | Examples |
|-----------------|----------|
| **Read** | Get data, list items, search records |
| **Write** | Create records, update fields, delete items |
| **Send** | Post messages, send emails, publish content |
| **Monitor** | Watch for changes, trigger on events |
| **Search** | Query databases, find records |

### Viewing Available Actions

On each tool card, click **View Actions** to see all supported operations. Each action includes:
- Action name (e.g., "Create Task," "Send Message," "Upload File")
- Required parameters (e.g., task title, message text, file path)
- Optional parameters (e.g., assignee, priority, tags)

## Security & Permissions

### What Vurvey Can Access

When you connect an integration, you grant Vurvey permission to:
- Read and write data as specified by the tool's permission scopes
- Perform actions on your behalf within the tool
- Access the tool using your authenticated credentials

**Review permissions carefully** during the OAuth flow. Only connect tools you trust and that your agents legitimately need.

### Revoking Access

To revoke Vurvey's access to a connected tool:

**Option 1: Disconnect in Vurvey**
1. Go to Integrations
2. Click **Disconnect** on the tool
3. The connection is removed and Vurvey can no longer access the tool

**Option 2: Revoke in the Third-Party Tool**
1. Log in to the third-party tool
2. Navigate to security or connected apps settings
3. Find Vurvey (or Composio) in the list
4. Click **Revoke Access**
5. Return to Vurvey and reconnect if needed

### API Key Security

- **Never share API keys** — Treat them like passwords
- **Use workspace-specific keys** when possible — Don't use personal API keys for shared workspaces
- **Rotate keys periodically** — Regenerate keys quarterly or when team members leave
- **Monitor usage** — Check third-party tool logs for unexpected API activity

## Troubleshooting

**Connection fails during OAuth flow?**
- Make sure pop-ups are allowed in your browser
- Try disconnecting and reconnecting
- Check that your third-party tool account is active and has the necessary permissions
- Clear browser cookies and try again

**API key shows "Error" status?**
- Verify the API key is correct (copy/paste carefully)
- Check that the key hasn't expired or been revoked in the tool
- Ensure the key has the required permissions (read, write, etc.)
- Regenerate the key in the third-party tool and update in Vurvey

**Agent can't access connected tool?**
- Verify the tool is connected (shows **ACTIVE** status)
- Make sure the agent has the tool enabled in its configuration
- Check that the specific action the agent is trying to perform is supported
- Review the agent's prompt to ensure it's calling the tool correctly

**Callback redirect doesn't complete?**
- This can happen if the OAuth state expires. Try reconnecting from the beginning.
- Ensure your network connection is stable during the OAuth flow
- If behind a corporate firewall, check that the callback URL is not blocked

**Integration worked before but now fails?**
- The connection may have expired. Try reconnecting.
- The third-party tool may have changed its API. Check for service updates.
- Your permissions in the third-party tool may have changed. Re-authorize to refresh permissions.

**Can't find a specific tool?**
- Use the search bar to search by tool name
- Check all categories — tools may be categorized differently than you expect
- If the tool isn't available, it may not have a Composio connector yet. Contact support to request it.

## Frequently Asked Questions

::: details Click to expand

**Q: How many tools can I connect?**
A: There's no hard limit on the number of integrations you can connect. Connect as many as your agents and workflows need.

**Q: Are integrations shared across the workspace?**
A: Yes. Once you connect a tool, all workspace members with appropriate permissions can use it in their agents and workflows.

**Q: Can I connect multiple accounts for the same tool?**
A: Typically, you can only connect one account per tool per workspace. If you need multiple accounts (e.g., personal and company Slack), consider using multiple workspaces.

**Q: What happens if I disconnect a tool that's in use?**
A: Agents and workflows using that tool will fail when they try to access it. You'll see errors in execution logs. Reconnect the tool to resume normal operation.

**Q: Can I see which agents are using which integrations?**
A: Currently, you need to review each agent's configuration individually. Future updates may include dependency tracking.

**Q: Does Vurvey store my third-party credentials?**
A: OAuth2 tokens are stored securely and encrypted. API keys are also encrypted at rest. Vurvey follows industry-standard security practices for credential storage.

**Q: What if I need an integration that's not available?**
A: Contact Vurvey support to request new integrations. Composio regularly adds new connectors.

**Q: Can I use integrations in scheduled workflows?**
A: Yes. Scheduled workflows can trigger integration actions just like manually-run workflows.

**Q: Do integrations have rate limits?**
A: Yes — each third-party tool has its own API rate limits. If agents hit rate limits, they'll receive errors and may need to retry. Check the tool's API documentation for specific limits.

**Q: Can I test an integration before using it in an agent?**
A: Some tools offer a "Test Connection" button. Otherwise, create a test agent or workflow to verify the integration works as expected before deploying to production.
:::

## Next Steps

- [Create agents that use integrations](/guide/agents)
- [Build workflows with integrated actions](/guide/workflows)
- [Configure workspace settings](/guide/settings)
- [Manage permissions and sharing](/guide/permissions-and-sharing)
