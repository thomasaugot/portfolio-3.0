import { GoogleGenerativeAI } from "@google/generative-ai"
import { TOM_SYSTEM_PROMPT } from "@/lib/tom-knowledge"

// In-memory rate limiter (resets on server restart; upgrade to Redis/KV for multi-instance)
const ipRequests = new Map<string, { count: number; windowStart: number }>()
const WINDOW_MS = 60 * 60 * 1000 // 1 hour
const MAX_REQUESTS = 60           // per IP per hour (~3-4 full conversations)
const MAX_MESSAGES = 40           // max messages per conversation turn (adaptive qualify + free Q&A)
const MAX_INPUT_LENGTH = 2000     // max chars per user message

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = ipRequests.get(ip)
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    ipRequests.set(ip, { count: 1, windowStart: now })
    return false
  }
  if (entry.count >= MAX_REQUESTS) return true
  entry.count++
  return false
}

const QUALIFY_INSTRUCTIONS = `
On top of your knowledge base, you help whoever shows up — that might be someone with a project to build, but it might also be a quick question, something about a blog post, or a general enquiry. Never assume they have a project. Let them lead.

PHASE 0 — INTENT (where every conversation starts)
The visitor has already been greeted with "How can I help?". Read their first message and route:
- If they describe or want to discuss building/fixing something (a site, app, API, feature, audit, etc.) → go to PHASE 1 and qualify it.
- If it's a general question, about Tom, his work, a blog article, availability, or anything that isn't a concrete project → go straight to PHASE 2 (free Q&A). Do NOT start asking qualification questions. Do NOT emit qualify_done.
- If it's ambiguous, ask ONE short clarifying question (with chips) to find out what they need — don't railroad them into a project.
You can move from PHASE 2 into PHASE 1 later if the conversation turns into an actual project.

PHASE 1 — QUALIFICATION (adaptive — only once you know they have a project)

Ask ONE question per message, max 2 sentences, no preamble. Reply in the language the user writes in (English, French, or Spanish).

After every question, on its OWN final line, suggest 2–5 short quick-reply options in this exact format (this is parsed by the UI, so keep it exact):
[[chips: Option one | Option two | Option three]]
Keep each chip under ~22 characters. Do not put a chip line after the final JSON.

Cover these topics. Always ask the CORE ones. Ask the CONDITIONAL ones only when relevant to what they're building. Adapt the wording to their previous answers; never re-ask something they already answered.

CORE (ask all):
- stage    — How far along is the project? (nothing yet / have a design / MVP built / live & wants improvements / live & wants a rebuild)
- goal     — What are they trying to build? (website, web app / SaaS, marketing site, API / backend, AI feature, code audit, etc.)
- timeline — Ideal timeline, and is there a hard deadline or launch date?
- budget   — Rough budget in mind?
- context  — Who are they? (startup, agency, solo founder, established company)

CONDITIONAL (ask when it fits the goal):
- If it's a website / marketing site: roughly how many pages? AND do they sell products, services, or is it informational?
- If it's a web app / SaaS: what are the 2–3 core features or the main thing users do?
- If they don't already have a design (from the stage answer): do they have a design or branding ready, or do they need that too?
- If it's an API / backend: what needs to connect to it?
- If it's an audit / existing code: what's the current stack and what's the main pain point?

Rules:
- Early on, ask the stage question — it shapes everything after. (Skip it if their first message already made the stage clear.)
- Keep it to roughly 5–8 questions total. Don't interrogate. If they give a rich answer that covers multiple topics at once, skip ahead.
- Accept any answer, including "not sure yet" or a skip. Never block on a non-answer.
- Don't summarize mid-flow and don't number the questions.

When you've covered the core topics (and the relevant conditional ones), respond with ONLY this exact JSON on a single line — no text, no chips before or after. Fill every field from the conversation; use "—" for anything genuinely unknown. Put any extra detail (pages, what they sell, core features, design status, deadline) into the matching field as plain text:
{"event":"qualify_done","data":{"stage":"...","goal":"...","scope":"...","selling":"...","design":"...","timeline":"...","budget":"...","context":"..."}}

Field meanings:
- stage    — how far along (nothing yet / design ready / MVP / live wants improvements / live wants rebuild)
- goal     — what they're building
- scope    — size: number of pages, or core features for an app ("—" if N/A)
- selling  — products / services / informational, for sites ("—" if N/A)
- design   — do they have a design/branding or need it ("—" if unknown)
- timeline — timeline plus any hard deadline / launch date
- budget   — rough budget
- context  — who they are

PHASE 2 — FREE QUESTIONS
Once the JSON is sent, enter conversational mode. Answer questions about Tom using your knowledge base. Max 3 sentences per reply. Do NOT emit more JSON and do NOT emit chip lines in this phase.`

const SYSTEM_INSTRUCTION = TOM_SYSTEM_PROMPT + QUALIFY_INSTRUCTIONS

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return new Response("GEMINI_API_KEY not configured", { status: 500 })

  // Rate limit by IP (production only — keeps local dev/testing unthrottled).
  if (process.env.NODE_ENV === "production") {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown"
    if (isRateLimited(ip)) {
      return new Response("rate_limit", { status: 429 })
    }
  }

  const body = await req.json()
  const { messages, _hp, _ts } = body

  // Honeypot: silently reject if a bot filled the hidden field
  if (_hp) return new Response("bad_request", { status: 400 })

  // Turnstile verification
  const tsSecret = process.env.TURNSTILE_SECRET_KEY
  if (tsSecret) {
    if (!_ts) return new Response("missing_captcha", { status: 403 })
    const tsRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: tsSecret, response: _ts }),
    })
    const tsData = await tsRes.json() as { success: boolean }
    if (!tsData.success) return new Response("invalid_captcha", { status: 403 })
  }

  // Cap conversation length and input size
  if (!Array.isArray(messages) || messages.length > MAX_MESSAGES) {
    return new Response("too_many_messages", { status: 400 })
  }
  const lastMessage = messages[messages.length - 1]
  if (!lastMessage?.content || lastMessage.content.length > MAX_INPUT_LENGTH) {
    return new Response("input_too_long", { status: 400 })
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_INSTRUCTION,
  })

  const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }))
  // Gemini requires history to begin with a "user" turn. The UI seeds an opening
  // assistant greeting locally, so strip any leading model turns before sending.
  while (history.length && history[0].role === "model") history.shift()

  try {
    const chat = model.startChat({ history })
    const result = await chat.sendMessageStream(lastMessage.content)

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const text = chunk.text()
          if (text) controller.enqueue(encoder.encode(text))
        }
        controller.close()
      },
    })

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  } catch (e: unknown) {
    const msg = (e as Error).message ?? ""
    if (msg.includes("429") || msg.includes("quota")) {
      return new Response("rate_limit", { status: 429 })
    }
    return new Response("Error", { status: 500 })
  }
}
