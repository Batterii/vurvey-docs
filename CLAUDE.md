# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**vurvey-docs** is a self-maintaining VitePress documentation site for the Vurvey platform. It features automated screenshot capture from staging via Puppeteer, nightly QA testing, and Claude Code-driven documentation analysis that creates PRs and dispatches bug reports to sibling repos.

- **Framework**: VitePress 1.5.0 (ES modules, `"type": "module"`)
- **Live site**: https://batterii.github.io/vurvey-docs/
- **Base path**: `/vurvey-docs/` (GitHub Pages)
- **Node**: 20+

## Commands

| Command | Purpose |
|---------|---------|
| `npm run docs:dev` | Start dev server at http://localhost:5173/vurvey-docs/ |
| `npm run docs:build` | Build static site |
| `npm run docs:preview` | Preview production build locally |
| `npm test` | Run all unit tests (Node.js native test runner) |
| `node --test test/docs-lint-integration.test.js` | Run a single test file |
| `npm run lint:docs` | Validate broken links and missing screenshots |
| `npm run test:docs` | Alias for `lint:docs` |
| `npm run update:screenshots` | Capture screenshots from staging (requires `VURVEY_EMAIL`, `VURVEY_PASSWORD`) |
| `npm run test:qa` | Run Puppeteer QA suite headless (requires credentials) |
| `npm run test:qa:headed` | Run QA suite with visible browser |
| `npm run test:qa:analyze` | Classify QA failures (DOC_ISSUE / CODE_BUG / TEST_ISSUE) |
| `npm run pipeline` | Full local pipeline (screenshots + QA + analysis + build) |
| `npm run pipeline:quick` | Pipeline skipping screenshots, quick QA |
| `npm run sync:nightly` | Full cycle: screenshots + QA |
| `npm run update:all` | Screenshots + build |

## Architecture

### Content

Documentation lives in `docs/guide/*.md` (~20 pages). The sidebar and navigation are configured in `docs/.vitepress/config.js`. Screenshots are stored in `docs/public/screenshots/{section}/*.png` and are auto-captured from staging.

To add a new page: create `docs/guide/<name>.md`, then add it to the sidebar in `docs/.vitepress/config.js`.

### Automation Scripts (`scripts/`)

| Script | Purpose |
|--------|---------|
| `capture-screenshots.js` | Puppeteer: login to staging, navigate sections, capture PNGs |
| `qa-test-suite.js` | Puppeteer: smoke + deep QA tests against staging UI |
| `qa-failure-analyzer.js` | Classify failures as DOC_ISSUE / CODE_BUG / TEST_ISSUE |
| `docs-lint.js` | Fast linter: validates internal links and screenshot references |
| `run-local-pipeline.sh` | Full pipeline orchestration (mirrors CI locally) |
| `claude-doc-updater-prompt.md` | System prompt for nightly Claude Code analysis |
| `qa-remediation-prompt.md` | System prompt for QA failure remediation |

Shared logic lives in `scripts/lib/`:
- `docs-lint-core.js` - Link resolution and validation engine
- `vurvey-url.js` - Workspace URL building and ID extraction
- `qa-utils.js` - CLI arg parsing, safe naming, reproduction steps builder
- `qa-discovery.js` - Route discovery from vurvey-web-manager source
- `qa-browser-helpers.js` - Login, wait helpers, error detection

### Tests (`test/`)

Uses **Node.js native test runner** (`node --test`). Tests cover link validation, path resolution, markdown link extraction, URL utilities, and QA helpers.

### CI/CD (`.github/workflows/`)

**update-docs.yml** (2 AM UTC): Capture screenshots, run QA, build, deploy to GitHub Pages.

**nightly-docs-sync.yml** (3 AM UTC): Full sync that checks out `vurvey-web-manager` and `vurvey-api`, captures screenshots, runs deep QA, lints docs, runs Claude Code analysis (edits docs, creates bug reports), opens a PR if changes detected, and dispatches bug reports to sibling repos via `repository-dispatch`.

