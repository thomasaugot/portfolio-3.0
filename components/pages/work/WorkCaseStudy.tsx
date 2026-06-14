"use client"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { usePageReady } from "@/hooks/usePageReady"
import { PROJECTS } from "@/data/projects"
import { WebMockup, MobileMockup } from "@/components/ui/ProjectMockup"
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

function NavDots({ images, imgIdx, setImgIdx }: { images: string[]; imgIdx: number; setImgIdx: (i: number) => void }) {
  const goPrev = () => setImgIdx((imgIdx - 1 + images.length) % images.length)
  const goNext = () => setImgIdx((imgIdx + 1) % images.length)
  return (
    <div className="inline-flex items-center border border-border bg-surface-2" role="group" aria-label="Image navigation">
      <button onClick={goPrev} className="px-3 py-2 text-body font-mono text-text-subtle border-r border-border transition-colors hover:text-primary cursor-pointer leading-none keyboard-focus-ring" aria-label="Previous screen">
        <span aria-hidden="true">←</span>
      </button>
      <div className="flex gap-2 items-center px-3">
        {images.map((_, i) => (
          <button key={i} onClick={() => setImgIdx(i)} aria-label={`Screen ${i + 1}`} aria-pressed={i === imgIdx}
            className={`h-1.5 transition-all duration-200 cursor-pointer keyboard-focus-ring ${i === imgIdx ? "w-5 bg-primary" : "w-1.5 bg-border-2 hover:bg-text-subtle"}`}
          />
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
  const [imgIdx, setImgIdx] = useState(0)

  if (!item || !project) return null

  const projectIdx = PROJECTS.findIndex((p) => p.slug === slug)
  const prev = PROJECTS[projectIdx - 1]
  const next = PROJECTS[projectIdx + 1]

  const images = project.kind === "mobile" ? gallery.mobile : gallery.desktop
  const canNav = images.length > 1

  const currentDesktop = gallery.desktop[imgIdx] ?? project.cover
  const currentMobile  = gallery.mobile[imgIdx] ?? project.mobileCover ?? project.cover
  const currentMobile2 = gallery.mobile[(imgIdx + 1) % Math.max(gallery.mobile.length, 1)] ?? project.cover2

  return (
    <>
    <div className="flex pt-[60px]">

      {/* ── Left — sticky mockup panel (desktop only) ── */}
      <div className="sticky top-[60px] self-start h-[calc(100svh-60px)] w-[55%] shrink-0 border-r border-border max-[900px]:hidden">
        <div className="relative w-full h-full bg-surface-2 flex items-center justify-center px-12 pt-10 pb-20">
          <div className="absolute inset-0 pointer-events-none z-10 bg-[repeating-linear-gradient(45deg,rgba(212,255,58,0.007)_0_12px,transparent_12px_24px)]" />

          {project.kind === "mobile" ? (
            <MobileMockup
              mobile={currentMobile}
              mobile2={project.cover2 ? (currentMobile2 ?? project.cover2) : undefined}
              priority
            />
          ) : (
            <WebMockup
              desktop={currentDesktop}
              mobile={project.mobileCover ? currentMobile : undefined}
              domain={project.domain}
              priority
            />
          )}

          {canNav && (
            <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-center pb-6">
              <NavDots images={images} imgIdx={imgIdx} setImgIdx={setImgIdx} />
            </div>
          )}
        </div>
      </div>

      {/* ── Right — info panel ── */}
      <div className="flex-1 min-w-0 flex flex-col min-[900px]:h-[calc(100svh-60px)] min-[900px]:overflow-y-auto scrollbar-none">
        <div className="flex flex-col flex-1 min-h-0 px-gutter py-10 gap-8">

          {/* Nav + title */}
          <div>
            <TransitionLink href={`/${locale}/work`} className="text-body inline-flex items-center gap-2 font-mono text-text tracking-[0.08em] uppercase no-underline mb-8 py-2 px-3 -ml-3 border border-border bg-surface transition-colors hover:border-primary hover:text-primary keyboard-focus-ring">
              {t("work_ui.back_work")}
            </TransitionLink>
            <span className="text-caption font-mono text-text-subtle tracking-[0.14em] uppercase block mb-4">{item.n}</span>
            <ParticleHeading as="h1" className="font-display text-[clamp(32px,3.8vw,60px)] font-semibold tracking-[-0.04em] leading-[0.92] text-text mb-3">
              {item.tag}
            </ParticleHeading>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="text-caption font-mono text-text-subtle tracking-[0.08em] uppercase">{item.client}</p>
              {project.href && (
                <a href={project.href} target="_blank" rel="noopener noreferrer"
                  className="text-caption inline-flex items-center gap-2 font-mono tracking-[0.1em] uppercase text-primary no-underline transition-opacity hover:opacity-75 keyboard-focus-ring">
                  {project.domain} ↗<span className="sr-only"> (opens in new tab)</span>
                </a>
              )}
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
          <div className="hidden max-[900px]:block relative bg-surface-2 min-h-65">
            <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(45deg,rgba(212,255,58,0.007)_0_12px,transparent_12px_24px)]" />

            {project.kind === "mobile" ? (
              <MobileMockup
                mobile={currentMobile}
                mobile2={project.cover2 ? (currentMobile2 ?? project.cover2) : undefined}
              />
            ) : (
              <WebMockup
                desktop={currentDesktop}
                mobile={project.mobileCover ? currentMobile : undefined}
                domain={project.domain}
              />
            )}

            {canNav && (
              <div className="relative z-20 flex justify-center pb-4">
                <NavDots images={images} imgIdx={imgIdx} setImgIdx={setImgIdx} />
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
