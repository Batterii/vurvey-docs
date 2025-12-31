# People

The People section manages your audiences, populations, and participant data for targeted research. This section is accessed via the **Audience** navigation item in the sidebar.

## Overview

![People Section](/screenshots/people/01-people-main.png)

The People section provides a CRM-style interface for managing your research participants and AI-generated populations.

## Navigation Tabs

| Tab | Purpose |
|-----|---------|
| **Populations** | Manage synthetic and real audience groups used by AI agents |
| **Contacts** | Individual participant records and response history |
| **Lists** | Organize people into reusable segments for targeting |
| **Properties** | Define and manage custom attributes for profiles |

## Populations

![Populations](/screenshots/people/02-populations.png)

Populations are groups that AI agents can represent or analyze during research conversations.

### Key Features
- View all active audience groups in a grid layout
- Search populations by name
- Sort by "Most Recently Updated" or other criteria
- Create new populations with demographic criteria

### Population Types

| Type | Description |
|------|-------------|
| **Synthetic** | AI-generated representative samples based on demographic parameters |
| **Real** | Based on actual participant data from your contacts |
| **Hybrid** | Combination of synthetic profiles augmented with real data |

### Creating Populations

1. Click **+ Create Population** button
2. Define demographic criteria (age, gender, location, etc.)
3. Set population size and distribution parameters
4. Configure sampling rules
5. Save and activate the population

### Population Details

Click any population card to view:
- Population overview and statistics
- Member breakdown by demographics
- Usage history (which agents or campaigns used this population)
- Edit or archive options

## Contacts

![Contacts](/screenshots/people/03-contacts.png)

The Contacts tab manages individual participant profiles and their interaction history with your research campaigns.

### Features
- Import participant data from CSV or Excel files
- View complete response history per contact
- Filter and segment by demographics or custom properties
- Track participation status and engagement

### Contact Actions

| Action | Description |
|--------|-------------|
| **Import** | Bulk upload participant records from spreadsheets |
| **Export** | Download contact data for external analysis |
| **Merge** | Combine duplicate records into single profiles |
| **Archive** | Preserve inactive contacts without deleting |

### Contact Profile

Each contact profile includes:
- Basic information (name, email, demographics)
- Custom property values
- Campaign participation history
- Response transcripts and videos
- Segment memberships

## Lists

![Lists & Segments](/screenshots/people/04-lists-segments.png)

Lists allow you to create reusable audience definitions for campaigns and workflows.

### Creating Lists

1. **Define criteria**
   - Demographic filters (age range, location, etc.)
   - Behavioral attributes (past participation, response quality)
   - Custom property values

2. **Save the list**
   - Provide a descriptive name
   - Add notes about the list's purpose
   - Choose sharing settings

3. **Apply to campaigns**
   - Select lists when configuring campaign targeting
   - Combine multiple lists for complex targeting
   - Use exclusion lists to avoid certain participants

### List Types

| Type | Use Case |
|------|----------|
| **Static** | Fixed list of specific contacts - membership doesn't change |
| **Dynamic** | Auto-updates based on criteria - membership changes as contacts change |
| **Exclusion** | People to exclude from research (e.g., internal staff, duplicate participants) |

## Properties

![Properties](/screenshots/people/05-properties.png)

Properties define the custom attributes you can track for each contact in your system.

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

Create fields specific to your research needs:

| Property Type | Example Use Cases |
|---------------|-------------------|
| **Text** | Occupation, favorite brand, open-ended preferences |
| **Number** | Income level, satisfaction score, household size |
| **Date** | Signup date, last survey completion, birthday |
| **Single Select** | Membership tier, customer segment, preferred contact method |
| **Multi-select** | Product categories of interest, communication preferences |
| **Boolean** | Has purchased, opted into marketing, verified email |

### Managing Properties

1. Click **+ Add Property** button
2. Set property name and select type
3. Configure validation rules (required, min/max values, etc.)
4. Optionally map to survey question fields for auto-population
5. Save the property

::: warning Property Changes
Modifying or deleting properties may affect existing segments, campaign targeting rules, and workflow automations. Review dependencies before making changes.
:::

## Best Practices

### Data Quality
- Validate imported data before processing
- Deduplicate records regularly using the merge feature
- Keep property definitions consistent across your organization
- Archive rather than delete to preserve history

### Privacy & Compliance
- Follow data protection regulations (GDPR, CCPA, etc.)
- Use anonymization for sensitive research
- Implement appropriate access controls
- Document data retention policies

### Organization
- Use clear, descriptive names for populations and lists
- Document segment criteria in list descriptions
- Review and archive outdated populations quarterly
- Standardize property names and values

## Next Steps

- [Create a campaign targeting specific populations](/guide/campaigns)
- [Use populations with AI agents in chat](/guide/home)
- [Automate audience workflows](/guide/workflows)
- [Upload data to datasets for AI analysis](/guide/datasets)
