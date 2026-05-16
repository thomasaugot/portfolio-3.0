"use client"

import { memo, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { TransitionLink } from "@/components/ui/TransitionLink"
import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import { useTranslationContext } from "@/contexts/TranslationContext"
import type { Language } from "@/config/i18n.config"

const NAV_ITEMS = ["services", "work", "process", "stack", "about", "blog", "contact"] as const
const MOBILE_NAV_ITEMS = ["home", "services", "work", "process", "stack", "about", "blog", "contact"] as const
const NAV_HREF: Record<string, string> = { work: "/work", blog: "/blog", home: "" }
const LOCALES: Language[] = ["en", "fr", "es"]

export const Navbar = memo(function Navbar() {
  const t = useTranslations()
  const { language, changeLanguage } = useTranslationContext()
  const pathname = usePathname()
  const isHome = pathname === `/${language}`
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [mounted,   setMounted]   = useState(false)
  const [compact,   setCompact]   = useState(false)
  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const menuRef      = useRef<HTMLDivElement>(null)
  const headerRowRef = useRef<HTMLDivElement>(null)
  const desktopNavRef = useRef<HTMLElement>(null)
  const rightGroupRef = useRef<HTMLDivElement>(null)
  const brandRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => { setMounted(true) }, [])

  // Decide whether to show desktop nav or collapse to hamburger based on
  // actual available space. Sums each nav-link's natural width — works even
  // when the nav is currently absolute-positioned in compact mode.
  useEffect(() => {
    const row    = headerRowRef.current
    const nav    = desktopNavRef.current
    const right  = rightGroupRef.current
    const brand  = brandRef.current
    if (!row || !nav || !right || !brand) return

    const measure = () => {
      // Sum each link's offsetWidth (works regardless of parent positioning)
      let navWidth = 0
      let count = 0
      nav.querySelectorAll<HTMLElement>(".nav-link").forEach((el) => {
        navWidth += el.offsetWidth
        count += 1
      })
      const navGaps  = Math.max(0, count - 1) * 4
      const navTotal = navWidth + navGaps
      const brandWidth = brand.offsetWidth
      const outerGaps  = 16 * 2
      const available  = row.clientWidth

      // Two distinct measurements: with full right group (status + lang-toggle + hamburger)
      // and without (compact-mode right group). Use hysteresis to avoid flicker:
      // collapse when the full layout doesn't fit, expand again only when it
      // fits comfortably with a generous margin.
      setCompact((prev) => {
        if (prev) {
          // currently compact — only expand back if full layout would fit with room to spare
          // right group right now is compact (hamburger only). We need to estimate the
          // expanded right group width = current + (lang-toggle + status) approx 200px.
          const expandedRightWidth = right.offsetWidth + 200
          const required = brandWidth + navTotal + expandedRightWidth + outerGaps + 80
          return required > available
        } else {
          // currently expanded — collapse if it overflows now
          const required = brandWidth + navTotal + right.offsetWidth + outerGaps + 24
          return required > available
        }
      })
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(row)
    return () => ro.disconnect()
  }, [language])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Focus management + Escape + focus trap for mobile menu
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden"

      // Move focus into the menu (first focusable child)
      const firstFocusable = menuRef.current?.querySelector<HTMLElement>(
        'a[href], button, [tabindex]:not([tabindex="-1"])'
      )
      firstFocusable?.focus()

      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setMenuOpen(false)
          // return focus to hamburger
          hamburgerRef.current?.focus()
          return
        }
        // Focus trap
        if (e.key === "Tab" && menuRef.current) {
          const focusable = Array.from(
            menuRef.current.querySelectorAll<HTMLElement>(
              'a[href], button, [tabindex]:not([tabindex="-1"])'
            )
          ).filter((el) => !el.hasAttribute("disabled"))
          if (!focusable.length) return
          const first = focusable[0]
          const last  = focusable[focusable.length - 1]
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault()
            last.focus()
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
      document.addEventListener("keydown", onKey)
      return () => {
        document.body.style.overflow = ""
        document.removeEventListener("keydown", onKey)
      }
    } else {
      document.body.style.overflow = ""
    }
  }, [menuOpen])

  const close = () => {
    setMenuOpen(false)
    hamburgerRef.current?.focus()
  }

  function navHref(key: string) {
    if (key in NAV_HREF) return `/${language}${NAV_HREF[key]}`
    return isHome ? `#${key}` : `/${language}#${key}`
  }

  return (
    <>
      <header className={`navbar${scrolled ? " scrolled" : ""}${compact ? " compact" : ""}`}>
        <div ref={headerRowRef} className="shell h-[60px] flex flex-nowrap items-center justify-between gap-4 whitespace-nowrap">
          <TransitionLink
            href={`/${language}`}
            ref={brandRef}
            aria-label="helloimtom.dev — home"
            className="inline-flex items-center gap-2.5 font-display font-medium tracking-[-0.01em] no-underline text-text text-[16px] shrink-0 keyboard-focus-ring"
          >
            <span className="brand-dot" aria-hidden="true" />
            helloimtom<span className="text-text-subtle">.dev</span>
          </TransitionLink>

          <nav
            ref={desktopNavRef}
            aria-label="Main navigation"
            className="flex flex-nowrap gap-1 whitespace-nowrap shrink-0"
            style={{
              visibility: compact ? "hidden" : "visible",
              position: compact ? "absolute" : "static",
              pointerEvents: compact ? "none" : "auto",
            }}
            aria-hidden={compact}
          >
            {NAV_ITEMS.map((key) => (
              <TransitionLink key={key} href={navHref(key)} className="nav-link keyboard-focus-ring">
                {t(`nav.${key}`)}
              </TransitionLink>
            ))}
          </nav>

          <div ref={rightGroupRef} className="flex flex-nowrap gap-3 items-center whitespace-nowrap shrink-0">
            <div
              className="navbar-status inline-flex items-center gap-2 text-[11px] text-text-muted py-1.5 px-2.5 border border-border-2 tracking-[0.02em]"
              aria-hidden="true"
            >
              <span className="status-dot" />
              {t("status.available")}
            </div>
            <div className="lang-toggle" role="group" aria-label="Language selector">
              {LOCALES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => changeLanguage(lang)}
                  className={`keyboard-focus-ring${language === lang ? " active" : ""}`}
                  aria-current={language === lang ? "true" : undefined}
                  aria-label={`Switch to ${lang.toUpperCase()}`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
            <button
              ref={hamburgerRef}
              className={`navbar-hamburger keyboard-focus-ring${menuOpen ? " open" : ""}`}
              style={{ display: compact ? "flex" : "none" }}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <span className="navbar-hamburger-line" aria-hidden="true" />
              <span className="navbar-hamburger-line" aria-hidden="true" />
              <span className="navbar-hamburger-line" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {mounted && createPortal(
        <div
          id="mobile-menu"
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          className={`mobile-menu${menuOpen ? " open" : ""}`}
          inert={!menuOpen}
        >
          <nav className="flex-1 px-(--gutter) flex flex-col gap-3 pt-6" aria-label="Mobile navigation">
            {/* Home — full-width primary tile */}
            <TransitionLink
              href={navHref("home")}
              className="mobile-nav-tile mobile-nav-tile-home keyboard-focus-ring"
              style={{ "--i": 0 } as React.CSSProperties}
              onClick={close}
            >
              <span className="mobile-nav-tile-num" aria-hidden="true">00</span>
              <span className="mobile-nav-tile-text">{t("nav.home")}</span>
              <span className="mobile-nav-tile-arrow" aria-hidden="true">→</span>
            </TransitionLink>

            {/* 2-column grid for the rest */}
            <div className="grid grid-cols-2 gap-3">
              {NAV_ITEMS.map((key, i) => (
                <TransitionLink
                  key={key}
                  href={navHref(key)}
                  className="mobile-nav-tile keyboard-focus-ring"
                  style={{ "--i": i + 1 } as React.CSSProperties}
                  onClick={close}
                >
                  <span className="mobile-nav-tile-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <span className="mobile-nav-tile-text">{t(`nav.${key}`)}</span>
                  <span className="mobile-nav-tile-arrow" aria-hidden="true">↗</span>
                </TransitionLink>
              ))}
            </div>
          </nav>

          <div className="mobile-menu-footer">
            <div className="flex items-center justify-between">
              <div className="status-pill" aria-hidden="true">
                <span className="status-dot" />
                {t("status.available")}
              </div>
              <div className="lang-toggle" role="group" aria-label="Language selector">
                {LOCALES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => { changeLanguage(lang); close() }}
                    className={`keyboard-focus-ring${language === lang ? " active" : ""}`}
                    aria-current={language === lang ? "true" : undefined}
                    aria-label={`Switch to ${lang.toUpperCase()}`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <TransitionLink href={navHref("contact")} className="btn btn-filled keyboard-focus-ring" onClick={close}>
              {t("nav.contact")} →
            </TransitionLink>
          </div>
        </div>,
        document.body
      )}
    </>
  )
})
