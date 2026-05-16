"use client"

import { useLayoutEffect } from "react"

/**
 * Reads the saved theme from localStorage and applies it to <html data-theme>.
 * Runs in useLayoutEffect (synchronous before paint) to avoid theme flash.
 * Fallback: light.
 */
export function ThemeInit() {
  useLayoutEffect(() => {
    try {
      const theme = localStorage.getItem("theme") || "light"
      document.documentElement.setAttribute("data-theme", theme)
    } catch {
      document.documentElement.setAttribute("data-theme", "light")
    }
  }, [])
  return null
}
