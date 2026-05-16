import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import readingTime from "reading-time"
import type { Locale } from "@/lib/seo"

export const BLOG_DIR = path.join(process.cwd(), "content", "blog")
const LOCALES: Locale[] = ["en", "fr", "es"]

export interface BlogFrontmatter {
  title:       string
  description: string
  date:        string   // ISO yyyy-mm-dd
  tags?:       string[]
  cover?:      string
  medium?:     string   // optional canonical-source URL on Medium
  draft?:      boolean
}

export interface BlogPost extends BlogFrontmatter {
  slug:        string
  locale:      Locale
  content:     string
  readingMin:  number
  availableLocales: Locale[]
}

// ─── Filesystem helpers ────────────────────────────────────────────────

function listSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return []
  return fs
    .readdirSync(BLOG_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
}

function localesAvailable(slug: string): Locale[] {
  const dir = path.join(BLOG_DIR, slug)
  if (!fs.existsSync(dir)) return []
  return LOCALES.filter((l) => fs.existsSync(path.join(dir, `${l}.mdx`)))
}

function resolveFile(slug: string, locale: Locale): { file: string; locale: Locale } | null {
  const available = localesAvailable(slug)
  if (available.length === 0) return null
  const useLocale = available.includes(locale) ? locale : (available.includes("en") ? "en" : available[0])
  return { file: path.join(BLOG_DIR, slug, `${useLocale}.mdx`), locale: useLocale }
}

// ─── Public API ────────────────────────────────────────────────────────

export function getAllSlugs(): string[] {
  return listSlugs().filter((slug) => localesAvailable(slug).length > 0)
}

export function getPost(slug: string, locale: Locale): BlogPost | null {
  const resolved = resolveFile(slug, locale)
  if (!resolved) return null
  const raw = fs.readFileSync(resolved.file, "utf-8")
  const { data, content } = matter(raw)
  const fm = data as BlogFrontmatter
  if (fm.draft && process.env.NODE_ENV === "production") return null
  return {
    ...fm,
    slug,
    locale: resolved.locale,
    content,
    readingMin: Math.max(1, Math.round(readingTime(content).minutes)),
    availableLocales: localesAvailable(slug),
  }
}

export function getAllPosts(locale: Locale): BlogPost[] {
  return getAllSlugs()
    .map((slug) => getPost(slug, locale))
    .filter((p): p is BlogPost => p !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}
