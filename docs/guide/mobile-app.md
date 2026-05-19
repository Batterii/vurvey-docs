---
title: Vurvey Reviews Mobile App
---

# Vurvey Reviews — Mobile App

Vurvey ships a **Flutter-based native mobile app** for iOS and Android — branded as "Vurvey Reviews." It's a single codebase serving two distinct user experiences: **Creator mode** for survey respondents and **Enterprise mode** for workspace managers on the go. This doc covers what the mobile app does, how the dual-mode architecture works, and the release / patch pipeline.

> 📷 _Screenshot pending: App Store / Play Store listing for Vurvey Reviews_

::: tip Repo
The mobile app lives at github.com/Batterii/vurvey-reviews-flutter as a standalone Flutter project. Released under the package name `com.vurvey.vurveyReviews` (production) and `com.vurvey.vurveyReviews.staging` (staging).
:::

---

## The two modes

The app runs in one of two distinct modes determined by `AppMode` enum at the top of `lib/enums.dart`:

| Mode | Audience | What they do in the app |
|---|---|---|
| **Creator** | Survey respondents (the 3M+ Vurvey creator network) | Receive campaign invites, record video responses, view completed campaigns, manage their profile |
| **Enterprise** | Workspace managers / Vurvey customers | View workspace dashboards, browse campaigns, interact with AI personas, manage datasets / workflows on mobile |

The same binary boots into one or the other based on the user's account type. There's no app-store fork — both modes ship in the same install.

---

## Creator mode

> 📷 _Screenshot pending: Creator mode home screen with campaign invites_

When a creator-account user opens the app, they land on the **Creator Home** screen with:

| Surface | Purpose |
|---|---|
| **Invites** | Pending campaign invites — campaigns this creator has been invited to but hasn't completed |
| **Completed campaigns** | Past campaigns this creator has responded to |
| **Profile** | Personal info, settings, profile photo |

The dropdown switcher at the top of the Creator Home (the `DropdownOption` enum — `campaigns` ↔ `completed`) flips between the two lists.

### Campaign-taking flow

When a creator taps an invite, they enter the campaign-taking flow:

> 📷 _Screenshot pending: Campaign question screen with video recorder_

The flow handles:
- Reading the question prompt
- Recording a video response via the device camera (using the `camera` package)
- Audio recording fallback when video isn't appropriate
- Skip / re-record options
- Submission with progress indicator (transcoding state: pending / failed / completed)

After submission, the response is uploaded, transcribed by `sensemake-process-transcripts`, and eventually surfaced to the campaign owner.

### Creator conversations

> 📷 _Screenshot pending: Creator conversation list / detail_

Creators can have **conversations with workspace personas** via the in-app chat. These conversations:
- Are scoped to the creator + workspace pair
- Use the same `vurvey-copilot` backend as the Manager-side chat
- Sometimes drive AI persona conversations as part of qualitative research

---

## Enterprise mode

> 📷 _Screenshot pending: Enterprise mode home dashboard_

When a Vurvey customer (workspace member) opens the app, they get a mobile-tailored version of the Manager web app:

| Surface | Mirrors |
|---|---|
| **Workspace Home** | The Vurvey Home page |
| **Workspace Campaigns** | The Campaigns area |
| **Workspace Personas** | The Agents (AiPersona) area |
| **Workspace Training Sets** | The Datasets area |
| **Workspace Workflows** | The Workflows area |
| **Workspace Persona Editor / Creator** | Persona editing |
| **Workspace Conversations** | Saved chats |
| **Dashboard** | Per-workspace analytics |

The drawer menu (`DrawerItem` enum: datasets, workflows, agents, campaigns) is the primary navigation.

### Why Enterprise mode exists

The Manager web app at staging.vurvey.dev is a heavy single-page React app — great on desktop, less great on a phone. Enterprise mode gives mobile users:
- Native scroll / gesture handling
- Push notifications (via Firebase)
- Offline-friendly cached views (via Hive local storage)
- A streamlined navigation suited to a small screen

It's not a full feature-replacement for the web app — complex features like the Workflow editor and Output Studio remain web-only.

---

## Tech stack

