"use client"

import { useEffect, useRef } from "react"
import { BrowserFrame, PhoneFrame } from "@/components/ui/DeviceMockup"
import { useMotionPreference } from "@/hooks/useMotionPreference"
import type { Project } from "@/types/project"

interface Props {
  project: Project & { video: NonNullable<Project["video"]> }
  priority?: boolean
}

/**
 * Video variant of the project mockup: the browser frame (and, when there is one, a phone frame
 * over it) plays a muted recording of the live site being scrolled instead of swapping
 * screenshots. Used for work whose point is motion. With reduced motion both stay on their poster.
 */
export function VideoMockup({ project, priority = false }: Props) {
  const desktop = useRef<HTMLVideoElement>(null)
  const phone = useRef<HTMLVideoElement>(null)
  const { preference } = useMotionPreference()
  const reduced = preference === "reduced"
  const mobile = project.video.mobile

  useEffect(() => {
    const vids = [desktop.current, phone.current].filter((v): v is HTMLVideoElement => !!v)
    if (!vids.length) return
    if (reduced) {
      vids.forEach((v) => {
        v.pause()
        v.currentTime = 0
      })
      return
    }
    // play only while visible; long loops have no business decoding off screen
    const io = new IntersectionObserver(([e]) => {
      vids.forEach((v) => (e.isIntersecting ? void v.play().catch(() => undefined) : v.pause()))
    })
    io.observe(vids[0])
    return () => io.disconnect()
  }, [reduced])

  return (
    <div className="relative w-full h-full flex items-center justify-center px-6">
      <div className="relative w-[78%] shrink-0 max-[900px]:w-full">
        <BrowserFrame domain={project.domain}>
          <video
            ref={desktop}
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
        {mobile && (
          <PhoneFrame className="absolute right-2 -bottom-2 w-[24%] sm:right-4 sm:bottom-6 sm:w-[20%] z-[2]">
            <video
              ref={phone}
              src={mobile.src}
              poster={mobile.poster}
              muted
              loop
              playsInline
              preload={priority ? "auto" : "metadata"}
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
          </PhoneFrame>
        )}
      </div>
    </div>
  )
}
