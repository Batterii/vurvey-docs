import { test, expect, Page, Locator } from '@playwright/test';
import { gotoSection, waitForLoaders } from './helpers/workspace';
import { loginViaUI } from './helpers/login';
import {
  waitForModal,
  dismissModal,
  waitForAnySelector,
} from './helpers/ui';

// ---------------------------------------------------------------------------
// campaigns.md documentation claim tests
//
// All tests require a real UI login because the Vurvey SPA clears
// localStorage tokens restored by storageState on boot.
// ---------------------------------------------------------------------------
test.describe('campaigns.md: Documentation claim tests', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
    await waitForLoaders(page);
    // Navigate to the Campaigns page (may resolve as /campaigns or /surveys)
    await gotoSection(page, '/campaigns');
    await page.waitForTimeout(2_000);

    // Verify we landed on a campaigns-like route
    const url = page.url();
    if (!url.match(/\/(campaigns|surveys)\b/)) {
      // Fallback: try /surveys
      await gotoSection(page, '/surveys');
      await page.waitForTimeout(2_000);
    }
  });

  // =========================================================================
  // Helper: locate any campaign card on the page
  // =========================================================================
  async function getCampaignCards(page: Page): Promise<Locator> {
    // Campaign cards may use various class patterns
    const cards = page.locator(
      '[class*="card" i][class*="campaign" i], ' +
      '[class*="card" i][class*="survey" i], ' +
      '[class*="surveyCard" i], ' +
      '[class*="campaignCard" i], ' +
      '[data-testid*="campaign-card"], ' +
      '[data-testid*="survey-card"]'
    );

    // If specific card selectors don't work, fall back to generic card grid items
    const count = await cards.count().catch(() => 0);
    if (count > 0) return cards;

    // Broader fallback: look for card-like containers in a grid
    return page.locator(
      '[class*="card" i], [class*="gridItem" i], [class*="galleryItem" i]'
    ).filter({
      has: page.locator('[class*="badge" i], [class*="status" i], [class*="chip" i]'),
    });
  }

  /** Open the three-dot overflow menu on the first campaign card */
  async function openFirstCardMenu(page: Page): Promise<boolean> {
    const cards = await getCampaignCards(page);
    const count = await cards.count().catch(() => 0);
    if (count === 0) return false;

    const firstCard = cards.first();
    await firstCard.hover();
    await page.waitForTimeout(500);

    // Look for three-dot / overflow menu button on the card
    const menuBtn = firstCard.locator(
      'button[aria-label*="more" i], ' +
      'button[aria-label*="menu" i], ' +
      '[class*="dots" i], ' +
      '[class*="overflow" i], ' +
      '[class*="menuTrigger" i], ' +
      '[class*="kebab" i], ' +
      '[data-testid*="menu" i], ' +
      'button:has(svg)'
    ).last();

    const isVisible = await menuBtn.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!isVisible) {
      // Fallback: try any button that appeared after hover
      const anyBtn = firstCard.locator('button').last();
      const anyVisible = await anyBtn.isVisible({ timeout: 3_000 }).catch(() => false);
      if (!anyVisible) return false;
      await anyBtn.click();
    } else {
      await menuBtn.click();
    }

    // Wait for the context menu to appear
    const menu = page.locator(
      '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i], [class*="contextMenu" i]'
    ).first();
    return await menu.isVisible({ timeout: 5_000 }).catch(() => false);
  }

  // =========================================================================
  // STATUS BADGES GROUP
  // Doc claims: Draft=Cyan, Open=Lime Green, Closed=Red, Blocked=Teal, Archived=Teal
  // =========================================================================
  test.describe('Status Badges', () => {
    test('campaign cards display status badges', async ({ page }) => {
      // Look for any badge/status element on the page
      const badges = page.locator(
        '[class*="badge" i], [class*="status" i], [class*="chip" i], [class*="tag" i], [class*="label" i]'
      ).filter({
        hasText: /draft|open|closed|blocked|archived/i,
      });

      const count = await badges.count().catch(() => 0);
      expect.soft(count, 'Campaign cards should display status badges (Draft/Open/Closed/Blocked/Archived)').toBeGreaterThan(0);
    });

    test('Draft status badge is visible', async ({ page }) => {
      const draftBadge = page.locator(
        '[class*="badge" i], [class*="status" i], [class*="chip" i], [class*="tag" i], [class*="label" i]'
      ).filter({ hasText: /^draft$/i }).first();

      expect.soft(
        await draftBadge.isVisible({ timeout: 10_000 }).catch(() => false),
        'A "Draft" status badge should be visible on the campaigns page'
      ).toBeTruthy();
    });

    test('Open status badge is visible', async ({ page }) => {
      const openBadge = page.locator(
        '[class*="badge" i], [class*="status" i], [class*="chip" i], [class*="tag" i], [class*="label" i]'
      ).filter({ hasText: /^open$/i }).first();

      expect.soft(
        await openBadge.isVisible({ timeout: 10_000 }).catch(() => false),
        'An "Open" status badge should be visible on the campaigns page'
      ).toBeTruthy();
    });

    test('Closed status badge is visible', async ({ page }) => {
      const closedBadge = page.locator(
        '[class*="badge" i], [class*="status" i], [class*="chip" i], [class*="tag" i], [class*="label" i]'
      ).filter({ hasText: /^closed$/i }).first();

      expect.soft(
        await closedBadge.isVisible({ timeout: 10_000 }).catch(() => false),
        'A "Closed" status badge should be visible on the campaigns page'
      ).toBeTruthy();
    });

    test('Blocked status badge is visible (if any blocked campaigns exist)', async ({ page }) => {
      const blockedBadge = page.locator(
        '[class*="badge" i], [class*="status" i], [class*="chip" i], [class*="tag" i], [class*="label" i]'
      ).filter({ hasText: /^blocked$/i }).first();

      // Blocked campaigns may not exist in the workspace — soft assert
      expect.soft(
        await blockedBadge.isVisible({ timeout: 8_000 }).catch(() => false),
        'A "Blocked" status badge should be visible if blocked campaigns exist'
      ).toBeTruthy();
    });

    test('Archived status badge is visible (if any archived campaigns exist)', async ({ page }) => {
      // First try filtering by Archived status if filter controls exist
      const archivedFilter = page.locator('button, [role="button"], [role="option"]').filter({
        hasText: /archived/i,
      }).first();
      const filterVisible = await archivedFilter.isVisible({ timeout: 5_000 }).catch(() => false);
      if (filterVisible) {
        await archivedFilter.click();
        await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
        await waitForLoaders(page);
      }

      const archivedBadge = page.locator(
        '[class*="badge" i], [class*="status" i], [class*="chip" i], [class*="tag" i], [class*="label" i]'
      ).filter({ hasText: /^archived$/i }).first();

      expect.soft(
        await archivedBadge.isVisible({ timeout: 8_000 }).catch(() => false),
        'An "Archived" status badge should be visible if archived campaigns exist'
      ).toBeTruthy();
    });
  });

  // =========================================================================
  // CARD METADATA GROUP
  // Doc claims: Questions, Duration, Credits, AI Summary chips on cards
  // =========================================================================
  test.describe('Campaign Card Details', () => {
    test('campaign cards show Questions metadata chip', async ({ page }) => {
      const questionsChip = page.locator(
        '[class*="chip" i], [class*="meta" i], [class*="stat" i], [class*="detail" i], [class*="info" i]'
      ).filter({ hasText: /question/i }).first();

      // Also try looking for a number + "Questions" or "Qs" pattern on cards
      const questionsText = page.getByText(/\d+\s*(questions?|qs)/i).first();

      const visible = await questionsChip.isVisible({ timeout: 10_000 }).catch(() => false)
        || await questionsText.isVisible({ timeout: 5_000 }).catch(() => false);

      expect.soft(visible, 'Campaign cards should display a "Questions" metadata chip').toBeTruthy();
    });

    test('campaign cards show Duration metadata chip', async ({ page }) => {
      const durationChip = page.locator(
        '[class*="chip" i], [class*="meta" i], [class*="stat" i], [class*="detail" i], [class*="info" i]'
      ).filter({ hasText: /duration|min|minute/i }).first();

      const durationText = page.getByText(/\d+\s*(min|minutes?|hrs?|hours?|duration)/i).first();

      const visible = await durationChip.isVisible({ timeout: 10_000 }).catch(() => false)
        || await durationText.isVisible({ timeout: 5_000 }).catch(() => false);

      expect.soft(visible, 'Campaign cards should display a "Duration" metadata chip').toBeTruthy();
    });

    test('campaign cards show Credits metadata chip', async ({ page }) => {
      const creditsChip = page.locator(
        '[class*="chip" i], [class*="meta" i], [class*="stat" i], [class*="detail" i], [class*="info" i]'
      ).filter({ hasText: /credit/i }).first();

      const creditsText = page.getByText(/\d+\s*credits?/i).first();

      const visible = await creditsChip.isVisible({ timeout: 10_000 }).catch(() => false)
        || await creditsText.isVisible({ timeout: 5_000 }).catch(() => false);

      expect.soft(visible, 'Campaign cards should display a "Credits" metadata chip').toBeTruthy();
    });

    test('campaign cards show AI Summary chip', async ({ page }) => {
      const aiSummaryChip = page.locator(
        '[class*="chip" i], [class*="meta" i], [class*="stat" i], [class*="detail" i], [class*="info" i], [class*="badge" i]'
      ).filter({ hasText: /ai\s*summary|summary|ai\s*insights?/i }).first();

      const aiIcon = page.locator(
        '[class*="aiSummary" i], [class*="ai-summary" i], [data-testid*="ai-summary" i], [data-testid*="aiSummary" i]'
      ).first();

      const visible = await aiSummaryChip.isVisible({ timeout: 10_000 }).catch(() => false)
        || await aiIcon.isVisible({ timeout: 5_000 }).catch(() => false);

      expect.soft(visible, 'Campaign cards should display an "AI Summary" chip/indicator').toBeTruthy();
    });
  });

  // =========================================================================
  // CARD MENU GROUP
  // Doc claims: Start Conversation, Share, Preview, Copy, Delete (with confirmation)
  // =========================================================================
  test.describe('Campaign Card Actions', () => {
    test('three-dot menu opens on campaign card', async ({ page }) => {
      const opened = await openFirstCardMenu(page);
      expect.soft(opened, 'Should be able to open three-dot menu on a campaign card').toBeTruthy();

      if (opened) await page.keyboard.press('Escape');
    });

    test('card menu contains "Start Conversation" option', async ({ page }) => {
      const opened = await openFirstCardMenu(page);
      if (!opened) {
        test.skip(true, 'Could not open card menu');
        return;
      }

      const menu = page.locator(
        '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i], [class*="contextMenu" i]'
      ).first();

      expect.soft(
        await menu.getByText(/start conversation/i).first().isVisible({ timeout: 5_000 }).catch(() => false),
        'Card menu should have "Start Conversation" option'
      ).toBeTruthy();

      await page.keyboard.press('Escape');
    });

    test('card menu contains "Share" option', async ({ page }) => {
      const opened = await openFirstCardMenu(page);
      if (!opened) {
        test.skip(true, 'Could not open card menu');
        return;
      }

      const menu = page.locator(
        '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i], [class*="contextMenu" i]'
      ).first();

      expect.soft(
        await menu.getByText(/^share$/i).first().isVisible({ timeout: 5_000 }).catch(() => false),
        'Card menu should have "Share" option'
      ).toBeTruthy();

      await page.keyboard.press('Escape');
    });

    test('card menu contains "Preview" option', async ({ page }) => {
      const opened = await openFirstCardMenu(page);
      if (!opened) {
        test.skip(true, 'Could not open card menu');
        return;
      }

      const menu = page.locator(
        '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i], [class*="contextMenu" i]'
      ).first();

      expect.soft(
        await menu.getByText(/preview/i).first().isVisible({ timeout: 5_000 }).catch(() => false),
        'Card menu should have "Preview" option'
      ).toBeTruthy();

      await page.keyboard.press('Escape');
    });

    test('card menu contains "Copy" option', async ({ page }) => {
      const opened = await openFirstCardMenu(page);
      if (!opened) {
        test.skip(true, 'Could not open card menu');
        return;
      }

      const menu = page.locator(
        '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i], [class*="contextMenu" i]'
      ).first();

      expect.soft(
        await menu.getByText(/^copy$/i).first().isVisible({ timeout: 5_000 }).catch(() => false)
        || await menu.getByText(/duplicate/i).first().isVisible({ timeout: 3_000 }).catch(() => false),
        'Card menu should have "Copy" or "Duplicate" option'
      ).toBeTruthy();

      await page.keyboard.press('Escape');
    });

    test('card menu contains "Delete" option', async ({ page }) => {
      const opened = await openFirstCardMenu(page);
      if (!opened) {
        test.skip(true, 'Could not open card menu');
        return;
      }

      const menu = page.locator(
        '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i], [class*="contextMenu" i]'
      ).first();

      expect.soft(
        await menu.getByText(/delete/i).first().isVisible({ timeout: 5_000 }).catch(() => false),
        'Card menu should have "Delete" option'
      ).toBeTruthy();

      await page.keyboard.press('Escape');
    });

    test('clicking "Delete" opens confirmation dialog', async ({ page }) => {
      const opened = await openFirstCardMenu(page);
      if (!opened) {
        test.skip(true, 'Could not open card menu');
        return;
      }

      const menu = page.locator(
        '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i], [class*="contextMenu" i]'
      ).first();

      const deleteOption = menu.getByText(/delete/i).first();
      const deleteVisible = await deleteOption.isVisible({ timeout: 5_000 }).catch(() => false);
      if (!deleteVisible) {
        test.skip(true, '"Delete" option not found in card menu');
        return;
      }

      await deleteOption.click();

      // A confirmation dialog should appear
      const confirmation = page.locator(
        '[role="dialog"], [role="alertdialog"], [class*="modal" i], [class*="confirm" i]'
      ).first();
      const confirmVisible = await confirmation.isVisible({ timeout: 8_000 }).catch(() => false);

      expect.soft(
        confirmVisible,
        'Clicking "Delete" on a campaign card should open a confirmation dialog'
      ).toBeTruthy();

      // Dismiss without actually deleting
      if (confirmVisible) {
        // Click Cancel or press Escape
        const cancelBtn = confirmation.locator('button').filter({ hasText: /cancel|no|close/i }).first();
        const cancelVisible = await cancelBtn.isVisible({ timeout: 3_000 }).catch(() => false);
        if (cancelVisible) {
          await cancelBtn.click();
        } else {
          await page.keyboard.press('Escape');
        }
      }
    });
  });

  // =========================================================================
  // CREATE MODAL GROUP
  // Doc claims: "Create Campaign" button opens modal with Manual Creation
  //             and AI-Powered Creation options
  // =========================================================================
  test.describe('Create Campaign Modal', () => {
    test('"Create Campaign" button is visible', async ({ page }) => {
      const createBtn = page.locator('button, [role="button"], a').filter({
        hasText: /create campaign/i,
      }).first();

      // Also try a generic "Create" or "+" button in the campaigns section
      const createBtnAlt = page.locator(
        '[data-testid*="create-campaign" i], [data-testid*="create-survey" i]'
      ).first();

      const btn = createBtn.or(createBtnAlt).first();
      await expect(btn).toBeVisible({ timeout: 15_000 });
    });

    test('clicking "Create Campaign" opens creation modal', async ({ page }) => {
      const createBtn = page.locator('button, [role="button"], a').filter({
        hasText: /create campaign/i,
      }).first()
        .or(page.locator('[data-testid*="create-campaign" i], [data-testid*="create-survey" i]').first())
        .first();

      await createBtn.waitFor({ state: 'visible', timeout: 15_000 });
      await createBtn.click();

      // Wait for modal/dialog to appear
      const modal = page.locator(
        '[role="dialog"], [class*="modal" i], [class*="drawer" i]'
      ).first();
      await expect(modal).toBeVisible({ timeout: 10_000 });
    });

    test('create modal shows "Manual Creation" option', async ({ page }) => {
      const createBtn = page.locator('button, [role="button"], a').filter({
        hasText: /create campaign/i,
      }).first()
        .or(page.locator('[data-testid*="create-campaign" i], [data-testid*="create-survey" i]').first())
        .first();

      await createBtn.waitFor({ state: 'visible', timeout: 15_000 });
      await createBtn.click();

      const modal = page.locator(
        '[role="dialog"], [class*="modal" i], [class*="drawer" i]'
      ).first();
      await modal.waitFor({ state: 'visible', timeout: 10_000 });

      // Look for "Manual Creation" or similar text
      const manualOption = modal.getByText(/manual\s*creation|manual|start from scratch|blank/i).first();
      expect.soft(
        await manualOption.isVisible({ timeout: 8_000 }).catch(() => false),
        'Create modal should show a "Manual Creation" option'
      ).toBeTruthy();

      await dismissModal(page);
    });

    test('create modal shows "AI-Powered Creation" option', async ({ page }) => {
      const createBtn = page.locator('button, [role="button"], a').filter({
        hasText: /create campaign/i,
      }).first()
        .or(page.locator('[data-testid*="create-campaign" i], [data-testid*="create-survey" i]').first())
        .first();

      await createBtn.waitFor({ state: 'visible', timeout: 15_000 });
      await createBtn.click();

      const modal = page.locator(
        '[role="dialog"], [class*="modal" i], [class*="drawer" i]'
      ).first();
      await modal.waitFor({ state: 'visible', timeout: 10_000 });

      // Look for "AI-Powered Creation" or similar text
      const aiOption = modal.getByText(/ai.?powered\s*creation|ai.?powered|ai\s*create|smart\s*survey|generate/i).first();
      expect.soft(
        await aiOption.isVisible({ timeout: 8_000 }).catch(() => false),
        'Create modal should show an "AI-Powered Creation" option'
      ).toBeTruthy();

      await dismissModal(page);
    });
  });

  // =========================================================================
  // PUBLISH FLOW GROUP
  // Doc claims: Publish button opens launch modal with Group and Members steps
  // =========================================================================
  test.describe('Publish Flow', () => {
    test('campaign editor has a Publish/Launch button', async ({ page }) => {
      // We need to open a draft campaign to see the Publish button.
      // First, find a Draft campaign card and click it to open the editor.
      const draftBadge = page.locator(
        '[class*="badge" i], [class*="status" i], [class*="chip" i], [class*="tag" i], [class*="label" i]'
      ).filter({ hasText: /^draft$/i }).first();

      const hasDraft = await draftBadge.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!hasDraft) {
        test.skip(true, 'No Draft campaigns available to test Publish flow');
        return;
      }

      // Click the draft campaign card to open it
      const draftCard = draftBadge.locator('xpath=ancestor::*[contains(@class, "card") or contains(@class, "Card") or contains(@class, "grid")]').first();
      // Fallback: click on the parent container that is the card
      const clickTarget = draftCard.or(draftBadge.locator('..')).first();
      await clickTarget.click();
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      await waitForLoaders(page);
      await page.waitForTimeout(2_000);

      // Look for Publish or Launch button in the campaign editor
      const publishBtn = page.locator('button, [role="button"], a').filter({
        hasText: /publish|launch/i,
      }).first();

      expect.soft(
        await publishBtn.isVisible({ timeout: 15_000 }).catch(() => false),
        'Campaign editor should have a "Publish" or "Launch" button'
      ).toBeTruthy();
    });

    test('Publish button opens launch modal with Group and Members steps', async ({ page }) => {
      // Find and open a draft campaign
      const draftBadge = page.locator(
        '[class*="badge" i], [class*="status" i], [class*="chip" i], [class*="tag" i], [class*="label" i]'
      ).filter({ hasText: /^draft$/i }).first();

      const hasDraft = await draftBadge.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!hasDraft) {
        test.skip(true, 'No Draft campaigns available to test Publish flow');
        return;
      }

      const clickTarget = draftBadge.locator('xpath=ancestor::*[contains(@class, "card") or contains(@class, "Card") or contains(@class, "grid")]').first()
        .or(draftBadge.locator('..')).first();
      await clickTarget.click();
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      await waitForLoaders(page);
      await page.waitForTimeout(2_000);

      // Click the Publish/Launch button
      const publishBtn = page.locator('button, [role="button"], a').filter({
        hasText: /publish|launch/i,
      }).first();

      const publishVisible = await publishBtn.isVisible({ timeout: 15_000 }).catch(() => false);
      if (!publishVisible) {
        test.skip(true, 'Publish/Launch button not found in campaign editor');
        return;
      }

      await publishBtn.click();

      // Wait for launch modal
      const modal = page.locator(
        '[role="dialog"], [class*="modal" i], [class*="drawer" i]'
      ).first();
      const modalVisible = await modal.isVisible({ timeout: 10_000 }).catch(() => false);

      expect.soft(
        modalVisible,
        'Clicking Publish should open a launch modal'
      ).toBeTruthy();

      if (modalVisible) {
        // Look for "Group" step indicator
        const groupStep = modal.getByText(/group/i).first()
          .or(page.getByText(/group/i).first())
          .first();
        expect.soft(
          await groupStep.isVisible({ timeout: 5_000 }).catch(() => false),
          'Launch modal should show a "Group" step'
        ).toBeTruthy();

        // Look for "Members" step indicator
        const membersStep = modal.getByText(/members/i).first()
          .or(page.getByText(/members/i).first())
          .first();
        expect.soft(
          await membersStep.isVisible({ timeout: 5_000 }).catch(() => false),
          'Launch modal should show a "Members" step'
        ).toBeTruthy();

        await dismissModal(page);
      }
    });
  });

  // =========================================================================
  // STATUS FILTERS GROUP
  // Doc claims: Filter controls for Open, Draft, Closed, Blocked, Archived
  // =========================================================================
  test.describe('Status Filters', () => {
    test('filter controls are visible above the campaign grid', async ({ page }) => {
      // Look for filter buttons, tabs, or dropdown
      const filterControls = page.locator(
        '[class*="filter" i], [class*="tabs" i], [class*="statusFilter" i], [class*="toolbar" i], [role="tablist"]'
      ).filter({
        has: page.locator('button, [role="tab"], [role="button"]').filter({
          hasText: /open|draft|closed|blocked|archived|all/i,
        }),
      }).first();

      // Also try individual filter buttons
      const filterBtns = page.locator('button, [role="tab"], [role="button"], [role="option"]').filter({
        hasText: /^(open|draft|closed|blocked|archived|all\s*campaigns?)$/i,
      });

      const controlsVisible = await filterControls.isVisible({ timeout: 10_000 }).catch(() => false);
      const btnsCount = await filterBtns.count().catch(() => 0);

      expect.soft(
        controlsVisible || btnsCount > 0,
        'Filter controls should be visible above the campaign card grid'
      ).toBeTruthy();
    });

    test('"Open" filter option exists', async ({ page }) => {
      const openFilter = page.locator('button, [role="tab"], [role="button"], [role="option"], [class*="filter" i] *').filter({
        hasText: /^open$/i,
      }).first();

      expect.soft(
        await openFilter.isVisible({ timeout: 10_000 }).catch(() => false),
        'An "Open" filter option should be available'
      ).toBeTruthy();
    });

    test('"Draft" filter option exists', async ({ page }) => {
      const draftFilter = page.locator('button, [role="tab"], [role="button"], [role="option"], [class*="filter" i] *').filter({
        hasText: /^draft$/i,
      }).first();

      expect.soft(
        await draftFilter.isVisible({ timeout: 10_000 }).catch(() => false),
        'A "Draft" filter option should be available'
      ).toBeTruthy();
    });

    test('"Closed" filter option exists', async ({ page }) => {
      const closedFilter = page.locator('button, [role="tab"], [role="button"], [role="option"], [class*="filter" i] *').filter({
        hasText: /^closed$/i,
      }).first();

      expect.soft(
        await closedFilter.isVisible({ timeout: 10_000 }).catch(() => false),
        'A "Closed" filter option should be available'
      ).toBeTruthy();
    });

    test('"Blocked" filter option exists', async ({ page }) => {
      const blockedFilter = page.locator('button, [role="tab"], [role="button"], [role="option"], [class*="filter" i] *').filter({
        hasText: /^blocked$/i,
      }).first();

      expect.soft(
        await blockedFilter.isVisible({ timeout: 10_000 }).catch(() => false),
        'A "Blocked" filter option should be available'
      ).toBeTruthy();
    });

    test('"Archived" filter option exists', async ({ page }) => {
      const archivedFilter = page.locator('button, [role="tab"], [role="button"], [role="option"], [class*="filter" i] *').filter({
        hasText: /^archived$/i,
      }).first();

      expect.soft(
        await archivedFilter.isVisible({ timeout: 10_000 }).catch(() => false),
        'An "Archived" filter option should be available'
      ).toBeTruthy();
    });

    test('clicking a filter updates the campaign grid', async ({ page }) => {
      // Try clicking "Draft" filter and check if the grid updates
      const draftFilter = page.locator('button, [role="tab"], [role="button"], [role="option"]').filter({
        hasText: /^draft$/i,
      }).first();

      const filterVisible = await draftFilter.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!filterVisible) {
        test.skip(true, 'Draft filter not found');
        return;
      }

      await draftFilter.click();
      await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
      await waitForLoaders(page);

      // After filtering by Draft, all visible status badges should be "Draft"
      // (or there should be a "no results" message)
      const statusBadges = page.locator(
        '[class*="badge" i], [class*="status" i], [class*="chip" i], [class*="tag" i]'
      ).filter({ hasText: /^(draft|open|closed|blocked|archived)$/i });

      const count = await statusBadges.count().catch(() => 0);
      if (count > 0) {
        // Check that all visible badges are "Draft"
        let allDraft = true;
        for (let i = 0; i < Math.min(count, 5); i++) {
          const text = (await statusBadges.nth(i).textContent())?.trim().toLowerCase();
          if (text && text !== 'draft') {
            allDraft = false;
            break;
          }
        }
        expect.soft(
          allDraft,
          'After clicking "Draft" filter, visible campaign badges should be "Draft"'
        ).toBeTruthy();
      }
      // If count is 0, the filter may have resulted in no campaigns, which is acceptable
    });
  });
});
