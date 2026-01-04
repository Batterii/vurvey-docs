# Agents

The Agents section is where you create and manage AI personas. These agents represent different viewpoints, expertise areas, or roles for research, analysis, and content creation. Think of them as specialized AI team members, each with their own personality, expertise, knowledge, and communication style.

## Overview

![Agents Gallery](/screenshots/agents/01-agents-gallery.png)

The main Agents page displays all your AI personas in a visual grid layout, organized into collapsible sections by type. Each agent is represented as an interactive card that reveals more information on hover.

::: tip What Are Agents?
Agents are AI-powered personas that can:
- **Conduct research** by analyzing your datasets and providing insights
- **Simulate perspectives** as consumer personas, industry experts, or stakeholders
- **Generate content** including reports, summaries, and creative assets
- **Participate in workflows** as automated team members
- **Answer questions** based on their configured knowledge and personality
:::

## Agent Gallery

### Grid Layout

Agents are displayed as visual 1:1 aspect ratio cards with a maximum width of 260px, organized in a responsive grid that adjusts to your screen size.

**Card Elements (Always Visible):**
- **Avatar Image** - Background image showing the agent's appearance
- **Agent Name** - Displayed prominently in white text
- **Agent Type** - Category label in purple (e.g., "Research", "Analysis")
- **Vurvey Badge** - Sparkle icon indicates official Vurvey-created agents

**Card Elements (Visible on Hover):**
- **Status Indicator** - Green dot for published (active), gray for draft
- **Full Description** - Expanded biography/description text
- **Action Menu** - Three-dot menu with available actions

### Section Organization

Agents are grouped into collapsible sections by type:

| Section | Description |
|---------|-------------|
| **Trending** | Popular agents across the workspace (marked with 🔥) |
| **Assistant** | General-purpose helpers |
| **Consumer Persona** | Simulated consumer perspectives |
| **Product** | Product-specific expertise |
| **Visual Generator** | Image and visual content creators |

**Section Controls:**
- **Show all** - Expand to see all agents in the section
- **Show less** - Collapse to show fewer agents

### Filtering and Search

![Agents Search](/screenshots/agents/02-agents-search.png)

Use the filter bar at the top to find specific agents:

| Filter | Type | Options | Purpose |
|--------|------|---------|---------|
| **Sort** | Dropdown | Newest, Oldest | Order agents by creation date |
| **Type** | Multi-select | Assistant, Consumer Persona, Product, Visual Generator | Filter by agent category |
| **Model** | Multi-select | GPT, Gemini, Claude, Stable Diffusion, Imagen, DALL-E | Filter by underlying AI model |
| **Status** | Dropdown | Active, Inactive | Show published or draft agents |
| **Search** | Text input | Free text (500ms debounce) | Find agents by name |

::: tip Pro Tip: Quick Agent Access
The search bar filters agents as you type with a 500ms debounce for smooth performance. Use descriptive agent names to make searching easier.
:::

## Agent Types

Agents are categorized by their primary function. Choosing the right type helps organize your agents and sets appropriate defaults in the builder.

| Type | Icon | Best For | Example Use Cases |
|------|------|----------|-------------------|
| **Assistant** | Chat | General-purpose help, Q&A, broad research tasks | Research coordinator, project helper, brainstorming partner, data analyst, industry expert |
| **Consumer Persona** | User | Simulating consumer perspectives and feedback | "Sarah, 34, eco-conscious mom" for product testing |
| **Product** | Box | Product-specific expertise and analysis | Product specialist, feature explainer, use case generator |
| **Visual Generator** | Image | Creating visual content and imagery | Concept visualizer, mood board creator, design ideation |

### Choosing the Right Agent Type

::: details When to Use Each Type (Click to Expand)

**Use Assistant when:**
- You need flexible, general-purpose help
- The task spans multiple domains
- You want a conversational research partner
- You're brainstorming or exploring ideas
- You need a moderator for multi-agent conversations
- Processing survey or research data
- Identifying patterns and trends in datasets
- You need domain-specific knowledge or expertise
- Creating summaries and reports

**Use Consumer Persona when:**
- Testing how a specific demographic might respond
- Simulating focus group feedback
- Getting "voice of customer" perspectives
- Validating messaging or concepts with target audiences
- Creating representative samples for campaign testing

**Use Product when:**
- You need product-specific expertise
- Explaining features and capabilities
- Generating use cases and applications
- Answering product-related questions
- Training team members on product details

**Use Visual Generator when:**
- Creating concept visualizations
- Generating imagery for presentations
- Building mood boards or design inspiration
- Visualizing abstract ideas
- Producing marketing creative concepts
:::

