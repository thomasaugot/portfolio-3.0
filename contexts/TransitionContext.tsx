"use client"

import {
  createContext, useContext, useRef, useState, useCallback, type ReactNode
} from "react"
import { useRouter } from "next/navigation"
import { exitPage } from "@/utils/animations/pageTransitions"
import { gsap, ScrollTrigger } from "@/lib/gsap"

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
      gsap.killTweensOf(pageRef.current)
    }

    // React 19 safety net: tear down all GSAP state before unmount,
    // otherwise stale DOM refs cause removeChild crashes.
    ScrollTrigger.getAll().forEach(t => t.kill())
    gsap.globalTimeline.getChildren().forEach(t => t.kill())

    // scroll: false → ScrollContext owns scroll, not Next.js.
    router.push(href, { scroll: false })

    // Fallback in case PageShell never calls resetTransition (e.g. enterPage errors).
    // Without this all links would lock forever.
    window.setTimeout(() => setIsTransitioning(false), 1200)
  }, [isTransitioning, router])

  return (
    <TransitionContext.Provider value={{ isTransitioning, registerRef, navigateTo, resetTransition }}>
      {children}
    </TransitionContext.Provider>
  )
}

export function useTransitionContext() {
  const ctx = useContext(TransitionContext)
  if (!ctx) throw new Error("useTransitionContext must be used inside TransitionProvider")
  return ctx
}
