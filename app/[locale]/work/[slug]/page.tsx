import { getMessages } from "next-intl/server"
import { notFound } from "next/navigation"
import { WorkCaseStudy } from "@/components/pages/work/WorkCaseStudy"
import { buildMetadata, type Locale } from "@/lib/seo"
import type { Metadata } from "next"

const SLUGS = [
  "materia-prima",
  // "bea-miranda", // hidden — re-enable later this year
  "binter-montajes-app",
  "dosxdosgrupoimagen-web",
  "dosxdos-montadores-app",
  "energia-solar-canarias",
  "galaga-agency-website",
  "reloj-laboral-galaga",
  "areco-web",
  "charpente-menuiserie-durand",
  "adelante-business-consulting",
] as const

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export function generateStaticParams() {
  const locales = ["en", "fr", "es"]
  return locales.flatMap((locale) =>
    SLUGS.map((slug) => ({ locale, slug }))
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const safe: Locale = (["en", "fr", "es"] as const).includes(locale as Locale) ? (locale as Locale) : "en"
  const messages = await getMessages()
  const work = (messages as { home?: { work?: { client?: string; slug?: string; tag?: string; body?: string }[] } }).home?.work ?? []
  const item = work.find((w) => w.slug === slug)

  const client = item?.client ?? "Case study"
  const tag    = item?.tag    ?? ""
  const body   = item?.body   ?? ""

  const title = tag ? `${client} — ${tag}` : client
  const description = body
    ? body.slice(0, 158).trim() + (body.length > 158 ? "…" : "")
    : `Case study — ${client} by Thomas Augot, full-stack developer.`

  return buildMetadata({
    locale: safe,
    title,
    description,
    path: `/work/${slug}`,
    ogTitle: `${client} — case study`,
  })
}

export default async function WorkPage({ params }: Props) {
  const { slug } = await params
  if (!SLUGS.includes(slug as typeof SLUGS[number])) notFound()

  return <WorkCaseStudy slug={slug} />
}
