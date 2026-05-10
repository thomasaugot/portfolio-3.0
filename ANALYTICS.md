# Analytics Setup — helloimtom.dev

## Stack decision

**GA4 + GTM** (same approach as galaga-agency-web).  

- Google Tag Manager handles tag injection and event routing  
- GA4 receives all events  
- The GA4 Data API feeds live metrics into the `/admin` dashboard  
- GTM ID from galaga: `GTM-TXWLJD7N` — decide whether to reuse it or create a separate container for the portfolio (recommended: same GTM container, new GA4 property)

---

## Phase 1 — Frontend tracking

### 1. Install `@next/third-parties`

```bash
npm install @next/third-parties@latest
```

### 2. Add GTM to the locale layout

In `app/[locale]/layout.tsx` (not root layout — GTM goes inside the locale subtree):

```tsx
import { GoogleTagManager } from "@next/third-parties/google"

export default function LocaleLayout({ children }) {
  return (
    <>
      <GoogleTagManager gtmId="GTM-XXXXXXX" />
      {children}
    </>
  )
}
```

### 3. Create `utils/gtm-events.ts`

```ts
interface GTMEvent { event: string; [key: string]: unknown }

export const pushToDataLayer = (data: GTMEvent) => {
  if (typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push(data)
  }
}

export const trackCTAClick = (text: string, url: string) =>
  pushToDataLayer({ event: "cta_click", cta_text: text, cta_url: url })

export const trackScrollDepth = (percent: number) =>
  pushToDataLayer({ event: "scroll_depth", scroll_percent: percent.toString() })

export const trackProjectClick = (name: string, url: string) =>
  pushToDataLayer({ event: "project_click", project_name: name, project_url: url })

export const trackExternalLink = (label: string, url: string) =>
  pushToDataLayer({ event: "external_link", link_label: label, link_url: url })

declare global { interface Window { dataLayer: Record<string, unknown>[] } }
```

### 4. Create `hooks/useAnalyticsTracking.ts`

```ts
"use client"
import { useEffect, useRef } from "react"
import { trackCTAClick, trackScrollDepth } from "@/utils/gtm-events"

export function useAnalyticsTracking() {
  const scrollThresholds = useRef(new Set<number>())
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const handleClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest("[data-cta_click='true']")
      if (el) {
        trackCTAClick(
          el.getAttribute("data-cta_text") ?? "",
          el.getAttribute("data-cta_url") ?? ""
        )
      }
    }

    const handleScroll = () => {
      const pct = Math.round(
        ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100
      )
      for (const milestone of [25, 50, 75, 90]) {
        if (pct >= milestone && !scrollThresholds.current.has(milestone)) {
          scrollThresholds.current.add(milestone)
          trackScrollDepth(milestone)
        }
      }
    }

    document.addEventListener("click", handleClick, true)
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    return () => {
      document.removeEventListener("click", handleClick, true)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])
}
```

### 5. Create `components/AnalyticsTracker.tsx`

```tsx
"use client"
import { useAnalyticsTracking } from "@/hooks/useAnalyticsTracking"

export default function AnalyticsTracker() {
  useAnalyticsTracking()
  return null
}
```

Add to `app/[locale]/layout.tsx`:

```tsx
import AnalyticsTracker from "@/components/AnalyticsTracker"
// inside the layout return:
<AnalyticsTracker />
```

### 6. Mark CTAs with data attributes

```tsx
<Link
  href="/contact"
  data-cta_click="true"
  data-cta_text="Contact"
  data-cta_url="/contact"
>
  Contact
</Link>
```

Apply to: contact button, GitHub link, LinkedIn link, CV download.  
For project cards: use `trackProjectClick` directly in the onClick handler.

### 7. Events to track

| Event | How triggered | Parameters |
|---|---|---|
| `cta_click` | `data-cta_click="true"` attribute | `cta_text`, `cta_url` |
| `scroll_depth` | 25 / 50 / 75 / 90% scroll | `scroll_percent` |
| `project_click` | Project card onClick | `project_name`, `project_url` |
| `external_link` | GitHub / LinkedIn / CV | `link_label`, `link_url` |
| `contact_submit` | Contact form success | — |

### 8. GTM configuration (no code — done in GTM UI)

See Medium article for full steps. Tags needed:

- **GA4 — Page View**: Google Tag, Measurement ID, trigger: All Pages  
- **GA4 — CTA Click**: Custom event trigger `cta_click`, params: `cta_text`, `cta_url`  
- **GA4 — Scroll Depth**: Scroll depth trigger (25/50/75/90%), param: `scroll_percent`  
- **GA4 — Project Click**: Custom event trigger `project_click`, params: `project_name`, `project_url`  
- **GA4 — External Link**: Custom event trigger `external_link`, params: `link_label`, `link_url`  

### 9. Register custom dimensions in GA4

GA4 → Admin → Custom definitions → Create custom dimension for each:

| Dimension name | Scope | Event parameter |
|---|---|---|
| CTA Text | Event | `cta_text` |
| CTA URL | Event | `cta_url` |
| Scroll Percent | Event | `scroll_percent` |
| Project Name | Event | `project_name` |
| Link Label | Event | `link_label` |

---

## Phase 2 — Admin dashboard (live GA4 metrics)

Fills the Visitors / Page views / Bounce rate panels in `/admin`.

### 1. Create a GCP project and service account

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → create a project (or use an existing one)  
   **This project:** `portfolio-495912`

2. In the project: **IAM & Admin → Service Accounts → Create Service Account**  
   - Give it a name (e.g. `portfolio-3-0`)  
   - No GCP IAM role is needed — GA4 access is managed separately  
   - Click **"Create and continue"** → **"Done"**

3. Click on the service account → **Keys → Add Key → Create new key → JSON** → download  
   **This project:** key file is `portfolio-495912-783afa2e69af.json` (gitignored via `portfolio-495912-*.json`)  
   **Service account email:** `portfolio-3-0@portfolio-495912.iam.gserviceaccount.com`

4. Enable the Analytics Data API in the project:  
   **APIs & Services → Enable APIs → search "Google Analytics Data API" → Enable**  
   (This is the read API used by the backend — different from the Admin API used for access management)

### 2. Create a GA4 property

