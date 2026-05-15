"use client"

import { gsap } from "@/lib/gsap"
import { motionDuration, prefersReducedMotion } from "@/utils/animations/motionPrefs"

export function exitPage(el: HTMLElement): Promise<void> {
  gsap.killTweensOf(el)
  if (prefersReducedMotion()) {
    el.style.opacity = "0"
    return Promise.resolve()
  }
  return new Promise((resolve) => {
    gsap.to(el, {
      opacity: 0,
      y: -8,
      duration: motionDuration(0.28),
      ease: "power2.in",
      onComplete: resolve,
    })
  })
}

export function enterPage(el: HTMLElement): Promise<void> {
  gsap.killTweensOf(el)
  if (prefersReducedMotion()) {
    el.style.opacity = "1"
    el.style.transform = "none"
    return Promise.resolve()
  }
  return new Promise((resolve) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 10 },
      {
        opacity: 1,
        y: 0,
        duration: motionDuration(0.4),
        ease: "power2.out",
        onComplete: resolve,
      }
    )
  })
}
