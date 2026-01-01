# People

The People section manages your audiences, populations, and participant data for targeted research. This section is accessed via the **Audience** navigation item in the sidebar.

## Overview

![People Section](/screenshots/people/01-people-main.png)

The People section provides a CRM-style interface for managing research participants, AI-generated populations, and custom audience segments.

::: tip What Is the People Section?
Think of People as your research audience headquarters. Manage real participants who take your surveys, create AI-generated populations for testing, and organize everyone into segments for targeted campaigns.
:::

## Navigation Tabs

The page header contains navigation buttons to switch between different views:

| Tab | Icon | Purpose |
|-----|------|---------|
| **Populations** | Sparkle Stars | View AI-generated audience patterns and demographic distributions |
| **Humans** | Users | Manage individual contacts and participants |
| **Lists & Segments** | User List Segments | Organize people into static lists or dynamic rule-based segments |
| **Properties** | Label Tag | Define custom attributes for contact profiles |

::: tip Enterprise Feature
Some workspaces may have a **Molds** tab for creating reusable persona templates. This is an enterprise feature.
:::

## Populations

![Populations](/screenshots/people/02-populations.png)

Populations are AI-generated audience groups that represent different demographic segments and behavioral patterns.

### Viewing Populations

The populations tab displays cards in a grid layout. Each card shows:

- **Population Name** - Descriptive title
- **Member Count** - Number of personas in the population
- **Update Date** - When the population was last modified

Use the search bar to find populations by name, and the sort dropdown to order by most recently updated or other criteria.

### Population Details

Click a population card to view detailed analytics:

#### Charts View

The default view shows visualization dashboards including:

- **Persona Carousel** - Scrollable preview of representative personas
- **Facet Distribution Charts** - Visual breakdown of demographic data
  - Donut charts for categorical distributions
  - Bar charts for rankings and comparisons
  - Treemap charts for hierarchical data
- **Category Filters** - Toggle which facets to display

#### Table View

Switch to table view using the table icon to see a paginated list of all personas in the population. Click any row to open the persona detail modal.

::: info Population Classification
The system uses AI-generated personas (referred to as "AI Personas") to represent different demographic segments. All populations contain AI-generated personas that can be used in research campaigns and conversations.
:::

### Population Types

| Type | Description | Best For |
|------|-------------|----------|
| **Synthetic** | AI-generated representative samples based on demographic parameters | Concept testing, message validation |
| **Real** | Based on actual participant data from your contacts | Targeting, personalization |
| **Hybrid** | Combination of synthetic profiles augmented with real data | Filling gaps in small samples |

::: tip Pro Tip: Population Strategy
- Use **Synthetic** populations when you need quick feedback but don't have enough real participants
- Use **Real** populations for final validation with actual customers
- Use **Hybrid** to scale small real samples with statistically similar synthetic personas
:::

## Humans

![Humans](/screenshots/people/03-humans.png)

The Humans tab (accessed via `/audience/community`) manages individual participant profiles and their interaction history.

### Contact Table

Contacts are displayed in a sortable, filterable table with columns:

| Column | Description |
|--------|-------------|
| **Name** | Avatar and display name (click to view profile) |
| **Age** | Contact's age if provided |
| **Last Active** | Most recent activity date |
| **Options** | Action menu for individual contacts |

### Searching and Filtering

- **Search** - Find contacts by name
- **Filter Panel** - Filter by campaigns, properties, or custom attributes
- **Clear Filters** - Reset all active filters

::: tip Pro Tip: Advanced Filtering
Combine multiple filters to find specific segments:
- Filter by campaign participation AND property values
- Find inactive users from specific campaigns
- Identify high-value participants for follow-up
:::

### Adding Contacts

Click **+ Add** to open the invite modal:

1. Enter email addresses (one per line or comma-separated)
2. Send invitations to join your workspace
3. New contacts appear once they accept

### Bulk Actions

