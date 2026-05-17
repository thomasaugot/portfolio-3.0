"use client"

import { BrowserFrame, PhoneFrame } from "@/components/ui/DeviceMockup"

const SCENE = "relative w-full h-full flex justify-center pt-10 px-8 pb-8"

// ─── WebMockup ────────────────────────────────────────────────────────────────

export type WebMockupProps = {
  desktop: string
  mobile?: string
  domain?: string
  sizes?: string
  mobileSizes?: string
  mobileOverlayClassName?: string
  priority?: boolean
  containerClassName?: string
  innerClassName?: string
}

export function WebMockup({
  desktop,
  mobile,
  domain,
  sizes = "(max-width: 900px) 80vw, 40vw",
  mobileSizes = "100px",
  mobileOverlayClassName = "absolute right-2 -bottom-2 w-[24%] sm:right-4 sm:bottom-6 sm:w-[20%] z-[2]",
  priority = false,
  containerClassName,
  innerClassName = "relative w-[78%] shrink-0 z-[1]",
}: WebMockupProps) {
  return (
    <div className={containerClassName ?? `${SCENE} items-end`}>
      <div className={innerClassName}>
        <BrowserFrame
          src={desktop}
          alt=""
          sizes={sizes}
          domain={domain}
          priority={priority}
          phoneOverlay={mobile ? { src: mobile, sizes: mobileSizes, className: mobileOverlayClassName } : undefined}
        />
      </div>
    </div>
  )
}

// ─── MobileMockup ─────────────────────────────────────────────────────────────

export type MobileMockupProps = {
  mobile: string
  mobile2?: string
  sizes?: string
  mobile2Sizes?: string
  primaryClassName?: string
  secondaryClassName?: string
  priority?: boolean
  containerClassName?: string
}

export function MobileMockup({
  mobile,
  mobile2,
  sizes = "(max-width: 900px) 35vw, 140px",
  mobile2Sizes = "130px",
  primaryClassName = "relative w-[30%] -translate-x-2 max-[900px]:w-[35%] max-[900px]:translate-x-0 z-[2]",
  secondaryClassName = "relative w-[30%] translate-x-4 scale-90 opacity-60 z-[1] max-[900px]:hidden",
  priority = false,
  containerClassName,
}: MobileMockupProps) {
  return (
    <div className={containerClassName ?? `${SCENE} items-center`}>
      {mobile2 && (
        <PhoneFrame src={mobile2} alt="" sizes={mobile2Sizes} className={secondaryClassName} />
      )}
      <PhoneFrame
        src={mobile}
        alt=""
        sizes={sizes}
        priority={priority}
        className={primaryClassName}
      />
    </div>
  )
}
