# ScoreWise — Consumer App

Borrower-facing mobile app where M-Pesa users view their own credit score, manage
lender consent, and (until Daraja is live) upload statements manually.

**This is one of two ScoreWise apps.** The other is a B2B lender dashboard
(sidebar nav, applicant tables, underwriting tools — see
`mockups/b2b-dashboard-token-reference.html`), built in a separate session against
the same backend. Do not build or reference its screens here. The two apps *do*
share: the design token system, the FastAPI backend, and the `SignalBreakdownRow`
component (used here on the Home screen, used there on the applicant-detail view).

## Reference assets (provenance matters — read before styling anything)

No single "all-screens" mockup exists yet. What we actually have, in order of trust:

1. **`mockups/b2b-dashboard-token-reference.html`** — real ScoreWise HTML/CSS
   (the B2B dashboard). Not a consumer screen, but it's the only file with exact
   hex values, so it is the **authoritative source for design tokens** (colors,
   radius, fonts, the filled-pill convention). Also confirms the circular
   arc-gauge pattern (`Approval rate` widget) as a real component in this design
   system.
2. **`mockups/consumer-home-snippet.html`** — real consumer Home/score screen
   markup. Authoritative for **layout, copy, and spacing** of that screen. Two of
   its visual details are superseded by decision (see below): it renders
   signal rows as flat bars with plain colored text, but we're building them as
   ring + filled pill per the written brief and the gauge pattern confirmed in
   file #1.
3. **Leafboard reference screenshot** (provided in chat, not saved as a file) —
   structural/mood reference for the splash screen ONLY: dark hero shape behind
   a circular badge, single accent color, pill-shaped primary CTA, wordmark below
   the hero. **Its green accent and copy are not ours** — render the ScoreWise
   hero in violet (#4a3fb8), not green. Sign-up/login screen layout (logo,
   tagline, email field, password field with visibility toggle, disabled→enabled
   primary button, "or" divider, social buttons) is also taken from this
   reference.
4. **Shopeers dashboard screenshot** (provided in chat) — secondary style/mood
   inspiration, mainly relevant to the B2B app. For the consumer app, the one
   applicable takeaway is the "Repeat Customer Rate" circular gauge (ring +
   center number + subtitle), which further confirms the ring/donut decision
   below. Its shadowed cards and colorful icon chips are NOT ours — ScoreWise
   cards have no drop shadow (see tokens).

**Screens 1, 4, 5, 6 (splash, consent, statement upload, active requests) have no
direct mockup.** They're built from the written brief + these tokens, and should
be treated as interpreted, not pixel-matched, until real mockups exist for them.

## Decisions made this session (previously open questions)

- **Ring vs. flat bar for signal breakdown:** ring/donut (SVG), per the written
  brief. Confirmed by the arc-gauge pattern in both reference screenshots/files.
  The one snippet showing flat bars predates this decision.
- **Status pill vs. plain colored text:** always a filled pill (light background
  + solid-color text), per the written brief. Confirmed by `.up`/`.down` in the
  B2B token file, which use exactly this pattern (`--green-light` bg + `--green`
  text).
- **Splash hero accent color:** violet, not Leafboard's green. Leafboard is a
  layout/mood reference only.
- **Social auth:** include Google/Apple buttons in the UI (matches the reference
  layout), wired to a disabled/no-op handler for now.

## Design tokens

Extracted from `mockups/b2b-dashboard-token-reference.html`, confirmed against
the written brief:

```
color-page:            #f2f1ec
color-surface:          #ffffff
color-border:           #e6e3da
text-primary:           #17181c
text-secondary:         #74736a
text-muted:             #a6a498

accent-violet:          #4a3fb8   /* primary buttons, active states only */
accent-violet-light:    #ece9fb   /* violet pill backgrounds */

status-green:           #17794f
status-green-light:     #e2f2e9
status-amber:           #b3760f
status-amber-light:     #faf0dc
status-coral:           #c1502e
status-coral-light:     #fbe9e2

radius-card:            16px      (brief says 12-16px, file uses 16px flat — use 16px)
border-width:           1px

font-body:              Inter (400/500/600)
font-numeric:           Space Grotesk (500/600) — scores, big numbers, table numerals only
```

