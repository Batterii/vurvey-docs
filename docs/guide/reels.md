# Reels

Reels let you create, edit, and share compiled video collections from survey responses, brand feedback, or uploaded content. Think of Reels as a video playlist editor designed for research insights and testimonials.

::: info Accessing Reels
Reels can be accessed from:
- Direct navigation: `/:workspaceId/reel/:reelId`
- Branding → Reels tab (for brand-related video content)
- Campaigns → Responses (when creating reels from survey videos)
:::

## Overview

Reels help you:
- Combine multiple video clips into a single compilation
- Organize and reorder video content
- Share curated video collections with stakeholders
- Create testimonial reels from consumer feedback
- Build highlight reels from campaign responses

## The Reel Editor

The reel editor uses a three-column layout:

| Column | Purpose | What You See |
|--------|---------|-------------|
| **Left: Video Library** | Source clips and media | All available clips you can add to the reel |
| **Center: Preview Player** | Playback and preview | Currently selected clip or full reel preview |
| **Right: Clip Timeline** | Reel composition | Ordered list of clips in the final reel |

### Navigation

- **Preview mode** — Watch the assembled reel from start to finish
- **Edit mode** — Add, remove, and reorder clips
- **Share mode** — Configure sharing settings and get public links

## Adding Clips

You have three ways to add video clips to a reel:

### 1. Upload Files

Upload video files directly from your computer:

1. Click **Upload** in the left panel
2. Select video files (MP4, MOV, AVI supported)
3. Files upload and process
4. Processed clips appear in the video library
5. Drag clips from the library to the timeline (right panel)

**Supported formats:**
- MP4 (recommended)
- MOV
- AVI
- Maximum file size: 500 MB per clip

### 2. Search Campaign Responses

Pull video responses from your campaigns:

1. Click **Search Answers** in the left panel
2. Select a campaign from the dropdown
3. Choose which question(s) to include
4. Filter by participant, date, or other criteria
5. Select the responses you want
6. Click **Add to Reel**
7. The clips appear in your timeline

**Best for:**
- Creating testimonial reels from positive feedback
- Compiling the best responses to a specific question
- Building highlight reels from campaign insights

### 3. Media Library

Access previously uploaded video content:

1. Click **Media Library** in the left panel
2. Browse your workspace's uploaded videos
3. Filter by dataset, upload date, or labels
4. Select clips to add
5. Drag to the timeline

**Best for:**
- Reusing clips from previous reels
- Accessing brand footage or b-roll
- Incorporating uploaded assets from datasets

## Editing the Reel

### Reordering Clips

Drag clips up or down in the right timeline panel to change the sequence. The reel plays clips in top-to-bottom order.

**Typical reel structure:**
1. **Opener** — Attention-grabbing first clip (3–10 seconds)
2. **Body** — Main content (multiple clips)
3. **Closer** — Strong ending or call-to-action (3–10 seconds)

### Removing Clips

Click the **X** or **Remove** button on any clip in the timeline to delete it from the reel. The clip remains in your video library and can be re-added later.

### Trimming Clips (if supported)

Some reel editors allow trimming individual clips:
- Set in/out points to use only part of a clip
- Adjust timing without re-uploading

Check your reel editor for trim controls on the timeline.

### Preview Mode

Click **Preview** to watch the entire reel from start to finish:
- Clips play in sequence
- Transitions between clips are automatic (usually a cut)
- Total duration displays at the top

Use preview mode to:
- Check the flow and pacing
- Verify clip order
- Spot awkward transitions
- Confirm the reel tells a cohesive story

## Reel Status & Transcoding

When you save a reel, the system combines all clips into a single video file. This process is called **transcoding**.

### Reel States

| Status | What It Means | Estimated Time |
|--------|---------------|----------------|
| **Unpublished** | Draft — not yet processed | N/A |
| **Pending** | Transcoding in progress | 30 seconds – 2 minutes |
| **Created** | Ready to view and share | N/A |
| **Failed** | Transcoding error occurred | N/A |

### Transcoding Process

1. You click **Save** or **Publish**
2. Status changes to **Pending**
3. The system polls every 3 seconds for updates
4. Clips are stitched together into a single MP4 file
5. Status changes to **Created** when done

**Transcoding time depends on:**
- Number of clips
- Total reel duration
- Video resolution and bitrate
- Server load

