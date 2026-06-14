"use client"

import {
  FiMenu, FiX, FiArrowRight, FiArrowUpRight, FiCheck,
  FiAlertCircle, FiChevronDown, FiMail, FiGithub, FiLinkedin,
  FiTwitter, FiInstagram, FiExternalLink, FiSend
} from "react-icons/fi"
import type { IconBaseProps } from "react-icons"

type IconProps = IconBaseProps

export const IconMenu        = (p: IconProps) => <FiMenu        aria-hidden="true" {...p} />
export const IconClose       = (p: IconProps) => <FiX           aria-hidden="true" {...p} />
export const IconArrow       = (p: IconProps) => <FiArrowRight  aria-hidden="true" {...p} />
export const IconArrowOut    = (p: IconProps) => <FiArrowUpRight aria-hidden="true" {...p} />
export const IconCheck       = (p: IconProps) => <FiCheck       aria-hidden="true" {...p} />
export const IconAlert       = (p: IconProps) => <FiAlertCircle aria-hidden="true" {...p} />
export const IconChevronDown = (p: IconProps) => <FiChevronDown  aria-hidden="true" {...p} />
export const IconMail        = (p: IconProps) => <FiMail        aria-hidden="true" {...p} />
export const IconGithub      = (p: IconProps) => <FiGithub      aria-hidden="true" {...p} />
export const IconLinkedin    = (p: IconProps) => <FiLinkedin    aria-hidden="true" {...p} />
export const IconTwitter     = (p: IconProps) => <FiTwitter     aria-hidden="true" {...p} />
export const IconInstagram   = (p: IconProps) => <FiInstagram   aria-hidden="true" {...p} />
export const IconExternal    = (p: IconProps) => <FiExternalLink aria-hidden="true" {...p} />
export const IconSend        = (p: IconProps) => <FiSend        aria-hidden="true" {...p} />

// Custom inline SVGs (no react-icons equivalent that matches the design)
export const IconSun = ({ size = 14, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="M4.93 4.93l1.41 1.41" />
    <path d="M17.66 17.66l1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="M4.93 19.07l1.41-1.41" />
    <path d="M17.66 6.34l1.41-1.41" />
  </svg>
)

export const IconMoon = ({ size = 14, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
  </svg>
)
