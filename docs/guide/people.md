# People

The People section is your research audience headquarters. Manage real participants who take your surveys, create AI-generated populations for testing, organize everyone into segments for targeted campaigns, and define custom attributes to track across your research.

## Overview

![People Section](/screenshots/people/01-people-main.png)

The People section (accessed via **Audience** in the sidebar) provides a comprehensive CRM-style interface for managing:

- **Real human participants** who respond to your campaigns
- **AI-generated populations** for synthetic research and concept testing
- **Lists and segments** for organizing and targeting audiences
- **Custom properties** to track any attributes you need

::: tip What Can You Do in the People Section?
- **Build research panels** of qualified participants
- **Create AI populations** to test campaigns before launch
- **Segment audiences** by demographics, behavior, or custom criteria
- **Track custom attributes** like purchase history, preferences, or research tier
- **Target specific groups** when launching campaigns
- **Analyze participant patterns** across your research
:::

## Navigation Structure

The People section contains five main tabs, each accessible via the navigation buttons at the top of the page:

| Tab | Icon | Purpose | Route |
|-----|------|---------|-------|
| **Populations** | Sparkle Stars | View AI-generated audience patterns and demographic distributions | `/people/populations` |
| **Humans** | Users | Manage individual contacts and participants | `/people/community` |
| **Lists & Segments** | User List | Organize people into static lists or dynamic rule-based segments | `/people/lists` |
| **Properties** | Label Tag | Define custom attributes for contact profiles | `/people/properties` |
| **Molds** | AI Chip | Design reusable persona templates (Enterprise only) | `/people/molds` |

::: info Enterprise Feature
The **Molds** tab is only visible to enterprise workspace managers and support users. It enables creating reusable persona templates for consistent AI population generation.
:::

---

## Populations

![Populations](/screenshots/people/02-populations.png)

Populations are AI-generated audience groups that represent different demographic segments and behavioral patterns. Use them to test campaigns, validate concepts, or simulate responses before engaging real participants.

### Understanding Populations

Populations contain AI personas—synthetic profiles based on demographic parameters that can:

- **Respond to surveys** like real participants
- **Provide diverse perspectives** across demographics
- **Test campaign questions** before launch
- **Fill gaps** when you don't have enough real participants

::: tip Population Strategy
| Population Type | Description | Best For |
|----------------|-------------|----------|
| **Synthetic** | AI-generated representative samples based on demographic parameters | Concept testing, message validation, quick feedback |
| **Real** | Based on actual participant data from your contacts | Final validation, production research |
| **Hybrid** | Combination of synthetic profiles augmented with real data | Filling gaps in small samples |
:::

### Viewing Populations

The Populations tab displays your populations in a card-based grid layout.

**Each population card shows:**
- **Population Name** - Descriptive title
- **Member Count** - Number of personas in the population
- **Last Updated** - When the population was last modified

**Available Controls:**
- **Search** - Filter populations by name
- **Sort By** - Order by most recently updated (default) or other criteria

### Population Card Actions

Click the three-dot menu on any population card to access:

| Action | Description |
|--------|-------------|
| **View** | Open population details page |
| **Edit** | Modify population settings |
| **Delete** | Remove the population |
| **Duplicate** | Create a copy of the population |

### Population Details Page

Click any population card to access the detailed analytics view.

#### Page Header

- **Back Button** - Return to populations list
- **Population Name** - Displayed as page title
- **Description** - Optional population description
- **View Toggle** - Switch between Charts and Table views

#### Charts View (Default)

The Charts view provides visual analytics dashboards:

<img
  :src="'/screenshots/people/02a-population-charts.png?optional=1'"
  alt="Population Charts"
  @error="$event.target.remove()"
/>

**Persona Carousel**
- Scrollable preview of representative personas
- Click any persona to view full details
- Shows avatar, name, and key demographics

**Facet Distribution Charts**

| Chart Type | Purpose | Example |
|------------|---------|---------|
| **Donut Charts** | Categorical distributions | Gender split, age groups |
| **Bar Charts** | Rankings and comparisons | Brand preferences, satisfaction scores |
| **Treemap Charts** | Hierarchical data | Location breakdown (Country > State > City) |
| **Diverging Bar Charts** | Sentiment/polarity data | Agreement vs. disagreement |
| **Funnel Charts** | Conversion flows | Awareness > Consideration > Purchase |

