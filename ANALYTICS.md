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

### 1. Prerequisites

- Google Cloud Console → create a service account → download JSON key  
- GA4 → Admin → Property access management → add service account email as Viewer  
- Add to `.env.local`:

```
GA4_PROPERTY_ID=properties/XXXXXXXXX
GA4_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

### 2. Install GA4 Data SDK

```bash
npm install @google-analytics/data
```

### 3. Create `app/api/admin/analytics/route.ts`

```ts
import { BetaAnalyticsDataClient } from "@google-analytics/data"
import { verifySession } from "@/lib/admin-auth"
import { cookies } from "next/headers"

const client = new BetaAnalyticsDataClient({
  credentials: JSON.parse(process.env.GA4_SERVICE_ACCOUNT_KEY!),
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

### 4. Update admin page

Fetch analytics server-side inside the authenticated branch of `app/admin/page.tsx` and pass data to the stat panels.

---

## Next.js 16 specifics

- GTM goes in `app/[locale]/layout.tsx`, not root  
- No `middleware.ts` — if any route protection is needed, edit `proxy.ts`  
- `cookies()` is async (already handled)  
- API routes (`/api/admin/analytics`) are excluded from the proxy automatically

---

## Checklist

### Phase 1
- [ ] Decide: reuse `GTM-TXWLJD7N` or create new container
- [ ] Create new GA4 property for helloimtom.dev
- [ ] Connect GA4 to GTM (Google Tag, All Pages trigger)
- [ ] `npm install @next/third-parties@latest`
- [ ] Create `utils/gtm-events.ts`
- [ ] Create `hooks/useAnalyticsTracking.ts`
- [ ] Create `components/AnalyticsTracker.tsx`
- [ ] Add `GoogleTagManager` + `AnalyticsTracker` to locale layout
- [ ] Add `data-cta_*` attributes to CTAs
- [ ] Configure GTM tags for all events
- [ ] Register custom dimensions in GA4
- [ ] Verify via GTM Preview + GA4 Realtime

### Phase 2
- [ ] Create Google Cloud service account
- [ ] Grant Viewer access in GA4
- [ ] Add `GA4_PROPERTY_ID` + `GA4_SERVICE_ACCOUNT_KEY` to `.env.local`
- [ ] `npm install @google-analytics/data`
- [ ] Create `/api/admin/analytics` route
- [ ] Update admin page panels with live data
