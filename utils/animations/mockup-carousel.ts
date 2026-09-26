"use client"

import { gsap } from "@/lib/gsap"

function q<T extends HTMLElement = HTMLElement>(root: HTMLElement, name: string) {
  return root.querySelector<T>(`[data-anim="${name}"]`)
}

/**
 * Screen swap inside a device mockup: the incoming shot wipes in top-to-bottom
 * behind a scan line while the outgoing one sinks and fades. The phone overlay
 * (if any) lags the laptop by a beat so the two screens don't move as one slab.
 */
export function swapMockupScreens(root: HTMLElement, reduced: boolean): Promise<void> {
  const incoming = q(root, "mockup-layer-in")
  const outgoing = q(root, "mockup-layer-out")
  const scan = q(root, "mockup-scan")
  if (!incoming) return Promise.resolve()

  return new Promise((resolve) => {
    if (reduced) {
      gsap.timeline({ onComplete: resolve })
        .fromTo(incoming, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "none" })
        .to(outgoing, { autoAlpha: 0, duration: 0.3, ease: "none" }, 0)
      return
    }

    const phoneIn = incoming.querySelector<HTMLElement>("[data-mockup-phone]")
    const D = 0.95
    const tl = gsap.timeline({ defaults: { ease: "power3.inOut" }, onComplete: resolve })

    gsap.set(incoming, { clipPath: "inset(0 0 100% 0)", autoAlpha: 1 })
    if (phoneIn) gsap.set(phoneIn, { y: 18 })
    if (scan) gsap.set(scan, { autoAlpha: 1, top: "0%" })

    tl.to(incoming, { clipPath: "inset(0 0 0% 0)", duration: D }, 0)
    if (scan) {
      tl.to(scan, { top: "100%", duration: D }, 0)
        .to(scan, { autoAlpha: 0, duration: 0.25, ease: "power1.out" }, D - 0.2)
    }
    if (outgoing) tl.to(outgoing, { scale: 0.965, y: 14, autoAlpha: 0, duration: D, ease: "power2.inOut" }, 0)
    if (phoneIn) tl.to(phoneIn, { y: 0, duration: 0.7, ease: "power3.out" }, 0.25)
  })
}

/** Slow breathing float on the whole device, plus a subtle 3D tilt toward the cursor. */
export function initMockupFloat(root: HTMLElement, reduced: boolean): () => void {
  const el = q(root, "mockup-float")
  if (!el || reduced) return () => {}

  const float = gsap.to(el, { y: -7, duration: 3.4, yoyo: true, repeat: -1, ease: "sine.inOut" })
  gsap.set(el, { transformPerspective: 1400 })

  const onMove = (e: MouseEvent) => {
    const r = root.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    gsap.to(el, { rotateY: px * 6, rotateX: -py * 5, duration: 0.8, ease: "power2.out", overwrite: "auto" })
  }
  const onLeave = () => gsap.to(el, { rotateY: 0, rotateX: 0, duration: 1, ease: "power3.out", overwrite: "auto" })
  root.addEventListener("mousemove", onMove, { passive: true })
  root.addEventListener("mouseleave", onLeave)

  return () => {
    float.kill()
    root.removeEventListener("mousemove", onMove)
    root.removeEventListener("mouseleave", onLeave)
    gsap.killTweensOf(el)
    gsap.set(el, { clearProps: "transform" })
  }
}
