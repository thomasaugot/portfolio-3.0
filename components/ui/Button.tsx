"use client"

import type { ButtonHTMLAttributes, ReactNode } from "react"

type ButtonVariant = "filled" | "outlined" | "ghost"
type ButtonSize = "sm" | "md" | "lg"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs",
  md: "",
  lg: "px-7 py-4",
}

export function Button({
  variant = "outlined",
  size = "md",
  loading = false,
  icon,
  children,
  className = "",
  disabled,
  ...rest
}: ButtonProps) {
  const variantClass =
    variant === "filled" ? "btn-filled" :
    variant === "ghost"  ? "btn-ghost"  : ""

  return (
    <button
      className={`btn ${variantClass} ${sizeClasses[size]} keyboard-focus-ring ${className}`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...rest}
    >
      {loading ? (
        <span style={{ opacity: 0.6 }}>···</span>
      ) : (
        <>
          {children}
          {icon && <span className="btn-arrow">{icon}</span>}
        </>
      )}
    </button>
  )
}
