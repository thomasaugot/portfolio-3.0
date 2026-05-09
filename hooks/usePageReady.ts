"use client"

import { useEffect } from "react"
import { useMarkReady } from "@/hooks/useMarkReady"

export function usePageReady() {
  const markReady = useMarkReady()

  useEffect(() => {
    let cancelled = false
    const minDelay = new Promise<void>((r) => setTimeout(r, 600))

    Promise.all([document.fonts.ready, minDelay])
      .then(() => { if (!cancelled) markReady() })
      .catch(() => { if (!cancelled) markReady() })

    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
