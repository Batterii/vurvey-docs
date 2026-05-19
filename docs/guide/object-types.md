---
title: Object Type Definitions
---

# Object Type Definitions

**Object Type Definitions** are workspace-scoped schemas that describe how custom data shapes — typically the outputs of [Capabilities](/guide/capabilities) — render as cards in your dashboards. They combine a JSON Schema (payload contract), a render template (card layout), and a detail modal config (full-view layout) into a single registry entry that the Autonomous Capabilities Platform consumes. This doc explains the three-layer model, the validator rules, and how to create / edit one.

::: tip Audience
This is primarily for engineers and capability authors. End users see the rendered cards in their dashboards without needing to know about the underlying schema. But understanding the model is essential for designing new capability outputs or debugging "why doesn't my card render?" issues.
:::

::: warning Flag note: Capabilities feature
Object Type Definitions are part of the **Autonomous Capabilities Platform** (Phase 1a in the codebase comments). The page `/capabilities/object-types` requires `autonomousCapabilitiesEnabled` on the workspace. The schema-editing surface itself is mostly stable; the Phase 1a / Wave 3 split refers to how richly the schema can be edited via UI (Wave 3 adds full schema editing; pre-Wave 3 supports limited update via `updateObjectTypeDefinitionSchema`).
:::

---

## What an Object Type is

Think of an Object Type as a **typed contract** between a Capability and the dashboard:

1. A Capability runs and produces some output (e.g. "a list of insights" or "a research summary").
2. The output is structured according to the Object Type's JSON Schema.
3. The dashboard rendering layer uses the render template to display each item as a card.
4. When a user clicks the card, the detail-modal config determines what they see in the full view.

This separation lets capability authors and dashboard designers work independently — the JSON Schema is the stable contract; render details can evolve without breaking the contract.

---

## The three-layer model

> 📷 _Screenshot pending: Diagram showing Schema → RenderTemplate → DetailModalConfig flow_

### 1. Schema (JSON Schema draft 2020-12)

The shape of the payload. The "what fields exist and what types are they?" layer.

**Validation rules:**

| Rule | Why |
|---|---|
| Must be a non-null object | Required by the validator |
| Root `type` must be `"object"` | Object types describe object payloads, not primitives |
| Must compile via Ajv (JSON Schema draft 2020-12) | Catches malformed schemas at definition time |

**Example minimal schema:**

```json
{
  "type": "object",
  "properties": {
    "title": {"type": "string"},
    "description": {"type": "string"}
  },
  "required": ["title"]
}
```

This declares an object with a required `title` and optional `description`, both strings.

