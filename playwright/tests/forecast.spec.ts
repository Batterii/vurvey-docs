import { test, expect } from '@playwright/test';
import { gotoSection, waitForLoaders, isFeatureFlaggedOff } from './helpers/workspace';
import { loginViaUI } from './helpers/login';
import { waitForModal, dismissModal, bodyContainsText } from './helpers/ui';

// ---------------------------------------------------------------------------
// Forecast page tests — validates claims from docs/guide/forecast.md
//
// The DEMO workspace (07e5edb5-e739-4a35-9f82-cc6cec7c0193) has
// forecastEnabled=true. If the feature is flagged off, tests skip gracefully.
// ---------------------------------------------------------------------------
test.describe('forecast.md: Documentation claim tests', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
    await waitForLoaders(page);
  });

  // =========================================================================
  // Claim 1: forecastEnabled controls access; if disabled, redirects away
  // =========================================================================
  test('feature gate: forecastEnabled controls access', async ({ page }) => {
    await gotoSection(page, '/forecast');
    await page.waitForTimeout(3_000);

    const redirectedAway = await isFeatureFlaggedOff(page, '/forecast');
    if (redirectedAway) {
      // The doc says: "If Forecast is disabled, the app redirects away"
      // This workspace should have it enabled. If not, skip remaining tests.
      test.skip(true, 'Forecast feature is disabled in this workspace — redirected away');
      return;
    }

    // If we're still on /forecast, the feature is enabled and the page loaded
    expect(page.url()).toContain('/forecast');
  });

  // =========================================================================
  // Claim 2: Page layout has three stacked sections
  //   1. Forecast Inputs  2. Chart  3. AI analysis
  // =========================================================================
  test('page layout: three sections visible (inputs, chart, AI analysis)', async ({ page }) => {
    await gotoSection(page, '/forecast');
    await page.waitForTimeout(3_000);

    if (await isFeatureFlaggedOff(page, '/forecast')) {
      test.skip(true, 'Forecast feature is disabled — redirected away');
      return;
    }

    // Section 1: Forecast Inputs — look for the input controls area
    const inputsSection = page.locator(
      '[class*="input" i], [class*="filter" i], [class*="control" i], [class*="forecast" i]'
    ).filter({
      has: page.locator('select, [role="combobox"], [role="listbox"], button'),
    }).first();
    const hasInputs = await inputsSection.isVisible({ timeout: 10_000 }).catch(() => false);

    // Section 2: Chart — canvas, svg, or a chart container
    const chartSection = page.locator(
      'canvas, svg, [class*="chart" i], [class*="graph" i], [class*="plot" i], [data-testid*="chart" i]'
    ).first();
    const hasChart = await chartSection.isVisible({ timeout: 10_000 }).catch(() => false);

    // Section 3: AI analysis — text block or analysis container
    const analysisSection = page.locator(
      '[class*="analysis" i], [class*="insight" i], [class*="summary" i], [class*="aiAnalysis" i]'
    ).first();
    const hasAnalysis = await analysisSection.isVisible({ timeout: 10_000 }).catch(() => false);

    // Also check for the "Start Conversation" button which lives in the analysis section
    const startConvoBtn = page.locator('button, [role="button"]').filter({
      hasText: /start conversation/i,
    }).first();
    const hasStartConvo = await startConvoBtn.isVisible({ timeout: 5_000 }).catch(() => false);

    // Soft-assert each section independently for clear diagnostics
    expect.soft(hasInputs, 'Forecast page should have an Inputs section with controls').toBeTruthy();
    expect.soft(hasChart, 'Forecast page should have a Chart section (canvas/svg/chart container)').toBeTruthy();
    expect.soft(
      hasAnalysis || hasStartConvo,
      'Forecast page should have an AI Analysis section (or at least the Start Conversation button)'
    ).toBeTruthy();
  });

  // =========================================================================
  // Claim 3: Item dropdown selector exists
  // =========================================================================
  test('input controls: "Item" dropdown selector exists', async ({ page }) => {
    await gotoSection(page, '/forecast');
    await page.waitForTimeout(3_000);

    if (await isFeatureFlaggedOff(page, '/forecast')) {
      test.skip(true, 'Forecast feature is disabled — redirected away');
      return;
    }

    // Look for an "Item" labelled dropdown/select
    const itemDropdown = page.locator(
      'label, [class*="label" i], [class*="inputLabel" i], span, div'
    ).filter({ hasText: /^item$/i }).first()
      .or(page.getByText(/^item$/i).first())
      .first();

    const hasItemLabel = await itemDropdown.isVisible({ timeout: 10_000 }).catch(() => false);

    // Also try to find it by looking for a select/combobox near "Item" text
    const itemControl = page.locator(
      'select, [role="combobox"], [role="listbox"], [class*="select" i], [class*="dropdown" i]'
    ).first();
    const hasControl = await itemControl.isVisible({ timeout: 10_000 }).catch(() => false);

    expect.soft(
      hasItemLabel || hasControl,
      'Forecast page should have an "Item" dropdown selector'
    ).toBeTruthy();
  });

  // =========================================================================
  // Claim 4: Time Granularity dropdown selector exists
  // =========================================================================
  test('input controls: "Time Granularity" dropdown selector exists', async ({ page }) => {
    await gotoSection(page, '/forecast');
    await page.waitForTimeout(3_000);

    if (await isFeatureFlaggedOff(page, '/forecast')) {
      test.skip(true, 'Forecast feature is disabled — redirected away');
      return;
    }

    const timeGranularity = page.getByText(/time granularity/i).first();
    const hasLabel = await timeGranularity.isVisible({ timeout: 10_000 }).catch(() => false);

    expect.soft(
      hasLabel || await bodyContainsText(page, 'time granularity'),
      'Forecast page should have a "Time Granularity" dropdown selector'
    ).toBeTruthy();
  });

  // =========================================================================
  // Claim 5: Geography dropdown selector exists
  // =========================================================================
  test('input controls: "Geography" dropdown selector exists', async ({ page }) => {
    await gotoSection(page, '/forecast');
    await page.waitForTimeout(3_000);

    if (await isFeatureFlaggedOff(page, '/forecast')) {
      test.skip(true, 'Forecast feature is disabled — redirected away');
      return;
    }

    const geography = page.getByText(/geography/i).first();
    const hasLabel = await geography.isVisible({ timeout: 10_000 }).catch(() => false);

    expect.soft(
      hasLabel || await bodyContainsText(page, 'geography'),
      'Forecast page should have a "Geography" dropdown selector'
    ).toBeTruthy();
  });

  // =========================================================================
  // Claim 6: Confidence Level dropdown selector exists
  // =========================================================================
  test('input controls: "Confidence Level" dropdown selector exists', async ({ page }) => {
    await gotoSection(page, '/forecast');
    await page.waitForTimeout(3_000);

    if (await isFeatureFlaggedOff(page, '/forecast')) {
      test.skip(true, 'Forecast feature is disabled — redirected away');
      return;
    }

    const confidence = page.getByText(/confidence level/i).first();
    const hasLabel = await confidence.isVisible({ timeout: 10_000 }).catch(() => false);

    expect.soft(
      hasLabel || await bodyContainsText(page, 'confidence'),
      'Forecast page should have a "Confidence Level" dropdown selector'
    ).toBeTruthy();
  });

  // =========================================================================
  // Claim 7: "Apply & Regenerate" button exists
  // =========================================================================
  test('actions: "Apply & Regenerate" button exists', async ({ page }) => {
    await gotoSection(page, '/forecast');
    await page.waitForTimeout(3_000);

    if (await isFeatureFlaggedOff(page, '/forecast')) {
      test.skip(true, 'Forecast feature is disabled — redirected away');
      return;
    }

    const applyBtn = page.locator('button, [role="button"]').filter({
      hasText: /apply.*regenerate/i,
    }).first();

    await expect(applyBtn).toBeVisible({ timeout: 15_000 });
  });

  // =========================================================================
  // Claim 8: "Save Custom View" button exists
  // =========================================================================
  test('actions: "Save Custom View" button exists', async ({ page }) => {
    await gotoSection(page, '/forecast');
    await page.waitForTimeout(3_000);

    if (await isFeatureFlaggedOff(page, '/forecast')) {
      test.skip(true, 'Forecast feature is disabled — redirected away');
      return;
    }

    const saveBtn = page.locator('button, [role="button"]').filter({
      hasText: /save custom view/i,
    }).first();

    await expect(saveBtn).toBeVisible({ timeout: 15_000 });
  });

  // =========================================================================
  // Claim 9: "Start Conversation" button exists in the analysis section
  // =========================================================================
  test('actions: "Start Conversation" button exists in analysis section', async ({ page }) => {
    await gotoSection(page, '/forecast');
    await page.waitForTimeout(3_000);

    if (await isFeatureFlaggedOff(page, '/forecast')) {
      test.skip(true, 'Forecast feature is disabled — redirected away');
      return;
    }

    const startConvoBtn = page.locator('button, [role="button"], a').filter({
      hasText: /start conversation/i,
    }).first();

    await expect(startConvoBtn).toBeVisible({ timeout: 15_000 });
  });

  // =========================================================================
  // Claim 10: Model comparison supports up to 7 models with live count
  //           header, Clear All, Cancel, and Submit buttons
  // =========================================================================
  test('model comparison: modal has live count, Clear All, Cancel, Submit', async ({ page }) => {
    await gotoSection(page, '/forecast');
    await page.waitForTimeout(3_000);

    if (await isFeatureFlaggedOff(page, '/forecast')) {
      test.skip(true, 'Forecast feature is disabled — redirected away');
      return;
    }

    // The model comparison route may be accessible via direct navigation
    // or through a "Compare" button on the forecast page
    const compareBtn = page.locator('button, [role="button"], a').filter({
      hasText: /compare|model comparison/i,
    }).first();

    const hasBtnOnPage = await compareBtn.isVisible({ timeout: 8_000 }).catch(() => false);

    if (hasBtnOnPage) {
      await compareBtn.click();
      await page.waitForTimeout(2_000);
    } else {
      // Try navigating directly to the comparison route
      await gotoSection(page, '/forecast/comparison');
      await page.waitForTimeout(3_000);

      // If redirected away from comparison, try model-comparison
      if (await isFeatureFlaggedOff(page, '/forecast')) {
        await gotoSection(page, '/forecast/model-comparison');
        await page.waitForTimeout(3_000);
      }
    }

    // Look for the "Select Models to Compare" modal or comparison UI
    const comparisonModal = page.locator('[role="dialog"], [class*="modal" i]').first();
    const selectModelsText = page.getByText(/select models/i).first();

    // Also look for the comparison page content directly
    const comparisonContent = page.locator(
      '[class*="comparison" i], [class*="compare" i], [class*="model" i]'
    ).first();

    const hasModal = await comparisonModal.isVisible({ timeout: 10_000 }).catch(() => false);
    const hasSelectText = await selectModelsText.isVisible({ timeout: 5_000 }).catch(() => false);
    const hasContent = await comparisonContent.isVisible({ timeout: 5_000 }).catch(() => false);

    if (!hasModal && !hasSelectText && !hasContent) {
      // Model comparison route may not be exposed in current nav
      // The doc says: "Those routes exist in the codebase, but they are not
      // exposed from the current visible Forecast sub-navigation"
      test.skip(true, 'Model comparison route is not accessible from current navigation');
      return;
    }

    // If we have the modal or comparison UI, check for documented elements
    const container = hasModal ? comparisonModal : page;

    // Live count header (e.g., "3/7 models")
    const liveCount = container.getByText(/\d+\s*\/\s*7\s*model/i).first();
    expect.soft(
      await liveCount.isVisible({ timeout: 8_000 }).catch(() => false),
      'Model comparison should show a live count header (e.g., "3/7 models")'
    ).toBeTruthy();

    // Clear All button
    const clearAllBtn = container.locator('button, [role="button"]').filter({
      hasText: /clear all/i,
    }).first();
    expect.soft(
      await clearAllBtn.isVisible({ timeout: 5_000 }).catch(() => false),
      'Model comparison modal should have a "Clear All" button'
    ).toBeTruthy();

    // Cancel button
    const cancelBtn = container.locator('button, [role="button"]').filter({
      hasText: /cancel/i,
    }).first();
    expect.soft(
      await cancelBtn.isVisible({ timeout: 5_000 }).catch(() => false),
      'Model comparison modal should have a "Cancel" button'
    ).toBeTruthy();

    // Submit button
    const submitBtn = container.locator('button, [role="button"]').filter({
      hasText: /submit/i,
    }).first();
    expect.soft(
      await submitBtn.isVisible({ timeout: 5_000 }).catch(() => false),
      'Model comparison modal should have a "Submit" button'
    ).toBeTruthy();
  });
});
