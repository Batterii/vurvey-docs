import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { loginViaUI } from './helpers/login';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authFile = path.join(__dirname, '..', '.auth', 'user.json');

setup('authenticate', async ({ page }) => {
  const email = process.env.VURVEY_EMAIL;
  const password = process.env.VURVEY_PASSWORD;
  if (!email || !password) throw new Error('VURVEY_EMAIL and VURVEY_PASSWORD env vars required');

  // loginViaUI handles both the normal UI flow and the Firebase REST
  // fallback when staging hits auth/quota-exceeded errors.
  await loginViaUI(page);

  // Save auth state
  await page.context().storageState({ path: authFile });
});
