"use client"

import { useEffect, type RefObject } from "react"
import { gsap } from "@/lib/gsap"
import { prefersReducedMotion } from "@/utils/animations/motionPrefs"

/**
 * Cursor-driven hero effects, all lerped in one GSAP ticker:
 *  • grid + glow spotlight follow the cursor
 *  • the terminal card tilts in 3D toward the cursor
 *  • [data-magnetic] elements pull toward a nearby cursor
 */
export function useHeroInteractions(sectionRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const section = sectionRef.current
    if (!section || prefersReducedMotion()) return
    if (window.matchMedia("(pointer: coarse)").matches) return

    const grid    = section.querySelector<HTMLElement>("[data-anim='hero-grid']")
    const glow    = section.querySelector<HTMLElement>("[data-anim='hero-glow']")
    const tilt    = section.querySelector<HTMLElement>("[data-tilt]")
    const magnets = Array.from(section.querySelectorAll<HTMLElement>("[data-magnetic]"))

    const target = { x: 0.5, y: 0.4, rx: 0, ry: 0, inside: false }
    const cur    = { x: 0.5, y: 0.4, rx: 0, ry: 0 }
    const mag    = magnets.map(() => ({ tx: 0, ty: 0, x: 0, y: 0 }))
    let rect = section.getBoundingClientRect()

    const onMove = (e: MouseEvent) => {
      rect = section.getBoundingClientRect()
      target.x = (e.clientX - rect.left) / rect.width
      target.y = (e.clientY - rect.top) / rect.height
      target.inside = true

      if (tilt) {
        const r = tilt.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width - 0.5
        const py = (e.clientY - r.top) / r.height - 0.5
        const over = px > -0.7 && px < 0.7 && py > -0.7 && py < 0.7
        target.ry = over ? px * 7 : 0
        target.rx = over ? -py * 7 : 0
      }

      magnets.forEach((el, i) => {
        const r = el.getBoundingClientRect()
        const dx = e.clientX - (r.left + r.width / 2)
        const dy = e.clientY - (r.top + r.height / 2)
        const d = Math.hypot(dx, dy)
        const reach = Math.max(r.width, r.height) * 0.9
        const pull = d < reach ? 0.35 * (1 - d / reach) + 0.15 : 0
        mag[i].tx = dx * pull
        mag[i].ty = dy * pull
      })
    }
    const onLeave = () => {
      target.inside = false
      target.rx = target.ry = 0
      mag.forEach((m) => { m.tx = m.ty = 0 })
    }

    const tick = () => {
      const k = 0.08
      cur.x += (target.x - cur.x) * k
      cur.y += (target.y - cur.y) * k
      cur.rx += (target.rx - cur.rx) * k
      cur.ry += (target.ry - cur.ry) * k
      if (grid) {
        grid.style.setProperty("--mx", `${(cur.x * 100).toFixed(2)}%`)
        grid.style.setProperty("--my", `${(cur.y * 100).toFixed(2)}%`)
      }
      if (glow) {
        glow.style.transform = `translate3d(${(cur.x * rect.width).toFixed(1)}px, ${(cur.y * rect.height).toFixed(1)}px, 0)`
        glow.style.opacity = target.inside ? "1" : "0.5"
      }
      if (tilt) tilt.style.transform = `perspective(1200px) rotateX(${cur.rx.toFixed(2)}deg) rotateY(${cur.ry.toFixed(2)}deg)`
      magnets.forEach((el, i) => {
        const m = mag[i]
        m.x += (m.tx - m.x) * 0.12
        m.y += (m.ty - m.y) * 0.12
        el.style.transform = `translate3d(${m.x.toFixed(1)}px, ${m.y.toFixed(1)}px, 0)`
      })
    }

    section.addEventListener("mousemove", onMove, { passive: true })
    section.addEventListener("mouseleave", onLeave)
    gsap.ticker.add(tick)
    return () => {
      section.removeEventListener("mousemove", onMove)
      section.removeEventListener("mouseleave", onLeave)
      gsap.ticker.remove(tick)
      if (tilt) tilt.style.transform = ""
      magnets.forEach((el) => { el.style.transform = "" })
    }
  }, [sectionRef])
}