## Agent Card Actions

Click the three-dot menu on any agent card to access actions:

| Action | Icon | Description | Permission Required |
|--------|------|-------------|---------------------|
| **Start Conversation** | Sparkle Stars | Open a chat with this agent | None (if active) |
| **Share** | Share | Manage who can access this agent | MANAGE |
| **Edit Agent** | Pencil | Open the agent builder to modify | EDIT |
| **View Agent** | Eye | Read-only view (shown when lacking edit permission) | None |
| **Delete Agent** | Trash (red) | Permanently remove the agent | DELETE |

::: warning Permission-Based Actions
Available actions depend on your permission level:
- **No permissions**: Only "Start Conversation" and "View Agent" appear
- **EDIT permission**: "Edit Agent" replaces "View Agent"
- **MANAGE permission**: "Share" option becomes available
- **DELETE permission**: "Delete Agent" option becomes available

Contact the agent owner or workspace admin to request additional permissions.
:::

## Agent Details Drawer

![Agent Detail](/screenshots/agents/04-agent-detail.png)

Click any agent card to open the details drawer, which slides in from the right side of the screen with a smooth animation.

### Drawer Layout

**Header Section:**
- **Avatar** - Large display of the agent's image
- **Agent Name** - Display-sized title
- **Agent Type** - Subheader showing category
- **Edit Button** - Quick access to builder (if you have EDIT permission)

**Content Section:**
- **Description** - Full biography and capabilities (Markdown-rendered)
- **Related Conversations** - List of past chats with this agent

**Footer Section:**
- **Chat Interface** - Live chat bubble to test the agent immediately

### Testing Agents in the Drawer

The drawer includes a chat interface at the bottom where you can immediately test the agent's responses. This streaming chat supports:

- Real-time response streaming
- Full conversation history within the session
- Access to all agent capabilities and connected datasets
- Immediate feedback on agent behavior

::: tip Pro Tip: Test Before Sharing
Always test your agent with representative questions before sharing:
1. **Stay in character** - Does it maintain the persona?
2. **Use connected data** - Does it reference your datasets?
3. **Follow rules** - Does it respect your constraints?
4. **Handle edge cases** - What happens with unusual requests?
5. **Maintain consistency** - Are responses reliable?
:::

### Closing the Drawer

- Click the **X** button in the drawer header
- Click the **overlay** (dark area) outside the drawer
- Press **Escape** key

---

## Creating Agents

Click **+ Create Agent** in the top right corner to launch the Agent Builder.

### Agent Builder Overview

The builder guides you through six sequential steps to create a complete, well-configured agent:

| Step | Name | Icon | Purpose | Key Fields |
|------|------|------|---------|------------|
| 1 | **Objective** | Flag | Define agent type and mission | Type, Mold, Core Mission |
| 2 | **Facets** | Interests | Configure personality traits | Trait selectors, Background |
| 3 | **Instructions** | Tune | Add knowledge and rules | Model, Tools, Datasets, Knowledge, Rules |
| 4 | **Identity** | Badge | Set name and biography | Name, Biography, Voice |
| 5 | **Appearance** | Face | Create visual identity | Avatar, Physical Description |
| 6 | **Review** | Checklist | Final review and activation | Summary, Benchmark, Activate |

### Builder Navigation

The builder displays a progress stepper showing your journey through all six steps:

**Step States:**
- **Locked** - Cannot access until previous steps complete
- **Pending** - Unlocked but not started
- **Active** - Currently viewing this step
- **Complete** - Green checkmark, passed validation
- **Error** - Red indicator, needs attention

**Navigation Controls:**
- **Back Arrow** - Return to agents list
- **Step Connectors** - Visual lines showing flow
- **Direct Navigation** - Click any unlocked step to jump to it

**Top Bar Actions:**
- **Preview** - Toggle agent preview panel
- **Share** - Manage permissions (if MANAGE access)
- **Save** - Persist current changes
- **Activate/Deactivate** - Toggle agent status

---

### Step 1: Objective

![Agent Builder Objective](/screenshots/agents/05-builder-objective.png)

Define what your agent will do and establish its foundation.

**Fields:**

| Field | Description | Required |
|-------|-------------|----------|
| **Agent Type** | Select category (Research, Analysis, Consumer Persona, etc.) | Yes |
| **Agent Mold** | Choose a template to start from (provides default facets and instructions) | No |
| **Core Mission** | Free-text description of the agent's primary purpose | Yes |

**Agent Mold Benefits:**
- Pre-configured facets for common personas
- Default instruction sets
- Consistent quality across similar agents
- Faster creation for standard use cases

