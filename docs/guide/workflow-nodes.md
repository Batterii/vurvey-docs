---
title: Workflow Node Types
---

# Workflow Node Types

The Workflow Editor (the Advanced canvas at `/workflow/flows/:id`) lets you wire together AI tasks, conditional branches, parallel forks, loops, and population queries into a directed graph. This doc is the reference for every node type — what each does, what its inputs and outputs look like, when to use it, and its constraints.

> 📷 _Screenshot pending: A multi-node workflow with Start → Task → Branch → two paths → Merge → End_

::: tip Related docs
- [Workflows](/guide/workflows) — overview of what a workflow is and how to use the editor.
- [Workflow Scheduling](/guide/workflow-scheduling) — how to make a workflow run on a recurring schedule.
- [Workflow Runs & Reports](/guide/workflow-runs) — how to inspect what happened when a workflow ran.
:::

---

## The graph model

A workflow is a **directed graph** with seven node types. Each node has:

- **Handles** (left = input, right = output) where edges connect to other nodes
- **A label** (free text — what humans call this step)
- **A node type** — one of the seven below
- **Configuration** specific to its type (e.g. Branch nodes have a condition; Foreach nodes have a max-iterations cap)

The editor uses `@xyflow/react` (React Flow) for the canvas rendering — drag to pan, scroll to zoom, click to select, drag from a handle to connect.

### Node types at a glance

| Node | Symbol | Purpose | Connections |
|---|---|---|---|
| **Start** | ▶ | Entry point — every workflow has exactly one | Output handle only |
| **Task** | (agent avatar) | An AI agent does work | Input + output |
| **Branch** | ◆ | Conditional fork | Input + multiple outputs |
| **Merge** | ⊓ | Re-join branches | Multiple inputs + single output |
| **Foreach** | ↻ | Loop over a collection | Input + output (with internal loop body) |
| **Population** | 👥 | Reference a Population for agent simulation | Input + output |
| **End** | ⏹ | Terminal — configures output format | Input handle only |

---

## Start node

> 📷 _Screenshot pending: A Start node on the canvas_

### What it does

Marks the workflow's entry point. Execution begins here. Every workflow has **exactly one** Start node, and it's auto-created when you create a new workflow.

### Configuration

| Field | Purpose |
|---|---|
| **label** | Human-readable name (e.g. "Begin", "Research Start") — purely cosmetic |

### Constraints

- Cannot be deleted (the editor disallows it).
- Cannot have an input handle (nothing connects INTO it).
- Must have at least one outgoing edge.

### When to customize

Almost never — the default label is fine for most workflows. Customize only when you have multiple parallel sub-flows and want to label them distinctly.

---

## Task node

> 📷 _Screenshot pending: A Task node with an Agent selected_

### What it does

The workhorse. Each Task node represents **one AI agent doing one piece of work**. The agent receives the workflow's current state plus a prompt, calls an LLM, and produces output that flows to the next node.

### Configuration

| Field | Source | Purpose |
|---|---|---|
| **Agent (Persona)** | `agentTask.persona` | Which Agent does this task — picked via the Select Agent modal |
| **Prompt** | `agentTask.prompt` | What you're asking the agent to do |
| **Tool groups** | `agentTask.manualToolGroups` | Which [Chat Tools](/guide/chat-tools) the agent can call |
| **Smart Prompt** | `agentTask.smartPromptEnabled` | Whether AI auto-selects tools |
| **Tool Group (curated)** | `agentTask.toolGroup` | Curated bundle when Smart Prompt is on |
| **Question IDs** | `agentTask.questionIds` | Campaign questions this task references |
| **Survey IDs** | `agentTask.surveyIds` | Campaigns this task references |
| **Order index** | `agentTask.orderIndex` | Step number (display) |

The picker for the agent uses `useLazyPublishedAgents()` — only published agents are selectable.

### What flows in / out

- **Input**: The collected output of preceding nodes (referenced via templating like `{step_N_output}` in the prompt — exact double-brace syntax depends on the runtime).
- **Output**: A JSON blob containing the agent's response text + any structured outputs (e.g. extracted entities).

