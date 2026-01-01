# Agents

The Agents section is where you create and manage AI personas. These agents represent different viewpoints, expertise areas, or roles for research, analysis, and content creation.

## Overview

![Agents Gallery](/screenshots/agents/01-agents-gallery.png)

The main Agents page displays all your AI personas in a grid layout, organized into collapsible sections by type.

::: tip What Are Agents?
Think of agents as specialized AI team members, each with their own personality, expertise, and knowledge. You can create a market research analyst, a consumer persona, a brand expert, or any other role you need for your research.
:::

## Agent Gallery

### Grid Layout

Agents are displayed as visual cards with:

- **Avatar Image** - Custom profile image or AI-generated appearance
- **Agent Name** - The persona's identifier
- **Agent Type** - Category label (e.g., "Research", "Analysis")
- **Status Indicator** - Green dot for published, gray for draft
- **Vurvey Badge** - Indicates official Vurvey-created agents

Hovering over a card reveals the agent's description and action menu.

### Filtering and Search

![Agents Search](/screenshots/agents/02-agents-search.png)

Use the filter bar at the top to find specific agents:

| Filter | Options | Purpose |
|--------|---------|---------|
| **Sort** | Newest, Oldest | Order agents by creation date |
| **Type** | Research, Analysis, etc. | Filter by agent category |
| **Model** | GPT, Gemini, Claude, etc. | Filter by underlying AI model |
| **Status** | Active, Inactive | Show published or draft agents |
| **Search** | Text input | Find agents by name |

::: tip Pro Tip: Quick Agent Access
Use the search bar with `Cmd+K` (Mac) or `Ctrl+K` (Windows) to quickly find and open any agent from anywhere in the app.
:::

## Agent Types

Agents are categorized by their primary function:

| Type | Best For | Example Use Cases |
|------|----------|-------------------|
| **Assistant** | General-purpose help, Q&A, broad research tasks | Research coordinator, project helper, brainstorming partner |
| **Consumer Persona** | Simulating consumer perspectives and feedback | "Sarah, 34, eco-conscious mom" for product testing |
| **Product** | Product-specific expertise and analysis | Product specialist, feature explainer, use case generator |
| **Visual Generator** | Creating visual content and imagery | Concept visualizer, mood board creator, design ideation |
| **Expert** | Domain-specific analysis requiring specialized knowledge | CPG industry analyst, UX researcher, brand strategist |
| **Analyst** | Data interpretation, insights generation, reporting | Survey data analyst, trend spotter, competitive intel |

### Choosing the Right Agent Type

::: details When to Use Each Type (Click to Expand)

**Use Assistant when:**
- You need flexible, general-purpose help
- The task spans multiple domains
- You want a conversational research partner
- You're brainstorming or exploring ideas

**Use Consumer Persona when:**
- Testing how a specific demographic might respond
- Simulating focus group feedback
- Getting "voice of customer" perspectives
- Validating messaging or concepts with target audiences

**Use Product when:**
- You need product-specific expertise
- Explaining features and capabilities
- Generating use cases and applications
- Answering product-related questions

**Use Visual Generator when:**
- Creating concept visualizations
- Generating imagery for presentations
- Building mood boards or design inspiration
- Visualizing abstract ideas

**Use Expert when:**
- You need domain-specific knowledge
- Analysis requires specialized terminology
- You want authoritative insights in a field
- The topic has professional standards or practices

**Use Analyst when:**
- Processing survey or research data
- Identifying patterns and trends
- Creating summaries and reports
- Synthesizing information from multiple sources
:::

## Agent Card Actions

Click the three-dot menu on any agent card to access actions:

| Action | Icon | Description |
|--------|------|-------------|
| **Start Conversation** | Sparkle | Open a chat with this agent |
| **Share** | Share | Manage who can access this agent |
| **Edit Agent** | Pencil | Open the agent builder to modify |
| **View Agent** | Eye | Read-only view (when you lack edit permission) |
| **Delete Agent** | Permanently remove the agent |

::: warning Permissions
Available actions depend on your permission level. You may see "View Agent" instead of "Edit Agent" if you don't have edit access.
:::

## Agent Details Drawer

![Agent Detail](/screenshots/agents/04-agent-detail.png)

Click any agent card to open the details drawer, which slides in from the right side of the screen.

### Drawer Contents

The drawer displays:

- **Profile Header** - Avatar, name, and type
- **Edit Button** - Quick access to the agent builder
- **Description** - Full biography and capabilities
- **Related Conversations** - Past chats with this agent
- **Chat Interface** - Test the agent with a live chat at the bottom

### Testing Agents

The drawer includes a chat bubble at the bottom where you can immediately test the agent's responses. This helps you verify the agent behaves as expected before using it in research or sharing with others.

