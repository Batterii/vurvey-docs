# Canvas & Image Studio Documentation Overhaul Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Significantly expand, correct, and enrich the Canvas and Image Studio user guides, detailing all interactive modals, controls, toolbars, and features including Google Veo 3.1 Convert to Video.

**Architecture:** We will replace the brief `docs/guide/canvas-and-image-studio.md` with an exhaustive, highly detailed guide structured with sections on the Toolbar, Image Studio Canvas, Video Conversion Panel, Backend Flows, Feature Flags, and FAQs.

**Tech Stack:** VitePress Markdown, HTML5/CSS3.

---

### Task 1: Overhaul Canvas & Image Studio Guide

**Files:**
- Modify: `docs/guide/canvas-and-image-studio.md`

**Step 1: Write expanded markdown file**
Write the comprehensive content to `docs/guide/canvas-and-image-studio.md` covering all sections.

**Step 2: Run linter to verify links**
Run: `npm run lint:docs`
Expected: PASS with "docs-lint: OK" (or OK with warnings).

**Step 3: Run static site build**
Run: `npm run docs:build`
Expected: PASS with "build complete".

**Step 4: Commit and push**
Commit the changes and push to remote.