Select multiple contacts to access bulk operations:

| Action | Description |
|--------|-------------|
| **Delete** | Remove selected contacts from workspace |
| **Add to List** | Add contacts to an existing list or create new |
| **Add Property** | Batch assign property values to selected contacts |

### Individual Contact Actions

Use the options menu on each row for:

- **Delete** - Remove the contact
- **Add Property** - Assign a property value

### Contact Profile Modal

Click a contact name to open the detail modal showing:

- Basic information (name, email, demographics)
- Custom property values
- Campaign participation history
- Response transcripts and videos
- Segment memberships

::: tip Pro Tip: Profile Enrichment
Build rich contact profiles by:
- Adding custom properties after each interaction
- Tagging participation quality
- Noting follow-up preferences
- Recording special circumstances
:::

## Lists & Segments

![Lists & Segments](/screenshots/people/04-lists-segments.png)

Organize contacts into reusable groups for campaign targeting and analysis.

### View Toggle

Use the dropdown to switch between:

- **Lists** - Static, manually-managed groups
- **Segments** - Dynamic, rule-based groups that auto-update

### Lists

Static lists contain a fixed set of contacts that you manually manage.

#### Creating Lists

1. Click **New List**
2. Enter a list name
3. Save the list
4. Add contacts from the Humans tab or during bulk actions

#### List Table Columns

| Column | Description |
|--------|-------------|
| **Name** | List name (click to edit inline) |
| **User count** | Number of contacts in the list |
| **Created** | Creation date |
| **Options** | Edit, Duplicate, Delete |

#### Bulk List Actions

Select multiple lists for:

- **Delete** - Remove selected lists
- **Combine Lists** - Merge selected lists into one

::: tip Pro Tip: List Management
- Create project-specific lists for campaign targeting
- Use lists for VIP or high-value participants
- Archive completed project lists rather than deleting
- Document list purposes in naming conventions
:::

### Segments

Dynamic segments automatically include contacts matching your defined rules.

#### Creating Segments

1. Click **New Segment**
2. Define rules using property conditions
3. Choose match type:
   - **Any** (OR logic) - Contact matches if any rule is true
   - **All** (AND logic) - Contact must match all rules
4. Save the segment

Segments automatically update as contact properties change.

#### Segment Table Columns

| Column | Description |
|--------|-------------|
| **Name** | Segment name (click to view contacts) |
| **Creators** | Number of matching contacts |
| **Created** | Creation date |
| **Options** | Edit, Copy, Delete |

#### Combined Segments

Select multiple segments and use **Create Combined Segment** to merge their rules into a new segment.

::: tip Pro Tip: Segment Strategy
Segments are powerful for:
- **Behavioral targeting** - People who completed X campaigns
- **Demographic targeting** - Age, location, gender combinations
- **Engagement targeting** - Active vs. dormant participants
- **Value targeting** - High-responders, quality participants
:::

## Properties

![Properties](/screenshots/people/05-properties.png)

Properties define custom attributes you can track for contacts beyond the built-in fields.

### Built-in Properties

These default properties are available for all contacts:

- Name
- Email
- Age
- Gender
- Location
- Created Date
- Last Activity

### Custom Properties

Create properties specific to your research needs:

| Property Type | Example Use Cases |
|---------------|-------------------|
| **Text** | Occupation, favorite brand, open-ended preferences |
| **Number** | Income level, satisfaction score, household size |
| **Date** | Signup date, last survey completion, birthday |
| **Single Select** | Membership tier, customer segment, preferred contact method |
| **Multi-select** | Product categories of interest, communication preferences |
| **Boolean** | Has purchased, opted into marketing, verified email |

::: tip Pro Tip: Property Design
Design properties for flexibility:
- Use **Single Select** for standardized categories
- Use **Text** sparingly (harder to segment on)
- Create **Boolean** flags for important milestones
- Consider **Number** for scores you'll want to filter
:::

