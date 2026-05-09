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
