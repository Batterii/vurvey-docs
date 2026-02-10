# Workflows (Beta)

::: warning Beta Feature
Workflows is currently in beta. Features may evolve and some functionality may be limited as we refine the experience.
:::

Workflows let you automate multi-step research processes by chaining AI agents together into reusable pipelines. Feed in your datasets and campaign data, define what each agent should do, and let the system run — on demand or on a schedule.

## Overview

![Workflows Main](/screenshots/workflows/01-workflows-main.png)

The Workflows page shows all your automation pipelines in a card-based gallery. From here you can create new workflows, run existing ones, and manage schedules.

::: tip What Are Workflows?
Think of workflows as automated research teams that work while you sleep. You chain multiple AI agents together, point them at your data, and get comprehensive analysis delivered on your schedule. It's like having a research team that works around the clock.
:::

## Navigation

Access **Workflows** from the main sidebar (look for the beta badge). The section includes several tabs:

| Tab | Description |
|-----|-------------|
| **Workflows** | Your automation pipelines — the main view |
| **Upcoming Runs** | Scheduled workflow executions |
| **Templates** | Pre-built workflow templates to get you started |
| **Conversations** | Past workflow outputs and conversation history |
| **Outputs** | Shareable deliverables from workflows (coming soon) |

## Browsing Your Workflows

![Workflows Main](/screenshots/workflows/01-workflows-main.png)

Workflows appear as cards in a grid layout. Each card shows:

- **Name** — the workflow title
- **Creator** — who built it ("by Jane Smith")
- **Description** — what the workflow does
- **Assigned agents** — avatar icons for up to 7 agents, with a "+N more" indicator if there are additional ones

Use the **Search** bar to find workflows by name, and **Sort By** to change the display order.

::: tip Naming Convention
Use a consistent pattern like "[Project]-[Purpose]-[Version]" — for example, "Q4-Campaign-Analysis-v2." This makes it much easier to find workflows as your library grows.
:::

### Workflow Card Actions

Click the **three-dot menu** (⋯) on any card for quick actions:

| Action | What It Does |
|--------|-------------|
| **Share** | Control who can access this workflow |
| **Copy** | Duplicate the workflow so you can modify the copy |
| **Edit** | Open the workflow builder |
| **View** | Read-only access (when you don't have edit permission) |
| **Delete** | Remove the workflow (warns you if it has an active schedule) |

## Creating a Workflow

Click **Create new workflow** to start building. You'll be asked to fill in:

| Field | Description |
|-------|-------------|
| **Name** | A title for the workflow |
| **Description** | What the workflow accomplishes |
| **Input Parameters** | Variables you can change each time you run it (optional) |
| **Instructions** | High-level guidance that applies to every agent in the workflow |
| **Output Type** | The format you want results delivered in |

::: tip Reusable Workflows with Parameters
Use input parameters to make a single workflow work for multiple projects. For example, create a `{{campaign_name}}` parameter so you can run the same analysis workflow on different campaigns without rebuilding it.
:::

## The Workflow Builder

The workflow builder is a visual canvas where you design your automation pipeline by dragging and connecting different types of nodes.

<img
  :src="'/screenshots/workflows/02-workflow-builder.png'"
  alt="Workflow Builder"
  @error="$event.target.remove()"
/>

### Canvas Basics

- **Drag and pan** to navigate around the canvas.
- **Zoom in and out** using the controls in the corner (or pinch on a trackpad).
- A **mini map** in the top-right corner shows the entire workflow at a glance.
- **Animated lines** between nodes show how data flows through your pipeline.

### Node Types

Your workflow is built from four types of nodes that you connect together:

#### Variables Node

Define input parameters that can change each time you run the workflow. For example, you might create a `{{report_period}}` variable that defaults to "last 7 days" but can be overridden to "last 30 days" when needed.

Variables are referenced in agent prompts using the `{{variableName}}` syntax.

::: tip Variable Sets
Save different combinations of variable values as named sets. Switch between configurations — like "Weekly Report" vs. "Monthly Report" — without editing the workflow itself.
:::

#### Sources Node

Choose what data flows into your workflow:

| Source Type | Description |
|-------------|-------------|
| **Campaigns** | Survey response data from your campaigns |
| **Questions** | Individual survey questions and their responses |
| **Datasets** | Your uploaded file collections |
| **Files** | Specific individual documents |
| **Videos** | Video content (transcribed automatically) |
| **Audio** | Audio files (transcribed automatically) |

Click **Add Sources** to open the source selector and pick from your available data.

::: tip Source Strategy
- Use **Campaigns** for structured survey data with rich response metadata.
- Use **Datasets** when you need agents to reference uploaded reports and documents.
- Use **Individual Files** for focused analysis on a specific document.
- Mix source types to give agents the most comprehensive context.
:::

#### Agent Task Nodes

Each agent task node represents one step in your pipeline. An agent receives input from the previous steps, follows your instructions, and passes its output to the next agent.

Each node shows:

- **Agent name and avatar** — which agent is assigned
- **Task prompt** — the specific instructions for this step
- **Order** — where this step falls in the execution sequence
- **Tools toggle** — enable or disable access to additional AI capabilities
- **Model selector** — choose a specific AI model (admin only)

Click **Add Agent** to add a new step to your pipeline.

::: tip Agent Sequencing
Order your agents strategically for the best results:
1. **First:** Data extraction and summarization agents
2. **Middle:** Analysis and synthesis agents
3. **Last:** Report generation and formatting agents

Each agent builds on the output of the ones before it, so logical ordering matters.
:::

#### Output Node

The final node in your pipeline. After all agents have finished, the output node collects the results. You can generate a formatted report from here.

### Execution Progress

When you run a workflow, each agent task node shows its current state visually:

| State | What It Means |
|-------|---------------|
| **Idle** | Waiting for its turn |
| **Processing** | Currently running (you'll see an animated border) |
| **Completed** | Finished successfully |
| **Error** | Something went wrong during execution |
| **Cancelled** | The workflow was stopped manually |

## Running a Workflow

### Top Bar Controls

The workflow detail page header gives you the key actions:

| Tab / Button | What It Does |
|-------------|-------------|
| **Build** tab | Edit the workflow structure |
| **Run** tab | Watch live execution progress (appears during a run) |
| **View** tab | Review past executions |
| **Edit** button | Change workflow name, description, and parameters |
| **Save** button | Save your changes (appears when there are unsaved edits) |
| **Run** button | Execute the workflow |
| **Cancel** button | Stop a running workflow |
| **Share** button | Manage access permissions |
| **Schedule** button | Set up recurring automatic runs |

### Workflow Status

| Status | Meaning |
|--------|---------|
| **Pending** | Queued and waiting to start |
| **Running** | Currently executing |
| **Completed** | All steps finished successfully |
| **Failed** | An error occurred — check the Run tab for details |
| **Cancelled** | You stopped it manually |

## Scheduling Workflows

Click **Schedule** to set up automatic recurring runs.

### Schedule Options

| Setting | Choices |
|---------|---------|
| **Frequency** | Hourly, Daily, or Weekly |
| **Time** | When to run (hour and minute, 12-hour format) |
| **Days** | Which days to run (for weekly schedules) |

### Email Notifications

Toggle email notifications on and add team members who should receive results. Each recipient gets an email when the workflow completes.

### Schedule Preview

Before saving, the dialog shows:
- A human-readable description of the schedule ("Every Monday at 7:00 AM")
- The next scheduled execution time

::: tip Scheduling Strategy
- **Daily workflows:** Run overnight (2–5 AM) so fresh insights are waiting each morning.
- **Weekly workflows:** Schedule for Monday morning to kick off the week with updated analysis.
- **Hourly:** Reserve for time-sensitive monitoring during critical campaign launches.
- **Always test manually** before turning on a schedule.
:::

## Upcoming Runs

![Upcoming Runs](/screenshots/workflows/03-upcoming-runs.png)

The **Upcoming Runs** tab shows all scheduled workflow executions, organized by date. Each entry displays the workflow name, scheduled time, and current status.

Use the **Search** bar to filter by workflow name. Runs are grouped under date headers like "Today," "Tomorrow," and specific future dates.

## Templates

![Workflow Templates](/screenshots/workflows/04-workflow-templates.png)

The **Templates** tab provides pre-built workflow patterns you can use as starting points. Browse available templates, preview what they do, and create a copy to customize for your needs.

## Conversations

![Workflow Conversations](/screenshots/workflows/05-workflow-conversations.png)

The **Conversations** tab is your central log of all workflow-generated outputs. Every time a workflow runs, it creates a conversation you can review, export, or share.

Each conversation card shows:

- **Date** — when the conversation was created ("3 days ago")
- **Name** — the conversation title
- **Creator** — who initiated the run
- **Content preview** — a snippet of the output
- **Artifacts** — any generated images or media

### Conversation Actions

Click the three-dot menu (⋯) on any conversation:

| Action | What It Does |
|--------|-------------|
| **Rename** | Give it a meaningful title |
| **Copy** | Copy the conversation text to your clipboard |
| **Export** | Download as a file |
| **Delete** | Remove the conversation |

::: tip Managing Conversations
- **Export important outputs** so they don't get buried in the history.
- **Rename conversations** with the date and purpose for easy searching.
- **Delete test runs** regularly to keep the list clean.
:::

## Outputs

::: info Coming Soon
The Outputs feature will combine your data, agents, and workflow results into polished, shareable deliverables.
:::

## Sharing and Permissions

Control who can access each workflow:

| Permission | What It Allows |
|------------|---------------|
| **View** | See the workflow and its results (read-only) |
| **Edit** | Modify the workflow structure and settings |
| **Delete** | Remove the workflow |
| **Manage** | Share the workflow and change others' permissions |

### How to Share

1. Click **Share** from the top bar or the card menu.
2. Set workspace-wide access or invite specific people.
3. Assign permission levels.
4. Save your changes.

## Real-World Use Cases

### Weekly Campaign Digest

**Scenario:** Your team runs multiple campaigns and leadership wants a consolidated weekly summary.

**How to build it:**
1. Add all active campaigns as sources.
2. Add a data analysis agent with the prompt: *"Analyze all campaign responses from the past week. Extract response counts, sentiment trends, and top themes for each campaign."*
3. Add a report generation agent: *"Create an executive summary with key findings, notable quotes, and recommendations for next steps."*
4. Schedule for Monday at 7 AM.
5. Enable email notifications for leadership.

### Competitive Intelligence Pipeline

**Scenario:** You want ongoing analysis of how consumers perceive your competitors.

**How to build it:**
1. Add your competitor intelligence datasets as sources.
2. Connect campaigns that mention competitors.
3. Add a competitor analysis agent: *"Identify all mentions of competitors. Categorize by pricing, features, brand perception, and switching intent."*
4. Add a trends agent: *"Compare this week's competitive mentions to previous weeks. Highlight shifts in perception or emerging threats."*
5. Schedule weekly for fresh competitive insights.

### Automated Video Response Analysis

**Scenario:** You collect hundreds of video survey responses and need them analyzed systematically.

**How to build it:**
1. Select campaigns with video responses as sources.
2. Add an analysis agent: *"Review all video transcripts. Summarize key points, emotional tone, and unique perspectives from each respondent."*
3. Add a theme extraction agent: *"Identify the top 5 themes across all video responses. For each, note frequency and sentiment."*
4. Add a highlights agent: *"Select the 3 most compelling video segments that represent the key themes. Note why each is notable."*
5. Run daily during active data collection, weekly once responses stabilize.

### Campaign Launch Monitoring

**Scenario:** You've launched a high-stakes campaign and need to catch quality issues early.

**How to build it:**
1. Create a workflow targeting the specific campaign.
2. Add a quality monitor agent: *"Review new responses for survey confusion, technical issues, inappropriate content, or extreme negative sentiment. Flag any concerns."*
3. Add an alert agent: *"If issues are detected, create a brief alert with issue type, affected response count, severity, and recommended action."*
4. Schedule hourly during launch week, then reduce to daily.
5. Enable email notifications for your research team.

### Multi-Source Research Synthesis

**Scenario:** Combine insights from customer feedback, competitive research, and industry reports into unified strategic recommendations.

**How to build it:**
1. Add multiple datasets as sources — customer research, competitor analysis, market reports.
2. Add a cross-reference agent: *"Find common themes and contradictions across all sources. Note areas of consensus and disagreement."*
3. Add a synthesis agent: *"Create a unified market narrative incorporating customer voice, competitive positioning, and industry trends."*
4. Add a recommendations agent: *"Provide 3–5 strategic recommendations with supporting evidence from the sources."*
5. Schedule monthly to support strategic planning cycles.

## Best Practices

### Workflow Design

- **Start simple** — get a two-agent workflow running before adding complexity.
- **Test with sample data** — run manually with a small dataset before scheduling.
- **Monitor the first few runs** — watch the Run tab to make sure agents produce what you expect.
- **Write clear descriptions** — so teammates understand what each workflow does at a glance.

### Agent Configuration

- Give each agent a specific, focused task prompt. Vague instructions lead to vague results.
- Order agents logically — extraction first, analysis second, reporting last.
- Enable the **Tools** toggle when agents need access to additional capabilities.

### Scheduling

- Always test a workflow manually before enabling a schedule.
- Start with weekly frequency and increase only if you truly need more frequent updates.
- Set up email notifications so you know when results are ready.
- Review your scheduled runs periodically to retire workflows you no longer need.

### Data Sources

- Select only the sources that are relevant — more data doesn't always mean better results.
- Make sure uploaded files are fully processed before running a workflow that references them.
- Test with a smaller subset of data first to validate your agent prompts.

## Troubleshooting

### Workflow Won't Save

1. Check for validation errors — all agent tasks need a prompt.
2. Make sure all required fields are filled in.
3. Verify you have edit permission.
4. Try refreshing the page.

### Execution Fails

1. Check the **Run** tab for specific error messages.
2. Review individual agent outputs to see where things went wrong.
3. Verify your data sources are available and fully processed.
4. Simplify agent prompts if they're too complex.

### Schedule Not Running

1. Confirm the schedule is configured correctly in the Schedule dialog.
2. Make sure the workflow has no validation errors.
3. Check that there are no unsaved changes.
4. Review the **Upcoming Runs** tab for status information.

### Agent Producing Unexpected Output

1. Review and clarify the task prompt — be more specific about what you want.
2. Check that the agent has access to the right data sources.
3. Enable the **Tools** toggle if the agent needs additional capabilities.
4. Try breaking a complex task into two simpler agent steps.
5. Test the agent separately in a conversation to debug the prompt.

## Frequently Asked Questions

::: details Click to expand

**Q: How many agents can I add to a workflow?**
There's no hard limit, but 3–7 agents works best. More agents increase processing time.

**Q: Can a workflow pull data from multiple campaigns?**
Yes. Add multiple campaigns as sources and the workflow processes data from all of them.

**Q: What happens if a workflow fails in the middle?**
It stops at the failed step. Check the error in the Run tab, fix the issue, and re-run.

**Q: Can I edit a workflow while it's running?**
No. Wait for it to finish or cancel the run first.

**Q: How do I share results with stakeholders?**
Use the **Conversations** tab to export or copy outputs. You can also enable email notifications to automatically send results.

**Q: Do scheduled workflows run when I'm logged out?**
Yes. Scheduled workflows run on the server regardless of whether you're logged in.

**Q: Can agents in a workflow see previous agents' output?**
Yes. Each agent can reference outputs from the agents that ran before it.

**Q: Can I run the same workflow with different settings?**
Yes. Use input parameters and save different variable sets for different configurations.

**Q: Can I duplicate an existing workflow?**
Yes. Click **Copy** from the workflow card menu.

**Q: How do I know which agent is currently running?**
The **Run** tab shows real-time progress with visual indicators on each agent step.
:::

## Next Steps

- [Create agents to power your workflows](/guide/agents)
- [Prepare datasets for workflow processing](/guide/datasets)
- [Set up campaigns for workflow automation](/guide/campaigns)
- [Use the chat interface for ad-hoc research](/guide/home)
