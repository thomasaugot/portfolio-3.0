"use client"

import { useCallback, useEffect, useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { usePageReady } from "@/hooks/usePageReady"
import { PROJECTS } from "@/data/projects"
import { MockupCarousel } from "@/components/ui/MockupCarousel"
import { ParticleHeading } from "@/components/ui/ParticleHeading"
import { TransitionLink } from "@/components/ui/TransitionLink"
import { TechTag } from "@/components/ui/TechTag"

interface WorkItem {
  n: string
  client: string
  tag: string
  type: string
  year: string
  role: string
  stack: string
  body: string
  slug: string
}

const AUTO_MS = 3200

function NavDots({ images, imgIdx, setImgIdx, paused, cycle, onPause, onResume }: { images: string[]; imgIdx: number; setImgIdx: (i: number) => void; paused: boolean; cycle: number; onPause: () => void; onResume: () => void }) {
  const goPrev = () => setImgIdx((imgIdx - 1 + images.length) % images.length)
  const goNext = () => setImgIdx((imgIdx + 1) % images.length)
  return (
    <div className="inline-flex items-center border border-border bg-surface-2" role="group" aria-label="Image navigation" onMouseEnter={onPause} onMouseLeave={onResume} onFocus={onPause} onBlur={onResume}>
      <button onClick={goPrev} className="px-3 py-2 text-body font-mono text-text-subtle border-r border-border transition-colors hover:text-primary cursor-pointer leading-none keyboard-focus-ring" aria-label="Previous screen">
        <span aria-hidden="true">←</span>
      </button>
      <div className="flex gap-2 items-center px-3">
        {images.map((_, i) => (
          <button key={i} onClick={() => setImgIdx(i)} aria-label={`Screen ${i + 1}`} aria-pressed={i === imgIdx}
            className={`relative h-1.5 overflow-hidden transition-all duration-300 cursor-pointer keyboard-focus-ring ${i === imgIdx ? "w-7 bg-border-2" : "w-1.5 bg-border-2 hover:bg-text-subtle"}`}
          >
            {i === imgIdx && (
              <span
                key={cycle}
                aria-hidden="true"
                className={`absolute inset-0 origin-left bg-primary animate-[carousel-fill_3.2s_linear_forwards] ${paused ? "[animation-play-state:paused]" : ""}`}
              />
            )}
          </button>
        ))}
      </div>
      <button onClick={goNext} className="px-3 py-2 text-body font-mono text-text-subtle border-l border-border transition-colors hover:text-primary cursor-pointer leading-none keyboard-focus-ring" aria-label="Next screen">
        <span aria-hidden="true">→</span>
      </button>
    </div>
  )
}

export function WorkCaseStudy({ slug }: { slug: string }) {
  usePageReady()
  const t = useTranslations("home")
  const locale = useLocale()
  const work = t.raw("work") as WorkItem[]
  const item = work.find((w) => w.slug === slug)
  const project = PROJECTS.find((p) => p.slug === slug)

  const gallery = project?.gallery ?? { desktop: [], mobile: [] }
  const [imgIdx, setImgIdxState] = useState(0)
  const [paused, setPaused] = useState(false)
  const [cycle, setCycle] = useState(0) // bumps on every change so the progress fill restarts
  const total = (project?.kind === "mobile" ? gallery.mobile : gallery.desktop).length
  const setImgIdx = useCallback((i: number) => { setImgIdxState(i); setCycle((c) => c + 1) }, [])

  // Auto-advance, paused only while the pointer rests on the dot controls.
  useEffect(() => {
    if (paused || total < 2) return
    const id = window.setTimeout(() => setImgIdx((imgIdx + 1) % total), AUTO_MS)
    return () => window.clearTimeout(id)
  }, [imgIdx, paused, total, cycle, setImgIdx])

  if (!item || !project) return null

  const projectIdx = PROJECTS.findIndex((p) => p.slug === slug)
  const prev = PROJECTS[projectIdx - 1]
  const next = PROJECTS[projectIdx + 1]

  const images = project.kind === "mobile" ? gallery.mobile : gallery.desktop
  const canNav = images.length > 1

  return (
    <>
    <div className="flex pt-[60px]">

      {/* ── Left — sticky mockup panel (desktop only) ── */}
      <div
        className="sticky top-[60px] self-start h-[calc(100svh-60px)] w-[50%] shrink-0 border-r border-border max-[900px]:hidden"
      >
        <div className="relative w-full h-full bg-surface-2 px-10 pt-8 pb-24">
          <div className="absolute inset-0 pointer-events-none z-10 bg-[repeating-linear-gradient(45deg,rgba(212,255,58,0.007)_0_12px,transparent_12px_24px)]" />

          <MockupCarousel project={project} index={imgIdx} priority />

          {canNav && (
            <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-center pb-6">
              <NavDots images={images} imgIdx={imgIdx} setImgIdx={setImgIdx} paused={paused} cycle={cycle} onPause={() => setPaused(true)} onResume={() => setPaused(false)} />
            </div>
          )}
        </div>
      </div>

      {/* ── Right — info panel ── */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex flex-col flex-1 min-h-0 px-gutter py-10 gap-8 max-w-[760px]">

          {/* Nav + title */}
          <div>
            <TransitionLink href={`/${locale}/work`} className="text-body inline-flex items-center gap-2 font-mono text-text tracking-[0.08em] uppercase no-underline mb-8 py-2 px-3 -ml-3 border border-border bg-surface transition-colors hover:border-primary hover:text-primary keyboard-focus-ring">
              {t("work_ui.back_work")}
            </TransitionLink>
            <span className="text-caption font-mono text-text-subtle tracking-[0.14em] uppercase block mb-4">{item.n}</span>
            <ParticleHeading as="h1" className="font-display text-[clamp(28px,3vw,48px)] font-semibold tracking-[-0.04em] leading-[0.95] text-text mb-4 [overflow-wrap:anywhere]">
              {item.tag}
            </ParticleHeading>
            <div className="flex flex-col gap-3">
              <p className="text-caption font-mono text-text-subtle tracking-[0.08em] uppercase">{item.client}</p>
              <div className="flex items-center gap-x-5 gap-y-2 flex-wrap">
                {project.href && (
                  <a href={project.href} target="_blank" rel="noopener noreferrer"
                    className="text-caption inline-flex items-center gap-2 font-mono tracking-[0.1em] uppercase text-primary no-underline transition-opacity hover:opacity-75 keyboard-focus-ring [overflow-wrap:anywhere]">
                    {project.domain} ↗<span className="sr-only"> (opens in new tab)</span>
                  </a>
                )}
                {project.href2 && project.domain2 && (
                  <a href={project.href2} target="_blank" rel="noopener noreferrer"
                    className="text-caption inline-flex items-center gap-2 font-mono tracking-[0.1em] uppercase text-primary no-underline transition-opacity hover:opacity-75 keyboard-focus-ring [overflow-wrap:anywhere]">
                    {project.domain2} ↗<span className="sr-only"> (opens in new tab)</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Meta — type / year / role */}
          <div className="grid grid-cols-3 gap-x-6 gap-y-5 border-t border-border pt-6">
            {([
              [t("work_ui.meta_type"), item.type],
              [t("work_ui.meta_year"), item.year],
              [t("work_ui.meta_role"), item.role],
            ] as [string, string][]).map(([k, v]) => (
              <div key={k}>
                <span className="text-caption font-mono text-text-subtle tracking-[0.12em] uppercase block mb-1">{k}</span>
                <span className="text-body text-text leading-[1.4]">{v}</span>
              </div>
            ))}
          </div>

          {/* Stack — chip grid */}
          <div className="border-t border-border pt-6">
            <span className="text-caption font-mono text-text-subtle tracking-[0.12em] uppercase block mb-3">{t("work_ui.meta_stack")}</span>
            <div className="flex flex-wrap gap-2 pb-1 pr-1">
              {item.stack.split(/\s*·\s*|\s*,\s*/).filter(Boolean).map((tech) => (
                <TechTag key={tech} tag={tech} />
              ))}
            </div>
          </div>

          {/* Description */}
          <p className="text-body text-text-muted leading-[1.75] border-t border-border pt-6">
            {item.body}
          </p>

          {/* Mobile mockup (visible below 900px) */}
          <div className="hidden max-[900px]:block relative bg-surface-2">
            <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(45deg,rgba(212,255,58,0.007)_0_12px,transparent_12px_24px)]" />
            <div className={project.kind === "mobile" ? "relative aspect-3/4" : "relative aspect-4/3"}>
              <MockupCarousel project={project} index={imgIdx} />
            </div>

            {canNav && (
              <div className="relative z-20 flex justify-center pb-4">
                <NavDots images={images} imgIdx={imgIdx} setImgIdx={setImgIdx} paused={paused} cycle={cycle} onPause={() => setPaused(true)} onResume={() => setPaused(false)} />
              </div>
            )}
          </div>

        </div>
      </div>
    </div>

    {/* Prev/Next project navigation — full width below */}
    <nav aria-label="Project navigation" className="grid grid-cols-2 border-t border-border">
      {prev ? (
        <TransitionLink href={`/${locale}/work/${prev.slug}`} aria-label={`Previous project: ${prev.client}`} className="text-body font-mono text-text tracking-[0.04em] uppercase no-underline py-6 px-gutter bg-surface transition-colors hover:border-primary hover:text-primary keyboard-focus-ring min-w-0 wrap-break-word">
          <span aria-hidden="true">←&nbsp;</span>{prev.client}
        </TransitionLink>
      ) : <span />}
      {next ? (
        <TransitionLink href={`/${locale}/work/${next.slug}`} aria-label={`Next project: ${next.client}`} className="text-body font-mono text-text tracking-[0.04em] uppercase no-underline py-6 px-gutter bg-surface transition-colors hover:border-primary hover:text-primary keyboard-focus-ring min-w-0 wrap-break-word text-right justify-self-end">
          {next.client}<span aria-hidden="true">&nbsp;→</span>
        </TransitionLink>
      ) : <span />}
    </nav>
    </>
  )
}
