---
title: Mentions
---

# Mentions

"Mentions" is an umbrella term inside Vurvey for **three distinct concepts**. They share a name but are entirely separate features — knowing which one a teammate is talking about is half the battle.

| Concept | Where it lives | Who can use it |
|---|---|---|
| **Workspace Mentions area** | Left nav → **Mentions** page, with **All mentions** and **Magic Topics** tabs (URLs `/mentions` and `/mentions/magic-topics`) | Admin role only — non-admins are auto-redirected to the workspace home |
| **`@mention` in chat** | Anywhere you can chat with an Agent (Home chat, Agent canvas, Workflow nodes, Dataset chat, Brand Companion chat) | Any user with chat access to the relevant Agent(s) |
| **Synthesio social-listening mentions** | Workspace **Settings → Integrations → Synthesio** | Admin role (to connect the integration); the resulting mention documents land in Datasets that any data-permitted user can query |

This page walks through each of the three in detail, then covers cross-feature behavior, constraints, best practices, and the FAQs we get most often.

![All Mentions tab in the workspace](/screenshots/mentions/01-all-mentions.png?optional=1)
![Magic Topics tab (coming soon empty state)](/screenshots/mentions/02-magic-topics.png?optional=1)

---

## 1. The Workspace Mentions Area

The Mentions area is reached from the left navigation. Internally it is a `NavigationPageLayout` with a sub-nav header titled **Mentions** and a two-button button-group:

| Tab | Icon | Tooltip | Route |
|---|---|---|---|
| **All mentions** | Chat-bubbles | _"View community-inspired content directed to your brand"_ | `/mentions` |
| **Magic Topics** | Sparkles (AI stars) | _"View emerging topics, sentiment, and themes to discover opportunities"_ | `/mentions/magic-topics` |

Browser tab title: **Vurvey - Mentions**.

### 1.1 Access control

Access is gated by the `isAdminRole` check on the current user. If you load `/mentions` without admin role, the app navigates you back to the workspace home (`/`). There is no in-page "you don't have access" screen — it is a silent redirect, by design, so non-admins never see the existence of the area.

**Roles that pass the check** are `OWNER`, `ADMIN`, and any role flagged as admin in the workspace ACL. Member, Viewer, and Guest roles do not pass.

**If you believe you should have access but the page bounces you home,** ask a workspace Owner to verify your role under **Workspace Settings → Members**. See [Permissions & Sharing](/guide/permissions-and-sharing).

### 1.2 All Mentions tab

The All mentions tab reuses the same component as the **Branding → Reviews** page (`ReviewsPage`). Functionally, both pages look identical when there is content; they are two entry points into the same brand-feedback dataset.

It loads three things in sequence:

1. The **brand feedback survey** for the current workspace's brand (`feedbackSurvey` GraphQL query, scoped by `brand.id`).
2. The **feedback questions** for that survey (`GET_FEEDBACK_QUESTIONS`) — these are the questions that respondents are asked when they leave brand-directed feedback.
3. The **answers** to whichever feedback question is currently active (`GET_ALL_ANSWERS`), paginated 20 at a time, sorted by **MOST_LIKES**, optionally filtered to **reviewed = false**.

#### What you see (left to right, top to bottom)

- **Question pills** — a horizontal list of every feedback question. Click any pill to switch which question's answers are loaded. The active pill is bolded.
- **Active question header** — the full text of the selected question rendered as a large subheader.
- **Unreviewed Only checkbox** — when checked, the answers list is filtered to `reviewed: false`. Useful for processing only the cards you haven't actioned yet.
- **Answer feed** — a vertical list of `ReviewCard`s, each showing the response transcript snippet, the respondent identity hints (where allowed), like count, and action buttons.
- **Load more (N remaining)** — visible when there are more answers in the result set than fit in the current page of 20. Click to fetch the next 20.

#### What you can do with each answer card

| Action | What happens |
|---|---|
| **Click the card body** | Opens the **Review Modal**, a full transcript view with highlight selection and an in-modal "Create Reel" button. The modal is wrapped in `TranscriptModalContextProvider` and `HighlightContextProvider`, so highlights you create here can be reused for downstream clipping. |
| **Create Reel** | Opens the **Add Reel Modal** (`AddReelModal`). Pre-fills name as _`{brand name} review`_ and description as the respondent's snippet. On save, the platform calls (in order): `createReel` → `reviewAnswer` (marks the answer as reviewed) → `createClips` from the highlighted moment → `shareReelWithBrand(share: true)` → `publishReel`. The toast that appears reads _"Publishing Reel to brand page"_. |
| **Mark as reviewed** | Implicit. Creating a Reel from a card marks it as reviewed automatically; you do not need a separate button. To toggle review state without making a reel, open the Review Modal and use the controls there. |

