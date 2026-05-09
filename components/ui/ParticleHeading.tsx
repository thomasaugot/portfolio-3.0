"use client"

import { ElementType, HTMLAttributes, ReactNode, useEffect, useRef } from "react"

// ─── Physics / rendering constants ───────────────────────────────────────────
const SPRING       = 0.06
const DAMPING      = 0.80
const REPEL_RADIUS = 90
const REPEL_STR    = 9
const REST_SPD     = 0.25
const REST_DIST    = 1.0
const BLEED_TOP    = 24   // px above layout box to capture ascender ink overflow
const SCATTER_PAD  = 150  // transparent margin so scattered particles never clip

type Particle = {
  x: number; y: number; hx: number; hy: number; vx: number; vy: number
  cr: number; cg: number; cb: number
}
type Pt      = { hx: number; hy: number; cr: number; cg: number; cb: number }
type Capture = { canvas: HTMLCanvasElement; pts: Pt[]; offX: number; offY: number }

// ─── SVG capture helpers ──────────────────────────────────────────────────────

const STYLE_PROPS = [
  "font-family","font-size","font-weight","font-style","color",
  "line-height","letter-spacing","display","white-space","padding","margin",
]

function serializeEl(el: Element, injectStyle = ""): string {
  const cs  = window.getComputedStyle(el as HTMLElement)
  const sty = STYLE_PROPS.map(p =>
    `${p}:${cs.getPropertyValue(p).replace(/"/g, "'")}`
  ).join(";") + (injectStyle ? ";" + injectStyle : "")
  const kids = Array.from(el.childNodes).map(n => {
    if (n.nodeType === Node.TEXT_NODE)
      return (n.textContent ?? "")
        .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    if (n.nodeType === Node.ELEMENT_NODE) {
      if ((n as Element).tagName === "CANVAS") return ""
      return serializeEl(n as Element)
    }
    return ""
  }).join("")
  return `<${(el as HTMLElement).tagName.toLowerCase()} xmlns="http://www.w3.org/1999/xhtml" style="${sty}">${kids}</${(el as HTMLElement).tagName.toLowerCase()}>`
}

function fontFaceCSS(): string {
  const rules: string[] = []
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules))
        if (rule instanceof CSSFontFaceRule)
          rules.push(rule.cssText.replace(
            /url\((['"]?)([^'")\s]+)\1\)/g,
            (_m, q, u) => /^(https?:|data:)/.test(u)
              ? _m : `url(${q}${new URL(u, document.baseURI).href}${q})`
          ))
    } catch { /* cross-origin */ }
  }
  return rules.join("\n")
}

async function captureViaSVG(
  el: HTMLElement,
  dpr: number
): Promise<Capture | null> {
  const elr  = el.getBoundingClientRect()
  const W    = Math.ceil(elr.width)
  const H    = Math.ceil(elr.height) + BLEED_TOP
  const PW   = Math.ceil(W * dpr), PH = Math.ceil(H * dpr)

  // Force width on the serialized element so foreignObject actually wraps text
  const elStyle = `width:${W}px;max-width:${W}px;box-sizing:border-box;overflow-wrap:break-word;word-break:break-word`

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${PW}" height="${PH}" viewBox="0 0 ${W} ${H}">`,
    `<defs><style>${fontFaceCSS()}</style></defs>`,
    `<foreignObject x="0" y="0" width="${W}" height="${H}">`,
    `<div xmlns="http://www.w3.org/1999/xhtml" style="padding-top:${BLEED_TOP}px;width:${W}px;max-width:${W}px;box-sizing:border-box;overflow-wrap:break-word;word-break:break-word">`,
    serializeEl(el, elStyle),
    `</div></foreignObject></svg>`,
  ].join("")

  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }))
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image(PW, PH); i.onload = () => res(i); i.onerror = rej; i.src = url
    })
    const bmp  = Object.assign(document.createElement("canvas"), { width: PW, height: PH })
    const bCtx = bmp.getContext("2d")!
    bCtx.drawImage(img, 0, 0, PW, PH)
    const { data } = bCtx.getImageData(0, 0, PW, PH)
    const pts: Pt[] = []
    for (let y = 0; y < PH; y += dpr)
      for (let x = 0; x < PW; x += dpr) {
        const i = (y * PW + x) * 4
        if (data[i + 3] > 40)
          pts.push({ hx: x / dpr, hy: y / dpr, cr: data[i], cg: data[i+1], cb: data[i+2] })
      }
    return pts.length > 200 ? { canvas: bmp, pts, offX: 0, offY: -BLEED_TOP } : null
  } catch { return null }
  finally { URL.revokeObjectURL(url) }
}

