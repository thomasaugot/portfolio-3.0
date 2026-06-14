import { getMessages } from "next-intl/server"
import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { routing } from "@/i18n/routing"
import { Providers } from "@/components/layout/Providers"
import { SkipLink } from "@/components/ui/SkipLink"
import { Navbar } from "@/components/layout/Navbar"
import { MobileMenu } from "@/components/layout/MobileMenu"
import { Footer } from "@/components/layout/Footer"
import { PageShell } from "@/components/layout/PageShell"
import { TransitionOverlay } from "@/components/layout/TransitionOverlay"
import { TranslationProvider } from "@/contexts/TranslationContext"
import { CookieBanner } from "@/components/shared/CookieBanner"
import { ConsentGTM } from "@/components/shared/ConsentGTM"
import AnalyticsTracker from "@/components/AnalyticsTracker"
import { verifySession } from "@/lib/admin-auth"
import { JsonLd } from "@/components/seo/JsonLd"
import { buildMetadata, HOME_SEO, type Locale } from "@/lib/seo"
import type { Language } from "@/config/i18n.config"
import type { Metadata } from "next"
import type { ReactNode } from "react"

interface LocaleLayoutProps {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const safe: Locale = (["en", "fr", "es"] as const).includes(locale as Locale) ? (locale as Locale) : "en"
  const { title, description, ogTitle } = HOME_SEO[safe]
  return buildMetadata({ locale: safe, title, description, ogTitle })
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params

  if (!routing.locales.includes(locale as Language)) {
    notFound()
  }

  const messages = await getMessages()
  const store   = await cookies()
  const session = store.get("admin_session")?.value ?? ""
  const isAdmin = session ? verifySession(session) : false

  return (
    <>
      {/* GTM loads ONLY after the user accepts analytics cookies (see ConsentGTM). */}
      {!isAdmin && <ConsentGTM />}
      <JsonLd locale={locale as Locale} />
      <Providers locale={locale} messages={messages as Record<string, unknown>}>
        <TranslationProvider locale={locale as Language}>
          <AnalyticsTracker />
          <SkipLink targetId="main-content" />
          <div className="flex min-h-dvh flex-col">
            <Navbar />
            <MobileMenu />
            <PageShell>{children}</PageShell>
            <Footer />
          </div>
          <TransitionOverlay />
          <CookieBanner />
        </TranslationProvider>
      </Providers>
    </>
  )
}