::: tip Why draft 2020-12?
The Ajv2020 variant ships the draft-2020-12 meta-schema pre-registered, matching what the FISH (Vurvey's seed) schemas declare via `$schema`. Older drafts (07 etc.) won't validate the same way against payloads.
:::

### 2. Render template

A JSON document describing **how to render** the payload as a card.

**Structure:**

```json
{
  "kind": "card",
  "fields": [
    {"slot": "title", "source": "title"},
    {"slot": "body", "source": "description"}
  ]
}
```

**Key fields:**

| Field | Purpose |
|---|---|
| `kind` | Required — the kind of card (e.g. `card`, `note`, `chart`) |
| `variant` | Optional — kind-specific variant string |
| `fields` | Array of slot bindings — each maps a UI slot to a data source |

**Field binding object:**

| Property | Purpose |
|---|---|
| `slot` | The UI slot to fill (e.g. `title`, `body`, `icon`, `image`) |
| `source` | The path into the payload (e.g. `"title"` or `"metadata.subtitle"`) |
| `sources` | Multiple paths to merge into one slot (alternative to `source`) |
| `optional` | If true, missing data won't error |
| `accent` | Slot-specific accent color override |

**Cross-reference validation:**

The validator ensures every `source`/`sources[i]` references a top-level property declared in the schema's `properties`. This catches typos at design time: writing `{"source": "tilte"}` when the schema declares `title` will throw `ObjectTypeRenderTemplateInvalidError`.

### 3. Detail modal config

The full-view layout shown when a user clicks the card.

**Structure:**

```json
{
  "tabs": [
    {
      "id": "overview",
      "label": "Overview",
      "sections": [
        {
          "kind": "fieldList",
          "fields": [
            {"label": "Title", "source": "payload.title"},
            {"label": "Description", "source": "payload.description"}
          ]
        }
      ]
    }
  ]
}
```

The detail modal supports multiple tabs, each with multiple sections. Each section has a `kind` (e.g. `fieldList`, `markdown`, `chart`) and section-specific fields.

::: tip Source paths in detail config
Detail config sources are typically prefixed `payload.` to distinguish payload fields from container-level fields (metadata, timestamps). Render template sources don't use the prefix because they always implicitly target the payload.
:::

---

## The full ObjectTypeDefinition record

| Field | Type | Purpose |
|---|---|---|
| `id` | ID | Unique identifier |
| `workspaceId` | GUID | The workspace it belongs to |
| `name` | String | Human-readable name (e.g. "Brand Insight") |
| `slug` | String | URL-safe identifier (e.g. `brand-insight`) |
| `schemaVersion` | Int | Increments on schema changes for migration tracking |
| `schema` | JSON | The JSON Schema (above) |
| `renderTemplate` | JSON | The card-render template (above) |
| `detailModalConfig` | JSON | The detail-view layout (above) |
| `accentColor` | String | Hex color for visual accenting (default `#7c5cff`) |
| `pinnable` | Boolean | Whether users can pin instances of this type to their dashboard |
| `actions` | JSON | Available actions on this type (Phase 1a — semantics still evolving) |
| `sourceCapabilityDeploymentId` | ID | Links to the Capability that produces this type (if applicable) |
| `createdAt` | DateTime | When created |
| `updatedAt` | DateTime | Last modification |

---

## The management UI

> 📷 _Screenshot pending: /capabilities/object-types page with list of types_

Workspace admins manage Object Types at **/capabilities/object-types**. The page is workspace-scoped and shows:

- List of all Object Type Definitions for this workspace
- Created / Updated timestamps (formatted via `formatDistanceToNow`)
- "Create new" button → opens [Create Object Type Modal](#the-create-modal)
- Back-link to /capabilities

Each entry shows: name, slug, accent-color swatch, last-updated timestamp.

---

## The Create modal

> 📷 _Screenshot pending: Create Object Type Modal with name + slug + 3 JSON editors + accent + pinnable_

Click "Create new" to open the Create modal. Fields:

| Field | Purpose | Default |
|---|---|---|
| **Name** | Human-readable name (e.g. "Brand Insight") | (empty — required) |
| **Slug** | URL-safe identifier, auto-generated from Name | Auto-slugified (lowercased, special chars → `-`) |
| **Schema** | JSON Schema editor with validation | DEFAULT_SCHEMA (title + description) |
| **Render Template** | JSON editor for the card layout | DEFAULT_RENDER_TEMPLATE (card with title + body) |
| **Detail Modal Config** | JSON editor for the full-view | DEFAULT_DETAIL_MODAL_CONFIG (Overview tab with fieldList) |
| **Accent Color** | Hex color picker | `#7c5cff` (Vurvey purple) |
| **Pinnable** | Checkbox — can users pin to dashboard? | False |

### JSON field validation

Each JSON editor pre-validates with `JSON.parse()` and shows inline errors if parsing fails. Schema-against-payload validation happens server-side on the `createObjectTypeDefinition` mutation.

### Slugify algorithm

The Name → Slug auto-conversion:

```
"Brand Insight Report" → "brand-insight-report"
```

Specifically:
1. Lowercase everything
2. Replace non-alphanumeric runs with `-`
3. Collapse consecutive `-`
4. Strip leading/trailing `-`

You can manually override the slug if you want a different one.

---

## How render templates and payloads work together

Here's an end-to-end example.

### Schema

```json
{
  "type": "object",
  "properties": {
    "title": {"type": "string"},
    "headline": {"type": "string"},
    "summary": {"type": "string"},
    "confidence": {"type": "number"},
    "tags": {
      "type": "array",
      "items": {"type": "string"}
    }
  },
  "required": ["title", "headline"]
}
```

### Render template

```json
{
  "kind": "card",
  "variant": "with-tags",
  "fields": [
    {"slot": "title", "source": "title"},
    {"slot": "subtitle", "source": "headline"},
    {"slot": "body", "source": "summary", "optional": true},
    {"slot": "badge", "source": "confidence", "optional": true},
    {"slot": "tags", "source": "tags", "optional": true}
  ]
}
```

### Detail modal config

```json
{
  "tabs": [
    {
      "id": "overview",
      "label": "Overview",
      "sections": [
        {
          "kind": "fieldList",
          "fields": [
            {"label": "Title", "source": "payload.title"},
            {"label": "Headline", "source": "payload.headline"},
            {"label": "Summary", "source": "payload.summary"}
          ]
        }
      ]
    },
    {
      "id": "details",
      "label": "Details",
      "sections": [
        {
          "kind": "fieldList",
          "fields": [
            {"label": "Confidence", "source": "payload.confidence"},
            {"label": "Tags", "source": "payload.tags"}
          ]
        }
      ]
    }
  ]
}
```

### Sample payload

```json
{
  "title": "Pricing concerns dominate Q2 feedback",
  "headline": "Mobile app pricing flagged in 31% of responses",
  "summary": "Customers consistently cite pricing as their top concern...",
  "confidence": 0.87,
  "tags": ["pricing", "mobile", "q2-2026"]
}
```

When a Capability emits this payload tagged with this Object Type:
- The card renders with the title, subtitle, body, badge (confidence), and tag chips.
- Click → detail modal opens with two tabs (Overview + Details).

---

## Schema-side validation by the API

When you call the `createObjectTypeDefinition` mutation, the API validates:

1. **Schema**: Must be a non-null object with root `type: "object"`. Compiles cleanly via Ajv2020.
2. **Render Template**: Has a `kind` field. Every `source`/`sources[i]` references a property declared in the schema's `properties`.
3. **Detail Modal Config**: Looser validation today — invalid configs throw at render time, not at create time.

The three error types:
- `ObjectTypeSchemaInvalidError`
- `ObjectTypeRenderTemplateInvalidError`
- `ObjectTypePayloadInvalidError` (raised at runtime when a payload doesn't conform)

---

## How payloads get validated at runtime

When a Capability produces an instance of an Object Type:
1. The Capability's output (the payload) is collected.
2. The Object Type's schema is loaded.
3. `validatePayloadAgainstSchema(payload, schema)` runs — throws `ObjectTypePayloadInvalidError` if non-conforming.
4. If valid, the payload is stored alongside metadata (timestamps, sourceCapabilityDeploymentId, etc.) for rendering.

Invalid payloads are rejected — the Capability's output is logged as a failure rather than silently corrupting downstream rendering.

::: tip Validator memory hygiene
The validator compiles schemas ephemerally and `removeSchema()`'s them from Ajv's cache afterward. This is a deliberate hygiene measure: without it, every distinct schema instance would accumulate forever on long-running servers, since the FISH schemas don't declare `$id` (the usual cache key).
:::

---

## Updating an Object Type

Two mutations exist:

| Mutation | Purpose | Scope |
|---|---|---|
| `updateObjectTypeDefinition` | Update any combination of editable fields | Standard editing |
| `updateObjectTypeDefinitionSchema` | Replace ONLY the JSON Schema | "Full implementation in Wave 3" — currently constrained |

The dedicated schema-update mutation exists because schema changes are special — they may break existing payloads. Wave 3 (per the schema comment) will add full validation that pre-existing instances still conform.

---

## Constraints & limitations

- **Workspace-scoped only.** No global / cross-workspace Object Types.
- **Schema must declare root `type: "object"`.** No array-typed or primitive-typed root payloads.
- **Render template `source` references must match top-level schema properties.** Nested paths aren't enforced today.
- **No render-template runtime — it's interpreted, not executed.** No conditional logic or computed fields today.
- **Detail modal config has looser validation.** Bad configs surface as runtime errors.
- **The Phase 1a / Wave 3 split:** schema-update surface is partial pre-Wave 3.
- **Actions metadata is forward-looking.** The shape is reserved but semantics evolve.
- **Slug uniqueness within workspace.** Two Object Types can't share a slug.
- **Schema versioning is manual.** `schemaVersion` increments only via update operations; no auto-bump.
- **No migration tooling today.** When you change a schema, pre-existing payloads aren't auto-migrated; they may fail validation.
- **JSON Schema draft 2020-12 only.** Older drafts won't compile through Ajv2020.
- **Render slots are hard-coded in the renderer.** A new `slot` value won't display unless the renderer has been updated to handle it.

---

## Best practices

- **Start narrow.** Define just `title` + a body field; add complexity incrementally.
- **Mark optional fields with `optional: true` in the render template.** Otherwise missing data breaks the card.
- **Use the auto-slug.** Manual slugs drift from the name; auto is more consistent.
- **Keep schemas backward-compatible.** Add new optional fields rather than renaming or removing.
- **Use accent colors strategically.** All blue cards blur together; one orange "warning" card draws attention.
- **Pinnable: true only for outputs users want to monitor.** Less-relevant outputs should be unpinnable.
- **For Capability outputs, name the Object Type after the Capability domain.** "Insight" or "Recommendation" beats "Card" or "Output".
- **Test with sample payloads before publishing.** Use the validator to catch typos before users see broken cards.
- **Coordinate with the Capability author.** The Capability's output shape must match the schema; misalignment = empty cards.
- **Bump schemaVersion on every schema change.** This is your audit trail.

---

## FAQ

#### What's the difference between a Capability and an Object Type?
- **Capability** is the **producer** — the workflow that runs and emits data.
- **Object Type** is the **format** — the schema + rendering of the data.

A single Capability may emit multiple Object Types. A single Object Type may be produced by multiple Capabilities (in which case its `sourceCapabilityDeploymentId` is nullable or only set to one of them).

#### Can two Object Types share a slug?
No — slugs are unique per-workspace.

#### Can I extend an Object Type with a sub-type or inherit from another?
Not today. Each Object Type is standalone. Use JSON Schema's `$ref` if you want to factor common subobjects, but the parent-pointer field (`extends`) doesn't exist.

#### What happens if a Capability emits a payload that doesn't match the schema?
`ObjectTypePayloadInvalidError` is thrown. The Capability's output is rejected; the user sees an error indicating the schema mismatch.

#### Can I edit an Object Type after it's been used by a Capability?
Yes — but be careful. Existing payloads may no longer validate against the new schema. Bump `schemaVersion` and consider whether old payloads need migration.

#### What does the render template's `kind` field do?
It picks the renderer. Built-in kinds (per the codebase): `card`, `note`, `chart`. Adding a new kind requires renderer code, not just data.

#### How does the detail modal know which payload to show?
The Object Type instance carries both the Object Type ID and the payload data. The renderer joins them at display time.

#### Can I render the same Object Type in different ways?
Per-Object-Type today, no. The render template is part of the Object Type's identity. Workarounds: create a new Object Type with a different render template, OR use the `variant` field to switch within one kind.

#### What's `payload.` prefix for in detail modal config sources?
Detail modal config sources can reference either the payload (the data) OR the container (the type metadata). `payload.title` is unambiguous; `title` alone could be either. The render template doesn't need this disambiguation because it only sees payload data.

#### Can I have computed fields (e.g. derived from other fields)?
Not in the render template today. Workaround: have the Capability compute the derived value and include it in the payload.

#### How are Object Types discovered by capabilities?
Workspace admins create the Object Types first, then capability authors reference them by ID or slug when configuring the Capability's output schema. See [Capabilities](/guide/capabilities).

#### Is there a sample-payload preview in the modal?
Not yet — pre-Wave 3 limitation. Test by triggering a Capability run end-to-end after defining the Object Type.

#### Can I have multiple detail-modal tabs that share fields?
Yes — same `source` can appear in multiple tabs/sections. No deduplication; rendered everywhere it's referenced.

#### Does the schema's `required` field affect rendering?
Indirectly — fields marked required must always be in the payload (validation enforces this). Missing required fields → validation error → card never renders.

#### How big can a schema be?
JSON Schema draft 2020-12 has no practical size limit. But: large schemas slow validation and render. Keep schemas small and focused.

#### Can I use $ref to compose schemas?
Yes — Ajv supports $ref. Useful for shared sub-schemas across multiple Object Types.

#### What's `actions` for?
Forward-looking — will hold metadata for type-specific actions (e.g. "Open in detail view", "Pin to dashboard"). Semantics evolve.

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| Create fails with "Schema must be a non-null object" | The schema field is null, undefined, or a primitive — provide an object |
| Create fails with "Root schema must have type: 'object'" | Schema has wrong root type — change to `"type": "object"` |
| Create fails with Ajv compile error | Schema has invalid JSON Schema syntax — check the error message for the failing path |
| Render template "kind" missing error | Add the `kind` field to the top level of the render template |
| "Source field X not in schema" | Render template references a field not declared in `schema.properties` — typo or missing declaration |
| Card renders blank | Payload missing the fields referenced by the render template — debug with sample payload |
| Detail modal section doesn't render | Section `kind` may be unrecognized OR sources reference missing fields — check console |
| Existing payloads broken after schema change | Schema change made old payloads non-conforming — migrate or roll back |
| Slug conflict | Another Object Type uses this slug — change one |
| Object Type doesn't appear in Capability output picker | sourceCapabilityDeploymentId not set, OR Capability isn't using this type |
| ObjectTypePayloadInvalidError on Capability run | Payload doesn't match the schema — Capability emitted wrong shape |
| Render template accent color ignored | Per-slot accent overrides the per-type accent; check both |
| Pinnable toggle doesn't make it appear in dashboard | `pinnable: true` enables pinning; user still has to explicitly pin |
| Auto-generated slug looks wrong | Slug is generated from name; edit manually if needed |

---

## Cross-references

- [Capabilities](/guide/capabilities) — Capabilities produce instances of Object Types
- [Output Studio](/guide/output-studio) — V2 authoring surface for capability outputs
- [Workflows](/guide/workflows) — Capabilities are wrappers around workflows
- [Workflow Node Types](/guide/workflow-nodes) — outputObjectType is a property on Task nodes
- [Feature Flags Reference](/guide/feature-flags) — `autonomousCapabilitiesEnabled`, `capabilityWave3BackendEnabled`
- [Settings](/guide/settings) — workspace-level configuration that gates this feature
- [Developer & API Reference](/guide/developer-reference) — full GraphQL schema for ObjectTypeDefinition
- [Architecture](/guide/architecture) — where Object Types fit in the platform
- [Glossary](/guide/glossary) — Capability / Object Type / Render Template definitions
