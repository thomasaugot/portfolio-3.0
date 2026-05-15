"use client"

import { useEffect, useState } from "react"
import { useTransitionContext } from "@/contexts/TransitionContext"

export function TransitionOverlay() {
  const { isTransitioning } = useTransitionContext()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(isTransitioning)
  }, [isTransitioning])

  return (
    <div
      aria-hidden={!visible}
      role="status"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: "var(--z-modal)",
        background: "var(--color-bg)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 0.3s ease-out",
      }}
    />
  )
}
