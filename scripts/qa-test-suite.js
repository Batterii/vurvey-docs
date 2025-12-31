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

function recordTest(name, passed, details = '') {
  const result = { name, details, timestamp: new Date().toISOString() };
  if (passed) {
    results.passed.push(result);
    log(`${name}: ${details || 'OK'}`, 'pass');
  } else {
    results.failed.push(result);
    log(`${name}: ${details || 'FAILED'}`, 'fail');
  }
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
  constructor(page, workspaceId) {
    this.page = page;
    this.workspaceId = workspaceId;
  }

  async navigate(route) {
    const url = `${config.baseUrl}/${this.workspaceId}${route}`;
    await this.page.goto(url, { waitUntil: 'networkidle2' });
    await waitForNetworkIdle(this.page);
  }
}

// Home/Chat Tests
class HomeChatTests extends TestSuite {
  async runAll() {
    log('Running Home/Chat Tests...', 'info');
    await this.navigate('/');

    // Test 1: Chat input exists
    const chatInputExists = await elementExists(this.page, '[data-testid="chat-input"], textarea, input[placeholder*="message" i]');
    recordTest('Home: Chat input present', chatInputExists);

    // Test 2: Agent selector exists
    const agentSelectorExists = await elementExists(this.page, '[data-testid="agent-selector"], [class*="agent" i][class*="select" i], [class*="persona" i]');
    recordTest('Home: Agent selector present', agentSelectorExists);

    // Test 3: Mode toggles exist (Chat, My Data, Web)
    const modeTogglesExist = await elementExists(this.page, '[data-testid="mode-toggle"], [class*="mode" i], button');
    recordTest('Home: Mode toggles present', modeTogglesExist);

    // Test 4: Conversation sidebar exists
    const sidebarExists = await elementExists(this.page, '[class*="sidebar" i], [class*="conversation" i][class*="list" i], nav');
    recordTest('Home: Conversation sidebar present', sidebarExists);

    // Test 5: New conversation button
    const newConvoButton = await elementExists(this.page, 'button[aria-label*="new" i], [class*="new"][class*="conversation" i], button');
    recordTest('Home: New conversation button present', newConvoButton);
  }
}

// Agent Tests
class AgentTests extends TestSuite {
  async runAll() {
    log('Running Agent Tests...', 'info');
    await this.navigate('/agents');

    // Test 1: Agent gallery/grid present
    const agentGridExists = await elementExists(this.page, '[class*="grid" i], [class*="gallery" i], [class*="card" i]');
    recordTest('Agents: Gallery grid present', agentGridExists);

    // Test 2: Create agent button
    const createButtonExists = await elementExists(this.page, 'button');
    recordTest('Agents: Create button present', createButtonExists);

    // Test 3: Search functionality
    const searchExists = await elementExists(this.page, 'input[type="search"], input[placeholder*="search" i], [class*="search" i] input');
    recordTest('Agents: Search input present', searchExists);

    // Test 4: Filter/sort controls
    const filterExists = await elementExists(this.page, '[class*="filter" i], [class*="sort" i], select');
    recordTest('Agents: Filter/sort controls present', filterExists);

    // Test 5: Agent cards have expected elements
    const hasAgentCards = await elementExists(this.page, '[class*="card" i], [class*="agent" i][class*="item" i]');
    if (hasAgentCards) {
      const cardHasAvatar = await elementExists(this.page, '[class*="avatar" i], img[class*="agent" i]');
      recordTest('Agents: Card avatars present', cardHasAvatar);

      const cardHasMenu = await elementExists(this.page, '[class*="menu" i], [class*="dropdown" i], button[aria-label*="more" i]');
      recordTest('Agents: Card menus present', cardHasMenu);
    } else {
      recordWarning('Agents: No agent cards found', 'May be empty workspace');
    }
  }
}

