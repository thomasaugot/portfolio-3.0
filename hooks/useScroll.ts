"use client"

import { useScrollContext } from "@/contexts/ScrollContext"

export function useScroll() {
  return useScrollContext()
}
