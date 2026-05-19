---
title: Survey-Taking Experience
---

# Survey-Taking Experience

This guide describes what a **respondent** sees when they take a Vurvey survey — the entire experience inside the Responder app (`vurvey-web-responder`). It's written from the respondent's perspective and is useful for:

- **Customer admins** designing campaigns who want to understand what their respondents will encounter
- **Vurvey staff** answering "what happens between the link click and the thank-you page?"
- **Engineering** debugging responder-app flow issues
- **Respondents themselves** stumbling onto the docs site looking for help

::: tip This is the Responder app, not the Manager
For the researcher / admin experience, see [Home](/guide/home), [Campaigns](/guide/campaigns), and the rest of the Features section. This page is exclusively about the respondent-facing experience.
:::

---

## The full flow

A respondent's journey through a Vurvey survey looks like this:

```
Survey link (email / SMS / shared URL)
      ↓
Intro page (campaign overview, optional signin)
      ↓
Login (if survey requires authentication)
   ┌──────────────┬──────────────┬──────────┬──────────┬──────┐
   ▼              ▼              ▼          ▼          ▼      ▼
Google      Microsoft       Apple        Email      SSO     anonymous
   ↘            ↓              ↓          ↓          ↓     ↙
                  ────── (Firebase Auth) ──────
                              ↓
                         Question 1
                              ↓
                         Question 2
                              ↓
                          ...
                              ↓
                         Question N
                              ↓
                      Thank-You page
                              ↓
                   (optional redirect URL)
```

Each step is documented in detail below.

---

## Step 1 — The survey link

Respondents arrive via a survey deep link — usually shared by the brand that owns the campaign. Common channels:

- **Email invitations** (sent via SendGrid by the `sendgrid-brand-invites` GCF or campaign-invite flows)
- **SMS / messaging app links**
- **QR codes** printed on product packaging, in-store displays, event signage
- **Direct paste** of the URL into a browser

The URL contains the survey ID and (when applicable) a respondent token that links the response to a known respondent record. The token is opaque to the user.

::: info Capture metadata travels with the URL
The Responder app captures URL parameters via `usePersistentUrlMetadata`. UTM tags, referrer info, and campaign attribution stick with the respondent throughout the survey via localStorage so they're available to the response record.
:::

---

## Step 2 — The Intro page (`/[surveyId]`)

Before answering anything, the respondent sees an Intro page introducing the campaign.

| Element | What it shows |
|---|---|
| **Brand banner** | The brand record's banner image (set in [Branding](/guide/branding)) |
| **Campaign name & description** | Plain-language framing of what the survey is about |
| **Estimated duration** | Calculated from question count + types (video questions add ~30s estimate each) |
| **Reward** | When the campaign has a reward configured, the value is shown (e.g. "$5 Gift Card") |
| **"Get Started" button** (`PulseButton`) | Tap to begin |
| **Preview Bar** (preview mode only) | Visible only when the responder is staff previewing the survey before launch — _not_ visible to real respondents |

### Signed-in vs anonymous

Vurvey's Intro page handles three identity states:

- **Authenticated + known respondent**: Sees a "Resume" button if they have a partial response.
- **Authenticated but unknown**: Treated as a fresh respondent.
- **Anonymous (no auth)**: For surveys allowing anonymous responses, Firebase `signInAnonymously()` is called before survey start so the response can be saved. Their identity is opaque.

### Survey access levels (`SurveyAccessLevel`)

