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
| `npm run docs:build` | Build static site (runs `test:docs` first) |
| `npm run docs:preview` | Preview production build locally |
| `npm test` | Run all unit tests (Node.js native test runner) |
| `node --test test/docs-lint-integration.test.js` | Run a single test file |
| `npm run lint:docs` | Validate broken links and missing screenshots |
| `npm run test:docs` | Alias for `lint:docs` |
| `npm run update:screenshots` | Capture screenshots from staging (requires `VURVEY_EMAIL`, `VURVEY_PASSWORD`) |
| `npm run test:qa` | Run Puppeteer QA suite headless (requires credentials) |
| `npm run test:qa:headed` | Run QA suite with visible browser |
| `npm run sync:nightly` | Full cycle: screenshots + QA |
| `npm run update:all` | Screenshots + build |

## Architecture

### Content

Documentation lives in `docs/guide/*.md` (12 pages). The sidebar and navigation are configured in `docs/.vitepress/config.js`. Screenshots are stored in `docs/public/screenshots/{section}/*.png` and are auto-captured from staging.

To add a new page: create `docs/guide/<name>.md`, then add it to the sidebar in `docs/.vitepress/config.js`.

### Automation Scripts (`scripts/`)

| Script | Purpose |
|--------|---------|
| `capture-screenshots.js` | Puppeteer: login to staging, navigate sections, capture PNGs |
| `qa-test-suite.js` | Puppeteer: smoke + deep QA tests against staging UI |
| `docs-lint.js` | Fast linter: validates internal links and screenshot references |
| `claude-doc-updater-prompt.md` | System prompt for nightly Claude Code analysis |

Shared logic lives in `scripts/lib/`:
- `docs-lint-core.js` - Link resolution and validation
- `vurvey-url.js` - Workspace URL building and ID extraction
- `qa-utils.js` - Test utilities and reproduction steps builder
- `qa-discovery.js` - Route discovery from vurvey-web-manager source

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
| `QA_DEEP` | No | `false` | Enable deep route testing |
| `QA_ROUTE_RETRIES` | No | `3` | Retry count for transient errors |

## Key Conventions

- **Optional screenshots**: Use `?optional=1` query param on image references to skip missing screenshot lint errors (e.g., `![alt](/vurvey-docs/screenshots/section/name.png?optional=1)`)
- **Screenshot paths**: Always under `docs/public/screenshots/{section}/{number}-{name}.png`
- **VitePress base**: All absolute asset paths must include `/vurvey-docs/` prefix
- **Nightly PRs require human review** before merge
- **Bug reports**: Written as JSON to `bug-reports/` directory, dispatched to `vurvey-web-manager` or `vurvey-api` repos

## Vurvey Terminology (UI to API mapping)

When comparing docs against source code:

| Documentation Term | API/Code Term |
|-------------------|---------------|
| Agent | `AiPersona` |
| Workflow | `AiOrchestration` |
| Campaign | `Survey` |
| Dataset | `TrainingSet` |
| People/Audience | `Community`/`Population` |
