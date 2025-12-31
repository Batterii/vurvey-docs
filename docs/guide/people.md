# People

The People section manages your audiences, populations, and participant data for targeted research.

## Overview

![People Section](/screenshots/people/01-people-main.png)

The People section is organized into four sub-sections accessible via tabs.

## Navigation Tabs

| Tab | Purpose |
|-----|---------|
| **Populations** | Manage synthetic and real audience groups |
| **Humans** | Individual real participant records |
| **Lists & Segments** | Organize people into reusable segments |
| **Properties** | Define custom attributes for profiles |

## Populations

![Populations](/screenshots/people/02-populations.png)

Populations are groups that agents can represent or analyze during research.

### Key Features
- View all active audience groups
- Search by population name
- Sort by "Most Recently Updated"
- Paginate through large lists

### Population Types

| Type | Description |
|------|-------------|
| **Synthetic** | AI-generated representative samples |
| **Real** | Based on actual participant data |
| **Hybrid** | Combination of synthetic and real data |

### Creating Populations
1. Click **+ Create Population**
2. Define demographic criteria
3. Set size and distribution
4. Configure sampling parameters

## Humans

![Humans](/screenshots/people/03-humans.png)

Manage individual participant profiles and their response history.

### Features
- Import participant data from CSV/Excel
- View complete response history
- Segment by demographics
- Track participation status

### Data Management
- **Import** - Bulk upload participant records
- **Export** - Download participant data
- **Merge** - Combine duplicate records
- **Archive** - Preserve inactive participants

## Lists & Segments

![Lists & Segments](/screenshots/people/04-lists-segments.png)

Create reusable audience definitions for campaigns and workflows.

### Creating Segments

1. **Define criteria**
   - Demographic filters
   - Behavioral attributes
   - Response history

2. **Save segment**
   - Name and describe
   - Make reusable
   - Share with team

3. **Apply to campaigns**
   - Target specific audiences
   - Ensure representative samples

### Segment Types

| Type | Use Case |
|------|----------|
| **Static** | Fixed list of participants |
| **Dynamic** | Auto-updates based on criteria |
| **Exclusion** | People to exclude from research |

## Properties

![Properties](/screenshots/people/05-properties.png)

Define and manage custom attributes for people profiles.

### Built-in Properties
- Name
- Email
- Age
- Gender
- Location

### Custom Properties
Create fields specific to your research needs:

| Property Type | Example |
|---------------|---------|
| **Text** | Occupation, interests |
| **Number** | Income level, score |
| **Date** | Signup date, last response |
| **Select** | Category membership |
| **Multi-select** | Multiple tags |

### Managing Properties
1. Click **+ Add Property**
2. Set name and type
3. Configure validation rules
4. Map to survey fields

::: warning Property Changes
Modifying properties may affect existing segments and campaign targeting. Test changes in staging first.
:::

## Best Practices

### Data Quality
- Validate imports before processing
- Deduplicate records regularly
- Keep properties consistent

### Privacy
- Follow data protection regulations
- Anonymize when appropriate
- Secure sensitive information

### Organization
- Use clear naming conventions
- Document segment criteria
- Archive outdated populations

## Next Steps

- [Create a campaign targeting specific populations](/guide/campaigns)
- [Use populations in workflows](/guide/workflows)
- [Connect participant data to datasets](/guide/datasets)
