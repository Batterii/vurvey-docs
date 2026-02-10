# Datasets

Datasets are your AI's knowledge base. Upload research reports, survey exports, competitive analysis documents, and other files so your AI agents can search, reference, and cite that information during conversations and workflows.

## Overview

![Datasets Dashboard](/screenshots/datasets/01-datasets-main.png)

The Datasets page displays all your datasets in a card-based gallery. Each card shows the dataset name, a brief description, the creator, and the total number of files inside.

::: tip Why Use Datasets?
Think of datasets as giving your AI agents specialized expertise. When you connect a dataset to an agent or conversation, the AI can draw on everything you've uploaded — product specs, brand tracking reports, interview transcripts, competitive intelligence — to give you more informed, accurate answers.
:::

## Navigation

Access **Datasets** from the main sidebar. The section includes two tabs:

| Tab | Description |
|-----|-------------|
| **Datasets** | Gallery view of all your datasets |
| **Magic Summaries** | AI-generated insights from your datasets (coming soon) |

## Browsing Your Datasets

![Datasets Dashboard](/screenshots/datasets/01-datasets-main.png)

Datasets appear as cards in a responsive grid. Each card shows:

- **Name** — the dataset title
- **Description** — a summary of what the dataset contains
- **Creator** — who created it ("by Jane Smith")
- **File count** — total documents, images, videos, and audio files
- **Add Files** button for quick uploads (if you have edit access)

Use the **Search** bar above the grid to find datasets by name, and the **Sort By** dropdown to change the display order.

::: tip Organize for Easy Discovery
Create focused datasets rather than one catch-all collection:
- "Q4-2024-Brand-Tracking" instead of "All Research"
- "Competitor-Analysis-Beauty" instead of "Competitive Intel"
- "Product-A-Launch-Study" instead of "Studies"
:::

## Creating a Dataset

Click **Create Dataset** to open the creation dialog.

<img
  :src="'/screenshots/datasets/02-create-modal.png'"
  alt="Create Dataset dialog"
  @error="$event.target.remove()"
/>

Fill in two fields:

| Field | Description | Limit |
|-------|-------------|-------|
| **Name** | A short identifier for the dataset. Spaces are automatically replaced with dashes. | 35 characters |
| **Description** | A brief note about the dataset's purpose or contents. | 255 characters |

Click **Create** to finish. You'll be taken straight to the new dataset's detail page where you can start uploading files.

## Dataset Card Actions

Hover over any dataset card and click the **three-dot menu** (⋯) for quick actions:

| Action | What It Does |
|--------|-------------|
| **Start Conversation** | Open a chat using this dataset as context (requires at least one processed file) |
| **Share** | Control who can access this dataset |
| **Edit** | Change the dataset name or description |
| **Delete** | Remove the dataset (only available when the dataset is empty) |

::: warning Permissions
The actions you see depend on your access level. Some options may not appear if you don't have the required permission.
:::

## Working Inside a Dataset

Click any dataset card to open its detail page.

### Header

The detail page header shows the dataset **name** and **description**, along with a back arrow to return to the gallery.

### Stats Panel

When files are present, a stats panel summarizes the current state of your uploads:

| Metric | What It Means |
|--------|---------------|
| **Total Files** | Everything in the dataset — documents, images, videos, audio |
| **Processed** | Files the AI has finished analyzing and can now reference |
| **Processing** | Files currently being analyzed (status refreshes automatically) |
| **Failed** | Files that encountered an error — click the retry icon to reprocess |
| **Uploaded** | Files waiting in the queue to be processed |

::: tip Keep an Eye on Processing
After uploading, check the stats panel:
- **All Processed** — your files are ready for AI use.
- **Processing** — the system is still working; status updates every 30 seconds.
- **Failed** — click retry next to the file to reprocess it.
:::

### Action Buttons

| Button | Description |
|--------|-------------|
| **Add Files** | Upload new files from your computer or Google Drive |
| **Share** | Manage who can view or edit this dataset |
| **Start Conversation** | Begin an AI chat that can reference everything in this dataset |

::: warning Processing Must Complete First
The **Start Conversation** button stays disabled until all files have been processed successfully. A tooltip will explain what's still pending.
:::

## Uploading Files

Click **Add Files** to see your upload options:

| Option | Description |
|--------|-------------|
| **Upload** | Select files from your computer |
| **Add via Google Drive** | Import files directly from Google Drive |

### Supported File Types

