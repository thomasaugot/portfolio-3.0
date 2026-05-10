"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { announce } from "@/components/ui/LiveRegion"

type ToastType = "success" | "error" | "warning" | "info"

interface Toast {
  id: number
  message: string
  type: ToastType
}

let toastId = 0
let externalShowToast: ((message: string, type?: ToastType) => void) | null = null

export function showToast(message: string, type: ToastType = "info") {
  externalShowToast?.(message, type)
}

const typeColors: Record<ToastType, string> = {
  success: "var(--color-ok)",
  error:   "var(--color-error)",
  warning: "var(--color-num)",
  info:    "var(--color-str)",
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, type }])
    announce(message, type === "error" ? "assertive" : "polite")
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  useEffect(() => {
    externalShowToast = addToast
    return () => { externalShowToast = null }
  }, [addToast])

  if (!mounted) return null

  return createPortal(
    <div
      role="region"
      aria-label="Notifications"
      style={{
        position: "fixed",
        top: "calc(60px + 1rem)",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        zIndex: "var(--z-toast)",
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            background: "var(--color-surface-2)",
            border: `1px solid ${typeColors[t.type]}`,
            padding: "12px 20px",
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            color: "var(--color-text)",
            borderLeft: `3px solid ${typeColors[t.type]}`,
            pointerEvents: "auto",
            animation: "fade-in-up 0.3s var(--ease-out) both",
          }}
        >
          {t.message}
        </div>
      ))}
    </div>,
    document.body
  )
}
