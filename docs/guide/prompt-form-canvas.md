---
title: Prompt Form Canvas
---

# Prompt Form Canvas (Capability Builder V2)

The **Prompt Form Canvas** is a full-page editor for designing how a Capability collects user input before a run — the form a user fills out to kick off a Capability conversation. It is the V2 successor to the inline "Design Prompt" experience on the conversation-capability-bar and is currently in soak rollout.

::: warning Feature-flag gated
The Prompt Form Canvas route is gated by `workspace.capabilityBuilderV2Enabled`. The route component (`PromptFormCanvasRoute`) bounces direct-URL access back to `/workflow/flows/:workflowId` when the flag is off. The "Design Prompt" button in conversation-capability-bar also gates on the same flag — but a hand-typed URL would otherwise bypass the soak rollout, hence the route-level guard. Ask your CSM about enablement.
:::

> 📷 _Screenshot pending: Prompt Form Canvas — editor on the left, preview on the right_
> 📷 _Screenshot pending: Prompt section_
> 📷 _Screenshot pending: Suggested Prompts section_
> 📷 _Screenshot pending: Guiding Controls section_
> 📷 _Screenshot pending: Live preview pane_
> 📷 _Screenshot pending: Removed sections bar_

---

## What this surface is

When a user opens a Capability for a fresh run, they're typically asked a question or two before the AI starts work — what brand to research, what target audience to focus on, what time range to cover. The Prompt Form Canvas lets you **design that input form** as the Capability author. Each variable becomes a field on the form; you control its label, placeholder, type, and required-ness.

The result is a typed `AiOrchestrationVariables` schema attached to the Workflow that drives the Capability. Users hitting the run-launch UI get an auto-generated form built from that schema.

---

## How to reach it

| Entry point | When |
|---|---|
| `/workflow/flows/:workflowId/prompt-form` (direct URL) | Bookmarkable. Gated by `capabilityBuilderV2Enabled`. |
| **Design Prompt** button on the conversation-capability-bar | When you're inside a conversation with a Capability and you want to edit the form. Same flag-gating. |

Both paths land on the same `PromptFormCanvasPage` component.

---

## Layout — Editor + Preview

The canvas is a **two-pane editor**:

| Pane | Purpose |
|---|---|
| **Editor panel** (left) | Author the form structure — sections, variables, controls |
| **Preview panel** (right) | Live preview of what the user-facing form will look like, updated as you edit |

The split lets you author-and-see in real time without switching tabs.

---

## Sections — the building blocks

The canvas organizes the form into named **sections**. The standard sections (each can be added, customized, or removed):

### Prompt section

The primary user-input prompt — the question the user answers when they kick off the Capability. Configuration:

| Property | Meaning |
|---|---|
| `key` | Internal variable name (e.g. `prompt`) |
| `label` | What the user sees as the field label |
| `type` | `text` is the default — the input type the form renders |
| `required` | Whether the user must fill it in |
| `placeholder` | Placeholder text inside the input |

Default values: `key: "prompt"`, `label: ""`, `type: "text"`, `required: true`, `placeholder: "What do you want to research?"`.

This is what an end user sees when they hit "Run" on the Capability — a free-text prompt asking what they want to research.

### Suggested Prompts section

Pre-fill the prompt with one of N curated example prompts. Useful for showing users the kinds of questions the Capability handles well. Each suggested prompt is a one-line example that the user can click to populate the prompt field.

Use this when:
- Users don't yet know how to phrase their input
- You want to nudge them toward queries the Capability handles best
- You want to provide testable patterns for new users

### Guiding Controls section

Optional control inputs that constrain or shape the Capability's run beyond the main prompt. Each guiding control is configured via a **Control Config Card**:

| Card field | Purpose |
|---|---|
| Variable key | Internal name (e.g. `target_audience`, `time_window`, `geography`) |
| Display label | User-facing label |
| Input type | Text, number, select, multi-select, date, etc. |
| Required | Whether the field is mandatory |
| Default value | What's pre-populated |
| Help text | Optional hint shown below the field |
| Options | For select/multi-select types, the list of choices |

Guiding controls give power users fine-grained control without overwhelming new users — the main prompt is enough for most queries; advanced users can fill in additional controls for more directed runs.

---

## Section accordion + removed sections bar

The Editor panel uses an **accordion** to collapse / expand sections — useful when the form has many guiding controls.

