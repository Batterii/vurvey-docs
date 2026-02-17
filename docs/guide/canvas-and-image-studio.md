# Canvas & Image Studio

The Canvas is Vurvey's AI-powered chat interface — the conversational workspace where you interact with agents, analyze data, and generate insights. Image Studio is the integrated AI image editor that lets you enhance, transform, and generate visual content without leaving your conversation.

::: info Canvas = Home Page
The "Canvas" refers to the main AI chat interface you see on the Home page. It's called Canvas because it's a blank creative space where ideas come to life through conversation. Image Studio is accessible within Canvas when working with images.
:::

---

## The Canvas Experience

When you log in to Vurvey, you land on the Canvas — a clean, conversational interface with a greeting and a text input ready for your first question.

### Visual Elements

The Canvas features several distinctive visual elements:

#### Perlin Sphere Animation

The animated 3D sphere you see on the welcome screen is generated using Perlin noise — a procedural WebGL animation that creates flowing, organic movement. This sphere serves as Vurvey's visual signature and can be configured in workspace settings.

**What you can customize:**

| Setting | Options | Effect |
|---------|---------|--------|
| **Animation Speed** | Slow, Medium, Fast | Controls sphere rotation and wave speed |
| **Color Scheme** | Brand colors or default | Matches sphere colors to your brand palette |
| **Particle Density** | Low, Medium, High | Adjusts the number of visual particles |
| **Enable/Disable** | On or Off | Show the sphere animation or a static background |

::: tip Workspace Customization
Workspace administrators can configure the Perlin Sphere animation in **Settings > General Settings**. Changes apply to all users in the workspace.
:::

#### Prompt Showcase

The welcome screen displays a grid of 9 pre-built prompt cards designed to jumpstart common research tasks. These cards represent popular use cases across industries:

| Prompt Card | What It Does |
|-------------|--------------|
| **Twitter/X Analysis** | Analyzes sentiment and trends from X (formerly Twitter) |
| **Instagram Insights** | Identifies visual trends and content performance on Instagram |
| **YouTube Research** | Summarizes video content and comment sentiment |
| **Reddit Discussions** | Surfaces community opinions and discussion threads |
| **TikTok Trends** | Discovers viral content and trending topics |
| **LinkedIn Insights** | Analyzes professional content and thought leadership |
| **Survey Analysis** | Quick summary of campaign response themes |
| **Competitive Intelligence** | Compares your brand to competitors using web research |
| **Creative Brief Generator** | Drafts creative briefs from campaign data |

Click any card to auto-populate your chat input with a pre-written prompt. You can edit it before sending or use it as-is.

::: tip Custom Prompt Cards
Enterprise workspaces can configure custom prompt showcase cards that reflect their specific workflows and industry terminology.
:::

---

## Image Studio

Image Studio is Vurvey's integrated AI image editor. It appears when you upload an image to the Canvas or click an AI-generated image to edit it.

### Accessing Image Studio

There are three ways to open Image Studio:

1. **Upload an image** to Canvas and click the **Edit** button that appears
2. **Generate an image** using AI and click **Edit Image** in the response
3. **Navigate directly** to `/image-studio` (standalone mode)

### Image Studio Interface

Image Studio features a five-panel layout:

1. **Toolbar** (left) — Drawing tools, brush controls, and actions
2. **Canvas** (center) — The image workspace where you draw and edit
3. **History Panel** (right) — Undo/redo and version history
4. **AI Actions Panel** (bottom) — One-click AI transformations
5. **Settings Panel** (top-right) — Output settings and export options

---

## AI Image Operations

Image Studio offers five core AI-powered operations:

### 1. Enhance Image

Enhances image quality, sharpness, and color balance automatically.

**What it improves:**
- **Sharpness** — Reduces blur and improves detail clarity
- **Color Balance** — Adjusts white balance and saturation
- **Lighting** — Corrects underexposed or overexposed areas
- **Noise Reduction** — Removes graininess in low-light images

**Best for:**
- Product photos that look dull or flat
- Screenshots with compression artifacts
- Scanned documents or images
- Photos shot in poor lighting

**Usage:**
1. Load your image into Image Studio
2. Click **Enhance Image** in the AI Actions panel
3. Wait 5–10 seconds for processing
4. Compare before/after using the History Panel

::: tip Enhance vs. Upscale
**Enhance** improves overall image quality and color. **Upscale** increases resolution and physical size. Use Enhance first for quality, then Upscale if you need a larger dimension.
:::

### 2. Upscale Image

Increases image resolution and dimensions using AI interpolation.

**What it does:**
- Doubles or quadruples image dimensions (e.g., 512x512 → 2048x2048)
- Preserves sharpness and detail at higher resolution
- Reconstructs fine details that would blur with traditional scaling

**Upscale options:**

| Setting | Options | Recommended For |
|---------|---------|----------------|
| **Scale Factor** | 2x, 4x | 2x for web images, 4x for print-quality assets |
| **Detail Level** | Low, Medium, High | High for product photos, Medium for illustrations |

