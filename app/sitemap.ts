import type { MetadataRoute } from "next"
import { SITE_URL, LOCALES } from "@/lib/seo"
import { getAllSlugs as getAllBlogSlugs, getPost as getBlogPost } from "@/lib/blog"

// Keep in sync with app/[locale]/work/[slug]/page.tsx SLUGS
const WORK_SLUGS = [
  "materia-prima",
  "binter-montajes-app",
  "dosxdosgrupoimagen-web",
  "dosxdos-montadores-app",
  "energia-solar-canarias",
  "galaga-agency-website",
  "reloj-laboral-galaga",
  "areco-web",
  "charpente-menuiserie-durand",
  "adelante-business-consulting",
  "phoenix-on-the-beach",
]

function alternates(path: string) {
  const norm = path === "" || path === "/" ? "" : path
  return Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}${norm}`]))
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = []

  // Home — one entry per locale, each with hreflang alternates
  for (const locale of LOCALES) {
    entries.push({
      url: `${SITE_URL}/${locale}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
      alternates: { languages: alternates("") },
    })
  }

  // Work index
  for (const locale of LOCALES) {
    entries.push({
      url: `${SITE_URL}/${locale}/work`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: { languages: alternates("/work") },
    })
  }

  // Case studies
  for (const locale of LOCALES) {
    for (const slug of WORK_SLUGS) {
      entries.push({
        url: `${SITE_URL}/${locale}/work/${slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: { languages: alternates(`/work/${slug}`) },
      })
    }
  }

  // Blog index
  for (const locale of LOCALES) {
    entries.push({
      url: `${SITE_URL}/${locale}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: { languages: alternates("/blog") },
    })
  }

  // Blog posts — only emit per-locale entries where a translation actually exists.
  // Posts with `medium` canonical pointing off-site are skipped (don't want Google indexing them as duplicates).
  for (const slug of getAllBlogSlugs()) {
    for (const locale of LOCALES) {
      const post = getBlogPost(slug, locale)
      if (!post) continue
      if (post.locale !== locale) continue              // skip locale fallbacks (don't duplicate)
      if (post.medium) continue                          // canonical points to Medium — don't index our copy
      entries.push({
        url: `${SITE_URL}/${locale}/blog/${slug}`,
        lastModified: new Date(post.date),
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: { languages: alternates(`/blog/${slug}`) },
      })
    }
  }

  return entries
}
