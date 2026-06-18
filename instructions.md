# Blob / Comms Dashboard — Working Instructions

> **This is a living document.** Update it at the end of *every* back-and-forth so we never lose
> sight of the logic, the data, the relationships, and the decisions. When something changes in
> the code or the plan, change it here in the same session, and add a line to the **Change & Decision
> Log** at the bottom.
>
> - **Why it exists:** `vision.md` is the *why* (strategy, north star). This file is the *how* and the *now*.
> - **Last updated:** 2026-06-17
> - **Maintainer:** Csongor Doma

---

## 0. How to use this doc (the rule)

1. Read this top-to-bottom before making changes.
2. After any change to code, data model, scoring logic, or plan → reflect it here immediately.
3. Append a dated entry to the **Change & Decision Log** every session.
4. Keep facts (IDs, weights, endpoints) exact — this doc is the source of truth the build is checked against.

---

## 1. Key resources

| Resource | Link |
|---|---|
| **Live app** | https://graphapisimple.vercel.app/ |
| **Vercel project** | https://vercel.com/iamcsongors-projects/graph_api_simple |
| **GitHub repo** | https://github.com/iamcsongor/email-dashboard |
| **Azure app registration** (Microsoft Graph) | https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/52975658-2cda-4237-a140-6f4f60b5f67c/isMSAApp~/false |
| **Slack app dashboard** | https://api.slack.com/apps |
| Vision / north star | `./vision.md` |
| Investor deck (source of vision) | `Blob x Alex Intro Deck 6th Jan 2026.pdf` |

**Notes on the portal links:**

- **Azure** — the link above deep-links to the Overview of app `52975658-…` (= `CLIENT_ID`). Entra
  admin-center equivalent: swap `portal.azure.com` for `entra.microsoft.com`. Sign in with the
  account that owns tenant `d0a04723-…`. From here: Authentication (redirect URIs), API permissions
  (`Mail.Read`, `Calendars.Read`), Branding.
- **Slack** — `api.slack.com/apps` lists all your apps. For a direct link to *this* app, use
  `https://api.slack.com/apps/<APP_ID>` where `<APP_ID>` looks like `A0XXXXXXX` (grab it from the
  dashboard — note: the `SLACK_CLIENT_ID` `729885942644.…` is **not** the App ID). Paste the App ID
  here once captured. From the app page: OAuth & Permissions (scopes + redirect), Basic Information (secret).
- **Branches:** `main` (production, auto-deploys), `gh-pages` (legacy GitHub Pages).

---

## 2. What this app is

A **single-file static web app** — `index.html`, ~6,300 lines of vanilla JS — that logs into a
user's **Microsoft 365** and **Slack** accounts, pulls their communication data client-side, and
renders analytics dashboards plus a composite **Blob Factor** score. No backend server; no build
step. Two tiny Vercel serverless functions exist only to handle Slack OAuth/CORS.

- **Codename in product:** "Comms Dashboard" (browser title + topbar). Investor-facing brand: **Blob**.
- **Runs entirely in the browser.** All analysis happens on the client; data lives in memory for the session.

---

## 3. Repo layout

```
email-dashboard/
├── index.html              # entire app: HTML + CSS + JS in one file (~6,300 lines)
├── api/
│   ├── slack-callback.js    # Vercel fn: Slack OAuth code → user token (returned in URL hash)
│   └── slack-proxy.js       # Vercel fn: CORS proxy for Slack Web API (whitelisted methods only)
├── vercel.json             # sets no-cache headers on all routes
├── .gitignore              # ignores certs (*.pem/*.key/*.crt), node_modules/, .deploy/
├── vision.md               # product north star (from deck)
└── instructions.md         # this file
```

No `package.json`, no bundler. External libs load from CDN at runtime.

---

## 4. External dependencies (CDN, runtime)

- **MSAL Browser 3.0.0** — `@azure/msal-browser` (Microsoft auth) via jsDelivr
- **Chart.js 4.4.0** — all charts via jsDelivr
- **Inter** font — Google Fonts

---

## 5. Data sources & auth flows

### Microsoft 365 (Graph)
- Auth: **MSAL.js**, `PublicClientApplication`, login popup → silent token acquisition.
- Token cache: `sessionStorage` (cleared when tab closes).
- Graph base: `https://graph.microsoft.com/v1.0`. Paginated via `fetchAllPages()`.
- Pulls: **mail** (received + sent) and **calendar** events.

### Slack
- Auth: **OAuth user token**. Browser → Slack authorize → `/api/slack-callback` exchanges the
  `code` for a user token → redirects back with the token in the **URL hash** (never query string).