::: tip Writing Effective Core Missions
A good core mission is specific, actionable, and bounded. Compare:

**Weak:** "Help with research"

**Strong:** "Analyze consumer survey responses about sustainable packaging, identify key themes across demographic segments, and provide actionable recommendations for the product team, including specific quotes that support each finding."

The strong version gives the agent:
- Clear **context** (sustainable packaging surveys)
- Specific **scope** (theme identification, demographic analysis)
- Expected **outputs** (recommendations with supporting quotes)
:::

---

### Step 2: Facets

![Agent Builder Facets](/screenshots/agents/06-builder-facets.png)

Configure the personality characteristics that define how the agent thinks, communicates, and behaves.

**Facet Types:**

| Facet Category | Examples | Purpose |
|----------------|----------|---------|
| **Demographics** | Age, Gender, Location, Income | Define who the persona is |
| **Lifestyle** | Family status, Hobbies, Values | Shape perspective and priorities |
| **Professional** | Industry, Role, Experience level | Establish expertise credibility |
| **Communication** | Tone, Formality, Verbosity | Control response style |
| **Behavioral** | Risk tolerance, Decision style, Skepticism | Influence reasoning patterns |

**Selection Methods:**
- **Checkboxes** - Select multiple traits
- **Dropdowns** - Choose one option from a list
- **Sliders** - Set values on a spectrum
- **Free text** - Custom characteristic descriptions

::: details Facet Configuration Examples (Click to Expand)

**For a Consumer Persona (Millennial Parent):**
```
Demographics:
- Age Range: 30-40
- Location: Suburban United States
- Income: $75,000-$125,000
- Education: College graduate

Lifestyle:
- Life Stage: Parent of young children (ages 2-8)
- Values: Convenience, sustainability, value for money
- Priorities: Family health, time savings, budget management

Shopping Behavior:
- Research-heavy, influenced by reviews
- Price-conscious but willing to pay for quality
- Prefers online shopping with easy returns
- Brand loyal when trust is established

Communication Style:
- Casual, appreciates humor
- Wants practical information quickly
- Values authenticity over polish
```

**For an Industry Assistant (Expert Role):**
```
Professional Background:
- Experience Level: 15+ years in CPG
- Current Role: VP of Marketing
- Past Roles: Brand Manager, Category Lead

Expertise Areas:
- Brand strategy and positioning
- Retail relationships and trade marketing
- Consumer insights interpretation
- New product launch planning

Perspective:
- Strategic, data-driven decision maker
- Focused on long-term brand equity
- Skeptical of trends without proven ROI
- Values cross-functional collaboration

Communication Style:
- Professional, uses industry terminology
- Provides structured, actionable recommendations
- Backs opinions with data and examples
- Direct but diplomatic
```
:::

---

### Step 3: Instructions (Optional Settings)

![Agent Builder Instructions](/screenshots/agents/07-builder-instructions.png)

Provide guidance, knowledge, and resources that shape how the agent operates.

**Configuration Fields:**

| Field | Description | Purpose |
|-------|-------------|---------|
| **AI Model** | Select the underlying LLM (Gemini, Claude, GPT) | Controls capabilities and behavior |
| **Tools** | Enable specific capabilities (web search, calculations, etc.) | Extends what agent can do |
| **Datasets** | Connect knowledge sources | Provides domain expertise |
| **Knowledge** | Add custom information text | Quick facts and context |
| **Rules** | Define constraints and guidelines | Prevents unwanted behaviors |

#### Choosing the Right AI Model

| Model | Strengths | Best For | Speed |
|-------|-----------|----------|-------|
| **Gemini 2.5 Flash** | Fast, efficient, good reasoning | General use, quick responses | Fastest |
| **Gemini 2.5 Pro** | Deep reasoning, multimodal (video/image) | Complex analysis, multimedia understanding | Medium |
| **Claude Sonnet 4** | Nuanced, follows instructions precisely | Creative writing, detailed analysis, staying in character | Medium |
| **GPT-4o** | Versatile, strong general knowledge | Broad research, varied tasks | Medium |

::: tip Pro Tip: Model Selection Strategy
- **Start with Gemini Flash** for most use cases - it's fast and capable
- **Use Claude** when personality consistency matters (stays in character better)
- **Use Gemini Pro** when analyzing images or videos
- **Use GPT-4o** for general knowledge tasks
:::

#### Available Tools

