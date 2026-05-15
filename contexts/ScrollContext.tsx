"use client"

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { usePathname } from "next/navigation"

interface ScrollContextValue {
  lenis: import("lenis").default | null
}

const ScrollContext = createContext<ScrollContextValue>({ lenis: null })

export function ScrollProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<import("lenis").default | null>(null)
  const rafId = useRef<number | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual"
    }
    if (window.innerWidth < 1280) return

    let instance: import("lenis").default | null = null

    async function init() {
      const { Lenis } = await import("@/lib/lenis")
      const { gsap } = await import("@/lib/gsap")

      instance = new Lenis()
      setLenis(instance)
      instance.scrollTo(0, { immediate: true })

      gsap.ticker.add((time) => {
        instance?.raf(time * 1000)
      })
      gsap.ticker.lagSmoothing(0)
    }

    init().catch(() => {})

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current)
      instance?.destroy()
      setLenis(null)
    }
  }, [])

  useEffect(() => {
    // Always read hash FRESH inside async callbacks, never captured.
    // Always stop any in-flight Lenis animation first.
    if (lenis) lenis.stop()

    const hashNow = window.location.hash.slice(1)

    if (!hashNow) {
      window.scrollTo(0, 0)
      lenis?.scrollTo(0, { immediate: true })
      lenis?.start()
      return
    }

    let raf1 = 0
    let raf2 = 0
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const hashFresh = window.location.hash.slice(1)
        if (!hashFresh) {
          window.scrollTo(0, 0)
          lenis?.scrollTo(0, { immediate: true })
          lenis?.start()
          return
        }
        const target = document.getElementById(hashFresh)
        if (!target) {
          window.scrollTo(0, 0)
          lenis?.scrollTo(0, { immediate: true })
          lenis?.start()
          return
        }
        if (lenis) {
          lenis.start()
          lenis.scrollTo(target, { offset: 0 })
        } else {
          target.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      })
    })

    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [lenis, pathname])

  return (
    <ScrollContext.Provider value={{ lenis }}>
      {children}
    </ScrollContext.Provider>
  )
}

export function useScrollContext(): ScrollContextValue {
  return useContext(ScrollContext)
}
