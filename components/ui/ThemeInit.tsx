"use client"

import { useLayoutEffect } from "react"

export function ThemeInit() {
  useLayoutEffect(() => {
    try {
      const saved = localStorage.getItem("theme")
      const theme = saved === "light" ? "light" : "dark"
      document.documentElement.setAttribute("data-theme", theme)
    } catch {
      document.documentElement.setAttribute("data-theme", "dark")
    }
  }, [])
  return null
}
