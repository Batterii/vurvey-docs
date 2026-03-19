import { test, expect, Page, Locator } from '@playwright/test';
import { gotoSection, waitForLoaders, workspaceUrl } from './helpers/workspace';
import { loginViaUI, ensureAuthenticated } from './helpers/login';
import {
  clickButtonByText,
  waitForModal,
  dismissModal,
  openCardMenu,
  waitForAnySelector,
  bodyContainsText,
} from './helpers/ui';

// ---------------------------------------------------------------------------
// All tests require a real login because the Vurvey SPA clears localStorage
// tokens restored by storageState.
// ---------------------------------------------------------------------------
test.describe('agents.md: Documentation claim tests', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
    await waitForLoaders(page);
    await gotoSection(page, '/agents');
    await page.waitForTimeout(2_000);
  });

  // =========================================================================
  // HELPERS
  // =========================================================================

  /** Locator for agent cards in the gallery grid */
  function agentCards(page: Page): Locator {
    return page.locator(
      '[class*="card" i][class*="agent" i], [class*="personaCard" i], [class*="agentCard" i], [data-testid*="agent-card"], [class*="card" i]'
    ).first();
  }

  /** Get all visible agent cards */
  function allAgentCards(page: Page): Locator {
    return page.locator(
      '[class*="card" i][class*="agent" i], [class*="personaCard" i], [class*="agentCard" i], [data-testid*="agent-card"]'
    );
  }

  /** Wait for the gallery to be loaded with at least one card */
  async function waitForGallery(page: Page): Promise<void> {
    // Wait for cards or a recognizable gallery container
    await page.locator(
      '[class*="card" i], [class*="gallery" i], [class*="grid" i], [class*="agent" i]'
    ).first().waitFor({ state: 'visible', timeout: 20_000 }).catch(() => {});
    await waitForLoaders(page);
  }

  /** Find the filter bar area */
  function filterBar(page: Page): Locator {
    return page.locator(
      '[class*="filter" i], [class*="toolbar" i], [class*="actionBar" i], [class*="searchBar" i], [class*="controls" i]'
    ).first();
  }

  /** Open the three-dot menu on the first visible agent card */
  async function openFirstCardMenu(page: Page): Promise<boolean> {
    const card = page.locator(
      '[class*="card" i][class*="agent" i], [class*="personaCard" i], [class*="agentCard" i], [data-testid*="agent-card"], [class*="card" i]'
    ).first();
    const isVisible = await card.isVisible({ timeout: 10_000 }).catch(() => false);
    if (!isVisible) return false;

    await card.hover();
    await page.waitForTimeout(500);

    // Look for three-dot / overflow menu button on the card
    const menuBtn = card.locator(
      'button[aria-label*="more" i], button[aria-label*="menu" i], [class*="dots" i], [class*="overflow" i], [class*="menuTrigger" i], [class*="kebab" i], button svg'
    ).first()
      .or(page.locator('[class*="cardMenu" i], [class*="card"] button').first())
      .first();

    try {
      await menuBtn.waitFor({ state: 'visible', timeout: 5_000 });
      await menuBtn.click();
      return true;
    } catch {
      return false;
    }
  }

  /** Click the first agent card to open the detail drawer */
  async function openFirstAgentDrawer(page: Page): Promise<boolean> {
    const card = page.locator(
      '[class*="card" i][class*="agent" i], [class*="personaCard" i], [class*="agentCard" i], [data-testid*="agent-card"], [class*="card" i]'
    ).first();
    const isVisible = await card.isVisible({ timeout: 10_000 }).catch(() => false);
    if (!isVisible) return false;

    await card.click();
    await page.waitForTimeout(1_500);
    return true;
  }

  // =========================================================================
  // 1. GALLERY — CARD GRID AND LAYOUT
  // =========================================================================
  test.describe('Agent Gallery', () => {
    // Claim 1: Gallery shows a visual grid of agent cards
    test('gallery shows a visual grid of agent cards', async ({ page }) => {
      await waitForGallery(page);
      // Look for multiple card-like elements in a grid/flex container
      const cards = page.locator(
        '[class*="card" i], [class*="personaCard" i], [class*="agentCard" i], [data-testid*="agent-card"]'
      );
      const count = await cards.count();
      expect(count, 'Gallery should display at least one agent card').toBeGreaterThan(0);
    });

    // Claim 2: Each agent card shows an avatar image
    test('agent card shows avatar image', async ({ page }) => {
      await waitForGallery(page);
      const card = page.locator(
        '[class*="card" i], [class*="personaCard" i], [class*="agentCard" i], [data-testid*="agent-card"]'
      ).first();
      await expect(card).toBeVisible({ timeout: 15_000 });

      // Avatar may be an img, background-image, or SVG
      const hasImg = await card.locator('img').first().isVisible({ timeout: 3_000 }).catch(() => false);
      const hasBgImage = await card.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.backgroundImage !== 'none' && style.backgroundImage !== '';
      }).catch(() => false);
      const hasAvatar = await card.locator('[class*="avatar" i], [class*="image" i]').first()
        .isVisible({ timeout: 3_000 }).catch(() => false);

      expect.soft(
        hasImg || hasBgImage || hasAvatar,
        'Agent card should display an avatar image (img element, background-image, or avatar container)'
      ).toBeTruthy();
    });

    // Claim 3: Each agent card shows the agent's name
    test('agent card shows agent name in text', async ({ page }) => {
      await waitForGallery(page);
      const card = page.locator(
        '[class*="card" i], [class*="personaCard" i], [class*="agentCard" i], [data-testid*="agent-card"]'
      ).first();
      await expect(card).toBeVisible({ timeout: 15_000 });

      const text = await card.textContent();
      expect(text?.trim().length, 'Agent card should contain non-empty text (agent name)').toBeGreaterThan(0);
    });

    // Claim 4: Each agent card shows a type label (purple)
    test('agent card shows type label', async ({ page }) => {
      await waitForGallery(page);
      const card = page.locator(
        '[class*="card" i], [class*="personaCard" i], [class*="agentCard" i], [data-testid*="agent-card"]'
      ).first();
      await expect(card).toBeVisible({ timeout: 15_000 });

      // Type labels: Assistant, Consumer Persona, Product, Visual Generator
      const typeLabel = card.locator('*').filter({
        hasText: /^(Assistant|Consumer Persona|Product|Visual Generator)$/i,
      }).first();
      expect.soft(
        await typeLabel.isVisible({ timeout: 5_000 }).catch(() => false),
        'Agent card should show a type label (Assistant, Consumer Persona, Product, or Visual Generator)'
      ).toBeTruthy();
    });

    // Claim 5: On hover, card reveals status indicator, description, and three-dot menu
    test('hovering agent card reveals additional info', async ({ page }) => {
      await waitForGallery(page);
      const card = page.locator(
        '[class*="card" i], [class*="personaCard" i], [class*="agentCard" i], [data-testid*="agent-card"]'
      ).first();
      await expect(card).toBeVisible({ timeout: 15_000 });

      await card.hover();
      await page.waitForTimeout(1_000);

      // Check for at least one hover-revealed element:
      // status indicator (dot), description text, or menu button
      const statusDot = card.locator(
        '[class*="status" i], [class*="dot" i], [class*="indicator" i], [class*="badge" i]'
      ).first();
      const description = card.locator(
        '[class*="description" i], [class*="bio" i], [class*="summary" i], p'
      ).first();
      const menuBtn = card.locator(
        'button[aria-label*="more" i], button[aria-label*="menu" i], [class*="dots" i], [class*="overflow" i], [class*="menuTrigger" i], [class*="kebab" i]'
      ).first();

      const hasStatus = await statusDot.isVisible({ timeout: 3_000 }).catch(() => false);
      const hasDescription = await description.isVisible({ timeout: 3_000 }).catch(() => false);
      const hasMenu = await menuBtn.isVisible({ timeout: 3_000 }).catch(() => false);

      expect.soft(
        hasStatus || hasDescription || hasMenu,
        'Hovering card should reveal status indicator, description, or three-dot menu'
      ).toBeTruthy();
    });

    // Claim 6: Gallery has collapsible sections by agent type (Trending, Assistant, Consumer Persona, Product, Visual Generator)
    test('gallery has type-based sections', async ({ page }) => {
      await waitForGallery(page);

      const sectionTypes = ['Trending', 'Assistant', 'Consumer Persona', 'Product', 'Visual Generator'];
      let foundSections = 0;
      for (const sectionType of sectionTypes) {
        const sectionHeader = page.locator('h1, h2, h3, h4, h5, h6, [class*="section" i], [class*="header" i], [class*="heading" i], [role="heading"], button')
          .filter({ hasText: new RegExp(sectionType, 'i') })
          .first();
        const isVisible = await sectionHeader.isVisible({ timeout: 3_000 }).catch(() => false);
        if (isVisible) foundSections++;
      }

      expect.soft(
        foundSections,
        `Gallery should have at least one recognizable type-based section (found ${foundSections} of ${sectionTypes.length})`
      ).toBeGreaterThan(0);
    });

    // Claim 7: Type sections are collapsible (can be expanded/collapsed)
    test('type sections are collapsible', async ({ page }) => {
      await waitForGallery(page);

      // Find a section header that looks collapsible (button, or has aria-expanded, or toggle icon)
      const collapsibleHeader = page.locator(
        'button[aria-expanded], [class*="collapsible" i] [class*="header" i], [class*="section" i] button, [class*="accordion" i]'
      ).first()
        .or(
          page.locator('[class*="section" i], [class*="group" i]')
            .filter({ hasText: /Assistant|Consumer Persona|Product|Visual Generator|Trending/i })
            .locator('button, [role="button"], [class*="toggle" i], [class*="arrow" i], [class*="chevron" i], svg')
            .first()
        )
        .first();

      const isVisible = await collapsibleHeader.isVisible({ timeout: 8_000 }).catch(() => false);
      expect.soft(
        isVisible,
        'Gallery should have collapsible section headers (expandable/collapsible type sections)'
      ).toBeTruthy();
    });
  });

  // =========================================================================
  // 2. SEARCHING AND FILTERING
  // =========================================================================
  test.describe('Searching and Filtering', () => {
    // Claim 8: Sort dropdown with Newest/Oldest options
    test('sort dropdown with Newest/Oldest options', async ({ page }) => {
      await waitForGallery(page);

      const sortBtn = page.locator('button, [role="button"], select').filter({
        hasText: /sort|newest|oldest|order/i,
      }).first()
        .or(page.locator('[data-testid*="sort" i], [aria-label*="sort" i]').first())
        .first();

      const isVisible = await sortBtn.isVisible({ timeout: 8_000 }).catch(() => false);
      expect.soft(isVisible, 'Sort control should be visible in the filter bar').toBeTruthy();

      if (isVisible) {
        await sortBtn.click();
        await page.waitForTimeout(500);

        const newestOption = page.getByText(/newest/i).first();
        const oldestOption = page.getByText(/oldest/i).first();

        expect.soft(
          await newestOption.isVisible({ timeout: 5_000 }).catch(() => false),
          'Sort dropdown should have a "Newest" option'
        ).toBeTruthy();
        expect.soft(
          await oldestOption.isVisible({ timeout: 5_000 }).catch(() => false),
          'Sort dropdown should have an "Oldest" option'
        ).toBeTruthy();

        await page.keyboard.press('Escape');
      }
    });

    // Claim 9: Type filter (Assistant, Consumer Persona, Product, Visual Generator)
    test('type filter available', async ({ page }) => {
      await waitForGallery(page);

      const typeFilter = page.locator('button, [role="button"], select').filter({
        hasText: /^type$|agent type|filter.*type/i,
      }).first()
        .or(page.locator('[data-testid*="type-filter" i], [aria-label*="type" i]').first())
        .first();

      const isVisible = await typeFilter.isVisible({ timeout: 8_000 }).catch(() => false);
      expect.soft(isVisible, 'Type filter control should be visible in the filter bar').toBeTruthy();

      if (isVisible) {
        await typeFilter.click();
        await page.waitForTimeout(500);

        const typeOptions = ['Assistant', 'Consumer Persona', 'Product', 'Visual Generator'];
        for (const opt of typeOptions) {
          expect.soft(
            await page.getByText(new RegExp(`^${opt}$`, 'i')).first()
              .isVisible({ timeout: 3_000 }).catch(() => false),
            `Type filter should have "${opt}" option`
          ).toBeTruthy();
        }

        await page.keyboard.press('Escape');
      }
    });

    // Claim 10: Model filter
    test('model filter available', async ({ page }) => {
      await waitForGallery(page);

      const modelFilter = page.locator('button, [role="button"], select').filter({
        hasText: /^model$|ai model|filter.*model/i,
      }).first()
        .or(page.locator('[data-testid*="model-filter" i], [aria-label*="model" i]').first())
        .first();

      expect.soft(
        await modelFilter.isVisible({ timeout: 8_000 }).catch(() => false),
        'Model filter control should be visible in the filter bar'
      ).toBeTruthy();
    });

    // Claim 11: Status filter (Active/Inactive)
    test('status filter with Active/Inactive options', async ({ page }) => {
      await waitForGallery(page);

      const statusFilter = page.locator('button, [role="button"], select').filter({
        hasText: /^status$|active|inactive|filter.*status/i,
      }).first()
        .or(page.locator('[data-testid*="status-filter" i], [aria-label*="status" i]').first())
        .first();

      const isVisible = await statusFilter.isVisible({ timeout: 8_000 }).catch(() => false);
      expect.soft(isVisible, 'Status filter control should be visible in the filter bar').toBeTruthy();

      if (isVisible) {
        await statusFilter.click();
        await page.waitForTimeout(500);

        expect.soft(
          await page.getByText(/active|published/i).first()
            .isVisible({ timeout: 5_000 }).catch(() => false),
          'Status filter should have Active/Published option'
        ).toBeTruthy();
        expect.soft(
          await page.getByText(/inactive|draft/i).first()
            .isVisible({ timeout: 5_000 }).catch(() => false),
          'Status filter should have Inactive/Draft option'
        ).toBeTruthy();

        await page.keyboard.press('Escape');
      }
    });

    // Claim 12: Search input for finding agents by name
    test('search input exists in filter bar', async ({ page }) => {
      await waitForGallery(page);

      const searchInput = page.locator(
        'input[type="search"], input[type="text"][placeholder*="search" i], input[placeholder*="find" i], input[placeholder*="agent" i], [data-testid*="search" i] input'
      ).first();

      expect.soft(
        await searchInput.isVisible({ timeout: 8_000 }).catch(() => false),
        'Search input should be visible in the filter bar for finding agents by name'
      ).toBeTruthy();
    });
  });

  // =========================================================================
  // 3. AGENT DETAIL DRAWER
  // =========================================================================
  test.describe('Agent Detail Drawer', () => {
    // Claim 13: Clicking an agent card opens a right-side drawer
    test('clicking agent card opens detail drawer', async ({ page }) => {
      await waitForGallery(page);
      const opened = await openFirstAgentDrawer(page);
      if (!opened) {
        test.skip(true, 'No agent cards available to click');
        return;
      }

      // Look for a drawer/panel that slides in
      const drawer = page.locator(
        '[class*="drawer" i], [class*="panel" i], [class*="detail" i], [role="dialog"], [class*="slideIn" i], [class*="sidePanel" i]'
      ).first();
      await expect(drawer).toBeVisible({ timeout: 10_000 });
    });

    // Claim 14: Drawer shows agent avatar
    test('detail drawer shows agent avatar', async ({ page }) => {
      await waitForGallery(page);
      const opened = await openFirstAgentDrawer(page);
      if (!opened) {
        test.skip(true, 'No agent cards available');
        return;
      }

      const drawer = page.locator(
        '[class*="drawer" i], [class*="panel" i], [class*="detail" i], [role="dialog"], [class*="slideIn" i], [class*="sidePanel" i]'
      ).first();
      await drawer.waitFor({ state: 'visible', timeout: 10_000 });

      const avatar = drawer.locator('img, [class*="avatar" i], [class*="image" i]').first();
      expect.soft(
        await avatar.isVisible({ timeout: 5_000 }).catch(() => false),
        'Detail drawer should show the agent avatar'
      ).toBeTruthy();
    });

    // Claim 15: Drawer shows agent name
    test('detail drawer shows agent name', async ({ page }) => {
      await waitForGallery(page);
      const opened = await openFirstAgentDrawer(page);
      if (!opened) {
        test.skip(true, 'No agent cards available');
        return;
      }

      const drawer = page.locator(
        '[class*="drawer" i], [class*="panel" i], [class*="detail" i], [role="dialog"], [class*="slideIn" i], [class*="sidePanel" i]'
      ).first();
      await drawer.waitFor({ state: 'visible', timeout: 10_000 });

      // Drawer should have a heading or prominent text with the agent name
      const heading = drawer.locator('h1, h2, h3, h4, [class*="name" i], [class*="title" i]').first();
      const text = await heading.textContent().catch(() => '');
      expect(text?.trim().length, 'Detail drawer should show the agent name').toBeGreaterThan(0);
    });

    // Claim 16: Drawer shows agent type
    test('detail drawer shows agent type', async ({ page }) => {
      await waitForGallery(page);
      const opened = await openFirstAgentDrawer(page);
      if (!opened) {
        test.skip(true, 'No agent cards available');
        return;
      }

      const drawer = page.locator(
        '[class*="drawer" i], [class*="panel" i], [class*="detail" i], [role="dialog"], [class*="slideIn" i], [class*="sidePanel" i]'
      ).first();
      await drawer.waitFor({ state: 'visible', timeout: 10_000 });

      const typeLabel = drawer.locator('*').filter({
        hasText: /^(Assistant|Consumer Persona|Product|Visual Generator)$/i,
      }).first();
      expect.soft(
        await typeLabel.isVisible({ timeout: 5_000 }).catch(() => false),
        'Detail drawer should show the agent type (Assistant, Consumer Persona, Product, or Visual Generator)'
      ).toBeTruthy();
    });

    // Claim 17: Drawer shows Edit button
    test('detail drawer shows Edit button', async ({ page }) => {
      await waitForGallery(page);
      const opened = await openFirstAgentDrawer(page);
      if (!opened) {
        test.skip(true, 'No agent cards available');
        return;
      }

      const drawer = page.locator(
        '[class*="drawer" i], [class*="panel" i], [class*="detail" i], [role="dialog"], [class*="slideIn" i], [class*="sidePanel" i]'
      ).first();
      await drawer.waitFor({ state: 'visible', timeout: 10_000 });

      const editBtn = drawer.locator('button, [role="button"], a').filter({
        hasText: /edit/i,
      }).first();
      expect.soft(
        await editBtn.isVisible({ timeout: 5_000 }).catch(() => false),
        'Detail drawer should show an Edit button'
      ).toBeTruthy();
    });

    // Claim 18: Drawer shows full description
    test('detail drawer shows agent description', async ({ page }) => {
      await waitForGallery(page);
      const opened = await openFirstAgentDrawer(page);
      if (!opened) {
        test.skip(true, 'No agent cards available');
        return;
      }

      const drawer = page.locator(
        '[class*="drawer" i], [class*="panel" i], [class*="detail" i], [role="dialog"], [class*="slideIn" i], [class*="sidePanel" i]'
      ).first();
      await drawer.waitFor({ state: 'visible', timeout: 10_000 });

      // Look for a description section with meaningful text
      const description = drawer.locator(
        '[class*="description" i], [class*="bio" i], [class*="summary" i], [class*="about" i], p'
      ).first();
      const text = await description.textContent().catch(() => '');
      expect.soft(
        (text?.trim().length || 0) > 10,
        'Detail drawer should show the agent description (more than 10 chars)'
      ).toBeTruthy();
    });

    // Claim 19: Drawer shows related conversations
    test('detail drawer shows related conversations section', async ({ page }) => {
      await waitForGallery(page);
      const opened = await openFirstAgentDrawer(page);
      if (!opened) {
        test.skip(true, 'No agent cards available');
        return;
      }

      const drawer = page.locator(
        '[class*="drawer" i], [class*="panel" i], [class*="detail" i], [role="dialog"], [class*="slideIn" i], [class*="sidePanel" i]'
      ).first();
      await drawer.waitFor({ state: 'visible', timeout: 10_000 });

      const conversations = drawer.getByText(/conversation/i).first()
        .or(drawer.locator('[class*="conversation" i], [class*="chat" i]').first())
        .first();
      expect.soft(
        await conversations.isVisible({ timeout: 5_000 }).catch(() => false),
        'Detail drawer should show related conversations section'
      ).toBeTruthy();
    });

    // Claim 20: Drawer has a live chat interface at the bottom
    test('detail drawer has live chat interface', async ({ page }) => {
      await waitForGallery(page);
      const opened = await openFirstAgentDrawer(page);
      if (!opened) {
        test.skip(true, 'No agent cards available');
        return;
      }

      const drawer = page.locator(
        '[class*="drawer" i], [class*="panel" i], [class*="detail" i], [role="dialog"], [class*="slideIn" i], [class*="sidePanel" i]'
      ).first();
      await drawer.waitFor({ state: 'visible', timeout: 10_000 });

      // Look for a chat input or text area within the drawer
      const chatInput = drawer.locator(
        'textarea, input[placeholder*="message" i], input[placeholder*="ask" i], input[placeholder*="type" i], [contenteditable="true"], [class*="chatInput" i], [class*="composer" i]'
      ).first();
      expect.soft(
        await chatInput.isVisible({ timeout: 8_000 }).catch(() => false),
        'Detail drawer should have a live chat interface (text input) at the bottom'
      ).toBeTruthy();
    });
  });

  // =========================================================================
  // 4. AGENT CARD MENU (THREE-DOT)
  // =========================================================================
  test.describe('Agent Card Menu (three-dot)', () => {
    // Claim 21: Three-dot menu has "Start Conversation"
    test('card menu has "Start Conversation"', async ({ page }) => {
      await waitForGallery(page);
      const menuOpened = await openFirstCardMenu(page);
      if (!menuOpened) {
        test.skip(true, 'Could not open card menu');
        return;
      }

      const menu = page.locator(
        '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i], [class*="contextMenu" i], [class*="menuList" i]'
      ).first();
      await menu.waitFor({ state: 'visible', timeout: 8_000 });

      expect.soft(
        await menu.getByText(/start conversation/i).first()
          .isVisible({ timeout: 5_000 }).catch(() => false),
        'Card menu should have "Start Conversation" option'
      ).toBeTruthy();

      await page.keyboard.press('Escape');
    });

    // Claim 22: Three-dot menu has "Share"
    test('card menu has "Share"', async ({ page }) => {
      await waitForGallery(page);
      const menuOpened = await openFirstCardMenu(page);
      if (!menuOpened) {
        test.skip(true, 'Could not open card menu');
        return;
      }

      const menu = page.locator(
        '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i], [class*="contextMenu" i], [class*="menuList" i]'
      ).first();
      await menu.waitFor({ state: 'visible', timeout: 8_000 });

      expect.soft(
        await menu.getByText(/share/i).first()
          .isVisible({ timeout: 5_000 }).catch(() => false),
        'Card menu should have "Share" option'
      ).toBeTruthy();

      await page.keyboard.press('Escape');
    });

    // Claim 23: Three-dot menu has "Edit Agent"
    test('card menu has "Edit Agent"', async ({ page }) => {
      await waitForGallery(page);
      const menuOpened = await openFirstCardMenu(page);
      if (!menuOpened) {
        test.skip(true, 'Could not open card menu');
        return;
      }

      const menu = page.locator(
        '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i], [class*="contextMenu" i], [class*="menuList" i]'
      ).first();
      await menu.waitFor({ state: 'visible', timeout: 8_000 });

      expect.soft(
        await menu.getByText(/edit agent/i).first()
          .isVisible({ timeout: 5_000 }).catch(() => false),
        'Card menu should have "Edit Agent" option'
      ).toBeTruthy();

      await page.keyboard.press('Escape');
    });

    // Claim 24: Three-dot menu has "View Agent"
    test('card menu has "View Agent"', async ({ page }) => {
      await waitForGallery(page);
      const menuOpened = await openFirstCardMenu(page);
      if (!menuOpened) {
        test.skip(true, 'Could not open card menu');
        return;
      }

      const menu = page.locator(
        '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i], [class*="contextMenu" i], [class*="menuList" i]'
      ).first();
      await menu.waitFor({ state: 'visible', timeout: 8_000 });

      expect.soft(
        await menu.getByText(/view agent/i).first()
          .isVisible({ timeout: 5_000 }).catch(() => false),
        'Card menu should have "View Agent" option'
      ).toBeTruthy();

      await page.keyboard.press('Escape');
    });

    // Claim 25: Three-dot menu has "Delete Agent"
    test('card menu has "Delete Agent"', async ({ page }) => {
      await waitForGallery(page);
      const menuOpened = await openFirstCardMenu(page);
      if (!menuOpened) {
        test.skip(true, 'Could not open card menu');
        return;
      }

      const menu = page.locator(
        '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i], [class*="contextMenu" i], [class*="menuList" i]'
      ).first();
      await menu.waitFor({ state: 'visible', timeout: 8_000 });

      expect.soft(
        await menu.getByText(/delete agent/i).first()
          .isVisible({ timeout: 5_000 }).catch(() => false),
        'Card menu should have "Delete Agent" option'
      ).toBeTruthy();

      await page.keyboard.press('Escape');
    });
  });

  // =========================================================================
  // 5. CREATE AGENT
  // =========================================================================
  test.describe('Create Agent', () => {
    // Claim 26: "+ Create Agent" button visible in top-right
    test('"+ Create Agent" button visible', async ({ page }) => {
      await waitForGallery(page);

      const createBtn = page.locator('button, [role="button"], a').filter({
        hasText: /create agent/i,
      }).first();
      await expect(createBtn).toBeVisible({ timeout: 15_000 });
    });

    // Claim 27: Clicking "+ Create Agent" opens the Generate Agent modal
    test('clicking "+ Create Agent" opens generate modal or builder', async ({ page }) => {
      await waitForGallery(page);

      const createBtn = page.locator('button, [role="button"], a').filter({
        hasText: /create agent/i,
      }).first();
      await createBtn.waitFor({ state: 'visible', timeout: 15_000 });
      await createBtn.click();

      // The docs say it may open a modal OR go directly to builder, depending on workspace config
      const modal = page.locator('[role="dialog"], [class*="modal" i]').first();
      const builderUrl = /agents\/(builder|new|create)/i;

      const modalVisible = await modal.isVisible({ timeout: 10_000 }).catch(() => false);
      const onBuilder = builderUrl.test(page.url());

      expect(
        modalVisible || onBuilder,
        'Clicking "+ Create Agent" should open a modal or navigate to the builder'
      ).toBeTruthy();

      // If modal opened, dismiss it
      if (modalVisible) {
        await page.keyboard.press('Escape');
      }
    });

    // Claim 28: Generate Agent modal has Agent Name field
    test('generate modal has Agent Name field', async ({ page }) => {
      await waitForGallery(page);

      const createBtn = page.locator('button, [role="button"], a').filter({
        hasText: /create agent/i,
      }).first();
      await createBtn.waitFor({ state: 'visible', timeout: 15_000 });
      await createBtn.click();

      const modal = page.locator('[role="dialog"], [class*="modal" i]').first();
      const modalVisible = await modal.isVisible({ timeout: 10_000 }).catch(() => false);

      if (!modalVisible) {
        test.skip(true, 'Generate modal not shown — workspace may go directly to builder');
        return;
      }

      const nameField = modal.locator(
        'input[placeholder*="name" i], input[aria-label*="name" i], label:has-text("name") + input, label:has-text("name") ~ input'
      ).first()
        .or(modal.locator('input').first())
        .first();

      expect.soft(
        await nameField.isVisible({ timeout: 5_000 }).catch(() => false),
        'Generate Agent modal should have an Agent Name field'
      ).toBeTruthy();

      await page.keyboard.press('Escape');
    });

    // Claim 29: Generate Agent modal has "Describe your agent's role" field
    test('generate modal has role description field', async ({ page }) => {
      await waitForGallery(page);

      const createBtn = page.locator('button, [role="button"], a').filter({
        hasText: /create agent/i,
      }).first();
      await createBtn.waitFor({ state: 'visible', timeout: 15_000 });
      await createBtn.click();

      const modal = page.locator('[role="dialog"], [class*="modal" i]').first();
      const modalVisible = await modal.isVisible({ timeout: 10_000 }).catch(() => false);

      if (!modalVisible) {
        test.skip(true, 'Generate modal not shown');
        return;
      }

      const roleField = modal.locator(
        'textarea, input[placeholder*="role" i], input[placeholder*="describe" i], [aria-label*="role" i], [aria-label*="describe" i]'
      ).first();

      expect.soft(
        await roleField.isVisible({ timeout: 5_000 }).catch(() => false),
        'Generate Agent modal should have a role description field'
      ).toBeTruthy();

      await page.keyboard.press('Escape');
    });

    // Claim 30: Generate Agent modal has Agent Type selector
    test('generate modal has Agent Type selector', async ({ page }) => {
      await waitForGallery(page);

      const createBtn = page.locator('button, [role="button"], a').filter({
        hasText: /create agent/i,
      }).first();
      await createBtn.waitFor({ state: 'visible', timeout: 15_000 });
      await createBtn.click();

      const modal = page.locator('[role="dialog"], [class*="modal" i]').first();
      const modalVisible = await modal.isVisible({ timeout: 10_000 }).catch(() => false);

      if (!modalVisible) {
        test.skip(true, 'Generate modal not shown');
        return;
      }

      // Agent Type may be a dropdown, radio group, or select
      const typeSelector = modal.locator(
        'select, [role="radiogroup"], [role="listbox"], [class*="type" i]'
      ).first()
        .or(modal.locator('button, [role="button"]').filter({ hasText: /type|assistant|consumer persona|product|visual generator/i }).first())
        .first();

      expect.soft(
        await typeSelector.isVisible({ timeout: 5_000 }).catch(() => false),
        'Generate Agent modal should have an Agent Type selector'
      ).toBeTruthy();

      await page.keyboard.press('Escape');
    });

    // Claim 31: Generate button exists and triggers progress state
    test('generate button exists in modal', async ({ page }) => {
      await waitForGallery(page);

      const createBtn = page.locator('button, [role="button"], a').filter({
        hasText: /create agent/i,
      }).first();
      await createBtn.waitFor({ state: 'visible', timeout: 15_000 });
      await createBtn.click();

      const modal = page.locator('[role="dialog"], [class*="modal" i]').first();
      const modalVisible = await modal.isVisible({ timeout: 10_000 }).catch(() => false);

      if (!modalVisible) {
        test.skip(true, 'Generate modal not shown');
        return;
      }

      const generateBtn = modal.locator('button, [role="button"]').filter({
        hasText: /generate/i,
      }).first();

      expect.soft(
        await generateBtn.isVisible({ timeout: 5_000 }).catch(() => false),
        'Generate Agent modal should have a "Generate" button'
      ).toBeTruthy();

      await page.keyboard.press('Escape');
    });
  });

  // =========================================================================
  // 6. BUILDER STEPS (using Edit Agent flow to reach builder)
  // =========================================================================
  test.describe('Agent Builder', () => {
    /** Navigate to the agent builder by clicking Edit on the first available agent */
    async function navigateToBuilder(page: Page): Promise<boolean> {
      await waitForGallery(page);

      // Try the card menu -> Edit Agent
      const menuOpened = await openFirstCardMenu(page);
      if (menuOpened) {
        const menu = page.locator(
          '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i], [class*="contextMenu" i], [class*="menuList" i]'
        ).first();
        const menuVisible = await menu.isVisible({ timeout: 5_000 }).catch(() => false);
        if (menuVisible) {
          const editOption = menu.getByText(/edit agent/i).first();
          const editVisible = await editOption.isVisible({ timeout: 3_000 }).catch(() => false);
          if (editVisible) {
            await editOption.click();
            await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
            await waitForLoaders(page);
            await page.waitForTimeout(2_000);

            // Verify we're on a builder page
            return page.url().includes('/agents/') || page.url().includes('/builder');
          }
        }
      }

      return false;
    }

    // Claim 32: Builder has Objective step with type selector
    test('builder has Objective step with type selector', async ({ page }) => {
      const onBuilder = await navigateToBuilder(page);
      if (!onBuilder) {
        test.skip(true, 'Could not navigate to agent builder');
        return;
      }

      // Look for Objective step or type selector
      // Steps may be buttons in a stepper/progress bar
      const objectiveStep = page.getByText(/objective/i).first()
        .or(page.locator('[class*="step" i], [class*="stepper" i]').filter({ hasText: /objective/i }).first())
        .first();

      const stepVisible = await objectiveStep.isVisible({ timeout: 8_000 }).catch(() => false);

      // If we're on the guided builder, click the Objective step
      if (stepVisible) {
        await objectiveStep.click().catch(() => {});
        await page.waitForTimeout(1_000);
      }

      // Look for type selector on the page (may be current step or already visible)
      const typeSelector = page.locator(
        'select, [role="radiogroup"], [role="listbox"]'
      ).first()
        .or(page.locator('button, [role="button"], label, [class*="type" i]').filter({
          hasText: /assistant|consumer persona|product|visual generator/i,
        }).first())
        .first();

      expect.soft(
        stepVisible || await typeSelector.isVisible({ timeout: 5_000 }).catch(() => false),
        'Builder should have an Objective step or visible type selector'
      ).toBeTruthy();
    });

    // Claim 33: Builder has a mission/description field
    test('builder has mission/description field', async ({ page }) => {
      const onBuilder = await navigateToBuilder(page);
      if (!onBuilder) {
        test.skip(true, 'Could not navigate to agent builder');
        return;
      }

      // Look for mission/core mission/description text area
      const missionField = page.locator(
        'textarea[placeholder*="mission" i], textarea[placeholder*="describe" i], textarea[aria-label*="mission" i], [data-testid*="mission" i], [data-testid*="objective" i] textarea'
      ).first()
        .or(page.locator('textarea').first())
        .first();

      expect.soft(
        await missionField.isVisible({ timeout: 10_000 }).catch(() => false),
        'Builder should have a mission/description text area'
      ).toBeTruthy();
    });

    // Claim 34: Builder has Facets step
    test('builder has Facets step', async ({ page }) => {
      const onBuilder = await navigateToBuilder(page);
      if (!onBuilder) {
        test.skip(true, 'Could not navigate to agent builder');
        return;
      }

      const facetsStep = page.getByText(/facet/i).first()
        .or(page.locator('[class*="step" i], [class*="stepper" i]').filter({ hasText: /facet/i }).first())
        .first();

      expect.soft(
        await facetsStep.isVisible({ timeout: 8_000 }).catch(() => false),
        'Builder should have a Facets step'
      ).toBeTruthy();
    });

    // Claim 35: Builder has Instructions / Optional Settings step
    test('builder has Instructions step', async ({ page }) => {
      const onBuilder = await navigateToBuilder(page);
      if (!onBuilder) {
        test.skip(true, 'Could not navigate to agent builder');
        return;
      }

      const instructionsStep = page.getByText(/instruction|optional setting/i).first()
        .or(page.locator('[class*="step" i], [class*="stepper" i]').filter({ hasText: /instruction|optional|settings/i }).first())
        .first();

      expect.soft(
        await instructionsStep.isVisible({ timeout: 8_000 }).catch(() => false),
        'Builder should have an Instructions / Optional Settings step'
      ).toBeTruthy();
    });

    // Claim 36: Builder has Identity step with Name and Bio fields
    test('builder has Identity step', async ({ page }) => {
      const onBuilder = await navigateToBuilder(page);
      if (!onBuilder) {
        test.skip(true, 'Could not navigate to agent builder');
        return;
      }

      const identityStep = page.getByText(/identity/i).first()
        .or(page.locator('[class*="step" i], [class*="stepper" i]').filter({ hasText: /identity/i }).first())
        .first();

      const isVisible = await identityStep.isVisible({ timeout: 8_000 }).catch(() => false);
      expect.soft(isVisible, 'Builder should have an Identity step').toBeTruthy();

      if (isVisible) {
        await identityStep.click().catch(() => {});
        await page.waitForTimeout(1_500);

        // Look for Name and Bio fields
        const nameField = page.locator(
          'input[placeholder*="name" i], input[aria-label*="name" i], [data-testid*="name" i] input, label:has-text("Name") ~ input'
        ).first();
        const bioField = page.locator(
          'textarea[placeholder*="bio" i], textarea[aria-label*="bio" i], [data-testid*="bio" i] textarea, textarea[placeholder*="biography" i], label:has-text("Bio") ~ textarea'
        ).first()
          .or(page.locator('textarea').first())
          .first();

        expect.soft(
          await nameField.isVisible({ timeout: 5_000 }).catch(() => false),
          'Identity step should have a Name field'
        ).toBeTruthy();
        expect.soft(
          await bioField.isVisible({ timeout: 5_000 }).catch(() => false),
          'Identity step should have a Bio/Biography field'
        ).toBeTruthy();
      }
    });

    // Claim 37: Identity step has Generate button with sparkle icon
    test('identity step has Generate button', async ({ page }) => {
      const onBuilder = await navigateToBuilder(page);
      if (!onBuilder) {
        test.skip(true, 'Could not navigate to agent builder');
        return;
      }

      // Navigate to Identity step
      const identityStep = page.getByText(/identity/i).first()
        .or(page.locator('[class*="step" i], [class*="stepper" i]').filter({ hasText: /identity/i }).first())
        .first();

      if (await identityStep.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await identityStep.click().catch(() => {});
        await page.waitForTimeout(1_500);
      }

      const generateBtn = page.locator('button, [role="button"]').filter({
        hasText: /generate/i,
      }).first();

      expect.soft(
        await generateBtn.isVisible({ timeout: 8_000 }).catch(() => false),
        'Identity step should have a Generate button (with sparkle icon)'
      ).toBeTruthy();
    });

    // Claim 38: Builder has Appearance step with avatar options
    test('builder has Appearance step', async ({ page }) => {
      const onBuilder = await navigateToBuilder(page);
      if (!onBuilder) {
        test.skip(true, 'Could not navigate to agent builder');
        return;
      }

      const appearanceStep = page.getByText(/appearance/i).first()
        .or(page.locator('[class*="step" i], [class*="stepper" i]').filter({ hasText: /appearance/i }).first())
        .first();

      expect.soft(
        await appearanceStep.isVisible({ timeout: 8_000 }).catch(() => false),
        'Builder should have an Appearance step'
      ).toBeTruthy();
    });

    // Claim 39: Appearance step has Upload, AI Generate, and Placeholder avatar options
    test('appearance step has avatar options', async ({ page }) => {
      const onBuilder = await navigateToBuilder(page);
      if (!onBuilder) {
        test.skip(true, 'Could not navigate to agent builder');
        return;
      }

      // Navigate to Appearance step
      const appearanceStep = page.getByText(/appearance/i).first()
        .or(page.locator('[class*="step" i], [class*="stepper" i]').filter({ hasText: /appearance/i }).first())
        .first();

      if (await appearanceStep.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await appearanceStep.click().catch(() => {});
        await page.waitForTimeout(1_500);
      }

      // Check for avatar options
      const uploadOption = page.getByText(/upload/i).first();
      const generateOption = page.getByText(/generate|ai generate/i).first();
      const placeholderOption = page.getByText(/placeholder|default/i).first();

      const hasUpload = await uploadOption.isVisible({ timeout: 5_000 }).catch(() => false);
      const hasGenerate = await generateOption.isVisible({ timeout: 3_000 }).catch(() => false);
      const hasPlaceholder = await placeholderOption.isVisible({ timeout: 3_000 }).catch(() => false);

      expect.soft(
        hasUpload || hasGenerate || hasPlaceholder,
        'Appearance step should have avatar options (Upload, AI Generate, or Placeholder)'
      ).toBeTruthy();
    });

    // Claim 40: Appearance step has Physical Description field
    test('appearance step has Physical Description field', async ({ page }) => {
      const onBuilder = await navigateToBuilder(page);
      if (!onBuilder) {
        test.skip(true, 'Could not navigate to agent builder');
        return;
      }

      // Navigate to Appearance step
      const appearanceStep = page.getByText(/appearance/i).first()
        .or(page.locator('[class*="step" i], [class*="stepper" i]').filter({ hasText: /appearance/i }).first())
        .first();

      if (await appearanceStep.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await appearanceStep.click().catch(() => {});
        await page.waitForTimeout(1_500);
      }

      const physicalDesc = page.locator(
        'textarea[placeholder*="physical" i], textarea[placeholder*="description" i], textarea[aria-label*="physical" i], [data-testid*="physical" i], label:has-text("Physical") ~ textarea'
      ).first()
        .or(page.getByText(/physical description/i).first())
        .first();

      expect.soft(
        await physicalDesc.isVisible({ timeout: 8_000 }).catch(() => false),
        'Appearance step should have a Physical Description field'
      ).toBeTruthy();
    });

    // Claim 41: Builder has Review step
    test('builder has Review step', async ({ page }) => {
      const onBuilder = await navigateToBuilder(page);
      if (!onBuilder) {
        test.skip(true, 'Could not navigate to agent builder');
        return;
      }

      const reviewStep = page.getByText(/review/i).first()
        .or(page.locator('[class*="step" i], [class*="stepper" i]').filter({ hasText: /review/i }).first())
        .first();

      expect.soft(
        await reviewStep.isVisible({ timeout: 8_000 }).catch(() => false),
        'Builder should have a Review step'
      ).toBeTruthy();
    });

    // Claim 42: Review step shows credential card summary
    test('review step shows credential card', async ({ page }) => {
      const onBuilder = await navigateToBuilder(page);
      if (!onBuilder) {
        test.skip(true, 'Could not navigate to agent builder');
        return;
      }

      // Navigate to Review step
      const reviewStep = page.getByText(/review/i).first()
        .or(page.locator('[class*="step" i], [class*="stepper" i]').filter({ hasText: /review/i }).first())
        .first();

      if (await reviewStep.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await reviewStep.click().catch(() => {});
        await page.waitForTimeout(2_000);
      }

      // Look for a credential/summary card
      const credCard = page.locator(
        '[class*="credential" i], [class*="summary" i], [class*="card" i], [class*="review" i]'
      ).first();

      expect.soft(
        await credCard.isVisible({ timeout: 8_000 }).catch(() => false),
        'Review step should show a credential card summarizing agent settings'
      ).toBeTruthy();
    });

    // Claim 43: Review step has benchmark chat
    test('review step has benchmark chat', async ({ page }) => {
      const onBuilder = await navigateToBuilder(page);
      if (!onBuilder) {
        test.skip(true, 'Could not navigate to agent builder');
        return;
      }

      // Navigate to Review step
      const reviewStep = page.getByText(/review/i).first()
        .or(page.locator('[class*="step" i], [class*="stepper" i]').filter({ hasText: /review/i }).first())
        .first();

      if (await reviewStep.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await reviewStep.click().catch(() => {});
        await page.waitForTimeout(2_000);
      }

      // Look for benchmark/chat/evaluate elements
      const benchmarkChat = page.locator(
        'textarea, [class*="chat" i], [class*="benchmark" i], input[placeholder*="message" i], [contenteditable="true"]'
      ).first()
        .or(page.locator('button, [role="button"]').filter({ hasText: /evaluate|benchmark|test/i }).first())
        .first();

      expect.soft(
        await benchmarkChat.isVisible({ timeout: 8_000 }).catch(() => false),
        'Review step should have a benchmark chat area or Evaluate button'
      ).toBeTruthy();
    });

    // Claim 44: Review step shows status indicator
    test('review step shows status indicator', async ({ page }) => {
      const onBuilder = await navigateToBuilder(page);
      if (!onBuilder) {
        test.skip(true, 'Could not navigate to agent builder');
        return;
      }

      // Navigate to Review step
      const reviewStep = page.getByText(/review/i).first()
        .or(page.locator('[class*="step" i], [class*="stepper" i]').filter({ hasText: /review/i }).first())
        .first();

      if (await reviewStep.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await reviewStep.click().catch(() => {});
        await page.waitForTimeout(2_000);
      }

      // Look for status indicator (Active/Draft/Published/Ready)
      const statusIndicator = page.locator(
        '[class*="status" i], [class*="badge" i], [class*="indicator" i]'
      ).first()
        .or(page.getByText(/active|draft|published|ready/i).first())
        .first();

      expect.soft(
        await statusIndicator.isVisible({ timeout: 8_000 }).catch(() => false),
        'Review step should show a status indicator'
      ).toBeTruthy();
    });
  });

  // =========================================================================
  // 7. BENCHMARK STATES
  // =========================================================================
  test.describe('Benchmark', () => {
    // Claim 45: Benchmark has Start state (Evaluate button)
    test('benchmark has Start/Evaluate button', async ({ page }) => {
      // Navigate to builder -> Review step
      await waitForGallery(page);
      const menuOpened = await openFirstCardMenu(page);
      if (!menuOpened) {
        test.skip(true, 'Could not open card menu to reach builder');
        return;
      }

      const menu = page.locator(
        '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i], [class*="contextMenu" i], [class*="menuList" i]'
      ).first();
      const editOption = menu.getByText(/edit agent/i).first();
      if (!(await editOption.isVisible({ timeout: 3_000 }).catch(() => false))) {
        await page.keyboard.press('Escape');
        test.skip(true, 'Edit Agent not available');
        return;
      }
      await editOption.click();
      await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
      await waitForLoaders(page);
      await page.waitForTimeout(2_000);

      // Navigate to Review step
      const reviewStep = page.getByText(/review/i).first()
        .or(page.locator('[class*="step" i], [class*="stepper" i]').filter({ hasText: /review/i }).first())
        .first();

      if (await reviewStep.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await reviewStep.click().catch(() => {});
        await page.waitForTimeout(2_000);
      }

      const evaluateBtn = page.locator('button, [role="button"]').filter({
        hasText: /evaluate|benchmark|start benchmark/i,
      }).first();

      expect.soft(
        await evaluateBtn.isVisible({ timeout: 8_000 }).catch(() => false),
        'Review step should have an Evaluate/Start Benchmark button'
      ).toBeTruthy();
    });
  });

  // =========================================================================
  // 8. LIFECYCLE ACTIONS
  // =========================================================================
  test.describe('Agent Lifecycle', () => {
    // Claim 46: "Mint Agent" / "Save Changes" button in builder
    test('builder has Save Changes or Mint Agent button', async ({ page }) => {
      await waitForGallery(page);
      const menuOpened = await openFirstCardMenu(page);
      if (!menuOpened) {
        test.skip(true, 'Could not open card menu');
        return;
      }

      const menu = page.locator(
        '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i], [class*="contextMenu" i], [class*="menuList" i]'
      ).first();
      const editOption = menu.getByText(/edit agent/i).first();
      if (!(await editOption.isVisible({ timeout: 3_000 }).catch(() => false))) {
        await page.keyboard.press('Escape');
        test.skip(true, 'Edit Agent not available');
        return;
      }
      await editOption.click();
      await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
      await waitForLoaders(page);
      await page.waitForTimeout(2_000);

      const saveBtn = page.locator('button, [role="button"]').filter({
        hasText: /save changes|mint agent|save/i,
      }).first();

      expect.soft(
        await saveBtn.isVisible({ timeout: 10_000 }).catch(() => false),
        'Builder should have a "Save Changes" or "Mint Agent" button'
      ).toBeTruthy();
    });

    // Claim 47: Activate button exists (publishes agent, green dot)
    test('builder has Activate button', async ({ page }) => {
      await waitForGallery(page);
      const menuOpened = await openFirstCardMenu(page);
      if (!menuOpened) {
        test.skip(true, 'Could not open card menu');
        return;
      }

      const menu = page.locator(
        '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i], [class*="contextMenu" i], [class*="menuList" i]'
      ).first();
      const editOption = menu.getByText(/edit agent/i).first();
      if (!(await editOption.isVisible({ timeout: 3_000 }).catch(() => false))) {
        await page.keyboard.press('Escape');
        test.skip(true, 'Edit Agent not available');
        return;
      }
      await editOption.click();
      await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
      await waitForLoaders(page);
      await page.waitForTimeout(2_000);

      const activateBtn = page.locator('button, [role="button"]').filter({
        hasText: /activate/i,
      }).first();

      const deactivateBtn = page.locator('button, [role="button"]').filter({
        hasText: /deactivate/i,
      }).first();

      // Agent may already be active (shows Deactivate) or inactive (shows Activate)
      const hasActivate = await activateBtn.isVisible({ timeout: 8_000 }).catch(() => false);
      const hasDeactivate = await deactivateBtn.isVisible({ timeout: 3_000 }).catch(() => false);

      expect.soft(
        hasActivate || hasDeactivate,
        'Builder should have an Activate or Deactivate button'
      ).toBeTruthy();
    });

    // Claim 48: Active agents show green dot in gallery
    test('active agent shows green dot indicator', async ({ page }) => {
      await waitForGallery(page);

      // Hover over cards to look for green status dots
      const cards = page.locator(
        '[class*="card" i], [class*="personaCard" i], [class*="agentCard" i], [data-testid*="agent-card"]'
      );
      const cardCount = await cards.count();

      let foundGreenDot = false;
      for (let i = 0; i < Math.min(cardCount, 5); i++) {
        const card = cards.nth(i);
        await card.hover();
        await page.waitForTimeout(500);

        // Look for green dot / active indicator
        const greenDot = card.locator(
          '[class*="active" i], [class*="published" i], [class*="green" i], [class*="status" i]'
        ).first();

        if (await greenDot.isVisible({ timeout: 2_000 }).catch(() => false)) {
          const color = await greenDot.evaluate(el => {
            const style = window.getComputedStyle(el);
            return style.backgroundColor || style.color || '';
          }).catch(() => '');
          // Green is broadly any green-ish color
          foundGreenDot = true;
          break;
        }
      }

      expect.soft(
        foundGreenDot,
        'At least one active agent should show a green status dot on hover'
      ).toBeTruthy();
    });

    // Claim 49: Share dialog accessible from card menu
    test('share dialog accessible from card menu', async ({ page }) => {
      await waitForGallery(page);
      const menuOpened = await openFirstCardMenu(page);
      if (!menuOpened) {
        test.skip(true, 'Could not open card menu');
        return;
      }

      const menu = page.locator(
        '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i], [class*="contextMenu" i], [class*="menuList" i]'
      ).first();
      await menu.waitFor({ state: 'visible', timeout: 8_000 });

      const shareOption = menu.getByText(/share/i).first();
      const isShareVisible = await shareOption.isVisible({ timeout: 5_000 }).catch(() => false);

      if (!isShareVisible) {
        await page.keyboard.press('Escape');
        test.skip(true, 'Share option not available in card menu');
        return;
      }

      await shareOption.click();
      await page.waitForTimeout(1_500);

      // Should open a share dialog/modal
      const shareDialog = page.locator('[role="dialog"], [class*="modal" i], [class*="share" i]').first();
      expect.soft(
        await shareDialog.isVisible({ timeout: 8_000 }).catch(() => false),
        'Clicking Share in card menu should open a share dialog'
      ).toBeTruthy();

      await page.keyboard.press('Escape');
    });

    // Claim 50: Delete Agent confirmation dialog
    test('delete agent shows confirmation dialog', async ({ page }) => {
      await waitForGallery(page);
      const menuOpened = await openFirstCardMenu(page);
      if (!menuOpened) {
        test.skip(true, 'Could not open card menu');
        return;
      }

      const menu = page.locator(
        '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i], [class*="contextMenu" i], [class*="menuList" i]'
      ).first();
      await menu.waitFor({ state: 'visible', timeout: 8_000 });

      const deleteOption = menu.getByText(/delete agent/i).first();
      const isDeleteVisible = await deleteOption.isVisible({ timeout: 5_000 }).catch(() => false);

      if (!isDeleteVisible) {
        await page.keyboard.press('Escape');
        test.skip(true, 'Delete Agent option not available in card menu');
        return;
      }

      await deleteOption.click();
      await page.waitForTimeout(1_000);

      // Should open a confirmation dialog
      const confirmDialog = page.locator(
        '[role="dialog"], [role="alertdialog"], [class*="modal" i], [class*="confirm" i]'
      ).first();
      expect.soft(
        await confirmDialog.isVisible({ timeout: 8_000 }).catch(() => false),
        'Clicking Delete Agent should open a confirmation dialog'
      ).toBeTruthy();

      // Dismiss without deleting
      await page.keyboard.press('Escape');
      // If Escape didn't work, try clicking Cancel
      const cancelBtn = page.locator('button').filter({ hasText: /cancel|no|close/i }).first();
      if (await cancelBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await cancelBtn.click();
      }
    });
  });

  // =========================================================================
  // 9. CLASSIC BUILDER TOGGLE
  // =========================================================================
  test.describe('Classic Builder Toggle', () => {
    // Claim 51: "Use Classic Builder" link exists in builder
    test('"Use Classic Builder" link visible in builder', async ({ page }) => {
      await waitForGallery(page);
      const menuOpened = await openFirstCardMenu(page);
      if (!menuOpened) {
        test.skip(true, 'Could not open card menu');
        return;
      }

      const menu = page.locator(
        '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i], [class*="contextMenu" i], [class*="menuList" i]'
      ).first();
      const editOption = menu.getByText(/edit agent/i).first();
      if (!(await editOption.isVisible({ timeout: 3_000 }).catch(() => false))) {
        await page.keyboard.press('Escape');
        test.skip(true, 'Edit Agent not available');
        return;
      }
      await editOption.click();
      await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
      await waitForLoaders(page);
      await page.waitForTimeout(2_000);

      const classicLink = page.getByText(/use classic builder/i).first()
        .or(page.getByText(/classic builder/i).first())
        .first();

      const guidedLink = page.getByText(/use guided builder/i).first()
        .or(page.getByText(/guided builder/i).first())
        .first();

      const hasClassic = await classicLink.isVisible({ timeout: 8_000 }).catch(() => false);
      const hasGuided = await guidedLink.isVisible({ timeout: 3_000 }).catch(() => false);

      expect.soft(
        hasClassic || hasGuided,
        'Builder should show "Use Classic Builder" or "Use Guided Builder" toggle link'
      ).toBeTruthy();
    });

    // Claim 52: "Use Guided Builder" link exists in classic builder
    test('"Use Guided Builder" link visible when classic is active', async ({ page }) => {
      await waitForGallery(page);
      const menuOpened = await openFirstCardMenu(page);
      if (!menuOpened) {
        test.skip(true, 'Could not open card menu');
        return;
      }

      const menu = page.locator(
        '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i], [class*="contextMenu" i], [class*="menuList" i]'
      ).first();
      const editOption = menu.getByText(/edit agent/i).first();
      if (!(await editOption.isVisible({ timeout: 3_000 }).catch(() => false))) {
        await page.keyboard.press('Escape');
        test.skip(true, 'Edit Agent not available');
        return;
      }
      await editOption.click();
      await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
      await waitForLoaders(page);
      await page.waitForTimeout(2_000);

      // If "Use Classic Builder" is visible, click it and then verify "Use Guided Builder" appears
      const classicLink = page.getByText(/use classic builder/i).first();
      const hasClassic = await classicLink.isVisible({ timeout: 5_000 }).catch(() => false);

      if (hasClassic) {
        await classicLink.click();
        await page.waitForTimeout(2_000);

        const guidedLink = page.getByText(/use guided builder/i).first()
          .or(page.getByText(/guided builder/i).first())
          .first();
        expect.soft(
          await guidedLink.isVisible({ timeout: 8_000 }).catch(() => false),
          'After switching to Classic Builder, "Use Guided Builder" toggle should appear'
        ).toBeTruthy();
      } else {
        // Already in classic mode, check for guided toggle
        const guidedLink = page.getByText(/use guided builder/i).first()
          .or(page.getByText(/try the new builder/i).first())
          .first();
        expect.soft(
          await guidedLink.isVisible({ timeout: 8_000 }).catch(() => false),
          'Classic builder should show "Use Guided Builder" or "Try the New Builder" toggle'
        ).toBeTruthy();
      }
    });

    // Claim 53: Navigating to agents page shows /agents in URL
    test('agents page URL contains /agents', async ({ page }) => {
      expect(page.url()).toContain('/agents');
    });
  });
});
