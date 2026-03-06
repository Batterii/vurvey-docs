# Integrations

The Integrations page is the workspace connection manager for third-party services. In the current UI, the page header is **Third-Party Integrations** and it is backed by Composio-supported tools and user connections.

![Integrations page](/screenshots/integrations/01-integrations-main.png)

## What the Page Does

The page combines two data sets:

- the list of **supported tools**
- the current user's **connections**

From there, you can:

- browse supported services by category
- start a new connection flow
- see connection status
- disconnect an existing connection

## Categories

The page currently groups tools into an ordered set of categories, with a catch-all bucket for anything unmatched.

Primary category order:

1. Collaboration & Communication
2. Productivity & Project Management
3. Document & File Management
4. CRM
5. Sales & Customer Support
6. HR & Recruiting
7. Finance & Accounting
8. Developer Tools & DevOps
9. Marketing & Social Media
10. Analytics & Data
11. AI & Machine Learning
12. Design & Creative Tools
13. E-commerce
14. Education & LMS
15. Other / Miscellaneous

If a tool does not fit those buckets cleanly, the UI can place it under **Other Integrations**.

## Authentication Methods

The current connection flow supports three auth schemes:

| Method | Supported |
|---|---|
| **OAuth2** | Yes |
| **API Key** | Yes |
| **Bearer Token** | Yes |

## Connection Flow

When you click **Connect**, the page first opens a small authentication-method chooser.

Current options are:

- **OAuth (Login)**
- **API Key**
- **Bearer Token**
- **Cancel**

After you choose one of the supported auth methods, the page requests a provider-specific connect URL and redirects you into that flow.

Depending on the tool, that may mean:

- an OAuth redirect
- an API key flow
- a bearer-token flow

## Connection Status

The code expects these status values on user connections:

- `ACTIVE`
- `ERROR`
- `REVOKED`
- `PENDING`

On connected cards, the UI also shows:

- `✓ Connected`
- `via OAuth`, `via API Key`, or `via Bearer Token` when that auth scheme is known
- a direct **Disconnect** button on the card

## Disconnecting

Disconnecting a service:

1. prompts for confirmation
2. warns that AI assistants will no longer be able to access that service on your behalf
3. deletes the stored connection
4. refreshes the connection list

## Important Current-State Note

This page manages connections. It should not be documented as if every connected integration automatically appears as a fixed option in the Home chat toolbar.

The Home toolbar currently exposes a fixed research-tool set. Composio-backed integrations are a separate connection layer that can be used by product surfaces that support those tool connections, especially workflow- and agent-driven integrations.

## Practical Guidance

- Connect only the services your workspace actually needs
- Reconnect tools showing `ERROR` or `REVOKED`
- Expect category grouping to evolve as supported tools change
- Use this page as the source of truth for what is connected right now