**Category Navigation**
- Pills/tabs to filter which facets are displayed
- Toggle different demographic categories on/off
- Focus on specific data segments

**Tooltip Information**
- Hover over any chart element for detailed breakdown
- Shows exact counts and percentages

#### Table View

Switch to Table view using the table icon for a detailed list of all personas:

| Column | Description |
|--------|-------------|
| **Avatar** | Visual representation of the persona |
| **Name** | Persona display name |
| **Demographics** | Key demographic attributes |
| **Match Score** | How well persona matches population criteria |
| **Options** | Row action menu |

**Table Actions:**
- Click any row to open the persona detail modal
- View full persona profile, attributes, and behavioral insights
- Pagination: 20 personas per page

### Creating Populations

::: info Creation Location
Populations are typically created during campaign setup or through the AI agent builder. The Populations tab is primarily for viewing and managing existing populations.
:::

**Populations can be created from:**

1. **Campaign Launch** - When targeting AI personas for a campaign
2. **Agent Builder** - When designing AI personas with specific demographics
3. **People Models** - When configuring survey simulations

::: tip Pro Tip: Population Quality
- Keep populations focused on specific demographics or use cases
- Use clear, descriptive names like "US Millennials - Urban - Tech Enthusiasts"
- Document the demographic parameters in the population description
- Review persona distributions before using in production campaigns
:::

---

## Humans (Contacts)

![Humans](/screenshots/people/03-humans.png)

The Humans tab manages your real human participants—contacts who can receive campaign invitations and provide genuine feedback.

### Contact Table Overview

Contacts are displayed in a sortable, filterable table with the following columns:

| Column | Description | Sortable |
|--------|-------------|----------|
| **Checkbox** | Select for bulk actions | No |
| **Name** | Avatar and display name (click to view profile) | Yes (A-Z, Z-A) |
| **Age** | Contact's age if provided | Yes (Low-High, High-Low) |
| **Last Active** | Most recent activity date | Yes (Recent-Old, Old-Recent) |
| **Options** | Action menu for individual contacts | No |

### Search and Filter

**Search Bar**
- Real-time search by contact name
- Placeholder: "Search creators..."

**Filter Panel**
Click the filter button to open the filter panel with options:

| Filter Type | Description |
|-------------|-------------|
| **Campaigns** | Filter by campaign participation |
| **Properties** | Filter by custom attribute values |
| **Clear Filters** | Reset all active filters |

::: tip Pro Tip: Advanced Filtering
Combine multiple filters to find specific segments:
- Filter by campaign participation AND property values
- Find inactive users from specific campaigns
- Identify high-value participants for follow-up research
- Locate participants with specific demographics or attributes
:::

### Adding Contacts

Click the **+ Add** button to invite new contacts to your workspace.

**Invite Modal Options:**

| Field | Description |
|-------|-------------|
| **Email Addresses** | Enter one or more email addresses (comma or line-separated) |
| **Send Invitation** | Emails are sent immediately upon submission |

**What Happens Next:**
1. Invitations are sent to all entered email addresses
2. Recipients receive an email with workspace join link
3. New contacts appear in your list once they accept
4. Contacts can then be targeted for campaigns

### Bulk Actions

When one or more contacts are selected, bulk action buttons appear:

| Action | Description |
|--------|-------------|
| **Delete** | Remove selected contacts from workspace (permanent) |
| **Add to List** | Add selected contacts to an existing list or create a new one |
| **Add Property** | Batch assign a property value to all selected contacts |

**Bulk Delete Warning:**
- Deletion is permanent and cannot be undone
- All response history for deleted contacts is also removed
- You'll see a confirmation dialog before deletion proceeds

### Individual Contact Actions

Click the three-dot menu on any contact row:

| Action | Description |
|--------|-------------|
| **Delete** | Remove this contact from workspace |
| **Add Property** | Assign a property value to this contact |

### Contact Profile Modal

Click a contact's name to open their detailed profile:

<img
  :src="'/screenshots/people/03a-contact-profile.png?optional=1'"
  alt="Contact Profile"
  @error="$event.target.remove()"
/>

**Profile Sections:**

| Section | Contents |
|---------|----------|
| **Basic Information** | Name, email, avatar, age, gender, location |
| **Custom Properties** | All assigned property values |
| **Campaign History** | List of campaigns they've participated in |
| **Response Data** | Transcripts, videos, and responses |
| **Segment Memberships** | Lists and segments they belong to |