| Category | Accepted Formats |
|----------|-----------------|
| **Documents** | PDF, DOCX, TXT, MD, JSON |
| **Spreadsheets** | CSV, XLSX |
| **Presentations** | PPTX |
| **Images** | PNG, JPG, GIF, WEBP |
| **Video** | MP4, MOV |
| **Audio** | MP3, WAV (when enabled for your workspace) |

::: tip Choosing the Right Format
- **PDFs** are ideal for formatted reports and presentations.
- **CSV or JSON** work well for structured data the AI can analyze row by row.
- **Videos and audio** are automatically transcribed so the AI can search spoken content.
:::

### How Uploading Works

1. Select your files using the file picker or Google Drive browser.
2. Files upload in batches of up to 20 at a time.
3. A progress notification keeps you informed.
4. Once uploaded, files enter the processing queue.
5. Status updates automatically every 30 seconds.
6. You'll see a notification when processing is complete.

::: tip Large Uploads
For best results with many files, upload in batches of 15–20 and wait for processing to finish before uploading more.
:::

### Google Drive Import

When you choose **Add via Google Drive**:

1. Authenticate with your Google account (one-time setup).
2. Browse and select the files you want.
3. Files are copied into Vurvey — they aren't linked, so future changes in Drive won't sync automatically.

## File Processing

After upload, each file goes through AI processing. You'll see a status badge next to every file:

| Status | Meaning |
|--------|---------|
| **Uploaded** | Received and waiting in the queue |
| **Processing** | The AI is analyzing this file |
| **Success** | Ready to use in conversations and workflows |
| **Failed** | Something went wrong — click the retry icon to try again |

### Typical Processing Times

| File Type | Estimated Time |
|-----------|---------------|
| Documents | 1–5 minutes |
| Audio | 2–15 minutes depending on length |
| Video | 5–30 minutes depending on length |

The page polls for updates every 30 seconds and shows a notification when everything is ready.

## Managing Files

### File Table

The detail page lists all files in a sortable table with columns for **Name**, **Size**, **Status**, **Labels**, and a row-level action menu.

Use the **Search** bar to find files by name, or filter by **Labels** using the filter controls.

### Bulk Actions

Select multiple files using the checkboxes, then use the toolbar to:

- **Add Label** — apply labels to all selected files at once
- **Delete** — remove the selected files

### Row Actions

Click the three-dot menu (⋯) on any file row for:

| Action | What It Does |
|--------|-------------|
| **Conversation** | Start a chat with this specific file as context (file must be processed) |
| **Edit Labels** | Add or change labels on this file |
| **Delete** | Remove the file from the dataset |

## Labels

Labels help you organize files within a dataset using simple **key: value** pairs. For example:

```
category: skincare
region: north-america
quarter: Q4-2024
source: focus-group
status: reviewed
```

### Adding Labels

1. Click **Edit Labels** on a file, or select multiple files and click **Add Label**.
2. Enter key-value pairs (one per row).
3. Save your changes.

### How Labels Display

Files show up to two labels on the card. If there are more, you'll see a **+N more** indicator — click it to see all labels.

::: tip Labels Improve AI Retrieval
Well-organized labels help the AI narrow its search when answering questions. Use consistent keys across your files:
- **product:** for product lines
- **quarter:** for time periods
- **type:** for content categories (interview, survey, report)
- **source:** for where the content came from
:::

::: warning Bulk Label Warning
When applying labels to files that already have labels, you'll be asked whether to replace the existing ones. This prevents accidentally overwriting metadata.
:::

## Sharing and Permissions

Control who can access each dataset:

| Permission | What It Allows |
|------------|---------------|
| **Edit** | Upload files, edit labels, modify dataset details |
| **Delete** | Remove files and the dataset itself |
| **Manage** | Share the dataset and change others' permissions |

### How to Share

1. Click **Share** on the dataset card or detail page.
2. Set **General Access** for workspace-wide visibility, or invite specific people by email.
3. Assign permission levels for each person.
4. Save your changes.

## Magic Summaries

![Magic Summaries](/screenshots/datasets/03-magic-summaries.png)

::: info Coming Soon
Magic Summaries will automatically generate insights and connections across your datasets, turning your uploaded files into a connected knowledge base. This feature is currently in development.
:::

## Real-World Use Cases

### Research Knowledge Base

**Scenario:** Your team conducts ongoing consumer research and needs quick access to past findings.

**How to set it up:**
1. Create datasets organized by project or quarter — e.g., "Q4-2024-Product-Research."
2. Upload survey exports, interview transcripts, and summary reports.
3. Label files by topic, segment, and date.
4. Connect the dataset to an analysis-focused agent, then ask questions like:
   - *"What are the top pricing concerns from our Q4 research?"*
   - *"Summarize the key differences between Gen Z and Millennial respondents."*
   - *"Find all mentions of competitor X across our studies."*