**Best for:**
- Preparing images for large-format printing
- Creating hi-res assets from low-res source files
- Enlarging logos or graphics without pixelation

**Usage:**
1. Click **Upscale Image** in the AI Actions panel
2. Select your scale factor (2x or 4x)
3. Choose detail level
4. Click **Upscale** and wait 10–15 seconds

::: warning File Size Warning
Upscaling to 4x can produce very large files (10+ MB). Only use 4x when you genuinely need print-quality resolution.
:::

### 3. Edit Image (Change/Replace Content)

Modifies specific parts of an image based on a text prompt and drawn mask.

**How it works:**
1. **Draw a mask** over the area you want to change using the brush tool
2. **Write a prompt** describing what should replace the masked area
3. **AI generates** new content that blends seamlessly with the rest of the image

**What you can change:**
- Backgrounds (e.g., "Replace with a beach sunset")
- Objects (e.g., "Change the car color to blue")
- People (e.g., "Add sunglasses")
- Textures (e.g., "Make the fabric look like denim")

**Example workflows:**

| Task | Mask Area | Prompt |
|------|-----------|--------|
| **Replace Background** | Everything except subject | "Modern office with glass windows and plants" |
| **Change Product Color** | The product itself | "Matte black finish" |
| **Add Props** | Empty hand or table space | "Holding a coffee cup" |
| **Remove Objects** | The object to remove | *(Leave prompt empty to remove)* |

**Usage:**
1. Select **Draw Brush** from the toolbar
2. Paint over the area you want to modify (masked area appears semi-transparent)
3. Enter your edit prompt in the text field
4. Click **Edit Image**
5. Review the result in 15–20 seconds

::: tip Masking Precision
For best results, mask slightly beyond the edges of what you want to change. The AI will create smoother blends when the mask has a small buffer around the target area.
:::

### 4. Remove Selection

Removes selected areas from an image and fills them naturally with AI-generated content.

**How it works:**
1. Draw a mask over the object or area to remove
2. Click **Remove Selection** (no prompt needed)
3. AI inpaints the masked area to blend with surroundings

**Common removals:**
- Unwanted objects in product photos
- Background clutter
- Text or watermarks
- People or faces for privacy
- Blemishes or imperfections

**Usage:**
1. Select **Draw Brush** and mask the area to remove
2. Click **Remove Selection** in the AI Actions panel
3. AI fills the area seamlessly in 10–15 seconds

::: tip Clean Removal Results
For cleanest results, remove objects with simple, uniform backgrounds. Removing objects from complex, textured backgrounds may produce visible artifacts.
:::

### 5. Convert to Video

Transforms a static image into a short video clip with motion and animation.

**Configuration Options:**

| Setting | Options | Default | Purpose |
|---------|---------|---------|---------|
| **Duration** | 4s, 6s, 8s | 4s | Video length |
| **Aspect Ratio** | 16:9, 9:16 | 16:9 | Landscape or portrait |
| **Sample Count** | 1–4 | 1 | Number of variations to generate |
| **Person Generation** | On, Off | On | Whether to animate people in the image |
| **Negative Prompt** | (text field) | (empty) | What to avoid in the animation |
| **Seed** | (number) | (random) | Reproducibility control |

**What it animates:**
- Camera movements (pan, zoom, dolly)
- Object motion (floating, rotating, swaying)
- Natural effects (wind, water flow, light changes)
- Person actions (if Person Generation is enabled)

**Best for:**
- Product showcase videos from static product shots
- Social media content (Instagram Reels, TikTok)
- Mood boards that need motion
- Concept videos for presentations

**Usage:**
1. Click **Convert to Video** in the AI Actions panel
2. Configure duration, aspect ratio, and other settings
3. Click **Generate Video**
4. Wait 30–60 seconds for video generation and encoding
5. Preview and download the result

::: warning Video Generation Limits
Video generation uses Google Veo 3.1, which has a processing queue. During peak usage, generation may take up to 2 minutes. Videos over 8 seconds are not supported.
:::

**Example video prompts:**

| Image Type | Recommended Settings |
|-----------|---------------------|
| **Product Photo** | Duration: 4s, Aspect: 16:9, Sample: 1 |
| **Portrait/Headshot** | Duration: 6s, Person Generation: ON, Aspect: 9:16 |
| **Landscape/Scene** | Duration: 8s, Aspect: 16:9, Negative: "camera shake" |
| **Logo/Graphic** | Duration: 4s, Person Generation: OFF, Negative: "distortion" |

---

## Drawing Tools

Image Studio provides a full set of drawing and masking tools:

### Brush Tools

| Tool | Purpose | Keyboard Shortcut |
|------|---------|------------------|
| **Draw Brush** | Paint selection masks | B |
| **Erase Brush** | Remove parts of the mask | E |
| **Brush Size** | Adjust brush diameter (5–100px) | [ / ] |
| **Reset** | Clear all masks and start over | Cmd+Z (undo all) |

### Color Picker

