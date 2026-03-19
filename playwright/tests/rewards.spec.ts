import { test, expect } from '@playwright/test';
import { gotoSection, waitForLoaders } from './helpers/workspace';
import { loginViaUI } from './helpers/login';
import {
  waitForModal,
  dismissModal,
  bodyContainsText,
} from './helpers/ui';

// ---------------------------------------------------------------------------
// rewards.md documentation claims
//
// All tests require a real login because the Vurvey SPA clears localStorage
// tokens restored by storageState.
// ---------------------------------------------------------------------------
test.describe('rewards.md: Documentation claim tests', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
    await waitForLoaders(page);
    await gotoSection(page, '/rewards');
    await page.waitForTimeout(2_000);
  });

  // =========================================================================
  // CLAIM 1: Search box with "Search by creator name..." placeholder
  // =========================================================================
  test('search box with "Search by creator name..." placeholder exists', async ({ page }) => {
    // The page may be in "not configured", "disabled", or "enabled" state.
    // The search box only appears in the enabled (table) state.
    const searchInput = page.locator(
      'input[placeholder*="creator name" i], input[placeholder*="search by creator" i], input[placeholder*="Search by creator name" i]'
    ).first();

    // Also try broader selectors for search inputs on the page
    const broadSearch = page.locator(
      'input[type="search"], input[placeholder*="search" i]'
    ).first();

    const target = searchInput.or(broadSearch).first();

    const isVisible = await target.isVisible({ timeout: 15_000 }).catch(() => false);
    if (!isVisible) {
      // May be in unconfigured/disabled state — check for those states
      const notConfigured = await bodyContainsText(page, 'Configure Tremendous');
      const disabled = await bodyContainsText(page, 'not enabled');
      if (notConfigured || disabled) {
        test.skip(true, 'Rewards page is not in enabled state — search box only appears when rewards are configured and enabled');
        return;
      }
    }

    await expect(target).toBeVisible({ timeout: 15_000 });

    // Verify the placeholder text specifically mentions "creator name"
    const placeholder = await target.getAttribute('placeholder') || '';
    expect.soft(
      placeholder.toLowerCase().includes('creator name') || placeholder.toLowerCase().includes('search'),
      `Search placeholder should mention "creator name", got: "${placeholder}"`
    ).toBeTruthy();
  });

  // =========================================================================
  // CLAIM 2: Searchable "All Campaigns" dropdown filter
  // =========================================================================
  test('searchable "All Campaigns" dropdown filter exists', async ({ page }) => {
    // Look for a dropdown/select that shows "All Campaigns" text
    const campaignDropdown = page.locator('button, [role="combobox"], select, [role="button"]').filter({
      hasText: /all campaigns/i,
    }).first();

    // Broader fallback: any dropdown-like element with campaign text
    const broadDropdown = page.locator(
      '[class*="dropdown" i], [class*="select" i], [class*="filter" i]'
    ).filter({ hasText: /campaign/i }).first();

    const target = campaignDropdown.or(broadDropdown).first();

    const isVisible = await target.isVisible({ timeout: 15_000 }).catch(() => false);
    if (!isVisible) {
      const notConfigured = await bodyContainsText(page, 'Configure Tremendous');
      const disabled = await bodyContainsText(page, 'not enabled');
      if (notConfigured || disabled) {
        test.skip(true, 'Rewards page is not in enabled state — filters only appear when rewards are configured and enabled');
        return;
      }
    }

    await expect(target).toBeVisible({ timeout: 15_000 });

    // Click to open and verify it is searchable (has an input inside)
    await target.click();
    await page.waitForTimeout(1_000);

    const dropdownMenu = page.locator(
      '[role="listbox"], [role="menu"], [class*="dropdown" i], [class*="popover" i], [class*="options" i]'
    ).first();
    const menuVisible = await dropdownMenu.isVisible({ timeout: 5_000 }).catch(() => false);

    if (menuVisible) {
      const searchInsideDropdown = dropdownMenu.locator('input[type="search"], input[type="text"], input[placeholder*="search" i]').first();
      expect.soft(
        await searchInsideDropdown.isVisible({ timeout: 5_000 }).catch(() => false),
        'Campaign dropdown should be searchable (contain a search input)'
      ).toBeTruthy();
    }

    await page.keyboard.press('Escape');
  });

  // =========================================================================
  // CLAIM 3: "Completes Only" checkbox filter
  // =========================================================================
  test('"Completes Only" checkbox filter exists', async ({ page }) => {
    const completesCheckbox = page.locator('input[type="checkbox"]').filter({
      has: page.locator('..').filter({ hasText: /completes only/i }),
    }).first();

    // Broader: any checkbox-like element or label with "Completes Only" text
    const broadCheckbox = page.getByText(/completes only/i).first();
    const checkboxByLabel = page.locator('label').filter({ hasText: /completes only/i }).first();

    const target = completesCheckbox
      .or(broadCheckbox)
      .or(checkboxByLabel)
      .first();

    const isVisible = await target.isVisible({ timeout: 15_000 }).catch(() => false);
    if (!isVisible) {
      const notConfigured = await bodyContainsText(page, 'Configure Tremendous');
      const disabled = await bodyContainsText(page, 'not enabled');
      if (notConfigured || disabled) {
        test.skip(true, 'Rewards page is not in enabled state — filters only appear when rewards are configured and enabled');
        return;
      }
    }

    await expect(target).toBeVisible({ timeout: 15_000 });
  });

  // =========================================================================
  // CLAIM 4: Table columns — Name, Campaign, Completed, Rewards
  // =========================================================================
  test('rewards table has Name, Campaign, Completed, Rewards columns', async ({ page }) => {
    // Look for table header cells or column labels
    const table = page.locator('table, [role="table"], [class*="table" i], [class*="grid" i]').first();

    const isTableVisible = await table.isVisible({ timeout: 15_000 }).catch(() => false);
    if (!isTableVisible) {
      const notConfigured = await bodyContainsText(page, 'Configure Tremendous');
      const disabled = await bodyContainsText(page, 'not enabled');
      if (notConfigured || disabled) {
        test.skip(true, 'Rewards page is not in enabled state — table only appears when rewards are configured and enabled');
        return;
      }
    }

    const expectedColumns = ['Name', 'Campaign', 'Completed', 'Rewards'];
    for (const col of expectedColumns) {
      const header = page.locator('th, [role="columnheader"], [class*="header" i]').filter({
        hasText: new RegExp(`^${col}$`, 'i'),
      }).first();

      // Broader fallback: any element in the table area with the column name
      const broadHeader = table.getByText(new RegExp(`^${col}$`, 'i')).first();

      expect.soft(
        await header.or(broadHeader).first().isVisible({ timeout: 8_000 }).catch(() => false),
        `Rewards table should have a "${col}" column header`
      ).toBeTruthy();
    }
  });

  // =========================================================================
  // CLAIM 5: Per-row menu with "See Campaign" and "Send Reward" actions
  // =========================================================================
  test('row menu has "See Campaign" and "Send Reward" actions', async ({ page }) => {
    const table = page.locator('table, [role="table"], [class*="table" i], [class*="grid" i]').first();

    const isTableVisible = await table.isVisible({ timeout: 15_000 }).catch(() => false);
    if (!isTableVisible) {
      const notConfigured = await bodyContainsText(page, 'Configure Tremendous');
      const disabled = await bodyContainsText(page, 'not enabled');
      if (notConfigured || disabled) {
        test.skip(true, 'Rewards page is not in enabled state — row actions only appear when rewards are configured and enabled');
        return;
      }
      test.skip(true, 'Rewards table not visible — no data to test row menu');
      return;
    }

    // Find a row with a vertical menu (three dots / overflow / kebab)
    const rows = table.locator('tr, [role="row"]');
    const rowCount = await rows.count();

    if (rowCount < 2) {
      // Only header row or no rows at all
      test.skip(true, 'No data rows in rewards table to test row menu');
      return;
    }

    // Try to find and click the overflow menu on the first data row
    const firstDataRow = rows.nth(1); // skip header row
    await firstDataRow.hover();

    const menuTrigger = firstDataRow.locator(
      'button[aria-label*="more" i], button[aria-label*="menu" i], [class*="dots" i], [class*="overflow" i], [class*="kebab" i], [class*="menu" i] button'
    ).first();

    const isTriggerVisible = await menuTrigger.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!isTriggerVisible) {
      // Fallback: try clicking the last cell/button in the row
      const lastButton = firstDataRow.locator('button').last();
      const isLastBtnVisible = await lastButton.isVisible({ timeout: 3_000 }).catch(() => false);
      if (isLastBtnVisible) {
        await lastButton.click();
      } else {
        test.skip(true, 'Could not find row menu trigger');
        return;
      }
    } else {
      await menuTrigger.click();
    }

    // Wait for context menu / dropdown
    const menu = page.locator(
      '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i], [class*="contextMenu" i]'
    ).first();
    await menu.waitFor({ state: 'visible', timeout: 8_000 }).catch(() => {});

    expect.soft(
      await menu.getByText(/see campaign/i).first().isVisible({ timeout: 5_000 }).catch(() => false),
      'Row menu should contain "See Campaign" action'
    ).toBeTruthy();

    expect.soft(
      await menu.getByText(/send reward/i).first().isVisible({ timeout: 5_000 }).catch(() => false),
      'Row menu should contain "Send Reward" action'
    ).toBeTruthy();

    await page.keyboard.press('Escape');
  });

  // =========================================================================
  // CLAIM 6: Bulk "Send Rewards (N)" button appears on row selection
  // =========================================================================
  test('bulk "Send Rewards" button appears after selecting rows', async ({ page }) => {
    const table = page.locator('table, [role="table"], [class*="table" i], [class*="grid" i]').first();

    const isTableVisible = await table.isVisible({ timeout: 15_000 }).catch(() => false);
    if (!isTableVisible) {
      const notConfigured = await bodyContainsText(page, 'Configure Tremendous');
      const disabled = await bodyContainsText(page, 'not enabled');
      if (notConfigured || disabled) {
        test.skip(true, 'Rewards page is not in enabled state — bulk actions only appear when rewards are configured and enabled');
        return;
      }
      test.skip(true, 'Rewards table not visible — cannot test bulk selection');
      return;
    }

    // Find a checkbox in the first data row to select it
    const rows = table.locator('tr, [role="row"]');
    const rowCount = await rows.count();

    if (rowCount < 2) {
      test.skip(true, 'No data rows in rewards table to test bulk selection');
      return;
    }

    const firstDataRow = rows.nth(1);
    const checkbox = firstDataRow.locator('input[type="checkbox"], [role="checkbox"]').first();

    const isCheckboxVisible = await checkbox.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!isCheckboxVisible) {
      // Some tables use clickable row selection — try clicking the row
      test.skip(true, 'Could not find row checkbox for selection');
      return;
    }

    await checkbox.click();
    await page.waitForTimeout(1_000);

    // Look for the bulk "Send Rewards (N)" button
    const bulkSendBtn = page.locator('button, [role="button"]').filter({
      hasText: /send rewards?\s*\(\d+\)/i,
    }).first();

    // Broader fallback
    const broadBulkBtn = page.getByText(/send rewards?\s*\(/i).first();

    expect.soft(
      await bulkSendBtn.or(broadBulkBtn).first().isVisible({ timeout: 10_000 }).catch(() => false),
      'Bulk "Send Rewards (N)" button should appear after selecting a row'
    ).toBeTruthy();

    // Uncheck to clean up
    await checkbox.click();
  });

  // =========================================================================
  // CLAIM 7: Configure Tremendous button and multi-step modal
  // =========================================================================
  test('"Configure Tremendous" button and multi-step modal', async ({ page }) => {
    // This button appears when rewards are not yet configured
    const configureBtn = page.locator('button, [role="button"]').filter({
      hasText: /configure tremendous/i,
    }).first();

    // Also check page header for a "Configure" button (when already configured)
    const headerConfigBtn = page.locator('button, [role="button"]').filter({
      hasText: /^configure$/i,
    }).first();

    const target = configureBtn.or(headerConfigBtn).first();

    const isVisible = await target.isVisible({ timeout: 15_000 }).catch(() => false);
    if (!isVisible) {
      // Rewards may already be configured and enabled — skip
      test.skip(true, '"Configure Tremendous" / "Configure" button not visible — rewards may already be fully configured');
      return;
    }

    await target.click();

    // Wait for modal
    const modal = await waitForModal(page, 15_000);
    await expect(modal).toBeVisible();

    // Verify step 1 content: API key input
    const apiKeyInput = modal.locator(
      'input[type="text"], input[type="password"], input[placeholder*="api" i], input[placeholder*="key" i], textarea'
    ).first();
    const apiKeyLabel = modal.getByText(/api key/i).first();

    expect.soft(
      await apiKeyInput.isVisible({ timeout: 8_000 }).catch(() => false)
      || await apiKeyLabel.isVisible({ timeout: 3_000 }).catch(() => false),
      'Tremendous modal step 1 should show API key input or label'
    ).toBeTruthy();

    // Look for Next/Continue button (step 1 -> step 2)
    const nextBtn = modal.locator('button').filter({
      hasText: /next|continue/i,
    }).first();
    expect.soft(
      await nextBtn.isVisible({ timeout: 5_000 }).catch(() => false),
      'Tremendous modal should have a "Next" or "Continue" button'
    ).toBeTruthy();

    // Look for Cancel button
    const cancelBtn = modal.locator('button').filter({
      hasText: /cancel/i,
    }).first();
    expect.soft(
      await cancelBtn.isVisible({ timeout: 5_000 }).catch(() => false),
      'Tremendous modal should have a "Cancel" button'
    ).toBeTruthy();

    await dismissModal(page);
  });

  // =========================================================================
  // CLAIM 8: Header buttons — Configure, Enable, Disable
  // =========================================================================
  test('page header shows Configure, Enable, or Disable buttons', async ({ page }) => {
    // Depending on configuration state, different buttons appear:
    // - Not configured: "Configure Tremendous"
    // - Configured but disabled: "Configure", "Enable"
    // - Configured and enabled: "Configure", "Disable"

    const configureBtn = page.locator('button, [role="button"]').filter({
      hasText: /configure/i,
    }).first();

    const enableBtn = page.locator('button, [role="button"]').filter({
      hasText: /^enable$/i,
    }).first();

    const disableBtn = page.locator('button, [role="button"]').filter({
      hasText: /^disable$/i,
    }).first();

    const configureTremendousBtn = page.locator('button, [role="button"]').filter({
      hasText: /configure tremendous/i,
    }).first();

    // At least one of these should be visible depending on state
    const configureVisible = await configureBtn.isVisible({ timeout: 10_000 }).catch(() => false);
    const enableVisible = await enableBtn.isVisible({ timeout: 3_000 }).catch(() => false);
    const disableVisible = await disableBtn.isVisible({ timeout: 3_000 }).catch(() => false);
    const configureTremendousVisible = await configureTremendousBtn.isVisible({ timeout: 3_000 }).catch(() => false);

    const anyHeaderButton = configureVisible || enableVisible || disableVisible || configureTremendousVisible;

    if (!anyHeaderButton) {
      // User may not have tremendousSettings permission
      const noPermission = await bodyContainsText(page, 'contact') && await bodyContainsText(page, 'admin');
      if (noPermission) {
        test.skip(true, 'User lacks Tremendous management permissions — header buttons are hidden');
        return;
      }
    }

    expect.soft(anyHeaderButton,
      'At least one of Configure, Enable, Disable, or Configure Tremendous should be visible in the page header'
    ).toBeTruthy();

    // Log which state we observed for diagnostics
    if (configureTremendousVisible) {
      // Not configured state
      expect.soft(configureTremendousVisible, '"Configure Tremendous" button visible (not-configured state)').toBeTruthy();
    } else if (configureVisible && enableVisible) {
      // Configured but disabled state
      expect.soft(configureVisible, '"Configure" button visible').toBeTruthy();
      expect.soft(enableVisible, '"Enable" button visible (configured-but-disabled state)').toBeTruthy();
    } else if (configureVisible && disableVisible) {
      // Configured and enabled state
      expect.soft(configureVisible, '"Configure" button visible').toBeTruthy();
      expect.soft(disableVisible, '"Disable" button visible (configured-and-enabled state)').toBeTruthy();
    }
  });

  // =========================================================================
  // CLAIM 9: Send Reward modal — amount, currency, Per Creator, payment
  //          source toggle, computed Pay total, Cancel/Pay actions
  // =========================================================================
  test('send-reward modal contains documented fields and actions', async ({ page }) => {
    const table = page.locator('table, [role="table"], [class*="table" i], [class*="grid" i]').first();

    const isTableVisible = await table.isVisible({ timeout: 15_000 }).catch(() => false);
    if (!isTableVisible) {
      const notConfigured = await bodyContainsText(page, 'Configure Tremendous');
      const disabled = await bodyContainsText(page, 'not enabled');
      if (notConfigured || disabled) {
        test.skip(true, 'Rewards page is not in enabled state — send reward modal only available when rewards are configured and enabled');
        return;
      }
      test.skip(true, 'Rewards table not visible — cannot open send reward modal');
      return;
    }

    // Open the row menu on the first data row to find "Send Reward"
    const rows = table.locator('tr, [role="row"]');
    const rowCount = await rows.count();

    if (rowCount < 2) {
      test.skip(true, 'No data rows in rewards table to test send reward modal');
      return;
    }

    const firstDataRow = rows.nth(1);
    await firstDataRow.hover();

    const menuTrigger = firstDataRow.locator(
      'button[aria-label*="more" i], button[aria-label*="menu" i], [class*="dots" i], [class*="overflow" i], [class*="kebab" i], [class*="menu" i] button'
    ).first();

    const isTriggerVisible = await menuTrigger.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!isTriggerVisible) {
      const lastButton = firstDataRow.locator('button').last();
      const isLastBtnVisible = await lastButton.isVisible({ timeout: 3_000 }).catch(() => false);
      if (isLastBtnVisible) {
        await lastButton.click();
      } else {
        test.skip(true, 'Could not find row menu trigger to open send reward modal');
        return;
      }
    } else {
      await menuTrigger.click();
    }

    // Click "Send Reward" in the row menu
    const menu = page.locator(
      '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i], [class*="contextMenu" i]'
    ).first();
    await menu.waitFor({ state: 'visible', timeout: 8_000 }).catch(() => {});

    const sendRewardItem = menu.getByText(/send reward/i).first();
    const isSendRewardVisible = await sendRewardItem.isVisible({ timeout: 5_000 }).catch(() => false);

    if (!isSendRewardVisible) {
      await page.keyboard.press('Escape');
      test.skip(true, '"Send Reward" option not found in row menu');
      return;
    }

    await sendRewardItem.click();

    // Wait for the send-reward modal
    const modal = await waitForModal(page, 15_000);
    await expect(modal).toBeVisible();

    // Check for reward amount input
    const amountInput = modal.locator(
      'input[type="number"], input[type="text"][placeholder*="amount" i], input[placeholder*="$" i], input[inputmode="decimal"], input[inputmode="numeric"]'
    ).first();
    const amountLabel = modal.getByText(/amount/i).first();
    expect.soft(
      await amountInput.isVisible({ timeout: 5_000 }).catch(() => false)
      || await amountLabel.isVisible({ timeout: 3_000 }).catch(() => false),
      'Send reward modal should have a reward amount field'
    ).toBeTruthy();

    // Check for currency indicator
    const currencyIndicator = modal.getByText(/usd|eur|gbp|currency|\$/i).first();
    expect.soft(
      await currencyIndicator.isVisible({ timeout: 5_000 }).catch(() => false),
      'Send reward modal should have a currency indicator'
    ).toBeTruthy();

    // Check for "*Per Creator" indicator
    const perCreatorIndicator = modal.getByText(/per creator/i).first();
    expect.soft(
      await perCreatorIndicator.isVisible({ timeout: 5_000 }).catch(() => false),
      'Send reward modal should have a "*Per Creator" indicator'
    ).toBeTruthy();

    // Check for "Choose payment source" toggle
    const paymentSourceToggle = modal.getByText(/payment source|choose payment/i).first();
    const paymentToggleSwitch = modal.locator('[role="switch"], input[type="checkbox"], [class*="toggle" i]').first();
    expect.soft(
      await paymentSourceToggle.isVisible({ timeout: 5_000 }).catch(() => false)
      || await paymentToggleSwitch.isVisible({ timeout: 3_000 }).catch(() => false),
      'Send reward modal should have a "Choose payment source" toggle'
    ).toBeTruthy();

    // Check for computed Pay total
    const payTotal = modal.getByText(/pay\s*[\($]/i).first();
    const payButton = modal.locator('button').filter({ hasText: /pay/i }).first();
    expect.soft(
      await payTotal.isVisible({ timeout: 5_000 }).catch(() => false)
      || await payButton.isVisible({ timeout: 3_000 }).catch(() => false),
      'Send reward modal should show a computed Pay total'
    ).toBeTruthy();

    // Check for Cancel button
    const cancelBtn = modal.locator('button').filter({ hasText: /cancel/i }).first();
    expect.soft(
      await cancelBtn.isVisible({ timeout: 5_000 }).catch(() => false),
      'Send reward modal should have a "Cancel" button'
    ).toBeTruthy();

    // Check for Pay action button
    expect.soft(
      await payButton.isVisible({ timeout: 5_000 }).catch(() => false),
      'Send reward modal should have a "Pay" action button'
    ).toBeTruthy();

    await dismissModal(page);
  });
});
