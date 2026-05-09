"use client"

import { gsap } from "@/lib/gsap"

export async function exitPage(el: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    gsap.to(el, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: resolve,
    })
  })
}

export function enterPage(el: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    gsap.fromTo(
      el,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.5,
        ease: "power3.out",
        onComplete: resolve,
      }
    )
  })
}
