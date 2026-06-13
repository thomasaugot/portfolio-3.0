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
  goal:     string
  stack:    string
  timeline: string
  budget:   string
  context:  string
}

const QUALIFY_LABELS: Record<keyof QualifyData, string> = {
  goal:     "Goal",
  stack:    "Tech / stack",
  timeline: "Timeline",
  budget:   "Budget",
  context:  "Context",
}

export const QUALIFY_CHIPS: Record<string, string[][]> = {
  en: [
    ["Web design", "Web app / SaaS", "Marketing site", "API / backend", "AI integration", "Code audit", "Not sure yet"],
    ["React / Next.js", "Node / Express", "Full-stack", "Flexible", "Skip"],
    ["ASAP", "1–3 months", "3–6 months", "Just exploring", "Skip"],
    ["< €3k", "€3k–8k", "€8k–20k", "> €20k", "Let's discuss", "Skip"],
    ["Early-stage startup", "Established company", "Agency", "Personal project", "Skip"],
  ],
  fr: [
    ["Web design", "Web app / SaaS", "Site marketing", "API / backend", "Intégration IA", "Audit de code", "Pas encore sûr"],
    ["React / Next.js", "Node / Express", "Full-stack", "Flexible", "Passer"],
    ["Dès que possible", "1–3 mois", "3–6 mois", "J'explore", "Passer"],
    ["< €3k", "€3k–8k", "€8k–20k", "> €20k", "À discuter", "Passer"],
    ["Startup", "Entreprise établie", "Agence", "Projet personnel", "Passer"],
  ],
  es: [
    ["Web design", "Web app / SaaS", "Sitio marketing", "API / backend", "Integración IA", "Auditoría de código", "Aún no lo sé"],
    ["React / Next.js", "Node / Express", "Full-stack", "Flexible", "Saltar"],
    ["Lo antes posible", "1–3 meses", "3–6 meses", "Solo explorando", "Saltar"],
    ["< €3k", "€3k–8k", "€8k–20k", "> €20k", "A discutir", "Saltar"],
    ["Startup", "Empresa establecida", "Agencia", "Proyecto personal", "Saltar"],
  ],
}

export const QA_CHIPS: Record<string, string[]> = {
  en: ["How do you work?", "What's your availability?", "Do you do design?", "Can you work with AI?", "Ready to connect"],
  fr: ["Comment travaillez-vous ?", "Quelles sont vos disponibilités ?", "Faites-vous du design ?", "Travaillez-vous avec l'IA ?", "Prêt à me contacter"],
  es: ["¿Cómo trabajas?", "¿Cuál es tu disponibilidad?", "¿Haces diseño?", "¿Trabajas con IA?", "Listo para conectar"],
}

const QUALIFY_NEXT_QUESTIONS = [
  "What stack are you working with, or are you flexible?",
  "What's your ideal timeline?",
  "Do you have a rough budget in mind?",
  "Last one — what's the context? Are you a startup, an agency, a solo founder?",
]

function extractJson(text: string, start: number): string | null {
  let depth = 0
  for (let i = start; i < text.length; i++) {
    if (text[i] === "{") depth++
    else if (text[i] === "}") { depth--; if (depth === 0) return text.slice(start, i + 1) }
  }
  return null
}

