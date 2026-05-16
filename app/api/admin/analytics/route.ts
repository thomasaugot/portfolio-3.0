import { BetaAnalyticsDataClient } from "@google-analytics/data"
import { NextResponse } from "next/server"
import { verifySession } from "@/lib/admin-auth"
import { cookies } from "next/headers"

const propertyId = process.env.GA4_PROPERTY_ID!

function getAnalyticsClient() {
  const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON!)
  return new BetaAnalyticsDataClient({ credentials })
}

function fmtDuration(s: string) {
  const sec = parseFloat(s)
  const m   = Math.floor(sec / 60)
  const r   = Math.round(sec % 60)
  return m > 0 ? `${m}m ${r}s` : `${r}s`
}

export async function GET() {
  try {
    const store   = await cookies()
    const session = store.get("admin_session")?.value ?? ""
    if (!session || !verifySession(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const analyticsDataClient = getAnalyticsClient()
    const RANGE = { startDate: "28daysAgo", endDate: "today" }

    const [summary] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [RANGE],
      metrics: [
        { name: "activeUsers" },
        { name: "screenPageViews" },
        { name: "bounceRate" },
        { name: "sessions" },
        { name: "averageSessionDuration" },
        { name: "newUsers" },
      ],
    })

    const [daily] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [RANGE],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    })

    const [topPagesResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [RANGE],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 5,
    })

    const [sourcesResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [RANGE],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    })

    const [countriesResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [RANGE],
      dimensions: [{ name: "country" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 100,
    })

    const [citiesResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [RANGE],
      dimensions: [{ name: "city" }, { name: "country" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 10,
    })

    const [osResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [RANGE],
      dimensions: [{ name: "operatingSystem" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
    })

    const [deviceResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [RANGE],
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
    })

    const [browserResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [RANGE],
      dimensions: [{ name: "browser" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
    })

    const row = summary.rows?.[0]?.metricValues

    const dailyData = (daily.rows ?? []).map(r => ({
      date:      r.dimensionValues?.[0]?.value ?? "",
      users:     parseInt(r.metricValues?.[0]?.value ?? "0"),
      pageviews: parseInt(r.metricValues?.[1]?.value ?? "0"),
    }))

    const topPages = (topPagesResponse.rows ?? []).map(r => ({
      path:  r.dimensionValues?.[0]?.value ?? "/",
      views: parseInt(r.metricValues?.[0]?.value ?? "0"),
    }))

    const totalSessions = (sourcesResponse.rows ?? []).reduce(
      (sum: number, r) => sum + parseInt(r.metricValues?.[0]?.value ?? "0"), 0
    )
    const sources = (sourcesResponse.rows ?? []).map(r => {
      const sessions = parseInt(r.metricValues?.[0]?.value ?? "0")
      return {
        channel:  r.dimensionValues?.[0]?.value ?? "Unknown",
        sessions,
        pct: totalSessions > 0 ? Math.round((sessions / totalSessions) * 100) : 0,
      }
    })

    const countries = (countriesResponse.rows ?? [])
      .map(r => ({
        name:  r.dimensionValues?.[0]?.value ?? "Unknown",
        users: parseInt(r.metricValues?.[0]?.value ?? "0"),
      }))
      .filter(c => c.name !== "(not set)" && c.name !== "Unknown")

    const cities = (citiesResponse.rows ?? [])
      .map(r => ({
        city:    r.dimensionValues?.[0]?.value ?? "Unknown",
        country: r.dimensionValues?.[1]?.value ?? "",
        users:   parseInt(r.metricValues?.[0]?.value ?? "0"),
      }))
      .filter(c => c.city !== "(not set)" && c.city !== "Unknown")

    const totalOsUsers = (osResponse.rows ?? []).reduce(
      (sum: number, r) => sum + parseInt(r.metricValues?.[0]?.value ?? "0"), 0
    )
    const os = (osResponse.rows ?? []).map(r => {
      const users = parseInt(r.metricValues?.[0]?.value ?? "0")
      return {
        name: r.dimensionValues?.[0]?.value ?? "Unknown",
        users,
        pct: totalOsUsers > 0 ? Math.round((users / totalOsUsers) * 100) : 0,
      }
    })

    const totalDeviceUsers = (deviceResponse.rows ?? []).reduce(
      (sum: number, r) => sum + parseInt(r.metricValues?.[0]?.value ?? "0"), 0
    )
    const devices = (deviceResponse.rows ?? []).map(r => {
      const users = parseInt(r.metricValues?.[0]?.value ?? "0")
      return {
        name: r.dimensionValues?.[0]?.value ?? "Unknown",
        users,
        pct: totalDeviceUsers > 0 ? Math.round((users / totalDeviceUsers) * 100) : 0,
      }
    })

    const totalBrowserUsers = (browserResponse.rows ?? []).reduce(
      (sum: number, r) => sum + parseInt(r.metricValues?.[0]?.value ?? "0"), 0
    )
    const browsers = (browserResponse.rows ?? []).map(r => {
      const users = parseInt(r.metricValues?.[0]?.value ?? "0")
      return {
        name: r.dimensionValues?.[0]?.value ?? "Unknown",
        users,
        pct: totalBrowserUsers > 0 ? Math.round((users / totalBrowserUsers) * 100) : 0,
      }
    })

    return NextResponse.json({
      users:              row?.[0]?.value ?? "—",
      pageviews:          row?.[1]?.value ?? "—",
      bounceRate:         row?.[2]?.value ? (parseFloat(row[2].value) * 100).toFixed(1) + "%" : "—",
      sessions:           row?.[3]?.value ?? "—",
      avgSessionDuration: row?.[4]?.value ? fmtDuration(row[4].value) : "—",
      newUsers:           row?.[5]?.value ?? "—",
      daily:              dailyData,
      topPages,
      sources,
      countries,
      cities,
      os,
      devices,
      browsers,
    })
  } catch (error) {
    console.error("Analytics API error:", error)
    console.error("Error details:", JSON.stringify(error, Object.getOwnPropertyNames(error as object)))
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 })
  }
}
