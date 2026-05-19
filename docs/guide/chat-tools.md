---
title: Chat Tools
---

# Chat Tools

The **Chat Tools dropdown** in the chat toolbar lets you give your AI conversation access to specific external data sources — social networks, search engines, e-commerce listings, image generators, your own workspace data, and connected third-party services via Composio. This doc covers every tool, how to enable/disable them per-conversation, and how the Manual vs Smart Prompt modes differ.

> 📷 _Screenshot pending: Chat toolbar with Tools dropdown open showing all available tools_

::: tip Flag note: `toolsEnabled`
The Tools dropdown is gated by the workspace flag `toolsEnabled`. If you don't see a Tools button in your chat toolbar, this is off for your workspace. See [Feature Flags Reference → toolsEnabled](/guide/feature-flags#toolsenabled).
:::

---

## What are tools?

Most AI chat starts with the model's built-in knowledge — useful but bounded by training data and lacking real-time access. **Tools** extend the AI's reach: when a tool is enabled in your conversation, the AI can call out to that service mid-conversation to fetch live data, search the web, query your datasets, generate images, or interact with your connected third-party services.

Examples:
- "What's trending on TikTok this week?" → enable **TikTok** tool, AI fetches live trends
- "Find me reviews of brand X on Amazon" → enable **Amazon**, AI pulls actual product reviews
- "Search my campaign data for mentions of price" → enable **Surveys**, AI queries your workspace
- "Generate a poster image for this campaign" → enable **OpenAI** (gpt_image), AI calls DALL-E

Tools are scoped per-conversation — turning one on for this chat doesn't affect others.

---

## How to reach it

Click the **Tools** chip in the chat toolbar (alongside the model selector, image button, sources button, and workflows button).

The dropdown opens showing:

1. **Web search** as a prominent top-level option (most-used tool)
2. **Other tools** grouped below
3. **Connections** section at the bottom (Composio integrations, if any)
4. **Disabled tools message** if any are blocked for your workspace

Click a tool to toggle it on (checkmark appears) or off (checkmark disappears).

---

## The full tool catalog

The 17 currently-available tools, organized by category as they appear in the dropdown:

### Workspace data

| Tool | Slug | What it does |
|---|---|---|
| **Surveys** | `surveys` | Access survey data with metadata, response details, search by name, and pre-computed insights |
| **Datasets** | `datasets` | List workspace datasets and perform semantic search across uploaded files and training sets |

### Web research

| Tool | Slug | What it does |
|---|---|---|
| **Web** | `web` | Perform web searches, scrape websites, verify URLs, and find images across the internet |
| **Google Trends** | `google_trends` | Analyze search trends, get keyword suggestions, interest over time, regional data, related queries, and real-time trending topics |
| **Google Maps** | `google_maps` | Search local businesses, get place details, directions, nearby locations, distance calculations, and geocoding |
| **Amazon** | `amazon` | Search Amazon products, get product details, reviews, offers, deals, best sellers, and category listings |

### Social media

| Tool | Slug | What it does |
|---|---|---|
| **Twitter / X** | `twitter` | Search tweets by hashtag or keyword, get user profiles, trending topics, and detailed tweet information |
| **Instagram** | `instagram` | Search Instagram hashtags, get user profiles, posts, stories, highlights, and location details |
| **LinkedIn** | `linkedin` | Search LinkedIn people and companies, get profiles, employee lists, company posts, and job listings |
| **Reddit** | `reddit` | Search Reddit posts and subreddits, get post details, comments, user profiles, and trending content |
| **TikTok** | `tiktok` | Search TikTok content, get user profiles, videos, comments, trending posts, challenges, music, and live streams |
| **YouTube** | `youtube` | Search YouTube videos, get trending content, video details, and comments |

### Image generation

| Tool | Slug | What it does |
|---|---|---|
| **Google Imagen** | `imagen` | Generate images from text prompts using Google Imagen |
| **Nano Banana** | `nano_banana` | Generate images from text prompts using Gemini |
| **OpenAI** | `gpt_image` | Generate images from text prompts using OpenAI (DALL-E) |
| **Stable Diffusion** | `stable_diffusion` | Generate images from text prompts using Stable Diffusion |

### Connections (Composio)

