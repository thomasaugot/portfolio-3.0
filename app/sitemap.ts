import type { MetadataRoute } from "next"
import { SITE_URL, LOCALES } from "@/lib/seo"

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

  return entries
}
