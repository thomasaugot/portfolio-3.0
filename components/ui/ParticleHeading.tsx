"use client"

import { ElementType, HTMLAttributes, ReactNode, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

// ─── Physics / rendering constants ───────────────────────────────────────────
const SPRING       = 0.06
const DAMPING      = 0.80
const REPEL_RADIUS = 90
const REPEL_STR    = 9
const REST_SPD     = 0.25
const REST_DIST    = 1.0
const BLEED_TOP    = 24   // px above layout box to capture ascender ink overflow
const SCATTER_PAD  = 150  // transparent margin so scattered particles never clip
const BUCKETS      = 6    // speed levels: moving particles are drawn one path per level

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

// Every heading inlines the same @font-face rules into its SVG; walking all
// stylesheets once per capture (12 headings on the home page) was pure waste.
let fontCSSCache: string | null = null
function fontFaceCSS(): string {
  if (fontCSSCache !== null) return fontCSSCache
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
  fontCSSCache = rules.join("\n")
  return fontCSSCache
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
  canvasRef:  React.RefObject<HTMLCanvasElement | null>,
  pathname:   string,
) {
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const el     = headingRef.current; if (!el) return

    // Own visibility via JS so React never conflicts with our state
    canvas.style.visibility = "hidden"

    let bitmap: HTMLCanvasElement | null = null
    let shadowBitmap: HTMLCanvasElement | null = null
    let particles: Particle[] = []
    let dpr       = 1
    let rafId: number | null = null
    let aborted   = false
    let rebuilding = false
    const mouse = { x: -9999, y: -9999, inside: false }
    const buckets: Particle[][] = Array.from({ length: BUCKETS }, () => [])
    let inView = false
    let captured = false
    let lastW = 0, lastH = 0
    let resizeTimer: number | undefined
    // The lime offset shadow is a light-mode-only flourish — checked live so it
    // follows the current theme even if capture happened under a different one.
    const isLightNow = () => document.documentElement.getAttribute("data-theme") === "light"

    async function rebuild() {
      if (rebuilding || aborted) return
      rebuilding = true
      try {
        const cv = canvasRef.current; if (!cv || aborted) return
        dpr = Math.min(window.devicePixelRatio || 1, 2)

        const heading = el as HTMLElement
        lastW = heading.offsetWidth; lastH = heading.offsetHeight
        captured = true
        let cap: Capture | null = await captureViaSVG(heading, dpr)
        if (!cap) cap = captureViaCanvas(heading, dpr)
        if (aborted) { heading.style.visibility = ""; return }
        if (!cap)    { heading.style.visibility = ""; return }

        heading.style.visibility = "hidden"
        cv.style.visibility = "visible"

        const { canvas: bmp, pts, offX, offY } = cap
        bitmap = bmp

        // ALWAYS build the shadow bitmap (lime pixels tinted dark). Whether it's
        // actually drawn is decided per-frame by the live theme — so it survives
        // navigation/theme changes regardless of what the theme was at capture.
        {
          const sbmp = document.createElement("canvas")
          sbmp.width = bmp.width; sbmp.height = bmp.height
          const sctx = sbmp.getContext("2d")!
          const src = bmp.getContext("2d")!.getImageData(0, 0, bmp.width, bmp.height)
          const out = sctx.createImageData(bmp.width, bmp.height)
          // lime is roughly r≥180, g≥220, b≤120
          for (let i = 0; i < src.data.length; i += 4) {
            const r = src.data[i], g = src.data[i+1], b = src.data[i+2], a = src.data[i+3]
            if (a > 40 && r >= 170 && g >= 210 && b <= 130 && g > r && g > b) {
              out.data[i] = 26; out.data[i+1] = 26; out.data[i+2] = 23; out.data[i+3] = a
            }
          }
          sctx.putImageData(out, 0, 0)
          shadowBitmap = sbmp
        }

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
        if (shadowBitmap && isLightNow()) {
          ctx.drawImage(shadowBitmap, SCATTER_PAD + 4, SCATTER_PAD + 4, bmpCssW, bmpCssH)
          // Outline: draw shadow bitmap offset in 4 directions to stroke around lime letters
          ctx.drawImage(shadowBitmap, SCATTER_PAD - 1.5, SCATTER_PAD, bmpCssW, bmpCssH)
          ctx.drawImage(shadowBitmap, SCATTER_PAD + 1.5, SCATTER_PAD, bmpCssW, bmpCssH)
          ctx.drawImage(shadowBitmap, SCATTER_PAD, SCATTER_PAD - 1.5, bmpCssW, bmpCssH)
          ctx.drawImage(shadowBitmap, SCATTER_PAD, SCATTER_PAD + 1.5, bmpCssW, bmpCssH)
        }
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
      if (shadowBitmap && isLightNow()) {
        ctx.drawImage(shadowBitmap, SCATTER_PAD + 4, SCATTER_PAD + 4, bmpCssW, bmpCssH)
        ctx.drawImage(shadowBitmap, SCATTER_PAD - 1.5, SCATTER_PAD, bmpCssW, bmpCssH)
        ctx.drawImage(shadowBitmap, SCATTER_PAD + 1.5, SCATTER_PAD, bmpCssW, bmpCssH)
        ctx.drawImage(shadowBitmap, SCATTER_PAD, SCATTER_PAD - 1.5, bmpCssW, bmpCssH)
        ctx.drawImage(shadowBitmap, SCATTER_PAD, SCATTER_PAD + 1.5, bmpCssW, bmpCssH)
      }
      ctx.drawImage(bitmap, SCATTER_PAD, SCATTER_PAD, bmpCssW, bmpCssH)

      // One pass sorts moving particles into speed buckets; each bucket is then
      // filled as a single path. Thousands of beginPath/fill calls with a fresh
      // fillStyle string per particle were what made the hover stutter.
      for (const b of buckets) b.length = 0
      ctx.globalCompositeOperation = "destination-out"
      ctx.beginPath()
      let anyActive = false
      for (const p of particles) {
        const dx = p.x - p.hx, dy = p.y - p.hy
        const dist2 = dx * dx + dy * dy
        const spd2  = p.vx * p.vx + p.vy * p.vy
        if (dist2 > REST_DIST * REST_DIST) ctx.rect(p.hx - 1, p.hy - 1, 3, 3)
        if (spd2 <= REST_SPD * REST_SPD && dist2 <= REST_DIST * REST_DIST) continue
        anyActive = true
        const t = Math.min(Math.sqrt(spd2) / 9, 1)
        buckets[Math.min(BUCKETS - 1, Math.floor(t * BUCKETS))].push(p)
      }
      ctx.fill()

      ctx.globalCompositeOperation = "lighter"
      const isLight = isLightNow()
      for (let b = 0; b < BUCKETS; b++) {
        const list = buckets[b]
        if (!list.length) continue
        const t = (b + 0.5) / BUCKETS
        const r = 1.5 + t * 2
        ctx.fillStyle = isLight
          ? `rgba(${Math.round(26+t*10)},${Math.round(26+t*10)},${Math.round(23+t*10)},${0.5+t*0.5})`
          : `rgba(${Math.round(100+t*132)},${Math.round(185+t*70)},${Math.round(10+t*48)},${0.5+t*0.5})`
        ctx.beginPath()
        for (const p of list) {
          ctx.moveTo(p.x + r, p.y)
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
        }
        ctx.fill()
      }

      ctx.globalCompositeOperation = "source-over"
      if (!mouse.inside && !anyActive) {
        rafId = null
        ctx.clearRect(0, 0, W, H)
        if (shadowBitmap && isLightNow()) {
          ctx.drawImage(shadowBitmap, SCATTER_PAD + 4, SCATTER_PAD + 4, bmpCssW, bmpCssH)
          ctx.drawImage(shadowBitmap, SCATTER_PAD - 1.5, SCATTER_PAD, bmpCssW, bmpCssH)
          ctx.drawImage(shadowBitmap, SCATTER_PAD + 1.5, SCATTER_PAD, bmpCssW, bmpCssH)
          ctx.drawImage(shadowBitmap, SCATTER_PAD, SCATTER_PAD - 1.5, bmpCssW, bmpCssH)
          ctx.drawImage(shadowBitmap, SCATTER_PAD, SCATTER_PAD + 1.5, bmpCssW, bmpCssH)
        }
        ctx.drawImage(bitmap, SCATTER_PAD, SCATTER_PAD, bmpCssW, bmpCssH)
        return
      }
      rafId = requestAnimationFrame(tick)
    }

    function startLoop() { if (rafId === null) rafId = requestAnimationFrame(tick) }

    const onMove = (e: MouseEvent) => {
      if (!inView || !bitmap) return
      const r = canvas.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
      mouse.inside = mouse.x >= 0 && mouse.y >= 0 && mouse.x <= r.width && mouse.y <= r.height
      if (mouse.inside) startLoop()
    }

    window.addEventListener("mousemove", onMove, { passive: true })

    // Capture after the next paint so data-theme + layout are settled. On soft
    // navigation back, document.fonts.ready is already resolved and fires before
    // the theme attribute is applied — without this the light-mode shadow bitmap
    // (which only builds when data-theme==="light") would be skipped.
    // Capture lazily: only once the heading comes near the viewport, and only
    // after fonts have settled. Capturing every heading on load blocked the
    // main thread for the first seconds of the page.
    const kick = () => requestAnimationFrame(() => requestAnimationFrame(rebuild))
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      if (inView && !captured) document.fonts.ready.then(kick)
      if (!inView && mouse.inside) { mouse.inside = false; startLoop() }
    }, { rootMargin: "300px 0px" })
    io.observe(el)

    const ro = new ResizeObserver(() => {
      if (!captured) return
      if (el.offsetWidth === lastW && el.offsetHeight === lastH) return
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(rebuild, 150)
    })
    ro.observe(el)

    // Re-capture when the theme flips so the offset shadow is rebuilt correctly.
    const themeObserver = new MutationObserver(() => { if (captured) rebuild() })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })

    return () => {
      aborted = true
      if (rafId !== null) cancelAnimationFrame(rafId)
      el.style.visibility = ""
      window.clearTimeout(resizeTimer)
      io.disconnect()
      ro.disconnect()
      themeObserver.disconnect()
      window.removeEventListener("mousemove", onMove)
    }
  // Re-run on navigation so the canvas (and the light-mode offset shadow, which
  // is baked at capture time) is rebuilt fresh on every page — soft navigation
  // otherwise leaves a stale/empty capture.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])
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
  const pathname   = usePathname()

  useParticleAnimation(headingRef, canvasRef, pathname)

  const Tag = as as ElementType

  return (
    <Tag
      ref={headingRef}
      className={`relative ${className ?? ""}`}
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
