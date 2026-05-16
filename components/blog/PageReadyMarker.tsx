"use client"

import { usePageReady } from "@/hooks/usePageReady"

export function PageReadyMarker() {
  usePageReady()
  return null
}