// Uses actual DOM Range positions per character — always correct for multi-line text
function captureViaCanvas(el: HTMLElement, dpr: number): Capture | null {
  const elr  = el.getBoundingClientRect()
  const W    = Math.ceil(elr.width)
  const H    = Math.ceil(elr.height) + BLEED_TOP
  const PW   = Math.ceil(W * dpr), PH = Math.ceil(H * dpr)

  const bmp = Object.assign(document.createElement("canvas"), { width: PW, height: PH })
  const ctx = bmp.getContext("2d")!
  ctx.scale(dpr, dpr)

  function drawNode(node: HTMLElement) {
    const cs = window.getComputedStyle(node)
    ;(ctx as unknown as { letterSpacing: string }).letterSpacing = cs.letterSpacing
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        const raw = child.textContent ?? ""
        if (!raw.trim()) continue
        ctx.font         = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
        ctx.fillStyle    = cs.color
        ctx.textBaseline = "top"
        // Per-character Range rects handle line-wrapping correctly
        for (let i = 0; i < raw.length; i++) {
          const ch = raw[i]
          if (ch === " " || ch === "\n" || ch === "\r" || ch === "\t") continue
          const r = document.createRange()
          r.setStart(child, i)
          r.setEnd(child, i + 1)
          const rect = r.getBoundingClientRect()
          if (rect.width < 0.5 || rect.height < 0.5) continue
          ctx.fillText(ch, rect.left - elr.left, rect.top - elr.top + BLEED_TOP)
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        if ((child as Element).tagName !== "CANVAS") drawNode(child as HTMLElement)
      }
    }
  }
  drawNode(el)

  const { data } = ctx.getImageData(0, 0, PW, PH)
  const pts: Pt[] = []
  for (let y = 0; y < PH; y += dpr)
    for (let x = 0; x < PW; x += dpr) {
      const i = (y * PW + x) * 4
      if (data[i + 3] > 40)
        pts.push({ hx: x / dpr, hy: y / dpr, cr: data[i], cg: data[i+1], cb: data[i+2] })
    }
  return pts.length > 200 ? { canvas: bmp, pts, offX: 0, offY: -BLEED_TOP } : null
}

// ─── Animation hook ───────────────────────────────────────────────────────────

