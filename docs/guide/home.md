# Home (Chat Interface)

The Home page is your primary workspace for interacting with Vurvey's AI capabilities through a conversational interface. This is the default landing page after logging in.

::: info API Terminology
In the Vurvey API and codebase, the chat system uses these terms:
- **ChatConversation** = A conversation/chat session
- **ChatQueryMessage** = A user message (input)
- **ChatResponseMessage** = An AI response
- **ChatConversationMode** = Chat mode (CONVERSATION, SMART_TOOLS, SMART_SOURCES)
- **ChatLayoutMode** = Layout state (HOME or CHAT)
- **AiPersona** = An Agent you chat with

Understanding these mappings helps when troubleshooting or working with the platform programmatically.
:::

## Overview

![Chat Interface](/screenshots/home/01-chat-main.png)

The chat interface provides a unified way to query AI agents, attach data sources, and control how the AI reasons about your research questions.

::: tip What Can You Do Here?
The Home chat is your research command center. You can:
- Ask questions about your survey data and get instant insights
- Analyze documents, videos, and images with AI
- Get multiple perspectives by mentioning different agents
- Generate reports, summaries, and creative content
- Search the web for current information and trends
- Create images using AI generation tools
- Export conversations and create campaigns from insights
:::

## Page Layout Architecture

The chat interface is built around two main layouts that animate smoothly between each other:

### HOME Layout (Initial State)

When you first arrive at Home, you'll see a welcome message: **"Hi [Your Name]! What might we create today?"** This is the HOME layout before any conversation starts.

**Visual Elements:**
| Element | Description |
|---------|-------------|
| **Animated Background** | Perlin sphere animation (if enabled in workspace settings) |
| **Greeting Header** | Personalized "Hi [firstName]!" message |
| **Subheader** | "What might we create today?" prompt |
| **Prompt Showcase** | Example prompts to get started (if feature enabled) |
| **Chat Input** | Full input capabilities available even on home screen |

### CHAT Layout (Active Conversation)

Once you start a conversation, the page transitions to the CHAT layout showing your conversation history.

**Visual Elements:**
| Element | Description |
|---------|-------------|
| **Chat Name Pill** | Displays conversation name above message list |
| **Message List** | Scrollable area with user and AI messages |
| **Error Banner** | Appears at top if errors occur |
| **Chat Input** | Persistent input area at bottom |

The transition between layouts is animated with smooth spring physics (0.15-0.3 second duration).

## Chat Input Area

At the bottom of the screen, you'll find the chat input area where you compose messages. This is a sophisticated component with multiple sub-elements.

### Text Input

The main text area supports rich input capabilities:

- **Type** your question or prompt in the text area
- **Use `@`** to mention specific agents in your message
- **Use `/`** to access tool groups and specialized capabilities
- **Paste images** directly into the input for visual analysis
- **Auto-expand** - The text area grows as you type multi-line content

::: tip Pro Tip: Multiline Messages
Press `Shift + Enter` to add line breaks for multi-step prompts:
```
Analyze the Q4 survey results and:
1. Identify the top 3 themes
2. Find notable quotes for each theme
3. Suggest follow-up questions
```
:::

### Input Controls

| Control | Location | Purpose |
|---------|----------|---------|
| **Upload** | Left of input | Attach documents or images |
| **Sources Chip** | Above input | View/manage selected data sources |
| **Tool Badge** | Above input | Shows active tool group (with PAUSED indicator if applicable) |
| **Mode Chips** | Above input | Shows Smart Tools or Smart Sources badge |
| **Send** | Right of input | Submit your message (disabled when empty) |

### Agent Selector Tab

Above the input area, you'll see the **Persona Tab Wrapper** showing your currently selected agent:

- Click to expand and see agent details (name, description, avatar)
- Animated entrance/exit (33px slide)
- Shows which agent will respond to your message

### File Attachments

Click the upload button to attach files to your message:

**Supported File Types:**
| Category | Formats |
|----------|---------|
| **Documents** | PDF, DOCX, TXT, MD, CSV, JSON, PPTX, XLSX |
| **Images** | PNG, JPG, GIF (for visual analysis) |
| **Videos** | MP4, MOV (for video analysis) |
| **Audio** | MP3, WAV (if enabled) |

