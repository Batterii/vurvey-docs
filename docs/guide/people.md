# People

The People section is where you manage everyone involved in your research — from real human participants to AI-generated consumer profiles. Build targeted audiences, organize contacts into segments, and track custom attributes to power smarter campaign targeting.

## Overview

![People Section](/screenshots/people/01-people-main.png)

The People section gives you a complete view of your research audiences. Whether you're building a panel of loyal beauty enthusiasts, creating AI representations of Gen Z consumers, or segmenting your audience by purchase behavior, everything starts here.

::: tip What You Can Do in People
- **Build AI populations** that simulate your target consumers for quick concept testing
- **Manage real participants** who respond to your video campaigns
- **Create segments** based on demographics, behavior, or custom criteria
- **Track custom attributes** like purchase history, preferences, or loyalty tier
- **Target the right audience** when launching campaigns
:::

## Navigation

The People section has five tabs across the top of the page:

| Tab | Description |
|-----|-------------|
| **Populations** | AI-generated audience profiles representing consumer segments |
| **Humans** | Real people who participate in your research campaigns |
| **Molds** | Templates for creating consistent persona profiles (Enterprise only) |
| **Lists & Segments** | Ways to organize your audiences into reusable groups |
| **Properties** | Custom attributes you track about your audience |

::: info Enterprise Feature
The **Molds** tab is only visible to enterprise workspaces. It lets you create reusable templates for consistent AI population generation.
:::

---

## Populations

::: warning Feature In Development
The Populations feature is currently being refined and may not be available in all workspaces. **When you navigate to the Populations tab, you may see an empty state with the message "Stay tuned! We're working on unveiling the new populations feature in your workspace."** This is expected behavior while the feature is being rolled out. The feature will be enabled for your workspace soon.
:::

![Populations](/screenshots/people/02-populations.png)

Populations are AI-generated audience groups that represent different consumer segments. Use them to simulate focus group discussions, test campaign questions before launch, or fill gaps when you don't have enough real participants.

::: info Populations Tab Behavior
If you don't see any populations listed and instead see an empty state message, this means the feature hasn't been enabled for your workspace yet. The Populations tab is accessible via the route `/audience` or `/people/populations`, but content will only appear once the feature is activated.
:::

### Why Use Populations?

Imagine you're launching a new skincare line and want to hear from 200 premium beauty consumers — but your panel only has 50. Populations let you create AI representations of your target audience so you can:

- **Test campaign questions** before sending them to real participants
- **Get diverse perspectives** across age, location, and lifestyle
- **Validate concepts quickly** without waiting for recruitment
- **Reduce costs** by using AI for initial rounds of feedback

### Browsing Your Populations

Populations appear in a card grid. Each card shows the population name, member count, and when it was last updated. Use the search bar to filter by name, or sort by most recently updated.

Click the three-dot menu on any card to view, edit, duplicate, or delete a population.

### Population Details

Click any population card to see detailed analytics about that audience group.

![Population Charts](/screenshots/people/02a-population-charts.png)

The details page includes:

- **Persona Carousel** — Browse representative personas with their avatar, name, and key demographics
- **Charts View** — Visual breakdowns of your population by demographics, preferences, and behaviors (donut charts, bar charts, treemaps, and more)
- **Table View** — A detailed list of all personas with sortable columns

Use the category pills to filter which demographic facets are displayed. Hover over any chart element for exact counts and percentages.

### Understanding Population Analytics

The charts view provides rich visual data about your population. Here's how to read each chart type:

#### Donut Charts

Donut charts show the proportional breakdown of a single attribute (e.g., age range, gender, location). Each colored segment represents one value. Hover over any segment to see the exact count and percentage.

**What to look for:**
- **Dominant segments** — large segments may indicate your population skews toward certain demographics
- **Balance** — for representative research, check that no single segment overwhelms the rest
- **Missing segments** — small or absent segments may mean your population doesn't cover certain demographics

#### Bar Charts

Bar charts compare values across categories (e.g., product preferences, interest areas). Bars are typically sorted from highest to lowest.