### Competitive Intelligence Hub

**Scenario:** You want AI to help you track and analyze competitive positioning.

**How to set it up:**
1. Create a dataset per competitor — e.g., "Competitor-A-Intel."
2. Upload competitor press releases, website content, ad screenshots, and product specs.
3. Label files by source and date for freshness tracking.
4. Ask your agent questions like:
   - *"How does Competitor A position their sustainability story?"*
   - *"What pricing strategies are competitors using this quarter?"*
   - *"Have there been any notable product launches in the last six months?"*

### Meeting and Interview Archive

**Scenario:** You want AI to recall key moments from meetings and consumer interviews.

**How to set it up:**
1. Upload meeting recordings or interview audio/video files.
2. Vurvey automatically transcribes and indexes the spoken content.
3. Label by date, participants, and topic.
4. Search across conversations with questions like:
   - *"What did the client say about the timeline in our last meeting?"*
   - *"Find all action items from the Q4 planning sessions."*

### Multi-Source Market Analysis

**Scenario:** Combine industry reports, survey data, and social listening exports into one knowledge base for comprehensive market understanding.

**How to set it up:**
1. Create a "Market-Analysis-2024" dataset.
2. Upload industry reports, internal survey data, and social listening exports.
3. Label by source and topic.
4. Query for market trends:
   - *"What are the emerging trends in our category?"*
   - *"What gaps exist between customer expectations and our current offerings?"*

## Best Practices

### Organizing Datasets

- Use clear, descriptive names that indicate the dataset's purpose.
- Write helpful descriptions so teammates know what's inside.
- Group related files together — keep datasets focused rather than mixing unrelated content.
- Aim for 50–200 files per dataset for the best AI performance.

### File Quality

- Make sure documents are text-searchable (use OCR for scanned PDFs).
- Use clear audio without heavy background noise for the best transcription results.
- Remove duplicate or outdated files to keep AI answers accurate.

### Label Strategy

- Pick standard label keys your whole team uses (e.g., "category," "region," "quarter").
- Be consistent with values — avoid using both "US" and "United States."
- Label files right after uploading so nothing gets missed.

## Data Security

- All data is encrypted at rest and in transit.
- Datasets are isolated to your workspace — other organizations cannot access your files.
- Permission-based access control ensures only authorized team members can view or edit.

::: warning Privacy Reminder
Make sure any data you upload complies with your organization's data policies and relevant regulations (GDPR, CCPA, etc.).
:::

## Troubleshooting

### Upload Failed

1. Verify the file format is in the supported types list above.
2. Check file size limits — documents up to 50 MB, videos up to 100 MB, audio up to 25 MB, images up to 10 MB.
3. Try uploading the file again.
4. If a large file keeps failing, try splitting it into smaller parts.

### Processing Stuck

1. Wait for automatic polling — the page checks every 30 seconds.
2. Try refreshing the page manually.
3. If stuck for more than 30 minutes, click the retry icon next to the file.
4. Contact support if the problem persists.

### AI Not Finding Content

1. Make sure the file status is **Success** (not Processing or Failed).
2. Confirm you've connected the correct dataset to your conversation.
3. Check that the content is text-searchable (scanned image-only PDFs may not work).
4. Try rephrasing your question using terms that appear in the files.

## Frequently Asked Questions

::: details Click to expand

**Q: How many files can a dataset hold?**
There's no hard limit, but performance is best with 50–500 files. For larger collections, split into multiple focused datasets.

**Q: Can I move files between datasets?**
Not directly. Download the file and re-upload it to the new dataset.

**Q: What happens if I delete a file?**
The file is permanently removed. Conversations that referenced it will lose access to that content.

**Q: Can the AI understand images inside PDFs?**
Yes. PDFs with embedded images are analyzed, and standalone image files are also processed for visual content.

**Q: Are my files visible to other workspaces?**
No. Datasets are isolated to your workspace. Only people you explicitly share with can access them.

**Q: Why can't I delete a dataset?**
Datasets must be empty before you can delete them. Remove all files first.

**Q: How does the AI search my files?**
The AI uses semantic search — it understands meaning and context, not just exact keyword matches.

**Q: Can multiple people upload to the same dataset?**
Yes, as long as they have Edit permission.
:::

## Next Steps

- [Use datasets with AI agents](/guide/agents) for context-aware conversations
- [Reference datasets in chat](/guide/home) using My Data mode
- [Connect datasets to campaigns](/guide/campaigns) for research analysis
- [Automate dataset analysis with workflows](/guide/workflows)
