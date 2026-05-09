"use client"

import { useGSAP, gsap } from "@/lib/gsap"
import { useAppReady } from "@/hooks/useAppReady"

export type AnimationInit = () => void | (() => void)

export interface AnimationSchedule {
  critical?: AnimationInit[]
  raf?: AnimationInit[]
  timeout?: (AnimationInit | { actions: AnimationInit[]; delay?: number })[]
}

export interface UseGSAPAnimationsOptions {
  delay?: number
  dependencies?: unknown[]
}

const isSchedule = (v: unknown): v is AnimationSchedule =>
  typeof v === "object" && v !== null && ("critical" in v || "raf" in v || "timeout" in v)

const runSchedule = (schedule: AnimationSchedule) => {
  const rafHandles: number[] = []
  const timeoutHandles: number[] = []
  const cleanupFns: (() => void)[] = []

  const runActions = (actions: AnimationInit[] = []) => {
    actions.forEach((action) => {
      const cleanup = action()
      if (typeof cleanup === "function") cleanupFns.push(cleanup)
    })
  }

  runActions(schedule.critical)

  schedule.raf?.forEach((action) => {
    rafHandles.push(requestAnimationFrame(() => runActions([action])))
  })

  const timeoutEntries = (schedule.timeout ?? []).map((entry) =>
    typeof entry === "function" ? { actions: [entry], delay: 0 } : entry
  )
  timeoutEntries.forEach((entry) => {
    timeoutHandles.push(
      window.setTimeout(() => runActions((entry as { actions: AnimationInit[]; delay?: number }).actions), (entry as { actions: AnimationInit[]; delay?: number }).delay ?? 0)
    )
  })

  return () => {
    rafHandles.forEach(cancelAnimationFrame)
    timeoutHandles.forEach(clearTimeout)
    cleanupFns.forEach((fn) => fn())
  }
}

export function useGSAPAnimations(
  init: (() => AnimationSchedule | void | (() => void)) | AnimationSchedule,
  options: UseGSAPAnimationsOptions = {}
) {
  const { delay = 0, dependencies = [] } = options
  const appReady = useAppReady()

  useGSAP(
    () => {
      if (!appReady) return

      const ctx = gsap.context(() => {
        const runAnimation = () => {
          const result = typeof init === "function" ? init() : init
          if (isSchedule(result)) return runSchedule(result)
          if (typeof result === "function") return result
        }

        const cleanupFns: (() => void)[] = []

        if (delay > 0) {
          const timer = window.setTimeout(() => {
            const cleanup = runAnimation()
            if (cleanup) cleanupFns.push(cleanup)
          }, delay)
          cleanupFns.push(() => clearTimeout(timer))
        } else {
          const cleanup = runAnimation()
          if (cleanup) cleanupFns.push(cleanup)
        }

        return () => cleanupFns.forEach((fn) => fn())
      })

      return () => ctx.revert()
    },
    [appReady, delay, ...dependencies] // eslint-disable-line react-hooks/exhaustive-deps
  )
}
