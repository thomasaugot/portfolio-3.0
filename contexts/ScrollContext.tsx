"use client"

import {
  createContext, useContext, useEffect, useRef, useState, type ReactNode
} from "react"
import { Lenis } from "@/lib/lenis"
import { gsap } from "@/lib/gsap"

const ScrollContext = createContext<Lenis | null>(null)

export function ScrollProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
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

  return <ScrollContext.Provider value={lenis}>{children}</ScrollContext.Provider>
}

export function useScrollContext() {
  return useContext(ScrollContext)
}
