---
title: Logging In
---

# Logging In

Vurvey has **two completely separate web applications**, and they have different login experiences:

| App | URL pattern | Who uses it | Code |
|---|---|---|---|
| **Vurvey Manager** | `app.vurvey.dev`, `staging.vurvey.dev`, your workspace subdomain | Researchers, workspace admins, Vurvey Labs staff | `vurvey-web-manager` |
| **Vurvey Responder** | The survey URL your respondent receives | Survey-takers, community members | `vurvey-web-responder` |

Both authenticate users via **Firebase Auth**, but the available providers, the URL routes, and the post-login destination differ significantly. This page covers both.

> 📷 _Screenshot pending: Vurvey Manager login (Google / Email)_
> 📷 _Screenshot pending: Vurvey Responder login (Google / Microsoft / Apple / Email / SSO)_
> 📷 _Screenshot pending: Email entry step_
> 📷 _Screenshot pending: Password step_
> 📷 _Screenshot pending: Verify Email screen (responder sign-up)_
> 📷 _Screenshot pending: Recover password_

::: tip Which app are you logging into?
If you're a researcher, admin, or anyone managing campaigns and agents in Vurvey, you're using the **Manager** app. If you're answering a survey or recording a video response, you're using the **Responder** app. The URL is the giveaway — Manager URLs include the workspace subdomain (e.g. `acme.vurvey.dev`), and Responder URLs are typically the campaign / survey deep-link.
:::

---

## Vurvey Manager login (researchers, admins)

### Sign-in options

Two primary methods on the initial screen:

| Method | Provider | When |
|---|---|---|
| **Sign in with Google** | Google OAuth via Firebase | Workspaces using Google Workspace identities. One-click after picking the Google account. |
| **Sign in with email** | Firebase email/password | Vurvey-specific accounts with a custom email + password. |

