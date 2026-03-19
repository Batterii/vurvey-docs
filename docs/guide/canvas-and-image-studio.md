# Canvas & Image Studio

The Canvas is Vurvey's chat workspace. It is the same core experience described on the [Home](/guide/home) page: a conversation surface where you work with agents, sources, tools, and image generation.

Image Studio is the image-editing experience that can open from chat-generated or uploaded images, and it also has a standalone page route in current `vurvey-web-manager` master.

## Canvas

In current master:

- the Canvas loads the main chat view
- if `chatbotEnabled` is off for the workspace, the app redirects to **Campaigns**
- in guest mode, if there are no published personas, the page shows a `No Brand Companions are currently available` message

## Current Chat Toolbar

The toolbar above the input uses a mix of labeled chips and icon-only controls.

Visible controls include:

| Control | Current behavior |
|---|---|
| **Agents** | Opens the agent selector |
| **Populations** | Optional chip shown only when the related feature flag is enabled |
| **Sources** | Icon-only dropdown for attaching workspace sources |
| **Images** | Icon-only dropdown for image generation models |
| **Tools** | Icon-only dropdown for web and social research tools |
| **Model selector** | Optional icon-only selector shown only when the relevant feature flags are enabled |

### Sources

The Sources tooltip reads **Select Datasets and/or Campaigns**.

From the toolbar dropdown, the current quick actions are:

- **Attach Datasets**
- **Attach Campaigns**
- **Turn on sources / Turn off sources**

The full source modal supports campaign, dataset, and file/media flows. In the current UI, the top-level navigation is centered on **Campaigns**, **Datasets**, and **All files**, with question and dataset-media selection handled as drill-in pages rather than primary tabs.

### Images

The image-model dropdown currently includes:

- **Nano Banana**
- **OpenAI**
- **Google Imagen**
- **Stable Diffusion**

The bottom option toggles image generation on or off.

### Tools

The tools dropdown currently includes:

- **Web Research**
- **TikTok**
- **Reddit**
- **LinkedIn**
- **YouTube**
- **X/Twitter**
- **Instagram**

Older references to Google Trends, Google Maps, or Amazon as standard Home-toolbar tools are not accurate for the current master branch.

### Other Chat Menus and Modals

The Canvas chat flow also uses a few other important interaction surfaces:

- the **Agents** chip opens the published-agent picker with filter chips, search, and explicit commit buttons
- the optional **Populations** chip opens the population-to-persona chooser with population search, persona drill-in, and **Choose persona**
- the **upload** button opens the shared **Upload Files** modal and then the **Create new dataset** modal
- typing **/** in the composer opens the contextual tool/image popup
- each assistant response includes a **More** dropdown and a delete confirmation dialog
- the conversation title/menu opens **Rename conversation** and **Export conversation history to file** dialogs

## Image Studio

Image Studio is a real product surface in current master, but the supported actions are narrower and more concrete than some older docs suggested.

### How It Opens

Current code supports:

- opening Image Studio from chat/image flows
- loading it as a standalone page through the image-studio route
- passing an image URL into the standalone page

### Current Layout

The current layout has:

- a top navigation bar
- a left-side history rail
- the main editor area

Most editing controls are exposed as inline panels rather than separate popups. The main contextual surfaces are the history rail, the mask/selection controls, and the **Convert to Video** configuration panel.

Two other real popup/confirm surfaces in current master are:

- the **brush-size** popup inside the editor controls
- the unsaved-changes confirmation shown when you try to leave with edits

The top bar includes:

- **Exit Image Studio**
- **Reset to Original** when applicable
- **Download**
- an optional **Save** action when Image Studio is being used inside another flow

### Editing Actions Verified in Master

The editor currently supports:

- selecting an area to change
- un-selecting parts of the mask
- resetting the current selection
- **Enhance**
- **Upscale**
- prompt-based image changes
- **Remove** on a masked area
- **Convert to Video**

### Convert to Video

The current video conversion panel exposes these controls:

- **Video prompt** — text area describing the desired video content
- **Duration** — **4**, **6**, or **8** seconds
- **Aspect ratio** — **16:9** or **9:16**
- **Sample count** — **1-4**
- **Person generation** — **Allow Adults** or **No People/Faces**
- **Negative prompt** — text field for specifying what to exclude from the video
- **Seed** — numeric field for reproducible generation results
- **Enhance prompt** — checkbox to refine the prompt with Gemini before generation

### History

Image Studio keeps a history rail of generated or edited media and can switch between image and video entries in that history.

## What This Page No Longer Claims

To stay aligned with master, this guide intentionally does **not** document older speculative behavior such as:

- configurable Perlin-sphere workspace settings
- a guaranteed 9-card prompt showcase
- unsupported promises about five-panel studio layouts
- unverified feature lists beyond the actions currently wired in the editor
