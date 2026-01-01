# Campaigns

Campaigns are video-powered surveys that collect research data, test concepts, and generate insights. This is the core research collection tool in Vurvey.

## Overview

![Campaigns Dashboard](/screenshots/campaigns/01-campaigns-gallery.png)

The Campaigns section provides a dashboard to create, manage, and analyze your research surveys with integrated templates, usage tracking, and AI-powered video highlights.

::: tip What Are Campaigns?
Campaigns are more than traditional surveys - they're video-first research tools that capture the emotions, expressions, and authentic voices of your respondents. Combine structured questions with open-ended video responses for richer insights.
:::

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

| Status | Description | Typical Use |
|--------|-------------|-------------|
| **Draft** | In development, not collecting responses | Building and testing |
| **Open** | Actively collecting responses | Live research |
| **Closed** | Collection complete | Analysis phase |
| **Blocked** | Temporarily paused | Investigating issues |
| **Archived** | Inactive but preserved | Long-term storage |

::: tip Pro Tip: Status Best Practices
- Keep campaigns in **Draft** until fully tested
- **Close** campaigns promptly after meeting response goals
- **Archive** rather than delete to preserve data history
- Use **Blocked** sparingly - only for urgent issues
:::

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

::: tip Pro Tip: Power User Sorting
- Sort by **Response Count (Low)** to find campaigns needing attention
- Sort by **Oldest Updated** to identify stale drafts
- Filter by **Open** status for active project management
:::

### Creating Campaigns

Click **Create Campaign** to start a new survey.

#### Creation Options

1. **Manual** - Start with a blank campaign
2. **From Objectives** - AI-powered generation from research goals
3. **From Template** - Use an existing template

::: tip Pro Tip: AI-Powered Creation
Use "From Objectives" for fastest results:
1. Describe your research goals in plain language
2. AI generates appropriate questions
3. Review and customize as needed
4. Launch faster than building from scratch
:::

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

::: tip Pro Tip: Template Customization
Templates are starting points, not final products:
- **Always customize** questions to your specific context
- **Adjust incentives** based on your audience
- **Add your branding** to questions and landing pages
- **Test thoroughly** before launching
:::

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

::: tip Understanding Credits
Credits are consumed when:
- Respondents complete surveys with incentives
- AI processes video responses
- Magic Reels are generated

Plan campaigns to stay within budget - check usage before launching large campaigns.
:::

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

::: tip Pro Tip: Effective Magic Reels
- **Select diverse clips** for a representative sample
- **Include emotional moments** that resonate
- **Keep under 3 minutes** for attention span
- **Add context** in the description
- **Share immediately** while insights are fresh
:::

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

::: tip Pro Tip: Lifecycle Best Practices
1. **Test in Draft** - Use Preview mode thoroughly
2. **Launch strategically** - Consider timing and audience availability
3. **Monitor actively** - Check response quality early
4. **Close promptly** - Don't leave campaigns open indefinitely
5. **Archive systematically** - Organize by quarter or project
:::

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

## Real-World Use Cases

### Use Case 1: Product Concept Testing

**Scenario:** You need quick feedback on 3 product concepts before a board meeting.

**Approach:**
1. Create a campaign from the "Concept Test" template
2. Upload concept images/videos as stimuli
3. Add structured rating questions + open-ended video responses
4. Target your customer panel
5. Launch with a 48-hour deadline

**Sample Questions:**
- "On a scale of 1-10, how interested are you in this product?"
- "Record a video explaining why you would or wouldn't buy this"
- "What would make this product better?"

::: tip Pro Tip: Concept Testing
- Test one concept per question set to avoid confusion
- Include a purchase intent question for comparability
- Ask for specific improvement suggestions
- Use Magic Reels to share compelling customer feedback
:::

### Use Case 2: Customer Satisfaction Research

**Scenario:** You want ongoing feedback from customers post-purchase.

**Approach:**
1. Create a short satisfaction survey (3-5 questions)
2. Set up integration with your CRM or email system
3. Send automatically after purchase
4. Monitor weekly for trends

**Sample Questions:**
- "How satisfied are you with your recent purchase?"
- "Record a quick video about your experience"
- "Would you recommend us to a friend?"

::: tip Pro Tip: Satisfaction Surveys
- Keep it short (under 5 minutes)
- Ask for video testimonials you can use
- Include NPS question for benchmarking
- Set up alerts for low satisfaction scores
:::

### Use Case 3: Competitive Analysis via Consumers

**Scenario:** You want to understand how consumers compare you to competitors.

**Approach:**
1. Create a comparison-focused survey
2. Show competitor materials alongside your own
3. Ask for honest video feedback
4. Use AI to analyze sentiment patterns