#### Empty states

- **Workspace has no brand connected** — the survey load is skipped and you see nothing. Connect a brand under **Branding → Brand Settings** (see [Branding](/guide/branding)).
- **Brand exists but has no feedback survey yet** — the page renders without questions and without an answers feed. Brand feedback surveys are auto-created when the first feedback response arrives; until then, this is normal.
- **Questions exist but no answers for the active question** — _"There are no reviews yet"_ illustration with a small "no-responses" graphic.
- **All answers for this question have been reviewed (with Unreviewed Only checked)** — _"You have reviewed all responses."_ Uncheck to see the full set.

### 1.3 Magic Topics tab

Magic Topics is a **placeholder route**. It currently renders an `EmptyState` component:

> **Magic Topics**
>
> _Identify important themes and topics that people are talking about the most. Coming soon._

The route is wired up, the navigation tab is real, the tooltip is real, and the page mounts cleanly — but the analysis pipeline behind it is not yet shipped. The intent (per the tooltip and the empty-state description) is to surface **emerging themes, sentiment, and topic clusters** derived automatically from your brand's mentions + community responses.

**What this means for you today:**
- Clicking the tab is safe and won't error.
- There is no data to inspect, export, or filter yet.
- We are not exposing a feature flag to opt in — the backend analysis isn't running yet, even for internal accounts.

**Track progress:** ask in `#vurvey-product` or check the changelog. When Magic Topics ships, this page will be the place to see it first.

---

## 2. `@mention` Syntax in Chat

The `@`-mention is a chat input convenience that lets you **explicitly route a message to a specific Agent**, even when you are in a chat that has multiple Agents available (a Brand Companion conversation, a Workflow chat node, the multi-Agent canvas chat, etc.).

### 2.1 How to use it

1. Start typing in any Agent-aware chat input.
2. Type `@` to open the **mention picker popup**.
3. Continue typing letters of the Agent's name — the list filters by **prefix match (case-insensitive)** on every persona name. _Example: typing `@Da` filters to "Data Analyst", "Dan the Skeptic", etc._
4. **Navigate with ↑ / ↓ arrow keys** (the popup auto-scrolls the focused row into view).
5. **Press Enter** or **click** the row to insert. The Agent's name is inserted as a styled chip.
6. Type your question after the chip and hit send.

Each row in the popup shows the Agent's avatar, name, and short description (their `description` field). The popup is rendered as a portal so it always appears above other chrome.

### 2.2 What happens behind the scenes

When you insert a mention, the chip you see in the editor is actually a markdown link of the form:

```
[@AgentName](#mention:persona-id-uuid)
```

When the message is rendered in the chat history, the `#mention:` link is recognized as a mention chip rather than a navigable link. **Hovering** the chip opens an **AgentCard popup** (top-start aligned, 8px offset) so anyone reading the conversation can see who that agent is without leaving the thread.

On send, the server (vurvey-api `personaManager`) re-parses the message:

- It extracts the mention text from the first whitespace-delimited token after `@`.
- It looks the name up against the available personas using **exact match first, then prefix match** (lowercase, internal whitespace collapsed).
- If a persona is found, the message is routed to that persona; the literal `@Name` text is stripped from the question the persona actually sees.
- If no persona matches, the literal `@Name` is left in place and the message is routed using the conversation's default persona.

This means you can **mention a persona that isn't the conversation default**, and the system will route correctly. The `@`-mention always wins over the default.

### 2.3 Multi-word agent names

Agent names can have multiple words (e.g. "Data Analyst", "Brand Voice"). Multi-word mentions are supported in both directions:

- **Typing** "@Data Analyst" inserts a single chip for that exact persona, not "@Data" + literal " Analyst".
- **Rendering** an inbound message with the bare text `Hi @Data Analyst, can you...` is converted to the styled chip via the `remark-mentions-multiword` Remark plugin, which sorts personas by name-length (longest first) so longer names win over shorter overlapping ones (e.g. "Data Analyst" wins over "Data").

