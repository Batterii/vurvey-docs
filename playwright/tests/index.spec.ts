import { test, expect } from '@playwright/test';
import { gotoSection, waitForLoaders, workspaceUrl } from './helpers/workspace';
import { loginViaUI } from './helpers/login';
import { clickSidebarItem } from './helpers/ui';

// ---------------------------------------------------------------------------
// index.md documentation claims — sidebar navigation and layout
// ---------------------------------------------------------------------------
test.describe('index.md: Documentation claim tests', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
    await waitForLoaders(page);
    // Ensure we are on the home page
    await gotoSection(page, '/');
    await page.waitForTimeout(2_000);
  });

  // =========================================================================
  // SIDEBAR ITEMS GROUP
  // =========================================================================
  test.describe('Sidebar Navigation Items', () => {
    test('sidebar contains "Home" link', async ({ page }) => {
      const homeLink = page.locator('[data-testid="home-link"]')
        .or(page.locator('nav a, aside a, [class*="sidebar" i] a').filter({ hasText: /^home$/i }))
        .first();
      await expect(homeLink).toBeVisible({ timeout: 15_000 });
    });

    test('sidebar contains "Agents" link', async ({ page }) => {
      const agentsLink = page.locator('[data-testid="agents-link"]')
        .or(page.locator('nav a, aside a, [class*="sidebar" i] a').filter({ hasText: /^agents$/i }))
        .first();
      await expect(agentsLink).toBeVisible({ timeout: 15_000 });
    });

    test('sidebar contains "People" link', async ({ page }) => {
      const peopleLink = page.locator('[data-testid="people-link"]')
        .or(page.locator('nav a, aside a, [class*="sidebar" i] a').filter({ hasText: /^people$/i }))
        .first();
      await expect(peopleLink).toBeVisible({ timeout: 15_000 });
    });

    test('sidebar contains "Campaigns" link', async ({ page }) => {
      const campaignsLink = page.locator('[data-testid="campaigns-link"]')
        .or(page.locator('nav a, aside a, [class*="sidebar" i] a').filter({ hasText: /^campaigns$/i }))
        .first();
      await expect(campaignsLink).toBeVisible({ timeout: 15_000 });
    });

    test('sidebar contains "Datasets" link', async ({ page }) => {
      const datasetsLink = page.locator('[data-testid="datasets-link"]')
        .or(page.locator('nav a, aside a, [class*="sidebar" i] a').filter({ hasText: /^datasets$/i }))
        .first();
      await expect(datasetsLink).toBeVisible({ timeout: 15_000 });
    });

    test('sidebar contains "Workflow" link (feature-flag dependent)', async ({ page }) => {
      const workflowLink = page.locator('[data-testid="workflow-link"], [data-testid="workflows-link"]')
        .or(page.locator('nav a, aside a, [class*="sidebar" i] a').filter({ hasText: /^workflows?$/i }))
        .first();

      const isVisible = await workflowLink.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!isVisible) {
        test.skip(true, 'Workflow link not visible — feature flag may be off for this workspace');
        return;
      }
      await expect(workflowLink).toBeVisible();
    });

    test('sidebar contains "Forecast" link (feature-flag dependent)', async ({ page }) => {
      const forecastLink = page.locator('[data-testid="forecast-link"]')
        .or(page.locator('nav a, aside a, [class*="sidebar" i] a').filter({ hasText: /^forecast$/i }))
        .first();

      const isVisible = await forecastLink.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!isVisible) {
        test.skip(true, 'Forecast link not visible — feature flag may be off for this workspace');
        return;
      }
      await expect(forecastLink).toBeVisible();
    });
  });

  // =========================================================================
  // SIDEBAR FOOTER / PROFILE GROUP
  // =========================================================================
  test.describe('Sidebar Footer', () => {
    test('profile link visible at sidebar bottom', async ({ page }) => {
      const profileLink = page.locator('[data-testid="personal-profile-link"]');
      await expect(profileLink).toBeVisible({ timeout: 15_000 });
    });

    test('workspace name visible in sidebar', async ({ page }) => {
      const workspaceName = page.locator('[data-testid="workspace-name"]');
      await expect(workspaceName).toBeVisible({ timeout: 15_000 });
      const text = await workspaceName.textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    });

    test('workspace name is non-empty and indicates current workspace', async ({ page }) => {
      const workspaceName = page.locator('[data-testid="workspace-name"]');
      await expect(workspaceName).toBeVisible({ timeout: 15_000 });
      const name = (await workspaceName.textContent())?.trim() || '';
      // The DEMO workspace should have a recognizable name
      expect(name.length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // SIDEBAR NAVIGATION (click each item, verify route)
  // =========================================================================
  test.describe('Sidebar Navigation Routes', () => {
    test('clicking "Home" navigates to workspace root', async ({ page }) => {
      // First navigate away from home
      await gotoSection(page, '/agents');
      await page.waitForTimeout(1_000);

      const homeLink = page.locator('[data-testid="home-link"]')
        .or(page.locator('nav a, aside a, [class*="sidebar" i] a').filter({ hasText: /^home$/i }))
        .first();
      await homeLink.click();
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});

      // Home should be the workspace root (no specific sub-route, or /chat, or just /)
      const url = page.url();
      const uuidPattern = /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
      expect(url).toMatch(uuidPattern);
      // Should NOT have a sub-route like /agents, /campaigns etc.
      // (may have /chat or nothing after the UUID)
      expect(url).not.toMatch(/\/(agents|people|campaigns|datasets|workflows|forecast|settings)\b/);
    });

    test('clicking "Agents" navigates to /agents route', async ({ page }) => {
      const agentsLink = page.locator('[data-testid="agents-link"]')
        .or(page.locator('nav a, aside a, [class*="sidebar" i] a').filter({ hasText: /^agents$/i }))
        .first();

      const isVisible = await agentsLink.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!isVisible) {
        test.skip(true, 'Agents link not visible');
        return;
      }

      await agentsLink.click();
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      expect(page.url()).toContain('/agents');
    });

    test('clicking "People" navigates to /people route', async ({ page }) => {
      const peopleLink = page.locator('[data-testid="people-link"]')
        .or(page.locator('nav a, aside a, [class*="sidebar" i] a').filter({ hasText: /^people$/i }))
        .first();

      const isVisible = await peopleLink.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!isVisible) {
        test.skip(true, 'People link not visible');
        return;
      }

      await peopleLink.click();
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      expect(page.url()).toContain('/people');
    });

    test('clicking "Campaigns" navigates to /campaigns route', async ({ page }) => {
      const campaignsLink = page.locator('[data-testid="campaigns-link"]')
        .or(page.locator('nav a, aside a, [class*="sidebar" i] a').filter({ hasText: /^campaigns$/i }))
        .first();

      const isVisible = await campaignsLink.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!isVisible) {
        test.skip(true, 'Campaigns link not visible');
        return;
      }

      await campaignsLink.click();
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      // The URL may use "surveys" as the API term for campaigns
      expect(page.url()).toMatch(/\/(campaigns|surveys)\b/);
    });

    test('clicking "Datasets" navigates to /datasets route', async ({ page }) => {
      const datasetsLink = page.locator('[data-testid="datasets-link"]')
        .or(page.locator('nav a, aside a, [class*="sidebar" i] a').filter({ hasText: /^datasets$/i }))
        .first();

      const isVisible = await datasetsLink.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!isVisible) {
        test.skip(true, 'Datasets link not visible');
        return;
      }

      await datasetsLink.click();
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      // May use "training-sets" in the URL
      expect(page.url()).toMatch(/\/(datasets|training-sets)\b/);
    });

    test('clicking "Workflow" navigates to /workflows route (feature-flag dependent)', async ({ page }) => {
      const workflowLink = page.locator('[data-testid="workflow-link"], [data-testid="workflows-link"]')
        .or(page.locator('nav a, aside a, [class*="sidebar" i] a').filter({ hasText: /^workflows?$/i }))
        .first();

      const isVisible = await workflowLink.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!isVisible) {
        test.skip(true, 'Workflow link not visible — feature flag may be off');
        return;
      }

      await workflowLink.click();
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      expect(page.url()).toMatch(/\/(workflows?|orchestrations?)\b/);
    });
  });
});
