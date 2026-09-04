"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { gsap } from "@/lib/gsap"

/**
 * Giant footer wordmark that fills the full row width and whose letters get
 * bolder near the cursor (variable-font weight tween, GSAP-driven).
 * Space Grotesk ships as a variable font with a 300–700 weight axis.
 */

const WORD = "helloimtom.dev"
const CHARS = [...WORD]
const REST_WEIGHT = 500
const MIN_WEIGHT = 300
const MAX_WEIGHT = 700
const SPREAD = 0.28 // width of the bold "spotlight", as a fraction of the word

interface Props {
  /** Cursor clientX while the pointer is over the footer, null otherwise. */
  pointerX: number | null
  animated: boolean
}

function useIsSafari() {
  const [isSafari, setIsSafari] = useState(false)
  useEffect(() => {
    const ua = navigator.userAgent || ""
    const vendor = navigator.vendor || ""
    setIsSafari(
      /^((?!chrome|android).)*safari/i.test(ua) ||
      (vendor.includes("Apple") && !ua.includes("CriOS") && !ua.includes("FxiOS"))
    )
  }, [])
  return isSafari
}

function weightFor(index: number, percent: number | null) {
  if (percent === null) return REST_WEIGHT
  const pos = CHARS.length <= 1 ? 0.5 : index / (CHARS.length - 1)
  const closeness = Math.max(0, 1 - Math.abs(pos - percent / 100) / SPREAD)
  return Math.round(MIN_WEIGHT + (MAX_WEIGHT - MIN_WEIGHT) * closeness)
}

export function FooterWordmark({ pointerX, animated }: Props) {
  const outerRef = useRef<HTMLDivElement>(null)
  const wordRef = useRef<HTMLSpanElement>(null)
  const isSafari = useIsSafari()
  const animate = animated && !isSafari

  /* Fit the word to the full row width. */
  useLayoutEffect(() => {
    const outer = outerRef.current
    const word = wordRef.current
    if (!outer || !word) return

    const fit = () => {
      word.style.fontSize = ""
      const base = parseFloat(getComputedStyle(word).fontSize)
      const available = outer.clientWidth
      const natural = word.scrollWidth
      if (!base || !available || !natural) return
      // Slight under-fill so the bold spotlight never overflows the row.
      word.style.fontSize = `${base * (available / natural) * 0.985}px`
    }

    fit()
    document.fonts?.ready.then(fit)
    const ro = new ResizeObserver(fit)
    ro.observe(outer)
    return () => ro.disconnect()
  }, [])

  /* Tween each letter's weight toward the cursor. */
  useEffect(() => {
    const word = wordRef.current
    if (!word) return
    const chars = Array.from(word.querySelectorAll<HTMLElement>("[data-char]"))
    if (!chars.length) return

    if (!animate) {
      gsap.set(chars, { fontWeight: REST_WEIGHT })
      return
    }

    let percent: number | null = null
    if (pointerX !== null) {
      const r = word.getBoundingClientRect()
      if (r.width > 0) percent = Math.max(0, Math.min(100, ((pointerX - r.left) / r.width) * 100))
    }

    chars.forEach((el, i) => {
      gsap.to(el, { fontWeight: weightFor(i, percent), duration: 0.5, ease: "power1.out", overwrite: true })
    })
  }, [pointerX, animate])

  useEffect(() => {
    const word = wordRef.current
    return () => {
      if (word) gsap.killTweensOf(word.querySelectorAll("[data-char]"))
    }
  }, [])

  return (
    <div ref={outerRef} className="w-full overflow-hidden mb-12 select-none">
      <span
        ref={wordRef}
        aria-hidden="true"
        className="font-display inline-flex whitespace-nowrap leading-[0.85] tracking-tighter text-watermark text-[clamp(32px,6vw,96px)]"
        style={{ fontWeight: REST_WEIGHT }}
      >
        {CHARS.map((c, i) => (
          <span key={`${c}-${i}`} data-char className="inline-block" style={{ fontWeight: REST_WEIGHT }}>
            {c}
          </span>
        ))}
      </span>
      <span className="sr-only">{WORD}</span>
    </div>
  )
}
