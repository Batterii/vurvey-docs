---
title: Appearance & Themes
---

# Appearance & Themes

Vurvey ships with **seven built-in themes** (plus a hidden preview of the next-gen product) that any user can switch between from their Appearance settings. The selection is per-browser — your preference follows you across sessions on the same browser, regardless of workspace. This doc covers the full theme picker, what each theme looks like, how the persistence works, and how to access the in-development Vurvey X preview.

> 📷 _Screenshot pending: Appearance settings — tile grid with theme previews_

---

## Where to find it

**Settings → Appearance** (or wherever your build mounts the AppearanceSettings component — typically inside Personal Profile / Account settings rather than Workspace settings, since the choice is per-user-per-browser).

---

## How themes work — the mechanics

Themes are implemented as **CSS classes on the `<html>` element**. The active theme adds `theme-<id>` (e.g. `theme-vurvey-light`, `theme-neo-brutalism`); for dark-mode themes the helper class `dark-theme` is also applied.

Each theme defines a complete set of **semantic CSS tokens** in `public/styles/global-styles.css` under its `html.theme-<id>` selector. The same component styles (colors, borders, spacing) reference these tokens — so when you switch themes, every screen across the app — dashboard, surveys, agents, workflows — flips at once with zero per-page work.

### Persistence

| Where | What's stored | Key |
|---|---|---|
| `localStorage` | The chosen theme ID | `vurvey:theme-id` |
| `localStorage` | Vurvey X unlock state (boolean string) | `vurvey:vurvey-x-unlocked` |

If you've never explicitly picked a theme, the picker falls back to the legacy "isDarkMode" toggle behavior — dark mode shows `vurvey-dark`, otherwise `vurvey-light` (the default).

### Per-user, per-browser

The theme is **not** a workspace setting. It lives in your browser's localStorage. Consequences:

- Switching workspaces does NOT change your theme.
- Other members in your workspace see whatever they picked individually.
- Switching browsers / devices means picking again.
- Clearing browser data resets your choice to the default.

---

## The Appearance picker

> 📷 _Screenshot pending: Appearance settings layout — title + description + theme grid_

### Layout

| Element | Behavior |
|---|---|
| **Header** | "Appearance" |
| **Description** | "Pick a theme. Every screen in the app — dashboard, surveys, agents, workflows — will follow. Currently active: **\<Theme name\>**." |
| **Theme grid** | Horizontally-flowing radio group of theme tiles; each tile is a live mini-preview rendered in that theme's tokens |

The grid uses ARIA `role="radiogroup"` with `aria-label="Choose theme"`; each tile is an individual `role="radio"` button. Click a tile to switch immediately — no save step.

### Theme tile anatomy

> 📷 _Screenshot pending: Single theme tile with mini-preview, name, and description_

Each tile shows:

| Element | Purpose |
|---|---|
| **Mini-preview** | A scaled-down rendering of a dashboard-card layout with that theme's class applied — what you see in the tile is what you'll see in the app |
| **Theme name** | E.g. "Vurvey (light)", "Neo Brutalism" |
| **Description** | One-line summary of the theme's aesthetic |
| **Active state** | The currently-selected tile gets an outlined border + bolder typography |

The preview HTML inside the tile is rendered with `className={theme-${id}}` — that means it paints with the actual semantic tokens for that theme. If you change the token values in `global-styles.css`, the previews update accordingly without code changes.

---

## The built-in themes

### vurvey-light (default)

| | |
|---|---|
| **ID** | `vurvey-light` |
| **Mode** | Light |
| **Description** | Default — purple brand on cool gray |
| **When to use** | Daily work in bright environments, screen sharing, demos |

The platform's longstanding default. Vurvey's purple brand color shows up across navigation, primary buttons, and accents. Background is a cool, low-saturation gray for sustained-reading comfort.

### vurvey-dark

| | |
|---|---|
| **ID** | `vurvey-dark` |
| **Mode** | Dark |
| **Description** | Default dark — lime brand on charcoal |
| **When to use** | Low-light work environments, OLED-friendly use, late-night sessions |

The platform's default dark mode. Vurvey's lime accent replaces purple to maintain contrast on a charcoal-near-black background.

