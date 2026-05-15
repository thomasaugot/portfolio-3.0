import { getMessages } from "next-intl/server"
import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { routing } from "@/i18n/routing"
import { Providers } from "@/components/layout/Providers"
import { SkipLink } from "@/components/ui/SkipLink"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { PageShell } from "@/components/layout/PageShell"
import { TransitionOverlay } from "@/components/layout/TransitionOverlay"
import { TranslationProvider } from "@/contexts/TranslationContext"
import { GoogleTagManager } from "@next/third-parties/google"
import AnalyticsTracker from "@/components/AnalyticsTracker"
import { verifySession } from "@/lib/admin-auth"
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
  const store   = await cookies()
  const session = store.get("admin_session")?.value ?? ""
  const isAdmin = session ? verifySession(session) : false

  return (
    <>
      {!isAdmin && <GoogleTagManager gtmId="GTM-M6GQ2N7Z" />}
      <Providers locale={locale} messages={messages as Record<string, unknown>}>
        <TranslationProvider locale={locale as Language}>
          <AnalyticsTracker />
          <SkipLink targetId="main-content" />
          <div className="flex min-h-dvh flex-col">
            <Navbar />
            <PageShell>{children}</PageShell>
            <Footer />
          </div>
          <TransitionOverlay />
        </TranslationProvider>
      </Providers>
    </>
  )
}
