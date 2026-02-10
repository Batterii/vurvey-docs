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
| **Lists & Segments** | Ways to organize your audiences into reusable groups |
| **Properties** | Custom attributes you track about your audience |
| **Molds** | Templates for creating consistent persona profiles (Enterprise only) |

::: info Enterprise Feature
The **Molds** tab is only visible to enterprise workspaces. It lets you create reusable templates for consistent AI population generation.
:::

---

## Populations

![Populations](/screenshots/people/02-populations.png)

Populations are AI-generated audience groups that represent different consumer segments. Use them to simulate focus group discussions, test campaign questions before launch, or fill gaps when you don't have enough real participants.

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
2. Select an **Operator** (equals, contains, greater than, is set, in list, etc.)
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

### Managing Categories

Organize properties into categories like "Demographics", "Purchase Behavior", or "Research Preferences" using the category dropdown. Click **+ Create new category** or **Edit Categories** to manage them.

### Importing Data with CSV

Upload properties and values in bulk:

1. Click the upload button
2. Select your CSV file
3. Choose an action: **Add** (new values only), **Update** (update existing), or **Replace** (overwrite everything)

Your CSV must include an email column to match contacts and headers that match property names.

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

---

## Next Steps

- [Launch a campaign targeting your audience](/guide/campaigns)
- [Use AI agents to analyze research data](/guide/agents)
- [Automate audience workflows](/guide/workflows)
- [Upload data to datasets for AI analysis](/guide/datasets)
