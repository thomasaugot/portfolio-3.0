"use client"

import { useRef } from "react"
import { useTranslations } from "next-intl"
import { HeroBackdrop } from "@/components/pages/home/HeroBackdrop"
import { Button } from "@/components/ui/Button"
import { IconArrow } from "@/components/ui/Icons"
import { useGSAPAnimations } from "@/hooks/useGSAPAnimations"
import { gsap } from "@/lib/gsap"

export function HomeHero() {
  const t = useTranslations("home.hero")
  const leftRef  = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)

  const meta = [
    [t("meta1_k"), t("meta1_v")],
    [t("meta2_k"), t("meta2_v")],
    [t("meta3_k"), t("meta3_v")],
  ] as [string, string][]

  useGSAPAnimations(() => {
    const left  = leftRef.current
    const right = rightRef.current
    if (!left || !right) return

    gsap.fromTo(
      left.querySelectorAll("[data-hero-item]"),
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.75, stagger: 0.13, ease: "power2.out" }
    )
    gsap.fromTo(
      right,
      { opacity: 0 },
      { opacity: 1, duration: 1.2, delay: 0.2, ease: "power1.out" }
    )
  })

  return (
    <section className="hero-section">
      <div className="shell">
        <div className="hero-grid">
          {/* Left column */}
          <div className="hero-left" ref={leftRef}>
            <span className="text-eyebrow" data-hero-item>{t("eyebrow")}</span>

            <h1 className="hero-headline" data-hero-item>
              <span>{t("h1a")}</span>
              <span className="hero-headline-accent">{t("h1b")}</span>
              <span>{t("h1c")}</span>
              <span>
                {t("h1d")}&nbsp;
                <span className="text-serif-italic hero-headline-italic">{t("h1e")}</span>
              </span>
            </h1>

            <p className="hero-sub" data-hero-item>{t("sub")}</p>

            <div className="hero-ctas" data-hero-item>
              <Button variant="filled" icon={<IconArrow />}>
                <a href="#contact" className="text-inherit no-underline">{t("cta1")}</a>
              </Button>
              <Button variant="ghost">
                <a href="#work" className="text-inherit no-underline">{t("cta2")} →</a>
              </Button>
            </div>

            <div className="hero-meta" data-hero-item>
              {meta.map(([k, v]) => (
                <div key={k}>
                  <span className="hero-meta-key">{k}</span>
                  <span className="hero-meta-val">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column — WebGL only */}
          <div className="hero-terminal-col" ref={rightRef}>
            <div className="hero-right-stack">
              <HeroBackdrop />
              <div className="webgl-tag" aria-hidden="true">
                <span className="webgl-dot" />
                webgl · drag to rotate
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
