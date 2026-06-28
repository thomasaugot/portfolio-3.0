"use client"
import React, { useRef, useEffect, useCallback } from "react"
import { FiUser } from "react-icons/fi"
import { LuBot } from "react-icons/lu"
import { Turnstile } from "@marsidev/react-turnstile"
import type { Msg, Phase } from "@/hooks/useChatConversation"

interface Props {
  msgs:           Msg[]
  phase:          Phase
  loading:        boolean
  input:          string
  setInput:       (v: string) => void
  cName:          string
  setCName:       (v: string) => void
  cContact:       string
  setCContact:    (v: string) => void
  sending:        boolean
  sent:           boolean
  prog:           string
  chips:          string[]
  assistantLabel: string
  honeypotRef:       React.MutableRefObject<string>
  turnstileTokenRef: React.MutableRefObject<string | null>
  send:           (text: string) => void
  enterContact:   () => void
  submitContact:  () => void
  startConv:      () => void
  className?:     string
  locale?:        string
}

const UI: Record<string, { placeholder: string; skip: string; ready: string; yourName: string; contact: string; send: string; sending: string; sent: string }> = {
  en: { placeholder: "Or type your answer…", skip: "Skip", ready: "Ready — let's connect →", yourName: "Your name", contact: "Email or phone", send: "Send →", sending: "Sending…", sent: "Message sent ✓" },
  fr: { placeholder: "Ou tapez votre réponse…", skip: "Passer", ready: "Prêt — connectons-nous →", yourName: "Votre nom", contact: "Email ou téléphone", send: "Envoyer →", sending: "Envoi…", sent: "Message envoyé ✓" },
  es: { placeholder: "O escribe tu respuesta…", skip: "Saltar", ready: "Listo — conectemos →", yourName: "Tu nombre", contact: "Email o teléfono", send: "Enviar →", sending: "Enviando…", sent: "Mensaje enviado ✓" },
}

const avatarBot = "w-7 h-7 grid place-items-center shrink-0 rounded-full bg-primary text-black"
const avatarUser = "w-7 h-7 grid place-items-center shrink-0 rounded-full bg-surface-2 border border-border-2 text-text-muted"
const bubbleBot = "px-4 py-3 text-body leading-[1.6] bg-surface border border-border text-text"
const bubbleUser = "px-4 py-3 text-body leading-[1.6] bg-primary text-black font-medium"
const inputBase = "keyboard-focus-ring text-body font-mono px-3.5 py-2.5 bg-surface-2 border border-border-2 text-text outline-none focus:border-primary transition-colors duration-200 placeholder:text-text-muted disabled:opacity-50"
const btnFilled = "inline-flex items-center gap-2.5 text-[16px] tracking-[0.02em] px-[22px] py-[14px] bg-primary text-black border border-primary font-medium cursor-pointer hover:bg-text hover:border-text transition-[border-color,color,background] duration-normal ease-out disabled:opacity-50"

