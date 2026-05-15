"use client"

import {
  createContext, useContext, useEffect, useRef, useState, type ReactNode
} from "react"
import { usePathname } from "next/navigation"
import { Lenis } from "@/lib/lenis"
import { gsap } from "@/lib/gsap"

const ScrollContext = createContext<Lenis | null>(null)

export function ScrollProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null)
  const rafRef = useRef<number | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === "undefined") return
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual"
    }
    if (window.innerWidth < 1280) return

    const instance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    const onFrame = (time: number) => {
      instance.raf(time * 1000)
    }

    gsap.ticker.add(onFrame)
    gsap.ticker.lagSmoothing(0)
    setLenis(instance)

    return () => {
      gsap.ticker.remove(onFrame)
      instance.destroy()
      setLenis(null)
    }
  }, [])

  // On every pathname change (including first mount): scroll to top or to hash.
  // The PageLoader covers the screen on initial load, hiding the
  // browser's scroll-restore flash before this runs.
  useEffect(() => {
    const hash = window.location.hash.slice(1)

    if (!hash) {
      window.scrollTo(0, 0)
      lenis?.scrollTo(0, { immediate: true })
      return
    }

    let raf1 = 0
    let raf2 = 0
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const target = document.getElementById(hash)
        if (!target) {
          window.scrollTo(0, 0)
          lenis?.scrollTo(0, { immediate: true })
          return
        }
        if (lenis) {
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

  return <ScrollContext.Provider value={lenis}>{children}</ScrollContext.Provider>
}

export function useScrollContext() {
  return useContext(ScrollContext)
}