**Sample Questions:**
- "Compare these two products - which do you prefer and why?"
- "What does Brand A do better than Brand B?"
- "If price was the same, which would you choose?"

::: tip Pro Tip: Competitive Research
- Be ethical - don't mislead about sponsorship
- Include neutral options
- Ask for reasoning, not just preferences
- Look for patterns in video responses
:::

### Use Case 4: Usability Testing

**Scenario:** You're redesigning your app and need user feedback.

**Approach:**
1. Create a campaign with screen share videos
2. Give specific tasks to complete
3. Ask users to think aloud
4. Analyze pain points and confusion

**Sample Questions:**
- "Navigate to [feature] and describe what you see"
- "How would you complete [task]? Show us on screen"
- "What was confusing or frustrating?"
- "What did you like about this experience?"

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

### Question Design Tips

::: details Click to Expand Question Design Tips

**For Rating Questions:**
- Use consistent scales (1-5 or 1-10)
- Define scale endpoints clearly
- Avoid leading language
- Include a middle/neutral option

**For Video Questions:**
- Keep prompts specific
- Suggest a time limit
- Give permission to be honest
- Ask for examples or stories

**For Open-Ended Text:**
- Ask one thing at a time
- Provide enough context
- Specify desired length
- Avoid yes/no questions

**Question Order:**
- Start easy to build momentum
- Put sensitive questions in the middle
- End with open feedback opportunity
- Group related questions together
:::

## Troubleshooting

### Common Issues and Solutions

#### Low Response Rates

**Symptoms:** Campaign has few responses despite being open.

**Solutions:**
1. **Check incentive** - Is it competitive for your audience?
2. **Review length** - Long surveys get fewer completions
3. **Verify targeting** - Is the audience available?
4. **Test the link** - Ensure the campaign URL works
5. **Send reminders** - Follow up with non-responders

#### Poor Video Quality

**Symptoms:** Respondents submit unclear or off-topic videos.

**Solutions:**
1. **Clarify prompts** - Be more specific about expectations
2. **Add examples** - Show what a good response looks like
3. **Check incentives** - Low rewards attract low effort
4. **Pre-screen respondents** - Use qualification questions

#### AI Insights Not Generating

**Symptoms:** AI summary or insights not appearing.

**Solutions:**
1. **Wait for processing** - AI needs time after responses come in
2. **Check response count** - Some features need minimum responses
3. **Refresh the page** - Insights may have loaded
4. **Contact support** if stuck for extended time

#### Campaign Won't Launch

**Symptoms:** Launch button disabled or errors when launching.

**Solutions:**
1. **Check required fields** - All mandatory settings must be filled
2. **Verify questions** - At least one question is required
3. **Review settings** - Check date ranges and targeting
4. **Check permissions** - You may need admin approval

### Getting Help

If issues persist:
1. **Document the campaign ID** and specific error
2. **Take screenshots** of the problem
3. **Check the [Community](https://community.vurvey.com)** for similar issues
4. **Contact support** via the Help menu

## Frequently Asked Questions

::: details FAQs (Click to Expand)

**Q: How many questions can I include?**
A: There's no hard limit, but we recommend 5-15 questions. More than 20 significantly reduces completion rates.

**Q: Can I edit a campaign after it's open?**
A: Minor edits are possible, but major changes (adding/removing questions) should be avoided. Consider closing and creating a new version.

**Q: How long should campaigns stay open?**
A: It depends on your goals. Most campaigns achieve target responses within 2-4 weeks. Don't leave campaigns open indefinitely.

**Q: Can I target specific demographics?**
A: Yes, use the targeting settings to specify age, location, gender, and custom properties.

**Q: How are credits consumed?**
A: Credits are used for respondent incentives and AI processing. Check the Usage tab for detailed tracking.

**Q: Can I export raw data?**
A: Yes, use the Results tab to export responses in various formats (CSV, JSON, etc.).

**Q: What happens to responses if I delete a campaign?**
A: Deleted campaign data is lost permanently. Archive instead of deleting to preserve data.

**Q: Can I reuse questions across campaigns?**
A: Not directly, but you can copy campaigns and modify them, or save as templates.

**Q: How do I share results with stakeholders?**
A: Use Magic Reels for video highlights, export data for analysis, or share the campaign with view permissions.

**Q: What's the difference between Close and Archive?**
A: **Close** stops responses but keeps the campaign visible. **Archive** moves it to long-term storage.
:::

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + N` | Create new campaign |
| `Cmd/Ctrl + S` | Save campaign (in editor) |
| `Escape` | Close modals |
| `Enter` | Confirm dialogs |

## Next Steps

- [Create agents to analyze campaign data](/guide/agents)
- [Upload campaign results to datasets](/guide/datasets)
- [Target populations with campaigns](/guide/people)
- [Automate campaign workflows](/guide/workflows)
