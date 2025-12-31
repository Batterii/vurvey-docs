/**
 * Vurvey Documentation Screenshot Capture Script
 *
 * This script automates capturing screenshots of the Vurvey platform
 * for documentation purposes. Designed to run in CI/CD environments.
 *
 * Usage:
 *   node scripts/capture-screenshots.js
 *
 * Environment Variables:
 *   VURVEY_EMAIL    - Login email (required)
 *   VURVEY_PASSWORD - Login password (required)
 *   VURVEY_URL      - Base URL (default: https://staging.vurvey.dev)
 *   HEADLESS        - Run headless (default: true)
 */

import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  baseUrl: process.env.VURVEY_URL || 'https://staging.vurvey.dev',
  credentials: {
    email: process.env.VURVEY_EMAIL || 'jroell+test@batterii.com',
    password: process.env.VURVEY_PASSWORD || 'youAre42!'
  },
  screenshotsDir: path.join(__dirname, '..', 'docs', 'public', 'screenshots'),
  viewport: { width: 1920, height: 1080 },
  headless: process.env.HEADLESS !== 'false',
  timeout: 60000,
  retries: 3
};

// Utility functions
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function waitForNetworkIdle(page, timeout = 10000) {
  try {
    await page.waitForNetworkIdle({ idleTime: 1500, timeout });
  } catch (e) {
    console.log('  Network idle timeout (continuing)');
  }
}

async function takeScreenshot(page, name, subdir = '') {
  const dir = subdir ? path.join(CONFIG.screenshotsDir, subdir) : CONFIG.screenshotsDir;
  ensureDir(dir);
  const filepath = path.join(dir, `${name}.png`);

  await page.screenshot({ path: filepath, fullPage: false });
  console.log(`  ✓ Screenshot: ${subdir}/${name}.png`);
  return filepath;
}

async function safeClick(page, selectors) {
  for (const selector of selectors) {
    try {
      const element = await page.$(selector);
      if (element) {
        await element.click();
        return true;
      }
    } catch (e) {
      continue;
    }
  }

  // Try evaluate approach for text-based selection
  return await page.evaluate((selectors) => {
    for (const sel of selectors) {
      if (sel.includes(':has-text')) {
        const text = sel.match(/:has-text\("(.+?)"\)/)?.[1];
        if (text) {
          const elements = Array.from(document.querySelectorAll('button, a'));
          const match = elements.find(el => el.textContent?.toLowerCase().includes(text.toLowerCase()));
          if (match) {
            match.click();
            return true;
          }
        }
      }
    }
    return false;
  }, selectors);
}

async function fillInput(page, value, selectors) {
  for (const selector of selectors) {
    try {
      const input = await page.$(selector);
      if (input) {
        await input.click();
        await delay(100);
        await input.type(value, { delay: 30 });
        return true;
      }
    } catch (e) {
      continue;
    }
  }

  // Try evaluate approach
  return await page.evaluate((value, selectors) => {
    for (const sel of selectors) {
      const input = document.querySelector(sel);
      if (input) {
        input.focus();
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }
    }
    return false;
  }, value, selectors);
}

