# Workflow (Beta)

::: warning Beta Feature
Workflow is currently in beta. Features may change and some functionality may be limited.
:::

Workflow Beta enables automation of multi-step research processes combining agents, datasets, and campaigns.

## Overview

![Workflows Main](/screenshots/workflows/01-workflows-main.png)

Workflows allow you to create automated research pipelines that execute tasks in sequence or parallel.

## Navigation Tabs

| Tab | Purpose |
|-----|---------|
| **Workflows** | View and manage automation workflows |
| **Upcoming Runs (Beta)** | Scheduled workflow executions |
| **Templates (Beta)** | Pre-built workflow templates |
| **Conversations** | Logs of workflow outputs |

## Workflow Gallery

The main view shows your workflows with:
- Workflow name and description
- Creator information
- Assigned agents
- Last run status
- Quick actions

### Workflow Card Information
- **Name** - Workflow identifier
- **Description** - What the workflow does
- **Agents** - AI personas involved
- **Status** - Active, draft, or archived
- **Last Run** - Most recent execution

## Creating Workflows

Click **+ Create Workflow** to build automation:

### Starting Options
1. **Blank Canvas** - Build from scratch
2. **Guided Setup** - Step-by-step wizard
3. **From Template** - Use pre-built pattern

### Workflow Components

| Component | Purpose |
|-----------|---------|
| **Trigger** | What starts the workflow |
| **Steps** | Individual tasks to execute |
| **Conditions** | Logic for branching |
| **Outputs** | Where results go |

### Step Types

| Type | Description |
|------|-------------|
| **Agent Task** | Assign work to an AI agent |
| **Data Processing** | Transform or analyze data |
| **Campaign Action** | Launch or modify campaigns |
| **Integration** | Connect external systems |
| **Notification** | Send alerts or messages |

## Workflow Builder

### Canvas Interface
- Drag and drop components
- Connect steps with lines
- Configure each step
- Preview execution path

### Step Configuration
1. Select step type
2. Choose agent (if applicable)
3. Set inputs and parameters
4. Define success criteria
5. Configure error handling

### Example Workflow

```
[Trigger: Daily at 9am]
    ↓
[Step 1: Fetch new survey responses]
    ↓
[Step 2: Agent analyzes responses]
    ↓
[Condition: Significant findings?]
    ↓           ↓
  [Yes]       [No]
    ↓           ↓
[Generate    [Log and
 Report]      Archive]
    ↓
[Send Email to Team]
```

## Triggers

### Manual
- Click to run
- On-demand execution
- Testing and debugging

### Scheduled
- Cron-based timing
- Daily, weekly, monthly
- Custom intervals

### Event-Based
- Campaign completion
- Data upload
- External webhook
- API call

## Upcoming Runs

![Upcoming Runs](/screenshots/workflows/03-upcoming-runs.png)

View scheduled workflow executions:

| Column | Information |
|--------|-------------|
| **Scheduled** | Date and time |
| **Workflow** | Which workflow |
| **Status** | Pending, Running, Completed |
| **Actions** | View, Cancel, Reschedule |

### Managing Scheduled Runs
- View execution queue
- Cancel pending runs
- Reschedule if needed
- Monitor in progress

## Workflow Templates

![Workflow Templates](/screenshots/workflows/04-workflow-templates.png)

Pre-built automation patterns:

### Common Templates
- **Daily Digest** - Summarize new responses
- **Campaign Monitor** - Track completion rates
- **Report Generator** - Weekly analysis reports
- **Data Processor** - Transform incoming data

### Using Templates
1. Browse template library
2. Click to preview
3. Customize as needed
4. Save and activate

## Conversations Log

![Workflow Conversations](/screenshots/workflows/05-workflow-conversations.png)

Central log of all workflow-generated outputs:

### Features
- Search by title or content
- Sort by date
- Filter by workflow
- Export results

### Conversation Details
- Full execution history
- Step-by-step results
- Agent responses
- Error messages

## Monitoring Workflows

### Execution Status

| Status | Meaning |
|--------|---------|
| **Pending** | Waiting to start |
| **Running** | Currently executing |
| **Completed** | Finished successfully |
| **Failed** | Error occurred |
| **Paused** | Manually paused |

### Performance Metrics
- Execution time
- Success rate
- Error frequency
- Resource usage

## Error Handling

### Built-in Options
- **Retry** - Attempt step again
- **Skip** - Continue without step
- **Abort** - Stop workflow
- **Notify** - Alert on failure

### Best Practices
- Set appropriate retries
- Define fallback actions
- Log errors for debugging
- Monitor failure patterns

## Best Practices

::: tip Workflow Design
- **Start simple** - Add complexity gradually
- **Test thoroughly** - Use test data first
- **Monitor actively** - Watch initial runs
- **Document clearly** - Explain what each step does
:::

### Performance
- Minimize step count
- Use parallel execution where possible
- Set reasonable timeouts
- Archive completed runs

### Maintenance
- Review regularly
- Update for changes
- Remove unused workflows
- Keep templates current

## Limitations (Beta)

Current beta limitations:
- Maximum 10 steps per workflow
- Limited trigger types
- Some integrations unavailable
- Performance monitoring basic

## Next Steps

- [Create agents for workflows](/guide/agents)
- [Prepare datasets](/guide/datasets)
- [Set up campaigns for automation](/guide/campaigns)
