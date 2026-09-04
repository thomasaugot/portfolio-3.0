"use client"

import {
  useCallback,
  useEffect,
  useRef,
  type MouseEvent as ReactMouseEvent,
  type RefObject,
} from "react"
import type * as MatterNS from "matter-js"

/**
 * Footer "ball pit" — a Matter.js world overlaid on the footer.
 *
 *  • Move the cursor quickly → it sheds little balls that fall and bounce.
 *  • Move the cursor slowly  → nearby balls get gently pushed away.
 *  • Click (or press Space)  → a burst of 20 balls explodes from the cursor.
 *
 * matter-js is imported lazily so it never lands in the initial bundle, and the
 * simulation only ticks while the footer is on screen.
 */

type Matter = typeof MatterNS
type Body = MatterNS.Body

type Tone = "primary" | "ink"
interface Ball { tone: Tone; hollow: boolean; radius: number }

interface World {
  M: Matter
  engine: MatterNS.Engine
  render: MatterNS.Render
  runner: MatterNS.Runner
  walls: Body[]
  balls: Body[]
  afterRender: () => void
}

const DRAW_RADIUS = 7
const BODY_RADIUS = 10
const MAX_BALLS = 500
const SPAWN_MIN_SPEED = 400   // px/s the cursor must travel before it sheds a ball
const SPAWN_MIN_GAP = 220     // px between two consecutive shed balls
const BURST_COUNT = 20
const MAX_SPEED = 14
const INTERACTIVE = "a,button,input,textarea,select,[contenteditable],[role='button']"

function readPalette(): Record<Tone, string> {
  const s = getComputedStyle(document.documentElement)
  return {
    primary: s.getPropertyValue("--color-primary").trim() || "#d4ff3a",
    ink:     s.getPropertyValue("--color-text-muted").trim() || "#a3a097",
  }
}

function pixelRatio() {
  return Math.min(window.devicePixelRatio || 1, 2)
}