**What to look for:**
- **Relative sizes** — quickly see which attributes are most common in your population
- **Distribution shape** — a flat distribution means even spread; a steep drop-off means concentration
- **Outliers** — unusually tall or short bars may indicate interesting population characteristics

#### Treemaps

Treemaps display hierarchical data as nested rectangles. Larger rectangles represent more common attributes. They're especially useful for visualizing many categories at once.

**What to look for:**
- **Dominant categories** — the largest rectangles are the most common values
- **Variety** — many small rectangles indicate high diversity in that attribute
- **Groupings** — related values may cluster together visually

::: tip Comparing Populations
To compare two populations, open each in separate browser tabs and look at the same chart type side by side. This is useful for understanding how different target audiences differ in demographics or preferences.
:::

### Creating Populations

Populations are typically created during campaign setup or through the Agent Builder. The Populations tab is primarily for viewing and managing existing populations.

::: tip Best Practice
Keep populations focused on specific demographics or use cases. Use clear names like "US Millennials - Urban - Tech Enthusiasts" so your team can quickly find the right audience.
:::

---

## Humans

![Humans](/screenshots/people/03-humans.png)

The Humans tab is where you manage your real participants — the people who receive campaign invitations and provide genuine video feedback.

### Viewing Your Contacts

Contacts appear in a sortable table with columns for **Name**, **Age**, **Last Active**, and action options. Click any column header to sort.

Use the search bar to find contacts by name. Click the filter button to narrow results by campaign participation or custom property values.

::: tip Build Richer Profiles Over Time
Combine multiple filters to uncover insights — for example, find participants who completed your holiday campaign AND have a "Gold" loyalty tier, or locate consumers in a specific region who haven't been surveyed recently.
:::

### Adding Contacts

Click **+ Add** to invite new people to your workspace. Enter one or more email addresses, and invitations are sent immediately. New contacts appear in your list once they accept.

### Bulk Actions

Select multiple contacts using the checkboxes, then use the bulk action buttons to:

| Action | What It Does |
|--------|-------------|
| **Delete** | Permanently remove selected contacts and their response history |
| **Add to List** | Add contacts to an existing list or create a new one |
| **Add Property** | Assign a property value to all selected contacts at once |

### Contact Profiles

Click a contact's name to open their full profile.

![Contact Profile](/screenshots/people/03a-contact-profile.png)

A profile includes:

- **Basic Information** — Name, email, avatar, age, gender, location
- **Custom Properties** — All assigned attribute values
- **Campaign History** — Which campaigns they've participated in
- **Response Data** — Transcripts, videos, and individual answers
- **Segment Memberships** — Lists and segments they belong to

### Contact Profile: Deep Dive

Each contact profile is organized into sections that give you a 360-degree view of the participant.

#### Basic Information

The header area shows the contact's name, email address, avatar (if available), age, gender, and location. This information may come from their account registration or from properties you've imported.

::: tip Editing Contact Information
Click on any editable field to update it directly. Changes are saved immediately. Only users with Edit permission on the People section can modify contact information.
:::

#### Custom Properties

All custom properties assigned to this contact appear in a organized list. Each property shows its key and current value. You can edit property values directly from the profile page.

#### Campaign History

A chronological list of every campaign this contact has participated in, showing:
- Campaign name and date
- Completion status (completed, partial, not started)
- Number of questions answered

Click any campaign entry to jump to that contact's specific responses.

#### Response Data

For each completed campaign, you can view:
- **Video responses** — watch the recorded video directly in the profile
- **Text transcripts** — read the AI-generated transcript of video responses
- **Written answers** — see responses to text-based questions
- **Timestamps** — when each response was submitted

#### Segment Memberships

Shows all lists and segments this contact belongs to. This helps you understand how this person fits into your audience organization and which campaigns they might be targeted for next.

### How Contacts Join Your Workspace

| Source | How It Works |
|--------|-------------|
| **Email Invitation** | Direct invite from the Humans tab |
| **Campaign Links** | Public or shared campaign links |
| **CSV Import** | Bulk import via Properties upload |
| **QR Codes** | Scanned from physical materials |

---

## Lists & Segments

