# Integrations

Connect Vurvey with your favorite tools and services to enhance your workflows. Vurvey uses Composio to provide seamless integrations with 100+ popular platforms.

![Integrations page](/vurvey-docs/screenshots/integrations/01-integrations-main.png)

## Overview

Integrations allow you to:
- Connect external tools to your Vurvey workspace
- Access data from connected services in Chat and Workflows
- Automate tasks across multiple platforms
- Sync data between Vurvey and other apps

## Tool Categories

Integrations are organized into 15 categories:

| Category | Examples |
|----------|----------|
| **Collaboration & Communication** | Slack, Microsoft Teams, Discord, Zoom |
| **Productivity & Project Management** | Jira, Monday.com, Asana, Trello |
| **Document & File Management** | Google Drive, Dropbox, OneDrive, Box |
| **CRM** | Salesforce, HubSpot, Pipedrive |
| **Sales & Customer Support** | Zendesk, Intercom, Freshdesk |
| **HR & Recruiting** | LinkedIn, Workday, BambooHR |
| **Finance & Accounting** | QuickBooks, Stripe, Xero |
| **Developer Tools & DevOps** | GitHub, GitLab, AWS, Azure |
| **Marketing & Social Media** | Mailchimp, LinkedIn, Twitter, Instagram |
| **Analytics & Data** | Mixpanel, Amplitude, Google Analytics |
| **AI & Machine Learning** | OpenAI, Anthropic, Cohere |
| **Design & Creative Tools** | Figma, Adobe Creative Cloud, Canva |
| **E-commerce** | Shopify, WooCommerce, Magento |
| **Education & LMS** | Canvas, Blackboard, Moodle |
| **Other / Miscellaneous** | Zapier, IFTTT, custom tools |

## Authentication Methods

Vurvey supports three authentication methods:

| Method | Description | Best For |
|--------|-------------|----------|
| **OAuth2** | Secure redirect-based authentication | Most third-party services |
| **API Key** | Direct API key authentication | Services with static keys |
| **Bearer Token** | Token-based authentication | Custom APIs and services |

## Connecting an Integration

### Step 1: Browse Available Tools

1. Click **Settings** in the top-right menu
2. Select **Integrations** from the sidebar
3. Browse categories or search for a specific tool
4. Click a **category header** to expand and see available tools

### Step 2: Choose Authentication Method

1. Click **Connect** on the desired tool
2. Select authentication method (OAuth2, API Key, or Bearer Token)
3. Click **Confirm** to proceed

### Step 3: Authenticate

**For OAuth2:**
1. You'll be redirected to the service's login page
2. Sign in with your account credentials
3. Grant Vurvey permission to access your data
4. You'll be automatically redirected back to Vurvey
5. A success notification confirms the connection

**For API Key or Bearer Token:**
1. Enter your API key or token in the provided field
2. Click **Connect**
3. Vurvey validates the credentials
4. Connection status updates to **ACTIVE**

### Step 4: Verify Connection

- Connected tools show a **green status indicator**
- Status options: **ACTIVE**, **ERROR**, **REVOKED**, **PENDING**
- Click on a connected tool to view connection details

## Connection Lifecycle

### Connection Statuses

| Status | Meaning | Action |
|--------|---------|--------|
| **ACTIVE** | Connection working properly | Ready to use |
| **ERROR** | Authentication failed or expired | Reconnect required |
| **REVOKED** | Access manually removed | Reconnect to restore |
| **PENDING** | Connection in progress | Wait for completion |

### Managing Connections

**To disconnect a tool:**
1. Click on the connected tool
2. Click **Disconnect**
3. Confirm the action in the modal
4. Tool status changes to disconnected

**To reconnect:**
1. Click **Connect** on the disconnected tool
2. Re-authenticate using the same steps as initial connection
3. Previous configurations are typically preserved

## Using Integrations in Vurvey

### In Chat/Home

Connected integrations become available as **Tools** in your chat toolbar:

1. Start a new conversation
2. Click the **Tools** button in the chat toolbar
3. Select connected services from the dropdown
4. AI can now access data from these services
5. Ask questions that reference integrated data

**Example prompts:**
- "Show me my recent Slack messages"
- "What are my open Jira tickets?"
- "Summarize today's Google Calendar events"

### In Workflows

Use integrations to automate multi-step processes:

