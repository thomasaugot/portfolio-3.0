"use client"

import { useEffect, useState } from "react"
import { useAppReady } from "@/hooks/useAppReady"
import { announce } from "@/components/ui/LiveRegion"

export function PageLoader() {
  const appReady = useAppReady()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (appReady) {
      const t = setTimeout(() => {
        setVisible(false)
        announce("Page ready", "polite")
      }, 500)
      return () => clearTimeout(t)
    }
  }, [appReady])

  if (!visible) return null

  return (
    <div
      role="status"
      aria-label="Loading"
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--color-bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "24px",
        zIndex: "var(--z-loader)",
        transition: "opacity 0.5s var(--ease-out)",
        opacity: appReady ? 0 : 1,
        pointerEvents: appReady ? "none" : "auto",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: "clamp(32px, 6vw, 72px)",
          letterSpacing: "-0.04em",
          lineHeight: 1,
          color: "var(--color-text)",
        }}
      >
        thomas<span style={{ color: "var(--color-primary)" }}>.</span>dev
      </div>
      <div
        style={{
          width: "120px",
          height: "1px",
          background: "var(--color-border)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "var(--color-primary)",
            animation: "loader-bar 1.2s var(--ease-out) forwards",
          }}
        />
      </div>
    </div>
  )
}
