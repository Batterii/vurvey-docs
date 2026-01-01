# Agents

The Agents section is where you create and manage AI personas. These agents represent different viewpoints, expertise areas, or roles for research, analysis, and content creation.

## Overview

![Agents Gallery](/screenshots/agents/01-agents-gallery.png)

The main Agents page displays all your AI personas in a grid layout, organized into collapsible sections by type.

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

## Agent Types

Agents are categorized by their primary function:

| Type | Best For |
|------|----------|
| **Assistant** | General-purpose help, Q&A, broad research tasks |
| **Consumer Persona** | Simulating consumer perspectives and feedback |
| **Product** | Product-specific expertise and analysis |
| **Visual Generator** | Creating visual content and imagery |

## Agent Card Actions

Click the three-dot menu on any agent card to access actions:

| Action | Icon | Description |
|--------|------|-------------|
| **Start Conversation** | Sparkle | Open a chat with this agent |
| **Share** | Share | Manage who can access this agent |
| **Edit Agent** | Pencil | Open the agent builder to modify |
| **View Agent** | Eye | Read-only view (when you lack edit permission) |
| **Delete Agent** | Trash | Permanently remove the agent |

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

### Step 2: Facets

Configure personality characteristics:

- Select traits from predefined options
- Define background and expertise areas
- Set behavioral tendencies

### Step 3: Instructions

Provide guidance and resources:

- **AI Model** - Choose the underlying LLM (Gemini, Claude, GPT)
- **Tools** - Enable specific capabilities
- **Datasets** - Connect knowledge sources
- **Knowledge** - Add custom information
- **Rules** - Define constraints and guidelines

### Step 4: Identity

Establish the agent's persona:

- **Name** - The agent's display name
- **Biography** - Detailed description of who they are
- **Voice** - Select text-to-speech voice (if applicable)
- Use the **Generate** button to have AI create name and biography

### Step 5: Appearance

Create the visual identity:

- **Avatar** - Upload an image or generate with AI
- **Physical Description** - Describe the agent's appearance
- Use the **Generate** button to create AI-generated images

### Step 6: Review

Finalize your agent:

- **Credential Card** - Summary of all settings
- **Benchmark** - Test the agent in a chat interface
- **Activate** - Publish the agent for use

## Builder Navigation

The builder shows progress through all steps:

- **Checkmark** - Step is complete
- **Current indicator** - Step you're viewing
- **Locked** - Step requires completing previous steps

You can navigate between completed steps at any time. The builder auto-saves your progress.

## Managing Agents

### Editing

1. Click an agent card to open the drawer
2. Click **Edit** to open the builder
3. Modify any settings across the six steps
4. Save your changes

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

## Next Steps

- [Use agents in chat](/guide/home) - Start conversations with your agents
- [Connect agents to campaigns](/guide/campaigns) - Deploy agents in research surveys
- [Add agents to workflows](/guide/workflows) - Automate agent tasks
- [Upload knowledge to datasets](/guide/datasets) - Give agents more context
