"use client"

import type { ReactNode } from "react"
import { NextIntlClientProvider } from "next-intl"
import { AppReadyProvider } from "@/contexts/AppReadyContext"
import { ScrollProvider } from "@/contexts/ScrollContext"
import { TransitionProvider } from "@/contexts/TransitionContext"
import { MotionPreferenceProvider } from "@/contexts/MotionPreferenceContext"
import { PageLoader } from "@/components/layout/PageLoader"
import { PageShell } from "@/components/layout/PageShell"
import { Toaster } from "@/components/ui/Toaster"
import { LiveRegion } from "@/components/ui/LiveRegion"
import { BackToTop } from "@/components/ui/BackToTop"

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
              <div className="noise-overlay" aria-hidden="true" />
              <PageLoader />
              <PageShell>
                {children}
              </PageShell>
              <Toaster />
              <LiveRegion />
              <BackToTop />
            </MotionPreferenceProvider>
          </TransitionProvider>
        </ScrollProvider>
      </AppReadyProvider>
    </NextIntlClientProvider>
  )
}
