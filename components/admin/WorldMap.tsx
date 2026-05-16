"use client"

import { useEffect, useRef } from "react"
import "jsvectormap/dist/jsvectormap.css"

const NAME_TO_ISO: Record<string, string> = {
  "United States": "US", "United Kingdom": "GB", "Spain": "ES", "France": "FR",
  "Germany": "DE", "Italy": "IT", "Canada": "CA", "Mexico": "MX", "Brazil": "BR",
  "Argentina": "AR", "Australia": "AU", "Japan": "JP", "China": "CN", "India": "IN",
  "Russia": "RU", "Netherlands": "NL", "Belgium": "BE", "Portugal": "PT", "Sweden": "SE",
  "Norway": "NO", "Denmark": "DK", "Finland": "FI", "Poland": "PL", "Switzerland": "CH",
  "Austria": "AT", "Ireland": "IE", "New Zealand": "NZ", "South Korea": "KR",
  "Singapore": "SG", "Thailand": "TH", "Vietnam": "VN", "Malaysia": "MY",
  "Indonesia": "ID", "Philippines": "PH", "Turkey": "TR", "Saudi Arabia": "SA",
  "United Arab Emirates": "AE", "Israel": "IL", "Egypt": "EG", "South Africa": "ZA",
  "Chile": "CL", "Colombia": "CO", "Peru": "PE", "Venezuela": "VE", "Greece": "GR",
  "Czechia": "CZ", "Hungary": "HU", "Romania": "RO", "Ukraine": "UA",
}

type Country = { name: string; users: number }

export default function WorldMap({ countries }: { countries: Country[] }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<{ destroy: () => void } | null>(null)

  useEffect(() => {
    if (!mapRef.current || countries.length === 0) return

    let cancelled = false

    ;(async () => {
      // @ts-expect-error - jsvectormap has no types
      const { default: jsVectorMap } = await import("jsvectormap")
      // @ts-expect-error - world map module side-effect
      await import("jsvectormap/dist/maps/world")
      if (cancelled || !mapRef.current) return

      if (mapInstance.current) {
        try { mapInstance.current.destroy() } catch {}
        mapInstance.current = null
      }

      const values: Record<string, number> = {}
      countries.forEach(c => {
        const iso = NAME_TO_ISO[c.name]
        if (iso) values[iso] = c.users
      })

      try {
        mapInstance.current = new jsVectorMap({
          selector: mapRef.current,
          map: "world",
          backgroundColor: "transparent",
          visualizeData: {
            scale: ["#8a8473", "#1a1a17"],
            values,
          },
          regionStyle: {
            initial: { fill: "var(--color-surface-2)", stroke: "var(--color-bg)", strokeWidth: 1 },
            hover: { fillOpacity: 0.85, cursor: "pointer" },
          },
          onRegionTooltipShow(event: Event, tooltip: { text: (s: string, html?: boolean) => void }, code: string) {
            const name = Object.keys(NAME_TO_ISO).find(k => NAME_TO_ISO[k] === code)
            const users = values[code]
            if (users && name) {
              tooltip.text(`<div style="font-family:var(--font-mono);font-size:12px;padding:6px 10px;background:#1a1a17;color:#f4f1e8;border:1px solid #d4ff3a"><b>${name}</b> · ${users.toLocaleString()}</div>`, true)
            } else {
              event.preventDefault()
            }
          },
          zoomOnScroll: false,
          zoomButtons: false,
        })
      } catch (e) {
        console.error("WorldMap init error", e)
      }
    })()

    return () => {
      cancelled = true
      if (mapInstance.current) {
        try { mapInstance.current.destroy() } catch {}
        mapInstance.current = null
      }
    }
  }, [countries])

  if (countries.length === 0) {
    return (
      <div className="border border-border p-6">
        <p className="font-mono text-xs text-text-subtle tracking-widest uppercase mb-2">Geography</p>
        <p className="font-mono text-sm text-text-muted">No geographic data yet.</p>
      </div>
    )
  }

  return (
    <div className="border border-border p-6">
      <p className="font-mono text-xs text-text-subtle tracking-widest uppercase mb-4">
        Where they&apos;re from
      </p>
      <div ref={mapRef} style={{ width: "100%", height: 360 }} />
    </div>
  )
}