Rules carried over from the brief, unaffected by the mockups:
- No drop shadows, ever.
- Sentence case everywhere, no all-caps labels.
- Status is always background + text color together, never color-only text.
- Violet is for primary actions and active/selected states only — not decoration.

## Folder structure

```
scorewise-consumer/
  CLAUDE.md
  mockups/                          # reference only, not shipped
    b2b-dashboard-token-reference.html
    consumer-home-snippet.html
  frontend/
    src/
      theme/
        tokens.ts                   # the values above, typed
        typography.ts
      components/                   # primitives + shared composites
        Button/
        TextField/                  # email/password, show/hide toggle, states
        Card/
        StatusPill/                 # green/amber/coral filled pill
        RingProgress/                # bare SVG donut, no label — used by SignalBreakdownRow
        SignalBreakdownRow/          # RingProgress + label + explanation + StatusPill
        ExpiryBadge/                 # countdown chip — consent + active requests
        BottomNav/
        FileUploadField/             # PDF + password, "processed and discarded" note
        PinKeypad/                   # numeric keypad + dots — shared by PinSetup and PinEntry
        FingerprintIcon.tsx
        Logo.tsx                     # violet mark + brain glyph — the app icon, everywhere
        BottomSheet/                 # generic slide-up sheet, used by Home's signal detail view
      routes/
        RequireUnlocked.tsx          # real route guard, not just Splash's initial redirect
      lib/
        session.ts                   # account/PIN/biometric state — see security note below
      screens/
        Splash/                      # brief branded screen, decides where "/" routes to
        Onboarding/
        Auth/
          SignUp.tsx
          Login.tsx
        Terms/                       # consent screen — see the honesty note below before trusting the content
        PinSetup/                    # create -> confirm -> optional biometric enrollment
        PinEntry/                    # unlock screen for returning sessions
        Home/
        ConsentRequest/
        StatementUpload/             # also renders the name-mismatch screen inline
        TransactionReview/           # "is this a loan repayment?" — one card per ambiguous counterparty
        ActiveRequests/
      api/
        client.ts                   # fetch wrapper + base URL (localhost:8000)
        score.ts                    # GET /v1/score
        statements.ts                # POST /v1/statements/upload, POST /v1/statements/:id/classify
        consent.ts                  # GET /v1/consent, POST /v1/consent/respond
        requests.ts                 # GET /v1/requests, POST /v1/requests/:id/revoke
      navigation/
      hooks/
      utils/
    package.json
```

The backend is real now, not a future placeholder: `../scorewise-backend`
(FastAPI, run separately on `localhost:8000`). See its CLAUDE.md for what it
actually does and its known limits (in-memory store, unverified PDF parser).

## Shared components (build once, reuse)

1. **`RingProgress`** — bare SVG arc, props: `value` (0-100), `size`, `strokeWidth`,
   `color`. No label, no text. Pure visual primitive.
2. **`StatusPill`** — props: `status: 'strong' | 'moderate' | 'risk'`, `label`.
   Maps status to the green/amber/coral token pair.
3. **`SignalBreakdownRow`** — the cross-app shared component. Props: `value`,
   `label`, `explanation`, `status`. Composed from `RingProgress` + `StatusPill`.
   Build it standalone (its own folder, no screen-specific styling leaking in)
   since the B2B session will need to consume the same component or port it.
4. **`ExpiryBadge`** — countdown chip, props: `expiresAt`. Used on Consent
   Request (single expiry) and Active Requests (per-row expiry).
5. **`Button`** — pill-shaped, `variant: 'primary' | 'secondary' | 'social'`,
   disabled state per the sign-up flow.
