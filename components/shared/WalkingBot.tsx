"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { LuBot } from "react-icons/lu"
import { FiX } from "react-icons/fi"
import { useLocale } from "next-intl"
import { ChatConversationPanel } from "@/components/shared/ChatConversationPanel"
import { useChatConversation } from "@/hooks/useChatConversation"
import { useMotionPreferenceContext } from "@/contexts/MotionPreferenceContext"
import { STORAGE_KEY } from "@/components/shared/CookieBanner"

const BUBBLE: Record<string, string> = {
  en: "Let's talk",
  fr: "On discute ?",
  es: "¿Hablamos?",
}
const CLOSE_LABEL: Record<string, string> = {
  en: "Close chat",
  fr: "Fermer le chat",
  es: "Cerrar el chat",
}

// Idle bob — gentle vertical "breathing" so the bot feels alive without ever
// drifting off-screen or dodging the cursor (which made it hard to click).
const BOB_AMPLITUDE = 4    // px
const BOB_SPEED     = 0.04 // radians per frame

export function WalkingBot() {
  const locale = useLocale()
  const lang = ["en", "fr", "es"].includes(locale) ? locale : "en"
  const { preference } = useMotionPreferenceContext()

  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  // Don't appear until the cookie banner has been answered (it shares the corner
  // and must be dealt with first). Starts true on the server so SSR matches; the
  // mount effect corrects it.
  const [bannerAnswered, setBannerAnswered] = useState(true)
  // Fine pointer = desktop/no-touch. Tracked via matchMedia so it updates on
  // hybrid devices. Walk + cursor-repel run only when this is true and motion is allowed.
  const [finePointer, setFinePointer] = useState(false)
  const animate = finePointer && preference !== "reduced"

  const avatarRef = useRef<HTMLSpanElement>(null)
  const rootRef   = useRef<HTMLDivElement>(null)
  const chat = useChatConversation(lang)

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)")
    const sync = (matches: boolean) => setFinePointer(matches)
    sync(mq.matches)
    const onChange = (e: MediaQueryListEvent) => sync(e.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  // Reveal once the cookie banner has been answered (fires `cookie_consent`).
  useEffect(() => {
    setBannerAnswered(!!localStorage.getItem(STORAGE_KEY))
    const onConsent = () => setBannerAnswered(true)
    window.addEventListener("cookie_consent", onConsent)
    return () => window.removeEventListener("cookie_consent", onConsent)
  }, [])

  // ── Idle bob loop (desktop only, paused when tab hidden) ──
  useEffect(() => {
    if (!animate || open) return
    const el = avatarRef.current
    if (!el) return

    let raf = 0
    let t = 0

    const tick = () => {
      t += BOB_SPEED
      const bob = Math.sin(t) * BOB_AMPLITUDE
      el.style.transform = `translateY(${bob.toFixed(2)}px)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf)
      else raf = requestAnimationFrame(tick)
    }
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener("visibilitychange", onVisibility)
      if (el) el.style.transform = ""
    }
  }, [animate, open])

  // ── Close popover on Escape / outside click ──
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("mousedown", onDown)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("mousedown", onDown)
    }
  }, [open])

  const toggle = useCallback(() => setOpen(o => !o), [])

  if (dismissed || !bannerAnswered) return null

  return (
    <>
      {/* Dimmed backdrop while the chat is open — matches the cookie banner. Click to close. */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] animate-[fade-in-up_0.3s_var(--ease-out)_both] in-data-menu-open:hidden"
          style={{ zIndex: "var(--z-toast)" }}
        />
      )}

      <div
        ref={rootRef}
        // Hide entirely while the mobile menu is open (it owns the screen then).
        className="fixed bottom-4 right-4 max-[520px]:right-3 max-[520px]:bottom-3 flex flex-col items-end gap-2.5 pointer-events-none in-data-menu-open:hidden"
        // When the chat is open it must sit above the theme toggle / back-to-top + backdrop.
        style={{ zIndex: open ? "calc(var(--z-toast) + 1)" : "var(--z-bot)" }}
      >
        {/* Expanding chat popover */}
        {open && (
        <div className="pointer-events-auto w-[min(440px,calc(100vw-1.5rem))] animate-[fade-in-up_0.3s_var(--ease-out)_both] origin-bottom-right">
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={CLOSE_LABEL[lang]}
              className="keyboard-focus-ring absolute -top-3 -right-3 z-10 w-9 h-9 grid place-items-center rounded-full bg-surface-2 border border-border-2 text-text-muted hover:text-text hover:border-primary transition-colors"
            >
              <FiX size={16} />
            </button>
            <ChatConversationPanel
              {...chat}
              locale={lang}
              className=" h-[min(680px,82vh)]"
            />
          </div>
        </div>
      )}

      {/* "Let's talk" bubble — the click target */}
      {!open && (
        <div className="pointer-events-auto inline-flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            className="keyboard-focus-ring inline-flex items-center gap-2 py-2.5 px-4 bg-primary text-black font-mono text-[15px] font-medium tracking-[0.02em] border border-primary cursor-pointer shadow-md transition-[background,border-color] duration-200 hover:bg-text hover:border-text hover:text-bg"
          >
            {BUBBLE[lang]}
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label={CLOSE_LABEL[lang]}
            className="keyboard-focus-ring w-6 h-6 grid place-items-center rounded-full bg-surface-2 border border-border-2 text-text-subtle hover:text-text hover:border-text-subtle transition-colors"
          >
            <FiX size={12} />
          </button>
        </div>
      )}

      {/* The bot avatar — gentle idle bob (inner span); friendly bounce on hover (no repel). */}
      <button
        type="button"
        onClick={toggle}
        aria-label={open ? CLOSE_LABEL[lang] : BUBBLE[lang]}
        className="keyboard-focus-ring group pointer-events-auto w-16 h-16 grid place-items-center shrink-0 rounded-full bg-primary text-black border border-primary cursor-pointer shadow-md hover:bg-text hover:text-bg hover:border-text transition-[background,border-color,color] duration-200"
      >
        {/* Bob target (JS sets translateY) wraps the scale target (hover bounce) —
            separate elements so the inline transform and the hover scale compose. */}
        <span ref={avatarRef} className="grid place-items-center will-change-transform">
          <span className="grid place-items-center transition-transform duration-200 group-hover:scale-110">
            <LuBot size={30} />
          </span>
        </span>
      </button>
      </div>
    </>
  )
}
