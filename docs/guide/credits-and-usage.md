---
title: Credits & Usage
---

# Credits & Usage

Every workspace runs on a **credit balance**. AI calls, campaign responses, and persona conversations all draw from that balance. This doc explains how the credit system works end-to-end — what consumes credits, where to see your balance and history, how rates are determined, and how to manage credit budgets across teams.

> 📷 _Screenshot pending: Usage tab — Activity charts at top + Credit Usage card below_

---

## At a glance

| Concept | What it is |
|---|---|
| **Credit balance** | A running total of credits available to your workspace. Can go negative on overage. |
| **Credit transaction** | Any change to the balance — top-ups (positive), deductions (negative), or admin adjustments. Every transaction is logged. |
| **Credit rate** | The current price-per-unit. Three distinct rates: creator answer, agent answer, persona conversation. |
| **Effective date** | Rates are time-versioned — the system picks the most-recent rate with effective date on or before "now." Future rates can be queued without affecting today's reporting. |
| **Activity charts** | 30-day rolling-window metrics on Creators, Engagements, and Insights — separate from credit consumption. |

---

## How to reach the Usage view

Navigate to **Campaigns → Usage** tab.

> 📷 _Screenshot pending: Campaigns tab strip with Usage highlighted_

::: tip Flag note: where Usage lives
The Usage tab's location depends on the `moveusagetoworkspacetab` runtime flag:
- **Flag off** (default for most workspaces): Usage is a tab inside Campaigns.
- **Flag on**: Usage is moved to a workspace-level tab outside Campaigns.
Either way the page content is identical. See [Feature Flags Reference → moveusagetoworkspacetab](/guide/feature-flags#moveusagetoworkspacetab).
:::

The Usage page has two stacked surfaces:

1. **Activity Charts** at the top — three rolling-window stat cards
2. **Credit Usage** card below — current balance, period deductions, chart, transactions table

---

## Activity Charts (top section)

Three cards showing **30-day rolling-window** metrics with prior-period comparison:

> 📷 _Screenshot pending: Three activity cards side-by-side_

### Creators

| | |
|---|---|
| **What it counts** | Unique creators (contactCount) contributing in the workspace |
| **Window** | Trailing 30 days |
| **Comparison** | % change vs. prior 30 days |
| **Sparkline** | Cumulative growth across the window |

### Engagements

| | |
|---|---|
| **What it counts** | Total responses (answerCount) — every answer to every campaign question, including AI-agent answers |
| **Window** | Trailing 30 days |
| **Comparison** | % change vs. prior 30 days |
| **Units label** | "responses" |

### Insights

| | |
|---|---|
| **What it counts** | Total response duration (answerDuration), expressed in video minutes |
| **Window** | Trailing 30 days |
| **Conversion** | Raw value is in milliseconds; the card divides by 60,000 to display minutes |
| **Comparison** | % change vs. prior 30 days |

Each card shows: the lifetime total (top, large), the last-30-day count, and a comparison arrow (↑ / ↓ / no-change) vs. the prior 30 days.

::: warning Activity ≠ credit consumption
These are platform-engagement metrics, not credit-consumption metrics. A creator answering 5 questions counts as 5 engagements but consumes credits at the creator-answer rate × 5. To see consumption, look at the Credit Usage card below.
:::

---

## Credit Usage card (bottom section)

> 📷 _Screenshot pending: Credit Usage card with balance display + chart + transactions table_

### Header — Current Balance + Period Deductions

The top of the card shows two side-by-side values:

- **Current Balance**: Total credits remaining in the workspace. Loaded from `workspaceCreditBalance(workspaceId)` (no filter — total).
- **Credits Used (during selected period)**: The sum of all **negative** transactions in the date range you've selected. Loaded from `workspaceCreditBalance(workspaceId, filter: {startDate, endDate, amountType: Negative})`.

Both values use `network-only` fetch policy — they always re-fetch from the server to ensure freshness when persona-conversation credits or other deductions might have just been applied.

::: tip Negative-balance display
If `totalBalance < 0`, the card switches to a `negativeBalance` style (different color + emphasis). Workspaces are allowed to go negative — typically meaning credit will be deducted from your next top-up — but the visual signals you've crossed zero.
:::

### Date Filter

> 📷 _Screenshot pending: Date filter controls — Start date, End date, Apply, Reset buttons_

Two date pickers plus Apply / Reset buttons. Behavior:

- **Draft state**: Edits to start/end dates update local draft values until you click Apply.
- **Apply**: Pushes the draft into active filter; refetches `periodDeductions` and the transactions table.
- **Reset**: Clears the date filter back to "no filter" — shows all-time deductions and transactions.
- **Apply button is disabled** when there are no unsaved changes (`hasUnsavedChanges` false).

### Credit Chart

> 📷 _Screenshot pending: Credit usage chart showing deductions over time_

A time-series chart showing credit deductions over the selected period. Useful for spotting:

- Spikes from large campaigns
- Steady-state persona-conversation costs
- Sudden surges that might indicate a misconfigured run

### Credit Transactions Table

> 📷 _Screenshot pending: Paginated transactions table with columns_

A paginated, sortable table of individual credit transactions. **Page size**: 20 rows by default. Columns:

| Column | What it shows |
|---|---|
| **Date** | Effective date of the transaction (formatted via date-fns) |
| **Amount** | Positive (credit added) or Negative (credit deducted) |
| **Note** | Free-text annotation. Set by admin top-ups, system-generated for response deductions |
| **User** | The user attributed to the transaction (firstName + lastName), if any |
| **Survey / Source** | If the transaction is tied to a campaign response, the linked survey name shows here |

The table uses cursor-based pagination — when you scroll/click to load more, it fetches the next 20 using `cursor`. The `remaining` field tells you how many more transactions are available beyond what's loaded.

**Sort options** map to a `WorkspaceCreditSort` enum on the API side — typically by effective date asc/desc.

---

## How credits are consumed

There are **three rates** that drive consumption, and they're all defined on the same `CreditRate` schema in the API.

### 1. Creator survey answer credit

Charged when a **human respondent** (Creator) answers a question on a campaign.

| | |
|---|---|
| **API field** | `creatorSurveyAnswerCreditAmount` |
| **Effective field** | `effectiveCreatorSurveyAnswerCreditAmount` |
| **Charged per** | Each answer to each question |
| **Formula** | `participants × rate × questions × creatorCreditMultiplier` |
| **Multiplier** | Defaults to 1; some campaign types apply a higher multiplier |

If you have a 10-question survey and 100 Creator respondents at a rate of 1 credit per answer, that's `100 × 1 × 10 × 1 = 1,000` credits.

### 2. Agent survey answer credit

Charged when an **AI Agent** (persona) answers a question on a campaign — typically as part of an AI Simulation, where you're using synthetic respondents instead of (or alongside) real humans.

| | |
|---|---|
| **API field** | `agentSurveyAnswerCreditAmount` |
| **Effective field** | `effectiveAgentSurveyAnswerCreditAmount` |
| **Charged per** | Each AI-answered question |
| **Typical rate** | Higher than creator rate (synthetic responses cost compute) |
| **Linked flag** | Requires `aiSimulationEnabled` on the workspace to enable AI-simulation flows |

::: tip Why the rate is higher
Each AI answer is a real LLM call (typically GPT-4-class or Claude-class), so the per-answer cost has to cover model inference. Real humans don't have that compute cost — Vurvey pays them via Tremendous for participation; that's billed separately as rewards.
:::

### 3. Persona conversation credit

Charged when a user holds a chat conversation with an AI persona — each persona reply may incur a credit charge.

| | |
|---|---|
| **API field** | `personaConversationCreditAmount` |
| **Effective field** | `effectivePersonaConversationCreditAmount` |
| **Charged per** | Each billed persona reply |
| **Gated by** | `personaconversationcredits` runtime flag |
| **Flag exposed** | `personaConversationCreditsEnabled` on `useBillingContext()` |

Only the persona-conversation flow honors this charge — chats with the system's default agent (non-persona) or chats inside a Capability are billed differently. See [Home → Population Persona Modal](/guide/home#the-population-persona-modal) for the user-facing **Billed** badge that signals when the toggle is on.

If `personaconversationcredits` is OFF, this rate isn't applied even if the rate value is set in the database.

### Other consumption (less common)

| Source | Charged at | Notes |
|---|---|---|
| Workflow runs | Calculated per-step on the backend | Each agent task + each model call within a workflow draws credits. Not exposed as a simple per-unit rate. |
| Capability runs | Variable | A Capability is a workflow under the hood; its cost depends on the workflow it triggers. |
| Topic Graph processing | Internal | Topic Graph extraction happens via background jobs; cost is folded into campaign processing |
| Image generation (Image Studio) | Per-image | Variable rate depending on model |

These "other" sources still appear in the credit transactions table as deductions, but they aren't quoted as a public per-unit rate the way the three core rates are.

---

## How credit rates are managed

> 📷 _Screenshot pending: Admin Credit Rates page — current / scheduled / historical sections_

Vurvey staff with the Support or Enterprise role can manage credit rates from the **Admin → Credit Rates** page. The page is organized into three sections:

### Current rate
The rate active **right now**. There's always exactly one current rate. The system identifies it by finding the rate whose effective date is most recent on-or-before today.

### Future rates
Scheduled rate changes — rates with effective dates **after today**. Multiple future rates can be queued, sorted ascending. When a future date arrives, that rate becomes the new current rate (no manual switch needed).

### Historical rates
Rates whose effective date is **before today** and are no longer current. Hidden by default behind a "Show historical" toggle — click to expand. Historical rates can NEVER be edited or deleted; they're frozen for audit.

### Operations available

| Action | Who | When |
|---|---|---|
| Create new rate | Support / Enterprise role | Future rate changes |
| Edit existing rate | Support / Enterprise role | Future or current rates only (not historical) |
| Delete rate | Support / Enterprise role | Confirmation modal; cannot delete the current rate |

::: warning Edits create new rate records
Edits to credit rates don't mutate old transactions — they only change rates from a forward date. Historical transactions retain whatever rate was effective when they happened. This means refunds-by-recalculation are impossible at the credit-rate level; rate changes are forward-only.
:::

### Adding credits to a workspace

Admins can credit (or debit) a workspace directly via the **Add Workspace Credit** card.

> 📷 _Screenshot pending: Add Workspace Credit card with amount + note + Submit_

| Field | Purpose |
|---|---|
| **Amount** | Positive number to add, negative to deduct |
| **Note** | Free-text explanation (visible in the transactions table) — strongly recommended |
| **Submit** | Calls `addWorkspaceCredit` mutation; refetches balance; shows toast |

A positive amount shows the toast "Added X credits to workspace"; a negative amount shows "Deducted X credits from workspace". The mutation refetches `GET_WORKSPACE_CREDIT_BALANCE` so the UI immediately reflects the new total.

::: tip Use notes generously
The Note column on the transactions table becomes critical for audits. "Added 50,000 credits — Q3 enterprise top-up" or "Deducted 10,000 — refund for stuck workflow run" beats blank notes a year later when someone asks what happened.
:::

---

## Billing data (subscriptions + cards)

Separate from raw credits, the workspace also has **subscription billing data** — the credit card on file, next payment date, trial state, and monthly-active-creator count.

> 📷 _Screenshot pending: Subscription / payment section_

| Field | Source | What it shows |
|---|---|---|
| **Card** | `billingData.card` | Brand (Visa, MC, Amex, etc.), last 4 digits, exp month/year |
| **Next Payment** | `billingData.nextPayment` | Amount + Date of the next scheduled charge |
| **Cancel-at-period-end** | `billingData.cancelAtPeriodEnd` | If true, the subscription will end at `periodEnd` |
| **Period End** | `billingData.periodEnd` | Current billing period end date |
| **Trial Active** | `billingData.isTrialActive` | Whether the workspace is in trial |
| **Monthly Active Creators** | `billingData.monthlyActiveCreators` | MAC for plans that meter on this |

::: tip Credit card brand enum
The `CreditCardBrand` enum is generated by the API and uses PascalCase keys — `Visa`, `Mastercard`, `AmericanExpress`, `Discover`, etc. The web client imports it directly from generated GraphQL types to prevent drift.
:::

---

## Workspace flag dependencies

Several workspace and runtime flags affect how billing displays:

| Flag | Effect when off | Effect when on |
|---|---|---|
| `appLimitsEnabled` | No usage limits enforced | Quota checks active on plans with quotas |
| `personaconversationcredits` | Persona chats are free even with the rate set | Persona replies incur the `personaConversationCreditAmount` charge |
| `moveusagetoworkspacetab` | Usage lives under Campaigns | Usage moved to workspace-level tab |
| `aiSimulationEnabled` | No AI-agent answer flow | AI agents can answer campaigns, charged at agent rate |

See [Feature Flags Reference](/guide/feature-flags) for the full inventory.

---

## Constraints & limitations

- **Credit balance is per-workspace, not per-team.** If your org has multiple workspaces, each one has its own balance and rates. You can't transfer credits between workspaces today.
- **Rates are global, not per-workspace.** All workspaces use the same effective rate; if a customer needs a special rate, that's a contract conversation, not a UI control.
- **Negative balances are allowed.** The UI styles them differently but the system doesn't block work. Account leads enforce overage policies offline.
- **Trial credits don't replenish.** Once a trial workspace burns its starting allocation, it goes negative until converted to paid.
- **Historical rates are immutable.** No editing, no deleting. Past transactions retain their effective rate.
- **The transactions table is paginated, not exportable in-app.** For audit-grade exports, ask CSM — there's a backend tool that produces CSV.
- **Period filter limits chart and transactions table; not balance.** The "Current Balance" value always reflects all-time, regardless of date filter.
- **`workspaceCreditBalance` accepts an `amountType` filter** (`Negative`, `Positive`, `All`). The V2 query uses GraphQL field aliasing to fetch both unfiltered total and filtered period deductions in a single request.
- **Capability + Workflow runs don't show a pre-flight cost estimate.** Unlike campaigns (which use `calculateEstimatedCreditCost` to project), workflow consumption is computed only after the fact.

---

## Best practices

- **Set a baseline alert with your CSM.** Vurvey can configure backend alerts when balance crosses a threshold; no UI for this today.
- **Filter to "last month" before reviewing in monthly business reviews.** Default view is all-time, which often hides current-month trend.
- **Use the Note column religiously when adding credits manually.** Future-you (or another admin) will thank present-you.
- **Estimate before launching a multi-thousand-creator campaign.** Use `calculateEstimatedCreditCost(participants, rate, questions, creatorMultiplier)` mentally: a 10k-creator × 10-question survey at 1 credit/answer = 100k credits.
- **Audit persona-conversation usage when enabling the flag for the first time.** The first month after `personaconversationcredits` flips on usually shows a step-change in deductions.
- **Schedule rate changes via future-dated rates rather than editing the current rate.** This preserves cleaner audit trails and lets users see what's coming.
- **Don't share credit-rate dashboards with end users.** They're staff-only by design — the front-end role check (`isSupportOrEnterpriseRole`) hides the admin path from regular users.

---

## FAQ

#### Why is my balance negative?
You've spent more credits than you had. The workspace continues to function — Vurvey doesn't hard-block usage on overage — but the next top-up will be reduced by the overage. Talk to your CSM if this is unexpected.

#### Why is "Credits Used" different from the sum of transactions in the table below?
- The **balance card** uses the date filter you've selected; the **table** shows only the page you're on (20 rows at a time).
- The balance card sums all negative transactions in the period; the table includes both positive and negative.
- Pagination means you might be looking at the most-recent 20 transactions while the balance reflects all the older ones too.

#### How do I export my credit history?
There's no in-app export today. CSMs can request a CSV from the backend on request.

#### Will I get a notification before I run out of credits?
Not automatically in-app. Set up a threshold alert with your CSM — they have backend tooling for this.

#### Why don't persona conversations show as a charge for my workspace?
Either:
1. The `personaconversationcredits` flag is off for your workspace (most likely), OR
2. The conversation was with the default agent (not a persona, not billed), OR
3. `personaConversationCreditAmount` is set to 0 in the current effective rate.

Check the chat toolbar — if the **Billed** badge isn't showing, persona-conversation billing isn't active.

#### What happens to in-flight transactions when a rate changes?
The rate at the moment of the transaction is what's recorded. If a rate change goes effective at midnight and you have a campaign running across that boundary, the answers before midnight charge at the old rate; answers after at the new rate.

#### Can I have different credit rates per project?
No — rates are workspace-global. If you have customers with very different needs, the typical pattern is separate workspaces.

#### Are the Activity Charts (Creators / Engagements / Insights) related to credits?
No. They're engagement metrics, not credit consumption. Activity charts can grow without credits being spent (e.g. a creator returns to view their old responses) and credits can be spent without activity-chart growth (e.g. a workflow run that doesn't produce new answers).

