"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { WebMockup, MobileMockup } from "@/components/ui/ProjectMockup"
import { useMotionPreference } from "@/hooks/useMotionPreference"
import { swapMockupScreens, initMockupFloat } from "@/utils/animations/mockup-carousel"
import type { Project } from "@/types/project"

interface Props {
  project: Project
  index: number
  priority?: boolean
  className?: string
}

interface Layer { key: number; idx: number; role: "in" | "out" | "current" }

function Screen({ project, idx, priority }: { project: Project; idx: number; priority?: boolean }) {
  const { gallery } = project
  const desktop = gallery.desktop[idx] ?? project.cover
  const mobile = gallery.mobile[idx] ?? project.mobileCover ?? project.cover
  const mobile2 = gallery.mobile[(idx + 1) % Math.max(gallery.mobile.length, 1)] ?? project.cover2
  if (project.kind === "mobile") {
    return <MobileMockup mobile={mobile} mobile2={project.cover2 ? mobile2 : undefined} priority={priority} containerClassName="relative w-full h-full flex items-center justify-center px-8" />
  }
  return (
    <WebMockup
      desktop={desktop}
      mobile={project.mobileCover ? mobile : undefined}
      domain={project.domain}
      priority={priority}
      containerClassName="relative w-full h-full flex items-center justify-center px-6"
      mobileOverlayClassName="absolute right-2 -bottom-2 w-[24%] sm:right-4 sm:bottom-6 sm:w-[20%] z-[2]"
    />
  )
}

/**
 * Device mockup whose screenshots swap with a scan-line wipe when `index` changes.
 * Keeps at most two layers mounted (outgoing + incoming) during a transition.
 */
export function MockupCarousel({ project, index, priority = false, className = "" }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const { preference } = useMotionPreference()
  const reduced = preference === "reduced"
  const keyRef = useRef(1)
  const [layers, setLayers] = useState<Layer[]>([{ key: 0, idx: index, role: "current" }])
  const shownIdx = layers[layers.length - 1]?.idx

  // Index changed: stack the new screen on top and let the animation retire the old one.
  useLayoutEffect(() => {
    if (index === shownIdx) return
    setLayers((prev) => {
      const last = prev[prev.length - 1]
      return [{ ...last, role: "out" }, { key: keyRef.current++, idx: index, role: "in" }]
    })
  }, [index, shownIdx])

  useEffect(() => {
    const root = rootRef.current
    if (!root || layers.length < 2) return
    let cancelled = false
    void swapMockupScreens(root, reduced).then(() => {
      if (cancelled) return
      setLayers((prev) => prev.length ? [{ ...prev[prev.length - 1], role: "current" }] : prev)
    })
    return () => { cancelled = true }
  }, [layers, reduced])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    return initMockupFloat(root, reduced)
  }, [reduced])

  return (
    <div ref={rootRef} className={`relative w-full h-full ${className}`}>
      <div data-anim="mockup-float" className="absolute inset-0 will-change-transform">
        {layers.map((l) => (
          <div
            key={l.key}
            data-anim={l.role === "in" ? "mockup-layer-in" : l.role === "out" ? "mockup-layer-out" : "mockup-layer"}
            className={`absolute inset-0 ${l.role === "in" ? "invisible" : ""}`}
          >
            <Screen project={project} idx={l.idx} priority={priority && l.role !== "in"} />
          </div>
        ))}
        {/* Scan line that leads the wipe */}
        <div
          data-anim="mockup-scan"
          aria-hidden="true"
          className="invisible pointer-events-none absolute left-[4%] right-[4%] top-0 h-[2px] bg-primary shadow-[0_0_18px_2px_color-mix(in_srgb,var(--color-primary)_70%,transparent),0_0_60px_8px_color-mix(in_srgb,var(--color-primary)_25%,transparent)]"
        />
      </div>
    </div>
  )
}