1. Create a new Workflow
2. Add an Agent task node
3. Configure the node to use integrated tools
4. Agent can read from and write to connected services
5. Chain multiple integrations together

**Example workflow:**
1. Fetch data from Salesforce CRM
2. Analyze with Vurvey AI
3. Post summary to Slack channel
4. Update Google Sheet with results

### In Agents

Agents can be configured to use specific integrations:

1. Create or edit an Agent
2. In the **Instructions** step, specify which tools to use
3. Agent will automatically access integrated data when relevant
4. Mention integration-specific context in agent objectives

## Common Workflows

### Slack Integration

**Connect Slack:**
1. Navigate to Integrations
2. Find Slack in **Collaboration & Communication**
3. Click **Connect** → **OAuth2**
4. Authorize Vurvey in your Slack workspace
5. Grant channel access permissions

**Use in Chat:**
- "Summarize messages in #marketing channel today"
- "Search Slack for mentions of 'product launch'"
- "What are the latest threads in #customer-feedback?"

### Google Drive Integration

**Connect Google Drive:**
1. Find Google Drive in **Document & File Management**
2. Click **Connect** → **OAuth2**
3. Sign in with your Google account
4. Grant Vurvey read access to Drive

**Use as a Source:**
- Attach Google Drive as a source in Chat
- AI can search across your Drive documents
- Reference specific files or folders in queries

### GitHub Integration

**Connect GitHub:**
1. Find GitHub in **Developer Tools & DevOps**
2. Click **Connect** → **OAuth2**
3. Authorize Vurvey to access repositories
4. Select which repos to grant access

**Use in Workflows:**
- Automatically analyze pull request comments
- Generate weekly engineering summaries
- Track issue trends and sentiment

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Authentication failed" | Check credentials and try reconnecting |
| Connection shows ERROR status | Token may have expired; disconnect and reconnect |
| Tool not appearing in Chat toolbar | Verify connection is ACTIVE; may need workspace permission |
| OAuth redirect fails | Check browser popup blockers; ensure cookies enabled |
| Can't find a specific tool | Search by name; tool may be in "Other" category |
| Disconnect button grayed out | Only workspace administrators can disconnect in some cases |

## Security & Privacy

### Data Access

- **Read-only by default**: Most integrations only read data
- **Explicit permissions**: You control which services Vurvey can access
- **Revocable anytime**: Disconnect integrations at any time
- **Scoped access**: Permissions limited to what you explicitly grant

### Authentication Security

- **OAuth2 standard**: Industry-standard secure authentication
- **No password storage**: Vurvey never stores your service passwords
- **Token encryption**: API keys and tokens are encrypted at rest
- **Audit trail**: Connection activity is logged

### Best Practices

- **Minimum permissions**: Only connect tools you actively use
- **Regular review**: Audit connected integrations quarterly
- **Immediate disconnect**: Remove integrations when no longer needed
- **Team coordination**: Coordinate with workspace admin for shared tools

## FAQ

**Q: How many integrations can I connect?**
A: There's no hard limit, but we recommend connecting only the tools you actively use for optimal performance.

**Q: Can I use the same integration in multiple workspaces?**
A: Yes, but you'll need to connect it separately in each workspace.

**Q: What happens if I disconnect an integration used in a Workflow?**
A: The Workflow will fail when it tries to access that integration. Reconnect the tool or update the Workflow to remove the dependency.

**Q: Can I create custom integrations?**
A: For custom or enterprise integrations, contact your Vurvey account manager.

**Q: Do integrations cost extra?**
A: Integration availability depends on your workspace plan. Some advanced integrations may require higher-tier plans.

**Q: How often does Vurvey sync data from integrations?**
A: Data is accessed in real-time when you make requests. There's no background syncing unless configured in a scheduled Workflow.

**Q: What if my tool isn't listed?**
A: Request new integrations by contacting support. We're constantly adding new tools.

**Q: Can other workspace members use integrations I've connected?**
A: It depends on the integration type. Some are user-specific (personal accounts), others are workspace-wide. Check the tool's connection settings.

## Related Features

- [Home (Chat)](/guide/home) - Use integrations in conversations
- [Workflows](/guide/workflows) - Automate with integrations
- [Agents](/guide/agents) - Configure agents to use specific tools
- [Settings](/guide/settings) - Manage workspace configuration
