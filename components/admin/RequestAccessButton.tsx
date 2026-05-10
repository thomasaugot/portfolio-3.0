"use client"

import { useState } from "react"

type State = "idle" | "loading" | "sent" | "error"

export function RequestAccessButton() {
  const [state, setState] = useState<State>("idle")

  const request = async () => {
    setState("loading")
    try {
      const res = await fetch("/api/admin/request", { method: "POST" })
      setState(res.ok ? "sent" : "error")
    } catch {
      setState("error")
    }
  }

  if (state === "sent") {
    return (
      <div className="text-center space-y-2">
        <p className="text-primary font-mono text-sm">Link sent.</p>
        <p className="text-text-muted font-mono text-xs">Check the admin email — valid for 15 min.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 text-center">
      <button
        onClick={request}
        disabled={state === "loading"}
        className="border border-primary text-primary px-8 py-3 font-mono text-xs tracking-widest uppercase hover:bg-primary hover:text-black transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {state === "loading" ? "Sending…" : "Request access"}
      </button>
      {state === "error" && (
        <p className="text-error font-mono text-xs">Something went wrong. Try again.</p>
      )}
    </div>
  )
}
