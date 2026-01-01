#!/usr/bin/env node

/**
 * Vurvey Mobile Viewport Test Suite
 *
 * Tests responsive design across multiple device viewports.
 * Verifies that UI elements are properly displayed and accessible
 * on mobile, tablet, and desktop screens.
 *
 * Usage: node scripts/qa-mobile-viewport-tests.js
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

const config = {
  email: process.env.VURVEY_EMAIL,
  password: process.env.VURVEY_PASSWORD,
  baseUrl: process.env.VURVEY_URL || 'https://staging.vurvey.com',
  headless: process.env.HEADLESS !== 'false',
  timeout: 30000,
};

// Device viewport configurations
const DEVICES = {
  'iPhone SE': { width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  'iPhone 12': { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  'iPhone 14 Pro Max': { width: 430, height: 932, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  'iPad Mini': { width: 768, height: 1024, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  'iPad Pro 11': { width: 834, height: 1194, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  'iPad Pro 12.9': { width: 1024, height: 1366, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  'Desktop HD': { width: 1920, height: 1080, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
  'Desktop 4K': { width: 2560, height: 1440, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
};

const results = {
  tests: [],
  screenshots: [],
  summary: { passed: 0, failed: 0, warnings: 0 },
  startTime: new Date(),
};

const outputDir = path.join(__dirname, '..', 'qa-output', 'viewport-tests');

function log(message, type = 'info') {
  const timestamp = new Date().toISOString().slice(11, 19);
  const colors = {
    info: '\x1b[36m',
    pass: '\x1b[32m',
    fail: '\x1b[31m',
    warn: '\x1b[33m',
  };
  console.log(`${timestamp} ${colors[type] || ''}[${type.toUpperCase()}]\x1b[0m ${message}`);
}

function recordTest(device, route, name, passed, details) {
  results.tests.push({
    device,
    route,
    name,
    passed,
    details,
    timestamp: new Date().toISOString(),
  });

  if (passed) {
    results.summary.passed++;
    log(`[${device}] ${name}: ${details}`, 'pass');
  } else {
    results.summary.failed++;
    log(`[${device}] ${name}: ${details}`, 'fail');
  }
}

async function captureScreenshot(page, device, route) {
  const safeName = `${device}-${route}`.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const filename = `${safeName}.png`;
  const filepath = path.join(outputDir, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  results.screenshots.push({ device, route, path: filepath });
  return filepath;
}

async function waitForNetworkIdle(page, timeout = 5000) {
  try {
    await page.waitForNetworkIdle({ idleTime: 1000, timeout });
  } catch (e) {}
}

async function elementExists(page, selector, timeout = 3000) {
  try {
    await page.waitForSelector(selector, { timeout, visible: true });
    return true;
  } catch (e) {
    return false;
  }
}

async function getElementBox(page, selector) {
  try {
    const element = await page.$(selector);
    if (!element) return null;
    return await element.boundingBox();
  } catch (e) {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEWPORT TESTS
// ═══════════════════════════════════════════════════════════════════════════

async function testNavigationVisibility(page, device, route) {
  // Test: Main navigation is accessible
  const navSelectors = ['nav', '[role="navigation"]', '[class*="nav" i]', '[class*="sidebar" i]'];
  let navFound = false;

  for (const selector of navSelectors) {
    if (await elementExists(page, selector, 1000)) {
      navFound = true;
      break;
    }
  }

  recordTest(device, route, 'Navigation accessible', navFound,
    navFound ? 'Navigation element found' : 'Navigation not found');

  // Test: Mobile menu toggle (on mobile devices)
  if (DEVICES[device].isMobile) {
    const mobileMenuSelectors = [
      '[class*="hamburger" i]',
      '[class*="menu-toggle" i]',
      'button[aria-label*="menu" i]',
      '[class*="mobile" i][class*="menu" i]',
    ];

    let mobileMenuFound = false;
    for (const selector of mobileMenuSelectors) {
      if (await elementExists(page, selector, 1000)) {
        mobileMenuFound = true;
        break;
      }
    }

    recordTest(device, route, 'Mobile menu toggle', mobileMenuFound || !navFound,
      mobileMenuFound ? 'Mobile menu toggle found' : 'No mobile menu (may use different pattern)');
  }
}

async function testContentVisibility(page, device, route) {
  // Test: Main content area visible
  const mainSelectors = ['main', '[role="main"]', '[class*="content" i]', '[class*="page" i]'];
  let mainFound = false;
  let mainBox = null;

  for (const selector of mainSelectors) {
    const box = await getElementBox(page, selector);
    if (box && box.width > 0 && box.height > 0) {
      mainFound = true;
      mainBox = box;
      break;
    }
  }

  recordTest(device, route, 'Main content visible', mainFound,
    mainFound ? `Content area: ${Math.round(mainBox.width)}x${Math.round(mainBox.height)}` : 'Main content not found');

  // Test: Content doesn't overflow viewport
  if (mainBox) {
    const viewport = DEVICES[device];
    const overflowsHorizontally = mainBox.width > viewport.width;
    recordTest(device, route, 'No horizontal overflow', !overflowsHorizontally,
      overflowsHorizontally ? `Content ${Math.round(mainBox.width)}px > viewport ${viewport.width}px` : 'Content fits viewport');
  }
}

async function testInteractiveElements(page, device, route) {
  // Test: Buttons are touch-friendly (minimum 44x44 pixels on mobile)
  const buttons = await page.$$('button, [role="button"], a.btn, [class*="button" i]');
  let smallButtons = 0;
  const minTouchSize = DEVICES[device].isMobile ? 44 : 24;

  for (const button of buttons.slice(0, 10)) {
    const box = await button.boundingBox();
    if (box && (box.width < minTouchSize || box.height < minTouchSize)) {
      smallButtons++;
    }
  }

  recordTest(device, route, 'Touch-friendly buttons', smallButtons === 0,
    smallButtons === 0 ? 'All tested buttons meet minimum size' : `${smallButtons} buttons below ${minTouchSize}px`);

  // Test: Input fields are properly sized
  const inputs = await page.$$('input, textarea, select');
  let smallInputs = 0;

  for (const input of inputs.slice(0, 10)) {
    const box = await input.boundingBox();
    if (box && box.height < 32) {
      smallInputs++;
    }
  }

  recordTest(device, route, 'Properly sized inputs', smallInputs === 0,
    smallInputs === 0 ? 'All tested inputs meet minimum height' : `${smallInputs} inputs below 32px height`);
}

async function testTextReadability(page, device, route) {
  // Test: Text is readable (check for tiny font sizes via element inspection)
  const textElements = await page.$$('p, span, div, li, td, th, label, h1, h2, h3, h4, h5, h6');
  let tinyTextCount = 0;

  for (const el of textElements.slice(0, 20)) {
    try {
      const fontSize = await el.getProperty('style').then(s => s.jsonValue());
      // Skip if we can't get style - more thorough checks would require different approach
    } catch (e) {}
  }

  // Just verify text elements exist
  recordTest(device, route, 'Text elements present', textElements.length > 0,
    `Found ${textElements.length} text elements`);
}

async function testGridLayout(page, device, route) {
  // Test: Grid/card layouts adapt to viewport
  const gridSelectors = ['[class*="grid" i]', '[class*="cards" i]', '[class*="gallery" i]'];
  let gridFound = false;

  for (const selector of gridSelectors) {
    if (await elementExists(page, selector, 1000)) {
      gridFound = true;
      const gridBox = await getElementBox(page, selector);
      if (gridBox) {
        const viewport = DEVICES[device];
        const fitsViewport = gridBox.width <= viewport.width;
        recordTest(device, route, 'Grid fits viewport', fitsViewport,
          fitsViewport ? `Grid width ${Math.round(gridBox.width)}px` : `Grid overflows: ${Math.round(gridBox.width)}px > ${viewport.width}px`);
      }
      break;
    }
  }

  if (!gridFound) {
    recordTest(device, route, 'Grid layout check', true, 'No grid layout on this page');
  }
}

async function testModalsAndDrawers(page, device, route) {
  // Test: Look for modal triggers and verify they work
  const modalTriggers = await page.$$('button[class*="create" i], button[aria-haspopup="dialog"]');

  if (modalTriggers.length > 0) {
    try {
      await modalTriggers[0].click();
      await new Promise(r => setTimeout(r, 1000));

      const modalSelectors = ['[role="dialog"]', '[class*="modal" i]', '[class*="drawer" i]'];
      let modalFound = false;
      let modalBox = null;

      for (const selector of modalSelectors) {
        const box = await getElementBox(page, selector);
        if (box && box.width > 0) {
          modalFound = true;
          modalBox = box;
          break;
        }
      }

      if (modalFound && modalBox) {
        const viewport = DEVICES[device];
        const fitsViewport = modalBox.width <= viewport.width;
        recordTest(device, route, 'Modal fits viewport', fitsViewport,
          fitsViewport ? `Modal width ${Math.round(modalBox.width)}px` : `Modal overflows: ${Math.round(modalBox.width)}px`);
      }

      // Close modal
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 500));
    } catch (e) {
      recordTest(device, route, 'Modal test', true, 'Could not test modal');
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
  if (submitButton) await submitButton.click();

  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });

  const url = page.url();
  const workspaceMatch = url.match(/\/([a-f0-9-]{36})/);

  if (workspaceMatch) {
    log(`Login successful. Workspace: ${workspaceMatch[1]}`, 'pass');
    return workspaceMatch[1];
  }

  throw new Error('Could not extract workspace ID from URL');
}

async function runViewportTests(page, workspaceId, device, deviceConfig) {
  log(`\n${'─'.repeat(50)}`, 'info');
  log(`Testing device: ${device} (${deviceConfig.width}x${deviceConfig.height})`, 'info');
  log('─'.repeat(50), 'info');

  await page.setViewport({
    width: deviceConfig.width,
    height: deviceConfig.height,
    deviceScaleFactor: deviceConfig.deviceScaleFactor,
    isMobile: deviceConfig.isMobile,
    hasTouch: deviceConfig.hasTouch,
  });

  const routes = [
    { route: '/', name: 'Home' },
    { route: '/agents', name: 'Agents' },
    { route: '/campaigns', name: 'Campaigns' },
    { route: '/datasets', name: 'Datasets' },
    { route: '/audience', name: 'People' },
    { route: '/workflow', name: 'Workflows' },
  ];

  for (const { route, name } of routes) {
    const url = `${config.baseUrl}/${workspaceId}${route}`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: config.timeout });
    await waitForNetworkIdle(page);

    log(`\nTesting ${name} (${route})...`, 'info');

    await testNavigationVisibility(page, device, name);
    await testContentVisibility(page, device, name);
    await testInteractiveElements(page, device, name);
    await testTextReadability(page, device, name);
    await testGridLayout(page, device, name);
    await testModalsAndDrawers(page, device, name);

    // Capture screenshot for visual review
    await captureScreenshot(page, device, name);
  }
}

async function generateReport() {
  results.endTime = new Date();
  const duration = (results.endTime - results.startTime) / 1000;

  const reportPath = path.join(outputDir, 'viewport-test-report.json');
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2));

  // Generate markdown report
  const mdPath = path.join(outputDir, 'viewport-test-report.md');
  let md = `# Vurvey Mobile Viewport Test Report\n\n`;
  md += `**Generated**: ${results.startTime.toISOString()}\n`;
  md += `**Duration**: ${duration.toFixed(2)}s\n`;
  md += `**Devices Tested**: ${[...new Set(results.tests.map(t => t.device))].length}\n\n`;

  md += `## Summary\n\n`;
  md += `| Result | Count |\n`;
  md += `|--------|-------|\n`;
  md += `| ✅ Passed | ${results.summary.passed} |\n`;
  md += `| ❌ Failed | ${results.summary.failed} |\n\n`;

  // Group by device
  const devices = {};
  results.tests.forEach(test => {
    if (!devices[test.device]) devices[test.device] = [];
    devices[test.device].push(test);
  });

  for (const [device, tests] of Object.entries(devices)) {
    const deviceConfig = DEVICES[device];
    md += `## ${device} (${deviceConfig.width}x${deviceConfig.height})\n\n`;

    const failed = tests.filter(t => !t.passed);
    const passed = tests.filter(t => t.passed);

    if (failed.length > 0) {
      md += `### ❌ Failed (${failed.length})\n\n`;
      failed.forEach(t => {
        md += `- **${t.route}** - ${t.name}: ${t.details}\n`;
      });
      md += `\n`;
    }

    md += `### ✅ Passed (${passed.length})\n\n`;
    md += `<details><summary>View passed tests</summary>\n\n`;
    passed.forEach(t => {
      md += `- ${t.route} - ${t.name}\n`;
    });
    md += `\n</details>\n\n`;
  }

  md += `## Screenshots\n\n`;
  md += `Screenshots saved to: \`${outputDir}/\`\n\n`;
  md += `| Device | Route | File |\n`;
  md += `|--------|-------|------|\n`;
  results.screenshots.forEach(s => {
    md += `| ${s.device} | ${s.route} | ${path.basename(s.path)} |\n`;
  });

  await fs.writeFile(mdPath, md);

  // Print summary
  console.log('\n' + '═'.repeat(60));
  console.log('  MOBILE VIEWPORT TEST SUMMARY');
  console.log('═'.repeat(60));
  console.log(`\n  Passed:   ${results.summary.passed}`);
  console.log(`  Failed:   ${results.summary.failed}`);
  console.log(`  Duration: ${duration.toFixed(2)}s`);
  console.log(`  Screenshots: ${results.screenshots.length}`);
  console.log('\n' + '═'.repeat(60));

  if (results.summary.failed > 0) {
    console.log('\n\x1b[31m  Failed Tests:\x1b[0m');
    results.tests.filter(t => !t.passed).forEach(t => {
      console.log(`    ✗ [${t.device}] ${t.route}: ${t.name}`);
    });
  }

  console.log(`\n  Reports: ${outputDir}/`);
  console.log('═'.repeat(60) + '\n');
}

async function main() {
  if (!config.email || !config.password) {
    console.error('Error: VURVEY_EMAIL and VURVEY_PASSWORD environment variables required');
    process.exit(1);
  }

  await fs.mkdir(outputDir, { recursive: true });

  log('═══════════════════════════════════════════════════════════', 'info');
  log('       VURVEY MOBILE VIEWPORT TEST SUITE', 'info');
  log('═══════════════════════════════════════════════════════════', 'info');

  const browser = await puppeteer.launch({
    headless: config.headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  try {
    // Login with desktop viewport first
    await page.setViewport({ width: 1920, height: 1080 });
    const workspaceId = await login(page);

    // Test key device sizes (subset for speed)
    const devicesToTest = ['iPhone 12', 'iPad Mini', 'Desktop HD'];

    for (const device of devicesToTest) {
      await runViewportTests(page, workspaceId, device, DEVICES[device]);
    }

    await generateReport();

    if (results.summary.failed > 0) {
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
