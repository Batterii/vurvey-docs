---
title: Responder Web App
---

# Responder Web App

The **Responder Web App** — `vurvey-web-responder` — is the browser-based survey-taking experience for creators who don't have the [Mobile App](/guide/mobile-app) installed. It's React + Vite + TypeScript, supports four sign-in providers (Email, Gmail, Microsoft, Apple), captures video / audio / text / multi-choice / slider / rating responses, and integrates with Firebase, LogRocket, OpenTok, and Intercom.

> 📷 _Screenshot pending: Responder web app — intro screen for a campaign_

::: tip Repo
The Responder lives at github.com/Batterii/vurvey-web-responder, version 12.2.x at this writing. Published as `@batterii/vurvey-web-responder`. Deployed as a static site behind nginx; supports both authenticated and anonymous responder flows.
:::

---

## Audience and use cases

| User type | What they do here |
|---|---|
| **Invited creators** | Receive a campaign invite link, follow it to /:surveyId, sign in (or use anonymous mode), complete the survey |
| **Anonymous responders** | Open a public survey link, complete it without signing up (Firebase anonymous auth) |
| **Workspace managers** | Use the Previewer at /:surveyId/preview to test how their survey looks before publishing |

This app is NOT for workspace management or AI chat — that's [Home](/guide/home) and the Manager app. The Responder app is purpose-built for the survey-taking flow.

---

## Routes

The route map (from `src/app.tsx`):

| Route | Component | Auth required | Purpose |
|---|---|---|---|
| `/` | `Home` | Yes (or anonymous) | Lists pending invites for the signed-in creator |
| `/:surveyId` | `Intro` | No | Landing page for a specific survey — title, description, estimated time, rewards, "Start" button |
| `/:surveyId/preview` | `Previewer` | No | Preview mode for survey owners (no actual submission) |
| `/:surveyId/error` | `ErrorPage` | No | Generic error display |
| `/:surveyId/questions` | `QuestionPage` | Yes | The actual question-by-question survey-taking flow |
| `/:surveyId/thank-you` | `ThankYou` | Yes | Confirmation after submission |
| `/login` | `SignUpFlowWrapper` | No | Sign-in / sign-up flow (sub-routes below) |
| `/login/choose-method` | `ChooseLoginMethod` | No | Pick a provider (Email / Gmail / Microsoft / Apple) |
| `/login/email` | `Email` | No | Email entry step |
| `/login/password` | `Password` | No | Password entry step |
| `/login/create` | `Create` | No | New-account creation flow |
| `/login/recover-password` | `RecoverPassword` | No | Forgot-password initiation |
| `/login/check-email` | `CheckEmail` | No | "Check your email" intermediate state |
| `/login/*` (post-auth) | `Redirect` | Yes | Redirects already-authed users away from login |

If an authenticated user has `emailVerified: false`, they're routed to `VerifyEmail` before anything else.

---

## Authentication

### Firebase Auth — four providers

The Responder uses **Firebase Auth** with four SSO providers:

| Provider | Method ID | When to use |
|---|---|---|
| **Email + Password** | `email` | Standard sign-up; user picks own password |
| **Google (Gmail)** | `sso_gmail` | Single-click sign-in for Google account holders |
| **Microsoft** | `sso_microsoft` | For users with Microsoft accounts (Office 365, Hotmail, etc.) |
| **Apple** | `sso_apple` | For Apple ID users; required for iOS App Store distribution |

After Firebase Auth returns a user, the Responder calls `GET_ME` (GraphQL) to swap the Firebase ID token for a Vurvey session. The hook `useAuthentication` orchestrates this two-step flow.

::: warning Compare to Manager
The Manager app has only 2 SSO providers (Email + Google); the Responder has 4. This is because the Responder targets a broader audience (anyone with an Apple, Microsoft, Google, or any-email account), while the Manager is for paying customers whose orgs typically standardize on one provider.
:::

### Anonymous mode

The Responder supports **anonymous Firebase auth** as a deliberate friction-reducer:

- Users landing on `/:surveyId` can preview the intro without signing in.
- Some surveys may allow full submission without creating an account (depending on workspace settings).
- The Responder tracks `isAnonymousUser` separately from `isAuthenticated` to differentiate.
- When an anonymous user later signs up properly, their previous activity is linked to the new account.

This is unlike the Manager app, which requires explicit auth before any operation.

### Email verification gate

After sign-up via Email + Password, the user must verify their email before proceeding. The Responder:

1. Sends a verification email automatically (`sendEmailVerification` from `firebase/auth`).
2. Routes the user to `VerifyEmail` until `emailVerified: true`.
3. Once verified, normal flow resumes.