![Lists & Segments](/screenshots/people/04-lists-segments.png)

Organize your contacts into reusable groups for campaign targeting, analysis, and ongoing engagement. Use the dropdown at the top to switch between **Lists** and **Segments**.

### Lists vs. Segments

| | Lists | Segments |
|---|-------|----------|
| **Type** | Static | Dynamic |
| **How membership works** | You manually add and remove contacts | Contacts are automatically included based on rules |
| **Updates** | Only when you make changes | Automatically as contact data changes |
| **Best for** | VIP panels, project teams, hand-picked groups | Behavioral targeting, demographic filters |

### Working with Lists

Lists are manually managed groups. Click **New List** to create one, then add contacts from the Humans tab using bulk actions.

The list table shows **Name**, **User count**, and **Created** date. Click any list name to edit it inline. Use the three-dot menu to edit, duplicate, or delete a list.

**Bulk actions** when multiple lists are selected:
- **Delete** — Remove all selected lists
- **Combine Lists** — Merge selected lists into a single new list

::: tip Use Case
Create a list called "2024 Holiday Research Panel" for a seasonal campaign, or maintain a "VIP Beauty Enthusiasts" list of your most engaged participants who get early access to new studies.
:::

### Working with Segments

Segments are dynamic groups that automatically update as contacts match your rules. Click **New Segment** to open the segment builder.

![Segment Builder](/screenshots/people/04a-segment-builder.png)

**Building a segment:**

1. Choose a **Property** to filter on (age, location, custom attributes, etc.)
2. Select an **Operator** — **Equals** or **Not Equals**
3. Enter the **Value** to match
4. Choose **Any** (OR logic — match if any rule is true) or **All** (AND logic — must match every rule)
5. Preview matching contacts and save

**Example segments for a beauty brand:**

| Segment | Rules | Use Case |
|---------|-------|----------|
| Premium Skincare Consumers | purchase_frequency > 4/year, category = "skincare" | High-value product research |
| Gen Z Beauty Enthusiasts | age between 18-27, interest contains "beauty" | Trend research |
| Dormant Participants | last_active > 90 days | Re-engagement campaigns |
| Northeast US Panel | region = "Northeast" | Regional product testing |

### Segment Builder: Complete Examples

Here are detailed segment rule configurations for common research scenarios. Use these as templates and adapt the property names to match your workspace.

#### 1. High-Value Beauty Consumers

**Goal:** Identify your most engaged, high-spending beauty consumers for premium product research.

| Rule | Property | Operator | Value |
|------|----------|----------|-------|
| Rule 1 | purchase_frequency | greater than | 6 |
| Rule 2 | category | contains | skincare |
| Rule 3 | satisfaction_score | greater than or equal to | 4 |
| Logic | **All** (AND) — contact must match every rule | | |

**Result:** Contacts who buy skincare products more than 6 times a year AND report high satisfaction.

#### 2. At-Risk Customers

**Goal:** Find customers who may be disengaging so you can target them with re-engagement campaigns.

| Rule | Property | Operator | Value |
|------|----------|----------|-------|
| Rule 1 | last_purchase | greater than | 90 days ago |
| Rule 2 | satisfaction_score | less than | 3 |
| Logic | **All** (AND) | | |

**Result:** Contacts who haven't purchased in 90+ days AND have low satisfaction scores. These are prime candidates for win-back research.

#### 3. Gen Z Trendsetters

**Goal:** Build a panel of young, digitally engaged early adopters for trend and concept testing.

| Rule | Property | Operator | Value |
|------|----------|----------|-------|
| Rule 1 | age | between | 18 and 27 |
| Rule 2 | social_media_engagement | equals | high |
| Rule 3 | early_adopter | equals | true |
| Logic | **All** (AND) | | |

**Result:** Young consumers who are highly active on social media and tend to adopt new products early.

#### 4. Regional Research Panel

**Goal:** Create a geographic panel for region-specific product testing or ad campaign evaluation.

| Rule | Property | Operator | Value |
|------|----------|----------|-------|
| Rule 1 | region | equals | Northeast |
| Rule 2 | language | equals | English |
| Rule 3 | available_for_research | equals | true |
| Logic | **All** (AND) | | |