### vurvey-labs

| | |
|---|---|
| **ID** | `vurvey-labs` |
| **Mode** | Dark |
| **Description** | Pitch-deck black with electric lime |
| **When to use** | High-contrast presentations, demos, recordings |

Higher-contrast variant of vurvey-dark. Backgrounds are pitch-black instead of charcoal; accent lime is more saturated. Designed to read well on projectors and in screen recordings.

### fish-deck

| | |
|---|---|
| **ID** | `fish-deck` |
| **Mode** | Dark |
| **Description** | Shadcn-style dark with electric lime |
| **When to use** | If you prefer the shadcn-ui dark aesthetic that's become popular in modern developer tools |

A dark theme styled after the shadcn-ui visual language. More neutral surface colors with sharper border contrasts; the lime accent is preserved for brand continuity.

### neo-brutalism

| | |
|---|---|
| **ID** | `neo-brutalism` |
| **Mode** | Light |
| **Description** | High-contrast cream + red |
| **When to use** | When you want a maximally legible high-contrast UI; user preference for Neo-Brutalist aesthetics |

Bold, high-contrast UI styled after the Neo-Brutalist design movement. Heavy borders, cream-yellow backgrounds, red accents. Polarizing aesthetic by design — try it and see.

### corporate

| | |
|---|---|
| **ID** | `corporate` |
| **Mode** | Light |
| **Description** | Muted slate + blue |
| **When to use** | Professional / corporate environments where the default purple is too brand-forward; co-branding scenarios |

A muted, business-neutral theme. Slate grays and conservative blues replace the purple accent. Useful when sharing screens in business settings where the default Vurvey brand color might be a distraction.

### warm

| | |
|---|---|
| **ID** | `warm` |
| **Mode** | Light |
| **Description** | Terracotta on cream |
| **When to use** | User preference for warm color palettes; sustained-use comfort in evening hours |

A warm earth-tone palette — terracotta primary on a cream background. Lower-saturation than the default; some users find it less fatiguing for long sessions.

---

## The Vurvey X theme (hidden — preview)

> 📷 _Screenshot pending: Vurvey X theme active — globe backdrop, breadcrumb bar, redesigned chrome_

| | |
|---|---|
| **ID** | `vurvey-x` |
| **Mode** | Dark |
| **Description** | Preview the next-gen product — globe backdrop, volt accent, collapsible rail |
| **Status** | Secret (hidden from default picker) |
| **Use case** | Internal preview of the next-generation product UI |

Vurvey X is an in-development preview of the next-generation product look. It's hidden from the Appearance picker by default and only appears for users who have explicitly **unlocked** it.

### Unlocking Vurvey X

> 📷 _Screenshot pending: URL bar with ?unlock=vurvey-x_

To unlock:

1. Append `?unlock=vurvey-x` to any Vurvey app URL (e.g. `https://app.vurvey.com/?unlock=vurvey-x`).
2. Visit that URL once. The unlock state persists in localStorage (`vurvey:vurvey-x-unlocked`).
3. After unlock, the Vurvey X tile appears in your Appearance settings — pick it like any other theme.

To lock again:

1. Append `?lock=vurvey-x` to any URL and visit it once.
2. The unlock state is cleared from localStorage; the Vurvey X tile disappears.
3. If Vurvey X was your active theme, you'll need to pick a different one — the active selection isn't auto-reverted on lock.

### What changes when Vurvey X is active

| Component | Default themes | Vurvey X theme |
|---|---|---|
| **Background** | Solid color from theme tokens | Animated WebGL globe backdrop pinned to the viewport (lazy-loaded with three.js) |
| **Navigation** | Fixed sidebar | Dual-state collapsible icon-only / expanded overlay rail |
| **Breadcrumbs** | Per-page (where implemented) | Auto-generated breadcrumb bar pinned to viewport top |
| **Page styles** | Standard component styling | Additional `vurvey-x-page-overrides.module.scss` rules applied scoped to `html.theme-vurvey-x` |

