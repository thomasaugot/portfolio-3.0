"use client"

import dynamic from "next/dynamic"

type Point = { date: string; users: number; pageviews: number }

const AnalyticsChart = dynamic(() => import("./AnalyticsChart"), { ssr: false })

export default function AnalyticsChartWrapper({ data }: { data: Point[] }) {
  return <AnalyticsChart data={data} />
}
