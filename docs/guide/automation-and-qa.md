---
title: About This Documentation
---

# About This Documentation

This documentation site is **self-maintaining**. Most of what you're reading was last touched by a Claude-driven nightly job that pulls fresh screenshots from staging, runs a QA test suite against the live product, classifies any failures, edits the markdown to keep up, opens a PR for a human reviewer, and dispatches any product bugs it found to the right sibling repository.

We rebuild docs/code parity automatically because the product moves faster than humans can manually re-document it. Most users land on this page when they spot something that looks stale, so this guide also tells you exactly **how to flag a fix**.

---

## What this site is built on

- **VitePress 1.5** with Vue 3 — single-page static-site generator that builds to `/docs/.vitepress/dist/`
- **Node 20+** for the build, lint, and capture tooling
- **GitHub Pages** for hosting, deployed automatically on every push to `main`
- **Husky** pre-commit hooks that block broken-link commits via `npm run lint:docs`
- **Puppeteer + Playwright** for the QA suite and screenshot capture
- **Claude Code (this very tool)** for the nightly editorial pass

Site URL: <https://batterii.github.io/vurvey-docs/>. Base path: `/vurvey-docs/`.

---

## The nightly cycle

Every night a fixed sequence runs against the staging environment to keep this site current:

```
2 AM UTC ─┐
          ▼
┌─────────────────────────────────────────────┐
│ update-docs.yml                              │
│ - Capture screenshots from staging           │
│ - Run QA suite                               │
│ - Build site                                 │
│ - Deploy to GitHub Pages                     │
└─────────────────────────────────────────────┘

3 AM UTC ─┐
          ▼
┌─────────────────────────────────────────────┐
│ nightly-docs-sync.yml                        │
│ - Check out vurvey-web-manager + vurvey-api  │
│ - Capture fresh screenshots                  │
│ - Run deep QA                                │
│ - Lint docs (broken links, missing imgs)     │
│ - Run Claude doc analysis:                   │
│     • Edit docs that need updating           │
│     • Write bug-reports/{ts}.json for code   │
│       bugs found                             │
│ - Open a PR if changes detected              │
│ - Dispatch bug reports to sibling repos via  │
│   repository-dispatch events                 │
└─────────────────────────────────────────────┘
```

The split exists because `update-docs.yml` is the fast, deterministic refresh, and `nightly-docs-sync.yml` is the deep, Claude-assisted rewrite-and-bug-report pass that usually opens a PR humans then review.

---

## QA failure classification

When the QA suite finds something that doesn't match docs, it doesn't blindly blame the docs. The failure classifier (`scripts/qa-failure-analyzer.js`) sorts each issue into one of three buckets:

| Classification | What it means | What the system does |
|---|---|---|
| **DOC_ISSUE** | The documentation is wrong; the code is correct | Edits markdown directly in the nightly PR |
| **CODE_BUG** | The documentation is correct; the code regressed | Writes a `bug-reports/{timestamp}.json` payload and dispatches it to the right sibling repo (`vurvey-web-manager`, `vurvey-api`, etc.) via `repository-dispatch` |
| **TEST_ISSUE** | The test itself is wrong (selector drift, race condition, etc.) | Flags for human review; no automated change |

The classification is a Claude prompt fed by the QA failure context — see `scripts/qa-failure-analyzer.js` and `scripts/qa-remediation-prompt.md` for the exact decision-tree we encode.

---

## Local pipeline (for contributors)

If you want to run the same pipeline locally (without waiting for the nightly cron), the `scripts/run-local-pipeline.sh` script mirrors what CI does:

| Command | What it runs |
|---|---|
| `npm run pipeline` | Full pipeline: screenshots + QA + analysis + build |
| `npm run pipeline:quick` | Skips screenshots and uses the fast QA subset |
| `npm run pipeline:analyze-only` | Just runs Claude analysis against the current state |
| `npm run update:screenshots` | Captures screenshots only (requires `VURVEY_EMAIL` / `VURVEY_PASSWORD`) |
| `npm run test:qa` | QA suite, headless |
| `npm run test:qa:headed` | QA suite with visible browser (useful for debugging) |
| `npm run test:qa:mobile` | Mobile-viewport QA pass |
| `npm run test:qa:analyze` | Classifies QA failures |
| `npm run lint:docs` | Fast link + screenshot-reference validation (also runs on pre-commit) |
| `npm run audit:screenshots` | Finds orphan and missing screenshot references |
| `npm run docs:dev` | Local VitePress dev server at `http://localhost:5173/vurvey-docs/` |
| `npm run docs:build` | Production build → `docs/.vitepress/dist/` |
| `npm run docs:preview` | Preview the production build locally |
| `npm run test:pw` | Playwright tests against the docs site |

Pre-commit hook: `npm run lint:docs` runs automatically on every commit and **blocks** the commit if broken internal links or missing screenshot references are detected.

---

## Conventions

### Screenshot paths

Always use `/screenshots/...`, **never** `/vurvey-docs/screenshots/...`. VitePress auto-prepends the base path at build time; using the doubled prefix breaks the Rollup/Vite build.

- ✅ Correct (relative to base): `/screenshots/{section}/{filename}.png`
- ❌ Wrong (doubled prefix): `/vurvey-docs/screenshots/{section}/{filename}.png`

### Optional screenshots

When a doc references a screenshot that hasn't been captured yet (common during a code-grounded rewrite), append `?optional=1` to the path:

```markdown
> 📷 _Screenshot pending: Coming soon_
```

This tells the docs-lint script to skip the "missing screenshot" error. The image will fill in automatically once the screenshot pipeline captures it. As of the most recent doc rewrites (May 2026), most screenshot references are `?optional=1` while the screenshot capture script catches up to the new doc structure.

### Bug reports

When the nightly pipeline classifies a QA failure as `CODE_BUG`, it writes a JSON payload to `bug-reports/{timestamp}.json` with:

- The failing test name and assertion
- The repo the bug should be filed against (`vurvey-web-manager`, `vurvey-api`, etc.)
- The Claude-classified summary of what's broken
- Reproduction context (URL, viewport, user-flow steps)

Those JSONs are then dispatched to the right sibling repository via GitHub's `repository-dispatch` event so an issue gets opened automatically against the right team.

---

## How to flag a fix

Found something that doesn't match the live app?

1. **Open a GitHub issue** at <https://github.com/Batterii/vurvey-docs/issues>
2. **Include**: the page URL, what you saw vs what the docs say, a screenshot if possible
3. **Tag**: `documentation` for content fixes, `bug` for product issues that should be re-routed

If you can, **submit a PR** directly. Edit links appear at the bottom of every page (the **Edit this page on GitHub** link) and prefill the right file.

If you're a Vurvey staff member with access to the docs repo:

- Tiny fixes: edit `docs/guide/*.md` directly and merge
- Larger restructures: open a PR and tag the docs team
- New screenshots: add the path to your markdown with `?optional=1`, then let the nightly capture script fill it in

---

## What the site does NOT do (yet)

- **Multi-language support** — English-only today. The Topic Graph extractor handles multilingual responses, but the docs themselves are English.
- **API reference auto-generation** — The Vurvey GraphQL schema is documented manually inside relevant feature guides; no auto-generated reference exists in this site.
- **In-app help overlays** — Docs live at this static site only; there's no contextual `?` help inside the Vurvey Manager app pointing here.
- **Versioned docs** — The site reflects current `main` branch of `vurvey-web-manager`. No historical "v1 / v2" snapshots are kept.
- **Mobile-optimized layout** — VitePress's responsive layout works on mobile but the experience is desktop-first.

---

## Recent doc-engineering history

For context on how thorough the docs are right now:

- A multi-iteration doc-improvement run in **May 2026** rewrote or surgically enhanced **every doc** on the site, grounding each claim in the actual source code across `vurvey-web-manager`, `vurvey-web-responder`, `vurvey-gcf-scripts`, and `vurvey-api`. The rewrites added ~5,800 net new lines of source-validated content and established the cross-reference structure where every feature doc links outward to ~12 specific related surfaces.
- Recent doc additions include comprehensive coverage of the **Topic Graph Explorer chat tool**, the **Material 3 Theme Creator** in Branding, the **Composio + Workspace Enterprise integration models**, the **`sensemake-creator-reel` auto-reel pipeline**, the **dual citations pipeline** (chat grounding + structured-output Evidence badges), and the **`safeHttpUrl` LLM-URL safety allowlist**.

---

## Browse the guides

Use the sidebar to explore detailed guides for each section of the platform. Highlights:

### Getting Started
- [Introduction](/guide/) — overview + role-based entry points
- [Logging In](/guide/login) — Manager + Responder login flows (different provider sets!)
- [Account & Profile](/guide/account) — per-user identity, Composio integrations, dark mode

### Features
- [Home](/guide/home) — AI chat workspace
- [Agents](/guide/agents) — Creating AI personas + binding capabilities like `exploreTopicGraph`
- [People](/guide/people) — Audiences, segments, simulations
- [Campaigns](/guide/campaigns) — Research surveys including the Insights / Topic Graph tab
- [Topic Graph (Insights)](/guide/topic-graph) — Live entity-and-theme network per campaign
- [Datasets](/guide/datasets) — File knowledge bases for AI grounding
- [Workflow (Beta)](/guide/workflows) — Multi-step automation pipelines
- [Capabilities](/guide/capabilities) — Reusable AI systems packaged as blueprints

### Platform
- [Settings](/guide/settings) — Workspace-level configuration, all 5 tabs
- [Canvas & Image Studio](/guide/canvas-and-image-studio) — Chat + Google Veo 3.1 video gen
- [Branding](/guide/branding) — Brand identity + Material 3 themes
- [Brand Companions](/guide/brand-companions) — Public Agents with Public-type API apps
- [Forecast](/guide/forecast) — UI prototype on demo data (read this carefully before demoing!)
- [Rewards](/guide/rewards) — Tremendous-backed payouts
- [Integrations](/guide/integrations) — Composio + Workspace Enterprise
- [Mentions](/guide/mentions) — Three concepts: workspace area, `@mention`, Synthesio
- [Reels](/guide/reels) — Highlight video editor + Magic auto-reel pipeline
- [Implementation](/guide/implementation) — Taxonomy, prompts, YAML imports, Molds (staff)
- [Admin (Enterprise)](/guide/admin) — Cross-workspace administration (staff)

### Reference
- [Quick Reference](/guide/quick-reference) — Comprehensive cheat sheet
- [Sources & Citations](/guide/sources-and-citations) — Dual attribution pipelines
- [Permissions & Sharing](/guide/permissions-and-sharing) — Two-layer auth (UserRole + OpenFGA)
- [About This Documentation](/guide/automation-and-qa) — You are here
