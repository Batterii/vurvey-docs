---
title: Brand Companions
---

# Brand Companions

**Brand Companions** are AI agents you publish to the open web — embedded on your own brand site, customer portal, or partner property. The **Brand Companions** workspace area lets admins see every published companion in one grid, manage its public API credentials, and (when enabled) inspect conversation completion metrics over time.

Functionally, a Brand Companion is a regular [Agent](/guide/agents) with a few extra fields toggled on at the database level: `is_brand_companion = true`, optionally `brand_companion_metrics_enabled = true`, and a linked **Public-type Workspace API App** that carries the credentials and the allowed-domain list. Everything you see on the Brand Companions page is a UI over those fields.

![Brand Companions grid with companion cards](/screenshots/brand-companions/01-grid.png?optional=1)
![Manage API App modal — empty state](/screenshots/brand-companions/03-manage-api-empty.png?optional=1)
![Manage API App modal — credentials and domains](/screenshots/brand-companions/04-manage-api-credentials.png?optional=1)
![Brand Companion metrics — completion rate chart](/screenshots/brand-companions/05-metrics.png?optional=1)
![Developer API Apps page (separate `/api-apps` route)](/screenshots/brand-companions/02-developer-api-apps.png?optional=1)

::: warning Admin-only feature
The entire Brand Companions area is gated by the `isAdminRole` check. Non-admin users hitting any `/brand-companions/*` URL are silently redirected to the workspace home. If you should have access but the page bounces you, ask a Workspace Owner to confirm your role under **Workspace Settings → Members**. See [Permissions & Sharing](/guide/permissions-and-sharing).
:::

---

## Routes

The Brand Companions area mounts under `/brand-companions` and contains exactly two pages plus an index redirect. **The Developer API Apps page lives on a separate top-level workspace route — it is _not_ a child of `/brand-companions`.**

| Route | Page | Notes |
|---|---|---|
| `/brand-companions` | (redirect) | Replaces the URL with `/brand-companions/agents`. |
| `/brand-companions/agents` | **Brand Companions Grid** | The default landing page; lists every persona where `isBrandCompanion = true`. |
| `/brand-companions/agents/:personaId/metrics` | **Brand Companion Metrics** | Per-companion metrics page; renders an empty state if metrics are not enabled for that persona. |
| `/api-apps` | **Developer API Apps** | Workspace-level API key management (Developer-type apps, plus all Public-type companion apps). Mounted under `/workspace-routes`, _not_ under `/brand-companions`. |

> **Doc correction (May 2026):** earlier revisions of this page said the API Apps route was `/brand-companions/api-management`. That route does not exist. The correct route is `/api-apps` and it is a top-level workspace route.

---

## How a persona becomes a Brand Companion

A persona is _not_ created from the Brand Companions page. The page is a **management view** — it lists personas that are already flagged. To create a new Brand Companion:

1. Go to **Agents** and open or create a persona in the [Agent Builder](/guide/agents).
2. In the persona settings, toggle the **Brand Companion** flag on (sets `is_brand_companion = true` on the persona record).
3. _(Optional but recommended)_ Toggle **Enable conversation metrics** to opt the companion into nightly rollups (`brand_companion_metrics_enabled = true`).
4. Save the persona. It now appears on the Brand Companions grid.

These two boolean fields were introduced in the `20260414170725_add-brand-companion-to-ai-personas` migration (April 14, 2026). Personas created before that date default to `false` on both.

::: info Why two flags?
The two flags are independent on purpose. `is_brand_companion` controls whether the persona appears in the management grid and gets a public API app. `brand_companion_metrics_enabled` controls whether nightly conversation rollups are computed for it — those rollups are expensive at scale, so we opt in per-persona instead of running them for every flagged companion.
:::

---

## The Brand Companions Grid

Document title: **Vurvey - Brand Companions**. Sub-nav header: **Brand Companions**.

The grid loads with one GraphQL query, `GET_BRAND_COMPANIONS`, filtered server-side:

```graphql
filter: {
  isBrandCompanion: true,
  includeHidden: false,
  isPopulationAgent: false,
}
```

