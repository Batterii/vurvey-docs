---
title: Branding
---

# Branding

**Branding** is the workspace area where you define the brand record that backs everything from public Brand Companion embeds to the brand-feedback survey to the Reviews triage queue. A workspace can be associated with one **Brand** (a record in the `brands` table), and the data you configure here is what your audience, your Brand Companions, and your Mentions area all share.

The page header is **Branding**. The route group is `/branding/*` with three sub-pages: **Brand Settings**, **Reviews**, and **Questions**.

![Brand Settings — banner, logo, identity, colors](/screenshots/branding/01-brand-settings.png?optional=1)
![Brand Reviews list (shared with Mentions)](/screenshots/branding/02-brand-reviews.png?optional=1)
![Brand Questions editor](/screenshots/branding/03-brand-questions.png?optional=1)
![Brand Companion Themes — Material 3 color generator](/screenshots/branding/04-companion-themes.png?optional=1)
![Theme From Image picker](/screenshots/branding/05-theme-from-image.png?optional=1)

---

## Routes & navigation

The Branding shell mounts a `<BrandingNavigation />` outlet around three child routes:

| Route | Page | Permission | Notes |
|---|---|---|---|
| `/branding` | **Brand Settings** | Workspace membership | Default landing; the brand identity form. |
| `/branding/reviews` | **Reviews** | Workspace membership | Same component (`ReviewsPage`) used by [Mentions](/guide/mentions#1-1-all-mentions-tab). Two entry points, one underlying dataset. |
| `/branding/questions` | **Questions** | Server-side **OpenFGA** survey permission | Wrapped in `OpenfgaPermissionsDeniedContextProvider`; users without survey:edit permission are blocked from editing and may be redirected. |

::: info Workspace must have a brand attached
The Branding pages assume `workspace.brand` exists. If a workspace has no brand connected, the Brand Settings form renders empty (no save target). Brand creation happens at workspace-setup time by Vurvey staff — see [Super Admin → Manage Brands](/guide/admin#manage-brands-admin-brands) for the platform-side flow. If your workspace is missing a brand, contact your CSM.
:::

---

## Brand Settings (`/branding`)

The Brand Settings page is the editorial surface for the brand record. It uses a single big form with `Save Changes` at the bottom. Every change requires an explicit save — there's no autosave.

### Brand Banner

Visual header / hero image. Recommended dimensions: **960×240 px**. Upload via the standard image picker (`SimpleImageInput`). Uses the `CREATE_BRAND_BANNER` mutation, processed asynchronously via `useMediaUpload`. The Save button is disabled while the banner is still processing (`bannerProcessing = true`).

### Brand Logo

Square identity mark used in workspace navigation, Brand Companion chips, and reviewer surfaces. Recommended dimensions: **100×100 px**. Same upload mechanism (`CREATE_BRAND_LOGO`).

### Identity fields

| Field | Purpose | Notes |
|---|---|---|
| **Name** | Brand display name | **Required if `brand.visible = true`**. Save fails with toast _"A name is required for visible brands"_ if missing. Hidden brands can have an empty name. |
| **Description** | Brand overview, used in brand-facing surfaces | Free text. |
| **Origin country** | Country dropdown | Single-select. Sourced from `GET_COUNTRIES` query (`fetchPolicy: "no-cache"` — fresh every visit). |
| **Target Countries** | Multi-country selector | The countries your brand markets to. Different field from Origin. |
| **Primary Category** | Single-select | Sourced from `GET_ALL_BRAND_ATTRIBUTES`. Hierarchical category catalog. |
| **Secondary Categories** | Multi-select | Additional categories. |
| **Activities** | Multi-select activity attributes | From the same brand attributes query. |
| **Benefits** | Multi-select benefit attributes | Managed via separate `ADD_BRAND_BENEFIT` / `REMOVE_BRAND_BENEFIT` mutations because they go through a join-table on save (not a flat array on the brand record). |

### Colors

Exactly four user-settable color slots:

| Slot | Internal `type` | What it's for |
|---|---|---|
| **Primary** | `primary` | The hero brand color. Used in Brand Companion chrome by default and as the seed color for theme generation. |
| **Secondary** | `secondary` | Companion / accent color. |
| **Tertiary** | `tertiary` | Tertiary accent. |
| **Quaternary** | `quaternary` | Fourth color slot. Rarely used directly; available for design systems that need four named brand colors. |

Each slot is a `ColorPicker` returning a hex string. Stored as a row in `brand.colors[]` with `{color: "#hex", type: "primary"}` shape. Changes are diffed before save (only the actually-changed colors trigger an update).

::: tip Color types beyond the four
The `BrandColor.type` field is a free-form string. The platform reserves additional `type` prefixes for the **Brand Companion Theme Creator** (see below) — `theme-source`, `theme-source-dark`, `md-sys-color-*`, and `md-sys-color-dark-*`. Those are managed by the Theme Creator UI, not the four-color pickers, and you should not edit them by hand.
:::

### Save behavior

- Validates: visible brands require a non-empty name.
- Calls `UPDATE_BRAND` with only the changed scalar fields (`findSingleDifference`).
- Benefits go through `ADD_BRAND_BENEFIT` / `REMOVE_BRAND_BENEFIT` separately.
- On success, toast: _"Changes saved"_.
- On failure with the specific error containing `brands_url_unique`, toast: _"Your URL is not unique, please choose another one"_ (the brand URL is enforced unique at the database level — if you change the name in a way that creates a URL collision, you'll see this).
- All other errors go through the generic error handler.

---

## Brand Companion Themes (Vurvey staff only)

A separate panel rendered _inside_ Brand Settings, but **gated by `isSupportOrEnterpriseRole(user.role)`** — only Vurvey Support and Vurvey Enterprise staff see it. Customer admins cannot enable or use this section.

### What it does

It's a Material Design 3 theme generator. Pick a **source color** (or pick a source image and let the picker extract one), and it generates a full Material-3 tonal palette of derived tokens (primary, on-primary, primary-container, on-primary-container, secondary, secondary-container, … plus tertiary, error, neutral, surface, etc.) for **both light and dark modes**.

The generated palette is persisted as additional `BrandColor` rows alongside the four user-settable colors, using these `type` prefixes:

| `type` prefix | Meaning |
|---|---|
| `theme-source` | The chosen source color for the **light** theme |
| `theme-source-dark` | The chosen source color for the **dark** theme |
| `md-sys-color-{token-name}` | A generated **light**-mode Material 3 token (e.g. `md-sys-color-primary`, `md-sys-color-on-surface`) |
| `md-sys-color-dark-{token-name}` | A generated **dark**-mode Material 3 token |

### How it works internally

The component lazy-loads `@material/material-color-utilities` (`SchemeTonalSpot` + `Theme`) on mount to avoid the bundle cost on workspaces that don't have access. Once loaded, it generates the full palette client-side from the source color.

Default source color (light and dark): `#8899F2` (a soft periwinkle).

A **Light / Dark mode** button-group switches which palette is being edited; you can iterate on each independently. Save persists every generated token back to `brand.colors` in one mutation.

### Theme from image

The `ThemeFromImageButton` lets you upload an image and have the picker extract a dominant color to use as the source. Useful when you want a Material 3 palette that's actually grounded in a real brand asset (your logo, a photo, packaging).

### Why this exists

Brand Companions are public-facing widgets. They need an aesthetic that matches the customer's brand without the customer having to hand-pick 80 different color tokens. The Theme Creator gives Vurvey staff a tool to dial in a palette once and ship it.

::: warning Staff-only by design
This is **not** a customer-self-serve feature today. The current invariant is that brand themes are dialled in by Vurvey staff during onboarding. If a customer needs to update their theme post-launch, route the request through your CSM rather than turning on the section in their UI.
:::

---

## Reviews (`/branding/reviews`)

Identical component as [Mentions → All Mentions](/guide/mentions#1-2-all-mentions-tab). Both routes mount `ReviewsPage` against the same `feedbackSurvey` data for the workspace brand. The two entry points exist because:

- **Branding → Reviews** is the brand-team-focused workflow (the brand owner watching their feedback queue).
- **Mentions → All Mentions** is the broader "what is the community saying about us" hub (also includes Magic Topics when shipped).

When there are no responses to any feedback question: _"There are no reviews yet"_ (no-responses image). See the Mentions doc for the full UI breakdown (sort modes, the Unreviewed Only filter, Review Modal, Add Reel Modal, and the create-reel pipeline).

---

## Questions (`/branding/questions`)

The Questions page manages the questions that get asked in your **brand feedback survey** — the survey responses to which feed the Reviews queue.

### Permissions

The route is wrapped in `OpenfgaPermissionsDeniedContextProvider` with `resource: "survey"`. The component intercepts OpenFGA errors via `interceptOpenfgaError` and redirects to a permissions-denied state if the current user lacks `survey:edit` on the brand survey. The redirect target preserves the URL: `branding/questions`.

### Page chrome

- Layout: `LayoutContainer` with `theme="dark"`.
- Note at the top: _"\* You cannot delete questions that have answers to them"_
- Button: **+ New Question** — calls `CREATE_FEEDBACK_QUESTION` with the current brand's feedback survey ID. The newly-created question shows up at the end of the grid.
- Grid of `FeedbackCard` components, one per question.

### Per-question controls (`FeedbackCard`)

Each card exposes:

- **Text editor** — change the question text via `UPDATE_QUESTION` with `{changes: {text}}`. Success toast: _"Question updated"_.
- **Points editor** — change the reward points value via `UPDATE_QUESTION` with `{changes: {points}}`. Same mutation, different field.
- **Position / move handle** — for cards beyond the first, you can reorder. Calls `MOVE_QUESTION` with `{id, index}`. The client also runs a local cache splice (`items.splice(newPosition, 0, items.splice(currentPosition, 1)[0])`) so the UI updates instantly. Success toast: _"Question moved"_.
- **Delete** — opens the `ConfirmModal`: _"Are you sure you want to delete this question?"_ Calls `DELETE_QUESTION` on confirm. **If the question has any answers attached, the server rejects the delete** and an error toast surfaces. Success toast: _"Question deleted"_.

### Error interception

Every mutation here checks for an OpenFGA-permission-denied error and routes it through the context provider to surface a friendly state, falling back to a `getErrorMessage` toast for non-permission errors.

---

## How Branding interacts with the rest of Vurvey

```
            ┌────────────────────────────┐
            │  Workspace                 │
            │  .brand (one Brand record) │
            └─────────────┬──────────────┘
                          │
   ┌──────────────────────┼──────────────────────────────────┐
   ▼                      ▼                                  ▼
┌──────────────┐  ┌──────────────────┐         ┌────────────────────────┐
│ Brand        │  │ Brand-feedback   │         │ Brand Companions       │
│ Settings     │  │ survey + answers │         │ (public-facing AI      │
│ (identity,   │  │  ↓               │         │  embedded on customer  │
│  colors,     │  │ Reviews surface  │         │  site, themed by brand │
│  themes)     │  │ (= Mentions/All) │         │  colors)               │
└──────────────┘  └──────────────────┘         └────────────────────────┘
                          ▲
                          │
                  ┌───────┴───────┐
                  │ Questions     │
                  │ (the form     │
                  │  respondents  │
                  │  see)         │
                  └───────────────┘
```

- The four **brand colors** are read by the manager UI (workspace nav accents) and by the Brand Companion embed.
- The **Material 3 theme tokens** (when generated by the Theme Creator) drive the Brand Companion's full UI palette.
- The **brand-feedback survey** sits at the centre. Questions are configured here; responses populate Reviews here and All Mentions in [Mentions](/guide/mentions).
- The **logo and banner** appear in the Brand Companion chrome and in any brand-themed customer surfaces.

---

## Constraints & limitations

- **One brand per workspace.** The `brand` is a 1-to-1 relation on workspace. Multi-brand customers usually use multiple workspaces.
- **Brand creation is staff-only.** A brand record gets attached to a workspace by Vurvey staff via Super Admin → Manage Brands. There is no in-workspace "Create my brand" flow.
- **Brand URL must be unique.** Save will fail with a specific message if your name change creates a slug collision.
- **Visible brands require a name.** Hidden brands can have empty names.
- **Exactly four color slots are user-settable.** Primary, Secondary, Tertiary, Quaternary. Additional `BrandColor.type` values exist for the Material 3 theme generator but are reserved.
- **Brand Companion Themes is staff-only.** Gated by `isSupportOrEnterpriseRole`. Customer admins don't see it.
- **Reviews is shared with Mentions.** They read the same survey data; deleting a response in one place removes it from the other.
- **Questions with answers cannot be deleted.** This is enforced server-side and surfaced as the inline note on the Questions page.
- **OpenFGA gates the Questions page.** Users without `survey:edit` permission cannot edit, even if they have workspace access.
- **No bulk operations on questions.** Reorder is one-at-a-time; delete is one-at-a-time with confirmation.
- **Theme Creator lazy-loads ~80kb of Material color utilities.** First open may show a brief loading state. Subsequent visits in the same session are instant.

---

## Best practices

- **Set Primary and Secondary first.** They're the colors most surfaces use by default. Tertiary and Quaternary are accents you'll seldom see unless your design explicitly references them.
- **Pick brand colors with contrast in mind.** Vurvey surfaces these colors on top of varied backgrounds. A pale Primary on a white card disappears.
- **Use the Theme Creator (via your CSM) for Brand Companions.** Four flat colors do not a UI theme make. Material 3 gives you on-primary, primary-container, on-primary-container, etc. — all the relationships needed for an accessible UI palette.
- **Generate dark mode early.** It's tempting to ship light-only and bolt on dark mode later. Generating both at the same time from the same source color guarantees consistency.
- **Fill Activities and Benefits.** They're not just decorative — they influence brand discovery and matching in the broader community.
- **Treat Reviews and Mentions as the same queue.** Pick whichever entry point you and your team prefer; just don't have two people processing the same queue from different places without coordination.
- **Edit Questions text in place.** Avoid delete-and-recreate as long as the question has historical answers — historical answers don't migrate to new question IDs, so you lose comparability.
- **Use the "+ New Question" placement deliberately.** New questions land at the end of the list. Reorder them into place before publishing.
- **Test the Brand Companion embed after every theme change.** Material 3 token interactions can produce surprising contrast outcomes on real backgrounds.

---

## FAQ

#### Where does my brand record come from?
A Vurvey staff member created it during your workspace onboarding (via Super Admin → Manage Brands). If your workspace doesn't have a brand attached, contact your CSM.

#### Why isn't my brand URL changing when I rename it?
The brand URL is unique at the database level; if your new name creates a slug collision, the save fails with a specific message: _"Your URL is not unique, please choose another one"_. Try a more distinctive name.

#### Can I have multiple brands in one workspace?
No. One brand per workspace. Customers with multiple brands typically use multiple workspaces (one per brand).

#### Why don't I see Brand Companion Themes?
That section is gated by `isSupportOrEnterpriseRole` and only renders for Vurvey Support and Enterprise staff. Customer admins do not see it. If you need theme work done, contact your CSM.

#### Is Brand Companion Themes different from the four color pickers?
Yes. The four color pickers (Primary/Secondary/Tertiary/Quaternary) are simple brand colors. The Theme Creator generates a full Material Design 3 palette (~30 tokens per mode, light + dark) and is what actually styles the Brand Companion embed. The four pickers are a subset of the same `brand.colors` rows; the M3 tokens are reserved-prefix entries in the same table.

#### Can I edit the Theme Creator colors by hand without using the generator?
You can, but you shouldn't. The Material 3 tokens have specific relationships (e.g. `on-primary` must contrast against `primary` enough to pass WCAG). Hand-editing breaks those relationships. Use the generator with a source color.

#### Will my brand's banner show up on the survey-taking page?
The brand banner is used in workspace and brand-team-facing surfaces. The survey-taking experience on `vurvey-web-responder` brands by Vurvey itself today; per-brand banners on the responder side are a roadmap item, not shipped.

#### What's the difference between Reviews and Mentions / All Mentions?
None functionally — same component, same data, different entry points. Branding → Reviews is the brand-team-focused workflow; Mentions → All Mentions is the broader community-listening hub. Pick whichever fits your mental model; just don't process the same queue from both at once.

#### Can I delete a question that's been asked but has no answers?
Yes. The server-side rejection is only for questions with at least one answer attached. New / unused questions delete cleanly.

#### How do I reorder questions?
Each `FeedbackCard` has a position handle (visible on hover). Drag to reorder, or use the up/down arrows depending on your UI version. The first question can't be moved up (it's already at position 0); use the next question's controls to move past it.

#### Why does my Questions page redirect me out?
You don't have OpenFGA `survey:edit` permission on the brand survey. Ask a workspace Owner to grant it via the survey's sharing settings.

#### My points field doesn't seem to do anything visible — what does it do?
Points are awarded to respondents when they answer a question. They contribute to community-rank metrics and (in some configurations) influence audience selection and rewards eligibility.

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| **Save Changes** button is disabled | (a) Nothing has changed since the form mounted, or (b) The logo/banner is still processing (`bannerProcessing` / `logoProcessing` = true). Wait a moment. |
| Save fails with _"Your URL is not unique"_ | Your name change creates a slug collision. Pick a more distinctive name. |
| Save fails with _"A name is required for visible brands"_ | `brand.visible = true` but the Name field is empty. Either set a name or have a staff member toggle visibility off. |
| Brand Companion Themes section is missing | You're not Vurvey Support / Enterprise staff. Customer admins don't see it. |
| Theme Creator is stuck "loading" | The `@material/material-color-utilities` lazy import failed. Refresh; check console for a load error. If reproducible across sessions, file a bug. |
| Reviews page is empty | No feedback responses have come in yet. Once respondents submit, this populates. |
| Questions page won't let me edit | OpenFGA `survey:edit` permission missing. Workspace Owner can grant via the survey's sharing settings. |
| _"Question moved"_ toast fires but the order didn't change | The local cache splice happened but the server rejected the position change (rare). Refresh to see the authoritative order. |
| Cannot delete a question | The question has at least one answer attached. This is enforced server-side. You can hide it from new respondents via the survey's settings, but not delete it. |
| Banner / logo upload spins forever | The media-upload pipeline is processing. Large files take longer. If it never completes, check console for a Firebase / upload error and retry. |
| Colors I changed aren't appearing in the Brand Companion embed | The four base colors affect specific token slots; deeper UI styling comes from the Material 3 theme. If you didn't use the Theme Creator, the embed may still show the previous (or default) palette. Ask your CSM to regenerate the theme. |
| Hidden brand with empty name causes Brand Companion errors | Visibility off + empty name is allowed but downstream surfaces (especially public embeds) may render placeholders. Either set a name or keep the brand non-public. |

---

## Related guides

- [Mentions](/guide/mentions) — shares the Reviews component and dataset
- [Reels](/guide/reels) — what you create from a Review's selected highlight
- [Brand Companions](/guide/brand-companions) — public embeds themed by the brand's Material 3 palette
- [Campaigns](/guide/campaigns) — campaigns are scoped by brand for attribution
- [Super Admin → Manage Brands](/guide/admin#manage-brands-admin-brands) — where the brand record is created in the first place
- [Settings](/guide/settings) — workspace-level configuration (separate from brand-level)
- [Permissions & Sharing](/guide/permissions-and-sharing) — OpenFGA roles that gate the Questions page
