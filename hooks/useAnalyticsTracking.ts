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
