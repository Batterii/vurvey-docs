---
title: Canvas & Image Studio
---

# Canvas & Image Studio

The **Canvas** is Vurvey's central chat workspace — the same surface described on the [Home](/guide/home) page where you work with Agents, attach Sources, run web Tools, generate images, and explore agentic AI flows in a conversation.

**Image Studio** is the dedicated image-editing experience: open it from a generated image inside chat for inline mask-and-prompt editing, or hit the standalone route `/{workspaceId}/image-studio` to drop into the full editor on its own. Under the hood it's powered by Google Veo 3.1 (for image → video) plus the workspace's configured image models.

> 📷 _Screenshot pending: Canvas chat toolbar — Agents / Populations / Sources / Images / Tools / Model_
> 📷 _Screenshot pending: Sources dropdown — Attach Datasets / Attach Campaigns / Turn on sources_
> 📷 _Screenshot pending: Images dropdown — model picker_
> 📷 _Screenshot pending: Tools dropdown — Web Research / TikTok / Reddit / LinkedIn / YouTube / X / Instagram_
> 📷 _Screenshot pending: Image Studio — full editor with mask, history rail, action toolbar_
> 📷 _Screenshot pending: Brush Size picker (16-160 px slider)_
> 📷 _Screenshot pending: Convert to Video panel — duration, aspect, samples, seed, enhance_

---

## Canvas

The Canvas page is the workspace's chat hub.

### Gating

- **`workspace.chatbotEnabled` must be true** for the Canvas/Home chat to load. Without it, navigating here redirects to **Campaigns**.
- **In guest mode**, if no Brand Companions are published, the page shows: _"No Brand Companions are currently available"_.

### Chat toolbar

A mix of labeled chips and icon-only controls above the input. Visibility depends on workspace feature flags.

| Control | Label vs icon | When it's visible |
|---|---|---|
| **Agents** | Labeled chip | Always (lets you pick which persona is answering). |
| **Populations** | Optional chip | Only when the Populations feature flag is enabled for the workspace. |
| **Sources** | Icon-only dropdown | Always — for attaching workspace data to the conversation. |
| **Images** | Icon-only dropdown | Always — image-model picker + on/off toggle. |
| **Tools** | Icon-only dropdown | Always — external research tools toggle. |
| **Model selector** | Optional icon-only | Only when the workspace's model-override feature flag is on. |

### Sources dropdown

Tooltip: **Select Datasets and/or Campaigns**.

Quick actions:

- **Attach Datasets** — opens the full Sources modal on the Datasets tab.
- **Attach Campaigns** — opens it on the Campaigns tab.
- **Turn on sources / Turn off sources** — toggles whether the currently attached sources are sent in the conversation context for the next message.

The **full Sources modal** has three top-level tabs (Campaigns, Datasets, All files) plus drill-in pages for question-level and dataset-media selection. The conversation's source state can carry a mix of campaigns, individual questions, datasets, individual files, videos, and audios — see [Sources & Citations](/guide/sources-and-citations#part-1-choosing-sources-the-input-side) for the full breakdown.

### Images dropdown

The image-model picker. Currently surfaces these options (all subject to workspace provisioning):

| Option | Provider |
|---|---|
| **Nano Banana** | Internal (small/fast image model) |
| **OpenAI** | DALL-E family |
| **Google Imagen** | Google's image generator |
| **Stable Diffusion** | Open-source SD family |

The bottom option of the dropdown is a **Turn on / Turn off image generation** toggle. With image generation off, the model picker has no effect — the Agent answers in text only.

### Tools dropdown

Web and social-research tools. Currently surfaces:

- **Web Research** (general web search)
- **TikTok** (TikTok content search)
- **Reddit** (subreddit / thread search)
- **LinkedIn** (post / profile / company search)
- **YouTube** (video / channel search)
- **X / Twitter** (post search)
- **Instagram** (post / profile search)

