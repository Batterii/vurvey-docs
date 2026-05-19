---
title: File Labels (Manage Labels)
---

# File Labels

The **Manage Labels** page defines the set of valid label keys for tagging files within your workspace's [Datasets](/guide/datasets) and video media. Labels are structured key-value pairs (e.g. `Brand: "Apple"`, `Year: "2024"`, `Department: "Marketing"`) that let you organize, filter, and search your dataset corpus. This doc covers the admin-only page for managing label keys, and how those keys are used when tagging individual files.

> 📷 _Screenshot pending: Manage Labels page — table of label keys with Edit / Delete actions_

::: tip Audience
This page is **admin-only**. Regular workspace users see and apply labels when tagging files; only admins can add, edit, or remove the workspace's label-key catalog. The `isWorkspaceAdmin` permission gate redirects non-admins back to the home page with a "you do not have access to this page" toast.
:::

---

## What labels are

A **label** in Vurvey is a typed key-value pair:

| Term | Source | Example |
|---|---|---|
| **Key** | Admin-defined in this page (FileTagKey in the API) | `Brand`, `Year`, `Department`, `Quarter`, `Region` |
| **Value** | User-supplied per file | `Apple`, `2024`, `Marketing`, `Q2`, `EMEA` |

Together, they form structured metadata on each file. A file uploaded to a dataset can have multiple labels (e.g. `Brand: Apple`, `Year: 2024`, `Region: EMEA` all at once).

This is distinct from free-text tags — the **key is constrained to the workspace's catalog**, ensuring consistency across uploads.

::: tip API vs UI naming
The GraphQL API calls these `FileTagKey` (and the surrounding context "file tag keys"). The UI calls them "Labels" everywhere. They're the same thing — just be aware if you're working with both.
:::

---

## How to reach the management page

**Settings → Manage Labels** (or `/workspace/settings/manage-keys` in the URL — admin-only).

The page title is "Vurvey - Manage Labels". If you're not a workspace admin, you'll be redirected back to the workspace home with a permission-denied toast.

---

## Page anatomy

> 📷 _Screenshot pending: Manage Labels page layout — back nav + heading + table + Add button_

| Section | Purpose |
|---|---|
| **Back navigation** | ChevronLeftIcon returns you to /workspace/settings |
| **Page title** | "Manage Labels" |
| **Add button** | Opens the Create Labels modal (PlusIcon) |
| **Labels table** | One row per label key in the workspace |
| **Loading state** | LoadingContainer while fetching |

### Labels table columns

| Column | Source | Notes |
|---|---|---|
| **Value** | The label key's string value (e.g. "Brand") | Single column displaying the key name |
| **(Actions)** | Dropdown trigger (⋯) | Edit / Delete options |

The Value column is mis-named in the codebase — it shows the key (e.g. "Brand"), not the value. The "value" terminology comes from the internal model where each FileTagKey has a `value` field that's the key string.

---

## Adding labels

> 📷 _Screenshot pending: Create Labels modal with multi-line textarea_

Click the **Add** (➕) button to open the Create Labels modal.

### Modal anatomy

| Element | Behavior |
|---|---|
| **Title** | "Create Labels" |
| **Description** | "Add as many labels as you want, separated by a comma" |
| **TextArea** | Placeholder: `label1, label2, label3` |
| **Save button** | Validates + adds in one batch |

### Bulk-add behavior

The textarea accepts a comma-separated list. The save logic:

1. Splits the input on `,`
2. Trims whitespace from each
3. Filters out empty entries
4. Sends the resulting array to `FILE_TAG_KEY_CREATE_BATCH` GraphQL mutation

You can paste a long list from a spreadsheet (or any source) and they all get added at once.

### Validation

| Scenario | Behavior |
|---|---|
| Empty input | Toast: _"You have to add at least one key"_ |
| Whitespace-only input | Toast: _"You have to add at least one valid key"_ |
| Duplicate key (already in workspace) | Toast: _"Failed to add keys (Check for duplicates)"_ |
| Success | Toast: _"Keys added successfully"_ |

The duplicate check happens server-side; the API rejects the batch if any of the keys already exist.

---

## Editing a label key

> 📷 _Screenshot pending: Edit Key modal with single-line input_

From the actions dropdown on any label row, click **Edit**.

### Modal anatomy

| Element | Behavior |
|---|---|
| **Title** | "Edit Key" |
| **Input** | Pre-filled with current value, single-line |
| **Save button** | Sends `FILE_TAG_KEY_UPDATE` mutation |
| **Cancel button** | Closes without saving |

### Validation