::: tip Pro Tip: Test Before Sharing
Always test your agent with a few representative questions before sharing with your team. Check that it:
- Stays in character
- Provides accurate information from connected datasets
- Follows your defined rules and constraints
- Handles edge cases appropriately
:::

## Creating Agents

Click **+ Create Agent** in the top right to launch the Agent Builder.

### Agent Builder Flow

The builder guides you through six steps to create a complete agent:

| Step | Name | Purpose |
|------|------|---------|
| 1 | **Objective** | Choose agent type and define core mission |
| 2 | **Facets** | Select personality traits and characteristics |
| 3 | **Instructions** | Add knowledge, rules, and connected datasets |
| 4 | **Identity** | Set name, biography, and voice |
| 5 | **Appearance** | Upload or generate avatar and physical description |
| 6 | **Review** | Final review, testing, and activation |

### Step 1: Objective

Define what your agent will do:

- **Agent Type** - Select a category (Research, Analysis, etc.)
- **Agent Mold** - Choose a template to start from
- **Core Mission** - Describe the agent's primary purpose

::: tip Writing Effective Core Missions
A good core mission is specific, actionable, and bounded. Compare:

**Weak:** "Help with research"
**Strong:** "Analyze consumer survey responses about sustainable packaging, identify key themes, and provide actionable recommendations for the product team"

The strong version gives the agent clear context, scope, and expected outputs.
:::

### Step 2: Facets

Configure personality characteristics:

- Select traits from predefined options
- Define background and expertise areas
- Set behavioral tendencies

::: details Facet Configuration Examples (Click to Expand)

**For a Consumer Persona (Millennial Parent):**
- Age Range: 30-40
- Life Stage: Parent of young children
- Values: Convenience, sustainability, value for money
- Shopping Behavior: Research-heavy, influenced by reviews
- Communication Style: Casual, appreciates humor

**For an Industry Expert:**
- Experience Level: 15+ years in CPG
- Expertise Areas: Brand strategy, retail relationships
- Perspective: Strategic, data-driven
- Communication Style: Professional, uses industry terminology
- Biases: Favors proven methods over trendy approaches
:::

### Step 3: Instructions

Provide guidance and resources:

- **AI Model** - Choose the underlying LLM (Gemini, Claude, GPT)
- **Tools** - Enable specific capabilities
- **Datasets** - Connect knowledge sources
- **Knowledge** - Add custom information
- **Rules** - Define constraints and guidelines

#### Choosing the Right AI Model

| Model | Strengths | Best For |
|-------|-----------|----------|
| **Gemini 2.5 Flash** | Fast, efficient, good reasoning | General use, quick responses |
| **Gemini 2.5 Pro** | Deep reasoning, multimodal | Complex analysis, video/image understanding |
| **Claude Sonnet 4** | Nuanced, follows instructions well | Creative writing, detailed analysis |
| **GPT-4o** | Versatile, strong general knowledge | Broad research, varied tasks |

::: tip Pro Tip: Dataset Connection Strategy
Connect datasets strategically:
- **1-3 focused datasets** give better results than many loosely-related ones
- Use **labels** within datasets to help the agent find relevant content
- Consider creating **agent-specific datasets** for specialized knowledge
:::

### Step 4: Identity

Establish the agent's persona:

- **Name** - The agent's display name
- **Biography** - Detailed description of who they are
- **Voice** - Select text-to-speech voice (if applicable)
- Use the **Generate** button to have AI create name and biography

::: details Biography Writing Guide (Click to Expand)

A compelling biography includes:

1. **Background**: Where did this persona come from? What's their history?
2. **Expertise**: What specific knowledge or skills do they have?
3. **Perspective**: What unique viewpoint do they bring?
4. **Communication style**: How do they express themselves?
5. **Motivation**: What drives them? What do they care about?

**Example Biography:**

> "Dr. Maya Chen is a consumer psychologist with 12 years of experience studying shopping behavior in the beauty and personal care industry. She holds a PhD from Stanford and has published extensively on the psychology of brand loyalty among Gen Z consumers. Maya approaches research with intellectual curiosity and a genuine interest in understanding the 'why' behind consumer choices. She's known for translating complex psychological concepts into actionable business insights, often using relatable analogies and real-world examples. Maya is particularly passionate about ethical marketing practices and helping brands build authentic connections with their audiences."
:::

### Step 5: Appearance

Create the visual identity:

- **Avatar** - Upload an image or generate with AI
- **Physical Description** - Describe the agent's appearance
- Use the **Generate** button to create AI-generated images

::: tip Avatar Best Practices
- Use **consistent style** across related agents (e.g., all consumer personas from the same project)
- **Avoid stock photos** that might be recognizable
- For AI-generated images, provide **detailed descriptions** for better results
- Consider **accessibility** - ensure avatars work at small sizes
:::

### Step 6: Review

Finalize your agent:

