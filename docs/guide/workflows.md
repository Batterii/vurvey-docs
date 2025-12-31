# Workflow (Beta)

::: warning Beta Feature
Workflow is currently in beta. Features may change and some functionality may be limited.
:::

The Workflow section enables automation of multi-step research processes by combining AI agents, datasets, campaigns, and custom logic into reusable pipelines.

## Overview

![Workflows Main](/screenshots/workflows/01-workflows-main.png)

Workflows (also called "AI Orchestrations" in the system) allow you to create automated research pipelines that execute tasks in sequence, with conditional logic, and on schedules.

## Navigation Tabs

| Tab | Purpose |
|-----|---------|
| **Workflows** | View and manage your automation workflows |
| **Upcoming Runs** | See scheduled workflow executions (Beta) |
| **Templates** | Browse pre-built workflow templates (Beta) |
| **Conversations** | View logs and outputs from workflow runs |

## Workflow Gallery

The main view displays your workflows in a card-based layout:

### Workflow Card Information
- **Name** - Workflow identifier
- **Description** - What the workflow accomplishes
- **Agents** - AI personas assigned to the workflow
- **Status** - Active, draft, or archived
- **Last Run** - Most recent execution timestamp
- **Quick Actions** - Run, edit, or view details

### Filtering & Sorting
- Search workflows by name or description
- Filter by status (Active, Draft, Archived)
- Sort by name, last run, or creation date

## Creating Workflows

Click **+ Create Workflow** to build a new automation:

### Starting Options

1. **Blank Canvas** - Build from scratch using the visual builder
2. **Guided Setup** - Step-by-step wizard for common patterns
3. **From Template** - Start from a pre-built template

### Workflow Components

| Component | Purpose |
|-----------|---------|
| **Trigger** | What initiates the workflow (schedule, event, manual) |
| **Steps** | Individual tasks the workflow executes |
| **Conditions** | Branching logic based on data or results |
| **Outputs** | Where results are stored or sent |

### Step Types

| Type | Description |
|------|-------------|
| **Agent Task** | Assign a prompt or question to an AI agent |
| **Data Processing** | Transform, filter, or analyze data |
| **Campaign Action** | Launch surveys, check responses, close campaigns |
| **Integration** | Connect to external systems via webhooks or APIs |
| **Notification** | Send emails, Slack messages, or other alerts |
| **Wait** | Pause execution for a specified time |
| **Human Review** | Pause for manual approval before continuing |

## Workflow Builder

### Visual Canvas

The workflow builder provides a visual drag-and-drop interface:

- **Node palette** - Available step types to add
- **Canvas area** - Arrange and connect workflow steps
- **Connection lines** - Show data flow between steps
- **Configuration panel** - Settings for selected step

### Step Configuration

For each step, configure:

1. **Step name** - Descriptive identifier
2. **Input mapping** - What data flows into this step
3. **Parameters** - Step-specific settings
4. **Agent selection** - Which AI persona to use (for agent tasks)
5. **Success criteria** - What constitutes completion
6. **Error handling** - What to do if the step fails
7. **Output mapping** - Where results go next

### Example Workflow

```
[Trigger: Daily at 9:00 AM]
         |
         v
[Step 1: Query new campaign responses from last 24 hours]
         |
         v
[Step 2: Send responses to Analysis Agent for summarization]
         |
         v
[Condition: Are there significant findings?]
        / \
       /   \
    Yes     No
     |       |
     v       v
[Step 3: Generate    [Log: Archive
 detailed report]    summary only]
     |
     v
[Step 4: Send report to team via email]
```

## Triggers

### Manual
- Click the **Run** button to execute on-demand
- Useful for testing and one-off executions
- Can pass parameters at runtime

### Scheduled
- **Cron-based timing** - Precise scheduling (e.g., "0 9 * * MON-FRI")
- **Preset intervals** - Daily, weekly, monthly options
- **Custom intervals** - Every N hours/days
- **Timezone aware** - Schedule in your local timezone

### Event-Based
- **Campaign completion** - When a survey reaches target responses
- **Data upload** - When new files are added to a dataset
- **Webhook** - External systems can trigger via HTTP
- **API call** - Programmatic triggering from your applications