### When to use

When you need an AI agent to do anything — research, summarize, classify, analyze, recommend, write. The bread-and-butter of workflows.

### Constraints

- Requires an Agent to be selected — otherwise the workflow won't run.
- A single Task node runs ONE agent ONE time. To run multiple agents on the same input, use parallel branches; to repeat, use Foreach.

---

## Branch node

> 📷 _Screenshot pending: A Branch node with two outgoing paths labeled true / false_

### What it does

Conditional fork. Evaluates a **condition expression** and routes execution to one of multiple downstream paths.

### Configuration

| Field | Source | Purpose |
|---|---|---|
| **label** | `data.label` | Human name for the branch |
| **condition** | `data.branch.condition` (preferred) or `data.condition` | The expression to evaluate (e.g. `step_2_output.sentiment == "positive"`) |
| **description** | `data.description` | Optional notes for future readers |

The icon is a diamond (◆) — the classic flowchart symbol for a decision point.

### What flows in / out

- **Input**: Workflow state from the preceding node.
- **Output**: Multiple outgoing edges, each labeled with a value the condition can match.

### When to use

- Routing answers based on classification ("if positive, do X; if negative, do Y")
- Skipping expensive steps when not needed
- Choosing among multiple agent responses

### Constraints

- The condition expression syntax is workflow-runtime-specific (talk to engineering for the full grammar).
- Each outgoing edge needs a distinct value to match.
- If the condition matches none, the workflow may halt — design a default path.

---

## Merge node

> 📷 _Screenshot pending: A Merge node with two incoming paths_

### What it does

Re-joins parallel branches into a single downstream path. After a Branch fans-out (or after multiple parallel Tasks), use Merge to re-converge.

### Configuration

| Field | Source | Purpose |
|---|---|---|
| **label** | `data.label` | Human-readable name |
| **joinMode** | `data.joinMode` — `"all"` or `"any"` | Wait semantics |

### Join modes

| Mode | Display label | Behavior |
|---|---|---|
| `"all"` | **Wait for all** | Block until every incoming edge has completed; then proceed |
| `"any"` | **Continue on first** | As soon as ONE incoming edge completes, proceed (others are abandoned) |

### What flows in / out

- **Input**: Multiple incoming edges from prior parallel paths.
- **Output**: A single downstream edge carrying the merged state.

When `joinMode: "all"`, the output state contains all inputs combined. When `"any"`, it contains only the first one to arrive.

### When to use

- After parallel research tasks: "wait for all agents to finish, then summarize"
- After a Branch where you want to converge again
- For race conditions: "use the first responder, abandon the rest"

### Constraints

- A Merge with one incoming edge is technically valid but pointless — just remove it.
- `"any"` mode terminates the abandoned paths abruptly — make sure they don't have side effects you need.

---

## Foreach node

> 📷 _Screenshot pending: A Foreach node with body nodes shown inside the loop_

### What it does

**Loops over a collection** — runs the loop body once per item in an input array.

### Configuration

| Field | Source | Purpose |
|---|---|---|
| **label** | `data.label` | Human-readable name |
| **items.source / items.path** | `data.foreach.items` | Where to find the collection (e.g. `step_1.results`) |
| **loopEndNodeId** | `data.foreach.loopEndNodeId` | Which node marks the loop's end |
| **maxIterations** | `data.foreach.maxIterations` | Cap on iterations (safety bound) |

The `items.path` uses a JSONPath-like syntax to address an array within prior workflow state.

### What flows in / out

- **Input**: The full workflow state (including the array to iterate).
- **Output (per iteration)**: The current item is exposed to the loop body's nodes as `current_item`.
- **Final output**: An aggregated array of all per-iteration results.

### When to use

- "For each campaign answer, classify sentiment"
- "For each top-3 result, generate a follow-up"
- "For each chunk of the dataset, summarize"

### Constraints