| Layer | Choice |
|---|---|
| **Framework** | Flutter 3.38.9 |
| **Language** | Dart, SDK 3.10+ |
| **State management** | BLoC (`bloc`, `bloc_concurrency`, `bloc_presentation`) |
| **Local storage** | Hive (encrypted key-value store) |
| **Networking** | GraphQL over HTTP/WSS to vurvey-api |
| **Auth** | Firebase Auth (Email + Google + Apple + others) |
| **Backend services** | Vurvey-api (same as web), Firestore for some realtime, Intercom for support chat |
| **Media** | `camera`, `audioplayers`, `audio_session`, custom Chewie fork |
| **OTA patching** | Shorebird (cuts App Store review for non-native fixes) |
| **CI/CD** | Codemagic (8 workflows: Production/Staging × Android/iOS × Release/Patch) |
| **Feature flags** | Flipt (per the AppConfig — note: see [Feature Flags Reference](/guide/feature-flags) for the broader Flipt-removal note) |

---

## AppConfig — environment switching

A single class `AppConfig` (lib/app_config.dart) controls which environment the app talks to:

```dart
class AppConfig {
  final String apiHost;          // vurvey-api endpoint
  final String wssApiHost;       // WebSocket endpoint
  final String responder;        // Web responder URL (deep links)
  final String managerApp;       // Manager URL (deep links)
  final String creatorApp;       // Creator portal URL
  final String brandSignUp;      // Brand signup landing
  final String intercomAppId;
  final String intercomIOSKey;
  final String intercomAndroidKey;
  final bool chatVoiceEnabled;
  final String groundingUrl;     // Retrieval/RAG endpoint
  final String fliptClientToken;
  final String fliptUrl;
  final String fliptEnvironment;
  final String creatorWorkspaceId;
  final String creatorBrandId;
  final Env env;                 // staging | production
}
```

Two main entry points:
- `main_prod.dart` — production config (production backend)
- `main.dart` — staging config (staging backend, used in TestFlight / internal builds)

Codemagic's `CM_FLUTTER_SCHEME` variable (Production / Staging) determines which entry point is built.

---

## Deep linking

The app uses the `app_links` package to handle deep links and universal links. Tapping a Vurvey link on a device with the app installed routes the user directly to:

- A specific campaign (creator mode)
- A specific workspace dashboard (enterprise mode)
- A specific conversation
- The profile / settings

URL schemes are configured per-build (production vs staging). Deep links from outside the app (email, push notification, share sheet) all funnel through the same router.

---

## Authentication flow

> 📷 _Screenshot pending: Sign-in screen with provider buttons_

Sign-in supports:
- **Email + password** (standard Firebase Auth)
- **Google** (Firebase Google OAuth)
- **Apple Sign In** (iOS — required for App Store distribution)
- (Other Firebase providers per workspace config)

After sign-in:
1. Firebase ID token obtained
2. Token sent to vurvey-api `/auth/me` to swap for a Vurvey session
3. `AppMode` determined based on user's account type (creator vs enterprise)
4. App routes to the corresponding home

Sign-up varies by mode:
- **Creator sign-up** uses the creator workspace + brand from AppConfig (`creatorWorkspaceId`, `creatorBrandId`).
- **Enterprise sign-up** requires invitation via the brand sign-up URL in the web app — the mobile app doesn't have a standalone enterprise signup.

---

## Push notifications

> 📷 _Screenshot pending: Push notification appearing on lock screen_

The mobile app receives push notifications for:

| Event | Sent to |
|---|---|
| New campaign invite | Creator users |
| Campaign response shipped | Workspace owner (enterprise users) |
| New message in conversation | All users in the conversation |
| AI workflow completed | Workflow owner |
| Reward earned (Tremendous payout) | Creator users |
| Periodic engagement reminders | Inactive creators |

Notifications are sent via Firebase Cloud Messaging (FCM), with the iOS-specific APNs token bridged through Firebase.

---

## Local storage (Hive)

The app uses **Hive** for encrypted local storage:

| What's stored | Purpose |
|---|---|
| Cached API responses | Offline-friendly viewing of recent campaigns / conversations |
| User preferences | Dropdown choices, sort orders, UI state |
| Draft responses | If a user starts a campaign and switches apps, the draft persists |
| Auth tokens | Cached Firebase / Vurvey tokens (encrypted) |

Hive is an alternative to SharedPreferences with full encryption — safer for tokens.

---

## Release pipeline

> 📷 _Screenshot pending: Codemagic build workflow status board_

The app uses **Codemagic** as its CI/CD platform. There are **8 distinct workflows** in `codemagic.yaml`:

| Workflow | Purpose |
|---|---|
| Vurvey Labs Android Production Workflow | Release build → Google Play production |
| Vurvey Labs Android Staging Workflow | Release build → Google Play internal testing track |
| Vurvey Labs Android Production Patch Workflow | OTA Shorebird patch → production |
| Vurvey Labs Android Staging Patch Workflow | OTA Shorebird patch → staging |
| Vurvey Labs iOS Production Workflow | Release build → App Store |
| Vurvey Labs iOS Staging Workflow | Release build → TestFlight |
| Vurvey Labs iOS Production Patch Workflow | OTA Shorebird patch → production |
| Vurvey Labs iOS Staging Patch Workflow | OTA Shorebird patch → staging |

Each workflow:
1. Installs Shorebird
2. Computes the next build number
3. Runs `flutter pub get`
4. Runs `flutter analyze` + `flutter test`
5. (For iOS) Sets up code signing + installs pods
6. Builds the release or patch artifact
7. Uploads to Google Play / App Store / Shorebird CDN
8. (For iOS) Prepares dSYM files for crash reporting

### Release vs Patch — when each is used

| Type | When | Speed | What changes |
|---|---|---|---|
| **Release** | New features, native code changes, breaking changes | Days (App Store review) | Full app binary |
| **Patch** (Shorebird) | Bug fixes in Dart code only, UI tweaks | Hours (instant after rollout) | Dart code only — Flutter engine + native plugins unchanged |

Shorebird patches let Vurvey ship critical fixes within hours rather than waiting for App Store review. The trade-off: only pure-Dart changes can be patched; native dependency upgrades require a full release.

---

## Platform-specific considerations

### iOS

- App Store Connect distribution
- TestFlight for staging builds
- Apple Sign In required (App Store policy when other social logins offered)
- dSYM files uploaded to Firebase Crashlytics for symbolicated crash reports
- iOS-specific Intercom key (`intercomIOSKey`)

### Android

- Google Play console distribution
- Internal test track for staging
- Android-specific Intercom key (`intercomAndroidKey`)
- `PACKAGE_NAME` varies by build flavor (com.vurvey.vurveyReviews vs `.staging`)

---

## Constraints & limitations

- **Two modes share one app binary.** Users with both creator and enterprise accounts must sign out / in to switch modes.
- **Not all Manager features have mobile equivalents.** Workflow editor, Output Studio, and complex graph views are web-only.
- **Push notifications require both Firebase + APNs (iOS) credentials.** A misconfigured FCM key silently drops notifications.
- **Shorebird patches only affect Dart code.** Native plugin updates require a full App Store release.
- **The app has its own UI design language.** Some flows look different from the web — by intent (mobile-native patterns).
- **Camera and audio permissions are required for creators.** Without them, campaign-taking is impossible.
- **Hive storage is encrypted but not unlimited.** Cached data is bounded; old caches are evicted.
- **Deep links require correct URL scheme + universal-link entitlement.** Incorrect configuration leads to "open in browser" fallback.
- **Flutter version is pinned (3.38.9).** Bumping Flutter requires testing across all 8 workflows.
- **Codemagic free-tier limits apply.** Heavy concurrent builds can hit minute caps.
- **Apple's review can reject changes.** Especially around permissions, in-app purchases, and account deletion flows.
- **Android API level minimum matters.** Older Android devices may not support all features (e.g. modern camera APIs).
- **The app uses the same vurvey-api as web.** API outages affect mobile too — there's no offline-fully-functional mode.
- **Some features are flag-gated server-side.** The mobile app respects workspace feature flags from vurvey-api, but doesn't have its own flag UI today.

---

## Best practices

- **For creator outreach, encourage app install.** Mobile-native flows are more responsive than mobile web; creators on the app have higher completion rates.
- **For enterprise users, the web is still primary.** Mobile is for monitoring and quick actions, not authoring.
- **Test on real devices, not just simulators.** Camera, audio, push notifications, and deep links behave differently on real hardware.
- **Use Shorebird patches for critical hotfixes.** It's much faster than a full App Store cycle.
- **Match server-side feature flag state to mobile capabilities.** Don't enable a flag that requires a mobile UI not yet built.
- **Verify deep links across staging and production.** They use different URL schemes; testing on the wrong scheme produces confusing failures.
- **Submit App Store / Play Store releases with detailed release notes.** The release_notes.json file is the canonical source for what's in each release.
- **For dev work, use staging mode.** Production credentials should not appear on dev devices.

---

## FAQ

#### How do I install Vurvey Reviews?
Search "Vurvey Reviews" in the App Store (iOS) or Google Play (Android). Or scan a QR code from a campaign invite email.

#### Why are there two apps in the App Store (staging + production)?
Vurvey Labs publishes both for internal testing reasons. Production users should install only the regular "Vurvey Reviews" — staging is for Vurvey employees.

