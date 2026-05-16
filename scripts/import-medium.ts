/**
 * One-shot importer: fetch Medium articles via RSS, convert HTML → MDX,
 * and write each one to content/blog/<slug>/en.mdx with `medium:` canonical
 * pointing back to Medium.
 *
 * Usage:
 *   npx tsx scripts/import-medium.ts                          # use feed for @thomasaugot
 *   npx tsx scripts/import-medium.ts --user other-handle      # different handle
 *   npx tsx scripts/import-medium.ts --url <article-url>      # single article by URL
 *   npx tsx scripts/import-medium.ts --overwrite              # re-import even if file exists
 *
 * Medium RSS only includes the ~10 most recent posts. For older articles, pass
 * --url <medium-url> per article (you can run --url multiple times).
 */

import fs from "node:fs"
import path from "node:path"
import { XMLParser } from "fast-xml-parser"
import TurndownService from "turndown"
import * as prettier from "prettier"

const BLOG_DIR = path.join(process.cwd(), "content", "blog")

interface RssItem {
  title:       string
  link:        string
  pubDate:     string
  description: string
  contentEncoded: string
  categories:  string[]
}

const args = process.argv.slice(2)
const flag = (name: string) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? (args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true) : null
}

const userHandle = (flag("user") as string) || "thomasaugot"
const singleUrl  = flag("url") as string | null
const overwrite  = Boolean(flag("overwrite"))

// ─── Helpers ────────────────────────────────────────────────────────────

function slugFromMediumUrl(url: string): string {
  // Medium URL: https://medium.com/@user/some-title-abc123def?source=...
  // Slug we want: "some-title" (drop the trailing -<id> hash)
  const clean = url.split("?")[0]
  const last  = clean.split("/").filter(Boolean).pop() ?? ""
  // Strip trailing 8-12 char hex id segment (Medium's article hash)
  return last.replace(/-[a-f0-9]{8,12}$/, "")
}

function stripCanonicalQuery(url: string): string {
  return url.split("?")[0]
}

const td = new TurndownService({
  headingStyle:    "atx",
  codeBlockStyle:  "fenced",
  bulletListMarker: "-",
  emDelimiter:     "_",
})

// Medium wraps code in <pre> directly (no nested <code>), so turndown's
// default codeBlockStyle: "fenced" doesn't kick in. Force it.
td.addRule("preCodeBlock", {
  filter: (node) => node.nodeName === "PRE",
  replacement: (_content, node) => {
    // Use innerHTML, replace <br> with newlines, then strip remaining tags.
    const html = (node as HTMLElement).innerHTML ?? ""
    const text = html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<[^>]+>/g, "")           // strip remaining tags
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
    return `\n\n\`\`\`\n${text}\n\`\`\`\n\n`
  },
})

// Drop Medium's auto-injected images that just say "Press enter or click to view image in full size"
td.addRule("dropMediumCaption", {
  filter: (node) =>
    node.nodeName === "FIGCAPTION" &&
    /press enter or click/i.test(node.textContent ?? ""),
  replacement: () => "",
})