function sizeCanvas(canvas: HTMLCanvasElement, w: number, h: number) {
  const pr = pixelRatio()
  canvas.width = Math.round(w * pr)
  canvas.height = Math.round(h * pr)
  canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`
  return pr
}

function makeWalls(M: Matter, w: number, h: number): Body[] {
  const opts = { isStatic: true, render: { visible: false }, friction: 0.02, restitution: 0.95 }
  return [
    M.Bodies.rectangle(w / 2, h + 20, w + 80, 40, opts), // floor
    M.Bodies.rectangle(-20, h / 2, 40, h + 80, opts),     // left
    M.Bodies.rectangle(w + 20, h / 2, 40, h + 80, opts),  // right
    M.Bodies.rectangle(w / 2, -20, w + 80, 40, opts),     // ceiling
  ]
}

function ballOf(body: Body): Ball | null {
  return (body.plugin as { ball?: Ball } | undefined)?.ball ?? null
}

function fadeIn(body: Body) {
  body.render.opacity = 0
  const start = performance.now()
  const step = (now: number) => {
    const t = Math.min((now - start) / 280, 1)
    body.render.opacity = 1 - (1 - t) ** 3
    if (t < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

export function useFooterPhysics(containerRef: RefObject<HTMLElement | null>, enabled: boolean) {
  const canvasRef   = useRef<HTMLCanvasElement | null>(null)
  const world       = useRef<World | null>(null)
  const palette     = useRef<Record<Tone, string>>({ primary: "#d4ff3a", ink: "#a3a097" })
  const lastMove    = useRef<{ x: number; y: number; t: number } | null>(null)
  const lastSpawn   = useRef<{ x: number; y: number } | null>(null)
  const lastPointer = useRef<{ x: number; y: number } | null>(null)

  const toLocal = useCallback((clientX: number, clientY: number) => {
    const el = containerRef.current
    if (!el) return null
    const r = el.getBoundingClientRect()
    if (clientX < r.left || clientX > r.right || clientY < r.top || clientY > r.bottom) return null
    return { x: clientX - r.left, y: clientY - r.top }
  }, [containerRef])

  const spawn = useCallback((x: number, y: number, vx: number, vy: number) => {
    const w = world.current
    if (!w) return
    const { M } = w
    const ball: Ball = {
      tone: Math.random() < 0.7 ? "primary" : "ink",
      hollow: Math.random() < 0.3,
      radius: DRAW_RADIUS,
    }
    const body = M.Bodies.circle(x, y, BODY_RADIUS, {
      restitution: 0.95,
      friction: 0.02,
      frictionAir: 0.005,
      render: { visible: false },
      plugin: { ball },
    })
    M.Body.setVelocity(body, { x: vx, y: vy })
    M.Composite.add(w.engine.world, body)
    fadeIn(body)
    w.balls.push(body)
    if (w.balls.length > MAX_BALLS) {
      const old = w.balls.splice(0, w.balls.length - MAX_BALLS)
      M.Composite.remove(w.engine.world, old)
    }
  }, [])

  const push = useCallback((x: number, y: number, radius: number, force: number, spin = false) => {
    const w = world.current
    if (!w) return
    const { M } = w
    for (const b of w.balls) {
      const dx = b.position.x - x
      const dy = b.position.y - y
      const d = Math.hypot(dx, dy)
      if (d >= radius || d <= 0) continue
      const f = force * (1 - d / radius)
      const a = Math.atan2(dy, dx)
      M.Body.applyForce(b, b.position, { x: Math.cos(a) * f, y: Math.sin(a) * f })
      if (!spin) continue
      M.Body.setAngularVelocity(b, b.angularVelocity + (Math.random() - 0.5) * 0.2)
      const { x: vx, y: vy } = b.velocity
      const s = Math.hypot(vx, vy)
      if (s > MAX_SPEED) {
        const k = MAX_SPEED / s
        M.Body.setVelocity(b, { x: vx * k, y: vy * k })
      }
    }
  }, [])

  const burst = useCallback((x: number, y: number) => {
    if (!world.current) return
    for (let i = 0; i < BURST_COUNT; i++) {
      const a = (Math.PI * 2 * i) / BURST_COUNT + (Math.random() - 0.5) * 0.25
      const s = 7 * (0.65 + 0.7 * Math.random())
      spawn(x, y, Math.cos(a) * s, Math.sin(a) * s)
    }
    push(x, y, 300, 0.02, true)
  }, [spawn, push])

  /* ── Engine lifecycle ─────────────────────────────────────────── */
  useEffect(() => {
    if (!enabled) return
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    let cancelled = false
    let running = false
    let inView = false
    palette.current = readPalette()

    const themeObs = new MutationObserver(() => { palette.current = readPalette() })
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })

    const setRunning = (on: boolean) => {
      const w = world.current
      if (!w || on === running) return
      running = on
      if (on) {
        w.M.Runner.run(w.runner, w.engine)
        w.M.Render.run(w.render)
      } else {
        w.M.Runner.stop(w.runner)
        w.M.Render.stop(w.render)
      }
    }

    const build = (M: Matter) => {
      const { width, height } = container.getBoundingClientRect()
      if (width <= 0 || height <= 0) return
      const pr = sizeCanvas(canvas, width, height)

      const engine = M.Engine.create()
      engine.gravity.y = 0.9

      const render = M.Render.create({
        canvas,
        engine,
        options: { width, height, background: "transparent", wireframes: false, pixelRatio: pr },
      })

      const walls = makeWalls(M, width, height)
      M.Composite.add(engine.world, walls)

      const afterRender = () => {
        const ctx = render.context
        for (const body of M.Composite.allBodies(engine.world)) {
          const ball = ballOf(body)
          if (!ball) continue
          const alpha = body.render.opacity ?? 1
          if (alpha <= 0) continue
          ctx.save()
          ctx.globalAlpha = alpha
          ctx.translate(body.position.x, body.position.y)
          ctx.beginPath()
          ctx.arc(0, 0, ball.radius, 0, Math.PI * 2)
          if (ball.hollow) {
            ctx.lineWidth = 2
            ctx.strokeStyle = palette.current[ball.tone]
            ctx.stroke()
          } else {
            ctx.fillStyle = palette.current[ball.tone]
            ctx.fill()
          }
          ctx.restore()
        }
        ctx.globalAlpha = 1
      }
      M.Events.on(render, "afterRender", afterRender)

      const runner = M.Runner.create()
      world.current = { M, engine, render, runner, walls, balls: [], afterRender }
      if (inView) setRunning(true)
    }

    const resize = () => {
      const w = world.current
      if (!w) return
      const { width, height } = container.getBoundingClientRect()
      if (width <= 0 || height <= 0) return
      w.render.options.width = width
      w.render.options.height = height
      w.M.Render.setPixelRatio(w.render, pixelRatio())
      w.M.Composite.remove(w.engine.world, w.walls)
      w.walls = makeWalls(w.M, width, height)
      w.M.Composite.add(w.engine.world, w.walls)
    }

    const ro = new ResizeObserver(() => { if (world.current) resize() })
    ro.observe(container)

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      setRunning(inView)
    })
    io.observe(container)

    import("matter-js")
      .then((mod) => {
        if (cancelled) return
        const M = ((mod as { default?: Matter }).default ?? mod) as Matter
        build(M)
      })
      .catch(() => { /* physics is decorative — fail silently */ })

    return () => {
      cancelled = true
      ro.disconnect()
      io.disconnect()
      themeObs.disconnect()
      const w = world.current
      if (w) {
        w.M.Runner.stop(w.runner)
        w.M.Render.stop(w.render)
        w.M.Events.off(w.render, "afterRender", w.afterRender)
        w.M.Engine.clear(w.engine)
      }
      world.current = null
      running = false
      canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [enabled, containerRef])

  /* ── Space bar = burst at the last pointer position ────────────── */
  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat) return
      // Never hijack Space from a focused link/button/input.
      if (e.target instanceof Element && e.target.closest(INTERACTIVE)) return
      const p = lastPointer.current
      if (!p) return
      const local = toLocal(p.x, p.y)
      if (!local) return
      e.preventDefault()
      burst(local.x, local.y)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [enabled, toLocal, burst])

  /* ── Pointer handlers (attach to the footer element) ───────────── */
  const onMouseMove = useCallback((e: ReactMouseEvent<HTMLElement>) => {
    if (!world.current) return
    const { clientX: x, clientY: y } = e
    const now = performance.now()
    lastPointer.current = { x, y }

    const local = toLocal(x, y)
    if (local) push(local.x, local.y, 150, 0.004)

    const prev = lastMove.current
    lastMove.current = { x, y, t: now }
    if (!prev || !local) return

    const dt = now - prev.t
    if (dt <= 0) return
    const dx = x - prev.x
    const dy = y - prev.y
    const speed = (Math.hypot(dx, dy) / dt) * 1000
    if (speed < SPAWN_MIN_SPEED) return

    const ls = lastSpawn.current
    if (ls && Math.hypot(x - ls.x, y - ls.y) < SPAWN_MIN_GAP) return

    const k = Math.min(speed / 900, 1) ** 2
    spawn(local.x, local.y, 0.03 * dx * k, 0.03 * dy * k)
    lastSpawn.current = { x, y }
  }, [toLocal, push, spawn])

  const onMouseLeave = useCallback(() => {
    lastMove.current = null
    lastSpawn.current = null
    lastPointer.current = null
  }, [])

  const onClick = useCallback((e: ReactMouseEvent<HTMLElement>) => {
    if (!world.current) return
    const local = toLocal(e.clientX, e.clientY)
    if (local) burst(local.x, local.y)
  }, [toLocal, burst])

  return { canvasRef, onMouseMove, onMouseLeave, onClick }
}

export function FooterPhysicsCanvas({ canvasRef }: { canvasRef: RefObject<HTMLCanvasElement | null> }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}
