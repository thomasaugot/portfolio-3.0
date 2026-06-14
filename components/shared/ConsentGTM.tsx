"use client"
import { useEffect } from "react"
import { hasAnalyticsConsent } from "@/components/shared/CookieBanner"

const GTM_ID = "GTM-M6GQ2N7Z"

// Injects Google Tag Manager — ONLY ever called once the user has actively
// consented to analytics cookies. Until then, GTM never loads and no analytics
// network requests are made (GDPR / ePrivacy compliant: opt-in, not opt-out).
function injectGTM() {
  if (document.getElementById("gtm-script")) return

  // Standard GTM bootstrap: init dataLayer + push gtm.start before loading gtm.js.
  const w = window as unknown as { dataLayer?: unknown[] }
  w.dataLayer = w.dataLayer || []
  w.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" })

  const s = document.createElement("script")
  s.id = "gtm-script"
  s.async = true
  s.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`
  document.head.appendChild(s)

  const noscript = document.createElement("noscript")
  const iframe = document.createElement("iframe")
  iframe.src = `https://www.googletagmanager.com/ns.html?id=${GTM_ID}`
  iframe.height = "0"
  iframe.width = "0"
  iframe.style.cssText = "display:none;visibility:hidden"
  noscript.appendChild(iframe)
  document.body.prepend(noscript)
}

export function ConsentGTM() {
  useEffect(() => {
    // Load now if analytics was already accepted in a previous session.
    if (hasAnalyticsConsent()) injectGTM()

    // Load the moment the user accepts analytics in the banner this session.
    const handler = () => { if (hasAnalyticsConsent()) injectGTM() }
    window.addEventListener("cookie_consent", handler)
    return () => window.removeEventListener("cookie_consent", handler)
  }, [])

  return null
}
