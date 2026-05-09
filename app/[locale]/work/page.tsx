import { WorkPageClient } from "@/components/pages/work/WorkPageClient"

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "fr" }, { locale: "es" }]
}

export const metadata = {
  title: "Work — helloimtom.dev",
  description: "Selected projects — from full-stack platforms to corporate websites.",
}

export default function WorkIndexPage() {
  return <WorkPageClient />
}
