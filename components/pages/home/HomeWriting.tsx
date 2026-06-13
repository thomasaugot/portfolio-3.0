"use client"
import { TransitionLink } from "@/components/ui/TransitionLink"
import { ParticleHeading } from "@/components/ui/ParticleHeading"
import type { Locale } from "@/lib/seo"
import { Shell } from "@/components/layout/Shell"

interface Post { slug: string; title: string; date: string; readingMin: number }

interface Props { locale: Locale; posts: Post[] }

const LABELS: Record<Locale, { meta: string; title: string; readMin: (n: number) => string; cta: string }> = {
  en: {
    meta:    "[ WRITING ]",
    title:   "I write too.",
    readMin: (n) => `${n} min read`,
    cta:     "All articles →",
  },
  fr: {
    meta:    "[ ÉCRITS ]",
    title:   "J'écris aussi.",
    readMin: (n) => `${n} min`,
    cta:     "Tous les articles →",
  },
  es: {
    meta:    "[ ARTÍCULOS ]",
    title:   "También escribo.",
    readMin: (n) => `${n} min`,
    cta:     "Todos los artículos →",
  },
}

export function HomeWriting({ locale, posts }: Props) {
  const t = LABELS[locale]

  return (
    <section className="py-[clamp(80px,12vh,160px)] border-t border-border">
      <Shell>
        <div data-anim="section-head" className="grid grid-cols-[1fr_2fr] gap-gutter mb-14 items-end max-[720px]:grid-cols-1 max-[720px]:gap-4">
          <span className="text-caption font-mono text-text-subtle">{t.meta}</span>
          <ParticleHeading className="font-display font-semibold tracking-tight text-[clamp(2.5rem,5.4vw,5.5rem)] leading-[0.95]">
            {t.title}
          </ParticleHeading>
        </div>

        <ul className="border-t border-border">
          {posts.map((p) => (
            <li key={p.slug} className="group border-b border-border">
              <TransitionLink
                href={`/${locale}/blog/${p.slug}`}
                className="flex items-baseline justify-between gap-6 py-5 px-4 relative overflow-hidden transition-[padding-left,background] duration-300 hover:bg-surface hover:pl-7"
              >
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500" />
                <p className="font-display text-[clamp(17px,2vw,22px)] font-semibold tracking-[-0.02em] leading-[1.2] text-text">
                  {p.title}
                </p>
                <span className="text-caption font-mono text-text-subtle whitespace-nowrap shrink-0">
                  {t.readMin(p.readingMin)}
                </span>
              </TransitionLink>
            </li>
          ))}
        </ul>

        <TransitionLink
          href={`/${locale}/blog`}
          className="text-caption inline-flex items-center mt-8 font-mono text-text tracking-[0.08em] uppercase no-underline py-3 px-4 border border-border bg-surface hover:border-primary hover:text-primary transition-colors"
        >
          {t.cta}
        </TransitionLink>
      </Shell>
    </section>
  )
}