const GREETINGS: Record<string, string> = {
  en: "Hey, I want to tell you about a project.",
  fr: "Bonjour, je voudrais vous parler d'un projet.",
  es: "Hola, me gustaría contarle sobre un proyecto.",
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
  const [answeredCount, setAnsweredCount] = useState(0)
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
  const turnstileToken  = useRef<string | null>(null)

  const skip = useCallback(() => {
    if (loading || phase !== "qualify") return
    const nextCount = answeredCount + 1
    setAnsweredCount(nextCount)
    historyRef.current = [...historyRef.current, { role: "user", content: "—" }]
    setMsgs(m => [...m, { role: "user", text: lang === "fr" ? "Passer" : lang === "es" ? "Saltar" : "Skip" }])

    if (nextCount >= 5) {
      const userMsgs = historyRef.current.filter(m => m.role === "user").slice(-5)
      const keys: Array<keyof QualifyData> = ["goal", "stack", "timeline", "budget", "context"]
      const q = Object.fromEntries(keys.map((k, i) => [k, userMsgs[i]?.content === "—" ? "—" : (userMsgs[i]?.content ?? "—")])) as unknown as QualifyData
      setQualify(q)
      setPhase("qa")
      const rows = keys.filter(k => q[k] && q[k] !== "—").map(k => ({ label: QUALIFY_LABELS[k], value: q[k] }))
      const summaryMsg: Msg = { role: "bot", type: "summary", text: "Project brief", rows }
      const followupText = FOLLOWUP_MSGS[lang]
      const followupMsg: Msg = { role: "bot", text: followupText }
      historyRef.current = [...historyRef.current, { role: "assistant", content: followupText }]
      setMsgs(m => [...m.filter(x => x.type !== "typing"), summaryMsg, followupMsg])
    } else {
      const nextQ = QUALIFY_NEXT_QUESTIONS[nextCount - 1]
      historyRef.current = [...historyRef.current, { role: "assistant", content: nextQ }]
      setMsgs(m => [...m, { role: "bot", text: nextQ }])
    }
  }, [loading, phase, answeredCount])

  const enterContact = useCallback((botText?: string) => {
    const msg = botText || CONTACT_PROMPTS[lang]
    historyRef.current = [...historyRef.current, { role: "assistant", content: msg }]
    setMsgs(m => [...m.filter(x => x.type !== "typing"), { role: "bot", text: msg }])
    setPhase("contact")
  }, [])

  const send = useCallback(async (text: string, isGreeting = false) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    if (["Skip", "Passer", "Saltar"].includes(trimmed)) { skip(); return }
    if (["Ready to connect", "Prêt à me contacter", "Listo para conectar"].includes(trimmed) && phase === "qa") { enterContact(); return }

    setInput("")
    if (!isGreeting && phase === "qualify") setAnsweredCount(c => c + 1)

    historyRef.current = [...historyRef.current, { role: "user", content: trimmed }]
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
          _ts: turnstileToken.current,
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
        const followupText = cleanText || FOLLOWUP_MSGS[lang]
        const followupMsg: Msg = { role: "bot", text: followupText }
        historyRef.current = [...historyRef.current, { role: "assistant", content: followupText }]
        setMsgs(m => [...m.filter(x => x.type !== "typing"), summaryMsg, followupMsg])
      } else if (ev?.event === "qa_done") {
        enterContact(cleanText)
      } else {
        historyRef.current = [...historyRef.current, { role: "assistant", content: cleanText }]
        setMsgs(m => [...m.filter(x => x.type !== "typing"), { role: "bot", text: cleanText }])
      }
    } catch {
      setMsgs(m => [...m.filter(x => x.type !== "typing"), { role: "bot", text: ERROR_MSGS[lang] }])
    } finally {
      setLoading(false)
    }
  }, [loading, phase, skip, enterContact])

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
          goal:     qualify?.goal     ?? "—",
          stack:    qualify?.stack    ?? "—",
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
  }, [cName, cContact, sending])

  const startConv = useCallback(() => {
    if (started) return
    setStarted(true)
    send(GREETINGS[lang], true)
  }, [started, send, lang])

  const PROG_LABELS: Record<string, [string, string, string, string]> = {
    en: ["Free questions", "Contact info", "Done ✓", "Tom's assistant"],
    fr: ["Questions libres", "Coordonnées", "Terminé ✓", "Assistant de Tom"],
    es: ["Preguntas libres", "Datos de contacto", "Listo ✓", "Asistente de Tom"],
  }
  const [qaLabel, contactLabel, doneLabel] = PROG_LABELS[lang]

  const prog = phase === "qualify"
    ? `0${Math.min(answeredCount + 1, 5)} / 05`
    : phase === "qa"
    ? qaLabel
    : phase === "contact"
    ? contactLabel
    : doneLabel

  const localizedQualifyChips = QUALIFY_CHIPS[lang] ?? QUALIFY_CHIPS.en
  const qIdx = Math.min(answeredCount, localizedQualifyChips.length - 1)
  const qaChips = QA_CHIPS[lang] ?? QA_CHIPS.en
  const chips = phase === "qualify"
    ? localizedQualifyChips[qIdx] ?? []
    : phase === "qa"
    ? qaChips
    : []

  const [, , , assistantLabel] = PROG_LABELS[lang]

  return {
    msgs, phase, loading, input, setInput,
    cName, setCName, cContact, setCContact,
    sending, sent, qualify, prog, chips,
    assistantLabel,
    honeypotRef,
    turnstileToken,
    send, skip, enterContact,
    submitContact: () => submitContact(qualify),
    startConv,
  }
}
