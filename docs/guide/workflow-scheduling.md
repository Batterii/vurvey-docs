---
title: Workflow Scheduling
---

# Workflow Scheduling

The **Schedule Workflow Modal** lets you set up a recurring run for any workflow — hourly, daily, or weekly — with optional email notifications to the workflow owner and other workspace members. This doc covers the full scheduling surface: how to set up a schedule, how the cron expression is built, how UTC conversion works, how to manage existing schedules, and how to interpret the schedule-info box.

> 📷 _Screenshot pending: Schedule Workflow modal — Frequency, Time, Days, Email, Recipients, Info box, Footer_

::: tip Flag note: `workflowscheduling`
The Schedule Workflow modal is gated by the runtime flag `workflowscheduling`. If you don't see a Schedule button on workflows, this flag is off for your workspace. See [Feature Flags Reference → workflowscheduling](/guide/feature-flags#workflowscheduling).

A separate `capabilitybuilderv2enabled` workspace flag covers Capability-level scheduling — Capabilities have their own schedule UI distinct from raw workflow scheduling. This doc covers raw workflow scheduling only.
:::

---

## How to reach it

1. Open a workflow in the Workflow editor.
2. Click the **Schedule** button in the workflow toolbar.

The modal opens in one of two modes:

| Mode | When | Title |
|---|---|---|
| **Create** | No schedule exists for this workflow yet | "Schedule \"\<Workflow Name\>\"" |
| **Edit** | A schedule already exists | "Edit \"\<Workflow Name\>\"" |

The modal queries `schedulesByWorkflowId` on open; if a schedule is found, it pre-fills with the existing settings.

---

## Permission check

Two conditions must be true for the modal to be editable:

| Condition | Source |
|---|---|
| `canManageSchedules: true` | Passed in by the parent — typically tied to your workspace role + workflow permissions |
| Workflow is not currently running | `isRunning` from `useWorkflowStore` |

If either fails, all inputs are disabled and a banner explains why.

---

## Modal anatomy

> 📷 _Screenshot pending: Whole modal layout with labeled sections_

The modal stacks five sections vertically:

| Section | Purpose |
|---|---|
| **Frequency selector** | Hourly / Daily / Weekly |
| **Run-at controls** | Minute (for Hourly) or 12h time picker (for Daily / Weekly) |
| **Weekly days section** | Only shown for Weekly — checkboxes Mon → Sun |
| **Email notifications** | Two checkboxes: send to owner; send to other workspace members |
| **Schedule info box** | Human-readable summary + timezone note + start-time gotcha |

The footer has Cancel + (in Edit mode) Delete Schedule + (Create / Update) Schedule.

---

## Frequency: Hourly, Daily, Weekly

> 📷 _Screenshot pending: Frequency dropdown open showing the three options_

Pick from a Select input with three options:

| Frequency | When it runs |
|---|---|
| **Hourly** | At a chosen minute of every hour |
| **Daily** | At a chosen time of every day |
| **Weekly** | At a chosen time on selected days of the week |

Default selection: **Hourly**.

### Hourly

> 📷 _Screenshot pending: Hourly mode with "Run at minute" number input_

For Hourly, only the minute matters. The label changes to **Run at minute** and a number input accepts 0-59.

**Cron output**: `<minute> * * * *` (no UTC conversion needed because hour is `*`).

Examples:
- Minute 0 → `0 * * * *` → "Every hour, on the hour"
- Minute 30 → `30 * * * *` → "Every hour, at :30"

### Daily

> 📷 _Screenshot pending: Daily mode with 12h time picker_

For Daily, you pick a **time of day** using a 12-hour time input. Local time is converted to UTC before being stored as a cron expression.

**Cron output**: `<utcMinutes> <utcHours> * * *`

Examples (assuming PST = UTC-8):
- 9:00 AM PST → 17:00 UTC → `0 17 * * *` → "Every day at 5:00 PM UTC" (visible to you as 9:00 AM PST)
- 10:30 PM PST → 06:30 UTC next day → `30 6 * * *` → "Every day at 6:30 AM UTC"

### Weekly

> 📷 _Screenshot pending: Weekly mode with time picker AND day checkboxes_

For Weekly, you pick a **time** (12-hour input) AND **days of the week** (seven checkboxes). The selected days are also UTC-adjusted.

**Cron output**: `<utcMinutes> <utcHours> * * <utcDays>`

Where `utcDays` is a comma-separated list of UTC day numbers (0=Sun through 6=Sat).

