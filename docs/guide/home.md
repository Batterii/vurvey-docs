# Home (Chat Interface)

The Home page is your primary workspace for interacting with Vurvey's AI capabilities through a conversational interface. This is the default landing page after logging in.

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
:::

## Page Layout

When you first arrive at Home, you'll see a welcome message: "Hi [Your Name]! What might we create today?" This is the **HOME layout**. Once you start a conversation, the page transitions to the **CHAT layout** showing your conversation history.

## Chat Input Area

At the bottom of the screen, you'll find the chat input area where you compose messages.

### Text Input

- Type your question or prompt in the text area
- Use `@` to mention specific agents in your message
- Use `/` to access tool groups and specialized capabilities
- Paste images directly into the input for visual analysis

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

::: details File Attachment Use Cases (Click to Expand)

**Competitive Analysis:**
Upload a competitor's PDF brochure and ask: "How does our messaging compare to this competitor's positioning?"

**Visual Research:**
Paste multiple product images and ask: "What design patterns do these successful products have in common?"

**Meeting Notes:**
Upload an audio recording from a client call and ask: "Summarize the key action items and client concerns."

**Data Exploration:**
Upload a CSV export and ask: "What are the most interesting patterns in this customer data?"
:::

## Agent Selection

### Choosing an Agent

Click the agent selector at the top of the input area to choose which AI persona responds to your queries. Each agent is configured with:

- **Personality** - Communication style and tone
- **Expertise** - Domain knowledge and specializations
- **Instructions** - Behavioral guidelines
- **Knowledge** - Connected datasets

::: tip Pro Tip: Match Agent to Task
- **Consumer Personas** for "voice of customer" perspectives
- **Analysts** for data interpretation and pattern finding
- **Experts** for industry-specific terminology and context
- **Assistants** for general brainstorming and exploration
:::

### Agent Mentions

Type `@` followed by an agent's name to mention them in your message. This allows you to invoke specific agents mid-conversation without switching your primary agent.

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
| **Audio** | Equalizer | Audio files |

### Managing Sources

- Click the sources chip to view currently selected sources
- Use the source selection modal to add or remove sources
- Select "All campaigns" or "All datasets" for comprehensive analysis
- Remove individual sources by clicking the X on their chip

::: tip Pro Tip: Focused Sources = Better Results
Selecting fewer, more relevant sources often produces better results than selecting everything. The AI can focus on what matters instead of sifting through unrelated data.

**Good:** "Q4 Customer Satisfaction Survey" + "Product Feedback Dataset"
**Less Focused:** "All campaigns" + "All datasets"
:::

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

::: tip Pro Tip: Tool Group Selection
Type `/` to see available tools and their descriptions. Select the right tool group before sending your message for best results:
- `/image` for image generation
- `/web` for web search
- `/analysis` for data analysis
:::

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

::: tip Understanding Citations
Citations help you:
- **Verify accuracy** - Check the source directly
- **Explore deeper** - Find related content in the source
- **Build trust** - Know where insights come from
- **Share confidently** - Reference specific data points
:::

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

On the home screen (before starting a conversation), you may see example prompts to help you get started. These cover common use cases like:

- Twitter/X trend analysis
- Instagram inspiration
- YouTube video analysis
- Web search queries
- URL summarization
- SEO audits
- Image generation

Click any example to start a conversation with that prompt.

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
2. Use the right tool groups for research
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

## Troubleshooting

### Common Issues and Solutions

#### Responses Are Too Generic

**Symptoms:** AI gives vague answers that don't reference your data.

**Solutions:**
1. Enable **My Data** mode
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
2. Verify file format is supported
3. Try refreshing the page and re-uploading
4. For large PDFs, try splitting into smaller files

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
:::

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Send message | `Enter` |
| New line | `Shift + Enter` |
| New conversation | Click `+` button |
| Focus chat input | `/` |
| Mention agent | `@` + type name |
| Cancel upload | `Escape` |
| Copy last response | `Cmd/Ctrl + Shift + C` |

## Next Steps

- [Create custom agents](/guide/agents) for specialized research tasks
- [Upload datasets](/guide/datasets) to give agents knowledge
- [Launch a campaign](/guide/campaigns) to collect primary research data
- [Build automated workflows](/guide/workflows) for recurring analysis
