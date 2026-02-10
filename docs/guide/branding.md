# Branding

The Branding section lets you build and manage your brand profile, collect feedback through custom questions, review video responses, and create video reels from consumer feedback. Access Branding from the workspace dropdown menu in the header.

![Brand Settings](/screenshots/branding/01-brand-settings.png)

## Overview

The Branding area helps you:
- Define your brand identity (name, description, logo, colors, categories)
- Create custom feedback questions for your community
- Review video responses from brand feedback surveys
- Turn consumer testimonials into shareable reels

::: info API Terminology
In the codebase, **Brand** corresponds to the `brands` table. Brand profile operations use GraphQL mutations like `UPDATE_BRAND`, `CREATE_BRAND_LOGO`, and `CREATE_FEEDBACK_QUESTION`.
:::

## Navigation

The Branding section includes four tabs:

| Tab | Route | Purpose |
|-----|-------|---------|
| **Brand Settings** | `/:workspaceId/branding` | Edit brand profile, logo, colors, categories |
| **Reviews** | `/:workspaceId/branding/reviews` | View video review responses and create reels |
| **Reels** | `/:workspaceId/branding/reels` | Manage brand reels created from reviews |
| **Questions** | `/:workspaceId/branding/questions` | Create and manage feedback questions |

## Brand Settings

The Brand Settings tab is your brand's home base — where you define your visual identity, positioning, and core attributes.

### Basic Information

**Brand Name**
- Your brand's display name
- Appears throughout the platform when referencing your brand
- Keep it consistent with your public brand name

**Description**
- A brief summary of what your brand represents
- Helps agents and team members understand your brand positioning
- 200-500 characters recommended

**URL**
- Your brand's web address (e.g., `yourbrand.com`)
- Must be unique across the Vurvey platform

::: warning Unique URL Constraint
If you see an error when saving, another brand may already be using that URL. Try a variation like `shop.yourbrand.com` or `www.yourbrand.com`.
:::

### Visual Identity

**Brand Logo**
- Upload your primary logo (PNG, JPG, or SVG recommended)
- Displayed on brand profile pages and in brand-related features
- Square or horizontal logos work best

**Brand Banner**
- Upload a banner image for your brand profile header
- Recommended dimensions: 1200x400 pixels
- Use high-quality images that represent your brand aesthetic

**Brand Colors**
Define your brand's color palette (up to 4 colors):

| Color Slot | Purpose | Example Use |
|------------|---------|-------------|
| **Primary** | Main brand color | Buttons, highlights, key UI elements |
| **Secondary** | Supporting color | Accents, secondary actions |
| **Tertiary** | Third color in palette | Additional visual variety |
| **Quaternary** | Fourth color | Extended palette for design flexibility |

Enter colors as hex codes (e.g., `#6366F1`) or use the color picker to select visually.

::: tip Building a Cohesive Palette
Your color palette should:
- Match your existing brand guidelines
- Include at least one high-contrast color for readability
- Work well together when used in combination
- Be consistent across all your brand assets
:::

### Brand Attributes

**Categories**
Select the product or service categories your brand operates in. Categories help position your brand and enable better filtering and discovery. Examples:
- Beauty & Personal Care
- Food & Beverage
- Fashion & Apparel
- Technology & Electronics
- Health & Wellness

**Benefits**
Add the key benefits your brand provides to consumers. Each benefit should be a short phrase:
- "Sustainable packaging"
- "Clinically tested"
- "Cruelty-free"
- "Made in the USA"
- "100% natural ingredients"

Click **+ Add Benefit** to add a new benefit. Click the **X** to remove a benefit.

**Activities**
Describe the activities or experiences your brand enables:
- "Daily skincare routine"
- "Outdoor adventures"
- "Healthy cooking"
- "Professional productivity"
- "Family bonding"

**Countries**
Select the countries where your brand operates or is available. This helps with regional targeting and market segmentation.

### Brand Profile Completeness

As you fill in brand information, a completeness indicator shows how much of your profile is filled out. A complete profile includes:
- Name, description, and URL
- Logo and banner images
- All four brand colors defined
- At least 3 categories selected
- At least 5 benefits listed
- At least 3 activities defined
- At least 1 country selected

## Reviews

![Brand Reviews](/screenshots/branding/02-reviews.png)

The Reviews tab displays video responses collected from brand feedback surveys.

### Viewing Reviews

Each review card shows:
- **Video thumbnail** — preview frame from the response
- **Respondent name** — who submitted the review (if available)
- **Question** — which feedback question this answers
- **Timestamp** — when the review was submitted
- **Duration** — video length

Click any review card to watch the full video response.

### Creating Reels from Reviews

Turn compelling consumer feedback into shareable reels:

1. Select one or more review videos using the checkboxes
2. Click **Create Reel** (appears when selections are made)
3. The system creates a new reel and automatically:
   - Publishes the reel
   - Shares it with your brand
   - Makes it available in the Reels tab

::: tip Selecting Great Review Content
Look for reviews that:
- Tell a compelling story or make an emotional connection
- Demonstrate clear product benefits or use cases
- Feature authentic, enthusiastic consumer voices
- Are well-lit and have good audio quality
- Are 15–60 seconds in length (ideal for social sharing)
:::

### Review Filters

- **Question filter** — Show only responses to a specific feedback question
- **Date range** — Filter by when reviews were submitted
- **Unreviewed only** — Show reviews you haven't processed yet

## Reels

![Brand Reels](/screenshots/branding/03-reels.png)

The Reels tab displays all video reels associated with your brand, including those created from review responses and manually uploaded reels.

### Reel Management