::: warning Day-of-week timezone shift
When you pick a local day + local time, the day-of-week in UTC can shift. E.g. for PST (UTC-8):
- "Sunday at 7:00 PM PST" → "Monday 03:00 UTC" — the cron stores `0 3 * * 1` (Monday in UTC).
- "Tuesday at 11:00 PM PST" → "Wednesday 07:00 UTC" — the cron stores `0 7 * * 3` (Wednesday in UTC).

This is handled correctly by `getUtcAdjustedCronExpression` — what you see in the modal description matches what actually runs. But raw cron readers may see day numbers that don't match what you selected; that's the UTC shift, not a bug.
:::

If you select multiple local days that all map to the same UTC day (rare, only near a DST boundary), they're deduplicated automatically.

---

## Email notifications

> 📷 _Screenshot pending: Email notifications checkbox + recipients selector_

Two separate notification controls:

### Send to workflow owner

A single checkbox labeled:

> _"Send email notifications to the workflow owner with the results"_

Default: **ON**. When checked, each scheduled run emails the workflow's owner with the run results (success or failure summary).

### Send to other users

Below the owner-checkbox is a workspace-member-selection control. Pick any other workspace members to receive the same email notification.

| Field | Behavior |
|---|---|
| **Loaded from** | `GET_WORKSPACE_MEMBERS` query (limit 100, sorted EmailAsc) |
| **Filter** | Only members with a non-null email |
| **Selection model** | Multi-select; each selection becomes a `{userId, email}` recipient record |
| **Skipped when** | The owner-notification checkbox is OFF — the recipient selector is hidden / inactive |

The recipient list isn't a free email input — it's a member picker. To send to someone outside the workspace, add them as a workspace member first.

---

## The schedule info box

> 📷 _Screenshot pending: Info box at the bottom of the modal with three rows_

Three informational rows at the bottom:

| Row | Content |
|---|---|
| **Clock icon** | Human-readable description of the cron schedule — generated by the `cronstrue` library from the UTC-adjusted cron expression |
| **Globe icon** | "Times shown in your local timezone." |
| **Info icon** | "Schedules run at the exact selected minute (for example, HH:40:00). If that minute already passed this hour, the first run is next hour, not immediately." |

The cron description updates live as you change frequency, time, minute, and days — useful sanity-check before saving.

::: tip Read the description, not the raw cron
The displayed description is the source of truth. If it says "Every Monday at 9:00 AM," that's what will happen — regardless of the underlying UTC cron string.
:::

---

## Footer actions

> 📷 _Screenshot pending: Modal footer with three buttons in edit mode_

The footer changes based on whether you're creating or editing:

| Button | Create mode | Edit mode |
|---|---|---|
| **Cancel** | Always present | Always present |
| **Delete Schedule** | Hidden | Visible (danger color); deletes the existing schedule |
| **Schedule** | Visible — creates a new schedule | Hidden |
| **Update Schedule** | Hidden | Visible — saves changes to existing schedule |

The primary action button is disabled if any of:
- `!canBeEdited` (no permission or workflow is running)
- `shouldBeDisabled` (mutation already in flight)
- No workspaceId / workflowId / cronExpression yet (state still loading)

---

## How the cron expression gets built

For the curious: the function `getUtcAdjustedCronExpression()` builds the final cron from the form state:

```
runFrequency: "Hourly" | "Daily" | "Weekly"
runAtTime: "HH:mm" (24h, local)
runAtMinute: number (0-59)
onTheseDays: {monday, tuesday, wednesday, thursday, friday, saturday, sunday}
```

The mapping:

| Frequency | Cron pattern |
|---|---|
| Hourly | `${runAtMinute} * * * *` (no UTC conversion needed — hour is `*`) |
| Daily | `${utcMinutes} ${utcHours} * * *` |
| Weekly | `${utcMinutes} ${utcHours} * * ${utcDays}` |

The conversion from local HH:mm to UTC uses `Date.setHours()` then reads `getUTCHours()` and `getUTCMinutes()`. For Weekly, the code also creates a Date for each selected local day at the selected time, then reads `getUTCDay()` — which is what can shift days.

---

## Confirmation flow

> 📷 _Screenshot pending: Confirmation modal before destructive update / delete_

When you make significant changes to an existing schedule, a confirmation modal appears before the change is applied. This guards against accidental schedule changes that might cause:

- Missed runs (if you change the time mid-cycle)
- Duplicate notifications (if you change the recipients mid-cycle)
- Lost history reference (if you change recurrence)

