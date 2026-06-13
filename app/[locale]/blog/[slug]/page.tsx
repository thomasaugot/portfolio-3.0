import { notFound } from "next/navigation"
import { TransitionLink } from "@/components/ui/TransitionLink"
import { Mdx } from "@/components/blog/Mdx"
import { ParticleHeading } from "@/components/ui/ParticleHeading"
import { PageReadyMarker } from "@/components/blog/PageReadyMarker"
import { TechTag } from "@/components/ui/TechTag"
import { getAllSlugs, getPost } from "@/lib/blog"
import { buildMetadata, SITE_URL, SITE_NAME, type Locale } from "@/lib/seo"
import { appConfig } from "@/config/app.config"
import type { Metadata } from "next"

interface Props { params: Promise<{ locale: string; slug: string }> }

export function generateStaticParams() {
  const slugs = getAllSlugs()
  const locales: Locale[] = ["en", "fr", "es"]
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const safe: Locale = (["en", "fr", "es"] as const).includes(locale as Locale) ? (locale as Locale) : "en"
  const post = getPost(slug, safe)
  if (!post) return {}

  const md = buildMetadata({
    locale: safe,
    title: post.title,
    description: post.description,
    path: `/blog/${slug}`,
  })

  // If the article was originally published on Medium, point canonical there.
  if (post.medium) {
    md.alternates = { ...md.alternates, canonical: post.medium }
  }

  return md
}

const LABELS: Record<Locale, { back: string; readMin: (n: number) => string; published: string; alsoOn: string }> = {
  en: { back: "← All posts", readMin: (n) => `${n} min read`, published: "Published", alsoOn: "Also published on" },
  fr: { back: "← Tous les articles", readMin: (n) => `${n} min de lecture`, published: "Publié le", alsoOn: "Aussi publié sur" },
  es: { back: "← Todos los artículos", readMin: (n) => `${n} min de lectura`, published: "Publicado el", alsoOn: "También publicado en" },
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params
  const safe: Locale = (["en", "fr", "es"] as const).includes(locale as Locale) ? (locale as Locale) : "en"
  const post = getPost(slug, safe)
  if (!post) notFound()
  const t = LABELS[safe]

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.description,
    "datePublished": post.date,
    "dateModified": post.date,
    "author": { "@type": "Person", "@id": `${SITE_URL}/#person`, "name": SITE_NAME },
    "publisher": { "@type": "Person", "@id": `${SITE_URL}/#person`, "name": SITE_NAME },
    "mainEntityOfPage": { "@type": "WebPage", "@id": `${SITE_URL}/${locale}/blog/${slug}` },
    "inLanguage": safe,
    "keywords": post.tags?.join(", "),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="pt-[160px] pb-[clamp(80px,12vh,160px)] px-(--gutter)">
      <article className="max-w-[1080px] mx-auto">
        <PageReadyMarker />
        <TransitionLink
          href={`/${locale}/blog`}
          className="inline-flex items-center font-mono text-[14px] text-text tracking-[0.08em] uppercase no-underline mb-10 py-2 px-3 -ml-3 border border-border bg-surface hover:border-primary hover:text-primary transition-colors keyboard-focus-ring"
        >
          {t.back}
        </TransitionLink>

        <header className="mb-12">
          <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] text-text-subtle tracking-[0.1em] uppercase mb-5">
            <time dateTime={post.date}>{(() => { const d = new Date(post.date); return isNaN(d.getTime()) ? post.date : d.toISOString().slice(0, 10) })()}</time>
            <span>·</span>
            <span>{t.readMin(post.readingMin)}</span>
            {post.tags && post.tags.length > 0 && (
              <>
                <span>·</span>
                <span className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <TechTag key={tag} tag={tag} />
                  ))}
                </span>
              </>
            )}
          </div>
          <ParticleHeading as="h1" className="font-display text-[clamp(32px,5vw,68px)] font-semibold tracking-[-0.045em] leading-[0.95] text-text mb-6">
            {post.title}
          </ParticleHeading>
          <p className="text-[18px] text-text-muted leading-[1.55]">
            {post.description}
          </p>
        </header>

        <div className="hr mb-10" />

        <div>
          <Mdx source={post.content} />
        </div>

        {post.medium && (
          <div className="hr mt-16 mb-6" />
        )}
        {post.medium && (
          <p className="font-mono text-[12px] text-text-subtle">
            {t.alsoOn}{" "}
            <a href={post.medium} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">
              Medium
            </a>
          </p>
        )}

        <p className="font-mono text-[12px] text-text-subtle mt-4">
          Thomas Augot · <a href={appConfig.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-primary">LinkedIn</a> · <a href={appConfig.github} target="_blank" rel="noopener noreferrer" className="hover:text-primary">GitHub</a>
        </p>
      </article>
      </section>
    </>
  )
}