| Tool | Icon | Description | When to Enable |
|------|------|-------------|----------------|
| **Smart Prompt** | Brain | Enhanced reasoning capabilities | Always (recommended) |
| **Web Search** | Globe | Access current web information | For up-to-date information needs |
| **Image Generation** | Image | Create visual content | For Visual Generator agents |
| **Code Execution** | Code | Run calculations and scripts | For data analysis tasks |
| **Document Analysis** | Document | Process uploaded files | For research tasks |

#### Dataset Connection

Connect datasets to give your agent specialized knowledge:

**Best Practices:**
- **1-3 focused datasets** give better results than many loosely-related ones
- Use **labels within datasets** to help the agent find relevant content
- Create **agent-specific datasets** for specialized knowledge
- Keep datasets **current** - outdated information reduces quality

::: tip Pro Tip: Dataset Strategy
```
Good Dataset Organization:
├── Product Knowledge
│   ├── Product specs and features
│   ├── Competitive comparisons
│   └── Customer FAQs
├── Market Research
│   ├── Survey results (labeled by study)
│   ├── Focus group transcripts
│   └── Industry reports
└── Brand Guidelines
    ├── Voice and tone guide
    ├── Messaging framework
    └── Visual identity standards
```
:::

#### Writing Effective Rules

Rules are constraints the agent must follow. They're different from instructions (how to do things) - rules are boundaries (what not to do).

**Rule Types:**

| Rule Type | Example | Purpose |
|-----------|---------|---------|
| **Scope limits** | "Only discuss topics related to our product line" | Prevent off-topic responses |
| **Behavior constraints** | "Never recommend competitor products" | Protect business interests |
| **Format requirements** | "Always cite sources when making claims" | Ensure quality outputs |
| **Character maintenance** | "Never break character or acknowledge being AI" | Maintain persona integrity |
| **Safety guardrails** | "Do not provide medical, legal, or financial advice" | Limit liability |

**Example Rules Set:**
```
1. Stay in character as [persona name] at all times
2. Only discuss topics within your defined expertise areas
3. Always cite sources when referencing specific data points
4. If you don't know something, say so rather than making up information
5. Keep responses focused and under 500 words unless asked for more detail
6. Do not discuss competitor products unless specifically asked to compare
7. Refer pricing questions to the sales team
```

---

### Step 4: Identity

![Agent Builder Identity](/screenshots/agents/08-builder-identity.png)

Establish the agent's persona identity - how it presents itself to users.

**Fields:**

| Field | Description | Character Limit |
|-------|-------------|-----------------|
| **Name** | The agent's display name | 100 characters |
| **Biography** | Detailed description of who they are | 2000 characters |
| **Voice** | Text-to-speech voice selection (if applicable) | Select from list |

**AI Generation:**
Click the **Generate** button (sparkle icon) to have AI create:
- Suggested names based on facets
- Complete biography text
- Both name and biography together

::: details Biography Writing Guide (Click to Expand)

A compelling biography includes five key elements:

**1. Background (Who are they?)**
- Origin and history
- Formative experiences
- Current situation

**2. Expertise (What do they know?)**
- Specific skills and knowledge
- Professional credentials
- Unique capabilities

**3. Perspective (How do they see the world?)**
- Values and beliefs
- Approach to problems
- Unique viewpoint

**4. Communication Style (How do they express themselves?)**
- Tone and formality
- Favorite phrases or patterns
- Level of detail

**5. Motivation (What drives them?)**
- Goals and interests
- What they care about
- How they want to help

**Example Biography:**

> "Dr. Maya Chen is a consumer psychologist with 12 years of experience studying shopping behavior in the beauty and personal care industry. She holds a PhD from Stanford and has published extensively on the psychology of brand loyalty among Gen Z consumers.
>
> Maya approaches research with intellectual curiosity and a genuine interest in understanding the 'why' behind consumer choices. She's known for translating complex psychological concepts into actionable business insights, often using relatable analogies and real-world examples.
>
> Her communication style is warm but analytical - she loves diving into the details of consumer behavior while keeping the bigger picture in mind. Maya is particularly passionate about ethical marketing practices and helping brands build authentic connections with their audiences.
>
> When not analyzing data, Maya mentors young researchers and speaks at industry conferences about the intersection of psychology and marketing. She's always eager to explore new research questions and challenge conventional wisdom about consumer behavior."
:::

---

### Step 5: Appearance

![Agent Builder Appearance](/screenshots/agents/09-builder-appearance.png)

Create the visual identity that represents your agent.

**Fields:**

| Field | Description | Options |
|-------|-------------|---------|
| **Avatar** | Profile image for the agent | Upload image, AI generate, or choose placeholder |
| **Physical Description** | Text describing the agent's appearance | Free-text, up to 500 characters |

**Avatar Options:**