The word-boundary check (`(?<![\w@])@Name(?![\w@])`) makes sure that:

- `support@vurvey.com` does **not** trigger a "@vurvey" mention.
- `something@Name` (no leading space) does **not** trigger.
- Punctuation after the name (`@Name,` `@Name.` `@Name?`) still triggers correctly.

### 2.4 Where `@mentions` work

| Surface | Supported | Notes |
|---|---|---|
| **Home chat** (left-nav Home → chat with your Agents) | ✅ | All your workspace agents are mentionable. |
| **Agent canvas chat** (the per-Agent detail page) | ✅ | Mentionable list includes all canvas-shared personas. |
| **Workflow nodes** with chat input | ✅ | Limited to the personas attached to that workflow step. |
| **Brand Companion chat** | ✅ | Limited to the personas attached to the companion. |
| **Dataset chat** | ✅ | Mentionable list = personas with access to that dataset. |
| **Campaign in-app messaging / Reels comments** | ❌ | Plain text, no mention parsing. |
| **External integrations** (Slack, email, public Reels page) | ❌ | The chip renders as plain `@Name` text outside Vurvey. |

### 2.5 Keyboard reference

| Key | Effect |
|---|---|
| `@` | Open the mention picker |
| Type letters | Filter the list by prefix |
| `↑` / `↓` | Move the focused option |
| `Enter` | Insert the focused mention |
| `Escape` | Close the picker without inserting |
| Click row | Insert that mention |
| Backspace over chip | Removes the entire chip in one keystroke |

---

## 3. Synthesio Social-Listening Mentions

