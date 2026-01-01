# Campaigns

Campaigns are video-powered surveys that collect research data, test concepts, and generate insights. This is the core research collection tool in Vurvey.

## Overview

![Campaigns Dashboard](/screenshots/campaigns/01-campaigns-gallery.png)

The Campaigns section provides a dashboard to create, manage, and analyze your research surveys with integrated templates, usage tracking, and AI-powered video highlights.

## Navigation Tabs

The Campaigns page has four main tabs:

| Tab | Icon | Purpose |
|-----|------|---------|
| **All Campaigns** | Megaphone | Dashboard view of all campaigns |
| **Templates** | Template | Browse categorized campaign templates |
| **Usage** | Chart | View workspace analytics and credit usage |
| **Magic Reels** | Sparkle | AI-generated video highlight reels |

## All Campaigns

The default view displays your campaigns in a card grid layout.

### Campaign Cards

Each campaign displays as a card showing:

#### Status Badge

A colored badge in the top-left indicates the campaign status:

| Status | Description |
|--------|-------------|
| **Draft** | In development, not collecting responses |
| **Open** | Actively collecting responses |
| **Closed** | Collection complete |
| **Blocked** | Temporarily paused |
| **Archived** | Inactive but preserved |

#### Campaign Information

- **Name** - Campaign title (truncated if long)
- **Creator** - "by [Name]" showing who created it

#### Video Preview

The center of each card shows:
- Up to 5 video thumbnails from responses
- Placeholder boxes if no responses yet
- "+N more" overlay when additional responses exist

#### Metadata Chips

The bottom of each card displays:

| Chip | Icon | Shows |
|------|------|-------|
| **Questions** | Question bubble | Number of questions |
| **Duration** | Camera | Total video minutes |
| **Credits** | Vurvey icon | Credit reward amount |
| **AI Summary** | Sparkle | Indicates AI insights available |

### Campaign Actions

Click the three-dot menu on any campaign card to access:

| Action | Description |
|--------|-------------|
| **Start Conversation** | Open AI chat with campaign data (requires responses) |
| **Share** | Manage who can access this campaign |
| **Preview** | Open campaign editor |
| **Copy** | Duplicate the campaign |
| **Delete** | Permanently remove |

::: warning Permissions
Available actions depend on your permission level. Some options may not appear if you lack the required access.
:::

### Filtering and Sorting

Use the controls above the card grid:

**Status Filter:**
- All statuses
- Open
- Draft
- Closed
- Blocked
- Archived

**Sort By:**
- Name (A-Z / Z-A)
- Most Recently Updated / Oldest Updated
- Newest Opened / Oldest Opened
- Most Recently Closed / Oldest Closed
- Lowest Question Count / Highest Question Count
- Lowest Responses Count / Highest Responses Count
- Lowest Highlight Count / Highest Highlight Count
- Lowest Video Minutes / Highest Video Minutes

### Creating Campaigns

Click **Create Campaign** to start a new survey.

#### Creation Options

1. **Manual** - Start with a blank campaign
2. **From Objectives** - AI-powered generation from research goals
3. **From Template** - Use an existing template

After creation, you'll be taken to the campaign editor to configure questions and settings.

## Templates

![Templates Page](/screenshots/campaigns/03-templates.png)

Browse pre-built campaign templates organized by category.

### Template Categories

Templates are organized into groups:

| Group | Contents |
|-------|----------|
| **Featured** | Popular and trending templates |
| **Use Case** | Templates by research use case |
| **Function** | Templates by technical function |

Click a category in the left sidebar to view templates in that group.

### Template Cards

Each template shows:

- **Headline** - Template name
- **Description** - What the template is for
- **Question Count** - Number of pre-built questions (with question icon)
- **Reward Amount** - Suggested incentive (with star icon, if specified)
- **Estimated Time** - Expected completion time in minutes (with clock icon, if specified)

### Using Templates

1. Browse templates by category
2. Review the template details
3. Click **Use Template**
4. The new campaign opens in the editor
5. Customize questions and settings as needed

## Usage

![Usage Page](/screenshots/campaigns/04-usage.png)

View workspace analytics and credit consumption.

### Activity Charts

Visualizations showing:
- Response trends over time
- Community growth metrics
- Total video minutes collected

### Credit Usage

Monitor your workspace credits:
- Current credit balance
- Credit usage over time
- Option to add more credits

## Magic Reels

![Magic Reels](/screenshots/campaigns/05-magic-reels.png)

AI-powered video highlight reels generated from campaign responses.

### Reels Table

View all your magic reels in a sortable table:

| Column | Description |
|--------|-------------|
| **Name** | Reel title (clickable) |
| **Length** | Duration in MM:SS format |
| **Status** | Current status |
| **Last updated** | When the reel was modified |
| **Options** | Copy and delete actions |

### Reel Status

| Status | Meaning |
|--------|---------|
| **Published** | Reel's video has been successfully created and is ready to view |
| **Draft** | Reel has not yet been published |
| **Processing** | Reel is published and waiting for video creation job |
| **Failed** | Video creation job has encountered an error |
| **Unpublished Changes** | Reel has been published but has unpublished updates |

### Creating Reels

1. Click **Add Reel**
2. Select campaign videos to include
3. Configure reel settings
4. Let AI generate highlights
5. Review and publish

### Managing Reels

Use the options menu on each reel to:
- **Copy** - Duplicate the reel
- **Delete** - Remove the reel

## Campaign Status Guide

Understanding campaign lifecycle:

| Status | Available Actions |
|--------|-------------------|
| **Draft** | Edit, Preview, Launch |
| **Open** | Monitor, Pause, Close, View Results |
| **Closed** | View Results, Export, Archive, Reopen |
| **Blocked** | Review, Resume, Close |
| **Archived** | View Results, Unarchive, Delete |

### Status Transitions

```
Draft → Open → Closed → Archived
         ↓
      Blocked → Closed
```

- **Draft → Open**: Launch to start collecting responses
- **Open → Closed**: Stop accepting new responses
- **Open → Blocked**: Temporarily pause collection
- **Closed → Archived**: Move to archive for storage
- **Any → Draft**: Return to editing mode

## Campaign Navigation

When viewing a campaign, you'll see additional tabs:

### Questions Tab
- Edit survey questions
- Rearrange question order
- Configure question types

### Results Tab
- View collected responses
- Watch video responses
- Review AI-generated insights

### Settings Tab
- Configure campaign settings
- Set incentives and targeting
- Manage permissions

## Best Practices

### Creating Effective Campaigns

1. **Clear Objectives** - Define what you want to learn
2. **Concise Questions** - Keep questions focused and easy to understand
3. **Appropriate Length** - Balance depth with participant time
4. **Test First** - Preview before launching
5. **Monitor Quality** - Review early responses for issues

### Using Templates

- Start with a template that matches your research goal
- Customize questions to your specific needs
- Keep the proven structure, adjust the content
- Save successful campaigns as custom templates

### Maximizing Response Quality

- Provide clear instructions
- Set appropriate incentives
- Target the right audience
- Follow up promptly on responses
- Use AI insights to identify patterns

## Next Steps

- [Create agents to analyze campaign data](/guide/agents)
- [Upload campaign results to datasets](/guide/datasets)
- [Target populations with campaigns](/guide/people)
- [Automate campaign workflows](/guide/workflows)
