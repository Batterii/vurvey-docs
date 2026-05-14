---
title: Brand Companions
---

# Brand Companions

Brand Companions is an admin-only workspace area for managing published Brand Companion agents and their developer API access. In current `vurvey-web-manager` master, the route group is `/brand-companions/*`.

![Developer API Apps](/screenshots/brand-companions/02-developer-api-apps.png?optional=1)

## Access

Brand Companions checks the current user's admin role. Non-admin users are redirected to the workspace home page.

The child routes are:

| Route | Page |
|---|---|
| `/brand-companions` | Redirects to `/brand-companions/agents` |
| `/brand-companions/agents` | Brand Companions grid |
| `/brand-companions/agents/:personaId/metrics` | Metrics for one companion |
| `/brand-companions/api-management` | Developer API Apps |

## Brand Companions Grid

The **Brand Companions** tab lists AI personas flagged as Brand Companions.

If there are none, the page shows:

`No Brand Companions`

`Brand Companions will appear here once they are created.`

When companions exist, each card represents a Brand Companion persona. Cards can also expose API app management for a companion when API Management is enabled.

## Metrics

Opening a companion metrics route shows performance metrics for a specific persona. The metrics area includes the persona header and completion-rate chart components.

Use this page to review whether a companion is being completed successfully by users over time.

## Developer API Apps

The **Developer API Apps** tab manages API credentials for Brand Companion and developer integrations.

If API Management is not enabled for the workspace, the page shows an **API Management** empty state that tells users to contact a Vurvey administrator.

When enabled, the page supports:

- sorting API apps
- opening **API Docs**
- creating an API app with **Create API App**
- viewing client IDs, API keys, and whitelisted domains
- adding, editing, and removing whitelisted domains
- revoking or regenerating credentials when the app type allows it
- deleting API apps

## Whitelisted Domains

Public Brand Companion apps require allowed domains. The UI warns that a Brand Companion can be inaccessible until whitelisted domains are configured.

Use exact domains that will host or embed the companion experience.

## Troubleshooting

| Issue | What to check |
|---|---|
| Brand Companions redirects home | The user is not an admin role |
| No companions appear | No personas are flagged as Brand Companions for the workspace |
| API Management is disabled | The workspace needs `apiManagementEnabled` |
| Companion is inaccessible | Confirm whitelisted domains are configured for its API app |

## Related Guides

- [Agents](/guide/agents)
- [Branding](/guide/branding)
- [Canvas & Image Studio](/guide/canvas-and-image-studio)
- [Settings](/guide/settings)
