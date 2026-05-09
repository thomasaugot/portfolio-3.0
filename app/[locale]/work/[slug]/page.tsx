import { getMessages } from "next-intl/server"
import { notFound } from "next/navigation"
import { WorkCaseStudy } from "@/components/pages/work/WorkCaseStudy"

const SLUGS = [
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

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const messages = await getMessages()
  const work = (messages as { home?: { work?: { client?: string; slug?: string }[] } }).home?.work ?? []
  const item = work.find((w) => w.slug === slug)
  return {
    title: item?.client ?? "Case study",
  }
}

export default async function WorkPage({ params }: Props) {
  const { slug } = await params
  if (!SLUGS.includes(slug as typeof SLUGS[number])) notFound()

  return <WorkCaseStudy slug={slug} />
}
