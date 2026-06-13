"use client"

import { memo, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { TransitionLink } from "@/components/ui/TransitionLink"
import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import { useTranslationContext } from "@/contexts/TranslationContext"
import type { Language } from "@/config/i18n.config"

const NAV_ITEMS = ["services", "work", "process", "stack", "about", "blog", "contact"] as const
const MOBILE_GRID_ITEMS = ["services", "work", "process", "stack", "about", "blog"] as const
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
  const [measured,  setMeasured]  = useState(false)
  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const menuRef      = useRef<HTMLDivElement>(null)
  const headerRowRef = useRef<HTMLDivElement>(null)
  const desktopNavRef = useRef<HTMLElement>(null)
  const rightGroupRef = useRef<HTMLDivElement>(null)
  const brandRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const row    = headerRowRef.current
    const nav    = desktopNavRef.current
    const right  = rightGroupRef.current
    const brand  = brandRef.current
    if (!row || !nav || !right || !brand) return

    const measure = () => {
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
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden"

      const firstFocusable = menuRef.current?.querySelector<HTMLElement>(
        'a[href], button, [tabindex]:not([tabindex="-1"])'
      )
      firstFocusable?.focus()

      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setMenuOpen(false)
          hamburgerRef.current?.focus()
          return
        }
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
      <header
        className={[
          "fixed top-0 left-0 right-0 z-nav bg-bg border-b border-border",
          "translate-z-0 will-change-transform contain-layout contain-paint isolate",
          "transition-[border-color] duration-fast ease-out",
          scrolled ? "border-border-2" : "",
          compact ? "[&_.navbar-status]:hidden [&_.lang-toggle]:hidden [&_.shell]:pr-2 [&_.navbar-desktop-nav]:invisible [&_.navbar-desktop-nav]:absolute [&_.navbar-desktop-nav]:pointer-events-none [&_.navbar-hamburger]:flex" : "",
          measured ? "" : "[&_.navbar-hamburger]:hidden [&_.navbar-desktop-nav]:visible [&_.navbar-desktop-nav]:static [&_.navbar-desktop-nav]:pointer-events-auto",
        ].join(" ")}
        {...(measured ? { "data-measured": "" } : {})}
      >
        <div ref={headerRowRef} className="shell h-[60px] flex flex-nowrap items-center justify-between gap-4 whitespace-nowrap">
          <TransitionLink
            href={`/${language}`}
            ref={brandRef}
            aria-label="helloimtom.dev — home"
            className="inline-flex items-center gap-2.5 font-display font-medium tracking-[-0.01em] no-underline text-text text-body shrink-0 keyboard-focus-ring"
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
            className="navbar-desktop-nav flex flex-nowrap gap-1 whitespace-nowrap shrink-0"
            aria-hidden={compact}
          >
            {NAV_ITEMS.map((key) => (
              <TransitionLink
                key={key}
                href={navHref(key)}
                className={[
                  "nav-link keyboard-focus-ring",
                  "text-[16px] text-text-muted no-underline px-3 py-2 tracking-[0.02em] relative",
                  "transition-colors duration-fast ease-out",
                  "hover:text-text",
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
            <button
              ref={hamburgerRef}
              className={[
                "navbar-hamburger hidden flex-col justify-center items-center gap-[5px]",
                "w-11 h-11 bg-transparent border border-border-2 cursor-pointer shrink-0",
                "transition-[border-color] duration-normal ease-out hover:border-text-subtle keyboard-focus-ring",
                menuOpen ? "open" : "",
              ].join(" ")}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <span className={["block w-[18px] h-px bg-text transition-[transform,opacity] duration-normal ease-out", menuOpen ? "translate-y-[6px] rotate-45" : ""].join(" ")} aria-hidden="true" />
              <span className={["block w-[18px] h-px bg-text transition-opacity duration-fast ease-out", menuOpen ? "opacity-0" : ""].join(" ")} aria-hidden="true" />
              <span className={["block w-[18px] h-px bg-text transition-transform duration-normal ease-out", menuOpen ? "-translate-y-[6px] -rotate-45" : ""].join(" ")} aria-hidden="true" />
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
          className={[
            "fixed top-[60px] left-0 right-0 bottom-0 bg-bg z-drawer flex flex-col overflow-y-auto overscroll-contain",
            "transition-[transform,visibility]",
            menuOpen
              ? "translate-x-0 visible [transition:transform_0.48s_cubic-bezier(0.16,1,0.3,1),visibility_0s_linear_0s]"
              : "translate-x-full invisible [transition:transform_0.48s_cubic-bezier(0.16,1,0.3,1),visibility_0s_linear_0.48s]",
          ].join(" ")}
          inert={!menuOpen}
        >
          <nav className="flex-1 px-gutter flex flex-col gap-3 pt-6" aria-label="Mobile navigation">
            <TransitionLink
              href={navHref("home")}
              className={[
                "relative flex flex-row items-center justify-start gap-4 p-[18px_20px] border border-primary bg-primary",
                "min-h-[80px] no-underline keyboard-focus-ring",
                "opacity-0 translate-x-5 transition-[opacity,transform,border-color,background]",
                "hover:bg-text hover:border-text",
                menuOpen ? "opacity-100 translate-x-0" : "",
              ].join(" ")}
              style={{ "--i": 0, transitionDelay: menuOpen ? "calc(0.08s + 0 * 0.055s)" : "0s" } as React.CSSProperties}
              onClick={close}
            >
              <span className="font-mono text-[11px] text-black/55 tracking-[0.1em]" aria-hidden="true">00</span>
              <span className="font-display text-[26px] font-semibold tracking-[-0.02em] text-black leading-[1.1] flex-1">{t("nav.home")}</span>
              <span className="text-[20px] text-black" aria-hidden="true">→</span>
            </TransitionLink>

            <div className="grid grid-cols-2 gap-3">
              {MOBILE_GRID_ITEMS.map((key, i) => (
                <TransitionLink
                  key={key}
                  href={navHref(key)}
                  className={[
                    "relative flex flex-col justify-between gap-2 p-[20px_18px] border border-border bg-surface",
                    "min-h-[110px] no-underline keyboard-focus-ring",
                    "opacity-0 translate-x-5 transition-[opacity,transform,border-color,background]",
                    "hover:border-primary hover:bg-[color-mix(in_oklch,var(--color-primary)_5%,var(--color-surface))]",
                    menuOpen ? "opacity-100 translate-x-0" : "",
                  ].join(" ")}
                  style={{ transitionDelay: menuOpen ? `calc(0.08s + ${i + 1} * 0.055s)` : "0s" } as React.CSSProperties}
                  onClick={close}
                >
                  <span className="font-mono text-[11px] text-text-subtle tracking-[0.1em]" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-display text-[22px] font-semibold tracking-[-0.02em] text-text leading-[1.1]">{t(`nav.${key}`)}</span>
                  <span className="absolute bottom-4 right-4 text-[18px] text-text-subtle transition-[color,transform] duration-200 hover:text-primary hover:translate-x-[3px] hover:-translate-y-[3px]" aria-hidden="true">↗</span>
                </TransitionLink>
              ))}
            </div>
          </nav>

          <div className={[
            "px-gutter pt-7 pb-10 flex flex-col gap-5 border-t border-border",
            "opacity-0 transition-opacity",
            menuOpen ? "opacity-100 [transition-delay:0.44s]" : "[transition-delay:0s]",
          ].join(" ")}>
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-caption text-text-muted" aria-hidden="true">
                <span className="w-[7px] h-[7px] rounded-full bg-ok shadow-[0_0_10px_var(--color-ok)] animate-[blip_2s_ease-in-out_infinite] shrink-0" />
                {t("status.available")}
              </div>
              <div className="inline-flex border border-border-2 text-[11px] tracking-[0.08em]" role="group" aria-label="Language selector">
                {LOCALES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => { changeLanguage(lang); close() }}
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
            </div>
            <TransitionLink href={navHref("contact")} className="inline-flex items-center gap-2.5 font-mono text-[16px] tracking-[0.02em] px-5.5 py-3.5 border border-primary bg-primary text-black font-medium cursor-pointer relative overflow-hidden no-underline whitespace-nowrap select-none transition-[border-color,color,background,transform] duration-normal ease-out hover:bg-text hover:border-text active:translate-y-px after:content-[''] after:absolute after:inset-0 after:bg-[linear-gradient(120deg,transparent_30%,rgba(255,255,255,0.6)_50%,transparent_70%)] after:-translate-x-full hover:after:translate-x-full after:transition-transform after:duration-[0.8s] after:ease-snappy after:pointer-events-none keyboard-focus-ring" onClick={close}>
              {t("nav.contact")} →
            </TransitionLink>
          </div>
        </div>,
        document.body
      )}
    </>
  )
})
