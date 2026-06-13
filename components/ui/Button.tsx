"use client"

import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react"

type ButtonVariant = "filled" | "outlined" | "ghost"
type ButtonSize = "sm" | "md" | "lg"

const BASE = [
  "btn inline-flex items-center gap-2.5 font-mono text-[16px] tracking-[0.02em]",
  "px-[22px] py-[14px] border border-border-2 bg-transparent text-text cursor-pointer",
  "relative overflow-hidden no-underline whitespace-nowrap select-none",
  "transition-[border-color,color,background,transform] duration-normal ease-out",
  "hover:border-text active:translate-y-px",
].join(" ")

const VARIANTS: Record<ButtonVariant, string> = {
  filled: [
    "bg-primary text-black border-primary font-medium",
    "hover:bg-text hover:border-text",
    "after:content-[''] after:absolute after:inset-0",
    "after:bg-[linear-gradient(120deg,transparent_30%,rgba(255,255,255,0.6)_50%,transparent_70%)]",
    "after:-translate-x-full hover:after:translate-x-full after:transition-transform after:duration-[0.8s] after:ease-snappy after:pointer-events-none",
  ].join(" "),
  outlined: "",
  ghost: "border-transparent hover:text-primary hover:border-transparent",
}

const SIZES: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs",
  md: "",
  lg: "px-7 py-4",
}

interface BaseProps {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
  children?: ReactNode
  className?: string
}

type ButtonAsButton = BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }
type ButtonAsAnchor = BaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
type ButtonProps = ButtonAsButton | ButtonAsAnchor

export function Button({
  variant = "outlined",
  size = "md",
  loading = false,
  icon,
  children,
  className = "",
  ...rest
}: ButtonProps) {
  const classes = [BASE, VARIANTS[variant], SIZES[size], "keyboard-focus-ring", className].filter(Boolean).join(" ")

  const content = loading ? (
    <span className="opacity-60">···</span>
  ) : (
    <>
      {children}
      {icon && (
        <span className="inline-block transition-transform duration-[0.35s] ease-snappy group-hover:translate-x-1">
          {icon}
        </span>
      )}
    </>
  )

  if ("href" in rest && rest.href !== undefined) {
    const { href, ...anchorRest } = rest as ButtonAsAnchor
    return (
      <a href={href} className={classes} {...anchorRest}>
        {content}
      </a>
    )
  }

  const { disabled, ...buttonRest } = rest as ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <button
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading}
      {...buttonRest}
    >
      {content}
    </button>
  )
}
