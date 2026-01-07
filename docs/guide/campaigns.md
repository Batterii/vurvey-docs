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

## All Campaigns Dashboard

The default view displays your campaigns in a card grid layout.

### Campaign Cards

Each campaign displays as a card showing:

#### Status Badge

A colored badge in the top-left indicates the campaign status:

| Status | Color | Description | Typical Use |
|--------|-------|-------------|-------------|
| **Draft** | Cyan | In development, not collecting responses | Building and testing |
| **Open** | Lime Green | Actively collecting responses | Live research |
| **Closed** | Red | Collection complete | Analysis phase |
| **Blocked** | Teal | Temporarily paused | Investigating issues |
| **Archived** | Teal | Inactive but preserved | Long-term storage |

::: tip Pro Tip: Status Best Practices
- Keep campaigns in **Draft** until fully tested with Preview mode
- **Close** campaigns promptly after meeting response goals
- **Archive** rather than delete to preserve data history
- Use **Blocked** sparingly - only for urgent issues like inappropriate responses
:::

#### Campaign Information

- **Name** - Campaign title (truncated if long, single line with ellipsis)
- **Creator** - "by [Name]" showing who created it
- **Video Preview** - Up to 5 video thumbnails from responses
  - Empty state shows placeholder boxes
  - Shows "+N more completes" overlay when additional responses exist

#### Metadata Chips

The bottom of each card displays:

| Chip | Icon | Shows |
|------|------|-------|
| **Questions** | Question bubble | Number of questions in the campaign |
| **Duration** | Camera | Total video minutes collected |
| **Credits** | Vurvey icon | Credit reward amount (if using credits) |
| **AI Summary** | Sparkle | Indicates AI insights are available |

### Campaign Card Actions

Click the three-dot menu on any campaign card to access:

| Action | Icon | Condition | Description |
|--------|------|-----------|-------------|
| **Start Conversation** | Sparkle | Status is Open/Closed AND has responses | Open AI chat with campaign data |
| **Share** | Share | Has MANAGE permission | Manage who can access this campaign |
| **Preview** | Expand | Always | Open campaign editor |
| **Copy** | Documents | Has EDIT permission | Duplicate the campaign |
| **Delete** | Bin | Has DELETE permission | Permanently remove |

::: warning Permissions
Available actions depend on your permission level. Some options may not appear if you lack the required access. The platform uses OpenFGA for fine-grained access control.
:::

### Filtering and Sorting

Use the controls above the card grid:

**Status Filter:**
- All statuses (default)
- Open
- Draft
- Closed
- Blocked
- Archived

**Sort By (16 options):**
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
- Sort by **Video Minutes (High)** to find content-rich campaigns for reels
:::

## Creating Campaigns

Click **Create Campaign** to start a new survey.

### Creation Options

You have three ways to create a campaign:

| Method | Best For | Speed |
|--------|----------|-------|
| **Manual** | Complete control, custom research | Slowest |
| **From Template** | Proven research patterns | Fast |
| **From Objectives** | AI-powered question generation | Fastest |

#### Manual Creation

Start with a blank campaign and build from scratch:

1. Click **Create Campaign**
2. Select **Manual**
3. Enter campaign name
4. You'll be taken to the campaign editor to add questions

#### From Template

Use pre-built research patterns:

1. Click **Create Campaign** or navigate to Templates tab
2. Browse templates by category
3. Click **Use Template**
4. Customize questions and settings
5. Launch when ready

#### From Objectives (AI-Powered)

Let AI generate questions from your research goals:

1. Click **Create Campaign**
2. Select **From Objectives**
3. Complete the 3-step wizard:

**Step 1: Objectives**
- Enter your research objectives in plain language
- Example: "Understand how customers feel about our new packaging design"
- Be specific about what insights you need

**Step 2: Review Questions**
- AI generates appropriate questions based on objectives
- Review each question
- Edit, remove, or reorder as needed
- Add additional questions manually

**Step 3: Configure & Launch**
- Set campaign settings
- Configure incentives
- Choose targeting
- Preview and launch

