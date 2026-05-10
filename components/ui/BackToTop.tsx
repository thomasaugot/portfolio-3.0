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
      className="fixed bottom-8 right-8 z-toast w-11 h-11 border border-border-2 bg-surface text-text-muted font-mono text-[16px] flex items-center justify-center cursor-pointer transition-[border-color,color] hover:border-primary hover:text-primary keyboard-focus-ring"
    >
      <span aria-hidden="true">↑</span>
    </button>
  )
}
