"use client"

export function LiveRegion() {
  return (
    <>
      <div role="status" aria-live="polite"    aria-atomic="true" className="sr-only" id="live-polite" />
      <div role="alert"  aria-live="assertive" aria-atomic="true" className="sr-only" id="live-assertive" />
    </>
  )
}

export function announce(message: string, politeness: "polite" | "assertive" = "polite") {
  const el = document.getElementById(
    politeness === "assertive" ? "live-assertive" : "live-polite"
  )
  if (!el) return
  el.textContent = ""
  requestAnimationFrame(() => { el.textContent = message })
}
