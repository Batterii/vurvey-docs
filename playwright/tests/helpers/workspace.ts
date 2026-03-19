import { Page } from '@playwright/test';

const WORKSPACE_ID = process.env.VURVEY_WORKSPACE_ID || '07e5edb5-e739-4a35-9f82-cc6cec7c0193';

export function workspaceUrl(route: string): string {
  const cleanRoute = route.startsWith('/') ? route : `/${route}`;
  return `/${WORKSPACE_ID}${cleanRoute}`;
}

export async function gotoSection(page: Page, route: string): Promise<void> {
  await page.goto(workspaceUrl(route));
  await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
  await waitForLoaders(page);
}

export async function waitForLoaders(page: Page, timeout = 8_000): Promise<void> {
  const loaderSels = [
    '[class*="loading"]', '[class*="spinner"]', '[class*="skeleton"]',
    '[data-testid*="loading"]', '[data-testid*="skeleton"]',
  ];
  for (const sel of loaderSels) {
    await page.locator(sel).first().waitFor({ state: 'hidden', timeout }).catch(() => {});
  }
}

export async function isFeatureFlaggedOff(page: Page, expectedRoute: string): Promise<boolean> {
  return !page.url().includes(expectedRoute);
}

export function getWorkspaceId(): string {
  return WORKSPACE_ID;
}
