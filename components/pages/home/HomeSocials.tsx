"use client"
import { useTranslations } from "next-intl"
import { ParticleHeading } from "@/components/ui/ParticleHeading"
import { appConfig } from "@/config/app.config"

const HREFS: Record<string, string> = {
  medium:   appConfig.medium,
  github:   appConfig.github,
  linkedin: appConfig.linkedin,
}

const FEATURED: Record<string, boolean> = {
  medium: true,
}

interface SocialItem {
  key: string
  label: string
  handle: string
  desc: string
  cta: string
}

export function HomeSocials() {
  const t = useTranslations("home")
  const items = t.raw("socials.items") as SocialItem[]

  return (
    <section className="py-[clamp(80px,12vh,160px)] border-t border-border">
      <div className="shell">
        <div className="grid grid-cols-[1fr_2fr] gap-(--gutter) mb-14 items-end max-[720px]:grid-cols-1 max-[720px]:gap-4">
          <span className="font-mono text-[12px] text-text-subtle">{t("socials.section_meta")}</span>
          <ParticleHeading className="font-display font-semibold tracking-tight text-[clamp(2.5rem,5.4vw,5.5rem)] leading-[0.95]">{t("socials.section_title")}</ParticleHeading>
        </div>

        <div className="grid gap-0.5 grid-cols-[2fr_1fr_1fr] max-[700px]:grid-cols-1">
          {items.map((s) => (
            <a
              key={s.key}
              href={HREFS[s.key] ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${s.label} — ${s.cta} (opens in new tab)`}
              className={`group flex flex-col gap-3 p-7 border border-border no-underline text-inherit transition-[background,border-color] duration-150 hover:bg-surface-2 hover:border-primary keyboard-focus-ring${FEATURED[s.key] ? " bg-surface-2" : " bg-surface"}`}
              data-cta_click="true"
              data-cta_text={s.label}
              data-cta_url={HREFS[s.key] ?? "#"}
            >
              <div className="flex items-baseline justify-between gap-3" aria-hidden="true">
                <span className="font-display text-[22px] font-semibold tracking-[-0.02em] text-text">{s.label}</span>
                <span className="font-mono text-[11px] text-primary tracking-[0.04em]">{s.handle}</span>
              </div>
              <p className="text-[16px] text-text-muted leading-[1.55] flex-1 m-0">{s.desc}</p>
              <span className="font-mono text-[12px] text-text-subtle tracking-[0.04em] transition-colors duration-150 group-hover:text-primary" aria-hidden="true">{s.cta}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