- `maxIterations` is a hard cap — set it conservatively to avoid runaway loops.
- Each iteration is sequential, not parallel today (talk to engineering about future parallelism).
- The loop body must be a self-contained sub-graph with a clear end node.
- `loopEndNodeId` must reference a node that EXISTS inside the loop body.

---

## Population node

> 📷 _Screenshot pending: A Population node showing CommunityUsersIcon_

### What it does

References a **Population** — a curated group of AI personas you want the workflow to use as respondents in this run.

### Configuration

| Field | Source | Purpose |
|---|---|---|
| **label** | `data.label` | Human name for this population reference |

The population itself is configured via the workflow's higher-level config (not on the node directly) — talk to your population designer.

### What flows in / out

- **Input**: Triggered by upstream — typically nothing special needed in its input.
- **Output**: The population's personas + their attributes, available to downstream Task nodes.

### When to use

- AI Simulations where you need diverse perspectives ("ask 50 personas this question")
- Concept Testing where the population represents your target market
- Multi-respondent agent workflows

### Constraints

- Requires `enablegeneralpopulations` or `aiSimulationEnabled` flag depending on population type.
- Populations are per-workspace — must exist in the workspace before referencing.
- See [People](/guide/people) and [General Populations](/guide/general-populations) for context.

---

## End node

> 📷 _Screenshot pending: An End node with output format dropdown_

### What it does

Terminal node — marks where the workflow's output is finalized. Every workflow has at least one End node; complex workflows can have multiple (e.g. one per branch).

### Configuration

| Field | Source | Purpose |
|---|---|---|
| **label** | `data.label` | Human-readable name |
| **outputConfig.format** | `data.outputConfig.format` | One of `report` / `slides` / `structured_json` / `raw` |

### Output format options

| Value | Icon | Label | What it produces |
|---|---|---|---|
| `report` | 📄 | **Report** | A formatted markdown report — readable on its own |
| `slides` | 📊 | **Slides** | A deck-style output suitable for presentation |
| `structured_json` | 🔧 | **Structured JSON** | A schema-validated JSON output |
| `raw` | 📝 | **Raw Output** | Whatever the last node produced, no post-processing |

### What flows in

- **Input**: The final workflow state from the last actionable node.

The End node's configuration determines how that final state is **formatted** for downstream consumers — Capability runs, scheduled email notifications, etc.

### When to use

- **Always** — every workflow needs an End node.
- Pick `report` for human-readable summaries (most workflows).
- Pick `structured_json` when downstream code needs to parse the output.
- Pick `slides` for stakeholder-facing presentations.
- Pick `raw` when you want zero post-processing.

### Constraints

- Cannot have an output handle (nothing connects OUT of it).
- Output format choice constrains what downstream consumers expect — changing it mid-life is a breaking change for any code reading the workflow's output.

---

## Utility cards (non-node)

The editor also shows **utility cards** that aren't nodes proper — they're supplementary surfaces that flow alongside nodes:

| Card | Role |
|---|---|
| `AgentTaskCard` | Inline display within a Task node showing the agent's prompt + last response |
| `FlowOutputCard` | Snapshot of the workflow's final output |
| `OutputCard` | Per-step output preview |
| `OutputTypeCanvasCard` | Visualizes the End node's output format |
| `SourcesCard` | Tracks data sources used across the workflow |
| `WorkflowVariablesCard` | The variables defined for this workflow (input parameters) |

These are NOT separate node types — they're UI affordances rendered alongside / inside nodes.

---

## Edges and the graph model

> 📷 _Screenshot pending: Drag-to-connect interaction between two nodes_

Edges connect from a node's right handle (output) to another node's left handle (input). Edge characteristics:

| Aspect | Behavior |
|---|---|
| **Direction** | Always left-to-right (the React Flow default for this editor) |
| **Type** | Same shape for all edges in this graph |
| **Animation** | Active edges (mid-execution) may animate |
| **Disconnect** | Click the edge and press Delete; or drag the handle away |