| Scenario | Behavior |
|---|---|
| Empty after edit | Toast: _"Key cannot be empty"_ |
| Duplicate (collides with another existing key) | Toast: _"Failed to update key (Check for duplicates)"_ |
| Success | Toast: _"Key updated"_ |

::: warning Editing affects all files with this label
When you rename a label key from "Brand" to "Brand Name", all files in the workspace already labeled with the old key see the new name automatically. This is by-reference — no data migration needed. But this also means renaming has workspace-wide visibility.
:::

---

## Deleting a label key

> 📷 _Screenshot pending: Delete confirmation modal_

From the actions dropdown, click **Delete** (BinDeleteIcon, danger color).

A confirmation modal appears. Confirm to send the `FILE_TAG_KEY_DELETE_BATCH` mutation.

### Important: in-use protection

The API protects against deleting label keys that are still in use:

> _"Failed to delete key. This key is used in some file or video and cannot be deleted"_

If any file or video in the workspace has a label using this key, the delete is blocked. You must first remove the label from all using files, then delete the key.

This is a deliberate safety — orphan-key removal would leave files with dangling label references.

---

## Using labels on files

> 📷 _Screenshot pending: File detail showing labels section + Manage Labels modal_

Workspace users (not just admins) apply labels to individual files via the **Manage Labels modal** on the dataset's file-detail surface (see [Datasets](/guide/datasets)).

In that modal:
1. The full catalog of label keys is loaded via the same `FILE_TAG_KEYS` query.
2. The user picks a key from the catalog.
3. The user supplies a value for that file.
4. Multiple labels can be added per file.

### Per-file label requirements

Both **key and value are required** for a per-file label — neither can be empty. The Manage Labels modal validates this with a toast: _"Label key and value are required."_

---

## SharePoint metadata integration

> 📷 _Screenshot pending: Manage Labels modal with SharePointMetadataPanel below the labels form_

For files imported from SharePoint, the Manage Labels modal **additionally** shows the file's SharePoint-side metadata (via the `SharepointMetadataPanel` component). This lets users see the SharePoint metadata alongside the Vurvey labels — useful for cross-referencing.