::: tip Pro Tip: AI-Powered Creation
Use "From Objectives" for fastest results:
- Describe your research goals in plain language
- Include specific topics you want to explore
- Mention your target audience for better question framing
- Review AI suggestions carefully - they're starting points, not final
:::

## Campaign Editor

After creating a campaign, you'll enter the campaign editor to configure everything.

### Editor Navigation

The campaign editor has several sections accessible via tabs:

| Tab | Purpose |
|-----|---------|
| **Questions** | Add and configure survey questions |
| **Settings** | Campaign configuration and targeting |
| **Preview** | Test the respondent experience |
| **Results** | View responses and insights (after launch) |

## Question Types

Vurvey supports 13 distinct question types across multiple modalities:

### Video Questions

#### VIDEO (Video Recording)
Respondents record video answers using their device camera.

| Setting | Options | Description |
|---------|---------|-------------|
| **Time Limit** | 15s, 30s, 60s, 90s, 2min, 3min, 5min | Maximum recording duration |
| **Required** | Yes/No | Must respondent answer? |
| **Follow-up** | Enable/Disable | Add follow-up questions based on response |

::: tip Pro Tip: Video Questions
- 30-60 seconds works best for most questions
- Give permission to be honest in your prompt
- Ask for specific examples or stories
- Shorter limits = higher completion rates
:::

#### VIDUPLOAD (Video Upload)
Respondents upload pre-recorded videos.

| Setting | Options | Description |
|---------|---------|-------------|
| **Max File Size** | Configurable | Maximum upload size |
| **Formats** | MP4, MOV, AVI | Accepted video formats |
| **Required** | Yes/No | Must respondent upload? |

### Choice Questions

#### CHOICE (Single Select)
Respondents select one option from a list.

| Setting | Options | Description |
|---------|---------|-------------|
| **Choices** | Custom list | Answer options |
| **Shuffle** | Yes/No | Randomize order to reduce bias |
| **Other Option** | Yes/No | Allow custom "Other" response |
| **Required** | Yes/No | Must respondent answer? |

#### MULTISELECT (Multiple Select)
Respondents select multiple options from a list.

| Setting | Options | Description |
|---------|---------|-------------|
| **Choices** | Custom list | Answer options |
| **Min Selections** | Number | Minimum required selections |
| **Max Selections** | Number | Maximum allowed selections |
| **Shuffle** | Yes/No | Randomize order |
| **Other Option** | Yes/No | Allow custom response |

#### RANKED (Ranking)
Respondents drag and drop to rank items in order.

| Setting | Options | Description |
|---------|---------|-------------|
| **Items** | Custom list | Items to rank |
| **Rank All** | Yes/No | Must rank all items? |
| **Max Ranks** | Number | Limit rankings to top N |

### Rating Questions

#### STAR (Star Rating)
Respondents rate using a star scale (1-5).

| Setting | Options | Description |
|---------|---------|-------------|
| **Max Stars** | 3, 4, 5 | Number of stars |
| **Labels** | Custom | Text for low/high ends |
| **Half Stars** | Yes/No | Allow half-star ratings |

#### SLIDER (Numeric Slider)
Respondents slide to select a value on a range.

| Setting | Options | Description |
|---------|---------|-------------|
| **Min Value** | Number | Lowest value |
| **Max Value** | Number | Highest value |
| **Step** | Number | Increment amount |
| **Labels** | Custom | Text for min/max ends |
| **Show Value** | Yes/No | Display current selection |

### Text Questions

#### SHORT (Short Text)
Respondents enter brief text responses.

| Setting | Options | Description |
|---------|---------|-------------|
| **Max Length** | Number | Character limit |
| **Placeholder** | Text | Helper text in field |
| **Required** | Yes/No | Must respondent answer? |

#### LONG (Long Text)
Respondents enter detailed text responses.

| Setting | Options | Description |
|---------|---------|-------------|
| **Max Length** | Number | Character limit |
| **Min Length** | Number | Minimum characters |
| **Rows** | Number | Visible text area height |

#### NUMBER (Numeric Input)
Respondents enter a number.