6. **`TextField`** — email/password variants, visibility toggle, error state.
7. **`Card`** — white surface, 1px border, 16px radius, no shadow.
8. **`BottomNav`** — 4-icon tab bar, seen on Home screen.
9. **`FileUploadField`** — PDF drop/select + password input, inline note that
   the file is processed and discarded, not stored.

## Build order

1. ~~Plan (this document)~~ — done.
2. ~~`theme/tokens.ts` + `typography.ts`~~ — done.
3. ~~Primitives: `Button`, `TextField`, `Card`, `StatusPill`, `RingProgress`~~ — done.
4. ~~`SignalBreakdownRow`~~ — done, composed from `RingProgress` + `StatusPill`.
5. ~~Splash/Onboarding + Sign up/Login screens~~ — done (`react-router-dom` added).
   Onboarding has the dark scoop hero + violet ring badge; SignUp/Login share
   `AuthForm` (email/password, disabled→enabled Continue, Google/Apple stubs
   that just proceed like the real submit, since there's no OAuth yet).
6. ~~Home/score screen~~ — done. Real scoring, not hardcoded: `lib/scoring.ts`
   computes score + signal breakdown + a rule-based tip from mock statement
   metrics (`mocks/statementMetrics.ts`), verified in-browser against the math.
   `BottomNav` also built (home/trend/requests/profile tabs); `/trend` and
   `/profile` are honest placeholders, not built.
7. ~~Consent Request + Active Requests~~ — done, share `RequestsContext` +
   `ExpiryBadge`. Allow/Deny and Revoke are real state changes, verified
   in-browser (grant added on Allow, removed on Revoke, live countdown).
   `/requests` has a "simulate an incoming request" demo trigger since there's
   no real push mechanism from a lender yet.
8. ~~Statement Upload~~ — done, and genuinely wired now (see step 10). Real
   file POST, real backend parsing, real errors surfaced in the UI (bad PDF,
   wrong password) instead of a simulated delay + fake success.
9. ~~`api/score.ts`, `api/consent.ts`, `api/requests.ts`~~ — done, now calling
   the real backend at `http://localhost:8000` (see `../scorewise-backend`)
   instead of local mock logic. `RequestsContext` lost `addGrant` — approval
   now happens server-side via `respondToConsent()`, and the context just
   `refresh()`es after.
10. ~~Integration pass~~ — done for the consumer app's three endpoints
    (`/v1/score`, `/v1/consent`, `/v1/requests`) plus a fourth that wasn't in
    the original plan but turned out to be the important one:
    `/v1/statements/upload`, which does real M-Pesa statement PDF parsing.
    Verified in-browser: uploading a real (synthetic) statement changes the
    score from 746 to 737 with correctly recalculated signals; uploading
    garbage shows a real error instead of crashing or faking success. See
    `../scorewise-backend/CLAUDE.md` for what the parser can and can't
    actually do yet — it has not been tested against a real Safaricom export.
    Accessibility pass (tap targets, contrast on status pills) still open.

~~Auth is fully mocked~~ — **done, see step 28**: `AuthForm`'s Continue/Log in
now call the real backend (`api/auth.ts`), which brokers real Supabase Auth
sessions as httpOnly cookies. Kept here as a marker of what this section used
to say, since several later steps' wording ("mocked auth flow", "no session
yet") predates step 28 and is now stale — treat step 28 as the correction.

11. ~~Ambiguous transaction review~~ — done. When the backend can't confidently
    classify some Pay Bill/Business Payment transactions (generic bank
    paybills — Equity, KCB, NCBA, etc.), upload returns `needs_review` instead
    of a score; `TransactionReview` shows one card per counterparty ("N
    payments, KES total") with a Loan repayment / Not a loan choice, then
    submits to `/v1/statements/:id/classify` for the final score. See the
    backend's CLAUDE.md for exactly what does and doesn't get asked about —
    it's deliberately narrow (9 real groups, not the 63 an unfiltered version
    produced).
12. ~~Account name verification~~ — done. First statement upload registers the
    account's name (from the statement's "Customer Name" field); later
    uploads with a different name are rejected with a dedicated screen (not a
    plain error) offering "upload a different statement" or "go back". Skipped
    entirely for statements with no name field to check against.