**Profile Actions:**
- Edit contact details
- Add or modify properties
- View full response transcripts
- Navigate to specific campaign responses

::: tip Pro Tip: Profile Enrichment
Build rich contact profiles over time:
- Add custom properties after each interaction
- Tag participation quality (gold, silver, bronze responders)
- Note follow-up preferences or restrictions
- Record special circumstances or VIP status
- Track opt-in/opt-out preferences
:::

### Contact Data Sources

Contacts can be added to your workspace through:

| Source | How It Works |
|--------|--------------|
| **Email Invitation** | Direct invite from Humans tab |
| **Campaign Links** | Public or shared campaign links |
| **CSV Import** | Bulk import via Properties upload |
| **API Integration** | Synced from external CRM systems |
| **QR Codes** | Scanned from physical materials |

---

## Lists & Segments

![Lists & Segments](/screenshots/people/04-lists-segments.png)

Organize your contacts into reusable groups for campaign targeting, analysis, and ongoing engagement.

### Lists vs. Segments: Key Differences

| Feature | Lists | Segments |
|---------|-------|----------|
| **Type** | Static | Dynamic |
| **Membership** | Manually managed | Auto-updates based on rules |
| **Updates** | Only when you add/remove contacts | Automatically when contacts match rules |
| **Best For** | VIP groups, project teams, manual curation | Behavioral targeting, demographic groups |
| **Maintenance** | Requires manual updates | Set rules once, auto-maintained |

### View Toggle

Use the dropdown at the top of the page to switch between:

- **Lists** - View and manage static lists
- **Segments** - View and manage dynamic segments

---

## Lists

Lists are static, manually-managed groups of contacts. You control exactly who is in each list.

### Creating a List

1. Click **New List** button
2. Enter a list name in the modal
3. Click **Create**
4. Add contacts from the Humans tab using bulk actions

### List Table

| Column | Description | Sortable |
|--------|-------------|----------|
| **Checkbox** | Select for bulk actions | No |
| **Name** | List name (click to edit inline) | Yes (A-Z, Z-A) |
| **User Count** | Number of contacts in the list | Yes (Low-High, High-Low) |
| **Created** | Creation date | Yes (Recent-Old, Old-Recent) |
| **Options** | Row action menu | No |

**Inline Name Editing:**
- Click on any list name to edit
- Press Enter to save or Escape to cancel
- Changes save immediately

### List Actions

**Row Actions (three-dot menu):**

| Action | Description |
|--------|-------------|
| **Edit** | Open list for editing |
| **Duplicate** | Create a copy of the list with all members |
| **Delete** | Remove the list (contacts are not deleted) |

**Bulk Actions (when lists selected):**

| Action | Description |
|--------|-------------|
| **Delete** | Remove all selected lists |
| **Combine Lists** | Merge selected lists into a single new list |

### Managing List Members

To add contacts to a list:

1. Go to the **Humans** tab
2. Select one or more contacts
3. Click **Add to List** in bulk actions
4. Choose an existing list or create a new one

To remove contacts from a list:

1. Go to **Humans** tab
2. Filter by the list (if supported)
3. Select contacts to remove
4. Use the Remove option

::: tip Pro Tip: List Management Best Practices
- **Create project-specific lists** for campaign targeting (e.g., "2024 Holiday Research Panel")
- **Use lists for VIP participants** who get priority access to studies
- **Archive completed project lists** rather than deleting them
- **Document list purposes** in naming conventions (e.g., "VIP-Beauty-Enthusiasts-Q4")
- **Review lists quarterly** to remove inactive participants
:::

---

## Segments

Segments are dynamic groups that automatically include contacts matching your defined rules. As contacts change, segment membership updates automatically.

### Creating a Segment

1. Click **New Segment** button
2. Define your rules in the segment builder:

**Rule Components:**

| Component | Description |
|-----------|-------------|
| **Property** | The attribute to check (age, location, custom property, etc.) |
| **Operator** | How to compare (equals, contains, greater than, etc.) |
| **Value** | The value to match against |

**Match Types:**

| Match Type | Logic | Example |
|------------|-------|---------|
| **Any** | OR logic | Contact matches if ANY rule is true |
| **All** | AND logic | Contact must match ALL rules |

