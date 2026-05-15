"use client"

import { useEffect, useState } from "react"

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.5)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" })

  if (!visible) return null

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className="fixed bottom-8 right-8 z-30 w-14 h-14 border-2 border-primary bg-primary text-black font-mono text-[24px] font-semibold flex items-center justify-center cursor-pointer shadow-[0_4px_20px_rgba(212,255,58,0.35)] transition-[transform,background,border-color] duration-300 hover:bg-text hover:border-text hover:scale-105 keyboard-focus-ring"
    >
      <span aria-hidden="true">↑</span>
    </button>
  )
}
