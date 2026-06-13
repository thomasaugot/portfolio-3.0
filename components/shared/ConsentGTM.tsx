"use client"
import { useEffect } from "react"
import { STORAGE_KEY } from "@/components/shared/CookieBanner"

const GTM_ID = "GTM-M6GQ2N7Z"

function injectGTM() {
  if (document.getElementById("gtm-script")) return
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
    if (localStorage.getItem(STORAGE_KEY) === "accepted") {
      injectGTM()
    }

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail === "accepted") injectGTM()
    }
    window.addEventListener("cookie_consent", handler)
    return () => window.removeEventListener("cookie_consent", handler)
  }, [])

  return null
}
