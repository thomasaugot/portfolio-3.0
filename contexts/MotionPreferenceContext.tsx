"use client"

import {
  createContext, useContext, useEffect, useState, useCallback, type ReactNode
} from "react"

type MotionPreference = "full" | "reduced"

interface MotionPreferenceContextValue {
  preference: MotionPreference
  toggle: () => void
}

const MotionPreferenceContext = createContext<MotionPreferenceContextValue | null>(null)

export function MotionPreferenceProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<MotionPreference>("full")

  useEffect(() => {
    const stored = localStorage.getItem("motion-preference") as MotionPreference | null
    if (stored) {
      setPreference(stored)
    } else {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
      setPreference(mq.matches ? "reduced" : "full")
    }
  }, [])

  useEffect(() => {
    if (preference === "reduced") {
      document.body.classList.add("anim-low")
    } else {
      document.body.classList.remove("anim-low")
    }
  }, [preference])

  const toggle = useCallback(() => {
    setPreference((prev) => {
      const next = prev === "full" ? "reduced" : "full"
      localStorage.setItem("motion-preference", next)
      return next
    })
  }, [])

  return (
    <MotionPreferenceContext.Provider value={{ preference, toggle }}>
      {children}
    </MotionPreferenceContext.Provider>
  )
}

export function useMotionPreferenceContext() {
  const ctx = useContext(MotionPreferenceContext)
  if (!ctx) throw new Error("useMotionPreferenceContext must be used inside MotionPreferenceProvider")
  return ctx
}
