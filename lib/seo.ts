import type { Metadata } from "next"
import { appConfig } from "@/config/app.config"

export const SITE_URL  = appConfig.siteUrl
export const SITE_NAME = "Thomas Augot"

export type Locale = "en" | "fr" | "es"
export const LOCALES: Locale[] = ["en", "fr", "es"]

// ─── Per-locale SEO copy ────────────────────────────────────────────────
// Each locale targets its primary geographic market. Equal weight all three.

export const HOME_SEO: Record<Locale, { title: string; description: string; ogTitle: string }> = {
  en: {
    title: "Thomas Augot — Full-stack developer (React, Next.js, Node) for hire",
    description:
      "Full-stack developer for hire. I ship production-ready web and mobile apps with React, Next.js, and Node. Based in Las Palmas de Gran Canaria — working with clients across the Canary Islands, Spain, and France.",
    ogTitle: "Thomas Augot — Full-stack developer for hire",
  },
  fr: {
    title: "Thomas Augot — Développeur full-stack freelance (React, Next.js, Node)",
    description:
      "Développeur full-stack freelance. Je conçois et livre des applications web et mobiles avec React, Next.js et Node. Basé aux Canaries, je travaille avec des clients à Nantes, en Pays de la Loire et partout en France.",
    ogTitle: "Thomas Augot — Développeur full-stack freelance",
  },
  es: {
    title: "Thomas Augot — Desarrollador full-stack freelance (React, Next.js, Node)",
    description:
      "Desarrollador full-stack freelance. Construyo aplicaciones web y móviles con React, Next.js y Node. Con base en Las Palmas de Gran Canaria, trabajo con clientes en Canarias y toda España.",
    ogTitle: "Thomas Augot — Desarrollador full-stack freelance",
  },
}

export const WORK_SEO: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "Work — Selected projects",
    description: "Selected full-stack projects — production web apps, mobile apps, dashboards, and corporate sites shipped end-to-end.",
  },
  fr: {
    title: "Projets — Sélection",
    description: "Sélection de projets full-stack — applications web et mobiles en production, dashboards et sites corporate livrés de bout en bout.",
  },
  es: {
    title: "Proyectos — Selección",
    description: "Selección de proyectos full-stack — aplicaciones web y móviles en producción, dashboards y sitios corporativos entregados de extremo a extremo.",
  },
}

// ─── Builders ────────────────────────────────────────────────────────────

const OG_LOCALE: Record<Locale, string> = { en: "en_US", fr: "fr_FR", es: "es_ES" }

export function languageAlternates(path: string = "") {
  // Path should start with "/" or be empty (home).
  const norm = path === "" || path === "/" ? "" : path
  const languages: Record<string, string> = {}
  LOCALES.forEach((l) => {
    languages[l] = `${SITE_URL}/${l}${norm}`
  })
  return {
    canonical: `${SITE_URL}/${"en"}${norm}`,
    languages: { ...languages, "x-default": `${SITE_URL}/en${norm}` },
  }
}

interface BuildOptions {
  locale: Locale
  title: string
  description: string
  path?: string             // route after locale, e.g. "/work" or "/work/foo"
  ogTitle?: string
  ogImage?: string
}

export function buildMetadata({ locale, title, description, path = "", ogTitle, ogImage = "/og-image.jpg" }: BuildOptions): Metadata {
  const url = `${SITE_URL}/${locale}${path === "" || path === "/" ? "" : path}`
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        LOCALES.map((l) => [l, `${SITE_URL}/${l}${path === "" || path === "/" ? "" : path}`])
          .concat([["x-default", `${SITE_URL}/en${path === "" || path === "/" ? "" : path}`]])
      ),
    },
    openGraph: {
      type: "website",
      locale: OG_LOCALE[locale],
      url,
      title: ogTitle ?? title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: ogTitle ?? title }],
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle ?? title,
      description,
      images: [ogImage],
    },
  }
}