A third, completely separate concept: **mentions of your brand on the open web and social** — pulled in via the [Synthesio](https://www.synthesio.com/) social-listening platform.

This is an **integration**, not a workspace page. It is configured under **Workspace Settings → General → Synthesio**.

### 3.1 What it does

When connected, Vurvey periodically pulls down mentions of your brand from Synthesio's index (news articles, social posts, forum threads, reviews — anything Synthesio has indexed for the brand). Each mention is run through the `synthesio-mention-formatter`, which produces a structured text document with sections like:

```
# {Mention title}

{Mention content}

Source URL: https://...
Channel: {channel name}
Author: {full name}
Author Type: {influencer | journalist | consumer | ...}
Source: {publication name}
Source Type: {news | blog | forum | review | ...}
Sentiment: {positive | negative | neutral}
Date: {ISO timestamp}
Language: {ISO code}
Country: {ISO code}
```

These documents are embedded into a **dataset** (see [Datasets](/guide/datasets)) where they become searchable by your Agents the same as any other content. An Agent answering "what are people saying about our brand on Reddit this month?" can be configured to pull from this dataset.

### 3.2 Set up the integration

1. Go to **Workspace Settings → General → Synthesio** (admin role required).
2. Click **Connect Synthesio**. Provide:
   - **Synthesio API key**
   - **Reporting unit ID** (which brand workspace inside Synthesio to pull from)
3. Click **Start Import**.
4. The first import is a full backfill (windowed in batches). Subsequent syncs are incremental.

### 3.3 Import history

The same Synthesio card shows an **Import History** table:

| Column | What it means |
|---|---|
| Run ID | Unique identifier for that import job. Useful in support tickets. |
| Started / Finished | Job timestamps (your local timezone). |
| Status | `PENDING` → `RUNNING` → `COMPLETED` / `FAILED`. Failed rows expand to show the error. |
| Mentions ingested | Total count of new documents created. |
| Window | The date range covered by that run. |

### 3.4 Where the data lives

Synthesio mentions are stored in a workspace dataset named **"Synthesio Mentions"** (auto-created on first import). You can attach this dataset to any Agent that should be able to answer questions about your social-listening footprint.

### 3.5 Constraints & limits

- **Only one Synthesio connection per workspace.** If you have multiple Synthesio reporting units, you currently need to pick one.
- **Backfill window** is governed by your Synthesio plan; the connector cannot reach further back than Synthesio itself retains.
- **Sync cadence** is roughly hourly for incremental syncs. There is no manual "sync now" button outside support.
- **Mentions cannot be deleted individually** — they are managed as a dataset. To purge, reset the dataset.

---

## Cross-feature behavior & integration map

```text
┌─────────────────────────┐         ┌──────────────────────┐
│  Workspace Mentions     │         │  @mention in chat    │
│  /mentions (admin)      │         │  (any Agent chat)    │
│  - All mentions tab     │         │                      │
│  - Magic Topics tab     │         │  Routes a single     │
│    (coming soon)        │         │  message to a        │
│                         │         │  specific Agent      │
└────────┬────────────────┘         └─────────┬────────────┘
         │                                    │
         │ Same component as                  │ Mentions can target
         │ Branding → Reviews                 │ any persona in the
         │                                    │ active chat surface
         ▼                                    ▼
┌─────────────────────────┐         ┌──────────────────────┐
│  Branding → Reviews     │         │  Personas (Agents)   │
└─────────────────────────┘         └──────────────────────┘

                  ┌──────────────────────────────┐
                  │  Synthesio social-listening  │
                  │  mentions (integration)      │
                  └──────────────┬───────────────┘
                                 │ Ingested into
                                 ▼
                  ┌──────────────────────────────┐
                  │  "Synthesio Mentions"        │
                  │   Dataset → searchable by    │
                  │   Agents you grant access    │
                  └──────────────────────────────┘
```

---

## Constraints & limitations

- **Admin-only page.** The Mentions navigation entry and `/mentions` URLs are invisible / unreachable for non-admin users. They will not see a permission error — they will be silently redirected.
- **Mentions UI is brand-scoped.** The All mentions tab requires the workspace to have a brand attached. If `workspace.brand` is null, the page renders empty.
- **Magic Topics is not yet wired to an analysis backend** and has no per-workspace feature flag — turning a flag on will not make it work. Consider the tab a placeholder until product announces ship.
- **`@mention` filtering uses prefix-match only,** not full-text contains. Typing `@Analyst` will not match an agent literally named "Data Analyst" — you would need `@Data`.
- **`@mentions` are case-insensitive at filter time** but the inserted chip uses the agent's canonical casing. Don't try to "spell-fix" capitalization by re-typing.
- **Only the first `@mention` in a message is used for routing.** Subsequent mentions in the same message render as chips but do not change which persona receives the message.
- **Synthesio mentions are not editable.** They are pulled documents — to correct metadata, edit it in Synthesio and wait for the next sync.

---

## Best practices

### For the Mentions workspace area

- **Pin "Unreviewed Only" while triaging.** It keeps the feed honest and prevents double-reels of the same response.
- **Always sort by MOST_LIKES** (current default) when prioritizing what to clip. Likes are the strongest community signal that something is reel-worthy.
- **Use the Review Modal for highlights**, not just inline reading. Highlights you create become reusable for downstream clipping in [Reels](/guide/reels).
- **Brand name in the default Reel title** is the brand on the workspace — rename per-reel if you want the title to reflect the campaign or the moment instead.

### For `@mentions` in chat

- **Mention proactively, not just when correcting.** In multi-agent chats, an explicit mention is the cheapest way to make a routing decision deterministic.
- **Don't mention more than one Agent per message.** Use sequential messages; the system only routes to the first mention anyway.
- **Test multi-word names** when you create an agent — if two of your agents share a long common prefix (e.g. "Data" and "Data Analyst"), be aware that the system will pick the **longest matching name** for ambiguous input. Use distinctive first words if you can.

### For Synthesio mentions

- **Attach the Synthesio dataset only to agents that need it.** Generic agents don't benefit from 100k news clippings in their context window; specialist "brand listening" agents do.
- **Don't paste raw Synthesio URLs into chat.** The dataset is already searchable — ask the agent to find the mention by topic or date range and it will retrieve the source URL for you.
- **Watch the Import History tab during the first backfill.** Backfills can run for hours; if a run is stuck in `RUNNING` for over 12 hours, capture the Run ID and open a support ticket.

---

## FAQ

#### Why does the Mentions item disappear from my nav?
It is hidden for non-admin roles. Workspace Owners and Admins see it; Members, Viewers, and Guests do not. The route also redirects to `/` if you load it directly.

#### Is "All mentions" the same as "Branding → Reviews"?
**Yes, today.** Both routes mount the same `ReviewsPage` component over the same brand-feedback survey. The two entry points exist because Branding is brand-team-focused while Mentions is intended to be the broader "what is the community saying" hub once Magic Topics ships.

#### When is Magic Topics shipping?
There is no public date. The route exists, the empty state is final copy, and the analysis backend is in progress. Watch the changelog.

#### Can I turn on Magic Topics with a feature flag?
No. There is no workspace flag (e.g. no `magicTopicsEnabled` toggle) that activates it. The empty state is the only state, regardless of workspace, account, or environment.

#### Can a non-admin see who mentioned them with @?
Yes. The `@mention` chip and the AgentCard hover popup work for every user with chat access, regardless of role. Only the workspace **Mentions page** is admin-gated.

#### Why isn't my @mention being recognized server-side?
Three common causes:
1. **The persona isn't in the active chat surface.** Workflow nodes, Brand Companions, and Datasets each have their own persona scopes.
2. **The name contains a character that you typed differently** (e.g. en-dash vs hyphen, smart quote vs straight quote). Names are matched literally after escaping; subtle Unicode differences will fail.
3. **You used a prefix that matches multiple agents** with overlapping names. The longest-name match wins; double-check which agent the system actually picked by hovering the chip after send.

#### Can I `@mention` a community member or another user (not an Agent)?
Not today. The `@mention` system is for Agents/Personas only. There is no equivalent syntax for human users or community members.

#### Are Synthesio mentions different from community-feedback mentions?
Yes, completely. Community feedback comes from your own brand's feedback survey, captured inside Vurvey. Synthesio mentions are scraped from external sources and ingested as a dataset. They never appear in the All mentions tab.

#### What happens to the AgentCard if the persona is deleted?
The chip still renders the historic name and ID, but the hover popup gracefully falls back to a "persona no longer available" state. The link does not break inbound rendering.

#### Why does `@vurvey.com` not trigger a mention for an agent named "Vurvey"?
By design. The word-boundary check excludes any `@` that is immediately preceded by a word character (so email addresses can't accidentally route messages). If you genuinely want to mention an agent named "Vurvey" in a sentence about email, separate the `@Vurvey` from the email with whitespace.

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| **`/mentions` redirects to home** | Your role is not admin. Ask a workspace Owner to confirm under Workspace Settings → Members. |
| **All mentions tab is empty** | (a) No brand on the workspace — connect one in Branding settings. (b) Brand has no feedback survey yet — surveys auto-create on first response. (c) Active question has zero answers — try another question pill. |
| **Reel created from a card never appears in Reels** | The flow is async. After the "Publishing Reel to brand page" toast, give it ~30 seconds. If still missing, check Reels → Drafts vs Published. |
| **Unreviewed Only checkbox doesn't refilter** | Network hiccup — the filter triggers a refetch (`NetworkStatus.setVariables`). If the spinner is stuck more than ~10s, refresh the page. |
| **Magic Topics has no data** | It is a coming-soon empty state. No action will populate it. |
| **`@mention` popup doesn't open** | (a) You typed `@` immediately after a word character (e.g. inside an email) — the `@` must be preceded by whitespace or start-of-input. (b) There are no personas attached to this chat surface (some Workflow nodes have zero). |
| **`@mention` popup is empty after typing letters** | No persona name starts with your text. The match is **prefix-only**, not contains. |
| **The wrong agent is responding to my @mentioned message** | Two agents share a name prefix and the longer name won. Open the chip on the sent message to confirm which persona was matched. |
| **Synthesio import status is FAILED** | Open the row to read the error. Most common: stale API key (regenerate in Synthesio and reconnect) or a permissions change on the reporting unit. |
| **Synthesio mentions aren't surfacing in Agent answers** | Confirm the agent has the **"Synthesio Mentions"** dataset attached and its retrieval scope includes the date range you're asking about. |

---

## Related guides

- [Branding](/guide/branding) — brand-team workflows, brand-feedback survey configuration, and the Reviews page that backs **All mentions**
- [Reels](/guide/reels) — turning a feedback response into a published reel from the Mentions area
- [Agents](/guide/agents) — creating, naming, and describing the personas that get `@mentioned`
- [Datasets](/guide/datasets) — how Synthesio mentions become searchable
- [Integrations](/guide/integrations) — the broader integration surface, including Synthesio setup
- [Permissions & Sharing](/guide/permissions-and-sharing) — which roles can see the Mentions area and connect Synthesio
- [Workflows](/guide/workflows) — Workflow chat nodes that support `@mentions`