- API calls: browser → `POST /api/slack-proxy` with the token in an `x-slack-token` header
  (proxy needed because Slack's Web API has no browser CORS).
- Proxy method **whitelist**: `users.list`, `users.conversations`, `conversations.list`, `conversations.history`.
- Channel enumeration uses **`users.conversations`** (only the signed-in user's channels/DMs), **not**
  `conversations.list` (which returns the whole workspace and caused a fetch hang). Covered by existing
  scopes (`channels:read`, `groups:read`, `im:read`, `mpim:read`).
- `slackAPI()` throttles ≥1.2s between calls, retries 429s with backoff, and has a **30s per-call
  timeout** (AbortController) so a stalled request can't hang the app.
- Pulls: users, channels/conversations, message history, reactions.
- ⚠️ Per-channel history still pages over `MONTHS_BACK` (default 18) — for users in many busy channels
  this can be slow (shows per-channel progress). Lever: lower the time-range slider before syncing.

### Demo mode
- `loadDemoData()` + `generateDemoData()` / `generateSlackDemoData()` / `generateCalendarDemoData()`
  populate fake data; `IS_DEMO = true` prevents any live API calls. Used for showcasing without login.

---

## 6. Config, IDs & secrets

Defined near the top of the `<script>` in `index.html` (~line 2090):

| Constant | Value | Meaning |
|---|---|---|
| `CLIENT_ID` | `52975658-2cda-4237-a140-6f4f60b5f67c` | Azure (Entra) app registration ID |
| `TENANT_ID` | `d0a04723-fdc3-4b9f-b4ca-ed07f918688a` | Single-tenant authority |
| `SCOPES` | `["Mail.Read", "Calendars.Read"]` | Graph permissions requested |
| `REDIRECT_URI` | `window.location.origin` | MSAL redirect |
| `GRAPH` | `https://graph.microsoft.com/v1.0` | Graph base URL |
| `SLACK_CLIENT_ID` | `729885942644.10595509625094` | Slack app client ID |
| `SLACK_REDIRECT` | `origin + /api/slack-callback` | Slack OAuth redirect |
| `MONTHS_BACK` | `18` (default) | Lookback window for analysis (radial slider) |

**Slack user scopes requested:** `channels:history, channels:read, groups:history, groups:read,
im:history, im:read, mpim:history, mpim:read, reactions:read, users:read`.

**Secrets (NOT in repo — set in Vercel project env vars):**
`SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET`. Never commit these. Microsoft uses a public client
(no secret in the browser).

---

## 7. In-memory data model & state

All session state is plain globals (no DB):

| Variable | Holds |
|---|---|
| `ALL_RECEIVED`, `ALL_SENT` | Email message arrays (Graph shape: `from`, `toRecipients`, `conversationId`, `receivedDateTime`/`sentDateTime`, …) |
| `SLACK_DATA` | `{ messages, channels, users, myUserId }` |
| `CALENDAR_DATA` | Processed calendar events (`{ start, … }`) |
| `REL_CONTACTS` | Merged cross-channel relationship contacts |
| `AUTH_STATE` | `{ microsoft: bool, slack: bool }` |
| `IS_DEMO` | true after demo data loaded |
| `IS_SNAPSHOT` | true when data was loaded from snapshot cache/file (skips live APIs) |
| `SNAPSHOT_META` | `{ origin: 'cache'\|'file'\|'live', savedAt, exportedAt }` for the status pill |

**Persistent (localStorage)** — Rhythm view prefs, prefix `wyw_` ("when you work"):
`wyw_view`, `wyw_daysoff`, `wyw_tg_<name>`.

**Persistent (IndexedDB)** — DB `comms-dashboard`, store `snapshots`, key `current`: the cached
data snapshot used for offline/prototyping reloads (see §10 → *Snapshot / offline mode*).

---

## 8. Blob Factor scoring model (the core logic)

The **Blob Factor** is the overall 0–100 score = **average of the signal sub-scores**.
Review window shown in UI: **last 28 days**. Each signal also shows **7D / 30D / 90D deltas**.

**Tier thresholds** (`tierTone`): **≥70 = good ("on track")** · **40–69 = mid ("monitor")** · **<40 = risk ("at risk")**.
Colors: good `#3aa06b`, mid `#c9931e`, risk `#c44a3e`.

### Signals (the `NAV` taxonomy)

| # | id | Label | Measures | Status |
|---|---|---|---|---|
| 1 | `rhythm` | Rhythm | Cadence, peak hours, balance — when/how you work | **live** |
| 2 | `engagement` | Engagement Volume | How much you communicate; volume across channels + trend | **live** |
| 3 | `participation` | Participation | Meeting visibility — frequency, organiser role, group size | **live** |
| 4 | `presence` | Presence | Working hours, consistency, night-owl tendency | **live** |
| 5 | `reaction` | Reaction Time | Responsiveness — how fast you reply | **live** |
| 6 | `sentiment` | Sentiment Analysis | Tone, positivity, emotional signal | **placeholder** |
| 7 | `social` | Social Brand Rep | Public engagement / ambassador signal (e.g. LinkedIn) | **placeholder** |

> Maps to the deck's "Blob Score / ~50 factors." Today = 7 signals (5 live + 2 placeholders);
> the ~50 factors are the underlying inputs we expand toward.

### Engagement sub-score formula (`calcEngagementScore`)

Per month, composite on a 0–100 scale from 4 inputs:

- **Reply rate** — % of received conversations you replied to → **×35**
- **Response speed** — `1 − (avgHours / 48)`, capped at 48h → **×30**
- **Initiation rate** — % of sent emails starting a *new* conversation → **×15**
- **Network breadth** — unique contacts, normalised to the busiest month → **×20**

(Months with fewer than 5 messages are skipped as insufficient data.)

---

## 9. UI structure

Two layers coexist in `index.html`:

- **Blob Factor shell** (`#bf-app`, prefix `bf-`): the primary view — left sidebar with the 7 signals
  and overall Blob Factor, main pane with 1-year overview tiles + per-signal detail. Rhythm renders
  the "when you work" candle/heatmap view.
- **Legacy analytics tabs** (`data-tab` / `#tab-*`): `email`, `slack`, `calendar`, `activity`,
  `relationships`. Rich per-channel charts (timeline, day/hour, top senders, response times, read
  rate, attachments, thread depth, meeting stats, cross-channel relationships, etc.).

Screens: `login-screen` → `loading-screen` → `dashboard` (`showScreen()`).

---

## 10. Deployment & dev workflow

- **Hosting:** Vercel project `graph_api_simple`. Push to `main` → auto-deploy. Live at the App URL above.
- **No build step.** It's static; Vercel serves `index.html` and runs `api/*.js` as serverless functions.
- **Caching:** `vercel.json` forces `no-cache, no-store, must-revalidate` so users always get the latest.
- **Local testing:** serve the folder over HTTP (e.g. a static server) — `file://` breaks OAuth redirects.
  The Slack `/api` functions only run on Vercel (or `vercel dev`).
- **Redirect URIs** must be registered: in Azure (for `CLIENT_ID`) and Slack app config, for both
  the production origin and any local origin used for testing.

### Snapshot / offline mode (prototyping — avoid re-syncing on every reload)

So you don't re-pull Microsoft + Slack every time you tweak the app, data is cached locally and
reused until you explicitly refresh.

- **First sync (or "Refresh from live"):** the app fetches live, renders, and **auto-saves** the
  combined data (email + calendar + Slack) to **IndexedDB** (`comms-dashboard` → `snapshots` → `current`).
- **Every reload after that:** `init()` finds the cached snapshot and loads it instantly — **no auth,
  no API calls**. `IS_SNAPSHOT = true`; live fetches are skipped (same idea as Demo Mode).
- **Force a fresh live pull:** the **Refresh from live** button (or add `?live=1` to the URL). After a
  successful live pull the `?live` param is stripped so the *next* reload uses the new cache again.
- **Portable file:** **Export** writes `comms-snapshot-<date>.json` (the seed/backup, works across
  browsers/origins). On the login screen, **Load saved snapshot (.json)** imports a file and also
  re-caches it. Single combined file covers all three sources; calendar `start`/`end` are stored as
  ISO and revived to `Date` on import.
- **Status pill** (bottom-left of dashboard): shows mode (Live / Snapshot · cached|file · time / Demo)
  with Refresh / Export / Clear actions.
- **Reset:** **Clear** (pill) deletes the cache; **Sign out** clears in-memory state + the pill.
- **Privacy:** snapshots contain real comms content → **never commit them.** Patterns are gitignored
  (`comms-snapshot-*.json`, `comms-emails-*.json`, `comms-slack-*.json`, `*.snapshot.json`, `snapshot*.json`).
  This is an MVP-only convenience; the real product needs a proper backend/store, not a browser cache.
- **Key functions** (all in `index.html`, main script scope): `idbSaveSnapshot/idbLoadSnapshot/idbClearSnapshot`,
  `buildSnapshotObject`, `applySnapshot`, `saveSnapshotToCache`, `exportSnapshotFile`,
  `importSnapshotFromFile`, `refreshFromLive`, `clearSnapshotCache`, `renderSnapshotPill`.

---

## 11. Conventions

- Everything lives in one `index.html` — edit in place; keep the existing section banners
  (`// ════` headers) and `bf-`/`wyw_` prefixes.
- Commit messages follow a versioned feature style, e.g. *"BF v6: …"*, *"Rhythm v5.1: …"* — continue the pattern.
- Keep IDs/scopes/weights in sync between the code and §6/§8 of this doc.

---

## 12. Privacy & compliance (important — we read people's comms)

- The product reads employees' email, calendar, and Slack → **GDPR / UK-GDPR territory**. ICP is UK/EU first.
- Deck promises **anonymised** Blob Score states in the free tier — keep anonymisation real, not cosmetic.
- Principles to hold to as we build: explicit consent / lawful basis, data minimisation, transparency to
  the people being scored, retention limits, and security of any stored tokens/data.
- Current app is **per-user and client-side** (a person logs into their own account) — the multi-employee /
  employer-view product in the deck raises additional consent and data-handling requirements to design for.

---

## 13. Vision ↔ build gap (promised vs. built)

| Deck promise | Today |
|---|---|
| Signals: email, Slack, **Zoom**, calendar, meetings | Email + calendar (Graph) + Slack live. **Zoom not built.** |
| **~50 factors** → Blob Score | 7 signals (5 live, 2 placeholder). |
| **Sentiment** ("negative tone") | Placeholder — not implemented. |
| **Social / LinkedIn** ("liking company posts") | Placeholder — not implemented. |
| **Individual View** | Largely covered by Blob Factor shell + per-signal panes. |
| **Company Overview** (map + scatter, many employees) | Not built — app is single-user/self today. |
| Nudges / re-engagement frameworks | Not built. |
| Anonymised free tier, PDF snapshot artifact, billing tiers | Not built. |

---

## 14. Open questions / backlog

- Multi-tenant / employer view: how do we aggregate many employees while staying consent-safe?
- Zoom integration (signal source the deck names but we don't have).
- Implement Sentiment and Social signals (currently placeholders).
- Expand toward the "~50 factors" — define and document each input.
- PDF snapshot artifact (one-off £25/head tier) and billing/pricing tiers.
- Persistence: is in-memory + localStorage enough, or do we need a backend/DB for the platform play?
- Reconcile the LOI count (deck says 9 in headline, 11 in body).

---

## 15. Glossary

- **Blob** — the product / company (investor brand).
- **Comms Dashboard** — the app's in-product name.
- **Blob Factor / Blob Score** — overall 0–100 health score (avg of signal sub-scores).
- **Signal** — one scored dimension (Rhythm, Engagement, Participation, Presence, Reaction, Sentiment, Social).
- **Rhythm** — the "when you work" cadence signal (code prefix `wyw_`).
- **ICP / LOI / AOV** — Ideal Customer Profile / Letter of Intent / Average Order Value.

---

## 16. Change & Decision Log

> Append a dated entry every session. Newest at top.

- **2026-06-17** — **Fixed Slack ingestion hang.** Root cause: `fetchSlackConversations` used
  `conversations.list` (entire workspace, thousands of channels) throttled at 1.2s/call → minutes of
  paging + 429s, stuck at "Fetching Slack channels…". Switched to `users.conversations` (user's own
  conversations only) + added `users.conversations` to the proxy whitelist, live channel-count progress,
  and a 30s per-call timeout in `slackAPI`. **Requires a Vercel deploy** (proxy change). No re-auth needed.
- **2026-06-17** — Built **snapshot / offline mode** for prototyping: combined data (email + calendar +
  Slack) auto-caches to IndexedDB after each live fetch and auto-loads on reload (no re-auth); portable
  JSON Export/Import; `?live=1` + "Refresh from live" to force a real sync; status pill with
  Refresh/Export/Clear; login-screen file importer. Added `IS_SNAPSHOT`/`SNAPSHOT_META` globals and
  gitignored snapshot files. Docs: new §10 subsection + §7 state additions. (Decision: IndexedDB cache
  + JSON file; primary run target = live Vercel URL.)
- **2026-06-17** — Added Azure app-registration deep link (built from `CLIENT_ID`) and the Slack app
  dashboard link to §1, with notes on the Entra alt URL and the Slack per-app direct-link template
  (App ID `Axxxx` still to be captured — `SLACK_CLIENT_ID` is not the App ID).
- **2026-06-17** — Created `vision.md` (from the 6 Jan 2026 investor deck) and this `instructions.md`.
  Documented current architecture: single-file static app on Vercel, Microsoft Graph (Mail + Calendar)
  + Slack via OAuth/proxy, Blob Factor model (7 signals, 5 live + 2 placeholder), scoring weights,
  config/IDs, data model, and the vision-vs-build gap. Established the rule that this file is updated
  every back-and-forth.