**Result:** English-speaking contacts in the Northeast who have opted in for research participation.

#### 5. Lapsed Participants

**Goal:** Re-engage experienced participants who haven't been surveyed recently.

| Rule | Property | Operator | Value |
|------|----------|----------|-------|
| Rule 1 | last_survey_completed | greater than | 180 days ago |
| Rule 2 | total_surveys | greater than or equal to | 3 |
| Logic | **All** (AND) | | |

**Result:** Contacts who have completed at least 3 surveys historically but haven't participated in 6+ months. These people know the platform and are likely to provide quality responses if re-engaged.

#### 6. Multi-Category Shoppers

**Goal:** Find consumers who shop across multiple product categories for cross-selling research.

| Rule | Property | Operator | Value |
|------|----------|----------|-------|
| Rule 1 | categories_purchased | contains | skincare |
| Rule 2 | categories_purchased | contains | haircare |
| Rule 3 | categories_purchased | contains | makeup |
| Logic | **Any** (OR) — match if at least two are true | | |

::: tip Segment Rule Logic
- **All (AND):** Narrows your audience. Every rule must be true. Use when you need a very specific segment.
- **Any (OR):** Broadens your audience. At least one rule must be true. Use when you want to cast a wider net.
- **Combine both:** Start with AND for your core criteria, then create additional segments with OR logic for broader targeting.
:::

---

## Properties

![Properties](/screenshots/people/05-properties.png)

Properties are custom attributes you can track for contacts beyond the built-in fields like name, email, and age. Define any data point relevant to your research — purchase history, loyalty tier, product preferences, or anything else.

### Property Types

| Type | Description | Example Use |
|------|-------------|-------------|
| **Text** | Free-form text | Occupation, favorite brand |
| **Number** | Numeric values | Household income, satisfaction score |
| **Date** | Calendar date | Last purchase date, signup date |
| **Single Select** | Choose one option from a list | Membership tier (Gold/Silver/Bronze) |
| **Multi-select** | Choose multiple options | Product categories of interest |
| **Boolean** | True/false toggle | Has purchased, opted into marketing |

### Creating Properties

Click **+ New Property** and fill in the name, type, and optionally a category to keep things organized. For select types, define the available choices.

### Property Management Best Practices

#### Standard Properties Every Workspace Should Have

Start with these foundational properties. They support the most common segmentation and targeting use cases:

| Property | Type | Category | Why It Matters |
|----------|------|----------|----------------|
| loyalty_tier | Single Select (Gold/Silver/Bronze) | Purchase Behavior | Segment by customer value |
| purchase_frequency | Number | Purchase Behavior | Identify heavy vs. light buyers |
| last_purchase_date | Date | Purchase Behavior | Find lapsed customers |
| preferred_category | Multi-select | Preferences | Target by product interest |
| satisfaction_score | Number (1-5) | Feedback | Track sentiment over time |
| research_opt_in | Boolean | Research | Know who's available for studies |
| source | Single Select | Demographics | Track how contacts joined |
| region | Single Select | Demographics | Geographic targeting |

#### Naming Conventions

- Use **snake_case** for property names (e.g., `purchase_frequency`, not `Purchase Frequency` or `purchaseFrequency`). This keeps things consistent and prevents issues with CSV imports.
- Keep names **short but descriptive** — `loyalty_tier` is better than `customer_loyalty_membership_tier_level`.
- Use the **same property name** across all imports. If one CSV uses "region" and another uses "location," you'll end up with two separate properties.

#### Category Organization

Group your properties into logical categories to keep the Properties page manageable:

| Category | What Goes Here |
|----------|---------------|
| **Demographics** | Age, gender, region, language, income |
| **Purchase Behavior** | Frequency, recency, spend level, loyalty tier |
| **Preferences** | Product interests, brand preferences, communication preferences |
| **Research** | Opt-in status, last surveyed date, total surveys completed |
| **Feedback** | Satisfaction scores, NPS, complaint history |
| **Campaign** | Source, acquisition date, campaign participation |