Select custom mask colors for better visibility when working with complex images. The default mask color is semi-transparent blue.

### Zoom and Pan

- **Zoom In/Out** — Use mouse wheel or pinch gesture
- **Pan** — Click and drag with mouse (when zoomed in)
- **Fit to Screen** — Double-click the canvas to reset zoom

---

## History and Undo

The History Panel tracks every edit operation:

- **Undo** — Click the undo button or press Cmd+Z / Ctrl+Z
- **Redo** — Click the redo button or press Cmd+Shift+Z / Ctrl+Shift+Z
- **Version History** — Expand the history panel to see a timeline of edits
- **Restore Previous Version** — Click any history entry to jump back to that state

**History is URL-based:** Image Studio stores your editing history in the browser URL. You can bookmark a specific editing state or use the browser's back/forward buttons to navigate through edit history.

::: tip Saving Work in Progress
If you need to pause mid-edit, bookmark the current URL. When you return to that bookmark, Image Studio loads your exact editing state, including all masks and settings.
:::

---

## Export and Download

### Export Options

| Format | Best For | File Size |
|--------|----------|-----------|
| **PNG** | Lossless quality, transparency support | Largest |
| **JPG** | Photographs, web images | Smaller |
| **WEBP** | Modern browsers, best compression | Smallest |

### Download Settings

- **Image Quality** — Adjust JPEG compression (1–100%)
- **Dimensions** — Specify exact pixel dimensions or percentage scale
- **Filename** — Custom filename for the download

**How to export:**
1. Click **Export** in the top-right corner
2. Select your format and quality settings
3. Click **Download**
4. The image saves to your default downloads folder

---

## Common Workflows

### Product Photo Enhancement Pipeline

1. **Upload product photo** to Canvas
2. Click **Edit Image** to open Image Studio
3. **Remove background clutter** using Remove Selection
4. **Enhance image quality** with Enhance Image
5. **Upscale to hi-res** with Upscale Image (2x or 4x)
6. **Export as PNG** for transparency or JPG for web use

### Social Media Content Creation

1. **Generate base image** in Canvas using AI (e.g., "Modern kitchen with natural lighting")
2. **Edit the image** to add brand elements (e.g., mask a blank wall and add your logo)
3. **Convert to video** using Convert to Video (9:16 aspect ratio, 6s duration)
4. **Download video** for Instagram Reels or TikTok

### Concept Mockup Iterations

1. **Upload initial concept** image
2. **Draw mask** over area to iterate
3. **Test variations** with different edit prompts (e.g., "Blue background" vs. "Gradient background")
4. Use **History Panel** to compare side-by-side
5. **Export final version** when satisfied

---

## Tips for Better Results

### Masking Best Practices

- **Mask slightly beyond edges** — A small buffer around your target area produces cleaner blends
- **Use a larger brush for large areas** — Speeds up masking and produces smoother edges
- **Erase mistakes instead of redrawing** — Use the Erase Brush to refine masks instead of starting over

### Prompt Engineering for Image Edits

- **Be specific about style** — "Photorealistic office with modern furniture" beats "office background"
- **Describe lighting** — "Soft natural lighting from the left" helps AI match the rest of the image
- **Mention what NOT to change** — "Keep the person unchanged, replace only the background"
- **Use negative prompts** — Add a negative prompt to exclude unwanted elements (e.g., "no text, no watermarks")

### Video Generation Tips

- **Start with clean images** — Blurry or low-res images produce poor video results
- **Use Person Generation wisely** — Enable it for portraits, disable it for product or landscape shots
- **Test different seeds** — If the first video isn't quite right, change the seed value and regenerate
- **Keep duration short** — 4–6 second videos work best; longer videos can introduce artifacts

---

## Troubleshooting

**Image Studio won't load?**
Clear your browser cache and try again. Image Studio uses WebGL, so ensure your browser supports WebGL and hardware acceleration is enabled.

**Edits take a long time to process?**
Processing time depends on image size and server load. Large images (over 2000x2000px) may take 20–30 seconds. Try downsizing the image first if speed is critical.

**Masking doesn't appear on dark images?**
Change the mask color using the Color Picker in the toolbar. The default blue mask can be hard to see on dark backgrounds.

**Video generation fails or times out?**
Check that your image is under 20 MB and meets minimum dimensions (at least 512x512px). If it still fails, try reducing the duration or sample count.

**Export quality is poor?**
Ensure you're selecting PNG for lossless quality or setting JPG quality to 90+. WEBP offers the best compression-to-quality ratio for modern browsers.

**Undo doesn't work?**
History is limited to the current session. If you've refreshed the page or navigated away, previous edit states are lost. Use bookmarks to preserve editing states.

---

## Next Steps

- [Use Image Studio in Agents](/guide/agents) to create custom agent avatars
- [Generate Images in Workflows](/guide/workflows) to automate visual content creation
- [Create Product Photos in Campaigns](/guide/campaigns) to collect visual feedback from consumers
- [Learn More About the Canvas](/guide/home) for advanced chat techniques
