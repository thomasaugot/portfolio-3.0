"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import { useTranslationContext } from "@/contexts/TranslationContext"
import type { Language } from "@/config/i18n.config"

const NAV_ITEMS = ["services", "work", "process", "stack", "about", "contact"] as const
const NAV_HREF: Record<string, string> = { work: "/work" }
const LOCALES: Language[] = ["en", "fr", "es"]

export function Navbar() {
  const t = useTranslations()
  const { language, changeLanguage } = useTranslationContext()
  const pathname = usePathname()
  const isHome = pathname === `/${language}`
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [mounted,   setMounted]   = useState(false)
  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const menuRef      = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

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
    if (NAV_HREF[key]) return `/${language}${NAV_HREF[key]}`
    return isHome ? `#${key}` : `/${language}#${key}`
  }

  return (
    <>
      <header className={`navbar${scrolled ? " scrolled" : ""}`}>
        <div className="shell h-[60px] flex items-center justify-between gap-4">
          <a
            href={`/${language}`}
            aria-label="helloimtom.dev — home"
            className="inline-flex items-center gap-2.5 font-display font-medium tracking-[-0.01em] no-underline text-text text-[15px] shrink-0 keyboard-focus-ring"
          >
            <span className="brand-dot" aria-hidden="true" />
            helloimtom<span className="text-text-subtle">.dev</span>
          </a>

          <nav aria-label="Main navigation" className="flex gap-1 max-[900px]:hidden">
            {NAV_ITEMS.map((key) => (
              <a key={key} href={navHref(key)} className="nav-link keyboard-focus-ring">
                {t(`nav.${key}`)}
              </a>
            ))}
          </nav>

          <div className="flex gap-3 items-center">
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
          <div className="h-[60px] flex items-center justify-between px-(--gutter) border-b border-border shrink-0">
            <a
              href={`/${language}`}
              aria-label="helloimtom.dev — home"
              className="inline-flex items-center gap-2.5 font-display font-medium tracking-[-0.01em] no-underline text-text text-[15px] shrink-0 keyboard-focus-ring"
              onClick={close}
            >
              <span className="brand-dot" aria-hidden="true" />
              helloimtom<span className="text-text-subtle">.dev</span>
            </a>
            <button
              className={`navbar-hamburger keyboard-focus-ring${menuOpen ? " open" : ""}`}
              onClick={close}
              aria-label="Close menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <span className="navbar-hamburger-line" aria-hidden="true" />
              <span className="navbar-hamburger-line" aria-hidden="true" />
              <span className="navbar-hamburger-line" aria-hidden="true" />
            </button>
          </div>

          <nav className="flex-1 px-(--gutter)" aria-label="Mobile navigation">
            {NAV_ITEMS.map((key, i) => (
              <a
                key={key}
                href={navHref(key)}
                className="mobile-nav-link keyboard-focus-ring"
                style={{ "--i": i } as React.CSSProperties}
                onClick={close}
              >
                <span className="flex items-baseline gap-4">
                  <span className="font-mono text-[10px] text-text-subtle tracking-[0.1em] w-6 shrink-0" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="mobile-nav-link-text">{t(`nav.${key}`)}</span>
                </span>
                <span className="mobile-nav-link-arrow" aria-hidden="true">↗</span>
              </a>
            ))}
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
            <a href={navHref("contact")} className="btn btn-filled keyboard-focus-ring" onClick={close}>
              {t("nav.contact")} →
            </a>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
