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
import { ThemeToggle } from "@/components/ui/ThemeToggle"
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
                <div className="fixed inset-0 pointer-events-none opacity-[0.025] mix-blend-mode-overlay bg-[url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27160%27 height=%27160%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.85%27 numOctaves=%273%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27 opacity=%270.65%27/%3E%3C/svg%3E')]" aria-hidden="true" />
                <PageLoader />
                {children}
                <Toaster />
                <LiveRegion />
                <BackToTop />
                <ContrastToggle />
                <ThemeToggle />
              <CustomCursor />
              </ContrastProvider>
            </MotionPreferenceProvider>
          </TransitionProvider>
        </ScrollProvider>
      </AppReadyProvider>
    </NextIntlClientProvider>
  )
}
