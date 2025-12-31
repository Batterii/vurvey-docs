# People

The People section manages your audiences, populations, and participant data for targeted research. This section is accessed via the **Audience** navigation item in the sidebar.

## Overview

![People Section](/screenshots/people/01-people-main.png)

The People section provides a CRM-style interface for managing research participants, AI-generated populations, and custom audience segments.

## Navigation Tabs

The page header contains navigation buttons to switch between different views:

| Tab | Icon | Purpose |
|-----|------|---------|
| **Populations** | Sparkle | View AI-generated audience patterns and demographic distributions |
| **Humans** | Users | Manage individual contacts and participants |
| **Lists & Segments** | Segments | Organize people into static lists or dynamic rule-based segments |
| **Properties** | Tag | Define custom attributes for contact profiles |

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

### Population Types

| Type | Description |
|------|-------------|
| **Synthetic** | AI-generated representative samples based on demographic parameters |
| **Real** | Based on actual participant data from your contacts |
| **Hybrid** | Combination of synthetic profiles augmented with real data |

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
| **Name** | Segment name (click to edit) |
| **Creators** | Number of matching contacts |
| **Created** | Creation date |
| **Options** | Edit, Copy, Delete |

#### Combined Segments

Select multiple segments and use **Create Combined Segment** to merge their rules into a new segment.

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

### Organization

- Use clear, descriptive names for populations and lists
- Document segment criteria in descriptions
- Review and archive outdated populations quarterly
- Standardize property names and values

## Next Steps

- [Create a campaign targeting specific populations](/guide/campaigns)
- [Use populations with AI agents in chat](/guide/home)
- [Automate audience workflows](/guide/workflows)
- [Upload data to datasets for AI analysis](/guide/datasets)
