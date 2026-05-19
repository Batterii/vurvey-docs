---
title: Workflow Runs & Reports
---

# Workflow Runs & Reports

When a Workflow executes, it produces a **run history entry** capturing what happened — every step's agent task, every grounded output, every artifact produced. This guide covers the four screens that make up the run-inspection experience:

- **Flow Running** — the live in-flight view while a workflow executes
- **Flow History** — the post-completion canvas showing exactly what happened
- **Flow Report** — the consolidated deliverable output for a run
- **Flow Task Report** — per-task drill-in for one workflow step

These surfaces are deeply linked but each answers a different question — _what's happening right now_, _what happened_, _what did this produce_, and _what did this one step do_.

> 📷 _Screenshot pending: Flow Running — live canvas with in-flight task indicators_
> 📷 _Screenshot pending: Flow History — completed run canvas with task cards_
> 📷 _Screenshot pending: Flow Report — deliverable output for a run_
> 📷 _Screenshot pending: Flow Task Report — single task drill-in_
> 📷 _Screenshot pending: History Drawer listing past runs_

---

## Routes at a glance

The four surfaces live under the per-workflow page at `/workflow/flows/:workflowId/*`:

| Route | Component | What it shows |
|---|---|---|
| `/workflow/flows/:workflowId/run` | `FlowRunning` | Live in-flight canvas for the currently running execution. Auto-redirects to the Flow Builder when no run is in flight. |
| `/workflow/flows/:workflowId/view/:historyId` | `FlowHistory` | Completed run canvas with a `HistoryDrawer` for selecting between past runs. |
| `/workflow/flows/:workflowId/view/:historyId/report` | `FlowReport` | Consolidated deliverable output (the "report") for one history entry. |
| `/workflow/flows/:workflowId/view/:historyId/output-studio` | `FlowOutputStudioRoute` | Per-history structured-output view (gated by `outputStudioEnabled`). See [Output Studio → per-history view](/guide/output-studio#per-history-view-flowoutputstudio). |
| `/workflow/flows/:workflowId/view/:historyId/task-report/:taskId` | `FlowTaskReport` | Drill-in for one task's output + grounding within a run. |

The route hierarchy reflects the nesting: a Workflow has many History entries, each entry has a Report, an Output Studio view (when enabled), and many Task Reports.

---

## Flow Running — the live in-flight view

While a workflow is executing, the `/run` route renders `FlowRunning` — a `RunningCanvas` that shows the workflow's nodes with live status indicators per task.

### Key state machine

`FlowRunning` reads three values from the workflow store:

| State | Meaning |
|---|---|
| `actions.isRunning` | Whether a run is currently in flight |
| `running?.id` | The running orchestration ID |
| `builder?.id` | The workflow being run |

If the workflow is **not running** AND there's no `runningId`, the page auto-redirects to `/workflow/flows/:workflowId` (the builder). This prevents users from landing on a stale "Running" view when no execution is active.

### What you see

- The workflow canvas with each node rendered as its standard card
- **Live status** per node: idle / running / completed / failed
- **Streaming indicators** for in-flight LLM tokens (when the worker is actively producing output)
- **Animated edges** between nodes showing data flow
- **Stop / abort** controls (when permission allows) to terminate the run early

### Pre-launch redirect

If you arrive at `/run` while the workflow is still loading (`isLoading = true`), the redirect logic waits — no `navigate()` fires until the workflow data is available. This avoids race conditions on first paint.

---

## Flow History — the post-completion canvas

After a workflow run completes (success or failure), the result is preserved as an **AiOrchestrationHistory** record. The `/view/:historyId` route renders that history's canvas via `FlowHistory`.

### Two-pane layout

| Pane | Contents |
|---|---|
| **History Drawer** (left side) | Vertical list of past run history entries. Each entry shows status, timestamp, and a click target to switch the canvas to that run. |
| **Canvas** (center / right) | Either `HistoryCanvas` (a completed run's snapshot) or `RunningCanvas` (when the selected history matches the CURRENT in-flight run). |

The page picks between `HistoryCanvas` and `RunningCanvas` via `isCurrentRun = Boolean(runningHistoryId) && runningHistoryId === currentHistoryId` — so if you have a run in flight AND select that run's history entry, you see the live view; otherwise you see the static history snapshot.

### Why this matters

The dual-view pattern lets you watch a run in real-time, then revisit the same history entry later to see the final result rendered the same way. The history drawer also lets you compare runs side-by-side (browse to one, browse to another) without leaving the page.

### Navigation

- Click a task node on the canvas → drills into the **Flow Task Report** for that task (`/task-report/:taskId`)
- Click the **Report** action on the page → opens the consolidated **Flow Report** view
- Click another history entry in the drawer → swaps the canvas to that run

---

## Flow Report — the deliverable output

The `/view/:historyId/report` route renders `FlowReport` — the consolidated deliverable for that run.

### What it produces

A typical workflow produces a freetext-Markdown "final report" assembled by the synthesizer chain. The report viewer renders that report with formatting (headings, bullets, links, tables).

### Capability-card workflows: a special case

There's a notable comment in the source code worth surfacing:

> _"Capability-card workflows stuff their JSON-stringified cards into `finalReport` as a side effect of the `CapabilityCardSynthesizer`, and the report viewer renders that blob as a wall of JSON..."_

When a workflow is a Capability-card workflow (driven by `CapabilityCardSynthesizer`), its `finalReport` field contains JSON-stringified card data — NOT prose. The Flow Report viewer recognizes this and renders the structured output (`DeliverableOutput` component) instead of dumping raw JSON.

This is also why Output Studio exists as a parallel surface — see [Output Studio](/guide/output-studio) — for richer structured-output rendering with Evidence-badged dashboards.

### What you can do here

- **Read the report** as formatted markdown / structured output
- **Copy** the text content for use in slides / emails
- **Download** the report as a file (where supported)
- **Back-arrow navigation** returns to the history canvas

### Data source

The report viewer queries `GET_CAPABILITY_OUTPUTS_BY_HISTORY` for structured outputs tied to this history entry. The workflow's `finalReport` field provides the freetext fallback.

---

## Flow Task Report — per-task drill-in

The deepest navigation: `/view/:historyId/task-report/:taskId` shows what ONE specific task within a run produced.

### What you see

| Element | Source |
|---|---|
| **Back arrow** to the history canvas | Navigation |
| **Task name + role** | From the workflow definition |
| **Status indicator** (running, completed, failed) | Live or stored state |
| **Task output** | The text the task's agent produced |
| **Grounded output** with citations | `TaskGroundedOutput` component renders citations alongside the output |
| **Workflow Report Editor** | When editing capability is available, lets you tweak the task report |

### Live vs historical

The page detects `isRunning = aiOrchestrationHistoryId === historyId` to decide whether to show live-streaming task output or the stored history version. If you arrive at a task report while the same history is actively running, you see live updates; otherwise you see the snapshot.

### Why drill-in matters

For multi-step workflows, the consolidated Flow Report aggregates everything. Sometimes you need to know exactly what happened at one specific step — e.g., "why did the brand-analysis agent flag this insight?" or "what did the topic-extractor surface from this campaign?" The Task Report is the only place where you see that specific step's input + output + grounding without aggregation.

### Task grounded output + citations

The `TaskGroundedOutput` component renders citations attached to the task's output — same pattern as chat-side **Powered by N sources** and Output Studio Evidence badges. See [Sources & Citations](/guide/sources-and-citations) for the full attribution model.

---

## Workflow Store (shared state)

All four surfaces share state via `useWorkflowStore` (Zustand). Key fields:

| Path | Purpose |
|---|---|
| `running` | Current in-flight run state (`id`, `aiOrchestrationHistoryId`, `aiPersonaTasks`, etc.) |
| `history.entries` | List of all past history entries for this workflow |
| `history.current` | Currently selected history entry |
| `builder` | The workflow being edited / viewed |
| `actions.isRunning` | Whether a run is in flight |
| `actions.isLoadingHistory` | Whether history is loading |
| `actions.isLoadingWorkflow` | Whether the workflow itself is loading |

Selectors used via `useShallow` keep render performance reasonable — many list-typed selections won't trigger re-renders unless the list itself changes.

---

## Where Workflow Runs fit in the broader platform

| Surface | Cross-link |
|---|---|
| **Workflows** | [Workflows](/guide/workflows) — the parent feature; covers the builder, scheduling, and node types |
| **Capabilities** | [Capabilities](/guide/capabilities) — multi-workflow systems whose runs each have their own history |
| **Output Studio** | [Output Studio](/guide/output-studio) — the per-history Output Studio route (`/view/:historyId/output-studio`) shows structured output from a run |
| **Sources & Citations** | [Sources & Citations](/guide/sources-and-citations) — task-output grounding flows through the standard citation pipeline |
| **Platform Architecture** | [Platform Architecture → Workers](/guide/architecture#vurvey-api-worker-topology) — runs are processed by `batterii-heavy-worker` and friends |
| **Permissions** | [Permissions & Sharing](/guide/permissions-and-sharing) — Workflow share grants give Viewer / Editor access to run history |

---

## Constraints & limitations

- **History entries are immutable.** Once a run completes, its task outputs are frozen. The Workflow Report Editor can annotate but doesn't change the underlying task data.
- **Live-streaming requires the same session.** If you load a Task Report from a different tab while a run is in flight, you'll see updates as they stream; reopening a closed tab mid-run may show a snapshot from the moment the page mounted.
- **Capability-card workflow JSON.** Without the special-case rendering, `finalReport` for these workflows would show as a wall of JSON. The Flow Report viewer handles this transparently — but if you query `finalReport` directly via GraphQL, expect a JSON string.
- **History entries can be large.** Workflows that produce 50+ tasks with rich outputs may take a beat to render the canvas. Lazy-load via the history drawer rather than always landing on the deepest entry.
- **No bulk history operations.** You can't delete multiple history entries at once today; that's a per-entry action.
- **Live abort is permission-gated.** Stopping a run mid-flight requires manage-permission on the workflow.
- **`outputStudioEnabled` gates the structured-output view.** The Flow Report shows the freetext rendering; the per-history Output Studio view shows the structured rendering when the flag is on. See [Output Studio](/guide/output-studio).
- **Per-task drill-in URLs are deep-linkable** but require the corresponding history entry to still exist — deleted history entries 404 the task report.

---

## Best practices

- **Use Flow Running for active monitoring**, not for browsing past runs. The page redirects out when no run is in flight.
- **Use the History Drawer for comparison.** Click between two entries to see how outputs differed between runs.
- **Pin important history entries.** If a run produced a milestone deliverable, capture the URL or download the report — history entries can pile up over months.
- **Drill into Task Reports for debugging.** When a run produced an unexpected final report, the Task Report layer often reveals which specific step went off the rails.
- **Use Flow Report for stakeholder share-outs.** The polished consolidated view is what non-Vurvey readers should see.
- **For Capability workflows, prefer Output Studio over Flow Report.** Output Studio's structured rendering is more presentable than the freetext report.
- **Watch grounding citations in Task Reports.** A task with no citations may indicate ungrounded output — flag for review.

---

## FAQ

#### Why does `/run` redirect me to the builder?
No run is in flight. The redirect is intentional — it prevents you from staring at a stale "Running" view. To start a new run, click the run button on the builder.

#### Can I view a Task Report after the history entry is deleted?
No. Task Report URLs require their parent history entry. Deletion cascades.

#### Why does my Flow Report look like a wall of JSON?
It's a Capability-card workflow whose `finalReport` is a JSON-stringified card blob. The viewer is supposed to detect this and render structured output instead — if you see raw JSON, the detection failed (report as a bug).

#### Can I compare two runs side-by-side?
Not in a single split-screen view today. Use the History Drawer to swap between entries, or open two browser tabs.

#### What's the difference between Flow Report and Output Studio?
- **Flow Report** renders the workflow's freetext `finalReport` field (or detected structured-card output for capability-card workflows).
- **Output Studio** (per-history view) renders a structured OutputSpec with element-level Evidence badges.

Output Studio is the richer surface; Flow Report is the legacy / freetext fallback.

#### Why does the History Drawer not show all my past runs?
History entries are paginated. Scroll the drawer to load older entries. Very old runs may be archived out of the active view per retention policy.

#### Can I re-run from a history entry?
Not directly. To re-run with the same inputs, open the workflow builder, set the variables to match the historical run, and trigger a new run. The history entries themselves aren't a "re-run" source.

#### What if a run is stuck in "running" state?
Check `/run` — if the live canvas shows no activity for a long time, the worker may have stalled. Heavy-worker stalls are usually resolved by waiting; if it persists, contact support with the orchestration history ID.

#### Are run reports counted toward credit usage?
Viewing reports doesn't cost credits. The original run cost credits (LLM calls, tool calls) when it executed.

#### Can I export multiple runs at once?
Not natively from the UI. For bulk export, consult engineering — GraphQL queries can pull history data programmatically. See [Developer & API Reference](/guide/developer-reference).

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| `/run` always redirects to builder | No run is in flight; expected when you haven't triggered execution. |
| Flow History shows blank canvas | History is still loading (`isLoadingHistory = true`) or the selected entry has no task data. Wait or pick another entry. |
| Live updates not appearing on Flow Running | Network / websocket disconnect. Refresh; if persistent, the worker subscription may have dropped. |
| Flow Report shows raw JSON | Capability-card workflow but the special-case detector failed. Report as a bug with the orchestration history ID. |
| Task Report 404s | History entry or task ID doesn't exist (deleted, never persisted, or wrong URL). Navigate via the canvas instead of direct URL. |
| History Drawer empty for a workflow that has run | History query is still loading, OR the workflow's runs are all on a different workspace context. Check the workspace selector. |
| Task Report shows "running" indefinitely | Task is still in flight on the worker; the live view will update when it completes. If stuck for hours, the task is likely failed — check parent Flow History for status. |
| Citations missing on Task Report | The task didn't produce grounding data — usually because the agent didn't use sources, OR the grounding pipeline didn't fire. Check the agent's capability bindings. |
| Output Studio view unavailable | `outputStudioEnabled` is off; the route redirects to `/report`. See [Output Studio](/guide/output-studio). |
| Can't abort a running workflow | You don't have manage permission on the workflow. Ask the owner to abort. |

---

## Cross-references

- [Workflows](/guide/workflows) — the parent guide covering the builder, scheduling, and integration with Capabilities
- [Capabilities](/guide/capabilities) — multi-workflow capability runs that each generate their own history
- [Output Studio](/guide/output-studio) — structured-output authoring + per-history view via `FlowOutputStudio`
- [Sources & Citations](/guide/sources-and-citations) — `TaskGroundedOutput` uses the standard citation pipeline
- [Platform Architecture → Workers](/guide/architecture#vurvey-api-worker-topology) — `batterii-heavy-worker` executes the runs
- [Common Recipes → Automate weekly research](/guide/recipes#recipe-3-automate-a-weekly-research-summary-as-a-capability) — end-to-end recipe whose runs surface in this guide
- [Developer & API Reference](/guide/developer-reference) — `AiOrchestrationHistory` GraphQL access for bulk export
- [Glossary → Workflow, AiOrchestration, Run](/guide/glossary)
