import { cookies } from "next/headers"
import { verifySession } from "@/lib/admin-auth"
import { RequestAccessButton } from "@/components/admin/RequestAccessButton"
import TopPages from "@/components/admin/TopPages"
import TrafficSources from "@/components/admin/TrafficSources"
import AnalyticsChartWrapper from "@/components/admin/AnalyticsChartWrapper"
import type { Metadata } from "next"

type AnalyticsData = {
  users:              string
  pageviews:          string
  bounceRate:         string
  sessions:           string
  avgSessionDuration: string
  newUsers:           string
  daily:    { date: string; users: number; pageviews: number }[]
  topPages: { path: string; views: number }[]
  sources:  { channel: string; sessions: number; pct: number }[]
}

async function getAnalytics(session: string): Promise<AnalyticsData | null> {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
    const res  = await fetch(`${base}/api/admin/analytics`, {
      headers: { Cookie: `admin_session=${session}` },
      cache: "no-store",
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export const metadata: Metadata = {
  title: "Admin — Thomas Augot",
  robots: { index: false, follow: false },
}

export default async function AdminPage() {
  const store   = await cookies()
  const session = store.get("admin_session")?.value ?? ""
  const isAuth  = session ? verifySession(session) : false

  if (isAuth) {
    const analytics = await getAnalytics(session)

    const stats = [
      { label: "Visitors (28d)",    value: analytics?.users              ?? "—" },
      { label: "Page views (28d)",  value: analytics?.pageviews          ?? "—" },
      { label: "Bounce rate (28d)", value: analytics?.bounceRate         ?? "—" },
      { label: "Sessions (28d)",    value: analytics?.sessions           ?? "—" },
      { label: "Avg duration",      value: analytics?.avgSessionDuration ?? "—" },
      { label: "New users (28d)",   value: analytics?.newUsers           ?? "—" },
    ]

    return (
      <div className="min-h-screen p-8 md:p-16">
        <div className="max-w-5xl mx-auto">

          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
              <span className="font-mono text-xs tracking-widest uppercase text-text-subtle">
                Admin dashboard
              </span>
            </div>
            <form action="/api/admin/logout" method="POST">
              <button
                type="submit"
                className="font-mono text-xs tracking-widest uppercase text-text-subtle hover:text-text transition-colors duration-200"
              >
                Log out →
              </button>
            </form>
          </div>

          <h1 className="text-title text-text mb-1">Dashboard</h1>
          <p className="text-text-muted font-mono text-sm mb-12">thomas.augot@gmail.com</p>

          {!analytics ? (
            <div className="border border-border p-6">
              <p className="font-mono text-xs text-text-subtle tracking-widest uppercase mb-2">Status</p>
              <p className="text-error font-mono text-sm">
                Could not load analytics. Add the service account to GA4 property access first.
              </p>
            </div>
          ) : (
            <div className="space-y-4">

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {stats.map(({ label, value }) => (
                  <div key={label} className="border border-border p-6">
                    <p className="font-mono text-xs text-text-subtle tracking-widest uppercase mb-3">{label}</p>
                    <p className="text-3xl font-semibold text-text">{value}</p>
                  </div>
                ))}
              </div>

              <div className="border border-border p-6">
                <p className="font-mono text-xs text-text-subtle tracking-widest uppercase mb-2">
                  Visitors & page views — 28 days
                </p>
                <div className="flex gap-5 mb-6">
                  <span className="flex items-center gap-2 font-mono text-xs text-text-subtle">
                    <span className="w-4 h-px bg-primary inline-block" />
                    Visitors
                  </span>
                  <span className="flex items-center gap-2 font-mono text-xs text-text-subtle">
                    <span className="w-4 h-px bg-text-subtle inline-block" />
                    Page views
                  </span>
                </div>
                <AnalyticsChartWrapper data={analytics.daily} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TopPages pages={analytics.topPages} />
                <TrafficSources sources={analytics.sources} />
              </div>

            </div>
          )}

        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center space-y-6 max-w-sm w-full">

        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="font-mono text-xs tracking-widest uppercase text-text-subtle">
            Restricted
          </span>
        </div>

        <h1 className="text-2xl font-semibold text-text">Admin access</h1>

        <p className="text-text-muted font-mono text-sm leading-relaxed">
          A one-time magic link will be sent to the admin email.
        </p>

        <RequestAccessButton />

      </div>
    </div>
  )
}
