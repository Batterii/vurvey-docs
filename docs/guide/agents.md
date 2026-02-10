# Agents

Agents are AI-powered team members you create to represent consumer perspectives, provide specialized expertise, or generate visual content. Each agent has its own personality, knowledge base, and communication style — think of them as virtual focus group participants, research assistants, or creative partners that are available around the clock.

## Why Use Agents?

Whether you're testing a new product concept with a simulated Gen Z beauty enthusiast, getting instant analysis of campaign responses from a research assistant, or generating mood boards for a creative brief, agents let you move faster without sacrificing the depth of insight your team needs.

Agents can:
- **Simulate consumer perspectives** — create agents that embody your target demographics and test messaging, packaging, or product concepts before going to market
- **Accelerate research** — build assistants that analyze survey responses, identify themes, and surface actionable insights in minutes instead of weeks
- **Generate visual content** — produce concept images, mood boards, and creative assets on demand
- **Participate in workflows** — add agents as automated steps in your research pipelines

---

## The Agent Gallery

![Agents Gallery](/screenshots/agents/01-agents-gallery.png)

When you open **Agents** from the left navigation, you'll see the Agent Gallery — a visual grid of all the agents available in your workspace. Each agent appears as a card showing its avatar, name, type, and status.

### Gallery Sections

Agents are organized into collapsible sections:

- **Trending** — Popular agents from the Vurvey platform over the last 30 days. These are marked with the Vurvey Badge (a sparkle icon) to indicate they were created by Vurvey.
- **Assistant** — General-purpose agents for research, analysis, and Q&A
- **Consumer Persona** — Agents that simulate specific consumer segments and demographics
- **Product** — Agents with deep expertise about particular products or product lines
- **Visual Generator** — Agents that create images and visual content

::: tip Trending vs. Agent Types
"Trending" is a display section, not an agent type. The four agent types you can create are **Assistant**, **Consumer Persona**, **Product**, and **Visual Generator**. The Trending section highlights popular Vurvey-created agents regardless of their type.
:::

### Agent Cards

Each card shows:
- The agent's **avatar image** as the card background
- The agent's **name** in white text
- The agent's **type** as a purple label (e.g., "Consumer Persona")
- A **Vurvey Badge** (sparkle icon) if it's an official platform agent
- On hover: a **status indicator** (green dot for Published, gray dot for Draft), the agent's **description**, and a **three-dot menu** for quick actions

### Searching and Filtering

![Agents Search](/screenshots/agents/02-agents-search.png)

Use the filter bar at the top of the gallery to find specific agents:

- **Sort** — Order agents by Newest or Oldest
- **Type** — Filter by Assistant, Consumer Persona, Product, or Visual Generator
- **Model** — Filter by the AI model powering the agent (GPT, Gemini, Claude, and others)
- **Status** — Show only Active (Published) or Inactive (Draft) agents
- **Search** — Type a name to find a specific agent instantly

---

## Agent Types: Choosing the Right One

Picking the right agent type helps organize your library and sets appropriate defaults in the builder.

### Assistant

Best for general-purpose research tasks, data analysis, and team support. Use an Assistant when you need a flexible AI partner that can handle a range of topics.

**Example use cases:**
- Set up a research assistant agent that helps your team quickly analyze campaign responses and surface key themes
- Create an industry trends analyst that monitors your competitive landscape and delivers weekly briefings
- Build a survey design consultant that reviews your questionnaires and suggests improvements

### Consumer Persona

Best for simulating how specific consumer segments would react to your products, messaging, or concepts. Use a Consumer Persona when you want to "hear from" a target demographic without scheduling a focus group.

**Example use cases:**
- Create a Gen Z beauty enthusiast agent to simulate how younger consumers would respond to your new product concepts
- Build a luxury shopper agent that embodies the preferences and behaviors of high-net-worth consumers
- Design a health-conscious parent agent to test how families with young children react to new packaging claims

### Product

Best for product-specific expertise and knowledge. Use a Product agent when your team needs instant answers about features, positioning, or competitive comparisons.

**Example use cases:**
- Build a product expert agent for your new skincare line that helps your team understand ingredient benefits and positioning
- Create a competitive analysis agent that knows your product category inside and out
- Set up a product training agent that onboards new team members with consistent, accurate information

### Visual Generator

Best for creating images, mood boards, and visual concepts. Use a Visual Generator when you need creative assets quickly.

