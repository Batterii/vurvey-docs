---
title: Rewards
---

# Rewards

The **Rewards** page is where you pay out incentive money to people who completed (or partially completed) your campaigns. Vurvey rewards are powered by [**Tremendous**](https://www.tremendous.com/) — a third-party payout platform that handles the actual delivery (gift cards, ACH, PayPal, charity donations) on behalf of your workspace.

This page is _not_ a generic workspace expense ledger. Every reward you send is tied to a specific **campaign response** by a specific **respondent**. Workspace-level Tremendous configuration (API key, default campaign, default funding source) is reached from this page too.

![Rewards page with table and bulk-action toolbar](/screenshots/rewards/01-rewards-main.png)
> 📷 _Screenshot pending: Tremendous Integrate modal — Step 1 (API key)_
> 📷 _Screenshot pending: Tremendous Integrate modal — Step 2 (campaign + funding)_
> 📷 _Screenshot pending: Send Reward modal — defaults path_
> 📷 _Screenshot pending: Send Reward modal — Choose payment source toggle_
> 📷 _Screenshot pending: Send Reward modal — Sending… progress state_
> 📷 _Screenshot pending: Disconnect Tremendous? confirmation modal_

---

## Quick map of the page

| Section | What's here |
|---|---|
| **Header actions** (top right) | _When you can manage Tremendous_: **Enable / Disable**, **Configure**, **Disconnect**. _When you cannot_: nothing. |
| **Toolbar** | Search input, Campaigns filter, **Completes Only** checkbox, bulk **Send Rewards (N)** button (appears only after row selection). |
| **Table** | One row per response. Columns: **Name**, **Campaign**, **Completed**, **Rewards**, plus an `⋮` action menu and a select checkbox. 100 rows per page by default. |
| **Modals** | Tremendous Integrate (configure), Send Reward (issue payouts), Disconnect (confirm removal of API key). |
| **Empty states** | Not configured → Configure CTA. Configured but disabled → help text. No rows → empty table. |

Browser tab title: **Vurvey - Rewards**.

---

## Access & permissions

The page itself is reachable by anyone with workspace access. The **management actions** (Configure, Enable, Disable, Disconnect) are gated by a permission whose name contains the substring `tremendousSettings` — checked client-side:

```ts
permissions.some(value => value.includes("tremendousSettings"))
```

Typically that means a workspace **Owner** or **Admin**. Members/Viewers can land on the page and see the table (if rewards are already configured and enabled), but they will not see the management buttons in the header. The empty state will show a message instead of a Configure button:

> _You do not have permissions to set up rewards. Contact an admin or your workspace owner._

There is no separate "send rewards" permission — if you can see the table on an enabled workspace, you can issue rewards. Restrict the page through workspace role, not through a separate feature flag.

---

## Three workspace states

The page's body switches based on workspace reward configuration:

### State A — Not configured

No `workspaceRewardSettings` exist. The body renders an **EmptyScreen** for `REWARDS` with either:

- **Configure Tremendous** button (for users with the permission) → opens the Integrate modal
- A "You do not have permissions…" message (for everyone else)

### State B — Configured but disabled

A reward setting exists with `enabledStatus = false`. The body renders a help paragraph:

> _You have rewards integrated but they are not enabled. If you cannot enable them contact your workspace owner or an Admin._

Management buttons (for permissioned users) include **Enable** to flip it back on.

### State C — Configured and enabled

`workspaceRewardSettings[0].enabledStatus = true`. The full responses table renders with the toolbar above it. This is the normal day-to-day state.

::: tip Why a separate Disabled state?
Tremendous settings can be flipped off without removing the API key. This lets you pause payouts during a freeze, an audit, or a campaign rollover without re-entering credentials. The credentials are only removed when you click **Disconnect** and confirm.
:::

---

## Header actions (admin only)

When the workspace has reward settings and you have the `tremendousSettings` permission, the header right side shows:

| Button | Style | When | What it does |
|---|---|---|---|
| **Enable** | filled | `enabledStatus` is false | Calls `updateTremendous({enable: true})` and flips the page to State C. |
| **Disable** | danger | `enabledStatus` is true | Calls `updateTremendous({disable: true})` — credentials stay, but the page returns to State B. |
| **Configure** | default | Always (in C/B) | Reopens the Tremendous Integrate modal to update settings — particularly the default campaign and funding source. |
| **Disconnect** | danger | Always (in C/B) | Opens a confirmation modal. On confirm, removes the API key entirely and the workspace returns to State A. |

### Disconnect confirmation modal

Title: **Disconnect Tremendous?**

Body: _This will remove your Tremendous API key and disable rewards. You can reconnect at any time by entering a new API key._

Buttons: **Cancel** / **Disconnect** (danger). While the mutation runs, the Disconnect button on the page is disabled (it tracks the mutation's `loading` state). On success, a toast appears: _"Tremendous integration disconnected"_.

---

## Tremendous Integrate modal (Configure)

Trigger: **Configure Tremendous** from the empty state, or the **Configure** header button later. Two steps.

### Step 1 — API key

A simple input for your Tremendous **API key**. Click **Next** to validate (calls the `setTremendousKey` mutation). If the workspace already has an API key stored (`apiKeySet = true` in the parsed configuration JSON), the modal opens directly on Step 2.

### Step 2 — Default campaign & funding source

The modal queries `GET_FUNDING_AND_CAMPAIGNS` for the workspace. Two dropdowns appear:

- **Campaign** — pulls from `workspace.tremendousCampaigns`. The "campaign" here is a **Tremendous campaign** (a Tremendous-side container that controls things like the catalog of reward options and the email template), NOT a Vurvey campaign.
- **Funding source** — pulls from `workspace.tremendousFundingSources`. Each option label is formatted `"{method}: ${available_cents converted to dollars}"`, e.g. _"balance: $1,250.00"_.

Click **Finish** to call `updateTremendous` with `{enable: true, defaultCampaignId, defaultFundingId}` and close the modal. A success toast confirms the update.

If you have no Tremendous campaigns or no funding sources in Tremendous, **Step 2 is blocked** — set them up in Tremendous first, then return here.

::: warning Tremendous "campaign" vs. Vurvey "campaign"
These are two different things. A **Tremendous campaign** governs what payout options recipients see and the brand of the email they receive. A **Vurvey campaign** is your in-app survey/research project (formerly "Survey"). The Rewards page uses both — keep them mentally separate.
:::

---

## The responses table

Single GraphQL query (`GET_REWARDS_DATA`) returns up to **100 responses per page**, plus a `remaining` count for pagination.

Server-side filter:

```ts
filter: {
  name: search || undefined,
  completed,                       // true when "Completes Only" is checked
  surveyIds: surveyIds || undefined,
  excludeDeletedUsers: true,       // hard-coded — you can't pay users with no email
}
```

**Note**: `excludeDeletedUsers: true` is hard-coded — responses from users who deleted their account never appear in this table even though they show up everywhere else for analysis. This is intentional: without a valid email we cannot deliver a Tremendous payout.

### Columns

| Column | Sortable | What's shown |
|---|---|---|
| **Name** | ✓ asc/desc | Respondent avatar + display name + community tag (`NewAvatar showName showTag`). |
| **Campaign** | ✓ A→Z / Z→A | Name of the Vurvey campaign this response belongs to. Resolved from a parallel `useSurveyNames` query. |
| **Completed** | ✓ oldest/most recent | Formatted completion timestamp, or the literal text `Partial` if the response was never finalized. |
| **Rewards** | ✓ last-reward-sent asc/desc | Existing reward entries for this response, rendered as `{currency-symbol}{amount} (status)`. If no rewards yet: _"No rewards"_. |
| _(no header)_ | — | `⋮` dropdown with **See Campaign** (deep-links to `/survey/{surveyId}/results`) and **Send Reward** (single-row payout). |
| _(checkbox)_ | — | Per-row selection. The header checkbox toggles **Select All**. |

Sort cycles per click: not-sorted → ascending → descending → cleared. Clearing falls back to `ResponsesSort.Default`.

The reward status string (in parentheses) is what Tremendous reports back: typical values include `pending`, `delivered`, `succeeded`, `failed`. Statuses update on subsequent refetches (or when a new reward is sent and the cache writes back).

---

## Toolbar controls

### Search

A debounced input placeholder _**"Search by creator name…"**_. Filters by respondent name on the server. Changing the search resets row selection (an obvious safety measure — you should not select people in one filter, then send to a different set after re-filtering).

### Campaigns filter (`SearchableFilter`)

Placeholder _"All Campaigns"_. Selecting one or more campaigns scopes the table to responses in those campaigns. The button label changes:

- 0 selected → _"All Campaigns"_
- 1 selected → _"1 campaign"_
- N selected → _"N campaigns"_

A **Clear** action removes the filter entirely. Changing the campaigns filter also resets row selection.

### Completes Only checkbox

When checked, filters to responses where `completedAt` is non-null. Useful when your incentive policy is "only completers get paid". Unchecked includes partials (which show "Partial" in the Completed column).

### Bulk Send Rewards button

The blue **Send Rewards (N)** button appears in the toolbar **only when you have at least one row selected**. The number is dynamic:

- Without **Select All**: the count of explicitly-checked rows.
- With **Select All** active: `responses.items.length + responses.remaining` — i.e. every response that matches the current filter, not just the ones currently visible. Use carefully.

---

## Sending a reward

Three entry paths converge on the same **Send Reward** modal. The difference is what the modal's "creator count" reads.

### Path 1 — Single row

In the row's `⋮` menu, click **Send Reward**. The modal opens with `creatorCount = 1`. The mutation runs with `responseIds = [thisResponse.id]`, `surveyId = thisResponse.surveyId`.

### Path 2 — Multi-select

Tick checkboxes on multiple rows (across multiple campaigns is fine), then click **Send Rewards (N)** in the toolbar. The modal opens with `creatorCount = N`. The mutation runs once per surveyId — rows are grouped by `surveyId`, deduplicated, and `sendRewards` is invoked for each group. A single success toast fires after the **last** group resolves: _"Sent rewards out to selected users"_.

### Path 3 — Select-all-by-filter

Tick the header checkbox to enter **Select All** mode. The visible rows turn checked AND the system enters a mode where the count includes every matching row in the database (`items + remaining`). Click **Send Rewards (N)**. The modal opens; on Pay, the mutation is invoked **once** with:

```ts
{
  useFilter: true,
  filter: {name: search, completed, surveyIds},
  settingsForFilteredRewards: {amount, currency, fundingId, campaignId},
}
```

The server expands the filter on its side and issues rewards to every match. This is the only path that can issue payouts to more rows than were ever fetched by the client. **Double-check your filter before clicking Pay.**

::: danger Select-all sends across page boundaries
Select All does not just mean "rows currently visible" — it means "every row matching the current search + campaigns + completes filter on the server, even those past page 1". If you searched for "John", checked Completes Only, then hit Select All → Send Rewards, you may pay 200 people you never saw on screen. Always confirm the count in the button label before clicking Pay.
:::

---

## Send Reward modal

Title: **Send reward**. Header image: Tremendous logo.

### Defaults & pre-fill

- The amount input starts empty unless a **single campaign filter** is active — in that case the modal queries `GET_SURVEY_INCENTIVE` for that survey and pre-fills `value` with `survey.incentiveAmount` and `currency` with `survey.incentiveCurrency`. So if you set "$5 USD" as that campaign's incentive when you created it, this modal arrives pre-filled with $5 USD.
- The **currency** dropdown stays at whatever you last chose, even across modal opens (deliberately not reset on close — common case is "I'm sending another USD reward").

### Currency

Supported types come from the GraphQL enum `TremendousCurrencyType`:

| Code | Name |
|---|---|
| `USD` | United States Dollars |
| `EUR` | Euro |
| `CAD` | Canadian Dollars |
| `GBP` | British Pounds |

The currency symbol next to the amount and on the Pay button reflects the selection (`$`, `€`, `C$`, `£`).

### Payment source: defaults vs override

Below the amount, the modal shows the payment-source area:

- **Default path** (toggle off): _"You are paying using your set up defaults."_ — i.e. the workspace's default campaign + funding source.
- **Override path** (toggle on, link reads _"Choose payment source"_): two dropdowns appear: **Campaign** (Tremendous campaigns for this workspace) and **Funding** (Tremendous funding sources, labelled with available balance). The toggle link flips to _"Use defaults"_ when you've expanded.

The override choices only persist for that send — close the modal and they reset.

### Total & confirm

The Pay button is labelled `Pay (${currency-symbol}{amount × creatorCount})`. So if you typed $5 with 12 creators selected, the button reads **Pay ($60.00)**.

Disable conditions:

- Amount is empty or `0.00`
- In Override mode, Campaign or Funding is unset
- A previous click is still in flight (`disableButton = true`)

While the mutation runs, the modal body switches to a spinner with the label **Sending rewards…**. On success, the modal closes, a toast fires, and the row(s) in the table refresh with the new reward chip(s) (cache write-back via `REWARD_FRAGMENT`).

### Tremendous fee notice

Below the actions row, a small italic note: _**\*Tremendous may charge 2.5% per reward sent out.**_ — this is informational; the fee is taken on Tremendous's side and is not reflected in the Pay total shown in the modal.

---

## Polling & freshness

While the page is open, `GET_FUNDING_SOURCES` is polled **every 15 seconds** (`startPolling(15000)`). This keeps your visible balance and funding source list current without requiring a manual refresh — particularly useful when you've just topped up your Tremendous balance and want to verify it landed before sending a large batch.

Polling stops on page unmount.

---

## Reward status lifecycle

A reward, once sent, moves through Tremendous-side statuses. Common values you'll see in the **Rewards** column in parentheses:

| Status | Meaning |
|---|---|
| `pending` | Created on Tremendous side; not yet processed. |
| `succeeded` / `delivered` | Tremendous delivered the reward email/payment to the recipient. |
| `failed` | Tremendous rejected it (e.g. invalid recipient email). |
| `revoked` | Tremendous-side revocation (rare). |

Statuses update on subsequent refetches; if you need an authoritative view, check the Tremendous dashboard directly using the campaign and reward IDs.

---

## Constraints & limitations

- **Tremendous only.** No other payout providers are wired up. The data model has a `RewardTypeName` enum, but `Tremendous` is the only implemented type.
- **Deleted-user responses are silently excluded.** They never appear in this table.
- **Bulk send across many campaigns hits the API once per campaign.** A bulk of 50 people spread across 5 campaigns = 5 mutation calls under the hood. Failures are per-call; a partial failure mid-way will leave some campaigns paid and others not. Watch the toast.
- **Select All ignores page boundaries.** It is filter-scoped, not page-scoped.
- **Currency is per-reward.** You can pay USD to one batch and EUR to another, but a single Send Reward modal sends one currency to all selected rows.
- **The Tremendous fee (~2.5%) is not included in the Pay total** shown in the modal — it's a separate charge from Tremendous to your funding source.
- **The "tremendousSettings" permission is matched by substring,** not equality. Custom roles defining anything containing that substring will gain management access. Audit before issuing custom permissions.
- **No undo.** Sent rewards cannot be reversed from Vurvey. Revoking has to be done in the Tremendous dashboard, and only for statuses where Tremendous allows revocation.

---

## Best practices

- **Pre-fill incentive amounts on the campaign.** Set `incentiveAmount` / `incentiveCurrency` when you create the campaign. The Send Reward modal will auto-fill those values whenever you filter to that single campaign — fewer errors, less re-typing.
- **Use the single-campaign filter before any bulk send.** It forces the modal to pre-fill the right amount, and it visually narrows the table so you confirm the count.
- **Always confirm the Pay button label** before clicking. The total is a sanity check against fat-fingered amounts (`$50` instead of `$5` × 100 = $5000).
- **Top up Tremendous balance ahead of large batches.** The 15s polling means you'll see the balance update in the Choose Payment Source dropdown shortly after.
- **Disable rather than Disconnect** when pausing rewards. Disabling preserves the API key; you just flip it back on when you're ready. Disconnect requires re-entering the key.
- **Reconcile against the Tremendous dashboard weekly.** Vurvey's status column reflects what Tremendous reported at last refetch; the canonical record lives on Tremendous's side.

---

## FAQ

#### Is Tremendous the only payout option?
Yes. There is no Stripe, PayPal-direct, or check-mail path today. Tremendous can fulfil with a wide variety of options on its side (gift cards, ACH, PayPal accounts, etc.) — your **Tremendous campaign** controls which of those options the recipient sees.

#### Can I pay a respondent who deleted their Vurvey account?
No. The table hard-filters out deleted users (`excludeDeletedUsers: true`) because we no longer have an email address to deliver to. This is one of the few places in Vurvey where deleted-user data is excluded by default.

#### How is the Pay total calculated?
`Pay = amount × creatorCount`. The `creatorCount` is 1 for single-row sends, the number of checkboxes ticked for multi-select sends, and `responses.items.length + responses.remaining` for Select All.

#### Are partials rewardable?
Yes — until you check **Completes Only**. The table's Completed column will read _"Partial"_ for those rows. You can still send. Whether it's _appropriate_ to pay partials depends on your incentive policy.

#### Will sending a reward send the recipient an email immediately?
That depends on the **Tremendous campaign**'s configured delivery. Most setups email immediately on `created`. The Tremendous campaign's settings (not Vurvey's) govern subject, sender, and the catalogue the recipient picks from.

#### Why doesn't the Pay total include the 2.5% fee?
Because that fee is taken by Tremendous on top, against your funding source. The total in the modal is the amount paid to recipients. The fee shows up on your Tremendous account, not in Vurvey.

#### Can I refund a sent reward?
Not from Vurvey. Go to the Tremendous dashboard. Whether revocation is possible depends on the reward's current status and the delivery method.

#### Does Select All include rows on subsequent pages?
Yes — it's filter-scoped, not page-scoped. The Send Rewards button label is the safe place to check the real count. _"Send Rewards (243)"_ means 243, not just the 100 you can see.

#### Can I send different amounts in a single bulk?
No. The Send Reward modal sends one amount and one currency to every selected row. For per-row variability, issue rewards one at a time using each row's `⋮` → Send Reward.

#### Is there a feature flag I need to enable?
No workspace flag for Rewards itself — visibility is purely about whether the workspace has Tremendous configured. The **tremendousSettings** permission gates the management actions; the role assignment is what flips that on for a user.

#### What permissions does my Tremendous API key need?
At a minimum, `campaigns:read`, `funding_sources:read`, and `rewards:create` on the Tremendous side. Consult the Tremendous API docs for the most up-to-date scopes.

#### Can I issue Vurvey credits or non-cash rewards?
Not as a Tremendous-routed reward today. Internal credit management lives on a separate part of the system.

#### Why is the page polling all the time?
To keep your funding-source balance current. If you top up Tremendous mid-session, the next 15s tick refreshes the balance shown in the Choose Payment Source dropdown.

#### Does the page still render if the workspace has rewards but I cannot manage them?
Yes. You'll see the toolbar and table without the Configure/Enable/Disable/Disconnect buttons in the header.

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| Page is blank in the body | Either no campaigns yet (so `surveyNames` is empty), or `workspaceRewardSettings` is still loading. Refresh after a beat. |
| **Configure Tremendous** button is missing | You don't have a permission whose name contains `tremendousSettings`. Ask a workspace Owner. |
| Step 2 of the Integrate modal is blocked | No Tremendous campaigns or no funding sources exist in your Tremendous account. Create them there first. |
| Send Reward modal opens with empty amount | No single campaign filter is active, so it can't pre-fill from `incentiveAmount`. Either filter to one campaign, or type the amount. |
| Pay button is disabled | Amount is empty/zero, or you toggled to Choose Payment Source and haven't picked Campaign + Funding yet, or a previous Pay is still in flight. |
| Selected rows reset themselves | Changing search or campaign filters resets selection by design — prevents cross-filter sends. |
| Bulk send finishes but only some rows show new rewards | Multi-campaign bulk fires one mutation per campaign. Some succeeded, some failed. Check the toast / console for the failed call. |
| Reward status stays `pending` for a long time | Tremendous-side delay. Check the Tremendous dashboard directly with the reward ID. |
| Reward status is `failed` | Most common cause: invalid email on the respondent record. Less common: insufficient funds at send time. |
| Funding-source balance is stale | Wait 15s for the next poll, or refresh the page. |
| "Disconnect" is disabled | The disconnect mutation is in flight from a previous click. Wait for the toast. |
| I sent a reward to the wrong person | Open the Tremendous dashboard; if the reward hasn't been redeemed and the delivery method allows it, revoke it there. There is no Vurvey-side undo. |

---

## Related guides

- [Campaigns](/guide/campaigns) — set per-campaign `incentiveAmount` and `incentiveCurrency` so the Send Reward modal pre-fills correctly
- [People](/guide/people) — respondent profiles and identity (rewards are tied to the response's `user`)
- [Settings](/guide/settings) — workspace permissions and roles that control the `tremendousSettings` gate
- [Permissions & Sharing](/guide/permissions-and-sharing) — broader role model for who can see and manage rewards
- [Integrations](/guide/integrations) — the broader integration surface (Tremendous is one of several)
