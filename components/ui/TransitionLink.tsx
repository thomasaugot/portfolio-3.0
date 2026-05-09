"use client"

import Link from "next/link"
import type { ComponentProps, MouseEvent } from "react"
import { useTransitionContext } from "@/contexts/TransitionContext"

type TransitionLinkProps = ComponentProps<typeof Link>

export function TransitionLink({ href, onClick, children, ...rest }: TransitionLinkProps) {
  const { navigateTo } = useTransitionContext()
  const hrefStr = href.toString()

  const isExternal = hrefStr.startsWith("http") || hrefStr.startsWith("//")
  const isAnchor   = hrefStr.startsWith("#")

  const handleClick = async (e: MouseEvent<HTMLAnchorElement>) => {
    if (isExternal || isAnchor) {
      onClick?.(e)
      return
    }
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    if ((e.currentTarget as HTMLAnchorElement).target === "_blank") return

    e.preventDefault()
    await navigateTo(hrefStr)
    onClick?.(e)
  }

  return (
    <Link href={href} onClick={handleClick} {...rest}>
      {children}
    </Link>
  )
}
