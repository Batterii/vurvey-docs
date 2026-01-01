# Workflow (Beta)

::: warning Beta Feature
Workflow is currently in beta. Features may change and some functionality may be limited.
:::

The Workflow section enables automation of multi-step research processes by combining AI agents, datasets, campaigns, and custom logic into reusable pipelines.

## Overview

![Workflows Main](/screenshots/workflows/01-workflows-main.png)

Workflows (also called "AI Orchestrations" in the system) allow you to create automated research pipelines that execute tasks in sequence with AI agents processing data sources.

## Navigation Options

The Workflow section includes several pages accessible via the left sidebar:

| Page | Purpose |
|-----|---------|
| **Workflows** | View and manage your automation workflows |
| **Upcoming Runs** | See scheduled workflow executions (when scheduling feature is enabled) |
| **Templates** | Manage workflow templates (when templates feature is enabled) |
| **Conversations** | View past workflow conversations and outputs |

## Workflow Gallery

The main Flows view displays your workflows in a card-based grid layout.

### Workflow Card Information

Each workflow card displays:

- **Name** - Workflow title (displayed as subheader)
- **Creator** - "by [First Name Last Name]" showing who created it
- **Description** - Brief description of what the workflow does
- **Assigned Agents** - Avatar list showing up to 7 agents
  - Displays "+N more" if more than 7 agents assigned
  - Shows "No agents assigned yet" if empty

### Workflow Card Actions

Click the three-dot menu on any workflow card to access:

| Action | Description |
|--------|-------------|
| **Share** | Manage who can access this workflow |
| **Copy** | Duplicate the workflow |
| **Edit** | Open the workflow builder |
| **View** | Read-only access (when lacking edit permission) |
| **Delete** | Remove the workflow (shows warning if scheduled) |

::: warning Scheduled Workflows
When deleting a workflow with an active schedule, you'll see a warning message. The schedule will also be removed.
:::

### Search and Sort

Use the controls above the card grid:

- **Search** - Filter workflows by name
- **Sort By** - Order by most recently updated (default)

## Creating Workflows

Click **Create new workflow** to start building.

### Workflow Form Fields

When creating or editing a workflow:

| Field | Description |
|-------|-------------|
| **Name** | Workflow identifier |
| **Description** | What the workflow accomplishes |
| **Input Parameters** | Variables that can be passed at runtime |
| **Instructions** | Global guidance for all agents |
| **Output Type** | Format for workflow results |

## Workflow Builder

### Visual Canvas

The workflow builder uses a React Flow-based canvas for visual editing:

![Workflow Builder](/screenshots/workflows/02-workflow-builder.png)

**Canvas Features:**
- **Dotted background** - Visual grid for alignment
- **Zoom controls** - Fit view, zoom in/out (0.1x to 2x)
- **Mini map** - Overview of entire workflow
- **Pan and drag** - Navigate around the canvas

### Node Types

The canvas contains different node types representing workflow components:

#### Variables Node
Define input parameters for your workflow:
- Variable names and default values
- Referenced in agent prompts using `{{variableName}}` syntax

#### Sources Node
Select data sources for the workflow:

| Source Type | Icon | Description |
|-------------|------|-------------|
| **Campaigns** | Megaphone | Survey response data |
| **Questions** | Question bubble | Individual survey questions |
| **Training Sets** | Folder | Dataset collections |
| **Files** | Document | Individual documents |
| **Videos** | Video | Video content |
| **Audio** | Equalizer | Audio files |

Click **Add Sources** to open the source selection modal.

#### Agent Task Node
Individual AI agent steps in the workflow:

| Element | Description |
|---------|-------------|
| **Agent Avatar** | Visual identifier for the agent |
| **Agent Name** | Name of the assigned persona |
| **Task Prompt** | Instructions for this agent step |
| **Order** | Position in execution sequence (numeric input) |
| **Tools Toggle** | Enable/disable Smart Prompt tools for this step |

::: tip Tools (Smart Prompt)
Enable Tools to let agents use smart prompt capabilities with access to additional context and functionality. When disabled, agents will only use sources added directly to the workflow.
:::

#### Add Agent Button
Click **Add Agent** to open the agent selection modal and add new agents to your workflow.

#### Flow Output Node
Final results summary:
- Report status indicator
- Generate Report button
- Report preview when available

::: info Node Variants
During workflow execution and in history view, additional node variants appear that show agent outputs and execution status inline with the agent task cards.
:::

### Flow Connections

Nodes are connected by animated edges showing data flow:
- Lines animate during workflow execution
- Visual feedback for active processing

## Top Bar Controls

The workflow page header provides key actions:

### Navigation
- **Back Arrow** - Return to workflows list
- **Workflow Name** - Displayed as page title

### Tab Navigation
| Tab | Description |
|-----|-------------|
| **Build** | Edit workflow structure |
| **Run** | View live execution (only active during execution) |
| **View** | View past executions (disabled if no history exists) |

### Action Buttons

| Button | Description |
|--------|-------------|
| **Edit** | Modify workflow metadata (pencil icon next to workflow name) |
| **Save** | Persist changes (appears when workflow has unsaved changes) |
| **Run Workflow** | Execute the workflow (AI-styled button) |
| **Cancel** | Stop running workflow (red danger button, appears during execution) |
| **Share** | Open permissions modal (when enabled) |
| **Schedule** | Configure recurring execution (when scheduling feature is enabled) |

