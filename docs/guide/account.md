---
title: Account & Profile
---

# Account & Profile

The **Personal Profile** area is where every signed-in Vurvey user manages their own identity (name, gender, birthdate, location), avatar, personal preferences (dark mode), connected services (Composio integrations, when enabled), and account-deletion. It is _per-user_ data — not per-workspace, not per-organization — so changes here follow you across every workspace you belong to.

The header on the page reads **Personal Profile** (not "Account"). The route group is `/me/*`. The browser tab title is **Vurvey - Personal Profile**.

> 📷 _Screenshot pending: Personal Profile — General Settings_
> 📷 _Screenshot pending: Edit Picture modal_
> 📷 _Screenshot pending: Personal Information form_
> 📷 _Screenshot pending: Integrations tab (Composio-enabled workspaces)_
> 📷 _Screenshot pending: Terms of Service tab_
> 📷 _Screenshot pending: Delete Account confirmation modal_

---

## How to open it

Click your avatar at the bottom of the left sidebar → **Personal Profile** in the popup menu. Or type `/me` directly.

The page mounts under a sub-navigation header labelled **Personal Profile** with a button group of tabs.

---

## The three tabs

| Tab | Route | Icon | When visible |
|---|---|---|---|
| **General Settings** | `/me` | Settings gear | Always (default landing). |
| **Integrations** | `/me/integrations` | Linked services | Only when `workspace.composioEnabled` is true for the active workspace. |
| **Terms of Service** | `/me/terms-of-service` | Notes/edit | Always. |

::: warning Guest mode hides the entire tab strip
When a user is in **guest mode** for the active workspace (`shouldUseGuestMode = true`), the entire button group is hidden. A guest still sees the Personal Profile sub-navigation header and the body content of the General Settings tab (with Dark Mode also hidden — see below), but cannot navigate to Integrations or Terms of Service from the tab strip. Guest mode is set by the workspace context and signals limited-access user states.
:::

---

## General Settings (`/me`)

The General Settings tab is broken into four `OptionRow` sections separated by horizontal rules.

### 1. Profile Image

Description: _"Customize your profile by uploading an image. This picture will represent you across the platform, helping others to recognize and connect with you."_

- **Avatar preview** — `Avatar` component, `size="md"`. Falls back to your first-name initial if no picture is set.
- **Edit** button (outlined) — opens the **Edit Picture Modal**.

#### Edit Picture Modal

- Title: **Profile Image**
- Description: _"Customize your profile by uploading an image."_
- A shared component used elsewhere in the app (brand picture, etc.) — supports upload, crop, and zoom.
- On save, runs the `CREATE_USER_PICTURE` mutation to upload, then `updateMe` with `{pictureId}` to bind the new picture to your user record.
- The Avatar re-renders immediately because it's keyed on `picture.url` (`<Avatar key={user?.picture?.url} />`).

### 2. Personal Information

Description: _"Update and manage your personal details to ensure your profile remains current and accessible."_

Renders a vertically-stacked form (`PersonalInformationForm`) with six fields:

| Field | Input type | Constraints |
|---|---|---|
| **First Name** | Text | `USER_FIELD_MAX_LENGTH` cap (typically 50 chars); validation rule applied; **required indicator** when `isCompleteProfilePromptingEnabled` is on. |
| **Last Name** | Text | Same constraints as First Name. |
| **Gender** | Radio group | **Three options only:** Male / Female / Nonbinary. No "Prefer not to say" — leave the field untouched if you'd rather not specify. |
| **Birthdate** | Date input | Min `1900-01-01`, max = today. Cannot be in the future. |
| **City** | Text | `USER_FIELD_MAX_LENGTH` cap. |
| **Country** | Select | Loaded from the server-side countries query. **Disabled while loading.** Single-select, no multi-country support. |

Below the fields:

- **Save** button (filled) — disabled until you change something and the form is valid (`isDisabled` reflects both pristine and invalid states).
- **Cancel** button (text variant) — reverts your edits without saving.

::: info Required indicators are conditional
The little asterisks (or other required indicators) on First Name / Last Name only render when `isCompleteProfilePromptingEnabled` is true — typically used when your workspace has a "fill in your profile" prompt active. Without that flag, the fields show without indicators (but the underlying validation still runs on submit).
:::

### 3. Dark Mode

::: warning Hidden in guest mode
The Dark Mode toggle section is hidden when `shouldUseGuestMode` is true. Guests can't change the theme.
:::

Description: _"Switch to Dark Mode to reduce eye strain and save energy on compatible devices. Enjoy a sleek, dark-themed interface that's easier on the eyes, especially in low-light conditions."_

A single **Switch** control bound to `useThemeMode().toggleTheme`. The setting is persisted to your user record so it follows you across devices and sessions.

### 4. Delete Your Account

