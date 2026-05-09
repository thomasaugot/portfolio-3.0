"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

interface AppReadyContextValue {
  appReady: boolean
  markReady: () => void
}

const AppReadyContext = createContext<AppReadyContextValue | null>(null)

export function AppReadyProvider({ children }: { children: ReactNode }) {
  const [appReady, setAppReady] = useState(false)

  const markReady = useCallback(() => {
    setAppReady((prev) => {
      if (prev) return prev
      return true
    })
  }, [])

  useEffect(() => {
    if (appReady) {
      document.body.style.overflow = ""
    } else {
      document.body.style.overflow = "hidden"
    }
  }, [appReady])

  return (
    <AppReadyContext.Provider value={{ appReady, markReady }}>
      {children}
    </AppReadyContext.Provider>
  )
}

export function useAppReadyContext() {
  const ctx = useContext(AppReadyContext)
  if (!ctx) throw new Error("useAppReadyContext must be used inside AppReadyProvider")
  return ctx
}
