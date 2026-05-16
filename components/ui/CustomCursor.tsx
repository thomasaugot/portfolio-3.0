"use client"

import { useEffect, useRef, useState } from "react"

const CURSOR_DARK_MODE = "212, 255, 58"
const CURSOR_LIGHT_MODE = "26, 26, 23"

interface Spark {
  x: number; y: number
  vx: number; vy: number
  life: number   // 1 → 0
  size: number
}

export function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const isTouch =
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(hover: none)").matches ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0
    if (isTouch) {
      setEnabled(false)
      return
    }
    setEnabled(true)

    // Defensive: if a real touch event ever fires (even on a device that
    // lied about touch capability), kill the cursor immediately and don't
    // let it come back.
    const onTouch = () => setEnabled(false)
    window.addEventListener("touchstart", onTouch, { once: true, passive: true })
    return () => window.removeEventListener("touchstart", onTouch)
  }, [])

  useEffect(() => {
    if (!enabled) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let W = 0, H = 0
    const resize = () => {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(document.documentElement)

    let mx = -400, my = -400, pmx = -400, pmy = -400
    let fx = -400, fy = -400
    let visible    = false
    let isHovering = false
    let isGrab     = false
    let clickLife  = 0

    const sparks: Spark[] = []

    const onEnter = (e: MouseEvent) => { fx = mx = pmx = e.clientX; fy = my = pmy = e.clientY; visible = true }
    const onLeave = () => { visible = false }
    const onMove  = (e: MouseEvent) => {
      pmx = mx; pmy = my
      mx = e.clientX; my = e.clientY
      if (!visible) { fx = mx; fy = my; visible = true }
    }
    const onDown  = () => { clickLife = 1 }
    const SELECTORS = "a,button,[role='button'],label,input,textarea,select"
    const onOver  = (e: MouseEvent) => {
      const el = e.target as Element
      isHovering = !!el.closest(SELECTORS)
      isGrab     = !!el.closest(".cursor-grab")
    }

    document.addEventListener("mouseenter", onEnter, { passive: true })
    document.addEventListener("mouseleave", onLeave, { passive: true })
    window.addEventListener("mousemove",    onMove,  { passive: true })
    window.addEventListener("mousedown",    onDown,  { passive: true })
    window.addEventListener("mouseover",    onOver,  { passive: true })

    const styleEl = document.createElement("style")
    styleEl.textContent = `*:not(.cursor-grab):not(.cursor-grabbing),*::before,*::after{cursor:none!important}`
    document.head.appendChild(styleEl)

    let raf: number

    const tick = () => {
      raf = requestAnimationFrame(tick)
      ctx.clearRect(0, 0, W, H)
      if (!visible) return

      const LIME = document.documentElement.getAttribute("data-theme") === "light"
        ? CURSOR_LIGHT_MODE
        : CURSOR_DARK_MODE

      const reducedMotion = document.body.classList.contains("anim-low")

      // Lerp follower for ring
      fx += (mx - fx) * 0.14
      fy += (my - fy) * 0.14

      if (!reducedMotion) {
        // Emit sparks proportional to cursor speed
        const speed = Math.hypot(mx - pmx, my - pmy)
        if (speed > 1.5) {
          const count = Math.min(Math.floor(speed * 0.4), 6)
          for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2
            const mag   = 0.4 + Math.random() * speed * 0.18
            sparks.push({
              x:    mx + (Math.random() - 0.5) * 6,
              y:    my + (Math.random() - 0.5) * 6,
              vx:   Math.cos(angle) * mag,
              vy:   Math.sin(angle) * mag,
              life: 0.7 + Math.random() * 0.3,
              size: 0.8 + Math.random() * 1.8,
            })
          }
        }

        // Update + draw sparks
        ctx.fillStyle = `rgb(${LIME})`
        for (let i = sparks.length - 1; i >= 0; i--) {
          const s = sparks[i]
          s.x   += s.vx
          s.y   += s.vy
          s.vx  *= 0.93
          s.vy  *= 0.93
          s.life -= 0.032

          if (s.life <= 0) { sparks.splice(i, 1); continue }

          const a = s.life * s.life
          // Outer glow
          ctx.globalAlpha = a * 0.18
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.size * 3.5, 0, Math.PI * 2)
          ctx.fill()
          // Core
          ctx.globalAlpha = a * 0.85
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.globalAlpha = 1
      }

      if (isGrab) return

      // ── Follower ring ─────────────────────────────────────
      const ringR = isHovering ? 14 : 9
      const ringA = isHovering ? 0.55 : 0.3

      const halo = ctx.createRadialGradient(fx, fy, 0, fx, fy, ringR + 12)
      halo.addColorStop(0,   `rgba(${LIME},${ringA * 0.12})`)
      halo.addColorStop(0.5, `rgba(${LIME},${ringA * 0.06})`)
      halo.addColorStop(1,   `rgba(${LIME},0)`)
      ctx.beginPath()
      ctx.arc(fx, fy, ringR + 12, 0, Math.PI * 2)
      ctx.fillStyle = halo
      ctx.fill()

      ctx.beginPath()
      ctx.arc(fx, fy, ringR, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(${LIME},${ringA})`
      ctx.lineWidth   = isHovering ? 1.5 : 1
      ctx.stroke()

      // Click ripple removed — no burst/explosion on click
      void clickLife

      // ── Exact cursor dot ──────────────────────────────────
      const dotR = isHovering ? 2 : 2.5

      const dg = ctx.createRadialGradient(mx, my, 0, mx, my, dotR * 5)
      dg.addColorStop(0, `rgba(${LIME},0.35)`)
      dg.addColorStop(1, `rgba(${LIME},0)`)
      ctx.beginPath()
      ctx.arc(mx, my, dotR * 5, 0, Math.PI * 2)
      ctx.fillStyle = dg
      ctx.fill()

      ctx.beginPath()
      ctx.arc(mx, my, dotR, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${LIME},${isHovering ? 0.8 : 1})`
      ctx.fill()
    }

    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      document.removeEventListener("mouseenter", onEnter)
      document.removeEventListener("mouseleave", onLeave)
      window.removeEventListener("mousemove",    onMove)
      window.removeEventListener("mousedown",    onDown)
      window.removeEventListener("mouseover",    onOver)
      if (styleEl.parentNode) styleEl.parentNode.removeChild(styleEl)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-cursor"
      aria-hidden="true"
    />
  )
}
