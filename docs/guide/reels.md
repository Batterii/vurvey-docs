---
title: Reels
---

# Reels

**Reels** are editable highlight videos built from campaign responses or uploaded source footage. They're how you turn raw respondent video (or any clipped video content) into a polished, shareable narrative — internal recap, brand-page asset, or stakeholder deliverable.

In current `vurvey-web-manager` master, the main reel-management surface is **Campaigns → Magic Reels**, and the editor is the dedicated `/reel/:reelId` page. The "Magic" in the name nods to an auto-reel generation path powered by a Google Cloud Function (`sensemake-creator-reel`) that uses the Sensemake API to extract highlight-worthy moments from video transcripts — but most reels are still built by hand in the editor.

![Magic Reels list — Name / Length / Status / Last updated](/screenshots/reels/01-magic-reels-list.png?optional=1)
![Add Reel modal — Name + optional Description](/screenshots/reels/02-add-reel.png?optional=1)
![Reel Editor — top action bar, preview, clip list](/screenshots/reels/03-reel-editor.png?optional=1)
![Add Video menu — Upload / Search / Library](/screenshots/reels/04-add-video.png?optional=1)
![Video Search modal](/screenshots/reels/05-video-search.png?optional=1)
![Clip Editor — transcript vs slider modes](/screenshots/reels/06-clip-editor.png?optional=1)
![Share Link side panel — copyable URL + display mode + password](/screenshots/reels/07-share-panel.png?optional=1)

---

## Where Reels live (entry points)

There are several places you'll see Reel surfaces in the app:

| Surface | What it's for |
|---|---|
| **Campaigns → Magic Reels** | The primary list-and-edit page for the workspace. All workspace reels appear here. |
| **`/reel/:reelId`** | The dedicated reel editor, opened by clicking a reel from any list. |
| **Branding → Reviews** | The Review Modal includes a **Create Reel** button on each response — opens the Add Reel modal, then drops you into the new reel editor with the clip pre-attached. See [Branding → Reviews](/guide/branding#reviews-branding-reviews). |
| **Mentions → All Mentions** | Same component as Branding → Reviews, so same Create-Reel path. See [Mentions → All Mentions](/guide/mentions#1-2-all-mentions-tab). |
| **Branding → Brand Reels** | A separate list page on the branding side that shows reels filtered by brand-page status. Same underlying data, same row-menu pattern (**Copy**, **Delete**). |
| **`/share/:reelId`** | The public share page, used by anyone with a share link. Renders a password gate when the reel is password-protected. |

---

## The Reel data model

A Reel is composed of several related records in vurvey-api:

| Model | What it stores |
|---|---|
| **`Reel`** | The reel record itself: name, description, clip list, display mode (light/dark), `requiresPassword`, optional password, share state, brand-page-share status. |
| **`ReelVideo`** | The rendered output video and its lifecycle status (Draft / Processing / Published / Failed). One per reel render; a reel can have multiple renders over its lifetime. |
| **`ReelEngagement`** | Per-viewer engagement events on the shared reel — used by analytics. |
| **`ReelTracker`** | Top-level tracker for aggregating engagement and surfacing reel performance metrics. |
| **`CloudReelDetails`** | For auto-generated reels: sentiment scores, opinion clusters, and keyword extraction from the Sensemake pipeline (see below). |

The two GraphQL enums worth knowing:

- **`ReelVideoStatus`** — controls what the published-video status badge says.
- **`ReelDisplayMode`** — `LIGHT` or `DARK`, controls the share-page background.

---

## Magic Reels list page (Campaigns → Magic Reels)

The workspace's reel library.

### Toolbar

- **Search Reels** input — filters by reel name.
- **+ Add Reel** button — opens the Add Reel modal (described below).

### Table

| Column | Notes |
|---|---|
| **Name** | Click to open the editor. |
| **Length** | Total duration after all clips sum (the editor recalculates on every clip edit). |
| **Status** | One of: **Draft**, **Processing**, **Published**, **Unpublished Changes**, **Failed**. See lifecycle below. |
| **Last updated** | Relative timestamp. |
| _(no header)_ | Row `⋮` menu with **Copy** and **Delete**. |

**Delete** opens a yes/no confirmation: _"Are you sure you want to delete this reel?"_

### Statuses (lifecycle)

| Status | Meaning |
|---|---|
| **Draft** | The reel has never been published. Edit freely; nothing user-shareable exists yet. |
| **Processing** | A publish render is in flight. The editor polls for status while you wait — could be seconds to minutes depending on length and clip count. |
| **Published** | The latest render succeeded. Share, Download, and the public `/share/:reelId` URL all work. |
| **Unpublished Changes** | The reel was published once, then edited. The previous render is still publicly viewable; the new changes haven't been rendered yet. Click **Save & Publish** to render the latest. |
| **Failed** | The render job failed. Retry by clicking **Save & Publish** again. Persistent failures may indicate a bad source video or service-side issue. |

---

## Add Reel modal

Opens via **+ Add Reel** (list page) or from the Create Reel buttons in Branding Reviews / Mentions.

| Field | Required | Notes |
|---|---|---|
| **Name** | Yes | Cannot be empty. |
| **Description** (optional) | No | Used in share panel and listings. |
| **Save** | — | Creates the reel and opens the editor. If you came from a response-selection flow, the new reel also gets one or more clips auto-attached and a published-on-brand-page toggle handled by the [Rewards](/guide/rewards) flow (see Reel creation in `ReviewsPage`). |

---

## Reel Editor (`/reel/:reelId`)

The full-page editor for a single reel. Three working areas:

- **Top action bar** (across the top)
- **Preview and metadata pane** (left)
- **Clip list and Add Video controls** (right)

### Top action bar

| Control | Behavior |
|---|---|
| **← Back** | Returns to the Magic Reels list. |
| **Inline reel name** | Editable; saves on blur. |
| **Status indicator** | Reflects ReelVideoStatus (Draft / Processing / Published / Unpublished Changes / Failed). |
| **Share** | Opens the Share Link side panel. **Disabled until the reel has been published at least once.** |
| **Save & Publish** | Triggers a render job. |
| **Share on brand page** toggle | Visible only for eligible enterprise/support users. Flips the reel to "share with brand" so it appears on the customer's brand page. |
| **⋮ Overflow menu** | Share / Save & Publish / Copy / Download / Delete. **Download** is disabled until Published. **Copy** duplicates the reel and routes you to the duplicate. |

### Preview & metadata (left)

- Current clip/video preview.
- Creator info and created date.
- Total reel duration.
- **Preview** button — opens the Preview Reel modal (described below). Only visible when there's at least one clip.
- **Description** text area — saves on blur.

### Clip list (right)

A table with one row per clip:

- **Order** indicator.
- **Thumbnail + source details** (campaign name, original video, etc.).
- **Duration** of the clip.
- **Drag handle** for reordering clips by drag-and-drop.
- **Click clip title or scissors icon** → opens the **Clip Editor modal**.
- **⋮ Row menu**: **Copy** (duplicate this clip), **Delete** (remove from reel).

### Add Video menu

The **+ Add Video** button at the bottom of the clip list opens a three-option menu:

| Option | What it does |
|---|---|
| **Upload Video** | Opens the Upload Video modal — pick a collection, upload a file (MOV, MP4, MPEG4, AVI). |
| **Search Videos** | Opens the Video Search modal — query workspace videos by text + filters. |
| **From Media Library** | Opens the Media Library modal — browse videos grouped by collection. |

---

## Upload Video modal

Reachable from **Add Video → Upload Video**.

| Field | Notes |
|---|---|
| **Upload to collection** dropdown | **Required** — you must select a collection before the file input is enabled. Includes a **Create Collection** option that opens the nested Create Collection modal. |
| **Video input** | Supported formats: **MOV, MP4, MPEG4, AVI**. |
| **Upload** | Disabled until both a collection and a file are chosen. |

**The upload pipeline runs in three steps**: (1) create the source-video record, (2) add it to the selected collection, (3) create the reel clip pointing at the source video. If any step fails, the reel itself is unaffected.

### Create Collection (nested modal)

Opens from the **Create Collection** option in the collection dropdown.

| Field | Notes |
|---|---|
| **Collection Name** | Required. |
| **Save** | Creates the collection and returns you to the upload modal with the new collection selected. |

---

## Search Videos modal

Reachable from **Add Video → Search Videos**.

| Control | Behavior |
|---|---|
| **Search input** | Text search across video metadata and transcripts. The modal does **NOT** preload results — type a query first. |
| **Sort dropdown** | Sort the results by recency, relevance, etc. |
| **All Campaigns** searchable filter | Limit to specific campaigns. |
| **Highlights only** checkbox | Filter to videos that have AI-extracted highlights (i.e. ones the Sensemake pipeline thinks are reel-worthy). |
| Paginated result grid | Click thumbnails to select. |
| **Selection count + Add to Reel** sticky bar | Appears when at least one result is selected. Clicking adds all selected videos to the reel as new clips. |

::: tip "Highlights only" is the fastest path to a usable reel
The Sensemake pipeline ranks moments in every video by sentiment, opinion, and keyword density. Filtering to highlights surfaces the most reel-worthy clips first, saving you the manual scrubbing.
:::

---

## Media Library modal

Reachable from **Add Video → From Media Library**.

A broader browser for all uploaded videos, grouped by collection:

- **Create collection** inline input + button at the top.
- **Grouped video cards** under each collection.
- **Checkbox** on each video for multi-select.
- **Per-video `⋮` menu** with **Remove** — removes the video from the collection (does NOT delete the reel or the source video).
- **Sticky Add to Reel bar** when at least one is selected.

---

## Clip Editor modal

Click a clip title or its scissors icon to open the Clip Editor. This is where you trim a clip to the exact moment you want to feature.

| Element | Behavior |
|---|---|
| **Video player** | Inline player for the clip's source video. |
| **Progress bar + time indicator** | Shows current position in the source video. |
| **Clip with transcript** mode | When the source video has transcript data, you can select a sentence range from the transcript and the clip boundaries snap to those sentences' timestamps. |
| **Clip using slider** mode | Manual start/end sliders. Always available regardless of transcript. |
| **Mode toggle** (radio) | Only renders when both modes are available. |
| **Save** | Applies the new clip boundaries and recalculates the total reel duration. |
| **Cancel** | Discards changes. |

::: tip Transcript-based trimming is much faster
If you've got transcript data, use it — sentence-level selection is far more precise than dragging a slider, especially for short cuts. Slider mode is the fallback for legacy or transcript-less videos.
:::

---

## Preview Reel modal

The **Preview** button on the left pane opens the Preview Reel modal.

- **Inline player** rendering the current clip sequence in browser.
- **Play/Pause** control.
- **Restart** button (jumps to the beginning).
- A **tip banner** explaining that the **final rendered reel may differ slightly** from this in-browser preview (the server-side render uses different encoding settings).

---

## Sharing — the Share Link side panel

Unlike Agents, Datasets, Campaigns, and Workflows (which use the [generic Permissions modal](/guide/permissions-and-sharing#layer-2-per-resource-sharing-openfga-backed)), **Reels use a dedicated share-link side panel**. This is a design decision: reels are typically shared with external viewers via a public link, not added to a workspace member's per-resource ACL.

The panel slides in from the right side and contains:

| Control | Behavior |
|---|---|
| **Share URL** | Read-only field with the public `/share/:reelId` URL. |
| **Copy** | Copies the URL to clipboard. |
| **Dark background / Light background** radios | Sets `ReelDisplayMode` to `DARK` or `LIGHT` — controls how the share page renders. |
| **Download** | Downloads the rendered MP4. Disabled until published. |
| **Require a password** toggle | When on, flips `requiresPassword = true` on the reel. |
| **Password input** | Active when the toggle is on. Stores the password on the reel record. |
| **Save** | Persists changes. |

**Opening the share panel marks the reel as shared.** The panel does NOT expose public/private/team visibility modes — the share link is the only mechanism.

### Server-side password semantics

The `requiresPassword` and `password` fields on the `Reel` model behave like this:

- When `requiresPassword = false`, the `password` field is **stored but inert** — the public page never asks for it.
- When `requiresPassword = true`, the public `reel` query with `shared: true` **fails** unless a matching password is provided.
- Viewing the password itself requires the `readPrivate` permission on the reel — so only workspace members can see the value, not the public.

::: warning Password protection is a single static password
There's no per-viewer auth, no expiry, no rate limiting beyond what the public page provides. Treat the password like a shared key — anyone with the URL and password sees the reel.
:::

### Password-protected public page (`/share/:reelId`)

When the reel is password-protected, the public page renders a password form:

- **Enter a password** input
- **Submit** button
- _"Password incorrect"_ error when the value doesn't match

After successful entry, the page renders the reel player and a **Download** button.

---

## Publishing — what actually happens

Click **Save & Publish** to render the reel.

### Validation

- Every clip must be **at least 1 second long**, or publish is blocked with an inline error.

### The render pipeline

1. Reel transitions to `Processing` status.
2. The backend dispatches a render job (the actual MP4 encoding lives outside this UI — typically in a background worker that consumes the clip list, fetches the source media, trims and concatenates, and produces the final MP4).
3. The editor polls every few seconds for status changes (`Processing` → `Published` or `Failed`).
4. On success, the published video is attached as the `ReelVideo` record and Download / Share work.
5. On failure, status moves to `Failed` and you can retry by clicking Save & Publish again.

### Render lifecycle indicators

The editor polls for updates while publishing. The status indicator on the top bar reflects ReelVideoStatus in near-real-time.

---

## Auto-generated reels (the "Magic" in Magic Reels)

There's an **auto-reel pipeline** that can generate a complete reel from a creator's video corpus without manual clipping. It lives in `vurvey-gcf-scripts/sensemake-creator-reel/` as a Google Cloud Function and works like this:

1. A request arrives with `{user_id, workspace_id}`.
2. The function calls the **Sensemake API** at `https://sensemake.vurvey.dev/` to extract highlight sentences from every video the user has produced.
3. For each video, Sensemake returns: per-sentence text, per-sentence highlight probability (0-1), and whether each sentence was flagged as a highlight.
4. The function builds a `CloudReelDetails` record: total highlight count, opinion clusters (positive/negative/neutral with their keyword sets), sentiment scores per dimension, and the aggregated keyword cloud.
5. It then assembles a reel of the top-scored highlights, creating Reel + ReelVideo + clip records.
6. The reel lands in the workspace's Magic Reels list as a Draft or auto-Published depending on configuration.

This is what's behind "Magic Reels" — the name implies the AI auto-generation path even though hand-curated reels live alongside auto-generated ones in the same list.

::: info Sensemake is a separate Vurvey service
`sensemake.vurvey.dev` is a Vurvey-owned analytics service that processes video transcripts for sentence-level sentiment, opinion clustering, and highlight scoring. It's the same backend that drives some campaign analysis surfaces. Documentation for the API itself is internal — talk to engineering if you need to integrate against it directly.
:::

---

## Brand-page sharing

If the workspace role allows it (eligible enterprise/support users), the reel editor's top bar shows a **Share on brand page** toggle.

When on, the reel is added to the brand's public page. The branding area also has a separate **Brand Reels** listing showing only the reels flagged for brand-page display. They share the same underlying model — same row menu (**Copy**, **Delete**), same editor.

---

## Common workflows

### Build a reel from existing campaign responses

1. Open **Campaigns → Magic Reels**.
2. Click **+ Add Reel**.
3. Name the reel; click Save.
4. In the editor, click **+ Add Video → Search Videos**.
5. Type a query, tick **Highlights only** to surface the best moments first.
6. Select clips and click **Add to Reel**.
7. Reorder via drag handle; open Clip Editor on each clip to fine-tune.
8. Click **Save & Publish** and wait for status to flip to **Published**.
9. Click **Share** to open the side panel; copy the URL.

### Build a reel from uploaded video files

1. Open a reel (or create new).
2. Click **+ Add Video → Upload Video**.
3. Pick a collection (or create one).
4. Upload your file (MOV/MP4/MPEG4/AVI).
5. Wait for processing.
6. The clip appears in the list — trim it in the Clip Editor.
7. Save & Publish.

### Build a reel from Branding Reviews

1. Open **Branding → Reviews** (or **Mentions → All Mentions**).
2. Click a review card to open the Review Modal.
3. Use highlight selection on the transcript.
4. Click **Create Reel** on the response.
5. Add Reel modal opens with the response's clip pre-attached.
6. Name and save.

---

## Constraints & limitations

- **Clips must be ≥1 second long.** Publish is blocked otherwise.
- **Reel sharing is a single static password**, not per-viewer auth.
- **Share panel does NOT support public/private/team visibility modes** — share-link-only.
- **Reels do NOT use the generic Permissions modal** like Agents/Datasets/Campaigns/Workflows.
- **Auto-reel generation depends on Sensemake highlights existing** for the source videos. Videos without Sensemake processing won't surface in "Highlights only" search.
- **Upload formats are MOV/MP4/MPEG4/AVI.** No WebM, no MKV, no AVI variants outside the common ones.
- **Brand-page share toggle is role-gated.** Most workspace members don't see it.
- **Removing a video from a collection in Media Library doesn't delete the reel or the source.** Just unlinks the video from the collection.
- **Preview Reel uses browser playback**, which differs slightly from the server-side render. The tip banner says so explicitly.
- **The Share panel "Opening = shared" behavior is implicit.** Don't open it for inspection if you don't actually want the reel marked shared.
- **Password protection has no expiry.** Once set, the URL works forever (or until the password is changed).

---

## Best practices

- **Use Highlights only when searching.** It's the fastest path from "I want a reel" to a published asset.
- **Keep clips short.** A 30-second-clip reel keeps stakeholders engaged better than a 3-minute one.
- **Trim with transcript mode** when available — sentence-snapping is faster and more accurate than slider-dragging.
- **Order clips from strongest hook to softest landing.** The first 5 seconds determine whether the viewer keeps watching.
- **Use Light display mode for brand-page embedding**, Dark for executive previews where you want a slick deck-feel.
- **Test the share URL in incognito** before sending. Password-protected reels are easy to forget the password on after a few weeks.
- **Save reel descriptions.** They appear on the public share page and in some listings — first-impression copy matters.
- **Rotate passwords periodically** for high-sensitivity content. There's no audit log on share-page visits in the panel.
- **For brand-page shares, double-check the display mode and copy** before flipping the toggle — the brand page is publicly indexable.
- **Use Copy when iterating.** Easier to keep the original "approved" version and iterate on a copy than to risk an Unpublished Changes state on the canonical reel.

---

## FAQ

#### Why don't Reels use the standard Share dialog?
Reels are mostly shared with external audiences — customers, stakeholders, brand-page visitors. The generic Permissions modal is for workspace-internal sharing. The Share Link panel is purpose-built for external-link distribution with display-mode and password options.

#### Can I download a reel before publishing?
No. Download is disabled until the latest changes are Published. Publish first, then Download.

#### Why is Share disabled?
The reel hasn't been published at least once. Click Save & Publish; when status flips to Published, Share enables.

#### What's "Unpublished Changes"?
You edited the reel after it was published. The old published version is still publicly viewable; your edits haven't been rendered yet. Click Save & Publish to render the latest.

#### What does "Magic Reels" mean?
"Magic" refers to the auto-reel pipeline that uses Sensemake highlights to assemble reels automatically. Most reels in the list are hand-built; auto-generated ones live alongside them.

#### Can I trim a clip after adding it?
Yes. Click the title or the scissors icon — Clip Editor opens with both transcript and slider modes (when available).

#### Why is "Add to Reel" disabled in Search Videos?
You haven't selected anything yet. Click thumbnails to select, the sticky bar appears with the count and the Add button enabled.

#### What's the difference between Search Videos and Media Library?
**Search Videos** is text-search-first, scoped across the workspace. **Media Library** is browse-first, grouped by collection. Use Search when you know what you want; use Library when you're exploring.

#### Can password-protected reels be indexed by search engines?
No — the public page renders a password gate before the video URL is even exposed. Crawlers see the password form, not the video.

#### Are reels cached at the share URL?
The published MP4 is delivered via CDN, so playback is fast. The share-page HTML hits the API fresh each time to check current status, password requirements, and display mode.

#### What's the maximum reel length?
There's no hard cap in the UI, but rendering long reels takes proportionally longer and the publish job can timeout for very long compositions. Practical cap: ~3 minutes for predictable rendering.

#### Can I add my logo or watermark to a reel?
Not directly through this UI. For branded watermarks, talk to your CSM about the brand-page sharing flow which applies brand-page chrome around the video.

#### What happens to ReelEngagement data when I delete a reel?
Per the data-retention policy, ReelEngagement records typically persist for analytics even after the parent reel is deleted. The reel itself is gone, but the aggregate engagement data is preserved.

#### Why can't I see "Share on brand page"?
Your workspace role isn't eligible. Brand-page sharing is gated to specific roles (typically Vurvey enterprise/support staff or workspace owners). Ask your CSM.

#### Why does drag-and-drop reorder sometimes feel jumpy?
The drag handle uses standard HTML5 DnD with some custom snap behavior; on touch devices, hold longer before dragging. On desktop, click directly on the drag handle (not the row body).

#### Can I auto-generate a reel manually?
Not from the UI. The auto-reel pipeline is a backend GCF triggered by specific events (typically user creation events or admin batch runs). To request a generated reel, contact engineering.

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| Save & Publish does nothing | A clip is shorter than 1 second. Trim or remove. |
| Reel stuck in Processing | Render job is slow (long reels, many clips). Wait several minutes; if it never completes, status will flip to Failed. |
| Reel went to Failed | The render pipeline rejected the inputs. Common causes: corrupt source video, missing transcript data referenced by a transcript-mode clip, source video deleted. Retry Save & Publish; if it persists, recheck the source files. |
| Share button is greyed out | Reel has never been published. Click Save & Publish first. |
| Download is greyed out | Same root cause — not yet published. |
| Drag handle doesn't work | Click directly on the handle, not the row body. On touch devices, hold longer before dragging. |
| Transcript mode is missing in Clip Editor | The source video has no transcript data. Use slider mode. |
| Search Videos returns no results | "Highlights only" is on but the videos lack Sensemake processing; or your search query is too narrow. Try unchecking Highlights only. |
| Upload fails | Wrong format (not MOV/MP4/MPEG4/AVI), too large, or a transient upload error. Re-export the file and try again. |
| Password-protected page accepts the wrong password | The password is case-sensitive; double-check. If you're confident the password is correct, try clearing browser cache. |
| Brand-page toggle missing | Role-gated. Ask your CSM. |
| Reel appears in Brand Reels but I didn't put it there | Brand-page-share toggle was on at some point in the reel's life. Open the editor; if the toggle is on, flip it off to remove from Brand Reels. |
| Auto-generated reel didn't appear after a user signed up | The auto-reel GCF runs on schedule or trigger; not every event triggers it. Wait, or ask engineering to check the function logs. |

---

## Related guides

- [Campaigns](/guide/campaigns) — the source of most response clips you'll add to a reel
- [Branding → Reviews](/guide/branding#reviews-branding-reviews) — alternative entry point for creating reels from response feedback
- [Mentions → All Mentions](/guide/mentions#1-2-all-mentions-tab) — shares the same Create-Reel flow
- [Rewards](/guide/rewards) — the create-reel-from-response flow used during review/reward workflows
- [Datasets](/guide/datasets) — where uploaded source videos can be associated for broader file management
- [Permissions & Sharing](/guide/permissions-and-sharing) — the standard sharing pattern used by Agents/Datasets/Campaigns/Workflows but NOT by Reels
- [Branding](/guide/branding) — workspace brand identity that the brand-page share toggle ties into
