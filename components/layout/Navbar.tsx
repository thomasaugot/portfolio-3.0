"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useTranslations } from "next-intl"
import { useTranslationContext } from "@/contexts/TranslationContext"
import type { Language } from "@/config/i18n.config"

const NAV_ITEMS = ["services", "work", "process", "stack", "about", "contact"] as const
const NAV_HREF: Record<string, string> = { work: "/work" }
const LOCALES: Language[] = ["en", "fr", "es"]

export function Navbar() {
  const t = useTranslations()
  const { language, changeLanguage } = useTranslationContext()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted]   = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden"
      const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false) }
      document.addEventListener("keydown", onKey)
      return () => {
        document.body.style.overflow = ""
        document.removeEventListener("keydown", onKey)
      }
    } else {
      document.body.style.overflow = ""
    }
  }, [menuOpen])

  const close = () => setMenuOpen(false)

  const Hamburger = () => (
    <button
      className={`navbar-hamburger keyboard-focus-ring${menuOpen ? " open" : ""}`}
      onClick={() => setMenuOpen((v) => !v)}
      aria-label={menuOpen ? "Close menu" : "Open menu"}
      aria-expanded={menuOpen}
      aria-controls="mobile-menu"
    >
      <span className="navbar-hamburger-line" />
      <span className="navbar-hamburger-line" />
      <span className="navbar-hamburger-line" />
    </button>
  )

  return (
    <>
      <header className={`navbar${scrolled ? " scrolled" : ""}`}>
        <div className="shell navbar-inner">
          <a href="/" className="navbar-brand keyboard-focus-ring">
            <span className="brand-dot" />
            thomas<span className="navbar-brand-muted">.dev</span>
          </a>

          <nav aria-label="Main navigation" className="navbar-nav">
            {NAV_ITEMS.map((key) => (
              <a key={key} href={NAV_HREF[key] ?? `#${key}`} className="nav-link keyboard-focus-ring">
                {t(`nav.${key}`)}
              </a>
            ))}
          </nav>

          <div className="navbar-right">
            <div className="status-pill navbar-status">
              <span className="status-dot" />
              {t("status.available")}
            </div>
            <div className="lang-toggle">
              {LOCALES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => changeLanguage(lang)}
                  className={`keyboard-focus-ring${language === lang ? " active" : ""}`}
                  aria-current={language === lang ? "true" : undefined}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
            <Hamburger />
          </div>
        </div>
      </header>

      {mounted && createPortal(
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          aria-hidden={!menuOpen}
          className={`mobile-menu${menuOpen ? " open" : ""}`}
        >
          <div className="mobile-menu-header">
            <a href="/" className="navbar-brand keyboard-focus-ring" onClick={close}>
              <span className="brand-dot" />
              thomas<span className="navbar-brand-muted">.dev</span>
            </a>
            <Hamburger />
          </div>

          <nav className="mobile-menu-body" aria-label="Mobile navigation">
            {NAV_ITEMS.map((key, i) => (
              <a
                key={key}
                href={NAV_HREF[key] ?? `#${key}`}
                className="mobile-nav-link keyboard-focus-ring"
                style={{ "--i": i } as React.CSSProperties}
                onClick={close}
              >
                <span className="mobile-nav-link-left">
                  <span className="mobile-nav-link-num" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="mobile-nav-link-text">{t(`nav.${key}`)}</span>
                </span>
                <span className="mobile-nav-link-arrow" aria-hidden="true">↗</span>
              </a>
            ))}
          </nav>

          <div className="mobile-menu-footer">
            <div className="mobile-menu-footer-row">
              <div className="status-pill">
                <span className="status-dot" />
                {t("status.available")}
              </div>
              <div className="lang-toggle">
                {LOCALES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => { changeLanguage(lang); close() }}
                    className={`keyboard-focus-ring${language === lang ? " active" : ""}`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <a href="#contact" className="btn btn-filled" onClick={close}>
              {t("nav.contact")} →
            </a>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
