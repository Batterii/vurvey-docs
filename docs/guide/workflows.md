# Workflow (Beta)

::: warning Beta Feature
Workflow is currently in beta. Features may change and some functionality may be limited.
:::

The Workflow section enables automation of multi-step research processes by combining AI agents, datasets, campaigns, and custom logic into reusable pipelines.

## Overview

![Workflows Main](/screenshots/workflows/01-workflows-main.png)

Workflows (also called "AI Orchestrations" in the system) allow you to create automated research pipelines that execute tasks in sequence with AI agents processing data sources.

::: tip What Are Workflows?
Think of Workflows as automated research assistants that work while you sleep. Chain multiple AI agents together, feed them your datasets and campaign data, and get comprehensive analysis delivered on a schedule. It's like having a research team that works 24/7.
:::

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

::: tip Pro Tip: Workflow Naming
Use a consistent naming convention like `[Project]-[Function]-[Version]` (e.g., "Q4-Campaign-Analysis-v2"). This makes searching and organizing workflows much easier as your library grows.
:::

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

::: tip Pro Tip: Input Parameters
Use input parameters to make workflows reusable. For example, create a `{{campaign_id}}` parameter to run the same analysis workflow on different campaigns without rebuilding it each time.
:::

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

::: tip Pro Tip: Source Strategy
- Use **Campaigns** for structured survey data with rich metadata
- Use **Training Sets** when you need multiple related files processed together
- Use **Individual Files** for focused analysis on specific documents
- Mix source types to give agents comprehensive context
:::

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

::: tip Pro Tip: Agent Sequencing
Order agents strategically:
1. **First**: Data extraction/summarization agents
2. **Middle**: Analysis/synthesis agents
3. **Last**: Report generation/formatting agents

Each agent builds on the output of previous agents, so logical ordering improves results.
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

::: tip Pro Tip: Scheduling Strategy
- **Daily workflows**: Run overnight (2-5 AM) to have fresh insights waiting each morning
- **Weekly workflows**: Schedule for Monday morning to kick off the week with updated analysis
- **High-frequency workflows**: Use hourly only for real-time dashboards; it consumes more resources
- **Always test manually** before enabling schedules
:::

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

::: tip Pro Tip: Conversation Management
- **Export important conversations** before they get buried in the history
- **Use meaningful names** when renaming - include the date and purpose
- **Copy conversations** to documents for stakeholder sharing
- **Delete test runs** regularly to keep the conversation list clean
:::

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

### Getting Help

If issues persist:
1. **Document the workflow ID** and specific error messages
2. **Take screenshots** of the workflow canvas and error states
3. **Check the History tab** for past execution details
4. **Contact support** via the Help menu

## Real-World Use Cases

### Use Case 1: Weekly Campaign Digest

**Scenario:** Your team runs multiple campaigns and needs a consolidated weekly summary for leadership.

**Approach:**
1. Create a workflow with all active campaigns as sources
2. Add a Data Synthesizer agent to extract key metrics
3. Add a Report Generator agent to create executive summary
4. Schedule for Monday 7 AM
5. Enable email notifications for leadership team

**Agent Configuration:**
- **Agent 1 (Data Synthesizer)**: "Analyze all campaign responses from the past week. Extract response counts, sentiment trends, and top themes for each campaign."
- **Agent 2 (Report Generator)**: "Create an executive summary with key findings, notable quotes, and recommendations for next steps."

::: tip Pro Tip: Leadership Reports
- Keep summaries under 2 pages
- Lead with actionable insights
- Include 2-3 notable customer quotes
- End with clear recommendations
:::

### Use Case 2: Competitive Intelligence Pipeline

**Scenario:** You want ongoing analysis of how customers perceive competitors.

**Approach:**
1. Create a training set with competitor materials
2. Connect campaigns that mention competitors
3. Add a Competitor Analyst agent
4. Add a Trends Tracker agent
5. Schedule weekly for fresh competitive insights

**Agent Configuration:**
- **Agent 1 (Competitor Analyst)**: "Identify all mentions of competitors in the campaign responses. Categorize by: pricing comparison, feature comparison, brand perception, switching intent."
- **Agent 2 (Trends Tracker)**: "Compare this week's competitive mentions to previous weeks. Highlight any shifts in perception or emerging competitive threats."

::: tip Pro Tip: Competitive Analysis
- Track competitor mentions over time
- Flag sudden shifts in sentiment
- Cross-reference with competitor news/announcements
- Share weekly with product and marketing teams
:::

### Use Case 3: Automated Insights from Video Responses

**Scenario:** You collect hundreds of video responses and need them analyzed systematically.