The confirmation modal asks: "Are you sure you want to update / delete this schedule?" with explicit Confirm + Cancel buttons.

---

## Time-input details

The 12-hour time input (`TimeInput12h`) accepts:

- **Hour** (1-12)
- **Minute** (0-59, two digits)
- **AM/PM** toggle

Internally stored as 24-hour `HH:mm` format. The conversion is:

| Display | Stored |
|---|---|
| 12:00 AM | 00:00 |
| 12:30 AM | 00:30 |
| 1:00 AM | 01:00 |
| 11:59 AM | 11:59 |
| 12:00 PM | 12:00 |
| 1:00 PM | 13:00 |
| 11:59 PM | 23:59 |

The `formatTimeToStandard()` helper converts back to "h:mm a" format for display in the cron description.

---

## Constraints & limitations

- **`workflowscheduling` flag required.** If off, no Schedule button appears on workflows.
- **One schedule per workflow.** You cannot create two schedules for the same workflow today. To run a workflow on two cadences, duplicate it.
- **Hourly is the smallest granularity.** No "every 5 minutes" — cron and the modal both top out at hourly.
- **Cannot schedule while workflow is running.** Wait for the current run to complete (or cancel it) before opening the schedule modal.
- **UTC conversion is deterministic but lossy for DST.** Selections near daylight-saving-time boundaries may show a slight mismatch between your displayed local time and the actual run time during DST transitions. This is fundamental to cron + timezones, not a Vurvey bug.
- **Recipients must be workspace members with email.** No external emails. No SMS or webhook notifications.
- **Email notifications go to all selected recipients regardless of which run.** Every scheduled run emails everyone on the list; you can't condition notifications on run success/failure.
- **Notification content cannot be customized.** It's a system-generated email with results summary. No template editing.
- **Schedule history shown elsewhere.** The modal shows the schedule itself; the actual run history (when each scheduled run happened, what its output was) appears in [Workflow Runs & Reports](/guide/workflow-runs).
- **The cron description uses the `cronstrue` library.** If you see strange phrasing, check the underlying cron — sometimes phrases like "Every 0 minutes past every hour" appear for edge cases.
- **Confirmation modals can't be disabled.** Every significant change triggers a confirm step.
- **The modal closes only on explicit action (Cancel/Schedule/Delete) or backdrop click.** No keyboard shortcut to close.

---

## Best practices

- **Schedule during business hours when possible.** If runs fail, you want to be available to investigate. 3 AM cron failures are no fun.
- **Use Daily over Hourly when possible.** Hourly runs consume credits and can flood your inbox. If once a day is sufficient, do that.
- **Pick a minute offset for hourly runs.** Don't use minute 0 for everything — staggered minutes (e.g., this workflow at :15, that one at :30) prevent traffic spikes.
- **Verify the cron description before saving.** The natural-language summary at the bottom is your sanity check.
- **Include relevant workspace members in notifications.** Owners often forget to check email; cc-ing the team lead increases the chance someone sees the result.
- **Test the workflow manually before scheduling.** Don't schedule a workflow whose first-ever run is unattended. Run it once manually, confirm it works, then schedule.
- **Disable / delete schedules for workflows you no longer use.** Scheduled runs cost credits whether or not anyone reads the output.
- **Document the schedule in the workflow's description.** "Runs daily at 9 AM ET" is helpful context for any future maintainer.
- **When you change a workflow's content, consider whether the schedule still makes sense.** The schedule doesn't auto-pause when you edit a workflow; you may need to rethink cadence after major changes.

---

## FAQ

#### Can I schedule a workflow to run at multiple times per day?
No. The smallest granularity is Hourly (a chosen minute of every hour). For "9 AM and 3 PM daily," your options are:
1. Duplicate the workflow and schedule each copy at one time.
2. Use Hourly and post-filter outputs based on time.

#### What timezone does the schedule actually run in?
UTC, internally. But the modal displays your local timezone — what you see is what you get.

#### Why does the cron say a different day than I selected?
That's the local→UTC day shift documented in the warning above. The natural-language description at the bottom of the modal shows you the local-day equivalent.

#### How do I cancel a scheduled run that already started?
Once a scheduled run starts, it follows the standard workflow-execution lifecycle. Cancel it from the workflow's run history page. The schedule remains — only the in-flight run is cancelled.

