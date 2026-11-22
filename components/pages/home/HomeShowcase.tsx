"use client"
import { useLocale, useTranslations } from "next-intl"
import { Shell } from "@/components/layout/Shell"
import { Button } from "@/components/ui/Button"
import { BrowserFrame } from "@/components/ui/DeviceMockup"
import { IconArrowOut } from "@/components/ui/Icons"
import { ParticleHeading } from "@/components/ui/ParticleHeading"
import { TechTag } from "@/components/ui/TechTag"
import {
  SHOWCASE_CASE_STUDY_SLUG,
  SHOWCASE_DOMAIN,
  SHOWCASE_FRAME_COUNT,
  SHOWCASE_LIVE_URL,
  SHOWCASE_TAGS,
} from "@/constants/showcase"

/**
 * Scroll-driven sites, shown rather than described: while the browser frame is
 * pinned (GSAP pin: the root layout's overflow-x-hidden rules out CSS sticky), the reader's own scroll plays a recording of the Halden site being
 * scrolled (utils/animations/showcaseScrub.ts drives the canvas).
 */
export function HomeShowcase() {
  const t = useTranslations("home")
  const locale = useLocale()

  return (
    <section id="showcase" className="section-rule py-[clamp(80px,12vh,160px)]">
      <Shell>
        <div data-showcase="row" className="grid grid-cols-[minmax(0,5fr)_minmax(0,9fr)] items-center gap-(--gutter) max-[900px]:grid-cols-1">
          <div>
            <div data-anim="section-head">
              <span data-anim="section-meta" className="font-mono text-xs text-text-subtle">
                {t("sections.showcase_meta")}
              </span>
              <ParticleHeading className="mt-6 font-display font-semibold tracking-tight text-[clamp(2.5rem,4.6vw,4.75rem)] leading-[0.95]">
                {t("sections.showcase_title")}
              </ParticleHeading>
            </div>
            <p className="mt-8 max-w-[46ch] text-text-muted text-md leading-[1.6]">{t("showcase.sub")}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {SHOWCASE_TAGS.map((tag) => (
                <TechTag key={tag} tag={tag} />
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button variant="filled" href={SHOWCASE_LIVE_URL} target="_blank" rel="noopener noreferrer">
                {t("showcase.cta_demo")}
                <IconArrowOut size={14} />
              </Button>
              <Button variant="outlined" href={`/${locale}/work/${SHOWCASE_CASE_STUDY_SLUG}`}>
                {t("showcase.cta_case")}
              </Button>
            </div>
            <p className="mt-8 font-mono text-xs text-text-subtle">{t("showcase.concept")}</p>
          </div>

          <div className="max-[900px]:mt-12">
            <figure data-showcase="stage">
              <BrowserFrame domain={SHOWCASE_DOMAIN} aspect="aspect-[16/10]">
                <canvas
                  data-showcase="canvas"
                  className="absolute inset-0 h-full w-full"
                  role="img"
                  aria-label={t("showcase.canvas_label")}
                />
              </BrowserFrame>
              <figcaption className="mt-5 flex items-baseline justify-between gap-6 font-mono text-xs text-text-subtle">
                <span>{t("showcase.caption")}</span>
                <span data-showcase="frame" className="shrink-0 tabular-nums" aria-hidden="true">
                  001 / {SHOWCASE_FRAME_COUNT}
                </span>
              </figcaption>
            </figure>
          </div>
        </div>
      </Shell>
    </section>
  )
}
