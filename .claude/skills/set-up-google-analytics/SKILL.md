---
name: set-up-google-analytics
description: Install Google Analytics 4 and Google Tag Manager on a Next.js App Router project — GDPR consent banner with per-category toggles, typed custom event tracking, and a server-side reporting dashboard in the admin panel. Use when asked to add analytics, GA4, GTM, tracking, a cookie banner, or to "measure impact / prove ROI to sponsors". Also use when GA4 is already installed but pageviews only fire on the first load, when the numbers look inflated by staff traffic, when the cookie banner throws a hydration error, or when the Data API returns PERMISSION_DENIED.
---

# Google Analytics 4 on Next.js App Router

Complete walkthrough, written for someone who has never wired GA4 before.
Built for **fronton-king** (Sep 2026); the code pattern was lifted from
**materia-prima** and then corrected — materia-prima ships **pageviews only**,
which cannot prove anything to a sponsor.

Follow the parts in order. Part 1 is clicking around Google's consoles, Part 2
is the code, Part 3 is verification, Part 4 is the traps.

---

## Part 0 — Decide this BEFORE writing code

### GA4 does not replace first-party tracking. Do not let it.

If the project already writes its own events to its own database (impressions,
clicks, conversions), that data is **better** than GA4 for anything
contractual. Check for existing tables before building anything.

| Source | Answers | Trustworthy for |
|---|---|---|
| Own tables (Supabase/Postgres) | What a placement DID — per sponsor, per slot, RLS-scoped | An invoice. Exact, auditable, defensible |
| GA4 | WHO the audience was — reach, country, device, channel, retention | A pitch deck. Sampled AND consent-modelled |

Send sponsor events to **both**, and label them separately in the UI
(`Medido` vs `Estimado` in fronton-king). A modelled GA4 number presented as
measured discredits every other figure sitting next to it.

**Why GA4 numbers are estimates:** visitors who refuse analytics cookies still
send cookieless pings under Consent Mode, and Google *models* the missing
users statistically. GA4 also samples large date ranges. Neither is wrong,
but neither is a headcount.

### What you need from the client before starting
- Access to a Google account that can create a GA4 property
- The production domain
- Whether anyone non-technical will need to add pixels later (→ GTM yes/no)

---

## Part 1 — The Google side (console clicking)

Four separate things live in three different consoles. This is where people
get lost, so here is the whole map:

| Thing | Where | Looks like | Used by |
|---|---|---|---|
| Measurement ID | GA4 → Admin → Data streams | `G-JXF9QJJYEP` | The browser tag |
| Property ID | GA4 admin **URL**, after `/p` | `550687663` | The reporting API |
| GTM container ID | tagmanager.google.com | `GTM-NCG39QJC` | The container tag |
| Service account | console.cloud.google.com | `x@proj.iam.gserviceaccount.com` | Server-side reports |

### 1a. Create the GA4 property
analytics.google.com → Admin → Create property → add a **Web** data stream for
the production domain. Copy the **Measurement ID** (`G-…`).

Google will then show a "Install manually" dialog with a `<script>` snippet.
**Do not paste it anywhere.** `@next/third-parties` loads the same tag
correctly; a raw `<script>` in a React Server Component is silently skipped in
Next 15+/16.

### 1b. Get the Property ID — READ IT FROM THIS PROJECT'S OWN PROPERTY

⚠️ **NEVER copy a property id from another project's `.env`, compose file, or an
old screenshot. Read it out of THIS property's admin URL, every time.**

This was done wrong on fronton-king: `550687663` was lifted from a screenshot
that happened to show a different project, and the correct id was `552665994`.
The failure is maximally misleading — the credentials load, the JSON parses,
nothing in the app errors, and Google returns:

```
7 PERMISSION_DENIED: User does not have sufficient permissions for this property.
```

which reads as "the service account is not on the property" and sends you to fix
a permission that was never broken. The id being wrong and the access being
missing produce the SAME message.

**So check the id before touching permissions.** With the property open in GA4,
the id is in the browser URL, after `p`:

```
analytics.google.com/analytics/web/#/a376056045p552665994/admin/...
                                              ^^^^^^^^^ the property id
```

In env it must carry the prefix: `GA4_PROPERTY_ID=properties/552665994`.

Three ids exist per project and they are easy to confuse:

| Looks like | Is | Used by |
|---|---|---|
| `G-JXF9QJJYEP` | Measurement ID | the browser tag |
| `552665994` | Property ID | the reporting API |
| `a376056045` | Account ID | neither |

**Verify with a real API call before wiring any UI** — it takes ten seconds and
tells you which of the two problems you actually have:

```bash
node -e "
const {BetaAnalyticsDataClient}=require('@google-analytics/data');
const c=new BetaAnalyticsDataClient({credentials:JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)});
c.runReport({property:process.env.GA4_PROPERTY_ID,dateRanges:[{startDate:'28daysAgo',endDate:'today'}],metrics:[{name:'activeUsers'}]})
 .then(([r])=>console.log('OK',JSON.stringify(r.rows)))
 .catch(e=>console.log('FAIL',e.message));
"
```

