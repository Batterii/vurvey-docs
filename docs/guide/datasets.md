# Datasets

Datasets are collections of files that provide knowledge and context for AI analysis. Upload documents, videos, and audio to create searchable, analyzable data sources for your agents and conversations.

## Overview

![Datasets Dashboard](/screenshots/datasets/01-datasets-main.png)

The Datasets section provides a grid-based interface to create, organize, and manage your data files with integrated AI processing, labels, and permission controls.

## Dataset Gallery

### Grid Layout

Datasets are displayed as cards in a responsive grid showing:

- **Dataset Name** - The dataset title (alias)
- **Description** - Brief description of contents
- **Creator** - "by [Name]" showing who created it
- **File Count** - Total files (includes images, documents, videos, and audio)
- **Add Files Button** - Quick upload access (if you have edit permission)

### Searching and Filtering

Use the controls above the card grid:

- **Search** - Find datasets by name
- **Sort By** - Order by creation date, name, or other criteria

### Creating Datasets

Click **Create Dataset** to open the creation modal.

#### Dataset Form Fields

| Field | Description | Limit |
|-------|-------------|-------|
| **Name** | Dataset identifier (spaces auto-convert to dashes) | 35 characters |
| **Description** | Brief description of the dataset's purpose | 255 characters |

::: tip Naming Convention
Spaces in dataset names are automatically replaced with dashes (-) due to system requirements. For example, "My Dataset" becomes "My-Dataset".
:::

## Dataset Card Actions

Click the three-dot menu on any dataset card to access:

| Action | Description |
|--------|-------------|
| **Start Conversation** | Open AI chat using this dataset as context (requires files) |
| **Share** | Manage who can access this dataset |
| **Edit** | Modify dataset name and description |
| **Delete** | Permanently remove (only when empty) |

::: warning Permissions
Available actions depend on your permission level. Some options may not appear if you lack the required access. Delete is only available when a dataset has no files.
:::

## Dataset Detail Page

Click any dataset card to view its detail page.

### Page Header

The header displays:

- **Back Arrow** - Return to datasets list
- **Dataset Name** - Full title
- **Description** - Dataset description

### Stats Panel

When files are present, a stats grid shows:

| Metric | Description |
|--------|-------------|
| **Total Files** | All files, images, videos, and audio in dataset |
| **Processed** | Successfully processed files |
| **Processing** | Files currently being analyzed |
| **Failed** | Files that failed processing |
| **Uploaded** | Files waiting to be processed |

### Action Buttons

| Button | Description |
|--------|-------------|
| **Add Files** | Upload new files (local or Google Drive) |
| **Share** | Open permissions modal |
| **Start Conversation** | Begin AI chat with dataset context |

::: warning Processing Required
The "Start Conversation" button is disabled until all files have been successfully processed. A tooltip explains: "All files and videos must have been processed before starting conversation."
:::

## File Upload

### Upload Options

Click **Add Files** to reveal the upload dropdown:

| Option | Description |
|--------|-------------|
| **Upload** | Select files from your computer |
| **Add via Google Drive** | Import files from Google Drive |

### Supported File Types