| Level | What it gates |
|---|---|
| **Public** | Anyone with the URL can respond; anonymous auth is enabled. |
| **Workspace** | Restricted to workspace members (login required, account must be on the workspace's invited list). |
| **Mailing list** | Restricted to specific email addresses; respondents must verify identity via the email-link auth flow. |
| **Brand population** | Only respondents matching the population definition can submit. |

### Pre-launch state

If the survey is in `Draft` status (not yet published), the Intro page shows a "Coming soon" placeholder — preview button only available to staff with the preview link.

---

## Step 3 — Login (when required)

If the survey's `SurveyAccessLevel` requires authentication, the respondent is routed through the responder login flow.

The Responder app supports **5 providers** (vs the Manager's 2):

| Provider | Behavior |
|---|---|
| **Google** | OAuth via Firebase Auth |
| **Microsoft** | OAuth via Firebase Auth |
| **Apple** | "Sign in with Apple" via Firebase Auth |
| **Email** | Verification code or password flow |
| **SSO** | Workspace-configured SSO providers (Okta, Azure AD, etc.) |

See [Logging In → Responder login](/guide/login#vurvey-responder-login-survey-takers) for the full provider matrix and provider-linking behavior.

### Survey context preservation

A critical detail: **the survey ID is stored in `localStorage`** when the respondent first lands. After login completes, they're redirected back to the original survey via `/${surveyId}${location.search}` — so login doesn't break the survey-taking flow.

If the respondent clears their localStorage (private browsing, cache wipe), they'll land at the responder home instead of the survey. Re-clicking the original survey link recovers context.

### The Verify Email loop

For email-based sign-up, the respondent receives a verification email. The app polls every 3 seconds for `user.emailVerified`. When the respondent clicks the verification link in their email:

1. The next poll picks up the verification (within 3 seconds).
2. Two Google Analytics events fire: `complete_registration` and `login`, tagged with `SIGNUP_METHODS.EMAIL`.
3. The toast confirms _"Your email has been verified. Thank you for signing up!"_
4. The page reloads automatically — no manual refresh needed.

See [Logging In → Verify Email loop](/guide/login#verify-email-loop) for the implementation.

---

## Step 4 — Answering questions

Each question is rendered by the same component (`Question`) which adapts based on question type. The Responder app supports 13+ question types — see [Quick Reference → Question Types](/guide/quick-reference#question-types).

### Question UI elements

| Element | What it shows |
|---|---|
| **Progress bar** | Question N of M |
| **Question text** | Rendered as rich text — supports bold, italics, links, line breaks |
| **Optional stimulus** | An image, video, or AR model shown alongside the question (see [Glossary → Stimulus](/guide/glossary#s)) |
| **Answer input** | Type-specific (video recorder, text input, slider, dropdown, etc.) |
| **Next / Submit button** | Disabled until the answer is valid |
| **Back button** | Returns to previous question (when allowed) |
| **Save & Exit** | Saves partial state and returns the respondent to their device — they can resume from the same link later |

### Video question UX

Video questions are the heart of Vurvey's value proposition. The video recorder UI:

1. **Camera/mic permission prompt** appears once per session.
2. **Recording controls**: large red record button, timer (e.g. "15s of 5:00"), pause/resume, stop.
3. **Review step**: after recording, respondent can play back, re-record, or submit.
4. **Upload progress**: a progress bar shows the upload to GCS. Slow networks may take several minutes for longer videos.
5. **Auto-transcription**: transcripts are generated server-side by Sensemake after upload completes. Respondents don't see the transcript live; it appears in the Manager-side Results tab.

::: warning Camera/mic prompts may be browser-dependent
Some browsers (especially Safari on iOS) handle media permissions differently. The recorder includes a help link for permission-related errors.
:::

### Video upload questions

For respondents who prefer to record outside the app (longer videos, better lighting, mobile native camera), Video Upload questions let them pick a pre-recorded MP4/MOV file. The upload flow is the same — server-side transcription kicks off after upload completes.

### Picture / PDF / Barcode uploads

- **Picture Upload**: Camera capture or file picker. Multiple images allowed for some configurations.
- **PDF Upload**: File picker only.
- **Barcode**: Uses the device camera to scan; the resulting product ID is the answer.

### Choice / Multiple Choice / Ranked

Standard form controls. Ranked questions use drag-and-drop on desktop and a tap-to-reorder pattern on mobile.

### Short / Long Text / Number

Standard text inputs. Short text is single-line; Long text is multi-line with character counters when limits are configured.

### Slider / Star Rating

Sliders show a value indicator that follows the thumb. Star ratings are tappable on mobile, click-and-drag-able on desktop.

---

## Step 5 — The Thank-You page

After the final question, the respondent lands on the Thank-You page (`/[surveyId]/thank-you`).

| Element | What it shows |
|---|---|
| **Thank-you message** | Custom message configured by the campaign author. Renders as rich text with the `RichTextInput` component, so it can include links, formatting, branding. |
| **Optional redirect URL** | If the campaign was configured with a post-completion URL, a button leads the respondent there. The redirect URL is built by `buildRedirectUrl()` and may include the respondent project ID for downstream attribution. |
| **App store badges** | "Get it on Google Play" / "Download on the App Store" badges link to the dedicated Vurvey mobile app for respondents who want a richer experience. |
| **Pulse button** | Animated CTA — usually pointing to whatever follow-up action the brand wants (download the mobile app, claim a reward, browse more campaigns). |

### `respondent_project_id` parameter

If the survey URL contained a `respondent_project_id` query parameter, it's used to look up `RESPONDENT_PROJECT_COMPLETION_URL` — a dynamic redirect URL configured at the project level. This is how integrations with external respondent-recruiting platforms (Prolific, Cint, etc.) close the loop on a completion event.

The Thank-You page reads `respondent_project_id` from both `window.location.search` (before the hash) and `location.search` (after the hash), merging them — a workaround for HashRouter limitations on the responder app.

### Survey access levels and the Thank-You experience

| Access level | Post-completion behavior |
|---|---|
| **Public** | Generic thank-you, optional redirect, no account sign-up prompt |
| **Workspace / Mailing list** | Thank-you with reference to the brand and any future opportunities |
| **Brand population** | Population-specific framing, sometimes with a "follow brand" prompt |

---

## Saving partial responses

If a respondent closes the tab mid-survey, their progress is saved (server-side, every answer is persisted as it's submitted). Returning via the same survey URL with the same identity resumes from where they left off — the Intro page changes to show a "Resume" button instead of "Get Started".

Anonymous respondents can also resume if their Firebase anonymous-auth session persists in their browser. Clearing browser data resets them to a fresh respondent.

---

## Mobile vs desktop

The Responder app is **mobile-first**. The web responder works well on phones; on desktop it adapts to a similar centered single-column layout.

For respondents who frequently take Vurvey surveys, the **dedicated Vurvey mobile app** (iOS / Android) provides:

- Push notifications for new opportunities
- Faster camera/mic access
- Better video recording quality
- Offline support for in-progress responses
- Persistent identity across all surveys

The Thank-You page surfaces the app-store badges to encourage adoption.

---

## Constraints & limitations

- **Camera/mic permissions** vary across browsers — iOS Safari and embedded webviews (Instagram in-app browser, etc.) sometimes block media access. The dedicated mobile app sidesteps this.
- **Video upload size** depends on the campaign's configuration; defaults around ~200 MB.
- **No mid-survey question skipping** unless the question is explicitly optional.
- **Resume requires the same identity** — anonymous resumes require persistent browser session; authenticated resumes require re-signin.
- **Preview mode is staff-only** — the `PreviewBar` only renders when `useIsPreview()` returns true, which requires a special preview token.
- **HashRouter quirk** — the responder app uses a HashRouter, so URL params after the hash require the merging dance documented on the Thank-You page.
- **5 login providers + anonymous** vs Manager's 2 — surveys with `Workspace`-level access don't support anonymous; surveys with `Public` access typically do.
- **Mailing-list surveys** require email-verification flow; respondents can't bypass this with a different provider.

---

## Best practices (for campaign authors)

- **Test in Preview Bar** mode before launch. The preview shows exactly what respondents see and surfaces UX issues early.
- **Front-load video questions**. The recording UX has a learning curve; once a respondent records their first video answer, subsequent ones are faster.
- **Set a sensible duration estimate** in the Intro — under-promise on duration, over-deliver on respect for their time.
- **Use a clear post-completion call-to-action**. The Thank-You page is your last chance to direct them to the next thing (app download, reward claim, related survey).
- **Configure the `respondent_project_id` parameter** when integrating with respondent-recruiting platforms. This lets external systems know when their respondent completed.
- **Respect mobile-first design** in question text and stimuli — long question text wraps awkwardly on phones; stimuli should be readable at 375px-wide viewports.
- **Pre-test camera/mic prompts** by taking your own survey end-to-end on the platforms your respondents will use.

---

## FAQ (respondent-perspective)

#### Why doesn't the video record on my phone?
Most often, camera/mic permission was denied. Open your browser settings for the Vurvey domain and re-grant access. If still failing, try a different browser (Safari → Chrome or vice versa). If you're in an embedded webview (Instagram in-app, etc.), open the link in your phone's main browser — embedded webviews often block camera access entirely.

#### Why didn't I get a reward?
Rewards are issued by the brand after they review your response. Some campaigns automate this immediately; others batch payouts weekly. If you haven't received it after a reasonable window, contact the brand that ran the campaign.

#### Can I take the same survey twice?
Usually no — most campaigns limit one response per respondent identity. If you cleared browser data and are submitting anonymously, you might be able to start again, but the original submission still stands.

#### Why does it ask me to sign in?
Some surveys require authentication to verify respondent identity, especially for mailing-list or community-population campaigns. Anonymous responses are allowed only on `Public`-level surveys.

#### What happens to my data?
Your responses are stored on Vurvey's servers and shared with the brand running the campaign. Vurvey is a research platform, so your responses may be used for analysis, themed insights, and (with your consent) public reels. Your identifiable information (name, email) is restricted per the brand's data agreement — see Vurvey's [Privacy Policy](https://vurvey.ai/privacy-policy/).

#### My video stuck on "uploading". Did it submit?
Likely yes — uploads can take a long time on slow networks but the server-side record is created immediately. Check the survey URL after a few minutes; if you've advanced to the next question, the upload succeeded. If still stuck, refresh the page — partial responses save automatically.

#### Can I delete my response?
Contact the brand running the campaign. Vurvey doesn't expose a direct "delete my response" UI to respondents today.

#### Does Vurvey work in my country?
Yes, globally. Some regional restrictions apply for specific tools (Composio-connected providers, certain video processing). Brand campaigns may also be geo-restricted by the brand.

#### What happens if I have to stop mid-survey?
Close the tab. When you come back via the same link with the same identity (logged in account or anonymous browser session), you'll see a "Resume" button on the Intro page.

#### I forgot my password. How do I reset?
On the Email login flow, use the "Forgot password" link. A reset email arrives within a few minutes. If you used Google / Microsoft / Apple sign-in originally, there's no Vurvey password to reset — sign in with that provider.

---

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| "Get Started" button is disabled on the Intro page | Survey is in Draft status — not yet launched. Wait for the brand to publish. |
| Login redirects me to a different page after | Survey ID was cleared from localStorage. Reopen the original survey link. |
| Camera permission keeps being denied | Browser site settings have media blocked. Open browser settings for the Vurvey domain and re-allow. |
| Video upload progress bar stuck | Network too slow or file too large. Wait several minutes; if no progress, refresh. |
| App store badges go to wrong country's app | The Thank-You page links generically — open your country's app store directly if needed. |
| Got the Thank-You page but no reward | Brand hasn't processed the payout yet OR the campaign doesn't issue rewards. Contact the brand. |
| Trying to re-take a survey, but it shows my old response | One-response-per-respondent limit. Cannot re-submit. |
| Email verification link expired | Resend from the Verify Email page; link is single-use and time-limited. |
| Microsoft / Apple sign-in fails | Provider-side issue (account locked, SSO MFA, etc.). Try Google or email instead. |
| Preview Bar visible to me but I'm not staff | Edge case — the preview token may have leaked into your URL. Re-open the link via the actual survey URL without the preview parameter. |
| Question doesn't accept my answer | The validation rule (min/max length, required fields, etc.) hasn't been satisfied. Look for inline error text. |

---

## Cross-references

- [Logging In → Responder login](/guide/login#vurvey-responder-login-survey-takers) — the full Responder auth flow with all 5 providers
- [Campaigns](/guide/campaigns) — how campaigns are built (from the admin side)
- [Quick Reference → Question Types](/guide/quick-reference#question-types) — every question type respondents can encounter
- [Rewards](/guide/rewards) — how Tremendous payouts are configured (admin side)
- [People](/guide/people) — the audience-management layer respondents are recruited from
- [Branding](/guide/branding) — the brand identity respondents see (banner, logo, colors)
- [Platform Architecture](/guide/architecture) — where the Responder app fits in the stack (vurvey-web-responder repo)
- [Glossary → Responder](/guide/glossary#r) — terminology

---

## For admins designing campaigns

If you're a campaign author, the things you control about the respondent experience:

| You configure | They see |
|---|---|
| Campaign Build tab questions | The sequence of question screens |
| Each question's text + type + media | The question UI, stimuli, validation |
| Campaign Configure tab name + description | The Intro page banner content |
| Campaign Configure tab thank-you message | The Thank-You page message |
| Campaign Configure tab post-completion redirect URL | The post-completion CTA destination |
| Campaign Audience tab access level | Whether they can respond anonymously |
| Campaign incentive amount + currency | The reward displayed on the Intro page |
| Brand record (logo, banner, colors) | The visual identity throughout |
| Tremendous integration | Whether they get a real payout |

Test the full respondent experience by taking your own campaign via the public link before launching widely. Use a separate browser or incognito tab so you're a fresh respondent.
