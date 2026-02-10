# Home

The Home page is your AI-powered research assistant. It's the first thing you see after logging in — a conversational workspace where you can ask questions, analyze data, and generate insights.

![The Vurvey Home screen](/screenshots/home/03-after-login.png)

## Getting Started

When you arrive at Home, you'll see a greeting — **"Hi [Your Name]! What might we create today?"** — along with a text input at the bottom of the screen. Just type a question or request and press **Enter** to start a conversation.

**Try asking something like:**
- "Summarize the key themes from our latest beauty brand survey"
- "What are the top consumer complaints about our packaging?"
- "Write an executive summary of this quarter's research findings"

![The main chat interface](/screenshots/home/01-chat-main.png)

## The Chat Toolbar

Above the text input, you'll find a row of toolbar buttons that control how the AI responds to your messages.

<img
  :src="'/screenshots/home/05-chat-toolbar.png'"
  alt="Chat toolbar buttons"
  @error="$event.target.remove()"
/>

### Agents

Click the **Agents** button to choose which AI persona answers your questions. Each agent has its own personality, expertise, and knowledge base. For example, you might have:

- A **consumer persona** that responds as if they're a real customer in your target demographic
- An **analyst** that specializes in finding patterns in survey data
- A **strategist** that helps you develop positioning and messaging

You can also mention an agent by name mid-conversation by typing **@** followed by their name — for example, `@MarketAnalyst, what patterns do you see in this data?`

::: tip Multi-Agent Conversations
Mention multiple agents in the same message to get diverse perspectives at once. For example: `@MillennialMom, would you buy this product? @GenZShopper, how about you?`
:::

### Sources

Click the **Sources** button (tooltip: "Select Datasets and/or Campaigns") to connect your data to the conversation. You can select:

- **Datasets** — documents, spreadsheets, or other files you've uploaded
- **Campaigns** — survey responses you've collected through Vurvey

When sources are connected, the AI reads and cites your actual data rather than relying on general knowledge. This is essential for getting accurate, evidence-based insights.

::: tip Focused Sources Get Better Results
Selecting one or two relevant sources usually produces sharper answers than selecting everything at once. The AI can focus on what matters instead of sifting through unrelated data.
:::

### Image Model

Click the image model button (tooltip: "Select an image model") to enable AI image generation. Once enabled, you can ask the AI to create visuals — for example, "Create a mood board for our new product line" or "Generate a logo concept for a natural skincare brand."

### Search Tool

Click the search tool button (tooltip: "Select a search tool") to give the AI access to the web. With search enabled, you can ask about current events, competitor activity, or industry trends — for example, "What are the latest trends in sustainable packaging?"

### Model Selector

If available, a model selector button lets you choose which AI model powers your conversation. The default setting, **Auto-Select**, automatically picks the best model for your task. You can also choose a specific model if you prefer.

## How Chat Modes Work

You don't need to pick a "mode" manually — Vurvey figures it out based on what you've enabled in the toolbar:

| What you've enabled | How the AI behaves |
|---|---|
| **Everything on** (default) | The AI can use all available tools — search the web, query your data, generate images — whatever fits your question |
| **Only Sources selected** | The AI focuses exclusively on your connected datasets and campaigns, citing specific data points |
| **A search or image tool selected** | The AI uses that specific tool to answer your question |
| **Nothing selected** | Simple conversation mode — the AI uses only its general knowledge and what you've discussed so far |

## Attaching Files

Click the **upload button** (to the left of the text input) to attach files directly to your message. The AI can analyze:

- **Documents** — PDF, Word, PowerPoint, Excel, CSV, and text files
- **Images** — PNG, JPG, and GIF for visual analysis
- **Videos** — MP4 and MOV

**Example:** Upload a competitor's brochure and ask, "How does their messaging compare to ours?" Or paste a product photo and ask, "What design elements make this packaging stand out?"

## Reading AI Responses

Each AI response includes several helpful features:

<img
  :src="'/screenshots/home/06-response-actions.png'"
  alt="AI response with action buttons"
  @error="$event.target.remove()"
/>

### Citations

When the AI references your data, it shows a **Citations** section you can expand to see exactly which sources informed the answer. Click the citations button to toggle inline source references on or off within the response text.

### Response Actions

Below each AI response, you'll find a row of action buttons:

| Button | What it does |
|---|---|
| **Like** (thumbs up) | Mark a response as helpful |
| **Dislike** (thumbs down) | Mark a response as unhelpful |
| **Copy** | Copy the response text to your clipboard — great for pasting into reports or presentations |
| **Citations** | Show or hide source references within the response |
| **Audio** | Listen to the response read aloud (available for Vurvey agents and enterprise accounts) |
| **More** (lightning bolt) | Opens additional actions: **Generate Campaign** (turns the insight into a new survey) and **Create Agent** (creates a new AI agent based on the response) |
| **Delete** | Remove both your message and the AI's response from the conversation |

::: tip From Insight to Action
Found a compelling insight? Click the **More** button and select **Generate Campaign** to instantly turn it into a new survey you can send to your audience.
:::

## Managing Conversations

![Conversation sidebar](/screenshots/home/04-conversation-sidebar.png)

Your conversations are saved automatically and listed in the left sidebar under **Conversations**.

- **Start a new conversation** — Click the **+** button next to the Conversations header
- **Continue a conversation** — Click any conversation in the list to pick up where you left off
- **View all conversations** — Click **View all** at the bottom of the list to browse your full history
- **Manage a conversation** — Right-click (or use the menu on) any conversation to rename, export, or delete it

::: tip When to Start Fresh
Start a new conversation when you're switching to a completely different topic. Keeping conversations focused helps the AI give more relevant, contextual responses.
:::

## Practical Examples

### Rapid Survey Analysis

You just closed a survey with 500 responses and need insights for a meeting in two hours.

1. Click **Sources** and select your survey campaign
2. Ask: *"What are the top 5 themes in these survey responses?"*
3. Follow up: *"Show me notable quotes that represent each theme"*
4. Then: *"Write a 3-paragraph executive summary I can present to leadership"*

### Competitive Intelligence

Your team needs to understand how competitors are positioning themselves.

1. Click the **Search tool** button to enable web search
2. Ask: *"What is [Competitor]'s current messaging in the skincare market?"*
3. Follow up: *"Compare their positioning to ours based on our latest brand study"* (with your brand study selected as a Source)

### Multi-Perspective Concept Testing

You have a new product concept and want diverse reactions before live consumer testing.

1. Upload your concept image or description
2. Ask: *"@MillennialMom, would this product appeal to you? @BudgetShopper, is the value clear? @TrendSetter, would you share this with friends?"*
3. Then: *"Based on all perspectives, what are the strongest selling points and biggest purchase barriers?"*

## Tips for Better Results

- **Be specific** — Instead of "analyze this data," try "identify the top 3 themes with supporting quotes for each"
- **Build on previous answers** — Follow up with "tell me more about the second theme" or "break that down by age group"
- **Set the format** — Ask for bullet points, an executive summary, a comparison table, or whatever format you need
- **Use Shift + Enter** for multi-line prompts when you have a complex request with several parts

## Troubleshooting

**Responses seem generic and don't reference your data?**
Make sure you've selected specific sources using the Sources button. Without sources connected, the AI uses only its general knowledge.

**Can't send a message?**
Check that your text input isn't empty, or wait for the current response to finish before sending another message.

**Response is slow?**
Try reducing the number of connected sources, or break a complex question into simpler follow-up questions.

## Next Steps

- [Create custom Agents](/guide/agents) tailored to your research needs
- [Upload Datasets](/guide/datasets) to give agents your proprietary knowledge
- [Launch a Campaign](/guide/campaigns) to collect primary research data
- [Build Workflows](/guide/workflows) to automate recurring analysis
