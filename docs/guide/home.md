# Home (Chat Interface)

The Home page is your primary workspace for interacting with Vurvey's AI capabilities through a conversational interface. This is the default landing page after logging in.

## Overview

![Chat Interface](/screenshots/home/01-chat-main.png)

The chat interface provides a unified way to query AI agents, attach data sources, and control how the AI reasons about your research questions.

## Chat Canvas

The central area of the Home page is the Chat Canvas - a flexible workspace where conversations with AI agents take place.

### Chat Input

At the bottom of the canvas, you'll find the chat input area with the prompt **"Ask anything..."**

Features:
- Natural language queries - ask questions in plain English
- Multi-line input support (`Shift + Enter` for new lines)
- File attachments via the attachment button or drag-and-drop
- Voice input option for spoken queries

### Message Display

Conversations display as a flowing chat with:
- Your messages (user bubbles) on one side
- AI agent responses with streaming text
- Rich content including formatted text, code blocks, and data visualizations
- Source citations when the AI references your datasets

## Agent Selection

### Agent Picker

Click the **Agent** dropdown to choose which AI persona will respond to your queries.

Each agent is configured with different:
- **Specializations** - areas of expertise (e.g., consumer insights, data analysis)
- **Personality traits** - communication style and tone
- **Knowledge bases** - connected datasets and training data
- **Instructions** - behavioral guidelines and response formatting

### Switching Agents

You can switch agents mid-conversation to get different perspectives on the same topic. The new agent will have access to the conversation history.

## Mode Controls

Three mode toggles control how the AI processes your request:

| Mode | Description |
|------|-------------|
| **Chat** | General reasoning and conversation using the AI's base knowledge |
| **My Data** | References your connected datasets and uploaded files |
| **Web** | Searches and reasons over live web content |

::: tip Choosing the Right Mode
- Use **Chat** for general questions, brainstorming, and creative tasks
- Use **My Data** when you want insights from your uploaded research data
- Use **Web** for current events, competitive research, or external information
:::

You can combine modes - for example, use both **My Data** and **Web** to compare your research findings with external sources.

## Sources Panel

Click **Sources** to control which datasets or documents are available to the agent during the conversation.

### Source Selection
- Select specific datasets from your library
- Filter sources by type (documents, spreadsheets, videos)
- Search across available sources
- View source metadata (file count, last updated)

### Source Context
When sources are selected, the AI will:
- Reference relevant content from those files
- Cite specific documents in responses
- Limit answers to information contained in selected sources (when appropriate)

## Tools Panel

Click **Tools** to enable specialized capabilities:

### Available Tools
- **Data Analysis** - Statistical analysis and visualization
- **Export** - Generate reports, summaries, and data exports
- **Calculations** - Mathematical and quantitative operations
- **Search** - Deep search across your datasets
- **Generate** - Create content, summaries, or structured outputs

Tools are automatically invoked by the AI when relevant to your query.

## Conversation Sidebar

![Conversation Sidebar](/screenshots/home/04-conversation-sidebar.png)

The left panel manages your conversation history.

### Conversations List
- Listed by title (auto-generated or custom)
- Sorted by most recent activity
- Click any conversation to continue where you left off
- Conversations are automatically saved

### Creating New Chats
- Click **+** next to "Conversations" header
- Starts a fresh conversation with your selected agent
- Previous conversation context is not carried over

### Managing Conversations
- **Rename** - Click the title to edit
- **Delete** - Remove conversations you no longer need
- **Search** - Find past conversations by content
- **Filter** - Filter by date range or agent used

### View All
Click "View all" to access the complete conversation history with advanced filtering and search options.

## User Profile

Located at the bottom left of the sidebar:

- **Your name and email** - Account identifier
- **Workspace indicator** - Current workspace name (e.g., "Batterii")
- **Refresh** - Sync latest data
- **Settings** - Access account and workspace settings
- **Logout** - Sign out of Vurvey

## Workspace Selector

If you have access to multiple workspaces, click the workspace name at the top of the sidebar to switch between them.

## Tips for Effective Chat

### Query Formulation
1. **Be specific** - Provide context about what you're looking for
2. **Include constraints** - Mention relevant criteria or limitations
3. **Ask follow-ups** - Refine results with iterative questions

### Mode Selection
- Start with **Chat** mode for exploratory questions
- Switch to **My Data** when you need insights from specific files
- Add **Web** mode for external context

### Agent Selection
- Use specialized agents for domain-specific questions
- Try different agents to get varied perspectives
- Check agent descriptions to understand their focus

### Source Management
- Select relevant sources before asking data-related questions
- Keep source selection focused to get more targeted answers
- Use source search to quickly find specific documents

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Send message | `Enter` |
| New line | `Shift + Enter` |
| New conversation | Click `+` button |
| Focus chat input | Click input area |

## Next Steps

- [Create custom agents](/guide/agents) for specialized research tasks
- [Upload datasets](/guide/datasets) to give agents knowledge
- [Launch a campaign](/guide/campaigns) to collect primary research data
- [Build automated workflows](/guide/workflows) for recurring analysis
