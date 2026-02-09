# Datasets

Datasets are collections of files that provide knowledge and context for AI analysis. Upload documents, videos, and audio to create searchable, analyzable data sources for your agents and conversations.

::: info API Terminology
In the Vurvey codebase, Datasets are called **TrainingSet** in the backend API. When working with GraphQL or reviewing code, remember this mapping: **Dataset (UI) = TrainingSet (API)**.
:::

## Overview

![Datasets Dashboard](/screenshots/datasets/01-datasets-main.png)

The Datasets section provides a grid-based interface to create, organize, and manage your data files with integrated AI processing, labels, and permission controls.

::: tip What Are Datasets?
Datasets are your AI's knowledge base. When you connect a dataset to an agent or conversation, the AI can search, reference, and cite that information. Think of datasets as giving your AI specialized expertise on your products, research, or industry.
:::

## Navigation

Access Datasets from the main sidebar navigation. The section includes:

| Page | Purpose |
|------|---------|
| **Datasets** | Main gallery view of all your datasets |
| **Magic Summaries** | Coming soon - AI-generated knowledge base insights |

## Dataset Gallery

### Grid Layout

Datasets are displayed as cards in a responsive grid showing:

- **Dataset Name** - The dataset title (alias)
- **Description** - Brief description of contents
- **Creator** - "by [Name]" showing who created it
- **File Count** - Total files including documents, images, videos, and audio
- **Add Files Button** - Quick upload access (if you have edit permission)

### Searching and Filtering

Use the controls above the card grid:

- **Search** - Find datasets by name (filters as you type)
- **Sort By** - Order by creation date, name, or other criteria

::: tip Pro Tip: Dataset Organization
Create focused datasets rather than one large "everything" dataset:
- "Q4-2024-Survey-Results" instead of "All Surveys"
- "Competitor-Analysis-Beauty" instead of "Competitive Intel"
- "Product-A-Launch-Research" instead of "Research"
:::

## Creating Datasets

Click **Create Dataset** to open the creation modal.

### Create Dataset Modal

<img
  src="/screenshots/datasets/02-create-modal.png?optional=1"
  alt="Create Dataset Modal"
  onerror="this.remove()"
/>

| Field | Description | Limit |
|-------|-------------|-------|
| **Name** | Dataset identifier (spaces auto-convert to dashes) | 35 characters |
| **Description** | Brief description of the dataset's purpose | 255 characters |

::: warning Naming Convention
Spaces in dataset names are automatically replaced with dashes (-) due to system requirements. For example, "My Research Dataset" becomes "My-Research-Dataset".
:::

### Modal Content

The create modal displays:

- **Title**: "Create new dataset"
- **Description**: "A dataset groups data for AI analysis, enhancing targeted insights and content generation based on your specific needs."
- **Form Fields**: Name input and Description textarea
- **Create Button**: Submits the form (disabled if name is empty)

### After Creation

Once created:
- You're automatically navigated to the dataset detail page
- The dataset appears in your gallery
- You can immediately start uploading files

## Dataset Card Actions

Click the three-dot menu on any dataset card to access:

| Action | Icon | Description |
|--------|------|-------------|
| **Start Conversation** | Spark/AI stars | Open AI chat using this dataset as context (requires files) |
| **Share** | Share icon | Manage who can access this dataset |
| **Edit** | Pencil icon | Modify dataset name and description |
| **Delete** | Trash icon | Permanently remove (only when empty) |

::: warning Permissions
Available actions depend on your permission level. Some options may not appear if you lack the required access. Delete is only available when a dataset has no files.
:::

### File Count Display

The card footer shows total file count calculated as:

```
Total Files = Documents + Videos + Audio Files
```

This combined count represents all content that the AI can analyze.

## Dataset Detail Page

Click any dataset card to view its detail page.

### Page Header

The header displays:

- **Back Arrow** - Return to datasets list (←)
- **Dataset Name** - Full title
- **Description** - Dataset description

### Stats Panel

When files are present, a stats grid shows processing progress:

| Metric | Description |
|--------|-------------|
| **Total Files** | All files, images, videos, and audio in dataset |
| **Processed** | Successfully processed files ready for AI use |
| **Processing** | Files currently being analyzed by AI |
| **Failed** | Files that failed processing (with retry option) |
| **Uploaded** | Files waiting to be processed |