export function ChatConversationPanel({
  msgs, phase, loading, input, setInput,
  cName, setCName, cContact, setCContact,
  sending, sent, prog, chips, assistantLabel,
  honeypotRef, turnstileTokenRef,
  send, enterContact, submitContact, startConv,
  className = "",
  locale = "en",
}: Props) {
  const ui = UI[locale] ?? UI.en
  const threadRef = useRef<HTMLDivElement>(null)

  const scroll = useCallback(() => {
    requestAnimationFrame(() => {
      if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight
    })
  }, [])

  useEffect(scroll, [msgs, loading, phase, scroll])

  useEffect(() => {
    const el = threadRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { startConv(); io.disconnect() } },
      { threshold: 0.2 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [startConv])

  return (
    <div className={`theme-bg shadow-(--shadow-terminal) border border-border flex flex-col overflow-hidden${className ? ` ${className}` : ""}`}>

      {/* Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <span className="flex items-center gap-2.5 text-caption font-mono tracking-[0.08em] uppercase text-text!">
          <span
            aria-hidden="true"
            className="w-2 h-2 rounded-full bg-primary shadow-[0_0_0_3px_color-mix(in_oklch,var(--color-primary)_20%,transparent)]"
          />
          {assistantLabel}
        </span>
        <span className="text-caption font-mono text-text-muted! tracking-[0.08em] uppercase">{prog}</span>
      </div>

      {/* Thread */}
      <div
        ref={threadRef}
        className="flex-1 min-h-0 px-5 py-5 flex flex-col gap-4 overflow-y-auto"
        data-lenis-prevent
      >
        {msgs.map((msg, i) => {
          if (msg.type === "typing") return (
            <div key={`t${i}`} className="flex gap-3 max-w-[88%] animate-[chat-in_0.4s_var(--ease-out)_forwards]" aria-hidden="true">
              <div className={`${avatarBot} text-caption font-mono font-bold text-black!`}>TA</div>
              <div className="flex gap-1.5 px-4 py-3.5 bg-surface border border-border text-text">
                <span className="w-1.5 h-1.5 rounded-full bg-text-subtle animate-[chat-dot_1.1s_infinite]" />
                <span className="w-1.5 h-1.5 rounded-full bg-text-subtle animate-[chat-dot_1.1s_0.18s_infinite]" />
                <span className="w-1.5 h-1.5 rounded-full bg-text-subtle animate-[chat-dot_1.1s_0.36s_infinite]" />
              </div>
            </div>
          )

          if (msg.type === "summary") return (
            <div key={`s${i}`} className="flex gap-3 max-w-[88%] animate-[chat-in_0.4s_var(--ease-out)_forwards]">
              <div className={`${avatarBot} text-caption font-mono font-bold text-black!`} aria-hidden="true">TA</div>
              <div className="border border-border bg-surface p-5 mt-1 flex-1">
                <h4 className="text-caption font-mono tracking-[0.12em] uppercase text-text-muted! mb-4">{msg.text}</h4>
                <dl className="grid grid-cols-[auto_1fr] gap-y-2.5 gap-x-5">
                  {msg.rows?.map(r => (
                    <div key={r.label} className="contents">
                      <dt className="text-caption font-mono text-text-muted! uppercase tracking-wider pt-0.5">{r.label}</dt>
                      <dd className="text-body font-mono text-text">{r.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )

          const isBot = msg.role === "bot"
          return (
            <div
              key={`m${i}`}
              className={`flex gap-3 max-w-[88%] animate-[chat-in_0.4s_var(--ease-out)_forwards]${isBot ? "" : " self-end flex-row-reverse"}`}
            >
              <div className={isBot ? avatarBot : avatarUser} aria-hidden="true">
                {isBot ? <LuBot size={14} /> : <FiUser size={13} />}
              </div>
              <div className={isBot ? bubbleBot : bubbleUser}>
                {msg.text}
              </div>
            </div>
          )
        })}
      </div>

      {/* Done */}
      {phase === "done" && sent && (
        <div className="px-5 py-4 border-t border-border animate-[chat-in_0.4s_var(--ease-out)_forwards]">
          <p className="text-caption font-mono text-text-muted! tracking-[0.08em] uppercase">{ui.sent}</p>
        </div>
      )}

      {/* Controls — qualify + qa */}
      {(phase === "qualify" || phase === "qa") && (
        <div className="px-5 pb-5 pt-3 flex flex-col gap-3 border-t border-border">
          {!loading && msgs.at(-1)?.role === "bot" && (
            <div className="flex flex-col gap-2.5 pt-1">
              {chips.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {chips.filter(c => !["Skip","Passer","Saltar","Ready to connect","Prêt à me contacter","Listo para conectar"].includes(c)).map(chip => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => send(chip)}
                      className="keyboard-focus-ring text-[13px] leading-none font-mono px-3.5 py-2.5 border border-border-2 text-text! bg-surface-2 cursor-pointer transition-[color,background-color,border-color] duration-200 hover:border-primary hover:bg-[color-mix(in_oklch,var(--color-primary)_12%,transparent)]"
                    >
                      {chip}
                    </button>
                  ))}
                  {phase === "qualify" && chips.find(c => ["Skip","Passer","Saltar"].includes(c)) && (
                    <button
                      key="skip"
                      type="button"
                      onClick={() => send(ui.skip)}
                      className="keyboard-focus-ring text-[13px] leading-none font-mono px-3.5 py-2.5 border border-border-2 text-text-muted! bg-transparent cursor-pointer transition-[color,background-color,border-color] duration-200 hover:text-text! hover:bg-surface-2 hover:border-text-subtle"
                    >
                      {ui.skip}
                    </button>
                  )}
                </div>
              )}
              {/* Connect path is always available — whether they qualified a project or just had a question. */}
              <button
                type="button"
                onClick={() => enterContact()}
                className={`keyboard-focus-ring w-full font-mono justify-center mt-1 ${btnFilled}`}
              >
                {ui.ready}
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={ui.placeholder}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && input.trim()) send(input) }}
              disabled={loading}
              aria-label="Your answer"
              className={`${inputBase} flex-1`}
            />
            <button
              type="button"
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              aria-label="Send"
              className="keyboard-focus-ring px-4 font-bold font-mono disabled:opacity-30 bg-primary text-black border border-primary cursor-pointer hover:bg-text hover:border-text hover:text-bg transition-[background,border-color,color] duration-normal ease-out"
            >
              →
            </button>
          </div>
        </div>
      )}

      {/* Honeypot — visually hidden, bots fill it, humans never see it */}
      <input
        type="text"
        name="website"
        autoComplete="off"
        tabIndex={-1}
        aria-hidden="true"
        onChange={e => { honeypotRef.current = e.target.value }}
        className="absolute opacity-0 pointer-events-none w-0 h-0"
      />

      {/* Turnstile — invisible bot detection, no UI shown to users */}
      <Turnstile
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        onSuccess={token => { turnstileTokenRef.current = token }}
        onExpire={() => { turnstileTokenRef.current = null }}
        options={{ appearance: "execute" }}
        className="hidden"
      />

      {/* Controls — contact */}
      {phase === "contact" && (
        <div className="px-5 pb-5 pt-4 flex flex-col gap-3 border-t border-border">
          <input
            id="chat-name"
            name="name"
            type="text"
            placeholder={ui.yourName}
            value={cName}
            onChange={e => setCName(e.target.value)}
            autoComplete="name"
            aria-label="Name"
            className={inputBase}
          />
          <input
            id="chat-contact"
            name="contact"
            type="text"
            placeholder={ui.contact}
            value={cContact}
            onChange={e => setCContact(e.target.value)}
            autoComplete="email"
            inputMode="email"
            aria-label="Email or phone"
            className={inputBase}
          />
          <button
            type="button"
            onClick={submitContact}
            disabled={!cName.trim() || !cContact.trim() || sending}
            className={`keyboard-focus-ring self-start font-mono ${btnFilled}`}
          >
            {sending ? ui.sending : ui.send}
          </button>
        </div>
      )}
    </div>
  )
}
