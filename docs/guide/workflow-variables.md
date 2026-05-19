---
title: Workflow Variables
---

# Workflow Variables

**Workflow Variables** are typed, named parameters attached to a workflow that drive its execution — what to research, which audience, what time window, which dataset. They're declared once per workflow and referenced inside task prompts via templating. Multiple **variable sets** can be defined per workflow, with one marked active at a time, letting you switch contexts without rewriting the workflow itself. This doc covers the data model, the editor modal, every input type, and how variables flow through workflow execution.

::: tip Flag note: `workflowtemplatesandvariables`
The Variable Sets feature is gated by the `workflowtemplatesandvariables` runtime flag. If you don't see a Variables card / button on your workflow editor, this flag is off for your workspace. When `capabilityBuilderV2Enabled` (workspace flag) is ALSO on, clicking the Variables card navigates to the [Prompt Form Canvas](/guide/prompt-form-canvas) — its V2 counterpart for capability-level variable authoring.
:::

---

## What variables are

A workflow without variables is a static script — every run does the same thing. With variables, the SAME workflow runs differently based on input:

| Variable | Runs the workflow for... |
|---|---|
| `target_audience: "millennial coffee drinkers"` | a specific audience segment |
| `time_window: "last 90 days"` | a specific time range |
| `brand: "Acme Coffee"` | a specific brand under analysis |
| `campaign_id: "<guid>"` | a specific campaign's responses |

Inside the workflow's task prompts, variables are interpolated via templating syntax (typically a double-brace `{variable_key}` pattern — exact syntax depends on the runtime). The same workflow can therefore execute monthly with different inputs.

---

## Variable Sets — the container

A **variable set** (`AiOrchestrationVariables` in the API) bundles related variables under a name. A workflow can have many variable sets but exactly one is **active** at any moment. Switching the active set is how you change what the workflow does without editing the workflow itself.

### Variable-set fields

| Field | Type | Purpose |
|---|---|---|
| `id` | UUID | Identifier |
| `aiOrchestrationId` | UUID | Which workflow owns this set |
| `name` | String | Human-readable name (e.g. "Q2 2026 — Coffee Brand Audit") |
| `description` | String? | Optional context |
| `variables` | Record<string, string> | The key-value pairs |
| `variableDefinitions` | VariableDefinition[]? | Typed metadata for each variable |
| `isActive` | Boolean | Whether this is the workflow's currently-active set |
| `createdAt` | DateTime | When created |
| `updatedAt` | DateTime | Last modified |
| `deletedAt` | DateTime? | Soft-delete timestamp |

### Auto-generated names

When you create a new variable set without typing a name, the system generates one:

```
"<workflowname>_<YYYY-MM-DD>_variable_set"
```

E.g. `q2_brand_audit_2026-05-19_variable_set`. The workflow name is lowercased, non-alphanumerics become `_`, length capped at 40 chars.

---

## Variable definitions — the typed metadata

A `VariableDefinition` describes ONE variable's contract: its key, label, input type, validation rules, and default. The full type:

```ts
interface VariableDefinition {
  key: string;                  // The variable's identifier (matches the variables map key)
  label: string;                // Display label in the input form
  description?: string;         // Help text
  inputType?: VariableInputType; // Same as `type` (preferred name)
  type?: VariableInputType;
  defaultValue?: string;
  hidden?: boolean;             // NEW — hide input at runtime, send defaultValue instead
  required?: boolean;
  options?: VariableOption[];   // For select / multiselect
  min?: number;                 // For number / slider
  max?: number;                 // For number / slider
  step?: number;                // For number / slider
  rows?: number;                // For textarea
  placeholder?: string;
  suggestedValues?: string[];   // Soft suggestions, not constraints
  accept?: string;              // For file (MIME types like "image/*,application/pdf")
}
```

### Legacy fallback

For older workflows that have a `variables` map but no `variableDefinitions`, the system synthesizes definitions on read using `deriveDefinitions()`:

```ts
function deriveDefinitions(variables: Record<string, string>): VariableDefinition[] {
  return Object.keys(variables).map(key => ({key, label: key, type: "text"}));
}
```

This keeps old workflows functional — all variables default to text inputs.

---

## The 10 input types

`VariableInputType` enum covers a wide range of UX needs:

| Type | Renders as | Use for |
|---|---|---|
| **text** | Single-line text input | Short strings (names, IDs) |
| **textarea** | Multi-line text input (configurable `rows`) | Longer prompts, instructions |
| **number** | Number input (with `min`/`max`/`step`) | Numeric values |
| **select** | Dropdown (uses `options`) | Pick one from a constrained list |
| **multiselect** | Multi-select dropdown (uses `options`) | Pick multiple from a list |
| **toggle** | Checkbox / switch | Boolean flags |
| **date** | Date picker | Time-bounded inputs |
| **slider** | Slider (with `min`/`max`/`step`) | Numeric ranges with visual feedback |
| **file** | File upload (constrained by `accept`) | File inputs |
| **campaign** | Campaign picker | Reference to a Vurvey campaign |
| **dataset** | Dataset picker | Reference to a Vurvey dataset |

### Vurvey-aware types

The `campaign` and `dataset` types are special:

- They render as **resource pickers** scoped to the current workspace
- The user selects an existing campaign / dataset rather than entering a string
- The stored value is the resource's UUID
- The workflow can then reference the resource by ID

This lets a variable be a typed reference to a workspace resource, not just a free-text value.

### Hidden variables

`hidden: true` is for capability authors who want to fix a variable at design time:

- The input is NOT shown to runtime users.
- The `defaultValue` is sent on every run.
- Useful for locking in advanced settings users shouldn't change.

For example, a "model temperature" variable could be hidden with `defaultValue: "0.7"` so the workflow always uses that temperature without exposing it.

### VariableOption (for select / multiselect)

```ts
interface VariableOption {
  label: string;        // Display text
  value: string;        // Stored value
  icon?: string;        // Optional icon ID
  description?: string; // Optional help text per option
}
```

The `description` field is particularly useful for select dropdowns where each option has nuance — shown below the label as secondary text.

---

## The Variables Card

> 📷 _Screenshot pending: WorkflowVariablesCard inside the workflow editor canvas_

The Variables Card appears on the workflow canvas — a TuneIcon (sliders icon) with the active variable set's name + description + a horizontal row of variable badges (GitHub-style "key:value" chips).

| State | Display |
|---|---|
| No variables defined | _"Add variables sets to customize and control your workflow execution (optional)."_ — placeholder |
| Active set selected | Name + description + variable badges |
| Disabled (workflow running) | Greyed out; click does nothing |

### Click behavior

Clicking the card opens one of two surfaces depending on flags:

| Condition | Opens |
|---|---|
| `workspace.capabilityBuilderV2Enabled = true` AND workflow has a builderId | Navigates to `/workflow/flows/<id>/prompt-form` (Prompt Form Canvas) |
| Otherwise | Opens the **Select Workflow Variables Modal** (this doc's main surface) |

This routing means active V2-capability workflows skip the standard variables modal and use Prompt Form Canvas instead — for unified V2 input authoring.

---

## The Select Workflow Variables Modal

> 📷 _Screenshot pending: Three-tab modal with Active Set, Variable Sets List, Variable Set Form_

A three-tab modal for managing variable sets:

### Tab 1: Active Variable Set

> 📷 _Screenshot pending: Active set tab with editable variable inputs_

Shows the currently-active variable set, with each variable rendered using its declared `inputType`. Users can:
- Update variable values inline (drives the next run)
- See descriptions and help text
- Verify required fields are filled

### Tab 2: Variable Sets List

> 📷 _Screenshot pending: List of all variable sets with active indicator_

Lists all defined variable sets for this workflow. Each row shows:
- Set name + description
- Created / last-modified timestamps
- "Active" badge on the currently-active set
- Actions: Activate (switch), Edit (open the form), Delete (soft-delete)

### Tab 3: Variable Set Form

> 📷 _Screenshot pending: Form for creating or editing a variable set_

The authoring surface. Either:
- Creates a new variable set
- Edits an existing one

The form is split into:
- **Set metadata**: name, description, "set as active" toggle
- **Variable list**: each variable with its definition (key, label, input type, default, required, options if select/multiselect)
- **Add variable** button to append new variable definitions

The variable builder sub-component (`variable-builder/`) renders the type-specific configuration UI — e.g. for `select` type, you see an editor for option entries.

---

## How variables flow through a workflow

> 📷 _Screenshot pending: Diagram showing variables → task prompts → outputs_

When a workflow runs:

1. The **active variable set** is loaded — its `variables` map is materialized as the run's variable context.
2. Each **Task node** in the workflow has a prompt template.
3. Templating syntax inside the prompt references variables (e.g. via `{key}` or similar — exact syntax is runtime-specific).
4. Before the task runs, variables are substituted into the prompt text.
5. The resolved prompt is sent to the LLM.
6. Subsequent tasks can reference both their own variables AND the outputs of prior tasks.

### Example

**Variables (set):**

| Key | Value | Type |
|---|---|---|
| `brand` | `Acme Coffee` | text |
| `time_window` | `90` | number |
| `target_audience` | `millennial coffee drinkers` | text |

**Task 1 prompt template:**

> _"Research recent social-media discussion of {brand} from the last {time_window} days, focusing on {target_audience}."_

**Resolved at runtime:**

> _"Research recent social-media discussion of Acme Coffee from the last 90 days, focusing on millennial coffee drinkers."_

Multiple tasks can share the same variables; one set drives the whole workflow's behavior.

---

## Switching the active set

Two ways to make a different variable set active:

| Method | When to use |
|---|---|
| **Sets List tab → Activate button** | UI flow for human-driven switches |
| **`aiOrchestrationVariablesModifyActiveVariablesSetForWorkflow` mutation** | Programmatic / API-driven |

When you activate set B, set A is automatically deactivated (`isActive: false`). Exactly one set is active at any time. The Variables Card refreshes to show the new active set.

---

## Soft-deleting a set

A set can be soft-deleted via `aiOrchestrationVariablesDelete`. This:

- Sets `deletedAt` on the record
- Hides it from the standard sets list
- Preserves the data for audit / recovery (via `includeDeleted: true` on the query)

If the active set is soft-deleted, the workflow has no active set — the next run will fail until you activate another set.

---

## Constraints & limitations

- **Variable Sets feature requires `workflowtemplatesandvariables` flag.** Without it, no Variables card / modal.
- **Exactly one active set per workflow.** No multi-active support.
- **No cross-workflow set sharing.** A set belongs to one workflow.
- **Variable values are always strings.** Number / date / boolean types are stored as their string representations.
- **`campaign` and `dataset` types store UUIDs.** Validation that the referenced resource exists is up to the consumer (workflow's runtime).
- **The exact templating syntax depends on the workflow runtime.** Documented as double-brace `{key}` but verify in your specific runtime.
- **Hidden variables can still be observed in the API response.** "Hidden" is UI-side — `hidden: true` hides the input but the value is in plain text in the variables map.
- **Soft-delete is reversible only via API.** No UI to "undelete" a set today.
- **Legacy workflows without `variableDefinitions` default all variables to text.** No richer typing is auto-inferred.
- **File-type variables don't actually upload at definition time.** They prompt the user at run time; the actual file handling is runtime-specific.
- **No expression / formula support.** Variables are static values, not computed.
- **No environment variable defaults.** Defaults are per-set; no fallback hierarchy.
- **`suggestedValues` is advisory only.** Users can still enter values outside the list.

---

## Best practices

- **Name variable sets descriptively.** "Q2 brand audit" beats "Set 1".
- **Define variables types upfront.** Once a workflow is running, retroactively typing variables is messy.
- **Use `description` liberally.** Future-you (or a teammate) needs to know what each variable means.
- **Mark required variables explicitly.** `required: true` prevents users from launching a run with missing inputs.
- **For options-driven variables, use `select` not `text`.** Constrain inputs to the valid set.
- **Use `hidden + defaultValue` to lock advanced settings.** Hide model parameters from end-users to prevent accidental changes.
- **Use `campaign` / `dataset` types for resource references.** Don't ask users to type UUIDs.
- **Keep the variable count manageable.** 5-10 variables is a comfortable upper limit. More signals you're overloading the workflow.
- **Use `placeholder` to hint expected formats.** "Q2 2026" or "30" or "millennial coffee drinkers" — give users an example.
- **Test the workflow with the default variable values.** Confirm the defaults produce a reasonable run.
- **Coordinate variable changes with the workflow's task prompts.** A renamed key in the variable set breaks prompts that reference the old name.
- **Use distinct variable sets for distinct contexts.** Don't reuse "Q2 audit" set for Q3 — clone it, rename, and edit.
- **Document the workflow's variable contract.** Future maintainers need to know which variables are required and what they mean.

---

## FAQ

#### What's the difference between a variable set and a workflow template?
- **Variable set**: One workflow + multiple sets of input values = multi-context execution.
- **Workflow template**: A pre-configured workflow design that can be instantiated as a new workflow.

Both are gated by `workflowtemplatesandvariables` but serve different purposes.

#### Can I share a variable set between workflows?
Not directly — sets belong to one workflow. Workaround: duplicate the set's variables into a new set on the target workflow.

#### How do I migrate from `inputType` to `type` (or vice versa)?
The model supports both `inputType` and `type` fields aliased. Either works; pick one and be consistent.

#### What happens if a workflow runs without an active set?
The run fails at variable-resolution time. Activate a set before running.

#### Can I have nested variables (variable referencing another)?
Not today. Variables are flat; no inter-variable references.

#### Can the workflow modify a variable mid-run?
No — variables are read-only during execution. To produce dynamic outputs, use task outputs that downstream tasks reference.

#### What's `accept` for on file-type variables?
A comma-separated list of MIME types or extensions (e.g. `"image/*,application/pdf"`). Controls which files the picker accepts.

#### Can `select` options have icons?
Yes — `VariableOption.icon` field. Some renderers display the icon next to the option label.

#### Why does my Variables Card route to a different page?
You have `capabilityBuilderV2Enabled` workspace flag on. The card routes to the Prompt Form Canvas for capability-level variable authoring instead of the standard modal.

#### Can I delete an active set?
Yes — but the workflow will have no active set after deletion. Activate another set first.

#### What happens to old runs when I change a variable's value?
Old runs aren't affected — they used the variable values at the time they ran. The change applies to future runs only.

#### Can I export/import variable sets?
Not natively via UI today. The API supports CRUD; build your own scripts if needed.

#### How are variable definitions stored?
JSONB on the `aiOrchestrationVariables` row. Both `variables` (the map) and `variableDefinitions` (the typed metadata) are JSON columns.

#### Can I make a variable required AND hidden?
Yes — `required: true, hidden: true` is valid. It means "the variable must be present; users don't see the input; the defaultValue is sent."

#### Why do I see auto-generated names like `q2_2026-05-19_variable_set`?
You created a set without typing a name. The system auto-named it for you. Rename via the edit form.

#### How do I see all variable sets including soft-deleted ones?
Query with `includeDeleted: true` on `aiOrchestrationVariablesForAiOrchestration`. UI doesn't expose deleted sets today.

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| Variables card not visible | `workflowtemplatesandvariables` flag off; or the workflow has no variables setup |
| Card click navigates to Prompt Form Canvas | Expected when `capabilityBuilderV2Enabled` is on |
| Variable input wrong type | Check `inputType` / `type` field in the definition — may default to text if missing |
| Hidden variable being shown | `hidden: true` not propagated; check the definition |
| `select` dropdown empty | `options` array not populated |
| File upload not accepting my file | `accept` MIME type restriction; widen or remove |
| Variable not substituting in task prompt | Wrong templating syntax; check the runtime's expected format |
| Active-set switch didn't apply | Refetch the workflow; cache may be stale |
| New variable set didn't appear in list | Check fetchPolicy on the query; force a network-only refetch |
| Required variable not enforced | `required: true` is advisory at form-validate time; runtime may not block missing |
| Campaign/Dataset picker shows wrong workspace | Workspace ID resolution issue; refresh page |
| Numeric slider snaps to wrong values | `step` is misconfigured; check `min`/`max`/`step` math |
| Soft-deleted set reappears | Possible — depends on `includeDeleted` flag and cache state |
| Two sets marked active | API bug — only one should be active at a time; report it |
| Default value not appearing | `defaultValue` only populates an empty field; doesn't override user input |

---

## Cross-references

- [Workflows](/guide/workflows) — workflow concepts and the editor overview
- [Workflow Node Types](/guide/workflow-nodes) — Task nodes that reference variables in their prompts
- [Workflow Scheduling](/guide/workflow-scheduling) — scheduled runs use the workflow's active variable set
- [Prompt Form Canvas](/guide/prompt-form-canvas) — V2 capability-level variable authoring
- [Capabilities](/guide/capabilities) — Capabilities use workflows + variables for parameterized runs
- [Output Studio](/guide/output-studio) — V2 capability output authoring (the sibling of Prompt Form Canvas)
- [Workflow Runs & Reports](/guide/workflow-runs) — see which variable set was used for each run
- [Feature Flags Reference](/guide/feature-flags) — `workflowtemplatesandvariables`, `capabilityBuilderV2Enabled`
- [Developer & API Reference](/guide/developer-reference) — full GraphQL schema for AiOrchestrationVariables
- [Glossary](/guide/glossary) — Variable / Variable Set / Workflow definitions
