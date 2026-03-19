import { test, expect, Page, Locator } from '@playwright/test';
import { gotoSection, waitForLoaders } from './helpers/workspace';
import { loginViaUI } from './helpers/login';
import { dismissModal } from './helpers/ui';

// ---------------------------------------------------------------------------
// permissions-and-sharing.md documentation claims
//
// All tests require a real login because the Vurvey SPA clears localStorage
// tokens restored by storageState on boot.
//
// To minimize login overhead (Auth0 rate limits), related claims are grouped
// so the share dialog is opened fewer times.
// ---------------------------------------------------------------------------

/**
 * Navigate to the Agents page, hover over the first agent card,
 * open its three-dot menu, click "Share", and return the share dialog locator.
 *
 * Returns null if the Agents page or Share option is unavailable.
 */
async function openShareDialog(page: Page): Promise<Locator | null> {
  await gotoSection(page, '/agents');
  await page.waitForTimeout(2_000);

  // Wait for at least one agent card to appear
  const agentCard = page.locator(
    '[class*="card" i], [class*="agentCard" i], [class*="personaCard" i], [data-testid*="agent" i]'
  ).first();

  const cardVisible = await agentCard.isVisible({ timeout: 15_000 }).catch(() => false);
  if (!cardVisible) return null;

  // Open the card's three-dot / overflow menu
  await agentCard.hover();
  const menuBtn = agentCard.locator(
    'button[aria-label*="more" i], [class*="dots" i], [class*="overflow" i], [class*="menu" i] button, [class*="kebab" i], [class*="ellipsis" i]'
  ).first();
  await menuBtn.waitFor({ state: 'visible', timeout: 5_000 });
  await menuBtn.click();

  // Wait for the dropdown menu
  const dropdownMenu = page.locator(
    '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i], [class*="contextMenu" i]'
  ).first();
  await dropdownMenu.waitFor({ state: 'visible', timeout: 8_000 });

  // Click "Share"
  const shareOption = dropdownMenu.getByText(/^share$/i).first()
    .or(dropdownMenu.locator('[data-testid*="share" i]').first())
    .first();
  const shareVisible = await shareOption.isVisible({ timeout: 5_000 }).catch(() => false);
  if (!shareVisible) return null;

  await shareOption.click();

  // Wait for the share dialog / modal
  const shareDialog = page.locator(
    '[role="dialog"], [class*="modal" i], [class*="shareModal" i], [class*="shareDialog" i]'
  ).first();
  await shareDialog.waitFor({ state: 'visible', timeout: 10_000 });

  return shareDialog;
}

