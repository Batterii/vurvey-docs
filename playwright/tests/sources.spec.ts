import { test, expect, Page } from '@playwright/test';
import { gotoSection, waitForLoaders } from './helpers/workspace';
import { loginViaUI } from './helpers/login';
import { dismissModal } from './helpers/ui';

// ---------------------------------------------------------------------------
// sources-and-citations.md: Documentation claim tests
//
// All tests require a real login because the Vurvey SPA clears localStorage
// tokens restored by storageState.
// ---------------------------------------------------------------------------
test.describe('sources-and-citations.md: Documentation claim tests', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
    await waitForLoaders(page);
    // Navigate to home (chat/canvas) page where the toolbar lives
    await gotoSection(page, '/');
    await page.waitForTimeout(2_000);
  });

  // =========================================================================
  // HELPER: locate the Sources button in the toolbar
  // =========================================================================
  async function findSourcesButton(page: Page) {
    return page.locator('button, [role="button"]')
      .filter({ hasText: /sources/i })
      .first()
      .or(
        page.locator(
          '[aria-label*="source" i], [data-testid*="source" i], [title*="source" i]'
        ).first()
      )
      .first();
  }

  // HELPER: open the Sources dropdown and return the dropdown locator
  async function openSourcesDropdown(page: Page) {
    const sourcesBtn = await findSourcesButton(page);
    await sourcesBtn.waitFor({ state: 'visible', timeout: 15_000 });
    await sourcesBtn.click();

    const dropdown = page.locator(
      '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i], [class*="modal" i], [role="dialog"]'
    ).first();
    await dropdown.waitFor({ state: 'visible', timeout: 10_000 });
    return dropdown;
  }

  // HELPER: navigate to an existing conversation that may have grounded sources
  async function openExistingConversation(page: Page): Promise<boolean> {
    const conversationItem = page.locator(
      '[class*="conversation" i] a, [class*="conversation" i] [role="button"], [class*="chatHistory" i] a, [class*="sidebar" i] [class*="conversation" i]'
    ).first();

    const sidebarConversation = page.locator('aside a, nav a, [class*="sidebar" i] a').filter({
      hasNotText: /home|agents|people|campaigns|datasets|workflow|forecast|view all/i,
    }).first();

    const target = conversationItem.or(sidebarConversation).first();
    const isVisible = await target.isVisible({ timeout: 8_000 }).catch(() => false);
    if (!isVisible) return false;

    await target.click();
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await page.waitForTimeout(2_000);
    return true;
  }

  // =========================================================================
  // Claim 1: Sources Control — entry point in toolbar for workspace data
  //
  // Doc: "From the Home/Canvas toolbar, the Sources control is the entry
  //       point for workspace data."
  // =========================================================================
  test('Claim 1: Sources control exists in toolbar as entry point for workspace data', async ({ page }) => {
    const sourcesBtn = await findSourcesButton(page);
    await expect(sourcesBtn).toBeVisible({ timeout: 15_000 });
  });

  // =========================================================================
  // Claim 2: Quick Dropdown — Attach Datasets, Attach Campaigns, on/off
  //
  // Doc: "The quick dropdown currently lets you:
  //       - Attach Datasets
  //       - Attach Campaigns
  //       - turn sources on or off"
  // =========================================================================
  test('Claim 2: Sources quick dropdown has Attach Datasets, Attach Campaigns, and on/off toggle', async ({ page }) => {
    const dropdown = await openSourcesDropdown(page);

    // Check for "Attach Datasets"
    expect.soft(
      await dropdown.getByText(/attach datasets/i).first()
        .isVisible({ timeout: 5_000 }).catch(() => false),
      'Sources dropdown should have "Attach Datasets"'
    ).toBeTruthy();

    // Check for "Attach Campaigns"
    expect.soft(
      await dropdown.getByText(/attach campaigns/i).first()
        .isVisible({ timeout: 5_000 }).catch(() => false),
      'Sources dropdown should have "Attach Campaigns"'
    ).toBeTruthy();

    // Check for on/off toggle (text or switch control)
    const hasToggleText = await dropdown.getByText(/turn (on|off)/i).first()
      .isVisible({ timeout: 5_000 }).catch(() => false);
    const hasSwitchControl = await dropdown.locator('[class*="toggle" i], [role="switch"]').first()
      .isVisible({ timeout: 3_000 }).catch(() => false);
    expect.soft(
      hasToggleText || hasSwitchControl,
      'Sources dropdown should have on/off toggle'
    ).toBeTruthy();

    await page.keyboard.press('Escape');
  });

  // =========================================================================
  // Claim 3: Full Modal — three navigation items: Campaigns, Datasets, All files
  //
  // Doc: "When you open the full modal, the current top-level navigation
  //       is centered on: Campaigns, Datasets, All files"
  // =========================================================================
  test('Claim 3: Full Sources modal has Campaigns, Datasets, and All files navigation', async ({ page }) => {
    const dropdown = await openSourcesDropdown(page);

    // Try clicking "Attach Datasets" or "Attach Campaigns" to open the full modal
    const attachBtn = dropdown.getByText(/attach datasets/i).first()
      .or(dropdown.getByText(/attach campaigns/i).first())
      .first();
    const attachVisible = await attachBtn.isVisible({ timeout: 5_000 }).catch(() => false);

    if (attachVisible) {
      await attachBtn.click();
    } else {
      // Fallback: look for a "manage" or "view all" or expand button
      const expandBtn = dropdown.getByText(/manage|view all|see all|browse/i).first();
      const expandVisible = await expandBtn.isVisible({ timeout: 3_000 }).catch(() => false);
      if (expandVisible) {
        await expandBtn.click();
      }
    }

    // Wait for the full modal to appear
    const modal = page.locator('[role="dialog"], [class*="modal" i]').first();
    const modalVisible = await modal.isVisible({ timeout: 10_000 }).catch(() => false);

    if (!modalVisible) {
      // If no modal appeared, the dropdown itself may serve as the full interface
      // Soft-fail with a descriptive message
      expect.soft(false,
        'Could not open full Sources modal via Attach button — UI structure may differ from docs'
      ).toBeTruthy();
      return;
    }

    // Check for the three top-level nav items within the modal
    const modalOrPage = modal;

    expect.soft(
      await modalOrPage.getByText(/campaigns/i).first()
        .isVisible({ timeout: 5_000 }).catch(() => false),
      'Sources modal should have "Campaigns" navigation tab'
    ).toBeTruthy();

    expect.soft(
      await modalOrPage.getByText(/datasets/i).first()
        .isVisible({ timeout: 5_000 }).catch(() => false),
      'Sources modal should have "Datasets" navigation tab'
    ).toBeTruthy();

    expect.soft(
      await modalOrPage.getByText(/all files/i).first()
        .isVisible({ timeout: 5_000 }).catch(() => false),
      'Sources modal should have "All files" navigation tab'
    ).toBeTruthy();

    await dismissModal(page);
  });

  // =========================================================================
  // Claim 4: Powered By Section — appears below AI responses with grounding
  //
  // Doc: "When a message has grounding data, the response UI can show:
  //       a Powered by section"
  // =========================================================================
  test('Claim 4: Powered by section appears on AI responses with grounding data', async ({ page }) => {
    const opened = await openExistingConversation(page);
    if (!opened) {
      test.skip(true, 'No existing conversations found — cannot test Powered By section');
      return;
    }

    // Look for a "Powered by" element anywhere on the page
    const poweredBy = page.getByText(/powered by/i).first()
      .or(page.locator('[class*="poweredBy" i], [class*="powered-by" i], [class*="grounding" i], [data-testid*="powered" i]').first())
      .first();

    // This is a soft assertion because not all conversations have grounded sources
    expect.soft(
      await poweredBy.isVisible({ timeout: 10_000 }).catch(() => false),
      'AI response with grounding data should show a "Powered by" section. ' +
      'This may not appear if no conversation in the workspace has grounded sources.'
    ).toBeTruthy();
  });

  // =========================================================================
  // Claim 5: Citations Toggle — in message actions area
  //
  // Doc: "a Citations toggle in the message actions"
  //      "The Citations action is not always present. In current master,
  //       it only renders when the message actually has grounding entries."
  // =========================================================================
  test('Claim 5: Citations toggle exists in message actions when grounding is present', async ({ page }) => {
    const opened = await openExistingConversation(page);
    if (!opened) {
      test.skip(true, 'No existing conversations found — cannot test Citations toggle');
      return;
    }

    const citationsBtn = page.locator(
      '[aria-label*="citation" i], [data-testid*="citation" i], [title*="citation" i]'
    ).first()
      .or(page.locator('button, [role="button"]').filter({ hasText: /citation/i }).first())
      .first();

    // Soft assertion: citations only render when grounding entries are present
    expect.soft(
      await citationsBtn.isVisible({ timeout: 10_000 }).catch(() => false),
      'Response message actions should include a Citations toggle when grounding data exists. ' +
      'May not appear if no grounded messages exist in the test conversation.'
    ).toBeTruthy();
  });

  // =========================================================================
  // Claim 6: Superscript Markers — inline citation markers in response text
  //
  // Doc: "inline superscript citation markers when citations are turned on"
  //      "When citations are toggled on, the renderer inserts inline
  //       superscripts based on grounding positions."
  // =========================================================================
  test('Claim 6: Inline superscript citation markers appear when citations are toggled on', async ({ page }) => {
    const opened = await openExistingConversation(page);
    if (!opened) {
      test.skip(true, 'No existing conversations found — cannot test superscript markers');
      return;
    }

    // First, try to find and click the citations toggle
    const citationsBtn = page.locator(
      '[aria-label*="citation" i], [data-testid*="citation" i], [title*="citation" i]'
    ).first()
      .or(page.locator('button, [role="button"]').filter({ hasText: /citation/i }).first())
      .first();

    const citationsVisible = await citationsBtn.isVisible({ timeout: 10_000 }).catch(() => false);
    if (!citationsVisible) {
      test.skip(true,
        'Citations toggle not found — no grounded messages in test conversation'
      );
      return;
    }

    // Turn citations on
    await citationsBtn.click();
    await page.waitForTimeout(1_000);

    // Look for superscript markers — these are typically <sup> elements or
    // elements with citation-related classes containing numeric markers
    const superscripts = page.locator(
      'sup, [class*="superscript" i], [class*="citation-marker" i], [class*="citationMarker" i], [class*="footnote" i]'
    );

    const count = await superscripts.count();
    expect.soft(
      count > 0,
      'After toggling citations on, inline superscript markers should appear in the response text. ' +
      'Found ' + count + ' superscript elements.'
    ).toBeTruthy();

    // Toggle citations back off to clean up
    await citationsBtn.click();
  });

  // =========================================================================
  // Claim 7: Expandable/Collapsible — Powered by label toggles grounding section
  //
  // Doc: "the label expands and collapses the grounding section"
  // =========================================================================
  test('Claim 7: Powered by label is clickable and expands/collapses grounding section', async ({ page }) => {
    const opened = await openExistingConversation(page);
    if (!opened) {
      test.skip(true, 'No existing conversations found — cannot test Powered By toggle');
      return;
    }

    // Find the "Powered by" label
    const poweredByLabel = page.getByText(/powered by/i).first()
      .or(page.locator('[class*="poweredBy" i], [class*="powered-by" i], [data-testid*="powered" i]').first())
      .first();

    const isVisible = await poweredByLabel.isVisible({ timeout: 10_000 }).catch(() => false);
    if (!isVisible) {
      test.skip(true,
        'No "Powered by" label found — no grounded responses in test conversation'
      );
      return;
    }

    // Click to expand the grounding section
    await poweredByLabel.click();
    await page.waitForTimeout(500);

    // After expanding, the grounding section content should become visible
    // Look for source entries, grounding details, or expanded content
    const expandedContent = page.locator(
      '[class*="grounding" i], [class*="source-list" i], [class*="sourceList" i], ' +
      '[class*="groundingSection" i], [class*="groundingContent" i], [class*="expanded" i]'
    ).first()
      .or(page.getByText(/see how this works/i).first())
      .first();

    const expandedVisible = await expandedContent.isVisible({ timeout: 5_000 }).catch(() => false);
    expect.soft(
      expandedVisible,
      'Clicking "Powered by" label should expand the grounding section to show source details'
    ).toBeTruthy();

    // Click again to collapse
    await poweredByLabel.click();
    await page.waitForTimeout(500);

    // After collapsing, the expanded content should be hidden (or at least the section should change)
    // We use a soft assertion since the collapse behavior may vary
    const stillExpanded = await expandedContent.isVisible({ timeout: 2_000 }).catch(() => false);
    expect.soft(
      !stillExpanded,
      'Clicking "Powered by" label again should collapse the grounding section'
    ).toBeTruthy();
  });

  // =========================================================================
  // Claim 8: See How This Works — link in expanded grounding section
  //
  // Doc: "the expanded section shows a See how this works chip/link"
  // =========================================================================
  test('Claim 8: Expanded grounding section shows "See how this works" link', async ({ page }) => {
    const opened = await openExistingConversation(page);
    if (!opened) {
      test.skip(true, 'No existing conversations found — cannot test See How This Works link');
      return;
    }

    // Find and click the "Powered by" label to expand
    const poweredByLabel = page.getByText(/powered by/i).first()
      .or(page.locator('[class*="poweredBy" i], [class*="powered-by" i], [data-testid*="powered" i]').first())
      .first();

    const isVisible = await poweredByLabel.isVisible({ timeout: 10_000 }).catch(() => false);
    if (!isVisible) {
      test.skip(true,
        'No "Powered by" label found — no grounded responses in test conversation'
      );
      return;
    }

    // Expand the grounding section
    await poweredByLabel.click();
    await page.waitForTimeout(1_000);

    // Look for "See how this works" chip/link
    const seeHowLink = page.getByText(/see how this works/i).first()
      .or(page.locator('a, button, [role="link"]').filter({ hasText: /see how this works/i }).first())
      .first();

    expect.soft(
      await seeHowLink.isVisible({ timeout: 8_000 }).catch(() => false),
      'Expanded grounding section should show a "See how this works" chip/link. ' +
      'May not appear if the grounding section does not expand or no grounded messages exist.'
    ).toBeTruthy();

    // Clean up: collapse the section
    await poweredByLabel.click();
  });
});
