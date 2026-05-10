"use client"

import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts"

type Point = { date: string; users: number; pageviews: number }

interface TooltipPayload {
  name: string
  value: number
  color: string
  dataKey: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}

function formatDate(d: string) {
  const year  = parseInt(d.slice(0, 4))
  const month = parseInt(d.slice(4, 6)) - 1
  const day   = parseInt(d.slice(6, 8))
  return new Date(year, month, day).toLocaleDateString("en", { month: "short", day: "numeric" })
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background:   "var(--color-surface)",
      border:       "1px solid var(--color-border)",
      padding:      "8px 12px",
    }}>
      <p style={{
        fontFamily:    "var(--font-mono)",
        fontSize:      "10px",
        color:         "var(--color-text-subtle)",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        marginBottom:  4,
      }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: p.color }}>
          {p.name}: {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

export default function AnalyticsChart({ data }: { data: Point[] }) {
  if (!data.length) {
    return (
      <div className="h-[180px] flex items-center justify-center">
        <p className="font-mono text-xs text-text-subtle">No data yet</p>
      </div>
    )
  }

  const formatted = data.map(d => ({ ...d, label: formatDate(d.date) }))

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={formatted} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--color-border)" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "var(--color-text-subtle)" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "var(--color-text-subtle)" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="users"
          stroke="var(--color-primary)"
          strokeWidth={1.5}
          dot={false}
          name="Visitors"
        />
        <Line
          type="monotone"
          dataKey="pageviews"
          stroke="var(--color-text-subtle)"
          strokeWidth={1.5}
          dot={false}
          name="Page views"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
