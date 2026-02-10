# Canvas & Image Studio

The Canvas is Vurvey's main AI chat interface — your primary workspace for conversations with AI agents. The Image Studio is an integrated AI-powered image editor accessible from within the Canvas, offering advanced image manipulation capabilities.

::: info What is "Canvas"?
Despite the name, Canvas is **not** a design tool — it's the conversational AI interface you use for research and analysis. Think of it as your "home base" for AI interactions. The term comes from the idea of a blank canvas where you can create anything through conversation.
:::

## Canvas Overview

The Canvas provides:
- **AI chat interface** — the primary way to interact with agents
- **Perlin Sphere animation** — the animated 3D sphere on the welcome screen
- **Prompt Showcase** — pre-built prompt cards for common tasks
- **Image Studio** — full AI image editor (covered in detail below)

For complete details on using the Canvas chat interface, see the [Home](/guide/home) guide.

## Perlin Sphere Animation

![Home Screen with Sphere](/screenshots/home/03-after-login.png)

The Perlin Sphere is the animated 3D WebGL sphere that appears on the Home screen when you first log in. It provides visual interest and brand identity.

### Configuration

Workspace administrators can configure the sphere in **Settings → General**:

| Setting | Options |
|---------|---------|
| **Enable/Disable** | Turn the animation on or off |
| **Visual Style** | Color schemes, animation speed, particle density |
| **Performance** | Auto-adjust based on device capabilities |

The sphere automatically adapts to your device's performance — it may simplify or disable itself on lower-powered devices to maintain responsiveness.

## Prompt Showcase

The Prompt Showcase displays 9 pre-built prompt cards on the welcome screen, designed to help you get started quickly with common research tasks.

**Example Showcase Cards:**
- **Twitter/X Analysis** — "Analyze trending conversations about [topic] on Twitter"
- **Instagram Trends** — "What are the top visual trends on Instagram for [category]?"
- **YouTube Research** — "Summarize the key themes in YouTube comments about [product]"
- **Survey Analysis** — "What are the main themes in our latest customer feedback?"
- **Competitive Intelligence** — "Compare our positioning to [Competitor A, B, C]"
- **Content Ideation** — "Generate 10 blog post ideas based on our latest consumer research"
- **Market Sizing** — "Estimate the market size for [category] based on available data"
- **Trend Forecasting** — "What consumer trends should we watch in [industry]?"
- **Persona Development** — "Build a detailed persona for our core customer segment"

Click any card to load that prompt into the chat input. You can then edit it before sending or use it as-is.

## Image Studio

The Image Studio is a powerful AI image editor integrated directly into the Canvas. Access it from within chat conversations when working with images.

### Core Capabilities

The Image Studio provides five main operations, all powered by AI:

| Operation | Technology | What It Does |
|-----------|-----------|--------------|
| **Enhance Image** | Replicate AI | Improve image quality, clarity, and detail |
| **Upscale Image** | Recraft AI (via Replicate) | Increase resolution while maintaining quality |
| **Change/Edit Image** | Mask-based editing | Modify specific parts of an image using text prompts |
| **Remove Selection** | Same as Edit (empty prompt) | Remove unwanted elements from an image |
| **Convert to Video** | Google Veo 3.1 | Transform a still image into a short video |

::: info REST API Endpoints
Image Studio operations use REST endpoints rather than GraphQL. The backend routes are:
- `/rest/enhance` — Image enhancement
- `/rest/upscale` — Image upscaling
- `/rest/imgeditor` — Image editing and removal
:::

### Enhance Image

Improve the overall quality of an image without changing its content.

**Best for:**
- Low-quality photos that need sharpening
- Images with poor lighting or exposure
- Scanned documents that need cleanup
- Product photos that look dull or flat

**How to use:**
1. Upload or generate an image in chat
2. Click **Enhance** in the Image Studio toolbar
3. The AI processes the image (usually 10–30 seconds)
4. Review the enhanced version
5. Accept or try again with different settings

**What gets enhanced:**
- Sharpness and detail
- Color vibrancy and balance
- Contrast and tonal range
- Noise reduction

### Upscale Image

Increase image resolution while maintaining or improving quality.

**Best for:**
- Making small images suitable for print
- Enlarging product photos for high-res displays
- Creating billboard or poster versions of images
- Improving image quality for presentations