function detectLang(code: string): { parser: prettier.BuiltInParserName | null; lang: string } {
  const t = code.trim()
  if (/^\s*\{?\s*"[^"]+"\s*:/.test(t) && (t.startsWith("{") || t.startsWith("["))) return { parser: "json", lang: "json" }
  if (/<[A-Z][A-Za-z0-9]*[\s/>]/.test(t) || /<\/[A-Z][A-Za-z0-9]*>/.test(t)) return { parser: "babel-ts", lang: "tsx" }
  if (/^(import|export|const|let|var|function|interface|type|enum)\s/m.test(t)) return { parser: "babel-ts", lang: "ts" }
  if (/^[\s\S]*\{[\s\S]*:\s*[^;]+;[\s\S]*\}/.test(t) && /[.#][a-zA-Z]/.test(t)) return { parser: "css", lang: "css" }
  if (/^\s*<[a-z]/.test(t)) return { parser: "html", lang: "html" }
  return { parser: null, lang: "" }
}

async function formatCode(code: string): Promise<{ formatted: string; lang: string }> {
  const { parser, lang } = detectLang(code)
  if (!parser) return { formatted: code.trim(), lang }
  try {
    const formatted = await prettier.format(code, {
      parser,
      semi: true,
      singleQuote: false,
      printWidth: 90,
      tabWidth: 2,
    })
    return { formatted: formatted.trimEnd(), lang }
  } catch {
    return { formatted: code.trim(), lang }
  }
}

async function htmlToMdx(html: string): Promise<string> {
  // Medium's RSS splits multi-line code across many adjacent <pre> blocks.
  // Merge them before turndown sees them.
  const merged = mergeAdjacentPreBlocks(html)

  // Drop Medium's tracking pixels and post-content noise
  const cleaned = merged
    .replace(/<img[^>]*medium\.com\/_\/stat[^>]*>/gi, "")
    .replace(/<hr[^>]*>/gi, "\n\n---\n\n")
  const rawMd = td.turndown(cleaned).trim()

  // Reformat code blocks with Prettier so they're readable line-by-line.
  const formatted = await reformatFencedCodeBlocks(rawMd)

  // Strip trailing self-promo CTAs (helloimtom.dev links, "visit my portfolio", etc.)
  const trimmed = stripTrailingCta(formatted)

  // MDX parses `<tagname>` as a JSX component, breaking when prose mentions
  // HTML elements like "<main>" or "<section>". Escape them outside of fenced
  // code blocks and inline code spans.
  return escapeRawTagsInProse(trimmed)
}

function stripTrailingCta(md: string): string {
  // Drop trailing paragraphs (separated by blank lines) that contain self-promo
  // links to the portfolio site or common "share your feedback" wording.
  const PROMO = /(helloimtom\.dev|visit my portfolio|share with me your feedback|feel free to (?:leave a comment|share)|If this (?:saved you time|helped you))/i

  // Split into blocks (paragraphs separated by blank lines), pop trailing promo blocks.
  const blocks = md.split(/\n{2,}/)
  while (blocks.length > 0 && PROMO.test(blocks[blocks.length - 1])) {
    blocks.pop()
  }
  return blocks.join("\n\n").trim()
}

async function reformatFencedCodeBlocks(md: string): Promise<string> {
  // Match ``` ... ``` blocks (greedy line-based)
  const re = /```([a-z]*)\n([\s\S]*?)\n```/g
  const out: string[] = []
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(md))) {
    out.push(md.slice(last, m.index))
    const existingLang = m[1]
    const body = m[2]
    const { formatted, lang } = await formatCode(body)
    const finalLang = existingLang || lang
    out.push(`\`\`\`${finalLang}\n${formatted}\n\`\`\``)
    last = m.index + m[0].length
  }
  out.push(md.slice(last))
  return out.join("")
}

// Medium's RSS emits code as adjacent <pre>line</pre> blocks. We can't safely
// merge them — they're often separate, unrelated snippets that share a parent.
// Instead, ensure each <pre> ends up as its own fenced block by injecting a
// paragraph between consecutive ones so turndown treats them separately.
function mergeAdjacentPreBlocks(html: string): string {
  return html.replace(/<\/pre>\s*<pre/g, "</pre>\n\n<pre")
}

function escapeRawTagsInProse(md: string): string {
  const lines = md.split("\n")
  let inFence = false
  const tagRe = /<(\/?[a-zA-Z][a-zA-Z0-9-]*)((?:\s[^>]*)?)>/g

  return lines
    .map((line) => {
      if (/^\s*```/.test(line)) {
        inFence = !inFence
        return line
      }
      if (inFence) return line

      // Process the line outside backtick-delimited inline code spans.
      // Split on ` and only transform odd-indexed (outside-code) segments.
      const parts = line.split("`")
      for (let i = 0; i < parts.length; i += 2) {
        parts[i] = parts[i].replace(tagRe, (_match, tag, attrs) => `\`<${tag}${attrs}>\``)
      }
      return parts.join("`")
    })
    .join("\n")
}

function extractCover(html: string): string | null {
  // Grab the first <img src="..."> that points at Medium's CDN
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i)
  return m?.[1] ?? null
}

function deriveDescription(html: string): string {
  // First non-empty paragraph, stripped of tags
  const m = html.match(/<p[^>]*>(.*?)<\/p>/i)
  if (!m) return ""
  const text = m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()
  return text.length > 158 ? text.slice(0, 157).trimEnd() + "…" : text
}

function frontmatter(input: {
  title:       string
  description: string
  date:        string
  tags:        string[]
  medium:      string
  cover?:      string | null
}): string {
  const coverLine = input.cover ? `cover: ${JSON.stringify(input.cover)}\n` : ""
  return `---
title: ${JSON.stringify(input.title)}
description: ${JSON.stringify(input.description)}
date: "${input.date}"
tags: ${JSON.stringify(input.tags)}
${coverLine}medium: "${input.medium}"
---

`
}

async function fetchRss(handle: string): Promise<RssItem[]> {
  const url = `https://medium.com/feed/@${handle}`
  console.log(`→ Fetching RSS: ${url}`)
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; helloimtom-importer)" } })
  if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`)
  const xml = await res.text()

  const parser = new XMLParser({
    ignoreAttributes:  false,
    cdataPropName:     "__cdata",
    parseTagValue:     false,
    trimValues:        true,
  })
  const parsed = parser.parse(xml)

  type RssRaw = {
    title:           string | { __cdata: string }
    link:            string
    pubDate:         string
    description?:    string | { __cdata: string }
    "content:encoded"?: string | { __cdata: string }
    category?:       (string | { __cdata: string }) | (string | { __cdata: string })[]
  }
  const items: RssRaw[] = parsed?.rss?.channel?.item ?? []
  const unwrap = (v: unknown): string => {
    if (typeof v === "string") return v
    if (v && typeof v === "object" && "__cdata" in v) return (v as { __cdata: string }).__cdata
    return ""
  }
  return items.map((it) => ({
    title:          unwrap(it.title),
    link:           it.link,
    pubDate:        it.pubDate,
    description:    unwrap(it.description),
    contentEncoded: unwrap(it["content:encoded"]),
    categories:     Array.isArray(it.category)
      ? it.category.map(unwrap).filter(Boolean)
      : it.category ? [unwrap(it.category)] : [],
  }))
}

async function fetchSingleArticle(url: string): Promise<RssItem | null> {
  // Convert article URL → user feed and find the matching item
  const m = url.match(/medium\.com\/@([^/]+)\//)
  if (!m) {
    console.error(`Couldn't extract username from ${url}`)
    return null
  }
  const items = await fetchRss(m[1])
  const slug = slugFromMediumUrl(url)
  const found = items.find((it) => slugFromMediumUrl(it.link) === slug)
  if (!found) {
    console.error(`Article not in recent RSS feed: ${slug}`)
    console.error(`(RSS only exposes the most recent ~10 articles)`)
  }
  return found ?? null
}

async function writePost(item: RssItem) {
  const slug   = slugFromMediumUrl(item.link)
  const dir    = path.join(BLOG_DIR, slug)
  const file   = path.join(dir, "en.mdx")
  if (fs.existsSync(file) && !overwrite) {
    console.log(`  · skip (exists): ${slug}`)
    return
  }
  const html   = item.contentEncoded || item.description
  const body   = await htmlToMdx(html)
  const desc   = deriveDescription(html) || item.title
  const date   = new Date(item.pubDate).toISOString().slice(0, 10)
  const cover  = extractCover(html)

  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(
    file,
    frontmatter({
      title:       item.title,
      description: desc,
      date,
      tags:        item.categories.slice(0, 5),
      medium:      stripCanonicalQuery(item.link),
      cover,
    }) + body + "\n"
  )
  console.log(`  ✓ ${slug}`)
}

// ─── Main ───────────────────────────────────────────────────────────────

async function main() {
  fs.mkdirSync(BLOG_DIR, { recursive: true })

  if (singleUrl) {
    const item = await fetchSingleArticle(singleUrl)
    if (item) writePost(item)
    return
  }

  const items = await fetchRss(userHandle)
  console.log(`→ Found ${items.length} article${items.length === 1 ? "" : "s"} in feed`)
  for (const item of items) writePost(item)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
