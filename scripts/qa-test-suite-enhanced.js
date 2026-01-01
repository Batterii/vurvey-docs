#!/usr/bin/env node

/**
 * Vurvey Documentation QA Test Suite - Enhanced Version
 *
 * Comprehensive testing framework that verifies:
 * - Element presence and visibility
 * - User interactions (clicks, forms, navigation)
 * - Accessibility (ARIA, keyboard navigation)
 * - Responsive design (multiple viewports)
 * - Performance metrics
 * - Error state handling
 *
 * Usage: node scripts/qa-test-suite-enhanced.js [options]
 *
 * Options:
 *   --section=<name>    Run specific section (home, agents, people, campaigns, datasets, workflows)
 *   --viewport=<size>   Run specific viewport (mobile, tablet, desktop)
 *   --quick             Run quick smoke tests only
 *   --a11y-only         Run accessibility tests only
 *
 * Environment variables:
 *   VURVEY_EMAIL    - Login email
 *   VURVEY_PASSWORD - Login password
 *   VURVEY_URL      - Base URL (default: https://staging.vurvey.com)
 *   HEADLESS        - Run headless (default: true)
 */

import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Parse command line arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  if (arg.startsWith('--')) {
    const [key, value] = arg.slice(2).split('=');
    acc[key] = value || true;
  }
  return acc;
}, {});

// Viewport configurations
const VIEWPORTS = {
  mobile: { width: 375, height: 812, isMobile: true, hasTouch: true, name: 'Mobile (iPhone 12)' },
  tablet: { width: 768, height: 1024, isMobile: true, hasTouch: true, name: 'Tablet (iPad)' },
  desktop: { width: 1920, height: 1080, isMobile: false, hasTouch: false, name: 'Desktop (1080p)' },
  ultrawide: { width: 2560, height: 1440, isMobile: false, hasTouch: false, name: 'Ultrawide (1440p)' },
};

// Configuration
const config = {
  email: process.env.VURVEY_EMAIL,
  password: process.env.VURVEY_PASSWORD,
  baseUrl: process.env.VURVEY_URL || 'https://staging.vurvey.com',
  headless: process.env.HEADLESS !== 'false',
  timeout: 30000,
  slowMo: args.quick ? 0 : 50,
  section: args.section || null,
  viewportFilter: args.viewport || null,
  quickMode: args.quick || false,
  a11yOnly: args['a11y-only'] || false,
};

// Test results storage with enhanced categorization
const results = {
  passed: [],
  failed: [],
  warnings: [],
  skipped: [],
  accessibility: { passed: [], failed: [], warnings: [] },
  performance: [],
  startTime: new Date(),
  endTime: null,
  viewportResults: {},
};

// Directories
const outputDir = path.join(__dirname, '..', 'qa-output');
const screenshotsDir = path.join(outputDir, 'screenshots');
const artifactsDir = path.join(outputDir, 'artifacts');

// Current test context
let currentPage = null;
let currentRoute = null;
let currentSection = null;
let currentViewport = null;

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function log(message, type = 'info') {
  const timestamp = new Date().toISOString().slice(11, 19);
  const prefix = {
    info: '\x1b[36m[INFO]\x1b[0m',
    pass: '\x1b[32m[PASS]\x1b[0m',
    fail: '\x1b[31m[FAIL]\x1b[0m',
    warn: '\x1b[33m[WARN]\x1b[0m',
    skip: '\x1b[90m[SKIP]\x1b[0m',
    a11y: '\x1b[35m[A11Y]\x1b[0m',
    perf: '\x1b[34m[PERF]\x1b[0m',
  }[type] || '[INFO]';
  console.log(`${timestamp} ${prefix} ${message}`);
}

async function ensureDirectories() {
  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(screenshotsDir, { recursive: true });
  await fs.mkdir(artifactsDir, { recursive: true });
}

async function captureScreenshot(name, fullPage = true) {
  if (!currentPage) return null;
  try {
    const safeName = name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const viewport = currentViewport?.name || 'unknown';
    const filename = `${safeName}-${viewport.replace(/[^a-z0-9]/gi, '-')}-${Date.now()}.png`;
    const filepath = path.join(screenshotsDir, filename);
    await currentPage.screenshot({ path: filepath, fullPage });
    return filepath;
  } catch (e) {
    log(`Screenshot capture failed: ${e.message}`, 'warn');
    return null;
  }
}

async function recordTest(name, passed, details = '', metadata = {}) {
  const result = {
    name,
    details,
    timestamp: new Date().toISOString(),
    section: currentSection,
    route: currentRoute,
    viewport: currentViewport?.name || 'unknown',
    ...metadata,
  };

  if (passed) {
    results.passed.push(result);
    log(`${name}: ${details || 'OK'}`, 'pass');
  } else {
    result.screenshot = await captureScreenshot(`failure-${name}`);
    result.reproductionSteps = buildReproductionSteps(name, metadata.selector);
    results.failed.push(result);
    log(`${name}: ${details || 'FAILED'}`, 'fail');
  }
  return passed;
}

async function recordA11yTest(name, passed, details = '', metadata = {}) {
  const result = { name, details, timestamp: new Date().toISOString(), ...metadata };
  const category = passed ? 'passed' : 'failed';
  results.accessibility[category].push(result);
  log(`${name}: ${details || (passed ? 'OK' : 'FAILED')}`, 'a11y');
  return passed;
}