**Approach:**
1. Select campaigns with video responses as sources
2. Add a Video Analyzer agent to process transcripts
3. Add a Theme Extractor agent for pattern recognition
4. Add a Highlight Curator agent to identify best clips
5. Run daily for fresh campaigns, weekly for established ones

**Agent Configuration:**
- **Agent 1 (Video Analyzer)**: "Review all video transcripts. Summarize the key points, emotional tone, and unique perspectives shared by each respondent."
- **Agent 2 (Theme Extractor)**: "Identify the top 5 themes across all video responses. For each theme, note the frequency and sentiment."
- **Agent 3 (Highlight Curator)**: "Select the 3 most compelling video segments that best represent the key themes. Note timestamp ranges and why each is notable."

### Use Case 4: Real-Time Campaign Monitoring

**Scenario:** You've launched a high-stakes campaign and need to catch issues early.

**Approach:**
1. Create a workflow targeting the specific campaign
2. Add a Quality Monitor agent to flag concerning responses
3. Add an Alert Generator agent for immediate notifications
4. Schedule hourly during launch week
5. Enable email notifications for the research team

**Agent Configuration:**
- **Agent 1 (Quality Monitor)**: "Review new responses for: survey confusion, technical issues, inappropriate content, or extreme negative sentiment. Flag any concerns."
- **Agent 2 (Alert Generator)**: "If issues are detected, create a brief alert summary with: issue type, response count affected, severity, and recommended action."

::: tip Pro Tip: Launch Monitoring
- Use hourly schedules only during critical periods
- Reduce to daily once campaign stabilizes
- Set up notifications for the on-call team member
- Have a response plan ready for common issues
:::

## Advanced Workflow Patterns

::: details Click to Expand Advanced Techniques

**Chaining Workflows:**
While workflows can't directly call other workflows, you can achieve similar results by:
- Using scheduled workflows in sequence (stagger start times)
- Having one workflow prepare data for another via shared datasets
- Using input parameters to pass context between related workflows

**Conditional Logic:**
Though visual branching isn't available yet, you can simulate conditions by:
- Using agent prompts that handle different scenarios ("If sentiment is negative, focus on...")
- Creating separate workflows for different scenarios
- Using input parameters to guide agent behavior

**Multi-Stage Analysis:**
For complex analysis, design workflows in stages:
1. **Stage 1 Workflow**: Raw data extraction and cleaning
2. **Stage 2 Workflow**: Analysis and pattern recognition
3. **Stage 3 Workflow**: Report generation and formatting

Run stages in sequence using staggered schedules.

**Template Workflows:**
Create reusable workflow templates by:
- Using input parameters for all variable elements
- Documenting parameter usage in descriptions
- Copying templates for new projects
- Maintaining a "templates" naming prefix for easy identification
:::

## Frequently Asked Questions

::: details FAQs (Click to Expand)

**Q: How many agents can I add to a workflow?**
A: There's no hard limit, but we recommend 3-7 agents for optimal performance. More agents increase processing time and cost.

**Q: Can workflows run on multiple campaigns simultaneously?**
A: Yes, you can select multiple campaigns as sources. The workflow will process data from all selected campaigns.

**Q: What happens if a workflow fails mid-execution?**
A: The workflow stops at the failed step. You can view the error in the History tab and retry from the failed step after fixing the issue.

**Q: Can I edit a workflow while it's running?**
A: No, you must cancel the running execution first or wait for it to complete before editing.

**Q: How do I share workflow results with stakeholders?**
A: Use the Conversations section to export or copy workflow outputs. You can also enable email notifications to automatically send results.

**Q: Can I duplicate an existing workflow?**
A: Yes, use the Copy option from the workflow card menu to create a duplicate you can modify.

**Q: Do scheduled workflows run if I'm logged out?**
A: Yes, scheduled workflows run on the server regardless of whether you're logged in.

**Q: How much does running a workflow cost?**
A: Workflow costs depend on the AI model used, number of agents, and amount of data processed. Check your Usage page for detailed tracking.

**Q: Can I pause a schedule without deleting it?**
A: Currently, you need to delete and recreate schedules. Consider reducing frequency instead of deleting.

**Q: Why is my workflow taking so long?**
A: Processing time depends on data volume and number of agents. Large datasets or many agents increase time. Check individual agent progress in the Running tab.
:::

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + S` | Save workflow |
| `Cmd/Ctrl + Z` | Undo last action |
| `Cmd/Ctrl + Shift + Z` | Redo action |
| `Escape` | Close modals |
| `Space` | Fit view to canvas |
| `+` / `-` | Zoom in/out |

## Next Steps

- [Create agents to power your workflows](/guide/agents)
- [Prepare datasets for workflow processing](/guide/datasets)
- [Set up campaigns for workflow automation](/guide/campaigns)
- [Use the chat interface for ad-hoc research](/guide/home)