3. Preview matching contacts
4. Save the segment

### Segment Table

| Column | Description | Sortable |
|--------|-------------|----------|
| **Checkbox** | Select for bulk actions | No |
| **Name** | Segment name (click to view/edit) | Yes (A-Z, Z-A) |
| **Creators** | Number of matching contacts | No |
| **Created** | Creation date | Yes (Recent-Old, Old-Recent) |
| **Options** | Row action menu | No |

### Segment Actions

**Row Actions (three-dot menu):**

| Action | Description |
|--------|-------------|
| **Edit** | Open segment rule builder |
| **Copy** | Duplicate the segment with all rules |
| **Delete** | Remove the segment |

**Bulk Actions (when segments selected):**

| Action | Description |
|--------|-------------|
| **Delete** | Remove all selected segments |
| **Create Combined Segment** | Merge rules from selected segments into a new one |

### Segment Rule Builder

The segment builder provides a visual interface for creating complex rules:

<img
  :src="'/screenshots/people/04a-segment-builder.png?optional=1'"
  alt="Segment Builder"
  @error="$event.target.remove()"
/>

**Available Operators:**

| Operator | Description | Example |
|----------|-------------|---------|
| **equals** | Exact match | `gender equals Female` |
| **not equals** | Does not match | `status not equals Inactive` |
| **contains** | Text contains substring | `email contains @gmail.com` |
| **does not contain** | Text excludes substring | `location does not contain California` |
| **greater than** | Numeric comparison | `age greater than 25` |
| **less than** | Numeric comparison | `age less than 65` |
| **is set** | Property has a value | `phone is set` |
| **is not set** | Property is empty | `email is not set` |
| **in list** | Contact is in specified list | `in list VIP-Panel` |
| **not in list** | Contact is not in list | `not in list Opt-Out` |

### Combined Segments

To create a combined segment from existing segments:

1. Select multiple segments using checkboxes
2. Click **Create Combined Segment** in bulk actions
3. Review the merged rules
4. Modify if needed
5. Save with a new name

::: tip Pro Tip: Segment Strategy
Segments are powerful for:
- **Behavioral targeting** - People who completed X campaigns
- **Demographic targeting** - Age, location, gender combinations
- **Engagement targeting** - Active vs. dormant participants
- **Value targeting** - High-responders, quality participants
- **Exclusion targeting** - Everyone except those who participated recently
:::

### Segment Use Cases

**Example Segments:**

| Segment Name | Rules | Use Case |
|--------------|-------|----------|
| **High-Value Customers** | purchases > $500/year | Premium product research |
| **New Customers** | created_date within 90 days | Onboarding feedback |
| **At-Risk Customers** | last_active > 6 months | Re-engagement campaigns |
| **Brand Advocates** | NPS score >= 9 | Referral programs, testimonials |
| **US Northeast** | state in [NY, NJ, CT, MA] | Regional product testing |
| **Millennials** | age between 28-43 | Generational research |

---

## Properties

![Properties](/screenshots/people/05-properties.png)

Properties are custom attributes you can track for contacts beyond the built-in fields. Define any data point relevant to your research needs.

### Built-in Properties

These default properties are available for all contacts without configuration:

| Property | Type | Description |
|----------|------|-------------|
| **Name** | Text | Contact's display name |
| **Email** | Text | Email address |
| **Age** | Number | Contact's age |
| **Gender** | Select | Gender identity |
| **Location** | Text | Geographic location |
| **Created Date** | Date | When contact was added |
| **Last Activity** | Date | Most recent engagement |

### Custom Property Types

Create properties specific to your research needs:

| Property Type | Description | Example Use Cases |
|---------------|-------------|-------------------|
| **Text** | Free-form text entry | Occupation, favorite brand, open-ended preferences |
| **Number** | Numeric values | Income level, household size, satisfaction score |
| **Date** | Calendar date | Signup date, last purchase, birthday |
| **Single Select** | Choose one option from list | Membership tier, customer segment, preferred contact method |
| **Multi-select** | Choose multiple options | Product categories of interest, communication preferences |
| **Boolean** | True/false toggle | Has purchased, opted into marketing, verified email |

