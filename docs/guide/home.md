# Home (Chat Interface)

The Home page is your primary workspace for interacting with Vurvey's AI capabilities through a conversational interface. This is the default landing page after logging in.

## Overview

![Chat Interface](/screenshots/home/01-chat-main.png)

The chat interface provides a unified way to query AI agents, attach data sources, and control how the AI reasons about your research questions.

## Page Layout

When you first arrive at Home, you'll see a welcome message: "Hi [Your Name]! What might we create today?" This is the **HOME layout**. Once you start a conversation, the page transitions to the **CHAT layout** showing your conversation history.

## Chat Input Area

At the bottom of the screen, you'll find the chat input area where you compose messages.

### Text Input

- Type your question or prompt in the text area
- Use `@` to mention specific agents in your message
- Use `/` to access tool groups and specialized capabilities
- Paste images directly into the input for visual analysis

### Input Controls

| Control | Location | Purpose |
|---------|----------|---------|
| **Upload** | Left of input | Attach documents or images |
| **Sources** | Above input | View selected data sources |
| **Tool Badge** | Above input | Shows active tool group |
| **Send** | Right of input | Submit your message |

### File Attachments

Click the upload button to attach files to your message:
- **Documents**: PDF, DOCX, TXT, MD, CSV, JSON, PPTX, XLSX
- **Images**: PNG, JPG, GIF (for visual analysis)
- **Videos**: MP4, MOV (for video analysis)
- **Audio**: MP3, WAV (if enabled)

Files are uploaded and processed before your message is sent.

## Agent Selection

### Choosing an Agent

Click the agent selector at the top of the input area to choose which AI persona responds to your queries. Each agent is configured with:

- **Personality** - Communication style and tone
- **Expertise** - Domain knowledge and specializations
- **Instructions** - Behavioral guidelines
- **Knowledge** - Connected datasets

### Agent Mentions

Type `@` followed by an agent's name to mention them in your message. This allows you to invoke specific agents mid-conversation without switching your primary agent.

## Chat Modes

Three mode toggles control how the AI processes your request:

| Mode | Icon | Description |
|------|------|-------------|
| **Chat** | Default | General reasoning using the AI's base knowledge |
| **My Data** | Data icon | References your connected datasets and uploaded files |
| **Web** | Globe icon | Searches and reasons over live web content |

::: tip Combining Modes
Modes can be combined for comprehensive analysis. For example, enable both **My Data** and **Web** to compare your research findings with external sources.
:::

### Mode Behavior

- **Chat mode only**: Agent uses its trained knowledge and conversation context
- **My Data mode**: Agent searches and cites your selected datasets
- **Web mode**: Agent searches the internet for current information
- **Combined modes**: Agent synthesizes information from multiple sources

## Sources Panel

When in My Data mode, the Sources section shows which data is available to the agent.

### Source Types

| Source Type | Icon | Description |
|-------------|------|-------------|
| **Campaigns** | Megaphone | Survey responses and data |
| **Questions** | Question mark | Individual survey questions |
| **Training Sets** | Folder | Datasets you've uploaded |
| **Files** | Document | Individual documents |
| **Videos** | Video | Video content |
| **Audio** | Equalizer | Audio files |

### Managing Sources

- Click the sources chip to view currently selected sources
- Use the source selection modal to add or remove sources
- Select "All campaigns" or "All datasets" for comprehensive analysis
- Remove individual sources by clicking the X on their chip

## Tool Groups

Use `/` in the chat input to access specialized tool groups. These provide enhanced capabilities beyond standard chat.

### Available Tool Groups

Tool groups vary by workspace configuration but commonly include:
- **Web Search** - Search the internet for information
- **Image Generation** - Create images from descriptions
- **Data Analysis** - Statistical analysis and visualization
- **Content Creation** - Generate structured content

### Tool Pausing

In certain modes, some tools are automatically paused:
- **Chat mode**: All tools paused by default
- **My Data mode**: Web-based tools paused
- A "PAUSED" badge appears on tool groups that won't be used

## Message Display

### User Messages (Input Bubbles)

Your messages appear with:
- Your avatar
- Message text (rendered as markdown)
- Attached documents in a grid preview
- Uploaded images in a gallery

### AI Responses (Response Bubbles)

Agent responses include:
- Agent avatar and name
- Response content (markdown with syntax highlighting)
- Timeline of reasoning (if available)
- Grounding sources when data is cited
- Tool invocations when tools were used

### Grounding & Citations

When the agent references your data, you'll see:
- **Answer grounding** - Factual sources used
- **Dataset grounding** - Which datasets were queried
- **Web grounding** - External sources cited

Click the citations toggle to show or hide source references inline.

### Response Actions

Each AI response has action buttons below it:

| Action | Icon | Purpose |
|--------|------|---------|
| **Like** | Thumbs up | Mark as helpful response |
| **Dislike** | Thumbs down | Mark as unhelpful |
| **Copy** | Document | Copy response to clipboard |
| **Citations** | Quote | Toggle source citations |
| **Audio** | Speaker | Play response as audio (if available) |
| **More** | Lightning | Additional actions (Generate Campaign, Create Agent) |
| **Delete** | Trash | Remove message and response |

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

Right-click or use the menu on any conversation to:
- **Rename** - Edit the conversation title
- **Copy** - Duplicate conversation history
- **Export** - Download conversation to file
- **Delete** - Remove the conversation

### View All

Click "View all" to access the complete conversation history with advanced filtering and search options.

## Prompt Showcase

On the home screen (before starting a conversation), you may see example prompts to help you get started. These cover common use cases like:

- Twitter/X trend analysis
- Instagram inspiration
- YouTube video analysis
- Web search queries
- URL summarization
- SEO audits
- Image generation

Click any example to start a conversation with that prompt.

## Error Handling

If something goes wrong during a conversation:
- An error banner appears at the top of the chat
- Click **Retry** to attempt the operation again
- Click **Dismiss** to clear the error and continue

## Tips for Effective Chat

### Query Formulation

1. **Be specific** - Provide context about what you're looking for
2. **Include constraints** - Mention relevant criteria or limitations
3. **Ask follow-ups** - Refine results with iterative questions

### Mode Selection

- Start with **Chat** mode for exploratory questions
- Switch to **My Data** when you need insights from specific files
- Add **Web** mode for external context and current information

### Agent Selection

- Use specialized agents for domain-specific questions
- Try different agents to get varied perspectives
- Mention agents with `@` to get multiple viewpoints

### Source Management

- Select relevant sources before asking data-related questions
- Keep source selection focused to get more targeted answers
- Use "All datasets" when you're unsure which data is relevant

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Send message | `Enter` |
| New line | `Shift + Enter` |
| New conversation | Click `+` button |

## Next Steps

- [Create custom agents](/guide/agents) for specialized research tasks
- [Upload datasets](/guide/datasets) to give agents knowledge
- [Launch a campaign](/guide/campaigns) to collect primary research data
- [Build automated workflows](/guide/workflows) for recurring analysis
