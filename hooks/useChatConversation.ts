"use client"
import { useState, useRef, useCallback } from "react"
import { appConfig } from "@/config/app.config"

export type Phase = "qualify" | "qa" | "contact" | "done"

export interface Msg {
  role:  "bot" | "user"
  text:  string
  type?: "typing" | "summary"
  rows?: Array<{ label: string; value: string }>
}

interface QualifyData {
  stage:    string
  goal:     string
  scope:    string
  selling:  string
  design:   string
  timeline: string
  budget:   string
  context:  string
}

const QUALIFY_LABELS: Record<keyof QualifyData, string> = {
  stage:    "Stage",
  goal:     "Goal",
  scope:    "Scope",
  selling:  "Sells",
  design:   "Design",
  timeline: "Timeline",
  budget:   "Budget",
  context:  "Context",
}

// Free-question chips shown once qualification is done.
export const QA_CHIPS: Record<string, string[]> = {
  en: ["How do you work?", "What's your availability?", "Do you do design?", "Can you work with AI?", "Ready to connect"],
  fr: ["Comment travaillez-vous ?", "Quelles sont vos disponibilités ?", "Faites-vous du design ?", "Travaillez-vous avec l'IA ?", "Prêt à me contacter"],
  es: ["¿Cómo trabajas?", "¿Cuál es tu disponibilidad?", "¿Haces diseño?", "¿Trabajas con IA?", "Listo para conectar"],
}

const SKIP_WORDS = ["Skip", "Passer", "Saltar"]

// The AI appends quick-reply options as `[[chips: A | B | C]]` on the last line.
// Pull them out and return both the parsed chips and the cleaned text.
function parseChips(text: string): { text: string; chips: string[] } {
  const m = text.match(/\[\[\s*chips\s*:([^\]]*)\]\]/i)
  if (!m) return { text: text.trim(), chips: [] }
  const chips = m[1].split("|").map(s => s.trim()).filter(Boolean)
  const clean = text.replace(m[0], "").trim()
  return { text: clean, chips }
}

function extractJson(text: string, start: number): string | null {
  let depth = 0
  for (let i = start; i < text.length; i++) {
    if (text[i] === "{") depth++
    else if (text[i] === "}") { depth--; if (depth === 0) return text.slice(start, i + 1) }
  }
  return null
}

// Bot-initiated, open-ended opening shown locally with no API call (so the chat
// never errors on open and Turnstile has time to get a token). It does NOT assume
// the visitor has a project — they might just have a question.
const GREETINGS: Record<string, string> = {
  en: "Hi — I'm Tom's assistant. How can I help?",
  fr: "Bonjour — je suis l'assistant de Tom. Comment puis-je aider ?",
  es: "Hola — soy el asistente de Tom. ¿En qué puedo ayudarte?",
}

const FIRST_CHIPS: Record<string, string[]> = {
  en: ["I have a project", "Just a question", "Something else"],
  fr: ["J'ai un projet", "Juste une question", "Autre chose"],
  es: ["Tengo un proyecto", "Solo una pregunta", "Otra cosa"],
}

const ERROR_MSGS: Record<string, string> = {
  en: "Something went wrong. Try again or write me directly.",
  fr: "Une erreur s'est produite. Réessayez ou écrivez-moi directement.",
  es: "Algo salió mal. Inténtalo de nuevo o escríbeme directamente.",
}

const RATE_LIMIT_MSGS: Record<string, string> = {
  en: "The assistant has hit its usage limit for today. Write me directly at ",
  fr: "L'assistant a atteint sa limite d'utilisation aujourd'hui. Écrivez-moi directement à ",
  es: "El asistente ha alcanzado su límite de uso por hoy. Escríbeme directamente a ",
}

const SEND_ERROR_MSGS: Record<string, string> = {
  en: "There was a problem sending. Write me directly at ",
  fr: "Problème lors de l'envoi. Écrivez-moi directement à ",
  es: "Hubo un problema al enviar. Escríbeme directamente a ",
}

const SENT_MSGS: Record<string, string> = {
  en: "Sent. I'll get back to you soon, ",
  fr: "Envoyé. Je vous recontacte bientôt, ",
  es: "Enviado. Me pondré en contacto contigo pronto, ",
}

