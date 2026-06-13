"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { TransitionLink } from "@/components/ui/TransitionLink"
import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import { useTranslationContext } from "@/contexts/TranslationContext"
import type { Language } from "@/config/i18n.config"

const MOBILE_GRID_ITEMS = ["services", "work", "process", "stack", "about", "blog"] as const
const NAV_HREF: Record<string, string> = { work: "/work", blog: "/blog", home: "" }
const LOCALES: Language[] = ["en", "fr", "es"]

export function MobileMenu() {
  const t = useTranslations()
  const { language, changeLanguage } = useTranslationContext()
  const pathname = usePathname()
  const isHome = pathname === `/${language}`
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const hamburgerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { setMounted(true) }, [])

  function navHref(key: string) {
    if (key in NAV_HREF) return `/${language}${NAV_HREF[key]}`
    return isHome ? `#${key}` : `/${language}#${key}`
  }

  function close() {
    setOpen(false)
    hamburgerRef.current?.focus()
  }

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = ""
      document.body.removeAttribute("data-menu-open")
      return
    }
    document.body.style.overflow = "hidden"
    document.body.setAttribute("data-menu-open", "")
    const firstFocusable = menuRef.current?.querySelector<HTMLElement>(
      'a[href], button, [tabindex]:not([tabindex="-1"])'
    )
    firstFocusable?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { close(); return }
      if (e.key === "Tab" && menuRef.current) {
        const focusable = Array.from(
          menuRef.current.querySelectorAll<HTMLElement>('a[href], button, [tabindex]:not([tabindex="-1"])')
        ).filter((el) => !el.hasAttribute("disabled"))
        if (!focusable.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      document.body.removeAttribute("data-menu-open")
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  if (!mounted) return null

  return createPortal(
    <>
      {/* Hamburger */}
      <button
        ref={hamburgerRef}
        className="navbar-hamburger fixed top-[14px] right-4 z-nav flex flex-col justify-center items-center gap-[5px] w-11 h-11 bg-bg border border-border-2 cursor-pointer md:hidden transition-[border-color] duration-normal ease-out hover:border-text-subtle keyboard-focus-ring"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
      >
        <span className={["block w-[18px] h-px bg-text transition-[transform,opacity] duration-300 ease-out", open ? "translate-y-[6px] rotate-45" : ""].join(" ")} aria-hidden="true" />
        <span className={["block w-[18px] h-px bg-text transition-opacity duration-150 ease-out", open ? "opacity-0" : ""].join(" ")} aria-hidden="true" />
        <span className={["block w-[18px] h-px bg-text transition-transform duration-300 ease-out", open ? "-translate-y-[6px] -rotate-45" : ""].join(" ")} aria-hidden="true" />
      </button>

      {/* Panel */}
      <div
        id="mobile-menu"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className={[
          "fixed top-18 left-0 right-0 bottom-0 bg-bg z-drawer overflow-y-auto overflow-x-hidden overscroll-contain flex flex-col px-gutter",
          "transition-[transform,visibility] duration-[0.48s] ease-[cubic-bezier(0.16,1,0.3,1)]",
          open ? "translate-x-0 visible" : "translate-x-full invisible",
        ].join(" ")}
        inert={!open}
      >
        <nav className="flex-1 flex flex-col gap-3 pt-6" aria-label="Mobile navigation">
          {/* Home — full width yellow */}
          <TransitionLink
            href={`/${language}`}
            className={[
              "relative flex flex-row items-center justify-start gap-4 p-[18px_20px] border border-primary bg-primary",
              "min-h-20 no-underline keyboard-focus-ring",
              "opacity-0 transition-opacity duration-300 ease-out",
              "hover:bg-text hover:border-text",
              open ? "opacity-100" : "",
            ].join(" ")}
            style={{ transitionDelay: open ? "0.08s" : "0s" } as React.CSSProperties}
            onClick={close}
          >
            <span className="font-mono text-[11px] text-black/55 tracking-widest" aria-hidden="true">00</span>
            <span className="font-display text-[26px] font-semibold tracking-[-0.02em] text-black leading-[1.1] flex-1">{t("nav.home")}</span>
            <span className="text-[20px] text-black" aria-hidden="true">→</span>
          </TransitionLink>

          {/* 2-col grid */}
          <div className="grid grid-cols-2 gap-3">
            {MOBILE_GRID_ITEMS.map((key, i) => (
              <TransitionLink
                key={key}
                href={navHref(key)}
                className={[
                  "relative flex flex-col justify-between gap-2 p-[20px_18px] border border-border bg-surface",
                  "min-h-[110px] no-underline keyboard-focus-ring",
                  "opacity-0 transition-opacity duration-300 ease-out",
                  "hover:border-primary hover:bg-[color-mix(in_oklch,var(--color-primary)_5%,var(--color-surface))]",
                  open ? "opacity-100" : "",
                ].join(" ")}
                style={{ transitionDelay: open ? `calc(0.08s + ${i + 1} * 0.055s)` : "0s" } as React.CSSProperties}
                onClick={close}
              >
                <span className="font-mono text-[11px] text-text-subtle tracking-widest" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-display text-[22px] font-semibold tracking-[-0.02em] text-text leading-[1.1]">{t(`nav.${key}`)}</span>
                <span className="absolute bottom-4 right-4 text-[18px] text-text-subtle" aria-hidden="true">↗</span>
              </TransitionLink>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div
          className={[
            "pt-6 pb-10 flex flex-col gap-5 border-t border-border",
            "opacity-0 transition-opacity duration-300",
            open ? "opacity-100" : "",
          ].join(" ")}
          style={{ transitionDelay: open ? "0.5s" : "0s" }}
        >
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 font-mono text-[11px] text-text-muted tracking-[0.05em]" aria-hidden="true">
              <span className="w-[7px] h-[7px] rounded-full bg-ok shadow-[0_0_10px_var(--color-ok)] animate-[blip_2s_ease-in-out_infinite] shrink-0" />
              {t("status.available")}
            </div>
            <div className="inline-flex border border-border-2" role="group" aria-label="Language selector">
              {LOCALES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => { changeLanguage(lang as Language); close() }}
                  className={[
                    "bg-transparent border-0 text-text-muted py-[7px] px-[9px] font-mono text-[11px] tracking-[0.08em] cursor-pointer",
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
          <TransitionLink
            href={`/${language}#contact`}
            className="inline-flex items-center gap-2.5 font-mono text-[16px] tracking-[0.02em] px-5.5 py-3.5 border border-primary bg-primary text-black font-medium cursor-pointer relative overflow-hidden no-underline whitespace-nowrap select-none transition-[border-color,color,background,transform] duration-normal ease-out hover:bg-text hover:border-text active:translate-y-px after:content-[''] after:absolute after:inset-0 after:bg-[linear-gradient(120deg,transparent_30%,rgba(255,255,255,0.6)_50%,transparent_70%)] after:-translate-x-full hover:after:translate-x-full after:transition-transform after:duration-[0.8s] after:ease-snappy after:pointer-events-none keyboard-focus-ring"
            onClick={close}
          >
            {t("nav.contact")} →
          </TransitionLink>
        </div>
      </div>
    </>,
    document.body
  )
}