| Method | Description | Best For |
|--------|-------------|----------|
| **Upload Image** | Use your own image file | Real photos, existing brand assets |
| **AI Generate** | Create image from description | Unique personas, consistent style |
| **Choose Placeholder** | Select from default avatars | Quick setup, placeholder agents |

**AI Generation:**
Click the **Generate** button to create an avatar based on:
- The physical description you've written
- The facets configured in Step 2
- The overall agent persona

::: tip Avatar Best Practices
- **Consistent style** - Use similar aesthetics across related agents
- **Avoid stock photos** - Recognizable images break immersion
- **Consider context** - Professional agents need professional images
- **Test at small sizes** - Avatars appear small in many places
- **Include diversity** - Vary demographics across your agent library
- **Match the persona** - Visual should reinforce the character
:::

**Physical Description Tips:**

Write descriptions that help AI generate appropriate images:

```
Good: "Professional woman in her late 30s with shoulder-length dark hair,
warm brown eyes, and a confident smile. Wearing a navy blazer over a
white blouse. Background suggests a modern office environment."

Better than: "A person in business clothes"
```

---

### Step 6: Review

![Agent Builder Review](/screenshots/agents/10-builder-review.png)

Final review of all settings before activation.

**Review Components:**

| Component | Description | Actions |
|-----------|-------------|---------|
| **Credential Card** | Summary of all agent settings | Review all configurations |
| **Benchmark Chat** | Test interface for the agent | Send test messages |
| **Status Indicator** | Shows activation readiness | Identifies any issues |

**Benchmark Testing:**

The Benchmark feature opens a chat interface where you can:
- Test various question types
- Verify persona consistency
- Check dataset integration
- Validate rule compliance
- Assess response quality

::: warning Pre-Activation Checklist
Before clicking Activate, verify:
- [ ] Core mission clearly defines the agent's purpose
- [ ] Facets align with intended personality
- [ ] Connected datasets contain relevant, up-to-date information
- [ ] Rules prevent unwanted behaviors
- [ ] Biography is compelling and consistent with facets
- [ ] Avatar represents the intended persona
- [ ] Test conversations produce expected responses
- [ ] Edge cases are handled appropriately
:::

**Activation:**

| Button | Action | Result |
|--------|--------|--------|
| **Save** | Persist current configuration | Agent saved as draft |
| **Activate** | Publish the agent | Agent becomes available for use |
| **Deactivate** | Unpublish the agent | Agent hidden but preserved |

---

## Managing Agents

### Editing Existing Agents

1. Click an agent card to open the drawer
2. Click **Edit** to open the builder
3. Navigate to any step and modify settings
4. Click **Save** to persist changes

**Auto-Save:**
The builder auto-saves your progress as you work. You can leave and return without losing changes.

::: tip Pro Tip: Version Your Agents
Before making significant changes:
1. **Duplicate** the agent first (from card menu)
2. Make changes to the copy
3. Test the new version thoroughly
4. Deactivate the old version once satisfied
5. This preserves your working configuration as a backup
:::

### Activating and Deactivating

**Activate:** Makes the agent available for:
- Conversations in the chat interface
- Campaign targeting and responses
- Workflow automation
- Team member access

**Deactivate:** Hides the agent but:
- Preserves all configuration
- Keeps conversation history
- Allows future reactivation
- Doesn't delete any data

**Status Indicators:**
- **Green dot** - Active (published)
- **Gray dot** - Inactive (draft)

### Sharing Agents

Click **Share** to manage access permissions:

| Permission | Icon | Allows | Use Case |
|------------|------|--------|----------|
| **Edit** | Pencil | Modify agent configuration | Team collaboration |
| **Delete** | Trash | Remove the agent | Full control |
| **Manage** | Settings | Share agent and modify permissions | Agent ownership |

**Sharing Options:**
- **Workspace-wide** - Everyone in workspace has access
- **Individual users** - Specific people get access
- **Permission levels** - Different access for different users

### Duplicating Agents

From the agent card menu:
1. Click **Duplicate** (or Copy)
2. A new agent is created with "(Copy)" suffix
3. Edit the copy as needed
4. Activate when ready

**Use Cases for Duplication:**
- Creating variations of a persona
- Testing changes without affecting production
- Creating templates for quick agent creation
- Backing up before major changes

### Deleting Agents

1. Open the action menu on an agent card
2. Click **Delete Agent**
3. Confirm in the modal dialog

::: danger Permanent Action
Deleting an agent:
- Cannot be undone
- Removes all configuration
- May affect conversation history referencing this agent
- Does NOT delete connected datasets

**Consider deactivating instead** to preserve the configuration for future use.
:::

---

