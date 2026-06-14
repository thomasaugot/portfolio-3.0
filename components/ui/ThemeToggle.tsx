"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { IconSun, IconMoon } from "@/components/ui/Icons"

export function ThemeToggle() {
  const t = useTranslations("theme")
  const [theme, setTheme] = useState<"light" | "dark" | null>(null)

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") as "light" | "dark" | null
    setTheme(current ?? "dark")
  }, [])

  if (!theme) return null

  const next  = theme === "dark" ? "light" : "dark"
  const label = theme === "dark" ? t("to_light") : t("to_dark")
  const Icon  = theme === "dark" ? IconSun : IconMoon

  const onClick = () => {
    try { localStorage.setItem("theme", next) } catch {}
    window.location.reload()
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Switch to ${next} mode`}
      className={[
        "fixed right-0 top-1/2 -translate-y-1/2 hover:-translate-x-0.5 z-toast in-data-menu-open:hidden",
        "inline-flex items-center gap-2 py-3.5 px-2 bg-surface text-text",
        "border border-border-2 border-r-0 font-mono text-[11px] tracking-[0.12em] uppercase cursor-pointer [writing-mode:vertical-rl]",
        "transition-[color,border-color,background,transform] duration-(--duration-normal) ease-out",
        "hover:border-primary hover:bg-[color-mix(in_oklch,var(--color-primary)_8%,transparent)]",
        theme === "light" ? "border-[#1a1a17] hover:bg-(--color-primary-glow) hover:border-[#1a1a17]" : "",
      ].join(" ")}
    >
      <span className="inline-flex rotate-90"><Icon /></span>
      <span>{label}</span>
    </button>
  )
}
