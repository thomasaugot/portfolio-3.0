"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react"

type ContrastMode = "normal" | "high"

interface ContrastContextValue {
  mode: ContrastMode
  toggle: () => void
}

const ContrastContext = createContext<ContrastContextValue | null>(null)

export function ContrastProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ContrastMode>("normal")

  useEffect(() => {
    const stored = localStorage.getItem("contrast-mode") as ContrastMode | null
    if (stored) setMode(stored)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute("data-contrast", mode)
  }, [mode])

  const toggle = useCallback(() => {
    setMode((prev) => {
      const next = prev === "normal" ? "high" : "normal"
      localStorage.setItem("contrast-mode", next)
      return next
    })
  }, [])

  return (
    <ContrastContext.Provider value={{ mode, toggle }}>
      {children}
    </ContrastContext.Provider>
  )
}

export function useContrast() {
  const ctx = useContext(ContrastContext)
  if (!ctx) throw new Error("useContrast must be used inside ContrastProvider")
  return ctx
}
