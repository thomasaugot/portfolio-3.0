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
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={descId}
        className={`keyboard-focus-ring ${className}`}
        {...rest}
      />
      {error && <p id={`${id}-error`} role="alert" style={{ fontSize: "11px", color: "var(--color-error)", marginTop: "4px" }}>{error}</p>}
      {hint && !error && <p id={`${id}-hint`} style={{ fontSize: "11px", color: "var(--color-text-subtle)", marginTop: "4px" }}>{hint}</p>}
    </div>
  )
}
