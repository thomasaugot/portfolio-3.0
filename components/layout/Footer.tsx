"use client"

import { useCallback, useRef, useState, type MouseEvent } from "react"
import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import { appConfig } from "@/config/app.config"
import { useTranslationContext } from "@/contexts/TranslationContext"
import { useDevice } from "@/hooks/useDevice"
import { useMotionPreference } from "@/hooks/useMotionPreference"
import { TransitionLink } from "@/components/ui/TransitionLink"
import { openCookieSettings } from "@/components/shared/CookieBanner"
import { Shell } from "@/components/layout/Shell"
import { FooterWordmark } from "@/components/layout/FooterWordmark"
import { FooterPhysicsCanvas, useFooterPhysics } from "@/components/layout/FooterPhysics"

export function Footer() {
  const t = useTranslations()
  const { language } = useTranslationContext()
  const pathname = usePathname()
  const isHome = pathname === `/${language}`

  const footerRef = useRef<HTMLElement>(null)
  const { isTouchDevice } = useDevice()
  const { preference } = useMotionPreference()
  const motionOk = preference === "full"
  const physicsEnabled = motionOk && !isTouchDevice

  const [pointerX, setPointerX] = useState<number | null>(null)
  const physics = useFooterPhysics(footerRef, physicsEnabled)

  const handleMouseMove = useCallback((e: MouseEvent<HTMLElement>) => {
    if (motionOk) setPointerX(Math.round(e.clientX))
    if (physicsEnabled) physics.onMouseMove(e)
  }, [motionOk, physicsEnabled, physics])

  const handleMouseLeave = useCallback(() => {
    setPointerX(null)
    if (physicsEnabled) physics.onMouseLeave()
  }, [physicsEnabled, physics])

  const handleClick = useCallback((e: MouseEvent<HTMLElement>) => {
    if (physicsEnabled) physics.onClick(e)
  }, [physicsEnabled, physics])

  function sectionHref(anchor: string) {
    return isHome ? `#${anchor}` : `/${language}#${anchor}`
  }

  const links = {
    sitemap: [
      { label: t("footer.sitemap_links.0"), href: sectionHref("services") },
      { label: t("footer.sitemap_links.1"), href: sectionHref("work") },
      { label: t("footer.sitemap_links.2"), href: sectionHref("process") },
      { label: t("footer.sitemap_links.3"), href: sectionHref("about") },
      { label: t("footer.sitemap_links.4"), href: sectionHref("contact") },
    ],
    elsewhere: [
      { label: "LinkedIn", href: appConfig.linkedin },
      { label: "GitHub",   href: appConfig.github },
      { label: "Medium",   href: appConfig.medium },
    ],
    direct: [
      { label: appConfig.email,            href: `mailto:${appConfig.email}` },
      { label: t("footer.direct_links.1"), href: appConfig.calLink },
    ],
  }

  const headingCls = "text-body font-mono text-text-subtle tracking-[0.12em] uppercase mb-4"
  // Hovering one link fades its siblings out (group) while the hovered one stays fully opaque.
  const colCls     = "group/footer-links"
  const linkCls    = "text-body text-text-muted no-underline block py-1 transition-[color,opacity] duration-150 hover:text-primary group-hover/footer-links:opacity-40 hover:opacity-100!"

  return (
    <footer
      ref={footerRef}
      className="relative border-t border-border pt-14 pb-8 mt-20 text-text-muted"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {physicsEnabled && <FooterPhysicsCanvas canvasRef={physics.canvasRef} />}

      <Shell className="relative">
        {/* Wordmark — letters bolden near the cursor */}
        <FooterWordmark pointerX={pointerX} animated={motionOk} />

        {/* Main row: tagline left, nav cols right */}
        <div className="flex gap-16 mb-16 max-[700px]:flex-col max-[700px]:gap-10">

          {/* Left: tagline + location */}
          <div className="flex-1 min-w-0">
            <p className="font-display font-medium text-subheading text-text tracking-[-0.01em] mb-3">{t("footer.tagline")}</p>
            <p className="text-body text-text-subtle leading-[1.6]">
              Las Palmas de Gran Canaria, ES.<br />
              UTC+0 · GMT/WET
            </p>
          </div>

          {/* Right: nav columns */}
          <div className="flex gap-16 shrink-0 max-[700px]:grid max-[700px]:grid-cols-2 max-[700px]:gap-8">
            <div>
              <h4 className={headingCls}>{t("footer.sitemap_heading")}</h4>
              <div className={colCls}>
                {links.sitemap.map((l) => (
                  <TransitionLink key={l.label} href={l.href} className={linkCls}>{l.label}</TransitionLink>
                ))}
              </div>
            </div>

            <div>
              <h4 className={headingCls}>{t("footer.elsewhere_heading")}</h4>
              <div className={colCls}>
                {links.elsewhere.map((l) => (
                  <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className={linkCls} data-cta_click="true" data-cta_text={l.label} data-cta_url={l.href}>
                    {l.label}<span className="sr-only"> (opens in new tab)</span>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className={headingCls}>{t("footer.direct_heading")}</h4>
              <div className={colCls}>
                {links.direct.map((l) => (
                  <a key={l.label} href={l.href} className={linkCls}>{l.label}</a>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4">
          <p className="text-body text-text-subtle">{t("footer.copy")}</p>
          <div className="flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={openCookieSettings}
              className="keyboard-focus-ring text-body font-mono text-text-subtle bg-transparent border-0 shadow-none! cursor-pointer transition-colors duration-150 hover:text-primary"
            >
              {language === "fr" ? "Paramètres des cookies" : language === "es" ? "Configuración de cookies" : "Cookie settings"}
            </button>
            <TransitionLink href={`/${language}/privacy`} className="text-body font-mono text-text-subtle no-underline transition-colors duration-150 hover:text-primary">
              {language === "fr" ? "Politique de confidentialité" : language === "es" ? "Política de privacidad" : "Privacy Policy"}
            </TransitionLink>
          </div>
        </div>
      </Shell>
    </footer>
  )
}