Files are uploaded and processed before your message is sent. A spinner appears during upload.

::: warning Upload Limitations
- The upload button is disabled when a tool is active
- The upload button is disabled when revoked attachments are present
- Large files may take longer to process
- Some file types may have size limits (typically 50MB max)
:::

::: details File Attachment Use Cases (Click to Expand)

**Competitive Analysis:**
Upload a competitor's PDF brochure and ask: "How does our messaging compare to this competitor's positioning?"

**Visual Research:**
Paste multiple product images and ask: "What design patterns do these successful products have in common?"

**Meeting Notes:**
Upload an audio recording from a client call and ask: "Summarize the key action items and client concerns."

**Data Exploration:**
Upload a CSV export and ask: "What are the most interesting patterns in this customer data?"

**Presentation Review:**
Upload a PowerPoint and ask: "What are the strongest and weakest slides in this deck?"
:::

### Tool Groups & Slash Commands

Use `/` in the chat input to access specialized tool groups. When you type `/`, a **Tool Selector Popup** appears showing available tools.

**Tool Selector Behavior:**
- Appears when you type `/`
- Disappears when you add a space
- Lists available tools with icons and descriptions
- Click to select a tool group

**Common Tool Groups:**
| Tool | Command | Purpose |
|------|---------|---------|
| **Web Search** | `/web` | Search the internet for information |
| **Image Generation** | `/image` | Create images from descriptions |
| **Data Analysis** | `/analysis` | Statistical analysis and visualization |
| **Content Creation** | `/content` | Generate structured content |

#### Tool Pausing Behavior

In certain modes, some tools are automatically paused:
- **Chat mode**: ALL tools paused by default (shown with grayscale + reduced opacity)
- **My Data mode**: Web-based tools paused
- A **"PAUSED"** badge appears on tool groups that won't be used

The Tool Group Badge Section shows your selected tool with clear visual feedback about its active/paused state.

::: tip Pro Tip: Tool Group Selection
Type `/` to see available tools and their descriptions. Select the right tool group before sending your message for best results. The slash command hint (e.g., `/web`) appears on each tool card.
:::

### Chat Bubble Drawer

When you click the tool selector button (slash icon), a **Chat Bubble Drawer** modal opens with Tool Group Cards:

**Each Tool Group Card Shows:**
- Icon for the tool
- Tool group name (localized)
- Slash command hint
- Description
- Checkmark when selected
- Border highlight when selected
- Animated entrance (staggered 0.05s delay)
- Hover effect (scale 1.02)
- Tap effect (scale 0.98)

The drawer closes automatically when you select a tool or click outside.

## Agent Selection

### Choosing an Agent

Click the agent selector at the top of the input area to choose which AI persona responds to your queries. Each agent is configured with:

| Attribute | Description |
|-----------|-------------|
| **Personality** | Communication style and tone |
| **Expertise** | Domain knowledge and specializations |
| **Instructions** | Behavioral guidelines |
| **Knowledge** | Connected datasets |
| **Voice** | Voice ID for audio playback (if configured) |

::: tip Pro Tip: Match Agent to Task
- **Consumer Personas** for "voice of customer" perspectives
- **Analysts** for data interpretation and pattern finding
- **Experts** for industry-specific terminology and context
- **Assistants** for general brainstorming and exploration
:::

### Agent Mentions with @

Type `@` followed by an agent's name to mention them in your message. This triggers a **Mention Popup** that:
- Shows available published agents
- Filters as you type the agent name
- Allows selecting one agent per message

**Examples of Agent Mentions:**

```
What do you think about this concept? @SarahTheMillennial, would this
appeal to you?
```

```
@MarketAnalyst, what do you see in this data? @BrandStrategist, how
would you position this?
```

::: tip Pro Tip: Multi-Agent Conversations
Mention multiple agents in the same message to get diverse perspectives instantly. This is powerful for:
- Testing messaging with different demographics
- Getting both analytical and creative viewpoints
- Validating ideas across stakeholder perspectives
:::

## Chat Modes

Three mode toggles control how the AI processes your request:

| Mode | Icon | API Value | Description |
|------|------|-----------|-------------|
| **Chat** | Default | `CONVERSATION` | General reasoning using the AI's base knowledge |
| **My Data** | Data icon | `SMART_SOURCES` | References your connected datasets and uploaded files |
| **Web** | Globe icon | `SMART_TOOLS` | Searches and reasons over live web content |

::: tip Combining Modes
Modes can be combined for comprehensive analysis. For example, enable both **My Data** and **Web** to compare your research findings with external sources.
:::

### Mode Behavior Details

| Mode Configuration | Behavior |
|-------------------|----------|
| **Chat mode only** | Agent uses its trained knowledge and conversation context. All tools paused. |
| **My Data mode** | Agent searches and cites your selected datasets. Web-based tools paused. |
| **Web mode** | Agent searches the internet for current information. |
| **Combined modes** | Agent synthesizes information from multiple sources. |

### Mode Selection Strategy

::: details When to Use Each Mode (Click to Expand)

**Use Chat Mode When:**
- Brainstorming and exploring ideas
- General knowledge questions
- Creative tasks like writing or ideation
- You want the agent's trained perspective without data lookup

**Use My Data Mode When:**
- Analyzing survey responses or research data
- Getting insights from your uploaded documents
- Comparing findings across your datasets
- You need citations and source references

**Use Web Mode When:**
- Researching current events or trends
- Finding competitor information
- Getting up-to-date market data
- Validating your research with external sources

**Combine My Data + Web When:**
- Comparing your findings to industry benchmarks
- Validating internal research with external sources
- Understanding how your data relates to broader trends
- Building comprehensive competitive analyses
:::

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
| **Audios** | Equalizer | Audio files |
| **Active Tool** | Tool icon | Currently selected tool |

### Managing Sources

The **Sources Section** component displays chips for each selected source:

- Click any chip's **X** to remove that source
- View badges for "All campaigns" or "All datasets" mode
- Sources chips are hidden when empty (configurable)
- Click the sources area to open the **Select Chat Sources Modal**

**In the Selection Modal:**
- Add or remove individual sources
- Select "All campaigns" for comprehensive survey analysis
- Select "All datasets" for full dataset access
- Sources persist across messages in the same conversation

::: tip Pro Tip: Focused Sources = Better Results
Selecting fewer, more relevant sources often produces better results than selecting everything. The AI can focus on what matters instead of sifting through unrelated data.

**Good:** "Q4 Customer Satisfaction Survey" + "Product Feedback Dataset"
**Less Focused:** "All campaigns" + "All datasets"
:::

## Message Display

### User Messages (Input Bubbles)

Your messages appear with:

| Element | Description |
|---------|-------------|
| **Avatar** | Your user avatar (square, medium size) |
| **Message Text** | Your prompt rendered as markdown |
| **Document Grid** | Attached documents in thumbnail grid (small for 2+, medium for single) |
| **Image Gallery** | Uploaded images (clickable to view in Image Studio) |
| **Actions** | Copy, delete, regenerate options |

### AI Responses (Response Bubbles)

Agent responses include multiple sections:

| Section | Description |
|---------|-------------|
| **Agent Avatar** | The responding agent/persona avatar |
| **Agent Name** | Persona name or "Vurvey" for default agent |
| **Timeline Summary** | Reasoning thought process timeline (if available, shows streaming indicator when active) |
| **Main Content** | Response rendered as markdown with syntax highlighting |
| **Grounding Section** | Expandable/collapsible sources that powered the response |
| **Tool Action Bubbles** | Shows tool invocations (function calls, search, Twitter, Instagram, reasoning, etc.) |
| **Response Actions** | Like, dislike, copy, citations, audio, more actions, delete |

### Grounding & Citations

When the agent references your data, the Grounding Section shows:

| Grounding Type | Description |
|----------------|-------------|
| **Answer Grounding** | Factual sources used for the response |
| **Dataset Grounding** | Which training sets were queried |
| **Question Grounding** | Survey questions referenced |
| **Web Grounding** | External web sources cited |

Click the **Citations toggle** to show or hide source references inline in the response text.

::: tip Understanding Citations
Citations help you:
- **Verify accuracy** - Check the source directly
- **Explore deeper** - Find related content in the source
- **Build trust** - Know where insights come from
- **Share confidently** - Reference specific data points
:::

