"use client"

import { memo, useEffect, useState } from "react"
import { TransitionLink } from "@/components/ui/TransitionLink"
import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import { useTranslationContext } from "@/contexts/TranslationContext"
import { LanguageToggle } from "@/components/ui/LanguageToggle"
import { ContrastToggle } from "@/components/ui/ContrastToggle"

const NAV_ITEMS = ["services", "work", "process", "stack", "about", "blog", "contact"] as const
const NAV_HREF: Record<string, string> = { work: "/work", blog: "/blog", home: "" }

export const Navbar = memo(function Navbar() {
  const t = useTranslations()
  const { language } = useTranslationContext()
  const pathname = usePathname()
  const isHome = pathname === `/${language}`
  const [scrolled, setScrolled] = useState(false)

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
    <header
      className={[
        "navbar-bar fixed top-0 left-0 right-0 z-nav border-b border-border",
        "translate-z-0 will-change-transform contain-layout contain-paint isolate",
        "transition-[border-color] duration-fast ease-out",
        scrolled ? "border-border-2" : "",
      ].join(" ")}
    >
      <div className="w-full max-w-(--maxw) mx-auto px-gutter h-[72px] flex flex-nowrap items-center justify-between gap-4 whitespace-nowrap">
        <TransitionLink
          href={`/${language}`}
          aria-label="helloimtom.dev — home"
          className="inline-flex items-center gap-2.5 font-display font-medium text-[18px] tracking-[-0.01em] no-underline text-text shrink-0 keyboard-focus-ring"
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

        {/* Desktop nav — shown at lg+; below that the hamburger (MobileMenu) takes over */}
        <nav
          aria-label="Main navigation"
          className="hidden lg:flex flex-nowrap gap-1 whitespace-nowrap shrink-0"
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

        <div className="hidden lg:flex flex-nowrap gap-3 items-center whitespace-nowrap shrink-0">
          <LanguageToggle />
          <ContrastToggle />
        </div>
      </div>
    </header>
  )
})
