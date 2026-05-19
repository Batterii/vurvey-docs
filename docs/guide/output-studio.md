---
title: Output Studio
---

# Output Studio

**Output Studio** is the workflow-scoped authoring surface for designing what a Workflow's output looks like — the structured cards, charts, metrics, and narrative elements that compose a "deliverable" from a workflow run. It's the visual counterpart to the OutputSpec schema your workflow emits, and it's how a research workflow becomes a presentable artifact instead of a raw JSON blob.

Output Studio is what produces the **Evidence-badged dashboards** documented in [Sources & Citations → Part 3](/guide/sources-and-citations#part-3-structured-output-evidence-badges-workflow-outputs-dashboards). The badges and per-element citations you see on a finished dashboard are emitted from a workflow run that this studio shaped.

::: warning Feature-flag gated
Output Studio is gated by `outputStudioEnabled` (a workspace flag). The hook `useIsOutputStudioEnabled()` reads this flag and bounces direct-URL access back to the standard Flow Builder when off. This is a soak-rollout flag (Phase 6E) — most workspaces don't have it yet. Ask your CSM about availability.
:::

![Output Studio shell — preview pane, history, chat, publish flow](/screenshots/output-studio/01-studio.png?optional=1)
![Element library — 24+ component types](/screenshots/output-studio/02-elements.png?optional=1)
![Publish modal](/screenshots/output-studio/03-publish.png?optional=1)
![Per-history Output Studio view](/screenshots/output-studio/04-history-view.png?optional=1)

---

## Two routes

| Route | Purpose | Component |
|---|---|---|
| `/workflow/flows/:workflowId/output-studio` | **Design-time** — author the OutputSpec for this workflow. Compose elements, configure schemas, preview against sample data, publish a new version. | `OutputStudio` |
| `/workflow/flows/:workflowId/view/:historyId/output-studio` | **Run-view** — view a specific run's structured output rendered through the published OutputSpec. Read-only artifact view. | `FlowOutputStudio` |

Both routes redirect away when `outputStudioEnabled` is off:

- Design-time route bounces to the standard Flow Builder (`/workflow/flows/:workflowId`).
- Run-view route bounces to the run's `report` view (`/workflow/flows/:workflowId/view/:historyId/report`).

::: info Why the flag is conservative
Output Studio replaces a workflow's freetext-Markdown deliverable with a typed structured output that downstream consumers (dashboards, exports, embeds) can rely on. Flipping it on without an updated OutputSpec for each workflow would leave downstream views empty. The soak rollout staggers enablement so workspaces get migrated workflows in lock-step.
:::

---

## What Output Studio produces

The studio's job is to define an **OutputSpec**: a typed schema of fields, layouts, and element bindings that the workflow's `emit_structured_output_with_evidence` post-run extractor populates with values + per-field citations.

When a workflow runs:

1. The workflow produces a freetext-Markdown report (the existing synthesizer path).
2. The **post-run extractor** runs `claude-sonnet-4-5` with the workflow's published OutputSpec compiled into a JSON schema.
3. The extractor returns `{value, citations[]}` per field, validated against the OutputSpec.
4. The **OutputRenderer** binds each element to its `fieldKey` and renders the value + an Evidence badge popover.
5. Surface adapters (export, dashboard, pipeline, chat) all re-use the same element renderers but with their own layout.

See [Sources & Citations → Post-run extractor](/guide/sources-and-citations#the-post-run-extractor) and [Capabilities → Backend service layer](/guide/capabilities#backend-service-layer) for the full pipeline.

---

## Studio layout

The design-time studio (`OutputStudio` component) is a multi-pane editor.

| Pane | What it's for |
|---|---|
| **Chat panel** | An AI assistant for authoring the OutputSpec. Ask: _"Add a metric card for the confidence score"_ or _"Generate three sample Concepts"_. The assistant edits the spec collaboratively. |
| **Preview pane** | Live render of the OutputSpec using sample data. Shows what the run-time deliverable will look like. |
| **Preview frames** | Multiple device frames (desktop / tablet / mobile) so you can see how the output reflows. |
| **History panel** | Past versions of the OutputSpec — published versions and drafts. Restore any version. |
| **Templates** | Pre-built OutputSpec patterns (FISH dashboard, executive summary, concept comparison, etc.) to start from. |
| **Import / Export** | Export the OutputSpec as JSON for backup, version control, or migration to another workflow. Import to seed a new spec from a saved JSON. |
| **Publish modal** | Final review before promoting the draft to published. Once published, the OutputSpec is what new runs use. |

The studio operates on a per-workflow basis — each Workflow has its own OutputSpec. Editing one doesn't affect another.

### `useStudioSession`

The studio uses a `useStudioSession` hook that manages:
- The current draft OutputSpec
- The published version (read-only view for comparison)
- Sample data for previews
- Chat assistant context
- Save / publish state machine

---

## The element library

OutputRenderer ships with 24+ element types. Each is wrapped in `ElementWithCitations` so it gets an Evidence badge unless its `type` is in the skip list (`customLayout`, `divider`, `divider-with-label`).

| Element type | What it renders | Common use |
|---|---|---|
| **`title`** | Large heading | Section / dashboard titles |
| **`subtitle`** | Secondary heading | Sub-section labels |
| **`description`** | Paragraph text | Explanatory narrative |
| **`metric`** | Single big number with label | KPI displays (response count, completion rate) |
| **`progress-bar`** | Linear fill | Goal progress, completion percentages |
| **`gauge`** | Arc / dial | Confidence scores, satisfaction indices |
| **`score-bar`** | Horizontal score line | Single-axis ranked scores |
| **`score-range`** | Score with min/max range | Scoring with uncertainty bounds |
| **`strength-badge`** | Strong / Moderate / Weak chip | Signal-strength labels |
| **`rating`** | Star or numeric rating | Satisfaction / quality ratings |
| **`chart`** | Configurable chart (bar / line / pie) | Visualizations |
| **`data-table`** | Tabular data | Structured datasets, response tables |
| **`comparison`** | Side-by-side comparison panel | A/B options, concept variants |
| **`key-value`** | Label-value pairs | Metadata blocks, summary stats |
| **`bullet-list`** | Unordered list | Themes, findings, recommendations |
| **`numbered-list`** | Ordered list | Steps, ranked items |
| **`tag-list`** | Pill / chip cluster | Categories, tags, labels |
| **`quote`** | Pull-quote with attribution | Direct respondent quotes |
| **`timeline`** | Vertical event sequence | Chronological data |
| **`image`** | Embedded image | Concept visuals, generated images |
| **`sources`** | Source list block | Aggregated citation listing |
| **`divider`** | Horizontal rule (no Evidence badge) | Visual separators |
| **`divider-with-label`** | Rule with inline label (no Evidence badge) | Labeled section breaks |
| **`element-placeholder`** | Empty-state placeholder | Drafts / missing-data states |
| **`custom-layout`** | Custom grouping container (no Evidence badge) | Composed multi-element layouts |

### Field binding

Every renderer-aware element has a `fieldKey` referencing a field in the OutputSpec schema. At render time the data binder reads `data[fieldKey]` and the citations context reads `citations[fieldKey]`. Elements without a `fieldKey` (`customLayout`, `divider`, `divider-with-label`) skip the Evidence-badge wrapper.

See [Sources & Citations → How elements get the badge](/guide/sources-and-citations#how-elements-get-the-badge) for the wrapping pattern.

---

## Surface adapters

The OutputRenderer is parameterized by surface adapter. The same OutputSpec renders differently in different contexts:

| Adapter | Where it renders |
|---|---|
| **`chat-adapter`** | Inline in a chat conversation (compact density, inline citations) |
| **`dashboard-adapter`** | Capability dashboards (full layout with Evidence popovers) |
| **`export-adapter`** | PDF / DOCX / static-image exports (Evidence renders as footnotes) |
| **`pipeline-adapter`** | Workflow chain handoff (machine-readable JSON shape) |

A single OutputSpec works across all four — you don't author separate versions. The adapter controls density, interactivity, and how citations are surfaced (popover vs footnote vs JSON field).

---

## Publishing flow

1. **Draft the OutputSpec** in the studio. Compose elements, bind fields, preview against sample data.
2. **Test with a real workflow run.** Click the run button (or open a recent run from History) to see the spec render against actual data — including real Evidence-badged citations.
3. **Review for completeness.** Are all the fields in your workflow's output schema covered? Are there orphan elements with no `fieldKey` binding?
4. **Open the Publish modal.** Confirms the version bump, shows the diff against the previous published version, captures release notes.
5. **Publish.** The new OutputSpec becomes what subsequent runs use. The previous version is preserved in History — you can roll back at any time.

::: tip Publish from a stable run
If you have a recent workflow run that produced exactly the output you want to formalize, you can use that run's data as the studio's preview source — your draft is automatically tested against real production-like data before publish.
:::

### History & rollback

The History panel lists every version of the OutputSpec with timestamps and authors. Click any entry to:

- **View** that version (read-only render).
- **Restore as Draft** — copies the version into your current draft, ready to edit.
- **Compare** against the current draft (visual diff of the spec JSON).

Restoring an older version doesn't immediately publish it; it becomes your new draft until you re-Publish.

---

## Per-history view (`FlowOutputStudio`)

The run-view route renders one specific workflow run's output through the published OutputSpec:

- Reads the run's structured output (post-run extractor result).
- Renders through the same OutputRenderer + element library used in design-time preview.
- Evidence badges are populated with the run's actual citations from the workflow's freetext report.
- Read-only — no editing.

If `outputStudioEnabled` is flipped off mid-run, this view bounces to the run's `report` page so the user lands somewhere useful instead of a blank page.

---

## Integration with capabilities

When a Workflow is part of a Capability:

- The Capability's Dashboard tab renders OutputStudio-shaped output via the `dashboard-adapter`.
- The Capability's exported deliverables use the `export-adapter`.
- Multiple workflows in the same Capability can share Object Types (Insight / Concept / Evaluation) but each has its own OutputSpec.

See [Capabilities → Dashboard tab](/guide/capabilities#dashboard-tab) and [Capabilities → Object Types](/guide/capabilities#object-types-capabilities-object-types) for the broader picture.

---

## Constraints & limitations

- **`outputStudioEnabled` workspace flag required.** Direct-URL access without the flag redirects to Flow Builder.
- **The hook `useIsOutputStudioEnabled()` is a stub returning false on this branch.** Real workspace-flag check lives on a sibling branch waiting to merge. If you can't enable Output Studio on your workspace despite ostensible config, the gating code may not be wired yet for your environment.
- **One OutputSpec per Workflow.** A workflow's draft and published spec are 1:1. Multiple deliverable formats come from different surface adapters, not multiple OutputSpecs.
- **Elements without a fieldKey skip Evidence badges.** Use `divider`, `divider-with-label`, or `customLayout` deliberately when you don't want Evidence wrapping.
- **The extractor schema is recompiled per run.** Changes to the OutputSpec take effect on the NEXT workflow run; in-flight runs use the spec that was published when they started.
- **Sample data for preview ≠ real data.** A draft preview using fixture data may render differently than the production run does on real freetext input — always test with at least one real run before publishing.
- **JSON Import/Export is opt-in for engineers.** The Import modal accepts spec JSON, but malformed JSON or schema-incompatible imports will fail validation.
- **No multi-user concurrent editing.** Two people editing the same workflow's spec simultaneously will race; last write wins.
- **The Capability Builder V2 (`capabilityBuilderV2Enabled`) has its own Prompt Form Canvas surface** at `/workflow/flows/:workflowId/prompt-form`. That's a separate route from Output Studio.

---

## Best practices

- **Start from a template.** The studio's Templates panel includes the FISH dashboard, executive summary, and concept-comparison patterns — they cover most use cases. Adapt rather than starting from scratch.
- **Bind every element to a fieldKey.** Orphan elements without bindings render empty placeholders in runs.
- **Use compact elements for chat-adapter contexts.** Title + metric + bullet-list reads better in chat than a 12-element dashboard.
- **Preview the export adapter before publishing.** Some chart and gauge elements render differently in static exports (PDF/DOCX) than on screen.
- **Keep field names stable.** Renaming a `fieldKey` in the OutputSpec breaks runs that produced data under the old name. If you must rename, version-bump the schema and migrate.
- **Use `description` elements for narrative.** They're the natural home for prose that doesn't fit into structured fields.
- **Save as Draft frequently.** History keeps all versions, but the draft survives only as long as you don't refresh without saving.
- **Coordinate publish events with downstream consumers.** If a Capability's dashboard subscribers depend on a specific field shape, announce the OutputSpec version bump.

---

## FAQ

#### Why don't I see Output Studio?
Workspace `outputStudioEnabled` flag is off — it's a soak-rollout flag. Ask your CSM.

#### Can I share an OutputSpec across workflows?
Not directly via the studio. Use the Export → JSON path to extract a spec from one workflow and Import it into another. The fieldKeys must match the importing workflow's output schema or extraction will fail.

#### What happens to runs in flight when I publish a new spec?
In-flight runs use the spec that was published at the time they started. Subsequent runs use the new spec. The History panel tracks which run used which version.

#### Can the chat assistant author the spec for me?
Yes — that's its primary role. Ask in natural language ("add a confidence-score gauge", "split this into two side-by-side concept panels", "generate three sample respondent quotes for the quote element") and it edits the spec. Review before publishing.

#### Why does my element render empty?
Three common causes: (1) the `fieldKey` doesn't exist in the workflow's emitted schema; (2) the workflow run produced null for that field; (3) the OutputSpec was published AFTER the run completed, so the extractor used an older schema. Check History to verify.

#### Can I customize the Evidence badge appearance?
Not from the studio UI. Badge styling is a shared component (`CitationsBadge`) — engineers can override styles via the module SCSS. See [Sources & Citations → Evidence badge](/guide/sources-and-citations#the-evidence-badge-interaction).

#### What's the difference between dashboard-adapter and export-adapter?
- **Dashboard adapter** renders an interactive surface — Evidence popovers open on click, charts are interactive, layout reflows responsively.
- **Export adapter** renders for static output (PDF / DOCX / image) — Evidence becomes inline footnotes or end-of-document references, layouts are fixed for the target page size.

Same OutputSpec, different render behavior.

#### Does the AI chat assistant cost credits?
Yes — it's an LLM-driven feature. The cost is the same as any other LLM workspace usage. Heavy iteration with the assistant burns through credits faster than manual editing.

#### Why is the FlowOutputStudio (run-view) read-only?
By design — it represents a finished run. The OutputSpec used by that run is what produced its values + citations; changing the spec would invalidate the run. To re-render with a different layout, re-run the workflow against the updated spec.

#### How do I roll back to an older OutputSpec?
History panel → click the version → **Restore as Draft** → review → Publish. The "restore" produces a new published version (with version bump) rather than altering the published-version history.

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| `/workflow/flows/:id/output-studio` redirects to flow builder | `outputStudioEnabled` flag is off for this workspace. |
| Run-view URL redirects to `/report` | Same flag-off cause — guards both routes. |
| Preview pane shows placeholders, not data | Sample data isn't loaded, OR the `fieldKey`s don't match the workflow's emitted schema. |
| Chat assistant edits a field but the preview doesn't update | The draft saves on tick — wait a beat, then refresh the preview. |
| Publish modal won't let me publish | Validation errors in the spec — usually missing required fields or unbound elements with `fieldKey`. Read the error list at the top of the modal. |
| History panel is empty | This is the first version of the spec for this workflow — no history yet. |
| Imported JSON spec fails validation | Spec format doesn't match the expected shape (mismatched fieldKeys, unknown element types, malformed citations schema). |
| Dashboard render of a Capability doesn't match the studio preview | The Capability is using a different (older) published version of the spec, OR a different surface adapter is in play. |
| Evidence badges don't appear on my element | Element type might be in `SKIP_ELEMENT_TYPES` (`customLayout`, `divider`, `divider-with-label`), OR the element has no `fieldKey`. |

---

## Cross-references

- [Workflows](/guide/workflows) — the parent surface; Output Studio is a workflow-scoped tool
- [Capabilities](/guide/capabilities) — Capabilities consume OutputStudio-shaped output via dashboard / export adapters
- [Sources & Citations → Structured Output Evidence](/guide/sources-and-citations#part-3-structured-output-evidence-badges-workflow-outputs-dashboards) — the citation pipeline that powers Evidence badges
- [Platform Architecture](/guide/architecture) — `output-studio-export-worker` and the wider rendering pipeline
- [Developer & API Reference](/guide/developer-reference) — programmatic OutputSpec import/export and structured-output extraction
- [Glossary → OutputSpec / Evidence badge / Output Studio](/guide/glossary)
- [What's New](/guide/whats-new) — Output Studio Phase 6E rollout status