::: tip Pro Tip: Property Design
Design properties for flexibility:
- Use **Single Select** for standardized categories that need consistency
- Use **Text** sparingly (harder to segment and analyze)
- Create **Boolean** flags for important milestones (first_purchase, email_verified)
- Use **Number** for scores you'll want to filter or sort by
- Consider **Date** properties for time-based segmentation
:::

### Properties Table

| Column | Description | Sortable |
|--------|-------------|----------|
| **Name** | Property name (click to view details) | Yes (A-Z, Z-A) |
| **Used** | Count of rules/contacts using this property | Yes (Low-High, High-Low) |
| **Category** | Property category (e.g., "Demographics") | Yes |
| **Created by** | User who created the property | Yes (A-Z, Z-A) |
| **Options** | Row action menu | No |

### Creating a Property

1. Click **+ New Property** button
2. Complete the property form:

| Field | Description | Required |
|-------|-------------|----------|
| **Name** | Property identifier | Yes |
| **Type** | Property data type (see types above) | Yes |
| **Category** | Organizational category | No (defaults to Uncategorized) |
| **Options** | For Select types, define available choices | For Select types |
| **Validation Rules** | Optional constraints | No |

3. Save the property

### Property Actions

**Row Actions (three-dot menu):**

| Action | Description |
|--------|-------------|
| **Edit** | Modify property settings |
| **Delete** | Remove the property |

::: warning Deleting Properties
When you delete a property:
- All values assigned to contacts are also deleted
- Any segments using this property will need to be updated
- Campaign targeting rules may be affected
- This action cannot be undone

**Before deleting**, check the "Used" count to understand the impact.
:::

### Managing Categories

Organize properties into categories for easier management:

**Category Dropdown Options:**
- **All Categories** - View all properties
- **[Category Name]** - Filter by specific category
- **Edit Categories** - Rename existing categories
- **+ Create new category** - Add a new category

**Creating a Category:**
1. Click **+ Create new category** in the dropdown
2. Enter the category name
3. Click Create

**Editing Categories:**
1. Click **Edit Categories** in the dropdown
2. Rename or manage existing categories
3. Save changes

### CSV Upload (Bulk Import)

Import properties and values in bulk using CSV files:

1. Click the **Upload** button (upload icon)
2. Select your CSV file
3. Choose an import action:

| Action | Description |
|--------|-------------|
| **Add** | Add new values only (skip existing) |
| **Update** | Update existing values (add new ones) |
| **Replace** | Replace all values (delete existing, add new) |

4. Upload and process

**CSV Format Requirements:**
- UTF-8 encoding
- First row must contain column headers
- Headers must match property names
- Include an email column to identify contacts

**Example CSV:**
```csv
email,membership_tier,purchase_count,last_purchase_date
alice@example.com,Gold,15,2024-01-15
bob@example.com,Silver,5,2024-02-20
carol@example.com,Bronze,1,2024-03-01
```

::: tip Pro Tip: CSV Import Strategy
- **Test with a small file first** (5-10 rows) to verify format
- **Use Add action** when appending to existing data
- **Use Replace action** when syncing from an external source
- **Back up existing data** before using Replace action
- **Validate email addresses** before import to avoid orphan records
:::

---

## Molds (Enterprise Only)

::: warning Enterprise Feature
Molds are only available to enterprise workspace managers and support users. Contact your account manager to enable this feature.
:::

<img
  :src="'/screenshots/people/06-molds.png?optional=1'"
  alt="Molds"
  @error="$event.target.remove()"
/>

Molds are reusable persona templates for consistent AI population generation. Design a mold once, then generate unlimited AI personas with consistent characteristics.

### Understanding Molds

A mold defines:
- **Demographic parameters** - Age ranges, locations, genders, etc.
- **Behavioral characteristics** - Interests, preferences, tendencies
- **Generation rules** - How variations are created
- **Instruction snippets** - AI guidance for persona responses

### Molds Table

| Column | Description |
|--------|-------------|
| **Name** | Mold template name |
| **Status** | Draft, Live (Published), or Archived |
| **Updated** | Last modification time (relative, e.g., "2 hours ago") |
| **Preview Count** | Number of preview personas generated |
| **Coverage Score** | Average demographic coverage percentage |
| **Last Validated** | When readiness was last checked |
| **Readiness** | Publication readiness indicator |

### Mold Status Lifecycle

| Status | Description | Can Generate? |
|--------|-------------|---------------|
| **Draft** | Work in progress | No (preview only) |
| **Live** | Published and active | Yes |
| **Archived** | Deprecated but retained | No |

