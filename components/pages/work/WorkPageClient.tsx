"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { usePageReady } from "@/hooks/usePageReady"
import { PROJECTS } from "@/data/projects"
import { WebMockup, MobileMockup } from "@/components/ui/ProjectMockup"
import { ParticleHeading } from "@/components/ui/ParticleHeading"
import { trackProjectClick } from "@/utils/gtm-events"
import { TransitionLink } from "@/components/ui/TransitionLink"

interface WorkItem { slug: string; tag: string; type: string }

export function WorkPageClient() {
  usePageReady()
  const t = useTranslations("home")
  const locale = useLocale()
  const workItems = t.raw("work") as WorkItem[]
  const workBySlug = Object.fromEntries(workItems.map((w) => [w.slug, w]))
  const [active, setActive] = useState(PROJECTS[0])
  const [showDown, setShowDown] = useState(false)
  const [showUp,   setShowUp]   = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0

    const el = scrollRef.current
    if (!el) return
    el.scrollTop = 0
    const check = () => {
      setShowDown(el.scrollTop + el.clientHeight < el.scrollHeight - 4)
      setShowUp(el.scrollTop > 200)
    }
    check()
    el.addEventListener("scroll", check, { passive: true })
    return () => el.removeEventListener("scroll", check)
  }, [])

  const scrollDown = () => scrollRef.current?.scrollBy({ top: 400, behavior: "smooth" })
  const scrollUp   = () => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })

  return (
    <div className="flex min-h-svh pt-[60px]">

      {/* ── Left — sticky mockup panel ── */}
      <div className="sticky top-[60px] self-start h-[calc(100svh-60px)] w-[42%] shrink-0 border-r border-border overflow-hidden max-[900px]:hidden">
        <div className="relative w-full h-full bg-surface-2">
          <div className="absolute inset-0 pointer-events-none z-10 bg-[repeating-linear-gradient(45deg,rgba(212,255,58,0.007)_0_12px,transparent_12px_24px)]" />

          {PROJECTS.map((p) => (
            <div
              key={p.slug}
              className={`absolute inset-0 flex items-center justify-center px-10 pt-8 pb-28 transition-opacity duration-500 ${active.slug === p.slug ? "opacity-100" : "opacity-0"}`}
            >
              {p.kind === "mobile" ? (
                <MobileMockup mobile={p.cover} priority={p.slug === PROJECTS[0].slug} />
              ) : (
                <WebMockup
                  desktop={p.cover}
                  mobile={p.mobileCover}
                  domain={p.domain}
                  priority={p.slug === PROJECTS[0].slug}
                />
              )}
            </div>
          ))}

          <div className="absolute bottom-0 left-0 right-0 z-20 px-8 pb-8 pt-16 bg-linear-to-t from-surface-2 via-surface-2/80 to-transparent">
            <span className="text-caption font-mono text-text-subtle tracking-[0.14em] uppercase block mb-2">{active.n}</span>
            <p className="font-display text-[clamp(16px,2vw,26px)] font-semibold tracking-[-0.02em] leading-[1.1] text-text">{workBySlug[active.slug]?.tag ?? active.tag}</p>
            <p className="text-caption font-mono text-text-muted mt-1.5 tracking-[0.06em] uppercase">{active.client}</p>
            {active.href && (
              <a
                href={active.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                aria-label={`${active.client} live site (opens in new tab)`}
                className="text-caption inline-flex items-center gap-1 font-mono text-primary no-underline tracking-[0.1em] uppercase mt-3 transition-opacity hover:opacity-75 keyboard-focus-ring"
              >
                {active.domain} ↗<span className="sr-only"> (opens in new tab)</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Right — fixed height, inner scroll ── */}
      <div className="flex-1 min-w-0 flex flex-col h-[calc(100svh-60px)] relative">

        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto scrollbar-none flex flex-col" data-lenis-prevent>

          {/* Header */}
          <div className="theme-bg px-gutter pt-10 pb-10 border-b border-border shrink-0 sticky top-0 z-10">
            <TransitionLink
              href={`/${locale}`}
              className="text-body inline-flex items-center gap-2 font-mono text-text tracking-[0.08em] uppercase no-underline mb-10 py-2 px-3 -ml-3 border border-border bg-surface transition-colors hover:border-primary hover:text-primary keyboard-focus-ring"
            >
              {t("work_ui.back_home")}
            </TransitionLink>
            <div className="flex items-end justify-between gap-6 max-[600px]:flex-col max-[600px]:items-start">
              <ParticleHeading as="h1" className="font-display text-[clamp(40px,5.5vw,80px)] font-semibold tracking-[-0.04em] leading-[0.92] text-text">
                {t("work_ui.h1a")}<br />
                <span className="text-primary">{t("work_ui.h1b")}</span>
              </ParticleHeading>
              <div className="text-right max-[600px]:text-left shrink-0 pb-1">
                <span className="text-caption font-mono text-text-subtle tracking-[0.1em] uppercase block">{PROJECTS.length} {t("work_ui.count_suffix")}</span>
                <span className="text-caption font-mono text-text-subtle tracking-[0.1em] uppercase block mt-1">{t("work_ui.years")}</span>
              </div>
            </div>
          </div>

          {/* Project rows */}
          <div className="flex-1">
            {PROJECTS.map((p) => (
              <TransitionLink
                key={p.slug}
                href={`/${locale}/work/${p.slug}`}
                aria-label={`View case study: ${workBySlug[p.slug]?.tag ?? p.tag} — ${p.client}`}
                className="group flex items-center gap-4 px-gutter py-8 border-b border-border no-underline relative overflow-hidden transition-[padding-left,background] duration-300 hover:bg-surface keyboard-focus-ring"
                onMouseEnter={() => setActive(p)}
                onClick={() => trackProjectClick(p.client, `/${locale}/work/${p.slug}`)}
              >
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500" />

                <span className="text-caption font-mono text-text-subtle tracking-[0.1em] w-9 shrink-0 max-[480px]:hidden">{p.n}</span>

                <div className="relative w-16 h-11 shrink-0 overflow-hidden border border-border bg-surface-2 hidden max-[900px]:block">
                  <Image src={p.cover} alt="" fill className="object-cover object-top" sizes="64px" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-display text-[clamp(20px,2.8vw,38px)] font-semibold tracking-[-0.03em] leading-[1.05] text-text group-hover:text-primary transition-colors duration-200">
                    {workBySlug[p.slug]?.tag ?? p.tag}
                  </p>
                  <p className="text-caption font-mono text-text-subtle mt-1 truncate tracking-[0.03em]">{p.client}</p>
                </div>

                <div className="text-right shrink-0 max-[600px]:hidden">
                  <span className="text-caption font-mono text-text-subtle tracking-[0.06em] uppercase block">{workBySlug[p.slug]?.type ?? p.type}</span>
                  <span className="text-caption font-mono text-text-muted block mt-1">{p.year}</span>
                </div>

                <span className="text-body text-text-subtle ml-2 shrink-0 transition-[color,transform] duration-200 group-hover:text-primary group-hover:translate-x-0.5">
                  ↗
                </span>
              </TransitionLink>
            ))}
          </div>

          {/* Footer */}
          <div className="px-gutter py-12">
            <p className="text-caption font-mono text-text-subtle tracking-[0.08em]">
              {t("work_ui.footer_cta")}{" "}
              <TransitionLink href={`/${locale}#contact`} className="text-primary no-underline transition-opacity hover:opacity-75 keyboard-focus-ring">
                {t("work_ui.footer_link")}
              </TransitionLink>
            </p>
          </div>
        </div>

        {/* Scroll controls */}
        <div className="absolute bottom-8 right-8 flex flex-col gap-3 pointer-events-none z-20">
          <button
            onClick={scrollUp}
            aria-label="Scroll to top of list"
            className={`pointer-events-auto w-16 h-16 inline-flex items-center justify-center bg-primary text-black border-2 border-primary shadow-[0_4px_20px_rgba(212,255,58,0.35)] transition-[opacity,visibility,transform,background] duration-300 hover:bg-text hover:border-text hover:scale-105 cursor-pointer keyboard-focus-ring ${showUp ? "opacity-100 visible" : "opacity-0 invisible"}`}
          >
            <span aria-hidden="true" className="text-heading font-semibold">↑</span>
          </button>
          <button
            onClick={scrollDown}
            aria-label="Scroll to see more projects"
            className={`pointer-events-auto w-16 h-16 inline-flex items-center justify-center bg-primary text-black border-2 border-primary shadow-[0_4px_20px_rgba(212,255,58,0.35)] transition-[opacity,visibility,transform,background] duration-300 hover:bg-text hover:border-text hover:scale-105 cursor-pointer keyboard-focus-ring ${showDown ? "opacity-100 visible" : "opacity-0 invisible"}`}
          >
            <span aria-hidden="true" className="text-heading font-semibold">↓</span>
          </button>
        </div>
      </div>
    </div>
  )
}
