"use client"

import { gsap } from "@/lib/gsap"
import { motionDuration, prefersReducedMotion } from "@/utils/animations/motionPrefs"

const EXIT_SCALE  = 0.96
const ENTER_SCALE = 1.04
const BLUR_PX     = 12

export function exitPage(el: HTMLElement): Promise<void> {
  gsap.killTweensOf(el)
  if (prefersReducedMotion()) {
    el.style.opacity = "0"
    return Promise.resolve()
  }
  return new Promise((resolve) => {
    gsap.to(el, {
      opacity: 0,
      scale: EXIT_SCALE,
      filter: `blur(${BLUR_PX}px)`,
      duration: motionDuration(0.5),
      ease: "power3.inOut",
      transformOrigin: "center center",
      force3D: true,
      onComplete: resolve,
    })
  })
}

export function enterPage(el: HTMLElement): Promise<void> {
  gsap.killTweensOf(el)
  if (prefersReducedMotion()) {
    el.style.opacity = "1"
    el.style.transform = "none"
    el.style.filter = "none"
    return Promise.resolve()
  }
  return new Promise((resolve) => {
    gsap.fromTo(
      el,
      { opacity: 0, scale: ENTER_SCALE, filter: `blur(${BLUR_PX}px)` },
      {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        duration: motionDuration(0.6),
        ease: "power3.out",
        force3D: true,
        transformOrigin: "center center",
        onComplete: () => {
          // Clear filter entirely so the page isn't stuck on a GPU layer
          // (a 0px blur still composites). Same for transform.
          el.style.filter = ""
          el.style.transform = ""
          resolve()
        },
      }
    )
  })
}
