"use client"

import { useState, useEffect } from "react"

interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isTouchDevice: boolean
}

export function useDevice(): DeviceInfo {
  const [info, setInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouchDevice: false,
  })

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      setInfo({
        isMobile: w < 768,
        isTablet: w >= 768 && w < 1280,
        isDesktop: w >= 1280,
        isTouchDevice: window.matchMedia("(pointer: coarse)").matches,
      })
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  return info
}
