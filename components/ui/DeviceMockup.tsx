"use client"

import Image from "next/image"

// ─── Shared shell constants ───────────────────────────────────────────────────
const SHELL    = "bg-[#0d0d0d] [border:1.5px_solid_#2d2d2d] rounded-[14px] overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.06)]"
const NOTCH    = "h-[18px] bg-[#0d0d0d] flex items-center justify-center after:content-[''] after:w-[36%] after:h-[8px] after:bg-[#1d1d1d] after:rounded-[4px]"
const HOME_BAR = "h-[14px] flex items-center justify-center bg-[#0d0d0d] after:content-[''] after:w-[28%] after:h-[3px] after:bg-[#3a3a3a] after:rounded-[2px]"

// ─── PhoneFrame ───────────────────────────────────────────────────────────────

type PhoneFrameProps = {
  src: string
  alt: string
  sizes?: string
  className?: string
  priority?: boolean
}

export function PhoneFrame({
  src,
  alt,
  sizes = "200px",
  className = "",
  priority = false,
}: PhoneFrameProps) {
  return (
    <div className={`${SHELL} ${className}`}>
      <div className={NOTCH} />
      <div className="relative bg-black aspect-9/18 overflow-hidden">
        <Image src={src} alt={alt} width={390} height={844} className="absolute top-0 left-0 w-full h-auto" sizes={sizes} priority={priority} />
      </div>
      <div className={HOME_BAR} />
    </div>
  )
}

// ─── BrowserFrame ─────────────────────────────────────────────────────────────

type BrowserFrameProps = {
  src: string
  alt: string
  sizes?: string
  domain?: string
  priority?: boolean
  phoneOverlay?: {
    src: string
    sizes?: string
    className?: string
  }
}

export function BrowserFrame({
  src,
  alt,
  sizes = "50vw",
  domain,
  priority = false,
  phoneOverlay,
}: BrowserFrameProps) {
  return (
    <div className="relative w-full">
      <div className="drop-shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        <div className="h-7 bg-[#161616] [border:1.5px_solid_#2d2d2d] border-b-0 rounded-t-[7px] flex items-center gap-1.5 px-3 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#ff5f57] shrink-0" />
          <span className="w-2 h-2 rounded-full bg-[#febc2e] shrink-0" />
          <span className="w-2 h-2 rounded-full bg-[#28c840] shrink-0" />
          {domain && (
            <div className="flex-1 mx-2 h-4 bg-[#0d0d0d] rounded-[3px] flex items-center px-2 overflow-hidden">
              <span className="font-mono text-[9px] text-[#444] truncate">{domain}</span>
            </div>
          )}
        </div>
        <div className="relative overflow-hidden aspect-video [border-left:1.5px_solid_#2d2d2d] [border-right:1.5px_solid_#2d2d2d] bg-black">
          <Image key={src} src={src} alt={alt} width={1920} height={1080} className="absolute top-0 left-0 w-full h-auto" sizes={sizes} priority={priority} />
        </div>
        <div className="h-2.5 bg-[linear-gradient(180deg,#1c1c1c,#131313)] [border:1.5px_solid_#2d2d2d] [border-top:1px_solid_#0d0d0d] rounded-b-[4px]" />
        <div className="w-[28%] h-[5px] bg-[#161616] mx-auto [border:1.5px_solid_#2d2d2d] border-t-0 rounded-b-[5px]" />
      </div>
      {phoneOverlay && (
        <PhoneFrame
          src={phoneOverlay.src}
          alt=""
          sizes={phoneOverlay.sizes ?? "100px"}
          className={phoneOverlay.className ?? "absolute -bottom-4 -right-4 w-[20%] z-20"}
        />
      )}
    </div>
  )
}