#### When to Use Each Property Type

| If you need to... | Use this type |
|-------------------|---------------|
| Store a category with one answer (e.g., "Gold" or "Silver") | Single Select |
| Allow multiple answers (e.g., interested in skincare AND haircare) | Multi-select |
| Track a number for calculations or comparisons | Number |
| Record a date for time-based segments | Date |
| Store open-ended info like notes or occupation | Text |
| Track a simple yes/no (e.g., opted into marketing) | Boolean |

### Managing Categories

Organize properties into categories like "Demographics", "Purchase Behavior", or "Research Preferences" using the category dropdown. Click **+ Create new category** or **Edit Categories** to manage them.

### Importing Data with CSV

Upload properties and values in bulk:

1. Click the upload button
2. Select your CSV file
3. Choose an action: **Add** (new values only), **Update** (update existing), or **Replace** (overwrite everything)

Your CSV must include an email column to match contacts and headers that match property names.

### CSV Import: Format Specification

For successful imports, your CSV file must follow these formatting rules:

#### Required Columns

| Column | Required? | Description |
|--------|-----------|-------------|
| **email** | Yes | The email address used to match contacts. Must match exactly. |
| (property columns) | At least one | One or more columns with headers matching your property names |

#### Format Rules

| Rule | Details |
|------|---------|
| **Encoding** | UTF-8 (most spreadsheet apps export this by default) |
| **Date format** | YYYY-MM-DD (e.g., 2025-03-15) |
| **Boolean values** | Use `true` / `false` (not 1/0 or yes/no) |
| **Multi-select values** | Separate with semicolons: `skincare;haircare;makeup` |
| **Empty values** | Leave the cell blank — don't use "N/A" or "null" |
| **Header row** | First row must contain column headers |
| **No merged cells** | Each cell must be independent |

#### Sample CSV

```csv
email,loyalty_tier,purchase_frequency,last_purchase_date,preferred_category,research_opt_in
jane@example.com,Gold,12,2025-01-15,skincare;haircare,true
john@example.com,Silver,4,2024-11-20,makeup,true
sarah@example.com,Bronze,2,2024-08-05,fragrance;skincare,false
mike@example.com,Gold,8,2025-02-01,haircare,true
```

#### Common CSV Errors and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "No matching contacts found" | Email addresses don't match existing contacts | Check for typos, extra spaces, or different email domains |
| "Invalid date format" | Dates aren't in YYYY-MM-DD format | Convert dates in your spreadsheet before exporting |
| "Unknown property" | Column header doesn't match any property name | Create the property first, or fix the header spelling |
| Garbled characters (?, ÃÂ) | Wrong file encoding | Re-save as UTF-8 in your spreadsheet app |
| Missing values after import | Blank cells were skipped | This is expected — blank cells don't overwrite existing values in "Add" mode |
| Extra rows imported | Hidden rows or trailing blank rows | Delete empty rows at the bottom of your spreadsheet |

::: tip CSV Import Best Practices
1. **Test with a small file first** — try 5–10 rows before importing hundreds.
2. **Use "Add" mode** for your first import to avoid overwriting data.
3. **Back up current data** — export your contacts before a large "Replace" import.
4. **Open in a text editor** to verify formatting if your spreadsheet app adds unexpected characters.
:::

::: warning Deleting Properties
When you delete a property, all values assigned to contacts are also removed. Any segments using that property will need to be updated. Check the "Used" count before deleting.
:::

---

## Molds (Enterprise)

::: warning Enterprise Feature
Molds are only available to enterprise workspaces. Contact your account manager to enable this feature.
:::

![Molds](/screenshots/people/06-molds.png)

Molds are reusable persona templates for consistent AI population generation. Design a mold once — defining demographic parameters, behavioral characteristics, and generation rules — then use it to create unlimited AI personas with consistent attributes.

### Mold Lifecycle

| Status | Description |
|--------|-------------|
| **Draft** | Work in progress, preview only |
| **Live** | Published and ready for population generation |
| **Archived** | Deprecated but retained for reference |

### Mold Details

Click any mold to open its configuration page.

