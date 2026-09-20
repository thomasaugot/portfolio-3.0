"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { usePathname } from "next/navigation"

type LenisInstance = import("lenis").default

interface ScrollContextValue {
  lenis: LenisInstance | null
  /** Smooth-scroll to an element id on the current page (Lenis on desktop, native elsewhere). Returns false if the element doesn't exist yet. */
  scrollToHash: (id: string) => boolean
}

const ScrollContext = createContext<ScrollContextValue>({
  lenis: null,
  scrollToHash: (id) => {
    const el = document.getElementById(id)
    el?.scrollIntoView({ behavior: "smooth", block: "start" })
    return !!el
  },
})

// If the page-enter transition never reports back, scroll anyway after this long.
const PAGE_ENTER_FALLBACK_MS = 1500
// After that, keep looking for the target section this long (streamed pages render late).
const TARGET_WAIT_MS = 8000

export function ScrollProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<LenisInstance | null>(null)
  const lenisRef = useRef<LenisInstance | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual"
    }
    if (window.innerWidth < 1280) return

    let instance: LenisInstance | null = null

    async function init() {
      const { Lenis } = await import("@/lib/lenis")
      const { gsap } = await import("@/lib/gsap")

      instance = new Lenis()
      lenisRef.current = instance
      setLenis(instance)
      instance.scrollTo(0, { immediate: true })

      gsap.ticker.add((time) => {
        instance?.raf(time * 1000)
      })
      gsap.ticker.lagSmoothing(0)
    }

    init().catch(() => {})

    return () => {
      instance?.destroy()
      lenisRef.current = null
      setLenis(null)
    }
  }, [])

  const scrollToHash = useCallback((id: string) => {
    const target = document.getElementById(id)
    if (!target) return false
    const l = lenisRef.current
    if (l) {
      // Lenis measures element targets against its own internal position, which goes
      // stale after any native jump. Resync first, then scroll — force so it works even
      // if a previous transition left Lenis stopped, and lock so an in-flight wheel
      // gesture can't drag the target away.
      l.resize()
      l.start()
      // Layout can still shift while we travel (images, late content), so once the
      // scroll settles, check the target is really at the top and nudge if it isn't.
      let corrections = 0
      const settle = () => {
        const off = Math.round(target.getBoundingClientRect().top)
        if (Math.abs(off) <= 2 || corrections >= 2) return
        corrections += 1
        l.resize()
        l.scrollTo(target, { offset: 0, force: true, lock: true, duration: 0.4, onComplete: settle })
      }
      l.scrollTo(target, { offset: 0, force: true, lock: true, onComplete: settle })
    } else {
      target.scrollIntoView({ behavior: "smooth", block: "start" })
    }
    return true
  }, [])

  // On every route change: reset to top immediately (Next's own scrolling is disabled in
  // navigateTo), then, once the page-enter transition has finished, scroll to the hash if any.
  useEffect(() => {
    const l = lenisRef.current
    l?.stop()
    window.scrollTo(0, 0)
    l?.scrollTo(0, { immediate: true, force: true })

    const hash = window.location.hash.slice(1)
    if (!hash) {
      l?.start()
      return
    }

    let done = false
    let timer = 0
    const go = () => {
      if (done) return
      done = true
      window.clearTimeout(timer)
      window.removeEventListener("page:entered", go)
      // Re-read the hash in case it changed while we waited.
      const fresh = window.location.hash.slice(1)
      lenisRef.current?.start()
      if (!fresh) return
      // The page shell can finish entering before a streamed page has rendered its
      // sections, so keep trying until the target exists (or we give up).
      if (scrollToHash(fresh)) return
      const started = performance.now()
      const retry = () => {
        if (cancelled) return
        if (scrollToHash(fresh)) return
        if (performance.now() - started < TARGET_WAIT_MS) rafRetry = requestAnimationFrame(retry)
      }
      rafRetry = requestAnimationFrame(retry)
    }
    let cancelled = false
    let rafRetry = 0
    window.addEventListener("page:entered", go)
    timer = window.setTimeout(go, PAGE_ENTER_FALLBACK_MS)

    return () => {
      done = true
      cancelled = true
      cancelAnimationFrame(rafRetry)
      window.clearTimeout(timer)
      window.removeEventListener("page:entered", go)
    }
  }, [lenis, pathname, scrollToHash])

  return (
    <ScrollContext.Provider value={{ lenis, scrollToHash }}>
      {children}
    </ScrollContext.Provider>
  )
}

export function useScrollContext(): ScrollContextValue {
  return useContext(ScrollContext)
}
