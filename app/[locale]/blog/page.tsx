import Image from "next/image"
import { TransitionLink } from "@/components/ui/TransitionLink"
import { ParticleHeading } from "@/components/ui/ParticleHeading"
import { PageReadyMarker } from "@/components/blog/PageReadyMarker"
import { Shell } from "@/components/layout/Shell"
import { appConfig } from "@/config/app.config"
import { getFeed } from "@/lib/blog"
import { buildMetadata, BLOG_SEO, type Locale } from "@/lib/seo"
import type { Metadata } from "next"

// Regenerate the index hourly so newly published Medium posts appear
// automatically without a rebuild.
export const revalidate = 3600

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "fr" }, { locale: "es" }]
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const safe: Locale = (["en", "fr", "es"] as const).includes(locale as Locale) ? (locale as Locale) : "en"
  const { title, description } = BLOG_SEO[safe]
  return buildMetadata({ locale: safe, title, description, path: "/blog" })
}

const LABELS: Record<Locale, { eyebrow: string; title: string; intro: string; readMin: (n: number) => string; empty: string; moreOnMedium: string }> = {
  en: {
    eyebrow: "[ BLOG ]",
    title:   "Dev notebook.",
    intro:   "Long-form on Next.js, React, full-stack patterns, and what I've learned shipping real code.",
    readMin: (n) => `${n} min read`,
    empty:   "No posts yet — check back soon.",
    moreOnMedium: "Read more articles on Medium →",
  },
  fr: {
    eyebrow: "[ BLOG ]",
    title:   "Notes de terrain.",
    intro:   "Articles sur Next.js, React, patterns full-stack, et ce que j'apprends en livrant du vrai code.",
    readMin: (n) => `${n} min de lecture`,
    empty:   "Pas encore d'articles — bientôt.",
    moreOnMedium: "Lire plus d'articles sur Medium →",
  },
  es: {
    eyebrow: "[ BLOG ]",
    title:   "Cuaderno de desarrollo.",
    intro:   "Artículos sobre Next.js, React, patrones full-stack y lo que aprendo poniendo código real en producción.",
    readMin: (n) => `${n} min de lectura`,
    empty:   "Sin artículos todavía — vuelve pronto.",
    moreOnMedium: "Leer más artículos en Medium →",
  },
}

export default async function BlogIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const safe: Locale = (["en", "fr", "es"] as const).includes(locale as Locale) ? (locale as Locale) : "en"
  const posts = await getFeed(safe)
  const t = LABELS[safe]

  return (
    <section className="pt-[160px] pb-[clamp(80px,12vh,160px)]">
    <Shell>
      <PageReadyMarker />
      <span className="font-mono text-[12px] text-text-subtle mb-14 block">{t.eyebrow}</span>
      <ParticleHeading as="h1" className="font-display font-semibold tracking-tight text-[clamp(2.5rem,5.4vw,5.5rem)] leading-[0.95] mt-3 mb-4">
        {t.title}
      </ParticleHeading>
      <p className="text-[16px] text-text-muted max-w-[60ch] leading-[1.6] mb-16">{t.intro}</p>

      {posts.length === 0 ? (
        <p className="font-mono text-text-subtle">{t.empty}</p>
      ) : (
        <ul className="border-t border-border">
          {posts.map((p) => {
            const inner = (
              <>
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500" />
                <div className="relative w-[160px] h-[100px] max-[640px]:w-full max-[640px]:h-[200px] shrink-0 border border-border bg-surface-2 overflow-hidden">
                  {p.cover ? (
                    <Image
                      src={p.cover}
                      alt=""
                      fill
                      sizes="160px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center font-mono text-[10px] text-text-subtle tracking-widest uppercase">
                      No cover
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3 font-mono text-[11px] text-text-subtle tracking-[0.1em] uppercase mb-3">
                    {p.date && (
                      <>
                        <time dateTime={p.date}>{p.date}</time>
                        <span aria-hidden="true">·</span>
                      </>
                    )}
                    <span>{t.readMin(p.readingMin)}</span>
                    {p.external && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-primary">Medium ↗</span>
                      </>
                    )}
                  </div>
                  <p className="font-display text-[clamp(20px,2.4vw,30px)] font-semibold tracking-[-0.02em] leading-[1.15] text-text mb-2 max-w-[60ch]">
                    {p.title}
                  </p>
                  <p className="text-[15px] text-text-muted leading-[1.55] max-w-[68ch]">{p.description}</p>
                </div>
              </>
            )
            const className = "grid grid-cols-[160px_1fr] max-[640px]:grid-cols-1 gap-6 items-start py-7 pl-6 pr-2 transition-[padding-left,background] duration-300 hover:bg-surface relative overflow-hidden no-underline"
            return (
              <li key={p.key} className="group border-b border-border">
                {p.external ? (
                  <a href={p.href} target="_blank" rel="noopener noreferrer" className={className}>
                    {inner}
                  </a>
                ) : (
                  <TransitionLink href={p.href} className={className}>
                    {inner}
                  </TransitionLink>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <a
        href={appConfig.medium}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center mt-12 font-mono text-[13px] text-text tracking-[0.08em] uppercase no-underline py-3 px-4 border border-border bg-surface hover:border-primary hover:text-primary transition-colors keyboard-focus-ring"
      >
        {t.moreOnMedium}
      </a>
    </Shell>
    </section>
  )
}