| Setting | Options | Description |
|---------|---------|-------------|
| **Min** | Number | Minimum allowed value |
| **Max** | Number | Maximum allowed value |
| **Decimal Places** | Number | Precision allowed |
| **Unit** | Text | Label (e.g., "$", "kg") |

### Media Questions

#### PICTURE (Image Upload)
Respondents upload images.

| Setting | Options | Description |
|---------|---------|-------------|
| **Max Files** | Number | Maximum images allowed |
| **Formats** | JPG, PNG, etc. | Accepted formats |
| **Max Size** | MB | Per-file size limit |

#### PDF (Document Upload)
Respondents upload PDF documents.

| Setting | Options | Description |
|---------|---------|-------------|
| **Max Files** | Number | Maximum PDFs allowed |
| **Max Size** | MB | Per-file size limit |

### Specialty Questions

#### BARCODE (Barcode Scanner)
Respondents scan product barcodes with their camera.

| Setting | Options | Description |
|---------|---------|-------------|
| **Barcode Types** | UPC, EAN, QR, etc. | Accepted formats |
| **Verify** | Yes/No | Validate against database |

### Question Configuration

All question types share common configuration options:

| Setting | Description |
|---------|-------------|
| **Question Text** | The question prompt shown to respondents |
| **Description** | Optional helper text below the question |
| **Required** | Whether respondents must answer |
| **Media Attachment** | Add image, video, or AR model as stimulus |
| **Conditional Logic** | Show/hide based on previous answers |
| **Order** | Position in the survey flow |

### Adding Media Stimuli

You can attach media to any question to provide context:

| Media Type | Use Case |
|------------|----------|
| **Image** | Product photos, concepts, designs |
| **Video** | Ads, product demos, explanations |
| **AR Model** | 3D product visualization |

::: tip Pro Tip: Question Design
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

## Campaign Settings

### Basic Settings

| Setting | Description |
|---------|-------------|
| **Campaign Name** | Internal identifier |
| **Description** | Purpose and goals (internal) |
| **Language** | Primary language for respondents |
| **Status** | Draft, Open, Closed, etc. |

### Participation Settings

| Setting | Options | Description |
|---------|---------|-------------|
| **Participation Level** | Open, Invite Only | Who can respond |
| **Response Limit** | Number or Unlimited | Maximum responses |
| **One Response Per User** | Yes/No | Prevent duplicate responses |
| **Anonymous** | Yes/No | Hide respondent identity |

### Response Settings

| Setting | Options | Description |
|---------|---------|-------------|
| **Video Quality** | Standard, High | Recording quality |
| **Allow Retakes** | Yes/No | Can respondents re-record? |
| **Max Retakes** | Number | Limit retake attempts |
| **Auto-Save** | Yes/No | Save partial responses |

### Scheduling

| Setting | Description |
|---------|-------------|
| **Start Date** | When campaign opens |
| **End Date** | When campaign closes |
| **Timezone** | For scheduling |

### Intro & Branding

Customize the respondent experience:

| Element | Description |
|---------|-------------|
| **Title** | Shown to respondents |
| **Intro Text** | Welcome message |
| **Instructions** | How to participate |
| **Disclaimer** | Legal/consent text |
| **Logo** | Brand logo |
| **Cover Image** | Header image |

### Incentives

Configure rewards for respondents:

| Method | Description |
|--------|-------------|
| **Credits** | Vurvey credits (internal currency) |
| **Cash** | Direct payment via Tremendous |
| **Gift Cards** | Retailer gift cards |
| **None** | No incentive |

For paid incentives:

| Setting | Description |
|---------|-------------|
| **Amount** | Reward value |
| **Currency** | USD, EUR, etc. |
| **Distribution** | Automatic or Manual |
| **Qualification** | Requirements to earn |

## Targeting & Audience

### Invitation Methods

| Method | Description |
|--------|-------------|
| **Email Invite** | Send to specific contacts |
| **Share Link** | Public or authenticated link |
| **QR Code** | Scannable link |
| **Groups/Lists** | Target saved segments |
| **Embed** | Include in website/app |

### Demographic Targeting

| Filter | Options |
|--------|---------|
| **Age Range** | Min-max age |
| **Gender** | Male, Female, Non-binary, etc. |
| **Location** | Country, State, City |
| **Language** | Primary language |