## Permissions System

Agents use a fine-grained permission system to control access.

### Permission Levels

| Permission | What It Allows |
|------------|----------------|
| **None** | View agent card, start conversations (if active) |
| **EDIT** | Modify all agent settings in the builder |
| **DELETE** | Permanently remove the agent |
| **MANAGE** | Share agent and control who has access |

### How Permissions Work

- **Owners** have all permissions by default
- **Shared users** get permissions you assign
- **Workspace members** may have default access based on workspace settings
- Permissions can be **combined** (e.g., EDIT + DELETE but not MANAGE)

### Requesting Permissions

If you need additional access to an agent:
1. Contact the agent owner directly
2. Ask your workspace administrator
3. Request through your team's established process

---

## Real-World Use Cases

### Use Case 1: Consumer Focus Group Simulation

**Scenario:** You need quick feedback on new product concepts but can't schedule a focus group for weeks.

**Solution:**
1. Create 5-6 consumer persona agents representing your target demographics
2. Give each unique facets (age, income, lifestyle, values)
3. Connect product concept documents to their datasets
4. Run the same questions by each persona in parallel
5. Compare responses to identify patterns and divergent views

**Agent Configuration:**

| Persona | Age | Income | Lifestyle | Values |
|---------|-----|--------|-----------|--------|
| Budget Mom | 32 | $45K | Suburban, 2 kids | Value, convenience |
| Urban Professional | 28 | $95K | City apartment | Quality, sustainability |
| Empty Nester | 58 | $120K | Downsized home | Health, simplicity |
| Student | 22 | $15K | Shared housing | Price, trends |
| Skeptic | 45 | $75K | Research-heavy | Proof, transparency |

**Pro Tips:**
- Include one "skeptical" persona who challenges ideas
- Create personas based on actual customer research data
- Use the personas to generate discussion guides for real focus groups
- Compare AI feedback against real research to calibrate accuracy

### Use Case 2: Research Assistant for Literature Review

**Scenario:** Your team needs to stay current on industry trends and competitor moves.

**Solution:**
1. Create an Assistant-type agent specialized in your industry
2. Upload relevant research reports, articles, and competitive intel to datasets
3. Configure the agent to identify trends, summarize findings, and flag important developments
4. Use the agent for weekly briefings or ad-hoc questions

**Dataset Organization:**
```
Industry Intelligence Dataset
├── Academic Research/
│   ├── Journal articles (labeled by topic)
│   └── Conference papers
├── Trade Publications/
│   ├── Industry magazines
│   └── Newsletter archives
├── Competitive Intelligence/
│   ├── Competitor press releases
│   ├── Product announcements
│   └── Earnings call transcripts
└── Internal Research/
    ├── Past study summaries
    └── Strategic planning docs
```

**Pro Tips:**
- Set rules for the agent to cite sources in responses
- Create separate datasets for different information types
- Schedule regular dataset updates to keep knowledge current
- Create a weekly briefing template the agent can populate

### Use Case 3: Multi-Perspective Brand Analysis

**Scenario:** You want to understand how different stakeholders perceive a brand.

**Solution:**
1. Create Assistant agents for different viewpoints:
   - Brand strategist
   - Consumer psychologist
   - Retail buyer
   - Category analyst
   - Financial analyst
2. Upload brand materials and market research to shared datasets
3. Ask each agent the same questions about the brand
4. Synthesize perspectives for a 360-degree view

**Sample Questions for All Perspectives:**
- "What are the brand's core strengths?"
- "Where is the brand vulnerable?"
- "How should the brand evolve over the next 3 years?"
- "What would make you more confident in this brand?"

**Pro Tips:**
- Use the `@agent` mention feature to get multiple perspectives in one conversation
- Create a "moderator" agent to synthesize the others' views
- Document key insights in conversation summaries
- Run this analysis quarterly to track perception changes

### Use Case 4: Automated Survey Analysis

**Scenario:** You have thousands of open-ended survey responses to analyze.

**Solution:**
1. Create an Assistant agent specialized in qualitative coding
2. Upload survey responses as a dataset
3. Define coding categories in the agent's instructions
4. Use workflows to automate batch processing
5. Have the agent generate summary reports

**Agent Instructions:**
```
You are a qualitative research analyst specializing in survey analysis.

CODING FRAMEWORK:
1. Identify the primary theme of each response
2. Note sentiment (positive/neutral/negative)
3. Flag any specific product mentions
4. Identify actionable suggestions
5. Rate response quality (high/medium/low)

OUTPUT FORMAT:
- Theme: [primary theme]
- Sentiment: [pos/neu/neg]
- Products: [if any]
- Suggestions: [if any]
- Quality: [high/med/low]
- Key Quote: "[relevant excerpt]"
```

