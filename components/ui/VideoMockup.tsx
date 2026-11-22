"use client"

import { useEffect, useRef } from "react"
import { BrowserFrame } from "@/components/ui/DeviceMockup"
import { useMotionPreference } from "@/hooks/useMotionPreference"
import type { Project } from "@/types/project"

interface Props {
  project: Project & { video: NonNullable<Project["video"]> }
  priority?: boolean
}

/**
 * Video variant of the project mockup: the browser frame plays a muted loop of
 * the site instead of swapping screenshots. Used for work whose point is
 * motion. With reduced motion the loop stays on its poster frame.
 */
export function VideoMockup({ project, priority = false }: Props) {
  const ref = useRef<HTMLVideoElement>(null)
  const { preference } = useMotionPreference()
  const reduced = preference === "reduced"

  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (reduced) {
      v.pause()
      v.currentTime = 0
      return
    }
    // play only while visible; a 38 s loop has no business decoding off screen
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) void v.play().catch(() => undefined)
      else v.pause()
    })
    io.observe(v)
    return () => io.disconnect()
  }, [reduced])

  return (
    <div className="relative w-full h-full flex items-center justify-center px-6">
      <div className="relative w-[78%] shrink-0 max-[900px]:w-full">
        <BrowserFrame domain={project.domain}>
          <video
            ref={ref}
            src={project.video.src}
            poster={project.video.poster}
            muted
            loop
            playsInline
            preload={priority ? "auto" : "metadata"}
            aria-label={project.video.label}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </BrowserFrame>
      </div>
    </div>
  )
}
