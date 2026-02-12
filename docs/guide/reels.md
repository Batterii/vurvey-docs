# Reels

Reels are curated video compilations created from campaign responses, reviews, or media library content. Use Reels to showcase customer feedback, create highlight videos, or share insights with stakeholders.

:::info API Terminology
In the codebase, Reels are stored as `Reel` objects with associated `Clip` items. The video compilation process is called "transcoding" and produces multiple formats (VP8/WebM and H264/MP4).
:::

## Overview

Reels provide:
- **Video compilation**: Combine multiple video clips into one reel
- **Drag-and-drop editing**: Reorder clips easily
- **Professional sharing**: Share with password protection and branding
- **Multiple formats**: Automatic transcoding to web and download formats
- **Subtitle support**: Multi-language subtitle generation

## Reel Interface

The Reel editor uses a three-column layout:

```
┌─────────────────────────────────────────────┐
│  Reel Actions (Publish, Share, Download)   │
├──────────────┬───────────────┬──────────────┤
│   Preview    │  Clips List   │   Metadata   │
│   (Player)   │   (Sortable)  │   (Details)  │
│              │               │              │
└──────────────┴───────────────┴──────────────┘
```

| Column | Content |
|--------|---------|
| **Left** | Video player showing current clip preview |
| **Middle** | Sortable list of all clips in the reel |
| **Right** | Reel metadata (creator, date, duration, status) |

## Creating a Reel

### From Campaign Reviews

The most common way to create Reels is from campaign video responses:

1. Navigate to a **Campaign** with video responses
2. Go to the **Results** tab
3. Select video responses you want to include
4. Click **Create Reel**
5. Reel editor opens with selected videos as clips

### From Branding Reviews

1. Go to **Branding** → **Reviews**
2. Browse video feedback responses
3. Select videos to include
4. Click **Create Reel from Selected**

### From Mentions (Enterprise)

1. Navigate to **Mentions** → **Reviews**
2. Filter feedback videos
3. Select relevant clips
4. Create reel compilation

## Managing Clips

### Adding Clips

Click **Add Video** to see three options:

#### 1. Upload Video
- Upload video files from your computer
- Supported formats: MP4, MOV, AVI
- Max file size depends on workspace plan
- Progress bar shows upload status

#### 2. Search Videos
- Search existing campaign responses
- Filter by campaign, question, or respondent
- Preview videos before adding
- Add multiple videos at once

#### 3. Media Library
- Browse all workspace videos
- Filter by dataset or upload date
- Select from previously uploaded content

### Reordering Clips

1. Hover over a clip in the middle column
2. Drag the clip to a new position
3. Drop to reorder
4. Reel updates automatically

### Editing Clips

1. Click on a clip in the list
2. Clip editor modal opens
3. Adjust **start time** and **end time**
4. Preview the trimmed clip
5. Click **Save** to apply changes

### Duplicating Clips

- Click the **three-dot menu** on a clip
- Select **Duplicate**
- Copy appears immediately after original
- Edit timing independently

### Deleting Clips

- Click the **three-dot menu** on a clip
- Select **Delete**
- Confirm deletion
- Clip removed from reel

## Publishing and Sharing

### Publishing a Reel

Before sharing, publish your reel to generate the compiled video:

1. Review all clips in the editor
2. Click **Publish** in the top-right
3. System begins **transcoding** (compiling clips into one video)
4. Status updates every 3 seconds:
   - **PENDING** → Waiting to start
   - **PROCESSING** → Transcoding in progress
   - **CREATED** → Ready to share
   - **FAILED** → Error during processing
5. When **CREATED**, video is ready

:::warning Transcoding Time
Transcoding takes 1-5 minutes depending on:
- Total reel duration
- Number of clips
- Video resolution
- Current system load

Do not close the browser during transcoding.
:::

### Sharing Options

Click **Share** to open the sharing screen:

#### Display Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| **PUBLIC** | Anyone with the link can view | Broad audience sharing |
| **PASSWORD_PROTECTED** | Requires password to view | Controlled access |
| **PRIVATE** | Only workspace members can view | Internal only |

#### Sharing Workflow

1. Click **Share** button
2. Select display mode
3. (Optional) Set password if using PASSWORD_PROTECTED
4. Click **Copy Link**
5. Share the link via email, Slack, etc.

#### Share with Brand

Toggle **Share with Brand** to:
- Make reel visible in branding section
- Include in brand profile
- Allow brand-level access

### Downloading Reels

Download reels for offline viewing or external sharing:

1. Click **Download** button
2. Choose format:
   - **MP4 with Subtitles** (ZIP file)
   - **MP4 only** (single file)
3. File downloads automatically
4. Subtitles included as separate SRT files (if available)

**Download formats:**
- **Video**: H264/AAC MP4 (universal compatibility)
- **Subtitles**: SRT format for multiple languages
- **Package**: ZIP contains video + all subtitle files

## Reel Metadata

View reel information in the right column:

| Field | Description |
|-------|-------------|
| **Creator** | User who created the reel |
| **Created At** | Date and time of creation |
| **Duration** | Total runtime of all clips |
| **Status** | Current transcoding/publishing status |
| **Editors** | Users with edit access |
| **Shared in Brand** | Whether included in brand profile |

## Reel Actions

### Duplicate Reel

Create a copy of the entire reel:

1. Click **three-dot menu** in Reel Actions
2. Select **Duplicate**
3. New reel created with same clips
4. Edit copy independently
5. Original reel unchanged

### Delete Reel

Permanently remove a reel:

1. Click **three-dot menu**
2. Select **Delete**
3. Confirm deletion in modal
4. Reel and all clips removed (original videos preserved)

:::warning Cannot Undo
Reel deletion is permanent and cannot be undone. The source videos remain in their original locations (campaigns, datasets, etc.).
:::

## Common Workflows

### Customer Testimonial Reel

1. Run a video feedback campaign
2. Go to Campaign → Results
3. Filter for positive responses (4+ stars)
4. Select best video answers
5. Click **Create Reel**
6. Reorder clips for narrative flow
7. Trim clips to key quotes (15-30 seconds each)
8. Publish and download
9. Share on social media or website

### Weekly Highlights

1. Collect video responses throughout the week
2. Friday: Create reel from top responses
3. Organize clips chronologically
4. Add opening clip (introduction)
5. Add closing clip (call-to-action)
6. Publish and share with PUBLIC mode
7. Send link via newsletter

### Internal Research Summary

1. Gather research videos from campaigns
2. Create reel organized by theme
3. Group similar responses together
4. Set to PASSWORD_PROTECTED mode
5. Share password with stakeholders only
6. Present in meetings using shared link

### Product Review Compilation

1. Go to Branding → Reviews
2. Select product-related feedback videos
3. Create reel
4. Edit clips to 10-20 seconds each
5. Order from problem → solution → satisfaction
6. Download with subtitles
7. Use in product marketing

## Transcoding Details

### Video Formats Produced

Vurvey automatically generates two formats:

| Format | Codec | Purpose |
|--------|-------|---------|
| **WebM** | VP8/Vorbis | Web streaming (browsers) |
| **MP4** | H264/AAC | Download and compatibility |

### Transcoding Status

Monitor progress in Reel Actions:

- **Pending**: Queued for processing
- **Processing**: Transcoding in progress (1-5 min)
- **Completed**: Ready to view/share
- **Completed (No Audio)**: Video only, no audio track
- **Failed**: Error occurred (contact support)

### Polling

The Reel page automatically checks status every **3 seconds** during transcoding. You'll see real-time updates without refreshing.

## Subtitles

### Automatic Generation

Subtitles are automatically generated for:
- Video responses with clear speech
- Multi-language content (detected automatically)
- Transcribed during transcoding process

### Subtitle Languages

Depending on content, subtitles may be available in:
- English
- Spanish
- French
- German
- Italian
- Portuguese
- (Additional languages based on source audio)

### Downloading Subtitles

1. Click **Download**
2. Select **MP4 with Subtitles**
3. ZIP file includes:
   - Compiled MP4 video
   - SRT subtitle files (one per language)
4. Use subtitle files in video editors or players

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Transcoding stuck at PENDING | Refresh page; check system status |
| Transcoding FAILED | Re-publish reel; check source video formats |
| Video not playing in preview | Ensure browser supports MP4/H264; update browser |
| Can't add more clips | Check workspace plan limits; delete unused reels |
| Share link not working | Verify display mode; check password if protected |
| Download includes no subtitles | Source videos may lack clear audio; subtitles unavailable |
| Clips out of order after save | Ensure drag-drop completed; save changes explicitly |
| "No permission" error | Request edit access from reel creator or admin |

## Best Practices

### Clip Length

- **Testimonials**: 15-30 seconds per clip
- **Highlights**: 10-20 seconds per clip
- **Full responses**: 1-2 minutes maximum
- **Total reel**: Keep under 5 minutes for best engagement

### Narrative Flow

- **Start strong**: Open with compelling clip
- **Theme grouping**: Organize similar responses together
- **Pacing**: Alternate between shorter and longer clips
- **End with CTA**: Close with call-to-action or summary

### Quality Control

- **Preview all clips**: Watch in editor before publishing
- **Trim dead space**: Remove pauses at start/end of clips
- **Audio levels**: Ensure consistent volume across clips
- **Resolution**: Use highest quality source videos
- **Lighting**: Group similarly lit clips together

### Sharing Strategy

- **Public reels**: Use for marketing, social media
- **Password-protected**: Use for stakeholder reviews
- **Private**: Use for internal research discussions
- **Brand sharing**: Enable for reels featured in brand profile

## FAQ

**Q: Can I edit a reel after publishing?**
A: Yes, but you'll need to re-publish after making changes. The transcoding process will run again.

**Q: What's the maximum reel length?**
A: There's no hard limit, but we recommend keeping reels under 10 minutes for optimal transcoding and viewer engagement.

**Q: Can I add non-video content to reels?**
A: No, reels currently support video clips only. Use Datasets for other content types.

**Q: Do deleted reels delete the source videos?**
A: No. Deleting a reel only removes the compilation. Source videos remain in their original locations (campaigns, media library, etc.).

**Q: Can I add custom branding or watermarks?**
A: Custom branding is available in the Branding settings. Watermarks applied at the workspace level appear on all reels.

**Q: How do I create a reel from multiple campaigns?**
A: Use the Media Library option when adding clips. You can select videos from any campaign or source.

**Q: Can collaborators edit my reels?**
A: Yes, if you grant them edit permissions. See the Permissions & Sharing guide for details.

**Q: Why are my subtitles inaccurate?**
A: Subtitle accuracy depends on audio quality, accents, and background noise. Clear audio with minimal background noise produces the best results.

## Related Features

- [Campaigns](/guide/campaigns) - Source videos from campaign responses
- [Branding](/guide/branding) - Manage brand profile and reviews
- [Datasets](/guide/datasets) - Store and organize video content
- [Permissions & Sharing](/guide/permissions-and-sharing) - Control who can view/edit reels
