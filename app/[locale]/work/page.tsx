import { WorkPageClient } from "@/components/pages/work/WorkPageClient"
import { buildMetadata, WORK_SEO, type Locale } from "@/lib/seo"
import type { Metadata } from "next"

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "fr" }, { locale: "es" }]
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const safe: Locale = (["en", "fr", "es"] as const).includes(locale as Locale) ? (locale as Locale) : "en"
  const { title, description } = WORK_SEO[safe]
  return buildMetadata({ locale: safe, title, description, path: "/work" })
}

export default function WorkIndexPage() {
  return <WorkPageClient />
}
