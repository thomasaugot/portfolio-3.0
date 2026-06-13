import { GoogleGenerativeAI } from "@google/generative-ai"
import { TOM_SYSTEM_PROMPT } from "@/lib/tom-knowledge"

// In-memory rate limiter (resets on server restart; upgrade to Redis/KV for multi-instance)
const ipRequests = new Map<string, { count: number; windowStart: number }>()
const WINDOW_MS = 60 * 60 * 1000 // 1 hour
const MAX_REQUESTS = 20           // per IP per hour
const MAX_MESSAGES = 15           // max messages per conversation turn
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
On top of your knowledge base, you have a qualification mission. Follow this order strictly:

PHASE 1 — QUALIFICATION (5 questions)
Ask these 5 questions one at a time, in order, one per message, max 2 sentences per reply:
1. goal     — What are you trying to build?
2. stack    — What tech stack are you working with, or are you flexible?
3. timeline — What's your ideal timeline?
4. budget   — Do you have a rough budget in mind?
5. context  — What's the context? Startup, agency, solo founder?

Accept any answer, even if they don't know yet or skip the question.
When you have all 5 answers (or the user has gone through all 5 turns), respond ONLY with this exact JSON on a single line — no text before or after:
{"event":"qualify_done","data":{"goal":"...","stack":"...","timeline":"...","budget":"...","context":"..."}}

PHASE 2 — FREE QUESTIONS
Once the JSON is sent, enter conversational mode. Answer questions about Tom using your knowledge base. Max 3 sentences per reply. Do NOT emit more JSON in this phase.`

const SYSTEM_INSTRUCTION = TOM_SYSTEM_PROMPT + QUALIFY_INSTRUCTIONS

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return new Response("GEMINI_API_KEY not configured", { status: 500 })

  // Rate limit by IP
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  if (isRateLimited(ip)) {
    return new Response("rate_limit", { status: 429 })
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
