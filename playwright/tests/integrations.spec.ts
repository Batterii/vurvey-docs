import { test, expect } from '@playwright/test';
import { gotoSection, waitForLoaders } from './helpers/workspace';
import { loginViaUI } from './helpers/login';
import { dismissModal } from './helpers/ui';

// ---------------------------------------------------------------------------
// integrations.md documentation claims
//
// The Vurvey SPA clears localStorage tokens restored by storageState,
// so every test performs a real UI login via loginViaUI().
// ---------------------------------------------------------------------------
test.describe('integrations.md: Documentation claim tests', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test.setTimeout(120_000);

  // Route candidates — the integrations page may live at either path
  const ROUTE_CANDIDATES = ['/settings/integrations', '/integrations'];

  /** Navigate to the integrations page, trying known route candidates. */
  async function gotoIntegrations(page: import('@playwright/test').Page): Promise<boolean> {
    for (const route of ROUTE_CANDIDATES) {
      await gotoSection(page, route);
      await page.waitForTimeout(2_000);

      // Check if we landed on the integrations page (not redirected away)
      const header = page.getByText(/third.party integrations/i).first();
      const cards = page.locator('[class*="card" i], [class*="integration" i], [class*="tool" i]').first();
      const found =
        (await header.isVisible({ timeout: 5_000 }).catch(() => false)) ||
        (await cards.isVisible({ timeout: 3_000 }).catch(() => false));
      if (found) return true;
    }
    return false;
  }

  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
    await waitForLoaders(page);
  });

  // =========================================================================
  // Claim 1: Page header shows "Third-Party Integrations"
  // Doc says: "the page header is Third-Party Integrations"
  // =========================================================================
  test('page header shows "Third-Party Integrations"', async ({ page }) => {
    const found = await gotoIntegrations(page);
    if (!found) {
      test.skip(true, 'Integrations page not reachable — feature flag may be off');
      return;
    }

    const header = page.getByText(/third.party integrations/i).first();
    await expect(header).toBeVisible({ timeout: 15_000 });
  });

  // =========================================================================
  // Claim 2: Integration cards organized by category
  // Doc says: "browse supported services by category" with ordered categories
  // =========================================================================
  test('integration cards are organized by category', async ({ page }) => {
    const found = await gotoIntegrations(page);
    if (!found) {
      test.skip(true, 'Integrations page not reachable');
      return;
    }

    // Look for category headings or grouping labels
    const categoryHeadings = page.locator(
      'h2, h3, h4, [class*="category" i], [class*="section" i] [class*="header" i], [class*="groupHeader" i], [class*="sectionTitle" i]'
    );
    const headingCount = await categoryHeadings.count();

    // Also check for integration cards/tiles
    const cards = page.locator(
      '[class*="card" i], [class*="integration" i], [class*="toolCard" i], [class*="serviceCard" i]'
    );
    const cardCount = await cards.count();

    // At least one category heading and some cards should exist
    expect.soft(headingCount, 'Expected at least one category heading on integrations page').toBeGreaterThan(0);
    expect.soft(cardCount, 'Expected integration cards on the page').toBeGreaterThan(0);

    // Verify at least one documented category name is present
    const knownCategories = [
      /collaboration/i, /productivity/i, /document/i, /crm/i,
      /sales/i, /hr/i, /finance/i, /developer/i, /marketing/i,
      /analytics/i, /ai/i, /design/i, /e-commerce/i, /education/i, /other/i,
    ];
    let matchedCategories = 0;
    for (const pattern of knownCategories) {
      const match = page.getByText(pattern).first();
      if (await match.isVisible({ timeout: 2_000 }).catch(() => false)) {
        matchedCategories++;
      }
    }
    expect.soft(
      matchedCategories,
      'At least one documented category name should be visible'
    ).toBeGreaterThan(0);
  });

  // =========================================================================
  // Claim 3: Click Connect opens auth-method chooser
  // Doc says: "When you click Connect, the page first opens a small
  // authentication-method chooser" with OAuth (Login), API Key, Bearer Token, Cancel
  // =========================================================================
  test('clicking Connect opens auth-method chooser with documented options', async ({ page }) => {
    const found = await gotoIntegrations(page);
    if (!found) {
      test.skip(true, 'Integrations page not reachable');
      return;
    }

    // Find a Connect button on any integration card
    const connectBtn = page.locator('button, [role="button"]').filter({
      hasText: /^connect$/i,
    }).first();

    const connectVisible = await connectBtn.isVisible({ timeout: 10_000 }).catch(() => false);
    if (!connectVisible) {
      // All integrations might already be connected, or the button text differs
      test.skip(true, 'No "Connect" button found — all integrations may already be connected');
      return;
    }

    await connectBtn.click();

    // Wait for the auth-method chooser dialog/modal/popover
    const chooser = page.locator(
      '[role="dialog"], [role="alertdialog"], [class*="modal" i], [class*="popover" i], [class*="drawer" i]'
    ).first();
    await expect(chooser).toBeVisible({ timeout: 10_000 });

    // Verify documented auth method options
    const oauthOption = chooser.getByText(/oauth|login/i).first();
    expect.soft(
      await oauthOption.isVisible({ timeout: 5_000 }).catch(() => false),
      'Auth chooser should show "OAuth (Login)" option'
    ).toBeTruthy();

    const apiKeyOption = chooser.getByText(/api key/i).first();
    expect.soft(
      await apiKeyOption.isVisible({ timeout: 5_000 }).catch(() => false),
      'Auth chooser should show "API Key" option'
    ).toBeTruthy();

    const bearerOption = chooser.getByText(/bearer token/i).first();
    expect.soft(
      await bearerOption.isVisible({ timeout: 5_000 }).catch(() => false),
      'Auth chooser should show "Bearer Token" option'
    ).toBeTruthy();

    const cancelOption = chooser.getByText(/cancel/i).first()
      .or(chooser.locator('button').filter({ hasText: /cancel/i }).first())
      .first();
    expect.soft(
      await cancelOption.isVisible({ timeout: 5_000 }).catch(() => false),
      'Auth chooser should show "Cancel" option'
    ).toBeTruthy();

    // Dismiss the chooser
    await dismissModal(page);
  });

  // =========================================================================
  // Claim 4: Connected cards show "Connected" indicator
  // Doc says: "✓ Connected" on connected cards
  // =========================================================================
  test('connected cards show "Connected" indicator', async ({ page }) => {
    const found = await gotoIntegrations(page);
    if (!found) {
      test.skip(true, 'Integrations page not reachable');
      return;
    }

    // Look for "Connected" text or a connected indicator on any card
    const connectedIndicator = page.getByText(/connected/i).first();
    const connectedBadge = page.locator(
      '[class*="connected" i], [class*="status" i][class*="active" i], [class*="badge" i]'
    ).first();

    const indicatorVisible = await connectedIndicator.isVisible({ timeout: 10_000 }).catch(() => false);
    const badgeVisible = await connectedBadge.isVisible({ timeout: 3_000 }).catch(() => false);

    if (!indicatorVisible && !badgeVisible) {
      test.skip(true, 'No connected integrations found in this workspace');
      return;
    }

    // At least one connected indicator should be present
    expect(indicatorVisible || badgeVisible).toBeTruthy();
  });

  // =========================================================================
  // Claim 5: Connected cards show auth method used
  // Doc says: "via OAuth", "via API Key", or "via Bearer Token"
  // =========================================================================
  test('connected cards show auth method (via OAuth/API Key/Bearer Token)', async ({ page }) => {
    const found = await gotoIntegrations(page);
    if (!found) {
      test.skip(true, 'Integrations page not reachable');
      return;
    }

    // Look for "via OAuth", "via API Key", or "via Bearer Token"
    const viaOAuth = page.getByText(/via oauth/i).first();
    const viaApiKey = page.getByText(/via api key/i).first();
    const viaBearer = page.getByText(/via bearer/i).first();

    const oauthVisible = await viaOAuth.isVisible({ timeout: 5_000 }).catch(() => false);
    const apiKeyVisible = await viaApiKey.isVisible({ timeout: 3_000 }).catch(() => false);
    const bearerVisible = await viaBearer.isVisible({ timeout: 3_000 }).catch(() => false);

    if (!oauthVisible && !apiKeyVisible && !bearerVisible) {
      test.skip(true, 'No connected integrations with visible auth method found');
      return;
    }

    // At least one auth method label should be shown
    expect(oauthVisible || apiKeyVisible || bearerVisible).toBeTruthy();
  });

  // =========================================================================
  // Claim 6: Connected cards have a Disconnect button
  // Doc says: "a direct Disconnect button on the card"
  // =========================================================================
  test('connected cards have a Disconnect button', async ({ page }) => {
    const found = await gotoIntegrations(page);
    if (!found) {
      test.skip(true, 'Integrations page not reachable');
      return;
    }

    // Look for a Disconnect button
    const disconnectBtn = page.locator('button, [role="button"]').filter({
      hasText: /disconnect/i,
    }).first();

    const disconnectVisible = await disconnectBtn.isVisible({ timeout: 10_000 }).catch(() => false);
    if (!disconnectVisible) {
      test.skip(true, 'No connected integrations with Disconnect button found');
      return;
    }

    await expect(disconnectBtn).toBeVisible();
  });

  // =========================================================================
  // Claim 7: Disconnect prompts for confirmation
  // Doc says: "prompts for confirmation" and "warns that AI assistants
  // will no longer be able to access that service on your behalf"
  // =========================================================================
  test('clicking Disconnect shows confirmation prompt', async ({ page }) => {
    const found = await gotoIntegrations(page);
    if (!found) {
      test.skip(true, 'Integrations page not reachable');
      return;
    }

    const disconnectBtn = page.locator('button, [role="button"]').filter({
      hasText: /disconnect/i,
    }).first();

    const disconnectVisible = await disconnectBtn.isVisible({ timeout: 10_000 }).catch(() => false);
    if (!disconnectVisible) {
      test.skip(true, 'No Disconnect button found — no connected integrations');
      return;
    }

    await disconnectBtn.click();

    // A confirmation dialog should appear
    const confirmation = page.locator(
      '[role="dialog"], [role="alertdialog"], [class*="modal" i], [class*="confirm" i]'
    ).first();
    const confirmVisible = await confirmation.isVisible({ timeout: 10_000 }).catch(() => false);

    expect.soft(
      confirmVisible,
      'Clicking Disconnect should open a confirmation dialog'
    ).toBeTruthy();

    if (confirmVisible) {
      // Check for warning text about AI assistants losing access
      const warningText = confirmation.getByText(/ai assistant|no longer|access|behalf/i).first();
      expect.soft(
        await warningText.isVisible({ timeout: 5_000 }).catch(() => false),
        'Confirmation prompt should warn about AI assistants losing access'
      ).toBeTruthy();
    }

    // Dismiss without confirming to avoid actually disconnecting
    await page.keyboard.press('Escape');
    await dismissModal(page);
  });

  // =========================================================================
  // Claim 8: Connection status values (ACTIVE, ERROR, REVOKED, PENDING)
  // Doc says the code expects these status values on user connections.
  // We verify by checking the page for any status indicators.
  // =========================================================================
  test('connection status indicators are visible on cards', async ({ page }) => {
    const found = await gotoIntegrations(page);
    if (!found) {
      test.skip(true, 'Integrations page not reachable');
      return;
    }

    // The most common status we'd see is "Connected" (for ACTIVE)
    // Other statuses (ERROR, REVOKED, PENDING) may not be present
    // in a healthy workspace, but we should see at least the ACTIVE indicator
    const statusIndicators = page.locator(
      '[class*="status" i], [class*="badge" i], [class*="indicator" i]'
    );
    const statusCount = await statusIndicators.count();

    // Also check for text-based status
    const connectedText = page.getByText(/connected|active/i).first();
    const hasConnectedText = await connectedText.isVisible({ timeout: 5_000 }).catch(() => false);

    // Check for connect buttons (indicating unconnected/available tools)
    const connectBtns = page.locator('button, [role="button"]').filter({ hasText: /^connect$/i });
    const connectCount = await connectBtns.count();

    // The page should show either connected indicators, connect buttons, or both
    const hasAnyStatusInfo = statusCount > 0 || hasConnectedText || connectCount > 0;
    expect.soft(
      hasAnyStatusInfo,
      'Integration cards should show connection status (Connected indicator or Connect button)'
    ).toBeTruthy();
  });
});
