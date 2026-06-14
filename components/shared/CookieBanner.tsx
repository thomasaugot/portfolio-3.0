"use client"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { FiSliders } from "react-icons/fi"
import { TransitionLink } from "@/components/ui/TransitionLink"
import { Button } from "@/components/ui/Button"
import { useTranslationContext } from "@/contexts/TranslationContext"

export const STORAGE_KEY = "cookie_consent"
export const PREFS_KEY = "cookie_prefs"

type Step = "main" | "customize"

interface Prefs { analytics: boolean; security: boolean }

// Re-open the cookie settings panel from anywhere (e.g. a footer link), so
// consent can be reviewed or withdrawn at any time — required by GDPR.
export function openCookieSettings() {
  window.dispatchEvent(new CustomEvent("open_cookie_settings"))
}

// Single source of truth for whether analytics (GTM) is allowed to load.
// Reads the granular prefs; defaults to FALSE (opt-in) when nothing is stored.
export function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return false
    return JSON.parse(raw)?.analytics === true
  } catch {
    return false
  }
}

const COPY: Record<string, {
  eyebrow: string
  title: string
  body: string
  policy: string
  customize: string
  acceptAll: string
  declineAll: string
  savePrefs: string
  back: string
  necessary: { label: string; desc: string }
  analytics: { label: string; desc: string }
  security: { label: string; desc: string }
  alwaysOn: string
}> = {
  en: {
    eyebrow: "[ PRIVACY ]",
    title: "This site uses cookies.",
    body: "We use cookies for analytics and bot protection. No advertising or cross-site tracking — ever.",
    policy: "Read the privacy policy →",
    customize: "Customize",
    acceptAll: "Accept all",
    declineAll: "Decline all",
    savePrefs: "Save preferences",
    back: "← Back",
    necessary: { label: "Necessary", desc: "Theme preference, session state. Required for the site to function." },
    analytics: { label: "Analytics", desc: "Google Analytics 4 — page views, session duration, country. No personal data stored." },
    security: { label: "Bot protection", desc: "Cloudflare Turnstile — invisible check to prevent automated abuse of the chatbot." },
    alwaysOn: "Always on",
  },
  fr: {
    eyebrow: "[ CONFIDENTIALITÉ ]",
    title: "Ce site utilise des cookies.",
    body: "Nous utilisons des cookies pour les analyses et la protection contre les bots. Aucun cookie publicitaire ni suivi tiers.",
    policy: "Lire la politique de confidentialité →",
    customize: "Personnaliser",
    acceptAll: "Tout accepter",
    declineAll: "Tout refuser",
    savePrefs: "Enregistrer",
    back: "← Retour",
    necessary: { label: "Nécessaires", desc: "Préférence de thème, état de session. Indispensables au bon fonctionnement du site." },
    analytics: { label: "Analyses", desc: "Google Analytics 4 — pages vues, durée, pays. Aucune donnée personnelle stockée." },
    security: { label: "Protection bots", desc: "Cloudflare Turnstile — vérification invisible pour prévenir l'abus automatisé du chatbot." },
    alwaysOn: "Toujours actif",
  },
  es: {
    eyebrow: "[ PRIVACIDAD ]",
    title: "Este sitio usa cookies.",
    body: "Usamos cookies para analíticas y protección contra bots. Sin cookies publicitarias ni rastreo entre sitios.",
    policy: "Leer la política de privacidad →",
    customize: "Personalizar",
    acceptAll: "Aceptar todo",
    declineAll: "Rechazar todo",
    savePrefs: "Guardar preferencias",
    back: "← Volver",
    necessary: { label: "Necesarias", desc: "Preferencia de tema, estado de sesión. Imprescindibles para el funcionamiento del sitio." },
    analytics: { label: "Analíticas", desc: "Google Analytics 4 — páginas vistas, duración, país. Sin datos personales almacenados." },
    security: { label: "Protección bots", desc: "Cloudflare Turnstile — verificación invisible para prevenir el abuso automatizado del chatbot." },
    alwaysOn: "Siempre activo",
  },
}

// Notify listeners (ConsentGTM) that consent changed — they re-read storage.
function dispatchConsent() {
  window.dispatchEvent(new CustomEvent("cookie_consent"))
}