Ambiguous `PERMISSION_DENIED`? Check the id FIRST, then the access grant.

### 1c. GTM container (optional)
tagmanager.google.com → create container → Web. Copy `GTM-…`.

Add GTM **only if** someone non-technical needs to add third-party pixels
without a deploy. It is a second tag loader, so it costs a request.

> ⚠️ **If you add GTM, do NOT also configure GA4 inside the container** while
> `NEXT_PUBLIC_GA4_ID` is set. Two GA4 tags on one page double every single
> pageview, and it is very hard to notice — the numbers just look good.

### 1d. Service account (for the admin dashboard only)
The browser tag SENDS data. Reading it back for your own dashboard needs a
separate credential.

1. console.cloud.google.com → create/select a project
2. **APIs & Services → Library → enable "Google Analytics Data API"**
3. IAM & Admin → Service Accounts → Create → name it → Done
4. Open it → Keys → Add key → **JSON** → downloads a file
5. **GA4 → Admin → Property access management → `+` → add the service account's
   email (`…iam.gserviceaccount.com`) with the `Viewer` role**

**Steps 2 and 5 are the two everybody forgets.** Both fail as
`PERMISSION_DENIED` (gRPC code 7) but the message tells you which is missing —
read it, do not guess, and do not start regenerating keys:

```
# Step 2 missing — the API is not switched on for the CLOUD project:
7 PERMISSION_DENIED: Google Analytics Data API has not been used in
project 814307693431 before or it is disabled. Enable it by visiting
https://console.developers.google.com/apis/api/analyticsdata.googleapis.com/overview?project=...
→ open that exact URL, enable, wait ~2 min for propagation

# Step 5 missing — the API is on, but the account is not on the PROPERTY:
7 PERMISSION_DENIED: User does not have sufficient permissions for this property.
→ the key is fine. GA4 → Admin → Property access management → add the
  service-account email as Viewer
```

Both were hit in sequence on fronton-king: fixing step 2 simply revealed step 5.
Seeing the message change from the first to the second is **progress**, not a
new problem.

A third variant worth knowing:
```
INVALID_ARGUMENT: Invalid property ID
→ GA4_PROPERTY_ID is missing the `properties/` prefix, or you used the
  Measurement ID (G-…) where the numeric property id belongs
```

### 1f. Custom dimensions — REQUIRED, and not retroactive

**GA4 collects your event parameters but will not show them in ANY report until
you register each one as a custom dimension.** Until then `sponsor_click` is a
bare count: you can see 20 clicks but not WHICH sponsor got them.

Registration does **not apply backwards**. Anything that arrived before the
dimension existed is unqueryable forever. Do this before the traffic, not after
someone asks for a breakdown.

Admin → **Custom definitions → Custom dimensions → Create**. For each: the
dimension name and the parameter name are the same string.

Two scopes, and the difference matters:

| Scope | For | Set in code by |
|---|---|---|
| **Event** | a parameter on one event (`placement_id`, `screen`) | `track(name, { param })` |
| **User** | something true of the whole session (`locale`, `app_mode`) | `setUserProperties({...})` |

A User-scoped dimension lets you slice **every** report by it. That is why
`locale` is registered twice — once per scope — which looks like a mistake and
is not.

Derive the list from the code rather than by hand:

```bash
grep -rhoE 'track\("[a-z_]+", \{[^}]*\}' components/ services/ \
  | grep -oE '[a-z_]+:' | tr -d ':' | sort -u
```

For fronton-king that was 13 Event + 2 User = 15, against a limit of 50.

**Limits:** 50 event-scoped and 25 user-scoped per property. Archiving one frees
the slot but does not recover its data. Do not register a dimension "just in
case" — spend them on what a sponsor will actually ask about.

### 1g. Key events (formerly "conversions")

Admin → **Events** → toggle *Mark as key event* on the ones that represent value:
`registration_click`, `sponsor_click`, `qr_scan`, `pwa_installed`.

⚠️ **An event only appears in that list AFTER the app has sent it at least
once.** On a fresh property the list is empty and nothing is wrong — come back
after deploying and firing each one.

### 1h. Data retention — change it FIRST, it cannot be applied backwards

Admin → **Data settings → Data retention** → change **2 months** (the default)
to **14 months** → Save.

Two months is the default and it is almost never what you want. Building a case
for *next year's* sponsors on an October event means October's data is already
gone by December. Raising it later does not restore what expired.

This is the single most commonly missed step, and the only one that silently
destroys data.

### 1e. Handle the key file — SECURITY, DO THIS IMMEDIATELY
The downloaded JSON contains a **private key**. If it reaches git history it is
compromised forever, even if a later commit deletes it — you would have to
rotate it, not just remove it.

```bash
# 1. Confirm it is ignored BEFORE doing anything else
git check-ignore -v <the-file>.json || echo "❌ EXPOSED — fix .gitignore now"

# 2. Add to .gitignore
*.iam.gserviceaccount.com.json
gcp-*.json
service-account*.json
<project-slug>-*.json

# 3. Confirm it never got committed
git log --all --diff-filter=A --name-only --oneline | grep -i serviceaccount
```

