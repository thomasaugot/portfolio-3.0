"use client"
import Image from "next/image"
import { useLocale } from "next-intl"
import { useRef, useState, useEffect } from "react"
import { TransitionLink } from "@/components/ui/TransitionLink"
import { ParticleHeading } from "@/components/ui/ParticleHeading"
import { Shell } from "@/components/layout/Shell"
import { Button } from "@/components/ui/Button"

interface Post { slug: string; title: string; cover: string | null; readingMin: number }

const COPY: Record<string, { label: string; heading: string; cta: string; readMin: (n: number) => string }> = {
  en: {
    label:   "[ 08 / WRITING ]",
    heading: "I write about what I build.",
    cta:     "All articles →",
    readMin: (n) => `${n} min`,
  },
  fr: {
    label:   "[ 08 / ÉCRITS ]",
    heading: "J'écris sur ce que je construis.",
    cta:     "Tous les articles →",
    readMin: (n) => `${n} min`,
  },
  es: {
    label:   "[ 08 / ARTÍCULOS ]",
    heading: "Escribo sobre lo que construyo.",
    cta:     "Todos los artículos →",
    readMin: (n) => `${n} min`,
  },
}

const CARD_W = 224

export function HomeBlogBanner({ posts }: { posts: Post[] }) {
  const locale = useLocale()
  const t = COPY[locale] ?? COPY.en
  const scrollRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    function update() {
      if (!el) return
      setAtStart(el.scrollLeft <= 0)
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1)
    }
    update()
    el.addEventListener("scroll", update, { passive: true })
    return () => el.removeEventListener("scroll", update)
  }, [])

  function slide(dir: 1 | -1) {
    scrollRef.current?.scrollBy({ left: dir * (CARD_W + 12) * 2, behavior: "smooth" })
  }

  return (
    <section className="section-rule py-[clamp(60px,10vh,160px)]">
      <Shell className="flex flex-col gap-10 md:flex-row md:items-stretch md:gap-10">

        {/* Left — eyebrow above title, stacked */}
        <div className="shrink-0 w-full md:w-[38%] md:self-center">
          <span className="text-caption font-mono text-text-subtle block mb-10 md:mb-14">{t.label}</span>
          <ParticleHeading className="font-display font-semibold text-[clamp(28px,5vw,56px)] tracking-[-0.03em] leading-none mb-6 md:mb-8">{t.heading}</ParticleHeading>
          <TransitionLink
            href={`/${locale}/blog`}
            className="btn inline-flex items-center gap-2.5 font-mono text-[16px] tracking-[0.02em] px-5.5 py-3.5 border border-border-2 bg-transparent text-text cursor-pointer relative overflow-hidden no-underline whitespace-nowrap select-none transition-[border-color,color,background,transform] duration-normal ease-out hover:border-text active:translate-y-px"
          >
            {t.cta}
          </TransitionLink>
        </div>

        {/* Right — prev button + carousel + next button */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {!atStart && (
            <Button type="button" onClick={() => slide(-1)} className="shrink-0 self-center hidden md:inline-flex" aria-label="Previous">←</Button>
          )}
          <div
            ref={scrollRef}
            className={[
              "flex items-stretch gap-3 overflow-x-auto scrollbar-none flex-1 min-w-0 pb-3",
              atStart && atEnd ? "" :
              atStart ? "mask-[linear-gradient(to_right,black_85%,transparent_100%)]" :
              atEnd   ? "mask-[linear-gradient(to_right,transparent_0%,black_15%,black_100%)]" :
                        "mask-[linear-gradient(to_right,transparent_0%,black_15%,black_85%,transparent_100%)]",
            ].join(" ")}
          >
            {posts.map((p) => (
              <TransitionLink
                key={p.slug}
                href={`/${locale}/blog/${p.slug}`}
                className="card-hover group shrink-0 w-[72vw] max-w-65 sm:w-56 flex flex-col border border-border bg-surface shadow-md"
              >
                <div className="relative w-full aspect-4/3 bg-surface-2 overflow-hidden shrink-0">
                  {p.cover ? (
                    <Image src={p.cover} alt="" fill sizes="(max-width: 640px) 72vw, 224px" className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-caption font-mono text-text-subtle tracking-widest uppercase">no cover</div>
                  )}
                </div>
                <div className="p-3 flex-1">
                  <p className="text-body font-display font-semibold leading-[1.35] text-text line-clamp-2 mb-1.5">{p.title}</p>
                  <span className="text-caption font-mono text-text-subtle">{t.readMin(p.readingMin)}</span>
                </div>
              </TransitionLink>
            ))}
          </div>
          {!atEnd && (
            <Button type="button" onClick={() => slide(1)} className="shrink-0 self-center hidden md:inline-flex" aria-label="Next">→</Button>
          )}
        </div>

      </Shell>
    </section>
  )
}