::: tip Pro Tip: Monitor Processing
Check the stats panel after uploading:
- **All Processed** means files are ready for AI use
- **Processing** means wait for completion (status updates every 30 seconds)
- **Failed** files need attention - click the retry button to reprocess
:::

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
| **Documents** | PDF, DOC, DOCX, TXT, JSON |
| **Spreadsheets** | XLS, XLSX, CSV |
| **Presentations** | PPTX |
| **Video** | MP4, AVI, MOV, and other video/* types |
| **Audio** | MP3, WAV, OGG, AAC, M4A, WEBM, FLAC (if enabled for your workspace) |
| **Text** | All text/* MIME types |

::: tip Pro Tip: File Format Selection
- **PDFs** work best for formatted documents with layouts
- **TXT/MD** for plain text or markdown content
- **CSV/JSON** for structured data that AI can analyze row-by-row
- **Videos** are transcribed and analyzed for spoken content
- **Audio** is transcribed for searchability
:::

### Upload Process

1. Select files via local picker or Google Drive
2. Files are uploaded in batches of 20
3. Progress toast shows upload status per batch
4. Files enter processing queue
5. Status updates automatically (polling every 30 seconds)
6. Toast notification when processing completes

::: tip Pro Tip: Batch Uploads
For large uploads:
- Upload in chunks of 15-20 files
- Wait for processing to complete before uploading more
- This prevents queue congestion and ensures reliable processing
:::

### Google Drive Integration

When selecting "Add via Google Drive":

1. **Authenticate** - OAuth2 flow connects your Google account
2. **Browse** - Google Drive picker opens
3. **Select** - Choose multiple files with checkboxes
4. **Validate** - File types are verified before import
5. **Upload** - Files transferred to your dataset

::: info Google Drive Requirements
- Requires Google account authentication
- Multi-select is supported
- Files are copied to Vurvey (not linked)
- Large files may take time to transfer
:::

## File Processing Status

Each file displays a status badge indicating its processing state:

| Status | Badge | Description |
|--------|-------|-------------|
| **Uploaded** | Uploaded | File received, waiting for processing |
| **Processing** | Processing | AI is analyzing the file |
| **Success** | Success | File ready for use in conversations |
| **Failed** | Failed | Processing error occurred (with retry button) |

### Processing Lifecycle

```
Upload → Uploaded → Processing → Success
                        ↓
                     Failed → [Retry] → Processing
```

### Retry Failed Files

When a file shows "Failed" status:

1. Locate the file in the table
2. Find the retry icon (reload arrow) next to the Failed badge
3. Click to retry - file re-enters processing queue
4. Status updates automatically when processing completes

::: tip Processing Time
Processing time varies by file type and size:
- **Documents**: 1-5 minutes
- **Audio**: 2-15 minutes depending on length
- **Videos**: 5-30 minutes depending on length

The system polls every 30 seconds for status updates. A success toast appears when all files are ready.
:::

### Polling Behavior

The dataset page automatically polls for status updates:

- **Interval**: Every 30 seconds
- **Condition**: Active while any files are processing
- **Stop**: Automatically stops when all files succeed
- **Notification**: Toast message when processing completes

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
| **Options** | Row action menu (⋯) |

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

::: warning Conversation Requirements
The "Conversation" option is disabled for files that haven't finished processing. A tooltip explains: "You can only start conversations once the file has been processed by the AI and has the status 'success'."
:::

## Labels

Labels help organize files within datasets using key-value pairs.

### Label Format

Labels follow a `key: value` format:

```
category: furniture
brand: acme
region: north-america
quarter: Q4-2024
type: interview
status: reviewed
```

### Managing Labels

1. Click **Edit Labels** on a file or use bulk **Add Label**
2. Enter key-value pairs (one per row)
3. Add multiple labels as needed
4. Save to apply

### Label Display

- Files show up to 2 labels by default
- Additional labels shown as "+N more"
- Click to view all labels
- Format displayed: `[key: value] [key: value] [+2 more]`

::: warning Bulk Label Warning
When applying labels to multiple files that already have labels, you'll see a confirmation dialog asking whether to replace existing labels. This prevents accidental data loss.
:::

::: tip Pro Tip: Strategic Labeling
Labels improve AI retrieval accuracy:
- **product: widget-pro** - Filter by product line
- **quarter: Q4-2024** - Time-based organization
- **type: interview** - Content type classification
- **status: reviewed** - Track review workflow
- **source: website** - Track content origins
:::

## Permissions

Datasets use role-based permissions to control access:

| Permission | Allows |
|------------|--------|
| **Edit** | Upload files, edit labels, modify dataset |
| **Delete** | Remove files and dataset |
| **Manage** | Share dataset and modify permissions |

### Permission Model

Vurvey uses OpenFGA for fine-grained access control. When the permission system is enabled:

- Actions check user permissions before execution
- Dropdown items are conditionally shown based on access
- Buttons are disabled for unauthorized actions
- Clear error messages for permission denied situations

### Sharing Datasets

1. Click **Share** on dataset card or detail page
2. Configure access settings:
   - Workspace-wide access (all members)
   - Individual user invitations
3. Assign permission levels per user
4. Save changes

### Share Modal Sections

| Section | Purpose |
|---------|---------|
| **General Access** | Set workspace-wide visibility |
| **Invite** | Add specific users by email |
| **Members** | Manage individual permissions |

## Magic Summaries

![Magic Summaries](/screenshots/datasets/03-magic-summaries.png)

::: info Coming Soon
Magic Summaries will transform your datasets into connected knowledge bases with AI-generated insights. This feature is currently in development.
:::

The Magic Summaries tab displays:
- Coming soon message
- Description: "Turn your datasets into a connected knowledge base of new insights and ideas."

## Real-World Use Cases

### Use Case 1: Research Knowledge Base

**Scenario:** Your team conducts ongoing consumer research and needs quick access to insights.

**Approach:**
1. Create datasets by project or quarter (e.g., "Q4-2024-Product-Research")
2. Upload survey exports, interview transcripts, and reports
3. Label files by topic, segment, and date
4. Connect to an analysis-focused agent for queries (for example: an Assistant configured as a "Market Analyst")

**Sample Queries:**
- "What are the top concerns about product pricing from Q4 research?"
- "Find all mentions of competitor X across our studies"
- "Summarize the key differences between Gen Z and Millennial respondents"

**Labeling Strategy:**
```
type: survey-results
segment: gen-z
quarter: Q4-2024
product: widget-pro
```

::: tip Pro Tip: Research Archives
- Use consistent naming: "2024-Q4-Product-Research"
- Label with methodology: "type: interview" vs "type: survey"
- Include both raw data and summary reports
- Archive completed research quarterly
:::

### Use Case 2: Competitive Intelligence Hub

**Scenario:** You want AI to analyze competitive materials and track market positioning.

**Approach:**
1. Create per-competitor datasets (e.g., "Competitor-A-Intel")
2. Upload competitor websites, ads, press releases, product specs
3. Label by source and date for freshness tracking
4. Query across competitors for comparisons

**Sample Queries:**
- "How does competitor A position their sustainability story?"
- "What pricing strategies are mentioned across all competitors?"
- "Find any recent product launches in the last 6 months"

**Labeling Strategy:**
```
competitor: acme-corp
source: press-release
date: 2024-12
topic: sustainability
```

::: tip Pro Tip: Competitive Tracking
- Update datasets monthly with fresh content
- Label sources: "source: website", "source: press-release", "source: social"
- Create a "synthesis" agent to compare across competitors
- Track pricing changes with date labels
:::

### Use Case 3: Product Documentation

**Scenario:** Your team needs instant access to product specs and documentation.

**Approach:**
1. Create datasets per product line (e.g., "Widget-Pro-Docs")
2. Upload specs, manuals, FAQs, and training materials
3. Label by version and document type
4. Connect to a Product agent (or an Assistant configured as a product expert) for support queries

**Sample Queries:**
- "What are the compatibility requirements for Product X?"
- "Explain the difference between Model A and Model B"
- "Find all known issues and workarounds for version 2.0"

**Labeling Strategy:**
```
product: widget-pro
version: 2.0
type: manual
audience: customer
```

::: tip Pro Tip: Documentation Datasets
- Include version numbers in labels for filtering
- Update when products change
- Add troubleshooting guides for common issues
- Separate customer-facing vs internal docs
:::

### Use Case 4: Meeting & Interview Archive

**Scenario:** You want AI to recall conversations from meetings and interviews.

**Approach:**
1. Upload meeting recordings (video/audio)
2. AI transcribes and indexes content automatically
3. Label by date, attendees, and topics
4. Search across all conversations

**Sample Queries:**
- "What did the client say about timeline in our last meeting?"
- "Find all action items from the Q4 planning sessions"
- "What concerns were raised about the new feature?"

**Labeling Strategy:**
```
meeting: client-review
date: 2024-12-15
attendees: product-team
topic: roadmap
```

### Use Case 5: Multi-Source Market Analysis

**Scenario:** Combine multiple data sources for comprehensive market understanding.

**Approach:**
1. Create a "Market-Analysis-2024" dataset
2. Upload industry reports, survey data, social listening exports
3. Cross-reference with internal sales data
4. Query for market trends and opportunities

**Sample Queries:**
- "What are the emerging trends in our industry?"
- "How do our sales patterns correlate with market sentiment?"
- "What gaps exist between customer expectations and our offerings?"

**Labeling Strategy:**
```
source: industry-report
publisher: gartner
year: 2024
relevance: high
```

## Best Practices

### Organizing Datasets

- Use clear, descriptive names that indicate purpose
- Write helpful descriptions for team members
- Group related files in the same dataset
- Use labels consistently across files
- Aim for 50-200 files per dataset for optimal performance

### File Quality

- Ensure documents are text-searchable (OCR for scanned PDFs)
- Use clear audio without excessive background noise
- Verify video files are playable before upload
- Check file sizes against workspace limits
- Remove duplicate or outdated files

### Label Strategy

- Define standard label keys for your team (e.g., "category", "region", "product")
- Use consistent values (avoid "US" and "United States" for same meaning)
- Label files immediately after upload
- Review and clean up labels periodically
- Document your labeling conventions

### Processing Optimization

- Upload files during off-peak hours for faster processing
- Start with smaller test uploads to verify format compatibility
- Monitor the stats panel for processing bottlenecks
- Retry failed files promptly
- Split very large files if processing fails

### Advanced Dataset Techniques

::: details Click to Expand Advanced Techniques

**Dataset Composition:**
- Small, focused datasets (50-200 files) work better than huge ones
- Create "rollup" datasets that reference key files from others
- Use labels to create virtual sub-collections within a dataset

**Multi-Dataset Strategies:**
- Connect multiple datasets to one agent for breadth
- Use separate datasets for different time periods
- Create "primary" and "reference" datasets
- Consider dataset overlap for comprehensive coverage

**Maintenance Routines:**
- Quarterly review of dataset relevance
- Remove outdated files that might confuse AI
- Update labels as taxonomy evolves
- Archive completed projects to separate datasets
- Document dataset refresh schedules
:::

## Data Security

::: warning Privacy
Ensure uploaded data complies with your organization's data policies and relevant regulations (GDPR, CCPA, etc.).
:::

- All data encrypted at rest and in transit
- Secure transfer protocols for uploads
- Access logging for audit trails
- Workspace isolation between organizations
- Permission-based access control

## Troubleshooting

### Upload Failed

1. Verify file format is supported (check supported types table)
2. Check file size limits:
   - Images: 10MB
   - Text files (TXT, JSON): 10MB
   - Audio: 25MB
   - Spreadsheets (XLS, XLSX, CSV): 25MB
   - Documents (PDF, DOC, DOCX): 50MB
   - Presentations (PPTX): 50MB
   - Videos: 100MB
3. Try re-uploading the file
4. Split large files if needed
5. Check network connection stability

### Processing Stuck

1. Check the status badge for specific state
2. Wait for automatic polling (updates every 30 seconds)
3. Refresh the page manually
4. If stuck for more than 30 minutes, try retry button
5. Contact support if stuck for extended period

### Cannot Start Conversation

1. Verify all files show "Success" status
2. Check that dataset has at least one file
3. Retry any failed files first
4. Wait for all processing to complete
5. Refresh the page and try again

### AI Not Finding Content

**Symptoms:** AI says it can't find information you know is in the dataset.

**Solutions:**
1. **Check file status** - Must be "Success" (not Processing or Failed)
2. **Verify dataset selection** - Correct dataset connected to conversation?
3. **Review file content** - Is the text searchable (not just images)?
4. **Rephrase query** - Use terms that appear in the files
5. **Check labels** - Labels help AI narrow search scope
6. **Try specific quotes** - Use exact phrases from documents

### Files Processing Slowly

**Symptoms:** Files stuck in "Processing" for extended time.

**Solutions:**
1. **Video files take longer** - Up to 30 minutes for long videos
2. **Large batches queue** - Files processed in order
3. **Peak hours** - Try uploads during off-peak times
4. **Refresh page** - Status may have updated already
5. **Check file size** - Very large files take longer

### Labels Not Saving

**Symptoms:** Labels disappear or don't apply correctly.

**Solutions:**
1. **Wait for save confirmation** - Don't close modal immediately
2. **Check permissions** - Need Edit permission for labels
3. **Verify format** - Use `key: value` format
4. **Refresh page** - Labels may have saved but not displayed
5. **Try single file** - Bulk label operations may timeout

### Getting Help

If issues persist:
1. **Note the file name** and dataset ID from the URL
2. **Check file format** against supported types
3. **Try re-uploading** in a different format (e.g., PDF instead of DOC)
4. **Export error details** from browser console
5. **Contact support** with specific error messages via the Help menu

## Frequently Asked Questions

::: details FAQs (Click to Expand)

**Q: How many files can a dataset contain?**
A: There's no hard limit, but performance is best with 50-500 files. For larger collections, consider multiple focused datasets.

**Q: Can I move files between datasets?**
A: Not directly. Download and re-upload, or create a new dataset with the desired organization.

**Q: What happens if I delete a file?**
A: The file is permanently removed. Conversations that referenced it will lose access to that content.

**Q: How long does processing take?**
A: Documents: 1-5 minutes. Videos: 5-30 minutes depending on length. Audio: 2-15 minutes.

**Q: Can the AI understand images in PDFs?**
A: Yes, PDFs with embedded images are analyzed. Pure image files are also processed for visual content.

**Q: Are my files shared with other workspaces?**
A: No, datasets are isolated to your workspace. Only explicitly shared users can access.

**Q: Can I update a file without re-uploading?**
A: No, delete the old version and upload the updated file. Consider versioning in filenames.

**Q: Why can't I delete a dataset?**
A: Datasets must be empty before deletion. Remove all files first.

**Q: How does the AI search my files?**
A: AI uses semantic search to find relevant content, not just keyword matching. It understands meaning and context.

**Q: Can I see what the AI extracted from my files?**
A: Not directly in the UI, but you can ask the AI to summarize what it knows from a specific file.

**Q: What's the difference between Labels and search?**
A: Labels are structured metadata you assign. Search finds content within files. Use both for best results.

**Q: Can I export my dataset?**
A: Not currently. Files must be downloaded individually or re-exported from original sources.

**Q: How often should I update datasets?**
A: Depends on content type. Competitive intel: monthly. Product docs: with each release. Research: per project.

**Q: Can multiple people upload to the same dataset?**
A: Yes, if they have Edit permission. Uploads from all users appear in the same file list.
:::

## Test IDs Reference

For automation and testing purposes, these test IDs are available:

| Element | Test ID |
|---------|---------|
| Create Dataset Button | `create-dataset-button` |
| Dataset Search Input | `datasets-search-input` |
| Dataset Card | `dataset-card` |
| Card Menu Trigger | `dataset-card-menu` |
| Delete Option | `delete-dataset-option` |
| Add Files Button | `add-files-button` |
| Upload Option | `upload-files-option` |
| Back to Datasets | `back-to-datasets` |
| Delete Selected Files | `delete-selected-files-button` |
| Create Submit Button | `create-dataset-submit-button` |
| Dataset Name Input | `dataset-name-input` |
| Dataset Description | `dataset-description-input` |
| File Status Success | `file-status-success` |
| File Status Uploaded | `file-status-uploaded` |
| File Status Processing | `file-status-processing` |
| Magic Summaries | `magic-summaries-empty-state` |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + N` | Create new dataset |
| `Cmd/Ctrl + U` | Open upload dialog (on detail page) |
| `Escape` | Close modals |
| `Enter` | Confirm dialogs |

## Next Steps

- [Use datasets with AI agents](/guide/agents) for context-aware conversations
- [Reference datasets in chat](/guide/home) using My Data mode
- [Connect datasets to campaigns](/guide/campaigns) for research analysis
- [Automate dataset workflows](/guide/workflows) for data processing