// Login function
async function login(page) {
  console.log('\n📱 Logging in...');

  await page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle2', timeout: CONFIG.timeout });
  await delay(2000);

  // Capture login page
  await takeScreenshot(page, '00-login-page', 'home');

  // Click "Sign in with email"
  console.log('  Looking for email login button...');
  const emailLoginClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, a'));
    const btn = buttons.find(b => b.textContent?.toLowerCase().includes('sign in with email'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });

  if (emailLoginClicked) {
    console.log('  ✓ Clicked email login');
    await delay(2000);
    await takeScreenshot(page, '00b-email-login-clicked', 'home');
  }

  // Fill email
  console.log('  Filling credentials...');
  await delay(1000);

  const emailSelectors = [
    'input[type="email"]',
    'input[name="email"]',
    'input[placeholder*="email" i]',
    'input[placeholder*="Email"]',
    'input:not([type="password"]):not([type="hidden"])'
  ];

  const emailFilled = await fillInput(page, CONFIG.credentials.email, emailSelectors);
  if (!emailFilled) {
    throw new Error('Could not fill email field');
  }

  // Click Next/Continue
  await delay(500);
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b =>
      b.textContent?.toLowerCase().includes('next') ||
      b.textContent?.toLowerCase().includes('continue') ||
      b.type === 'submit'
    );
    if (btn) btn.click();
  });

  await delay(2000);

  // Fill password
  const passwordSelectors = [
    'input[type="password"]',
    'input[name="password"]',
    'input[placeholder*="password" i]'
  ];

  const passwordFilled = await fillInput(page, CONFIG.credentials.password, passwordSelectors);
  if (!passwordFilled) {
    throw new Error('Could not fill password field');
  }

  // Click login
  await delay(500);
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b =>
      b.textContent?.toLowerCase().includes('log in') ||
      b.textContent?.toLowerCase().includes('login') ||
      b.textContent?.toLowerCase().includes('sign in') ||
      b.type === 'submit'
    );
    if (btn) btn.click();
  });

  // Wait for redirect
  console.log('  Waiting for login to complete...');
  await delay(5000);

  try {
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
  } catch (e) {
    console.log('  Navigation timeout (continuing)');
  }

  await delay(2000);
  await takeScreenshot(page, '03-after-login', 'home');

  const currentUrl = page.url();
  if (currentUrl.includes(CONFIG.baseUrl.replace('https://', '')) && !currentUrl.includes('login')) {
    console.log('  ✓ Login successful');
  } else {
    console.log(`  ⚠ Login may have failed. URL: ${currentUrl}`);
  }
}

// Page capture functions
async function captureHome(page) {
  console.log('\n🏠 Capturing Home (Chat Interface)...');

  await page.goto(`${CONFIG.baseUrl}/chat`, { waitUntil: 'networkidle2', timeout: CONFIG.timeout });
  await delay(2000);
  await waitForNetworkIdle(page);

  await takeScreenshot(page, '01-chat-main', 'home');
  await takeScreenshot(page, '04-conversation-sidebar', 'home');
}

async function captureAgents(page) {
  console.log('\n🤖 Capturing Agents...');

  await page.goto(`${CONFIG.baseUrl}/agents`, { waitUntil: 'networkidle2', timeout: CONFIG.timeout });
  await delay(2000);
  await waitForNetworkIdle(page);

  await takeScreenshot(page, '01-agents-gallery', 'agents');

  // Try search
  const searchInput = await page.$('input[type="search"], input[placeholder*="search" i]');
  if (searchInput) {
    await searchInput.click();
    await delay(300);
    await takeScreenshot(page, '02-agents-search', 'agents');
  }

  // Try clicking an agent card
  try {
    const agentCard = await page.$('[class*="card"]');
    if (agentCard) {
      await agentCard.click();
      await delay(2000);
      await waitForNetworkIdle(page);
      await takeScreenshot(page, '04-agent-detail', 'agents');
    }
  } catch (e) {
    console.log('  Could not capture agent detail');
  }
}

async function capturePeople(page) {
  console.log('\n👥 Capturing People...');

  // Main page
  await page.goto(`${CONFIG.baseUrl}/people`, { waitUntil: 'networkidle2', timeout: CONFIG.timeout });
  await delay(2000);
  await waitForNetworkIdle(page);
  await takeScreenshot(page, '01-people-main', 'people');

  // Sub-pages
  const subPages = [
    { path: '/people/populations', name: '02-populations' },
    { path: '/people/humans', name: '03-humans' },
    { path: '/people/lists', name: '04-lists-segments' },
    { path: '/people/properties', name: '05-properties' }
  ];

  for (const subPage of subPages) {
    try {
      await page.goto(`${CONFIG.baseUrl}${subPage.path}`, { waitUntil: 'networkidle2', timeout: CONFIG.timeout });
      await delay(1500);
      await takeScreenshot(page, subPage.name, 'people');
    } catch (e) {
      console.log(`  Could not capture ${subPage.name}`);
    }
  }
}