test.describe('permissions-and-sharing.md: Documentation claim tests', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
    await waitForLoaders(page);
  });

  // =========================================================================
  // GROUP 1: Share Dialog — Core elements
  // Claims 1, 2, 5, 6 (Viewer/Editor levels, Copy Link, Add People, Add button)
  // =========================================================================
  test('share dialog: Viewer/Editor levels, Copy Link, Add People field, role dropdown, and Add button', async ({ page }) => {
    const dialog = await openShareDialog(page);
    if (!dialog) {
      test.skip(true, 'Could not open share dialog — no agent cards or Share option unavailable');
      return;
    }

    // ----- Claim 1: Viewer and Editor as user-selectable access levels -----
    const viewerPresent = await dialog.getByText(/viewer/i).first()
      .isVisible({ timeout: 10_000 }).catch(() => false);
    const editorPresent = await dialog.getByText(/editor/i).first()
      .isVisible({ timeout: 10_000 }).catch(() => false);

    expect.soft(viewerPresent, 'Claim 1: Share dialog should show "Viewer" access level').toBeTruthy();
    expect.soft(editorPresent, 'Claim 1: Share dialog should show "Editor" access level').toBeTruthy();

    // ----- Claim 2: Copy Link action -----
    const copyLink = dialog.getByText(/copy\s*link/i).first()
      .or(dialog.locator('[aria-label*="copy link" i], [data-testid*="copy-link" i], [title*="copy link" i]').first())
      .or(dialog.locator('button').filter({ hasText: /copy/i }).first())
      .first();

    expect.soft(
      await copyLink.isVisible({ timeout: 10_000 }).catch(() => false),
      'Claim 2: Share dialog should have a "Copy Link" action'
    ).toBeTruthy();

    // ----- Claim 5: Add People field -----
    const addPeopleField = dialog.locator(
      'input[placeholder*="add" i], input[placeholder*="people" i], input[placeholder*="invite" i], input[placeholder*="name" i], input[placeholder*="email" i], [data-testid*="add-people" i], [data-testid*="invite" i]'
    ).first()
      .or(dialog.getByText(/add\s*people/i).first())
      .first();

    expect.soft(
      await addPeopleField.isVisible({ timeout: 10_000 }).catch(() => false),
      'Claim 5: Share dialog should have an "Add People" field'
    ).toBeTruthy();

    // ----- Claim 6: Role dropdown (Viewer/Editor) and Add button -----
    const roleDropdown = dialog.locator('button, [role="button"], select, [class*="dropdown" i]')
      .filter({ hasText: /viewer|editor/i })
      .first();

    expect.soft(
      await roleDropdown.isVisible({ timeout: 10_000 }).catch(() => false),
      'Claim 6: Add People section should have a Viewer/Editor role dropdown'
    ).toBeTruthy();

    const addBtn = dialog.locator('button').filter({ hasText: /^add$/i }).first()
      .or(dialog.locator('[data-testid*="add-member" i], [data-testid*="add-people" i]').first())
      .first();

    expect.soft(
      await addBtn.isVisible({ timeout: 10_000 }).catch(() => false),
      'Claim 6: Add People section should have an "Add" button'
    ).toBeTruthy();

    await dismissModal(page);
  });

  // =========================================================================
  // GROUP 2: General Access — section, Restricted, Wide options
  // Claims 3, 3a, 3b (General Access section, Restricted, Wide)
  // =========================================================================
  test('General Access section with Restricted and Wide access options', async ({ page }) => {
    const dialog = await openShareDialog(page);
    if (!dialog) {
      test.skip(true, 'Could not open share dialog');
      return;
    }

    // ----- Claim 3: General Access section present -----
    const generalAccessLabel = dialog.getByText(/general\s*access/i).first();
    expect.soft(
      await generalAccessLabel.isVisible({ timeout: 10_000 }).catch(() => false),
      'Claim 3: Share dialog should have a "General Access" section'
    ).toBeTruthy();

    // ----- Claim 3a: Restricted access option -----
    let restrictedVisible = await dialog.getByText(/restricted/i).first()
      .isVisible({ timeout: 5_000 }).catch(() => false);

    if (!restrictedVisible) {
      // Open the general access dropdown to find it
      const dropdownBtn = dialog.locator('button, [role="button"], select, [class*="dropdown" i] [class*="trigger" i]')
        .filter({ hasText: /restricted|wide|anyone|workspace/i })
        .first();
      const btnVisible = await dropdownBtn.isVisible({ timeout: 5_000 }).catch(() => false);
      if (btnVisible) {
        await dropdownBtn.click();
        await page.waitForTimeout(500);
        restrictedVisible = await page.getByText(/restricted/i).first()
          .isVisible({ timeout: 5_000 }).catch(() => false);
      }
    }

    expect.soft(restrictedVisible, 'Claim 3a: General Access should have "Restricted access" option').toBeTruthy();

    // ----- Claim 3b: Wide access option -----
    let wideVisible = await page.getByText(/wide/i).first()
      .isVisible({ timeout: 3_000 }).catch(() => false);

    if (!wideVisible) {
      // If dropdown was closed, reopen
      const dropdownBtn = dialog.locator('button, [role="button"], select, [class*="dropdown" i] [class*="trigger" i]')
        .filter({ hasText: /restricted|wide|anyone|workspace/i })
        .first();
      const btnVisible = await dropdownBtn.isVisible({ timeout: 5_000 }).catch(() => false);
      if (btnVisible) {
        await dropdownBtn.click();
        await page.waitForTimeout(500);
        wideVisible = await page.getByText(/wide/i).first()
          .isVisible({ timeout: 5_000 }).catch(() => false);
      }
    }

    expect.soft(wideVisible, 'Claim 3b: General Access should have "Wide access" option').toBeTruthy();

    // Close any open dropdown
    await page.keyboard.press('Escape');
    await dismissModal(page);
  });

  // =========================================================================
  // GROUP 3: Wide Access secondary role selector
  // Claim 4 (secondary Viewer/Editor when Wide is selected)
  // =========================================================================
  test('Wide access reveals secondary Viewer/Editor role selector', async ({ page }) => {
    const dialog = await openShareDialog(page);
    if (!dialog) {
      test.skip(true, 'Could not open share dialog');
      return;
    }

    // Find and click the general access dropdown
    const dropdownBtn = dialog.locator('button, [role="button"], select')
      .filter({ hasText: /restricted|wide|anyone|workspace/i })
      .first();
    const btnVisible = await dropdownBtn.isVisible({ timeout: 5_000 }).catch(() => false);

    if (!btnVisible) {
      test.skip(true, 'General Access dropdown trigger not found');
      await dismissModal(page);
      return;
    }

    await dropdownBtn.click();
    await page.waitForTimeout(500);

    // Click "Wide access" option
    const wideOption = page.getByText(/wide\s*access/i).first()
      .or(page.locator('[role="option"], [role="menuitem"], li').filter({ hasText: /wide/i }).first())
      .first();
    const wideVisible = await wideOption.isVisible({ timeout: 5_000 }).catch(() => false);

    if (!wideVisible) {
      test.skip(true, '"Wide access" option not found in dropdown');
      await page.keyboard.press('Escape');
      await dismissModal(page);
      return;
    }

    await wideOption.click();
    await page.waitForTimeout(1_000);

    // After selecting "Wide access", a secondary role selector should appear
    const secondarySelector = dialog.locator('button, [role="button"], select, [class*="dropdown" i]')
      .filter({ hasText: /viewer|editor/i })
      .first();

    expect.soft(
      await secondarySelector.isVisible({ timeout: 8_000 }).catch(() => false),
      'Claim 4: Wide access should reveal a secondary Viewer/Editor role selector'
    ).toBeTruthy();

    // Revert to "Restricted" to avoid side effects
    const revertBtn = dialog.locator('button, [role="button"], select')
      .filter({ hasText: /wide|restricted|anyone|workspace/i })
      .first();
    const revertVisible = await revertBtn.isVisible({ timeout: 3_000 }).catch(() => false);
    if (revertVisible) {
      await revertBtn.click();
      await page.waitForTimeout(500);
      const restrictedOption = page.getByText(/restricted/i).first()
        .or(page.locator('[role="option"], [role="menuitem"], li').filter({ hasText: /restricted/i }).first())
        .first();
      const restrictedVisible = await restrictedOption.isVisible({ timeout: 3_000 }).catch(() => false);
      if (restrictedVisible) {
        await restrictedOption.click();
        await page.waitForTimeout(500);
      }
    }

    await dismissModal(page);
  });

  // =========================================================================
  // GROUP 4: Existing members — Owner label, Remove action, disabled controls
  // Claims 7, 8, 9
  // =========================================================================
  test('existing members: Owner label, Remove action, and disabled owner controls', async ({ page }) => {
    const dialog = await openShareDialog(page);
    if (!dialog) {
      test.skip(true, 'Could not open share dialog');
      return;
    }

    // ----- Claim 7: Owner label -----
    const ownerLabel = dialog.getByText(/owner/i).first();
    const ownerVisible = await ownerLabel.isVisible({ timeout: 10_000 }).catch(() => false);
    expect.soft(
      ownerVisible,
      'Claim 7: Existing members should show an "Owner" label for the owner entry'
    ).toBeTruthy();

    // ----- Claim 8: Remove action -----
    const removeAction = dialog.getByText(/remove/i).first()
      .or(dialog.locator('[aria-label*="remove" i], [data-testid*="remove" i], [title*="remove" i]').first())
      .or(dialog.locator('button[aria-label*="delete" i]').first())
      .first();

    let removeFound = await removeAction.isVisible({ timeout: 8_000 }).catch(() => false);

    if (!removeFound) {
      // Try opening a non-owner member's role dropdown to find Remove
      const memberDropdowns = dialog.locator('button, [role="button"]')
        .filter({ hasText: /viewer|editor/i });
      const dropdownCount = await memberDropdowns.count();

      for (let i = 0; i < Math.min(dropdownCount, 3); i++) {
        await memberDropdowns.nth(i).click();
        await page.waitForTimeout(500);
        const removeInMenu = page.getByText(/remove/i).first();
        removeFound = await removeInMenu.isVisible({ timeout: 3_000 }).catch(() => false);
        await page.keyboard.press('Escape');
        if (removeFound) break;
      }
    }

    expect.soft(
      removeFound,
      'Claim 8: Existing members should have a "Remove" action'
    ).toBeTruthy();

    // ----- Claim 9: Disabled controls on owner row with tooltip -----
    const ownerRow = dialog.locator('[class*="member" i], [class*="row" i], [class*="user" i], li, tr')
      .filter({ hasText: /owner/i })
      .first();

    const ownerRowVisible = await ownerRow.isVisible({ timeout: 5_000 }).catch(() => false);

    if (ownerRowVisible) {
      // Check for disabled state or static Owner label (replacing an interactive dropdown)
      const disabledControl = ownerRow.locator(
        'button[disabled], [aria-disabled="true"], select[disabled], [class*="disabled" i]'
      ).first();

      const hasDisabledControl = await disabledControl.isVisible({ timeout: 5_000 }).catch(() => false);

      const ownerLabelInRow = ownerRow.getByText(/owner/i).first();
      const ownerLabelInRowVisible = await ownerLabelInRow.isVisible({ timeout: 3_000 }).catch(() => false);

      expect.soft(
        hasDisabledControl || ownerLabelInRowVisible,
        'Claim 9: Owner row should have disabled permission controls or a static "Owner" label'
      ).toBeTruthy();

      // Check for tooltip on hover
      let hasTooltip = false;
      const hoverTarget = hasDisabledControl ? disabledControl : ownerLabelInRow;
      if (await hoverTarget.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await hoverTarget.hover();
        await page.waitForTimeout(1_000);
        const tooltip = page.locator(
          '[role="tooltip"], [class*="tooltip" i], [class*="Tooltip" i], [data-testid*="tooltip" i]'
        ).first();
        hasTooltip = await tooltip.isVisible({ timeout: 3_000 }).catch(() => false);
      }

      expect.soft(
        hasTooltip,
        'Claim 9: Owner row should show a tooltip when hovering disabled controls'
      ).toBeTruthy();
    } else {
      // Fallback — at minimum, "Owner" text should exist in the dialog
      expect.soft(
        ownerVisible,
        'Claim 9: Share dialog should identify the owner with disabled controls'
      ).toBeTruthy();
    }

    await dismissModal(page);
  });
});