### If Transcoding Fails

If your reel shows **Failed** status:
1. Check that all clips are valid video files
2. Ensure no clips are corrupt or incomplete
3. Try removing the most recently added clip
4. Rebuild the reel with fewer clips and re-publish
5. Contact support if the issue persists

## Sharing Reels

Once a reel is in **Created** status, you can share it with others.

### Sharing Options

Click **Share** to configure access:

| Setting | Options | Description |
|---------|---------|-------------|
| **Link Sharing** | On/Off | Generate a public URL anyone can view |
| **Display Mode** | Full Screen, Embedded, Minimal | How the reel appears when opened |
| **Password Protection** | On/Off + password | Require a password to view |
| **Embed Code** | Copy code snippet | HTML/iframe for embedding on websites |

### Public Sharing

When link sharing is enabled:

1. A unique URL is generated: `https://your-domain.com/share/:reelId`
2. Anyone with the link can view the reel (no login required)
3. Viewers see the reel player with your display mode settings

**Use public sharing for:**
- Client presentations
- Stakeholder reviews
- Social media posts
- Website testimonials

### Password-Protected Sharing

For sensitive content, enable password protection:

1. Toggle **Password Protection** on
2. Set a password (you'll share this manually with viewers)
3. Copy the share link
4. Send the link and password separately to your audience

Viewers must enter the password before the reel loads.

### Embedding Reels

Copy the embed code to add the reel to websites, presentations, or documents:

1. Click **Share**
2. Scroll to **Embed Code**
3. Copy the HTML snippet
4. Paste it into your website's HTML or use a platform's embed feature

The embedded reel plays inline on the page with your configured display mode.

## Reel Management

### Renaming Reels

1. Click the reel title at the top of the editor
2. Type a new name
3. Press **Enter** or click away to save

Good reel naming:
- **Descriptive**: "Q4 2024 Customer Testimonials"
- **Date-stamped**: "Holiday Campaign Highlights - Dec 2024"
- **Purpose-tagged**: "[INTERNAL] Product Feedback Compilation"

### Duplicating Reels

Create a copy of an existing reel:

1. Open the reel you want to duplicate
2. Click the three-dot menu (⋯)
3. Select **Duplicate**
4. A new reel is created with all the same clips
5. Edit the new reel independently

Use duplication to:
- Create variations for different audiences
- Preserve an original while experimenting
- Build template reels for recurring use cases

### Deleting Reels

Remove a reel permanently:

1. Click the three-dot menu (⋯)
2. Select **Delete Reel**
3. Confirm the action

::: danger Cannot Undo Deletion
Deleting a reel removes the compiled video file. Individual source clips remain in your video library, but you'll need to rebuild the reel from scratch if you delete it accidentally.
:::

## Common Workflows

### Creating a Testimonial Reel from Campaign Responses

**Scenario:** You've collected video feedback from 50 customers and want to create a 2-minute testimonial reel.

**Workflow:**
1. Navigate to the campaign with video responses
2. Filter responses by rating or sentiment (show only 4-5 star feedback)
3. Watch responses and identify 8–10 compelling clips
4. Create a new reel
5. Click **Search Answers** and select those 8–10 responses
6. Drag them to the timeline in order of impact (strongest first and last)
7. Preview the reel
8. Adjust order for pacing and variety
9. Publish the reel
10. Enable link sharing and copy the URL
11. Share with marketing team or embed on website

### Building a Campaign Highlight Reel

**Scenario:** Showcase the best moments from a large research study.

**Workflow:**
1. Review all video responses and note timestamps of key insights
2. Create a new reel
3. Add clips via **Search Answers**, selecting diverse participants
4. Order clips thematically:
   - Introduction (who participated)
   - Problem statements
   - Solution feedback
   - Emotional responses
   - Call to action
5. Preview and refine
6. Publish with password protection
7. Share with internal stakeholders

### Monthly Research Summary Reel

**Scenario:** Create a recurring monthly reel of research insights for leadership.

**Workflow:**
1. At month-end, review all campaigns that closed in the past 30 days
2. Create a new reel titled "Research Insights - [Month Year]"
3. Add 1–2 clips from each campaign representing key findings
4. Order clips by strategic priority
5. Keep total duration under 3 minutes for busy executives
6. Publish and share via email with a brief summary
7. Archive the reel for future reference

## Best Practices

### Reel Length Recommendations

| Audience | Ideal Length | Maximum Length |
|----------|-------------|----------------|
| **Social Media** | 30–60 seconds | 90 seconds |
| **Internal Stakeholders** | 2–3 minutes | 5 minutes |
| **Client Presentations** | 3–5 minutes | 8 minutes |
| **Website Testimonials** | 45–90 seconds | 2 minutes |

### Clip Selection

- **Quality over quantity** — 5 great clips beat 15 mediocre ones
- **Diversity** — Vary participant demographics, perspectives, and emotions
- **Authenticity** — Genuine reactions resonate more than polished statements
- **Energy** — Start and end strong. Place lower-energy clips in the middle.
- **Audio quality** — Exclude clips with poor audio unless the visual is critical

### Pacing

- **Vary clip length** — Mix short (5–15 sec) and longer (30–60 sec) clips
- **Contrast energy** — Follow an enthusiastic clip with a thoughtful one
- **Thematic grouping** — Cluster related topics, then transition to new themes
- **Breathing room** — Don't cram too many ideas into one reel

### Technical Quality

- **Consistent resolution** — Clips should match (all 1080p or all 720p)
- **Audio levels** — Normalize volume so no clip is too loud or quiet
- **Lighting** — Exclude clips with very poor lighting unless content is exceptional
- **Orientation** — Mix landscape and portrait carefully, or stick to one

## Troubleshooting

**Clips won't upload?**
- Check file format (MP4, MOV, AVI supported)
- Verify file size is under 500 MB
- Ensure stable internet connection
- Try compressing the video before uploading

**Reel stuck in "Pending" status?**
- Transcoding usually takes 30 seconds – 2 minutes
- Wait up to 5 minutes for completion
- If still pending, try rebuilding the reel with fewer clips
- Check that all clips are fully uploaded and processed

**Shared link doesn't work?**
- Verify link sharing is enabled
- Check that the reel status is **Created** (not Pending or Failed)
- Test the link in an incognito/private browser window
- Ensure the viewer has the password (if password-protected)

**Can't reorder clips?**
- Make sure you're in Edit mode (not Preview mode)
- Try refreshing the page
- Check that the reel isn't currently publishing

**Preview shows wrong clips?**
- Verify you saved your changes after editing
- Refresh the page and reopen the reel
- Check that transcoding completed successfully

**Embed code doesn't work on my website?**
- Verify your website allows iframe embeds
- Check for Content Security Policy restrictions
- Test the embed code in a simple HTML file first
- Contact your web developer if CSP changes are needed

## Frequently Asked Questions

::: details Click to expand

**Q: How many clips can I add to a reel?**
A: There's no strict limit, but performance and transcoding time degrade with very large reels (50+ clips). Keep reels focused and under 20 clips for best results.

**Q: Can I add background music?**
A: Background music is not currently supported in the reel editor. You can add music using external video editing software after exporting.

**Q: Can I trim clips within the reel editor?**
A: Clip trimming availability depends on your reel editor version. Check for trim controls on individual clips in the timeline.

**Q: Are transitions customizable?**
A: Reels use automatic cuts between clips. Custom transitions (fades, wipes) are not currently available.

**Q: Can I download the final reel?**
A: Yes. Once transcoding is complete, click the download button to save the compiled MP4 file.

**Q: Do reels expire?**
A: No. Reels remain available indefinitely unless you delete them.

**Q: Can multiple people edit the same reel?**
A: Reels support single-editor access. If multiple people need to edit, use reel duplication to create separate versions.

**Q: What happens to source clips if I delete a reel?**
A: Source clips remain in your video library and datasets. Only the compiled reel file is deleted.

**Q: Can I make a reel private again after sharing publicly?**
A: Yes. Disable link sharing in the Share settings and the public URL will stop working.

**Q: How do I credit participants in reels?**
A: You can add participant names in the clip titles within the reel editor, or include a credits section as a final text overlay clip (if your editor supports text overlays).
:::

## Next Steps

- [Collect video responses through campaigns](/guide/campaigns)
- [Create brand feedback questions](/guide/branding)
- [Manage video content in datasets](/guide/datasets)
- [Share reels with external stakeholders](/guide/permissions-and-sharing)
