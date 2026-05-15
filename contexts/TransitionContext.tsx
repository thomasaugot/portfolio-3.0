"use client"

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { exitPage } from "@/utils/animations/pageTransitions"

interface TransitionContextValue {
  isTransitioning: boolean
  registerRef: (el: HTMLElement | null) => void
  navigateTo: (href: string) => Promise<void>
  resetTransition: () => void
}

const TransitionContext = createContext<TransitionContextValue | null>(null)

export function TransitionProvider({ children }: { children: ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const pageRef = useRef<HTMLElement | null>(null)
  const router = useRouter()

  const registerRef = useCallback((el: HTMLElement | null) => {
    pageRef.current = el
  }, [])

  const resetTransition = useCallback(() => {
    setIsTransitioning(false)
  }, [])

  const navigateTo = useCallback(async (href: string) => {
    if (isTransitioning) return
    setIsTransitioning(true)

    if (pageRef.current) {
      await exitPage(pageRef.current)
    }

    router.push(href)

    window.setTimeout(() => {
      setIsTransitioning(false)
    }, 1200)
  }, [isTransitioning, router])

  return (
    <TransitionContext.Provider
      value={{ isTransitioning, registerRef, navigateTo, resetTransition }}
    >
      {children}
    </TransitionContext.Provider>
  )
}

export function useTransitionContext(): TransitionContextValue {
  const ctx = useContext(TransitionContext)
  if (!ctx) throw new Error("useTransitionContext must be used within TransitionProvider")
  return ctx
}
