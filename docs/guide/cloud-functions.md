---
title: Cloud Functions Reference
---

# Cloud Functions Reference

Vurvey's backend isn't a single service — it's the [vurvey-api](/guide/developer-reference) GraphQL backbone PLUS **47 independent Google Cloud Functions** that handle background processing: AI insight generation, video transcription, embedding refresh, email delivery, file malware scanning, BigQuery ETL, third-party integrations, and more. This doc is a reference catalog of every function — what triggers it, what it does, and where it fits in the platform.

::: tip Audience
This is primarily a reference for engineers and CSMs investigating platform behavior. Most end users will never need to think about these — they're invisible-by-design. But when something seems "stuck" (no insights yet on a campaign, no email arrived, no transcript appeared), this catalog tells you which background service is responsible.
:::

---

## Architecture context

Background work moves through this pipeline:

1. **A user action in the Manager app** (e.g. publishing a campaign, uploading a dataset file) triggers a GraphQL mutation in `vurvey-api`.
2. **vurvey-api emits a Pub/Sub event** to a topic like `sensemake-*-dev`, `vurvey-events`, `vurvey-chat-message`, or `vurvey-importer`.
3. **A Cloud Function subscribed to that topic fires**, runs (typically a few seconds to a few minutes), and writes results back to the Postgres database (or to GCS for binary artifacts, or to BigQuery for analytics).
4. **The Manager app subscribes via GraphQL subscriptions** (`ORCHESTRATION_EVENTS` etc.) and renders new data when it arrives.

The Cloud Functions are stateless — each invocation processes one message, writes results, and exits. There's no in-memory state shared across runs.

---

## Where they live

| Repo | Path | What it owns |
|---|---|---|
| **vurvey-gcf-scripts** | github.com/Batterii/vurvey-gcf-scripts | 47 Cloud Functions, each in its own directory |
| **vurvey-api** | github.com/Batterii/vurvey-api | The GraphQL API that publishes events |
| **vurvey-web-manager** | github.com/Batterii/vurvey-web-manager | The frontend that subscribes to update events |

Each function in vurvey-gcf-scripts is a **standalone directory** with its own `main.py` (Python) or `index.js` (Node.js), its own `requirements.txt` or `package.json`, and its own deploy workflow under `.github/workflows/deploy-*.yml`.

::: warning Per-function dependencies are isolated
There's no `helpers/` shared across functions — each function has its own copy. This deliberate redundancy means one function can bump a library version without affecting others. The cost is that fixes to "shared" helpers must be propagated manually to each function that needs them.
:::

---

## Function categories

### Sensemake — AI / ML processing pipeline (`sensemake-*`)

The largest category. These functions process campaign responses, generate insights, train AI models on user data, and produce reels.

| Function | Purpose |
|---|---|
| `sensemake-create-campaign-insights` | Generate workspace-level insights from a campaign's aggregate responses |
| `sensemake-create-campaign-summary` | Produce a campaign summary text and key findings |
| `sensemake-create-question-insights` | Extract per-question insights from response data |
| `sensemake-create-question-insights-gen2` | Newer (Gen 2) version of the question-insights pipeline |
| `sensemake-create-question-keywords` | Extract keywords / themes from open-ended question responses |
| `sensemake-create-question-keywords-v2` | Refreshed keywords pipeline |
| `sensemake-create-videoai` | Run video AI analysis on uploaded creator videos |
| `sensemake-creator-insights` | Per-creator insight generation (one row per creator) |
| `sensemake-creator-reel` | Generate a "reel" — short highlight compilation of a creator's responses |
| `sensemake-get-campaigns` | Internal Sensemake-side fetch of campaign records |
| `sensemake-get-creators` | Internal Sensemake-side fetch of creator records |
| `sensemake-get-questions` | Internal Sensemake-side fetch of question records |
| `sensemake-process-document` | Process an uploaded dataset document (text, PDF, etc.) into a TrainingSet entry |
| `sensemake-process-transcripts` | Process video transcripts into searchable, embedded chunks |
| `sensemake-process-video-metrics` | Compute video-specific metrics (length, engagement, content tags) |
| `sensemake-remove-train-data` | Remove a TrainingSet entry from the index when a dataset is deleted |
| `sensemake-train-data` | Train data orchestrator — wraps the embedding + indexing flow |
| `sensemake-train-data-trigger` | Pub/Sub trigger that kicks off `sensemake-train-data` for incoming files |
| `sensemake-user-summary` | Produce a per-user summary across their conversational history |