function persist(prefs: Prefs) {
  const answered = prefs.analytics || prefs.security ? "accepted" : "declined"
  localStorage.setItem(STORAGE_KEY, answered)
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
  dispatchConsent()
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange?: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative w-10 h-5 border transition-colors duration-200 shrink-0 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
        checked ? "bg-primary border-primary" : "bg-transparent border-border-2"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 transition-all duration-200 ${checked ? "left-[calc(100%-18px)] bg-black" : "left-0.5 bg-text-subtle"}`} />
    </button>
  )
}

export function CookieBanner() {
  const { language } = useTranslationContext()
  const pathname = usePathname()
  const onPrivacyPage = pathname?.includes("/privacy")
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState<Step>("main")
  // Opt-in by default: analytics OFF until the user explicitly enables it.
  // Security (Turnstile) is strictly necessary, so it's always on.
  const [prefs, setPrefs] = useState<Prefs>({ analytics: false, security: true })
  const c = COPY[language] ?? COPY.en

  // Until consent is recorded, keep the banner up everywhere EXCEPT the privacy
  // page itself (so a visitor who clicked through can actually read the policy).
  // It returns automatically when they navigate back.
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return
    setVisible(!onPrivacyPage)
  }, [onPrivacyPage])

  useEffect(() => {

    // Allow re-opening it later (e.g. footer "Cookie settings") so consent
    // can be reviewed or withdrawn at any time — required by GDPR.
    const reopen = () => {
      try {
        const raw = localStorage.getItem(PREFS_KEY)
        if (raw) setPrefs({ ...JSON.parse(raw), security: true })
      } catch { /* keep defaults */ }
      setStep("customize")
      setVisible(true)
    }
    window.addEventListener("open_cookie_settings", reopen)
    return () => window.removeEventListener("open_cookie_settings", reopen)
  }, [])

  // Helper other components can call to re-open the settings panel.
  // (Exported as a standalone below for use outside this component.)

  function acceptAll() {
    persist({ analytics: true, security: true })
    setVisible(false)
  }

  function declineAll() {
    // Decline = no analytics. Security stays (necessary), but no GTM loads.
    persist({ analytics: false, security: true })
    setVisible(false)
  }

  function savePrefs() {
    persist({ ...prefs, security: true })
    setVisible(false)
  }

  if (!visible) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] animate-[chat-in_0.3s_var(--ease-out)_forwards]" style={{ zIndex: "var(--z-cookie)" }} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cookie preferences"
        style={{ zIndex: "calc(var(--z-cookie) + 1)" }}
        className="fixed bottom-6 right-6 max-[520px]:bottom-0 max-[520px]:right-0 max-[520px]:left-0 w-full max-w-sm bg-bg border border-border shadow-md flex flex-col animate-[chat-in_0.4s_var(--ease-out)_forwards]"
      >

          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-border">
            <p className="text-caption font-mono text-text-subtle tracking-widest uppercase mb-3">{c.eyebrow}</p>
            <h2 className="font-display font-semibold text-[clamp(1.4rem,3vw,2rem)] tracking-tight leading-[1.1] text-text">
              {c.title}
            </h2>
          </div>

          {/* Body */}
          <div className="px-6 py-5 flex-1">
            {step === "main" ? (
              <>
                <p className="text-body text-text-muted leading-[1.7] mb-5">{c.body}</p>
                <TransitionLink
                  href={`/${language}/privacy`}
                  className="text-caption font-mono text-primary no-underline hover:opacity-70 transition-opacity duration-150"
                  onClick={() => setVisible(false)}
                >
                  {c.policy}
                </TransitionLink>
              </>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {/* Necessary — always on */}
                <div className="flex items-start justify-between gap-6 py-4 first:pt-0">
                  <div>
                    <p className="text-body font-mono font-semibold text-text mb-1">{c.necessary.label}</p>
                    <p className="text-caption text-text-subtle leading-[1.6]">{c.necessary.desc}</p>
                  </div>
                  <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                    <Toggle checked disabled />
                    <span className="text-[10px] font-mono text-text-subtle whitespace-nowrap">{c.alwaysOn}</span>
                  </div>
                </div>

                {/* Analytics */}
                <div className="flex items-start justify-between gap-6 py-4">
                  <div>
                    <p className="text-body font-mono font-semibold text-text mb-1">{c.analytics.label}</p>
                    <p className="text-caption text-text-subtle leading-[1.6]">{c.analytics.desc}</p>
                  </div>
                  <Toggle
                    checked={prefs.analytics}
                    onChange={v => setPrefs(p => ({ ...p, analytics: v }))}
                  />
                </div>

                {/* Security */}
                <div className="flex items-start justify-between gap-6 py-4 last:pb-0">
                  <div>
                    <p className="text-body font-mono font-semibold text-text mb-1">{c.security.label}</p>
                    <p className="text-caption text-text-subtle leading-[1.6]">{c.security.desc}</p>
                  </div>
                  <Toggle checked disabled />{/* Turnstile is strictly necessary — always on */}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 pt-4 border-t border-border flex flex-wrap gap-3 justify-between items-center">
            {step === "main" ? (
              <>
                <button
                  onClick={() => setStep("customize")}
                  className="keyboard-focus-ring inline-flex items-center gap-2 text-body font-mono px-3 py-2.5 border border-dashed border-border-2 text-text-muted transition-colors duration-200 hover:border-text-subtle hover:text-text"
                >
                  <FiSliders size={14} aria-hidden="true" />
                  {c.customize}
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={declineAll}
                    className="keyboard-focus-ring text-body font-mono px-5 py-2.5 border border-border text-text-muted transition-colors duration-200 hover:border-text-subtle hover:text-text"
                  >
                    {c.declineAll}
                  </button>
                  <button
                    onClick={acceptAll}
                    className="keyboard-focus-ring text-body font-mono font-medium px-5 py-2.5 bg-primary text-black border border-primary cursor-pointer transition-colors duration-200 hover:bg-primary-deep hover:border-primary-deep"
                  >
                    {c.acceptAll}
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => setStep("main")}
                  className="keyboard-focus-ring text-body font-mono text-text-subtle transition-colors duration-150 hover:text-text"
                >
                  {c.back}
                </button>
                <Button onClick={savePrefs} variant="filled">
                  {c.savePrefs}
                </Button>
              </>
            )}
          </div>
      </div>
    </>
  )
}
