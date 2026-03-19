import { Page, Locator } from '@playwright/test';

/** Click a button/link by its visible text (case-insensitive partial match) */
export async function clickButtonByText(page: Page, text: string, timeout = 5_000): Promise<boolean> {
  const btn = page.locator('button, [role="button"], a').filter({ hasText: new RegExp(text, 'i') }).first();
  try {
    await btn.waitFor({ state: 'visible', timeout });
    await btn.click();
    return true;
  } catch {
    return false;
  }
}

/** Wait for a modal/dialog to appear and return its locator */
export async function waitForModal(page: Page, timeout = 10_000): Promise<Locator> {
  const modal = page.locator('[role="dialog"], [class*="modal" i]').first();
  await modal.waitFor({ state: 'visible', timeout });
  return modal;
}

/** Dismiss any open modal via Escape and wait for it to close */
export async function dismissModal(page: Page): Promise<void> {
  await page.keyboard.press('Escape');
  await page.locator('[role="dialog"], [class*="modal" i]').first()
    .waitFor({ state: 'hidden', timeout: 3_000 }).catch(() => {});
}

/** Open a dropdown/menu by clicking a trigger button and return the menu locator */
export async function openDropdown(page: Page, triggerText: string): Promise<Locator | null> {
  const clicked = await clickButtonByText(page, triggerText);
  if (!clicked) return null;
  const menu = page.locator('[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i]').first();
  try {
    await menu.waitFor({ state: 'visible', timeout: 5_000 });
    return menu;
  } catch {
    return null;
  }
}

/** Check if body text contains a phrase (case-insensitive) */
export async function bodyContainsText(page: Page, text: string): Promise<boolean> {
  const body = await page.locator('body').textContent() || '';
  return body.toLowerCase().includes(text.toLowerCase());
}

/** Click a sidebar navigation item by label text */
export async function clickSidebarItem(page: Page, label: string): Promise<void> {
  const sidebar = page.locator('nav, [class*="sidebar" i], aside').first();
  await sidebar.locator('a, button, [role="button"]')
    .filter({ hasText: new RegExp(`^${label}$`, 'i') }).first().click();
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
}

/** Hover a card to reveal its menu, then click the three-dot/overflow button */
export async function openCardMenu(card: Locator): Promise<void> {
  await card.hover();
  const menuBtn = card.locator(
    '[class*="menu" i] button, button[aria-label*="more" i], [class*="dots" i], [class*="overflow" i]'
  ).first();
  await menuBtn.waitFor({ state: 'visible', timeout: 3_000 });
  await menuBtn.click();
}

/** Wait for at least one of the given selectors to be visible */
export async function waitForAnySelector(page: Page, selectors: string[], timeout = 10_000): Promise<boolean> {
  try {
    await page.locator(selectors.join(', ')).first().waitFor({ state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}