#### What's the difference between "Credit Rate" and "Credit Multiplier"?
- **Rate** = credits per answer (or per conversation message). Set by Vurvey staff.
- **Multiplier** = a per-campaign-type modifier. Defaults to 1; some campaign types apply ×2 or higher. Visible to admins via the campaign configuration.

#### How does this relate to rewards (Tremendous)?
Rewards are entirely separate. Rewards are real money paid to Creators for participating, billed against your **rewards balance** (a different ledger from credits). Credits cover AI/platform usage; rewards cover human participation. See [Rewards](/guide/rewards).

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| Credit Usage card shows "Loading..." indefinitely | Workspace ID missing or auth issue. Check the browser console for failed GraphQL queries. |
| Current Balance and Credits Used both show 0 | New workspace, or no transactions yet. Or `workspaceId` is undefined — confirm you're in the right workspace. |
| "Apply" button is disabled when I want to filter | You haven't changed the dates since last apply. Edit the start or end date to enable it. |
| Transactions table is empty after applying date filter | No transactions in that window. Widen the filter or reset. |
| Add Workspace Credit fails with "non-zero amount" toast | Amount is 0 — enter a positive (add) or negative (deduct) number. |
| Add Workspace Credit succeeds but balance unchanged | Refresh the page — the refetch may have been blocked by a stale cache. |
| I see Credit Rates page but can't edit | You're not in the Support or Enterprise role. Only Vurvey staff can manage rates. |
| Deleted a credit rate by mistake | Talk to engineering — you may be able to recreate it with the same effective date. Historical transactions are unaffected. |
| Persona-conversation chat shows no Billed badge | `personaconversationcredits` flag off, or you're chatting with a non-persona agent. |
| "Credits Used" suddenly jumped | Check the credit-rates page for a recent rate change, or check for a large workflow / capability run. |

---

## Cross-references

- [Campaigns](/guide/campaigns) — campaign-level creator answers consume credits
- [Workflows](/guide/workflows), [Workflow Runs & Reports](/guide/workflow-runs) — workflow execution draws credits per-step
- [Capabilities](/guide/capabilities) — capabilities are workflows under the hood
- [Home → Billed badge](/guide/home#the-population-persona-modal) — visual signal when persona conversations are charged
- [Concept Simulations](/guide/concept-simulations) — synthetic respondents charge at the agent rate
- [Rewards](/guide/rewards) — separate ledger for paying real-human respondents
- [Feature Flags Reference](/guide/feature-flags) — `personaconversationcredits`, `appLimitsEnabled`, `aiSimulationEnabled`, `moveusagetoworkspacetab`
- [Admin (Enterprise)](/guide/admin) — admin-only surfaces including Credit Rates management
- [Settings](/guide/settings) — workspace-level toggles
- [Glossary](/guide/glossary) — credit / rate / engagement definitions
