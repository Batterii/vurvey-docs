# Datasets

The Datasets section organizes files and data used by agents and campaigns for AI-powered analysis.

## Dataset Gallery

![Datasets Gallery](/screenshots/datasets/01-datasets-main.png)

View all your datasets in a card-based layout showing:
- Dataset name
- Description
- Creator name
- File count
- Quick action buttons

## Navigation Tabs

| Tab | Purpose |
|-----|---------|
| **All Datasets** | View all uploaded datasets |
| **Magic Summaries** | AI-generated summaries of your data |

## Search and Sort

- **Search datasets** - Find by name or description
- **Most Recently Updated** - Sort order options

## Dataset Cards

Each card displays:
- **Name** - Dataset identifier
- **Description** - What the dataset contains
- **Creator** - Who uploaded it
- **Files** - Number of files included
- **+ Add files** - Quick upload action

## Creating Datasets

Click **+ Create Dataset** to start:

### Step 1: Basic Info
```
Name: Customer Feedback Q4 2024
Description: Video responses and transcripts from Q4 customer survey
```

### Step 2: Upload Files
- Drag and drop files
- Browse from computer
- Import from cloud storage

### Supported Formats

| Category | Formats |
|----------|---------|
| **Documents** | PDF, DOCX, TXT, MD |
| **Spreadsheets** | XLSX, CSV, XLS |
| **Media** | MP4, MP3, WAV, MOV |
| **Images** | PNG, JPG, GIF |
| **Data** | JSON, XML |

### Step 3: Apply Labels
- Add organization tags
- Categorize by project
- Enable easy filtering

## Managing Labels

Click **Manage labels** to:
- Create custom tags
- Edit existing labels
- Delete unused labels
- Set label colors

### Label Best Practices
- Use consistent naming
- Create a taxonomy
- Limit total labels
- Document conventions

## Adding Files

Each dataset card has **+ Add files** for ongoing uploads:

1. Click the button
2. Select files or drag/drop
3. Wait for processing
4. Files automatically added

::: tip Batch Uploads
For large uploads, use the bulk import feature to add many files at once with progress tracking.
:::

## Magic Summaries

![Magic Summaries](/screenshots/datasets/03-magic-summaries.png)

AI-generated summaries provide quick insights from your data.

### Features
- Automatic key point extraction
- Theme identification
- Entity recognition
- Sentiment analysis

### Generating Summaries
1. Select a dataset
2. Click "Generate Summary"
3. Wait for AI processing
4. Review and refine

## Dataset Details

Click any dataset card to view:

### Overview Tab
- Full description
- Creation date
- Last modified
- Total file size

### Files Tab
- Complete file list
- File previews
- Individual file actions
- Upload more files

### Usage Tab
- Which agents reference this data
- Campaign connections
- Workflow inclusions
- Access history

### Settings Tab
- Edit name/description
- Manage permissions
- Configure processing
- Delete dataset

## Connecting Datasets

### To Agents
1. Open agent configuration
2. Go to Knowledge section
3. Select datasets to include
4. Save agent

### To Chat
1. Click Sources in chat
2. Select datasets
3. Start conversation
4. AI references selected data

### To Workflows
1. Add dataset step
2. Select target dataset
3. Configure processing
4. Connect to next step

## File Processing

When you upload files, Vurvey:
1. **Validates** - Checks format and size
2. **Processes** - Extracts text and metadata
3. **Indexes** - Makes searchable
4. **Embeds** - Creates AI-readable vectors

### Processing Status

| Status | Meaning |
|--------|---------|
| **Pending** | Queued for processing |
| **Processing** | Currently being analyzed |
| **Ready** | Available for use |
| **Error** | Processing failed |

## Best Practices

### Organization
- Use descriptive names
- Write clear descriptions
- Apply consistent labels
- Group related files

### Quality
- Use clean, formatted files
- Ensure text is extractable (not images of text)
- Remove duplicates
- Update outdated content

### Performance
- Avoid excessively large files
- Split large datasets
- Archive unused data
- Monitor processing times

## Data Security

::: warning Privacy
Ensure uploaded data complies with your organization's data policies and relevant regulations (GDPR, CCPA, etc.).
:::

- All data encrypted at rest
- Secure transfer protocols
- Access logging
- Workspace isolation

## Next Steps

- [Use datasets in chat](/guide/home)
- [Connect datasets to agents](/guide/agents)
- [Include datasets in campaigns](/guide/campaigns)