async function captureCampaigns(page) {
  console.log('\n📊 Capturing Campaigns...');

  await page.goto(`${CONFIG.baseUrl}/campaigns`, { waitUntil: 'networkidle2', timeout: CONFIG.timeout });
  await delay(2000);
  await waitForNetworkIdle(page);
  await takeScreenshot(page, '01-campaigns-gallery', 'campaigns');

  // Sub-pages
  const subPages = [
    { path: '/campaigns/templates', name: '03-templates' },
    { path: '/campaigns/usage', name: '04-usage' },
    { path: '/campaigns/magic-reels', name: '05-magic-reels' }
  ];

  for (const subPage of subPages) {
    try {
      await page.goto(`${CONFIG.baseUrl}${subPage.path}`, { waitUntil: 'networkidle2', timeout: CONFIG.timeout });
      await delay(1500);
      await waitForNetworkIdle(page);
      await takeScreenshot(page, subPage.name, 'campaigns');
    } catch (e) {
      console.log(`  Could not capture ${subPage.name}`);
    }
  }
}

async function captureDatasets(page) {
  console.log('\n📁 Capturing Datasets...');

  await page.goto(`${CONFIG.baseUrl}/datasets`, { waitUntil: 'networkidle2', timeout: CONFIG.timeout });
  await delay(2000);
  await waitForNetworkIdle(page);
  await takeScreenshot(page, '01-datasets-main', 'datasets');

  // Magic Summaries
  try {
    await page.goto(`${CONFIG.baseUrl}/datasets/magic-summaries`, { waitUntil: 'networkidle2', timeout: CONFIG.timeout });
    await delay(1500);
    await takeScreenshot(page, '03-magic-summaries', 'datasets');
  } catch (e) {
    console.log('  Could not capture magic summaries');
  }
}

async function captureWorkflows(page) {
  console.log('\n⚡ Capturing Workflows...');

  await page.goto(`${CONFIG.baseUrl}/workflows`, { waitUntil: 'networkidle2', timeout: CONFIG.timeout });
  await delay(2000);
  await waitForNetworkIdle(page);
  await takeScreenshot(page, '01-workflows-main', 'workflows');

  // Sub-pages
  const subPages = [
    { path: '/workflows/runs', name: '03-upcoming-runs' },
    { path: '/workflows/templates', name: '04-workflow-templates' },
    { path: '/workflows/conversations', name: '05-workflow-conversations' }
  ];

  for (const subPage of subPages) {
    try {
      await page.goto(`${CONFIG.baseUrl}${subPage.path}`, { waitUntil: 'networkidle2', timeout: CONFIG.timeout });
      await delay(1500);
      await waitForNetworkIdle(page);
      await takeScreenshot(page, subPage.name, 'workflows');
    } catch (e) {
      console.log(`  Could not capture ${subPage.name}`);
    }
  }
}

// Main execution
async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  Vurvey Documentation Screenshot Tool  ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`\nTarget: ${CONFIG.baseUrl}`);
  console.log(`Headless: ${CONFIG.headless}`);
  console.log(`Output: ${CONFIG.screenshotsDir}`);

  // Ensure screenshot directories exist
  const dirs = ['home', 'agents', 'people', 'campaigns', 'datasets', 'workflows'];
  dirs.forEach(dir => ensureDir(path.join(CONFIG.screenshotsDir, dir)));

  const browser = await puppeteer.launch({
    headless: CONFIG.headless ? 'new' : false,
    defaultViewport: CONFIG.viewport,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      `--window-size=${CONFIG.viewport.width},${CONFIG.viewport.height}`
    ]
  });

  const page = await browser.newPage();
  await page.setViewport(CONFIG.viewport);

  // Set a longer default timeout
  page.setDefaultTimeout(CONFIG.timeout);

  try {
    await login(page);
    await captureHome(page);
    await captureAgents(page);
    await capturePeople(page);
    await captureCampaigns(page);
    await captureDatasets(page);
    await captureWorkflows(page);

    console.log('\n════════════════════════════════════════');
    console.log('✅ All screenshots captured successfully!');
    console.log('════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Error during screenshot capture:', error.message);
    await takeScreenshot(page, 'error-state', '');
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