**Example use cases:**
- Generate concept visualizations for a new product launch campaign
- Create mood boards that capture the aesthetic direction for a brand refresh
- Produce packaging concept images to share with stakeholders before investing in design

---

## Viewing Agent Details

![Agent Detail](/screenshots/agents/04-agent-detail.png)

Click any agent card to open the details drawer, which slides in from the right side of the screen.

The drawer shows:
- The agent's **avatar** at full size
- **Name** and **type**
- An **Edit** button (if you have permission to modify the agent)
- The agent's full **description** with its biography and capabilities
- A list of **related conversations** — past chats involving this agent

At the bottom of the drawer, you'll find a **live chat interface** where you can test the agent immediately. Type a question and see how the agent responds in real time.

::: tip Test Before You Share
Before sharing an agent with your team, test it with a few representative questions:
1. Does it stay in character and maintain its persona?
2. Does it reference the datasets you connected?
3. Does it follow the rules you set?
4. How does it handle unexpected or off-topic questions?
:::

### Agent Card Actions

Click the three-dot menu on any agent card to access quick actions:

- **Start Conversation** — Open a new chat with this agent
- **Share** — Control who can access this agent (requires Manage permission)
- **Edit Agent** — Open the agent builder to make changes (requires Edit permission)
- **View Agent** — Open a read-only view (when you don't have Edit permission)
- **Delete Agent** — Permanently remove the agent (requires Delete permission)

---

## Creating an Agent

Click **+ Create Agent** in the top-right corner of the gallery to launch the Agent Builder. The builder walks you through six steps to create a complete, well-configured agent.

::: tip Classic Builder Available
If you prefer the original builder experience, click **Use Classic Builder** in the top navigation bar at any time.
:::

### Builder Navigation

The top of the builder shows a visual progress bar with all six steps. Each step displays one of these states:

- **Locked** — You need to complete earlier steps first
- **Available** — Ready for you to work on
- **Active** — The step you're currently viewing (highlighted)
- **Complete** — A green checkmark means this step passed validation
- **Needs attention** — A red indicator means something needs to be fixed

You can click any unlocked step to jump directly to it, or use the navigation buttons to move forward and back.

---

### Step 1: Objective

![Agent Builder - Objective](/screenshots/agents/05-builder-objective.png)

This is where you choose what kind of agent to build and define its mission.

**What you'll do:**
1. **Choose an agent type** — Select from Assistant, Consumer Persona, Product, or Visual Generator
2. **Write a core mission** — Describe what this agent should accomplish

Your core mission is the most important piece of guidance you'll give your agent. A well-written mission leads to much better results.

::: tip Writing a Strong Core Mission
Compare these two approaches:

**Vague:** "Help with research"

**Specific:** "Analyze consumer survey responses about sustainable packaging preferences, identify the top themes across age groups, and provide actionable recommendations for our product development team — including specific consumer quotes that support each finding."

The specific version gives your agent clear context, scope, and expected outputs.
:::

---

### Step 2: Facets

<img
  :src="'/screenshots/agents/06-builder-facets.png'"
  alt="Agent Builder - Facet Values"
  @error="$event.target.remove()"
/>

Facets define your agent's characteristics — the traits, demographics, and background that shape how it thinks and communicates. The page header shows **Facet Values** as you work through this step.

**What you'll configure:**
- **Demographics** — Age, gender, location, income level
- **Lifestyle** — Family status, hobbies, values, priorities
- **Professional background** — Industry, role, experience level
- **Communication style** — Tone, formality, level of detail
- **Behavioral traits** — Decision-making style, risk tolerance, skepticism

You can select traits using checkboxes, dropdowns, sliders, or free-text fields depending on the facet category.

**Example: Building a Millennial Parent Persona**

Imagine you're testing a new line of organic baby food. You might configure facets like:
- Age range: 30–38
- Location: Suburban United States
- Income: $75,000–$125,000
- Life stage: Parent of children under 5
- Values: Health-conscious, sustainability-minded, value-driven
- Shopping style: Research-heavy, influenced by peer reviews, prefers online ordering
- Communication: Casual tone, wants practical information quickly, values authenticity

::: tip Mold Templates
You can optionally start from a pre-configured **mold** (template) that provides a starting point for common persona types. Select a mold at the beginning of this step, then customize the facets to match your specific needs.
:::

---

### Step 3: Optional Settings

<img
  :src="'/screenshots/agents/07-builder-optional-settings.png'"
  alt="Agent Builder - Optional Settings"
  @error="$event.target.remove()"
/>

This step lets you fine-tune how your agent operates by adding knowledge, rules, and connecting datasets. Everything here is optional — you can skip it entirely or come back later.

**What you can configure:**

#### AI Model

Choose which AI model powers your agent:

- **Gemini Flash** — Fastest responses, great for most everyday tasks
- **Gemini Pro** — Deeper reasoning, can analyze images and video
- **Claude** — Excellent at staying in character and following nuanced instructions
- **GPT-4o** — Strong general knowledge across a wide range of topics

::: tip Which Model Should You Pick?
Start with **Gemini Flash** for most agents — it's fast and handles the majority of tasks well. Switch to **Claude** when personality consistency matters most (like consumer persona agents that need to stay in character). Use **Gemini Pro** when your agent needs to analyze visual content.
:::

#### Tools

Enable specific capabilities for your agent:
- **Smart Prompt** — Enhanced reasoning (recommended for all agents)
- **Web Search** — Let the agent access current information from the web
- **Image Generation** — Enable visual content creation (essential for Visual Generator agents)
- **Code Execution** — Run calculations and data analysis scripts
- **Document Analysis** — Process uploaded files and documents

#### Datasets

Connect knowledge sources to give your agent specialized expertise. For example, upload your product catalog, past survey results, competitive analysis reports, or brand guidelines.

**Best practices:**
- Connect **1–3 focused datasets** rather than many loosely related ones
- Use **labels within datasets** to help the agent find relevant content
- Keep datasets **up to date** — outdated information leads to outdated answers

#### Knowledge and Rules

- **Knowledge** — Quick facts and context you want the agent to know (free text)
- **Rules** — Constraints the agent must follow, like "Never recommend competitor products" or "Always cite your sources when referencing data"

**Example rules for a consumer persona agent:**
1. Always respond as your persona — never break character
2. Only discuss topics within your defined areas of interest
3. If you don't know something, say so honestly
4. Keep responses conversational and under 300 words unless asked for more detail
5. Reference your personal experiences and preferences when answering

---

### Step 4: Identity

<img
  :src="'/screenshots/agents/08-builder-identity.png'"
  alt="Agent Builder - Identity"
  @error="$event.target.remove()"
/>

Give your agent a name and biography that bring it to life.

**What you'll set:**
- **Name** — The display name your team will see (e.g., "Maya Chen" or "Beauty Trends Analyst")
- **Biography** — A detailed description of who this agent is, their background, expertise, and personality

Click the **Generate** button (sparkle icon) to have AI suggest a name, biography, or both based on the facets you configured.

::: tip Writing a Compelling Biography
A great biography includes:

1. **Background** — Where did they come from? What shaped them?
2. **Expertise** — What do they know deeply?
3. **Perspective** — How do they see the world?
4. **Communication style** — How do they talk?
5. **Motivation** — What drives them?

**Example:**
> "Maya Chen is a consumer psychologist with 12 years of experience studying shopping behavior in beauty and personal care. She approaches research with genuine curiosity about the 'why' behind consumer choices and is known for translating complex insights into actionable recommendations. Her communication style is warm but analytical — she loves diving into behavioral details while keeping the bigger picture in mind. Maya is particularly passionate about helping brands build authentic connections with younger consumers."
:::

---

### Step 5: Appearance

<img
  :src="'/screenshots/agents/09-builder-appearance.png'"
  alt="Agent Builder - Appearance"
  @error="$event.target.remove()"
/>

Create the visual identity that represents your agent.

**What you'll set:**
- **Avatar** — The profile image for your agent
- **Physical Description** — A text description of your agent's appearance

**Avatar options:**
- **Upload an image** — Use your own photo or brand asset
- **AI Generate** — Create a unique avatar based on your physical description and facets
- **Choose a placeholder** — Select from default avatar options for quick setup

Click **Generate** to create an AI-generated avatar. The generator uses your physical description, configured facets, and overall persona to produce an appropriate image.

::: tip Avatar Best Practices
- Write specific physical descriptions: "Professional woman in her late 30s with shoulder-length dark hair, warm brown eyes, wearing a navy blazer" works much better than "a business person"
- Use a consistent visual style across related agents (e.g., all consumer personas for the same study)
- Test how the avatar looks at small sizes — it appears as a small thumbnail in many places
- Match the visual to the persona — a luxury shopper agent should look different from a budget-conscious student
:::

---

### Step 6: Review

<img
  :src="'/screenshots/agents/10-builder-review.png'"
  alt="Agent Builder - Review"
  @error="$event.target.remove()"
/>

The final step brings everything together so you can review your agent's complete configuration before going live.

**What you'll see:**
- A **credential card** summarizing all your agent's settings across every step
- A **benchmark chat** where you can test the agent with sample questions
- A **status indicator** showing whether the agent is ready to activate

**Testing your agent:**

Use the benchmark chat to send test questions and verify your agent works as expected. Try different types of questions to check:
- Does it stay in character?
- Does it reference your connected datasets?
- Does it follow your rules?
- How does it handle edge cases or off-topic questions?

**Saving and activating:**

| Button | What it does |
|--------|-------------|
| **Mint Agent** | Save a brand-new agent for the first time |
| **Save Changes** | Save updates to an existing agent |
| **Activate** | Publish the agent so your team can use it in conversations |
| **Deactivate** | Unpublish the agent (all settings are preserved for later) |

::: warning Before You Activate
Run through this quick checklist:
- [ ] Core mission clearly describes what the agent should do
- [ ] Facets match the persona or expertise you're going for
- [ ] Connected datasets contain relevant, current information
- [ ] Rules prevent behaviors you don't want
- [ ] Biography is consistent with the facets and feels authentic
- [ ] Avatar represents the intended persona
- [ ] Test conversations produce the kind of responses you expect
:::

---

## Managing Your Agents

### Editing an Existing Agent

1. Click an agent card to open the details drawer
2. Click **Edit Agent** to reopen the builder
3. Navigate to any step and make your changes
4. Click **Save Changes** to save your updates

The builder auto-saves your progress, so you can leave and come back without losing work.

### Activating and Deactivating

- **Activate** makes the agent available for conversations, campaigns, and workflows. A **green dot** appears on the agent card.
- **Deactivate** hides the agent from your team but preserves everything — configuration, conversation history, and connected datasets. A **gray dot** appears on the card. You can reactivate at any time.

### Sharing Agents

Click **Share** from the agent card menu to control who can access the agent:

- **Edit** permission — Allows modifying the agent's configuration
- **Delete** permission — Allows permanently removing the agent
- **Manage** permission — Allows sharing the agent and changing permissions

You can share with your entire workspace or with specific team members, each with different permission levels.

### Deleting Agents

Open the three-dot menu on an agent card and select **Delete Agent**. You'll be asked to confirm.

::: danger This Can't Be Undone
Deleting an agent permanently removes its configuration. Connected datasets are not affected. If you might want the agent again later, **deactivate it instead** — this hides it while preserving everything.
:::

---

## Real-World Use Cases

### Simulating a Consumer Focus Group

**The challenge:** You need quick feedback on new product concepts, but scheduling a live focus group takes weeks.

**The solution:**
1. Create 5–6 Consumer Persona agents representing your target demographics — for example, a Gen Z beauty enthusiast, a luxury-focused millennial, a price-conscious parent, and a skeptical product reviewer
2. Give each agent unique facets reflecting their age, income, lifestyle, and values
3. Connect your product concept documents as datasets
4. Ask each agent the same questions and compare their responses
5. Use the patterns you find to shape your real-world research plan

::: tip Include a Skeptic
Always include at least one agent configured to be skeptical or critical. This "devil's advocate" perspective often surfaces concerns your team might overlook.
:::

### Building a Research Assistant

**The challenge:** Your team spends hours manually reviewing open-ended survey responses to find themes.

**The solution:**
1. Create an Assistant agent specialized in qualitative analysis
2. Upload your survey response data as a dataset
3. In Optional Settings, add rules like "Always cite specific consumer quotes" and "Organize findings by theme"
4. Use the agent to identify patterns, summarize findings, and draft initial reports

### Testing Campaign Questions Before Launch

**The challenge:** You want to make sure your survey questions are clear and unbiased before sending them to real participants.

**The solution:**
1. Create diverse Consumer Persona agents that match your target audience
2. Run your draft questions by each agent
3. Follow up with: "What did you think this question was asking?" and "Was anything confusing?"
4. Revise questions based on the feedback before going live

### Multi-Perspective Brand Analysis

**The challenge:** You want to understand how different stakeholders perceive your brand.

**The solution:**
1. Create Assistant agents representing different viewpoints: a brand strategist, a consumer psychologist, a retail buyer, and a category analyst
2. Upload brand materials and market research as shared datasets
3. Ask each agent the same questions (e.g., "What are this brand's core strengths?" or "Where is the brand most vulnerable?")
4. Compare perspectives to build a comprehensive view

---

## Tips for Getting the Most from Your Agents

### Creating Effective Agents

- **Be specific with missions** — "CPG brand strategist with 15 years in beauty" produces much better results than "business expert"
- **Add rich context** — Include past roles, key experiences, and formative background details in biographies
- **Set clear boundaries** — Define what the agent should and shouldn't discuss using rules
- **Test thoroughly** — Use the benchmark chat to try at least 10 different questions before activating
- **Iterate over time** — Review conversation history and refine facets, rules, and knowledge based on what you learn

### Organizing Your Agent Library

- **Use descriptive names** — Include the role and specialty: "Beauty Trends Analyst" or "Gen Z Shopper - Urban"
- **Choose the right type** — This makes filtering much easier as your library grows
- **Deactivate rather than delete** — Keep inactive agents as backups or templates
- **Review quarterly** — Archive agents you haven't used and update datasets on active ones

### Working with Multiple Agents

- **Use `@agentname` mentions** in chat to bring multiple agents into a single conversation
- **Create complementary pairs** — An optimist and a skeptic, or a consumer and a business expert
- **Build agent teams** — Chain agents in workflows where one agent's output feeds into the next
- **Create a moderator** — Set up an Assistant agent whose job is to synthesize insights from other agents

---

## Troubleshooting

### Agent gives generic or off-topic responses
- **Check datasets** — Make sure the right datasets are connected and contain relevant content
- **Review the mission** — A vague mission leads to vague responses. Make it more specific.
- **Look for rule conflicts** — Rules that are too broad can prevent the agent from responding helpfully
- **Try a different model** — Some models handle certain tasks better than others

### Agent breaks character
- Add an explicit rule: "Always respond as [persona name] — never break character or acknowledge being AI"
- Reinforce the character in the biography's opening lines
- Use Claude as the AI model — it's particularly strong at maintaining personas
- Avoid questions that directly challenge the persona's existence

### Responses are too slow
- Reduce the number of connected datasets to 1–3 focused sources
- Switch to Gemini Flash for faster response times
- Disable tools the agent doesn't need
- Simplify lengthy rules or knowledge sections

### Agent doesn't reference connected datasets
- Verify the datasets are connected in the Optional Settings step
- Check that dataset files show a "Success" processing status
- Add a rule: "Always check your connected knowledge sources before answering"
- Use search terms in your questions that match the language in your datasets

---

## Frequently Asked Questions

::: details Click to expand FAQs

**How many agents can I create?**
There's no hard limit, but we recommend keeping 20–50 active agents for manageability. Deactivate agents you're not actively using.

**Can agents remember previous conversations?**
Each conversation is independent. Within a single chat session, the agent maintains full context. For persistent knowledge across sessions, connect that information as a dataset.

**What's the difference between knowledge and rules?**
**Knowledge** is information you want the agent to have (positive guidance). **Rules** are constraints it must follow (boundaries like "never do X").

**Can agents work together in a conversation?**
Yes — use `@agentname` to bring multiple agents into one chat. They'll respond in turn and can build on each other's answers.

**Can I test an agent without making it available to my team?**
Absolutely. Use the benchmark chat in the Review step, or save the agent as a Draft without activating it.

**How do I make an agent sound more natural?**
Write a detailed biography with personality details, set specific communication style facets, include example phrasing in your rules, and consider using Claude as the model (it tends to produce more natural-sounding responses).

**Can Visual Generator agents create images?**
Yes — make sure to enable the Image Generation tool in the Optional Settings step.

**What happens to my agents if I leave the workspace?**
Agents you created stay in the workspace. Transfer ownership to a teammate before leaving if you want them maintained.
:::

---

## Next Steps

- [Start conversations with your agents](/guide/home) — Put your agents to work in chat
- [Deploy agents in campaigns](/guide/campaigns) — Use agents in research surveys
- [Add agents to workflows](/guide/workflows) — Automate agent tasks in multi-step pipelines
- [Build knowledge with datasets](/guide/datasets) — Give your agents deeper expertise