Branch and Foreach are the only nodes that legitimately have multiple outgoing edges. Merge is the only node with multiple incoming edges. Task and Population have one in / one out.

---

## Node patterns

### Linear pipeline

```
Start → Task A → Task B → Task C → End
```

Simple sequential processing. Each task uses the previous output.

### Conditional routing

```
Start → Task A → Branch → ┌─ Task B → End
                          └─ Task C → End
```

A classifies the input; B and C are alternate handlers. Use two End nodes if outputs are different formats.

### Parallel + merge

```
Start → Task A → ┌─ Task B ─┐
                 ├─ Task C ─┼ Merge → Task D → End
                 └─ Task D ─┘
```

A produces a fan-out; B/C/D run in parallel; Merge (joinMode: "all") waits for all; D summarizes.

### Foreach loop

```
Start → Task A → Foreach (over A.results) → Task B → loopEnd → Task C → End
```

A produces an array; Foreach iterates B over each item; Task C aggregates final results.

### Population-driven simulation

```
Start → Population → Task A (per persona) → Merge → Task B → End
```

Reference a population; Task A runs once per persona; Merge collects; B synthesizes.

---

## Constraints & limitations

- **All node types are workflow-scoped, not workspace-scoped.** Each workflow defines its own graph.
- **Cycles other than Foreach are not allowed.** The editor's validation prevents loops that aren't explicitly Foreach-managed.
- **Start nodes can't be deleted; End nodes are at least one.** Auto-managed by the editor.
- **The condition expression syntax is workflow-runtime-specific.** Not a standardized expression language — talk to engineering for the full grammar.
- **Merge with `joinMode: "any"` abandons incomplete paths abruptly.** Side effects on those paths may produce surprising state.
- **Foreach iterations are sequential.** No parallel iteration today.
- **Output format on End is workflow-wide.** All End nodes in a multi-End workflow should ideally share format (or downstream consumers must handle multiple).
- **Population references are static.** The selected population is locked at design time; can't be parameterized via workflow variables today.
- **Visual layout doesn't auto-arrange.** Node positions persist as-edited; cluttered canvases stay cluttered unless you tidy them.
- **The editor uses React Flow — a third-party library.** Some interactions (e.g. multi-select drag) follow React Flow conventions.

---

## Best practices

- **Name nodes meaningfully.** "Task" + agent name is the default; rename to "Sentiment Analysis" or "Top-3 Selection" for clarity.
- **Use the Description field on Branch nodes** to explain the condition's intent.
- **Set `maxIterations` on every Foreach.** A bug in your upstream array could cause runaway loops.
- **For Merge with `"any"`, ensure the abandoned paths are side-effect-free.** No data writes, no notifications.
- **Use parallel + merge over sequential when possible.** Multiple agents in parallel is faster than chaining them sequentially.
- **Pick the right End output format upfront.** Changing it later breaks downstream consumers.
- **Document the workflow in its title and description.** "Q2 brand sentiment pipeline (v2)" beats "Workflow #1".
- **Test each node in isolation first.** A failed multi-node workflow is hard to debug if nothing was tested individually.
- **Use Variables Node for input parameters.** Don't hardcode values into Task prompts; declare them at the workflow's input boundary.
- **Keep canvases tidy.** Future-you (or another author) needs to read this. Spread nodes out; avoid crossings.

---

## FAQ

#### Can I copy a node from one workflow to another?
Not via the UI today. Workaround: open both workflows, manually recreate. For engineers, the underlying schema is GraphQL-addressable.

#### Why does my Branch node not route?
The condition expression failed to evaluate, OR no outgoing edge matched. Check the expression syntax and the values you're routing on.

#### What's the difference between Merge "all" and a regular sequential Task?
A Task runs once with whatever input it receives. Merge "all" waits for multiple parallel paths to complete before its single downstream Task fires.

#### Can I nest Foreach inside another Foreach?
Yes — but be careful with `maxIterations` to avoid exponential explosion.

