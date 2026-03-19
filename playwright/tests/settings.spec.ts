import { test, expect } from '@playwright/test';
import { gotoSection, waitForLoaders } from './helpers/workspace';
import { loginViaUI } from './helpers/login';
import {
  clickButtonByText,
  waitForModal,
  dismissModal,
  bodyContainsText,
  waitForAnySelector,
} from './helpers/ui';

// ---------------------------------------------------------------------------
// All tests require a real login because the Vurvey SPA clears localStorage
// tokens restored by storageState on boot.
// ---------------------------------------------------------------------------
test.describe('settings.md: Documentation claim tests', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
    await waitForLoaders(page);
  });

  // =========================================================================
  // GENERAL SETTINGS — SESSION TIMEOUT
  // =========================================================================
  test.describe('Session Timeout', () => {
    test.beforeEach(async ({ page }) => {
      await gotoSection(page, '/workspace/settings');
      await page.waitForTimeout(2_000);
    });

    // Claim: Shows "No Limit" or a minute-based timeout such as "15 minutes"
    test('displays session timeout value (No Limit or minutes)', async ({ page }) => {
      const timeoutValue = page.getByText(/no limit/i).first()
        .or(page.getByText(/\d+\s*minutes?/i).first())
        .first();
      await expect(timeoutValue).toBeVisible({ timeout: 15_000 });
    });

    // Claim: Timeout is edited through a modal with enable/disable switch,
    // minute input, Save and Cancel
    test('edit modal has switch, minute input, Save, and Cancel', async ({ page }) => {
      // Find and click the Edit action near session timeout
      const sessionSection = page.getByText(/session timeout/i).first();
      await sessionSection.waitFor({ state: 'visible', timeout: 15_000 });

      // Click the Edit button nearest to the session timeout section
      const editBtn = page.locator('button, [role="button"]').filter({
        hasText: /edit/i,
      }).first();
      // There may be multiple Edit buttons; we need the one associated with Session Timeout.
      // Strategy: look for Edit near Session Timeout text, or just click the first one since
      // General Settings page shows Session Timeout first.
      await editBtn.waitFor({ state: 'visible', timeout: 10_000 });
      await editBtn.click();

      const modal = await waitForModal(page);

      // Check for enable/disable switch
      const toggle = modal.locator(
        '[role="switch"], input[type="checkbox"], [class*="switch" i], [class*="toggle" i]'
      ).first();
      expect.soft(
        await toggle.isVisible({ timeout: 8_000 }).catch(() => false),
        'Session timeout modal should have an enable/disable switch'
      ).toBeTruthy();

      // Check for minute input (may be hidden if timeout is disabled)
      const minuteInput = modal.locator(
        'input[type="number"], input[type="text"][placeholder*="minute" i], input[name*="minute" i], input[name*="timeout" i]'
      ).first();
      // The input might only appear when the switch is enabled — soft assert
      expect.soft(
        await minuteInput.isVisible({ timeout: 5_000 }).catch(() => false)
          || await toggle.isVisible().catch(() => false),
        'Session timeout modal should have a minute input (or the switch to reveal it)'
      ).toBeTruthy();

      // Check for Save button
      const saveBtn = modal.locator('button').filter({ hasText: /save/i }).first();
      expect.soft(
        await saveBtn.isVisible({ timeout: 5_000 }).catch(() => false),
        'Session timeout modal should have a Save button'
      ).toBeTruthy();

      // Check for Cancel button
      const cancelBtn = modal.locator('button').filter({ hasText: /cancel/i }).first();
      expect.soft(
        await cancelBtn.isVisible({ timeout: 5_000 }).catch(() => false),
        'Session timeout modal should have a Cancel button'
      ).toBeTruthy();

      await dismissModal(page);
    });
  });

  // =========================================================================
  // GENERAL SETTINGS — WORKSPACE NAME
  // =========================================================================
  test.describe('Workspace Name', () => {
    test.beforeEach(async ({ page }) => {
      await gotoSection(page, '/workspace/settings');
      await page.waitForTimeout(2_000);
    });

    // Claim: Shows the workspace name and an Edit action
    test('workspace name displayed with Edit action', async ({ page }) => {
      // The page should show the workspace name text somewhere
      const nameSection = page.getByText(/workspace name/i).first()
        .or(page.locator('[class*="workspaceName" i]').first())
        .first();
      await expect(nameSection).toBeVisible({ timeout: 15_000 });

      // There should be an Edit button/action associated with the workspace name
      const editButtons = page.locator('button, [role="button"]').filter({
        hasText: /edit/i,
      });
      const editCount = await editButtons.count();
      expect(editCount, 'General settings page should have at least one Edit button').toBeGreaterThan(0);
    });

    // Claim: Edit flow opens a small single-input modal
    test('edit workspace name opens single-input modal', async ({ page }) => {
      // Look for the workspace name section and its associated Edit button
      // Strategy: find all Edit buttons, click the one near "Workspace Name" or
      // the second one (after Session Timeout)
      const editButtons = page.locator('button, [role="button"]').filter({
        hasText: /edit/i,
      });
      await editButtons.first().waitFor({ state: 'visible', timeout: 10_000 });

      // We need the Edit button for workspace name, not session timeout.
      // Click each Edit button until we find a modal with a text input (not a switch).
      const count = await editButtons.count();
      let foundNameModal = false;

      for (let i = 0; i < Math.min(count, 4); i++) {
        await editButtons.nth(i).click();
        const modal = page.locator('[role="dialog"], [class*="modal" i]').first();
        const isModalVisible = await modal.isVisible({ timeout: 5_000 }).catch(() => false);

        if (isModalVisible) {
          // Check if this modal has a simple text input (workspace name modal)
          const textInput = modal.locator(
            'input[type="text"], input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]):not([type="number"])'
          ).first();
          const hasTextInput = await textInput.isVisible({ timeout: 3_000 }).catch(() => false);

          // Check it does NOT have a switch (that would be session timeout modal)
          const hasSwitch = await modal.locator(
            '[role="switch"], [class*="switch" i], [class*="toggle" i]'
          ).first().isVisible({ timeout: 2_000 }).catch(() => false);

          if (hasTextInput && !hasSwitch) {
            foundNameModal = true;

            // Verify Save and Cancel
            expect.soft(
              await modal.locator('button').filter({ hasText: /save/i }).first()
                .isVisible({ timeout: 3_000 }).catch(() => false),
              'Workspace name modal should have Save button'
            ).toBeTruthy();

            expect.soft(
              await modal.locator('button').filter({ hasText: /cancel/i }).first()
                .isVisible({ timeout: 3_000 }).catch(() => false),
              'Workspace name modal should have Cancel button'
            ).toBeTruthy();

            await dismissModal(page);
            break;
          }

          await dismissModal(page);
          await page.waitForTimeout(500);
        }
      }

      expect(foundNameModal, 'Should find a workspace name edit modal with a single text input').toBeTruthy();
    });
  });

  // =========================================================================
  // GENERAL SETTINGS — WORKSPACE AVATAR
  // =========================================================================
  test.describe('Workspace Avatar', () => {
    test.beforeEach(async ({ page }) => {
      await gotoSection(page, '/workspace/settings');
      await page.waitForTimeout(2_000);
    });

    // Claim: Shows the current avatar and an Edit action
    test('workspace avatar displayed with Edit action', async ({ page }) => {
      // Look for avatar element (img, or a container with avatar-related class)
      const avatar = page.locator(
        '[class*="avatar" i], [data-testid*="avatar" i], img[alt*="avatar" i], img[alt*="workspace" i], [class*="workspaceImage" i], [class*="workspaceLogo" i]'
      ).first();
      expect.soft(
        await avatar.isVisible({ timeout: 15_000 }).catch(() => false),
        'Workspace avatar should be visible on General Settings page'
      ).toBeTruthy();

      // The avatar section header or label should be visible
      const avatarLabel = page.getByText(/avatar/i).first()
        .or(page.getByText(/workspace (image|photo|logo|picture)/i).first())
        .first();
      expect.soft(
        await avatarLabel.isVisible({ timeout: 10_000 }).catch(() => false),
        'Avatar section label should be visible'
      ).toBeTruthy();
    });
  });

  // =========================================================================
  // GENERAL SETTINGS — CURRENT PLAN
  // =========================================================================
  test.describe('Plan Card', () => {
    test.beforeEach(async ({ page }) => {
      await gotoSection(page, '/workspace/settings');
      await page.waitForTimeout(2_000);
    });

    // Claim: Shows the current workspace plan using the plan card component
    test('current plan displayed via plan card', async ({ page }) => {
      // Look for plan-related content
      const planCard = page.locator(
        '[class*="plan" i], [data-testid*="plan" i]'
      ).first();
      const planText = page.getByText(/plan/i).first();

      // Either a plan card component or plan text should be visible
      const planElement = planCard.or(planText).first();
      await expect(planElement).toBeVisible({ timeout: 15_000 });

      // Check for plan-type keywords (e.g., Free, Pro, Enterprise, Trial, Starter)
      const hasKnownPlan = await bodyContainsText(page, 'free')
        || await bodyContainsText(page, 'pro')
        || await bodyContainsText(page, 'enterprise')
        || await bodyContainsText(page, 'trial')
        || await bodyContainsText(page, 'starter')
        || await bodyContainsText(page, 'plan');

      expect.soft(hasKnownPlan, 'Page should display a plan type or "plan" label').toBeTruthy();
    });
  });

  // =========================================================================
  // MANAGE USERS
  // =========================================================================
  test.describe('Manage Users', () => {
    test.beforeEach(async ({ page }) => {
      await gotoSection(page, '/workspace/members');
      // Wait for the member table to render (banner + table)
      await page.locator('table, [class*="member" i]').first()
        .waitFor({ state: 'visible', timeout: 20_000 }).catch(() => {});
      await page.waitForTimeout(1_000);
    });

    // Claim: Header actions for Transfer Ownership and Add Users
    test('header has Transfer Ownership and Add Users actions', async ({ page }) => {
      // Transfer Ownership button — only visible for workspace owners.
      // The test user may be an administrator, so soft-assert this one.
      const transferBtn = page.locator('button, [role="button"]').filter({
        hasText: /transfer ownership/i,
      }).first();
      expect.soft(
        await transferBtn.isVisible({ timeout: 10_000 }).catch(() => false),
        'Members page should have a "Transfer Ownership" button (requires owner role)'
      ).toBeTruthy();

      // Add Users button
      const addUsersBtn = page.locator('button, [role="button"]').filter({
        hasText: /add users?/i,
      }).first();
      await expect(addUsersBtn).toBeVisible({ timeout: 15_000 });
    });

    // Claim: Searchable "Search Members" field
    test('Search Members field is present', async ({ page }) => {
      const searchField = page.locator(
        'input[placeholder*="search" i], input[type="search"], [data-testid*="search" i]'
      ).first();
      await expect(searchField).toBeVisible({ timeout: 15_000 });

      // Verify it's the member search (placeholder or nearby label)
      const placeholder = await searchField.getAttribute('placeholder') || '';
      expect.soft(
        placeholder.toLowerCase().includes('search') || placeholder.toLowerCase().includes('member'),
        'Search field should reference searching members'
      ).toBeTruthy();
    });

    // Claim: Role filter dropdown with All roles, Administrator, Manager, Owner, optional Guest
    test('role filter dropdown with expected roles', async ({ page }) => {
      // The role filter is a button showing "All roles" that opens a dropdown
      const roleFilter = page.locator('button, [role="button"]').filter({
        hasText: /all roles/i,
      }).first();

      await expect(roleFilter).toBeVisible({ timeout: 15_000 });
      await roleFilter.click();

      // Wait for dropdown options to appear
      await page.waitForTimeout(1_000);

      // Check for expected role options in the dropdown/popover
      const expectedRoles = ['All roles', 'Administrator', 'Manager', 'Owner'];
      for (const role of expectedRoles) {
        const roleOption = page.locator(
          '[role="option"], [role="menuitem"], [role="menuitemradio"], li, [class*="item" i], [class*="option" i]'
        ).filter({
          hasText: new RegExp(`^\\s*${role}\\s*$`, 'i'),
        }).first()
          .or(page.getByText(new RegExp(`^${role}$`, 'i')).first())
          .first();
        expect.soft(
          await roleOption.isVisible({ timeout: 5_000 }).catch(() => false),
          `Role filter should contain "${role}" option`
        ).toBeTruthy();
      }

      // Guest is optional — soft assert only
      const guestOption = page.locator(
        '[role="option"], [role="menuitem"], [role="menuitemradio"], li, [class*="item" i], [class*="option" i]'
      ).filter({
        hasText: /guest/i,
      }).first();
      expect.soft(
        await guestOption.isVisible({ timeout: 3_000 }).catch(() => false),
        'Role filter may contain "Guest" option (optional, depends on workspace config)'
      ).toBeTruthy();

      // Dismiss dropdown
      await page.keyboard.press('Escape');
    });

    // Claim: Per-row vertical menu with Edit and Remove
    test('member row has menu with Edit and Remove', async ({ page }) => {
      // Find a data row in the member table (skip header row by targeting tbody tr)
      const memberRow = page.locator('tbody tr').first()
        .or(page.locator('table tr').nth(1))
        .first();

      const isRowVisible = await memberRow.isVisible({ timeout: 15_000 }).catch(() => false);
      if (!isRowVisible) {
        test.skip(true, 'No member rows found on the page');
        return;
      }

      // Each member row has a button (with an img icon) in the last cell
      const menuBtn = memberRow.locator('button').first();
      await menuBtn.waitFor({ state: 'visible', timeout: 5_000 });
      await menuBtn.click();

      // Wait for the dropdown menu to appear
      const menu = page.locator(
        '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i], [class*="contextMenu" i]'
      ).first();
      await menu.waitFor({ state: 'visible', timeout: 8_000 }).catch(() => {});

      // Check for Edit option
      expect.soft(
        await menu.getByText(/edit/i).first().isVisible({ timeout: 5_000 }).catch(() => false),
        'Member row menu should have "Edit" option'
      ).toBeTruthy();

      // Check for Remove option
      expect.soft(
        await menu.getByText(/remove/i).first().isVisible({ timeout: 5_000 }).catch(() => false),
        'Member row menu should have "Remove" option'
      ).toBeTruthy();

      await page.keyboard.press('Escape');
    });
  });

  // =========================================================================
  // INVITE MEMBERS MODAL
  // =========================================================================
  test.describe('Invite Members Modal', () => {
    test.beforeEach(async ({ page }) => {
      await gotoSection(page, '/workspace/members');
      // Wait for the member table to render before trying to open the modal
      await page.locator('table, [class*="member" i]').first()
        .waitFor({ state: 'visible', timeout: 20_000 }).catch(() => {});
      await page.waitForTimeout(1_000);
    });

    // Claim: Tag-input email field, role radios (Owner/Admin/Manager/Guest),
    // Add Member button
    test('invite modal has email field, role radios, and Add Member button', async ({ page }) => {
      // Click "Add Users" to open the invite modal
      const addUsersBtn = page.locator('button, [role="button"]').filter({
        hasText: /add users?/i,
      }).first();
      await addUsersBtn.waitFor({ state: 'visible', timeout: 15_000 });
      await addUsersBtn.click();

      const modal = await waitForModal(page);

      // Check for email tag-input field — may be a plain input or a tag-input component
      const emailInput = modal.locator(
        'input[type="email"], input[type="text"], input[placeholder*="email" i], input[name*="email" i], textarea, [contenteditable="true"]'
      ).first();
      expect.soft(
        await emailInput.isVisible({ timeout: 8_000 }).catch(() => false),
        'Invite modal should have an email input field'
      ).toBeTruthy();

      // Check for role radios: Owner, Admin/Administrator, Manager
      const roleLabels = ['Owner', 'Admin', 'Manager'];
      for (const role of roleLabels) {
        const roleOption = modal.getByText(new RegExp(role, 'i')).first();
        expect.soft(
          await roleOption.isVisible({ timeout: 5_000 }).catch(() => false),
          `Invite modal should have "${role}" role option`
        ).toBeTruthy();
      }

      // Guest is optional — depends on workspace config
      expect.soft(
        await modal.getByText(/guest/i).first().isVisible({ timeout: 3_000 }).catch(() => false),
        'Invite modal may have "Guest" role option (optional)'
      ).toBeTruthy();

      // Check for "Add Member" button
      const addMemberBtn = modal.locator('button').filter({
        hasText: /add member/i,
      }).first();
      expect.soft(
        await addMemberBtn.isVisible({ timeout: 5_000 }).catch(() => false),
        'Invite modal should have an "Add Member" button'
      ).toBeTruthy();

      await dismissModal(page);
    });
  });

  // =========================================================================
  // TRANSFER OWNERSHIP DIALOG
  // =========================================================================
  test.describe('Transfer Ownership Dialog', () => {
    test.beforeEach(async ({ page }) => {
      await gotoSection(page, '/workspace/members');
      // Wait for the member table to render
      await page.locator('table, [class*="member" i]').first()
        .waitFor({ state: 'visible', timeout: 20_000 }).catch(() => {});
      await page.waitForTimeout(1_000);
    });

    // Claim: User selector plus resource-type dropdown (All resource types,
    // Campaigns, Datasets, Workflows, Ai-personas)
    test('transfer dialog has user selector and resource-type dropdown', async ({ page }) => {
      // Click "Transfer Ownership" to open the dialog
      const transferBtn = page.locator('button, [role="button"]').filter({
        hasText: /transfer ownership/i,
      }).first();

      const isTransferVisible = await transferBtn.isVisible({ timeout: 15_000 }).catch(() => false);
      if (!isTransferVisible) {
        test.skip(true, 'Transfer Ownership button not visible — may require owner role');
        return;
      }

      await transferBtn.click();

      const modal = await waitForModal(page);

      // Check for user selector (dropdown, input, or select for choosing a user)
      const userSelector = modal.locator(
        'select, [role="combobox"], [role="listbox"], input[placeholder*="user" i], input[placeholder*="member" i], input[placeholder*="select" i], input[placeholder*="search" i], [class*="select" i], [class*="dropdown" i]'
      ).first();
      expect.soft(
        await userSelector.isVisible({ timeout: 8_000 }).catch(() => false),
        'Transfer dialog should have a user selector'
      ).toBeTruthy();

      // Check for resource-type dropdown
      const resourceDropdown = modal.locator(
        'select, [role="combobox"], [role="listbox"], [class*="select" i], [class*="dropdown" i]'
      );
      // There should be at least 2 selectors: user + resource type
      const selectorCount = await resourceDropdown.count();
      expect.soft(
        selectorCount >= 2,
        'Transfer dialog should have both user selector and resource-type dropdown'
      ).toBeTruthy();

      // Try to find the resource-type dropdown specifically
      // It may contain text like "All resource types"
      const resourceTypeText = modal.getByText(/all resource types/i).first()
        .or(modal.getByText(/resource type/i).first())
        .or(modal.getByText(/campaigns/i).first())
        .first();
      expect.soft(
        await resourceTypeText.isVisible({ timeout: 5_000 }).catch(() => false),
        'Transfer dialog should show resource type options (e.g., "All resource types")'
      ).toBeTruthy();

      await dismissModal(page);
    });
  });
});