## Upcoming Runs

![Upcoming Runs](/screenshots/workflows/03-upcoming-runs.png)

View and manage scheduled workflow executions:

| Column | Information |
|--------|-------------|
| **Scheduled** | When the workflow will run |
| **Workflow** | Which workflow is scheduled |
| **Trigger** | What initiated the schedule |
| **Status** | Pending, Running, Completed, Failed |
| **Actions** | Cancel, Reschedule, View details |

### Managing Scheduled Runs
- **View queue** - See all pending executions
- **Cancel** - Stop a scheduled run before it starts
- **Reschedule** - Change the execution time
- **Force run** - Execute immediately regardless of schedule

## Workflow Templates

![Workflow Templates](/screenshots/workflows/04-workflow-templates.png)

Pre-built automation patterns to accelerate workflow creation:

### Common Templates

| Template | Purpose |
|----------|---------|
| **Daily Digest** | Summarize new responses and activity |
| **Campaign Monitor** | Track completion rates and quality |
| **Report Generator** | Produce weekly analysis reports |
| **Data Processor** | Transform and validate incoming data |
| **Alert System** | Notify team of important findings |
| **Competitive Watch** | Monitor web sources for competitor activity |

### Using Templates
1. Browse the template library
2. Click a template to preview its structure
3. Click **Use Template** to create a copy
4. Customize steps, agents, and parameters
5. Configure triggers and save

## Conversations Log

![Workflow Conversations](/screenshots/workflows/05-workflow-conversations.png)

Central log of all workflow-generated outputs and conversations:

### Features
- **Search** - Find by content or workflow name
- **Filter** - By workflow, date range, or status
- **Sort** - By date or workflow
- **Export** - Download conversation logs

### Conversation Details
Each entry shows:
- Full execution history with timestamps
- Step-by-step results and outputs
- Agent responses and reasoning
- Any errors or warnings encountered
- Final outputs and deliverables

## Monitoring Workflows

### Execution Status

| Status | Meaning |
|--------|---------|
| **Pending** | Waiting to start (scheduled or queued) |
| **Running** | Currently executing steps |
| **Completed** | Finished successfully |
| **Failed** | Error occurred during execution |
| **Paused** | Waiting for human review or input |
| **Cancelled** | Manually stopped before completion |

### Performance Metrics
- **Execution time** - How long the workflow took
- **Success rate** - Percentage of successful runs
- **Error frequency** - Common failure points
- **Credit usage** - AI credits consumed per run

## Error Handling

### Built-in Options

| Strategy | Description |
|----------|-------------|
| **Retry** | Attempt the step again (configurable count) |
| **Skip** | Continue workflow without this step's output |
| **Abort** | Stop the entire workflow |
| **Fallback** | Execute an alternative step |
| **Notify** | Send alert and continue or pause |

### Best Practices
- Set appropriate retry counts for flaky operations
- Define fallback paths for critical steps
- Enable notifications for failures
- Review error patterns regularly
- Test error scenarios before production use

## Best Practices

::: tip Workflow Design
- **Start simple** - Get basic flow working before adding complexity
- **Test thoroughly** - Use test data before processing real data
- **Monitor actively** - Watch the first few runs closely
- **Document clearly** - Add descriptions to steps and workflows
:::

### Performance
- Minimize step count where possible
- Use parallel execution for independent steps
- Set reasonable timeouts for each step
- Archive completed run logs to save space

### Maintenance
- Review workflows quarterly for relevance
- Update agent configurations when models improve
- Remove or archive unused workflows
- Keep templates current with best practices

## Current Limitations (Beta)

- Maximum 20 steps per workflow
- Limited integration options (expanding)
- Some advanced scheduling features unavailable
- Performance monitoring dashboard in development

## Next Steps

- [Create agents to power your workflows](/guide/agents)
- [Prepare datasets for workflow processing](/guide/datasets)
- [Set up campaigns for workflow automation](/guide/campaigns)
- [Use the chat interface for ad-hoc research](/guide/home)