| Category | Formats |
|----------|---------|
| **Images** | JPG, JPEG, PNG, GIF, WEBP |
| **Documents** | PDF, DOC, DOCX, TXT, CSV, JSON |
| **Presentations** | PPTX, XLSX |
| **Video** | MP4, AVI, MOV |
| **Audio** | MP3, WAV, OGG, AAC, M4A, WEBM, FLAC (if enabled for your workspace) |
| **Text** | All text/* MIME types |

### Upload Process

1. Select files via local picker or Google Drive
2. Files are uploaded in batches of 20
3. Progress toast shows upload status
4. Files enter processing queue
5. Status updates automatically (polling every 30 seconds)
6. Toast notification when processing completes

### Google Drive Integration

When selecting "Add via Google Drive":

1. Authenticate with Google (OAuth2)
2. Browse and select files
3. Multi-select supported
4. Files validated before import

## File Processing Status

Each file displays a status badge indicating its processing state:

| Status | Badge | Description |
|--------|-------|-------------|
| **Uploaded** | Uploaded | File received, waiting for processing |
| **Processing** | Processing | AI is analyzing the file |
| **Success** | Success | File ready for use in conversations |
| **Failed** | Failed | Processing error occurred |

### Retry Failed Files

When a file shows "Failed" status:

1. Hover over the status badge
2. Click the retry icon
3. File re-enters processing queue

::: tip Processing Time
Processing time varies by file type and size. Video files typically take longer than documents. The system polls every 30 seconds for status updates.
:::

## File Management

### File Table

The detail page shows all files in a sortable table with columns:

| Column | Description |
|--------|-------------|
| **Checkbox** | Select for bulk actions |
| **Name** | Original filename |
| **Size** | File size |
| **Status** | Processing status badge |
| **Labels** | Assigned labels (key: value format) |
| **Options** | Row action menu |

### Search and Filter

- **Search** - Find files by name
- **Media Criteria** - Filter by labels and tags

### Bulk Actions

When files are selected, bulk action buttons appear:

| Action | Description |
|--------|-------------|
| **Add Label** | Apply labels to selected files |
| **Delete** | Remove selected files |

### Row Actions

Click the three-dot menu on any file row:

| Action | Description |
|--------|-------------|
| **Conversation** | Start chat with this file as context (requires Success status) |
| **Edit Labels** | Add or modify file labels |
| **Delete** | Remove this file |

## Labels

Labels help organize files within datasets using key-value pairs.

### Label Format

Labels follow a `key: value` format:

```
category: furniture
brand: acme
region: north-america
```

### Managing Labels

1. Click **Edit Labels** on a file or use bulk **Add Label**
2. Enter key-value pairs
3. Add multiple labels as needed
4. Save to apply

### Label Display

- Files show up to 2 labels by default
- Additional labels shown as "+N more"
- Click to view all labels

::: warning Bulk Label Warning
When applying labels to multiple files that already have labels, you'll see a confirmation dialog asking whether to replace existing labels.
:::

## Permissions

Datasets use role-based permissions to control access:

| Permission | Allows |
|------------|--------|
| **Edit** | Upload files, edit labels, modify dataset |
| **Delete** | Remove files and dataset |
| **Manage** | Share dataset and modify permissions |

### Sharing Datasets

1. Click **Share** on dataset card or detail page
2. Configure access settings:
   - Workspace-wide access
   - Individual user invitations
3. Assign permission levels
4. Save changes

## Magic Summaries

![Magic Summaries](/screenshots/datasets/03-magic-summaries.png)

::: info Coming Soon
Magic Summaries will transform your datasets into connected knowledge bases with AI-generated insights. This feature is currently in development.
:::

The Magic Summaries tab displays:
- Coming soon message
- Description: "Turn your datasets into a connected knowledge base of new insights and ideas."

## Best Practices

### Organizing Datasets

- Use clear, descriptive names that indicate purpose
- Write helpful descriptions for team members
- Group related files in the same dataset
- Use labels consistently across files

### File Quality

- Ensure documents are text-searchable (OCR for scanned PDFs)
- Use clear audio without excessive background noise
- Verify video files are playable before upload
- Check file sizes against workspace limits

### Label Strategy

- Define standard label keys for your team (e.g., "category", "region", "product")
- Use consistent values (avoid "US" and "United States" for same meaning)
- Label files immediately after upload
- Review and clean up labels periodically

### Processing Optimization

- Upload files during off-peak hours for faster processing
- Start with smaller test uploads to verify format compatibility
- Monitor the stats panel for processing bottlenecks
- Retry failed files promptly

## Data Security

::: warning Privacy
Ensure uploaded data complies with your organization's data policies and relevant regulations (GDPR, CCPA, etc.).
:::

- All data encrypted at rest
- Secure transfer protocols
- Access logging
- Workspace isolation

## Troubleshooting

### Upload Failed

1. Verify file format is supported
2. Check file size limits
3. Try re-uploading the file
4. Split large files if needed

### Processing Stuck

1. Check the status badge for specific state
2. Wait for automatic polling (30 seconds)
3. Refresh the page
4. Contact support if stuck for extended period

### Cannot Start Conversation

1. Verify all files show "Success" status
2. Check that dataset has at least one file
3. Retry any failed files
4. Wait for processing to complete

## Next Steps

- [Use datasets with AI agents](/guide/agents) for context-aware conversations
- [Reference datasets in chat](/guide/home) using My Data mode
- [Connect datasets to campaigns](/guide/campaigns) for research analysis
- [Automate dataset workflows](/guide/workflows) for data processing
