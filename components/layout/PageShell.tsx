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

  // Synchronously set the entering state BEFORE paint to prevent a flash of
  // the unstyled (scale 1, blur 0, opacity 1) page on route change.
  useIsomorphicLayoutEffect(() => {
    if (!ref.current || isFirstRender.current) return
    const el = ref.current
    el.style.opacity = "0"
    el.style.transform = "scale(1.04) translateZ(0)"
    el.style.filter = "blur(12px)"
    el.style.transformOrigin = "center center"
  }, [pathname])

  useEffect(() => {
    if (!ref.current) return
    let cancelled = false
    const el = ref.current

    // Double rAF: ensures the layout-effect styles have actually painted before
    // GSAP starts the tween — kills the rare double-paint flash.
    const start = () => {
      void enterPage(el).then(() => {
        if (cancelled) return
        isFirstRender.current = false
        resetTransition()
        ScrollTrigger.refresh()
      })
    }
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(start)
      // store on closure for cleanup below
      ;(start as unknown as { _raf2?: number })._raf2 = raf2
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(raf1)
      const raf2 = (start as unknown as { _raf2?: number })._raf2
      if (raf2) cancelAnimationFrame(raf2)
    }
  }, [pathname, resetTransition])

  return (
    <main
      ref={ref}
      id="main-content"
      tabIndex={-1}
      className="flex-1"
      style={{
        willChange: "opacity, transform, filter",
        backfaceVisibility: "hidden",
      }}
    >
      {children}
    </main>
  )
}