### Managing Properties

#### Creating Properties

1. Click **+ New Property**
2. Enter property name
3. Select property type
4. Configure validation rules if needed
5. Assign to a category
6. Save

#### Property Table Columns

| Column | Description |
|--------|-------------|
| **Name** | Property name (click to view details) |
| **Used** | Count of rules/contacts using this property |
| **Category** | Property category (e.g., "Demographics") |
| **Created by** | User who created the property |
| **Options** | Edit, Delete |

#### Categories

Organize properties into categories:

- Click the category dropdown to filter by category
- Use **Edit Categories** to rename existing categories
- Use **+ Create new category** to add categories

#### CSV Upload

Bulk import properties and values:

1. Click the upload button
2. Select your CSV file
3. Choose an action:
   - **Add** - Add new values only
   - **Update** - Update existing values
   - **Replace** - Replace all values
4. Upload and process

::: warning Property Changes
Modifying or deleting properties may affect existing segments, campaign targeting rules, and workflow automations. Review dependencies before making changes.
:::

## Real-World Use Cases

### Use Case 1: Building a Research Panel

**Scenario:** You want to create a reusable panel of qualified research participants.

**Approach:**
1. Import contacts via CSV with demographic data
2. Create properties for key qualifications
3. Build segments for different research needs
4. Target specific segments in campaigns

**Property Examples:**
- `research_panel: true/false`
- `panel_tier: gold/silver/bronze`
- `expertise_areas: [multi-select]`
- `last_research_date: date`

::: tip Pro Tip: Panel Quality
- Verify contact information periodically
- Track response quality with a rating property
- Remove non-responders after 3 failed attempts
- Refresh demographics annually
:::

### Use Case 2: Customer Segmentation

**Scenario:** You need to target different customer segments for product research.

**Approach:**
1. Sync customer data from your CRM
2. Create properties for customer attributes
3. Build segments matching your marketing personas
4. Run targeted campaigns per segment

**Segment Examples:**
- "High-Value Customers" - purchases > $500/year
- "New Customers" - created_date within 90 days
- "At-Risk Customers" - last_active > 6 months
- "Brand Advocates" - NPS score >= 9

### Use Case 3: Geographic Targeting

**Scenario:** You're launching a regional product and need location-specific feedback.

**Approach:**
1. Ensure location properties are populated
2. Create segments by region
3. Target regional segments for localized research
4. Compare responses across regions

**Segment Examples:**
- "US Northeast" - state in [NY, NJ, CT, MA, etc.]
- "Urban" - population_density = high
- "International" - country != US
- "Target Markets" - DMA in [Chicago, LA, NYC]

### Use Case 4: Engagement Tracking

**Scenario:** You want to reward your most active participants and re-engage dormant ones.

**Approach:**
1. Create properties to track engagement
2. Build segments based on activity levels
3. Run re-engagement campaigns for dormant users
4. Offer incentives to high-engagers

**Property Examples:**
- `campaigns_completed: number`
- `total_video_minutes: number`
- `average_response_quality: number`
- `last_engagement_date: date`

## Best Practices

### Data Quality

- Validate imported data before processing
- Deduplicate records regularly
- Keep property definitions consistent
- Archive rather than delete to preserve history

### Privacy & Compliance

- Follow data protection regulations (GDPR, CCPA, etc.)
- Use anonymization for sensitive research
- Implement appropriate access controls
- Document data retention policies

::: warning Privacy Checklist
Before collecting participant data:
- [ ] Obtain proper consent
- [ ] Document data usage
- [ ] Set retention periods
- [ ] Enable data export/deletion
- [ ] Limit access to necessary personnel
:::

### Organization

- Use clear, descriptive names for populations and lists
- Document segment criteria in descriptions
- Review and archive outdated populations quarterly
- Standardize property names and values

### Advanced People Management

::: details Click to Expand Advanced Techniques

