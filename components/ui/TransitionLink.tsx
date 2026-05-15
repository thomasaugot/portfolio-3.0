"use client"

import { forwardRef, type AnchorHTMLAttributes, type MouseEvent } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTransitionContext } from "@/contexts/TransitionContext"

interface TransitionLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  children: React.ReactNode
  prefetch?: boolean
}

export const TransitionLink = forwardRef<HTMLAnchorElement, TransitionLinkProps>(
  function TransitionLink(
    { href, children, onClick, target, rel, prefetch = true, ...props },
    ref
  ) {
    const { navigateTo, isTransitioning } = useTransitionContext()
    const pathname = usePathname()

    const isExternal =
      href.startsWith("http") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("//")
    const isAnchor = href.startsWith("#")

    // Strip query/hash so /foo and /foo?bar still match
    const targetPath = href.split(/[?#]/)[0]
    const isSamePage = !isExternal && !isAnchor && targetPath === pathname

    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
      if (isExternal || isAnchor) { onClick?.(e); return }
      if (target && target !== "_self") return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

      e.preventDefault()
      if (isTransitioning) return

      // Already on this page — scroll to top instead of triggering a transition
      // that would fade content out with no new page coming in.
      if (isSamePage) {
        window.scrollTo({ top: 0, behavior: "smooth" })
        onClick?.(e)
        return
      }

      void navigateTo(href).then(() => onClick?.(e))
    }

    if (isExternal || isAnchor) {
      return (
        <a ref={ref} href={href} onClick={handleClick} target={target} rel={rel} {...props}>
          {children}
        </a>
      )
    }

    return (
      <Link ref={ref} href={href} prefetch={prefetch} onClick={handleClick} target={target} rel={rel} {...props}>
        {children}
      </Link>
    )
  }
)
