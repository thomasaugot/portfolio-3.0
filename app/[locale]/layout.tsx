import { getMessages } from "next-intl/server"
import { notFound } from "next/navigation"
import { routing } from "@/i18n/routing"
import { Providers } from "@/components/layout/Providers"
import { SkipLink } from "@/components/ui/SkipLink"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { TranslationProvider } from "@/contexts/TranslationContext"
import { GoogleTagManager } from "@next/third-parties/google"
import AnalyticsTracker from "@/components/AnalyticsTracker"
import type { Language } from "@/config/i18n.config"
import type { ReactNode } from "react"

interface LocaleLayoutProps {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params

  if (!routing.locales.includes(locale as Language)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <>
      <GoogleTagManager gtmId="GTM-M6GQ2N7Z" />
      <Providers locale={locale} messages={messages as Record<string, unknown>}>
        <TranslationProvider locale={locale as Language}>
          <AnalyticsTracker />
          <SkipLink targetId="main-content" />
          <Navbar />
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </TranslationProvider>
      </Providers>
    </>
  )
}
