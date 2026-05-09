"use client"

import { usePageReady } from "@/hooks/usePageReady"
import type { ReactNode } from "react"

export function WorkPageClient({ children }: { children: ReactNode }) {
  usePageReady()
  return <>{children}</>
}
