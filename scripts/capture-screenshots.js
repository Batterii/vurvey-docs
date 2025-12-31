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
  timeout: 90000,
  retries: 3
};

// Store extracted workspace ID after login
let workspaceId = null;

// Utility functions
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function waitForNetworkIdle(page, timeout = 15000) {
  try {
    await page.waitForNetworkIdle({ idleTime: 2000, timeout });
  } catch (e) {
    console.log('  Network idle timeout (continuing)');
  }
}

async function waitForContent(page, selectors, timeout = 10000) {
  for (const selector of selectors) {
    try {
      await page.waitForSelector(selector, { visible: true, timeout });
      console.log(`  ✓ Found content: ${selector}`);
      return true;
    } catch (e) {
      continue;
    }
  }
  return false;
}

async function waitForLoaders(page, timeout = 15000) {
  const loaderSelectors = [
    '[class*="loading"]',
    '[class*="spinner"]',
    '[class*="skeleton"]',
    '[data-testid*="loading"]',
    '[data-testid*="skeleton"]'
  ];

  console.log('  Waiting for loaders to disappear...');
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const hasLoaders = await page.evaluate((selectors) => {
      for (const sel of selectors) {
        const elements = document.querySelectorAll(sel);
        for (const el of elements) {
          const style = window.getComputedStyle(el);
          if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
            return true;
          }
        }
      }
      return false;
    }, loaderSelectors);

    if (!hasLoaders) {
      console.log('  ✓ Loaders cleared');
      return;
    }
    await delay(500);
  }
  console.log('  ⚠ Loader timeout (continuing)');
}