::: warning Vurvey X is a preview, not a feature
The Vurvey X theme is a **cosmetic overlay** — it doesn't replace the underlying app navigation or features. Existing pages still work; the chrome just looks different. It's intended for staff to preview the redesign without forcing a wholesale layout swap on all users. Bugs are expected; visual glitches are possible. Don't recommend this to customers unless they specifically ask.
:::

::: tip Performance impact
Vurvey X loads three.js to render the globe backdrop. This is **lazy-loaded** — only users with vurvey-x active pay the bundle cost. Non-vurvey-x users have zero overhead. Still, the WebGL globe is GPU-intensive; if you're on integrated graphics or low-power mode, expect slower performance.
:::

---

## Switching themes — the user flow

1. Open Appearance settings.
2. The currently-active theme is highlighted.
3. Click any other theme tile — the entire app flips instantly. No reload required.
4. Your choice is persisted to localStorage immediately. Next visit, it's preserved.

There's no Save button. There's no Cancel. The selection is the action.

---

## Adding a new theme (for developers)

If you're adding a new theme to the codebase:

1. **Append a new entry to `THEMES`** in `src/context/theme-context.tsx` with `{id, name, mode, description, secret?}`.
2. **Define the CSS class** in `public/styles/global-styles.css` under `html.theme-<new-id>` — set every semantic token (background, foreground, primary, accent, border, etc.).
3. **Test the picker** — your new theme appears as a tile automatically (no picker code changes needed).
4. **Test the preview** — the mini-preview renders with your new tokens. If colors look off, your tokens are off.
5. **Test all pages** — switch to your theme, visit every major surface (dashboard, agents, campaigns, workflows, etc.). Things shouldn't break.

For "secret" themes (preview/staff-only), set `secret: true` and implement an unlock mechanism similar to `useVurveyXUnlocked`.

---

## Constraints & limitations