### Custom Targeting

| Type | Description |
|------|-------------|
| **Properties** | Filter by custom contact properties |
| **Segments** | Target dynamic rule-based groups |
| **Lists** | Target static contact lists |
| **Previous Campaigns** | Include/exclude by past participation |

### AI Populations (Synthetic Testing)

Test campaigns with AI-generated audiences before real launch:

1. Select **AI Population** in targeting
2. Choose population demographics
3. Configure number of synthetic responses
4. Run simulation
5. Review AI-generated responses
6. Refine questions based on results
7. Launch to real audience

::: tip Pro Tip: Targeting Strategy
- **Broad studies**: Use demographic filters only
- **Customer research**: Target by property (e.g., customer tier)
- **Concept testing**: Use AI populations first, then real customers
- **Follow-up studies**: Filter by previous campaign participation
:::

## Launching Campaigns

### Pre-Launch Checklist

Before launching, verify:

- [ ] All questions configured correctly
- [ ] Settings reviewed and finalized
- [ ] Incentives configured (if applicable)
- [ ] Targeting set appropriately
- [ ] Preview tested on mobile and desktop
- [ ] Start/end dates correct
- [ ] Team has reviewed

### Launch Flow

1. Complete all configuration
2. Click **Preview** to test
3. Fix any issues found
4. Click **Launch** or **Open Campaign**
5. Confirm launch dialog
6. Campaign status changes to **Open**
7. Send invitations or share link

### Post-Launch

After launch:
- Monitor responses in real-time
- Check response quality early
- Watch for technical issues
- Adjust incentives if needed (with caution)
- Close when goals met

## Campaign Results

### Results Dashboard

The Results tab shows:

#### Summary Statistics

| Metric | Description |
|--------|-------------|
| **Total Responses** | Number of completions |
| **Completion Rate** | Started vs. completed |
| **Average Duration** | Time to complete |
| **Video Minutes** | Total video collected |
| **Response Trend** | Responses over time chart |

#### Response List

View individual responses with:
- Respondent info (or anonymous)
- Completion timestamp
- Response quality indicators
- Video playback
- All answers

### Viewing Responses

Click any response to see:

#### Video Playback
- Full video player with controls
- Playback speed adjustment (0.5x, 1x, 1.5x, 2x)
- Download option
- Share clip option

#### Transcript
- AI-generated transcript of video
- Searchable text
- Timestamp links
- Download as text
- Copy to clipboard

#### Response Data
- All question answers
- Metadata (device, location, duration)
- Quality indicators

### Transcripts

Every video response automatically generates a transcript:

| Feature | Description |
|---------|-------------|
| **Auto-Generation** | Transcripts created automatically |
| **Timestamps** | Click to jump to video position |
| **Searchable** | Find specific words/phrases |
| **Downloadable** | Export as text file |
| **Editable** | Correct transcription errors |

::: tip Pro Tip: Working with Transcripts
- Use search to find mentions of specific topics
- Click timestamps to verify context in video
- Export transcripts for external analysis
- Search across all responses for patterns
:::

### Creating Highlights

Highlight compelling moments from video responses:

#### Method 1: From Video Player
1. Play response video
2. Click **Create Highlight** at moment of interest
3. Set start/end timestamps
4. Add title and description
5. Save highlight

#### Method 2: From Transcript
1. Open response transcript
2. Select text passage
3. Click **Create Highlight from Selection**
4. Timestamps auto-set from selection
5. Review and save

#### Method 3: AI-Suggested
1. Click **AI Highlights** on response
2. Review AI-suggested moments
3. Accept, edit, or reject each
4. Save selected highlights

### Video Clips

Create shareable video clips from responses:

1. Navigate to response video
2. Click **Create Clip**
3. Set start and end times
4. Add title
5. Choose quality
6. Click **Generate Clip**
7. Download or share

### AI Insights

AI automatically analyzes your campaign data:

#### Survey-Level Insights
- Overall themes and patterns
- Sentiment analysis
- Key findings summary
- Statistical breakdowns