### Response Actions

Each AI response has action buttons below it:

| Action | Icon | Purpose | Notes |
|--------|------|---------|-------|
| **Like** | Thumbs up | Mark as helpful response | Tooltip changes when liked |
| **Dislike** | Thumbs down | Mark as unhelpful | Tooltip changes when disliked |
| **Copy** | Document | Copy response to clipboard | Disabled for image-only messages |
| **Citations** | Quote | Toggle source citations | Only visible if response has grounding |
| **Audio** | Speaker | Play response as audio | Shows for Vurvey agents or enterprise; uses agent's voiceId |
| **More** | Lightning | Additional actions dropdown | Generate Campaign, Create Agent |
| **Delete** | Trash | Remove message and response | Confirmation modal: "This will delete both your message and the assistant's response" |

::: tip Pro Tip: Copy with Formatting
Use the **Copy** button to preserve markdown formatting when pasting into documents, presentations, or emails. The formatting transfers cleanly to most applications.
:::

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

::: tip When to Start a New Conversation
Start fresh when:
- Switching to a completely different topic
- The current thread is getting too long (affects response quality)
- You want a clean slate without previous context
- Testing different approaches to the same question
:::

### Managing Conversations

Right-click or use the menu on any conversation to:
- **Rename** - Edit the conversation title
- **Copy** - Duplicate conversation history
- **Export** - Download conversation to file
- **Delete** - Remove the conversation

### View All

Click "View all" to access the complete conversation history with advanced filtering and search options.

## Prompt Showcase

On the home screen (before starting a conversation), you may see example prompts to help you get started. The **PromptShowcase** component shows 10 example prompts with icons:

| Category | Example Prompts |
|----------|-----------------|
| **Social Media** | Twitter/X trend analysis, Instagram inspiration |
| **Video** | YouTube video analysis |
| **Research** | Web search queries, URL summarization |
| **SEO** | SEO audits |
| **Creative** | Image generation examples |
| **Enhancement** | AI enhancement tools |

Click any example to start a conversation with that prompt pre-filled.

## Image Studio

The **Image Studio** is a floating panel that appears at the bottom right when working with images:

- Opens when viewing uploaded images in detail
- Provides image editing and manipulation capabilities
- Submit button: **"Save to conversation"** saves edits back to the chat
- Useful for cropping, annotating, or enhancing images before analysis

## Error Handling

### Error Banner

When errors occur, a **ChatErrorBanner** appears at the top of the message list:

| Element | Description |
|---------|-------------|
| **Error Icon** | Visual indicator of issue |
| **Error Message** | Description of what went wrong |
| **Retry Button** | Attempts the failed operation again (if available) |
| **Dismiss Button** | Closes the banner |

**Banner Behavior:**
- Uses `role="alert"` and `aria-live="assertive"` for accessibility
- Auto-dismissable
- Cleared when user sends a new message
- Can be programmatically cleared via `CLEAR_ERROR` action

### Revoked Attachments Notice

The **RevokedAttachmentsNotice** component appears when your permissions to attachments have changed:

**Types of Revoked Items:**
- Files
- Videos
- Audios
- Training sets
- Surveys
- Questions
- AI Persona

This notice appears above the chat input and may disable messaging until acknowledged.

## Real-World Use Cases

### Use Case 1: Rapid Survey Analysis

**Scenario:** You just closed a survey with 500 responses and need key insights for a meeting in 2 hours.

**Approach:**
1. Select the survey campaign as your source
2. Enable **My Data** mode
3. Start with broad questions, then drill down

**Sample Prompts:**
```
What are the top 5 themes in these survey responses?
```
```
Show me notable quotes that represent each major theme.
```
```
Which demographic groups had the most different opinions?
```
```
What surprised you most in this data?
```

::: tip Pro Tip: Build a Narrative
Use the conversation to build your presentation:
1. Get the overview
2. Drill into interesting findings
3. Ask for supporting quotes
4. Request a summary you can present
:::

### Use Case 2: Competitive Intelligence

**Scenario:** Your team needs to understand how competitors are positioning themselves.

**Approach:**
1. Enable **Web** mode
2. Use the `/web` tool group for research
3. Compare findings to your own positioning