1. Go to [analytics.google.com](https://analytics.google.com) → **Admin → Create Property**  
2. Set up a web data stream for the domain  
3. Note the **Property ID** (numeric, e.g. `536971523`) and **Measurement ID** (e.g. `G-WHSS079Y0M`)  
   **This project:** property "portfolio 3.0", ID `536971523`, Measurement ID `G-WHSS079Y0M`

### 3. Grant the service account access to GA4

**The GA4 UI does not work for service account emails — see "Known Issue & Runbook" below.**  
Skip this step and follow the runbook instead.

### 4. Add to `.env.local`

```
GA4_PROPERTY_ID=properties/536971523
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account","project_id":"portfolio-495912",...full JSON key content on one line...}
```

The JSON key must be on a single line — copy the entire content of the downloaded `.json` file and paste it as the value. No line breaks.

---

### ⚠️ Known Issue: GA4 UI rejects service account emails — full runbook

#### The problem

The GA4 property access management UI shows:
> **"Cette adresse e-mail ne correspond à aucun compte Google"**

for any `*.iam.gserviceaccount.com` address. This is a known GA4 UI bug — the UI validates that the email belongs to a consumer Gmail or Google Workspace account. GCP service accounts look like email addresses but are not Google accounts, so the validation always fails.

Things that do NOT fix this:
- Creating a new service account — tried `helloimtom-analytics@portfolio-495912.iam.gserviceaccount.com`, then deleted it and created `portfolio-3-0@portfolio-495912.iam.gserviceaccount.com` → same rejection on both
- Creating a new GA4 property — tried on both the original property (`435357178`) and the new one (`536971523`) → same rejection on both
- Unchecking "notify user by email" in the GA4 access management form → same rejection
- Switching the property: the original property `435357178` ("angular-ecommerce-cd707") was also Firebase-linked, which caused additional access issues; we created a new GA4 property "portfolio 3.0" (`536971523`) but that didn't fix the service account rejection either

The UI will never work for service account emails. The only fix is the Analytics Admin API.

---

#### Context: why we needed the API at all

Once the GA4 UI was confirmed broken for service accounts, the next step was the **Google Analytics Admin API** — which can manage property access programmatically and does not have the email validation bug.

The API base URL is `https://analyticsadmin.googleapis.com`. The method to grant access is `properties.accessBindings.create`. Authentication must be done as a user (or service account) that already has admin access to the property — in this case, the Google account that owns the GA4 property.

We opened **Google Cloud Shell** (terminal icon in console.cloud.google.com — always available, always authenticated as your GCP user) to run the API calls.

---

#### Failed attempt 1 — Analytics Admin API v1beta (404)

```bash
curl -X POST \
  "https://analyticsadmin.googleapis.com/v1beta/properties/536971523/accessBindings" \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  -d '{"user":"portfolio-3-0@portfolio-495912.iam.gserviceaccount.com","roles":["predefinedRoles/viewer"]}'
```

**Result:** HTML 404 page from Google.  
**Why:** The `accessBindings` endpoint does not exist in `v1beta`. It is only available in `v1alpha`.

---

#### Failed attempt 2 — v1alpha with default gcloud token (403)

```bash
curl -X POST \
  "https://analyticsadmin.googleapis.com/v1alpha/properties/536971523/accessBindings" \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  -d '{"user":"portfolio-3-0@portfolio-495912.iam.gserviceaccount.com","roles":["predefinedRoles/viewer"]}'
```

**Result:**
```json
{
  "error": {
    "code": 403,
    "message": "Request had insufficient authentication scopes.",
    "status": "PERMISSION_DENIED"
  }
}
```
**Why:** `gcloud auth print-access-token` returns a token scoped to `cloud-platform`, which does not include `analytics.manage.users`. Google Analytics is not a Cloud Platform product — its API requires its own OAuth scope.

---

#### Failed attempt 3 — gcloud auth with analytics scope (blocked by Google)

```bash
gcloud auth application-default login \
  --scopes=https://www.googleapis.com/auth/analytics.manage.users,https://www.googleapis.com/auth/cloud-platform
```

Cloud Shell opened a browser auth URL. When opened in the browser, Google showed:
> **"Cette application est bloquée"**

**Why:** `analytics.manage.users` is a restricted OAuth scope. Google requires any OAuth app requesting it to go through their security review process. The gcloud CLI's own OAuth client (`764086051850-6qr4p6gpi6hn506pt8ejuq83di341hur`) has not been cleared for this scope, so Google hard-blocks the request — no workaround exists for this flow.

---

#### What finally worked — OAuth Playground + v1alpha

The OAuth Playground (`developers.google.com/oauthplayground`) uses **Google's own verified OAuth client** (`407408718192.apps.googleusercontent.com`), which has been cleared for all Google API scopes including restricted ones. This bypasses the block.

**Steps (one-time per service account per property):**

1. Go to **developers.google.com/oauthplayground**

2. In the scope input at the top of the left panel, paste:
   ```
   https://www.googleapis.com/auth/analytics.manage.users
   ```
   Click **"Authorize APIs"** → sign in with the Google account that owns the GA4 property → approve

3. In Step 2 of the Playground, click **"Exchange authorization code for tokens"**

4. Copy the `access_token` from the JSON response (valid for ~1 hour)

5. Run this from any terminal:
   ```bash
   curl -X POST \
     "https://analyticsadmin.googleapis.com/v1alpha/properties/YOUR_PROPERTY_ID/accessBindings" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"user":"YOUR_SA@YOUR_PROJECT.iam.gserviceaccount.com","roles":["predefinedRoles/viewer"]}'
   ```

6. Success response:
   ```json
   {
     "name": "properties/XXXXXXX/accessBindings/XXXXXX",
     "user": "your-sa@your-project.iam.gserviceaccount.com",
     "roles": ["predefinedRoles/viewer"]
   }
   ```

7. Restart the dev server — the admin dashboard will show live GA4 data.

**For this project specifically:**
- Property ID: `536971523`
- Service account: `portfolio-3-0@portfolio-495912.iam.gserviceaccount.com`
- Key file: `portfolio-495912-783afa2e69af.json` (gitignored)
- Env var: `GOOGLE_APPLICATION_CREDENTIALS_JSON` in `.env.local`

---

### 5. Install GA4 Data SDK

```bash
npm install @google-analytics/data
```

### 6. Create `app/api/admin/analytics/route.ts`

```ts
import { BetaAnalyticsDataClient } from "@google-analytics/data"
import { verifySession } from "@/lib/admin-auth"
import { cookies } from "next/headers"

const client = new BetaAnalyticsDataClient({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON!),
})

export async function GET() {
  const store = await cookies()
  const session = store.get("admin_session")?.value ?? ""
  if (!session || !verifySession(session)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [res] = await client.runReport({
    property: process.env.GA4_PROPERTY_ID,
    dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
    metrics: [
      { name: "activeUsers" },
      { name: "screenPageViews" },
      { name: "bounceRate" },
    ],
  })

  const row = res.rows?.[0]?.metricValues
  return Response.json({
    users:      row?.[0]?.value ?? "—",
    pageviews:  row?.[1]?.value ?? "—",
    bounceRate: row?.[2]?.value
      ? (parseFloat(row[2].value) * 100).toFixed(1) + "%"
      : "—",
  })
}
```

### 7. Update admin page

Fetch analytics server-side inside the authenticated branch of `app/admin/page.tsx`. The page is a server component so it can forward the session cookie directly to the internal API route:

```ts
async function getAnalytics(session: string) {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
    const res = await fetch(`${base}/api/admin/analytics`, {
      headers: { Cookie: `admin_session=${session}` },
      cache: "no-store",
    })
    if (!res.ok) return null
    return res.json() as Promise<{ users: string; pageviews: string; bounceRate: string }>
  } catch {
    return null
  }
}
```

Render the three stat panels with `analytics?.users ?? "—"` etc. If `analytics` is null, show an error message — this usually means the service account does not yet have GA4 access (run the runbook above).

---

## Other issues hit during setup

### Env var name — `GA4_SERVICE_ACCOUNT_KEY` vs `GOOGLE_APPLICATION_CREDENTIALS_JSON`

The analytics route was originally written with `GA4_SERVICE_ACCOUNT_KEY` as the env var name. This was renamed to `GOOGLE_APPLICATION_CREDENTIALS_JSON` to match the convention used in other projects. If the dashboard silently returns `"—"` for all values, check that the env var name in `route.ts` and in `.env.local` match exactly.

### TypeScript conflict in `utils/gtm-events.ts` — `declare global`

Adding `declare global { interface Window { dataLayer: Record<string, unknown>[] } }` to `gtm-events.ts` caused a TypeScript conflict because `@next/third-parties` already declares `window.dataLayer` as `Object[] | undefined`. Two declarations for the same property with different types causes a build error.

**Fix:** remove the `declare global` block entirely and use a type assertion + guard instead:
```ts
if (typeof window !== "undefined" && Array.isArray(window.dataLayer)) {
  ;(window.dataLayer as GTMEvent[]).push(data)
}
```

---

## Next.js 16 specifics

- GTM goes in `app/[locale]/layout.tsx`, not root  
- No `middleware.ts` — if any route protection is needed, edit `proxy.ts`  
- `cookies()` is async (already handled)  
- API routes (`/api/admin/analytics`) are excluded from the proxy automatically

---

## Checklist

### Phase 1
- [x] New GTM container created: `GTM-M6GQ2N7Z`
- [x] New GA4 property created: "portfolio 3.0" — ID `536971523`, Measurement ID `G-WHSS079Y0M`
- [x] Connect GA4 to GTM (GA4 Configuration tag, All Pages trigger)
- [x] `npm install @next/third-parties@latest`
- [x] Create `utils/gtm-events.ts`
- [x] Create `hooks/useAnalyticsTracking.ts`
- [x] Create `components/AnalyticsTracker.tsx`
- [x] Add `GoogleTagManager` + `AnalyticsTracker` to locale layout
- [x] Add `data-cta_*` attributes to hero CTAs, social links, footer links
- [x] Add `trackProjectClick` to work page project rows
- [x] Add `contact_submit` event to contact form
- [ ] Configure remaining GTM tags: cta_click, project_click, contact_submit, scroll_depth
- [ ] Register custom dimensions in GA4 (cta_text, cta_url, scroll_percent, project_name, project_url)
- [ ] Verify via GTM Preview + GA4 Realtime

### Phase 2
- [x] Create Google Cloud service account
- [x] Grant Viewer access via Analytics Admin API (OAuth Playground — see Known Issue above)
- [x] Add `GA4_PROPERTY_ID` + `GOOGLE_APPLICATION_CREDENTIALS_JSON` to `.env.local`
- [x] `npm install @google-analytics/data`
- [x] Create `/api/admin/analytics` route
- [x] Update admin page panels with live data