**How to use:**
1. Select an image in the Image Studio
2. Click **Upscale**
3. Choose a scale factor (2x, 4x, 8x)
4. The AI generates a higher-resolution version

**Typical results:**
- **2x upscale** — 1000x1000px → 2000x2000px
- **4x upscale** — 1000x1000px → 4000x4000px
- **8x upscale** — Limited to certain source resolutions

::: warning File Size Increases
Upscaling significantly increases file size. A 500 KB image upscaled 4x may become 5–10 MB. Consider your storage and bandwidth needs before upscaling many images.
:::

### Change/Edit Image

Modify specific parts of an image using AI-powered mask-based editing.

**Best for:**
- Changing product colors or styles
- Replacing backgrounds
- Adding or removing objects
- Modifying clothing, accessories, or props
- Adjusting lighting or atmosphere in specific areas

**How to use:**
1. Select an image in the Image Studio
2. Click **Edit** (or **Change**)
3. Use the brush tool to mask the area you want to change
4. Enter a text prompt describing the change (e.g., "blue sweater" or "outdoor park background")
5. Click **Apply**
6. The AI processes your edit (30–60 seconds)
7. Review the result and refine if needed

**Edit Prompt Tips:**
- Be specific: "navy blue winter coat" works better than "different color"
- Describe the desired result, not the action: "sunset sky" not "change to sunset"
- Mention style if relevant: "photorealistic forest background" or "hand-drawn sketch style"
- Keep prompts under 50 words for best results

**Editing Tools:**
- **Draw brush** — Mark areas to edit
- **Erase brush** — Remove mask areas
- **Brush size picker** — Adjust brush size for fine or broad selection
- **Reset** — Clear the mask and start over

### Remove Selection

Delete unwanted elements from an image.

**Best for:**
- Removing background distractions
- Cleaning up product photos
- Deleting watermarks or logos
- Eliminating people or objects from scenes

**How to use:**
1. Select an image
2. Click **Remove**
3. Mask the area to remove
4. Click **Apply** (no text prompt needed — leaving it empty triggers removal)
5. The AI fills in the removed area with contextually appropriate content

**Best results when:**
- The area to remove has a simple background
- The surrounding context is clear
- You're removing smaller objects rather than large portions of the image
- The image has good lighting and contrast

### Convert to Video

Turn a still image into a short animated video using Google's Veo 3.1 model.

**Best for:**
- Creating social media content from product images
- Adding motion to concept visuals
- Generating video mockups for campaigns
- Turning mood boards into animated sequences

**How to use:**
1. Select an image in the Image Studio
2. Click **Convert to Video**
3. Configure video settings (see below)
4. Enter an optional prompt describing the desired motion or scene
5. Click **Generate**
6. Wait for processing (1–3 minutes depending on duration and settings)
7. Preview the generated video

### Video Configuration Options

| Setting | Options | Description |
|---------|---------|-------------|
| **Duration** | 4s, 6s, 8s | Length of the generated video |
| **Aspect Ratio** | 16:9, 9:16 | Landscape or portrait orientation |
| **Sample Count** | 1–4 | Number of video variations to generate |
| **Person Generation** | On/Off | Allow the AI to add or animate people in the scene |
| **Negative Prompt** | Text field | Describe what you don't want (e.g., "no text, no logos") |
| **Seed** | Number | For reproducible results (use the same seed to get similar output) |

**Video Prompt Tips:**
- Describe movement: "camera slowly zooms in" or "waves gently rolling"
- Set the mood: "calm and serene" or "energetic and dynamic"
- Specify camera motion: "pan left to right" or "dolly forward"
- Mention transitions: "fade from day to night" or "gradual color shift to warmer tones"

**Video Generation Status:**
- **PENDING** — Queued for processing
- **PROCESSING** — Currently generating (1–3 minutes)
- **COMPLETED** — Ready to preview and download
- **FAILED** — Something went wrong (try again with simpler settings)

The system polls for status updates every 3 seconds while processing.

## Image Studio UI

The Image Studio interface includes:

### Toolbar

Located at the top of the Image Studio panel:
- **Enhance** — Improve image quality
- **Upscale** — Increase resolution
- **Change/Edit** — Modify specific areas
- **Remove** — Delete unwanted elements
- **Convert to Video** — Generate video from image
- **Download** — Save the current image
- **Close** — Return to the main canvas

### Canvas Tools

