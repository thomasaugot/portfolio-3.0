"use client"

import { useMotionPreferenceContext } from "@/contexts/MotionPreferenceContext"

export function useMotionPreference() {
  return useMotionPreferenceContext()
}