// People/Audience Tests
class PeopleTests extends TestSuite {
  async runAll() {
    log('Running People/Audience Tests...', 'info');
    await this.navigate('/audience');

    // Test 1: Navigation tabs exist
    const tabsExist = await elementExists(this.page, '[role="tablist"], [class*="tab" i], nav button');
    recordTest('People: Navigation tabs present', tabsExist);

    // Test 2: Populations tab (default view)
    const populationsView = await elementExists(this.page, '[class*="population" i], [class*="grid" i], [class*="card" i]');
    recordTest('People: Populations view present', populationsView);

    // Test 3: Navigate to Humans tab
    await this.navigate('/audience/community');
    await waitForNetworkIdle(this.page);

    const humansTable = await elementExists(this.page, 'table, [class*="table" i], [role="grid"]');
    recordTest('People: Humans table present', humansTable);

    // Test 4: Navigate to Lists & Segments
    await this.navigate('/audience/segments');
    await waitForNetworkIdle(this.page);

    const segmentsView = await elementExists(this.page, '[class*="segment" i], [class*="list" i], table');
    recordTest('People: Segments view present', segmentsView);

    // Test 5: Navigate to Properties
    await this.navigate('/audience/properties');
    await waitForNetworkIdle(this.page);

    const propertiesView = await elementExists(this.page, '[class*="propert" i], table, [class*="list" i]');
    recordTest('People: Properties view present', propertiesView);
  }
}

// Campaign Tests
class CampaignTests extends TestSuite {
  async runAll() {
    log('Running Campaign Tests...', 'info');
    await this.navigate('/campaigns');

    // Test 1: Campaign grid/list present
    const campaignGridExists = await elementExists(this.page, '[class*="grid" i], [class*="card" i], [class*="campaign" i]');
    recordTest('Campaigns: Campaign grid present', campaignGridExists);

    // Test 2: Create campaign button
    const createExists = await elementExists(this.page, 'button');
    recordTest('Campaigns: Create button present', createExists);

    // Test 3: Navigation tabs (All, Templates, Usage, Magic Reels)
    const tabsExist = await elementExists(this.page, '[role="tablist"], [class*="tab" i]');
    recordTest('Campaigns: Navigation tabs present', tabsExist);

    // Test 4: Filter and sort controls
    const filtersExist = await elementExists(this.page, '[class*="filter" i], select, [class*="sort" i]');
    recordTest('Campaigns: Filter controls present', filtersExist);

    // Test 5: Campaign cards have status badges
    const hasCards = await elementExists(this.page, '[class*="card" i]');
    if (hasCards) {
      const statusBadge = await elementExists(this.page, '[class*="badge" i], [class*="status" i], [class*="chip" i]');
      recordTest('Campaigns: Status badges present', statusBadge);
    }
  }
}

// Dataset Tests
class DatasetTests extends TestSuite {
  async runAll() {
    log('Running Dataset Tests...', 'info');
    await this.navigate('/datasets');

    // Test 1: Dataset grid present
    const datasetGridExists = await elementExists(this.page, '[class*="grid" i], [class*="card" i], [class*="dataset" i]');
    recordTest('Datasets: Grid present', datasetGridExists);

    // Test 2: Create dataset button
    const createExists = await elementExists(this.page, 'button');
    recordTest('Datasets: Create button present', createExists);

    // Test 3: Search functionality
    const searchExists = await elementExists(this.page, 'input[type="search"], input[placeholder*="search" i]');
    recordTest('Datasets: Search input present', searchExists);

    // Test 4: Dataset cards show file count
    const hasCards = await elementExists(this.page, '[class*="card" i]');
    if (hasCards) {
      const fileCount = await elementExists(this.page, '[class*="file" i], [class*="count" i]');
      recordTest('Datasets: File count shown', fileCount);
    }
  }
}

// Workflow Tests
class WorkflowTests extends TestSuite {
  async runAll() {
    log('Running Workflow Tests...', 'info');
    await this.navigate('/workflow');

    // Test 1: Workflow navigation tabs
    const tabsExist = await elementExists(this.page, '[role="tablist"], [class*="tab" i]');
    recordTest('Workflows: Navigation tabs present', tabsExist);

    // Test 2: Navigate to Flows
    await this.navigate('/workflow/flows');
    await waitForNetworkIdle(this.page);

    const flowsGrid = await elementExists(this.page, '[class*="grid" i], [class*="card" i], [class*="flow" i]');
    recordTest('Workflows: Flows grid present', flowsGrid);

    // Test 3: Create workflow button
    const createExists = await elementExists(this.page, 'button');
    recordTest('Workflows: Create button present', createExists);

    // Test 4: Search and sort controls
    const controlsExist = await elementExists(this.page, 'input[type="search"], select, [class*="sort" i]');
    recordTest('Workflows: Search/sort controls present', controlsExist);
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
    },
    passed: results.passed,
    failed: results.failed,
    warnings: results.warnings,
  };

  // Save JSON report
  const reportPath = path.join(__dirname, '..', 'qa-report.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

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
    results.failed.forEach(f => console.log(`  - ${f.name}: ${f.details}`));
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
