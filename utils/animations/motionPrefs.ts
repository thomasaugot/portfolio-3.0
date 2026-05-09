"use client"

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function motionDuration(base: number): number {
  return prefersReducedMotion() ? 0 : base
}

export function motionDelay(base: number): number {
  return prefersReducedMotion() ? 0 : base
}