#### Does the schedule pause automatically when the workspace runs out of credits?
No — scheduled runs continue to attempt to fire. They'll fail at the credit check on the backend, leaving error entries in your run history. You'll see error notifications if you have email notifications on. Delete or pause the schedule when credits are low.

#### Can I see what cron expression was generated?
Not exposed in the UI today. The natural-language description is the user-facing surface. If you need the raw cron, check the workflow's history records via the API or ask engineering.

#### What happens to a schedule if I delete the workflow?
The schedule is deleted with the workflow (CASCADE on the database side).

#### Can I temporarily disable a schedule without deleting it?
No "pause" button today. The workaround: delete the schedule and re-create it when ready. Or change the run frequency to a date far in the future (Daily / 23:59 / one day) as a pseudo-pause.

#### Can a non-owner schedule a workflow they have access to?
Depends on `canManageSchedules` — which is itself based on workspace role + workflow-level OpenFGA permissions. Typically: Owner / Admin / workflow owner can schedule; others cannot.

#### What happens if the schedule fires during workflow editing?
The scheduled run executes the **last saved** version of the workflow. Unsaved edits don't affect the run. If you want to ensure a specific version runs, save before the scheduled time.

#### How long are scheduled runs stored in history?
Same retention as manual runs — see [Workflow Runs & Reports](/guide/workflow-runs).

#### Will I be emailed if a scheduled run fails?
Yes — same notification setup. The result email indicates failure status; check the run history for details.

#### What format are notification emails in?
HTML email with a summary header (status, duration, workflow name) and a link to the full run in Vurvey. No customization today.

#### Can I receive a Slack or Teams notification instead of email?
Not directly today. Workaround: use Composio integration (see [Integrations → Composio](/guide/integrations#composio-per-user-tool-connections)) and have the workflow itself post to Slack as a final step.

#### What's the difference between Workflow scheduling and Capability scheduling?
- **Workflow scheduling** (this doc): scheduling at the raw workflow level — Hourly/Daily/Weekly cron-style.
- **Capability scheduling**: scheduling at the Capability level (the higher-level abstraction that wraps a workflow). Each has its own UI and is gated by different flags.

In practice, if a workflow is also exposed as a Capability, you typically schedule the Capability, not the underlying workflow.

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| Schedule button doesn't appear on workflows | `workflowscheduling` runtime flag off for your workspace. |
| Schedule modal opens but all controls are disabled | The workflow is currently running, OR you don't have `canManageSchedules` permission. |
| Cron description shows odd phrasing | The cronstrue library has known quirks for some cron expressions. Verify the description matches your intent before saving. |
| Time I picked doesn't match what the description says | Check your computer's timezone — the modal uses your local timezone. If your computer is set to a different timezone than expected, the conversion is based on the wrong base. |
| Day-of-week in cron doesn't match what I selected | Expected — local-to-UTC conversion can shift the day. The natural-language description shows the local equivalent. |
| Schedule didn't fire at the expected time | Possible causes: the minute already passed when the schedule was created (first run is next interval, not immediate); workspace ran out of credits; workflow is being edited. |
| Email recipients selector is empty | Workspace has no other members with email addresses, OR the loader is still fetching (cache-and-network policy). |
| Delete Schedule button doesn't appear | You're in Create mode (no existing schedule yet). Switch to Edit mode by opening a workflow that has a schedule. |
| Cannot click Schedule / Update | Check that workspace, workflow, and cron expression are all valid; ensure workflow is not running. |
| Schedule confirmation modal won't close | Click Cancel explicitly. The Confirm action proceeds; backdrop click may also dismiss depending on modal behavior. |
| Modal shows old schedule data after saving | Refetch may have failed silently. Close and re-open the modal. |

---

## Cross-references

- [Workflows](/guide/workflows) — workflow concepts, the editor, and the schedule button entry point
- [Workflow Runs & Reports](/guide/workflow-runs) — where scheduled run history appears
- [Capabilities](/guide/capabilities) — separate Capability-level scheduling
- [Feature Flags Reference](/guide/feature-flags) — `workflowscheduling`, `capabilityBuilderV2Enabled`
- [Permissions & Sharing](/guide/permissions-and-sharing) — `canManageSchedules` is derived from per-workflow permissions
- [Workspace Members & Roles](/guide/workspace-members) — workspace members are the source for notification recipients
- [Credits & Usage](/guide/credits-and-usage) — scheduled runs draw credits like manual runs
- [Integrations](/guide/integrations) — for Slack/Teams notifications via Composio
- [Glossary](/guide/glossary) — Cron / Schedule / Workflow terminology