For SSO providers, email is pre-verified by the provider — no separate step.

---

## The intro flow

> 📷 _Screenshot pending: Survey intro page with title, image, description, "Start" button_

When a user lands on `/:surveyId`, they see the `Intro` page:

| Section | Component |
|---|---|
| **Header image / video** | `IntroDetails` — campaign branding, hero media |
| **Title + description** | `IntroDetails` — what the campaign is about |
| **Estimated time** | `IntroDetails` — how long it will take |
| **Reward** | `IntroIncentiveDetails` — what the creator gets (cash via Tremendous, etc.) |
| **Start button** | Routes to `/:surveyId/questions` to begin |
| **Avatar** | If logged in, the creator's avatar at the top |

The intro can be branded per-workspace via [Branding](/guide/branding) — colors, logo, fonts customize the landing.

---

## The question flow

> 📷 _Screenshot pending: Question page with video recorder and progress bar_

The `QuestionPage` container at `/:surveyId/questions` is the heart of the Responder. It cycles through each question:

| Element | Role |
|---|---|
| **Progress bar** | `ProgressBar` — shows position in the survey |
| **Question prompt** | `Question` — text + optional media (image, video, audio) |
| **Answer input** | One of: `VideoRecorder`, `TextQuestion`, `MultipleChoice`, `RangeSlider`, `SliderQuestion`, `StarRating`, `FileUpload`, `ScanQuestion` |
| **Navigation** | `QuestionNav` — previous / next / submit |
| **Retry banner** | `RetryBanner` — if upload fails, retry option |
| **Status blocked** | `StatusBlocked` — if user is blocked from this survey |

### Question types

The Responder supports many question types:

| Question type | Component | What user does |
|---|---|---|
| **Video response** | `VideoQuestion` + `VideoRecorder` | Records a video answer with device camera + microphone |
| **Text** | `TextQuestion` + `Textarea` | Types a text answer (with optional rich text via Slate) |
| **Multiple choice** | `MultipleChoice` + `OptionItem` | Picks one or more pre-defined options |
| **Range slider** | `RangeSlider` | Picks a numeric range on a slider |
| **Slider** | `SliderQuestion` | Picks a single numeric value |
| **Star rating** | `StarRating` | Rates from 1-5 stars |
| **File upload** | `FileUpload` + `FileInput` | Uploads a file (image, PDF, etc.) |
| **QR / barcode scan** | `ScanQuestion` | Uses `html5-qrcode` to scan a code |
| **Number input** | `NumberInput` | Numeric value |
| **Email input** | `EmailInput` | Email with validation |
| **Rich text** | `RichTextInput` | Slate-based formatted input |

### Video recording mechanics

> 📷 _Screenshot pending: Video recording interface with countdown_

For video questions, the flow is:

1. `RequestCamera` modal asks for camera + microphone permissions.
2. `VideoRecorder` shows a live preview + record button.
3. User clicks Record; a countdown plays.
4. Recording captures via `MediaRecorder` API.
5. After stopping, `VideoUpload` chunks the file and uploads via `apollo-upload-client`.
6. `UploadProgress` shows percentage; `RetryBanner` activates if upload fails.
7. On success, advance to next question.

The recorded blob is processed by `sensemake-process-transcripts` server-side ([Cloud Functions Reference](/guide/cloud-functions)) for transcription, then by `sensemake-process-video-metrics` for engagement scoring.

---

## The submission flow

After answering all questions:

1. Final answer submits.
2. User is routed to `/:surveyId/thank-you` → `ThankYou` container.
3. `ThankYou` shows: confirmation message, reward info (if applicable), next steps.
4. Some campaigns may surface follow-up campaigns the creator is eligible for.

---

## The Previewer

> 📷 _Screenshot pending: Previewer with PreviewBar at top_

The `Previewer` at `/:surveyId/preview` is a special mode for workspace managers:

- Renders the survey EXACTLY as a creator would see it
- `PreviewBar` at the top reminds the user they're in preview mode
- Submissions are not persisted
- No reward processing
- No transcript generation (saves credits during testing)

Workspace managers use this to QA a campaign before publishing. Found via Campaigns → Preview from the Manager app.

---

## Tech stack