#### Question-Level Insights
- Answer distributions
- Common themes per question
- Notable outliers
- Comparison to benchmarks

#### Video Insights
- Emotional analysis
- Topic detection
- Speaker sentiment
- Key quote extraction

::: tip Pro Tip: AI Insights
- Review AI insights after 10+ responses
- Use insights to identify patterns
- Export insights for reports
- Combine with manual review for best results
:::

### Exporting Data

Export campaign data in multiple formats:

| Format | Contents |
|--------|----------|
| **CSV** | All response data in spreadsheet format |
| **JSON** | Structured data for developers |
| **PDF Report** | Formatted summary report |
| **Video Download** | All videos in ZIP archive |
| **Transcript Export** | All transcripts as text files |

#### Export Options

| Setting | Description |
|---------|-------------|
| **Date Range** | Filter by response date |
| **Question Selection** | Choose specific questions |
| **Include Metadata** | Add respondent info |
| **Include Transcripts** | Add video transcripts |
| **Video Quality** | High/Standard for downloads |

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

### Template Information

Each template shows:
- **Headline** - Template name
- **Description** - What the template is for
- **Question Count** - Number of pre-built questions
- **Reward Amount** - Suggested incentive (if specified)
- **Estimated Time** - Expected completion time in minutes

### Using Templates

1. Browse templates by category
2. Click to preview template details
3. Review included questions
4. Click **Use Template**
5. Campaign opens in editor
6. Customize questions and settings
7. Launch when ready

::: tip Pro Tip: Template Customization
Templates are starting points, not final products:
- **Always customize** questions to your specific context
- **Adjust incentives** based on your audience and budget
- **Add your branding** to questions and landing pages
- **Test thoroughly** before launching
- **Save successful campaigns** as custom templates
:::

## Usage Analytics

![Usage Page](/screenshots/campaigns/04-usage.png)

View workspace analytics and credit consumption.

### Activity Charts

Visualizations showing:
- Response trends over time
- Community growth metrics
- Total video minutes collected
- Response rate patterns

### Credit Usage

Monitor your workspace credits:

| Metric | Description |
|--------|-------------|
| **Current Balance** | Available credits |
| **Usage This Period** | Credits consumed |
| **Usage Trend** | Consumption over time |
| **Projected Usage** | Estimated future needs |

#### Credit Consumption

Credits are consumed when:
- Respondents complete surveys with credit incentives
- AI processes video responses
- Magic Reels are generated
- Advanced AI features are used

::: tip Pro Tip: Credit Management
- Check usage before launching large campaigns
- Set response limits to control costs
- Use AI populations for initial testing (lower cost)
- Monitor trends to predict future needs
:::

## Magic Reels

![Magic Reels](/screenshots/campaigns/05-magic-reels.png)

AI-powered video highlight reels generated from campaign responses.

### Reels Table

View all your magic reels showing:

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
| **Published** | Video created and ready to view |
| **Draft** | Not yet published |
| **Processing** | Video being generated |
| **Failed** | Generation encountered an error |
| **Unpublished Changes** | Has updates not yet published |

### Creating Magic Reels

1. Click **Add Reel**
2. Select campaign(s) to include
3. Choose creation method:

#### AI-Generated Reel
- AI selects best clips based on:
  - Emotional moments
  - Key themes
  - Representative samples
- Configure preferences:
  - Target length
  - Theme focus
  - Diversity settings

#### Manual Reel
- Browse all campaign clips
- Select clips to include
- Arrange order
- Set transitions

4. Preview reel
5. Edit as needed
6. Click **Publish**

### Editing Magic Reels

#### Clip Editor

| Feature | Description |
|---------|-------------|
| **Timeline** | Visual clip arrangement |
| **Trim** | Adjust start/end times |
| **Reorder** | Drag and drop clips |
| **Remove** | Delete clips from reel |
| **Add** | Insert additional clips |

#### Transcript-Based Editing
- View transcript alongside video
- Click text to jump to moment
- Select text to create clip boundaries
- Search for specific content

#### Settings

| Setting | Options |
|---------|---------|
| **Title** | Reel name |
| **Description** | Summary text |
| **Thumbnail** | Cover image |
| **Quality** | Standard/High |
| **Transitions** | Cut, Fade, etc. |

