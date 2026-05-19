---
title: Conversations
---

# Conversations

The **Conversations** page is your archive of past chats — every conversation you've had with Vurvey's AI is saved here, searchable, sortable, and exportable. This doc covers the full conversation-management surface: listing, searching, sorting, renaming, exporting, copying, and deleting saved chats.

> 📷 _Screenshot pending: Conversations page — grid of cards with search, sort, and Create-new tile_

---

## What gets saved

Every chat you start with the AI is automatically persisted as a **ChatConversation** record in the workspace. The Conversations page lists all non-preview conversations — meaning ones that were actually user-started, not ephemeral workflow-internal previews.

| Saved | Not saved here |
|---|---|
| Chats you started from the Home page | Workflow-internal preview conversations |
| Chats with personas (with or without `personaconversationcredits` billing) | One-off workflow run logs |
| Capability runs that used a conversational interface | Direct workflow runs that didn't go through a chat |

::: tip How the filter works
The list query passes `{isPreview: false}` as a static filter. Vurvey internally uses preview conversations for staging workflow output before saving — those don't show up in this surface by design.
:::

---

## How to reach it

Navigate to **Conversations** (workspace-level page; the path is `/workflow/conversation` or similar — the URL is workspace-scoped). The document title becomes "Vurvey - Conversations".

---

## Page layout

> 📷 _Screenshot pending: Conversations page anatomy — top bar with search + sort + create card + conversation card grid_

