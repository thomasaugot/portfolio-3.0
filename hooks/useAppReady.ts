"use client"

import { useAppReadyContext } from "@/contexts/AppReadyContext"

export function useAppReady(): boolean {
  return useAppReadyContext().appReady
}
