"use client"

import { useAppReadyContext } from "@/contexts/AppReadyContext"

export function useMarkReady(): () => void {
  return useAppReadyContext().markReady
}