| Layer | Choice |
|---|---|
| **Framework** | React 18 + Vite |
| **Language** | TypeScript 5.2+ |
| **Routing** | react-router-dom v6 |
| **State** | Apollo Client + React hooks |
| **GraphQL** | apollo-upload-client (for file uploads) |
| **Auth** | Firebase Auth (4 SSO providers) |
| **Rich text** | Slate.js |
| **Drag-and-drop** | react-dnd + react-dnd-touch-backend (mobile-friendly) |
| **Video/Audio** | MediaRecorder API + OpenTok (for live interview features) |
| **Session recording** | LogRocket (for QA of user sessions) |
| **Support chat** | Intercom (via `react-use-intercom`) |
| **Build** | Vite + sass + GraphQL codegen |
| **Tests** | Vitest + Testing Library |
| **Code quality** | Husky + lint-staged + ESLint (`@batterii/eslint-config-vurvey-react`) + Prettier |

---

## Configuration

The Responder reads its config from environment variables baked at build time:

| Config | Source |
|---|---|
| Firebase config | `firebaseConfig` in `config/` |
| Flipt client token | For runtime feature flags |
| Intercom App ID | For support chat |
| LogRocket app ID | For session recording |
| API URL | The vurvey-api GraphQL endpoint |

Build modes:
- **Development** (`dev.conf.yaml`): Points at staging API, no LogRocket
- **Production** (`prod.conf.yaml`): Points at production API, full instrumentation

Nginx serves the built static files in production (see `nginx.conf` and `Dockerfile`).

---

## How it connects to the rest of Vurvey

| External component | Role |
|---|---|
| **vurvey-api** | GraphQL backend — `Me` query, `Survey` query, mutations to submit answers |
| **Firebase Auth** | User identity, session tokens |
| **GCS** | Direct upload destinations for video / file blobs |
| **sensemake-process-transcripts** | Processes video answers asynchronously (Cloud Function) |
| **sensemake-process-video-metrics** | Computes engagement metrics on videos |
| **Tremendous** | Reward payouts triggered by completion (server-side) |
| **Intercom** | Live chat support for creators |

---

## Constraints & limitations

- **Camera + microphone permissions are required for video questions.** Denying them blocks the survey.
- **Video upload size is constrained by network.** Heavy uploads on slow connections fail; retry banner handles this.
- **`MediaRecorder` API support varies by browser.** Safari historically had quirks; Chrome / Firefox are best-supported.
- **Anonymous mode availability depends on the survey.** Some campaigns require authenticated creators; some allow anonymous.
- **No offline mode.** Requires connectivity for question fetching and answer submission. Drafts may persist in localStorage but full submission requires network.
- **Preview mode skips processing.** Transcripts and reward processing don't happen in preview — useful for QA, confusing if you expect insights.
- **Slate rich-text editor has its own quirks.** Copy-pasting from Word/Google Docs may carry styling that doesn't render correctly.
- **OpenTok integration is for live interview features.** Not all surveys use it; live mode is a specific campaign feature.
- **Apple Sign In requires HTTPS.** Local dev with HTTP doesn't support Apple SSO.
- **The Responder is single-purpose.** No workflows, no AI chat, no agent management — purely for taking surveys.
- **Feature flags from Flipt may not all work in Responder.** Some flags are Manager-only; their effects in Responder are no-ops.
- **Mobile camera switching (front vs back) may need a refresh on some devices.** A persistent issue across web cameras.
- **Browser back button** during a survey can lose progress — handled gracefully but not always.

---

## Best practices (for engineers + workspace admins)

- **For surveys with video, set creator expectations on the intro.** "This will take ~10 minutes and requires camera access" prevents abandonment.
- **Test on real devices.** Camera permission flows differ between iOS Safari, Android Chrome, desktop Chrome, etc.
- **Use the Previewer before publishing.** Always.
- **For sensitive surveys, disable anonymous mode.** Anonymous responses can be lower-quality; require sign-in for important data.
- **Keep video question prompts short.** Creators have limited patience; long prompts reduce completion rates.
- **Test in incognito / private mode periodically.** Cookies, localStorage, and Firebase state can mask UX bugs.
- **Branded intros work — use them.** Default-branded surveys feel generic; custom branding via [Branding](/guide/branding) significantly improves perceived professionalism.
- **Set reasonable upload-size limits server-side.** A 100MB video on a slow connection is a bad experience.

---

## FAQ

#### What's the difference between the Responder and the Mobile App?
- **Responder** = browser-based at responder.vurvey.dev (or your custom domain). Anyone with a browser can use it.
- **Mobile App** = native iOS/Android app (Vurvey Reviews). Better camera, audio, push notifications.

Same underlying API and data. Pick whichever the creator is comfortable with.

#### Why does the Responder have 4 SSO providers but the Manager has only 2?
The Responder targets a broader audience (anyone) so it supports more providers. The Manager targets paying customers whose orgs typically standardize on Google.