Then flatten it into env as ONE line — the app reads the env var, never the file,
so the file itself never needs to ship:

```bash
python3 -c "import json;print(json.dumps(json.load(open('key.json')),separators=(',',':')))"
```

Paste as `GOOGLE_APPLICATION_CREDENTIALS_JSON=` in `.env.local`. In
docker-compose, **single-quote the whole value** — the JSON contains `"` and
`\n`, and YAML will mangle it otherwise (this is the #1 production failure).

---

## Part 2 — The code

### Install
```bash
npm install @next/third-parties @google-analytics/data
```

### Environment
```bash
# Browser (safe to expose — these are public identifiers by design)
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX          # optional

# Server only — NEVER prefix these with NEXT_PUBLIC_
GA4_PROPERTY_ID=properties/123456789
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}
```

Read `process.env` **only** in `config/analytics.config.ts` (04-CLIENT_SERVER).
Treat a placeholder id (`G-XXXXXXXXXX`) as disabled, so local dev stays clean
and no code path needs a manual guard.

### File map
```
config/analytics.config.ts        the ONLY place process.env is read
types/analytics.ts                CLOSED union of every event name
types/gtag.d.ts                   window.dataLayer / window.gtag
lib/analytics.ts                  track(), pushToDataLayer(), setUserProperties()
lib/consent.ts                    categories, localStorage, useConsent()
utils/analytics-page.ts           screenNameFor(), isExcludedFromAnalytics()
utils/ga-trend.ts                 sparkline geometry (pure, no React)
utils/bar-width.ts                percentage -> static Tailwind class
components/analytics/
  Analytics.tsx                   mounts everything ONCE, in Providers
  ConsentInit.tsx                 Consent Mode v2 DEFAULTS (before the tags)
  ConsentSync.tsx                 pushes updates when the choice changes
  ConsentBanner.tsx               bar + per-category preferences panel
  PageviewTracker.tsx             page_view on every route change
  EngagementTracker.tsx           scroll depth + dwell milestones
services/ga4-reports.ts           server-only Data API queries
app/api/analytics/route.ts        staff-guarded JSON endpoint
components/admin/AnaliticaPanel.tsx + GaBarList / GaTrend / GaRangePicker
app/[locale]/admin/analitica/page.tsx
```

Mount `<Analytics />` in `Providers.tsx`, beside the other zero-render
singletons (`PwaRegistration`, `InputModalityTracker`).

### Order inside Analytics.tsx is not cosmetic
```tsx
<ConsentInit />        {/* MUST run before the tags — see Part 4.3 */}
<GoogleTagManager />
<GoogleAnalytics />
<ConsentSync />
<PageviewTracker />
<EngagementTracker />
```

### The event vocabulary — close the union
```ts
export type AnalyticsEvent =
  | "sponsor_impression" | "sponsor_click" | "qr_scan"
  | "registration_click" | "role_select"   | "language_select"
  | "notification_optin" | "pwa_installed" | "scroll_depth" | "time_on_page"
```

A union type means a typo is a **compile error** rather than a metric that
silently never appears. This matters more than usual because **GA4 keeps event
names forever and cannot rename them retroactively** — a mistake found after
the event is permanent.

Naming: snake_case, `verb_noun`, under 40 chars.

Send `locale` and role as **user properties**, not per-event parameters, so
every report slices by them for free:
```ts
window.gtag("set", "user_properties", { locale, app_mode: mode })
```

**Never put personal data in a parameter** — no name, email, phone, or precise
location. GA4's terms forbid it and GDPR applies.

### track() must be unfailable
Analytics runs on a phone with one bar of signal, outdoors. Every call is
fire-and-forget, swallows its own errors, and no-ops silently when GA is not
configured — so call sites never guard:
```ts
export const track = (event: AnalyticsEvent, params = {}) => {
  if (!canSend()) return
  try { window.gtag?.("event", event, clean(params)) } catch {}
}
```
Strip `undefined` values first: gtag sends the literal string `"undefined"`,
which pollutes reports with a fake dimension value.

---

## Part 3 — Verify in a real browser. Always.

`tsc` and `lint` **cannot** see a hydration mismatch, a tag that never loads,
or an event that never leaves the page. Testing `--help` is not testing.

Never touch the user's dev server. Build, start on a **spare port**, drive it
with Playwright, then kill it:

```bash
npx next build
PORT=3111 npx next start -p 3111 &
```

```js
page.on('pageerror', e => errors.push(e.message))              // catches #418
page.on('request', r => /\/g\/collect/.test(r.url()) && hits.push(r.url()))
```

Assert all six:
1. Banner renders on a public page
2. `consent default` is in dataLayer with everything `denied`
3. Accept → `consent update` flips `analytics_storage` to `granted`
4. Banner stays gone after reload (localStorage persisted)
5. A `…/g/collect?…tid=G-YOUR-ID` request actually fires
6. **Zero** Google scripts on `/admin` — and zero console errors everywhere

Then verify the server side separately, because it fails independently:
```bash
node -e "…runReport({property, metrics:[{name:'activeUsers'}]})"
```

Kill the server and delete the scratch scripts when done.

---

## Part 4 — Six traps that will cost you hours

### 1. Client-side navigation kills pageviews
GA4's automatic `page_view` fires on **first load only**. Every App Router
transition after that is invisible. Send it yourself in an effect **keyed on
`pathname`**.

An effect keyed only on a ready flag (`appReady`, `loaderGone`) runs once per
session and looks perfectly correct while reporting nothing — those flags are
one-shot. Guard StrictMode's double-invoke with a `useRef` of the previous
path, or the first screen of every session double-counts.

### 2. Staff traffic silently inflates everything
The team opens the backoffice dozens of times a day, and those visits land in
the same property the sponsor deck is built from.

Fix at **three** levels — a GA4 filter alone is not enough, because it can be
edited or forgotten and it cannot clean data already collected:

```ts
const EXCLUDED = [/^\/admin(\/|$)/, /^\/sponsor(\/|$)/, /^\/acceso(\/|$)/]
```
- `Analytics.tsx` returns `null` on those paths → **the tag never loads**, so
  GA4's own automatic `session_start` / `first_visit` cannot fire either.
  Loading the tag and staying quiet is NOT equivalent.
- Both trackers bail out early.
- `services/ga4-reports.ts` adds a `notExpression` dimensionFilter so
  historical rows, collected before the exclusion existed, are also excluded.

### 3. The consent hook WILL cause hydration error #418
`typeof window !== "undefined"` is false on the server and true on the client's
first pass, so the two renders differ. Seen live as
`Minified React error #418`.

```ts
// ❌ hydration mismatch
hydrated: typeof window !== "undefined"

// ✅ server snapshot and first client render agree, then it flips
const hydrated = useSyncExternalStore(() => () => {}, () => true, () => false)
```

Separately: derive stored consent with a **lazy `useState` initialiser**, never
`setState` in an effect — lint fails that as a cascading render, and it makes
the banner visibly flash for someone who already answered.

### 4. Tailwind cannot express a runtime percentage
`w-[${pct}%]` is **never compiled**. Tailwind scans source text at build time,
so that class does not exist and the bar renders at zero width — silently, with
no error. `style={{}}` is banned (03-CSS_TOKENS). Use a written-out lookup
table snapping to 5% (`utils/bar-width.ts`); at bar size the rounding is
invisible and the exact number is printed alongside anyway.

### 5. `userEngagementDuration` is a TOTAL, not an average
Divide by `screenPageViews` to get "time on page". Reporting it raw is wrong by
a factor of the pageview count, and it looks plausible, which is worse.

### 6. A colour utility loses to the semantic type class — silently

Text on a bright accent fill (amber, cyan, lime) must be the dark ink token, not
white: white on `#fbbf24` is **1.7:1**, far below the 4.5:1 WCAG AA floor.

But setting it is not as simple as adding `text-ink`, and this cost three failed
attempts before the cause was found:

```tsx
// ❌ ALL THREE render muted grey. No error, no warning, looks right in the source.
<span className="text-body-sm text-ink">
<span className="text-body-sm text-white">
<span className="text-body-sm [color:var(--color-ink)]">
```

**Why:** `styles/base.css` declares `color` inside `.text-body` / `.text-body-sm`
/ `.text-caption`, and it is imported **unlayered**. Tailwind v4 puts utilities
in `@layer utilities`, and **unlayered CSS beats every layered rule regardless
of specificity** — so the semantic class always wins. An arbitrary property does
not help; specificity is not the mechanism.

```tsx
// ✅ split them — type class outside, colour inside
<span className="text-body-sm">
  <span className="[color:var(--color-ink)]">28 días</span>
</span>
```

**Verify the computed colour in a browser.** This defect is invisible in the
source and in a code review:

```js
getComputedStyle(el).color   // want rgb(3, 21, 38), not rgb(159, 182, 200)
```

### 7. Two GA4 tags double every pageview
If GA4 is configured inside the GTM container **and** `NEXT_PUBLIC_GA4_ID` is
set, every hit lands twice. Pick one. Default: GTM for third-party pixels only,
GA4 loaded directly.

---

## Part 5 — Consent Mode v2 (EU: mandatory)

### Defaults must land BEFORE the tag scripts
Do it imperatively inside a guarded `useState` initialiser during render — not
in an effect (too late), and not as a `<script>` tag (never executed in an RSC).

```ts
w.dataLayer = w.dataLayer ?? []
w.gtag = function gtag() { w.dataLayer.push(arguments) }   // MUST be `arguments`
w.gtag("consent", "default", {
  analytics_storage: "denied", ad_storage: "denied",
  ad_user_data: "denied", ad_personalization: "denied",
  functionality_storage: "granted", security_storage: "granted",
  wait_for_update: 500,
})
w.gtag("set", "ads_data_redaction", true)
w.gtag("set", "url_passthrough", true)
```

**`arguments`, not `...args`.** Google's tag reads `arguments.length`; a spread
array arrives as one nested value and consent silently never applies.

`wait_for_update: 500` holds the tag briefly so a returning visitor's stored
choice is applied *before* the first hit, rather than one denied hit landing
and being corrected after.

### A two-button banner is not enough
Ship a per-category panel — necessary (locked on) / analytics / marketing /
embeds — with a **Save** action, and expose `openConsentPreferences()` from the
footer. Under GDPR, consent must be as easy to withdraw as it was to give.

Accept and Reject must be **visually equal**. A pre-styled accept against a
greyed-out reject is not free consent and invalidates the data collected on
the back of it.

Keep the banner out of the way: on an event app someone opens it outdoors to
answer one question, so a full-screen interstitial is the wrong trade. Sit it
above the bottom tab bar; let the panel take the screen only when asked for.

### Versioning and storage
Store in `localStorage` (nothing server-side reads it) under a versioned key
(`fk.consent.v1`). Bumping the version re-prompts everyone — required when you
add a category, since nobody consented to the new one.

Merge stored categories over the defaults on read, so a category added later
reads as `false`, not `undefined` (a truthiness check downstream would treat
`undefined` as refusal, but the shape should never be ambiguous).

Broadcast changes with a `CustomEvent` **and** listen to `storage`, so another
tab's decision settles this one.

---

## Part 6 — Server-side reporting

```ts
const client = new BetaAnalyticsDataClient({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON),
})
```

- **Wrap `JSON.parse` in try/catch.** Malformed docker-compose quoting is the
  common failure; it must degrade to "not configured", not crash the dashboard.
- **`Promise.all` every report.** The API bills per request, not per batch, and
  serial calls make the panel take seconds.
- **Validate any date/range that reaches the query** against an allowlist or a
  regex — it is interpolated into the request, and auth-gating is not a
  substitute (12-SECURITY).
- **Guard the route with the project's own staff check, return 404 not 401**,
  so the endpoint does not advertise its existence.
- GA4 rows are loosely typed: `dimensionValues` / `metricValues` are nullable
  arrays of nullable objects. Write small `dim()` / `num()` accessors rather
  than fighting the types at each call site.

Useful dimensions beyond the obvious: `sessionDefaultChannelGroup`,
`landingPage`, `hour`, `language`, `browser`, `city`. Useful metrics:
`activeUsers`, `newUsers`, `engagedSessions`, `engagementRate`, `eventCount`.

Chart it with a hand-drawn SVG path, not a chart library — one path, no client
bundle, prints correctly, inherits the theme. Start the vertical axis at zero:
an axis starting partway up exaggerates a flat week into a cliff, which is
exactly the chart nobody should hand a sponsor.

---

## Checklist before calling it done

- [ ] `npx tsc --noEmit` and `npm run lint` both clean
- [ ] `npx next build` succeeds
- [ ] Browser-verified: banner → accept → `g/collect` hit → no console errors
- [ ] **Zero** Google scripts on admin/sponsor routes
- [ ] Service-account JSON is gitignored and NOT in git history
- [ ] Property ID read from THIS property's admin URL — never copied from another project
- [ ] A real runReport() call succeeded before any dashboard UI was written
- [ ] Data API enabled AND service account added as Viewer on the property
- [ ] Data retention raised from 2 to 14 months (not retroactive)
- [ ] Every event parameter registered as a custom dimension (not retroactive)
- [ ] Key events marked — after the first real traffic, not before
- [ ] `.env.production.example` documents every new var (no real values)
- [ ] Only ONE GA4 tag loads (check the network tab for duplicate `g/collect`)
- [ ] Measured and estimated figures are labelled as such in the UI
- [ ] No raw GA4 identifier reaches a screen or an export ((not set), time_on_page)
- [ ] Choropleth joins on ISO code, not on a localised country name
- [ ] Map has a cursor-following tooltip
- [ ] The PDF is a standalone document, not a print stylesheet over the panel
- [ ] CSV has a BOM, CRLF, and formula-injection guarding
- [ ] loading.tsx exists for every fetching route, and skeletons NO static text
- [ ] Every skeleton shape copied from the real panel markup
- [ ] Text on every accent/primary fill is the dark ink token, never white
- [ ] Every sponsor placement is actually CLICKABLE (see below)
- [ ] No hardcoded UI strings left behind in a page — all through locale files


---

## Part 6b — Generating the GTM container (do not click 18 tags by hand)

Building tags one at a time in the GTM UI is slow and drifts from the code.
Generate the container as JSON and import it.

`scripts/build-gtm-container.mjs` writes `scripts/gtm-container.json` from a
single `EVENTS` array that mirrors `types/analytics.ts`.

### The export schema (v2), minimally

```
containerVersion
  container       { accountId, containerId, name, publicId, usageContext:["WEB"], tagIds }
  variable[]      type "v" = dataLayer variable, "c" = constant
  trigger[]       type "CUSTOM_EVENT", customEventFilter EQUALS {{_event}} == name
  tag[]           type "gaawe" (GA4 event), firingTriggerId -> trigger id
  builtInVariable[]
```

Ids are plain strings (`"1"`, `"2"`) and only need to be internally consistent —
each tag's `firingTriggerId` must name a trigger that exists in the file.

**The numeric `accountId`/`containerId` are placeholders.** GTM remaps them on
import; only `publicId` must match the target container. Copying them from
another project's export is harmless.

### The one thing that must NOT be in the container

```js
// ❌ do not emit a "GA4 Configuration" tag (type "gaawc")
```

If the app already loads GA4 directly (`NEXT_PUBLIC_GA4_ID`), a config tag makes
a second GA4 tag on the page and **every pageview counts twice**. Reference the
measurement id through a constant variable instead:

```js
{ type: "TEMPLATE", key: "measurementIdOverride", value: "{{const - GA4 Measurement ID}}" }
```

(materia-prima's container DOES have a config tag — it lets GTM own GA4. Do not
copy that file wholesale into a project that also sets `NEXT_PUBLIC_GA4_ID`.)

### Validate before handing it over

```python
# every tag's trigger exists, and every {{variable}} resolves
tids = {t["triggerId"] for t in c["trigger"]}
assert all(set(t["firingTriggerId"]) <= tids for t in c["tag"])
refs = set(re.findall(r"{{([^}]+)}}", json.dumps(c["tag"])))
assert all(r in {v["name"] for v in c["variable"]} for r in refs if not r.startswith("_"))
assert "gaawc" not in json.dumps(c["tag"])     # no config tag
```

### Import

Three files end up in `scripts/`. **The one to import is `gtm-container.json`** —
the other two are the generator and its readme:

| File | What it is |
|---|---|
| `gtm-container.json` | ← **import this one** into GTM |
| `build-gtm-container.mjs` | regenerates the JSON; run after adding an event |
| `GTM-IMPORT.md` | the steps below, for whoever does the import |

GTM → Admin → **Import Container** → the JSON → Existing workspace →
**Merge → Overwrite conflicting tags** (never *Overwrite*, which wipes the whole
container) → Preview with Tag Assistant → Publish.

---

## Part 6c — Deploying (Docker): the NEXT_PUBLIC build-arg trap

**`NEXT_PUBLIC_*` variables are inlined into the JS bundle at BUILD time.**
Supplying them only at runtime (`env_file:` or `environment:`) leaves them as
empty strings in the browser, so **no analytics script ever loads** — with no
error, nothing in the logs, and a site that looks completely normal.

The server-side pair behaves the opposite way: `GA4_PROPERTY_ID` and
`GOOGLE_APPLICATION_CREDENTIALS_JSON` are read at runtime and must NOT be build
args (a build arg persists in image history, and one of them is a private key).

| Variable | Build arg | Runtime env |
|---|---|---|
| `NEXT_PUBLIC_GA4_ID` | ✅ required | ✅ harmless |
| `NEXT_PUBLIC_GTM_ID` | ✅ required | ✅ harmless |
| `GA4_PROPERTY_ID` | ❌ | ✅ required |
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | ❌ never | ✅ required |

**Three places**, all needed:

```yaml
# docker-compose.yml
services:
  my-app:
    build:
      args:
        NEXT_PUBLIC_GA4_ID: "G-XXXXXXXXXX"
        NEXT_PUBLIC_GTM_ID: "GTM-XXXXXXX"
    env_file: ./path/.env.local        # the server-side pair lives here
```

```dockerfile
# Dockerfile — ARG + ENV, BEFORE `RUN npm run build`. After it, no effect.
ARG NEXT_PUBLIC_GA4_ID
ARG NEXT_PUBLIC_GTM_ID
ENV NEXT_PUBLIC_GA4_ID=$NEXT_PUBLIC_GA4_ID \
    NEXT_PUBLIC_GTM_ID=$NEXT_PUBLIC_GTM_ID
RUN npm run build
```

### Quoting the credentials JSON — the rule INVERTS per file

```yaml
# environment:  (YAML) → SINGLE-QUOTE the whole value.
# The JSON contains double quotes, so double-quoting it breaks the parse.
- GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type":"service_account",...}'
```
```bash
# env_file      (NOT a shell) → NO quotes at all.
# Docker keeps the quotes as part of the value and JSON.parse then fails.
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}
```

Either way the JSON must be on ONE line.

### `environment:` vs `env_file:` — both fine, pick per project

`environment:` keeps everything visible in one file and is what most Galaga
projects already do (esc_web, bea-miranda, phoenix, galaga_web). `env_file:`
keeps secrets out of the compose file. **`environment:` overrides `env_file`**
when a var appears in both — which is fine, but never leave a stale duplicate
behind, or someone will later edit the copy that is not being used.

Whichever you choose, `NEXT_PUBLIC_*` still has to be a **build arg**. That is
not a preference.

### A complete service block

```yaml
  my-app:
    build:
      context: ./my-app
      dockerfile: Dockerfile
      args:                                  # inlined at BUILD time
        NEXT_PUBLIC_SITE_URL: "https://example.com"
        NEXT_PUBLIC_GA4_ID: "G-XXXXXXXXXX"
        NEXT_PUBLIC_GTM_ID: "GTM-XXXXXXX"
        # ...every other NEXT_PUBLIC_ var the app reads
    container_name: my-app
    restart: always
    ports:
      - "3013:3000"
    environment:                             # read at RUNTIME
      NODE_ENV: production
      GA4_PROPERTY_ID: "properties/123456789"
      GOOGLE_APPLICATION_CREDENTIALS_JSON: '{"type":"service_account",...}'
      # ...every other server-only secret
    networks:
      - my_network
```

**Audit the list before deploying.** Diff the variable NAMES in `.env.local`
against what the service passes — a missing one does not error, it falls back
to the `??` default in `app.config.ts` and quietly does the wrong thing:

```bash
grep -vE '^\s*#|^\s*$' .env.local | sed 's/=.*//' | sort
```

Not every local var belongs in the app's service — e.g. `GOTRUE_SMTP_*` are
consumed by the self-hosted auth container, not by Next.

---

## Part 6d — The admin panel: how the numbers are DISPLAYED

A dashboard that shows GA4's raw output is a worse version of GA4. The value is
in the reading, not the retrieval.

### Never show a raw identifier to a human

GA4 speaks in API identifiers. Every one needs a written label before it reaches
a screen an organiser or a sponsor will look at.

| GA4 returns | Show instead |
|---|---|
| `time_on_page` | "Time on screen" |
| `sponsor_click` | "Sponsor clicked" |
| `(direct)` | "Direct (typed the address)" |
| `(not set)` | "Unidentified" |
| `Unassigned` | "Unclassified" |

Keep a `Set` of GA4's placeholder literals and a lookup of event labels, with a
fallback that tidies an unknown key (`replace(/_/g, " ")`) rather than dropping
the row. Both the panel AND the export must apply them: a sponsor reading
"(not set)" in a spreadsheet is the same failure as on screen.

### Pick the visual from the shape of the data

| Data | Form | Why |
|---|---|---|
| Countries | Choropleth map | Answers "how far did this reach", which a ranked list cannot |
| Devices, channels (2-4 values) | Donut | Share-of-total, readable at a glance |
| Cities, sources, languages (5-15) | Ranked bar list | A donut past ~4 slices is unreadable |
| Users over time | Sparkline / area | Shape matters more than individual values |
| Top pages | Bar list + dwell time | Views alone cannot distinguish "opened" from "read" |
| Events | Table | Two numbers per row, no shape to see |

### The vector world map

`d3-geo` + `topojson-client` + `world-atlas`, **projected on the server**:

```ts
import "server-only"
import topology from "world-atlas/countries-110m.json"
const projection = geoNaturalEarth1().fitSize([800, 400], collection)
// -> [{ code: "ES", d: "M..." }]  plain strings to the client
```

Four things that will cost you:

1. **world-atlas keys by NUMERIC ISO code; GA4 reports alpha-2.** Without a
   numeric→alpha-2 table the join silently matches nothing and you get a blank
   world that looks like a data bug. Generate the table from the atlas against
   `Intl.DisplayNames` rather than hand-typing 174 rows — about 18 abbreviated
   atlas names ("Dem. Rep. Congo", "W. Sahara") need manual patching.
2. **Ask GA4 for `countryId` alongside `country`.** Joining on the display name
   breaks the moment the property's reporting language changes.
3. **Natural Earth 1, not Mercator.** Mercator inflates the far north several
   times over, so an audience map reads as "most of our traffic is Arctic".
4. **Server-side projection is not an optimisation, it is the design.** The
   libraries plus the atlas are far larger than the path strings they produce,
   and the geometry never changes.

A choropleth needs **a tooltip that follows the cursor**. A reading in a header
far from the pointer makes the reader look away from the country they are
pointing at. Draw it inside the SVG (converting client pixels to viewBox units)
so it cannot drift out of sync with the shapes on resize.

### Shading and bar widths: the Tailwind trap, again

Same defect as Part 4.4, and it will reappear on every chart: `fill-[${pct}%]`
and `w-[${pct}%]` are never compiled, because Tailwind scans source text at build
time. Use a written-out step table (5 buckets for shading, 5% steps for widths).
Also true of `rotate-[${deg}deg]` for a wind arrow — snap to the 16-point compass.

**A single row at 100% fills its whole track and reads as a solid block, not a
bar.** Draw the fill only when `rows.length > 1`.

### Separate measured from estimated, and say so

If the app writes its own events to its own tables, show them in a block labelled
**Measured** and GA4's in one labelled **Estimated**, each with a one-line note.
GA4 samples and models the behaviour of anyone who refused cookies, so its
figures are approximations. Presenting them as counts next to auditable
first-party numbers discredits both.

---

## Part 6e — The sponsor report: a document, not a printed screen

"Export to PDF" does not mean "print stylesheet over the admin panel". Three
attempts at that failed on this project, each for a different structural reason:

1. **Print CSS over the dark panel** — dark backgrounds, unreadable on paper.
2. **A React page under `/admin`** — inherited the console shell, so the PDF
   arrived with a sidebar, an "Install app" prompt and a "Log out" button in it.
3. **The same page with the shell escaped** — the app's semantic type classes
   (`.text-body`, `.text-heading`) carry their own colours from the dark theme,
   so half the document rendered white-on-white and looked empty.

### What worked: an API route returning a standalone HTML document

```ts
// app/api/analytics/report/route.ts
return new NextResponse(html, {
  headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
})
```

One template string, its own `<style>` block, system font stack, zero imports
from the app. It opens in a tab, prints to PDF, and can be sent as an `.html`
attachment that opens anywhere. What the organiser sees is exactly what the
sponsor gets.

- **Escape every interpolated value** — country and page names are
  user-influenced (12-SECURITY.md).
- **Literal hex, not design tokens.** A printable document has no access to the
  app's CSS variables, and this is the one surface that is not a dark interface.
- **Hide the print button when printing** (`@media print { .actions { display:none } }`).
  A "Download PDF" button inside the PDF says the document was a screenshot.
- `break-inside: avoid` on sections, rows and figure grids, plus `@page { margin }`.
- `-webkit-print-color-adjust: exact` or the map prints as blank outlines.

### Write it for someone who has never opened Analytics

Not `CTR: 18.2%` but:

> *"Of the 3,063 times the brand appeared on screen, 557 people clicked through
> to learn more: 18.2%."*

Use ICU plurals — "1 personas siguieron" in a document sent to a client is the
detail that makes the rest look careless.

### CSV export, for the spreadsheet half of the ask

- **Prefix the BOM** (`\ufeff`) or Excel on Windows mangles every accent.
- **CRLF line endings**, or rows collapse into one line.
- **Neutralise formula injection**: a cell starting `=`, `+`, `-` or `@` is
  executed by Excel. Prefix with `'`.
- Quote every field and double internal quotes.
- Blank line between blocks so Excel shows separate tables.
- Same labels as the panel — never raw event ids.

Two formats because they answer different asks: the spreadsheet is for someone
who wants to work with the numbers, the PDF for someone who wants to be shown
them. Ship both.

---

## Part 6f — Loading skeletons

A GA4 panel waits on ~13 API round-trips. Without a `loading.tsx` the console
shows the *previous* page frozen for seconds, which reads as a broken click.

```
app/[locale]/admin/analitica/loading.tsx   -> rendered instantly on navigation
```

**Two rules, and both were learned by getting them wrong:**

**1. Never skeleton static text.** Titles, eyebrows, intro paragraphs, section
headings, table column headers and stat LABELS are not fetched — only the
figures are. Greying them out flashes a fake loading state over text that was
already available, and gives the reader less than the finished page.

```tsx
// ❌ the label was never loading
<Skeleton className="h-8 w-20" />
<Skeleton className="mt-3 h-3 w-24" />

// ✅ number loads, label does not
<Skeleton className="h-8 w-20" />
<dt className="eyebrow mt-3 text-text-subtle">{label}</dt>
```

**2. Read the panel's real markup; do not write the skeleton from memory.** A
placeholder in the wrong shape causes a visible jump when content lands, which
is worse than no skeleton. Copy the actual container classes — if the panel is a
striped `<ul>` in a bordered box, the skeleton is too; if it is a full-bleed map
with a floating list, a card grid is wrong.

Shimmer over pulse (a sweep reads as content arriving, a pulse as blinking), and
disable the animation under `prefers-reduced-motion` — the shape still says
"loading" without it.

---

## Part 7 — Check the tracking is not measuring nothing

Wiring GA4 is the easy half. The failure that actually costs money is a metric
that is **structurally always zero** and nobody notices until the sponsor asks.

Audit these before declaring done:

**Are the placements clickable at all?**
On fronton-king the sponsor logos were `<li><Image/></li>` — display only. The
impression pipeline was perfect, the click pipeline existed in code, and CTR
could never have been anything but 0%. The `website_url` column was populated,
loaded through the service layer, and then silently dropped at render.

```bash
# Does the click helper exist but never get called?
grep -rn "trackSponsorClick\|trackConversion" components/ | grep -v "hooks/\|services/"
# Empty output = the metric is decorative
```

**Is an impression an impression?**
Count on `IntersectionObserver` (threshold ~0.5), never on mount. A logo below
the fold that nobody scrolled to is not an impression, and counting it inflates
the exact number the sponsor is paying against. Batch the beacon (~400ms) or a
sponsor strip fires one request per logo.

**Does the funnel have both ends?**
A conversion event with no corresponding impression event gives a rate with no
denominator. Check each metric shown in a console has every input it needs.

**Rule of thumb:** for every number the UI promises a client, trace it back to
the line of code that writes it. If you cannot find that line, the number is
zero and the dashboard is lying politely.
