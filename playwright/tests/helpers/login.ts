import { Page } from '@playwright/test';

const EMAIL = process.env.VURVEY_EMAIL || '';
const PASSWORD = process.env.VURVEY_PASSWORD || '';

/**
 * Firebase API key used by the staging Vurvey SPA.
 * Extracted from the app's Firebase config / network requests.
 */
const FIREBASE_API_KEY = 'AIzaSyBo3WI_YKn6yr0H6Dl_8me9N9u6_Wciskg';

/**
 * Authenticate by calling the Firebase REST API and injecting the auth
 * token directly into the SPA's IndexedDB store.  This bypasses the UI
 * login flow entirely, which avoids flakiness caused by Firebase
 * `fetchSignInMethodsForEmail` quota limits on staging (auth/quota-exceeded).
 *
 * After the token is written the page auto-redirects to the workspace.
 */
export async function loginViaFirebaseREST(page: Page): Promise<void> {
  if (!EMAIL || !PASSWORD) {
    throw new Error('VURVEY_EMAIL and VURVEY_PASSWORD env vars required for login');
  }

  await page.goto('/');
  await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});

  // Step 1 — sign in via Firebase REST API and stash tokens on window
  await page.evaluate(
    async ({ email, password, apiKey }) => {
      const resp = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, returnSecureToken: true }),
        },
      );
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error?.message ?? 'Firebase sign-in failed');
      (window as any).__fbAuth = data;
    },
    { email: EMAIL, password: PASSWORD, apiKey: FIREBASE_API_KEY },
  );

  // Step 2 — write auth record into firebaseLocalStorageDb so the SPA picks it up
  await page.evaluate(
    ({ apiKey }) => {
      const d = (window as any).__fbAuth;
      const fbaseKey = `firebase:authUser:${apiKey}:[DEFAULT]`;
      const record = {
        fbase_key: fbaseKey,
        value: {
          uid: d.localId,
          email: d.email,
          emailVerified: true,
          displayName: d.displayName || '',
          isAnonymous: false,
          providerData: [{ providerId: 'password', uid: d.email, email: d.email }],
          stsTokenManager: {
            refreshToken: d.refreshToken,
            accessToken: d.idToken,
            expirationTime: Date.now() + 3_600_000,
          },
          createdAt: String(Date.now()),
          lastLoginAt: String(Date.now()),
          apiKey,
          appName: '[DEFAULT]',
        },
      };
      return new Promise<void>((resolve, reject) => {
        const req = indexedDB.open('firebaseLocalStorageDb', 1);
        req.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const tx = db.transaction('firebaseLocalStorage', 'readwrite');
          tx.objectStore('firebaseLocalStorage').put(record);
          tx.oncomplete = () => { db.close(); resolve(); };
          tx.onerror = () => reject(new Error('IndexedDB write failed'));
        };
        req.onerror = () => reject(new Error('IndexedDB open failed'));
      });
    },
    { apiKey: FIREBASE_API_KEY },
  );

  // The SPA detects the new auth state and redirects to the workspace
  await page.waitForURL(/\/[0-9a-f]{8}-[0-9a-f]{4}-/, { timeout: 30_000 });
  await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
}

/**
 * Perform a full UI login flow and wait until the workspace is loaded.
 *
 * NOTE: The Vurvey SPA clears restored localStorage tokens on boot,
 * so storageState-based auth does not persist across contexts.
 * This helper performs a real login each time it's needed.
 *
 * When the normal UI flow fails (e.g., Firebase quota exceeded on staging
 * causes the app to show "Create account" instead of the password screen),
 * the function automatically falls back to {@link loginViaFirebaseREST}.
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

  // After clicking Next, the app calls fetchSignInMethodsForEmail.
  // If Firebase quota is exceeded, the app shows "Create account" instead
  // of the password screen.  Detect this and fall back to REST login.
  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
  const createAccountHeading = page.getByText('Create account');

  const whichAppeared = await Promise.race([
    passwordInput
      .waitFor({ state: 'visible', timeout: 15_000 })
      .then(() => 'password' as const),
    createAccountHeading
      .waitFor({ state: 'visible', timeout: 15_000 })
      .then(() => 'create-account' as const),
  ]).catch(() => 'timeout' as const);

  if (whichAppeared !== 'password') {
    // Firebase quota exceeded or unexpected state — fall back to REST login
    await loginViaFirebaseREST(page);
    return;
  }

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