13. ~~Splash + PIN + biometric unlock~~ — done. `Splash` (`/`) is a brief
    branded screen that decides where to route based on `lib/session.ts`
    state: no account → Onboarding, account but no PIN → PinSetup, PIN set
    but locked → PinEntry, unlocked → Home. `PinSetup` runs after any
    successful (mocked) sign up or log in: create PIN → confirm PIN → if the
    device has a platform authenticator (checked via real WebAuthn
    `isUserVerifyingPlatformAuthenticatorAvailable()`, not a guess), offers to
    enroll Face ID/Touch ID/Windows Hello. `PinEntry` is the unlock screen —
    auto-prompts biometric immediately if enrolled, falls back to the PIN
    keypad, shows real "Incorrect PIN" errors, has a "Forgot PIN? Reset
    account" escape hatch for this prototype. `RequireUnlocked` wraps every
    protected route (Home, Consent, Requests, Statement Upload/Review,
    Profile) and re-checks lock state on *every* render — this matters
    because Splash only decides where "/" goes once, on initial load; without
    the wrapper, navigating straight to `/home` via the URL bar, a bookmark,
    or the browser back button after locking would bypass the PIN entirely.
    Found and fixed during review, verified live (fresh tab, no unlock flag →
    correctly redirected instead of showing the dashboard).

    **Security note, not just a caveat:** this is a UI/UX prototype of the
    lock flow, not a secure implementation. The PIN itself is stored in
    `localStorage` in plain text (`lib/session.ts`) — script-readable, and
    not how a real app should ever persist a PIN. A real implementation
    verifies the PIN server-side (or via platform secure storage) and never
    persists it like this. Similarly, the biometric enrollment/verification
    calls are genuine WebAuthn (the real OS Face ID/Touch ID/Windows Hello
    prompt actually appears), but there is no backend issuing challenges or
    verifying the signature — it proves the *interaction* works, not that
    it's cryptographically secure end to end. Wiring real verification is a
    backend task for whenever `../scorewise-backend` has auth.

    **Update — PIN lockout added** (see the backend's CLAUDE.md "Security"
    section for the full picture, including why this and not hashing):
    `PinEntry` now enforces an escalating lockout after repeated wrong PINs
    (15s after 3, 60s after 5, 5min after 8 — `getPinLockoutRemainingMs` /
    `recordPinFailure` / `clearPinFailures` in `lib/session.ts`), with the
    keypad visibly disabled and a live countdown during lockout. Verified
    live: 3 wrong PINs triggers the lockout banner and greys out the keypad;
    it correctly re-enables once the timer hits zero, and the correct PIN
    still unlocks normally afterward. This is a real, meaningful control
    against someone picking up an unlocked device and guessing (mirrors
    iOS/Android's own on-device lockout) — it is deliberately *not* paired
    with client-side PIN hashing, because a 4-digit PIN's keyspace (10,000
    values) is trivial to brute-force offline the moment an attacker can
    read the hash, so hashing it in `localStorage` would look like a fix
    without being one. Real PIN security still requires server-side
    verification, which needs the backend's real auth.