When in Edit or Remove mode:
- **Draw brush** (pencil icon) — Paint the mask
- **Erase brush** (eraser icon) — Remove mask areas
- **Brush size slider** — Adjust brush diameter
- **Reset** (circular arrow) — Clear the entire mask

### History & Navigation

- **URL-based state management** — You can use browser back/forward buttons to navigate through edits
- **Undo/Redo** — Step backward and forward through your edit history
- **Version comparison** — Toggle between original and edited versions

## Image Studio Best Practices

### Workflow Tips

1. **Start with enhancement** — Improve image quality before making edits
2. **Upscale last** — Make all edits first, then upscale the final result to save processing time
3. **Iterate in steps** — Make one change at a time rather than trying to fix everything at once
4. **Save intermediate versions** — Download versions you like before continuing to edit
5. **Use specific prompts** — Detailed descriptions produce better results than vague ones

### Performance Optimization

- **Image size** — Larger images take longer to process. Start with medium-resolution images (1000–2000px) and upscale only when needed.
- **Sample count** — Generating multiple video samples multiplies processing time. Start with 1 sample and increase only if needed.
- **Browser tabs** — Keep only one Image Studio session open at a time for best performance.

### Quality Maximization

- **Source image quality** — Better source images produce better results. Start with well-lit, in-focus photos.
- **Mask precision** — Take time to create accurate masks. Clean masks produce cleaner edits.
- **Prompt detail** — Include lighting, style, and context in your prompts. "Sunset over ocean, warm golden hour lighting, photorealistic" beats "sunset."
- **Iteration** — Don't expect perfection on the first try. Refine your prompt and regenerate if needed.

## Common Use Cases

### Product Photography

**Scenario:** You have product photos with distracting backgrounds and want clean, professional images.

**Workflow:**
1. Upload the product photo
2. Use **Remove** to eliminate background distractions
3. Use **Change/Edit** to mask the background and replace it with a solid color or professional backdrop
4. Use **Enhance** to improve lighting and sharpness
5. Use **Upscale** to increase resolution for print materials
6. Download the final image

### Social Media Content

**Scenario:** Create animated social media posts from still images.

**Workflow:**
1. Upload or generate a concept image
2. Use **Enhance** to improve visual quality
3. Use **Convert to Video** with settings:
   - Duration: 6s (optimal for social platforms)
   - Aspect ratio: 9:16 (Instagram Stories, TikTok)
   - Motion prompt: "Slow zoom in with subtle color shimmer"
4. Generate and download the video
5. Post directly to social media

### Concept Visualization

**Scenario:** You have a rough concept sketch and want to create multiple polished variations.

**Workflow:**
1. Upload the sketch
2. Use **Enhance** to sharpen and clarify
3. Use **Change/Edit** to modify specific elements (colors, styles, details)
4. Generate multiple variations by changing the prompt
5. Compare results and select the best direction
6. Use **Upscale** on the winning concept for presentation

## Troubleshooting

**Image Studio won't load?**
Refresh the page and try again. Clear your browser cache if the issue persists. The Image Studio requires a stable internet connection.

**Edit changes the wrong part of the image?**
Refine your mask to be more precise. Use a smaller brush size for detailed selections. Make sure your text prompt clearly describes what the masked area should become.

**Video generation fails?**
Try simpler settings: shorter duration, single sample, simpler motion prompt. Very complex prompts or unusual aspect ratios may fail. Start simple and add complexity gradually.

**Generated video doesn't match prompt?**
Video generation is less predictable than image editing. Try:
- Simplifying your prompt
- Being more specific about camera movement
- Using a different seed value
- Generating multiple samples and selecting the best result

**Upscaled image looks blurry or distorted?**
The source image may be too low quality to upscale successfully. Try enhancing first, then upscaling. Avoid upscaling images that are already heavily compressed.

**Processing takes too long?**
Image operations typically complete in 30–60 seconds. Video generation takes 1–3 minutes. If processing exceeds 5 minutes, refresh and try again. Large images and complex prompts take longer.

**Can't download the edited image?**
Make sure the operation has completed (status shows "Complete"). Click the **Download** button in the toolbar. If the download doesn't start, try right-clicking the image and selecting "Save image as."

## Next Steps

- [Learn about the Canvas chat interface](/guide/home)
- [Create visual content with agents](/guide/agents)
- [Generate images in workflows](/guide/workflows)
- [Share visual assets through campaigns](/guide/campaigns)
