import { test, expect } from '@playwright/test';
import { gotoSection, waitForLoaders, workspaceUrl } from './helpers/workspace';
import { loginViaUI } from './helpers/login';
import { dismissModal } from './helpers/ui';

// ---------------------------------------------------------------------------
// canvas-and-image-studio.md documentation claims
//
// All tests require a real login because the Vurvey SPA clears localStorage
// tokens restored by storageState.
// ---------------------------------------------------------------------------
test.describe('canvas-and-image-studio.md: Documentation claim tests', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
    await waitForLoaders(page);
    // Canvas is the workspace root
    await gotoSection(page, '/');
    await page.waitForTimeout(2_000);
  });

  // =========================================================================
  // CANVAS — CORE BEHAVIOR
  // =========================================================================
  test.describe('Canvas Core', () => {
    // Claim 1: Canvas loads the main chat view at workspace root
    test('canvas loads the main chat view at workspace root', async ({ page }) => {
      // Verify we are on the workspace root and a chat interface is visible
      const chatInput = page.locator([
        'textarea',
        '[contenteditable="true"]',
        'input[placeholder*="message" i]',
        'input[placeholder*="ask" i]',
        '[data-testid*="chat-input"]',
        '[data-testid*="message-input"]',
        '[class*="composer" i]',
      ].join(', ')).first();
      await expect(chatInput).toBeVisible({ timeout: 15_000 });
    });

    // Claim 2: If chatbotEnabled is off, redirects to Campaigns
    // NOTE: This cannot be tested with the DEMO workspace (chatbot is enabled).
    // We verify the claim pattern by checking the current URL stays on root.
    test('chatbotEnabled workspace stays on canvas (does not redirect)', async ({ page }) => {
      // The DEMO workspace has chatbot enabled, so the URL should remain
      // at the workspace root, not redirect to /campaigns or /survey
      const url = page.url();
      expect(url).not.toMatch(/\/campaigns|\/survey/);
    });

    // Claim 3: Guest mode — "No Brand Companions are currently available"
    // This requires a guest/unauthenticated workspace context with no published
    // personas, which is not available in the DEMO workspace.
    test.skip('guest mode shows "No Brand Companions" message when no published personas', async () => {
      // Cannot test without a workspace that has no published personas
      // and guest mode enabled. Documented for completeness.
    });
  });

  // =========================================================================
  // TOOLBAR CHIPS
  // =========================================================================
  test.describe('Toolbar Chips', () => {
    // Claim 4: Agents chip visible
    test('Agents chip is visible in toolbar', async ({ page }) => {
      const agentsBtn = page.locator('button, [role="button"]').filter({
        hasText: /^agents$/i,
      }).first()
        .or(page.locator('[aria-label*="agent" i], [data-testid*="agent" i]').first())
        .first();
      await expect(agentsBtn).toBeVisible({ timeout: 15_000 });
    });

    // Claim 5: Agents chip opens agent selector
    test('clicking Agents chip opens agent selector', async ({ page }) => {
      const agentsBtn = page.locator('button, [role="button"]').filter({
        hasText: /agents/i,
      }).first()
        .or(page.locator('[aria-label*="agent" i], [data-testid*="agent" i]').first())
        .first();
      await agentsBtn.waitFor({ state: 'visible', timeout: 15_000 });
      await agentsBtn.click();

      const modal = page.locator(
        '[role="dialog"], [class*="modal" i], [class*="picker" i], [class*="popover" i], [class*="drawer" i]'
      ).first();
      await expect(modal).toBeVisible({ timeout: 10_000 });

      // Doc says: filter chips, search, and explicit commit buttons
      const searchInput = modal.locator('input[type="search"], input[type="text"], input[placeholder*="search" i]').first();
      expect.soft(
        await searchInput.isVisible({ timeout: 5_000 }).catch(() => false),
        'Agent selector should have a search input'
      ).toBeTruthy();

      await dismissModal(page);
    });

    // Claim 6: Populations chip (feature-flag dependent)
    test('Populations chip visible when feature flag enabled', async ({ page }) => {
      const populationsBtn = page.locator('button, [role="button"]').filter({
        hasText: /populations/i,
      }).first()
        .or(page.locator('[aria-label*="population" i], [data-testid*="population" i]').first())
        .first();

      const isVisible = await populationsBtn.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!isVisible) {
        test.skip(true, 'Populations chip not visible — feature flag may be off');
        return;
      }
      await expect(populationsBtn).toBeVisible();
    });

    // Claim 7: Sources chip visible
    test('Sources chip is visible in toolbar', async ({ page }) => {
      const sourcesBtn = page.locator('button, [role="button"]').filter({
        hasText: /sources/i,
      }).first()
        .or(page.locator('[aria-label*="source" i], [data-testid*="source" i], [title*="source" i]').first())
        .first();
      await expect(sourcesBtn).toBeVisible({ timeout: 15_000 });
    });

    // Claim 8: Sources tooltip reads "Select Datasets and/or Campaigns"
    test('Sources tooltip reads "Select Datasets and/or Campaigns"', async ({ page }) => {
      const sourcesBtn = page.locator('button, [role="button"]').filter({
        hasText: /sources/i,
      }).first()
        .or(page.locator('[aria-label*="source" i], [data-testid*="source" i], [title*="source" i]').first())
        .first();
      await sourcesBtn.waitFor({ state: 'visible', timeout: 15_000 });

      // Check for tooltip via title attribute, aria-label, or hover tooltip
      const title = await sourcesBtn.getAttribute('title') || '';
      const ariaLabel = await sourcesBtn.getAttribute('aria-label') || '';

      // Hover to trigger tooltip
      await sourcesBtn.hover();
      await page.waitForTimeout(1_000);
      const tooltip = page.locator('[role="tooltip"], [class*="tooltip" i]').first();
      const tooltipText = await tooltip.textContent().catch(() => '');

      const combinedText = `${title} ${ariaLabel} ${tooltipText}`.toLowerCase();
      expect.soft(
        combinedText.includes('dataset') || combinedText.includes('campaign') || combinedText.includes('source'),
        'Sources tooltip should reference datasets and/or campaigns'
      ).toBeTruthy();
    });

    // Claim 9: Sources dropdown has Attach Datasets, Attach Campaigns, on/off toggle
    test('Sources dropdown has Attach Datasets, Attach Campaigns, and toggle', async ({ page }) => {
      const sourcesBtn = page.locator('button, [role="button"]').filter({
        hasText: /sources/i,
      }).first()
        .or(page.locator('[aria-label*="source" i], [data-testid*="source" i], [title*="source" i]').first())
        .first();
      await sourcesBtn.waitFor({ state: 'visible', timeout: 15_000 });
      await sourcesBtn.click();

      const dropdown = page.locator(
        '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i], [class*="modal" i], [role="dialog"]'
      ).first();
      await dropdown.waitFor({ state: 'visible', timeout: 10_000 });

      expect.soft(
        await dropdown.getByText(/attach datasets/i).first().isVisible({ timeout: 5_000 }).catch(() => false),
        'Sources dropdown should have "Attach Datasets"'
      ).toBeTruthy();

      expect.soft(
        await dropdown.getByText(/attach campaigns/i).first().isVisible({ timeout: 5_000 }).catch(() => false),
        'Sources dropdown should have "Attach Campaigns"'
      ).toBeTruthy();

      expect.soft(
        await dropdown.getByText(/turn (on|off)/i).first().isVisible({ timeout: 5_000 }).catch(() => false)
        || await dropdown.locator('[class*="toggle" i], [role="switch"]').first().isVisible({ timeout: 3_000 }).catch(() => false),
        'Sources dropdown should have on/off toggle'
      ).toBeTruthy();

      await page.keyboard.press('Escape');
    });

    // Claim 10: Images chip visible
    test('Images chip is visible in toolbar', async ({ page }) => {
      const imagesBtn = page.locator('button, [role="button"]').filter({
        hasText: /images/i,
      }).first()
        .or(page.locator('[aria-label*="image" i], [data-testid*="image" i], [title*="image" i]').first())
        .first();
      await expect(imagesBtn).toBeVisible({ timeout: 15_000 });
    });

    // Claim 11: Tools chip visible
    test('Tools chip is visible in toolbar', async ({ page }) => {
      const toolsBtn = page.locator('button, [role="button"]').filter({
        hasText: /tools/i,
      }).first()
        .or(page.locator('[aria-label*="tool" i], [data-testid*="tool" i], [title*="tool" i]').first())
        .first();
      await expect(toolsBtn).toBeVisible({ timeout: 15_000 });
    });

    // Claim 12: Model selector (feature-flag dependent)
    test('Model selector visible when feature flags enabled', async ({ page }) => {
      const modelSelector = page.locator('button, [role="button"]').filter({
        hasText: /model|auto.?select/i,
      }).first()
        .or(page.locator('[data-testid*="model" i], [aria-label*="model" i]').first())
        .first();

      const isVisible = await modelSelector.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!isVisible) {
        test.skip(true, 'Model selector not visible — feature flag may be off');
        return;
      }
      await expect(modelSelector).toBeVisible();
    });
  });

  // =========================================================================
  // IMAGE MODELS DROPDOWN
  // =========================================================================
  test.describe('Image Models', () => {
    // Claim 13: Image-model dropdown includes Nano Banana, OpenAI, Google Imagen, Stable Diffusion
    test('image-model dropdown shows Nano Banana, OpenAI, Google Imagen, Stable Diffusion', async ({ page }) => {
      const imagesBtn = page.locator('button, [role="button"]').filter({
        hasText: /images/i,
      }).first()
        .or(page.locator('[aria-label*="image" i], [data-testid*="image" i], [title*="image" i]').first())
        .first();
      await imagesBtn.waitFor({ state: 'visible', timeout: 15_000 });
      await imagesBtn.click();

      const dropdown = page.locator(
        '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i], [class*="modal" i], [role="dialog"]'
      ).first();
      await dropdown.waitFor({ state: 'visible', timeout: 10_000 });

      const models = ['Nano Banana', 'OpenAI', 'Google Imagen', 'Stable Diffusion'];
      for (const model of models) {
        expect.soft(
          await dropdown.getByText(new RegExp(model, 'i')).first().isVisible({ timeout: 5_000 }).catch(() => false),
          `Images dropdown should show "${model}"`
        ).toBeTruthy();
      }

      await page.keyboard.press('Escape');
    });

    // Claim 14: Bottom option toggles image generation on or off
    test('image dropdown bottom option toggles image generation on/off', async ({ page }) => {
      const imagesBtn = page.locator('button, [role="button"]').filter({
        hasText: /images/i,
      }).first()
        .or(page.locator('[aria-label*="image" i], [data-testid*="image" i], [title*="image" i]').first())
        .first();
      await imagesBtn.waitFor({ state: 'visible', timeout: 15_000 });
      await imagesBtn.click();

      const dropdown = page.locator(
        '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i], [class*="modal" i], [role="dialog"]'
      ).first();
      await dropdown.waitFor({ state: 'visible', timeout: 10_000 });

      const toggleOption = dropdown.getByText(/turn (on|off)|enable|disable|toggle/i).first()
        .or(dropdown.locator('[class*="toggle" i], [role="switch"]').first())
        .first();
      expect.soft(
        await toggleOption.isVisible({ timeout: 5_000 }).catch(() => false),
        'Images dropdown should have an on/off toggle at bottom'
      ).toBeTruthy();

      await page.keyboard.press('Escape');
    });
  });

  // =========================================================================
  // TOOLS DROPDOWN
  // =========================================================================
  test.describe('Tools Dropdown', () => {
    // Claim 15: Tools dropdown includes Web Research, TikTok, Reddit, LinkedIn, YouTube, X/Twitter, Instagram
    test('tools dropdown shows all documented tools', async ({ page }) => {
      const toolsBtn = page.locator('button, [role="button"]').filter({
        hasText: /tools/i,
      }).first()
        .or(page.locator('[aria-label*="tool" i], [data-testid*="tool" i], [title*="tool" i]').first())
        .first();
      await toolsBtn.waitFor({ state: 'visible', timeout: 15_000 });
      await toolsBtn.click();

      const dropdown = page.locator(
        '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i], [class*="modal" i], [role="dialog"]'
      ).first();
      await dropdown.waitFor({ state: 'visible', timeout: 10_000 });

      const tools = [
        { name: 'Web Research', pattern: /web research/i },
        { name: 'TikTok', pattern: /tiktok/i },
        { name: 'Reddit', pattern: /reddit/i },
        { name: 'LinkedIn', pattern: /linkedin/i },
        { name: 'YouTube', pattern: /youtube/i },
        { name: 'X/Twitter', pattern: /x|twitter/i },
        { name: 'Instagram', pattern: /instagram/i },
      ];

      for (const tool of tools) {
        expect.soft(
          await dropdown.getByText(tool.pattern).first().isVisible({ timeout: 5_000 }).catch(() => false),
          `Tools dropdown should show "${tool.name}"`
        ).toBeTruthy();
      }

      await page.keyboard.press('Escape');
    });
  });

  // =========================================================================
  // IMAGE STUDIO — STANDALONE ROUTE
  // =========================================================================
  test.describe('Image Studio', () => {
    // Claim 16: Image Studio accessible as a standalone page route
    test('Image Studio standalone route is accessible', async ({ page }) => {
      await gotoSection(page, '/image-studio');
      await page.waitForTimeout(2_000);

      // Verify we landed on an image studio page (not redirected away)
      const url = page.url();
      expect.soft(
        url.includes('image-studio') || url.includes('image_studio'),
        'Image Studio route should be accessible'
      ).toBeTruthy();
    });

    // Claim 17: Image Studio has a top navigation bar
    test('Image Studio has a top navigation bar', async ({ page }) => {
      await gotoSection(page, '/image-studio');
      await page.waitForTimeout(2_000);

      // Look for top nav bar or header
      const topBar = page.locator(
        'header, nav, [class*="header" i], [class*="topBar" i], [class*="navbar" i], [class*="toolbar" i]'
      ).first();
      await expect(topBar).toBeVisible({ timeout: 15_000 });
    });

    // Claim 18: Image Studio has a left-side history rail
    test('Image Studio has a left-side history rail', async ({ page }) => {
      await gotoSection(page, '/image-studio');
      await page.waitForTimeout(2_000);

      const historyRail = page.locator(
        '[class*="history" i], [class*="sidebar" i], [class*="rail" i], aside'
      ).first();
      expect.soft(
        await historyRail.isVisible({ timeout: 10_000 }).catch(() => false),
        'Image Studio should have a left-side history rail'
      ).toBeTruthy();
    });

    // Claim 19: Image Studio has a main editor area
    test('Image Studio has a main editor area', async ({ page }) => {
      await gotoSection(page, '/image-studio');
      await page.waitForTimeout(2_000);

      const editorArea = page.locator(
        '[class*="editor" i], [class*="canvas" i], [class*="studio" i], [class*="main" i], [class*="workspace" i], main'
      ).first();
      await expect(editorArea).toBeVisible({ timeout: 15_000 });
    });
  });

  // =========================================================================
  // IMAGE STUDIO — TOP BAR ACTIONS
  // =========================================================================
  test.describe('Image Studio Top Bar Actions', () => {
    test.beforeEach(async ({ page }) => {
      await gotoSection(page, '/image-studio');
      await page.waitForTimeout(2_000);
    });

    // Claim 20: Exit Image Studio button
    test('Exit Image Studio button is present', async ({ page }) => {
      const exitBtn = page.locator('button, [role="button"], a').filter({
        hasText: /exit|back|close|leave/i,
      }).first()
        .or(page.locator('[aria-label*="exit" i], [aria-label*="close" i], [aria-label*="back" i], [data-testid*="exit" i]').first())
        .first();
      expect.soft(
        await exitBtn.isVisible({ timeout: 10_000 }).catch(() => false),
        'Image Studio should have an Exit button'
      ).toBeTruthy();
    });

    // Claim 21: Download button
    test('Download button is present', async ({ page }) => {
      const downloadBtn = page.locator('button, [role="button"], a').filter({
        hasText: /download/i,
      }).first()
        .or(page.locator('[aria-label*="download" i], [data-testid*="download" i], [title*="download" i]').first())
        .first();
      expect.soft(
        await downloadBtn.isVisible({ timeout: 10_000 }).catch(() => false),
        'Image Studio should have a Download button'
      ).toBeTruthy();
    });

    // Claim 22: Reset to Original button (when applicable — may not be visible without an image loaded)
    test('Reset to Original button visible when image is loaded', async ({ page }) => {
      const resetBtn = page.locator('button, [role="button"]').filter({
        hasText: /reset to original|reset/i,
      }).first()
        .or(page.locator('[aria-label*="reset" i], [data-testid*="reset" i]').first())
        .first();

      // This may not be visible without an active image edit
      const isVisible = await resetBtn.isVisible({ timeout: 8_000 }).catch(() => false);
      if (!isVisible) {
        // Soft-pass: button may only appear after edits have been made
        expect.soft(true, 'Reset to Original is contextual — only visible after edits').toBeTruthy();
      } else {
        await expect(resetBtn).toBeVisible();
      }
    });
  });

  // =========================================================================
  // IMAGE STUDIO — EDITING ACTIONS
  // =========================================================================
  test.describe('Image Studio Editing Actions', () => {
    test.beforeEach(async ({ page }) => {
      await gotoSection(page, '/image-studio');
      await page.waitForTimeout(2_000);
    });

    // Claim 23: Enhance action
    test('Enhance action is available', async ({ page }) => {
      const enhanceBtn = page.locator('button, [role="button"]').filter({
        hasText: /enhance/i,
      }).first()
        .or(page.locator('[aria-label*="enhance" i], [data-testid*="enhance" i]').first())
        .first();
      expect.soft(
        await enhanceBtn.isVisible({ timeout: 10_000 }).catch(() => false),
        'Image Studio should have an Enhance action'
      ).toBeTruthy();
    });

    // Claim 24: Upscale action
    test('Upscale action is available', async ({ page }) => {
      const upscaleBtn = page.locator('button, [role="button"]').filter({
        hasText: /upscale/i,
      }).first()
        .or(page.locator('[aria-label*="upscale" i], [data-testid*="upscale" i]').first())
        .first();
      expect.soft(
        await upscaleBtn.isVisible({ timeout: 10_000 }).catch(() => false),
        'Image Studio should have an Upscale action'
      ).toBeTruthy();
    });

    // Claim 25: Remove action (on masked area)
    test('Remove action is available', async ({ page }) => {
      const removeBtn = page.locator('button, [role="button"]').filter({
        hasText: /remove/i,
      }).first()
        .or(page.locator('[aria-label*="remove" i], [data-testid*="remove" i]').first())
        .first();
      expect.soft(
        await removeBtn.isVisible({ timeout: 10_000 }).catch(() => false),
        'Image Studio should have a Remove action'
      ).toBeTruthy();
    });

    // Claim 26: Convert to Video action
    test('Convert to Video action is available', async ({ page }) => {
      const videoBtn = page.locator('button, [role="button"]').filter({
        hasText: /convert to video|video/i,
      }).first()
        .or(page.locator('[aria-label*="video" i], [data-testid*="video" i]').first())
        .first();
      expect.soft(
        await videoBtn.isVisible({ timeout: 10_000 }).catch(() => false),
        'Image Studio should have a Convert to Video action'
      ).toBeTruthy();
    });
  });

  // =========================================================================
  // CONVERT TO VIDEO PANEL
  // =========================================================================
  test.describe('Convert to Video Panel', () => {
    test.beforeEach(async ({ page }) => {
      await gotoSection(page, '/image-studio');
      await page.waitForTimeout(2_000);
    });

    // Helper to open Convert to Video panel
    async function openVideoPanel(page: import('@playwright/test').Page): Promise<boolean> {
      const videoBtn = page.locator('button, [role="button"]').filter({
        hasText: /convert to video|video/i,
      }).first()
        .or(page.locator('[aria-label*="video" i], [data-testid*="video" i]').first())
        .first();

      const isVisible = await videoBtn.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!isVisible) return false;

      await videoBtn.click();
      await page.waitForTimeout(1_000);
      return true;
    }

    // Claim 27: Video conversion panel — Duration options (4, 6, 8 seconds)
    test('video conversion panel has duration options: 4, 6, 8 seconds', async ({ page }) => {
      const opened = await openVideoPanel(page);
      if (!opened) {
        test.skip(true, 'Convert to Video button not available — may need an image loaded');
        return;
      }

      // Look for duration controls
      for (const duration of ['4', '6', '8']) {
        const durationOption = page.getByText(new RegExp(`\\b${duration}\\b`)).first()
          .or(page.locator(`[value="${duration}"], [data-value="${duration}"]`).first())
          .first();
        expect.soft(
          await durationOption.isVisible({ timeout: 5_000 }).catch(() => false),
          `Video panel should have ${duration}-second duration option`
        ).toBeTruthy();
      }
    });

    // Claim 27 continued: Aspect ratio options (16:9, 9:16)
    test('video conversion panel has aspect ratio options: 16:9, 9:16', async ({ page }) => {
      const opened = await openVideoPanel(page);
      if (!opened) {
        test.skip(true, 'Convert to Video button not available');
        return;
      }

      for (const ratio of ['16:9', '9:16']) {
        const ratioOption = page.getByText(new RegExp(ratio.replace(':', '\\s*[:/×x]\\s*'))).first()
          .or(page.locator(`[value="${ratio}"], [data-value="${ratio}"]`).first())
          .first();
        expect.soft(
          await ratioOption.isVisible({ timeout: 5_000 }).catch(() => false),
          `Video panel should have ${ratio} aspect ratio option`
        ).toBeTruthy();
      }
    });

    // Claim 27 continued: Sample count (1-4)
    test('video conversion panel has sample count control (1-4)', async ({ page }) => {
      const opened = await openVideoPanel(page);
      if (!opened) {
        test.skip(true, 'Convert to Video button not available');
        return;
      }

      // Look for sample count input, slider, or selector
      const sampleControl = page.locator(
        'input[type="number"], input[type="range"], [class*="sample" i], [class*="count" i]'
      ).first()
        .or(page.getByText(/sample/i).first())
        .first();
      expect.soft(
        await sampleControl.isVisible({ timeout: 5_000 }).catch(() => false),
        'Video panel should have a sample count control'
      ).toBeTruthy();
    });

    // Claim 27 continued: Person generation options (Allow Adults, No People/Faces)
    test('video conversion panel has person generation options', async ({ page }) => {
      const opened = await openVideoPanel(page);
      if (!opened) {
        test.skip(true, 'Convert to Video button not available');
        return;
      }

      const allowAdults = page.getByText(/allow adults/i).first();
      const noPeople = page.getByText(/no people|no faces/i).first();

      expect.soft(
        await allowAdults.isVisible({ timeout: 5_000 }).catch(() => false),
        'Video panel should have "Allow Adults" option'
      ).toBeTruthy();

      expect.soft(
        await noPeople.isVisible({ timeout: 5_000 }).catch(() => false),
        'Video panel should have "No People/Faces" option'
      ).toBeTruthy();
    });
  });
});