14. ~~Registration includes statement upload~~ — done. Sign up now goes
    Terms → Statement Upload → (Transaction Review if needed) → PinSetup →
    Home, instead of straight to PinSetup. Log in is unaffected (still
    `hasPin() ? /pin-entry : /pin-setup`). `StatementUpload` and
    `TransactionReview` detect which context they're in via `!hasPin()`
    (`isRegistrationStep`) and route to `/pin-setup` vs `/home` accordingly,
    and the upload screen shows a "Skip for now — use a demo score" link only
    during registration. Verified live end-to-end with the real (password-
    protected) statement: sign up → terms → upload → answer the 9 ambiguous
    groups → PIN setup → Home showing the real computed score (626), not a
    placeholder.

    **Bug found and fixed during this**: `/statement-upload` and
    `/statement-review` were wrapped in the strict `RequireUnlocked` guard
    from the PIN work, which redirects to `/onboarding` whenever
    `!hasAccount()` — correct for Home, wrong here, since during registration
    there legitimately *is* no account yet. It sent brand-new signups straight
    back to the start the moment they hit Continue on Terms. Added
    `RequireUnlockedOrRegistering` (`routes/RequireUnlocked.tsx`) for these
    two routes specifically: it only blocks a *locked* existing account, not
    someone still mid-registration.

15. ~~Brain logo~~ — done. `components/Logo.tsx`, a violet rounded-square with
    a simple white brain glyph, used everywhere the plain violet mark used to
    appear: Splash, Onboarding's hero badge, the Auth screens' header, Home's
    topbar, PinEntry. One component, one place to change the mark later.

16. ~~Terms & Conditions / consent screen~~ — done, `screens/Terms/`, shown
    once during sign up (checkbox + Continue, disabled until checked) before
    Statement Upload. **Read `termsContent.ts`'s own header comment before
    treating this as real legal protection** — the content is placeholder
    copy modeled on typical fintech T&Cs (score is an estimate not an
    official credit score, not financial advice, data handling, limitation of
    liability, user responsibilities, governing law), written by an AI, not a
    lawyer, and not reviewed by one. A prominent in-app notice says exactly
    this. Before this covers real legal liability — which matters here, since
    the app processes real financial data and Kenya has specific data
    protection law (the Data Protection Act 2019) — it needs actual review by
    a qualified attorney, not further editing of this file.

17. ~~Per-signal detail + recommendation~~ — done. Each `what's shaping this`
    row on Home is now a button; tapping it opens `components/BottomSheet`
    with that signal's ring, status pill, explanation ("what this means"),
    and a new per-signal `recommendation` field. Deliberately **not** AI —
    `scoring.py`'s `_REPAYMENT_RECOMMENDATIONS` / `_FULIZA_RECOMMENDATIONS` /
    `_SAVINGS_RECOMMENDATIONS` are lookup tables keyed by status, since three
    signals × three statuses is nine fixed combinations. An LLM would add
    cost, latency, and non-determinism for a problem this small; reconsider
    only if recommendations need to reference specifics a template can't
    phrase well (e.g. naming the actual lender). `lib/scoring.ts` mirrors this
    per the "keep both in sync" rule, though it's still dead code behind the
    API. `SignalBreakdownRow` itself stays untouched (still just
    value/label/explanation/status) — the click-to-open behavior lives in
    `Home.tsx`, not the shared component, since B2B will likely want
    different behavior on click, if any.

18. ~~Real profile name display~~ — bug fix. The backend correctly captured
    the statement's name all along (`store.account_name`), but nothing ever
    displayed it — Home hardcoded "Good afternoon, John" / avatar "JK". Added
    `GET/PUT /v1/profile` (`store.profile_name` — deliberately **separate**
    from `account_name`: renaming your profile must not change what future
    statement uploads are checked against). Home and the new Profile screen
    now both read it. Verified live with the real statement (shows "Eddy" /
    "EW"), and verified editing the profile name via the UI updates
    `profile_name` without touching `account_name`.

    **While chasing an apparent regression here, found a real testing gotcha
    worth recording**: creating or deleting a debug script *inside*
    `scorewise-backend/` while the server runs with `--reload` triggers
    WatchFiles and restarts the worker, wiping all in-memory state (back to
    `name: null`, defaults, etc.). Looked exactly like a data bug until traced
    to the reload log. Put ad-hoc debug scripts in the OS temp dir instead,
    reading backend files by absolute path — never inside this repo, even
    temporarily, while the server is running.

