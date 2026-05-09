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
      className="back-to-top keyboard-focus-ring"
    >
      ↑
    </button>
  )
}
