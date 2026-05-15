"use client"

import { useTranslations } from "next-intl"
import { ParticleHeading } from "@/components/ui/ParticleHeading"
import { HomeTerminal } from "@/components/pages/home/HomeTerminal"
import { IconArrow } from "@/components/ui/Icons"
import { TransitionLink } from "@/components/ui/TransitionLink"

export function HomeHero() {
  const t = useTranslations("home.hero")

  const meta = [
    [t("meta1_k"), t("meta1_v")],
    [t("meta2_k"), t("meta2_v")],
    [t("meta3_k"), t("meta3_v")],
  ] as [string, string][]

  return (
    <section className="relative overflow-x-clip min-h-svh flex flex-col justify-center pt-[clamp(80px,10vh,130px)] pb-[clamp(24px,5vh,60px)]">
      <div className="shell flex flex-col gap-10">
        <div className="grid grid-cols-[1fr_1fr] gap-14 items-stretch max-[900px]:grid-cols-1">

          {/* Left column */}
          <div className="flex flex-col justify-between gap-8">
            <span className="text-eyebrow hero-left-item">{t("eyebrow")}</span>

            <ParticleHeading
              as="h1"
              className="font-display font-semibold text-[clamp(38px,5.5vw,90px)] leading-[0.92] tracking-[-0.045em] flex flex-col hero-left-item"
            >
              <span>{t("h1a")}</span>
              <span className="text-primary">{t("h1b")}</span>
              {t("h1b2") && <span className="text-primary">{t("h1b2")}</span>}
              <span>{t("h1c")}</span>
              <span>
                {t("h1d")}&nbsp;
                <span className="text-serif-italic text-text-muted text-[0.85em]">{t("h1e")}</span>
              </span>
            </ParticleHeading>

            <p className="text-text-muted text-[16px] leading-[1.55] hero-left-item">
              {t("sub")}
            </p>

            <div className="flex gap-3 items-center flex-wrap hero-left-item">
              <TransitionLink href="#contact" className="btn btn-filled keyboard-focus-ring" data-cta_click="true" data-cta_text="Contact" data-cta_url="#contact">
                {t("cta1")}
                <span className="btn-arrow"><IconArrow /></span>
              </TransitionLink>
              <TransitionLink href="#work" className="btn btn-ghost keyboard-focus-ring" data-cta_click="true" data-cta_text="View work" data-cta_url="#work">
                {t("cta2")} <span aria-hidden="true">→</span>
              </TransitionLink>
            </div>
          </div>

          {/* Right column — terminal */}
          <div className="flex flex-col max-[900px]:hidden hero-right">
            <HomeTerminal />
          </div>

        </div>

        {/* Meta stats — full width below */}
        <div className="flex gap-10 text-[11px] text-text-subtle uppercase tracking-[0.12em] border-t border-border pt-5 max-[900px]:flex-wrap hero-meta">
          {meta.map(([k, v]) => (
            <div key={k}>
              <span className="block mb-1">{k}</span>
              <span className="text-text text-[16px] tracking-[0.02em] normal-case">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