These are the workhorses behind [Topic Graph](/guide/topic-graph), [Reels](/guide/reels), [Datasets](/guide/datasets) ingestion, and the campaign Insights tab.

### Vurvey-Custom — workflow-specific functions (`vurvey-*`)

| Function | Purpose |
|---|---|
| `vurvey-agent-agent-creator` | Auto-generate an Agent from a brief description (the agentbuilderwithgenerationflow flow) |
| `vurvey-agent-campaign-creator` | Auto-generate a Campaign from a description |
| `vurvey-brand-setup` | Process a workspace's branding configuration (theme colors, logos) |
| `vurvey-concept-testing` | Run concept-testing simulations against AI personas |
| `vurvey-concept-testing-checker` | Validate concept-test submissions and check for issues |
| `vurvey-concept-testing-parser` | Parse uploaded concept materials (images, PDFs) into testable claims |
| `vurvey-copilot` | The chat backend — orchestrates LLM calls + tool invocations for chat |
| `vurvey-copilot-log-message` | Logs each message in a chat for billing and analytics |
| `vurvey-kg` | Knowledge graph operations — entity extraction and graph maintenance |
| `vurvey-salesforce-integration` | Salesforce data sync for connected workspaces |
| `vurvey-salesforce-metrics` | Salesforce-specific metric aggregation |
| `vurvey-workflow` | Workflow runtime — executes the AiOrchestration graph step by step |

### Data warehouse — BigQuery ETL (`datawarehouse-*`)

| Function | Purpose |
|---|---|
| `datawarehouse-agg-conversation-tokens` | Aggregate LLM token counts from chat conversations for billing analytics |
| `datawarehouse-creator-rank` | Compute creator-ranking scores |
| `datawarehouse-creator-score` | Per-creator quality / engagement score |
| `datawarehouse-currency-conversion` | Convert payment amounts between currencies (for rewards across regions) |
| `datawarehouse-dim-documents` | Maintain the documents dimension table in BigQuery |
| `datawarehouse-fact-conversations` | Conversations fact table in BigQuery |
| `datawarehouse-fact-documents` | Documents fact table in BigQuery |

### File scanning — malware quarantine (`scanning-*`)

| Function | Purpose |
|---|---|
| `scanning-handle-quarantine` | Quarantine files flagged as malware; move to isolation bucket |
| `scanning-sort-clean-output` | Re-categorize / re-bucket files that passed malware scanning |

::: tip Most scanning-* functions are Node.js, not Python
Despite the consistent naming, file-scanning functions are written in Node.js (index.js) rather than Python. Check the directory contents before reaching for pip.
:::

### Email — SendGrid integration (`sendgrid-*`)

| Function | Purpose |
|---|---|
| `sendgrid-brand-invites` | Send branded invite emails to new workspace members |

### Maintenance — one-off utility functions

| Function | Purpose |
|---|---|
| `fix-missing-document-id` | Backfill missing document_id references |
| `move-answer-story` | Migration helper for answer-story records |
| `flet-chatbot-example` | Demo / reference function (not active in production) |

---

## How each function gets triggered

Cloud Functions in this repo are typically triggered by **Pub/Sub topics** (the most common pattern), but a few are HTTP-triggered or storage-triggered.

| Trigger type | Examples | When |
|---|---|---|
| **Pub/Sub** | Most `sensemake-*`, `vurvey-*` | The default — `vurvey-api` publishes an event, the subscribed function fires |
| **HTTP** | `vurvey-copilot` (chat backend) | Called directly by the API or frontend |
| **Storage** | `scanning-*` | Triggered when a file is uploaded to a watched GCS bucket |
| **Cloud Scheduler** | `datawarehouse-*` (some) | Cron-style nightly batches |

The trigger is configured in each function's deploy workflow (`.github/workflows/deploy-<name>.yml`).

---

## Pub/Sub topic conventions

| Topic | Producer | Consumers |
|---|---|---|
| `sensemake-process-document-dev` | vurvey-api on file upload | `sensemake-process-document` |
| `sensemake-create-question-insights-dev` | vurvey-api after question completes | `sensemake-create-question-insights*` |
| `vurvey-events` | vurvey-api event bus | Multiple — fan-out via subscriptions |
| `vurvey-chat-message` | vurvey-api on chat message send | `vurvey-copilot` |
| `vurvey-importer` | vurvey-api on import operation start | Importer-flavored sensemake functions |

The `-dev` suffix indicates the development environment; production has `-prod` equivalents.

Event schemas live in `vurvey-api/src/common/event-bus/` — when you're building a new function, that's the canonical source for what fields to expect in the payload.