![Mold Details](/screenshots/people/06a-mold-details.png)

From here you can edit the mold's name, description, category, status, and configuration. The system validates readiness before publishing — checking required fields, valid configuration, and demographic coverage thresholds.

---

## Integration with Campaigns

Your People data connects directly to campaigns, creating a powerful targeting and analysis loop.

### Targeting Segments When Launching Campaigns

When you create or launch a campaign, you can select specific lists or segments as your target audience:

1. **Create your campaign** in the Campaigns section.
2. During setup, choose your **target audience** — select from your existing lists or segments.
3. **Only contacts in the selected group** receive the campaign invitation.
4. As the campaign runs, new contacts who join the segment (in dynamic segments) may also be included.

::: tip Targeting Strategy
- **Use segments for ongoing campaigns** — dynamic membership means new qualifying contacts are automatically included.
- **Use lists for one-time studies** — static membership ensures a fixed group receives the invitation.
- **Combine both** — target a segment for broad reach, then create a list of the most engaged respondents for follow-up studies.
:::

### Using Populations for AI Testing

Before launching a campaign to real participants, test it with AI populations:

1. **Create an AI population** that matches your target demographic.
2. **Run your campaign** against the population to collect simulated responses.
3. **Review the simulated results** — Are the questions clear? Are responses diverse? Do you see the insights you expected?
4. **Refine your campaign** based on what you learn, then launch to real contacts.

### Tracking Participation Across Campaigns

Use the Humans tab and contact profiles to track how individual contacts participate over time:

- **Filter by campaign** to see who participated in a specific study.
- **Check individual profiles** to see a contact's full campaign history.
- **Create segments** based on participation patterns (e.g., "completed 3+ campaigns" or "last surveyed more than 90 days ago").
- **Avoid survey fatigue** by checking how recently contacts were last surveyed before targeting them again.

---

## Common Workflows

### Build a Research Panel for a New Product Launch

1. **Import contacts** — Upload a CSV with demographic data via Properties
2. **Add custom properties** — Create attributes like "product_interest", "purchase_frequency", and "loyalty_tier"
3. **Create segments** — Build dynamic groups like "Premium Skincare Buyers" or "Available for Research" (last surveyed > 30 days ago)
4. **Launch campaigns** — Target your segments when you're ready to collect feedback

### Test Campaign Questions with AI Before Going Live

1. **Create an AI population** during campaign setup that matches your target audience demographics
2. **Run the campaign** against the AI population to collect simulated responses
3. **Review the results** — Are the questions clear? Are you getting diverse perspectives?
4. **Refine and relaunch** to real participants with confidence

### Segment Your Beauty Enthusiasts by Purchase Frequency

1. **Create properties** for "purchase_frequency" (Number) and "product_category" (Multi-select)
2. **Import data** via CSV from your CRM
3. **Build segments** like "Heavy Buyers" (purchase_frequency > 8/year) and "Occasional Shoppers" (purchase_frequency 1-3/year)
4. **Compare insights** — Run the same campaign to both segments and see how responses differ

---

## Troubleshooting

### Contacts Not Appearing

- Verify the invitation was sent and the email address is correct
- Ask the contact to check their spam folder
- Make sure you're viewing the correct workspace
- Try refreshing the page

### Segment Returns Unexpected Results

- Review each rule carefully — check that **Any** vs. **All** logic is correct
- Verify that contacts have the expected property values set
- Test with a known contact to confirm matching behavior

### CSV Import Fails

- Save as UTF-8 encoding
- Match column headers exactly to property names
- Use YYYY-MM-DD format for dates
- Try a small test file first (5-10 rows)

### Duplicate Contacts

1. Search for the contact by email to confirm the duplicate exists.
2. Duplicates usually happen when the same person is invited via different methods (email invite + campaign link) or when email addresses have slight variations (e.g., `jane@company.com` vs. `jane+research@company.com`).
3. To resolve, decide which profile has better data, then manually add any missing properties from the duplicate to the primary profile.
4. Delete the duplicate contact.
5. To prevent future duplicates, standardize on one email address per contact and use CSV imports with the email column to match existing records.

