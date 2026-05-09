"use client"

import { useTransitionContext } from "@/contexts/TransitionContext"

export function usePageTransition() {
  const { navigateTo, isTransitioning } = useTransitionContext()
  return { startTransition: navigateTo, isTransitioning }
}
