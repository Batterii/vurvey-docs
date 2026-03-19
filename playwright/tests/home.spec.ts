import { test, expect, Page } from '@playwright/test';
import { gotoSection, waitForLoaders, workspaceUrl } from './helpers/workspace';
import { loginViaUI, ensureAuthenticated } from './helpers/login';
import {
  clickButtonByText,
  waitForModal,
  dismissModal,
  openDropdown,
  bodyContainsText,
  waitForAnySelector,
} from './helpers/ui';

// ---------------------------------------------------------------------------
// All tests in this file require a real login because the Vurvey SPA
// clears localStorage tokens restored by storageState.
// ---------------------------------------------------------------------------
test.describe('home.md: Documentation claim tests', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
    await waitForLoaders(page);
    // Navigate to home (chat) page
    await gotoSection(page, '/');
    await page.waitForTimeout(2_000);
  });

  // =========================================================================
  // CHAT INTERFACE GROUP
  // =========================================================================
  test.describe('Chat Interface', () => {
    // Claim: Greeting text "Hi [Name]! What might we create today?"
    test('greeting text visible on home page', async ({ page }) => {
      const greeting = page.getByText(/hi\s+\w+.*what might we create today/i).first();
      await expect(greeting).toBeVisible({ timeout: 15_000 });
    });

    // Claim: Text input at bottom of screen
    test('text input exists at bottom of screen', async ({ page }) => {
      const chatInput = page.locator([
        'textarea[placeholder]',
        'input[placeholder*="message" i]',
        'input[placeholder*="ask" i]',
        'textarea',
        '[contenteditable="true"]',
        '[data-testid*="chat-input"]',
        '[data-testid*="message-input"]',
        '[class*="chatInput" i]',
        '[class*="composer" i]',
      ].join(', ')).first();
      await expect(chatInput).toBeVisible({ timeout: 15_000 });
    });

    // Claim: Typing and pressing Enter sends message
    test('typing and pressing Enter sends a message', async ({ page }) => {
      const chatInput = page.locator([
        'textarea',
        '[contenteditable="true"]',
        'input[placeholder*="message" i]',
        'input[placeholder*="ask" i]',
        '[data-testid*="chat-input"]',
        '[data-testid*="message-input"]',
      ].join(', ')).first();
      await chatInput.waitFor({ state: 'visible', timeout: 15_000 });
      await chatInput.click();
      await chatInput.fill('Hello, this is a test message');
      await page.keyboard.press('Enter');

      // Wait for the message to appear in the conversation or a response to start
      const messageSent = page.locator('[class*="message" i], [class*="bubble" i], [class*="chat" i]')
        .filter({ hasText: /hello.*test message/i })
        .first();
      const responseIndicator = page.locator('[class*="typing" i], [class*="loading" i], [class*="streaming" i]').first();

      // Either the message appears or the AI starts responding
      await expect(
        messageSent.or(responseIndicator).first()
      ).toBeVisible({ timeout: 20_000 });
    });

    // Claim: Toolbar buttons visible above text input
    test('toolbar buttons visible above text input', async ({ page }) => {
      // Look for the toolbar area containing Agents, Sources, Images, Tools
      const toolbarArea = page.locator([
        '[class*="toolbar" i]',
        '[class*="actionBar" i]',
        '[class*="chatActions" i]',
        '[class*="composer" i]',
      ].join(', ')).first();

      // At least some toolbar buttons should be present
      const toolbarButtons = page.locator('button, [role="button"]').filter({
        hasText: /agents|sources|images|tools/i,
      });
      const count = await toolbarButtons.count();
      expect.soft(count, 'Expected at least one toolbar button (Agents/Sources/Images/Tools)').toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // TOOLBAR BUTTONS GROUP
  // =========================================================================
  test.describe('Toolbar Buttons', () => {
    // --- Agents button ---
    test('"Agents" button exists and is clickable', async ({ page }) => {
      const agentsBtn = page.locator('button, [role="button"]').filter({
        hasText: /^agents$/i,
      }).first();
      // Broaden search if exact match fails
      const agentsBtnFallback = page.locator('[aria-label*="agent" i], [data-testid*="agent" i]').first();
      const btn = agentsBtn.or(agentsBtnFallback).first();
      await expect(btn).toBeVisible({ timeout: 15_000 });
    });

    test('clicking Agents opens agent-picker modal', async ({ page }) => {
      const agentsBtn = page.locator('button, [role="button"]').filter({
        hasText: /agents/i,
      }).first()
        .or(page.locator('[aria-label*="agent" i], [data-testid*="agent" i]').first())
        .first();

      await agentsBtn.waitFor({ state: 'visible', timeout: 15_000 });
      await agentsBtn.click();

      // Wait for the agent picker modal/popover
      const modal = page.locator(
        '[role="dialog"], [class*="modal" i], [class*="picker" i], [class*="popover" i], [class*="drawer" i]'
      ).first();
      await expect(modal).toBeVisible({ timeout: 10_000 });
    });

    test('agent picker has filter chips, search, and action buttons', async ({ page }) => {
      // Open agent picker
      const agentsBtn = page.locator('button, [role="button"]').filter({
        hasText: /agents/i,
      }).first()
        .or(page.locator('[aria-label*="agent" i], [data-testid*="agent" i]').first())
        .first();
      await agentsBtn.waitFor({ state: 'visible', timeout: 15_000 });
      await agentsBtn.click();

      const modal = page.locator(
        '[role="dialog"], [class*="modal" i], [class*="picker" i], [class*="popover" i], [class*="drawer" i]'
      ).first();
      await modal.waitFor({ state: 'visible', timeout: 10_000 });

      // Check for filter chips (agent-type filter chips documented in home.md)
      const filterChips = modal.locator(
        '[class*="chip" i], [class*="filter" i] button, [class*="tab" i] button, [role="tab"], [class*="pill" i], [class*="tag" i] button'
      );
      const chipCount = await filterChips.count();
      expect.soft(chipCount, 'Agent picker should have filter chips for agent types').toBeGreaterThan(0);

      // Check for search input
      const searchInput = modal.locator('input[type="search"], input[type="text"], input[placeholder*="search" i]').first();
      expect.soft(await searchInput.isVisible({ timeout: 5_000 }).catch(() => false), 'Agent picker should have a search input').toBeTruthy();

      // Check for Cancel button
      const cancelBtn = modal.locator('button').filter({ hasText: /cancel/i }).first();
      expect.soft(await cancelBtn.isVisible({ timeout: 5_000 }).catch(() => false), 'Agent picker should have Cancel button').toBeTruthy();

      // Check for "Use selected" button
      const useSelectedBtn = modal.locator('button').filter({ hasText: /use selected/i }).first();
      expect.soft(await useSelectedBtn.isVisible({ timeout: 5_000 }).catch(() => false), 'Agent picker should have "Use selected" button').toBeTruthy();

      // Dismiss
      await dismissModal(page);
    });

    // --- Sources button ---
    test('"Sources" button exists', async ({ page }) => {
      const sourcesBtn = page.locator('button, [role="button"]').filter({
        hasText: /sources/i,
      }).first()
        .or(page.locator('[aria-label*="source" i], [data-testid*="source" i], [title*="source" i]').first())
        .first();
      await expect(sourcesBtn).toBeVisible({ timeout: 15_000 });
    });

    test('Sources dropdown has Attach Datasets, Attach Campaigns, and on/off toggle', async ({ page }) => {
      const sourcesBtn = page.locator('button, [role="button"]').filter({
        hasText: /sources/i,
      }).first()
        .or(page.locator('[aria-label*="source" i], [data-testid*="source" i], [title*="source" i]').first())
        .first();
      await sourcesBtn.waitFor({ state: 'visible', timeout: 15_000 });
      await sourcesBtn.click();

      // Wait for dropdown/popover
      const dropdown = page.locator(
        '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i], [class*="modal" i], [role="dialog"]'
      ).first();
      await dropdown.waitFor({ state: 'visible', timeout: 10_000 });

      // Check menu items
      expect.soft(
        await dropdown.getByText(/attach datasets/i).first().isVisible({ timeout: 5_000 }).catch(() => false),
        'Sources dropdown should have "Attach Datasets"'
      ).toBeTruthy();

      expect.soft(
        await dropdown.getByText(/attach campaigns/i).first().isVisible({ timeout: 5_000 }).catch(() => false),
        'Sources dropdown should have "Attach Campaigns"'
      ).toBeTruthy();

      expect.soft(
        await dropdown.getByText(/turn (on|off)/i).first().isVisible({ timeout: 5_000 }).catch(() => false)
        || await dropdown.locator('[class*="toggle" i], [role="switch"]').first().isVisible({ timeout: 3_000 }).catch(() => false),
        'Sources dropdown should have on/off toggle'
      ).toBeTruthy();

      await page.keyboard.press('Escape');
    });

    // --- Images button ---
    test('"Images" button exists (picture icon)', async ({ page }) => {
      const imagesBtn = page.locator('button, [role="button"]').filter({
        hasText: /images/i,
      }).first()
        .or(page.locator('[aria-label*="image" i], [data-testid*="image" i], [title*="image" i]').first())
        .first();
      await expect(imagesBtn).toBeVisible({ timeout: 15_000 });
    });

    test('Images dropdown shows available models', async ({ page }) => {
      const imagesBtn = page.locator('button, [role="button"]').filter({
        hasText: /images/i,
      }).first()
        .or(page.locator('[aria-label*="image" i], [data-testid*="image" i], [title*="image" i]').first())
        .first();
      await imagesBtn.waitFor({ state: 'visible', timeout: 15_000 });
      await imagesBtn.click();

      const dropdown = page.locator(
        '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i], [class*="modal" i], [role="dialog"]'
      ).first();
      await dropdown.waitFor({ state: 'visible', timeout: 10_000 });

      // Check for documented image models
      const models = ['Nano Banana', 'OpenAI', 'Google Imagen', 'Stable Diffusion'];
      for (const model of models) {
        expect.soft(
          await dropdown.getByText(new RegExp(model, 'i')).first().isVisible({ timeout: 5_000 }).catch(() => false),
          `Images dropdown should show "${model}" model`
        ).toBeTruthy();
      }

      await page.keyboard.press('Escape');
    });

    test('Images dropdown bottom option toggles image generation on/off', async ({ page }) => {
      const imagesBtn = page.locator('button, [role="button"]').filter({
        hasText: /images/i,
      }).first()
        .or(page.locator('[aria-label*="image" i], [data-testid*="image" i], [title*="image" i]').first())
        .first();
      await imagesBtn.waitFor({ state: 'visible', timeout: 15_000 });
      await imagesBtn.click();

      const dropdown = page.locator(
        '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i], [class*="modal" i], [role="dialog"]'
      ).first();
      await dropdown.waitFor({ state: 'visible', timeout: 10_000 });

      // Check for a toggle or on/off option at bottom
      const toggleOption = dropdown.getByText(/turn (on|off)/i).first()
        .or(dropdown.locator('[class*="toggle" i], [role="switch"]').first())
        .first();
      expect.soft(
        await toggleOption.isVisible({ timeout: 5_000 }).catch(() => false),
        'Images dropdown should have an on/off toggle at bottom'
      ).toBeTruthy();

      await page.keyboard.press('Escape');
    });

    // --- Tools button ---
    test('"Tools" button exists (sliders icon)', async ({ page }) => {
      const toolsBtn = page.locator('button, [role="button"]').filter({
        hasText: /tools/i,
      }).first()
        .or(page.locator('[aria-label*="tool" i], [data-testid*="tool" i], [title*="tool" i]').first())
        .first();
      await expect(toolsBtn).toBeVisible({ timeout: 15_000 });
    });

    test('Tools dropdown shows available tools', async ({ page }) => {
      const toolsBtn = page.locator('button, [role="button"]').filter({
        hasText: /tools/i,
      }).first()
        .or(page.locator('[aria-label*="tool" i], [data-testid*="tool" i], [title*="tool" i]').first())
        .first();
      await toolsBtn.waitFor({ state: 'visible', timeout: 15_000 });
      await toolsBtn.click();

      const dropdown = page.locator(
        '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i], [class*="modal" i], [role="dialog"]'
      ).first();
      await dropdown.waitFor({ state: 'visible', timeout: 10_000 });

      // Check for documented tools
      const tools = ['Web Research', 'TikTok', 'Reddit', 'LinkedIn', 'YouTube', 'X/Twitter', 'Instagram'];
      for (const tool of tools) {
        // For X/Twitter, match either "X" or "Twitter" or "X/Twitter"
        const pattern = tool === 'X/Twitter' ? /x|twitter/i : new RegExp(tool, 'i');
        expect.soft(
          await dropdown.getByText(pattern).first().isVisible({ timeout: 5_000 }).catch(() => false),
          `Tools dropdown should show "${tool}"`
        ).toBeTruthy();
      }

      await page.keyboard.press('Escape');
    });

    test('Tools dropdown bottom option toggles tools on/off', async ({ page }) => {
      const toolsBtn = page.locator('button, [role="button"]').filter({
        hasText: /tools/i,
      }).first()
        .or(page.locator('[aria-label*="tool" i], [data-testid*="tool" i], [title*="tool" i]').first())
        .first();
      await toolsBtn.waitFor({ state: 'visible', timeout: 15_000 });
      await toolsBtn.click();

      const dropdown = page.locator(
        '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i], [class*="modal" i], [role="dialog"]'
      ).first();
      await dropdown.waitFor({ state: 'visible', timeout: 10_000 });

      const toggleOption = dropdown.getByText(/turn (on|off)/i).first()
        .or(dropdown.locator('[class*="toggle" i], [role="switch"]').first())
        .first();
      expect.soft(
        await toggleOption.isVisible({ timeout: 5_000 }).catch(() => false),
        'Tools dropdown should have an on/off toggle at bottom'
      ).toBeTruthy();

      await page.keyboard.press('Escape');
    });

    // --- Slash command popup ---
    test('typing "/" opens contextual slash-command popup', async ({ page }) => {
      const chatInput = page.locator([
        'textarea',
        '[contenteditable="true"]',
        'input[placeholder*="message" i]',
        'input[placeholder*="ask" i]',
        '[data-testid*="chat-input"]',
        '[data-testid*="message-input"]',
      ].join(', ')).first();
      await chatInput.waitFor({ state: 'visible', timeout: 15_000 });
      await chatInput.click();
      await page.keyboard.type('/');

      // Wait for a slash-command popup/suggestion list
      const popup = page.locator(
        '[class*="slash" i], [class*="command" i], [class*="suggestion" i], [class*="autocomplete" i], [class*="popup" i], [role="listbox"]'
      ).first();
      expect.soft(
        await popup.isVisible({ timeout: 8_000 }).catch(() => false),
        'Typing "/" should open a slash-command popup'
      ).toBeTruthy();

      // Clean up
      await page.keyboard.press('Escape');
      await page.keyboard.press('Backspace');
    });

    // --- Model selector ---
    test('model selector button exists (feature-flag dependent)', async ({ page }) => {
      const modelSelector = page.locator('button, [role="button"]').filter({
        hasText: /model|auto.?select/i,
      }).first()
        .or(page.locator('[data-testid*="model" i], [aria-label*="model" i]').first())
        .first();

      const isVisible = await modelSelector.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!isVisible) {
        test.skip(true, 'Model selector not visible — feature flag may be off');
        return;
      }
      await expect(modelSelector).toBeVisible();
    });
  });

  // =========================================================================
  // UPLOAD GROUP
  // =========================================================================
  test.describe('Upload', () => {
    test('upload button exists to the left of text input', async ({ page }) => {
      const uploadBtn = page.locator(
        '[aria-label*="upload" i], [data-testid*="upload" i], [title*="upload" i], [class*="upload" i]'
      ).first()
        .or(page.locator('button, [role="button"]').filter({ hasText: /upload|attach/i }).first())
        .first();
      await expect(uploadBtn).toBeVisible({ timeout: 15_000 });
    });

    test('clicking upload button opens Upload Files modal', async ({ page }) => {
      const uploadBtn = page.locator(
        '[aria-label*="upload" i], [data-testid*="upload" i], [title*="upload" i], [class*="upload" i]'
      ).first()
        .or(page.locator('button, [role="button"]').filter({ hasText: /upload|attach/i }).first())
        .first();
      await uploadBtn.waitFor({ state: 'visible', timeout: 15_000 });
      await uploadBtn.click();

      // Look for upload modal
      const modal = page.locator('[role="dialog"], [class*="modal" i]').first();
      await expect(modal).toBeVisible({ timeout: 10_000 });

      // Check for "Upload Files" text or drag/drop zone
      const uploadText = modal.getByText(/upload files/i).first()
        .or(modal.locator('[class*="dropzone" i], [class*="drag" i]').first())
        .first();
      expect.soft(
        await uploadText.isVisible({ timeout: 5_000 }).catch(() => false),
        'Upload modal should show "Upload Files" or a drag/drop zone'
      ).toBeTruthy();

      await dismissModal(page);
    });
  });

  // =========================================================================
  // RESPONSE ACTIONS GROUP
  // (navigate to existing conversation, then look for action buttons)
  // =========================================================================
  test.describe('Response Actions', () => {
    // Helper: navigate to an existing conversation so we have response bubbles
    async function openExistingConversation(page: Page): Promise<boolean> {
      // Look for conversations in the sidebar
      const conversationItem = page.locator(
        '[class*="conversation" i] a, [class*="conversation" i] [role="button"], [class*="chatHistory" i] a, [class*="sidebar" i] [class*="conversation" i]'
      ).first();

      // Also try clicking on any conversation link in sidebar
      const sidebarConversation = page.locator('aside a, nav a, [class*="sidebar" i] a').filter({
        hasNotText: /home|agents|people|campaigns|datasets|workflow|forecast|view all/i,
      }).first();

      const target = conversationItem.or(sidebarConversation).first();
      const isVisible = await target.isVisible({ timeout: 8_000 }).catch(() => false);
      if (!isVisible) return false;

      await target.click();
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      await page.waitForTimeout(2_000);
      return true;
    }

    test('like (thumbs up) button exists on response', async ({ page }) => {
      const opened = await openExistingConversation(page);
      if (!opened) {
        test.skip(true, 'No existing conversations found to test response actions');
        return;
      }

      const likeBtn = page.locator(
        '[aria-label*="like" i], [aria-label*="thumbs up" i], [data-testid*="like" i], [data-testid*="thumbs-up" i], [title*="like" i]'
      ).first();
      expect.soft(
        await likeBtn.isVisible({ timeout: 10_000 }).catch(() => false),
        'Response should have a like/thumbs-up button'
      ).toBeTruthy();
    });

    test('dislike (thumbs down) button exists on response', async ({ page }) => {
      const opened = await openExistingConversation(page);
      if (!opened) {
        test.skip(true, 'No existing conversations found');
        return;
      }

      const dislikeBtn = page.locator(
        '[aria-label*="dislike" i], [aria-label*="thumbs down" i], [data-testid*="dislike" i], [data-testid*="thumbs-down" i], [title*="dislike" i]'
      ).first();
      expect.soft(
        await dislikeBtn.isVisible({ timeout: 10_000 }).catch(() => false),
        'Response should have a dislike/thumbs-down button'
      ).toBeTruthy();
    });

    test('copy button exists on response', async ({ page }) => {
      const opened = await openExistingConversation(page);
      if (!opened) {
        test.skip(true, 'No existing conversations found');
        return;
      }

      const copyBtn = page.locator(
        '[aria-label*="copy" i], [data-testid*="copy" i], [title*="copy" i]'
      ).first();
      expect.soft(
        await copyBtn.isVisible({ timeout: 10_000 }).catch(() => false),
        'Response should have a copy button'
      ).toBeTruthy();
    });

    test('citations toggle exists on response', async ({ page }) => {
      const opened = await openExistingConversation(page);
      if (!opened) {
        test.skip(true, 'No existing conversations found');
        return;
      }

      const citationsBtn = page.locator(
        '[aria-label*="citation" i], [data-testid*="citation" i], [title*="citation" i]'
      ).first()
        .or(page.locator('button, [role="button"]').filter({ hasText: /citation/i }).first())
        .first();
      expect.soft(
        await citationsBtn.isVisible({ timeout: 10_000 }).catch(() => false),
        'Response should have a citations toggle'
      ).toBeTruthy();
    });

    test('audio button exists on response', async ({ page }) => {
      const opened = await openExistingConversation(page);
      if (!opened) {
        test.skip(true, 'No existing conversations found');
        return;
      }

      const audioBtn = page.locator(
        '[aria-label*="audio" i], [aria-label*="listen" i], [aria-label*="play" i], [data-testid*="audio" i], [data-testid*="tts" i], [title*="audio" i], [title*="listen" i]'
      ).first();
      expect.soft(
        await audioBtn.isVisible({ timeout: 10_000 }).catch(() => false),
        'Response should have an audio button'
      ).toBeTruthy();
    });

    test('more (lightning bolt) menu with Generate Campaign and Create Agent', async ({ page }) => {
      const opened = await openExistingConversation(page);
      if (!opened) {
        test.skip(true, 'No existing conversations found');
        return;
      }

      // Look for the more/lightning bolt button
      const moreBtn = page.locator(
        '[aria-label*="more" i], [data-testid*="more-action" i], [data-testid*="lightning" i], [title*="more" i]'
      ).first()
        .or(page.locator('button, [role="button"]').filter({ hasText: /more/i }).first())
        .first();

      const isMoreVisible = await moreBtn.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!isMoreVisible) {
        expect.soft(false, 'More/lightning bolt button should be visible on response').toBeTruthy();
        return;
      }

      await moreBtn.click();

      // Look for menu with Generate Campaign and Create Agent
      const menu = page.locator(
        '[role="menu"], [role="listbox"], [class*="dropdown" i], [class*="popover" i], [class*="contextMenu" i]'
      ).first();
      await menu.waitFor({ state: 'visible', timeout: 8_000 }).catch(() => {});

      expect.soft(
        await menu.getByText(/generate campaign/i).first().isVisible({ timeout: 5_000 }).catch(() => false),
        'More menu should contain "Generate Campaign"'
      ).toBeTruthy();

      expect.soft(
        await menu.getByText(/create agent/i).first().isVisible({ timeout: 5_000 }).catch(() => false),
        'More menu should contain "Create Agent"'
      ).toBeTruthy();

      await page.keyboard.press('Escape');
    });

    test('delete button opens confirmation dialog', async ({ page }) => {
      const opened = await openExistingConversation(page);
      if (!opened) {
        test.skip(true, 'No existing conversations found');
        return;
      }

      // Look for delete button on a response
      const deleteBtn = page.locator(
        '[aria-label*="delete" i], [data-testid*="delete" i], [title*="delete" i]'
      ).first()
        .or(page.locator('button, [role="button"]').filter({ hasText: /delete/i }).first())
        .first();

      const isDeleteVisible = await deleteBtn.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!isDeleteVisible) {
        expect.soft(false, 'Delete button should be visible on response').toBeTruthy();
        return;
      }

      await deleteBtn.click();

      // A confirmation dialog should appear
      const confirmation = page.locator('[role="dialog"], [class*="modal" i], [role="alertdialog"]').first();
      expect.soft(
        await confirmation.isVisible({ timeout: 8_000 }).catch(() => false),
        'Clicking delete should open a confirmation dialog'
      ).toBeTruthy();

      // Dismiss it without deleting
      await page.keyboard.press('Escape');
    });
  });

  // =========================================================================
  // CONVERSATION SIDEBAR GROUP
  // =========================================================================
  test.describe('Conversation Sidebar', () => {
    test('conversations list visible in left sidebar', async ({ page }) => {
      const conversationsList = page.locator(
        '[class*="conversation" i], [class*="chatHistory" i], [class*="chatList" i]'
      ).first()
        .or(page.getByText(/conversations/i).first())
        .first();
      await expect(conversationsList).toBeVisible({ timeout: 15_000 });
    });

    test('"+" button next to Conversations header starts new conversation', async ({ page }) => {
      // Look for a "+" or "new" button near the Conversations header
      const newConvoBtn = page.locator(
        '[aria-label*="new conversation" i], [data-testid*="new-conversation" i], [title*="new conversation" i], [aria-label*="new chat" i]'
      ).first()
        .or(
          page.locator('button, [role="button"]').filter({ hasText: /^\+$|^new$|new conversation/i }).first()
        )
        .first();

      await expect(newConvoBtn).toBeVisible({ timeout: 15_000 });
    });

    test('click conversation opens it', async ({ page }) => {
      // Look for a conversation item in the sidebar
      const conversationItem = page.locator(
        '[class*="conversation" i] a, [class*="chatHistory" i] a, [class*="conversationList" i] a, [class*="conversationItem" i]'
      ).first();

      const isVisible = await conversationItem.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!isVisible) {
        test.skip(true, 'No conversations found in sidebar');
        return;
      }

      const textBefore = await conversationItem.textContent();
      await conversationItem.click();
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});

      // URL should change or the conversation content should load
      // The main area should now show messages
      const chatArea = page.locator(
        '[class*="message" i], [class*="bubble" i], [class*="chatContent" i], [class*="conversation" i]'
      ).first();
      expect.soft(
        await chatArea.isVisible({ timeout: 10_000 }).catch(() => false),
        'Clicking a conversation should open it and show messages'
      ).toBeTruthy();
    });

    test('"View all" link at bottom of conversation list', async ({ page }) => {
      const viewAllLink = page.getByText(/view all/i).first();
      expect.soft(
        await viewAllLink.isVisible({ timeout: 10_000 }).catch(() => false),
        'Conversation sidebar should have a "View all" link at bottom'
      ).toBeTruthy();
    });

    test('right-click conversation menu shows rename, export, delete', async ({ page }) => {
      const conversationItem = page.locator(
        '[class*="conversation" i] a, [class*="chatHistory" i] a, [class*="conversationList" i] a, [class*="conversationItem" i]'
      ).first();

      const isVisible = await conversationItem.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!isVisible) {
        test.skip(true, 'No conversations found to test context menu');
        return;
      }

      // Right-click to open context menu
      await conversationItem.click({ button: 'right' });

      const contextMenu = page.locator(
        '[role="menu"], [class*="contextMenu" i], [class*="dropdown" i], [class*="popover" i]'
      ).first();
      const menuVisible = await contextMenu.isVisible({ timeout: 8_000 }).catch(() => false);

      // Fallback: try hovering and clicking three-dot menu
      if (!menuVisible) {
        await conversationItem.hover();
        const dotsBtn = conversationItem.locator(
          '[class*="dots" i], [class*="menu" i] button, [aria-label*="more" i], [class*="overflow" i]'
        ).first()
          .or(page.locator('[class*="dots" i], [aria-label*="more" i]').first())
          .first();
        const dotsVisible = await dotsBtn.isVisible({ timeout: 5_000 }).catch(() => false);
        if (dotsVisible) {
          await dotsBtn.click();
        }
      }

      // Check for menu items
      const menu = page.locator(
        '[role="menu"], [class*="contextMenu" i], [class*="dropdown" i], [class*="popover" i]'
      ).first();
      const menuIsNowVisible = await menu.isVisible({ timeout: 5_000 }).catch(() => false);

      if (menuIsNowVisible) {
        expect.soft(
          await menu.getByText(/rename/i).first().isVisible({ timeout: 5_000 }).catch(() => false),
          'Context menu should have "Rename" option'
        ).toBeTruthy();

        expect.soft(
          await menu.getByText(/export/i).first().isVisible({ timeout: 5_000 }).catch(() => false),
          'Context menu should have "Export" option'
        ).toBeTruthy();

        expect.soft(
          await menu.getByText(/delete/i).first().isVisible({ timeout: 5_000 }).catch(() => false),
          'Context menu should have "Delete" option'
        ).toBeTruthy();
      } else {
        expect.soft(false, 'Right-click or three-dot menu should open on conversation item').toBeTruthy();
      }

      await page.keyboard.press('Escape');
    });

    test('search field at top of conversation sidebar', async ({ page }) => {
      const searchField = page.locator(
        '[class*="sidebar" i] input[type="search"], [class*="sidebar" i] input[placeholder*="search" i], [class*="conversation" i] input[type="search"], [class*="conversation" i] input[placeholder*="search" i]'
      ).first()
        .or(page.locator('input[placeholder*="search" i]').first())
        .first();

      expect.soft(
        await searchField.isVisible({ timeout: 10_000 }).catch(() => false),
        'Conversation sidebar should have a search field'
      ).toBeTruthy();
    });
  });

  // =========================================================================
  // KEYBOARD SHORTCUTS GROUP
  // =========================================================================
  test.describe('Keyboard Shortcuts', () => {
    test('Shift+Enter creates new line (does not send)', async ({ page }) => {
      const chatInput = page.locator([
        'textarea',
        '[contenteditable="true"]',
        'input[placeholder*="message" i]',
        '[data-testid*="chat-input"]',
        '[data-testid*="message-input"]',
      ].join(', ')).first();
      await chatInput.waitFor({ state: 'visible', timeout: 15_000 });
      await chatInput.click();
      await chatInput.fill('Line one');
      await page.keyboard.press('Shift+Enter');
      await page.keyboard.type('Line two');

      // The input should contain both lines (newline character between them)
      const value = await chatInput.inputValue().catch(async () => {
        // For contenteditable, get textContent instead
        return await chatInput.textContent() || '';
      });

      expect.soft(
        value.includes('Line one') && value.includes('Line two'),
        'Shift+Enter should create a new line without sending the message'
      ).toBeTruthy();

      // Clean up
      await page.keyboard.press('Escape');
    });

    test('Enter sends message (not just new line)', async ({ page }) => {
      const chatInput = page.locator([
        'textarea',
        '[contenteditable="true"]',
        'input[placeholder*="message" i]',
        '[data-testid*="chat-input"]',
        '[data-testid*="message-input"]',
      ].join(', ')).first();
      await chatInput.waitFor({ state: 'visible', timeout: 15_000 });
      await chatInput.click();

      const testMsg = `Test send ${Date.now()}`;
      await chatInput.fill(testMsg);
      await page.keyboard.press('Enter');

      // After sending, either the input should be cleared or the message should appear in chat
      await page.waitForTimeout(2_000);

      const inputVal = await chatInput.inputValue().catch(async () => {
        return await chatInput.textContent() || '';
      });

      // The input should be empty (message was sent) or the message appears in chat
      const messageSent = page.locator('[class*="message" i], [class*="bubble" i]')
        .filter({ hasText: new RegExp(testMsg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') })
        .first();

      const inputCleared = !inputVal.includes(testMsg);
      const messageVisible = await messageSent.isVisible({ timeout: 10_000 }).catch(() => false);

      expect.soft(
        inputCleared || messageVisible,
        'Enter should send the message (input cleared or message appears in chat)'
      ).toBeTruthy();
    });
  });
});
