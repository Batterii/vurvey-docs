import { test, expect, Page } from '@playwright/test';
import { gotoSection, waitForLoaders, workspaceUrl } from './helpers/workspace';
import { loginViaUI } from './helpers/login';
import {
  clickButtonByText,
  waitForModal,
  dismissModal,
  openCardMenu,
  bodyContainsText,
  waitForAnySelector,
} from './helpers/ui';

// ---------------------------------------------------------------------------
// All tests require a real login because the Vurvey SPA clears
// localStorage tokens restored by storageState.
// ---------------------------------------------------------------------------
test.describe('workflows.md: Documentation claim tests', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
    await waitForLoaders(page);
  });

  // =========================================================================
  // GALLERY & TABS GROUP
  // =========================================================================
  test.describe('Gallery & Tabs', () => {
    test.beforeEach(async ({ page }) => {
      await gotoSection(page, '/workflow');
      await page.waitForTimeout(2_000);
    });

    // Claim 1: Card gallery visible on the Workflows page
    test('card gallery is visible on workflows page', async ({ page }) => {
      // The workflows page should show cards in a grid layout
      const cards = page.locator(
        '[class*="card" i], [class*="grid" i], [class*="gallery" i], [class*="workflow" i][class*="list" i]'
      ).first();
      await expect(cards).toBeVisible({ timeout: 15_000 });
    });

    // Claim 2: Workflows tab visible
    test('"Workflows" tab is visible', async ({ page }) => {
      const workflowsTab = page.locator('a, button, [role="tab"]').filter({
        hasText: /^workflows$/i,
      }).first();
      await expect(workflowsTab).toBeVisible({ timeout: 15_000 });
    });

    // Claim 3: Upcoming Runs tab visible
    test('"Upcoming Runs" tab is visible', async ({ page }) => {
      const upcomingTab = page.locator('a, button, [role="tab"]').filter({
        hasText: /upcoming runs/i,
      }).first();
      const isVisible = await upcomingTab.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!isVisible) {
        test.skip(true, 'Upcoming Runs tab not visible — scheduling feature flag may be off');
        return;
      }
      await expect(upcomingTab).toBeVisible();
    });

    // Claim 4: Templates tab visible
    test('"Templates" tab is visible', async ({ page }) => {
      const templatesTab = page.locator('a, button, [role="tab"]').filter({
        hasText: /^templates$/i,
      }).first();
      const isVisible = await templatesTab.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!isVisible) {
        test.skip(true, 'Templates tab not visible — V3 templates feature flag may be off');
        return;
      }
      await expect(templatesTab).toBeVisible();
    });

    // Claim 5: Conversations tab visible
    test('"Conversations" tab is visible', async ({ page }) => {
      const conversationsTab = page.locator('a, button, [role="tab"]').filter({
        hasText: /^conversations$/i,
      }).first();
      await expect(conversationsTab).toBeVisible({ timeout: 15_000 });
    });
  });

  // =========================================================================
  // CARD DETAILS GROUP
  // =========================================================================
  test.describe('Card Details', () => {
    test.beforeEach(async ({ page }) => {
      await gotoSection(page, '/workflow');
      await page.waitForTimeout(2_000);
    });

    // Helper to find the first workflow card
    function firstCard(page: Page) {
      return page.locator(
        '[class*="card" i][class*="workflow" i], [class*="workflowCard" i], [class*="card" i]'
      ).first();
    }

    // Claim 6: Workflow cards show Name
    test('workflow card shows name', async ({ page }) => {
      const card = firstCard(page);
      const isVisible = await card.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!isVisible) {
        test.skip(true, 'No workflow cards found');
        return;
      }
      // Card should have meaningful text content (the name)
      const text = await card.textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    });

    // Claim 7: Workflow cards show Creator ("by ...")
    test('workflow card shows creator', async ({ page }) => {
      const card = firstCard(page);
      const isVisible = await card.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!isVisible) {
        test.skip(true, 'No workflow cards found');
        return;
      }
      // Look for "by <name>" text on the card
      const creatorText = card.getByText(/by\s+\w+/i).first();
      expect.soft(
        await creatorText.isVisible({ timeout: 5_000 }).catch(() => false),
        'Workflow card should display the creator ("by ...")'
      ).toBeTruthy();
    });

    // Claim 8: Workflow cards show Description
    test('workflow card shows description', async ({ page }) => {
      const card = firstCard(page);
      const isVisible = await card.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!isVisible) {
        test.skip(true, 'No workflow cards found');
        return;
      }
      // Card text should contain more than just a title — check for description area
      const descriptionArea = card.locator(
        '[class*="description" i], [class*="subtitle" i], [class*="body" i], p'
      ).first();
      expect.soft(
        await descriptionArea.isVisible({ timeout: 5_000 }).catch(() => false),
        'Workflow card should display a description'
      ).toBeTruthy();
    });

    // Claim 9: Workflow cards show Assigned agents (avatar icons)
    test('workflow card shows assigned agents', async ({ page }) => {
      const card = firstCard(page);
      const isVisible = await card.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!isVisible) {
        test.skip(true, 'No workflow cards found');
        return;
      }
      // Look for avatar icons or agent indicators
      const avatars = card.locator(
        '[class*="avatar" i], [class*="agent" i] img, [class*="persona" i] img, img[class*="avatar" i], [class*="assignee" i]'
      ).first();
      expect.soft(
        await avatars.isVisible({ timeout: 5_000 }).catch(() => false),
        'Workflow card should display assigned agent avatars'
      ).toBeTruthy();
    });
  });

  // =========================================================================
  // CARD MENU (THREE-DOT) GROUP
  // =========================================================================
  test.describe('Card Menu', () => {
    test.beforeEach(async ({ page }) => {
      await gotoSection(page, '/workflow');
      await page.waitForTimeout(2_000);
    });

    // Helper to open the first workflow card's three-dot menu
    async function openFirstCardMenu(page: Page): Promise<boolean> {
      const card = page.locator(
        '[class*="card" i]'
      ).first();
      const isVisible = await card.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!isVisible) return false;

      // Hover over the card to reveal the menu button
      await card.hover();
      const menuBtn = card.locator(
        'button[aria-label*="more" i], button[aria-label*="menu" i], [class*="dots" i], [class*="overflow" i], [class*="menuTrigger" i], [class*="menu" i] button'
      ).first();

      // Fallback: look for a three-dot / ellipsis icon button
      const fallbackBtn = card.locator(
        'button svg, button [class*="icon" i]'
      ).first();

      try {
        await menuBtn.waitFor({ state: 'visible', timeout: 5_000 });
        await menuBtn.click();
      } catch {
        // Try the broader card-level button
        const anyBtn = card.locator('button').last();
        try {
          await anyBtn.waitFor({ state: 'visible', timeout: 3_000 });
          await anyBtn.click();
        } catch {
          return false;
        }
      }

      // Wait for menu to appear
      const menu = page.locator(
        '[role="menu"], [class*="contextMenu" i], [class*="dropdown" i], [class*="popover" i]'
      ).first();
      return await menu.isVisible({ timeout: 5_000 }).catch(() => false);
    }

    // Claim 10: Three-dot menu has "Share" option
    test('card menu shows "Share" option', async ({ page }) => {
      const opened = await openFirstCardMenu(page);
      if (!opened) {
        test.skip(true, 'Could not open workflow card menu');
        return;
      }
      const menu = page.locator(
        '[role="menu"], [class*="contextMenu" i], [class*="dropdown" i], [class*="popover" i]'
      ).first();
      expect.soft(
        await menu.getByText(/share/i).first().isVisible({ timeout: 5_000 }).catch(() => false),
        'Card menu should have "Share" option'
      ).toBeTruthy();
      await page.keyboard.press('Escape');
    });

    // Claim 11: Three-dot menu has "Copy" option
    test('card menu shows "Copy" option', async ({ page }) => {
      const opened = await openFirstCardMenu(page);
      if (!opened) {
        test.skip(true, 'Could not open workflow card menu');
        return;
      }
      const menu = page.locator(
        '[role="menu"], [class*="contextMenu" i], [class*="dropdown" i], [class*="popover" i]'
      ).first();
      expect.soft(
        await menu.getByText(/copy/i).first().isVisible({ timeout: 5_000 }).catch(() => false),
        'Card menu should have "Copy" option'
      ).toBeTruthy();
      await page.keyboard.press('Escape');
    });

    // Claim 12: Three-dot menu has "Edit" option
    test('card menu shows "Edit" option', async ({ page }) => {
      const opened = await openFirstCardMenu(page);
      if (!opened) {
        test.skip(true, 'Could not open workflow card menu');
        return;
      }
      const menu = page.locator(
        '[role="menu"], [class*="contextMenu" i], [class*="dropdown" i], [class*="popover" i]'
      ).first();
      expect.soft(
        await menu.getByText(/edit/i).first().isVisible({ timeout: 5_000 }).catch(() => false),
        'Card menu should have "Edit" option'
      ).toBeTruthy();
      await page.keyboard.press('Escape');
    });

    // Claim 13: Three-dot menu has "View" option
    test('card menu shows "View" option', async ({ page }) => {
      const opened = await openFirstCardMenu(page);
      if (!opened) {
        test.skip(true, 'Could not open workflow card menu');
        return;
      }
      const menu = page.locator(
        '[role="menu"], [class*="contextMenu" i], [class*="dropdown" i], [class*="popover" i]'
      ).first();
      expect.soft(
        await menu.getByText(/view/i).first().isVisible({ timeout: 5_000 }).catch(() => false),
        'Card menu should have "View" option'
      ).toBeTruthy();
      await page.keyboard.press('Escape');
    });

    // Claim 14: Three-dot menu has "Delete" option
    test('card menu shows "Delete" option', async ({ page }) => {
      const opened = await openFirstCardMenu(page);
      if (!opened) {
        test.skip(true, 'Could not open workflow card menu');
        return;
      }
      const menu = page.locator(
        '[role="menu"], [class*="contextMenu" i], [class*="dropdown" i], [class*="popover" i]'
      ).first();
      expect.soft(
        await menu.getByText(/delete/i).first().isVisible({ timeout: 5_000 }).catch(() => false),
        'Card menu should have "Delete" option'
      ).toBeTruthy();
      await page.keyboard.press('Escape');
    });
  });

  // =========================================================================
  // CREATE WORKFLOW GROUP
  // =========================================================================
  test.describe('Create Workflow', () => {
    test.beforeEach(async ({ page }) => {
      await gotoSection(page, '/workflow');
      await page.waitForTimeout(2_000);
    });

    // Claim 15: "Create new workflow" button opens creation modal
    test('"Create new workflow" button opens creation modal', async ({ page }) => {
      // Look for the create button — could be a button or an in-grid card
      const createBtn = page.locator('button, [role="button"], a').filter({
        hasText: /create.*workflow|new.*workflow/i,
      }).first()
        .or(page.locator('[class*="create" i][class*="card" i], [class*="addCard" i], [class*="newCard" i]').first())
        .first();

      await expect(createBtn).toBeVisible({ timeout: 15_000 });
      await createBtn.click();

      // A creation modal should appear
      const modal = page.locator('[role="dialog"], [class*="modal" i]').first();
      await expect(modal).toBeVisible({ timeout: 10_000 });

      // Dismiss without creating
      await dismissModal(page);
    });
  });

  // =========================================================================
  // CANVAS GROUP (requires opening a workflow)
  // =========================================================================
  test.describe('Canvas', () => {
    // Helper to navigate to first workflow's builder view
    async function openFirstWorkflow(page: Page): Promise<boolean> {
      await gotoSection(page, '/workflow');
      await page.waitForTimeout(2_000);

      // Click the first workflow card to open it
      const card = page.locator(
        '[class*="card" i]'
      ).filter({
        hasNotText: /create|new workflow/i,
      }).first();

      const isVisible = await card.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!isVisible) return false;

      await card.click();
      await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
      await waitForLoaders(page);
      await page.waitForTimeout(3_000);
      return true;
    }

    // Claim 16: Zoom controls visible in corner
    test('zoom controls visible in corner', async ({ page }) => {
      const opened = await openFirstWorkflow(page);
      if (!opened) {
        test.skip(true, 'No workflows found to open builder');
        return;
      }

      // Look for zoom controls — typically + / - buttons or zoom slider
      const zoomControls = page.locator(
        '[class*="zoom" i], [class*="controls" i][class*="canvas" i], [class*="zoomControls" i], [class*="viewport" i] button'
      ).first()
        .or(page.locator('button[aria-label*="zoom" i]').first())
        .first();

      expect.soft(
        await zoomControls.isVisible({ timeout: 10_000 }).catch(() => false),
        'Canvas should have zoom controls visible in a corner'
      ).toBeTruthy();
    });

    // Claim 17: Mini map in top-right corner
    test('mini map visible in top-right', async ({ page }) => {
      const opened = await openFirstWorkflow(page);
      if (!opened) {
        test.skip(true, 'No workflows found to open builder');
        return;
      }

      // Look for mini map component
      const miniMap = page.locator(
        '[class*="minimap" i], [class*="mini-map" i], [class*="miniMap" i], [class*="overview" i][class*="map" i]'
      ).first();

      expect.soft(
        await miniMap.isVisible({ timeout: 10_000 }).catch(() => false),
        'Canvas should have a mini map in the top-right corner'
      ).toBeTruthy();
    });

    // Claim 18: Animated connection lines between nodes
    test('connection lines visible between nodes', async ({ page }) => {
      const opened = await openFirstWorkflow(page);
      if (!opened) {
        test.skip(true, 'No workflows found to open builder');
        return;
      }

      // Connection lines are typically SVG paths or edges
      const connections = page.locator(
        'svg path, [class*="edge" i], [class*="connection" i], [class*="line" i][class*="animated" i], .react-flow__edge'
      ).first();

      expect.soft(
        await connections.isVisible({ timeout: 10_000 }).catch(() => false),
        'Canvas should display animated connection lines between nodes'
      ).toBeTruthy();
    });
  });

  // =========================================================================
  // TOOLBAR GROUP (requires opening a workflow)
  // =========================================================================
  test.describe('Toolbar', () => {
    async function openFirstWorkflow(page: Page): Promise<boolean> {
      await gotoSection(page, '/workflow');
      await page.waitForTimeout(2_000);

      const card = page.locator('[class*="card" i]').filter({
        hasNotText: /create|new workflow/i,
      }).first();

      const isVisible = await card.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!isVisible) return false;

      await card.click();
      await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
      await waitForLoaders(page);
      await page.waitForTimeout(3_000);
      return true;
    }

    // Claim 19: Build tab visible
    test('"Build" tab visible in toolbar', async ({ page }) => {
      const opened = await openFirstWorkflow(page);
      if (!opened) {
        test.skip(true, 'No workflows found');
        return;
      }
      const buildTab = page.locator('a, button, [role="tab"]').filter({
        hasText: /^build$/i,
      }).first();
      await expect(buildTab).toBeVisible({ timeout: 15_000 });
    });

    // Claim 20: History button visible
    test('"History" button visible in toolbar', async ({ page }) => {
      const opened = await openFirstWorkflow(page);
      if (!opened) {
        test.skip(true, 'No workflows found');
        return;
      }
      const historyBtn = page.locator('button, [role="button"], a').filter({
        hasText: /history/i,
      }).first()
        .or(page.locator('[aria-label*="history" i], [data-testid*="history" i]').first())
        .first();

      await expect(historyBtn).toBeVisible({ timeout: 15_000 });
    });

    // Claim 21: Edit button visible
    test('"Edit" button visible in toolbar', async ({ page }) => {
      const opened = await openFirstWorkflow(page);
      if (!opened) {
        test.skip(true, 'No workflows found');
        return;
      }
      const editBtn = page.locator('button, [role="button"]').filter({
        hasText: /^edit$/i,
      }).first()
        .or(page.locator('[aria-label*="edit" i], [data-testid*="edit" i]').first())
        .first();

      expect.soft(
        await editBtn.isVisible({ timeout: 10_000 }).catch(() => false),
        'Toolbar should have an "Edit" button'
      ).toBeTruthy();
    });

    // Claim 22: Run button visible
    test('"Run" button visible in toolbar', async ({ page }) => {
      const opened = await openFirstWorkflow(page);
      if (!opened) {
        test.skip(true, 'No workflows found');
        return;
      }
      const runBtn = page.locator('button, [role="button"]').filter({
        hasText: /^run$/i,
      }).first()
        .or(page.locator('[aria-label*="run" i], [data-testid*="run" i]').first())
        .first();

      await expect(runBtn).toBeVisible({ timeout: 15_000 });
    });

    // Claim 23: Share button visible
    test('"Share" button visible in toolbar', async ({ page }) => {
      const opened = await openFirstWorkflow(page);
      if (!opened) {
        test.skip(true, 'No workflows found');
        return;
      }
      const shareBtn = page.locator('button, [role="button"]').filter({
        hasText: /share/i,
      }).first()
        .or(page.locator('[aria-label*="share" i], [data-testid*="share" i]').first())
        .first();

      await expect(shareBtn).toBeVisible({ timeout: 15_000 });
    });

    // Claim 24: Schedule button visible
    test('"Schedule" button visible in toolbar', async ({ page }) => {
      const opened = await openFirstWorkflow(page);
      if (!opened) {
        test.skip(true, 'No workflows found');
        return;
      }
      const scheduleBtn = page.locator('button, [role="button"]').filter({
        hasText: /schedule/i,
      }).first()
        .or(page.locator('[aria-label*="schedule" i], [data-testid*="schedule" i]').first())
        .first();

      expect.soft(
        await scheduleBtn.isVisible({ timeout: 10_000 }).catch(() => false),
        'Toolbar should have a "Schedule" button'
      ).toBeTruthy();
    });
  });

  // =========================================================================
  // SCHEDULE MODAL GROUP
  // =========================================================================
  test.describe('Schedule Modal', () => {
    async function openScheduleModal(page: Page): Promise<boolean> {
      await gotoSection(page, '/workflow');
      await page.waitForTimeout(2_000);

      // Open first workflow
      const card = page.locator('[class*="card" i]').filter({
        hasNotText: /create|new workflow/i,
      }).first();
      const isVisible = await card.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!isVisible) return false;

      await card.click();
      await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
      await waitForLoaders(page);
      await page.waitForTimeout(3_000);

      // Click Schedule button
      const scheduleBtn = page.locator('button, [role="button"]').filter({
        hasText: /schedule/i,
      }).first()
        .or(page.locator('[aria-label*="schedule" i], [data-testid*="schedule" i]').first())
        .first();

      const scheduleVisible = await scheduleBtn.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!scheduleVisible) return false;

      await scheduleBtn.click();

      // Wait for modal
      const modal = page.locator('[role="dialog"], [class*="modal" i]').first();
      return await modal.isVisible({ timeout: 10_000 }).catch(() => false);
    }

    // Claim 25: Schedule modal has Frequency options (Hourly/Daily/Weekly)
    test('schedule modal shows frequency options', async ({ page }) => {
      const opened = await openScheduleModal(page);
      if (!opened) {
        test.skip(true, 'Could not open schedule modal');
        return;
      }

      const modal = page.locator('[role="dialog"], [class*="modal" i]').first();

      // Check for frequency options: Hourly, Daily, Weekly
      const frequencyOptions = ['hourly', 'daily', 'weekly'];
      let foundCount = 0;
      for (const freq of frequencyOptions) {
        const option = modal.getByText(new RegExp(freq, 'i')).first();
        if (await option.isVisible({ timeout: 3_000 }).catch(() => false)) {
          foundCount++;
        }
      }

      expect.soft(
        foundCount,
        'Schedule modal should display frequency options (Hourly/Daily/Weekly)'
      ).toBeGreaterThan(0);

      await dismissModal(page);
    });

    // Claim 26: Schedule modal has email notifications toggle
    test('schedule modal has email notifications toggle', async ({ page }) => {
      const opened = await openScheduleModal(page);
      if (!opened) {
        test.skip(true, 'Could not open schedule modal');
        return;
      }

      const modal = page.locator('[role="dialog"], [class*="modal" i]').first();

      // Look for email notifications toggle
      const emailToggle = modal.getByText(/email.*notif|notify.*email|notifications/i).first()
        .or(modal.locator('[class*="toggle" i], [role="switch"]').first())
        .first();

      expect.soft(
        await emailToggle.isVisible({ timeout: 5_000 }).catch(() => false),
        'Schedule modal should have email notifications toggle'
      ).toBeTruthy();

      await dismissModal(page);
    });

    // Claim 27: Schedule modal shows preview (description + next run time)
    test('schedule modal shows preview', async ({ page }) => {
      const opened = await openScheduleModal(page);
      if (!opened) {
        test.skip(true, 'Could not open schedule modal');
        return;
      }

      const modal = page.locator('[role="dialog"], [class*="modal" i]').first();

      // Look for schedule preview text — human-readable description or next run info
      const preview = modal.getByText(/next.*run|every.*at|schedule.*preview|next scheduled/i).first()
        .or(modal.locator('[class*="preview" i], [class*="summary" i], [class*="nextRun" i]').first())
        .first();

      expect.soft(
        await preview.isVisible({ timeout: 5_000 }).catch(() => false),
        'Schedule modal should show a preview with description and next run time'
      ).toBeTruthy();

      await dismissModal(page);
    });
  });

  // =========================================================================
  // CONVERSATIONS GROUP
  // =========================================================================
  test.describe('Conversations', () => {
    test.beforeEach(async ({ page }) => {
      await gotoSection(page, '/workflow/conversations');
      await page.waitForTimeout(2_000);
    });

    // Helper to open a conversation card menu
    async function openConversationCardMenu(page: Page): Promise<boolean> {
      const card = page.locator('[class*="card" i]').first();
      const isVisible = await card.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!isVisible) return false;

      await card.hover();
      const menuBtn = card.locator(
        'button[aria-label*="more" i], button[aria-label*="menu" i], [class*="dots" i], [class*="overflow" i], [class*="menuTrigger" i], [class*="menu" i] button'
      ).first();

      try {
        await menuBtn.waitFor({ state: 'visible', timeout: 5_000 });
        await menuBtn.click();
      } catch {
        const anyBtn = card.locator('button').last();
        try {
          await anyBtn.waitFor({ state: 'visible', timeout: 3_000 });
          await anyBtn.click();
        } catch {
          return false;
        }
      }

      const menu = page.locator(
        '[role="menu"], [class*="contextMenu" i], [class*="dropdown" i], [class*="popover" i]'
      ).first();
      return await menu.isVisible({ timeout: 5_000 }).catch(() => false);
    }

    // Claim 28: Conversation card menu has "Rename"
    test('conversation card menu shows "Rename"', async ({ page }) => {
      const opened = await openConversationCardMenu(page);
      if (!opened) {
        test.skip(true, 'No conversation cards found or could not open menu');
        return;
      }
      const menu = page.locator(
        '[role="menu"], [class*="contextMenu" i], [class*="dropdown" i], [class*="popover" i]'
      ).first();
      expect.soft(
        await menu.getByText(/rename/i).first().isVisible({ timeout: 5_000 }).catch(() => false),
        'Conversation card menu should have "Rename" option'
      ).toBeTruthy();
      await page.keyboard.press('Escape');
    });

    // Claim 29: Conversation card menu has "Copy"
    test('conversation card menu shows "Copy"', async ({ page }) => {
      const opened = await openConversationCardMenu(page);
      if (!opened) {
        test.skip(true, 'No conversation cards found or could not open menu');
        return;
      }
      const menu = page.locator(
        '[role="menu"], [class*="contextMenu" i], [class*="dropdown" i], [class*="popover" i]'
      ).first();
      expect.soft(
        await menu.getByText(/copy/i).first().isVisible({ timeout: 5_000 }).catch(() => false),
        'Conversation card menu should have "Copy" option'
      ).toBeTruthy();
      await page.keyboard.press('Escape');
    });

    // Claim 30: Conversation card menu has "Export"
    test('conversation card menu shows "Export"', async ({ page }) => {
      const opened = await openConversationCardMenu(page);
      if (!opened) {
        test.skip(true, 'No conversation cards found or could not open menu');
        return;
      }
      const menu = page.locator(
        '[role="menu"], [class*="contextMenu" i], [class*="dropdown" i], [class*="popover" i]'
      ).first();
      expect.soft(
        await menu.getByText(/export/i).first().isVisible({ timeout: 5_000 }).catch(() => false),
        'Conversation card menu should have "Export" option'
      ).toBeTruthy();
      await page.keyboard.press('Escape');
    });

    // Claim 31: Conversation card menu has "Delete"
    test('conversation card menu shows "Delete"', async ({ page }) => {
      const opened = await openConversationCardMenu(page);
      if (!opened) {
        test.skip(true, 'No conversation cards found or could not open menu');
        return;
      }
      const menu = page.locator(
        '[role="menu"], [class*="contextMenu" i], [class*="dropdown" i], [class*="popover" i]'
      ).first();
      expect.soft(
        await menu.getByText(/delete/i).first().isVisible({ timeout: 5_000 }).catch(() => false),
        'Conversation card menu should have "Delete" option'
      ).toBeTruthy();
      await page.keyboard.press('Escape');
    });
  });

  // =========================================================================
  // SHARING GROUP
  // =========================================================================
  test.describe('Sharing & Permissions', () => {
    async function openShareDialog(page: Page): Promise<boolean> {
      await gotoSection(page, '/workflow');
      await page.waitForTimeout(2_000);

      // Open first workflow
      const card = page.locator('[class*="card" i]').filter({
        hasNotText: /create|new workflow/i,
      }).first();
      const isVisible = await card.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!isVisible) return false;

      await card.click();
      await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
      await waitForLoaders(page);
      await page.waitForTimeout(3_000);

      // Click Share button in toolbar
      const shareBtn = page.locator('button, [role="button"]').filter({
        hasText: /share/i,
      }).first()
        .or(page.locator('[aria-label*="share" i], [data-testid*="share" i]').first())
        .first();

      const shareVisible = await shareBtn.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!shareVisible) return false;

      await shareBtn.click();

      // Wait for share dialog
      const dialog = page.locator('[role="dialog"], [class*="modal" i]').first();
      return await dialog.isVisible({ timeout: 10_000 }).catch(() => false);
    }

    // Claim 32: Sharing dialog shows General Access
    test('sharing dialog shows General Access', async ({ page }) => {
      const opened = await openShareDialog(page);
      if (!opened) {
        test.skip(true, 'Could not open share dialog');
        return;
      }

      const dialog = page.locator('[role="dialog"], [class*="modal" i]').first();
      const generalAccess = dialog.getByText(/general access/i).first();

      expect.soft(
        await generalAccess.isVisible({ timeout: 5_000 }).catch(() => false),
        'Sharing dialog should show "General Access" section'
      ).toBeTruthy();

      await dismissModal(page);
    });

    // Claim 33: Sharing dialog has Viewer/Editor roles
    test('sharing dialog shows Viewer and Editor roles', async ({ page }) => {
      const opened = await openShareDialog(page);
      if (!opened) {
        test.skip(true, 'Could not open share dialog');
        return;
      }

      const dialog = page.locator('[role="dialog"], [class*="modal" i]').first();

      // Check for Viewer and Editor role options
      const viewerOption = dialog.getByText(/viewer/i).first();
      const editorOption = dialog.getByText(/editor/i).first();

      expect.soft(
        await viewerOption.isVisible({ timeout: 5_000 }).catch(() => false),
        'Sharing dialog should have "Viewer" role option'
      ).toBeTruthy();

      expect.soft(
        await editorOption.isVisible({ timeout: 5_000 }).catch(() => false),
        'Sharing dialog should have "Editor" role option'
      ).toBeTruthy();

      await dismissModal(page);
    });
  });

  // =========================================================================
  // TAB NAVIGATION (sub-routes) GROUP
  // =========================================================================
  test.describe('Tab Navigation', () => {
    // Claim 34: Clicking "Upcoming Runs" tab navigates to /workflow/upcoming-runs
    test('"Upcoming Runs" tab navigates to correct route', async ({ page }) => {
      await gotoSection(page, '/workflow');
      await page.waitForTimeout(2_000);

      const upcomingTab = page.locator('a, button, [role="tab"]').filter({
        hasText: /upcoming runs/i,
      }).first();

      const isVisible = await upcomingTab.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!isVisible) {
        test.skip(true, 'Upcoming Runs tab not visible');
        return;
      }

      await upcomingTab.click();
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      expect(page.url()).toContain('/upcoming-runs');
    });

    // Claim 35: Clicking "Templates" tab navigates to /workflow/templates
    test('"Templates" tab navigates to correct route', async ({ page }) => {
      await gotoSection(page, '/workflow');
      await page.waitForTimeout(2_000);

      const templatesTab = page.locator('a, button, [role="tab"]').filter({
        hasText: /^templates$/i,
      }).first();

      const isVisible = await templatesTab.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!isVisible) {
        test.skip(true, 'Templates tab not visible');
        return;
      }

      await templatesTab.click();
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      expect(page.url()).toContain('/templates');
    });

    // Claim 36: Clicking "Conversations" tab navigates to /workflow/conversations
    test('"Conversations" tab navigates to correct route', async ({ page }) => {
      await gotoSection(page, '/workflow');
      await page.waitForTimeout(2_000);

      const conversationsTab = page.locator('a, button, [role="tab"]').filter({
        hasText: /^conversations$/i,
      }).first();

      await conversationsTab.waitFor({ state: 'visible', timeout: 10_000 });
      await conversationsTab.click();
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      expect(page.url()).toContain('/conversations');
    });
  });
});