**Sample Prompts:**
```
What is [Competitor]'s current messaging and positioning in the
[category] market?
```
```
Compare the website messaging of these 3 competitors: [A], [B], [C].
What are their key differentiators?
```
```
Search for recent news about [Competitor]'s product launches in 2024.
```

::: tip Pro Tip: Save Key Findings
When you find valuable competitive intel:
1. Copy the response
2. Add to a dataset for future reference
3. Use in future conversations with @Analyst agents
:::

### Use Case 3: Multi-Perspective Concept Testing

**Scenario:** You have a new product concept and want diverse perspectives before consumer testing.

**Approach:**
1. Upload concept materials (images, descriptions)
2. Mention multiple consumer persona agents
3. Ask specific questions about appeal and concerns

**Sample Prompts:**
```
Here's our new product concept [attached image].

@MillennialParent: Would this appeal to you? What would make you buy it?
@GenZConsumer: Is this something you'd share with friends?
@BudgetConscious: Is the value clear? What concerns would you have?
```

::: tip Pro Tip: Synthesize Perspectives
After getting individual views, ask:
"Based on all these perspectives, what are the strongest selling points? What are the biggest barriers to purchase?"
:::

### Use Case 4: Report Generation

**Scenario:** You need to create a monthly research summary for stakeholders.

**Approach:**
1. Select all relevant campaigns and datasets
2. Enable **My Data** mode
3. Guide the AI through your report structure

**Sample Prompts:**
```
Create an executive summary of all research conducted this month.
Include:
- Number of surveys conducted
- Total responses collected
- Key themes across all studies
- Most actionable insights
```
```
Format the key findings as a bullet-point presentation for executives.
```
```
What are 3 recommended actions based on this month's research?
```

### Use Case 5: Image-Based Research Analysis

**Scenario:** You want to analyze visual content from your campaigns, including video thumbnails, product images, and participant-submitted photos.

**Approach:**
1. Upload or paste images directly into the chat
2. Use an agent specialized in visual analysis
3. Combine with survey data for comprehensive insights

**Sample Prompts:**
```
Here are 10 product photos submitted by survey participants.
What visual themes do you see? What do these tell us about how
customers use our product?
```
```
[Attached competitor product images]
Compare the packaging design of our product vs. these competitors.
What visual elements stand out?
```
```
Analyze these mood board images. What emotional associations do
they create? How might we incorporate these into our brand?
```

::: tip Pro Tip: Image + Data Synthesis
Combine visual analysis with survey data:
1. Upload product images
2. Select your survey campaign as a source
3. Ask: "How do these images align with what customers said in the survey about visual appeal?"
:::

## Tips for Effective Chat

### Query Formulation

1. **Be specific** - Provide context about what you're looking for
2. **Include constraints** - Mention relevant criteria or limitations
3. **Ask follow-ups** - Refine results with iterative questions
4. **Provide examples** - Show what format you want in the response

::: details Query Writing Tips (Click to Expand)

**Instead of:** "Analyze this data"
**Try:** "Identify the top 3 themes in these survey responses, with 2-3 supporting quotes for each theme"

**Instead of:** "What do customers think?"
**Try:** "What are the most common complaints in these product reviews, and which product categories are most affected?"

**Instead of:** "Write a summary"
**Try:** "Create a 3-paragraph executive summary suitable for C-level stakeholders who have 2 minutes to read it"

**Instead of:** "Find trends"
**Try:** "Compare responses between Q1 and Q4 - what changed significantly?"
:::

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

### Advanced Prompt Techniques

::: details Click to Expand Advanced Techniques

**Chain-of-Thought Prompting:**
```
Think through this step by step:
1. First, identify the main themes
2. Then, rank them by frequency
3. Finally, explain why the top theme matters most
```

**Role Assignment:**
```
You are a senior market researcher presenting to a client.
Analyze this data and provide strategic recommendations.
```

**Format Specification:**
```
Present your findings as:
- A one-line summary
- 3 key bullet points
- A recommended next step
```

**Comparative Analysis:**
```
Compare [Dataset A] and [Dataset B]:
- What's similar?
- What's different?
- What explains the differences?
```

**Devil's Advocate:**
```
What are the strongest counterarguments to this conclusion?
What might we be missing?
```
:::