19. ~~Profile section~~ — done: editable name (see above), light/dark theme
    toggle (`lib/theme.ts`, `data-theme` attribute + a dark override block in
    `global.css` — translucent tints for the "-light" tokens instead of the
    light palette's opaque pastels, which looked chalky on dark), and two
    sub-screens reached from Profile: `About` (version, description, and a
    "Recognized lenders" list — worded as classifier-recognized names, not
    fabricated partnerships, since none exist) and `PrivacySecurity` (Change
    PIN, Face ID/Touch ID toggle — added `disableBiometric()` to
    `lib/session.ts` since only enroll existed before, Update my statement,
    Lenders with access, Terms & Conditions in a new **view-only** mode
    (`Terms` now reads `location.state.viewOnly` to swap the checkbox/Continue
    footer for a plain Close button), and Reset account — moved here from the
    old flat Profile page).

20. ~~Removed Trend tab~~ — done. `BottomNav` is down to Home/Requests/Profile;
    deleted the now-fully-unused `TrendIcon` and `screens/Placeholder.tsx`
    (nothing else referenced it once Profile got a real screen).

21. ~~Removed "No Daraja yet?" link, added page transitions~~ — done. The
    Home screen link is gone (screen upload access now lives in Privacy &
    Security, a better fit than a stray link). Route changes now play a
    CSS-only fade/slide-up (`components/PageTransition.module.css`, honors
    `prefers-reduced-motion`) — `App.tsx`'s `AnimatedRoutes` keys a wrapper div
    on `location.pathname` so it remounts (and replays the animation) on every
    navigation; no new dependency.

22. ~~Money in/out chart~~ — done. `components/CashFlowChart` on Home, right
    below the score section — same visual language (label/amount on the
    left, `TrendSparkline` reused underneath) with an In/Out segmented toggle
    switching which series and color (green/coral) is shown. Backed by real
    `GET /v1/cash-flow` data — see the backend's CLAUDE.md for how the series
    is bucketed. Verified live: the chart's displayed totals matched a manual
    sum of the raw bucket data exactly, and the In/Out toggle correctly swaps
    both the number and the sparkline.

23. ~~Clearer name-binding notice on first upload~~ — done. The registration-
    step `StatementUpload` screen now says "Upload your first statement" (was
    generic "Upload a statement") and shows a prominent violet callout
    explaining the extracted name becomes the account name and that future
    uploads must match it — this was previously buried in a plain one-line
    subtitle.

24. ~~Statement-instructions screen, added to signup~~ — done.
    `screens/StatementInstructions/` sits between Terms and Statement Upload
    in the registration flow (`Terms`'s `handleContinue` now navigates to
    `/statement-instructions` instead of straight to `/statement-upload`).
    Content is real Safaricom process, not invented: an app-based tab (My
    Safaricom / My OneApp → Statements → pick a date range → Download
    PDF/Email) and a USSD tab (`*334#` → My Account → M-PESA Statement →
    Request Statement), plus a callout explaining the PDF password can be
    either an SMS one-time code or the user's National ID number depending on
    how the statement was generated — sourced from web research during this
    session, not guessed. Route is wrapped in `RequireUnlockedOrRegistering`
    (same guard as Upload/Review) since it's also a pre-account screen. "I
    have my statement" continues to `/statement-upload` as before. Verified
    live end-to-end: Terms → checkbox → Continue → Instructions (both tabs
    render, "I have my statement" reaches Upload) → Upload correctly shows
    registration-mode copy (title, name-binding callout, skip link) once a
    fresh `hasPin() === false` state is confirmed rather than assumed.

25. ~~"Lenders with access" moved into settings; nav slot replaced with AI
    Assistant~~ — done. `ActiveRequests` (`/requests`) is no longer a bottom-
    nav destination; it's now reached only via Privacy & Security's "Lenders
    with access" row (verified live: click navigates to `/requests` and the
    existing grant/revoke UI still works unchanged). `BottomNav`'s tabs are
    now `[home, assistant, profile]` (was `[home, requests, profile]`) —
    `icons.tsx` lost `ShareIcon`, gained `SparkleIcon`. The `/assistant` route
    renders the new `screens/AIAssistant/`: a chat UI shell (message bubbles,
    input row, send button) seeded with an explanatory welcome message and a
    visible "Preview — not live yet" badge, cycling through three canned
    "not live yet" replies on send. **Deliberately not wired to a real
    model** — the user's own framing was "a chatbot that we will integrate
    later in other sprints" — so this is UI-only, no backend endpoint, no
    LLM call. When a real integration happens, it should likely go through
    the backend (so it has access to `store.current_metrics`/`cash_flow`
    server-side) rather than calling a model directly from the client.
    Verified live: renders correctly, sending a message adds a user bubble
    and cycles a canned assistant reply.