A **third option appears conditionally**: if your account requires SSO (e.g. your domain is configured with an SSO provider in [Super Admin → SSO Providers](/guide/admin#sso-providers-admin-sso-providers)), the app may redirect you to `/login?reason=sso-required`, which forces the **SignInLoginStep** with `ssoRequired = true` rendered first. From there, you enter your email and get redirected to your IdP (Okta, Azure AD, etc.).

### The state machine

The Manager login is driven by a `SignUpModal` reducer with these states:

| State | Renders | What you see |
|---|---|---|
| `Initial` | InitialStep (or SignInLoginStep with `ssoRequired` if the URL says so) | Google + Email buttons; T&Cs / Privacy Policy links on the Vurvey subdomain |
| `Email` | SignInLoginStep | Email input + "Next" button |
| `Password` | SignInPasswordStep | Password input + "Log In" button + "Trouble signing in?" link |
| `RecoverPassword` | RecoverPasswordStep | Email input to send a reset link |
| `CheckYourEmail` | CheckYourEmailStep | Confirmation that the reset email was sent |
| _(default)_ | SignUpStep | New-account sign-up flow |

Transitions happen via dispatched actions on the reducer; URL params can pre-set state (e.g. `?reason=sso-required`).

::: tip On-subdomain branding
The `isOnVurveySubdomain` flag controls whether Terms & Conditions and Privacy Policy links render on the Initial screen. The check is satisfied when the host matches a Vurvey-owned subdomain (`*.vurvey.dev`, `*.vurvey.ai`). Embedded surfaces (e.g. workspace-custom domains during white-labeling) skip the bottom section.
:::

### Forgot password (Manager)

1. Click **Sign in with email**.
2. Type your email, click **Next**.
3. On the password screen, click **Trouble signing in?**.
4. Enter your email on the Recover Password screen and submit.
5. You'll see the Check Your Email screen.
6. Open the email from Vurvey and follow the reset link (token is single-use, expires after a window).
7. Set a new password and return to login.

If you don't receive the email, check spam first. Then ask a Workspace Owner to confirm your email matches the one used to invite you — typos in invitations break reset emails too.

---

## Vurvey Responder login (survey-takers)

The Responder app has a **five-provider** sign-in surface (versus the Manager's two). The provider menu is intentionally wide because respondents come from anywhere on the open web.

### Sign-in options (Initial / Sign-up entry)

The Initial screen on the Responder app shows five buttons in this order:

| Button | Provider | Use when |
|---|---|---|
| **Sign up with Google** | Google OAuth | Personal Gmail or Google Workspace |
| **Sign up with Microsoft** | Microsoft OAuth | Outlook.com or Microsoft 365 |
| **Sign up with Apple** | Sign in with Apple | iCloud-anchored identity (iPhone users especially) |
| **Sign up with email** | Firebase email/password | Manual sign-up with any email + a password |
| **Sign up with SSO** | Workspace SSO | Branded community memberships with enterprise SSO |

Below the buttons:

- **"Already have an account? Login here"** link → routes to `/login/choose-method` (the existing-account flow described below). Preserves the URL search string so the survey context survives.
- Vurvey's Terms & Conditions and Privacy Policy links.

The Initial screen also shows a hero image and the marketing phrase: _"It's like private TikTok directly with brands."_

### Choose Login Method (existing accounts)

When a respondent who already has an account hits the "Login here" link or lands at `/login/choose-method`, they see the same five providers in **login** orientation (button labels say _"Log in with X"_ instead of _"Sign up with X"_). The header above the buttons reads **Log in**.

The email button passes `?isLogin=true` so the next step renders the existing-account login UI, not the sign-up form.

### Responder route tree

The full responder login tree, all under `/login/*`:

| Route | Container | Purpose |
|---|---|---|
| `/` (root) | Initial | Sign-up entry. Includes "Login here" link to choose-method. |
| `/login/choose-login-method` | ChooseLoginMethod | Existing-account log-in chooser (same 5 providers). |
| `/login/email` | Email | Type your email; the app calls `fetchSignInMethodsForEmail` to figure out which provider you used. |
| `/login/password` | Password | Type your password. Handles Firebase `auth/wrong-password` and `auth/too-many-requests`. |
| `/login/check-email` | CheckEmail | Confirmation that an email link was sent (sign-up or recover). |
| `/login/verify-email` | VerifyEmail | Sign-up post-create screen. Polls every 3 seconds for `user.emailVerified`; on verify, fires analytics events and reloads. |
| `/login/recover-password` | RecoverPassword | Send a password reset email. |
| `/login/create` | Create | Set name / password during sign-up. |
| `/login/redirect` | Redirect | Post-login handoff page; routes the user back to their survey or the appropriate post-login destination. |

### Smart email-step routing

After you type your email on `/login/email`, the responder app calls **`fetchSignInMethodsForEmail(auth, email)`** (Firebase SDK) and routes you intelligently:

| `signInMethods[]` returned | What the UI does |
|---|---|
| Includes `password` | Routes to `/login/password` for the password step |
| First entry is `google.com` | Toast: _"You already have an account. Please log in with Google."_ — bounces to `/login` |
| First entry is `microsoft.com` | Toast: _"You already have an account. Please log in with Microsoft."_ — bounces to `/login` |
| Apple-anchored identity | Similar toast routing to Apple |
| Empty array | New account — proceed to the sign-up flow |

This is why typing an email registered to Google and then entering a password doesn't "just work" — Firebase knows which provider your account is linked to, and the UI redirects you to the right one.

### Linking providers

If you signed up with email + password but later want to also use Google (or Microsoft, etc.), the password step has a **`connectNewProvider`** helper. It calls `linkWithCredential(user, firebaseCredentials)` to attach the new provider to your existing Firebase user. After linking, the redirect target is `/${surveyId}${location.search}` — i.e. back to the survey you were trying to take.

### Survey context preservation

The single most important UX consideration on the responder side: **the user came from a survey link**, and they need to land back there after login.

The app stores `surveyId` in `localStorage` on initial landing, then uses it post-login to redirect to `/${surveyId}{location.search}`. The `location.search` carries any campaign-specific URL params (like the response-link token), so the deep link survives the auth detour.

### Verify Email loop

After email sign-up, the responder app shows a **VerifyEmail** screen with copy: _"Please check your email and verify your account."_ Then it sets a 3-second polling interval:

```ts
const interval = setInterval(() => {
  user.reload().then(() => {
    if (user.emailVerified) {
      clearInterval(interval);
      sendAnalyticsEvent("complete_registration", SIGNUP_METHODS.EMAIL);
      sendAnalyticsEvent("login", SIGNUP_METHODS.EMAIL);
      updateToast({type: "success", description: "Your email has been verified. Thank you for signing up!"});
      window.location.reload();
    }
  });
}, 3000);
```

When you click the verification link in the email, the next 3-second tick picks it up automatically — no manual refresh required. Two Google Analytics events fire on verify: `complete_registration` and `login`, both tagged with `SIGNUP_METHODS.EMAIL`.

A **Resend verification email** button is available if the first one didn't arrive.

---

## Browser requirements (both apps)

| Feature | Minimum requirement |
|---|---|
| **Browser** | Chrome 90+, Edge 90+, Firefox 88+, Safari 14+ |
| **JavaScript** | Required (Firebase Auth uses it for OAuth flows) |
| **Cookies** | Required (session persistence) |
| **Camera/Microphone** | Required for video recording in campaigns (responder side) |
| **Pop-ups** | Allow on the Vurvey domain — OAuth providers (Google/Microsoft/Apple) often use popups for consent |
| **Local Storage** | Required (responder uses it for `surveyId` continuity) |

::: tip Pop-up blockers and OAuth
The Google/Microsoft/Apple OAuth flows use windowed pop-ups on desktop browsers. If your browser blocks them, the flow appears to "do nothing" — the popup never opens. Whitelist the Vurvey domain.
:::

---

## Constraints & limitations

- **Manager has 2 providers, Responder has 5.** Don't promise Microsoft or Apple sign-in for the Manager app — only Google and Email are wired up there. SSO appears in the Manager only when redirected with `?reason=sso-required`.
- **The two apps share Firebase but have separate user records contexts.** A respondent who created their Vurvey account answering surveys cannot use that same account to log into the Manager app for a different organization without being invited there explicitly.
- **Pop-up-based OAuth fails silently** when pop-ups are blocked. The user clicks the button, nothing happens, and there's no in-page error — just a console message.
- **`fetchSignInMethodsForEmail`** is the routing source-of-truth. If your account is linked to Google but you try to enter a password, you'll be told to use Google. There's no "use any method" override.
- **Firebase rate-limiting kicks in after too many wrong passwords.** `auth/too-many-requests` locks the account temporarily — only resetting the password restores access. Refreshing or trying another browser doesn't help.
- **Reset emails can land in spam** for some corporate filters. Check spam, then add the sender to the safe list.
- **The `surveyId` localStorage continuity is responder-only.** Manager users always land on Home post-login.
- **VerifyEmail polling stops on page navigation.** If you click away to check your email in another tab and come back to the Verify Email tab, the polling already restarted via React mount. Fine.
- **The Initial step's T&C section only renders on Vurvey-owned subdomains.** White-labeled sign-in (custom domains) intentionally hides the branding.

---

## Best practices

- **For workspace admins**: encourage users to set up Google Workspace SSO instead of password accounts. Less password hygiene, better revocation story when someone leaves.
- **For community managers**: encourage respondents to use the same provider they originally signed up with. Linking providers afterwards is possible but adds friction.
- **For onboarding new respondents**: design the survey landing page with the assumption that the user will land back at the same URL after login. Test with a fresh browser to catch broken survey-context links.
- **For password-only accounts**: rotate passwords every few months and enable 2FA at the email provider level. Firebase doesn't do 2FA itself, but your email provider does.
- **For SSO setup**: configure SSO via [Super Admin → SSO Providers](/guide/admin#sso-providers-admin-sso-providers) AND map the SSO domain so the `?reason=sso-required` redirect kicks in for users with that email domain.
- **For browser issues**: keep Chrome updated and use a clean profile when troubleshooting OAuth flows. Extension interference is the most common cause of pop-up failures.

---

## FAQ

#### Why doesn't the Manager app offer Microsoft or Apple sign-in?
The Manager app's intended audience is researchers and admins, typically inside Google Workspace organizations. Microsoft/Apple were added on the Responder side because survey respondents come from anywhere on the open web. If you need Microsoft for your team's Manager logins, talk to your CSM — typically a Microsoft-anchored team uses SSO via Azure AD instead, which the Manager does support.

#### What's `fetchSignInMethodsForEmail` doing on the email step?
It asks Firebase what auth methods exist for the email you typed. If the answer is "this email is linked to Google", the UI tells you to use Google instead of asking for a password it can't verify. This prevents the confusing "wrong password" loop on accounts that never had a password.

#### Why am I getting `auth/too-many-requests`?
Firebase rate-limits failed password attempts. After several wrong passwords in a short window, the account is **temporarily** locked. The lock clears once you reset your password — refreshing the page or trying another browser will not help (the lock is on the Firebase account, not your browser).

#### Why does my browser say "popup blocked" when I click Sign in with Google?
Your browser's popup blocker. Add the Vurvey domain to your allow-list, or temporarily disable the blocker.

#### What if I want to switch from email to Google later?
You can. Sign in with your existing email+password account first. Then trigger an OAuth flow (the password step will call `linkWithCredential` to attach the OAuth provider to your existing user). Future logins can use either method.

#### Why does the Verify Email page sometimes work without me refreshing?
The page polls every 3 seconds for `user.emailVerified`. When you click the link in your email, the next tick picks up the change and auto-reloads the app. You don't need to come back to the tab manually — but going back is fine, the polling resumes on mount.

#### Why is my survey context lost after login?
Either you cleared localStorage (the `surveyId` is stored there), or you navigated away from the survey URL before logging in. Re-open the survey link and try again — the URL stores the survey ID, and the login flow restores it from there.

#### How do I sign in if SSO is required but I'm not in the corporate network?
Most SSO providers (Okta, Azure AD, Google Workspace) work outside the corporate network, but may require MFA. Check that you can authenticate to your IdP standalone (open Okta directly, sign in there) — if that works, Vurvey's SSO should too. If your IdP requires a VPN, you'll need to be on the VPN.

#### Why does the Vurvey URL change after I sign in?
The Responder app redirects to `/${surveyId}`. The Manager app redirects to the workspace home. The URL change reflects the post-login destination.

#### Can I be signed in to multiple workspaces simultaneously?
Yes. The workspace selector at the bottom of the left sidebar switches active workspace. Your auth session is workspace-agnostic; only the active workspace context changes.

#### What happens if I sign in to the wrong workspace?
Switch workspaces using the selector at the bottom of the sidebar. No need to log out; your auth carries between workspaces you belong to.

#### Will my browser remember me?
Yes, by default — Firebase persists the session via cookies. If you check "remember me" (when offered) or just don't sign out, you stay logged in until the session expires (controlled by workspace `forceLogout` / `forceLogoutPeriodMin` settings; see [Settings → Session Timeout](/guide/settings#1-session-timeout)).

#### Why does signing out of Google also sign me out of Vurvey?
Because Vurvey's Google sign-in uses Google as the identity provider — when your Google session ends, the OAuth token Vurvey holds becomes invalid. Refreshing should re-authenticate if you're still signed into Google; otherwise sign back in to Google first.

#### Is there a difference between staging and production logins?
Same flow, different Firebase project and URL (`staging.vurvey.dev` vs `app.vurvey.dev`). Accounts on staging are NOT the same as accounts on production — staging is a separate identity pool for testing.

#### What if I get "No workspace found"?
You weren't invited to a workspace yet. Ask your administrator to send an invitation. If you _were_ invited but still see this, try signing out and back in — the workspace list refreshes on auth.

---

## Troubleshooting

| Symptom | What to check |
|---|---|
| Click Sign in with Google → nothing happens | Pop-up blocker. Whitelist the Vurvey domain. |
| "auth/wrong-password" error | Caps Lock, recently-changed password, or you used Google/Apple originally and never set a password. |
| "auth/too-many-requests" | Account is rate-limited. Only a password reset clears it; refreshing won't. |
| Reset email never arrives | Spam folder, then check that the email matches the one on file. If still missing, your IT may block Vurvey's sending domain — ask them to allow it. |
| Login worked but page is blank | Possible workspace-loading error. Refresh; if persistent, switch workspaces (sidebar) — your default workspace may be in a bad state. |
| Survey URL took me to login and now I'm on Home | The `surveyId` localStorage was wiped (private browsing, cache clear). Re-open the original survey URL. |
| "You already have an account. Please log in with Google" | Firebase has you linked to Google. Click the Google button instead of using email. To consolidate, sign in with Google, then link email via your profile (advanced). |
| Verify Email page loops without verifying | The verification link in the email may be stale. Resend the email; click the new link. |
| Microsoft / Apple buttons missing | You're on the Manager app — those providers are responder-only. Use Google or Email. |
| SSO redirects me but I can't authenticate | Most common: corporate SSO requires VPN, or your account is disabled at the IdP. Confirm IdP login works standalone first. |
| Pop-up worked but no provider selection appeared | Multiple windows opened in different orders. Close them and retry. Firefox occasionally orphans the OAuth window. |
| "Trouble signing in?" link missing | You're on the email step, not the password step. Type a valid email and click Next first. |
| Different login screen than expected | Confirm you're at the right URL — `app.vurvey.dev` (Manager) vs your responder URL. The two flows look noticeably different. |

---

## Mobile access

The Manager app's web interface works on mobile but is **optimized for desktop**. Building agents, designing workflows, and configuring campaigns are awkward on a phone screen — use a laptop for those.

The Responder side is mobile-first by design — community respondents typically record video answers from a phone. The dedicated Vurvey mobile app (iOS / Android) provides a richer recording experience but the web responder works fine for most flows.

---

## Related guides

- [Account & Profile](/guide/account) — where to manage your profile after signing in
- [Settings → Session Timeout](/guide/settings#1-session-timeout) — workspace-wide session policy
- [Super Admin → SSO Providers](/guide/admin#sso-providers-admin-sso-providers) — where SSO providers are configured
- [Permissions & Sharing](/guide/permissions-and-sharing) — workspace roles and per-resource sharing once you're in
- [Home](/guide/home) — where the Manager app lands you post-login
- [Settings → Enforce SSO](/guide/settings#5-enforce-sso-conditional) — workspace option to require SSO for all members
- [Campaigns](/guide/campaigns) — what respondents end up doing after the Responder login