## Best Practices

### Conversation Management

| Practice | Benefit |
|----------|---------|
| Start new conversations for new topics | Better context, more focused responses |
| Use descriptive prompts | AI understands intent clearly |
| Break complex requests into steps | More accurate, detailed responses |
| Save important conversations | Build a research knowledge base |
| Export conversations before deleting | Preserve institutional knowledge |

### Performance Optimization

| Practice | Benefit |
|----------|---------|
| Select fewer, relevant sources | Faster, more focused responses |
| Upload smaller files when possible | Quicker processing |
| Use specific queries over broad ones | Better accuracy |
| Clear unused attachments | Reduce confusion |

### Collaboration Tips

| Practice | Benefit |
|----------|---------|
| Rename conversations descriptively | Easy to find later |
| Export and share key insights | Team alignment |
| Use consistent agent selection | Reproducible results |
| Document successful prompt patterns | Team efficiency |

## Troubleshooting

### Common Issues and Solutions

#### Responses Are Too Generic

**Symptoms:** AI gives vague answers that don't reference your data.

**Solutions:**
1. Enable **My Data** mode (check that icon is highlighted)
2. Select specific sources (not "All")
3. Reference the data explicitly in your prompt: "Based on the Q4 survey responses..."
4. Check that selected sources contain relevant content

#### Agent Isn't Using Connected Datasets

**Symptoms:** Agent responds but doesn't cite or reference connected data.

**Solutions:**
1. Verify **My Data** mode is enabled (icon should be highlighted)
2. Check the Sources panel shows expected datasets
3. Rephrase query to explicitly request data analysis
4. Try: "Search my connected datasets for..."

#### Slow Response Times

**Symptoms:** Long wait times for AI responses.

**Solutions:**
1. Reduce the number of selected sources
2. Simplify complex queries into multiple simpler ones
3. Avoid uploading very large files (break into smaller chunks)
4. Check your internet connection

#### Web Search Returns Outdated Information

**Symptoms:** Web mode returns old or irrelevant results.

**Solutions:**
1. Add date constraints: "Search for [topic] 2024 news"
2. Use specific domain names: "Search site:techcrunch.com for..."
3. Rephrase with current event references
4. Try the `/web` tool group for more control

#### Conversation Lost or Missing

**Symptoms:** Can't find a previous conversation.

**Solutions:**
1. Click "View all" in the sidebar
2. Use the search function
3. Check if you're in the correct workspace
4. Conversations may have been deleted by another user with permissions

#### File Upload Fails

**Symptoms:** Files won't attach or show errors.

**Solutions:**
1. Check file size limits (typically 50MB max)
2. Verify file format is supported (see supported formats above)
3. Try refreshing the page and re-uploading
4. For large PDFs, try splitting into smaller files
5. Ensure you don't have revoked attachments blocking uploads

#### Send Button Is Disabled

**Symptoms:** Can't send your message.

**Possible Causes:**
- Input is empty or whitespace only
- Only an @mention with no other text
- No attachments and no text
- Currently sending a question (wait for response)
- Currently updating
- No workspace selected
- Revoked attachments present

**Solutions:**
1. Add text content to your message
2. Wait for current operation to complete
3. Acknowledge revoked attachments notice
4. Refresh the page if issue persists

### Getting Help

If issues persist:
1. **Document the problem** with screenshots
2. **Note the conversation ID** (visible in URL)
3. **Check workspace settings** for any restrictions
4. **Contact support** via the Help menu

## Frequently Asked Questions

::: details FAQs (Click to Expand)

**Q: Are my conversations private?**
A: Yes, conversations are visible only to you unless you explicitly share them. Workspace admins may have visibility for compliance purposes.

**Q: How long are conversations saved?**
A: Conversations are saved indefinitely until you delete them. There's no automatic expiration.

**Q: Can I export a conversation?**
A: Yes, right-click any conversation and select "Export" to download as a file.

**Q: Why does the agent sometimes give different answers to the same question?**
A: AI responses have some natural variation. For more consistent results, be very specific in your prompts and use the same agent and mode settings.

**Q: Can I use the chat on mobile?**
A: Yes, the chat interface is responsive and works on mobile devices. Some features may be condensed in the mobile view.

