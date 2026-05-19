---
title: AI Models
---

# AI Models

Every chat, every workflow step, every Capability run is powered by an underlying **AI model**. Vurvey orchestrates models from multiple providers (Anthropic, Google, OpenAI, and Vurvey-internal) and exposes them in two places: the **AI Models settings page** (catalog view) and the **chat model selector** (picker during a conversation). This doc explains what's available, how to pick the right model, and the trade-offs between them.

---

## Where models show up

Vurvey doesn't show "models" as a single tab — they appear at three distinct surfaces:

| Surface | Path | Who sees it | What it does |
|---|---|---|---|
| **AI Models settings page** | Settings → AI Models | Workspace users | Read-only catalog of every model your workspace can use, grouped by category, searchable |
| **Chat model selector** | Toolbar in any chat | Workspace users (flag-gated) | Live selector — pick the model your next message will use |
| **Personality LLM tab** | Implementation → Molds → Personality Modal → LLM tab | Vurvey staff | Set a default LLM for agents spawned from this Mold |

---

## The AI Models settings page

> 📷 _Screenshot pending: AI Models settings page — search input at top, categorized model cards below_

The catalog view at **Settings → AI Models** is your one-stop reference for "what AI models can I use in this workspace?" It's read-only — you can't enable/disable models from here; that's a backend configuration done by Vurvey staff.

### Page anatomy

| Element | Purpose |
|---|---|
| **Search input** | Live-filters model cards by name (substring, case-insensitive). |
| **Model groups** | Models are grouped by **category** (e.g. Foundation, Transcript, Image, etc.) defined in the `aiModelCategories` schema. Empty categories are hidden. |
| **Model cards** | One card per available model — see "Anatomy of a model card" below. |
| **Empty state** | "No AI models available for this workspace." Appears if no models are enabled. |
| **Error state** | Shows the GraphQL error message if either of the two queries fail. |

### Anatomy of a model card

> 📷 _Screenshot pending: A single model card with badges, title, description, status, and provider icon_

Each card shows:

| Field | Source | Notes |
|---|---|---|
| **Task badge** | `model.task` | Top-left chip — e.g. "foundation", "multimodal", "transcript" |
| **Modality badge** | `model.modality` | Second chip — overlaps with task for foundation models, separate for specialized ones |
| **Name** | `model.name` | Provider's display name (e.g. "Claude Sonnet 4.6") |
| **Description** | `model.description` | Free-text from the catalog — what the model is good for |
| **Status indicator** | `model.status` | `deployed`, `beta`, or `coming-soon` — see [Status meanings](#status-meanings) below |
| **Provider icon** | Derived from `model.provider` | Google icon for Google, Anthropic icon for Anthropic, Vurvey lockup otherwise (used for OpenAI and Vurvey-internal models) |

### Status meanings

| Status | What it means | Availability |
|---|---|---|
| **deployed** | Production-stable, fully supported | Available everywhere — chat, workflows, capabilities |
| **beta** | Available but under active testing — behavior may change | Limited surfaces; may not appear in chat selector |
| **coming-soon** | Configured but not yet active | Visible in catalog as a preview; not usable in actual runs |

---

## The chat model selector

> 📷 _Screenshot pending: Chat toolbar with model selector chip + open popup showing models grouped by provider_

::: tip Flag note: `chatmodelselectoractive`
The model selector chip in the chat toolbar is gated by the runtime flag `chatmodelselectoractive`. If you don't see a model selector in your chat toolbar, this flag is off for your workspace. See [Feature Flags Reference → chatmodelselectoractive](/guide/feature-flags#chatmodelselectoractive).
:::

The chat model selector lets you switch the LLM mid-conversation. Click the chip in the chat toolbar to open the picker; click a model to switch.

### Picker layout

The popup shows models grouped by **provider** with a **tier badge** on each row.

For each model option:

| Field | Source | What it tells you |
|---|---|---|
| **Provider icon** | Anthropic / Google / OpenAI / Vurvey | Color-coded; matches the [PROVIDER_METADATA](#provider-metadata) table below |
| **Display name** | From the model's catalog entry, falling back to `MODEL_METADATA[id].displayName` | e.g. "Claude Sonnet 4.6" |
| **Tier badge** | `metadata.tier` | Flagship, Balanced, Fast, or Legacy — see [Model tiers](#model-tiers) |
| **Tagline** | `metadata.tagline` | One-line description of the model's strength |
| **Context** | `metadata.contextLengthFormatted` | e.g. "1M", "200K" — the max tokens the model can read in one request |
| **Speed** | `metadata.speed` mapped via `formatSpeed()` | Instant / Fast / Moderate / Slow |
| **Checkmark** | Highlights the currently-selected model |

### Visibility logic

Not every model in the GraphQL response shows up in the picker. The picker:

1. Queries `GET_LLM_MODELS` to get the list of workspace-enabled models.
2. For each one, calls `isModelVisibleInPicker(modelId)` which checks if the ID exists in the static `MODEL_METADATA` catalog.
3. Only models that appear in BOTH the workspace list AND the static catalog show up.

This means: when Vurvey ships a new model, it has to be (a) enabled for your workspace AND (b) have a metadata entry in the client code before it appears in the selector. Models without metadata won't crash anything — they just won't be selectable here.

---

## Model tiers

Every model is classified into one of four tiers. The tier is the most important high-level signal when choosing a model for a task.

### Flagship

> Most capable models. Best for complex reasoning, large analyses, code generation, long-context tasks.

Use when: producing strategic insights, multi-step reasoning, processing long documents, generating high-quality marketing copy, debugging complex code, drafting strategy docs.

Trade-offs: highest cost, slowest response.

### Balanced

> Best mix of capability and speed.

Use when: most everyday chat tasks, drafting responses, summarizing, classifying, light analysis.

Trade-offs: typically what you want by default. Capable enough for ~80% of tasks; faster and cheaper than flagship.

### Fast

> Quick responses with reduced capability.

Use when: simple Q&A, classification, content moderation, summarizing short text, anywhere latency matters more than depth.

Trade-offs: less reasoning depth; longer prompts can lose track of context.

### Legacy

> Models superseded by newer versions. Kept for reproducibility.

Use when: you need to reproduce a result from an older run, or you have a tested prompt you don't want to change. Generally avoid for new work.

Trade-offs: typically slower, more expensive, OR less capable than current alternatives — just preserved for backward compatibility.

---

## Provider metadata

Each provider has its own visual styling (color, icon, brand). The PROVIDER_METADATA constants:

| Provider | Color (light) | Color (dark) | Notes |
|---|---|---|---|
| **Anthropic** | `#D97706` (amber) | `#F59E0B` | Claude family |
| **Google** | `#4285F4` (blue) | `#60A5FA` | Gemini family |
| **OpenAI** | `#10A37F` (teal) | `#34D399` | GPT family |
| **Generic / Vurvey** | `#8B5CF6` (purple) | `#A78BFA` | Internal models — Vurvey-trained or custom |

The provider color shows in the picker's left border + icon background.

---

## Current model catalog

Below is the current list of models that have metadata in the client. Workspace availability varies — check your AI Models settings page for what's actually enabled for you.

### Anthropic (Claude family)

| Model | Tier | Context | Speed | Best for |
|---|---|---|---|---|
| **Claude Sonnet 4.6** | Balanced | 1M | Fast | Default-go-to: best balance of intelligence + speed |
| **Claude Opus 4.5** | Flagship | (Long) | Moderate | Most capable reasoning |
| **Claude Haiku 4.5** | Fast | (Standard) | Fast | Quick tasks, low cost |
| **Claude Sonnet 4.5 (superseded)** | Legacy | — | — | Superseded by 4.6; kept for compatibility |
| **Claude Sonnet 4** | Balanced | — | — | Earlier balanced model |
| **Claude Opus 4** | Flagship | — | — | Earlier flagship reasoning |
| **Claude 3.5 Sonnet** | Legacy | — | — | Legacy model |
| **Claude 3.5 Haiku** | Legacy | — | — | Legacy model |

### Google (Gemini family)

| Model | Tier | Strength |
|---|---|---|
| **Gemini 3 Pro** | Flagship | Advanced reasoning & coding |
| **Gemini 3 Flash** | Fast | Latest fast multimodal |
| **Gemini 3 Pro Image** | Flagship | Advanced image generation |
| **Gemini 2.5 Pro** | Flagship | Advanced reasoning & coding |
| **Gemini 2.5 Flash** | Fast | Lightning-fast responses |
| **Gemini 2.5 Flash Image** | Fast | Fast image generation |
| **Gemini 2.5 Flash-Lite** | Fast | Ultra-efficient processing |
| **Gemini 2.0 Flash** | Legacy | Earlier fast model |

### OpenAI (GPT family)

| Model | Tier | Strength |
|---|---|---|
| **GPT-5.4** | Flagship | Best intelligence at scale |
| **GPT-5.4 Pro** | Flagship | Smarter, more precise reasoning |
| **GPT-5.4 Mini** | Balanced | Strong mini model for coding & sub-agents |
| **GPT-5.4 Nano** | Fast | Fast, low-cost model for simple tasks |
| **GPT-5.1 Codex Max** | Flagship | Advanced agentic coding |
| **GPT-4o** | Legacy | Earlier multimodal |

::: tip Catalog vs. workspace availability
Not every model above is enabled for every workspace. The list represents what the platform can route to; your specific workspace may have a subset based on contract / plan. Check your AI Models settings page for the authoritative per-workspace list.
:::

---

## Model capabilities

The static metadata includes per-model capability flags (used to drive UI affordances — e.g. "this model supports vision so we'll let you attach images"):

| Capability | Meaning |
|---|---|
| **vision** | Can interpret images attached to the message |
| **tools** | Supports tool / function calling (used by agents) |
| **json** | Can produce structured JSON output reliably |
| **code** | Strong code-generation capability |
| **longContext** | Excels at long-context tasks (>100K tokens) |
| **streaming** | Returns tokens incrementally instead of one final blob |

Most current-tier models (flagship + balanced) support all six. Fast and legacy models have varying support — the picker may grey out incompatible features when one of these is selected.

---

## Task and modality classification

Each model also has a `task` and `modality` (often identical for foundation models, distinct for specialized ones). The possible values:

`foundation` · `transcript` · `question` · `campaign` · `creator` · `answer-video` · `language` · `speech` · `multimodal` · `video` · `document` · `image` · `generative`

Used by:
- The AI Models settings page (rendered as badges on each card)
- Internal routing — when a Capability or Workflow says "use a foundation model for this step," it picks from models with `task: "foundation"`

You don't typically choose models by task/modality directly — you choose by name in the picker.

---

## Mold-level default LLM (staff-only)

> 📷 _Screenshot pending: Personality Modal — LLM tab — SelectInput with model options_

Vurvey staff can pre-select a default LLM for agents spawned from a Personality Mold. From **Implementation → Molds → [Personality] → LLM tab**:

| Field | Purpose |
|---|---|
| **Default personality LLM** | Which model should be preselected when agents are created from this personality mold |
| **Selector** | Standard select input with all available LLM options for the workspace |

This is a productization feature for ensuring new agents start with the right model — e.g. "all 'Analyst' personality agents default to Claude Opus 4.5 for deeper reasoning." See [Implementation → Molds](/guide/implementation#molds-implementation-molds-feature-flagged) for the parent feature.

---

## Choosing a model — quick guide

| Need | Pick |
|---|---|
| Quick chat, simple Q&A, classification | Haiku 4.5, Gemini 2.5 Flash, GPT-5.4 Nano |
| Daily chat, summarizing, drafting | **Claude Sonnet 4.6** (default for most users) |
| Long document analysis (>100K tokens) | Claude Sonnet 4.6 (1M context), Gemini 3 Pro |
| Deep strategic reasoning | Claude Opus 4.5, Gemini 3 Pro, GPT-5.4 Pro |
| Code generation / debugging | Claude Opus 4.5, GPT-5.1 Codex Max, Gemini 3 Pro |
| Vision tasks (image input) | Any with the `vision` capability (most current flagship + balanced) |
| Image generation | Gemini 3 Pro Image, Gemini 2.5 Flash Image |
| Lowest cost / latency | Fast-tier models — Haiku 4.5, Gemini 2.5 Flash-Lite, GPT-5.4 Nano |

When in doubt, **default to Claude Sonnet 4.6**. It's the platform's go-to balanced model.

---

## Constraints & limitations

- **Per-workspace availability is opaque from the UI.** The AI Models settings page shows what's enabled but doesn't say _how_ it got enabled — that's a backend config done by Vurvey staff.
- **Model switching mid-conversation creates a context handoff.** Switching from one model to another mid-chat preserves the message history, but the new model "reads" all previous messages fresh — there's no shared latent state. This can produce subtle response differences.
- **Context windows are theoretical maxes.** A 1M-context model can technically accept 1M tokens, but quality often degrades well below that limit. Best practice: stay under 50% of the max.
- **Models with `coming-soon` status are not callable.** They appear in the catalog as a preview only.
- **Image-modality models may not be in the chat picker.** The picker shows models suited to conversation; image-generation models are typically invoked via Image Studio or other surfaces.
- **Tier labels are advisory.** They're meant to guide selection, not enforce it — any deployed model can be called for any task.
- **No real-time pricing is shown.** The cost tier in metadata (1-5) is relative; actual costs depend on input/output tokens and rate plans negotiated with providers. See [Credits & Usage](/guide/credits-and-usage) for how model calls translate to credit deductions.
- **`enablenewagentnames` flag does NOT affect model names.** That flag only affects agent-type label aliases (Consumer Persona → Advocate). Model names are universal.
- **Legacy models won't be removed without notice for in-flight runs.** But new runs may default to a current-tier model when the legacy one is deprecated.

---

## Best practices

- **Default to Sonnet 4.6 for most chat.** Only escalate to Opus or GPT-5.4 Pro when you need flagship reasoning.
- **Use Fast-tier for classification + tagging tasks.** They're fast enough to keep agents responsive and cheap enough to scale.
- **Don't switch models mid-conversation for fun.** Every switch incurs a cold-read of the message history — keep the same model unless you've got a specific reason.
- **For workflows with long-context steps, set the workflow-step model to a long-context option.** Don't rely on chat default.
- **Check the AI Models page when onboarding a new workspace.** Confirm the models your team needs are enabled before designing prompts around specific ones.
- **Pin a default LLM at the Personality Mold level** if you have a consistent use case — saves users picking every time.

---

## FAQ

#### What model is being used right now if I haven't picked one?
The chat defaults to whatever the workspace / mold defines as the default — typically Claude Sonnet 4.6 for most workspaces. The chip in the toolbar shows the current selection.

#### Why is one of my favorite models missing from the picker?
Either it's not enabled for your workspace (talk to your CSM), OR it doesn't have a client-side metadata entry yet (a code-level addition needed), OR its status is `coming-soon` and it's not yet callable.

#### Can I switch models mid-conversation?
Yes — pick a different model from the chip and your next message uses it. The chat context (prior messages) is shared; the new model reads them on its own when it generates a reply.

#### Does switching models cost credits?
No additional cost for the switch itself. The credit cost is per-message based on the model used to generate that reply.

#### What's the difference between a "task" and a "modality" on a model?
They're often the same for foundation models. For specialized models they diverge — e.g. a transcript model has `task: "transcript"` (it's used for transcripts) and `modality: "speech"` (it accepts speech input).

#### How do "tier" and "status" relate?
- **Tier** = capability classification (flagship / balanced / fast / legacy)
- **Status** = lifecycle (deployed / beta / coming-soon)

A model can be a deployed-flagship, a deployed-legacy, a beta-flagship, etc. The picker uses both — tier sorts by capability, status decides if it's callable at all.

#### Why is my "vision" attempt failing?
The selected model doesn't have the `vision` capability flag. Switch to a model that supports vision (typically current-tier flagship or balanced models) before attaching an image.

#### How do I know which model a workflow step is using?
Inside the workflow editor each task node has a model dropdown. The run history shows which model was used for which step. See [Workflows](/guide/workflows).

#### Can I bring my own model (custom or self-hosted)?
Not today. Models are configured platform-wide; per-workspace bring-your-own-model isn't supported. Talk to engineering if you have a unique requirement.

#### What does "1M context" actually mean?
The model can ingest up to ~1,000,000 tokens of input in a single request (roughly 750,000 words). In practice, quality drops as you approach the limit — keep prompts under 500K tokens for best results.

#### Why does Vurvey use multiple providers?
Different providers excel at different tasks. Claude is strongest on reasoning + long context. Gemini leads on multimodal + cost-efficient speed. GPT-5 is strong on coding + agentic flows. Routing to the best model for the task gives Vurvey the strongest possible AI per dollar.

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| Model selector chip not visible in chat | `chatmodelselectoractive` flag off for your workspace |
| AI Models page shows "No AI models available" | Workspace has no models enabled — talk to CSM |
| Error loading AI models | GraphQL error — check console; talk to Vurvey staff if persistent |
| Model name in picker but not in catalog | Static metadata exists but workspace doesn't have it enabled — visible in metadata-defined picker logic but the GraphQL response excludes it |
| Switched model but responses look the same | The new model may handle the prompt similarly. Try a more distinct alternative (e.g. switch from Sonnet to Haiku to see latency difference) |
| Workflow step picks wrong model | The default model on a workflow step is set in the step config — open the step in the editor and change it |
| Image attached but not understood | Selected model doesn't have `vision` capability — switch to one that does |

---

## Cross-references

- [Home → Model selector](/guide/home#model-selector) — the chat-toolbar picker
- [Settings](/guide/settings) — workspace-level configuration including model enablement
- [Credits & Usage](/guide/credits-and-usage) — how model calls translate to credits
- [Workflows](/guide/workflows) — per-step model selection in workflows
- [Capabilities](/guide/capabilities) — Capabilities run on top of workflows; their model choices follow workflow config
- [Implementation → Molds](/guide/implementation#molds-implementation-molds-feature-flagged) — Mold-level default LLM
- [Feature Flags Reference](/guide/feature-flags) — `chatmodelselectoractive` and related flags
- [Topic Graph](/guide/topic-graph) — uses Gemini 3 Flash for entity extraction
- [Canvas & Image Studio](/guide/canvas-and-image-studio) — image generation surfaces use image-modality models
- [Glossary](/guide/glossary) — definitions for tier, modality, context window
