"use client"

import { useTranslations } from "next-intl"
import { appConfig } from "@/config/app.config"

export function Footer() {
  const t = useTranslations()

  const links = {
    sitemap: [
      { label: t("footer.sitemap_links.0"), href: "#services" },
      { label: t("footer.sitemap_links.1"), href: "#work" },
      { label: t("footer.sitemap_links.2"), href: "#process" },
      { label: t("footer.sitemap_links.3"), href: "#about" },
      { label: t("footer.sitemap_links.4"), href: "#contact" },
    ],
    elsewhere: [
      { label: "LinkedIn", href: appConfig.linkedin },
      { label: "GitHub",   href: appConfig.github },
      { label: "Medium",   href: appConfig.medium },
    ],
    direct: [
      { label: appConfig.email,             href: `mailto:${appConfig.email}` },
      { label: t("footer.direct_links.1"),  href: appConfig.calLink },
      { label: t("footer.direct_links.2"),  href: `mailto:${appConfig.email}?subject=Brief` },
    ],
  }

  return (
    <footer className="border-t border-border pt-14 pb-8 mt-20 text-text-muted text-[12px]">
      <div className="shell">
        <div className="font-display font-semibold text-[clamp(32px,6vw,96px)] tracking-tighter leading-[0.85] text-surface-2 mb-8 whitespace-nowrap overflow-hidden select-none">
          helloimtom.dev
        </div>

        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-8 mb-16 max-[900px]:grid-cols-2 max-[900px]:gap-6 max-[560px]:grid-cols-1">
          <div>
            <p className="font-display font-medium text-[18px] text-text tracking-[-0.01em] mb-3">{t("footer.tagline")}</p>
            <p className="text-text-subtle text-[12px] leading-[1.6]">
              Las Palmas de Gran Canaria, ES.<br />
              UTC+0 · GMT/WET
            </p>
          </div>

          <div>
            <h4 className="text-[11px] text-text-subtle tracking-[0.12em] uppercase mb-4">{t("footer.sitemap_heading")}</h4>
            {links.sitemap.map((l) => (
              <a key={l.label} href={l.href} className="text-text-muted no-underline block py-1 text-[13px] transition-colors duration-150 hover:text-primary">{l.label}</a>
            ))}
          </div>

          <div>
            <h4 className="text-[11px] text-text-subtle tracking-[0.12em] uppercase mb-4">{t("footer.elsewhere_heading")}</h4>
            {links.elsewhere.map((l) => (
              <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="text-text-muted no-underline block py-1 text-[13px] transition-colors duration-150 hover:text-primary">
                {l.label}
              </a>
            ))}
          </div>

          <div>
            <h4 className="text-[11px] text-text-subtle tracking-[0.12em] uppercase mb-4">{t("footer.direct_heading")}</h4>
            {links.direct.map((l) => (
              <a key={l.label} href={l.href} className="text-text-muted no-underline block py-1 text-[13px] transition-colors duration-150 hover:text-primary">{l.label}</a>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-border">
          <p className="text-text-subtle text-[11px]">{t("footer.copy")}</p>
        </div>
      </div>
    </footer>
  )
}