**Pro Tips:**
- Start with a sample of 50-100 responses to validate the coding approach
- Include example responses in the agent's instructions
- Create follow-up agents for sentiment analysis and theme extraction
- Export coded data for quantitative analysis

### Use Case 5: Campaign Question Testing

**Scenario:** You want to validate survey questions before launching to real participants.

**Solution:**
1. Create diverse consumer persona agents matching your target audience
2. Configure with realistic demographics and behaviors
3. Run your draft survey questions by each persona
4. Analyze responses for:
   - Question clarity
   - Response variation
   - Missing options
   - Bias detection

**Testing Protocol:**
1. Ask each question as written
2. Ask "What did you think this question was asking?"
3. Ask "Was anything confusing about this question?"
4. Ask "Did any answer options not fit your situation?"

---

## Best Practices

### Creating Effective Agents

| Practice | Description | Example |
|----------|-------------|---------|
| **Be specific** | Define clear personality traits and expertise | "CPG brand strategist with 15 years experience" vs. "business expert" |
| **Add context** | Include relevant background information | Past roles, key experiences, formative events |
| **Set boundaries** | Define what the agent should and shouldn't discuss | "Only discuss beauty and personal care products" |
| **Test thoroughly** | Use the benchmark feature before activating | Test with 10+ representative questions |
| **Iterate** | Refine based on actual conversations | Review conversation history weekly |

### Organizing Your Agent Library

| Strategy | Implementation |
|----------|----------------|
| **Descriptive names** | Include role and specialty: "CPG Assistant - Beauty Sector" |
| **Consistent types** | Use appropriate types for filtering |
| **Archive unused** | Deactivate rather than delete |
| **Document purpose** | Include use cases in biography |
| **Regular review** | Quarterly cleanup of inactive agents |

### Agent Selection Tips

| Scenario | Agent Choice |
|----------|--------------|
| Domain-specific questions | Specialized Assistant agent with expertise |
| Multiple perspectives | Use `@` mention to invoke several agents |
| Consumer feedback | Consumer Persona matching target demo |
| Visual content | Visual Generator agent |
| Data analysis | Assistant agent with relevant datasets |

### Advanced Agent Techniques

::: details Click to Expand Advanced Techniques

**Chaining Agents:**
Use one agent's output as input for another in a workflow:
1. Research Assistant agent gathers and summarizes information
2. Data Assistant agent processes and identifies patterns
3. Writer Assistant agent creates the final deliverable

**Agent Teams:**
Create complementary agents that work together:
- **Optimist + Skeptic** for balanced analysis
- **Specialist + Generalist** for depth and breadth
- **Consumer + Business** for dual perspectives
- **Junior + Senior** for different experience levels

**Dynamic Instructions:**
Update agent instructions based on:
- Current project phase
- Latest research findings
- Team feedback and learnings
- Seasonal or temporal factors

**Agent Templates (Molds):**
Create a library of molds for:
- Quick persona creation from proven patterns
- Consistent agent quality across the team
- Onboarding new team members
- Standardized research methodologies

**Multi-Agent Conversations:**
Use multiple agents in a single chat:
- Mention agents with `@agentname`
- Let them debate or discuss topics
- Get synthesized perspectives
- Create "panel discussions"
:::

---

## Troubleshooting

### Agent Not Responding as Expected

**Symptoms:** Agent gives generic responses, doesn't use connected data, or goes off-topic.

**Solutions:**

| Check | Action |
|-------|--------|
| **Dataset connection** | Verify datasets are linked and contain relevant content |
| **Instructions clarity** | Review for contradictions or vague guidance |
| **Rule conflicts** | Ensure rules don't prevent desired behaviors |
| **Model selection** | Try a different AI model |
| **Knowledge gaps** | Add custom knowledge text for specific information |

### Agent Breaking Character

**Symptoms:** Agent speaks as "AI assistant" instead of the persona, or acknowledges being AI.

**Solutions:**
1. Add explicit rule: "Always respond as [persona name], never break character"
2. Reinforce character in biography opening
3. Avoid questions that directly challenge the persona
4. Use Claude models (better at staying in character)
5. Include "I am [name], and..." phrases in instructions

### Slow Response Times

**Symptoms:** Agent takes a long time to respond.

**Solutions:**

| Cause | Fix |
|-------|-----|
| **Too many datasets** | Reduce to 1-3 focused datasets |
| **Large datasets** | Use labels to help agent find content |
| **Complex model** | Switch to Gemini Flash for speed |
| **Long instructions** | Simplify and prioritize rules |
| **Tool overload** | Disable unused tools |