#### Can I use the same account on mobile and web?
Yes. Sign in with the same credentials on both surfaces and your data syncs.

#### Can I switch from creator mode to enterprise mode in the app?
Not within a single session. You'd need to sign out and sign in with an enterprise account (or vice versa).

#### Why doesn't feature X appear in the mobile app?
Mobile is feature-tailored — not a 1:1 port. Complex authoring tools (Workflows, Output Studio, Topic Graph exploration) are web-only by design.

#### What happens if I'm offline?
Cached campaigns / conversations are viewable. Creating new content requires connectivity. Drafts of campaign responses are stored locally and uploaded when you're back online.

#### Why does the app ask for camera and audio permissions?
Required for creator video / audio responses. If denied, you can't complete most campaign questions.

#### Does the mobile app support all 17 chat tools?
The chat in the mobile app uses the same vurvey-copilot backend as the web chat, so the tools are server-side. UI for picking specific tools may be limited or absent on mobile — most invocations happen automatically.

#### What's Shorebird?
A Flutter-specific over-the-air patching service. Lets Vurvey ship Dart-code-only fixes without going through App Store review. See shorebird.dev.

#### Does the app work on tablets?
Yes — Flutter handles different screen sizes. The layout adapts to larger screens; some screens use side-by-side panels on iPad.

#### Does the app have dark mode?
Not currently — the app uses a single theme. Future versions may add this; see [Appearance & Themes](/guide/appearance-and-themes) for the web equivalent.

#### How are push notifications delivered?
FCM (Firebase Cloud Messaging) for both iOS and Android. iOS bridges via APNs internally.

#### Can I disable notifications?
Yes — at the OS level (Settings → Notifications) or in the app's Profile section.

#### How is feedback collected from app users?
Via Intercom in-app chat (`intercomAppId` + iOS/Android keys in AppConfig). Tap the help icon to start a chat.

#### What's the difference between Vurvey Reviews and the Responder web app?
- **Vurvey Reviews (this app)**: Native mobile app for both creators and enterprise users.
- **Responder web app** (responder.vurvey.com): Browser-based survey-taking UI for creators who haven't installed the app.

They use the same underlying API and produce identical data; pick whichever the creator is most comfortable with.

#### What happens to my data if I delete the app?
Local cached data (Hive storage) is removed. Your account and all server-side data persist — sign in on web or reinstall the app to access them.

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| App won't open / crashes on launch | Check the App Store / Play Store for an update; clear app cache as last resort |
| Sign-in fails with valid credentials | Firebase token may be stale; force-quit and reopen; reset password if persistent |
| Push notifications not arriving | Check OS notification permission; check Vurvey notification settings; check device's FCM token registration |
| Camera permissions denied | Settings → Vurvey Reviews → Camera (toggle on) |
| Video upload fails | Connectivity issue or file too large; retry over Wi-Fi |
| Deep link opens browser instead of app | App not installed, OR URL scheme misconfigured in the link generator |
| Workspace features missing | The feature may be mobile-unsupported; use the web app for full functionality |
| Stale data after sign-in | Pull-to-refresh on the affected screen; clear local storage in Profile settings (nuclear option) |
| Intercom chat doesn't open | `intercomAppId` may be misconfigured for your environment |
| Sign Up with Apple shows error | Apple Sign In requires iOS configuration that may not be live in staging |
| App icon shows "staging" badge | You installed the staging build by mistake; download production from the App Store |

---

## Cross-references

- [Survey-Taking Experience](/guide/survey-taking) — the web equivalent for respondents without the app
- [Account & Profile](/guide/account) — settings that sync across web and mobile
- [Home](/guide/home) — web equivalent of mobile workspace home
- [Campaigns](/guide/campaigns) — campaigns viewable on mobile
- [Conversations](/guide/conversations) — chat history syncs to mobile
- [Push notifications](#push-notifications) — anchor within this doc
- [Architecture](/guide/architecture) — where the mobile app fits in the stack
- [Cloud Functions Reference](/guide/cloud-functions) — `sensemake-process-transcripts` processes mobile-uploaded videos
- [Login & Authentication](/guide/login) — Firebase Auth providers
- [Branding](/guide/branding) — workspace branding affects mobile app theming for some elements
- [Feature Flags Reference](/guide/feature-flags) — workspace flags affect mobile experience
- [Vurvey CLI](/guide/cli) — alternate way to interact with Vurvey data, not mobile-specific
- [Glossary](/guide/glossary) — Creator / Enterprise / Campaign definitions