26. ~~Fresh-account E2E verification + first security hardening pass~~ —
    done. Ran the full signup flow start to finish with a genuinely cleared
    localStorage/sessionStorage (Onboarding → Sign up → Terms →
    Instructions → real PDF upload against the backend's test fixture → PIN
    setup → Home), confirming the name bug from earlier sessions stays fixed
    and the cash-flow/signal work all functions for a brand-new user, not
    just a pre-seeded one. Found one real thing in the process: the backend
    has no concept of "a user" at all (see its CLAUDE.md's new "Security"
    section) — a fresh account's Home screen already shows an "Active
    requests: 1 SACCO" grant because that's `store.py`'s hardcoded default,
    not because of any real per-user isolation. Also added the PIN lockout
    described in step 13's update above, and ran `npm audit` (0
    vulnerabilities) as part of the same pass. See the backend's CLAUDE.md
    for the full security writeup, including what's genuinely fixed now vs.
    what has to wait for Supabase, and why a couple of tempting-looking
    quick fixes (client-side PIN hashing) were deliberately skipped as
    security theater rather than implemented for appearances.

27. ~~Feature sprint: simulator, multi-lender queue, report export, savings
    goals, data export/deletion, notifications~~ — done (6 of 7; email OTP
    is blocked on real Supabase credentials, see the backend's CLAUDE.md).
    All verified live in-browser, not just type-checked:
    - `screens/ScoreSimulator/` (`/simulator`, reached via a link on Home
      under the tip card) — three sliders (extra savings, Fuliza days cut,
      late/missed payments fixed) debounced into the backend's real
      `/v1/score/simulate`, showing a live projected score and delta "vs.
      today". Not a client-side approximation — every drag hits the same
      scoring function `/v1/score` uses.
    - `ActiveRequests` gained a "Waiting for your response" section above
      the existing grants list, one row per queued consent request
      (`useRequests()`'s new `pendingConsents`), each linking to
      `ConsentRequest` at the new parameterized route `/consent/:requestId`
      (was the fixed `/consent`). "Simulate an incoming request" now calls
      a real backend endpoint that adds a *new* queued request from a
      rotating pool of lender names, instead of just re-showing the one
      fixed Amani SACCO request.
    - `PrivacySecurity` gained two new rows under "Your data": "Download
      score report (PDF)" and "Export all my data (JSON)"
      (`api/score.ts`'s `downloadScoreReport`, `api/account.ts`'s
      `downloadDataExport` — both fetch a blob and trigger a real browser
      download via a temporary `<a download>`, not a placeholder). "Reset
      account" now also calls `deleteAccountData()` (`DELETE /v1/account`)
      before clearing local session state — previously it only cleared
      `localStorage`, silently leaving the backend's profile/score/grants
      untouched, which wasn't a real reset.
    - `components/SavingsGoalCard/` on Home, between the cash-flow chart and
      the signals section — progress bar against a user-set target, backed
      by `GET/PUT/DELETE /v1/savings-goal`. Empty state prompts "Set a
      goal"; editing/removing both go through the same `BottomSheet`.
    - `components/NotificationBell/` in Home's topbar — unread-count badge,
      opens a `BottomSheet` listing notifications newest-first with
      relative timestamps ("2h ago"), tap-to-mark-read plus "Mark all
      read". Backed by `GET /v1/notifications` and the two mark-read
      endpoints; notifications themselves are generated server-side (score
      changes, incoming consent requests), not created by the frontend.

    None of these six needed Supabase to be genuinely functional — they
    needed *multi-user* support to be genuinely functional for more than one
    person at a time, which is a separate, already-tracked gap (see the
    backend's "Security" section). Building them against the current
    in-memory store now means the Supabase migration only has to move data
    that already has a real shape, rather than also inventing these
    features' logic from scratch at the same time.

28. ~~Real Supabase Auth, replacing mocked sign up/log in~~ — done, paired
    with the backend's "Supabase migration, pass 1" (see
    `../scorewise-backend/CLAUDE.md`). `AuthForm.tsx`'s Continue button now
    calls real `signUp`/`logIn` (`api/auth.ts`) against the backend, which
    brokers Supabase Auth and sets the session as httpOnly cookies — the
    frontend never talks to Supabase directly and never handles a raw
    token, so there was no reason to add `@supabase/supabase-js` as a
    dependency here at all. Every `api/*.ts` fetch call now sends
    `credentials: 'include'` so those cookies actually flow.

    `hasAccount()` (`lib/session.ts`) changed from a synchronous
    `localStorage` flag to reading an in-memory cache
    (`lib/authSession.ts`) populated by one `GET /v1/auth/session` call —
    `App.tsx` now awaits that once, before rendering any route, so
    `RequireUnlocked`'s synchronous check is never stale on first load
    (covers a direct URL/bookmark straight to `/home`, which `Splash`'s own
    branded-pause check alone couldn't). `setAccount()` is gone entirely —
    account existence is a server fact now, not a flag `PinSetup` used to
    set for itself.

    Two flows changed behavior now that "the account" (Supabase identity)
    and "the device PIN" (local lock) are genuinely separate concepts,
    where before both were fictional:
    - **Privacy & Security's "Reset account"** is a *soft* reset — wipes
      backend data and ends the session, but does not delete the Supabase
      account; the same email/password logs back in and starts fresh. A
      full identity deletion was considered and deliberately not built
      (would need the backend's service_role admin API).
    - **PinEntry's "Forgot PIN?"** now signs out (`api/auth.ts`'s `logOut`)
      instead of wiping data — it was always about a forgotten *device*
      PIN, not the account, so forcing a full reset over 4 digits would
      have been needlessly destructive now that the two are actually
      distinguishable. Copy changed from "Reset account" to "Sign out" to
      match.

    Verified live, not just type-checked: real signup creates a genuine
    Supabase `auth.users` row and seeds default score/grants/notifications
    data; two independently signed-up accounts each see only their own
    profile when queried back-to-back; a direct Postgres query as the
    `authenticated` role scoped to one account's `auth.uid()` — with no
    `WHERE` clause at all — returns only that account's rows, confirming
    the backend's Row Level Security is the actual isolation boundary, not
    an application-level filter. Full registration flow (Splash →
    Onboarding → Sign up → Terms → Statement Instructions → skip-to-demo →
    PIN setup → Home) walked end-to-end in-browser against the real
    backend and a real Supabase project.

## Open questions (not yet blocking, revisit before shipping)

- No mockup exists yet for screens 1, 4, 5, 6 — if pixel-exact versions get
  designed later, re-check them against the interpreted versions built here.
- MSW vs. a lightweight local FastAPI stub for `/v1/score`, `/v1/consent`,
  `/v1/requests` during frontend-only development — defaulting to MSW since the
  real backend is FastAPI built elsewhere and we don't want a second backend to
  maintain. Confirm this is fine once integration actually starts.
- Exact radius brief says "12-16px" but the only real file uses a flat 16px —
  using 16px everywhere for consistency; flag if a tighter card (e.g. list rows)
  wants 12px instead.
