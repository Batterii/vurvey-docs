# Branding

Branding in Vurvey lets you configure your company's brand profile, manage feedback questions, collect video reviews, and create branded reels from customer testimonials. Think of it as your brand's home base within the platform — the place where you define who you are, what you stand for, and how you engage with your audience.

::: info API Terminology
In the Vurvey API, branding features are represented as `Brand` models. The frontend's "Branding" section maps to the backend's `brands` table and related GraphQL operations.
:::

## Why Use Branding?

Whether you're collecting product feedback from customers, creating video testimonials for marketing, or building a library of authentic consumer responses, the Branding section centralizes all brand-related activities:

- **Define your brand identity** — Set your brand name, logo, banner, colors, and categories
- **Collect authentic feedback** — Create custom feedback questions for your products or services
- **Manage video reviews** — View and organize customer video responses
- **Create branded reels** — Compile highlight reels from your best customer testimonials
- **Build brand profiles** — Document benefits, activities, and target countries for your brand

---

## Brand Settings

![Brand Settings](/screenshots/branding/01-brand-settings.png)

The Brand Settings page is where you configure your brand's core identity and profile information.

### Brand Identity

Configure the visual and descriptive elements that define your brand:

- **Brand Name** — Your official brand name (required)
- **Description** — A detailed description of your brand, products, and positioning
- **Logo** — Upload your brand logo (PNG, JPG, or SVG)
- **Banner** — Upload a header banner image for your brand profile
- **Brand Colors** — Define your brand's color palette:
  - **Primary Color** — Your main brand color
  - **Secondary Color** — Supporting brand color
  - **Tertiary Color** — Third accent color
  - **Quaternary Color** — Fourth accent color

::: tip Color Palette Strategy
A well-defined color palette ensures consistency across reels, campaigns, and visual outputs. Use your official brand guidelines to set these colors accurately.
:::

### Brand Profile Details

Define additional profile information:

| Field | Purpose | Example |
|-------|---------|---------|
| **Categories** | Product or service categories your brand operates in | Beauty & Personal Care, Sustainable Products, Luxury Goods |
| **Benefits** | Key benefits your brand delivers to customers | Clean Ingredients, Cruelty-Free, Dermatologist-Tested |
| **Activities** | Brand activities or offerings | Product Testing, Community Events, Educational Content |
| **Countries** | Markets where your brand operates | United States, Canada, United Kingdom, Australia |

::: tip Brand Profile Completeness
A complete brand profile improves AI-generated content quality. When agents or workflows reference your brand, they pull from this profile to ensure accurate, on-brand outputs.
:::

### Managing Benefits

Benefits are the value propositions your brand offers to customers:

- **Add a Benefit** — Click **+ Add Benefit** and enter a benefit statement
- **Remove a Benefit** — Click the X icon next to any benefit to remove it
- **Reorder Benefits** — Drag benefits to reorder by priority

**Example benefits:**
- "100% recyclable packaging"
- "Clinically proven results"
- "Made with organic ingredients"
- "Family-owned since 1985"
- "Carbon-neutral shipping"

---

## Reviews

![Reviews Page](/screenshots/branding/02-reviews.png)

The Reviews page displays video feedback responses collected from your feedback questions. This is where customers' authentic testimonials and product reactions appear after they submit video responses.

### How Reviews Work

1. **Create feedback questions** on the Questions tab
2. **Send questions to customers** via email, link, or campaign
3. **Customers record video responses** using their webcam or mobile camera
4. **Review videos appear here** after submission
5. **Create reels** from your favorite video clips

### Review Cards

Each review card shows:

- **Customer thumbnail** — A preview frame from the video
- **Customer name** — The respondent's name (if provided)
- **Response date** — When the video was submitted
- **Question answered** — Which feedback question this video responds to
- **Video duration** — Length of the video clip
- **Play button** — Click to watch the full video response

### Filtering Reviews

Use the filter bar to find specific reviews:

- **Question Filter** — Show reviews for a specific feedback question
- **Date Range** — Filter by submission date
- **Unreviewed Only** — Show only new reviews you haven't watched yet
- **Search** — Find reviews by customer name or keywords

### Creating Reels from Reviews

Select your best customer testimonials and turn them into a branded reel:

1. **Check the box** on each review you want to include
2. **Click "Create Reel"** at the top of the page
3. **Vurvey compiles selected clips** into a single video
4. **The reel auto-publishes** and becomes available on the Reels tab

::: tip Selecting Great Testimonials
Choose reviews that:
- Show genuine enthusiasm and emotion
- Clearly articulate product benefits
- Include specific details or stories
- Represent diverse customer perspectives
- Have good audio and video quality
:::

---

## Reels

![Reels Page](/screenshots/branding/03-reels.png)

The Reels page displays branded video compilations created from customer reviews. Reels are perfect for social media sharing, website embedding, or presenting customer feedback to stakeholders.

### Reel Status

Each reel goes through a processing lifecycle:

| Status | Meaning |
|--------|---------|
| **Unpublished** | Reel created but not yet processed |
| **Pending** | Video is being transcoded and compiled |
| **Created** | Reel is ready to view and share |
| **Failed** | Transcoding encountered an error |

::: warning Processing Time
Reel transcoding typically takes 1–3 minutes depending on the number of clips. You'll see a progress indicator while processing is active.
:::

### Viewing and Sharing Reels

Click any reel card to:

- **Play the video** — Watch the compiled testimonial reel
- **Share via link** — Copy a shareable link to the reel
- **Download** — Save the video file for offline use
- **Embed** — Get an embed code for your website
- **Delete** — Permanently remove the reel

### Reel Display Options

Configure how your reel appears when shared:

- **Display Mode** — Choose between Standard (with Vurvey branding) or Minimal (clean player)
- **Password Protection** — Require a password to view the reel
- **Allow Downloads** — Enable or disable video download for viewers

::: tip Sharing Reels Externally
When sharing reels outside your organization, enable password protection to control access. For public marketing use, use Minimal display mode for a clean, professional appearance.
:::

---

## Feedback Questions

![Feedback Questions](/screenshots/branding/04-questions.png)

The Questions page is where you create and manage custom feedback questions for your brand. These questions appear in feedback surveys you send to customers asking about their experience with your products or services.

### Creating a Feedback Question

1. Click **+ Create Question** in the top-right corner
2. **Write your question text** — Be specific and open-ended for richer responses
3. **Choose a question type** — Video, Text, Multiple Choice, or Rating
4. **Set options** (if applicable) — Add choices for multiple choice questions
5. **Save the question** — It becomes available to send to customers

::: tip Effective Feedback Questions
Ask questions that elicit stories and emotions:
- "What was your first impression when you tried our product?"
- "Can you describe a moment when our product made a difference for you?"
- "What would you tell a friend who's considering our brand?"

These open-ended prompts produce authentic, quotable testimonials.
:::

### Question Types

| Type | Best For | Example |
|------|----------|---------|
| **Video Response** | Authentic testimonials, detailed feedback | "Show us how you use our product in your daily routine" |
| **Text Response** | Quick feedback, written testimonials | "In one sentence, why do you recommend our brand?" |
| **Multiple Choice** | Structured feedback, satisfaction ratings | "Which product benefit matters most to you?" |
| **Star Rating** | Quantitative satisfaction scores | "Rate your overall experience with our brand" |

### Managing Questions

For each question, you can:

- **Edit** — Update the question text or options
- **Reorder** — Drag questions to change their sequence
- **Delete** — Remove a question permanently

::: warning Deleting Questions with Responses
If a question has existing video or text responses, deleting it will also remove those responses. Export or create reels from important responses before deleting questions.
:::

### Question Settings

Advanced options for each question:

- **Required** — Force respondents to answer before submitting
- **Max Response Time** — Set a time limit for video responses (30s, 1min, 3min, 5min)
- **Allow Retakes** — Let respondents re-record their video before submitting

---

## Common Workflows

### Collecting Product Feedback

1. **Set up your brand profile** with logo, colors, and description
2. **Create 3–5 feedback questions** focused on specific product benefits
3. **Send the feedback survey** via email or campaign link
4. **Review video responses** as they arrive on the Reviews tab
5. **Select the best testimonials** and create a branded reel
6. **Share the reel** with your marketing team or post to social media

### Building a Video Testimonial Library

1. **Create evergreen feedback questions** that work across product launches
2. **Send questions to customers** after purchase or interaction
3. **Organize reviews by product line** using the question filter
4. **Create themed reels** (e.g., "Clean Beauty Enthusiasts," "Results After 30 Days")
5. **Archive reels** in your media library for future campaigns

### Brand Profile Audits

1. **Review brand settings quarterly** to ensure accuracy
2. **Update colors and logo** when brand guidelines change
3. **Refresh benefit statements** to reflect new product features
4. **Add or remove countries** as you expand or exit markets
5. **Archive outdated feedback questions** and create new ones aligned to current priorities

---

## Tips for Better Brand Management

### Brand Profile Best Practices

- **Keep your brand description current** — Update it when you launch new product lines or reposition
- **Use hex codes for colors** — Precise color definitions ensure consistency across outputs
- **Upload high-resolution logos** — Minimum 500x500px for clarity in reels and exports
- **Document all benefits** — Even small differentiators help agents create on-brand content

### Feedback Question Strategy

- **Ask one thing per question** — Focused questions produce focused, usable responses
- **Use positive framing** — "What do you love about..." elicits better testimonials than "What's wrong with..."
- **Vary question types** — Mix video, text, and ratings for a balanced feedback dataset
- **Test questions internally** — Send to your team first to identify confusing wording

### Reel Creation Tips

- **Keep reels short** — 60–90 seconds is ideal for social sharing
- **Start with your best clip** — Hook viewers in the first 5 seconds
- **Show diversity** — Include different customer demographics and use cases
- **Add context** — Use text overlays or captions to frame each testimonial

---

## Troubleshooting

**Brand logo not appearing in reels?**
Ensure your logo file is under 5 MB and in PNG or JPG format. SVG logos may not render correctly in video transcoding. Try uploading a PNG version instead.

**Feedback question can't be deleted?**
Questions with existing responses cannot be deleted to preserve data integrity. If you need to retire a question, deactivate it from new surveys but keep it in your questions list.

**Reel status stuck on "Pending"?**
Transcoding can take up to 5 minutes for reels with many clips. If a reel stays in Pending for more than 10 minutes, try refreshing the page. If it's still pending, check that all included video clips uploaded successfully.

**Video reviews not showing up?**
Verify that:
1. The feedback question is published and sent to respondents
2. Respondents have access to the survey link
3. Video uploads aren't being blocked by firewall or browser permissions
4. The question type is set to "Video Response" (not Text or Multiple Choice)

**Colors not matching brand guidelines?**
Make sure you're using exact hex codes from your brand guidelines. RGB values can vary across displays, but hex codes ensure consistency. Use a color picker tool to extract hex codes from your official brand assets.

---

## Next Steps

- [Create Campaigns](/guide/campaigns) to send feedback questions to customers
- [Build Agents](/guide/agents) that reference your brand profile for on-brand content
- [Use Reels in Workflows](/guide/workflows) to automate video testimonial compilation
- [Manage Settings](/guide/settings) to configure workspace-level branding options
