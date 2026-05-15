"use client"

import { useEffect, useRef, useState } from "react"
import { useAppReadyContext } from "@/contexts/AppReadyContext"
import { announce } from "@/components/ui/LiveRegion"

const TARGET = "helloimtom.dev"
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%"
const SCRAMBLE_DURATION = 1400

function randomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)]
}

export function PageLoader() {
  const { appReady, markLoaderGone } = useAppReadyContext()
  // Initialize from TARGET so server & client agree — scramble starts in useEffect (client only)
  const [chars, setChars] = useState<string[]>(() => TARGET.split(""))
  const [resolvedCount, setResolvedCount] = useState(0)
  const [exiting, setExiting] = useState(false)
  const [gone, setGone] = useState(false)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)
  const scrambleDoneRef = useRef(false)
  const appReadyRef = useRef(false)
  const exitScheduledRef = useRef(false)

  function scheduleExit() {
    if (exitScheduledRef.current) return
    exitScheduledRef.current = true
    setTimeout(() => {
      setExiting(true)
      markLoaderGone()
      setTimeout(() => {
        setGone(true)
        announce("Page ready", "polite")
      }, 800)
    }, 100)
  }

  useEffect(() => {
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts
      const elapsed = ts - startRef.current
      const t = Math.min(elapsed / SCRAMBLE_DURATION, 1)
      const resolved = t < 1 ? Math.floor(t * TARGET.length) : TARGET.length

      setResolvedCount(resolved)
      setChars(TARGET.split("").map((ch, i) => (i < resolved ? ch : randomChar())))

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        scrambleDoneRef.current = true
        if (appReadyRef.current) scheduleExit()
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!appReady) return
    appReadyRef.current = true
    if (scrambleDoneRef.current) scheduleExit()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appReady])

  if (gone) return null

  const progress = resolvedCount / TARGET.length

  return (
    <div
      role="status"
      aria-label="Loading"
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--color-bg)",
        zIndex: "var(--z-loader)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "28px",
        transform: exiting ? "translateY(-100%)" : "translateY(0)",
        transition: exiting ? "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)" : "none",
      }}
    >
      {/* Scanline texture */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.012) 0 1px, transparent 1px 3px)",
        pointerEvents: "none",
      }} />

      {/* Scrambling text — mono font keeps character widths stable */}
      <div
        aria-label={TARGET}
        style={{
          fontFamily: "var(--font-mono)",
          fontWeight: 700,
          fontSize: "clamp(20px, 5vw, 60px)",
          letterSpacing: "0.04em",
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        {chars.map((ch, i) => {
          const resolved = i < resolvedCount
          const isDot = TARGET[i] === "."
          return (
            <span
              key={i}
              className={resolved && isDot ? "loader-dot" : undefined}
              style={{
                color: resolved
                  ? isDot ? "var(--color-primary)" : "var(--color-text)"
                  : "var(--color-text-subtle)",
                transition: resolved ? "color 0.1s ease" : "none",
              }}
            >
              {ch}
            </span>
          )
        })}
      </div>

      {/* Progress bar */}
      <div className="loader-track" style={{
        width: "160px",
        height: "3px",
        background: "var(--color-border)",
        position: "relative",
      }}>
        <div className="loader-bar" style={{
          position: "absolute",
          inset: 0,
          background: "var(--color-primary)",
          transform: `scaleX(${progress})`,
          transformOrigin: "left",
          transition: "transform 0.04s linear",
        }} />
      </div>

      {/* Status label */}
      <span style={{
        fontFamily: "var(--font-mono)",
        fontSize: "10px",
        letterSpacing: "0.18em",
        color: "var(--color-text-subtle)",
        textTransform: "uppercase",
      }}>
        {resolvedCount < TARGET.length ? "decrypting" : "ready"}
      </span>
    </div>
  )
}