- **Credential Card** - Summary of all settings
- **Benchmark** - Test the agent in a chat interface
- **Activate** - Publish the agent for use

::: warning Pre-Activation Checklist
Before activating, verify:
- [ ] Core mission clearly defines the agent's purpose
- [ ] Facets align with intended personality
- [ ] Connected datasets contain relevant, up-to-date information
- [ ] Rules prevent unwanted behaviors
- [ ] Biography is compelling and consistent with facets
- [ ] Avatar represents the intended persona
- [ ] Test conversations produce expected responses
:::

## Builder Navigation

The builder shows progress through all steps:

- **Checkmark** - Step is complete
- **Current indicator** - Step you're viewing
- **Locked** - Step requires completing previous steps

You can navigate between completed steps at any time. The builder auto-saves your progress.

::: tip Pro Tip: Keyboard Navigation
- `Tab` / `Shift+Tab` - Move between form fields
- `Enter` - Confirm selections in dropdowns
- `Escape` - Close modals and drawers
- Arrow keys - Navigate within multi-select options
:::

## Managing Agents

### Editing

1. Click an agent card to open the drawer
2. Click **Edit** to open the builder
3. Modify any settings across the six steps
4. Save your changes

::: tip Pro Tip: Version Your Agents
Before making significant changes, consider:
1. **Duplicate** the agent first
2. Make changes to the copy
3. Test the new version
4. Deactivate the old version once satisfied
This preserves your working configuration as a backup.
:::

### Activating/Deactivating

- **Activate** - Makes the agent available for use
- **Deactivate** - Hides the agent but preserves settings

The status indicator on agent cards shows:
- **Green dot** - Active (published)
- **Gray dot** - Inactive (draft)

### Sharing

Click **Share** to manage access permissions:

| Permission | Allows |
|------------|--------|
| **Edit** | Modify agent configuration |
| **Delete** | Remove the agent |
| **Manage** | Share agent and modify permissions |

### Deleting

1. Open the action menu on an agent card
2. Click **Delete Agent**
3. Confirm in the modal dialog

::: danger Permanent Action
Deleting an agent cannot be undone. Consider deactivating instead to preserve the configuration.
:::

## Real-World Use Cases

### Use Case 1: Consumer Focus Group Simulation

**Scenario:** You need quick feedback on new product concepts but can't schedule a focus group for weeks.

**Solution:**
1. Create 5-6 consumer persona agents representing your target demographics
2. Give each unique facets (age, income, lifestyle, values)
3. Connect product concept documents to their datasets
4. Run the same questions by each persona in parallel
5. Compare responses to identify patterns and divergent views

**Pro Tips:**
- Include one "skeptical" persona who challenges ideas
- Create personas based on actual customer research data
- Use the personas to generate discussion guides for real focus groups

### Use Case 2: Research Assistant for Literature Review

**Scenario:** Your team needs to stay current on industry trends and competitor moves.

**Solution:**
1. Create an Analyst-type agent specialized in your industry
2. Upload relevant research reports, articles, and competitive intel to datasets
3. Train the agent to identify trends, summarize findings, and flag important developments
4. Use the agent for weekly briefings or ad-hoc questions

**Pro Tips:**
- Set rules for the agent to cite sources in responses
- Create separate datasets for different information types (academic, trade press, competitive)
- Schedule regular dataset updates to keep knowledge current

### Use Case 3: Multi-Perspective Brand Analysis

**Scenario:** You want to understand how different stakeholders perceive a brand.

**Solution:**
1. Create Expert agents for different viewpoints:
   - Brand strategist
   - Consumer psychologist
   - Retail buyer
   - Category analyst
2. Upload brand materials and market research to shared datasets
3. Ask each agent the same questions about the brand
4. Synthesize perspectives for a 360-degree view

**Pro Tips:**
- Use the `@agent` mention feature to get multiple perspectives in one conversation
- Create a "moderator" agent to synthesize the others' views
- Document key insights in conversation summaries

### Use Case 4: Automated Survey Analysis

**Scenario:** You have thousands of open-ended survey responses to analyze.

**Solution:**
1. Create an Analyst agent specialized in qualitative coding
2. Upload survey responses as a dataset
3. Define coding categories in the agent's instructions
4. Use workflows to automate batch processing
5. Have the agent generate summary reports

**Pro Tips:**
- Start with a sample to validate the coding approach
- Include example responses in the agent's instructions
- Create follow-up agents for sentiment analysis and theme extraction

## Best Practices

### Creating Effective Agents

- **Be specific** - Define clear personality traits and expertise
- **Add context** - Include relevant background information
- **Set boundaries** - Define what the agent should and shouldn't discuss
- **Test thoroughly** - Use the benchmark feature before activating
- **Iterate** - Refine based on actual conversations

### Organizing Agents

