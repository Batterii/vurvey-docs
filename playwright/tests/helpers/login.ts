import { Page } from '@playwright/test';

const EMAIL = process.env.VURVEY_EMAIL || '';
const PASSWORD = process.env.VURVEY_PASSWORD || '';

/**
 * Perform a full UI login flow and wait until the workspace is loaded.
 * Returns the workspace URL after successful login.
 *
 * NOTE: The Vurvey SPA clears restored localStorage tokens on boot,
 * so storageState-based auth does not persist across contexts.
 * This helper performs a real login each time it's needed.
 */
export async function loginViaUI(page: Page): Promise<void> {
  if (!EMAIL || !PASSWORD) {
    throw new Error('VURVEY_EMAIL and VURVEY_PASSWORD env vars required for login');
  }

  await page.goto('/');
  await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});

  // Click "Sign in with email"
  await page.getByText('Sign in with email').click();

  // Fill email
  const emailInput = page.locator([
    'input[type="email"]',
    'input[name="email"]',
    'input[name="username"]',
    'input[placeholder*="email" i]',
    'input:not([type="password"]):not([type="hidden"]):not([type="checkbox"]):not([type="submit"])',
  ].join(', ')).first();
  await emailInput.waitFor({ state: 'visible', timeout: 15_000 });
  await emailInput.fill(EMAIL);

  // Click Next/Continue
  const nextBtn = page.locator(
    'button:has-text("Next"), button:has-text("Continue"), button[type="submit"]'
  ).first();
  await nextBtn.click();

  // Fill password
  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
  await passwordInput.waitFor({ state: 'visible', timeout: 15_000 });
  await passwordInput.fill(PASSWORD);

  // Click Log In
  const loginBtn = page.locator(
    'button:has-text("Log In"), button:has-text("Sign In"), button:has-text("Continue"), button[type="submit"]'
  ).first();
  await loginBtn.click();

  // Wait for redirect to workspace (URL contains UUID)
  await page.waitForURL(/\/[0-9a-f]{8}-[0-9a-f]{4}-/, { timeout: 30_000 });
  await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
}

/**
 * Check if the page is showing the login screen (not authenticated).
 */
export async function isOnLoginPage(page: Page): Promise<boolean> {
  const loginWrapper = page.locator('[data-testid="login-content-wrapper"]');
  const signInBtn = page.getByText(/sign in with email/i).first();
  return (
    await loginWrapper.isVisible({ timeout: 2_000 }).catch(() => false) ||
    await signInBtn.isVisible({ timeout: 2_000 }).catch(() => false)
  );
}

/**
 * Ensure the page is authenticated. If the storageState didn't work
 * (the SPA cleared the token), perform a real login.
 */
export async function ensureAuthenticated(page: Page): Promise<void> {
  if (await isOnLoginPage(page)) {
    await loginViaUI(page);
  }
}