Description: _"Permanently remove your account and all associated data. This action cannot be undone, so please proceed with caution."_

**Delete my account** button (danger style, with bin/delete icon). Click opens the Delete Account Modal.

---

## Delete Account modal — what actually happens

Title: **Confirm action**. Size: `x-small`.

> **Are you sure you want to delete your account?**
>
> _You will no longer be able to access any past surveys that you've created._

[**Delete**] (danger button)

When you click **Delete**:

1. **`deleteMe` GraphQL mutation** fires — server-side, your user record is marked deleted (cascade rules then unwind your data per retention policy).
2. **Apollo cache is reset** (`cache.reset()`) — every cached query is discarded.
3. **Firebase user is deleted** (`deleteUser(account)`). Errors are logged but not surfaced — the local logout still runs.
4. **Local logout** runs (clears tokens, session storage).
5. **Browser navigates to `window.location.origin`** with `?deleted=true` in the search — login pages can show a confirmation banner based on this flag.

There is **no undo** path. There is **no "type my email to confirm"** double-confirmation. The single click on the Delete button is the point of no return.

::: danger What "delete" actually removes
Deleting your account does:
- Remove your user record from Vurvey's auth and identity systems
- Disconnect your Firebase identity
- Reset your client-side state

It does **not** retroactively remove your past contributions (responses, chats, comments) from analytics or other people's exports. Those are tied to the deletion-allowed-or-not data-retention rules and may persist anonymized. If you need a hard purge of all data associated with you, contact Vurvey support directly so a GDPR-style erasure can be performed.
:::

::: tip Deleted-user behavior elsewhere
Two specific places in the product treat deleted users specially:
- **Rewards** — the Rewards page hard-excludes responses from deleted users (no payable email). See [Rewards](/guide/rewards) for the `excludeDeletedUsers: true` filter.
- **Analytics / responses** — most analytics views _retain_ deleted users' responses for completeness, with their identity replaced by an anonymized handle.
:::

---

## Integrations (`/me/integrations`) — _Composio-gated_

This tab appears only when the active workspace has `composioEnabled` set to `true`. Otherwise the tab button is hidden and the route falls through to the parent layout (effectively a 404 to the user).

The page renders `IntegrationManagementPage` — the same connection hub documented in [Integrations](/guide/integrations). From here you can connect or disconnect third-party tools (Slack, Notion, Gmail, etc.) via Composio's OAuth, API-key, or bearer-token flows.

::: tip Workspace flag: `composioEnabled`
`composioEnabled` is a workspace-level feature flag. Enabling it requires Vurvey staff intervention (the toggle is not in customer-visible Settings). Once on, every user in that workspace sees the **Integrations** tab on their Personal Profile.

**To enable:** ask your Vurvey CSM or open a support ticket. The flag flip is a backend update — there's no Settings UI for it today.
:::

---

## Terms of Service (`/me/terms-of-service`)

A read-only rendering of Vurvey's Terms of Service inside the app, so users can review without leaving the product. Helpful when an account's prompted re-acceptance flow asks them to re-read the terms.

The terms text itself is editorial content delivered alongside the app; specific revision dates are reflected in the rendered copy. If you need a printable / archival copy, capture the page or contact Vurvey support.

---

## Constraints & limitations

- **Personal Profile is per-user, not per-workspace.** Changes here (name, avatar, dark mode preference) apply to your identity across every workspace.
- **Gender is a fixed three-value enum.** Male / Female / Nonbinary — the schema currently does not include other values. Leaving the field blank is permitted.
- **Birthdate must be in the past** (max = today; min 1900-01-01).
- **Country is single-select** and depends on the server-side countries query — disabled while loading.
- **Required indicators on First/Last name** only render when `isCompleteProfilePromptingEnabled` is on. Server-side validation still runs on submit regardless.
- **Dark Mode toggle is hidden in guest mode.** Guests cannot change the theme.
- **The Integrations tab is gated** by `composioEnabled` per workspace.
- **Delete is irreversible.** No undo, no email-to-confirm, no cooling-off period.
- **`USER_FIELD_MAX_LENGTH`** caps first name, last name, and city.
- **Profile Image upload** goes through the shared Edit Picture modal — file-format and size limits match the rest of the platform's image uploads (large EXIF-heavy phone photos can take a moment).

---

## Best practices

- **Set your avatar.** A real photo (or a recognizable illustration) makes you findable in workspace members lists, comments, and chat. Default initials are fine but anonymous.
- **Fill your country.** Several Vurvey features (campaigns, audiences, mentions) infer defaults based on the workspace member's country — leaving it blank can produce odd defaults.
- **Use the same name in First/Last as on payouts.** If you receive [Rewards](/guide/rewards) on behalf of a brand or as an internal tester, the name on the Tremendous payout email matches your user record.
- **Toggle Dark Mode once.** The choice is persisted to your user record server-side — no need to toggle it again on a new device.
- **Don't delete to "start over".** Deletion is permanent. To reset just an avatar or some preferences, edit the relevant section. To leave a specific workspace, ask its owner to remove you — not the same as deleting your account.
- **Re-read the Terms of Service** tab periodically if your role at your company changes. Terms reflect the contract under which you're using Vurvey.