| Element | Purpose |
|---|---|
| **Search input** | Free-text search across conversation names. Placeholder: "Search conversations" |
| **Sort dropdown** | Pick from 8 sort options (see [Sorting](#sorting)) |
| **Create new card** | Always-first tile in the grid; clicking jumps to the Home chat surface where a fresh conversation begins |
| **Conversation cards** | One card per saved conversation (paginated, infinite-scroll style via `urlSyncedPagination`) |

The list uses Vurvey's standard `PaginatedList` component — cursor-based pagination, URL-synced filter and pagination state (so deep-links to a specific filter or page work).

---

## Conversation card anatomy

> 📷 _Screenshot pending: Single conversation card with all fields labeled_

Each card shows:

| Field | Source | Notes |
|---|---|---|
| **Created time-ago** | `conversation.preview.createdAt` | Uses `react-timeago` (e.g. "3 days ago") |
| **Name** | `conversation.name` | The conversation title (editable via Rename) |
| **Creator** | `conversation.preview.creator.firstName + lastName` | Who started the chat |
| **Preview content** | `conversation.preview.content` (markdown-rendered) | First-message excerpt or summary |
| **Artifacts** | `conversation.preview.images` (filtered to non-empty entries) | Thumbnail row of any images generated in the chat |
| **Actions dropdown (⋯)** | — | Rename, Copy, Export, Delete |

Clicking the card body navigates to that conversation at `/workflow/conversation?canvasId=<id>` (the chat view).

The card uses an **intersection observer** (`useInView` with `triggerOnce: true`, `threshold: 0.1`) — meaning artifacts and previews lazy-load when the card scrolls into view, not all at once on page load.

---

## Sorting

> 📷 _Screenshot pending: Sort dropdown open showing all 8 options_

Eight sort options are available:

| Option | What it sorts by |
|---|---|
| **Name (A-Z)** | Alphabetical |
| **Name (Z-A)** | Reverse alphabetical |
| **Most Recently Updated** | `updatedAt` descending — the conversation whose data changed most recently |
| **Oldest Updated** | `updatedAt` ascending |
| **Most Recently Created** | `createdAt` descending |
| **Oldest Created** | `createdAt` ascending |
| **Most Recently Messaged** | `lastMessageAt` descending — the conversation with the most recent user/AI message |
| **Oldest Messaged** | `lastMessageAt` ascending |

::: tip Most-recently-messaged ≠ most-recently-updated
A conversation can be "updated" (metadata change, rename, etc.) without a new message being added. If you want to surface conversations that are *active* — i.e. people are currently messaging in them — use **Most Recently Messaged**.
:::

---

## Actions per conversation

Each conversation card has a dot-menu (⋯) with four options: **Rename**, **Copy**, **Export**, **Delete**.

### Rename

> 📷 _Screenshot pending: Rename modal with input field_

Opens the Edit Chat modal with the current name pre-filled.

| Validation | Rule |
|---|---|
| Required | Cannot be empty |
| Max length | 150 characters |
| Non-whitespace | Must contain at least one non-whitespace character |

Save triggers the `CHAT_UPDATE_CONVERSATION` mutation. Cancel discards changes.

### Copy

> 📷 _Screenshot pending: Copy conversation history modal_

Copies the conversation's message history to your clipboard. Useful for pasting into other apps (email, Notion, Google Docs, etc.).

The modal lets you pick:
- How many recent messages to include (10, 20, 50, 100 — chip buttons)
- Whether to copy as markdown

After confirmation, the formatted text lands on your clipboard; a toast confirms success.

### Export

> 📷 _Screenshot pending: Export to file modal with file-type selector_

Same selection logic as Copy, but saves to a downloadable file instead.

| Field | Options |
|---|---|
| **Number of latest messages** | 10, 20, 50, 100 (chip buttons) |
| **File type** | Markdown, PDF, DOCX |
| **Modal title** | "Export conversation history to file" |
| **Description** | "Choose how many recent messages to export and select a file type. Your download will start automatically" |

Behavior by file type:

| File type | What happens |
|---|---|
| **MARKDOWN** | Conversation rendered as plain markdown text; downloads as `.md` |
| **PDF** | Backend-generated PDF; downloads as `.pdf` |
| **DOCX** | Backend-generated DOCX (Word-compatible); downloads as `.docx` |

The toast on success names the file type ("Markdown", "PDF", or "DOCX") to confirm what was downloaded.

### Delete

> 📷 _Screenshot pending: Delete confirmation modal_

A confirmation modal appears: _"Are you sure you want to delete this conversation? This action cannot be undone."_

Click **Delete** to confirm. The mutation runs (`CHAT_DELETE_CONVERSATION`), the conversation is removed from the Apollo cache (`cache.evict` + `cache.gc()`), the toast confirms ("Conversation deleted"), and the list refetches.

If you happen to be viewing the deleted conversation when you delete it (URL contains its ID), you're auto-navigated back to the workspace root (`/{workspaceId}/`).

---

## Starting a new conversation

> 📷 _Screenshot pending: Create-new tile at start of grid_

The first tile in the grid is a **Create new** card. Click it to navigate to `/{workspaceId}/` (the workspace Home / chat surface) where a fresh conversation begins.

The Create new card uses the standard `CreateCard` shared component, with a `PlusSmallIcon` button labeled "Create new" — consistent with other create-new tiles across the platform (workflows, capabilities, etc.).

---

## Search

The search bar at the top filters conversations by **name** (case-insensitive substring match). Debounced — typing won't fire a query on every keystroke, only after the user pauses.

Search hits the `paginatedChatConversations` GraphQL query with a `search` filter parameter.

::: warning Search only matches names today
The search filter is name-only — it doesn't search message content or preview body. To find a conversation by what was said in it, you'll need to scan visually or use Most-Recently-Messaged sorting to surface recently-active chats.
:::

---

## Pagination

The Conversations page uses **cursor-based pagination**:

- Initial page load fetches the first 20 conversations.
- As you scroll past the visible cards, the next batch loads automatically.
- The URL syncs to pagination state (`urlSyncedPagination: true`) so refreshing the page preserves your position.
- The prefetch key is `workflow.conversations` — Vurvey uses this to hint a cache preload when you navigate _to_ this page from elsewhere.

There's no manual "Load more" button; scrolling triggers loading.

---

## Constraints & limitations

- **No way to bulk-delete or bulk-export.** Each action operates on one conversation at a time.
- **Search is name-only.** You can't search by message content from this surface.
- **Preview-mode conversations are excluded.** Workflow-internal previews never appear here, even though they exist in the database.
- **Export caps at 100 messages.** The largest preset is 100; there's no "all" option from the modal — but in practice most conversations fit within 100 user/AI messages.
- **Renaming is the only metadata edit.** You can't edit description, tags, or other attributes — just the name.
- **No conversation merging.** Two conversations can't be merged into one. Workaround: export both, paste into a doc.
- **No conversation pinning / starring.** No way to mark important conversations as favorites today.
- **Conversation list is per-workspace, not per-user.** All workspace members see the same list (subject to permissions on each conversation).
- **The artifact row only shows images.** Other artifact types (PDFs, datasets, etc.) generated during a conversation aren't surfaced as thumbnails on the card.
- **Deleting a conversation is irreversible.** No trash / restore flow.
- **The chat sidebar (active conversation panel)** is a separate surface — see [Home](/guide/home) for the live-chat experience.

---

## Best practices

- **Rename conversations as soon as they're "real."** New chats default to generic names; a one-second rename when you know the topic makes the archive far more browsable later.
- **Export important conversations.** AI conversations evolve; if there's an insight you don't want to lose, export to Markdown immediately — it preserves the exact wording at that point in time.
- **Use sort = Most Recently Messaged for active context.** When you have many open threads, this surfaces what's actually being worked on right now.
- **Use sort = Most Recently Created for triage.** Newest-first helps when you're looking for "the chat I just started yesterday."
- **Copy 20 messages for context-sharing.** A 20-message window is usually enough to give someone the gist of a conversation without dumping 100+ messages on them.
- **Avoid deleting conversations from old workflows.** If a conversation produced outputs that are referenced elsewhere (e.g. in a Capability report), deleting it can break those references. Archive (export) before deleting.
- **Search by exact title fragment.** Since search is name-only, give conversations memorable names — "Q2 brand audit", "Acme campaign brief draft", etc.

---

## FAQ

#### Where do conversations come from?
Any chat you start from the Home page or by clicking "Create new" here. Capability runs that go through a conversational interface also produce ChatConversation records.

#### Can I see conversations from other workspace members?
Yes — depending on workspace permissions. The list is workspace-wide; individual conversations may have OpenFGA-based per-resource permissions that filter what you can see. See [Permissions & Sharing](/guide/permissions-and-sharing).

#### Why don't I see all my old conversations?
Possible reasons:
1. They're preview conversations (excluded from this list by design).
2. They're in a different workspace.
3. They were deleted (no recovery).
4. You don't have view permission on them (unlikely but possible with strict OpenFGA setups).

#### Can I edit conversation messages after the fact?
No. Messages are immutable once sent. Renaming the conversation changes only its title.

#### How do I share a conversation with someone?
Two options:
1. **Export it** (Markdown/PDF/DOCX) and share the file.
2. **Add them as a workspace member**; they can see the conversation in their list (subject to permissions).

There's no shareable URL for a conversation that bypasses workspace membership.

#### What does "preview content" on the card show?
The first significant text from the conversation — typically your opening prompt or the AI's first substantive response. It's a teaser to help you identify the chat at a glance.

#### Why is the conversation created-time on the card different from the most-recent-message time?
The card shows **created** time. If you want to sort by latest activity, use Most Recently Messaged in the sort dropdown.

#### Can I restore a deleted conversation?
No. Deletion is permanent — the card is gone from the list, the message history is removed, and the cache is evicted. Export important conversations before deleting.

#### What's the difference between Copy and Export?
- **Copy** puts the conversation history on your clipboard as text (typically markdown).
- **Export** downloads a file (.md / .pdf / .docx) to your device.

Both let you pick how many messages to include. Use Copy for paste-into-another-app workflows; use Export for distribution / archival.

#### Does exporting include images attached or generated in the chat?
Markdown export references images by reference (URLs to Vurvey-hosted assets); PDF and DOCX exports include rendered images. URLs in Markdown will eventually go stale if Vurvey-hosted images are removed.

#### Why is the artifacts row sometimes empty?
The artifacts row shows generated images. Conversations that didn't produce images show no artifact row.

#### Can I sort by who created the conversation?
No — that's not one of the sort options. You'd need to scan visually or export and process externally.

#### How is "Most Recently Updated" different from "Most Recently Messaged"?
- **Updated** = any change to the conversation record (rename, metadata change, even some background processing updates).
- **Messaged** = a new user or AI message was added.

If you only care about active chats, use Messaged. If you care about anything-touched-recently, use Updated.

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| Conversations page is empty | Workspace has no saved chats yet, OR your account lacks permission to view existing ones. |
| Card shows "creator" as blank | The original creator's user record may have been deleted (rare). Check with admin. |
| Preview content is blank | Conversation was started but no substantive message yet, OR the preview hasn't been computed. Open the conversation. |
| Search doesn't return a chat I know exists | Search is name-only; your search term may match message content but not name. Try sorting by Most Recently Messaged and scanning. |
| Export download doesn't start | Browser may have blocked the download (popup blocker, third-party cookie restrictions). Check browser console. |
| Export PDF / DOCX is corrupted | Backend file generation failed mid-stream. Re-try; if persistent, lower the message count to 10–20 and try again. |
| Renamed conversation but card still shows old name | List didn't refetch — sort/filter to force a refresh, or reload the page. |
| Deleted conversation reappears after refresh | Apollo cache eviction failed. Force a hard reload (Cmd+Shift+R) to bypass cache. |
| Card click navigates to wrong conversation | URL state mismatch — try clicking again, or open the conversation by URL directly. |
| Lazy-load not showing artifacts | Scroll past the card (intersection observer triggers at 10% visibility); if it still doesn't load, the conversation truly has no artifacts. |

---

## Cross-references

- [Home](/guide/home) — where you start a new conversation; the live chat surface for an active conversation
- [Permissions & Sharing](/guide/permissions-and-sharing) — per-resource permissions on conversations (via OpenFGA when enabled)
- [Capabilities](/guide/capabilities) — Capability runs produce ChatConversations when they use a conversational interface
- [Workflows](/guide/workflows) — preview-mode conversations are workflow-internal and excluded from this list
- [Credits & Usage](/guide/credits-and-usage) — persona-conversation billing for chats with personas (when `personaconversationcredits` is on)
- [AI Models](/guide/ai-models) — model switching mid-conversation; the chat-toolbar model selector
- [Settings → Workspace Members](/guide/workspace-members) — who can see what conversations
- [Glossary](/guide/glossary) — Conversation / ChatConversation / Preview terminology
