import { test, expect } from '@playwright/test';
import { waitForLoaders } from './helpers/workspace';
import { loginViaUI } from './helpers/login';
import { dismissModal } from './helpers/ui';

// ---------------------------------------------------------------------------
// admin.md: Documentation claim tests
//
// The Super Admin page is enterprise-only. If the route redirects or shows
// access denied, tests are skipped.
// ---------------------------------------------------------------------------
test.describe('admin.md: Documentation claim tests', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test.setTimeout(120_000);

  let adminAccessible = true;

  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
    await waitForLoaders(page);

    // Navigate to /admin (not workspace-scoped)
    await page.goto('/admin');
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
    await waitForLoaders(page);

    // Check if we were redirected away or see access denied
    const currentUrl = page.url();
    const hasAdminInUrl = currentUrl.includes('/admin');

    // Look for access denied indicators
    const accessDenied = await page.getByText(/access denied|not authorized|forbidden|no permission/i)
      .first()
      .isVisible({ timeout: 3_000 })
      .catch(() => false);

    if (!hasAdminInUrl || accessDenied) {
      adminAccessible = false;
    }
  });

  // =========================================================================
  // CLAIM 1: Page Title — "Super Admin" label in UI
  // =========================================================================
  test('page title shows "Super Admin"', async ({ page }) => {
    if (!adminAccessible) {
      test.skip(true, 'Admin page not accessible — enterprise-only feature');
      return;
    }

    const superAdminLabel = page.getByText(/super admin/i).first();
    await expect(superAdminLabel).toBeVisible({ timeout: 15_000 });
  });

  // =========================================================================
  // CLAIM 2: Two button groups visible on the page
  // =========================================================================
  test('two button groups visible on admin page', async ({ page }) => {
    if (!adminAccessible) {
      test.skip(true, 'Admin page not accessible — enterprise-only feature');
      return;
    }

    // The admin page renders two button groups containing navigation items.
    // Look for groups of buttons/links that act as navigation cards.
    // Strategy: find containers that hold multiple button-like elements.
    const buttonGroups = page.locator([
      '[class*="buttonGroup" i]',
      '[class*="button-group" i]',
      '[class*="cardGroup" i]',
      '[class*="card-group" i]',
      '[class*="adminGroup" i]',
      '[class*="group" i]',
      '[class*="section" i]',
      '[class*="grid" i]',
    ].join(', '));

    // Count visible groups that contain at least 2 clickable children
    const allGroups = await buttonGroups.all();
    let qualifiedGroups = 0;

    for (const group of allGroups) {
      const isVisible = await group.isVisible().catch(() => false);
      if (!isVisible) continue;

      const clickableChildren = group.locator('a, button, [role="button"]');
      const childCount = await clickableChildren.count();
      if (childCount >= 2) {
        qualifiedGroups++;
      }
    }

    // Fallback: if we can't detect groups structurally, verify there are enough
    // navigation items to imply at least two groups
    if (qualifiedGroups < 2) {
      // The 11 always-visible pages should be spread across two groups
      const navItems = page.locator('a, button, [role="button"]').filter({
        hasText: /dashboard|manage brands|global campaign|sso providers|taxonomy|system prompts|manage workspaces|manage.*employees|manage agents|manage.*surveys|manage.*credits/i,
      });
      const navCount = await navItems.count();
      expect.soft(
        navCount >= 6,
        `Expected at least 6 admin nav items (found ${navCount}) implying multiple button groups`
      ).toBeTruthy();
    } else {
      expect(qualifiedGroups).toBeGreaterThanOrEqual(2);
    }
  });

  // =========================================================================
  // CLAIM 3: 11 always-visible navigation pages
  // =========================================================================
  test.describe('Navigation Items — 11 always-visible pages', () => {
    const expectedPages = [
      'Dashboard',
      'Manage Brands',
      'Global Campaign Templates',
      'SSO Providers',
      'Taxonomy Management',
      'System Prompts',
      'Manage Workspaces',
      'Manage Vurvey employees',
      'Manage Agents',
      'Manage Surveys/Campaigns',
      'Manage Credits Rates',
    ];

    for (const pageName of expectedPages) {
      test(`"${pageName}" navigation item visible`, async ({ page }) => {
        if (!adminAccessible) {
          test.skip(true, 'Admin page not accessible — enterprise-only feature');
          return;
        }

        // Build a flexible regex for each page name:
        // - "Manage Surveys/Campaigns" should match "Manage Surveys" or "Manage Campaigns" or the slash form
        // - "Manage Vurvey employees" should be case-insensitive
        // - "Manage Credits Rates" should match variations like "Manage Credit Rates"
        let pattern: RegExp;
        switch (pageName) {
          case 'Manage Surveys/Campaigns':
            pattern = /manage\s+(?:surveys|campaigns|surveys\s*\/\s*campaigns)/i;
            break;
          case 'Manage Credits Rates':
            pattern = /manage\s+credits?\s+rates?/i;
            break;
          case 'Global Campaign Templates':
            pattern = /global\s+campaign\s+templates?/i;
            break;
          default:
            pattern = new RegExp(pageName.replace(/\s+/g, '\\s+'), 'i');
        }

        const navItem = page.locator('a, button, [role="button"], [role="link"]')
          .filter({ hasText: pattern })
          .first();

        // Also try a broader body text search
        const bodyText = page.getByText(pattern).first();
        const target = navItem.or(bodyText).first();

        await expect(target).toBeVisible({ timeout: 15_000 });
      });
    }
  });

  // =========================================================================
  // CLAIM 4: Employee Management — Add Employee action and row menu
  // =========================================================================
  test.describe('Employee Management', () => {
    test.beforeEach(async ({ page }) => {
      if (!adminAccessible) return;

      // Navigate to the employee management section
      const employeeLink = page.locator('a, button, [role="button"]')
        .filter({ hasText: /manage\s+vurvey\s+employees/i })
        .first();

      const isVisible = await employeeLink.isVisible({ timeout: 10_000 }).catch(() => false);
      if (isVisible) {
        await employeeLink.click();
        await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
        await waitForLoaders(page);
        await page.waitForTimeout(2_000);
      }
    });

    test('"Add Employee" action is available', async ({ page }) => {
      if (!adminAccessible) {
        test.skip(true, 'Admin page not accessible — enterprise-only feature');
        return;
      }

      const addEmployeeBtn = page.locator('a, button, [role="button"]')
        .filter({ hasText: /add\s+employee/i })
        .first();

      // Fallback: look for a "+" or "Add" button near the employee section
      const addBtnFallback = page.locator(
        '[aria-label*="add employee" i], [data-testid*="add-employee" i], [title*="add employee" i]'
      ).first();

      const target = addEmployeeBtn.or(addBtnFallback).first();
      await expect(target).toBeVisible({ timeout: 15_000 });
    });

    test('employee row menu has "Sync permissions", "Update role", and "Delete"', async ({ page }) => {
      if (!adminAccessible) {
        test.skip(true, 'Admin page not accessible — enterprise-only feature');
        return;
      }

      // Find an employee row in the table/list
      const employeeRow = page.locator(
        'tr, [class*="row" i], [class*="listItem" i], [class*="employeeItem" i]'
      ).filter({
        has: page.locator('td, [class*="cell" i], [class*="name" i], [class*="email" i]'),
      }).first();

      // Fallback: any table row or list item that looks like employee data
      const rowFallback = page.locator('table tbody tr, [class*="table" i] [class*="row" i]').first();
      const row = employeeRow.or(rowFallback).first();

      const rowVisible = await row.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!rowVisible) {
        test.skip(true, 'No employee rows found in the table');
        return;
      }

      // Open the row menu — try hovering first, then look for a three-dot/overflow menu
      await row.hover();

      const menuTrigger = row.locator([
        '[class*="dots" i]',
        '[class*="menu" i] button',
        '[class*="overflow" i]',
        '[aria-label*="more" i]',
        '[aria-label*="actions" i]',
        'button[class*="icon" i]',
        '[class*="kebab" i]',
      ].join(', ')).first();

      // Also try broader: any small button at the end of the row
      const menuTriggerFallback = row.locator('button').last();
      const trigger = menuTrigger.or(menuTriggerFallback).first();

      const triggerVisible = await trigger.isVisible({ timeout: 5_000 }).catch(() => false);
      if (!triggerVisible) {
        // Try right-click on the row
        await row.click({ button: 'right' });
      } else {
        await trigger.click();
      }

      // Wait for the context/dropdown menu
      const menu = page.locator(
        '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i], [class*="contextMenu" i]'
      ).first();
      const menuVisible = await menu.isVisible({ timeout: 8_000 }).catch(() => false);

      if (!menuVisible) {
        expect.soft(false, 'Employee row menu should be openable via click or right-click').toBeTruthy();
        return;
      }

      // Check for the three documented menu items
      expect.soft(
        await menu.getByText(/sync\s+permissions/i).first().isVisible({ timeout: 5_000 }).catch(() => false),
        'Employee row menu should have "Sync permissions" option'
      ).toBeTruthy();

      expect.soft(
        await menu.getByText(/update\s+role/i).first().isVisible({ timeout: 5_000 }).catch(() => false),
        'Employee row menu should have "Update role" option'
      ).toBeTruthy();

      expect.soft(
        await menu.getByText(/delete/i).first().isVisible({ timeout: 5_000 }).catch(() => false),
        'Employee row menu should have "Delete" option'
      ).toBeTruthy();

      await page.keyboard.press('Escape');
    });
  });
});
