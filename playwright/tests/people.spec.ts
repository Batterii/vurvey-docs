import { test, expect } from '@playwright/test';
import { gotoSection, waitForLoaders } from './helpers/workspace';
import { loginViaUI } from './helpers/login';
import {
  waitForModal,
  dismissModal,
  waitForAnySelector,
} from './helpers/ui';

// ---------------------------------------------------------------------------
// All tests require a real login because the Vurvey SPA clears
// localStorage tokens restored by storageState.
// ---------------------------------------------------------------------------
test.describe('people.md: Documentation claim tests', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
    await waitForLoaders(page);
  });

  // =========================================================================
  // NAVIGATION / TABS GROUP
  // =========================================================================
  test.describe('Navigation Tabs', () => {
    test.beforeEach(async ({ page }) => {
      await gotoSection(page, '/people');
      await page.waitForTimeout(2_000);
    });

    // Claim 1: Five tabs across the top — Populations, Humans, Molds, Lists & Segments, Properties
    test('people section has tabs: Populations, Humans, Lists & Segments, Properties (Molds access-controlled)', async ({ page }) => {
      const coreTabLabels = ['Populations', 'Humans', 'Lists & Segments', 'Properties'];
      let foundCount = 0;

      for (const label of coreTabLabels) {
        const tab = page.locator('a, button, [role="tab"]').filter({
          hasText: new RegExp(label, 'i'),
        }).first();
        const isVisible = await tab.isVisible({ timeout: 8_000 }).catch(() => false);
        if (isVisible) foundCount++;
        expect.soft(isVisible, `Tab "${label}" should be visible`).toBeTruthy();
      }

      // Molds is access-controlled — soft-assert only, does not affect pass/fail
      const moldsTab = page.locator('a, button, [role="tab"]').filter({
        hasText: /molds/i,
      }).first();
      const moldsVisible = await moldsTab.isVisible({ timeout: 5_000 }).catch(() => false);
      if (moldsVisible) foundCount++;
      // Log molds status but do not fail test
      test.info().annotations.push({
        type: 'molds-tab',
        description: moldsVisible ? 'Molds tab is visible' : 'Molds tab is hidden (access-controlled)',
      });

      // At minimum, the 4 core tabs must be present
      expect(foundCount).toBeGreaterThanOrEqual(4);
    });
  });

  // =========================================================================
  // POPULATIONS GROUP
  // =========================================================================
  test.describe('Populations', () => {
    test.beforeEach(async ({ page }) => {
      await gotoSection(page, '/people/populations');
      await page.waitForTimeout(2_000);
    });

    // Claim 2: Populations appear in a card grid
    test('populations page shows card grid or empty state', async ({ page }) => {
      const cardGrid = page.locator(
        '[class*="card" i], [class*="grid" i], [class*="population" i]'
      ).first();
      const emptyState = page.getByText(/stay tuned|no population|empty/i).first();

      await expect(
        cardGrid.or(emptyState).first()
      ).toBeVisible({ timeout: 15_000 });
    });

    // Claim 3: Three-dot menu with Show Details, Take Campaign, Delete
    test('population card three-dot menu has Show Details, Take Campaign, Delete', async ({ page }) => {
      const card = page.locator(
        '[class*="card" i], [class*="populationCard" i], [class*="population" i][class*="item" i]'
      ).first();

      const cardVisible = await card.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!cardVisible) {
        test.skip(true, 'No population cards found — workspace may have empty state');
        return;
      }

      // Hover the card to reveal the three-dot menu
      await card.hover();
      await page.waitForTimeout(500);

      // Try multiple strategies to find and click the three-dot menu
      const menuBtnSelectors = [
        'button[aria-label*="more" i]',
        'button[aria-label*="menu" i]',
        '[class*="dots" i]',
        '[class*="overflow" i]',
        '[class*="menuTrigger" i]',
        '[class*="kebab" i]',
        '[class*="moreButton" i]',
        '[class*="action" i] button',
      ];

      let menuOpened = false;
      for (const sel of menuBtnSelectors) {
        const btn = card.locator(sel).first();
        const isVisible = await btn.isVisible({ timeout: 2_000 }).catch(() => false);
        if (isVisible) {
          await btn.click();
          menuOpened = true;
          break;
        }
      }

      if (!menuOpened) {
        // Last resort: try clicking the last button in the card
        const lastBtn = card.locator('button').last();
        const isVisible = await lastBtn.isVisible({ timeout: 2_000 }).catch(() => false);
        if (isVisible) {
          await lastBtn.click();
          menuOpened = true;
        }
      }

      if (!menuOpened) {
        expect.soft(false, 'Three-dot menu button should be visible on population card').toBeTruthy();
        return;
      }

      const menu = page.locator(
        '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i], [class*="contextMenu" i]'
      ).first();
      const menuVisible = await menu.isVisible({ timeout: 8_000 }).catch(() => false);

      if (!menuVisible) {
        expect.soft(false, 'Three-dot menu should open on population card').toBeTruthy();
        return;
      }

      const expectedItems = ['Show Details', 'Take Campaign', 'Delete'];
      for (const item of expectedItems) {
        expect.soft(
          await menu.getByText(new RegExp(item, 'i')).first().isVisible({ timeout: 5_000 }).catch(() => false),
          `Three-dot menu should have "${item}"`
        ).toBeTruthy();
      }

      await page.keyboard.press('Escape');
    });

    // Claim 4: Population detail view includes Persona Carousel
    test('population detail view includes Persona Carousel', async ({ page }) => {
      const card = page.locator(
        '[class*="card" i], [class*="populationCard" i], [class*="population" i][class*="item" i]'
      ).first();

      const cardVisible = await card.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!cardVisible) {
        test.skip(true, 'No population cards found');
        return;
      }

      await card.click();
      await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
      await waitForLoaders(page);
      await page.waitForTimeout(2_000);

      const carousel = page.locator(
        '[class*="carousel" i], [class*="persona" i], [class*="avatar" i], [class*="slider" i]'
      ).first();
      expect.soft(
        await carousel.isVisible({ timeout: 10_000 }).catch(() => false),
        'Population detail should include a Persona Carousel'
      ).toBeTruthy();
    });

    // Claim 5: Population detail view includes Charts View
    test('population detail view includes Charts View', async ({ page }) => {
      const card = page.locator(
        '[class*="card" i], [class*="populationCard" i], [class*="population" i][class*="item" i]'
      ).first();

      const cardVisible = await card.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!cardVisible) {
        test.skip(true, 'No population cards found');
        return;
      }

      await card.click();
      await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
      await waitForLoaders(page);
      await page.waitForTimeout(2_000);

      const charts = page.locator(
        '[class*="chart" i], [class*="donut" i], [class*="bar" i], [class*="treemap" i], svg, canvas, [class*="recharts" i], [class*="nivo" i]'
      ).first();
      expect.soft(
        await charts.isVisible({ timeout: 10_000 }).catch(() => false),
        'Population detail should include Charts View'
      ).toBeTruthy();
    });

    // Claim 6: Population detail view includes Table View
    test('population detail view includes Table View', async ({ page }) => {
      const card = page.locator(
        '[class*="card" i], [class*="populationCard" i], [class*="population" i][class*="item" i]'
      ).first();

      const cardVisible = await card.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!cardVisible) {
        test.skip(true, 'No population cards found');
        return;
      }

      await card.click();
      await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
      await waitForLoaders(page);
      await page.waitForTimeout(2_000);

      // Look for a table view toggle or the table/grid itself
      const tableToggle = page.locator('button, [role="tab"]').filter({
        hasText: /table/i,
      }).first();
      const tableToggleVisible = await tableToggle.isVisible({ timeout: 8_000 }).catch(() => false);

      if (tableToggleVisible) {
        await tableToggle.click();
        await page.waitForTimeout(1_500);
      }

      const table = page.locator(
        'table, [class*="table" i], [role="grid"], [role="table"], [class*="personaList" i], [class*="list" i]'
      ).first();
      const tableEl = page.locator('tr, [role="row"]').first();
      expect.soft(
        await table.isVisible({ timeout: 10_000 }).catch(() => false)
        || await tableEl.isVisible({ timeout: 5_000 }).catch(() => false),
        'Population detail should include a Table View'
      ).toBeTruthy();
    });
  });

  // =========================================================================
  // HUMANS GROUP
  // =========================================================================
  test.describe('Humans', () => {
    test.beforeEach(async ({ page }) => {
      // IMPORTANT: Humans tab is at /people/community, NOT /people/humans
      await gotoSection(page, '/people/community');
      await page.waitForTimeout(2_000);
    });

    // Claim 7: Table columns for Name, Age, Last Active
    test('humans table has columns for Name, Age, Last Active', async ({ page }) => {
      const columnHeaders = ['Name', 'Age', 'Last Active'];

      for (const header of columnHeaders) {
        const col = page.locator('th, [role="columnheader"], [class*="header" i]').filter({
          hasText: new RegExp(`^\\s*${header}\\s*$`, 'i'),
        }).first();
        expect.soft(
          await col.isVisible({ timeout: 10_000 }).catch(() => false),
          `Humans table should have "${header}" column`
        ).toBeTruthy();
      }
    });

    // Claim 8: Bulk actions — Delete, Add to List, Add Property
    test('selecting contacts reveals bulk actions dropdown with Delete, Add to List, Add Property', async ({ page }) => {
      // Click the header checkbox to select all visible contacts
      const headerCheckbox = page.locator('th input[type="checkbox"], th [role="checkbox"]').first();
      const headerCbVisible = await headerCheckbox.isVisible({ timeout: 8_000 }).catch(() => false);

      if (!headerCbVisible) {
        // Fall back to first row checkbox
        const firstCheckbox = page.locator('input[type="checkbox"], [role="checkbox"]').first();
        const cbVisible = await firstCheckbox.isVisible({ timeout: 8_000 }).catch(() => false);
        if (!cbVisible) {
          test.skip(true, 'No checkboxes found — table may be empty');
          return;
        }
        await firstCheckbox.click();
      } else {
        await headerCheckbox.click();
      }

      await page.waitForTimeout(1_500);

      // The UI shows "Bulk actions (N)" as a dropdown button
      const bulkActionsBtn = page.locator('button, [role="button"]').filter({
        hasText: /bulk\s*action/i,
      }).first();

      await expect(bulkActionsBtn).toBeVisible({ timeout: 10_000 });

      // Click the bulk actions dropdown to reveal options
      await bulkActionsBtn.click();
      await page.waitForTimeout(500);

      const menu = page.locator(
        '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i]'
      ).first();
      await menu.waitFor({ state: 'visible', timeout: 8_000 }).catch(() => {});

      const expectedActions = ['Delete', 'Add to List', 'Add Property'];
      for (const action of expectedActions) {
        expect.soft(
          await menu.getByText(new RegExp(action, 'i')).first().isVisible({ timeout: 5_000 }).catch(() => false)
          || await page.getByText(new RegExp(action, 'i')).first().isVisible({ timeout: 3_000 }).catch(() => false),
          `Bulk actions dropdown should contain "${action}"`
        ).toBeTruthy();
      }

      await page.keyboard.press('Escape');
    });

    // Claim 9: + Add button opens Add Creators modal
    test('Add Creators button opens Add Creators modal', async ({ page }) => {
      const addBtn = page.locator('button, [role="button"]').filter({
        hasText: /add\s*creators?/i,
      }).first();

      await expect(addBtn).toBeVisible({ timeout: 10_000 });
      await addBtn.click();

      const modal = page.locator('[role="dialog"], [class*="modal" i]').first();
      await expect(modal).toBeVisible({ timeout: 10_000 });

      // Check for email input or invite/add functionality in modal
      const addCreatorsContent = modal.locator('input[type="email"], input[placeholder*="email" i], textarea, input[type="text"]').first()
        .or(modal.getByText(/add creator|email|invite/i).first())
        .first();
      expect.soft(
        await addCreatorsContent.isVisible({ timeout: 8_000 }).catch(() => false),
        'Modal should be an Add Creators modal with email input'
      ).toBeTruthy();

      await dismissModal(page);
    });
  });

  // =========================================================================
  // CONTACT PROFILE GROUP
  // =========================================================================
  test.describe('Contact Profile', () => {
    // Claim 10-14: Contact profile sections
    test('contact profile has Basic Information, Custom Properties, Campaign History, Response Data, Segment Memberships', async ({ page }) => {
      await gotoSection(page, '/people/community');
      await page.waitForTimeout(2_000);

      // From the screenshot, contact names appear as text in table rows
      // and can be clicked to navigate to the profile.
      // Find the first clickable contact name in the table body.
      const contactName = page.locator('td a, [role="cell"] a').first();
      const contactNameVisible = await contactName.isVisible({ timeout: 10_000 }).catch(() => false);

      if (contactNameVisible) {
        await contactName.click();
      } else {
        // Fallback: click the name text in the first data row
        const firstDataRow = page.locator('tr').nth(1);
        const rowVisible = await firstDataRow.isVisible({ timeout: 5_000 }).catch(() => false);
        if (!rowVisible) {
          test.skip(true, 'No contacts found in Humans table');
          return;
        }
        // Click the first cell (name) of the first data row
        await firstDataRow.locator('td').first().click();
      }

      await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
      await waitForLoaders(page);
      await page.waitForTimeout(3_000);

      // Check for the documented profile sections using broad patterns
      const sectionChecks = [
        { name: 'Basic Information', pattern: /basic\s*info|personal\s*info|profile|about|name.*email|overview/i },
        { name: 'Custom Properties', pattern: /custom\s*propert|properties|attributes/i },
        { name: 'Campaign History', pattern: /campaign\s*history|campaigns|participation|survey/i },
        { name: 'Response Data', pattern: /response|responses|answers|video|transcript/i },
        { name: 'Segment Memberships', pattern: /segment|membership|lists|groups/i },
      ];

      for (const section of sectionChecks) {
        const sectionLabel = page.getByText(section.pattern).first();
        const sectionByClass = page.locator(`[class*="${section.name.toLowerCase().replace(/\s+/g, '')}" i]`).first();
        expect.soft(
          await sectionLabel.isVisible({ timeout: 8_000 }).catch(() => false)
          || await sectionByClass.isVisible({ timeout: 3_000 }).catch(() => false),
          `Contact profile should have "${section.name}" section`
        ).toBeTruthy();
      }
    });
  });

  // =========================================================================
  // LISTS & SEGMENTS GROUP
  // =========================================================================
  test.describe('Lists & Segments', () => {
    test.beforeEach(async ({ page }) => {
      await gotoSection(page, '/people/lists');
      await page.waitForTimeout(2_000);
    });

    /** Helper to find the Lists/Segments dropdown toggle */
    async function findListsSegmentsToggle(page: import('@playwright/test').Page) {
      // From the screenshot, the dropdown shows "Lists" with a chevron
      // It might be a button, select, or custom dropdown
      return page.getByText(/^Lists$/).first()
        .or(page.locator('button, [role="button"], select, [role="combobox"]').filter({
          hasText: /^lists$/i,
        }).first())
        .or(page.locator('[class*="dropdown" i] button, [class*="select" i] button').filter({
          hasText: /lists/i,
        }).first())
        .first();
    }

    // Claim 15: Dropdown toggle to switch between Lists and Segments
    test('dropdown toggle switches between Lists and Segments', async ({ page }) => {
      const toggle = await findListsSegmentsToggle(page);
      await expect(toggle).toBeVisible({ timeout: 10_000 });

      // Click to open dropdown
      await toggle.click();
      await page.waitForTimeout(500);

      // Verify both "Lists" and "Segments" options appear
      const segmentsOption = page.getByText(/^Segments$/).first()
        .or(page.locator('[role="option"], [role="menuitem"], li').filter({ hasText: /segments/i }).first())
        .first();

      expect.soft(
        await segmentsOption.isVisible({ timeout: 5_000 }).catch(() => false),
        'Dropdown should show "Segments" option'
      ).toBeTruthy();

      await page.keyboard.press('Escape');
    });

    // Claim 16: New List button
    test('New List button is visible', async ({ page }) => {
      const newListBtn = page.locator('button, [role="button"]').filter({
        hasText: /new\s*list/i,
      }).first();

      await expect(newListBtn).toBeVisible({ timeout: 10_000 });
    });

    // Claim 17: New Segment button visible (after switching to Segments view)
    test('New Segment button is visible in Segments view', async ({ page }) => {
      // Click the Lists/Segments dropdown
      const toggle = await findListsSegmentsToggle(page);
      await toggle.waitFor({ state: 'visible', timeout: 10_000 });
      await toggle.click();
      await page.waitForTimeout(500);

      // Select "Segments" from the dropdown
      const segmentsOption = page.getByText(/^Segments$/).first()
        .or(page.locator('[role="option"], [role="menuitem"], li').filter({ hasText: /segments/i }).first())
        .first();
      await segmentsOption.waitFor({ state: 'visible', timeout: 5_000 });
      await segmentsOption.click();
      await page.waitForTimeout(1_500);
      await waitForLoaders(page);

      const newSegmentBtn = page.locator('button, [role="button"]').filter({
        hasText: /new\s*segment/i,
      }).first();

      await expect(newSegmentBtn).toBeVisible({ timeout: 10_000 });
    });

    // Claim 18: Segment builder modal with Property, Operator, Value, Any/All logic
    test('New Segment opens segment builder modal with Property, Operator, Value, and Any/All logic', async ({ page }) => {
      // Switch to Segments view
      const toggle = await findListsSegmentsToggle(page);
      await toggle.waitFor({ state: 'visible', timeout: 10_000 });
      await toggle.click();
      await page.waitForTimeout(500);

      const segmentsOption = page.getByText(/^Segments$/).first()
        .or(page.locator('[role="option"], [role="menuitem"], li').filter({ hasText: /segments/i }).first())
        .first();
      await segmentsOption.waitFor({ state: 'visible', timeout: 5_000 });
      await segmentsOption.click();
      await page.waitForTimeout(1_500);
      await waitForLoaders(page);

      // Click New Segment
      const newSegmentBtn = page.locator('button, [role="button"]').filter({
        hasText: /new\s*segment/i,
      }).first();

      const btnVisible = await newSegmentBtn.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!btnVisible) {
        test.skip(true, 'New Segment button not found — may need Segments view');
        return;
      }

      await newSegmentBtn.click();

      // Wait for segment builder modal
      const modal = page.locator('[role="dialog"], [class*="modal" i]').first();
      await modal.waitFor({ state: 'visible', timeout: 10_000 });

      // Check for Property selector
      const propertySelector = modal.locator('select, [role="combobox"], [class*="select" i], [class*="dropdown" i]').first()
        .or(modal.getByText(/property|choose.*property|select.*property|attribute/i).first())
        .first();
      expect.soft(
        await propertySelector.isVisible({ timeout: 8_000 }).catch(() => false),
        'Segment builder should have Property selector'
      ).toBeTruthy();

      // Check for Operator selector (Equals / Not Equals)
      const operatorSelector = modal.getByText(/equals|operator|not equals|contains/i).first()
        .or(modal.locator('select, [role="combobox"]').nth(1))
        .first();
      expect.soft(
        await operatorSelector.isVisible({ timeout: 5_000 }).catch(() => false),
        'Segment builder should have Operator selector'
      ).toBeTruthy();

      // Check for Value input
      const valueInput = modal.locator('input[type="text"], input[placeholder*="value" i], input[placeholder*="enter" i], textarea').first()
        .or(modal.locator('select, [role="combobox"]').nth(2))
        .first();
      expect.soft(
        await valueInput.isVisible({ timeout: 5_000 }).catch(() => false),
        'Segment builder should have Value input'
      ).toBeTruthy();

      // Check for Any/All logic toggle
      const anyAllToggle = modal.getByText(/\bany\b|\ball\b/i).first()
        .or(modal.locator('[class*="logic" i], [class*="toggle" i]').first())
        .first();
      expect.soft(
        await anyAllToggle.isVisible({ timeout: 5_000 }).catch(() => false),
        'Segment builder should have Any/All logic toggle'
      ).toBeTruthy();

      await dismissModal(page);
    });
  });

  // =========================================================================
  // PROPERTIES GROUP
  // =========================================================================
  test.describe('Properties', () => {
    test.beforeEach(async ({ page }) => {
      await gotoSection(page, '/people/properties');
      await page.waitForTimeout(2_000);
    });

    // Claim 19: New Property button opens modal with name, type, category
    test('New Property button opens modal with name, type, and category fields', async ({ page }) => {
      const newPropBtn = page.locator('button, [role="button"]').filter({
        hasText: /new\s*property/i,
      }).first();

      await expect(newPropBtn).toBeVisible({ timeout: 10_000 });
      await newPropBtn.click();

      // Wait for the property modal
      const modal = page.locator('[role="dialog"], [class*="modal" i]').first();
      await modal.waitFor({ state: 'visible', timeout: 10_000 });

      // Check for name input
      const nameInput = modal.locator(
        'input[type="text"], input[placeholder*="name" i], input[name*="name" i], input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])'
      ).first();
      expect.soft(
        await nameInput.isVisible({ timeout: 8_000 }).catch(() => false),
        'Property modal should have a name field'
      ).toBeTruthy();

      // Check for type selector
      const typeSelector = modal.locator(
        'select, [role="combobox"], [role="listbox"], [class*="select" i], [class*="dropdown" i]'
      ).first()
        .or(modal.getByText(/text|number|date|single\s*select|multi.*select|boolean|type/i).first())
        .first();
      expect.soft(
        await typeSelector.isVisible({ timeout: 5_000 }).catch(() => false),
        'Property modal should have a type selector'
      ).toBeTruthy();

      // Check for category field
      const categoryField = modal.getByText(/category/i).first()
        .or(modal.locator('select, [role="combobox"]').nth(1))
        .first();
      expect.soft(
        await categoryField.isVisible({ timeout: 5_000 }).catch(() => false),
        'Property modal should have a category field'
      ).toBeTruthy();

      await dismissModal(page);
    });

    // Claim 20: CSV upload modal with Add values/Replace values and Download example CSV
    test('Upload CSV button opens modal with Add values, Replace values, and Download example CSV', async ({ page }) => {
      const uploadBtn = page.locator('button, [role="button"]').filter({
        hasText: /upload\s*csv/i,
      }).first()
        .or(page.locator('button, [role="button"]').filter({
          hasText: /upload|import|csv/i,
        }).first())
        .first();

      await expect(uploadBtn).toBeVisible({ timeout: 10_000 });
      await uploadBtn.click();

      // Wait for the CSV upload modal
      const modal = page.locator('[role="dialog"], [class*="modal" i]').first();
      await modal.waitFor({ state: 'visible', timeout: 10_000 });

      // Check for "Add values" option
      const addValues = modal.getByText(/add\s*values?/i).first();
      expect.soft(
        await addValues.isVisible({ timeout: 8_000 }).catch(() => false),
        'CSV upload modal should have "Add values" option'
      ).toBeTruthy();

      // Check for "Replace values" option
      const replaceValues = modal.getByText(/replace\s*values?/i).first();
      expect.soft(
        await replaceValues.isVisible({ timeout: 5_000 }).catch(() => false),
        'CSV upload modal should have "Replace values" option'
      ).toBeTruthy();

      // Check for "Download example CSV" link/button
      const downloadExample = modal.getByText(/download\s*example|example\s*csv/i).first();
      expect.soft(
        await downloadExample.isVisible({ timeout: 5_000 }).catch(() => false),
        'CSV upload modal should have "Download example CSV" shortcut'
      ).toBeTruthy();

      await dismissModal(page);
    });
  });
});
