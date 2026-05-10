"use client"

import { useEffect, useRef } from "react"

export function useStageFocus(activeKey: string) {
  const containerRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const timeout = setTimeout(() => {
      containerRef.current?.focus({ preventScroll: true })
    }, 300)
    return () => clearTimeout(timeout)
  }, [activeKey])
  return containerRef
}
