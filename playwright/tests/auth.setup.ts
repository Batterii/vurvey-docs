import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authFile = path.join(__dirname, '..', '.auth', 'user.json');

setup('authenticate', async ({ page }) => {
  const email = process.env.VURVEY_EMAIL;
  const password = process.env.VURVEY_PASSWORD;
  if (!email || !password) throw new Error('VURVEY_EMAIL and VURVEY_PASSWORD env vars required');

  await page.goto('/');

  // Click "Sign in with email"
  await page.getByText('Sign in with email').click();

  // Fill email — Auth0 custom form may use type="text" with placeholder
  const emailInput = page.locator([
    'input[type="email"]',
    'input[name="email"]',
    'input[name="username"]',
    'input[placeholder*="email" i]',
    'input:not([type="password"]):not([type="hidden"]):not([type="checkbox"])',
  ].join(', ')).first();
  await emailInput.waitFor({ state: 'visible', timeout: 15_000 });
  await emailInput.fill(email);

  // Click Next/Continue/Submit
  const nextBtn = page.locator('button:has-text("Next"), button:has-text("Continue"), button[type="submit"]').first();
  await nextBtn.click();

  // Fill password
  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
  await passwordInput.waitFor({ state: 'visible', timeout: 15_000 });
  await passwordInput.fill(password);

  // Click Log In/Sign In/Continue
  const loginBtn = page.locator('button:has-text("Log In"), button:has-text("Sign In"), button:has-text("Continue"), button[type="submit"]').first();
  await loginBtn.click();

  // Wait for redirect to workspace (URL contains UUID)
  await page.waitForURL(/\/[0-9a-f]{8}-[0-9a-f]{4}-/, { timeout: 30_000 });

  // Save auth state
  await page.context().storageState({ path: authFile });
});