**Lifecycle Stages:**
Create properties to track participant lifecycle:
- `lifecycle_stage: prospect/active/dormant/churned`
- Use workflows to auto-update based on activity
- Target re-engagement at key transition points

**Quality Scoring:**
Build a quality score from multiple factors:
- Response rate + completion rate + content quality
- Store as a property for segment filtering
- Prioritize high-quality participants

**Preference Centers:**
Track and respect participant preferences:
- `frequency_preference: weekly/monthly/quarterly`
- `topic_interests: [multi-select]`
- `communication_channel: email/sms/app`

**Panel Rotation:**
Prevent over-surveying:
- Track survey count per time period
- Create "available for research" segments
- Rotate participants to maintain freshness
:::

## Troubleshooting

### Common Issues and Solutions

#### Contacts Not Appearing

**Symptoms:** Invited contacts don't show in the Humans tab.

**Solutions:**
1. **Check invitation status** - Has the invite been accepted?
2. **Verify email address** - Was it entered correctly?
3. **Check workspace** - Are you in the right workspace?
4. **Refresh the page** - Data may need to reload

#### Segment Returns Wrong Results

**Symptoms:** Segment includes unexpected contacts or excludes expected ones.

**Solutions:**
1. **Review rules** - Check each condition carefully
2. **Verify logic** - Is it AND vs OR as intended?
3. **Check property values** - Are contacts' properties set correctly?
4. **Test with known contact** - Verify a specific case

#### CSV Import Fails

**Symptoms:** CSV upload errors or missing data.

**Solutions:**
1. **Check format** - UTF-8 encoding, proper headers
2. **Verify columns** - Match expected property names
3. **Review data** - Look for special characters or formatting issues
4. **Try smaller batch** - Split large files

#### Property Can't Be Deleted

**Symptoms:** Delete option unavailable or error when deleting.

**Solutions:**
1. **Check usage** - Is it used in segments or campaigns?
2. **Remove dependencies** - Update segments first
3. **Check permissions** - Do you have delete rights?
4. **Contact admin** - May need elevated access

### Getting Help

If issues persist:
1. **Document the specific issue** with screenshots
2. **Note the contact/segment/property ID**
3. **Check the [Community](https://community.vurvey.com)** for similar cases
4. **Contact support** via the Help menu

## Frequently Asked Questions

::: details FAQs (Click to Expand)

**Q: How many contacts can I have?**
A: There's no hard limit, but performance is optimized for up to 100,000 contacts. Contact sales for larger needs.

**Q: Can contacts be in multiple segments?**
A: Yes, contacts can match multiple segment rules and appear in many segments simultaneously.

**Q: How often do segments update?**
A: Segments update in real-time as contact properties change.

**Q: Can I import contacts from other systems?**
A: Yes, use CSV import or contact sales about API integrations.

**Q: What happens when I delete a contact?**
A: The contact and their response history are permanently removed. Consider archiving instead.

**Q: Can contacts update their own information?**
A: Not directly in the platform. Updates must be made by workspace users.

**Q: How do I merge duplicate contacts?**
A: Currently, duplicates must be manually identified and merged. Export, dedupe, and re-import.

**Q: Are populations and segments the same?**
A: No. **Populations** are AI-generated personas for simulation. **Segments** are groups of real contacts.

**Q: Can I share segments across workspaces?**
A: No, segments are workspace-specific. You'd need to recreate in each workspace.

**Q: How do I track survey response history?**
A: Click any contact to see their profile, which includes campaign participation and responses.
:::

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + N` | Create new list/segment |
| `Escape` | Close modals |
| `Enter` | Confirm dialogs |
| `/` | Focus search |

## Next Steps

- [Create a campaign targeting specific populations](/guide/campaigns)
- [Use populations with AI agents in chat](/guide/home)
- [Automate audience workflows](/guide/workflows)
- [Upload data to datasets for AI analysis](/guide/datasets)
