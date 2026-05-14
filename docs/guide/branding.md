---
title: Branding
---

# Branding

Branding is the workspace area for brand identity, review moderation, and brand feedback questions. In current `vurvey-web-manager` master, the mounted routes are `/branding`, `/branding/reviews`, and `/branding/questions`.

![Brand Settings](/screenshots/branding/01-brand-settings.png?optional=1)

## Opening Branding

Use the workspace navigation to open **Branding**. The page header is **Branding**, with child pages for brand settings, reviews, and questions.

## Brand Settings

The default Branding route contains the brand profile form.

| Field or Section | Purpose |
|---|---|
| **Brand banner** | Upload or replace the banner image. The UI recommends `960x240` |
| **Brand logo** | Upload or replace the square logo. The UI recommends `100x100` |
| **Name** | Brand display name |
| **Description** | Brand overview used by brand-facing experiences |
| **Activities** | Multi-select activity attributes |
| **Benefits** | Multi-select benefit attributes |
| **Primary Category** | Main brand category |
| **Secondary Categories** | Additional brand categories |
| **Origin country** | Brand origin country |
| **Target Countries** | Market targeting countries |
| **Colors** | Primary, secondary, tertiary, and quaternary brand colors |

The preview card updates from the selected colors so you can check how brand styling will look before saving. Click **Save Changes** when updates are ready.

Vurvey employees can also see **Brand Companion Themes**, which generates and previews theme colors for Brand Companion experiences.

## Reviews

![Brand Reviews](/screenshots/branding/02-brand-reviews.png?optional=1)

The Reviews page displays responses to the brand feedback survey. It is shared with the Mentions review surface.

When responses exist, reviewers can:

- select a feedback question
- filter with **Unreviewed Only**
- open a response transcript
- create a reel from a review response
- mark responses reviewed through the review flow

If there are no review responses, the page shows **There are no reviews yet**.

## Questions

The Questions page manages the feedback questions attached to the brand survey. It is wrapped in OpenFGA survey permissions, so users without access can be blocked from editing.

The current page supports:

- **+ New Question**
- editing question text and points through feedback cards
- moving questions
- deleting questions that do not have answers

The page also shows the note: `* You cannot delete questions that have answers to them`.

## Troubleshooting

| Issue | What to check |
|---|---|
| Save Changes is disabled | Make sure a brand field changed and logo/banner processing is complete |
| Reviews are empty | The brand survey may not have received responses yet |
| Questions cannot be edited | Confirm survey permissions for the user |
| Brand Companion Themes is missing | That section is limited to Vurvey users |

## Related Guides

- [Campaigns](/guide/campaigns)
- [Reels](/guide/reels)
- [Mentions](/guide/mentions)
- [Brand Companions](/guide/brand-companions)
