import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import readingTime from "reading-time"
import type { Locale } from "@/lib/seo"

export const BLOG_DIR = path.join(/*turbopackIgnore: true*/ process.cwd(), "content", "blog")
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

// ─── Medium feed ─────────────────────────────────────────────────────────
// The blog is file-based, but newly published Medium articles that haven't
// been hand-written into content/blog/ yet are pulled from the RSS feed so
// the index always reflects the latest posts.

const MEDIUM_FEED = "https://medium.com/feed/@thomasaugot"

export interface MediumPost {
  title:       string
  description: string
  date:        string   // ISO yyyy-mm-dd
  url:         string
  cover?:      string
  readingMin:  number
}

function normalizeTitle(t: string): string {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ")
}

function firstMatch(block: string, re: RegExp): string | undefined {
  const m = block.match(re)
  return m ? m[1].trim() : undefined
}

/**
 * Fetch the latest Medium posts from the RSS feed. Returns [] on any failure
 * so the blog never breaks if Medium is unreachable. Cached/revalidated by the
 * route segment that calls it (see app/[locale]/blog/page.tsx).
 */
export async function getMediumPosts(): Promise<MediumPost[]> {
  let xml: string
  try {
    const res = await fetch(MEDIUM_FEED, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    xml = await res.text()
  } catch {
    return []
  }

  const items = xml.split("<item>").slice(1)
  const posts: MediumPost[] = []

  for (const item of items) {
    const titleRaw = firstMatch(item, /<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)
    const link = firstMatch(item, /<link>([\s\S]*?)<\/link>/)
    const pubDate = firstMatch(item, /<pubDate>([\s\S]*?)<\/pubDate>/)
    const encoded = firstMatch(item, /<content:encoded>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content:encoded>/) ?? ""
    if (!titleRaw || !link || !pubDate) continue

    const title = decodeEntities(titleRaw)
    const url = link.split("?")[0]

    const d = new Date(pubDate)
    const date = isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10)

    const cover = firstMatch(encoded, /<img[^>]+src="([^"]+)"/)

    // Build a short description from the first paragraph of the body.
    const firstPara = firstMatch(encoded, /<p>([\s\S]*?)<\/p>/) ?? ""
    const plain = decodeEntities(firstPara.replace(/<[^>]+>/g, "")).trim()
    const description = plain.length > 200 ? `${plain.slice(0, 197).trimEnd()}…` : plain

    const words = encoded.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length
    const readingMin = Math.max(1, Math.round(words / 200))

    posts.push({ title, description, date, url, cover, readingMin })
  }

  return posts
}

export interface FeedEntry {
  key:         string
  title:       string
  description: string
  date:        string
  readingMin:  number
  cover?:      string
  href:        string    // internal route for local posts, Medium URL otherwise
  external:    boolean
}

/**
 * Merged blog index: local .mdx posts plus any Medium posts not already
 * written locally (matched by normalized title). Sorted newest-first.
 */
export async function getFeed(locale: Locale): Promise<FeedEntry[]> {
  const local = getAllPosts(locale)
  const localTitles = new Set(local.map((p) => normalizeTitle(p.title)))

  const localEntries: FeedEntry[] = local.map((p) => ({
    key:         p.slug,
    title:       p.title,
    description: p.description,
    date:        p.date,
    readingMin:  p.readingMin,
    cover:       p.cover,
    href:        `/${locale}/blog/${p.slug}`,
    external:    false,
  }))

  const medium = await getMediumPosts()
  const mediumEntries: FeedEntry[] = medium
    .filter((m) => !localTitles.has(normalizeTitle(m.title)))
    .map((m) => ({
      key:         m.url,
      title:       m.title,
      description: m.description,
      date:        m.date,
      readingMin:  m.readingMin,
      cover:       m.cover,
      href:        m.url,
      external:    true,
    }))

  return [...localEntries, ...mediumEntries].sort((a, b) => (a.date < b.date ? 1 : -1))
}
