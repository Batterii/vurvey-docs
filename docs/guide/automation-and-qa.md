---
title: Automation & QA
---

# Automation & QA

This docs site is designed to stay aligned with the live app by running a nightly workflow that:

- Captures fresh screenshots from staging
- Runs an automated QA smoke/regression suite against staging
- Proposes documentation fixes based on the current codebases

This page is the “operator manual” for the docs generation system: what runs in CI, how to run it locally, and how to extend it safely.

## Nightly Workflows

### Nightly docs sync (PR-based)

GitHub Actions: `.github/workflows/nightly-docs-sync.yml`

What it does:

- Checks out this repo plus `batterii/vurvey-web-manager` and `batterii/vurvey-api`
- Captures screenshots into `docs/public/screenshots/`
- Runs QA (`npm run test:qa`) and uploads artifacts
- Runs docs lint (`npm run test:docs`) to catch broken links and missing screenshots
- Runs the docs updater prompt and opens a PR

### Screenshot update + Pages deploy (main branch)

GitHub Actions: `.github/workflows/update-docs.yml`

What it does:

- Captures screenshots and commits them to `main` (on schedule / manual)
- Lints docs (`npm run test:docs`)
- Builds and deploys GitHub Pages

## What “Docs Generation” Includes

In this repo, “docs generation” is made up of four parts:

1. **Screenshot capture**: `npm run update:screenshots` writes to `docs/public/screenshots/**`.
2. **Docs lint**: `npm run test:docs` fails on broken internal doc links and missing screenshot assets referenced from markdown.
3. **QA suite**: `npm run test:qa` runs a staging smoke suite and produces actionable artifacts.
4. **Doc updater**: a prompt-driven updater that proposes doc edits via PRs (see `scripts/claude-doc-updater-prompt.md`).

The goal is: keep the docs accurate without turning the nightly runs into flaky blockers.

## Running Locally

### Prereqs

- Node (recommended: Node 22, matches `nightly-docs-sync.yml`)
- Credentials for a staging account

Required env vars:

- `VURVEY_EMAIL`
- `VURVEY_PASSWORD`

Optional:

- `VURVEY_URL` (defaults to `https://staging.vurvey.dev`)
- `VURVEY_WORKSPACE_ID` (fallback if workspace id cannot be extracted after login)
- `HEADLESS=false` (run with a visible browser)
- `CAPTURE_STRICT=true` (make screenshot capture fail the run if login/workspace resolution fails)
- `QA_ROUTE_RETRIES` (default: `3`) retries page navigation on transient "Failed to fetch" errors
- `QA_TIMEOUT_MS` (default: `30000`) navigation timeout for QA suite `page.goto(...)`
- `QA_WRITE_ROOT_REPORT=true` (optional) also writes `qa-report.json` at repo root for CI artifact convenience

### QA CLI Flags

The QA suite also supports CLI flags:

- `--quick` reduces slow-mo and tries to keep the run shorter
- `--viewport=desktop|mobile` selects a viewport preset (default is desktop)
- `--strict` makes certain runtime issues (like 5xx responses and page errors) fail the run

Examples:

```bash
# Headed run to debug selectors/flows visually
HEADLESS=false npm run test:qa

# Faster run locally
npm run test:qa -- --quick

# Mobile viewport regression smoke
npm run test:qa -- --viewport=mobile

# Strict mode (more likely to fail on staging instability)
npm run test:qa -- --strict
```

### Commands

```bash
npm ci

# QA (creates qa-report.json + artifacts)
npm run test:qa

# Docs lint (broken internal links + missing /screenshots assets)
npm run test:docs

# Screenshots only
npm run update:screenshots
```

## Outputs & Artifacts

Screenshot capture writes only the intended doc screenshots under `docs/public/screenshots/**`.
Any retry/error screenshots are written to `qa-output/capture-screenshots/` (ignored by git).

When QA runs, it produces:

- `qa-output/qa-report.json` (machine-readable summary)
- `qa-output/qa-report.md` (human-readable summary)
- `qa-output/qa-failure-report.md` (human-readable failures, when relevant)
- `qa-failure-screenshots/` (screenshots captured on failures)
- `qa-output/` (additional screenshots/artifacts for debugging)

Docs lint fails the run if:

- A markdown link to `/screenshots/...` points at a missing file under `docs/public/screenshots/`
- An internal docs link (like `/guide/home`) points at a missing `.md` file

### Optional Screenshots in Markdown

If you want to reference a screenshot that may not exist yet (or may be flaky to capture), you can mark it optional:

- Append `?optional=1` to the image URL: `(/screenshots/...png?optional=1)`
- The docs lint will skip missing optional screenshots

This is useful when you’re adding a new doc section ahead of wiring a capture step in `scripts/capture-screenshots.js`.

## Extending Coverage (More Features / Use Cases)

If your goal is “the docs should cover more of the app”, treat it as two parallel changes:

1. **Docs coverage**: add or expand a guide page under `docs/guide/` with:
   - A practical “how to use it” flow
   - The key options/configuration fields users actually choose
   - 2-3 real-world use cases and troubleshooting notes
2. **Screenshot coverage**: add capture steps in `scripts/capture-screenshots.js` for the UI states that make those new doc sections clear.

### Adding a New Screenshot

1. Add a capture step under the appropriate section in `scripts/capture-screenshots.js`.
2. Write to `docs/public/screenshots/<section>/...png`.
3. Reference it from markdown as `/screenshots/<section>/...png`.
4. Run `npm run update:screenshots` locally when possible.
5. Run `npm run test:docs` to ensure links and screenshot paths are valid.

## Common Failure Modes

### Login Flow Changes

If staging changes its login UI, the capture/QA scripts may fail to find the email/password fields or submit buttons.

Where to fix:

- Screenshot capture: `scripts/capture-screenshots.js` (see `login()` and helpers)
- QA suite: `scripts/qa-test-suite.js` (see `login()` and element detection helpers)

### Workspace ID Resolution Fails

Many routes are workspace-scoped (`/{workspaceId}/...`). Both scripts try to infer the workspace ID after login.

Quick workaround:

- Set `VURVEY_WORKSPACE_ID` to a known workspace UUID for CI runs.

### “Failed to fetch” / transient errors

The QA suite includes retries and runtime logging, but staging can still be noisy.

Pragmatic workflow:

- Use non-strict mode in scheduled runs (default).
- Use `--strict` when you’re actively trying to detect regressions.
