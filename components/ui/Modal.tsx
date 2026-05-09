"use client"

import { useEffect, useId, useRef, type ReactNode } from "react"
import { createPortal } from "react-dom"

type ModalSize = "sm" | "md" | "lg" | "full"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: ModalSize
}

const sizeWidth: Record<ModalSize, string> = {
  sm:   "400px",
  md:   "560px",
  lg:   "760px",
  full: "100%",
}

export function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const prev = document.activeElement as HTMLElement
    document.body.style.overflow = "hidden"
    dialogRef.current?.focus()
    return () => {
      document.body.style.overflow = ""
      prev?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    if (isOpen) document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
        zIndex: "var(--z-modal)",
      }}
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          width: "100%",
          maxWidth: sizeWidth[size],
          maxHeight: "90vh",
          overflow: "auto",
          outline: "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: "1px solid var(--color-border)",
        }}>
          <span id={titleId} className="text-subheading">{title}</span>
          <button
            onClick={onClose}
            className="keyboard-focus-ring"
            aria-label="Close modal"
            style={{
              background: "none", border: "none",
              color: "var(--color-text-muted)", cursor: "pointer",
              fontSize: "18px", padding: "4px",
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: "24px" }}>{children}</div>
      </div>
    </div>,
    document.body
  )
}
