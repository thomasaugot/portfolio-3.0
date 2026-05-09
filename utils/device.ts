"use client"

export function isDesktop(): boolean {
  if (typeof window === "undefined") return false
  return window.innerWidth >= 1280
}

export function isMobile(): boolean {
  if (typeof window === "undefined") return false
  return window.innerWidth < 768
}