Hidden personas and Population (Persona People) agents are intentionally excluded — only top-level, published-style companions appear here.

### Empty state

When no personas in the workspace have `isBrandCompanion = true`, the page renders:

> **No Brand Companions**
>
> _Brand Companions will appear here once they are created._

with the standard `AgentsIcon` glyph.

To populate the grid, create a persona in Agent Builder and toggle the Brand Companion flag (see above).

### Brand Companion Card

Each grid tile is a card showing one companion. Top section, left to right:

- **Circular avatar** — uses `persona.picture.url` if set, else falls back to `persona.avatarUri`.
- **Name** (bold subheader) with an overflow tooltip if it's truncated.
- **"Brand Companion" caption** beneath the name.
- **`⋮` (three dots) dropdown** at the top-right with one item: **View Agent Details** — opens the persona in **Agent Builder v2** at `/agents/builder-v2/{personaId}`.

Status row beneath the identity block has two dots:

| Dot | What it means | When green |
|---|---|---|
| **Metrics Enabled / Disabled** | Whether nightly conversation rollups run for this companion. | `brandCompanionMetricsEnabled` is `true`. |
| **API key Active / Inactive** | Whether the companion has a Public-type Workspace API App created. | `persona.workspaceApiApp` is not null. |

A grey dot means "this feature is off for this companion" — clicking the card or its actions handles that state explicitly (see below).

Bottom of the card has two buttons:

| Button | Behaviour |
|---|---|
| **View Metrics** (filled) | Navigates to `/brand-companions/agents/{personaId}/metrics`. **Disabled when Metrics are not enabled.** Clicking the card body itself also navigates here when enabled. |
| **Manage API Key** (outlined) | Opens the **Manage API App** modal (described below). Always enabled — it is the way to create the API app in the first place. |

::: tip Card disabled state
If a companion has metrics disabled, the entire card is rendered with a `cardDisabled` style and `aria-disabled` set. Clicking anywhere on the card body is a no-op; only the **Manage API Key** button and the `⋮` dropdown remain interactive.
:::

---

## Manage API App modal

Trigger: click **Manage API Key** on any Brand Companion card. Title: **Manage API App for {Persona Name}**. Size: large. The modal has two distinct states.

### State 1 — no API App yet

When `persona.workspaceApiApp` is null:

> _Enable API App access to unleash your Brand Companion to the world. An API key will be created that you can use to integrate your brand companion on your own website._
>
> [➕ **Enable API App**]

Clicking **Enable API App** calls `createWorkspaceApiApp` with:

| Field | Value |
|---|---|
| `appName` | The persona's name (trimmed). |
| `personaId` | The persona's id. |
| `appType` | `Public` |
| `allowedDomains` | `[]` (empty — you set these in the next state) |

While the request is in flight the button shows a spinner; on success a toast appears: _"API app created"_. On failure the toast shows the parsed error message and the empty state remains.

### State 2 — API App exists

Renders the same `ApiAppCard` component used by the Developer API Apps page. You'll see:

- **Credentials block** — Client ID (`consumerKey`) and (for some app types) Client Secret. Use the copy buttons to grab them safely; the secret is shown only at certain moments.
- **Whitelisted domains editor** — the list of domains the companion is allowed to be embedded on. Defaults to empty for newly-created Public apps.
  - Click **Edit** to enter editing mode; the modal's parent tracks `isEditing` to keep the layout stable.
  - Add a domain with the input field; remove with the per-row delete button.
  - Click **Done** to exit editing.
  - **Until at least one domain is added, the companion is effectively unreachable** — the embed widget refuses to mount on any origin.