function useParticleAnimation(
  headingRef: React.RefObject<HTMLElement | null>,
  canvasRef:  React.RefObject<HTMLCanvasElement | null>
) {
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const el     = headingRef.current; if (!el) return

    // Own visibility via JS so React never conflicts with our state
    canvas.style.visibility = "hidden"

    let bitmap: HTMLCanvasElement | null = null
    let particles: Particle[] = []
    let dpr       = 1
    let rafId: number | null = null
    let aborted   = false
    let rebuilding = false
    const mouse = { x: -9999, y: -9999, inside: false }

    async function rebuild() {
      if (rebuilding || aborted) return
      rebuilding = true
      try {
        const cv = canvasRef.current; if (!cv || aborted) return
        dpr = Math.min(window.devicePixelRatio || 1, 2)

        const heading = el as HTMLElement
        let cap: Capture | null = await captureViaSVG(heading, dpr)
        if (!cap) cap = captureViaCanvas(heading, dpr)
        if (aborted) { heading.style.visibility = ""; return }
        if (!cap)    { heading.style.visibility = ""; return }

        heading.style.visibility = "hidden"
        cv.style.visibility = "visible"

        const { canvas: bmp, pts, offX, offY } = cap
        bitmap = bmp

        const bmpCssW = bmp.width  / dpr
        const bmpCssH = bmp.height / dpr
        const cvCssW  = bmpCssW + SCATTER_PAD * 2
        const cvCssH  = bmpCssH + SCATTER_PAD * 2

        cv.width  = Math.round(cvCssW * dpr); cv.height = Math.round(cvCssH * dpr)
        cv.style.width  = cvCssW + "px"; cv.style.height = cvCssH + "px"
        cv.style.left   = (offX - SCATTER_PAD) + "px"
        cv.style.top    = (offY - SCATTER_PAD) + "px"

        const ctx = cv.getContext("2d")!
        ctx.scale(dpr, dpr)
        ctx.clearRect(0, 0, cvCssW, cvCssH)
        ctx.drawImage(bitmap, SCATTER_PAD, SCATTER_PAD, bmpCssW, bmpCssH)

        particles = pts
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.min(25_000, pts.length))
          .map(p => ({
            x: p.hx + SCATTER_PAD, y: p.hy + SCATTER_PAD,
            hx: p.hx + SCATTER_PAD, hy: p.hy + SCATTER_PAD,
            vx: 0, vy: 0, cr: p.cr, cg: p.cg, cb: p.cb,
          }))
      } finally { rebuilding = false }
    }

    function tick() {
      const cv = canvasRef.current; if (!cv || !bitmap) return
      const W = cv.width / dpr, H = cv.height / dpr
      const bmpCssW = bitmap.width / dpr, bmpCssH = bitmap.height / dpr
      const ctx = cv.getContext("2d")!

      for (const p of particles) {
        if (mouse.inside) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y
          const d2 = dx * dx + dy * dy
          if (d2 < REPEL_RADIUS * REPEL_RADIUS) {
            const d = Math.sqrt(d2) || 0.01
            const f = ((REPEL_RADIUS - d) / REPEL_RADIUS) * REPEL_STR
            p.vx += (dx / d) * f; p.vy += (dy / d) * f
          }
        }
        p.vx += (p.hx - p.x) * SPRING; p.vy += (p.hy - p.y) * SPRING
        p.vx *= DAMPING; p.vy *= DAMPING
        p.x  += p.vx;   p.y  += p.vy
      }

      ctx.clearRect(0, 0, W, H)
      ctx.globalCompositeOperation = "source-over"
      ctx.drawImage(bitmap, SCATTER_PAD, SCATTER_PAD, bmpCssW, bmpCssH)

      ctx.globalCompositeOperation = "destination-out"
      for (const p of particles)
        if (Math.hypot(p.x - p.hx, p.y - p.hy) > REST_DIST)
          ctx.clearRect(p.hx - 1, p.hy - 1, 3, 3)

      ctx.globalCompositeOperation = "lighter"
      let anyActive = false
      for (const p of particles) {
        const spd  = Math.hypot(p.vx, p.vy)
        const dist = Math.hypot(p.x - p.hx, p.y - p.hy)
        if (spd <= REST_SPD && dist <= REST_DIST) continue
        anyActive = true
        const t = Math.min(spd / 9, 1)
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.5 + t * 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${Math.round(100+t*132)},${Math.round(185+t*70)},${Math.round(10+t*48)},${0.5+t*0.5})`
        ctx.fill()
      }

      ctx.globalCompositeOperation = "source-over"
      if (!mouse.inside && !anyActive) {
        rafId = null
        ctx.clearRect(0, 0, W, H)
        ctx.drawImage(bitmap, SCATTER_PAD, SCATTER_PAD, bmpCssW, bmpCssH)
        return
      }
      rafId = requestAnimationFrame(tick)
    }

    function startLoop() { if (rafId === null) rafId = requestAnimationFrame(tick) }

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
      mouse.inside = mouse.x >= 0 && mouse.y >= 0 && mouse.x <= r.width && mouse.y <= r.height
      if (mouse.inside) startLoop()
    }

    window.addEventListener("mousemove", onMove, { passive: true })

    document.fonts.ready.then(rebuild)
    const ro = new ResizeObserver(rebuild)
    ro.observe(el)

    return () => {
      aborted = true
      if (rafId !== null) cancelAnimationFrame(rafId)
      el.style.visibility = ""
      ro.disconnect()
      window.removeEventListener("mousemove", onMove)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

// ─── Public component ─────────────────────────────────────────────────────────

type ParticleHeadingProps = {
  as?: "h1" | "h2" | "h3"
  className?: string
  children: ReactNode
} & Omit<HTMLAttributes<HTMLElement>, "className" | "children">

export function ParticleHeading({
  as = "h2",
  className,
  children,
  ...rest
}: ParticleHeadingProps) {
  const headingRef = useRef<HTMLElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)

  useParticleAnimation(headingRef, canvasRef)

  const Tag = as as ElementType

  return (
    <Tag
      ref={headingRef}
      className={className}
      style={{ position: "relative" }}
      {...rest}
    >
      {children}
      <canvas
        ref={canvasRef}
        className="absolute pointer-events-none"
        aria-hidden="true"
      />
    </Tag>
  )
}