- **Theme choice is per-browser, not per-account.** Switching browsers or devices means picking again. Clearing browser data resets to default.
- **Vurvey X is preview-quality.** Bugs and visual glitches are expected. Not recommended for production work.
- **Dark / light is a property of each theme, not an independent toggle.** You don't pick "dark mode" then a color — you pick a theme that's either dark or light. This means there's no automatic system-preference following today.
- **Some legacy components may not respect the theme tokens.** Over time the codebase has been converted to use tokens; a few stragglers may still hardcode colors. Report visual glitches.
- **The Workspace Branding system is separate.** Workspace-level branding (logos, brand colors set by an admin) applies on top of themes for things like login pages and survey landing pages. See [Branding](/guide/branding) for how the two interact.
- **The Material 3 Theme Creator is also separate.** It generates a custom color palette for workspace branding — not a personal app theme. See [Branding → Theme Creator](/guide/branding#theme-creator).
- **No system-preference auto-switching today.** The picker doesn't watch `prefers-color-scheme`. (You can manually switch between light and dark themes.)
- **Theme switching is instant — no transition.** The CSS class on `<html>` swaps; tokens update; the page re-paints. No animation between themes.
- **Vurvey X requires three.js.** Devices without WebGL won't render the globe backdrop; a fallback CSS background appears instead.

---

## Best practices

- **Default to vurvey-light for screen sharing.** It's the most visually consistent and the lightest brand-coded — easiest for outside viewers to follow.
- **Use vurvey-dark or vurvey-labs for OLED screens.** True dark backgrounds reduce power draw on OLED panels and look sharper.
- **Use corporate for client-facing scenarios.** When demoing to a customer whose brand clashes with purple, the muted slate/blue can defuse aesthetic friction.
- **Don't recommend Vurvey X to non-staff users.** It's an internal preview. Wait until it's officially rolled out.
- **Try a theme for a full day before deciding.** Quick toggles between themes can fatigue you. Pick one and live with it.
- **If a page looks broken, switch to vurvey-light to confirm it's theme-related.** If the bug is gone in default theme, it's a token issue specific to your chosen theme. Report it.

---

## FAQ

#### Can I create my own custom theme?
Not via the UI today. Themes are code-defined (a CSS class + a registry entry). The Material 3 Theme Creator under Branding produces workspace branding tokens, not app themes — they're separate systems.

#### Does my theme follow me when I log in on a different device?
No. The theme is stored in localStorage on each browser. Other devices use their own choice.

#### Why is "Vurvey X" not in my picker?
It's hidden by default. Visit any Vurvey URL with `?unlock=vurvey-x` once. After that the tile appears.

#### How do I remove Vurvey X from my picker?
Visit any Vurvey URL with `?lock=vurvey-x` once. The tile disappears. If it was your active theme, switch to a different one explicitly — the active selection isn't auto-reverted on lock.

#### Does switching themes log me out or refresh anything?
No. The switch is instant CSS-class swap. State, queries, in-flight work all persist.

#### Does the theme affect what other people see?
No. Theme choice is browser-local. Other workspace members see whatever they picked.

#### Will my theme survive a Vurvey deploy?
Yes. The localStorage persists across deploys. If a deploy renames a theme (rare), your stored ID might no longer match — in that case the picker falls back to the default.

#### Are themes accessible?
The standard themes are designed to meet WCAG AA contrast in their primary surfaces. If you encounter a contrast issue, report it. Neo Brutalism is high-contrast by design; Vurvey X is in preview and contrast guarantees may be looser.

#### Can a workspace admin force a theme on everyone?
No. Theme is per-user, per-browser. Workspace branding settings (logos, colors) apply on top of themes for branded surfaces, but the theme picker is the user's choice.

#### Why do some screens look out-of-sync with my theme?
A handful of legacy components may still hardcode colors. Over time these are being migrated to use semantic tokens. Report any you find.

#### How does this differ from the legacy "isDarkMode" toggle?
The legacy toggle was a binary light/dark flag. The new theme system has named themes — vurvey-light and vurvey-dark are the equivalents, but the new system also supports vurvey-labs, neo-brutalism, fish-deck, corporate, warm, and the unlockable vurvey-x. The picker still honors the legacy dark-mode toggle when no explicit choice has been made.

#### Does the theme picker work in the Responder app?
The Responder app has its own theming for surveys, driven by workspace branding (see [Branding](/guide/branding)). The Appearance picker is a Manager-side feature for users of the platform itself; respondents don't pick themes.

#### Will Vurvey X eventually become the default?
That's the eventual direction implied by "next-gen product preview", but timelines aren't public. Watch [What's New](/guide/whats-new) for updates.

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| Theme picker is empty | Page didn't load the theme context correctly. Hard refresh and check console. |
| Selecting a theme has no visible effect | Inspect `<html>` element — the class should be `theme-<id>`. If not applied, theme-context provider isn't mounted. |
| App reverts to default after refresh | localStorage may be blocked (private/incognito mode); explicit choice can't persist. |
| Vurvey X tile not appearing | Visit any URL with `?unlock=vurvey-x` once. Check console for localStorage block. |
| Vurvey X globe doesn't render | WebGL not available on your device, OR three.js failed to load. A fallback solid background is shown. |
| Vurvey X performance is bad | The WebGL globe is GPU-intensive. Switch to a different theme on low-power devices. |
| Some pages look broken in my theme | Possible token-hardcode issue in a legacy component. Switch to vurvey-light to confirm; if it's gone, the bug is theme-specific. Report. |
| Workspace logo / brand colors disappear | Branding is applied per-surface (login, survey landing) on top of themes. If it's not showing up, that's a Branding issue, not a theme issue. See [Branding](/guide/branding). |
| Auto-breadcrumbs in Vurvey X show wrong labels | The SEGMENT_LABELS map in vurvey-x-chrome may not cover that segment. Report. |

---

## Cross-references

- [Branding](/guide/branding) — workspace-level branding (logos, brand colors, theme creator)
- [Settings](/guide/settings) — parent surface for workspace settings; Appearance may live here or under Account
- [Account & Profile](/guide/account) — Personal Information settings; appearance may be exposed near here
- [Login & Authentication](/guide/login) — Login pages use workspace branding, not personal themes
- [What's New](/guide/whats-new) — track theme additions and Vurvey X rollout progress
- [Feature Flags Reference](/guide/feature-flags) — themes are not flag-gated, but related UI behavior may be
- [Platform Architecture](/guide/architecture) — where the theme system fits in the front-end stack