#### Can I customize the branding of the Responder?
Yes — workspace-level branding (colors, logo, fonts) applies. See [Branding](/guide/branding).

#### How is the Responder hosted?
Static files behind nginx in a Docker container. Deployed via standard pipelines to staging / production.

#### Does the Responder work offline?
No. It needs connectivity for fetching questions and submitting answers. Partial drafts may survive a reconnect but not a full offline session.

#### Does the Responder use AI?
Yes, indirectly. Server-side, AI processes the responses (transcription, sentiment, insights). The Responder itself is just the capture surface.

#### Why is anonymous auth allowed?
For surveys that don't need persistent user identity — e.g. quick-pulse surveys, anonymous customer feedback. Reduces signup friction.

#### Can I record audio without video?
Yes — for audio-only campaigns, the recorder shows a microphone interface. Required permissions: microphone only.

#### What happens to my recording if I close the browser mid-survey?
Lost if not yet uploaded. The retry banner handles transient failures, but a full close-tab is final.

#### Does the Responder support live video interviews?
Yes via OpenTok integration — for campaigns configured as "live interview" type. Not all campaigns use this.

#### Can I take a survey on a mobile browser (not the app)?
Yes — the Responder is mobile-web friendly. The Mobile App is a better experience but not required.

#### Are my responses encrypted?
Yes — in transit (HTTPS) and at rest (GCS encrypted-at-rest). Plus permissions filter who can view them.

#### What's the difference between Preview and a real submission?
- **Preview**: Workspace managers test without saving data, no rewards, no processing.
- **Real submission**: Full pipeline — data saved, transcript generated, reward processed.

#### Can I cancel a submission after I've started?
You can abandon (close the browser). Once you click final-submit, the response is saved.

#### Why am I being asked to verify my email?
Firebase Auth requires email verification for Email-provider sign-ups. Sign in via Gmail/Microsoft/Apple instead to skip this.

#### What's LogRocket and why is it watching me?
LogRocket records anonymized user sessions for QA. Vurvey staff use this to debug UX issues — not for surveillance. The data is access-controlled.

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| Camera permission denied | Browser address bar → permissions → allow Camera; reload page |
| "Failed to upload" repeatedly | Network issue; switch to Wi-Fi; retry banner will auto-retry |
| Sign-in loops without success | Check `useAuthentication` Firebase state; clear cookies; try a different browser |
| Anonymous mode unavailable | Survey requires authenticated creators; sign in to proceed |
| QR scan doesn't recognize code | Lighting; code may be damaged or out of camera focus |
| Slate rich-text loses formatting | Paste-from-Word issue; paste as plain text |
| Verify-email loop persists | Resend verification; check spam folder; use SSO instead |
| Survey suddenly errors out | Check `/{surveyId}/error` page; campaign may have been archived or revoked |
| Page is blank after sign-in | Firebase token issue; sign out and re-sign-in; clear local storage |
| Previewer shows different from production | Cache; hard refresh (Cmd+Shift+R); preview reflects current campaign state, prod reflects publish-state |
| Video preview shows wrong camera | Device camera-switching button; some devices require browser permission re-prompt |
| Reward didn't arrive | Server-side Tremendous integration; talk to workspace CSM |
| Status-blocked screen | Creator was blocked from this survey by workspace admin |
| Recording cuts off early | Browser tab loses focus during recording — keep tab active; or use Mobile App for reliability |

---

## Cross-references

- [Survey-Taking Experience](/guide/survey-taking) — overview of the creator experience (UX-focused)
- [Mobile App](/guide/mobile-app) — the alternative native experience
- [Branding](/guide/branding) — customize how the Responder looks per-workspace
- [Campaigns](/guide/campaigns) — how managers create and publish the campaigns the Responder serves
- [Login & Authentication](/guide/login) — auth providers across web Manager + Responder + Mobile
- [Cloud Functions Reference](/guide/cloud-functions) — `sensemake-process-transcripts` and friends process Responder submissions
- [Permissions & Sharing](/guide/permissions-and-sharing) — who can preview vs submit
- [Rewards](/guide/rewards) — Tremendous payouts triggered by Responder submissions
- [Developer & API Reference](/guide/developer-reference) — GraphQL endpoints the Responder calls
- [Architecture](/guide/architecture) — where the Responder fits in the stack
- [Settings](/guide/settings) — workspace-level options that affect Responder behavior
- [Feature Flags Reference](/guide/feature-flags) — flags that affect Responder UX
- [Glossary](/guide/glossary) — Creator / Survey / Response definitions