async function takeScreenshot(page, name, subdir = '') {
  const dir = subdir ? path.join(CONFIG.screenshotsDir, subdir) : CONFIG.screenshotsDir;
  ensureDir(dir);
  const filepath = path.join(dir, `${name}.png`);

  // Wait for any loaders to complete
  await waitForLoaders(page, 8000);
  await delay(1000);

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

function extractWorkspaceId(url) {
  // URLs are in format: https://staging.vurvey.dev/{workspaceId}/...
  const match = url.match(/vurvey\.dev\/([a-f0-9-]+)/);
  return match ? match[1] : null;
}

// Login function
async function login(page) {
  console.log('\n Login...');

  await page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle2', timeout: CONFIG.timeout });
  await delay(3000);

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
  await delay(1500);

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
  await delay(8000);

  try {
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
  } catch (e) {
    console.log('  Navigation timeout (continuing)');
  }

  await delay(3000);
  await waitForNetworkIdle(page);

  // Extract workspace ID from URL
  const currentUrl = page.url();
  workspaceId = extractWorkspaceId(currentUrl);

  if (workspaceId) {
    console.log(`  ✓ Extracted workspace ID: ${workspaceId}`);
  } else {
    console.log(`  ⚠ Could not extract workspace ID from URL: ${currentUrl}`);
    // Try to extract from page or use a fallback
    workspaceId = await page.evaluate(() => {
      // Try to find workspace ID in the page's data
      const match = window.location.pathname.match(/^\/([a-f0-9-]+)/);
      return match ? match[1] : null;
    });
    if (workspaceId) {
      console.log(`  ✓ Extracted workspace ID from path: ${workspaceId}`);
    }
  }

  await takeScreenshot(page, '03-after-login', 'home');

  if (currentUrl.includes(CONFIG.baseUrl.replace('https://', '')) && !currentUrl.includes('login')) {
    console.log('  ✓ Login successful');
  } else {
    console.log(`  ⚠ Login may have failed. URL: ${currentUrl}`);
  }
}

// Helper to build workspace-scoped URLs
function getWorkspaceUrl(path) {
  if (!workspaceId) {
    console.log(`  ⚠ No workspace ID available, using path: ${path}`);
    return `${CONFIG.baseUrl}${path}`;
  }
  return `${CONFIG.baseUrl}/${workspaceId}${path}`;
}

// Page capture functions
async function captureHome(page) {
  console.log('\n Capturing Home (Chat Interface)...');

  // Home is at /{workspaceId}/ (the index route)
  const homeUrl = getWorkspaceUrl('/');
  console.log(`  Navigating to: ${homeUrl}`);

  await page.goto(homeUrl, { waitUntil: 'networkidle2', timeout: CONFIG.timeout });
  await delay(4000);
  await waitForNetworkIdle(page);

  // Check for error state before capturing
  const hasError = await page.evaluate(() => {
    const pageText = document.body?.innerText || '';
    return pageText.includes('Something went wrong') ||
           pageText.includes('Error') && pageText.includes('error');
  });

  if (hasError) {
    console.log('  ⚠ Home page shows error state - trying to find a working conversation...');

    // Try clicking on a conversation from the sidebar to get a working view
    const conversationClicked = await page.evaluate(() => {
      // Look for conversation items in sidebar
      const items = document.querySelectorAll('[class*="conversation"], [class*="chat-item"], [data-testid*="conversation"]');
      for (const item of items) {
        if (item.click) {
          item.click();
          return true;
        }
      }
      return false;
    });

    if (conversationClicked) {
      console.log('  ✓ Clicked on a conversation');
      await delay(3000);
      await waitForNetworkIdle(page);
      await waitForLoaders(page);
    }
  }

  // Wait for chat interface elements
  await waitForContent(page, [
    '[data-testid="chat-input"]',
    'textarea',
    '[class*="chatInput"]',
    '[class*="chat-view"]',
    '[placeholder*="Ask"]'
  ], 15000);

  await takeScreenshot(page, '01-chat-main', 'home');

  // Capture conversation sidebar if visible
  await delay(1000);
  await takeScreenshot(page, '04-conversation-sidebar', 'home');
}

async function captureAgents(page) {
  console.log('\n Capturing Agents...');

  // Agents are at /{workspaceId}/agents
  const agentsUrl = getWorkspaceUrl('/agents');
  console.log(`  Navigating to: ${agentsUrl}`);

  await page.goto(agentsUrl, { waitUntil: 'networkidle2', timeout: CONFIG.timeout });
  await delay(4000);
  await waitForNetworkIdle(page);

  // Wait for agent cards to load
  await waitForContent(page, [
    '[data-testid="agent-card"]',
    '[class*="agentCard"]',
    '[class*="personaCard"]',
    '[class*="assistant"]'
  ], 15000);

  await takeScreenshot(page, '01-agents-gallery', 'agents');

  // Try search interaction
  const searchInput = await page.$('input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i]');
  if (searchInput) {
    await searchInput.click();
    await delay(500);
    await takeScreenshot(page, '02-agents-search', 'agents');
  }

  // Try clicking an agent card to show detail panel
  try {
    const agentCard = await page.$('[data-testid="agent-card"], [class*="agentCard"], [class*="personaCard"]');
    if (agentCard) {
      await agentCard.click();
      await delay(3000);
      await waitForNetworkIdle(page);
      await waitForLoaders(page);
      await takeScreenshot(page, '04-agent-detail', 'agents');
    }
  } catch (e) {
    console.log('  Could not capture agent detail');
  }
}

async function capturePeople(page) {
  console.log('\n Capturing People (Audience)...');

  // People/Audience is at /{workspaceId}/audience (NOT /people)
  const audienceUrl = getWorkspaceUrl('/audience');
  console.log(`  Navigating to: ${audienceUrl}`);

  await page.goto(audienceUrl, { waitUntil: 'networkidle2', timeout: CONFIG.timeout });
  await delay(4000);
  await waitForNetworkIdle(page);

  // Wait for content to load
  await waitForContent(page, [
    '[class*="crm"]',
    '[class*="population"]',
    '[data-testid*="population"]',
    'table',
    '[class*="list"]'
  ], 15000);

  await takeScreenshot(page, '01-people-main', 'people');

  // Sub-pages - actual routes from vurvey-web-manager code analysis
  const subPages = [
    { path: '/audience/populations', name: '02-populations' },
    { path: '/audience/community', name: '03-humans' },  // "Humans" tab uses /community route
    { path: '/audience/lists', name: '04-lists-segments' },
    { path: '/audience/properties', name: '05-properties' }
  ];

  for (const subPage of subPages) {
    try {
      const subUrl = getWorkspaceUrl(subPage.path);
      console.log(`  Navigating to: ${subUrl}`);
      await page.goto(subUrl, { waitUntil: 'networkidle2', timeout: CONFIG.timeout });
      await delay(3000);
      await waitForNetworkIdle(page);
      await waitForLoaders(page);
      await takeScreenshot(page, subPage.name, 'people');
    } catch (e) {
      console.log(`  Could not capture ${subPage.name}: ${e.message}`);
    }
  }
}

async function captureCampaigns(page) {
  console.log('\n Capturing Campaigns...');

  // Campaigns are at /{workspaceId}/campaigns
  const campaignsUrl = getWorkspaceUrl('/campaigns');
  console.log(`  Navigating to: ${campaignsUrl}`);

  await page.goto(campaignsUrl, { waitUntil: 'networkidle2', timeout: CONFIG.timeout });
  await delay(4000);
  await waitForNetworkIdle(page);

  // Wait for campaign cards
  await waitForContent(page, [
    '[data-testid="campaign-card"]',
    '[class*="campaignCard"]',
    '[class*="surveyCard"]',
    '[class*="campaign"]'
  ], 15000);

  await takeScreenshot(page, '01-campaigns-gallery', 'campaigns');

  // Sub-pages
  const subPages = [
    { path: '/campaigns/templates', name: '03-templates' },
    { path: '/campaigns/usage', name: '04-usage' },
    { path: '/campaigns/magic-reels', name: '05-magic-reels' }
  ];

  for (const subPage of subPages) {
    try {
      const subUrl = getWorkspaceUrl(subPage.path);
      console.log(`  Navigating to: ${subUrl}`);
      await page.goto(subUrl, { waitUntil: 'networkidle2', timeout: CONFIG.timeout });
      await delay(3000);
      await waitForNetworkIdle(page);
      await waitForLoaders(page);
      await takeScreenshot(page, subPage.name, 'campaigns');
    } catch (e) {
      console.log(`  Could not capture ${subPage.name}: ${e.message}`);
    }
  }
}

async function captureDatasets(page) {
  console.log('\n Capturing Datasets...');

  // Datasets are at /{workspaceId}/datasets
  const datasetsUrl = getWorkspaceUrl('/datasets');
  console.log(`  Navigating to: ${datasetsUrl}`);

  await page.goto(datasetsUrl, { waitUntil: 'networkidle2', timeout: CONFIG.timeout });
  await delay(4000);
  await waitForNetworkIdle(page);

  // Wait for dataset cards
  await waitForContent(page, [
    '[data-testid="dataset-card"]',
    '[class*="datasetCard"]',
    '[class*="trainingSet"]',
    '[class*="dataset"]'
  ], 15000);

  await takeScreenshot(page, '01-datasets-main', 'datasets');

  // Magic Summaries tab
  try {
    const magicSummariesUrl = getWorkspaceUrl('/datasets/magic-summaries');
    console.log(`  Navigating to: ${magicSummariesUrl}`);
    await page.goto(magicSummariesUrl, { waitUntil: 'networkidle2', timeout: CONFIG.timeout });
    await delay(3000);
    await waitForNetworkIdle(page);
    await waitForLoaders(page);
    await takeScreenshot(page, '03-magic-summaries', 'datasets');
  } catch (e) {
    console.log(`  Could not capture magic summaries: ${e.message}`);
  }
}

async function captureWorkflows(page) {
  console.log('\n Capturing Workflows...');

  // Workflows are at /{workspaceId}/workflow (singular, NOT /workflows)
  const workflowUrl = getWorkspaceUrl('/workflow');
  console.log(`  Navigating to: ${workflowUrl}`);

  await page.goto(workflowUrl, { waitUntil: 'networkidle2', timeout: CONFIG.timeout });
  await delay(4000);
  await waitForNetworkIdle(page);

  // Wait for workflow cards
  await waitForContent(page, [
    '[data-testid="workflow-card"]',
    '[class*="workflowCard"]',
    '[class*="flow"]',
    '[class*="orchestration"]'
  ], 15000);

  await takeScreenshot(page, '01-workflows-main', 'workflows');

  // Sub-pages - corrected routes from code analysis
  const subPages = [
    { path: '/workflow/upcoming', name: '03-upcoming-runs' },    // Fixed route
    { path: '/workflow/templates', name: '04-workflow-templates' },
    { path: '/workflow/conversations', name: '05-workflow-conversations' }
  ];

  for (const subPage of subPages) {
    try {
      const subUrl = getWorkspaceUrl(subPage.path);
      console.log(`  Navigating to: ${subUrl}`);
      await page.goto(subUrl, { waitUntil: 'networkidle2', timeout: CONFIG.timeout });
      await delay(3000);
      await waitForNetworkIdle(page);
      await waitForLoaders(page);
      await takeScreenshot(page, subPage.name, 'workflows');
    } catch (e) {
      console.log(`  Could not capture ${subPage.name}: ${e.message}`);
    }
  }
}

// Main execution
async function main() {
  console.log('==========================================');
  console.log('  Vurvey Documentation Screenshot Tool');
  console.log('==========================================');
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

    // Ensure we have a workspace ID before continuing
    if (!workspaceId) {
      console.log('\n  Attempting to extract workspace ID from current page...');
      const currentUrl = page.url();
      const pathMatch = currentUrl.match(/\/([a-f0-9-]{36})/);
      if (pathMatch) {
        workspaceId = pathMatch[1];
        console.log(`  ✓ Found workspace ID: ${workspaceId}`);
      } else {
        throw new Error('Could not determine workspace ID. Screenshots cannot be captured.');
      }
    }

    await captureHome(page);
    await captureAgents(page);
    await capturePeople(page);
    await captureCampaigns(page);
    await captureDatasets(page);
    await captureWorkflows(page);

    console.log('\n==========================================');
    console.log(' All screenshots captured successfully!');
    console.log('==========================================\n');

  } catch (error) {
    console.error('\n Error during screenshot capture:', error.message);
    await takeScreenshot(page, 'error-state', '');
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