### Creating a Mold

1. Click **New Mold** button (Plus icon)
2. Navigate to the mold builder
3. Configure all required fields:

**Mold Configuration Fields:**

| Field | Description | Format |
|-------|-------------|--------|
| **Name** | Template identifier | Text |
| **Description** | Purpose and use case | Text |
| **Category** | Organizational category | Select |
| **Facet Configs** | Demographic characteristics | JSON array |
| **Instruction Snippets** | AI generation hints | JSON array |
| **Generation Rule** | Complex generation logic | JSON object |
| **Metadata** | Additional configuration | JSON |

### Mold Details Page

The mold details page allows editing of all configuration:

<img
  :src="'/screenshots/people/06a-mold-details.png?optional=1'"
  alt="Mold Details"
  @error="$event.target.remove()"
/>

**Editable Fields:**
- Name (text input)
- Description (text area)
- Category (select dropdown)
- Status (Draft/Published/Archived)
- Facet Configs (JSON editor)
- Instruction Snippets (JSON editor)
- Generation Rule (JSON editor)
- Metadata (JSON editor)

**Save Behavior:**
- Changes save immediately on button click
- Success toast: "Mold updated"
- Error toast with details if save fails

### Readiness Validation

Before publishing a mold, the system validates:

| Check | Description |
|-------|-------------|
| **Required fields** | All mandatory fields completed |
| **Valid JSON** | Facet configs, rules, and metadata are valid JSON |
| **Coverage minimum** | Demographic coverage meets threshold |
| **Generation test** | Can successfully generate preview personas |

**Readiness Status:**
- **Ready**: Green checkmark, can be published
- **Not Ready**: Red indicator with blocking reasons
- **Warnings**: Yellow indicator with non-blocking issues

### Mold Actions

**Row Actions (three-dot menu):**

| Action | Description |
|--------|-------------|
| **View/Edit** | Open mold details page |
| **Delete** | Remove the mold |
| **Archive** | Move to archived status |
| **Publish** | Change from Draft to Live |

---

## Real-World Use Cases

### Use Case 1: Building a Research Panel

**Scenario:** Create a reusable panel of qualified research participants.

**Implementation:**

1. **Import Contacts**
   - Prepare a CSV with demographic data
   - Upload via Properties CSV import
   - Verify data quality

2. **Create Qualifying Properties**
   ```
   research_panel: Boolean (true/false)
   panel_tier: Single Select (Gold/Silver/Bronze)
   expertise_areas: Multi-select (Tech/Beauty/Food/Fashion/Automotive)
   last_research_date: Date
   response_quality_score: Number (1-10)
   ```

3. **Build Segments**
   - "Gold Tier Panel" - panel_tier equals Gold
   - "Available for Research" - last_research_date > 30 days ago
   - "Tech Experts" - expertise_areas contains Tech

4. **Target Campaigns**
   - Use segments when launching new campaigns
   - Rotate participants to avoid fatigue

::: tip Panel Quality Management
- Verify contact information periodically
- Track response quality with a rating property
- Remove non-responders after 3 failed attempts
- Refresh demographics annually
- Recognize top participants with tier upgrades
:::

### Use Case 2: Customer Segmentation

**Scenario:** Target different customer segments for product research.

**Implementation:**

1. **Sync Customer Data**
   - Import from CRM via CSV
   - Include customer attributes

2. **Create Segmentation Properties**
   ```
   customer_segment: Single Select (Enterprise/SMB/Consumer)
   annual_spend: Number
   product_lines: Multi-select (list of products)
   account_age_months: Number
   nps_score: Number
   churn_risk: Single Select (Low/Medium/High)
   ```

3. **Build Customer Segments**

   | Segment | Rules |
   |---------|-------|
   | High-Value Customers | annual_spend > $500 |
   | New Customers | account_age_months <= 3 |
   | At-Risk Customers | churn_risk equals High |
   | Brand Advocates | nps_score >= 9 |

4. **Research Targeting**
   - New product feedback → Brand Advocates
   - Churn research → At-Risk Customers
   - Onboarding feedback → New Customers

### Use Case 3: Geographic Targeting

**Scenario:** Regional product launch requiring location-specific feedback.

**Implementation:**

1. **Ensure Location Data**
   - Verify contacts have location properties
   - Create standardized location fields if needed