## Scheduling Workflows

Click **Schedule** to set up automatic execution:

### Schedule Configuration

| Setting | Options |
|---------|---------|
| **Frequency** | Hourly, Daily, Weekly |
| **Time** | Hour and minute selection (12-hour format) |
| **Days** | Day selection (for weekly schedules) |

### Email Notifications

Configure who receives execution notifications:
- Toggle email notifications on/off
- Add notification recipients
- Manage recipient list

### Schedule Preview

The modal displays:
- Human-readable schedule description (powered by cronstrue)
- Next scheduled execution time
- Schedule summary

### Schedule Actions

| Action | Description |
|--------|-------------|
| **Create Schedule** | Set up new schedule |
| **Update Schedule** | Modify existing schedule |
| **Delete Schedule** | Remove schedule |

## Upcoming Runs

![Upcoming Runs](/screenshots/workflows/03-upcoming-runs.png)

View and manage all scheduled workflow executions.

### Page Layout

- **Header**: "Upcoming Scheduled Runs" title with description
- **Search**: Filter by workflow name
- **Date Groups**: Runs organized by execution date

### Date Headers

Runs are grouped under date headers:
- "Today, [Month] [Day]"
- "Tomorrow, [Month] [Day]"
- "[Month] [Day]" for future dates

### Run Information

Each scheduled run displays:
- Workflow name
- Scheduled execution time
- Execution status
- Last executed time (if currently running)

### Empty States

- **Loading**: Spinner while fetching data
- **No Runs**: Message when no runs are scheduled

## Conversations

![Workflow Conversations](/screenshots/workflows/05-workflow-conversations.png)

Central log of all workflow-generated outputs and conversations.

### Conversations Grid

Conversations appear as cards showing:

- **Created Date** - Timestamp ("X days ago" format)
- **Conversation Name** - Title of the conversation
- **Creator** - Who initiated the conversation
- **Content Preview** - Markdown-rendered preview
- **Artifacts** - Generated images and media thumbnails

### Conversation Actions

Click the three-dot menu on any conversation:

| Action | Description |
|--------|-------------|
| **Rename** | Edit conversation title |
| **Copy** | Copy conversation history |
| **Export** | Download to file |
| **Delete** | Remove conversation |

### Search and Sort

- **Search** - Find conversations by name
- **Sort By** - Order by date or other criteria

### Creating Conversations

Click **Create new** to start a fresh conversation from the workflows section.

## Execution States

### Agent Processing States

During workflow execution, each agent shows a processing state:

| State | Description |
|-------|-------------|
| **Processing** | Currently executing (animated indicator shown) |
| **Completing** | Finalizing task execution |
| **Completed** | Successfully finished execution |
| **Error** | Failed during execution |
| **Cancelled** | Task was cancelled |

::: tip Visual Indicators
Agent task cards show visual feedback during execution with animated borders when in the "processing" state and completion indicators when finished.
:::

### Workflow Status

| Status | Description |
|--------|-------------|
| **In Progress** | Currently executing |
| **Completed** | Finished all steps successfully |
| **Failed** | Error occurred during execution |
| **Cancelled** | Manually stopped by user |
| **Paused** | Temporarily suspended |

## Permissions

Workflows support role-based access control:

| Permission | Allows |
|------------|--------|
| **View** | Read-only access to workflow |
| **Edit** | Modify workflow structure and settings |
| **Delete** | Remove the workflow |
| **Manage** | Share workflow and modify permissions |

### Sharing Workflows

1. Click **Share** in the top bar or card menu
2. Configure workspace-wide or individual access
3. Assign permission levels
4. Save changes

## Outputs Page

::: info Coming Soon
The Outputs feature combines all custom data, agents, and flows into shareable deliverables.
:::

Currently displays a placeholder with:
- Description of upcoming functionality
- "Outputs combine all of your custom data, agents, and flows into a shareable (and talkable) deliverable."

## Best Practices

### Workflow Design

- **Start simple** - Get basic flow working before adding complexity
- **Test thoroughly** - Use test data before processing real data
- **Monitor actively** - Watch the first few runs closely
- **Document clearly** - Add descriptions to workflows and use clear agent prompts

### Agent Configuration

- Assign appropriate agents for each task type
- Use Smart Prompt for enhanced results
- Set clear, specific task prompts
- Order agents logically in the execution sequence

### Scheduling

- Start with manual runs to verify workflow works
- Use appropriate frequencies to avoid overwhelming data sources
- Set up email notifications for important workflows
- Review scheduled runs regularly

### Data Sources

- Select only necessary sources to improve performance
- Ensure sources have current, processed data
- Test with smaller datasets first
- Monitor source availability

## Troubleshooting

### Workflow Won't Save

1. Check for validation errors in agent tasks
2. Ensure all required fields are filled
3. Verify you have edit permission
4. Try refreshing the page

### Execution Fails

1. Review error messages in the running tab
2. Check individual agent task outputs
3. Verify data sources are available and processed
4. Retry failed steps if appropriate

### Schedule Not Running

1. Verify schedule is configured correctly
2. Check workflow has no validation errors
3. Ensure workflow doesn't have unsaved changes
4. Review upcoming runs page for status

## Next Steps

- [Create agents to power your workflows](/guide/agents)
- [Prepare datasets for workflow processing](/guide/datasets)
- [Set up campaigns for workflow automation](/guide/campaigns)
- [Use the chat interface for ad-hoc research](/guide/home)