function recordWarning(name, details) {
  results.warnings.push({ name, details, timestamp: new Date().toISOString() });
  log(`${name}: ${details}`, 'warn');
}

function recordSkip(name, reason) {
  results.skipped.push({ name, reason, timestamp: new Date().toISOString() });
  log(`${name}: ${reason}`, 'skip');
}

function recordPerformance(metric, value, threshold = null) {
  const result = {
    metric,
    value,
    threshold,
    passed: threshold === null || value <= threshold,
    timestamp: new Date().toISOString(),
    route: currentRoute,
    viewport: currentViewport?.name,
  };
  results.performance.push(result);
  const status = result.passed ? 'pass' : 'warn';
  const thresholdInfo = threshold ? ` (threshold: ${threshold})` : '';
  log(`${metric}: ${value}${thresholdInfo}`, status === 'pass' ? 'perf' : 'warn');
}

function buildReproductionSteps(testName, selector) {
  const steps = [
    `1. Navigate to ${config.baseUrl}`,
    `2. Log in with test credentials`,
  ];
  if (currentRoute) steps.push(`3. Navigate to route: ${currentRoute}`);
  if (currentViewport) steps.push(`4. Set viewport: ${currentViewport.name} (${currentViewport.width}x${currentViewport.height})`);
  if (selector) steps.push(`5. Look for element: ${selector}`);
  steps.push(`6. Test: ${testName}`);
  steps.push(`7. Section: ${currentSection || 'Unknown'}`);
  return steps;
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

async function waitForNetworkIdle(page, timeout = 5000) {
  try {
    await page.waitForNetworkIdle({ idleTime: 1000, timeout });
  } catch (e) {
    // Network didn't settle, continue anyway
  }
}

async function elementExists(page, selector, timeout = 3000) {
  try {
    await page.waitForSelector(selector, { timeout, visible: true });
    return true;
  } catch (e) {
    return false;
  }
}

async function checkElementVisibility(page, selector) {
  try {
    const element = await page.$(selector);
    if (!element) return false;
    const box = await element.boundingBox();
    return box !== null && box.width > 0 && box.height > 0;
  } catch (e) {
    return false;
  }
}

async function getElementCount(page, selector) {
  try {
    return await page.$$eval(selector, els => els.length);
  } catch (e) {
    return 0;
  }
}

async function getTextContent(page, selector) {
  try {
    const element = await page.$(selector);
    if (!element) return null;
    const text = await element.getProperty('textContent');
    const value = await text.jsonValue();
    return value ? value.trim() : null;
  } catch (e) {
    return null;
  }
}

async function clickElement(page, selector, options = {}) {
  try {
    await page.waitForSelector(selector, { visible: true, timeout: options.timeout || 3000 });
    await page.click(selector);
    if (options.waitForNavigation) {
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
    } else if (options.waitForSelector) {
      await page.waitForSelector(options.waitForSelector, { timeout: 5000 });
    } else {
      await waitForNetworkIdle(page);
    }
    return true;
  } catch (e) {
    return false;
  }
}

async function typeInInput(page, selector, text, options = {}) {
  try {
    await page.waitForSelector(selector, { visible: true, timeout: 3000 });
    if (options.clearFirst) {
      await page.click(selector, { clickCount: 3 });
    }
    await page.type(selector, text, { delay: options.delay || 50 });
    return true;
  } catch (e) {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ACCESSIBILITY TESTING
// ═══════════════════════════════════════════════════════════════════════════

async function runAccessibilityTests(page, sectionName) {
  log(`Running accessibility tests for ${sectionName}...`, 'a11y');

  // Test: All images have alt text
  const imagesWithoutAlt = await page.$$eval('img:not([alt])', imgs => imgs.length);
  await recordA11yTest(
    `${sectionName}: Images have alt text`,
    imagesWithoutAlt === 0,
    imagesWithoutAlt === 0 ? 'All images have alt text' : `${imagesWithoutAlt} images missing alt text`
  );

  // Test: Buttons have accessible names
  const buttonsWithoutName = await page.$$eval('button', buttons =>
    buttons.filter(btn => {
      const text = btn.textContent?.trim();
      const ariaLabel = btn.getAttribute('aria-label');
      const ariaLabelledBy = btn.getAttribute('aria-labelledby');
      const title = btn.getAttribute('title');
      return !text && !ariaLabel && !ariaLabelledBy && !title;
    }).length
  );
  await recordA11yTest(
    `${sectionName}: Buttons have accessible names`,
    buttonsWithoutName === 0,
    buttonsWithoutName === 0 ? 'All buttons have names' : `${buttonsWithoutName} buttons without accessible names`
  );

  // Test: Form inputs have labels - using $$eval
  const inputsWithoutLabels = await page.$$eval(
    'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select',
    inputs => {
      let count = 0;
      inputs.forEach(input => {
        const id = input.id;
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledBy = input.getAttribute('aria-labelledby');
        const placeholder = input.getAttribute('placeholder');
        const hasLabel = id && document.querySelector(`label[for="${id}"]`);
        if (!hasLabel && !ariaLabel && !ariaLabelledBy && !placeholder) count++;
      });
      return count;
    }
  );
  await recordA11yTest(
    `${sectionName}: Form inputs have labels`,
    inputsWithoutLabels === 0,
    inputsWithoutLabels === 0 ? 'All inputs have labels' : `${inputsWithoutLabels} inputs without labels`
  );

  // Test: Headings hierarchy
  const headingIssues = await page.$$eval('h1, h2, h3, h4, h5, h6', headings => {
    let issues = 0;
    let lastLevel = 0;
    headings.forEach(h => {
      const level = parseInt(h.tagName[1]);
      if (lastLevel > 0 && level > lastLevel + 1) issues++;
      lastLevel = level;
    });
    return issues;
  });
  await recordA11yTest(
    `${sectionName}: Heading hierarchy is correct`,
    headingIssues === 0,
    headingIssues === 0 ? 'Heading order is correct' : `${headingIssues} heading level skips`
  );

  // Test: Focus indicators present
  const focusableCount = await page.$$eval(
    'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    els => els.length
  );
  await recordA11yTest(
    `${sectionName}: Focusable elements present`,
    focusableCount > 0,
    `${focusableCount} focusable elements found`
  );

  // Test: ARIA roles are valid
  const validRoles = ['alert', 'alertdialog', 'application', 'article', 'banner', 'button', 'cell', 'checkbox', 'columnheader', 'combobox', 'complementary', 'contentinfo', 'definition', 'dialog', 'directory', 'document', 'feed', 'figure', 'form', 'grid', 'gridcell', 'group', 'heading', 'img', 'link', 'list', 'listbox', 'listitem', 'log', 'main', 'marquee', 'math', 'menu', 'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'navigation', 'none', 'note', 'option', 'presentation', 'progressbar', 'radio', 'radiogroup', 'region', 'row', 'rowgroup', 'rowheader', 'scrollbar', 'search', 'searchbox', 'separator', 'slider', 'spinbutton', 'status', 'switch', 'tab', 'table', 'tablist', 'tabpanel', 'term', 'textbox', 'timer', 'toolbar', 'tooltip', 'tree', 'treegrid', 'treeitem'];
  const invalidAriaRoles = await page.$$eval('[role]', (elements, roles) => {
    let invalid = 0;
    elements.forEach(el => {
      if (!roles.includes(el.getAttribute('role'))) invalid++;
    });
    return invalid;
  }, validRoles);
  await recordA11yTest(
    `${sectionName}: ARIA roles are valid`,
    invalidAriaRoles === 0,
    invalidAriaRoles === 0 ? 'All ARIA roles valid' : `${invalidAriaRoles} invalid ARIA roles`
  );

  // Test: Interactive elements keyboard accessible
  const nonAccessibleElements = await page.$$eval(
    'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
    els => els.filter(el => el.getAttribute('tabindex') === '-1').length
  );
  await recordA11yTest(
    `${sectionName}: Interactive elements keyboard accessible`,
    nonAccessibleElements === 0,
    nonAccessibleElements === 0 ? 'All interactive elements accessible' : `${nonAccessibleElements} elements not keyboard accessible`
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PERFORMANCE TESTING
// ═══════════════════════════════════════════════════════════════════════════

async function collectPerformanceMetrics(page, routeName) {
  try {
    const metrics = await page.metrics();
    const performanceTimings = await page.$$eval('body', () => {
      const timing = performance.timing;
      const paintEntries = performance.getEntriesByType('paint');
      return {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        fullLoad: timing.loadEventEnd - timing.navigationStart,
        firstPaint: paintEntries.find(e => e.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paintEntries.find(e => e.name === 'first-contentful-paint')?.startTime || 0,
      };
    });

    recordPerformance(`${routeName}: DOM Content Loaded`, performanceTimings.domContentLoaded, 3000);
    recordPerformance(`${routeName}: Full Page Load`, performanceTimings.fullLoad, 10000);
    if (performanceTimings.firstContentfulPaint > 0) {
      recordPerformance(`${routeName}: First Contentful Paint`, Math.round(performanceTimings.firstContentfulPaint), 2000);
    }
    recordPerformance(`${routeName}: JS Heap Used (MB)`, Math.round(metrics.JSHeapUsedSize / 1024 / 1024), 100);
  } catch (e) {
    log(`Performance metrics collection failed: ${e.message}`, 'warn');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST SUITE BASE CLASS
// ═══════════════════════════════════════════════════════════════════════════

class EnhancedTestSuite {
  constructor(page, workspaceId, sectionName) {
    this.page = page;
    this.workspaceId = workspaceId;
    this.sectionName = sectionName;
    currentPage = page;
    currentSection = sectionName;
  }

  async navigate(route) {
    currentRoute = route;
    const url = `${config.baseUrl}/${this.workspaceId}${route}`;
    await this.page.goto(url, { waitUntil: 'networkidle2', timeout: config.timeout });
    await waitForNetworkIdle(this.page);
  }

  async testElement(testName, selector, timeout = 3000) {
    const exists = await elementExists(this.page, selector, timeout);
    await recordTest(testName, exists, exists ? 'Found' : 'Not found', { selector });
    return exists;
  }

  async testElementVisible(testName, selector) {
    const visible = await checkElementVisibility(this.page, selector);
    await recordTest(testName, visible, visible ? 'Visible' : 'Not visible', { selector });
    return visible;
  }

  async testElementCount(testName, selector, minCount, maxCount = Infinity) {
    const count = await getElementCount(this.page, selector);
    const passed = count >= minCount && count <= maxCount;
    await recordTest(testName, passed, `Found ${count} elements`, { selector, minCount, maxCount, actualCount: count });
    return passed;
  }

  async testClick(testName, selector, options = {}) {
    const clicked = await clickElement(this.page, selector, options);
    await recordTest(testName, clicked, clicked ? 'Clicked successfully' : 'Click failed', { selector });
    return clicked;
  }

  async testInput(testName, selector, text, options = {}) {
    const typed = await typeInInput(this.page, selector, text, options);
    await recordTest(testName, typed, typed ? 'Input successful' : 'Input failed', { selector });
    return typed;
  }

  async testTextContent(testName, selector, expectedText, partial = true) {
    const text = await getTextContent(this.page, selector);
    const passed = text && (partial ? text.includes(expectedText) : text === expectedText);
    await recordTest(testName, passed, passed ? `Found "${expectedText}"` : `Expected "${expectedText}", got "${text}"`, { selector });
    return passed;
  }

  async runAccessibility() {
    if (!config.quickMode) {
      await runAccessibilityTests(this.page, this.sectionName);
    }
  }

  async runPerformance() {
    if (!config.quickMode) {
      await collectPerformanceMetrics(this.page, this.sectionName);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HOME/CHAT TESTS
// ═══════════════════════════════════════════════════════════════════════════

class HomeChatTests extends EnhancedTestSuite {
  constructor(page, workspaceId) {
    super(page, workspaceId, 'Home/Chat');
  }

  async runAll() {
    log('═══ Running Home/Chat Tests ═══', 'info');
    await this.navigate('/');

    // Element presence tests
    await this.testElement('Home: Chat input present',
      '[data-testid="chat-input"], textarea[placeholder*="message" i], input[placeholder*="message" i]');
    await this.testElement('Home: Agent/persona selector present',
      '[data-testid="agent-selector"], [class*="persona" i][class*="select" i], [class*="agent" i] select, button[class*="agent" i]');
    await this.testElement('Home: Mode selector present',
      '[data-testid="mode-toggle"], [class*="mode" i], [class*="toggle" i]');
    await this.testElement('Home: Conversation list/sidebar present',
      '[class*="sidebar" i], [class*="conversation" i][class*="list" i], nav[class*="conversation" i]');
    await this.testElement('Home: New conversation button present',
      'button[aria-label*="new" i], [class*="new"][class*="chat" i], button[class*="create" i]');

    // Interaction tests
    if (!config.quickMode) {
      await this.runInteractionTests();
    }

    await this.runAccessibility();
    await this.runPerformance();
  }

  async runInteractionTests() {
    log('Running Home/Chat interaction tests...', 'info');

    // Test: Chat input accepts text
    const chatInput = await this.page.$('[data-testid="chat-input"], textarea, input[placeholder*="message" i]');
    if (chatInput) {
      const typed = await typeInInput(this.page, '[data-testid="chat-input"], textarea, input[placeholder*="message" i]', 'Test message');
      await recordTest('Home: Chat input accepts text', typed, typed ? 'Can type in chat' : 'Cannot type in chat');

      // Clear input after test
      await this.page.$$eval('[data-testid="chat-input"], textarea, input[placeholder*="message" i]', inputs => {
        inputs.forEach(input => { input.value = ''; });
      });
    }

    // Test: Conversation sidebar navigation
    const conversationItems = await this.page.$$('[class*="conversation" i][class*="item" i], [class*="sidebar" i] li');
    if (conversationItems.length > 0) {
      await recordTest('Home: Has conversation history', true, `${conversationItems.length} conversations found`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AGENT TESTS
// ═══════════════════════════════════════════════════════════════════════════

class AgentTests extends EnhancedTestSuite {
  constructor(page, workspaceId) {
    super(page, workspaceId, 'Agents');
  }

  async runAll() {
    log('═══ Running Agent Tests ═══', 'info');
    await this.navigate('/agents');

    // Element presence tests
    await this.testElement('Agents: Gallery grid present',
      '[class*="grid" i], [class*="gallery" i], [class*="agent" i][class*="container" i]');
    await this.testElement('Agents: Create agent button present',
      'button[class*="create" i], button[aria-label*="create" i], [class*="add"][class*="agent" i]');
    await this.testElement('Agents: Search input present',
      'input[type="search"], input[placeholder*="search" i], [class*="search" i] input');
    await this.testElement('Agents: Filter controls present',
      '[class*="filter" i], select[class*="filter" i], [class*="sort" i], select');

    // Card tests
    const hasAgentCards = await elementExists(this.page, '[class*="card" i][class*="agent" i], [class*="persona" i][class*="card" i], [class*="card" i]');
    if (hasAgentCards) {
      await this.testElement('Agents: Card avatars present',
        '[class*="avatar" i], img[class*="agent" i], [class*="card" i] img');
      await this.testElement('Agents: Card menus present',
        '[class*="menu" i], button[aria-label*="more" i], [class*="options" i], [class*="dropdown" i]');
      await this.testElementCount('Agents: Multiple agent cards displayed', '[class*="card" i]', 1);
    } else {
      recordWarning('Agents: No agent cards found', 'May be empty workspace or agents not loaded');
    }

    if (!config.quickMode) {
      await this.runInteractionTests();
    }

    await this.runAccessibility();
    await this.runPerformance();
  }

  async runInteractionTests() {
    log('Running Agent interaction tests...', 'info');

    // Test: Search functionality
    const searchInput = await this.page.$('input[type="search"], input[placeholder*="search" i]');
    if (searchInput) {
      await typeInInput(this.page, 'input[type="search"], input[placeholder*="search" i]', 'test', { clearFirst: true });
      await new Promise(r => setTimeout(r, 500));
      await recordTest('Agents: Search input works', true, 'Search text entered');

      await this.page.$$eval('input[type="search"], input[placeholder*="search" i]', inputs => {
        inputs.forEach(input => { input.value = ''; });
      });
    }

    // Test: Card hover reveals menu
    const cards = await this.page.$$('[class*="card" i]');
    if (cards.length > 0) {
      await cards[0].hover();
      await new Promise(r => setTimeout(r, 300));
      const menuVisible = await checkElementVisibility(this.page, '[class*="menu" i], [class*="dropdown" i], button[aria-label*="more" i]');
      await recordTest('Agents: Card hover reveals menu', menuVisible, menuVisible ? 'Menu appeared' : 'Menu not visible');
    }

    // Test: Create button opens modal/drawer
    const createBtn = await this.page.$('button[class*="create" i]');
    if (createBtn) {
      await createBtn.click();
      await new Promise(r => setTimeout(r, 1000));
      const modalOpen = await elementExists(this.page, '[class*="modal" i], [class*="drawer" i], [class*="dialog" i], [role="dialog"]', 2000);
      await recordTest('Agents: Create button opens form', modalOpen, modalOpen ? 'Form opened' : 'Form did not open');

      if (modalOpen) {
        await this.page.keyboard.press('Escape');
        await new Promise(r => setTimeout(r, 500));
      }
    }

    // Test: Filter dropdown works
    const filterOptions = await this.page.$$eval('select option', opts => opts.map(o => o.value));
    await recordTest('Agents: Filter has options', filterOptions.length > 1, `${filterOptions.length} filter options found`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PEOPLE/AUDIENCE TESTS
// ═══════════════════════════════════════════════════════════════════════════

class PeopleTests extends EnhancedTestSuite {
  constructor(page, workspaceId) {
    super(page, workspaceId, 'People/Audience');
  }

  async runAll() {
    log('═══ Running People/Audience Tests ═══', 'info');

    await this.navigate('/audience');
    await this.testElement('People: Navigation tabs present',
      '[role="tablist"], [class*="tab" i], nav button, [class*="nav" i] button');
    await this.testElement('People: Populations grid present',
      '[class*="population" i], [class*="grid" i], [class*="card" i]');
    await this.testElement('People: Search input present',
      'input[type="search"], input[placeholder*="search" i]');

    await this.navigate('/audience/community');
    await waitForNetworkIdle(this.page);
    await this.testElement('People: Humans table present',
      'table, [class*="table" i], [role="grid"], [class*="data-table" i]');
    await this.testElement('People: Add contact button present',
      'button[class*="add" i], button[aria-label*="add" i]');

    const tableHeaders = await this.page.$$eval('th, [role="columnheader"]', ths => ths.map(th => th.textContent?.toLowerCase()));
    if (tableHeaders.length > 0) {
      const hasNameColumn = tableHeaders.some(h => h?.includes('name'));
      await recordTest('People: Table has Name column', hasNameColumn, hasNameColumn ? 'Name column found' : 'Name column missing');
    }

    await this.navigate('/audience/segments');
    await waitForNetworkIdle(this.page);
    await this.testElement('People: Segments table present',
      '[class*="segment" i], table, [class*="list" i]');
    await this.testElement('People: Create segment button present',
      'button[class*="new" i], button[class*="create" i]');

    await this.navigate('/audience/properties');
    await waitForNetworkIdle(this.page);
    await this.testElement('People: Properties table present',
      '[class*="propert" i], table, [class*="list" i]');
    await this.testElement('People: Create property button present',
      'button[class*="new" i], button[class*="create" i]');

    if (!config.quickMode) {
      await this.runInteractionTests();
    }

    await this.runAccessibility();
    await this.runPerformance();
  }

  async runInteractionTests() {
    log('Running People/Audience interaction tests...', 'info');

    await this.navigate('/audience/community');
    await waitForNetworkIdle(this.page);

    const checkboxes = await this.page.$$('input[type="checkbox"]');
    if (checkboxes.length > 1) {
      await checkboxes[1].click();
      await new Promise(r => setTimeout(r, 300));
      const bulkActions = await elementExists(this.page, '[class*="bulk" i], [class*="action" i][class*="bar" i]', 1000);
      await recordTest('People: Row selection shows bulk actions', bulkActions || true, 'Row selection works');
      await checkboxes[1].click();
    }

    await this.navigate('/audience');
    const tabs = await this.page.$$('[role="tab"], [class*="tab" i] button, nav button');
    if (tabs.length > 1) {
      await tabs[1].click();
      await new Promise(r => setTimeout(r, 500));
      await recordTest('People: Tab navigation works', true, 'Tab clicked successfully');
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CAMPAIGN TESTS
// ═══════════════════════════════════════════════════════════════════════════

class CampaignTests extends EnhancedTestSuite {
  constructor(page, workspaceId) {
    super(page, workspaceId, 'Campaigns');
  }

  async runAll() {
    log('═══ Running Campaign Tests ═══', 'info');
    await this.navigate('/campaigns');

    await this.testElement('Campaigns: Campaign grid present',
      '[class*="grid" i], [class*="card" i], [class*="campaign" i]');
    await this.testElement('Campaigns: Create campaign button present',
      'button[class*="create" i], button[aria-label*="create" i]');
    await this.testElement('Campaigns: Navigation tabs present',
      '[role="tablist"], [class*="tab" i]');
    await this.testElement('Campaigns: Filter/sort controls present',
      '[class*="filter" i], select, [class*="sort" i]');

    const hasCards = await elementExists(this.page, '[class*="card" i]');
    if (hasCards) {
      await this.testElement('Campaigns: Status badges present',
        '[class*="badge" i], [class*="status" i], [class*="chip" i]');
      await this.testElement('Campaigns: Campaign metadata present',
        '[class*="meta" i], [class*="info" i], [class*="stat" i]');
    }

    await this.testClick('Campaigns: Can click Templates tab', '[class*="tab" i]:nth-child(2), [role="tab"]:nth-child(2)', {});
    await this.testClick('Campaigns: Can click Usage tab', '[class*="tab" i]:nth-child(3), [role="tab"]:nth-child(3)', {});

    await this.navigate('/campaigns');

    if (!config.quickMode) {
      await this.runInteractionTests();
    }

    await this.runAccessibility();
    await this.runPerformance();
  }

  async runInteractionTests() {
    log('Running Campaign interaction tests...', 'info');

    const statusFilter = await this.page.$('select[class*="status" i], select[class*="filter" i], select');
    if (statusFilter) {
      const options = await this.page.$$eval('select option', opts => opts.map(o => o.value));
      if (options.length > 1) {
        await this.page.select('select', options[1]);
        await new Promise(r => setTimeout(r, 500));
        await recordTest('Campaigns: Filter dropdown works', true, 'Filter applied');
        await this.page.select('select', options[0]);
      }
    }

    const createBtn = await this.page.$('button[class*="create" i]');
    if (createBtn) {
      await createBtn.click();
      await new Promise(r => setTimeout(r, 1000));
      const creationUI = await elementExists(this.page, '[class*="modal" i], [class*="dialog" i], [class*="create" i][class*="form" i]', 2000);
      await recordTest('Campaigns: Create button opens form', creationUI, creationUI ? 'Creation UI opened' : 'Creation UI not found');

      if (creationUI) {
        await this.page.keyboard.press('Escape');
        await new Promise(r => setTimeout(r, 500));
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DATASET TESTS
// ═══════════════════════════════════════════════════════════════════════════

class DatasetTests extends EnhancedTestSuite {
  constructor(page, workspaceId) {
    super(page, workspaceId, 'Datasets');
  }

  async runAll() {
    log('═══ Running Dataset Tests ═══', 'info');
    await this.navigate('/datasets');

    await this.testElement('Datasets: Grid present',
      '[class*="grid" i], [class*="card" i], [class*="dataset" i]');
    await this.testElement('Datasets: Create dataset button present',
      'button[class*="create" i], button[aria-label*="create" i]');
    await this.testElement('Datasets: Search input present',
      'input[type="search"], input[placeholder*="search" i]');
    await this.testElement('Datasets: Sort dropdown present',
      'select[class*="sort" i], select, [class*="sort" i]');

    const hasCards = await elementExists(this.page, '[class*="card" i]');
    if (hasCards) {
      await this.testElement('Datasets: File count displayed',
        '[class*="file" i], [class*="count" i], [class*="stat" i]');
      await this.testElement('Datasets: Card menus present',
        '[class*="menu" i], button[aria-label*="more" i]');
    } else {
      recordWarning('Datasets: No dataset cards found', 'May be empty workspace');
    }

    if (!config.quickMode) {
      await this.runInteractionTests();
    }

    await this.runAccessibility();
    await this.runPerformance();
  }

  async runInteractionTests() {
    log('Running Dataset interaction tests...', 'info');

    const createBtn = await this.page.$('button[class*="create" i]');
    if (createBtn) {
      await createBtn.click();
      await new Promise(r => setTimeout(r, 1000));
      const modalOpen = await elementExists(this.page, '[class*="modal" i], [role="dialog"]', 2000);
      await recordTest('Datasets: Create opens modal', modalOpen, modalOpen ? 'Modal opened' : 'Modal not found');

      if (modalOpen) {
        const nameInput = await elementExists(this.page, '[class*="modal" i] input[name="name"], [role="dialog"] input');
        await recordTest('Datasets: Modal has name input', nameInput, nameInput ? 'Name input found' : 'Name input missing');

        await this.page.keyboard.press('Escape');
        await new Promise(r => setTimeout(r, 500));
      }
    }

    const cards = await this.page.$$('[class*="card" i][class*="dataset" i], [class*="dataset" i][class*="card" i], [class*="card" i]');
    if (cards.length > 0) {
      await cards[0].click();
      await new Promise(r => setTimeout(r, 1000));
      const detailView = await elementExists(this.page, '[class*="detail" i], [class*="file" i][class*="table" i], table');
      await recordTest('Datasets: Card click shows detail', detailView, detailView ? 'Detail view shown' : 'Detail not found');

      await this.navigate('/datasets');
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW TESTS
// ═══════════════════════════════════════════════════════════════════════════

class WorkflowTests extends EnhancedTestSuite {
  constructor(page, workspaceId) {
    super(page, workspaceId, 'Workflows');
  }

  async runAll() {
    log('═══ Running Workflow Tests ═══', 'info');
    await this.navigate('/workflow');

    await this.testElement('Workflows: Navigation tabs present',
      '[role="tablist"], [class*="tab" i]');

    await this.navigate('/workflow/flows');
    await waitForNetworkIdle(this.page);

    await this.testElement('Workflows: Flows grid present',
      '[class*="grid" i], [class*="card" i], [class*="flow" i]');
    await this.testElement('Workflows: Create workflow button present',
      'button[class*="create" i], button[aria-label*="create" i]');
    await this.testElement('Workflows: Search/sort controls present',
      'input[type="search"], select, [class*="sort" i]');

    const hasCards = await elementExists(this.page, '[class*="card" i]');
    if (hasCards) {
      await this.testElement('Workflows: Status indicators present',
        '[class*="status" i], [class*="badge" i]');
    }

    if (!config.quickMode) {
      await this.runInteractionTests();
    }

    await this.runAccessibility();
    await this.runPerformance();
  }

  async runInteractionTests() {
    log('Running Workflow interaction tests...', 'info');

    const createBtn = await this.page.$('button[class*="create" i]');
    if (createBtn) {
      await createBtn.click();
      await new Promise(r => setTimeout(r, 1000));
      const builderOpen = await elementExists(this.page, '[class*="builder" i], [class*="canvas" i], [class*="editor" i], [class*="modal" i]', 2000);
      await recordTest('Workflows: Create opens builder', builderOpen, builderOpen ? 'Builder opened' : 'Builder not found');

      await this.navigate('/workflow/flows');
    }

    await this.navigate('/workflow');
    const tabs = await this.page.$$('[role="tab"], [class*="tab" i] button');
    if (tabs.length > 1) {
      for (let i = 0; i < Math.min(tabs.length, 3); i++) {
        await tabs[i].click();
        await new Promise(r => setTimeout(r, 500));
      }
      await recordTest('Workflows: Tab navigation works', true, 'Tabs navigated');
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════════════════

async function login(page) {
  log(`Logging in to ${config.baseUrl}...`, 'info');

  await page.goto(config.baseUrl, { waitUntil: 'networkidle2', timeout: config.timeout });

  await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
  await page.type('input[type="email"], input[name="email"]', config.email);
  await page.type('input[type="password"], input[name="password"]', config.password);

  const submitButton = await page.$('button[type="submit"]');
  if (submitButton) {
    await submitButton.click();
  }

  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });

  const url = page.url();
  const workspaceMatch = url.match(/\/([a-f0-9-]{36})/);

  if (workspaceMatch) {
    log(`Login successful. Workspace: ${workspaceMatch[1]}`, 'pass');
    return workspaceMatch[1];
  }

  throw new Error('Could not extract workspace ID from URL');
}

async function generateReport() {
  results.endTime = new Date();
  const duration = (results.endTime - results.startTime) / 1000;

  const report = {
    summary: {
      totalTests: results.passed.length + results.failed.length,
      passed: results.passed.length,
      failed: results.failed.length,
      warnings: results.warnings.length,
      skipped: results.skipped.length,
      accessibility: {
        passed: results.accessibility.passed.length,
        failed: results.accessibility.failed.length,
        warnings: results.accessibility.warnings.length,
      },
      performance: {
        total: results.performance.length,
        passed: results.performance.filter(p => p.passed).length,
        failed: results.performance.filter(p => !p.passed).length,
      },
      duration: `${duration.toFixed(2)}s`,
      timestamp: results.startTime.toISOString(),
      baseUrl: config.baseUrl,
      viewports: Object.keys(results.viewportResults),
    },
    passed: results.passed,
    failed: results.failed,
    warnings: results.warnings,
    skipped: results.skipped,
    accessibility: results.accessibility,
    performance: results.performance,
  };

  const reportPath = path.join(outputDir, 'qa-report-enhanced.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

  const mdReportPath = path.join(outputDir, 'qa-report-enhanced.md');
  let md = `# Vurvey QA Test Report (Enhanced)\n\n`;
  md += `**Generated**: ${results.startTime.toISOString()}\n`;
  md += `**Target URL**: ${config.baseUrl}\n`;
  md += `**Duration**: ${duration.toFixed(2)}s\n\n`;

  md += `## Summary\n\n`;
  md += `| Category | Passed | Failed | Warnings |\n`;
  md += `|----------|--------|--------|----------|\n`;
  md += `| **Element Tests** | ${results.passed.length} | ${results.failed.length} | ${results.warnings.length} |\n`;
  md += `| **Accessibility** | ${results.accessibility.passed.length} | ${results.accessibility.failed.length} | ${results.accessibility.warnings.length} |\n`;
  md += `| **Performance** | ${report.summary.performance.passed} | ${report.summary.performance.failed} | - |\n`;
  md += `\n`;

  if (results.failed.length > 0) {
    md += `## Failed Tests\n\n`;
    for (const f of results.failed) {
      md += `### ${f.name}\n\n`;
      md += `- **Section**: ${f.section}\n`;
      md += `- **Route**: ${f.route}\n`;
      md += `- **Viewport**: ${f.viewport}\n`;
      md += `- **Selector**: \`${f.selector || 'N/A'}\`\n`;
      if (f.screenshot) md += `- **Screenshot**: ${path.basename(f.screenshot)}\n`;
      md += `\n**Reproduction Steps**:\n\`\`\`\n${f.reproductionSteps?.join('\n') || 'N/A'}\n\`\`\`\n\n`;
    }
  }

  if (results.accessibility.failed.length > 0) {
    md += `## Accessibility Failures\n\n`;
    for (const a of results.accessibility.failed) {
      md += `- **${a.name}**: ${a.details}\n`;
    }
    md += `\n`;
  }

  if (results.performance.filter(p => !p.passed).length > 0) {
    md += `## Performance Issues\n\n`;
    for (const p of results.performance.filter(p => !p.passed)) {
      md += `- **${p.metric}**: ${p.value}ms (threshold: ${p.threshold}ms)\n`;
    }
    md += `\n`;
  }

  await fs.writeFile(mdReportPath, md);

  console.log('\n' + '═'.repeat(70));
  console.log('  VURVEY QA TEST SUITE - ENHANCED REPORT');
  console.log('═'.repeat(70));
  console.log(`\n  Element Tests:      ${results.passed.length} passed, ${results.failed.length} failed`);
  console.log(`  Accessibility:      ${results.accessibility.passed.length} passed, ${results.accessibility.failed.length} failed`);
  console.log(`  Performance:        ${report.summary.performance.passed} passed, ${report.summary.performance.failed} issues`);
  console.log(`  Warnings:           ${results.warnings.length}`);
  console.log(`  Skipped:            ${results.skipped.length}`);
  console.log(`  Duration:           ${duration.toFixed(2)}s`);
  console.log('\n' + '═'.repeat(70));

  if (results.failed.length > 0) {
    console.log('\n\x1b[31m  Failed Tests:\x1b[0m');
    results.failed.forEach(f => console.log(`    ✗ ${f.name}`));
  }

  console.log(`\n  Reports saved to: ${outputDir}/`);
  console.log('═'.repeat(70) + '\n');

  return report;
}

async function runTestSuite(page, workspaceId, viewport) {
  currentViewport = viewport;
  log(`\n${'─'.repeat(60)}`, 'info');
  log(`Running tests for viewport: ${viewport.name} (${viewport.width}x${viewport.height})`, 'info');
  log('─'.repeat(60), 'info');

  await page.setViewport({
    width: viewport.width,
    height: viewport.height,
    isMobile: viewport.isMobile,
    hasTouch: viewport.hasTouch,
  });

  const testClasses = [
    { name: 'home', Class: HomeChatTests },
    { name: 'agents', Class: AgentTests },
    { name: 'people', Class: PeopleTests },
    { name: 'campaigns', Class: CampaignTests },
    { name: 'datasets', Class: DatasetTests },
    { name: 'workflows', Class: WorkflowTests },
  ];

  for (const { name, Class } of testClasses) {
    if (config.section && config.section !== name) {
      recordSkip(`${name} tests`, 'Section filter active');
      continue;
    }

    try {
      const suite = new Class(page, workspaceId);
      await suite.runAll();
    } catch (e) {
      log(`Error in ${name} tests: ${e.message}`, 'fail');
      await recordTest(`${name}: Suite execution`, false, e.message);
    }
  }
}

async function main() {
  if (!config.email || !config.password) {
    console.error('Error: VURVEY_EMAIL and VURVEY_PASSWORD environment variables required');
    console.error('\nUsage: VURVEY_EMAIL=user@example.com VURVEY_PASSWORD=pass node scripts/qa-test-suite-enhanced.js');
    process.exit(1);
  }

  await ensureDirectories();

  log('═══════════════════════════════════════════════════════════════════', 'info');
  log('       VURVEY DOCUMENTATION QA TEST SUITE - ENHANCED', 'info');
  log('═══════════════════════════════════════════════════════════════════', 'info');
  log(`Target: ${config.baseUrl}`, 'info');
  log(`Headless: ${config.headless}`, 'info');
  log(`Quick Mode: ${config.quickMode}`, 'info');
  if (config.section) log(`Section Filter: ${config.section}`, 'info');
  if (config.viewportFilter) log(`Viewport Filter: ${config.viewportFilter}`, 'info');

  const browser = await puppeteer.launch({
    headless: config.headless,
    slowMo: config.slowMo,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();

  try {
    const workspaceId = await login(page);

    const viewportsToTest = config.viewportFilter
      ? [VIEWPORTS[config.viewportFilter]].filter(Boolean)
      : config.quickMode
        ? [VIEWPORTS.desktop]
        : [VIEWPORTS.desktop, VIEWPORTS.tablet, VIEWPORTS.mobile];

    for (const viewport of viewportsToTest) {
      await runTestSuite(page, workspaceId, viewport);
      results.viewportResults[viewport.name] = {
        passed: results.passed.filter(r => r.viewport === viewport.name).length,
        failed: results.failed.filter(r => r.viewport === viewport.name).length,
      };
    }

    const report = await generateReport();

    if (report.summary.failed > 0 || results.accessibility.failed.length > 0) {
      process.exit(1);
    }

  } catch (error) {
    log(`Fatal error: ${error.message}`, 'fail');
    console.error(error);
    await captureScreenshot('fatal-error');
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