**Q: How do I share a conversation with a colleague?**
A: Use the conversation menu to copy or export, then share via your preferred method. Direct sharing within the platform is coming soon.

**Q: What's the maximum message length?**
A: There's a generous limit for most use cases. If you're hitting limits, try breaking complex prompts into multiple messages.

**Q: Can I use my own AI model?**
A: The available models are configured by your workspace. Enterprise customers may have access to additional models.

**Q: How do citations work with web search?**
A: When using Web mode, the AI cites sources with links. Click the link to verify information directly.

**Q: Why can't I see certain agents?**
A: You can only see agents you've created or that have been shared with you. Ask the agent owner to share if you need access.

**Q: What does the "PAUSED" badge mean on tools?**
A: Some tools are automatically paused in certain modes. For example, all tools are paused in pure Chat mode, and web-based tools are paused in My Data mode. This is normal behavior.

**Q: Can I use multiple tools in one message?**
A: You can select one tool group per message. To use different tools, send separate messages.

**Q: How do I create a campaign from a chat response?**
A: Click the lightning bolt (More Actions) icon below any AI response and select "Generate Campaign."

**Q: How do I create an agent from a chat response?**
A: Click the lightning bolt (More Actions) icon below any AI response and select "Create Agent."
:::

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Send message | `Enter` |
| New line | `Shift + Enter` |
| Send message (alternative) | `Ctrl/Cmd + Enter` |
| New conversation | Click `+` button |
| Focus chat input / Open tools | `/` |
| Mention agent | `@` + type name |
| Cancel upload | `Escape` |
| Close modal/drawer | `Escape` |
| Copy last response | `Cmd/Ctrl + Shift + C` |
| Tab navigation | `Tab` |

## Test IDs Reference

For automated testing and debugging, key elements have `data-testid` attributes:

| Element | Test ID |
|---------|---------|
| Input bubble | `input-bubble` |
| Response bubble | `response-bubble` |
| Attached documents grid | `attached-documents` |
| Send button | `send-button` |
| Upload button | `upload-button` |
| Error banner | Uses `role="alert"` |
| Like button | `like-button` |
| Dislike button | `dislike-button` |
| Copy button | `copy-button` |
| Delete button | `delete-button` |
| Citations toggle | `citations-toggle` |
| Tool selector | `tool-selector` |
| Source chip | `source-chip` |
| Chat input textarea | `chat-input` |

## Technical Architecture Notes

::: details Developer Reference (Click to Expand)

**Component Hierarchy:**
```
CanvasPage
└── ChatView
    ├── HOME Layout
    │   ├── PerlinSphere (animated background)
    │   ├── Header ("Hi {firstName}!")
    │   ├── Subheader ("What might we create today?")
    │   └── PromptShowcase
    └── CHAT Layout
        ├── ChatNamePill
        ├── ChatErrorBanner (if error)
        └── ScrollableList
            └── MessageList
                ├── InputBubble (user messages)
                └── ResponseBubble (AI messages)
```

**Input Area Hierarchy:**
```
ChatBubble
├── PersonaTabWrapper
│   └── PersonaRenderer
└── InputBubble
    ├── CommandTextArea
    │   ├── ToolSelector (on /)
    │   └── Mention (on @)
    ├── UploadButton
    ├── UploadedImageSection
    ├── SourcesSection
    ├── ToolGroupBadgeSection
    ├── ChatToolbarChips
    └── SubmitButton
```

**State Management:**
- `ChatActionTypes` enum for reducer actions
- `useChatDrawerContext()` for drawer state
- `useAddFileToConversation` hook for file uploads
- `useLocalFileUpload` hook for file validation

**CSS Conventions:**
- Files use kebab-case: `chat-bubble.module.scss`
- Classes use camelCase: `styles.chatBubble`
- Modifiers: `&.isDarkMode`, `&.isSelected`, `&.isFocused`
:::

## Next Steps

- [Create custom agents](/guide/agents) for specialized research tasks
- [Upload datasets](/guide/datasets) to give agents knowledge
- [Launch a campaign](/guide/campaigns) to collect primary research data
- [Build automated workflows](/guide/workflows) for recurring analysis