---

## Deploy workflow

Each function has its own GitHub Actions workflow. The pattern (from `deploy-scanning-sort-clean-output.yml`):

```bash
gcloud functions deploy <function-name> \
  --runtime=<nodejs20|python310|python311> \
  --trigger-event=<event> \
  --trigger-resource=<resource> \
  --trigger-location=us \
  --trigger-service-account=<sa>
```

**There is no "deploy all" workflow.** Changes are scoped to one function at a time. This is intentional — it prevents an accidental change in one helper from breaking 35 other functions.

### Runtime drift

Some functions still pin `python310` while local dev uses `3.11+`. **Match the workflow's runtime, not your local pyenv.** A function that works locally on Python 3.11 may fail on deploy if the workflow targets 3.10.

---

## Local development

Each function has its own dependencies:

```bash
cd vurvey-gcf-scripts/<function-name>/

# Python functions
pip install -r requirements.txt
python -m functions_framework --target=main --signature-type=event

# Node.js functions
npm install
npm start  # or however the function's package.json defines it
```

Installing from the **repo root does nothing** — there's no top-level `requirements.txt` or `package.json` that orchestrates the per-function deps.

For local Pub/Sub testing, use the `gcloud pubsub topics publish` command to send fake messages against your locally-running function (which can subscribe via the Functions Framework's HTTP endpoint).

---

## Telemetry and debugging

Each function logs to **Cloud Logging** under its function name. To investigate "why didn't my campaign get insights?":

1. Identify the responsible function (e.g. `sensemake-create-campaign-insights`).
2. Open Cloud Logging for the `vurvey-development` project.
3. Filter by function name.
4. Look for errors or "no rows found" log lines correlating to your campaign ID.

For end-user-visible "stuck" issues, this is usually the first step before opening an issue.

---

## Constraints & limitations

- **47 independent functions can't share state.** No "global cache" across functions.
- **Cold starts add latency.** Each function has its own boot time — typically 1-3 seconds for Python, faster for Node.
- **Runtime versions drift.** Some on Python 3.10, others 3.11+. Always check the deploy workflow.
- **Per-function `helpers/` directories.** No shared library; fixes need manual propagation.
- **Pub/Sub message ordering isn't guaranteed.** Functions must handle out-of-order events.
- **Pub/Sub delivery is at-least-once, not exactly-once.** Functions must be idempotent.
- **One function = one trigger.** A function can't subscribe to multiple Pub/Sub topics from a single deploy.
- **No multi-region deployment.** All functions deploy to `us-central1` (with trigger location `us`).
- **Secrets via Secret Manager.** Each function fetches its API keys via `google.cloud.secretmanager`, not env vars.
- **Function timeout caps.** Cloud Functions max out at 9 minutes (1st gen) or 60 minutes (2nd gen) per invocation. Heavy workloads need batching.
- **Concurrency is per-instance.** Each function instance handles one request at a time (for the gen used here).
- **Manual cleanup of failed functions.** No auto-retry across function boundaries — vurvey-api or scheduled retry handlers must re-trigger if a Pub/Sub message fails after exhausting retries.

---

## Best practices (for engineers extending this layer)

- **One concern per function.** Don't bundle "compute insights AND send email AND update BigQuery" into one — split.
- **Be idempotent.** Pub/Sub may deliver the same message twice. Check before writing.
- **Log structured.** Use `logger.info({...})` with named fields, not free-text — Cloud Logging searches better with structure.
- **Don't import from sibling functions.** Each function is its own deploy unit; cross-imports break encapsulation.
- **Match deploy-workflow runtime locally.** If the workflow says `python310`, run `python3.10` locally too.
- **Use Secret Manager, never .env files.** Secrets need to roll without redeploys.
- **Test with real Pub/Sub messages** during dev — locally simulate the full envelope, not just the inner payload.
- **Add deploy-workflow PR template comments.** When introducing a new function, document the trigger + topic + retry semantics inline.
- **Don't refactor a "shared helper" expecting cascading effect.** It's per-function; you must touch each copy.
- **Watch for region drift.** All functions deploy to one region today; multi-region is non-trivial.

---

## FAQ

#### Why so many separate functions instead of one big service?
- **Independent scaling**: a slow-running insight function doesn't slow down email delivery.
- **Independent deploys**: one team can ship a sensemake change without coordinating with the team that owns email.
- **Failure isolation**: a bug in one function can't crash the others.
- **Cost efficiency**: each function only pays for its own runtime.

#### What language are these in?
Mostly Python 3.10/3.11 (especially `sensemake-*`). The `scanning-*` functions are Node.js 20. Other categories are mostly Python; check the directory contents.

#### Where does the data they produce end up?
- **Postgres** (vurvey-api database) — insights, summaries, processed records
- **BigQuery** — data-warehouse analytics
- **Google Cloud Storage** — binary artifacts (transcripts, videos, generated reels)
- **Pub/Sub (fan-out)** — events that trigger further functions

#### How do I know which function processes my data?
Match your action to the trigger:
- Uploading a dataset file → `sensemake-process-document`
- Publishing a campaign → various `sensemake-create-*` functions
- A creator finishes responding → question/creator/campaign insight functions
- Sending a chat message → `vurvey-copilot`

When in doubt, check Cloud Logging for activity around the time of your action.

#### Why is there a Gen 2 of question-insights?
Vurvey iterates these pipelines. Gen 2 is the newer, more accurate version of the insights extraction; the older one is kept running until migration completes.

#### What happens if a function fails?
Pub/Sub retries the message a configurable number of times. After max retries, the message goes to a dead-letter queue. Vurvey staff monitor dead-letter queues and re-trigger manually if needed.

#### Can I monitor these in real time?
For Vurvey staff: yes via Cloud Logging + Cloud Monitoring dashboards. For customers: indirectly — your data appears in the app when the relevant function completes.

#### Why do some functions need a `requirements.txt` that pins ancient versions?
Each function deploys independently; some haven't been touched in months because they're stable. Their pinned versions reflect what was working at last deploy. Don't auto-bump deps unless the function's been tested.

#### Are there serverless equivalents in other clouds?
Vurvey's Cloud Functions are GCP-specific. AWS Lambda + EventBridge would be the equivalent if porting; Azure Functions + Event Grid is the other equivalent. The pattern translates; the code does not.

#### Why is the `flet-chatbot-example` directory there?
A reference implementation / demo. Not active in production. Safe to ignore unless you're learning the function patterns.

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| Campaign published but no insights appear | Cloud Logging for `sensemake-create-campaign-insights` errors |
| Dataset file uploaded but not searchable | Cloud Logging for `sensemake-process-document` and `sensemake-train-data` |
| Video uploaded but no transcript | Cloud Logging for `sensemake-process-transcripts` and `sensemake-create-videoai` |
| Invite email didn't arrive | Cloud Logging for `sendgrid-brand-invites`; SendGrid dashboard for bounces |
| File flagged as malware | Cloud Logging for `scanning-handle-quarantine`; file moved to quarantine bucket |
| BigQuery analytics dashboard stale | Cloud Logging for relevant `datawarehouse-*` function; check Cloud Scheduler |
| Reel never generated | Cloud Logging for `sensemake-creator-reel` |
| Workflow execution stuck | Cloud Logging for `vurvey-workflow`; check Pub/Sub topic for backed-up messages |
| Concept test failed silently | Cloud Logging for `vurvey-concept-testing*` trio |
| Chat doesn't respond | Cloud Logging for `vurvey-copilot`; check for timeout / model errors |
| Salesforce sync stopped | Cloud Logging for `vurvey-salesforce-integration`; check Salesforce credentials in Secret Manager |
| Function deploy fails | Check the per-function workflow's runtime version vs your code's Python imports |
| Local test works, prod fails | Runtime version drift — match the workflow's `--runtime` flag locally |

---

## Cross-references

- [Platform Architecture](/guide/architecture) — high-level architecture of which functions fit where
- [Developer & API Reference](/guide/developer-reference) — the vurvey-api GraphQL layer that triggers these
- [Datasets](/guide/datasets) — what users see when `sensemake-process-document` and `sensemake-train-data` finish
- [Campaigns](/guide/campaigns) — what users see when `sensemake-create-campaign-*` functions finish
- [Topic Graph](/guide/topic-graph) — fed by the sensemake processing pipeline
- [Reels](/guide/reels) — `sensemake-creator-reel` produces these
- [Concept Simulations](/guide/concept-simulations) — `vurvey-concept-testing*` powers these
- [Integrations → Salesforce](/guide/integrations) — `vurvey-salesforce-*` integrations
- [Conversations](/guide/conversations) — chat backend is `vurvey-copilot`
- [Workflows](/guide/workflows) — `vurvey-workflow` executes these
- [Branding](/guide/branding) — `vurvey-brand-setup` processes branding configs
- [Glossary](/guide/glossary) — Pub/Sub, Cloud Function, BigQuery, GCS terminology