- Use descriptive names that indicate purpose
- Choose appropriate types for easy filtering
- Archive unused agents by deactivating them
- Document unique instructions in the biography

### Agent Selection Tips

- Use specialized agents for domain-specific questions
- Try different agents to get varied perspectives
- Mention agents with `@` in chat to invoke specific personas

### Advanced Agent Techniques

::: details Click to Expand Advanced Techniques

**Chaining Agents:**
Use one agent's output as input for another:
1. Research agent gathers information
2. Analyst agent processes and identifies patterns
3. Writer agent creates the final deliverable

**Agent Teams:**
Create complementary agents that work together:
- Optimist + Skeptic for balanced analysis
- Specialist + Generalist for depth and breadth
- Consumer + Business for dual perspectives

**Dynamic Instructions:**
Update agent instructions based on:
- Current project phase
- Latest research findings
- Team feedback and learnings

**Agent Templates:**
Create a library of molds for:
- Quick persona creation
- Consistent agent quality
- Onboarding new team members
:::

## Troubleshooting

### Common Issues and Solutions

#### Agent Not Responding as Expected

**Symptoms:** Agent gives generic responses, doesn't use connected data, or goes off-topic.

**Solutions:**
1. **Check dataset connection** - Verify the dataset is properly linked and contains relevant content
2. **Review instructions** - Ensure rules are clear and not contradictory
3. **Test with simpler queries** - Start with basic questions to isolate the issue
4. **Adjust the core mission** - Make it more specific if needed
5. **Try a different AI model** - Some models handle certain tasks better

#### Agent Breaking Character

**Symptoms:** Agent speaks as "AI assistant" instead of the persona, or admits it's an AI.

**Solutions:**
1. Add explicit rules: "Always respond as [persona name], never break character"
2. Include character reinforcement in the biography
3. Avoid questions that directly challenge the persona
4. Use Claude models, which tend to stay in character better

#### Slow Response Times

**Symptoms:** Agent takes a long time to respond.

**Solutions:**
1. **Reduce connected datasets** - Fewer, more focused datasets are faster
2. **Use labels effectively** - Help the agent find relevant content quickly
3. **Switch to a faster model** - Gemini Flash is optimized for speed
4. **Simplify complex instructions** - Shorter instruction sets process faster

#### Permission Denied Errors

**Symptoms:** Actions fail with permission errors.

**Solutions:**
1. Check your workspace role
2. Ask the agent owner to share with appropriate permissions
3. Verify you're in the correct workspace
4. Contact your workspace administrator

### Getting Help

If you've tried these solutions and still have issues:

1. **Check the [Vurvey Community](https://community.vurvey.com)** for similar cases
2. **Document the issue** with screenshots and specific steps
3. **Contact support** via the Help menu with your workspace ID

## Frequently Asked Questions

::: details FAQs (Click to Expand)

**Q: How many agents can I create?**
A: There's no hard limit, but we recommend keeping active agents focused. Too many can make selection confusing. Deactivate agents you're not using.

**Q: Can I use the same agent across multiple workspaces?**
A: Currently, agents are workspace-specific. You can export and recreate them in other workspaces, or your admin can copy agents between workspaces.

**Q: What's the difference between Rules and Instructions?**
A: **Instructions** are guidance about how the agent should behave and what it knows. **Rules** are constraints that the agent must follow (e.g., "never discuss competitor products" or "always cite sources").

**Q: Can agents remember previous conversations?**
A: Each conversation is independent by default. However, agents can access conversation history within a single chat session. For persistent memory across sessions, connect relevant datasets.

**Q: How do I make an agent sound more human?**
A: Focus on the biography and facets. Add personal details, opinions, and quirks. Include examples of how they'd phrase things in the instructions. Use voice settings for text-to-speech scenarios.

**Q: Can I use custom AI models?**
A: The available models are curated for quality and reliability. Enterprise customers may have access to additional models. Contact sales for custom requirements.

**Q: What happens to my agents if I leave the workspace?**
A: Agents you created remain in the workspace. Transfer ownership to a teammate before leaving if you want them to maintain the agents.

**Q: Can agents access the internet?**
A: By default, agents work with connected datasets only. Some tool configurations may enable web search. Check the Tools section in Step 3 of the builder.
:::

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Open quick search |
| `Escape` | Close drawer/modal |
| `Tab` | Navigate between fields |
| `Enter` | Confirm selection |
| `Cmd/Ctrl + S` | Save current step (in builder) |
| `Cmd/Ctrl + Enter` | Send message (in chat) |

## Next Steps

- [Use agents in chat](/guide/home) - Start conversations with your agents
- [Connect agents to campaigns](/guide/campaigns) - Deploy agents in research surveys
- [Add agents to workflows](/guide/workflows) - Automate agent tasks
- [Upload knowledge to datasets](/guide/datasets) - Give agents more context
