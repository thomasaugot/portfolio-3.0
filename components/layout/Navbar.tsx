"use client"

import { memo, useEffect, useRef, useState } from "react"
import { TransitionLink } from "@/components/ui/TransitionLink"
import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import { useTranslationContext } from "@/contexts/TranslationContext"
import type { Language } from "@/config/i18n.config"

const NAV_ITEMS = ["services", "work", "process", "stack", "about", "blog", "contact"] as const
const NAV_HREF: Record<string, string> = { work: "/work", blog: "/blog", home: "" }
const LOCALES: Language[] = ["en", "fr", "es"]

export const Navbar = memo(function Navbar() {
  const t = useTranslations()
  const { language, changeLanguage } = useTranslationContext()
  const pathname = usePathname()
  const isHome = pathname === `/${language}`
  const [scrolled,  setScrolled]  = useState(false)
  const [compact,   setCompact]   = useState(false)
  const [measured,  setMeasured]  = useState(false)
  const headerRowRef  = useRef<HTMLDivElement>(null)
  const desktopNavRef = useRef<HTMLElement>(null)
  const rightGroupRef = useRef<HTMLDivElement>(null)
  const brandRef      = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const row   = headerRowRef.current
    const nav   = desktopNavRef.current
    const right = rightGroupRef.current
    const brand = brandRef.current
    if (!row || !nav || !right || !brand) return

    const measure = () => {
      let navWidth = 0
      let count = 0
      nav.querySelectorAll<HTMLElement>(".nav-link").forEach((el) => {
        navWidth += el.offsetWidth
        count += 1
      })
      const navGaps    = Math.max(0, count - 1) * 4
      const navTotal   = navWidth + navGaps
      const brandWidth = brand.offsetWidth
      const outerGaps  = 16 * 2
      const available  = row.clientWidth

      setCompact((prev) => {
        if (prev) {
          const expandedRightWidth = right.offsetWidth + 200
          const required = brandWidth + navTotal + expandedRightWidth + outerGaps + 80
          return required > available
        } else {
          const required = brandWidth + navTotal + right.offsetWidth + outerGaps + 24
          return required > available
        }
      })
      setMeasured(true)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(row)
    return () => ro.disconnect()
  }, [language])

  useEffect(() => {
    if (compact) document.body.setAttribute("data-nav-compact", "")
    else document.body.removeAttribute("data-nav-compact")
  }, [compact])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  function navHref(key: string) {
    if (key in NAV_HREF) return `/${language}${NAV_HREF[key]}`
    return isHome ? `#${key}` : `/${language}#${key}`
  }

  return (
    <>
      <header
        className={[
          "fixed top-0 left-0 right-0 z-nav bg-bg border-b border-border",
          "translate-z-0 will-change-transform contain-layout contain-paint isolate",
          "transition-[border-color] duration-fast ease-out",
          scrolled ? "border-border-2" : "",
          compact ? "[&_.navbar-status]:hidden [&_.lang-toggle]:hidden [&_.navbar-desktop-nav]:invisible [&_.navbar-desktop-nav]:absolute [&_.navbar-desktop-nav]:pointer-events-none" : "",
          measured ? "" : "[&_.navbar-desktop-nav]:visible [&_.navbar-desktop-nav]:static [&_.navbar-desktop-nav]:pointer-events-auto",
        ].join(" ")}
        {...(measured ? { "data-measured": "" } : {})}
      >
        <div ref={headerRowRef} className="w-full max-w-(--maxw) mx-auto px-gutter h-[72px] flex flex-nowrap items-center justify-between gap-4 whitespace-nowrap">
          <TransitionLink
            href={`/${language}`}
            ref={brandRef}
            aria-label="helloimtom.dev — home"
            className="inline-flex items-center gap-2.5 font-display font-medium text-[22px] md:text-[16px] tracking-[-0.01em] no-underline text-text shrink-0 keyboard-focus-ring"
          >
            <span
              aria-hidden="true"
              className={[
                "w-2.5 h-2.5 bg-primary inline-block relative shrink-0",
                "before:content-[''] before:absolute before:inset-[-4px] before:border before:border-primary before:animate-[pulse_2.4s_ease-out_infinite]",
              ].join(" ")}
            />
            helloimtom<span className="text-text-subtle">.dev</span>
          </TransitionLink>

          <nav
            ref={desktopNavRef}
            aria-label="Main navigation"
            className="navbar-desktop-nav hidden md:flex flex-nowrap gap-1 whitespace-nowrap shrink-0"
            aria-hidden={compact}
          >
            {NAV_ITEMS.map((key) => (
              <TransitionLink
                key={key}
                href={navHref(key)}
                className={[
                  "nav-link keyboard-focus-ring",
                  "text-[16px] text-text-muted no-underline px-3 py-2 tracking-[0.02em] relative",
                  "transition-colors duration-fast ease-out hover:text-text",
                  "before:content-['[_'] before:opacity-0 before:transition-opacity before:duration-fast",
                  "after:content-['_]'] after:opacity-0 after:transition-opacity after:duration-fast",
                  "hover:before:opacity-100 hover:before:text-primary",
                  "hover:after:opacity-100 hover:after:text-primary",
                ].join(" ")}
              >
                {t(`nav.${key}`)}
              </TransitionLink>
            ))}
          </nav>

          <div ref={rightGroupRef} className="flex flex-nowrap gap-3 items-center whitespace-nowrap shrink-0">
            <div
              className="navbar-status inline-flex items-center gap-2 text-caption text-text-muted py-1.5 px-2.5 border border-border-2 tracking-[0.02em]"
              aria-hidden="true"
            >
              <span className="status-dot w-[7px] h-[7px] rounded-full bg-ok shadow-[0_0_10px_var(--color-ok)] animate-[blip_2s_ease-in-out_infinite] shrink-0" />
              {t("status.available")}
            </div>
            {!compact && (
              <div className="lang-toggle inline-flex border border-border-2 text-[11px] tracking-[0.08em]" role="group" aria-label="Language selector">
                {LOCALES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => changeLanguage(lang)}
                    className={[
                      "bg-transparent border-0 text-text-muted py-[7px] px-[9px] font-mono text-[11px] cursor-pointer",
                      "transition-[color,background] duration-fast ease-out keyboard-focus-ring",
                      language === lang ? "active" : "hover:text-text",
                    ].join(" ")}
                    aria-current={language === lang ? "true" : undefined}
                    aria-label={`Switch to ${lang.toUpperCase()}`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

    </>
  )
})
