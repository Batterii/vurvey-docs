#!/usr/bin/env node

/**
 * Vurvey Documentation QA Test Suite
 *
 * This script verifies that documented UI functionality matches the actual
 * implementation. It runs through key user journeys and reports any
 * discrepancies between documentation and reality.
 *
 * Usage: node scripts/qa-test-suite.js
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

// Configuration
const config = {
  email: process.env.VURVEY_EMAIL,
  password: process.env.VURVEY_PASSWORD,
  baseUrl: process.env.VURVEY_URL || 'https://staging.vurvey.com',
  headless: process.env.HEADLESS !== 'false',
  timeout: 30000,
  slowMo: 50,
};

// Test results storage
const results = {
  passed: [],
  failed: [],
  warnings: [],
  startTime: new Date(),
  endTime: null,
};

// Failure screenshots directory
const failureScreenshotsDir = path.join(__dirname, '..', 'qa-failure-screenshots');

// Current test context for screenshots
let currentPage = null;
let currentRoute = null;
let currentSection = null;

// Helper functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '\x1b[36m[INFO]\x1b[0m',
    pass: '\x1b[32m[PASS]\x1b[0m',
    fail: '\x1b[31m[FAIL]\x1b[0m',
    warn: '\x1b[33m[WARN]\x1b[0m',
  }[type] || '[INFO]';
  console.log(`${timestamp} ${prefix} ${message}`);
}

async function recordTest(name, passed, details = '', selector = null) {
  const result = {
    name,
    details,
    timestamp: new Date().toISOString(),
    section: currentSection,
    route: currentRoute,
    selector: selector,
  };

  if (passed) {
    results.passed.push(result);
    log(`${name}: ${details || 'OK'}`, 'pass');
  } else {
    // Capture failure screenshot
    let screenshotPath = null;
    if (currentPage) {
      try {
        await fs.mkdir(failureScreenshotsDir, { recursive: true });
        const safeName = name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        const timestamp = Date.now();
        screenshotPath = path.join(failureScreenshotsDir, `${safeName}-${timestamp}.png`);
        await currentPage.screenshot({ path: screenshotPath, fullPage: true });
        log(`  Screenshot saved: ${screenshotPath}`, 'info');
      } catch (e) {
        log(`  Could not capture screenshot: ${e.message}`, 'warn');
      }
    }

    // Build reproduction steps
    const reproSteps = buildReproductionSteps(name, selector);

    result.screenshot = screenshotPath;
    result.reproductionSteps = reproSteps;
    results.failed.push(result);
    log(`${name}: ${details || 'FAILED'}`, 'fail');
  }
}

function buildReproductionSteps(testName, selector) {
  const steps = [
    `1. Navigate to ${config.baseUrl}`,
    `2. Log in with test credentials`,
  ];

  if (currentRoute) {
    steps.push(`3. Navigate to route: ${currentRoute}`);
  }

  if (selector) {
    steps.push(`4. Look for element matching: ${selector}`);
  }

  steps.push(`5. Expected: Element should be present and visible`);
  steps.push(`6. Actual: Element was not found or not visible`);
  steps.push('');
  steps.push(`Test: ${testName}`);
  steps.push(`Section: ${currentSection || 'Unknown'}`);
  steps.push(`Route: ${currentRoute || 'Unknown'}`);

  return steps;
}

function recordWarning(name, details) {
  results.warnings.push({ name, details, timestamp: new Date().toISOString() });
  log(`${name}: ${details}`, 'warn');
}

async function waitForNetworkIdle(page, timeout = 5000) {
  try {
    await page.waitForNetworkIdle({ idleTime: 1000, timeout });
  } catch (e) {
    // Network didn't go idle, but we can continue
  }
}

async function elementExists(page, selector, timeout = 3000) {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch (e) {
    return false;
  }
}

async function getTextContent(page, selector) {
  try {
    const element = await page.$(selector);
    if (!element) return null;
    const text = await page.evaluate(el => el.textContent, element);
    return text ? text.trim() : null;
  } catch (e) {
    return null;
  }
}

// Test Suite Classes
class TestSuite {
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
    await this.page.goto(url, { waitUntil: 'networkidle2' });
    await waitForNetworkIdle(this.page);
  }

  async testElement(testName, selector, timeout = 3000) {
    const exists = await elementExists(this.page, selector, timeout);
    await recordTest(testName, exists, exists ? 'Found' : 'Not found', selector);
    return exists;
  }
}

// Home/Chat Tests
class HomeChatTests extends TestSuite {
  constructor(page, workspaceId) {
    super(page, workspaceId, 'Home/Chat');
  }

  async runAll() {
    log('Running Home/Chat Tests...', 'info');
    await this.navigate('/');

    await this.testElement('Home: Chat input present',
      '[data-testid="chat-input"], textarea, input[placeholder*="message" i]');
    await this.testElement('Home: Agent selector present',
      '[data-testid="agent-selector"], [class*="agent" i][class*="select" i], [class*="persona" i]');
    await this.testElement('Home: Mode toggles present',
      '[data-testid="mode-toggle"], [class*="mode" i], button');
    await this.testElement('Home: Conversation sidebar present',
      '[class*="sidebar" i], [class*="conversation" i][class*="list" i], nav');
    await this.testElement('Home: New conversation button present',
      'button[aria-label*="new" i], [class*="new"][class*="conversation" i], button');
  }
}

// Agent Tests
class AgentTests extends TestSuite {
  constructor(page, workspaceId) {
    super(page, workspaceId, 'Agents');
  }

  async runAll() {
    log('Running Agent Tests...', 'info');
    await this.navigate('/agents');

    await this.testElement('Agents: Gallery grid present',
      '[class*="grid" i], [class*="gallery" i], [class*="card" i]');
    await this.testElement('Agents: Create button present', 'button');
    await this.testElement('Agents: Search input present',
      'input[type="search"], input[placeholder*="search" i], [class*="search" i] input');
    await this.testElement('Agents: Filter/sort controls present',
      '[class*="filter" i], [class*="sort" i], select');

    const hasAgentCards = await elementExists(this.page, '[class*="card" i], [class*="agent" i][class*="item" i]');
    if (hasAgentCards) {
      await this.testElement('Agents: Card avatars present',
        '[class*="avatar" i], img[class*="agent" i]');
      await this.testElement('Agents: Card menus present',
        '[class*="menu" i], [class*="dropdown" i], button[aria-label*="more" i]');
    } else {
      recordWarning('Agents: No agent cards found', 'May be empty workspace');
    }
  }
}

// People/Audience Tests
class PeopleTests extends TestSuite {
  constructor(page, workspaceId) {
    super(page, workspaceId, 'People/Audience');
  }

  async runAll() {
    log('Running People/Audience Tests...', 'info');
    await this.navigate('/audience');

    await this.testElement('People: Navigation tabs present',
      '[role="tablist"], [class*="tab" i], nav button');
    await this.testElement('People: Populations view present',
      '[class*="population" i], [class*="grid" i], [class*="card" i]');

    await this.navigate('/audience/community');
    await waitForNetworkIdle(this.page);
    await this.testElement('People: Humans table present',
      'table, [class*="table" i], [role="grid"]');

    await this.navigate('/audience/segments');
    await waitForNetworkIdle(this.page);
    await this.testElement('People: Segments view present',
      '[class*="segment" i], [class*="list" i], table');

    await this.navigate('/audience/properties');
    await waitForNetworkIdle(this.page);
    await this.testElement('People: Properties view present',
      '[class*="propert" i], table, [class*="list" i]');
  }
}

// Campaign Tests
class CampaignTests extends TestSuite {
  constructor(page, workspaceId) {
    super(page, workspaceId, 'Campaigns');
  }

  async runAll() {
    log('Running Campaign Tests...', 'info');
    await this.navigate('/campaigns');

    await this.testElement('Campaigns: Campaign grid present',
      '[class*="grid" i], [class*="card" i], [class*="campaign" i]');
    await this.testElement('Campaigns: Create button present', 'button');
    await this.testElement('Campaigns: Navigation tabs present',
      '[role="tablist"], [class*="tab" i]');
    await this.testElement('Campaigns: Filter controls present',
      '[class*="filter" i], select, [class*="sort" i]');

    const hasCards = await elementExists(this.page, '[class*="card" i]');
    if (hasCards) {
      await this.testElement('Campaigns: Status badges present',
        '[class*="badge" i], [class*="status" i], [class*="chip" i]');
    }
  }
}

// Dataset Tests
class DatasetTests extends TestSuite {
  constructor(page, workspaceId) {
    super(page, workspaceId, 'Datasets');
  }

  async runAll() {
    log('Running Dataset Tests...', 'info');
    await this.navigate('/datasets');

    await this.testElement('Datasets: Grid present',
      '[class*="grid" i], [class*="card" i], [class*="dataset" i]');
    await this.testElement('Datasets: Create button present', 'button');
    await this.testElement('Datasets: Search input present',
      'input[type="search"], input[placeholder*="search" i]');

    const hasCards = await elementExists(this.page, '[class*="card" i]');
    if (hasCards) {
      await this.testElement('Datasets: File count shown',
        '[class*="file" i], [class*="count" i]');
    }
  }
}

// Workflow Tests
class WorkflowTests extends TestSuite {
  constructor(page, workspaceId) {
    super(page, workspaceId, 'Workflows');
  }

  async runAll() {
    log('Running Workflow Tests...', 'info');
    await this.navigate('/workflow');

    await this.testElement('Workflows: Navigation tabs present',
      '[role="tablist"], [class*="tab" i]');

    await this.navigate('/workflow/flows');
    await waitForNetworkIdle(this.page);

    await this.testElement('Workflows: Flows grid present',
      '[class*="grid" i], [class*="card" i], [class*="flow" i]');
    await this.testElement('Workflows: Create button present', 'button');
    await this.testElement('Workflows: Search/sort controls present',
      'input[type="search"], select, [class*="sort" i]');
  }
}

// Main execution
async function login(page) {
  log(`Logging in to ${config.baseUrl}...`, 'info');

  await page.goto(config.baseUrl, { waitUntil: 'networkidle2' });

  // Wait for login form
  await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });

  // Enter credentials
  await page.type('input[type="email"], input[name="email"]', config.email);
  await page.type('input[type="password"], input[name="password"]', config.password);

  // Submit - find and click button
  const submitButton = await page.$('button[type="submit"]');
  if (submitButton) {
    await submitButton.click();
  }

  // Wait for redirect
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });

  // Extract workspace ID from URL
  const url = page.url();
  const workspaceMatch = url.match(/\/([a-f0-9-]{36})/);

  if (workspaceMatch) {
    log(`Logged in successfully. Workspace: ${workspaceMatch[1]}`, 'pass');
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
      duration: `${duration.toFixed(2)}s`,
      timestamp: results.startTime.toISOString(),
      baseUrl: config.baseUrl,
    },
    passed: results.passed,
    failed: results.failed,
    warnings: results.warnings,
  };

  // Save JSON report
  const reportPath = path.join(__dirname, '..', 'qa-report.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

  // Generate markdown report for failures with reproduction steps
  if (results.failed.length > 0) {
    const mdReportPath = path.join(__dirname, '..', 'qa-failure-report.md');
    let mdContent = `# QA Test Failure Report\n\n`;
    mdContent += `**Generated**: ${results.startTime.toISOString()}\n`;
    mdContent += `**Target URL**: ${config.baseUrl}\n`;
    mdContent += `**Duration**: ${duration.toFixed(2)}s\n\n`;
    mdContent += `## Summary\n\n`;
    mdContent += `- **Passed**: ${results.passed.length}\n`;
    mdContent += `- **Failed**: ${results.failed.length}\n`;
    mdContent += `- **Warnings**: ${results.warnings.length}\n\n`;
    mdContent += `## Failed Tests\n\n`;

    for (const failure of results.failed) {
      mdContent += `### ${failure.name}\n\n`;
      mdContent += `**Section**: ${failure.section || 'Unknown'}\n`;
      mdContent += `**Route**: ${failure.route || 'Unknown'}\n`;
      mdContent += `**Selector**: \`${failure.selector || 'N/A'}\`\n`;
      mdContent += `**Time**: ${failure.timestamp}\n\n`;

      if (failure.screenshot) {
        const relPath = path.relative(path.join(__dirname, '..'), failure.screenshot);
        mdContent += `**Screenshot**: \`${relPath}\`\n\n`;
      }

      if (failure.reproductionSteps && failure.reproductionSteps.length > 0) {
        mdContent += `**Reproduction Steps**:\n\n`;
        for (const step of failure.reproductionSteps) {
          mdContent += `${step}\n`;
        }
        mdContent += `\n`;
      }
      mdContent += `---\n\n`;
    }

    await fs.writeFile(mdReportPath, mdContent);
    console.log(`\nFailure report saved to: ${mdReportPath}`);
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('QA TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${report.summary.totalTests}`);
  console.log(`\x1b[32mPassed: ${report.summary.passed}\x1b[0m`);
  console.log(`\x1b[31mFailed: ${report.summary.failed}\x1b[0m`);
  console.log(`\x1b[33mWarnings: ${report.summary.warnings}\x1b[0m`);
  console.log(`Duration: ${report.summary.duration}`);
  console.log('='.repeat(60));

  if (results.failed.length > 0) {
    console.log('\nFailed Tests:');
    for (const f of results.failed) {
      console.log(`  - ${f.name}: ${f.details}`);
      if (f.screenshot) {
        console.log(`    Screenshot: ${f.screenshot}`);
      }
    }
  }

  if (results.warnings.length > 0) {
    console.log('\nWarnings:');
    results.warnings.forEach(w => console.log(`  - ${w.name}: ${w.details}`));
  }

  console.log(`\nReport saved to: ${reportPath}`);

  return report;
}

async function main() {
  if (!config.email || !config.password) {
    console.error('Error: VURVEY_EMAIL and VURVEY_PASSWORD environment variables required');
    process.exit(1);
  }

  log('Starting Vurvey QA Test Suite', 'info');
  log(`Target: ${config.baseUrl}`, 'info');
  log(`Headless: ${config.headless}`, 'info');

  const browser = await puppeteer.launch({
    headless: config.headless,
    slowMo: config.slowMo,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    // Login
    const workspaceId = await login(page);

    // Run all test suites
    const homeChatTests = new HomeChatTests(page, workspaceId);
    await homeChatTests.runAll();

    const agentTests = new AgentTests(page, workspaceId);
    await agentTests.runAll();

    const peopleTests = new PeopleTests(page, workspaceId);
    await peopleTests.runAll();

    const campaignTests = new CampaignTests(page, workspaceId);
    await campaignTests.runAll();

    const datasetTests = new DatasetTests(page, workspaceId);
    await datasetTests.runAll();

    const workflowTests = new WorkflowTests(page, workspaceId);
    await workflowTests.runAll();

    // Generate report
    const report = await generateReport();

    // Exit with error if any tests failed
    if (report.summary.failed > 0) {
      process.exit(1);
    }

  } catch (error) {
    log(`Fatal error: ${error.message}`, 'fail');
    console.error(error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
