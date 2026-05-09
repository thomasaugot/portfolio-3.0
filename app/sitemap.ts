import type { MetadataRoute } from "next"
import { appConfig } from "@/config/app.config"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = appConfig.siteUrl
  const locales = ["en", "fr", "es"]

  return locales.map((locale) => ({
    url: `${base}/${locale}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: locale === "en" ? 1 : 0.8,
  }))
}