**Removed sections** (sections you've deleted from this form) appear in a horizontal bar at the bottom. You can restore them with one click — they're not gone forever, just hidden from the current configuration. This lets you experiment with form shapes without losing the original structure.

---

## Authoring workflow

A typical pass through the Prompt Form Canvas:

1. **Open the canvas** for your Workflow at `/workflow/flows/:workflowId/prompt-form`.
2. **Edit the prompt section** label + placeholder + required-ness to match what your Capability needs.
3. **Add 1–3 suggested prompts** that exemplify the kinds of queries your Capability handles best.
4. **Add guiding controls** for any constrainable variables (target audience, time window, geography).
5. **Check the preview pane** continuously as you go — what you author is what the user sees.
6. **Remove sections you don't need.** They land in the removed-sections bar; restore later if needed.
7. **Save.** The form is bound to the Workflow's `AiOrchestrationVariables` schema; the next run of the Capability shows your authored form.

---

## How the variables get used

When a user launches a Capability with a Prompt Form, every field they fill becomes a variable on the workflow run. Inside the Workflow's prompts, those variables can be interpolated via the standard `{{variable_key}}` syntax — see [Workflows → Variables Node](/guide/workflows#variables-node).

Example: if your Prompt Form has a `prompt` field and a `time_window` guiding control, your Workflow's agent task prompts can reference both:

> _"Research {{prompt}} focusing on activity in the last {{time_window}} days."_

This is how the V2 builder closes the loop from user input to AI orchestration without you wiring up a separate parameter-passing step.

---

## Constraints & limitations

- **`capabilityBuilderV2Enabled` workspace flag required.** The route bounces to the standard Flow Builder when off.
- **One Prompt Form per Workflow.** Each Workflow has its own variables schema; multiple variants require multiple workflows.
- **Variable keys are sticky.** Renaming a `key` after the Workflow has been run with the old name means historical runs reference a key that no longer exists. Treat keys as identifiers, not labels.
- **Input types are constrained.** Currently text-first; numeric, date, select, multi-select supported via Guiding Controls. Exotic types (rich text, file upload, location picker) are not.
- **Suggested Prompts cap.** No hard cap in code today but UX falls apart past ~5 suggestions.
- **Removed sections persist within the editor session.** Closing the page may not preserve "removed" state — re-add what you need.
- **The form runs ONLY at Capability run-launch.** It doesn't open mid-run; once a Capability has started, its inputs are fixed.
- **Preview rendering = production rendering.** What you see in preview is exactly what users get.
- **No conditional fields today.** You can't say "show field X only if field Y is value Z". For conditional UI, encode the logic in the Workflow itself.

---

## Best practices

- **Keep the prompt section short and focused.** _"What do you want to research?"_ beats a 4-line essay prompt.
- **Use Suggested Prompts to demonstrate scope.** Picking three good examples teaches users what the Capability is for without you writing a help doc.
- **Add guiding controls sparingly.** Each one is a barrier between user intent and Capability execution. Add only the ones that genuinely matter for the run.
- **Default-fill where you can.** Required controls without sensible defaults make users guess; better to default to "last 30 days" than to require they pick.
- **Keep variable keys lowercase + underscore-separated.** `target_audience` not `targetAudience`. Easier to interpolate, easier to debug.
- **Watch the preview as you edit.** It's the only way to catch ugly defaults or unintuitive section ordering before users see it.
- **Use the removed-sections bar for experimentation.** Pull a control out, see if the form is cleaner, restore if not.

---

## FAQ

#### Why don't I see the "Design Prompt" button on my Capability?
`capabilityBuilderV2Enabled` is off for your workspace. The button and the route both gate on the same flag.

#### Can I share a Prompt Form across workflows?
Not directly — each Workflow has its own form. To duplicate a form, recreate it on the target workflow (or, for engineers, copy the `AiOrchestrationVariables` schema via GraphQL).

#### What happens to old runs if I edit the form?
New runs use the new form. Old runs reference whatever variables existed at the time they ran — you can still view them in the run history (they don't disappear). If you renamed a variable key, the old run will show the renamed key in some places and the original-key value in others. **Treat key changes as breaking** and only do them when launching a fresh series of runs.

#### How is this different from the Variables Node in the Workflow builder?
- **Variables Node** is workflow-internal — defines variables for use across the workflow's steps regardless of where the values come from.
- **Prompt Form Canvas** designs the **user-facing form** that collects values for those variables when a user launches a run.

They work together: the Variables Node declares the variables; the Prompt Form Canvas designs how a user supplies their values at run-launch time.

#### Can the form change mid-conversation?
No. The form is shown once at Capability launch. Mid-run interaction happens through the chat surface (see [Home](/guide/home)), not through additional form prompts.

#### What input types does Guiding Controls support?
At minimum: text, number, select (single-choice from options list), multi-select, date. Implementation-detail input types may exist in the codebase but should be considered unstable until they appear in the canvas UI.

#### Why is my "removed" section back when I refresh?
The removed-sections bar persists removals within a single editing session. A refresh / navigation away may restore the original section set. Save explicitly to persist your structure.

#### Does the form work in the Responder app?
No. The Prompt Form is a Manager-side authoring + run-launch surface for Capabilities. Respondents in the Responder app don't see Capability prompts — they see survey questions.

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| Direct URL bounces to `/workflow/flows/:id` | `capabilityBuilderV2Enabled` flag off. |
| Preview pane is blank | Editor has no sections — add at least a prompt section. |
| User-facing form doesn't show my latest edits | Save explicitly. Some preview changes are local-state-only until persisted. |
| Variable key collision warning | Two sections have the same `key` value. Rename one. |
| Guiding control reverts to default | The control was added but its default value was never saved. Re-save the form. |
| Workflow agent task doesn't see variable | Confirm the variable key is exactly what the agent task prompt references (case-sensitive, underscore vs hyphen, etc.). |
| Removed section won't restore | Refresh — the removed-sections bar may have lost its state. Re-create the section. |

---

## Cross-references

- [Workflows → Variables Node](/guide/workflows#variables-node) — internal variable declaration for workflow steps
- [Capabilities](/guide/capabilities) — the parent feature that uses these prompt forms
- [Output Studio](/guide/output-studio) — the sibling V2 authoring surface for what comes OUT of a workflow run
- [Settings → workspace feature flags](/guide/settings#workspace-flags-you-may-encounter) — `capabilityBuilderV2Enabled`
- [Developer & API Reference](/guide/developer-reference) — `AiOrchestrationVariables` schema reference
- [Common Recipes → Automate weekly research](/guide/recipes#recipe-3-automate-a-weekly-research-summary-as-a-capability) — end-to-end Capability recipe that uses Prompt Form Canvas at launch
