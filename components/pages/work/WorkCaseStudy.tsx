"use client"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { usePageReady } from "@/hooks/usePageReady"
import { PROJECTS } from "@/data/projects"
import { WebMockup, MobileMockup } from "@/components/ui/ProjectMockup"
import { ParticleHeading } from "@/components/ui/ParticleHeading"

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

  const goPrev = () => setImgIdx((i) => (i - 1 + images.length) % images.length)
  const goNext = () => setImgIdx((i) => (i + 1) % images.length)

  const currentDesktop = gallery.desktop[imgIdx] ?? project.cover
  const currentMobile  = gallery.mobile[imgIdx] ?? project.mobileCover ?? project.cover
  const currentMobile2 = gallery.mobile[(imgIdx + 1) % Math.max(gallery.mobile.length, 1)] ?? project.cover2

  const NavDots = () => (
    <div className="inline-flex items-center border border-border bg-[#0a0a09]">
      <button onClick={goPrev} className="px-3 py-2 font-mono text-[15px] text-text-subtle border-r border-border transition-colors hover:text-primary cursor-pointer leading-none" aria-label="Previous screen">←</button>
      <div className="flex gap-2 items-center px-3">
        {images.map((_, i) => (
          <button key={i} onClick={() => setImgIdx(i)} aria-label={`Screen ${i + 1}`}
            className={`h-1.5 transition-all duration-200 cursor-pointer ${i === imgIdx ? "w-5 bg-primary" : "w-1.5 bg-border-2 hover:bg-text-subtle"}`}
          />
        ))}
      </div>
      <button onClick={goNext} className="px-3 py-2 font-mono text-[15px] text-text-subtle border-l border-border transition-colors hover:text-primary cursor-pointer leading-none" aria-label="Next screen">→</button>
    </div>
  )

  return (
    <div className="flex min-h-svh pt-[60px]">

      {/* ── Left — sticky mockup panel (desktop only) ── */}
      <div className="sticky top-[60px] self-start h-[calc(100svh-60px)] w-[55%] shrink-0 border-r border-border overflow-hidden max-[900px]:hidden">
        <div className="relative w-full h-full bg-[#0a0a09] flex items-center justify-center px-12 pt-10 pb-20">
          <div className="absolute inset-0 pointer-events-none z-10 bg-[repeating-linear-gradient(45deg,rgba(212,255,58,0.007)_0_12px,transparent_12px_24px)]" />

          {project.kind === "mobile" ? (
            <MobileMockup
              mobile={currentMobile}
              mobile2={project.cover2 ? (currentMobile2 ?? project.cover2) : undefined}
              sizes="200px"
              mobile2Sizes="148px"
              primaryClassName="w-[200px] shrink-0"
              secondaryClassName="w-[148px] -translate-y-10 shrink-0"
              priority
              containerClassName="relative z-20 flex items-center justify-center gap-6"
            />
          ) : (
            <WebMockup
              desktop={currentDesktop}
              mobile={project.mobileCover ? currentMobile : undefined}
              domain={project.domain}
              sizes="55vw"
              mobileSizes="120px"
              mobileOverlayClassName="absolute -bottom-4 -right-4 w-[20%] z-20"
              priority
              containerClassName="relative z-20 w-full"
              innerClassName="w-full"
            />
          )}

          {canNav && (
            <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-center pb-6">
              <NavDots />
            </div>
          )}
        </div>
      </div>

      {/* ── Right — info panel ── */}
      <div className="flex-1 min-w-0 flex flex-col min-[900px]:h-[calc(100svh-60px)] min-[900px]:overflow-y-auto scrollbar-none">
        <div className="flex flex-col flex-1 min-h-0 px-(--gutter) py-10 gap-8 justify-between">

          {/* Nav + title */}
          <div>
            <a href={`/${locale}/work`} className="inline-flex items-center gap-1.5 font-mono text-[11px] text-text-subtle tracking-[0.1em] uppercase no-underline mb-8 transition-colors hover:text-primary">
              {t("work_ui.back_work")}
            </a>
            <span className="font-mono text-[10px] text-text-subtle tracking-[0.14em] uppercase block mb-2">{item.n}</span>
            <ParticleHeading as="h1" className="font-display text-[clamp(32px,3.8vw,60px)] font-semibold tracking-[-0.04em] leading-[0.92] text-text mb-3">
              {item.tag}
            </ParticleHeading>
            <p className="font-mono text-[11px] text-text-subtle tracking-[0.08em] uppercase">{item.client}</p>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-5 border-t border-border pt-6">
            {([
              [t("work_ui.meta_type"), item.type],
              [t("work_ui.meta_year"), item.year],
              [t("work_ui.meta_role"), item.role],
              [t("work_ui.meta_stack"), item.stack],
            ] as [string, string][]).map(([k, v]) => (
              <div key={k}>
                <span className="font-mono text-[9px] text-text-subtle tracking-[0.12em] uppercase block mb-1">{k}</span>
                <span className="text-[13px] text-text leading-[1.4]">{v}</span>
              </div>
            ))}
          </div>

          {/* Description */}
          <p className="text-text-muted text-[14px] leading-[1.75] border-t border-border pt-6">
            {item.body}
          </p>

          {/* Mobile mockup (visible below 900px) */}
          <div className="hidden max-[900px]:block relative bg-[#0a0a09] overflow-hidden" style={{ minHeight: 260 }}>
            <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(45deg,rgba(212,255,58,0.007)_0_12px,transparent_12px_24px)]" />

            {project.kind === "mobile" ? (
              <MobileMockup
                mobile={currentMobile}
                mobile2={project.cover2 ? (currentMobile2 ?? project.cover2) : undefined}
                sizes="140px"
                mobile2Sizes="110px"
                primaryClassName="w-[140px] shrink-0"
                secondaryClassName="w-[110px] -translate-y-6 shrink-0"
                containerClassName="relative z-10 flex items-center justify-center gap-4 py-8 px-6"
              />
            ) : (
              <WebMockup
                desktop={currentDesktop}
                mobile={project.mobileCover ? currentMobile : undefined}
                domain={project.domain}
                sizes="100vw"
                mobileSizes="80px"
                mobileOverlayClassName="absolute bottom-4 right-6 w-[18%] z-20"
                containerClassName="relative z-10 px-6 py-8"
                innerClassName="w-full"
              />
            )}

            {canNav && (
              <div className="relative z-20 flex justify-center pb-4">
                <NavDots />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border pt-6 flex flex-col gap-4">
            {project.href ? (
              <a href={project.href} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.1em] uppercase text-primary no-underline transition-opacity hover:opacity-75">
                {project.domain} ↗
              </a>
            ) : (
              <span className="font-mono text-[11px] text-text-subtle tracking-[0.1em] uppercase">{t("work_ui.private")}</span>
            )}
            <div className="flex gap-6 flex-wrap">
              {prev && (
                <a href={`/${locale}/work/${prev.slug}`} className="font-mono text-[11px] text-text-subtle tracking-[0.1em] uppercase no-underline transition-colors hover:text-primary">
                  ← {prev.client}
                </a>
              )}
              {next && (
                <a href={`/${locale}/work/${next.slug}`} className="font-mono text-[11px] text-text-subtle tracking-[0.1em] uppercase no-underline transition-colors hover:text-primary">
                  {next.client} →
                </a>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