### Permission Denied Errors

**Symptoms:** Actions fail with permission errors.

**Solutions:**
1. Check your workspace role
2. Request permissions from agent owner
3. Verify correct workspace selection
4. Contact workspace administrator
5. Check if agent has been shared with you

### Agent Not Using Datasets

**Symptoms:** Agent doesn't reference information you know is in connected datasets.

**Solutions:**
1. **Verify connection** - Check Step 3 in builder
2. **Check processing** - Ensure dataset files are "Success" status
3. **Improve labeling** - Add labels to help agent find content
4. **Explicit instruction** - Add "Always check connected datasets first"
5. **Rephrase questions** - Use terms that appear in your datasets

### Avatar Generation Failures

**Symptoms:** AI-generated avatars don't match description or fail to generate.

**Solutions:**
1. **Be more specific** - Add details about appearance, clothing, setting
2. **Simplify description** - Remove conflicting or complex elements
3. **Try again** - Generation has variability
4. **Upload instead** - Use your own image if generation isn't working

---

## Frequently Asked Questions

::: details FAQs (Click to Expand)

**Q: How many agents can I create?**

A: There's no hard limit, but we recommend keeping 20-50 active agents for manageability. Deactivate agents you're not using to keep your library focused.

**Q: Can I use the same agent across multiple workspaces?**

A: Agents are workspace-specific. You can export settings and recreate them, or workspace admins can copy agents between workspaces.

**Q: What's the difference between Rules and Instructions?**

A: **Instructions** are guidance about how the agent should behave and what it knows (positive direction). **Rules** are constraints that the agent must follow (negative boundaries, "never do X").

**Q: Can agents remember previous conversations?**

A: Each conversation is independent by default. Within a single chat session, agents maintain full conversation history. For persistent memory across sessions, connect relevant datasets with the information you want retained.

**Q: How do I make an agent sound more human?**

A: Focus on:
- Detailed biography with personality quirks
- Specific communication style in facets
- Examples of phrasing in instructions
- Voice settings for audio
- Claude model (tends to be more natural)

**Q: Can I use custom AI models?**

A: Available models are curated for quality and reliability. Enterprise customers may have access to additional models. Contact sales for custom requirements.

**Q: What happens to my agents if I leave the workspace?**

A: Agents you created remain in the workspace. Transfer ownership to a teammate before leaving if you want them to maintain the agents.

**Q: Can agents access the internet?**

A: By default, agents work with connected datasets only. Enable the Web Search tool in Step 3 to allow internet access.

**Q: How do I share an agent with someone outside my workspace?**

A: Currently, agents can only be shared within a workspace. For external sharing, the person needs workspace access, or you can export agent responses/configurations.

**Q: Can I create agents that generate images?**

A: Yes, select the "Visual Generator" agent type and enable image generation tools in Step 3.

**Q: How do I test an agent without publishing it?**

A: Use the Benchmark feature in Step 6 (Review) to test agents before activation. You can also save as draft and test in the drawer.

**Q: Can agents work together in a conversation?**

A: Yes, use `@agentname` mentions to bring multiple agents into a single conversation. They'll respond in turn and can build on each other's answers.

**Q: How often should I update my agents?**

A: Review agents quarterly, or whenever:
- Connected datasets are significantly updated
- Business context changes
- User feedback suggests improvements
- New capabilities become available

**Q: What's the best way to organize a large number of agents?**

A: Use consistent naming conventions:
- Include role/type: "Assistant - CPG - Beauty"
- Include version if iterating: "Consumer Persona v2"
- Use types appropriately for filtering
- Deactivate outdated versions

:::

---

## Keyboard Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| `Cmd/Ctrl + K` | Open quick search | Anywhere in app |
| `Escape` | Close drawer/modal | When drawer/modal open |
| `Tab` | Navigate between fields | In forms |
| `Shift + Tab` | Navigate backwards | In forms |
| `Enter` | Confirm selection | In dropdowns |
| `Cmd/Ctrl + S` | Save current step | In builder |
| `Cmd/Ctrl + Enter` | Send message | In chat |
| Arrow keys | Navigate options | In multi-select |

---

## Next Steps

- [Use agents in chat](/guide/home) - Start conversations with your agents
- [Connect agents to campaigns](/guide/campaigns) - Deploy agents in research surveys
- [Add agents to workflows](/guide/workflows) - Automate agent tasks
- [Upload knowledge to datasets](/guide/datasets) - Give agents more context
- [Manage agent audiences](/guide/people) - Create populations for agent simulations