Each reel card shows:
- **Thumbnail** — preview image from the reel
- **Title** — reel name
- **Duration** — total length
- **Clip count** — how many individual clips are in the reel
- **Status** — Published, Unpublished, Pending (transcoding), or Failed
- **Share status** — whether it's publicly shared

**Reel Actions:**
- **Play** — Watch the reel
- **Edit** — Open the reel editor to add/remove/reorder clips
- **Share** — Generate a shareable link or configure sharing settings
- **Delete** — Remove the reel

::: info Reel Transcoding
After creating or editing a reel, it enters a **Pending** state while the system combines and processes the video clips. This usually takes 30 seconds to 2 minutes depending on reel length. The status updates to **Created** when ready, or **Failed** if there was an issue.
:::

### Sharing Reels

Click **Share** on any reel to configure public access:

**Sharing Options:**
- **Link sharing** — Generate a public URL anyone can view
- **Display mode** — Control how the reel appears when shared
- **Password protection** — Require a password to view the reel
- **Embed code** — Get code to embed the reel on your website

Public reel links use the format: `https://your-domain.com/share/:reelId`

## Feedback Questions

![Brand Questions](/screenshots/branding/04-questions.png)

The Questions tab lets you create and manage custom feedback questions for your brand community.

::: warning OpenFGA Permission Required
Access to the Questions tab requires the appropriate OpenFGA permission (`can_manage` on brand questions). If you see a permission denied message, contact your workspace administrator.
:::

### Question List

All feedback questions appear in a list showing:
- **Question text** — the prompt consumers see
- **Question type** — Video, Text, Choice, etc.
- **Order** — position in the feedback survey flow
- **Status** — Active or Inactive

**Question Actions:**
- **Edit** — Modify the question text or settings
- **Reorder** — Drag to change the question sequence
- **Delete** — Remove the question (blocked if responses exist)
- **Duplicate** — Create a copy to use as a template

### Creating a Feedback Question

1. Click **+ Create Question**
2. Enter your question text
3. Select a question type:
   - **Video** — Consumers record a video response
   - **Text** — Open-ended text response
   - **Choice** — Multiple choice or rating
4. Configure question-specific settings (e.g., video duration limit, choice options)
5. Save the question

**Good Feedback Questions:**
- "What's your favorite thing about [Brand Name]?"
- "How did you first discover our brand?"
- "Tell us about a time when [Product] made your day better."
- "If you could change one thing about our products, what would it be?"
- "Show us how you use [Product] in your daily routine."

::: tip Video Question Best Practices
- Keep prompts open-ended to encourage authentic stories
- Suggest a time limit (30-60 seconds works well)
- Ask about specific experiences rather than general opinions
- Frame questions positively to elicit enthusiastic responses
- Test the question yourself before publishing — would you want to answer it on video?
:::

### Question Ordering

The order of questions determines the sequence consumers see them. Drag questions up or down to reorder. Save your changes to apply the new order.

**Typical Question Flow:**
1. Warm-up question (easy, low-stakes)
2. Core questions (main feedback topics)
3. Demographic or segmentation questions (if needed)
4. Closing question (future engagement or testimonial)

### Deleting Questions

::: danger Cannot Delete Questions with Responses
If consumers have already answered a feedback question, you cannot delete it. This preserves data integrity. To retire a question, deactivate it instead.
:::

## Common Workflows

### Setting Up a New Brand Profile

1. Navigate to **Brand Settings**
2. Enter brand name, description, and URL
3. Upload logo and banner images
4. Define your 4-color palette
5. Select categories, add benefits and activities
6. Choose countries where your brand operates
7. Save your profile

### Collecting Video Feedback

1. Go to **Feedback Questions**
2. Create 3–5 video questions focused on different aspects of your brand
3. Order questions from easiest to most thoughtful
4. Launch a feedback campaign targeting your brand community
5. As responses come in, review them in the **Reviews** tab
6. Select the best responses and create reels

### Creating a Testimonial Reel

1. Go to **Reviews**
2. Filter to the question: "What would you tell a friend about [Brand]?"
3. Watch responses and select 4–6 compelling testimonials
4. Click **Create Reel**
5. The system auto-publishes and shares the reel to your brand
6. Go to **Reels** tab and click **Share** to get a public link
7. Use the link on your website, social media, or in email campaigns

## Troubleshooting

**URL already in use error?**
Brand URLs must be unique across all of Vurvey. Try adding `www.` or `shop.` as a prefix, or use a subdomain.

**Can't delete a feedback question?**
Questions that have been answered cannot be deleted. Deactivate the question instead to hide it from new surveys.

**Reel stuck in "Pending" status?**
Video transcoding usually takes 30 seconds to 2 minutes. If a reel is pending for more than 5 minutes, there may be a processing issue. Try deleting and recreating the reel. If the issue persists, contact support.

**Reviews not appearing?**
Make sure:
- The feedback campaign is published and has received responses
- You have the correct permissions to view brand reviews
- You're filtering by the right question or date range

**Can't access Questions tab?**
The Questions tab requires OpenFGA manage permission on brand questions. Contact your workspace administrator to request access.

**Colors not saving?**
Verify you're entering valid hex color codes (e.g., `#6366F1`). Use the color picker if you're unsure. Make sure to click **Save** after making changes.

**Logo or banner upload fails?**
Check the file format (PNG, JPG, SVG recommended) and file size (under 5 MB). Compress large images before uploading.

## Next Steps

- [Create campaigns to collect feedback](/guide/campaigns)
- [Manage video content with Reels](/guide/reels)
- [Configure workspace settings](/guide/settings)
- [Learn about the People module](/guide/people)
