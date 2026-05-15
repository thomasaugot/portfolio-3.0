"use client"

import { useEffect, useLayoutEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { ScrollTrigger } from "@/lib/gsap"
import { useTransitionContext } from "@/contexts/TransitionContext"
import { enterPage } from "@/utils/animations/pageTransitions"

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

export function PageShell({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  const pathname = usePathname()
  const isFirstRender = useRef(true)
  const { registerRef, resetTransition } = useTransitionContext()

  useEffect(() => {
    registerRef(ref.current)
    return () => registerRef(null)
  }, [registerRef])

  useIsomorphicLayoutEffect(() => {
    if (!ref.current || isFirstRender.current) return
    ref.current.style.opacity = "0"
    ref.current.style.transform = "translateY(10px)"
  }, [pathname])

  useEffect(() => {
    if (!ref.current) return
    let cancelled = false
    const el = ref.current

    void enterPage(el).then(() => {
      if (cancelled) return
      isFirstRender.current = false
      resetTransition()
      ScrollTrigger.refresh()
    })

    return () => { cancelled = true }
  }, [pathname, resetTransition])

  return (
    <main
      ref={ref}
      id="main-content"
      tabIndex={-1}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </main>
  )
}
