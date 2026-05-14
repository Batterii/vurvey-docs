---
title: Account & Profile
---

# Account & Profile

The Account area is where each signed-in user manages their own profile, connected services, display preferences, and terms access. In current `vurvey-web-manager` master, the workspace-scoped routes are `/me`, `/me/integrations`, and `/me/terms-of-service`.

![Personal Profile](/screenshots/account/01-personal-profile.png?optional=1)

## Opening Your Profile

Click your avatar or name at the bottom of the app sidebar, then open **Personal Profile**.

The profile page uses a sub-navigation header labeled **Personal Profile**. In standard workspace mode, the tabs are:

| Tab | Route | What it contains |
|---|---|---|
| **General Settings** | `/me` | Profile image, personal information, dark mode, and delete-account controls |
| **Integrations** | `/me/integrations` | Third-party connection hub when `composioEnabled` is enabled |
| **Terms of Service** | `/me/terms-of-service` | Vurvey terms text inside the app |

Guest mode hides the tab strip and limits the profile surface.

## General Settings

The General Settings tab is focused on the current user, not the workspace.

| Section | What you can do |
|---|---|
| **Profile Image** | Open the shared picture editor and update your avatar |
| **Personal Information** | Edit first name, last name, gender, birthdate, city, and country |
| **Dark Mode** | Toggle the dark theme for your account when guest mode is off |
| **Delete Your Account** | Open a confirmation modal for permanent account deletion |

Personal information edits use **Save** and **Cancel** buttons. Required indicators can appear when complete-profile prompting is enabled.

::: warning Account Deletion
The **Delete my account** action is destructive. It opens a confirmation modal before deletion, logs the user out, and sends the browser back to the app origin after completion.
:::

## Integrations Tab

The Integrations tab is the same connection hub documented in [Integrations](/guide/integrations). It only appears when the workspace has `composioEnabled` enabled.

Use it to connect or disconnect supported tools through OAuth, API key, or bearer-token flows.

## Terms of Service

The Terms of Service tab renders the in-app legal text. It is useful when users need to review account terms without leaving Vurvey.

## Troubleshooting

| Issue | What to check |
|---|---|
| Integrations tab is missing | Confirm the workspace has `composioEnabled` enabled |
| Country dropdown is disabled | Wait for country options to finish loading |
| Save is disabled | Check whether profile fields changed and whether required fields are valid |
| Dark mode toggle is missing | Guest mode may be active |

## Related Guides

- [Integrations](/guide/integrations)
- [Settings](/guide/settings)
- [Logging In](/guide/login)
