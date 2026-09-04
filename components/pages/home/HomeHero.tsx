"use client"

import { useRef } from "react"
import { useTranslations } from "next-intl"
import { useHeroInteractions } from "@/hooks/useHeroInteractions"
import { ParticleHeading } from "@/components/ui/ParticleHeading"
import { HomeTerminal } from "@/components/pages/home/HomeTerminal"
import { IconArrow } from "@/components/ui/Icons"
import { TransitionLink } from "@/components/ui/TransitionLink"
import { Shell } from "@/components/layout/Shell"

export function HomeHero() {
  const t = useTranslations("home.hero")
  const sectionRef = useRef<HTMLElement>(null)
  useHeroInteractions(sectionRef)

  const meta = [
    [t("meta1_k"), t("meta1_v")],
    [t("meta2_k"), t("meta2_v")],
    [t("meta3_k"), t("meta3_v")],
  ] as [string, string][]

  return (
    <section ref={sectionRef} data-anim="hero" className="relative min-h-svh flex flex-col justify-center pt-[clamp(80px,10vh,130px)] pb-[clamp(24px,5vh,60px)] overflow-hidden">
      {/* Blueprint backdrop: cursor-lit grid + glow, and the boot scan line */}
      <div data-anim="hero-grid" aria-hidden="true" className="hero-grid pointer-events-none absolute inset-0 opacity-0" />
      <div data-anim="hero-glow" aria-hidden="true" className="hero-glow pointer-events-none absolute left-0 top-0 opacity-0 will-change-transform" />
      <div data-anim="hero-scan" aria-hidden="true" className="hero-scan pointer-events-none absolute left-0 right-0 top-0 opacity-0" />

      <Shell className="relative z-[1] flex flex-col gap-10">
        <div className="grid grid-cols-[1fr_1fr] gap-14 items-stretch max-[900px]:grid-cols-1">

          {/* Left column */}
          <div data-anim="hero-left" className="flex flex-col justify-around gap-8">
            <span className="text-label font-mono" data-anim="hero-left-item">{t("eyebrow")}</span>

            <ParticleHeading
              as="h1"
              className="font-display font-semibold text-[clamp(38px,5.5vw,90px)] leading-[0.92] tracking-[-0.045em] flex flex-col"
              data-anim="hero-left-item"
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

            <p className="text-body leading-[1.55]" data-anim="hero-left-item">
              {t("sub")}
            </p>

            <div className="flex gap-5 items-center flex-wrap pb-3" data-anim="hero-left-item">
              <span data-magnetic className="inline-flex will-change-transform">
              <TransitionLink href="#contact" className="btn btn-filled inline-flex items-center gap-2.5 font-mono text-[16px] tracking-[0.02em] px-5.5 py-3.5 border border-primary bg-primary text-black font-medium cursor-pointer relative z-0 overflow-hidden no-underline whitespace-nowrap select-none transition-[border-color,color,background,transform] duration-normal ease-out hover:bg-text hover:border-text active:translate-y-px after:content-[''] after:absolute after:inset-0 after:bg-[linear-gradient(120deg,transparent_30%,rgba(255,255,255,0.6)_50%,transparent_70%)] after:-translate-x-full hover:after:translate-x-full after:transition-transform after:duration-[0.8s] after:ease-snappy after:pointer-events-none keyboard-focus-ring" data-cta_click="true" data-cta_text="Contact" data-cta_url="#contact">
                {t("cta1")}
                <span className="inline-block transition-transform duration-[0.35s] ease-snappy group-hover:translate-x-1"><IconArrow /></span>
              </TransitionLink>
              </span>
              <TransitionLink href="#work" className="inline-flex items-center gap-2 font-mono text-[16px] tracking-[0.02em] py-3.5 text-text-muted no-underline whitespace-nowrap select-none transition-colors duration-normal ease-out hover:text-primary keyboard-focus-ring" data-cta_click="true" data-cta_text="View work" data-cta_url="#work">
                {t("cta2")} <span aria-hidden="true">→</span>
              </TransitionLink>
            </div>
          </div>

          {/* Right column — terminal */}
          <div className="flex flex-col max-[900px]:hidden" data-anim="hero-right">
            <div data-tilt className="flex flex-1 flex-col will-change-transform [transform-style:preserve-3d]">
              <HomeTerminal />
            </div>
          </div>

        </div>

        {/* Meta stats — full width below */}
        <div className="flex gap-10 border-t border-border pt-5 max-[900px]:flex-wrap" data-anim="hero-meta">
          {meta.map(([k, v]) => (
            <div key={k}>
              <span className="text-label font-mono block mb-1">{k}</span>
              <span className="text-body">{v}</span>
            </div>
          ))}
        </div>
      </Shell>
    </section>
  )
}
