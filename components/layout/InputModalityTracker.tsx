"use client"

import { useEffect } from "react"

export function InputModalityTracker() {
  useEffect(() => {
    const onKey     = () => document.documentElement.setAttribute("data-input-modality", "keyboard")
    const onPointer = () => document.documentElement.setAttribute("data-input-modality", "pointer")
    window.addEventListener("keydown",     onKey,     true)
    window.addEventListener("pointerdown", onPointer, true)
    return () => {
      window.removeEventListener("keydown",     onKey,     true)
      window.removeEventListener("pointerdown", onPointer, true)
    }
  }, [])
  return null
}
