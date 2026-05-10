"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { MenuToggle } from "@/components/layout/MenuToggle"
import { TransitionLink } from "@/components/ui/TransitionLink"
import { useTransitionContext } from "@/contexts/TransitionContext"

const NAV_ANCHORS = ["services", "work", "process", "stack", "about", "contact"] as const

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const t = useTranslations("nav")
  const pathname = usePathname()
  const { isTransitioning } = useTransitionContext()
  const panelRef     = useRef<HTMLDivElement>(null)
  const toggleBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = "hidden"

    // Move focus into the menu on open
    const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
      'a[href], button, [tabindex]:not([tabindex="-1"])'
    )
    firstFocusable?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close()
        return
      }
      // Focus trap
      if (e.key === "Tab" && panelRef.current) {
        const focusable = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(
            'a[href], button, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.hasAttribute("disabled"))
        if (!focusable.length) return
        const first = focusable[0]
        const last  = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus()
        }
      }
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      document.removeEventListener("keydown", onKey)
    }
  }, [isOpen])

  const close = () => {
    setIsOpen(false)
    // Return focus to the toggle button that opened the menu
    toggleBtnRef.current?.focus()
  }

  const handleLinkClick = () => {
    if (!isTransitioning) close()
  }

  if (!mounted) return null

  return (
    <>
      {createPortal(
        <div
          style={{
            position: "fixed",
            top: "14px",
            right: "var(--gutter)",
            zIndex: "calc(var(--z-nav) + 10)",
          }}
          className="md:hidden"
        >
          <MenuToggle isOpen={isOpen} onToggle={() => setIsOpen((v) => !v)} triggerRef={toggleBtnRef} />
        </div>,
        document.body
      )}

      {isOpen && createPortal(
        <div
          id="mobile-menu"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          style={{
            position: "fixed",
            inset: 0,
            background: "var(--color-bg)",
            zIndex: "var(--z-drawer)",
            display: "flex",
            flexDirection: "column",
            padding: "80px var(--gutter) 40px",
            gap: "8px",
          }}
        >
          {NAV_ANCHORS.map((key) => (
            <a
              key={key}
              href={`#${key}`}
              onClick={handleLinkClick}
              className="keyboard-focus-ring"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(28px, 8vw, 48px)",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                color: "var(--color-text-muted)",
                textDecoration: "none",
                padding: "8px 0",
                borderBottom: "1px solid var(--color-border)",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
            >
              {t(key)}
            </a>
          ))}
        </div>,
        document.body
      )}
    </>
  )
}