#### Can a Task call another workflow as a sub-workflow?
Not directly today. Workflows compose via Capabilities (which wrap workflows). Talk to engineering about future sub-workflow nodes.

#### Why does my workflow halt at a Branch?
Possible reasons: condition didn't match any outgoing path; the expression has a syntax error; the value being evaluated is null/undefined.

#### What does the orderIndex field on Task nodes do?
Display-only — used to show step numbers in the UI. Doesn't affect execution order (that's determined by graph edges).

#### Can I have multiple End nodes?
Yes — useful for branching workflows where each path produces a different output. Just make sure your downstream consumers can handle multiple endpoints.

#### How do I see what each node is doing during a run?
Open the workflow in execution view (during or after the run). Each node shows its status — pending / running / completed / error. See [Workflow Runs & Reports](/guide/workflow-runs).

#### How do variables work across nodes?
Each node's output is referenceable via templating in downstream prompts — typically a double-brace syntax like `{step_N_output}` or `{node_label.field}`. Exact syntax depends on the runtime.

#### Can I trigger a workflow from a Branch node?
No — Branch nodes route, they don't trigger. To trigger from within a workflow, use a Task node that calls a trigger tool.

#### What's the difference between a workflow and a capability?
- **Workflow**: The graph (this doc).
- **Capability**: A user-facing wrapper around a workflow (with prompt form, output studio, etc.).

See [Capabilities](/guide/capabilities).

#### Why doesn't the Merge node automatically know which paths feed it?
React Flow lets any node connect to any other; the editor doesn't enforce graph-topological rules at edit time. Runtime validation checks at execute-time.

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| Cannot drag-to-connect two nodes | One of them isn't a node that allows that connection direction; or React Flow misinterpreted the gesture. Refresh canvas. |
| Branch condition evaluates to nothing | Expression syntax error, OR the referenced value is null. Add a console log step before the Branch. |
| Workflow halts at Foreach | Items source is empty or null; maxIterations is 0. |
| Population node can't be selected | Workspace doesn't have populations enabled (`enablegeneralpopulations` flag) or no populations exist yet. |
| End node disabled | Selecting an output format may be required; pick one. |
| Task node won't save | An Agent isn't selected; pick one from the modal. |
| Edges cross visually | Reorganize nodes; React Flow doesn't auto-layout. |
| "Cycle detected" error | A non-Foreach loop in the graph; convert to Foreach or break the cycle. |
| Foreach maxIterations exceeded warning | Increase the cap (carefully), or trim the input array. |
| Merge waits forever | One incoming path failed silently; check the run history for the failed node. |
| Variables Node values don't propagate | Confirm the Variables Node is connected upstream and the variable name matches your Task's prompt placeholders. |
| Output not in expected format | Mismatched End node output format vs downstream consumer expectations; check both. |

---

## Cross-references

- [Workflows](/guide/workflows) — workflow concepts and the editor overview
- [Workflow Scheduling](/guide/workflow-scheduling) — make a workflow run on a recurring schedule
- [Workflow Runs & Reports](/guide/workflow-runs) — inspect node-by-node execution history
- [Agents](/guide/agents) — pick agents for Task nodes
- [Chat Tools](/guide/chat-tools) — which tools agents can call in Task nodes
- [Capabilities](/guide/capabilities) — capabilities wrap workflows for end-user invocation
- [Output Studio](/guide/output-studio) — V2 output authoring (sibling to End node config)
- [Prompt Form Canvas](/guide/prompt-form-canvas) — V2 input authoring
- [People](/guide/people) — Populations referenced by Population nodes
- [General Populations](/guide/general-populations) — platform-curated populations
- [Concept Simulations](/guide/concept-simulations) — uses Population nodes heavily
- [AI Models](/guide/ai-models) — per-Task-node model selection
- [Feature Flags Reference](/guide/feature-flags) — flags that affect node availability
- [Developer & API Reference](/guide/developer-reference) — GraphQL `AiOrchestration` type
- [Glossary](/guide/glossary) — Workflow / Task / Persona definitions