### Property Values Not Showing Correctly

1. Check that the property type matches the data. For example, if you created a "Number" property but imported text values, the data may not display correctly.
2. For Single Select properties, verify that the imported value exactly matches one of the defined choices (including capitalization).
3. For Date properties, confirm the format is YYYY-MM-DD.
4. If values appear garbled, the CSV file may not be UTF-8 encoded. Re-export from your spreadsheet with UTF-8 encoding.
5. Try editing the value directly on a contact profile to see if it saves correctly — this can help isolate whether the issue is with the import or the property definition.

### Segment Not Updating Dynamically

1. Confirm the segment uses **dynamic rules** (segments, not lists). Lists are static and only update when you manually change them.
2. Check that the property values for your contacts have actually changed. The segment only updates when the underlying data changes.
3. Verify the rules still make sense — if you changed a property from Text to Number type, existing rules may not match anymore.
4. Try editing the segment, making no changes, and saving again. This can trigger a refresh.
5. If a segment shows 0 contacts when you expect more, review each rule individually to find the one that's too restrictive.

### CSV Import Column Mapping Issues

1. Column headers must match property names **exactly** — including capitalization, spaces, and special characters.
2. Remove any extra spaces before or after header names (common in Excel exports).
3. If you have columns in your CSV that don't match any property, they'll be ignored silently. Check the import summary to see which columns were mapped.
4. For multi-select properties, use semicolons to separate values (e.g., `skincare;haircare`), not commas (which would be interpreted as a CSV delimiter).
5. If column mapping seems random, open your CSV in a text editor to check that it's actually comma-delimited and not tab-delimited or semicolon-delimited.

### Population Charts Showing Unexpected Distributions

1. Check the population size — very small populations (under 20 personas) may not show representative distributions.
2. Verify the population was generated with the correct demographic parameters. If the source data was skewed, the population will reflect that skew.
3. Use the category pills to filter which attributes are displayed — sometimes an unexpected distribution in one chart makes sense when viewed alongside other attributes.
4. If the population doesn't match your target demographic, consider regenerating it with more specific parameters.

---

## Frequently Asked Questions

::: details Click to expand

**Q: How many contacts can my workspace hold?**
There's no hard limit on the number of contacts. Workspaces with thousands of contacts work well. If you have very large lists (10,000+), filtering and search become especially important for finding the right people.

**Q: Can I export my contact list?**
Currently, contact export is handled through your workspace settings or by contacting support. Individual contact data can be viewed in profile pages.

**Q: What's the difference between a population and a list?**
A **population** is a group of AI-generated personas — they don't represent real people. A **list** is a manually curated group of real human contacts. Use populations for quick AI testing; use lists for targeting real participants.

**Q: Can I use the same contact in multiple campaigns?**
Yes. A contact can participate in as many campaigns as they're invited to. Use the "last surveyed" property and segments to avoid over-surveying.

**Q: How do I prevent survey fatigue?**
Track the `last_survey_completed` date as a property. Create a segment rule like "last_survey_completed > 14 days ago" to exclude recently surveyed contacts from new campaigns.

**Q: Can I merge two lists?**
Yes. Select multiple lists, then use the **Combine Lists** bulk action to merge them into a single new list.

**Q: Do segments update in real time?**
Segments update as contact data changes. When you update a property value (manually or via import), any segments using that property will reflect the change.

**Q: What happens when I delete a contact?**
The contact and all their response data are permanently removed. They'll also be removed from all lists and segments. This action cannot be undone.

**Q: Can I re-invite a deleted contact?**
Yes, but they'll start fresh as a new contact. Their previous response history will not be recovered.

**Q: How do populations work with campaigns?**
During campaign setup, you can select an AI population as your target audience. The population's AI personas will "respond" to your campaign questions, giving you simulated data that you can analyze before launching to real participants.
:::

---

## Next Steps

- [Launch a campaign targeting your audience](/guide/campaigns)
- [Use AI agents to analyze research data](/guide/agents)
- [Automate audience workflows](/guide/workflows)
- [Upload data to datasets for AI analysis](/guide/datasets)
