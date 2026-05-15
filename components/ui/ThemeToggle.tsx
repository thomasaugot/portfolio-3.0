"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const t = useTranslations("theme")
  const [theme, setTheme] = useState<"light" | "dark" | null>(null)

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") as "light" | "dark" | null
    setTheme(current ?? "light")
  }, [])

  if (!theme) return null

  const next  = theme === "dark" ? "light" : "dark"
  const label = theme === "dark" ? t("to_light") : t("to_dark")

  const onClick = () => {
    try { localStorage.setItem("theme", next) } catch {}
    window.location.reload()
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Switch to ${next} mode`}
      className="theme-toggle"
    >
      <span>{label}</span>
    </button>
  )
}
