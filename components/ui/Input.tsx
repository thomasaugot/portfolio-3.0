"use client"

import { useId, type InputHTMLAttributes } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, className = "", ...rest }: InputProps) {
  const id = useId()
  const descId = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-caption font-mono text-text-subtle tracking-[0.1em] uppercase">{label}</label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={descId}
        className={`bg-transparent border-0 border-b border-border-2 py-2 text-body text-text font-mono resize-none transition-colors focus:outline-none focus:border-b-primary keyboard-focus-ring ${className}`}
        {...rest}
      />
      {error && <p id={`${id}-error`} role="alert" className="text-caption" style={{ color: "var(--color-error)", marginTop: "4px" }}>{error}</p>}
      {hint && !error && <p id={`${id}-hint`} className="text-caption" style={{ color: "var(--color-text-subtle)", marginTop: "4px" }}>{hint}</p>}
    </div>
  )
}
