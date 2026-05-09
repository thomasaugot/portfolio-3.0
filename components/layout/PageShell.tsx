"use client"

import { useRef, useEffect, useLayoutEffect, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { useTransitionContext } from "@/contexts/TransitionContext"
import { enterPage } from "@/utils/animations/pageTransitions"
import { ScrollTrigger } from "@/lib/gsap"

export function PageShell({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { registerRef, resetTransition } = useTransitionContext()
  const pathname = usePathname()
  const isFirstRender = useRef(true)

  useEffect(() => {
    registerRef(containerRef.current)
  }, [registerRef])

  useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (containerRef.current) {
      containerRef.current.style.opacity = "0"
    }
  }, [pathname])

  useEffect(() => {
    if (isFirstRender.current) return
    const el = containerRef.current
    if (!el) return
    enterPage(el).then(() => {
      resetTransition()
      ScrollTrigger.refresh()
    })
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={containerRef} style={{ minHeight: "100vh" }}>
      {children}
    </div>
  )
}