2. **Create Geographic Properties**
   ```
   country: Single Select
   state_province: Single Select
   city: Text
   region: Single Select (Northeast/Southeast/Midwest/Southwest/West)
   market_tier: Single Select (Tier 1/Tier 2/Tier 3)
   urban_rural: Single Select (Urban/Suburban/Rural)
   ```

3. **Build Regional Segments**

   | Segment | Rules |
   |---------|-------|
   | US Northeast | region equals Northeast |
   | Urban Markets | urban_rural equals Urban |
   | International | country not equals United States |
   | Target Launch Markets | city in [Chicago, LA, NYC, Houston] |

4. **Comparative Research**
   - Run identical campaigns to different regional segments
   - Compare responses across regions
   - Identify regional preferences and concerns

### Use Case 4: AI Population Testing

**Scenario:** Test campaign questions before launching to real participants.

**Implementation:**

1. **Create AI Population**
   - During campaign setup, select AI Population targeting
   - Configure demographic parameters to match your target audience

2. **Run Simulation**
   - Launch campaign to AI population
   - Collect synthetic responses

3. **Analyze Results**
   - Review response quality and variety
   - Check if questions are clear
   - Identify potential issues

4. **Refine and Launch**
   - Adjust questions based on AI feedback
   - Launch to real participants with confidence

::: tip AI Population Benefits
- **No recruitment delays** - Instant responses
- **Cost-effective testing** - No incentive payments for testing
- **Diverse perspectives** - Configure any demographic mix
- **Iterative refinement** - Test multiple question versions quickly
- **Risk reduction** - Catch confusing questions before real launch
:::

### Use Case 5: Engagement Tracking

**Scenario:** Reward active participants and re-engage dormant ones.

**Implementation:**

1. **Create Engagement Properties**
   ```
   campaigns_completed: Number
   total_video_minutes: Number
   average_response_quality: Number (1-10)
   last_engagement_date: Date
   engagement_streak: Number
   total_incentives_earned: Number
   ```

2. **Build Engagement Segments**

   | Segment | Rules | Purpose |
   |---------|-------|---------|
   | Super Responders | campaigns_completed >= 10, average_response_quality >= 8 | VIP treatment |
   | Dormant Users | last_engagement_date > 90 days | Re-engagement |
   | New but Active | account_age < 30 days, campaigns_completed >= 2 | Early nurturing |
   | High Earners | total_incentives_earned > $100 | Recognize loyalty |

3. **Engagement Campaigns**
   - Re-engagement emails to dormant users
   - Special opportunities for super responders
   - Recognition for high earners

---

## Best Practices

### Data Quality

| Practice | Description |
|----------|-------------|
| **Validate on import** | Check data before processing |
| **Deduplicate regularly** | Merge duplicate contacts |
| **Consistent properties** | Use standardized values |
| **Archive vs. delete** | Preserve history when possible |
| **Regular audits** | Quarterly review of contact quality |

### Privacy & Compliance

::: warning Privacy Checklist
Before collecting participant data:
- [ ] Obtain proper consent for data collection
- [ ] Document data usage and retention policies
- [ ] Set clear retention periods
- [ ] Enable data export and deletion capabilities
- [ ] Limit access to necessary personnel only
- [ ] Implement appropriate anonymization
- [ ] Follow GDPR, CCPA, and other relevant regulations
:::

### Organization

| Principle | Implementation |
|-----------|----------------|
| **Clear naming** | Use descriptive names for populations, lists, segments |
| **Document criteria** | Add descriptions explaining segment rules |
| **Regular review** | Archive outdated items quarterly |
| **Standardize values** | Consistent property values across contacts |
| **Hierarchical categories** | Organize properties into logical groups |

### Performance Optimization

| Scenario | Recommendation |
|----------|----------------|
| **Large contact lists** | Use segments instead of exporting/filtering externally |
| **Complex rules** | Break into multiple simpler segments if needed |
| **Frequent targeting** | Pre-build segments for common use cases |
| **Cross-workspace** | Recreate segments in each workspace (not shareable) |

---

## Troubleshooting

### Contacts Not Appearing

**Symptoms:** Invited contacts don't show in the Humans tab.

**Solutions:**

