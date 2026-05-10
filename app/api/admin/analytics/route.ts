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