### Sharing Reels

After publishing:

| Option | Description |
|--------|-------------|
| **Direct Link** | Share URL |
| **Embed Code** | Add to websites |
| **Download** | Save video file |
| **Share to Team** | Internal sharing |

::: tip Pro Tip: Effective Magic Reels
- **Select diverse clips** for representative sample
- **Include emotional moments** that resonate
- **Keep under 3 minutes** for attention span
- **Add context** in the description
- **Share immediately** while insights are fresh
- **Create multiple reels** for different audiences
:::

## Campaign Lifecycle

### Status Transitions

```
Draft → Open → Closed → Archived
         ↓
      Blocked → Closed
```

| Transition | Action |
|------------|--------|
| **Draft → Open** | Launch to start collecting responses |
| **Open → Closed** | Stop accepting new responses |
| **Open → Blocked** | Temporarily pause collection |
| **Blocked → Open** | Resume collection |
| **Closed → Archived** | Move to archive for storage |
| **Any → Draft** | Return to editing mode (use caution) |

### Status Actions

| Status | Available Actions |
|--------|-------------------|
| **Draft** | Edit, Preview, Launch |
| **Open** | Monitor, Pause, Close, View Results |
| **Closed** | View Results, Export, Archive, Reopen |
| **Blocked** | Review, Resume, Close |
| **Archived** | View Results, Unarchive, Delete |

::: tip Pro Tip: Lifecycle Best Practices
1. **Test in Draft** - Use Preview mode thoroughly
2. **Launch strategically** - Consider timing and audience availability
3. **Monitor actively** - Check response quality early
4. **Close promptly** - Don't leave campaigns open indefinitely
5. **Archive systematically** - Organize by quarter or project
:::

## Permissions

Campaigns support role-based access control:

| Permission | Allows |
|------------|--------|
| **View** | Read-only access to campaign and results |
| **Edit** | Modify campaign structure and settings |
| **Delete** | Remove the campaign |
| **Manage** | Share campaign and modify permissions |

### Sharing Campaigns

1. Click **Share** in the card menu or campaign header
2. Choose access level:
   - **Workspace-wide** - All workspace members
   - **Specific users** - Individual invitations
3. Assign permission levels
4. Save changes

## Real-World Use Cases

### Use Case 1: Product Concept Testing

**Scenario:** You need quick feedback on 3 product concepts before a board meeting.

**Approach:**
1. Create a campaign from the "Concept Test" template
2. Upload concept images/videos as stimuli
3. Add structured rating questions + open-ended video responses
4. Use AI populations to test questions first
5. Target your customer panel
6. Launch with a 48-hour deadline
7. Create Magic Reel of best feedback

**Sample Questions:**
- "On a scale of 1-10, how interested are you in this product?" (SLIDER)
- "Record a video explaining why you would or wouldn't buy this" (VIDEO)
- "What would make this product better?" (LONG)
- "Rank these features by importance" (RANKED)

::: tip Pro Tip: Concept Testing
- Test one concept per question set to avoid confusion
- Include a purchase intent question for comparability
- Ask for specific improvement suggestions
- Use Magic Reels to share compelling customer feedback
- Export quantitative data for statistical analysis
:::

### Use Case 2: Customer Satisfaction Research

**Scenario:** You want ongoing feedback from customers post-purchase.

**Approach:**
1. Create a short satisfaction survey (3-5 questions)
2. Set up integration with your CRM or email system
3. Configure automatic invitations after purchase
4. Monitor weekly for trends
5. Create highlight reels of testimonials

**Sample Questions:**
- "How satisfied are you with your recent purchase?" (STAR)
- "Record a quick video about your experience" (VIDEO)
- "Would you recommend us to a friend?" (SLIDER - NPS)
- "What could we improve?" (SHORT)

::: tip Pro Tip: Satisfaction Surveys
- Keep it short (under 5 minutes)
- Ask for video testimonials you can use
- Include NPS question for benchmarking
- Set up alerts for low satisfaction scores
- Track trends over time
:::

### Use Case 3: Competitive Analysis via Consumers