| Check | Resolution |
|-------|------------|
| **Invitation status** | Contact support to verify invitation was sent |
| **Email address** | Confirm correct email was entered |
| **Workspace** | Verify you're viewing the correct workspace |
| **Refresh** | Try refreshing the page (data may need to reload) |
| **Spam folder** | Ask contact to check spam/junk folder |

### Segment Returns Wrong Results

**Symptoms:** Segment includes unexpected contacts or excludes expected ones.

**Solutions:**

| Check | Resolution |
|-------|------------|
| **Review rules** | Check each condition carefully |
| **Verify logic** | Confirm Any vs. All is set correctly |
| **Check property values** | Ensure contacts' properties are set correctly |
| **Test with known contact** | Add a contact you know should/shouldn't match |
| **Case sensitivity** | Some text matches are case-sensitive |

### CSV Import Fails

**Symptoms:** CSV upload errors or missing data.

**Solutions:**

| Issue | Resolution |
|-------|------------|
| **Encoding error** | Save as UTF-8 encoding |
| **Header mismatch** | Match column headers exactly to property names |
| **Special characters** | Remove or escape special characters |
| **Large file** | Split into smaller batches (under 1000 rows) |
| **Date format** | Use YYYY-MM-DD format for dates |

### Property Can't Be Deleted

**Symptoms:** Delete option unavailable or error when deleting.

**Solutions:**

| Check | Resolution |
|-------|------------|
| **In use by segments** | Update or delete dependent segments first |
| **In use by campaigns** | Check campaign targeting rules |
| **Permissions** | Confirm you have delete rights |
| **Admin access** | May require elevated permissions |

### Population Not Loading

**Symptoms:** Population details page shows error or loads indefinitely.

**Solutions:**

| Check | Resolution |
|-------|------------|
| **Population size** | Very large populations may take longer |
| **Browser cache** | Clear cache and refresh |
| **Network** | Check internet connection |
| **Try different view** | Switch between Charts and Table views |

---

## Frequently Asked Questions

::: details Click to Expand FAQs

**Q: How many contacts can I have?**

A: There's no hard limit, but performance is optimized for up to 100,000 contacts. Contact sales for larger needs.

**Q: Can contacts be in multiple segments?**

A: Yes, contacts can match multiple segment rules and appear in many segments simultaneously.

**Q: How often do segments update?**

A: Segments update in real-time as contact properties change.

**Q: Can I import contacts from other systems?**

A: Yes, use CSV import for batch imports. Contact sales about API integrations for ongoing sync.

**Q: What happens when I delete a contact?**

A: The contact and their response history are permanently removed. Consider marking as inactive instead.

**Q: Can contacts update their own information?**

A: Not directly in the platform. Updates must be made by workspace users with edit permissions.

**Q: How do I merge duplicate contacts?**

A: Currently, duplicates must be manually identified and merged. Export, dedupe externally, and re-import.

**Q: Are populations and segments the same?**

A: No. **Populations** are AI-generated personas for simulation. **Segments** are groups of real contacts based on rules.

**Q: Can I share segments across workspaces?**

A: No, segments are workspace-specific. You'll need to recreate them in each workspace.

**Q: How do I track survey response history?**

A: Click any contact to see their profile, which includes campaign participation and individual responses.

**Q: Can AI populations respond to video questions?**

A: Yes, AI personas can generate video-like responses with transcripts, though actual video is synthesized.

**Q: What's the difference between a List and a Segment?**

A: **Lists** are manually managed (you add/remove contacts explicitly). **Segments** are rule-based (contacts automatically included/excluded based on criteria).

**Q: How do I target both AI personas and real contacts in one campaign?**

A: Create separate campaign runs—one for AI populations (testing) and one for real contacts (production).

**Q: Can I export contact data?**

A: Yes, you can export contact lists and properties from the Humans tab using the export function.

**Q: How do I prevent over-surveying participants?**

A: Track participation dates with properties and create segments like "Available for research" (last_research_date > 30 days ago).

:::

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + N` | Create new list/segment |
| `Escape` | Close modals |
| `Enter` | Confirm dialogs |
| `/` | Focus search |

---

## Next Steps

- [Create a campaign targeting specific populations](/guide/campaigns)
- [Use populations with AI agents in chat](/guide/home)
- [Automate audience workflows](/guide/workflows)
- [Upload data to datasets for AI analysis](/guide/datasets)
- [Build AI agents for research](/guide/agents)