- **Credentials actions** — for Developer apps, this includes **Regenerate Client Secret**. For Public companion apps, regeneration is more restricted by design (you'd invalidate every embed at once).
- **Delete** — removes the API app. On delete, the modal closes and the grid refetches. The companion record itself is _not_ deleted — only the API app association. The card returns to "API key Inactive" and you can re-enable.
- **Close** (footer) — closes the modal without further changes.

---

## API App types: Public vs Developer

The Workspace API App model has two `appType` values, and they behave differently:

| | **Public** | **Developer** |
|---|---|---|
| **Created from** | Brand Companion card → Manage API Key → Enable API App | `/api-apps` page → **Create API App** |
| **Linked to** | A specific persona (`personaId`) | The workspace as a whole (no persona link) |
| **Domains** | **Required**. Empty list = embed inaccessible. | Optional — used for CORS where applicable, but not a gating mechanism. |
| **Use case** | Public embed of a Brand Companion on a customer-facing site | Server-to-server API access for backend integrations |
| **Credential rotation** | Restricted (avoids breaking every live embed) | Free-form regenerate from the card |
| **Visible on** | Both Brand Companion card modal _and_ `/api-apps` list | `/api-apps` list only |

::: warning Domain allowlist is security-critical
Whitelisted domains are the only mechanism preventing a third party from embedding your Brand Companion on their own page using your client ID. Treat them with the same care as a Content Security Policy: add the exact origin (`https://www.yourbrand.com`), not `*.yourbrand.com`. Subdomain wildcards are not currently supported.
:::

---

## Brand Companion Metrics page

Route: `/brand-companions/agents/{personaId}/metrics`. Document title: `Vurvey - {persona name} | Metrics`.

### Top bar

- **Back arrow** (`ChevronLeftIcon`) returns to `/brand-companions/agents`.
- **Metrics header** (`BrandCompanionMetricsHeader`) shows the persona avatar, name, and a small badge indicating Brand Companion status.
- **Date range input** (`DateRangeInput`) with start and end date pickers. **Defaults to the last 30 days.**
- **Apply** button (filled, brand style) — must be clicked to refetch with the new range. Until you click Apply, the chart still shows the previously applied range, so you can compare visually as you adjust pickers.

### Completion Rate Chart

The chart plots one metric: **`ConversationCompletionRateBetaV1`** — the rolling rate of conversations that reached a completion state versus those that abandoned. This is computed by nightly rollups in vurvey-api (`services/persona-chat-metrics/run-rollups.ts`) and only includes personas where both flags (`is_brand_companion` AND `brand_companion_metrics_enabled`) are true.

::: info Why is the metric labelled "Beta V1"?
The "Beta V1" suffix is part of the metric key in code (`PersonaChatMetricKey.ConversationCompletionRateBetaV1`). The completion definition and aggregation window may evolve as we observe how customers use it. When a v2 ships, the v1 series will remain queryable so existing dashboards don't break.
:::

### Blocked / empty states

The metrics page short-circuits to an EmptyState when any of these are true:

| Condition | Title | Description |
|---|---|---|
| The persona id in the URL doesn't resolve | **Brand Companion not found** | _This Brand Companion may not exist or you may not have access to it._ |
| The persona exists but `isBrandCompanion = false` | **Invalid Brand Companion** | _This persona is not a Brand Companion._ |
| The persona is a Brand Companion but `brandCompanionMetricsEnabled = false` | **Metrics unavailable** | _Metrics are not enabled for this Brand Companion._ |

In every blocked state the back arrow remains visible so you can return to the grid. Standard icon: `ChartsUsageIcon`.

### Loading / refetch behavior

- **Initial load** — full-page spinner while the persona and the first metrics page load.
- **Apply a new range** — the chart re-renders using the previous data while the refetch is in flight (smooth comparison), with an internal "refetching" overlay state driven by `NetworkStatus.refetch | setVariables`.
- **Errors** — surfaced as toast notifications, not blocking states; the previous chart remains so a transient backend hiccup doesn't blank the page.

---

## End-to-end: shipping a Brand Companion to your site

A typical launch flow:

1. **Build the persona** in [Agent Builder](/guide/agents). Iterate on prompt + capabilities until the responses are on-brand.
2. **Toggle Brand Companion + Metrics** on the persona. Save.
3. **Open the Brand Companions grid.** Confirm the persona appears with grey API key dot.
4. **Manage API Key → Enable API App.** Note the toast and that the API key dot turns green.
5. **Edit the API App → add your domain(s).** Add `https://www.yourbrand.com` (and any staging origins like `https://staging.yourbrand.com`). Click Done.
6. **Grab the Client ID** from the credentials block. Hand it to your front-end engineer.
7. **Embed the widget** on your site (see your engineering integration doc — the embed snippet is environment-specific).
8. **Verify the embed loads** on the production origin. If it 403s, the most common cause is a missing domain in the allowlist.
9. **24h later, open Metrics.** The first nightly rollup will populate the completion-rate chart for the previous day's window.

---

## Constraints & limitations

- **Admin-only.** The entire `/brand-companions` area redirects non-admins to `/`.
- **Population / Hidden personas excluded.** Even if you somehow set `isBrandCompanion = true` on a Population agent (Persona People), it will not appear in the grid (filter excludes `isPopulationAgent: true`).
- **One Public API App per persona.** The data model allows it, but the Manage API App modal renders only the singular `persona.workspaceApiApp`. To "rotate", delete and re-enable.
- **No wildcard domains.** Subdomain wildcards are not supported in the allowlist. Add each origin explicitly.
- **Metrics require both flags.** `is_brand_companion = true` alone is not enough; you also need `brand_companion_metrics_enabled = true` for nightly rollups to compute and the chart to render.
- **Metrics are nightly, not realtime.** The chart latency is up to ~24h depending on the rollup schedule. There is no realtime "live chat" counter on this page.
- **Date range is bounded by the rollup history.** If you only enabled metrics a week ago, picking a 90-day range will show empty days at the start.
- **Metric key is "Beta V1".** It may change. Don't pipe this page's numbers into external BI dashboards as a stable contract — use the API exports for that.

---

## Best practices

- **Name your companion clearly.** The persona name becomes the API App name and is visible in dashboards. _"YourBrand Concierge"_ is better than _"Companion v3 final FINAL"_.
- **Keep the allowlist tight.** Add only the exact origins you serve from. Treat it like a CSP, not a CORS sieve.
- **Enable Metrics from day one** — the rollups are cheap once enabled, and toggling on later means you lose insight into the early-launch period when usage signals are most informative.
- **Use staging origins.** Add `https://staging.yourbrand.com` (or whatever you use) so QA can test against the real Brand Companion before you ship the embed to prod.
- **Don't share Client IDs in screenshots.** While they're not as sensitive as secrets, an attacker with a Client ID and a misconfigured allowlist could embed your companion on their site.
- **Treat regenerating credentials as a last resort.** Every live embed using the old key will break. If you suspect a leak, prefer adding a fresh app and migrating the embed before deleting the old one.
- **Tighten the system prompt for public exposure.** Brand Companions face the open internet — adversarial input is more likely than in internal Agent surfaces. Lean on persona guardrails, refusal policies, and topic constraints in the [Agent Builder](/guide/agents).

---

## FAQ

#### Where do I create a new Brand Companion?
In **Agents**, not on the Brand Companions page. Create or open a persona in Agent Builder and toggle the **Brand Companion** flag. Save, then return to `/brand-companions/agents` and the new companion will be in the grid.

#### What's the difference between a Brand Companion and an Agent?
A Brand Companion **is** an Agent — it's the same `ai_personas` record, just with `is_brand_companion = true`. The flag opts the persona into the management grid, lets you attach a Public API App, and (if metrics are enabled) opts it into nightly completion-rate rollups. Everything else (prompt, capabilities, datasets, RAG, tools) works exactly the same.

#### Why is my Manage API Key button greyed out / disabled?
It shouldn't be — Manage API Key is always enabled. If you're confusing it with **View Metrics**, that button _is_ disabled when metrics are off. Check the status dots beneath the name to confirm.

#### Can a Brand Companion live on multiple domains?
Yes. Add each origin to the allowlist. Each origin must be explicit (no `*.yourbrand.com`).

#### My embed shows nothing / 403s. What's the most likely cause?
The origin isn't in the Whitelisted Domains list. Open **Manage API Key**, click **Edit**, add the exact origin (including protocol), click **Done**, and refresh the embed page. Browser cache can occasionally hold the failed state — hard-refresh once.

#### How do I rotate the Client Secret without breaking live embeds?
For Public apps, the safer pattern is to **create a second app on the same persona** (in code, not currently in the UI — open a support ticket), migrate your embed to the new app, then delete the old one. Outright regenerate on a Public app risks instant breakage.

#### Is there a feature flag I need to enable for Brand Companions?
No workspace-level on/off flag. The capability is generally available to admins. Individual feature gates that you _can_ toggle:
- **`is_brand_companion`** (per-persona, in Agent Builder) — whether the persona is a Brand Companion at all.
- **`brand_companion_metrics_enabled`** (per-persona, in Agent Builder) — whether nightly rollups compute and the metrics chart populates.

#### Does Magic Topics work for Brand Companions?
Not yet. [Magic Topics](/guide/mentions) is a coming-soon analysis surface; when it ships it will apply to mentions content, not Brand Companion conversations.

#### Are Brand Companion conversations stored?
Yes. Conversations flow through the same `ai_chat_conversations` tables as internal Agent chats and feed the nightly rollups. Retention follows your workspace's general data retention policy.

#### Can I @mention a Brand Companion from inside Vurvey?
Yes — Brand Companions are personas, so the `@mention` chat syntax works the same way in any Agent-aware chat input. See [Mentions](/guide/mentions#2-mention-syntax-in-chat).

#### Why is my completion rate stuck at zero?
Three possible reasons, in order of likelihood:
1. The companion went live only today — the first rollup hasn't run yet.
2. Conversations are starting but never reaching a defined completion state. Check your persona prompt — does it lead users to a natural close (a "thanks, anything else?" beat)?
3. The metric was disabled when conversations happened. Rollups only include data for windows where the flag was on; flipping it on now won't backfill.

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| `/brand-companions` bounces to home | Your role is not admin. Ask a Workspace Owner under **Workspace Settings → Members**. |
| Grid is empty even though I created a companion | The persona's `isBrandCompanion` flag isn't on. Open it in Agent Builder and toggle Brand Companion → Save. |
| Grid is empty and the empty state appears briefly then disappears | Re-fetch returned data; the empty state is a real moment between cache miss and network return. Not a bug. |
| Manage API Key modal endlessly spins on Enable API App | Backend create call is failing. Check the toast — common causes are workspace quota limits or a duplicate `appName` collision (the modal uses the persona name; rename the persona if needed). |
| Companion embed loads but rejects all messages | The Client ID is wrong, or the persona is not actually a Brand Companion (server validates `is_brand_companion`). Confirm both in Manage API Key and Agent Builder. |
| Status dot says "API key Active" but my Client ID is missing | You may be looking at the persona before the refetch returned. Close the modal, reopen it. |
| Metrics page shows "Metrics unavailable" | `brand_companion_metrics_enabled` is off. Open the persona in Agent Builder, toggle metrics on, save, return here. (Backfill is not automatic.) |
| Metrics page shows "Brand Companion not found" | The URL contains a stale or invalid `personaId`. Return to the grid via the back arrow. |
| Apply date range button does nothing | One of the date inputs is empty or invalid. The button disables when start or end is empty. |
| Chart is empty for the selected range | No completed conversations in that window, or rollups haven't run for those dates yet. Try a wider range starting after metrics-enable. |
| Developer API Apps menu item missing | You may not be on a build where `/api-apps` is exposed in the nav. Type the URL directly. If the page itself doesn't render, the workspace may not have `apiManagementEnabled` set. |

---

## Related guides

- [Agents](/guide/agents) — where you create the persona and toggle the Brand Companion flag
- [Mentions](/guide/mentions) — `@mention` a Brand Companion in chat; brand-feedback Reviews
- [Branding](/guide/branding) — workspace brand identity, used as default API app name
- [Canvas & Image Studio](/guide/canvas-and-image-studio) — visual canvases that can also be embedded
- [Settings](/guide/settings) — where workspace-level API management is enabled
- [Permissions & Sharing](/guide/permissions-and-sharing) — admin role gating across the app
- [Integrations](/guide/integrations) — the broader integration surface, including Developer API Apps