---

## FAQ

#### Where is the password change?
Vurvey relies on Firebase authentication and (where applicable) SSO. Password changes happen through whichever identity provider you authenticated with — typically a "Forgot password" reset email triggered from the [Login](/guide/login) page, or your SSO IdP's user portal (Okta, Google Workspace, Azure AD, etc.). There's no in-app password field.

#### Why is my Integrations tab missing?
The active workspace doesn't have `composioEnabled` turned on. Ask your CSM. This is per-workspace, not per-user — switching to a workspace with the flag on will reveal the tab.

#### Why are there only three gender options?
The current schema enum has Male, Female, Nonbinary. Leave the field blank if those don't apply — there is no validation requiring a value. If you have a strong need for additional values, that's a product request, not a configuration question.

#### Can I change my email address?
Not directly through the Personal Profile UI. Email change for SSO-authenticated users is governed by your IdP; for Firebase-only users, contact support. We deliberately don't expose email-change in this UI to avoid identity-collision edge cases.

#### Does Dark Mode follow me across browsers and devices?
Yes — the preference is stored on your user record server-side, so signing in on a different device picks it up.

#### What happens to my workspace memberships when I delete my account?
They're removed alongside your user record. Owners of those workspaces will see your row disappear from the member list. No transfer-of-ownership occurs automatically — if you owned a workspace, plan an ownership transfer _before_ deleting.

#### Will my chat history with Agents be deleted?
The conversation records are tied to your user. Deletion follows the data-retention policy: many records are anonymized rather than removed entirely, to preserve workspace analytics that depend on them. For a hard GDPR-style erasure of every byte, contact support — that's a separate, manual process.

#### Why was I logged out automatically after deletion?
Because your authentication identity is gone (Firebase + Vurvey both). The post-delete navigation to `window.location.origin?deleted=true` puts you on the login page where the URL parameter may surface a confirmation banner.

#### Why did the avatar update visually but the chat shows my old avatar?
Some surfaces cache the avatar URL at conversation start. Refreshing the chat (or starting a new conversation) picks up the new one. The Personal Profile page itself is keyed on `picture.url` so it updates immediately.

#### Can I view someone else's profile?
Not from this page. Personal Profile is your own. Other members surface in workspace members lists (under Settings) or via mentions; their public profile is limited to name, avatar, and role.

#### Can I export my account data?
Not through this page. Contact Vurvey support to request a data export — that's a manual process today.

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| Tab strip is missing on `/me` | You're in guest mode for this workspace. Switch to a workspace where you're a full member. |
| Integrations tab is missing | Workspace `composioEnabled` is off. Ask your CSM. |
| Country dropdown is disabled | Countries query is still loading. Give it a beat; refresh if it never resolves. |
| Save button is disabled | Either nothing changed since you opened the form, or one of the fields failed validation (e.g. birthdate in the future). |
| Validation error on First/Last name with no asterisk to explain it | Required indicators are off (`isCompleteProfilePromptingEnabled = false`). The validation still runs; the indicator is just hidden. |
| Profile Image won't upload | Likely a file-type or size issue. Re-export the image as JPEG/PNG under a reasonable size (~5MB). |
| Avatar updated but the rest of the app shows old image | A few surfaces cache the URL at component mount. Refresh the page or navigate away and back. |
| Dark Mode toggle is missing | Guest mode is active. Switch workspaces. |
| Delete didn't redirect anywhere | The post-delete redirect goes to `window.location.origin?deleted=true`. If your browser is on a sub-route URL when you click Delete, the redirect strips the path. Check the URL bar. |
| I clicked Delete by accident | Open a support ticket immediately — there is no client-side undo, but support may be able to intervene if you're fast. |
| `/me/integrations` URL gives an error or blank | Composio isn't enabled for this workspace. Direct URL hits don't bypass the flag check. |

---

## Related guides

- [Logging In](/guide/login) — how you authenticate before you see this page
- [Integrations](/guide/integrations) — the full Composio connection hub that the Integrations tab embeds
- [Settings](/guide/settings) — workspace-level settings (separate from per-user profile)
- [Rewards](/guide/rewards) — Tremendous payouts; the name and email on your profile affect delivery; deleted users are excluded
- [Permissions & Sharing](/guide/permissions-and-sharing) — guest mode and member roles
- [Branding](/guide/branding) — brand-level customization (different from per-user)
