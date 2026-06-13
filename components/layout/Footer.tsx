"use client"

import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import { appConfig } from "@/config/app.config"
import { useTranslationContext } from "@/contexts/TranslationContext"
import { TransitionLink } from "@/components/ui/TransitionLink"
import { Shell } from "@/components/layout/Shell"

export function Footer() {
  const t = useTranslations()
  const { language } = useTranslationContext()
  const pathname = usePathname()
  const isHome = pathname === `/${language}`

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
  const linkCls    = "text-body text-text-muted no-underline block py-1 pl-0 transition-colors duration-150 hover:text-primary"

  return (
    <footer className="border-t border-border pt-14 pb-8 mt-20 text-text-muted">
      <Shell>
        {/* Wordmark */}
        <div className="font-display font-semibold text-[clamp(32px,6vw,96px)] tracking-tighter leading-[0.85] text-surface-2 mb-10 whitespace-nowrap overflow-hidden select-none">
          helloimtom.dev
        </div>

        {/* Tagline */}
        <div className="mb-10">
          <p className="font-display font-medium text-subheading text-text tracking-[-0.01em] mb-3">{t("footer.tagline")}</p>
          <p className="text-body text-text-subtle leading-[1.6]">
            Las Palmas de Gran Canaria, ES.<br />
            UTC+0 · GMT/WET
          </p>
        </div>

        {/* Nav columns — desktop: 3 col, mobile: 2 col */}
        <div className="grid grid-cols-3 gap-8 mb-16 max-[600px]:grid-cols-1 max-[600px]:gap-6">
          <div>
            <h4 className={headingCls}>{t("footer.sitemap_heading")}</h4>
            {links.sitemap.map((l) => (
              <TransitionLink key={l.label} href={l.href} className={linkCls}>{l.label}</TransitionLink>
            ))}
          </div>

          <div>
            <h4 className={headingCls}>{t("footer.elsewhere_heading")}</h4>
            {links.elsewhere.map((l) => (
              <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className={linkCls} data-cta_click="true" data-cta_text={l.label} data-cta_url={l.href}>
                {l.label}<span className="sr-only"> (opens in new tab)</span>
              </a>
            ))}
          </div>

          <div>
            <h4 className={headingCls}>{t("footer.direct_heading")}</h4>
            {links.direct.map((l) => (
              <a key={l.label} href={l.href} className={linkCls}>{l.label}</a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4">
          <p className="text-body text-text-subtle">{t("footer.copy")}</p>
          <TransitionLink href={`/${language}/privacy`} className="text-body font-mono text-text-subtle no-underline transition-colors duration-150 hover:text-primary">
            {language === "fr" ? "Politique de confidentialité" : language === "es" ? "Política de privacidad" : "Privacy Policy"}
          </TransitionLink>
        </div>
      </Shell>
    </footer>
  )
}
