import { HomePageClient } from "@/components/pages/home/HomePageClient"
import { getAllPosts } from "@/lib/blog"
import type { Locale } from "@/lib/seo"

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const safe: Locale = (["en", "fr", "es"] as const).includes(locale as Locale) ? (locale as Locale) : "en"
  const latestPosts = getAllPosts(safe).map((p) => ({
    slug:       p.slug,
    title:      p.title,
    cover:      p.cover ?? null,
    readingMin: p.readingMin,
  }))

  return <HomePageClient latestPosts={latestPosts} />
}