### Environment Variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `VURVEY_EMAIL` | For screenshots/QA | - | Staging login email |
| `VURVEY_PASSWORD` | For screenshots/QA | - | Staging login password |
| `VURVEY_URL` | No | `https://staging.vurvey.dev` | Target environment |
| `VURVEY_WORKSPACE_ID` | No | `07e5edb5-e739-4a35-9f82-cc6cec7c0193` (DEMO) | Workspace ID for screenshot capture |
| `HEADLESS` | No | `true` | Browser visibility |
| `CAPTURE_STRICT` | No | `false` | Fail on login/workspace errors |
| `CAPTURE_PARALLEL` | No | `4` | Parallel capture workers (1 = sequential) |
| `CAPTURE_ONLY` | No | - | Comma-separated sections to capture (e.g., `agents,people`) |
| `QA_DEEP` | No | `false` | Enable deep route testing |
| `QA_ROUTE_RETRIES` | No | `3` | Retry count for transient errors |

## Key Conventions

### Screenshot Paths (Critical)

Use `/screenshots/...` in markdown, **NOT** `/vurvey-docs/screenshots/...`. VitePress auto-prepends the base path (`/vurvey-docs/`) during build. Using the full prefix causes Rollup/Vite build failures due to double-prefixing.

```markdown
<!-- CORRECT -->
![Agent list](/screenshots/agents/1-agents-list.png)

<!-- WRONG - will break the build -->
![Agent list](/vurvey-docs/screenshots/agents/1-agents-list.png)
```

The docs-lint script (`scripts/lib/docs-lint-core.js`) normalizes both formats when validating, but the build will fail on the doubled prefix.

### Optional Screenshots

Use `?optional=1` query param on image references to skip missing screenshot lint errors:
```markdown
![Not yet captured](/screenshots/section/future-feature.png?optional=1)
```

### Other Conventions

- **Screenshot file naming**: `docs/public/screenshots/{section}/{number}-{name}.png`
- **Nightly PRs require human review** before merge
- **Bug reports**: Written as JSON to `bug-reports/` directory, dispatched to `vurvey-web-manager` or `vurvey-api` repos
- **Pre-commit hook**: Husky runs `npm run lint:docs` on every commit — broken links block commits

### QA Failure Classification

The failure analyzer (`scripts/qa-failure-analyzer.js`) classifies failures into:
- **DOC_ISSUE**: Documentation is wrong, code is correct → edits markdown directly
- **CODE_BUG**: Documentation is correct, code is wrong → creates `bug-reports/{timestamp}.json`
- **TEST_ISSUE**: Test infrastructure problem → flags for review

### Local Pipeline

The local pipeline (`scripts/run-local-pipeline.sh`) mirrors CI and supports flags:
```bash
./scripts/run-local-pipeline.sh                    # Full pipeline
./scripts/run-local-pipeline.sh --skip-screenshots # Skip capture
./scripts/run-local-pipeline.sh --skip-qa          # Skip QA
./scripts/run-local-pipeline.sh --skip-remediate   # Skip Claude step
./scripts/run-local-pipeline.sh --headed           # Watch browser
./scripts/run-local-pipeline.sh --quick            # Quick QA only
./scripts/run-local-pipeline.sh --dry-run          # Show what would run
```

It auto-detects sibling repos (`../vurvey-web-manager`, `../vurvey-api`), stashes their changes, switches to `staging` branch for analysis, and restores original state after.

## Vurvey Terminology (UI to API mapping)

When comparing docs against source code:

| Documentation Term | API/Code Term |
|-------------------|---------------|
| Agent | `AiPersona` |
| Workflow | `AiOrchestration` |
| Campaign | `Survey` |
| Dataset | `TrainingSet` |
| People/Audience | `Community`/`Population` |
