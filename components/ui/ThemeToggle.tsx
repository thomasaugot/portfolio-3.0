"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.93 4.93l1.41 1.41" />
      <path d="M17.66 17.66l1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M4.93 19.07l1.41-1.41" />
      <path d="M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  )
}

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
  const Icon  = theme === "dark" ? SunIcon : MoonIcon

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
      <span className="theme-toggle__icon"><Icon /></span>
      <span>{label}</span>
    </button>
  )
}
