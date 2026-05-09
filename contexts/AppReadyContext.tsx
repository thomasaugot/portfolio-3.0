"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

interface AppReadyContextValue {
  appReady: boolean
  markReady: () => void
  loaderGone: boolean
  markLoaderGone: () => void
}

const AppReadyContext = createContext<AppReadyContextValue | null>(null)

export function AppReadyProvider({ children }: { children: ReactNode }) {
  const [appReady, setAppReady] = useState(false)
  const [loaderGone, setLoaderGone] = useState(false)

  const markReady = useCallback(() => {
    setAppReady((prev) => (prev ? prev : true))
  }, [])

  const markLoaderGone = useCallback(() => {
    setLoaderGone((prev) => (prev ? prev : true))
  }, [])

  useEffect(() => {
    document.body.style.overflow = appReady ? "" : "hidden"
  }, [appReady])

  return (
    <AppReadyContext.Provider value={{ appReady, markReady, loaderGone, markLoaderGone }}>
      {children}
    </AppReadyContext.Provider>
  )
}

export function useAppReadyContext() {
  const ctx = useContext(AppReadyContext)
  if (!ctx) throw new Error("useAppReadyContext must be used inside AppReadyProvider")
  return ctx
}