**Scenario:** You want to understand how consumers compare you to competitors.

**Approach:**
1. Create a comparison-focused survey
2. Show competitor materials alongside your own
3. Ask for honest video feedback
4. Use AI to analyze sentiment patterns
5. Export insights for strategy team

**Sample Questions:**
- "Compare these two products - which do you prefer and why?" (VIDEO)
- "What does Brand A do better than Brand B?" (LONG)
- "If price was the same, which would you choose?" (CHOICE)
- "Rate each brand on these attributes" (SLIDER per brand)

::: tip Pro Tip: Competitive Research
- Be ethical - don't mislead about sponsorship
- Include neutral options
- Ask for reasoning, not just preferences
- Look for patterns in video responses
- Create separate reels for each competitor
:::

### Use Case 4: Usability Testing

**Scenario:** You're redesigning your app and need user feedback.

**Approach:**
1. Create a campaign with screen share video questions
2. Give specific tasks to complete
3. Ask users to think aloud
4. Analyze pain points and confusion
5. Create highlight reel of usability issues

**Sample Questions:**
- "Navigate to [feature] and describe what you see" (VIDEO)
- "How would you complete [task]? Show us on screen" (VIDEO)
- "Rate how easy this was to complete" (STAR)
- "What was confusing or frustrating?" (LONG)
- "What did you like about this experience?" (VIDEO)

### Use Case 5: Employee Feedback

**Scenario:** Gather authentic employee feedback for culture initiatives.

**Approach:**
1. Create an anonymous campaign
2. Mix video and text questions
3. Focus on specific topics
4. Share aggregate results transparently
5. Create action plans from insights

**Sample Questions:**
- "What's one thing that would make your work life better?" (VIDEO)
- "Rate your overall satisfaction" (SLIDER)
- "What do you love most about working here?" (VIDEO)
- "What's holding you back from doing your best work?" (LONG)

## Best Practices

### Creating Effective Campaigns

1. **Clear Objectives** - Define what you want to learn before starting
2. **Concise Questions** - Keep questions focused and easy to understand
3. **Appropriate Length** - Balance depth with participant time (under 15 minutes)
4. **Test First** - Use Preview mode and AI populations before launching
5. **Monitor Quality** - Review early responses for issues
6. **Act on Insights** - Use findings to drive decisions

### Video Question Best Practices

- Give specific prompts, not vague asks
- Suggest but don't require time limits
- Encourage authenticity
- Ask one thing per question
- Provide context without leading

### Maximizing Response Quality

- Provide clear instructions
- Set appropriate incentives
- Target the right audience
- Follow up promptly on responses
- Use AI insights to identify patterns
- Thank respondents

### Data Security

- Enable anonymous mode when appropriate
- Limit access with permissions
- Export and delete when research complete
- Follow your organization's data policies
- Comply with regulations (GDPR, CCPA, etc.)

## Troubleshooting

### Low Response Rates

**Symptoms:** Campaign has few responses despite being open.

**Solutions:**
1. **Check incentive** - Is it competitive for your audience?
2. **Review length** - Long surveys get fewer completions
3. **Verify targeting** - Is the audience available?
4. **Test the link** - Ensure the campaign URL works
5. **Send reminders** - Follow up with non-responders
6. **Check timing** - Avoid holidays and busy periods

### Poor Video Quality

**Symptoms:** Respondents submit unclear or off-topic videos.

**Solutions:**
1. **Clarify prompts** - Be more specific about expectations
2. **Add examples** - Show what a good response looks like
3. **Check incentives** - Low rewards attract low effort
4. **Pre-screen respondents** - Use qualification questions
5. **Limit retakes** - Sometimes first take is most authentic

### AI Insights Not Generating

**Symptoms:** AI summary or insights not appearing.

**Solutions:**
1. **Wait for processing** - AI needs time after responses come in
2. **Check response count** - Some features need minimum responses (usually 5-10)
3. **Refresh the page** - Insights may have loaded
4. **Verify video processing** - Videos must be transcribed first
5. **Contact support** if stuck for extended time

### Campaign Won't Launch

**Symptoms:** Launch button disabled or errors when launching.

