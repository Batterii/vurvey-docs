---
title: Mentions
---

# Mentions

Mentions is an admin-only workspace area for community-inspired brand content and emerging topic exploration. In current `vurvey-web-manager` master, the mounted routes are `/mentions` and `/mentions/magic-topics`.

![Magic Topics](/screenshots/mentions/02-magic-topics.png?optional=1)

## Access

The Mentions page checks the current user's admin role. Non-admin users are redirected back to the workspace home page.

If you should have access but cannot open Mentions, ask a workspace administrator to confirm your role.

## All Mentions

The **All mentions** tab reuses the brand Reviews experience. It shows community-inspired content directed to the brand.

When review content exists, the page can show:

- brand feedback questions
- response cards for the active question
- the **Unreviewed Only** filter
- transcript review actions
- create-reel actions for review responses

When nothing has been collected yet, the page shows the same no-review empty state used by Branding Reviews.

## Magic Topics

The **Magic Topics** tab is currently a real mounted page with a coming-soon empty state:

`Identify important themes and topics that people are talking about the most. Coming soon.`

Do not treat it as a fully released analysis workflow yet.

## Practical Uses

- Review brand-directed feedback before it is turned into external material
- Find responses that should become reels or highlight clips
- Track which feedback questions have unreviewed responses
- Confirm whether Magic Topics is available for the workspace

## Troubleshooting

| Issue | What to check |
|---|---|
| Mentions redirects home | The current user is not an admin role |
| All mentions is empty | No brand feedback responses have been collected yet |
| Magic Topics has no data | The page is currently a coming-soon empty state |

## Related Guides

- [Branding](/guide/branding)
- [Reels](/guide/reels)
- [Campaigns](/guide/campaigns)
