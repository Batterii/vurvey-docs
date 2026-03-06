# Reels

Reels are editable highlight videos built from campaign responses or uploaded source videos. In current `vurvey-web-manager` master, the main reel-management surface is **Campaigns → Magic Reels**, and the editor is the dedicated `/reel/:reelId` page.

## Where Reels Live

Use **Campaigns → Magic Reels** to create and manage workspace reels.

The current list page includes:

- a **Search Reels** input
- an **Add Reel** button
- a table with **Name**, **Length**, **Status**, and **Last updated**
- a row-level overflow menu with **Copy** and **Delete**

Status labels shown in the list are currently:

- **Draft**
- **Processing**
- **Published**
- **Unpublished Changes**
- **Failed**

Deleting from the row menu opens the shared yes/no confirmation modal: **Are you sure you want to delete this reel?**

## Create Reel Modal

Click **Add Reel** to open the current **Add Reel** modal.

The modal includes:

- **Name**
- **Description (optional)**
- **Save**

If you opened the modal from a response-selection flow, saving can also create clips in the new reel automatically.

## Reel Editor Layout

Opening a reel takes you to the full editor page. The current editor is organized into three working areas:

- the top action bar
- the left preview and metadata area
- the right clip list and add-video controls

### Top Action Bar

The current action bar includes:

- a back button
- an inline reel-name field that saves on blur
- a publish-status indicator
- **Share**
- **Save & Publish**
- an overflow menu

For eligible enterprise/support users, the bar also shows a **Share on brand page** toggle.

The overflow menu currently includes:

- **Share**
- **Save & Publish**
- **Copy**
- **Download**
- **Delete**

Important current behavior:

- **Share** is disabled until the reel has been published at least once
- **Download** is disabled until the reel is in the published state
- **Delete** opens the reel delete confirmation modal
- **Copy** duplicates the reel and routes you to the duplicate

### Preview And Metadata

The left side of the editor contains:

- the current clip/video preview
- creator and created-date metadata
- total reel duration
- a **Preview** button when the reel has at least one clip
- a **Description** text area

The description saves when the field loses focus.

### Clips List

The right side of the editor shows the reel's clips in a table with:

- clip order
- video thumbnail and source details
- clip duration
- clip actions

Each clip row currently supports:

- clicking the clip title or scissors icon to open the **Clip Editor** modal
- dragging with the drag handle to reorder clips
- a three-dot menu with **Copy** and **Delete**

## Add Video Menu

At the bottom of the clip list, the current **Add Video** button opens a three-option menu:

- **Upload Video**
- **Search Videos**
- **From Media Library**

These are three separate flows with different modals.

## Current Modals And Menus

| Surface | Current behavior |
|---|---|
| **Add Reel** | Small modal with **Name**, **Description (optional)**, and **Save** |
| **Delete Reel** | Shared confirmation modal with **Yes** and **No** |
| **Add Video** menu | Context menu with **Upload Video**, **Search Videos**, and **From Media Library** |
| **Upload Video** | Modal with a collection selector, video uploader, and **Upload** button |
| **Create Collection** | Nested modal from the upload flow with **Collection Name** and **Save** |
| **Video Search** | Modal with search, sort, campaign filter, **Highlights only**, selection count, and **Add to Reel** |
| **Media Library** | Modal with inline collection creation, selectable videos, per-video **Remove** menu, and **Add to Reel** |
| **Clip Editor** | Large modal for trimming with transcript/slider controls and **Save** / **Cancel** |
| **Preview Reel** | Modal preview player with a tip banner and **Restart** |
| **Share Link** | Full-height side panel, not a small popup modal |
| **Clip row menu** | Context menu with **Copy** and **Delete** |
| **Magic Reels row menu** | Context menu with **Copy** and **Delete** |

## Upload Video Modal

Choosing **Upload Video** opens the current upload modal.

That modal includes:

- a collection dropdown labeled **Upload to collection**
- a video input for **MOV, MP4, MPEG4, AVI**
- an **Upload** button

Current behavior to know:

- you must select a collection before the upload input is enabled
- the collection dropdown includes **Create Collection**
- choosing **Create Collection** opens the nested **Create Collection** modal
- the upload flow first creates the source video, then adds it to the selected collection, then creates the reel clip

## Search Videos Modal

Choosing **Search Videos** opens the current **Video Search** modal.

The modal includes:

- a search input
- a sort dropdown
- an **All Campaigns** searchable filter
- a **Highlights only** checkbox
- paginated results
- a sticky selection bar with **Add to Reel** once you select one or more items

The modal does not preload every video by default. It is centered on entering a search term, then refining with filters.

## Media Library Modal

Choosing **From Media Library** opens the current **Media Library** modal.

The modal includes:

- an inline **Create collection** input and button at the top
- grouped video cards under each collection
- a checkbox on each video
- a per-video overflow menu with **Remove**
- a sticky selection bar with **Add to Reel**

Removing a video here removes it from the collection. It does not delete the reel itself.

## Clip Editor Modal

The current **Clip Editor** modal opens when you click a clip title or the scissors icon.

The modal includes:

- the clip video player
- a clip progress bar and time indicator
- transcript-based trimming when transcript data exists
- a slider-based trimming mode
- a radio toggle between **Clip with transcript** and **Clip using slider** when both modes are available
- **Save**
- **Cancel**

Saving updates the clip timing and recalculates total reel duration.

## Preview Reel Modal

The **Preview** button opens the current **Preview Reel** modal.

This modal includes:

- an inline player
- a play/pause control
- a tip banner explaining that the final rendered reel may differ slightly
- **Restart**

## Share Link Side Panel

The current reel sharing experience is not the same generic teammate-sharing dialog used by agents, campaigns, datasets, or workflows.

When you click **Share** on a reel, the app opens a full-height **Share Link** side panel. The panel currently includes:

- a copyable share URL
- **Copy**
- **Dark background** / **Light background** radio options
- **Download**
- **Require a password**
- a password input with **Save**

Current reel-sharing behavior:

- opening the share panel marks the reel as shared
- password protection is optional and controlled inside the side panel
- the shared page can require a password before the reel loads
- the side panel does not expose public/private/team visibility modes

## Password-Protected Shared Reel

If a shared reel requires a password, the public `/share/:reelId` page shows a password form instead of the video.

That screen currently includes:

- an **Enter a password** input
- **Submit**
- a **Password incorrect** error when needed

Once the password is accepted, the shared page shows the reel player and a **Download** button.

## Publishing

Use **Save & Publish** to render the current reel.

Current publishing rules and states:

- clips must be at least **1 second** long or publishing is blocked
- **Draft** means the reel has not been published yet
- **Publishing** / **Processing** means the render job is running
- **Published** means the downloadable/shared reel is ready
- **Unpublished Changes** means the reel was published before, then edited again
- **Publishing failed** means the render job failed and you may need to retry

The editor polls for updates while the reel is publishing.

## Brand-Sharing Notes

If the workspace role allows it, a reel can also be toggled into **Share on brand page** from the top action bar.

The branding area also has a separate **Brand Reels** listing page backed by the same reel model. That list currently uses the same table-style row menu pattern with **Copy** and **Delete**.

## Common Workflows

### Build A Reel From Existing Responses

1. Open **Campaigns → Magic Reels**
2. Click **Add Reel**
3. Name the reel and save
4. Use **Add Video → Search Videos**
5. Select clips and click **Add to Reel**
6. Reorder or trim clips in the editor
7. Click **Save & Publish**
8. Open **Share** once publishing completes

### Build A Reel From Uploaded Video Files

1. Open a reel
2. Click **Add Video → Upload Video**
3. Pick or create a collection
4. Upload the source video
5. Wait for processing to finish
6. Click **Upload**
7. Trim the clip in the **Clip Editor** if needed
8. Publish the reel

## FAQ

**Q: Can I reorder clips?**  
A: Yes. The current editor uses a drag handle in each clip row.

**Q: Can I trim a clip after adding it?**  
A: Yes. Open the **Clip Editor** from the clip title or scissors icon.

**Q: Does reel sharing use the standard Viewer/Editor permissions dialog?**  
A: No. Reels currently use a share-link side panel with optional password protection.

**Q: Can I download a reel before publishing?**  
A: No. Download is disabled until the reel has a published video.

**Q: Can I add clips from uploaded collections as well as campaign answers?**  
A: Yes. The current editor supports both **Search Videos** and **From Media Library**, plus direct video upload.

## Related Guides

- [Campaigns](/guide/campaigns) for adding response clips to reels from survey results
- [Datasets](/guide/datasets) for broader file and media organization
- [Permissions & Sharing](/guide/permissions-and-sharing) for the standard teammate-sharing dialog used elsewhere in the app