Older references to Google Trends, Google Maps, or Amazon as standard Home-toolbar tools are not accurate for current master. If a customer asks about those specifically, refer them to the current list above.

### Other interactions on Canvas

| Action | What it does |
|---|---|
| **Type `/` in the composer** | Opens a contextual quick-pick popup for tools and image options. |
| **Upload button** | Opens the shared **Upload Files** modal, then the **Create new dataset** modal for the uploaded content. |
| **Agents chip** | Opens the published-agent picker with filter chips, search, and a **Choose agent** commit button. |
| **Populations chip** (when enabled) | Opens the population → persona chooser with search and drill-in. |
| **@-mention in composer** | Opens the InsertMention popup (see [Mentions → @mention syntax](/guide/mentions#2-mention-syntax-in-chat)). |
| **More dropdown on a response** | Per-message menu with delete-confirmation dialog and other per-message actions. |
| **Conversation title/menu** | Opens **Rename conversation** and **Export conversation history to file** dialogs. |

---

## Image Studio

A dedicated, full-featured image editor for refining AI-generated or uploaded images and (since Veo 3.1) turning them into short videos.

### How to reach it

Two entry points:

| Path | When |
|---|---|
| **`/{workspaceId}/image-studio`** (standalone) | Direct URL access. Lazy-loaded via React `lazy()` from `app.tsx` so the editor bundle isn't shipped to users who never open it. Can be loaded with a query param carrying an image URL. |
| **From chat-generated or uploaded images** | A button on the image hover/menu opens it inline. The Studio's state is wired to the parent chat context so changes can save back. |

Both entry points use the same component wrapped in `ImageHistoryContextProvider` (mounted at app-level in `app.tsx`), so the history rail tracks edits across the entire session.

### Layout

- **Top navigation bar** — Exit, Reset to Original, Download, optional Save.
- **Left history rail** — every version of the image as you edit, plus video entries from Convert to Video.
- **Main editor area** — mask/selection canvas, prompt input, action buttons.

### Top navigation bar

| Control | Behavior |
|---|---|
| **Exit Image Studio** (← chevron) | Clears the working image and returns to the parent surface (chat or empty editor). Disabled while an AI update is in flight. |
| **Reset to Original** | Restores the original-source image. Visible only when (a) `originalSrc` exists, (b) the current entry isn't already the original, AND (c) the original is still in history. **Keyboard shortcut: `Alt+R`**. Disabled while updating. |
| **Download** | Saves the current image as `image.png` to your local downloads via an anchor-element click. Opens in a new tab as fallback. |
| **Save** (optional) | Only when Studio is being used inside another flow (e.g. opened from a chat message). Calls `saveImage` from `AiActionsContext` to commit the edit back to the parent. Disabled while updating or when the current entry equals the original (nothing changed). |

### Editor controls

The editor is composed around five React contexts:

| Context | What it carries |
|---|---|
| `ImageHistoryContext` | `clearImage`, `history[]`, current `imageSrc`, `originalSrc`, `setImageSrc` |
| `AiActionsContext` | `isUpdatingImage`, `saveImage`, action handlers |
| `ImageElementContext` | The DOM `<img>` `element` ref used for download/snapshot |
| `CanvasContext` | Drawing `lines`, `getMask` (mask extraction), Konva `stageRef`, `setLines` |
| `EditorSettingsContext` | `brushMode` (draw/erase), `setBrushMode`, `brushSize`, `setBrushSize` |

### Brush modes & selection

- **Select** (`draw` mode, ➕ Pencil) — paint areas you want to change.
- **Un-select** (`erase` mode, ➖ Pencil) — remove paint from your current selection.
- **Reset selection** (↺ Reset) — clear all masked areas.

### Brush Size Picker

A popup attached to the brush controls. Renders a `Slider` with:

| Property | Value |
|---|---|
| **Min** | 16 px |
| **Max** | 160 px |
| **Step** | 1 px |
| **Initial label** | Current size in pixels (e.g. _"32px"_) |
| **Tooltip** | _"Adjust the size of your brush"_ |
| **Position** | Top, arrow-anchored to the trigger |

### Action buttons

The action toolbar below the canvas. Tooltip and placeholder text adapt to the active mode (a nice usability detail to highlight when training new users):

| Action | Tooltip text | Placeholder when active |
|---|---|---|
| **Select** | _"Select 'Select' to paint areas where you want to add something new"_ | _"Describe what you want to add in the selected area (e.g. 'a red balloon', 'a small dog')"_ |
| **Un-select** | _"Select 'Un-select' to remove parts of your selection"_ | _"Describe what should replace the selected area (e.g. 'clear blue sky', 'green grass')"_ |
| **Reset selection** | _"Reset your selection completely"_ | (default) _"Describe what you want to change..."_ |
| **Enhance** | _"Enhance the image with creative AI (adds details, improves textures)"_ | _"Enhancing image with creative AI - no prompt needed"_ |
| **Upscale** | _"Upscale the image resolution with crisp quality"_ | _"Upscaling image resolution - no prompt needed"_ |
| **Remove** | _"Remove the selected area from the image"_ | _"No prompt needed - just click Remove to erase the selected area"_ |
| **Convert to Video** | _"Convert the image to video using Google Veo 3.1 AI"_ | _"Describe the video you want to create (e.g. 'camera slowly zooms in', 'gentle wind blowing through the scene')"_ |
| **Send (prompt change)** | (uses the default tooltip flow) | (default) _"Describe what you want to change (e.g. 'make the sky purple', 'add a mountain in the background')"_ |

### Convert to Video panel

The Convert-to-Video flow uses **Google Veo 3.1 AI** (named explicitly in the action's tooltip). Its config panel exposes these controls:

| Control | Default | Range / Options |
|---|---|---|
| **Video prompt** | (empty) | Free-text description of the desired video |
| **Duration** | **8 seconds** | **4**, **6**, or **8** seconds |
| **Aspect ratio** | **Landscape (16:9)** | **Landscape (16:9)** or **Portrait (9:16)** — the `VideoAspectRatio` enum |
| **Sample count** | **1 video** | **1–4** videos generated in one batch |
| **Negative prompt** | (empty) | Text describing what should NOT appear (subjects, styles, artifacts) |
| **Seed** | (undefined → random) | Numeric. Use the same seed for reproducible results given the same prompt |
| **Enhance prompt** | **On** | Checkbox. When on, Gemini refines the prompt before sending it to Veo |
| **Person generation** | _Allow Adults_ | **Allow Adults** or **No People/Faces** — safety control |

On generation, the request goes to Veo via the backend service. Generated videos appear in the **history rail** alongside image entries — switch between them with the same selector.

::: tip Sample count is a generation multiplier
Setting Sample count to 4 generates four distinct videos from the same prompt with different sampling — useful for picking the best take. Each counts as a separate generation.
:::

### Image history rail

The left rail tracks every version of the image (and video) you've worked on in this session. Click any entry to swap the editor to that version. The history is per-session — closing and reopening Image Studio starts a fresh history (the original-source image is the first entry, current is highlighted).

### Unsaved changes handler

A confirmation dialog renders when you try to navigate away from Image Studio with unsaved edits, asking whether to discard. The behavior is wrapped in the `unsaved-changes-handler` component and is wired to the browser's `beforeunload`-style guardrails for both in-app navigation and tab close.

### What Image Studio does NOT do

- **No vector editing.** It's a raster-image editor with mask-based prompt operations.
- **No layers.** Each generation creates a new history entry; there's no Photoshop-style layer stack.
- **No simultaneous undo/redo.** Versioning is via the history rail (click-to-revert).
- **No multi-image montages.** One working image at a time.
- **No persistent storage** beyond the current session unless you Save (when used inside chat) or Download.

---

## Constraints & limitations

- **Chat is gated by `workspace.chatbotEnabled`.** Without it, Canvas redirects to Campaigns.
- **Image Studio route is workspace-scoped** (`/{workspaceId}/image-studio`).
- **Image Studio is lazy-loaded.** First open in a session has a brief load delay; subsequent opens are instant.
- **Brush size: 16–160 px.** Below 16 is too small to mask usefully; above 160 covers most images entirely.
- **Convert to Video produces 4 / 6 / 8 second clips only.** No custom durations.
- **Aspect ratios: 16:9 or 9:16.** No 1:1, 4:3, or 21:9 today.
- **Sample count maxes at 4.** Larger batches require separate generations.
- **Seed must be numeric.** No string seeds.
- **Reset to Original is conditional.** Only available when the original is still in history and isn't the current view.
- **No simultaneous prompts.** While a generation is in flight, all action buttons are disabled.
- **Save button only appears when Studio is opened from chat.** Standalone-route users always use Download.
- **History is session-scoped.** Closing the tab loses uncommitted history.
- **External tool quality varies.** Web Research and the social tools depend on third-party APIs with their own rate limits and result quality.
- **Image-model availability depends on workspace provisioning.** Not every workspace has all four models — talk to your CSM about model curation.

---

## Best practices

- **Pick the right model for the job.** Nano Banana is fastest, OpenAI is best for cohesive scenes, Imagen excels at photorealism, Stable Diffusion is most controllable with prompt engineering.
- **Use the tool-aware placeholders as a guide.** They're written to nudge you to the right prompt style for each action — _"a red balloon"_ for Select-add is different from _"clear blue sky"_ for Un-select-replace.
- **Mask precisely.** Spend an extra 10 seconds with the brush; the AI follows your mask boundaries closely.
- **Enhance and Upscale don't need prompts.** Saves keystrokes; the placeholder will tell you.
- **For video, start with a low sample count.** Generate 1, see if the style works, then run a 4-sample batch when you're happy with the direction.
- **Keep the seed if a generation looked promising but needed tweaks.** Same seed + adjusted prompt is your friend.
- **Use Negative Prompt to suppress common artifacts.** _"distorted faces, extra limbs, blurry"_ as a starter.
- **Download a working version before Convert to Video** if you're attached to the current image — video conversion creates a separate history entry and the image stays editable.
- **Tools are stronger together.** Combine Sources (workspace data) with Web Research (external context) for the richest grounded answers.
- **Use `/` in chat for quick tool toggling.** Faster than the toolbar.

---

## FAQ

#### Where do I find Image Studio if there's no obvious nav entry?
Direct URL: `/{workspaceId}/image-studio`. Or open it from any AI-generated or uploaded image in chat. There's no top-level nav link by design — it's reached contextually.

#### Why is Reset to Original sometimes greyed out?
Three conditions must hold: the workspace remembers the original (`originalSrc` exists), the current entry isn't already the original, and the original is still in the history rail. If any fails, the button is disabled. The Alt+R keyboard shortcut is also gated on the same conditions.

#### What model does Convert to Video use?
**Google Veo 3.1.** The action's tooltip says so explicitly. Other video generators may be added over time.

#### Why does Enhance Prompt default to on?
Gemini's prompt-refinement step generally produces better Veo outputs than raw user prompts, especially short ones. Turning it off is appropriate when you've already engineered a precise prompt and want literal interpretation.

#### What does "Person generation: Allow Adults" do?
Veo's safety filter. _Allow Adults_ permits adult human subjects but blocks content involving children. _No People/Faces_ blocks any human subject. Choose based on your campaign's content policy.

#### Why are there only 4/6/8 second durations?
Veo 3.1's video length options today. Longer durations would be a different model. Stitching multiple 8-second clips is the workaround for longer videos.

#### Can I have multiple sample videos at the same seed?
Yes. Set Sample count to 4 and a Seed — Veo will produce 4 variations based on the same seed differing only in stochastic post-sampling. Useful for A/B testing micro-variations.

#### Does the history rail persist across sessions?
No. History is per-session — closing the tab loses uncommitted history. Use Download to keep important versions, or Save (when in-chat) to commit back to the conversation.

#### Why doesn't `/` (slash) work as a tool shortcut on every keyboard?
Some browsers consume `/` for Quick Find. The chat composer captures it before the browser does, so it should work in Chrome/Edge/Firefox. If Quick Find opens instead, your browser has stolen focus — click into the composer first.

#### Are Tools real-time?
They proxy to external services (search, Reddit, etc.). Results are fresh, but rate limits on those services apply.

#### What's the difference between Tools and Sources?
- **Sources** are **internal workspace data** — campaigns, datasets, files you've uploaded.
- **Tools** are **external research surfaces** — open web, social networks, etc.

An agent can use both in the same response.

#### Why doesn't my Image button do anything in chat?
Either image generation is toggled off (use the dropdown's bottom option to enable), or the workspace doesn't have any image models provisioned. Talk to your CSM if the latter.

#### Can I edit a video in Image Studio after I create it?
No — Image Studio's edit tools (mask, prompt, enhance, upscale, remove) apply only to images. Videos are terminal entries in history. To iterate, generate again from the original image.

#### Why does my mask not select what I expect?
Brush size and stroke timing matter. Increase brush size with the picker, drag in continuous strokes rather than dots. The mask is what's _painted_, not what's hovered.

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| Canvas redirects me to Campaigns | `workspace.chatbotEnabled` is false. Talk to a Workspace Owner. |
| No agents in the Agents picker | Workspace has no published agents. Create one in [Agents](/guide/agents). |
| Sources dropdown shows tabs but no items | The workspace has no datasets/campaigns yet. |
| Image button does nothing | Image generation is off (bottom toggle in the Images dropdown), or no models are provisioned. |
| Tool returns no results | Rate-limited or no matches. Try a more general query, or wait a minute. |
| Image Studio opens blank | The image URL passed to the route is invalid or expired. Try opening from chat instead. |
| Reset to Original is disabled | Original isn't in history (you may have cleared history) or current view is already the original. |
| Alt+R does nothing | Reset to Original is disabled (see above) or another extension consumed the shortcut. |
| Brush size won't go below 16px | By design — minimum brush size is 16px. |
| Convert to Video panel hidden | Action not selected. Click Convert to Video first; the config panel appears below the canvas. |
| Video generation says "blocked" | Person generation set to _No People/Faces_ but your prompt suggests human subjects, or the safety filter flagged something else. Adjust prompt or relax setting (within policy). |
| Sample-count slider above 4 stops responding | Cap is 4; the slider clamps. |
| History rail empty after refreshing | Sessions don't persist history. Use Save (in-chat flow) or Download to keep things. |
| Save button missing | You're on the standalone route — Save is only available when Studio is opened from another flow. Use Download. |
| Unsaved-changes confirmation won't dismiss | Click Cancel on it, then explicitly Save or Download. Don't navigate away while a generation is in flight. |

---

## Related guides

- [Home](/guide/home) — same chat surface in its primary use as the workspace home
- [Agents](/guide/agents) — the personas behind the Agents chip
- [Sources & Citations](/guide/sources-and-citations) — how attached sources are cited in responses
- [Datasets](/guide/datasets) — the data behind "Attach Datasets"
- [Campaigns](/guide/campaigns) — the data behind "Attach Campaigns"
- [Mentions](/guide/mentions#2-mention-syntax-in-chat) — `@mention` an Agent inside the composer
- [Brand Companions](/guide/brand-companions) — what guest-mode users see in place of Canvas
- [People](/guide/people) — Populations chip (when feature-flagged)
- [Capabilities](/guide/capabilities) — agentic surfaces that compose with chat