const CONTACT_PROMPTS: Record<string, string> = {
  en: "Perfect. Drop your name and best way to reach you — email or phone — and I'll get back to you within a day.",
  fr: "Parfait. Laissez-moi votre nom et votre contact — email ou téléphone — et je vous réponds dans la journée.",
  es: "Perfecto. Déjame tu nombre y cómo contactarte — email o teléfono — y te respondo en un día.",
}

const FOLLOWUP_MSGS: Record<string, string> = {
  en: "Got it. Any questions about how I work, my stack, or availability? When you're ready, hit the button and I'll reach out.",
  fr: "Très bien. Des questions sur ma façon de travailler, ma stack ou mes disponibilités ? Quand vous êtes prêt, cliquez sur le bouton.",
  es: "Entendido. ¿Tienes preguntas sobre cómo trabajo, mi stack o disponibilidad? Cuando estés listo, pulsa el botón.",
}

export function useChatConversation(locale = "en") {
  const lang = ["en", "fr", "es"].includes(locale) ? locale : "en"
  const [msgs,          setMsgs]          = useState<Msg[]>([])
  const [phase,         setPhase]         = useState<Phase>("qualify")
  const [aiChips,       setAiChips]       = useState<string[]>([])
  const [loading,       setLoading]       = useState(false)
  const [started,       setStarted]       = useState(false)
  const [input,         setInput]         = useState("")
  const [qualify,       setQualify]       = useState<QualifyData | null>(null)
  const [cName,         setCName]         = useState("")
  const [cContact,      setCContact]      = useState("")
  const [sending,       setSending]       = useState(false)
  const [sent,          setSent]          = useState(false)

  const historyRef      = useRef<Array<{ role: "user" | "assistant"; content: string }>>([])
  const honeypotRef     = useRef("")
  const turnstileTokenRef = useRef<string | null>(null)

  const enterContact = useCallback((botText?: string) => {
    const msg = botText || CONTACT_PROMPTS[lang]
    historyRef.current = [...historyRef.current, { role: "assistant", content: msg }]
    setMsgs(m => [...m.filter(x => x.type !== "typing"), { role: "bot", text: msg }])
    setAiChips([])
    setPhase("contact")
  }, [lang])

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    if (["Ready to connect", "Prêt à me contacter", "Listo para conectar"].includes(trimmed) && phase === "qa") { enterContact(); return }

    // "Skip" is sent to the AI as a real signal so it moves to the next question or wraps up.
    const isSkip = SKIP_WORDS.includes(trimmed)
    const payload = isSkip ? "I'd rather skip that one." : trimmed

    setInput("")
    setAiChips([])

    historyRef.current = [...historyRef.current, { role: "user", content: payload }]
    setMsgs(m => [...m, { role: "user", text: trimmed }])
    setLoading(true)
    setMsgs(m => [...m, { role: "bot", type: "typing", text: "" }])

    // Honeypot: bots fill hidden fields, humans don't
    if (honeypotRef.current) return

    let accumulated = ""
    try {
      const res = await fetch("/api/chat/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyRef.current,
          _hp: honeypotRef.current,
          _ts: turnstileTokenRef.current,
        }),
      })
      if (res.status === 429) {
        setMsgs(m => [...m.filter(x => x.type !== "typing"), { role: "bot", text: RATE_LIMIT_MSGS[lang] + appConfig.email }])
        setLoading(false)
        return
      }
      if (!res.ok || !res.body) throw new Error("stream error")

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value)
      }

      const jsonStart = accumulated.indexOf('{"event":')
      const jsonBlock = jsonStart !== -1 ? extractJson(accumulated, jsonStart) : null
      const cleanText = jsonBlock ? accumulated.replace(jsonBlock, "").trim() : accumulated.trim()

      let ev: { event: string; data?: Record<string, string> } | null = null
      if (jsonBlock) {
        try { ev = JSON.parse(jsonBlock) } catch { /* ignore */ }
      }

      if (ev?.event === "qualify_done" && ev.data) {
        const q = ev.data as unknown as QualifyData
        setQualify(q)
        setPhase("qa")
        const rows = (Object.keys(QUALIFY_LABELS) as Array<keyof QualifyData>)
          .filter(k => q[k] && q[k] !== "—")
          .map(k => ({ label: QUALIFY_LABELS[k], value: q[k] }))
        const summaryMsg: Msg = { role: "bot", type: "summary", text: "Project brief", rows }
        const followupText = parseChips(cleanText).text || FOLLOWUP_MSGS[lang]
        const followupMsg: Msg = { role: "bot", text: followupText }
        historyRef.current = [...historyRef.current, { role: "assistant", content: followupText }]
        setMsgs(m => [...m.filter(x => x.type !== "typing"), summaryMsg, followupMsg])
        setAiChips([])
      } else if (ev?.event === "qa_done") {
        enterContact(cleanText)
      } else {
        // Normal bot question/answer — pull any AI-suggested quick-reply chips off the last line.
        const { text: botText, chips: parsedChips } = parseChips(cleanText)
        historyRef.current = [...historyRef.current, { role: "assistant", content: botText }]
        setMsgs(m => [...m.filter(x => x.type !== "typing"), { role: "bot", text: botText }])
        if (phase === "qualify") setAiChips(parsedChips)
        else setAiChips([])
      }
    } catch {
      setMsgs(m => [...m.filter(x => x.type !== "typing"), { role: "bot", text: ERROR_MSGS[lang] }])
    } finally {
      setLoading(false)
    }
  }, [loading, phase, enterContact, lang])

  const submitContact = useCallback(async (qualify: QualifyData | null) => {
    const name    = cName.trim()
    const contact = cContact.trim()
    if (!name || !contact || sending) return
    setSending(true)
    setMsgs(m => [...m, { role: "user", text: `${name} — ${contact}` }])
    try {
      const greetingValues = Object.values(GREETINGS)
      const conversation = historyRef.current
        .filter(m => !greetingValues.includes(m.content))
        .map(m => ({ role: m.role === "user" ? "Visitor" : "Tom's assistant", text: m.content }))
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, contact,
          stage:    qualify?.stage    ?? "—",
          goal:     qualify?.goal     ?? "—",
          scope:    qualify?.scope    ?? "—",
          selling:  qualify?.selling  ?? "—",
          design:   qualify?.design   ?? "—",
          timeline: qualify?.timeline ?? "—",
          budget:   qualify?.budget   ?? "—",
          context:  qualify?.context  ?? "—",
          conversation,
        }),
      })
      if (res.ok) {
        setSent(true)
        setPhase("done")
        setMsgs(m => [...m, { role: "bot", text: SENT_MSGS[lang] + `${name}.` }])
      } else {
        setMsgs(m => [...m, { role: "bot", text: SEND_ERROR_MSGS[lang] + appConfig.email }])
      }
    } catch {
      setMsgs(m => [...m, { role: "bot", text: SEND_ERROR_MSGS[lang] + appConfig.email }])
    } finally {
      setSending(false)
    }
  }, [cName, cContact, sending, lang])

  const startConv = useCallback(() => {
    if (started) return
    setStarted(true)
    // Seed the opening bot turn locally — no API call. The greeting is recorded
    // as an assistant message so the AI has context once the user replies.
    const greeting = GREETINGS[lang]
    historyRef.current = [{ role: "assistant", content: greeting }]
    setMsgs([{ role: "bot", text: greeting }])
    setAiChips(FIRST_CHIPS[lang] ?? FIRST_CHIPS.en)
  }, [started, lang])

  const PROG_LABELS: Record<string, [string, string, string, string, string]> = {
    en: ["Free questions", "Contact info", "Done ✓", "Tom's assistant", "Project brief"],
    fr: ["Questions libres", "Coordonnées", "Terminé ✓", "Assistant de Tom", "Brief projet"],
    es: ["Preguntas libres", "Datos de contacto", "Listo ✓", "Asistente de Tom", "Brief del proyecto"],
  }
  const [qaLabel, contactLabel, doneLabel, assistantLabel, qualifyLabel] = PROG_LABELS[lang]

  const prog = phase === "qualify"
    ? qualifyLabel
    : phase === "qa"
    ? qaLabel
    : phase === "contact"
    ? contactLabel
    : doneLabel

  const skipWord = lang === "fr" ? "Passer" : lang === "es" ? "Saltar" : "Skip"
  const qaChips = QA_CHIPS[lang] ?? QA_CHIPS.en
  // Qualify chips come from the AI per question; always offer a skip alongside them.
  const chips = phase === "qualify"
    ? (aiChips.length > 0 ? [...aiChips, skipWord] : [])
    : phase === "qa"
    ? qaChips
    : []

  return {
    msgs, phase, loading, input, setInput,
    cName, setCName, cContact, setCContact,
    sending, sent, qualify, prog, chips,
    assistantLabel,
    honeypotRef,
    turnstileTokenRef,
    send, enterContact,
    submitContact: () => submitContact(qualify),
    startConv,
  }
}