**Solutions:**
1. **Check required fields** - All mandatory settings must be filled
2. **Verify questions** - At least one question is required
3. **Review settings** - Check date ranges and targeting
4. **Check permissions** - You may need admin approval
5. **Validate incentives** - If using payments, verify setup

### Video Transcription Issues

**Symptoms:** Transcripts missing, incomplete, or inaccurate.

**Solutions:**
1. **Check audio quality** - Clear speech transcribes better
2. **Wait for processing** - Transcription takes time
3. **Edit manually** - Correct important errors
4. **Report persistent issues** - Flag problematic videos

### Getting Help

If issues persist:
1. **Document the campaign ID** and specific error
2. **Take screenshots** of the problem
3. **Check the [Community](https://community.vurvey.com)** for similar issues
4. **Contact support** via the Help menu

## Frequently Asked Questions

::: details FAQs (Click to Expand)

**Q: How many questions can I include?**
A: There's no hard limit, but we recommend 5-15 questions. More than 20 significantly reduces completion rates. Video questions should be limited to 3-5 per campaign.

**Q: Can I edit a campaign after it's open?**
A: Minor edits are possible (typos, descriptions), but major changes (adding/removing questions) should be avoided as they affect data consistency. Consider closing and creating a new version.

**Q: How long should campaigns stay open?**
A: It depends on your goals. Most campaigns achieve target responses within 2-4 weeks. Don't leave campaigns open indefinitely - close when you have sufficient responses.

**Q: Can I target specific demographics?**
A: Yes, use the targeting settings to specify age, location, gender, and custom properties. You can also target by segments and previous campaign participation.

**Q: How are credits consumed?**
A: Credits are used for respondent incentives (if configured) and AI processing. Check the Usage tab for detailed tracking.

**Q: Can I export raw data?**
A: Yes, use the Results tab to export responses in various formats (CSV, JSON, etc.). Videos can be downloaded individually or in bulk.

**Q: What happens to responses if I delete a campaign?**
A: Deleted campaign data is lost permanently. Archive instead of deleting to preserve data. Export important data before deletion.

**Q: Can I reuse questions across campaigns?**
A: Not directly copy/paste, but you can duplicate campaigns and modify them, or save successful campaigns as templates.

**Q: How do I share results with stakeholders?**
A: Use Magic Reels for video highlights, export data for analysis, generate PDF reports, or share the campaign with view permissions.

**Q: What's the difference between Close and Archive?**
A: **Close** stops responses but keeps the campaign visible and easily accessible. **Archive** moves it to long-term storage, removing it from the main list.

**Q: How long are videos stored?**
A: Videos are stored according to your workspace retention policy. Standard retention is 2 years. Contact support for custom retention needs.

**Q: Can respondents save and continue later?**
A: Yes, if auto-save is enabled. Respondents can return to their partial response within the session timeout period (typically 7 days).

**Q: Are responses anonymous?**
A: Only if you enable anonymous mode. By default, respondent identity is captured. Anonymous mode hides all identifying information.

**Q: What video formats are supported?**
A: Recordings are captured in standard web formats (VP8/Vorbis, H264/AAC). Uploads support MP4, MOV, and AVI.

**Q: Can I add logic/branching to questions?**
A: Yes, conditional logic allows showing/hiding questions based on previous answers. Configure in the question settings.

**Q: How accurate are AI transcripts?**
A: Accuracy varies with audio quality but is typically 90%+ for clear speech. You can edit transcripts to correct errors.
:::

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + N` | Create new campaign |
| `Cmd/Ctrl + S` | Save campaign (in editor) |
| `Cmd/Ctrl + P` | Preview campaign |
| `Escape` | Close modals |
| `Enter` | Confirm dialogs |
| `Space` | Play/pause video |
| `←/→` | Seek video 5 seconds |

## Next Steps

- [Create agents to analyze campaign data](/guide/agents)
- [Upload campaign results to datasets](/guide/datasets)
- [Target populations with campaigns](/guide/people)
- [Automate campaign workflows](/guide/workflows)
- [Use AI chat for ad-hoc analysis](/guide/home)