| Tool | Slug | What it does |
|---|---|---|
| **Connections** | `connections` | Aggregator for your Composio-connected services (Gmail, Slack, GitHub, Notion, etc.) — see [Integrations → Composio](/guide/integrations#composio-per-user-tool-connections) |

When you enable Connections, individual connected services from your Composio profile become callable from the chat.

---

## The dropdown anatomy

> 📷 _Screenshot pending: Tools dropdown with sections labeled_

Each tool row in the dropdown shows:

| Element | Source | What it tells you |
|---|---|---|
| **Icon** | `getToolIcon(slug)` | Brand or category icon for that tool |
| **Display name** | `toolGroup.displayName` from API | Human-readable name |
| **Right-side checkmark** | Present if the tool is currently active in this conversation | At-a-glance status |
| **Disabled state** | Greyed out + un-clickable if the workspace doesn't have access | E.g. social tools that require API keys not configured |

### Disabled tools message

> 📷 _Screenshot pending: Disabled tools banner at top or bottom of dropdown_

If your workspace lacks access to certain tools (typically because Vurvey's backend doesn't have the required API keys for that integration, or because of plan limitations), they appear disabled with a banner explaining why. Common reasons:

- The integration is in beta and not generally available
- Your plan doesn't include certain social-media tools
- An admin disabled them at the workspace level

Hover the disabled item for details; contact your CSM to enable.

---

## Manual mode vs Smart Prompt mode

Vurvey supports two ways to use tools — `ManualToolGroup` and `ToolGroup` modes:

### Manual mode (default)

You explicitly enable / disable individual tools per conversation. The AI uses only what you've selected. Useful when:

- You want precise control over what data sources the AI consults
- You're testing whether a specific tool produces good results
- You want to limit AI to a narrow scope (e.g. only your own workspace data, no web)

This is the mode the Tools dropdown drives directly. Each tool you click adds to `activeToolGroups`.

### Smart Prompt mode (`smartPromptEnabled`)

The AI auto-selects tools from a **curated bundle** based on your prompt content. Useful when:

- You don't want to think about which tools are right
- You're asking broad questions and want the AI to figure it out
- You're using a Capability where the author already specified a bundle

Smart Prompt uses the broader `ToolGroup` enum (curated subsets like "social_research" or "ecommerce_research") rather than letting you pick individuals. When `smartPromptEnabled` is true, the Tools dropdown may behave differently — your manual selections may be advisory rather than authoritative.

::: tip Which one am I in?
The dropdown shows the same icons either way. The behavior difference is invisible until you observe results — Smart Prompt produces tool calls you didn't manually authorize; Manual only uses what you ticked.
:::

---

## Composio connections

> 📷 _Screenshot pending: Connections section of dropdown showing user's Composio-linked services_

The **Connections** category (when `composioEnabled` workspace flag is on AND you've connected services via Personal Profile → Integrations) aggregates your Composio integrations:

- Gmail, Outlook, Slack, GitHub, Notion, Salesforce, HubSpot, Zendesk, etc.

Each connected service appears as a sub-item in the dropdown. Clicking it toggles whether the AI can call that service. The dropdown shows:

| Field | Meaning |
|---|---|
| **Service icon** | Logo of the connected service (Slack, Gmail, etc.) |
| **Service name** | Human-readable name (e.g. "Slack — Acme Workspace") |
| **Connection status** | Active / Pending / Failed |
| **Connection ID** | Internal — used for deduplication |

If you have no Composio connections, the section is hidden entirely. If `composioEnabled` is off, the section doesn't appear regardless of connections.

See [Integrations → Composio](/guide/integrations#composio-per-user-tool-connections) for setup details.

---

## The "Web" prominence

Web search is special-cased in the UI — instead of being one row among many, it's typically displayed prominently at the top of the dropdown.

| Why | The platform deliberately encourages web search as the default research tool — it's the most general-purpose option |
| How | The component splits `externalToolGroups` into `webToolGroup` (one item) and `otherTools` (the rest) and renders them in separate sections |

When you don't know which specific tool you need, "Web" is usually the right starting point.

---

## How tool state syncs to AI behavior

When you check a tool, your chat session sends `manualToolGroups: [<slug>, <slug>, ...]` to the backend on the next message. The backend:

1. Validates that each requested tool is enabled for your workspace
2. Includes those tools in the model's function-calling list
3. The model decides whether to invoke any of them during reply generation

You won't always see the model call the tool — it only does so when the prompt actually warrants it. E.g. enabling **Amazon** doesn't force every reply to mention Amazon; the model invokes it only when your prompt is about products, reviews, deals, etc.

---

## Visible tool calls in chat

> 📷 _Screenshot pending: Chat message with tool-call indicator showing which tool the AI used_

When the AI does call a tool, the chat shows a tool-call indicator on that message — typically a small badge or expandable section with:

- The tool that was called
- The query or arguments the AI sent to it
- A preview of the data returned
- A timestamp / duration

You can click the indicator to expand the full tool-call payload for debugging. See the `chat-tool-state-display` component for the visual treatment.

---

## Disabled state — when tools can't be used

A tool can be disabled (greyed out, un-clickable, or hidden) for several reasons:

| Reason | Visible signal | What to do |
|---|---|---|
| Workspace doesn't have access | Grey out + disabled-tools message | Talk to CSM about enabling |
| Workspace flag `toolsEnabled` is off | Entire Tools button is hidden | Talk to admin / CSM |
| Specific tool is unavailable platform-wide | Tool missing from dropdown entirely | Watch [What's New](/guide/whats-new) for re-enablement |
| Smart Prompt mode override | Manual selection greyed out | Toggle off Smart Prompt to regain manual control |

If `areAllToolsDisabled` is true (every social tool, web, AND connections disabled), the dropdown shows a banner saying no tools are available.

---

## Constraints & limitations

- **`toolsEnabled` workspace flag required.** No Tools dropdown without it.
- **Tool selection is per-conversation, not per-message.** What you check at the start applies until you change it; it doesn't reset between messages.
- **Tool calls cost credits.** Each tool invocation is a real API call (web search, social media API, etc.) — they consume backend resources and may charge against your workspace's credit balance.
- **Some tools have rate limits.** Heavy use (e.g. dozens of TikTok searches in one chat) can hit upstream API rate limits, after which the tool returns errors for a cooldown period.
- **Image generation tools produce images, not analysis.** Imagen, GPT Image, Nano Banana, and Stable Diffusion all GENERATE images — they don't analyze existing ones. For analysis use the vision-capable model in your chat (see [AI Models](/guide/ai-models)).
- **Composio connections are per-user, not per-workspace.** Each user connects their own services; what one user enables in chat doesn't appear for other users.
- **Connections category may show stale status.** If a Composio service token expired, the connection may still show "Active" until the next API call returns an auth error.
- **Tool calls add latency.** Tool-using replies take longer because the AI waits on external API calls. Expect 5-30 seconds per tool call.
- **The model may not call the tool you enabled.** Enabling a tool gives the model the option, not the obligation. If your prompt doesn't trigger it, the model proceeds without it.
- **The model may call a tool you didn't expect.** In Smart Prompt mode the curated bundle includes more tools than visible toggles suggest.
- **Backend may filter tools further.** Even tools in the dropdown can be rejected at runtime if backend policy decides the request is invalid.
- **No keyboard shortcut to toggle.** Click in the dropdown is the only way.
- **No "select all" / "clear all" shortcut.** Each tool is an individual click.

---

## Best practices

- **Start with Web** for general research. It's the most flexible.
- **Layer Surveys + Datasets** when querying about your own data. The AI will pull both internal and external context.
- **Disable tools you don't need.** Each enabled tool can be invoked — limiting the set keeps responses focused.
- **For social listening, enable specific platforms.** Don't enable all six social tools; pick the 1-2 that matter for your use case.
- **For image generation, pick ONE model.** Having Imagen + Stable Diffusion + GPT Image + Nano Banana all enabled wastes a slot — the AI can only generate one image at a time anyway.
- **Use Connections sparingly.** Composio calls can be slow and expensive depending on the connected service.
- **Don't enable tools in a chat you'll come back to weeks later.** Tool sessions may change behavior over time as APIs evolve; your old chat may produce different results if re-run.
- **Check the tool-call display for transparency.** Click the indicator on a reply to see exactly what was queried and what came back — useful when you suspect the AI is making things up.
- **For sensitive data, prefer Surveys / Datasets over Web.** Workspace tools stay within your workspace boundary; Web sends queries to external search engines.
- **When debugging, isolate tools.** If the AI gives weird answers, disable everything but one tool and re-run.

---

## FAQ

#### How do I know if the AI used a tool?
Look at the chat message after you sent your prompt. If a tool was called, a tool-call indicator appears on that reply with the tool name and details.

#### Can I see what data the tool returned?
Yes — click the tool-call indicator to expand the full payload. Useful for debugging or auditing.

#### Why isn't my chat using Web search even though I enabled it?
Possible reasons:
1. Your prompt didn't trigger a search-worthy intent (e.g. asking for opinion-based content).
2. The model decided its training data was sufficient.
3. The Web tool is silently failing (rare — check workspace).

Try a more explicit prompt: "Search the web for X" forces the call.

#### Does enabling a tool cost credits even if it's not used?
No — credits are charged per actual invocation, not per enable. You can have all tools enabled and pay nothing if none get called.

#### What's the difference between "Web" and a specific social tool?
- **Web** is a general-purpose search engine (Google/Bing/etc.).
- **Twitter/Instagram/etc.** hit each platform's own API for structured data (followers, hashtags, comments).

For "what's people saying on Twitter" — use Twitter (more accurate). For "search the internet for news" — use Web.

#### Why are some tools greyed out?
Workspace doesn't have access OR the tool is in beta and not GA. Talk to your CSM.

#### Can I add a custom tool?
Yes via Composio integration. If the service is supported by Composio, connect it from Personal Profile → Integrations and it appears under Connections.

#### What if a tool returns wrong info?
Tools query external services — Vurvey isn't responsible for the third party's data quality. Verify important findings independently.

#### Do tools work in Capability runs?
Yes — Capability authors can specify tools in the Capability's underlying workflow. Tools enabled in the Capability run regardless of what's checked in chat.

#### Are tool calls visible to other workspace members in shared conversations?
Yes — tool-call indicators are part of the conversation history. Other viewers can click and see the same payload.

#### Why does Stable Diffusion / Imagen / GPT Image / Nano Banana all exist for image generation?
Each uses a different underlying provider. Imagen = Google. GPT Image = OpenAI (DALL-E). Stable Diffusion = open-source via API. Nano Banana = Google Gemini-based. Different aesthetics and speeds; experiment to find your favorite.

#### How do I batch-enable multiple tools quickly?
Click each one. No "select all" shortcut today.

#### What's the maximum number of tools I can enable in one chat?
No hard cap, but enabling all 17 tools makes the AI's tool-choice slower because it has to consider every option each turn. 3-5 is a healthy maximum for most prompts.

#### Does the tool list change between models?
The available tools are workspace-scoped, not model-scoped — same dropdown regardless of which model you've selected via [AI Models](/guide/ai-models). But model capabilities matter — only models with the `tools` capability flag actually use tool calling.

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| Tools button missing from chat toolbar | `toolsEnabled` workspace flag off |
| Tools dropdown shows banner "no tools available" | All tools are disabled at the workspace level |
| Specific tool greyed out | Workspace lacks access OR tool requires Composio connection that isn't set up |
| I enabled Web but the AI isn't searching | Prompt didn't trigger a search intent. Add "Search the web" explicitly. |
| Tool call returns "rate limited" error | Upstream API hit its limit. Wait a few minutes and retry. |
| Composio connection shows "Active" but tool calls fail | Token may have silently expired. Reconnect from Personal Profile → Integrations. |
| Image generation tools produce no image | Selected provider may be down or your prompt was rejected by their safety filter. Try a different provider. |
| Tool-call indicator shows but doesn't expand on click | UI glitch; refresh the page. |
| Checkmark appears next to a tool I didn't enable | Smart Prompt mode auto-enabled it. Toggle off Smart Prompt for full manual control. |
| Connections section is empty | You haven't connected any Composio services. Go to Personal Profile → Integrations. |
| Composio service I connected doesn't appear | The Composio connection may have failed silently. Reconnect and verify status. |
| Replies are noticeably slower with tools enabled | Expected — tool calls add latency. Disable tools you're not using to speed up. |

---

## Cross-references

- [Home](/guide/home) — where the chat toolbar lives
- [Integrations → Composio](/guide/integrations#composio-per-user-tool-connections) — setting up per-user service connections
- [AI Models](/guide/ai-models) — model `tools` capability flag determines whether the model can actually use these
- [Capabilities](/guide/capabilities) — Capability authors can pre-configure tool sets in workflows
- [Workflows](/guide/workflows) — Workflow task nodes can also have tool configurations
- [Datasets](/guide/datasets) — the Datasets tool queries your dataset library
- [Campaigns](/guide/campaigns) — the Surveys tool queries your campaign data
- [Feature Flags Reference](/guide/feature-flags) — `toolsEnabled`, `composioEnabled`
- [Credits & Usage](/guide/credits-and-usage) — tool calls draw credits
- [Canvas & Image Studio](/guide/canvas-and-image-studio) — image generation surfaces complement these tools
- [Settings](/guide/settings) — workspace-level tool enablement (admin-only)
- [Glossary](/guide/glossary) — Tool / Tool Group / Function Calling definitions
