"use client"

import { useEffect, type ReactNode } from "react"
import { NextIntlClientProvider } from "next-intl"
import { AppReadyProvider } from "@/contexts/AppReadyContext"
import { ScrollProvider } from "@/contexts/ScrollContext"
import { TransitionProvider } from "@/contexts/TransitionContext"
import { MotionPreferenceProvider } from "@/contexts/MotionPreferenceContext"
import { PageLoader } from "@/components/layout/PageLoader"
import { Toaster } from "@/components/ui/Toaster"
import { LiveRegion } from "@/components/ui/LiveRegion"
import { BackToTop } from "@/components/ui/BackToTop"
import { ContrastToggle } from "@/components/ui/ContrastToggle"
import { CustomCursor } from "@/components/ui/CustomCursor"
import { InputModalityTracker } from "@/components/layout/InputModalityTracker"
import { ContrastProvider } from "@/contexts/ContrastContext"

// Syncs <html lang> to the active locale on the client.
// The root layout defaults to "en"; this corrects it when the locale is fr/es.
function HtmlLangSync({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])
  return null
}

interface ProvidersProps {
  children: ReactNode
  locale: string
  messages: Record<string, unknown>
}

export function Providers({ children, locale, messages }: ProvidersProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AppReadyProvider>
        <ScrollProvider>
          <TransitionProvider>
            <MotionPreferenceProvider>
              <ContrastProvider>
                <HtmlLangSync locale={locale} />
                <InputModalityTracker />
                <div className="noise-overlay" aria-hidden="true" />
                <PageLoader />
                {children}
                <Toaster />
                <LiveRegion />
                <BackToTop />
                <ContrastToggle />
              <CustomCursor />
              </ContrastProvider>
            </MotionPreferenceProvider>
          </TransitionProvider>
        </ScrollProvider>
      </AppReadyProvider>
    </NextIntlClientProvider>
  )
}