The SharePoint metadata is read-only here; to edit it, modify the file in SharePoint itself. The integration is gated by `sharepointEnabled` workspace flag — see [Settings → SharePoint Card](/guide/settings#sharepoint-card).

---

## Constraints & limitations

- **Admin-only management.** Only workspace admins can add, edit, or delete label keys. Regular users see them in the catalog and can apply them, but can't manage the catalog.
- **In-use deletion is blocked.** Cannot delete a key that's referenced by any file or video.
- **No bulk-delete of keys.** Each delete is one at a time with confirmation.
- **No reorder.** Keys are displayed in the order they were created; no sort UI.
- **No description / metadata on keys.** A key is just a string — no help text, category, color, or icon.
- **Keys are case-sensitive.** "Brand" and "brand" are two different keys. The catalog doesn't auto-normalize.
- **No type enforcement.** A label value can be any string; no enum constraint, no number validation. To enforce types, document them externally.
- **No nested / hierarchical keys.** Flat list only. To approximate hierarchy, use compound names like "Marketing/Brand".
- **No expiration / archival.** Keys remain in the catalog until explicitly deleted.
- **No usage stats in the management UI.** You can't see "how many files use this label" from this page.
- **Bulk-add via comma is the only mass-create path.** No CSV upload, no copy-from-another-workspace.
- **The error toast on duplicate is generic.** It doesn't tell you WHICH key already existed — only that the batch had at least one conflict.
- **Keys can't be made private to a sub-team.** Labels are workspace-wide.

---

## Best practices

- **Define your label taxonomy upfront.** Decide on key names BEFORE inviting users to tag files. Renaming later works but causes confusion.
- **Use consistent casing.** Pick "Brand" or "brand" and stick with it. Inconsistency makes filtering harder.
- **Avoid label-name explosion.** Each key should serve a clear purpose. Too many keys = unused noise.
- **Document expected value formats.** Since values are free-text, write down (in your team's docs or onboarding) what "Year" should be: `2024` not `'24` not `2024-01`.
- **Periodically audit unused keys.** Delete keys with zero file usage to keep the catalog clean.
- **For nested categories, use prefixes.** Instead of nesting, name keys like "Region/Country" or "Department/Subteam".
- **Don't conflate label keys with file paths.** Labels are metadata for filtering; file paths are storage location. Keep them separate concerns.
- **Tag at upload time, not later.** Once files accumulate, retroactive labeling is tedious. Build labels into your dataset-upload workflow.
- **Coordinate with workflow / capability authors.** If a workflow filters dataset files by a label, the label key must exist BEFORE the workflow runs.
- **Use one canonical workspace for labels.** Don't replicate the same label catalog across workspaces — that creates drift.

---

## FAQ

#### Who can manage labels?
Only workspace admins. Regular users see the catalog and can apply labels but can't add, edit, or delete keys.

#### What happens to existing labels when I delete a label key?
You can't delete a key that's in use. The API blocks the deletion. To proceed, first remove the label from all using files, then delete the key.

#### Can I have duplicate label keys?
No — the API rejects duplicates at create or update time. "Brand" and "Brand " (with trailing space) would technically be different, but the create UI trims whitespace.

#### Can I assign multiple values for the same key on one file?
Not in the standard model — each file has one value per key. If you need multi-value, use a delimiter convention (e.g. `Region: "EMEA;APAC"`).

#### Why does the column say "Value" but show key names?
Naming quirk — the underlying model calls them `FileTagKey` with a `value` field that's the key string. The UI column inherits the field name. Mentally translate "Value column" → "Key name".

#### How are labels different from Datasets?
- **Datasets** = collections of files (training sets).
- **Labels** = key-value metadata applied to individual files within datasets.

You can have datasets without labels, or labels without datasets (though labels are most useful in dataset contexts).

#### Are labels searchable?
Yes — semantic search via the [Retrieval Service](/guide/retrieval-service) can filter by label keys / values. The retriever's filter language supports label-based scoping.

#### What's a SharePoint label?
SharePoint files (when imported into Vurvey datasets) carry their own metadata from SharePoint. The Manage Labels modal shows both Vurvey labels AND SharePoint metadata side-by-side for SharePoint-sourced files. SharePoint metadata is read-only in Vurvey.

#### Can I export the label catalog?
Not via the UI today. The API supports listing via the FILE_TAG_KEYS query (see the GraphQL schema).

#### Can I import labels from a CSV?
Not natively. Workaround: paste comma-separated values into the Create Labels textarea.

#### Why am I getting "Failed to add keys"?
Almost always: at least one key in your batch already exists. The error doesn't say WHICH — try smaller batches to pinpoint.

#### Can labels be required on uploads?
Not enforced by the platform today. You could implement this with a workflow that validates labels post-upload, but no built-in mechanism.

#### Are labels case-sensitive?
Yes. "Brand" and "brand" are two different keys. Pick a convention.

#### Can I share label catalogs between workspaces?
No — labels are workspace-scoped. Each workspace has its own catalog.

#### How many label keys can I have?
No hard cap, but practically: ~50 keys is comfortable; 100+ becomes unwieldy. Audit and trim periodically.

#### Does this affect anything outside Datasets?
Yes — labels are referenced in [Retrieval Service](/guide/retrieval-service) filter queries and may appear in workflow logic. Label keys are workspace-global metadata.

#### What happens if I rename a key?
All existing files using the old key automatically reflect the new name. No data migration. Workspace-wide visibility.

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| "You do not have access to this page" | Not a workspace admin; redirected to home |
| "You have to add at least one key" | Textarea was empty on save — type at least one label key |
| "Keys added successfully" but key doesn't appear | Refresh — the list may need a refetch |
| "Failed to add keys (Check for duplicates)" | At least one key in batch already exists; check the existing list |
| "Failed to delete key. This key is used in some file or video" | Remove the label from all using files first, then delete the key |
| Can't see Manage Labels in settings | You're not an admin; navigation is hidden |
| Edit modal shows blank | Old `editedKey` state stuck; close and reopen |
| Labels not appearing on file when applied | Refetch the file's metadata; check the Manage Labels modal for the actual values |
| Label key visible but not selectable on file | Permission issue or stale cache — refresh |
| SharePoint metadata panel empty for SharePoint file | SharePoint integration not configured; see [Settings → SharePoint Card](/guide/settings#sharepoint-card) |
| Bulk-add ignored a key | Whitespace-only or empty after splitting; verify the input has commas between distinct values |

---

## Cross-references

- [Datasets](/guide/datasets) — where labels are applied to files
- [Settings](/guide/settings) — workspace-level configuration where the Manage Labels page lives
- [Retrieval Service](/guide/retrieval-service) — label-based filtering in semantic search
- [Permissions & Sharing](/guide/permissions-and-sharing) — admin-only access patterns
- [Workspace Members & Roles](/guide/workspace-members) — admin role required for management
- [Integrations](/guide/integrations) — SharePoint integration affects metadata panel
- [Settings → SharePoint Card](/guide/settings#sharepoint-card) — SharePoint connection setup
- [Architecture](/guide/architecture) — labels in the broader data model
- [Developer & API Reference](/guide/developer-reference) — GraphQL FileTagKey type
- [Glossary](/guide/glossary) — Label / FileTagKey / Dataset terminology
