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
      className={[
        "fixed inset-0 bg-bg z-loader flex flex-col items-center justify-center gap-7",
        "transition-transform duration-[0.8s] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
        exiting ? "-translate-y-full" : "translate-y-0",
        "before:content-[''] before:absolute before:inset-0 before:pointer-events-none",
        "before:bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.012)_0_1px,transparent_1px_3px)]",
      ].join(" ")}
    >
      <div
        aria-label={TARGET}
        className="font-mono font-bold text-[clamp(20px,5vw,60px)] tracking-[0.04em] leading-none select-none"
      >
        {chars.map((ch, i) => {
          const resolved = i < resolvedCount
          const isDot = TARGET[i] === "."
          return (
            <span
              key={i}
              className={[
                resolved ? (isDot ? "text-primary" : "text-text") : "text-text-subtle",
                resolved ? "transition-[color] duration-100 ease" : "",
                resolved && isDot ? [
                  "[webkit-text-stroke:1.5px_#1a1a17] [paint-order:stroke_fill] [text-shadow:3px_3px_0_#1a1a17]",
                  "dark:[webkit-text-stroke:0] dark:text-shadow-none",
                ].join(" ") : "",
              ].filter(Boolean).join(" ")}
            >
              {ch}
            </span>
          )
        })}
      </div>

      <div
        className={[
          "w-40 h-[3px] bg-border relative",
          "outline outline-[0px] outline-transparent",
          "loader-track",
        ].join(" ")}
      >
        <div
          className="absolute inset-0 bg-primary origin-left transition-transform duration-[0.04s] linear"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>

      <span className="font-mono text-[10px] tracking-[0.18em] text-text-subtle uppercase">
        {resolvedCount < TARGET.length ? "decrypting" : "ready"}
      </span>
    </div>
  )
}
