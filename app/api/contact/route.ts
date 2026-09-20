import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const TO = "thomas.augot@gmail.com"

const sans = "-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif"

// Everything a visitor typed lands inside an HTML email — escape it, always.
const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;")

const MAX_FIELD = 600
const MAX_MESSAGE = 5000
const MAX_TURNS = 60
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const isEmail = (v: unknown): v is string => typeof v === "string" && v.length <= 254 && EMAIL_RE.test(v)
// Coerce any incoming field to a bounded plain string (rejects objects/arrays, trims length).
const str = (v: unknown, max = MAX_FIELD) => (typeof v === "string" ? v.slice(0, max) : "")

function buildChatEmail(data: {
  name: string
  contact: string
  stage: string
  goal: string
  scope: string
  selling: string
  design: string
  timeline: string
  budget: string
  context: string
  conversation?: Array<{ role: string; text: string }>
  incomplete?: boolean
}) {
  // Skip rows that carry no real info (empty or "—") to keep the brief tight.
  const row = (label: string, value: string) => {
    const v = (value || "").trim()
    if (!v || v === "—") return ""
    return `
    <tr>
      <td style="padding:10px 16px;font-family:${sans};font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#6b685f;width:110px;vertical-align:top;border-bottom:1px solid #e8e6de;">${esc(label)}</td>
      <td style="padding:10px 16px;font-family:${sans};font-size:14px;color:#1a1a17;border-bottom:1px solid #e8e6de;">${esc(v)}</td>
    </tr>`
  }

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#f2f1ea;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f2f1ea;padding:48px 24px;">
  <tr><td align="center">
  <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

    <!-- Header -->
    <tr><td style="padding-bottom:32px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <p style="margin:0;font-family:${sans};font-size:18px;font-weight:700;letter-spacing:-0.03em;color:#1a1a17;">helloimtom<span style="color:#6b685f;">.dev</span></p>
          </td>
          <td align="right">
            <span style="display:inline-block;font-family:${sans};font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#1a1a17;background:#d4ff3a;padding:4px 10px;">${data.incomplete ? "Unfinished chat" : "New inquiry"}</span>
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- Divider -->
    <tr><td style="padding-bottom:32px;"><div style="height:2px;background-color:#1a1a17;">&nbsp;</div></td></tr>

    <!-- From / incomplete notice -->
    ${data.incomplete ? `
    <tr><td style="padding-bottom:32px;">
      <p style="margin:0;font-family:${sans};font-size:14px;line-height:1.6;color:#6b685f;">A visitor chatted with the assistant but left without leaving contact details. This is informational only — so you can see what people are asking about.</p>
    </td></tr>` : `
    <tr><td style="padding-bottom:32px;">
      <p style="margin:0 0 6px;font-family:${sans};font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#6b685f;">From</p>
      <p style="margin:0 0 4px;font-family:${sans};font-size:28px;font-weight:700;letter-spacing:-0.04em;color:#1a1a17;line-height:1;">${esc(data.name)}</p>
      <p style="margin:0;font-family:${sans};font-size:14px;color:#6b685f;">${esc(data.contact)}</p>
    </td></tr>`}

    <!-- Project brief -->
    <tr><td style="padding-bottom:8px;">
      <p style="margin:0 0 12px;font-family:${sans};font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#6b685f;">Project brief</p>
      <table cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #1a1a17;border-collapse:collapse;">
        ${row("Stage", data.stage)}
        ${row("Goal", data.goal)}
        ${row("Scope", data.scope)}
        ${row("Sells", data.selling)}
        ${row("Design", data.design)}
        ${row("Timeline", data.timeline)}
        ${row("Budget", data.budget)}
        ${row("Context", data.context)}
      </table>
    </td></tr>

    <!-- Reply CTA -->
    ${data.incomplete || !isEmail(data.contact) ? "" : `
    <tr><td style="padding:28px 0;">
      <a href="mailto:${esc(data.contact)}" style="display:inline-block;font-family:${sans};font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#1a1a17;text-decoration:none;background:#d4ff3a;padding:12px 24px;border:2px solid #1a1a17;">Reply to ${esc(data.name)} →</a>
    </td></tr>`}

    ${data.conversation && data.conversation.length > 0 ? `
    <!-- Divider -->
    <tr><td style="padding-bottom:28px;"><div style="height:1px;background-color:#d4d2ca;">&nbsp;</div></td></tr>

    <!-- Conversation -->
    <tr><td>
      <p style="margin:0 0 16px;font-family:${sans};font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#6b685f;">Full conversation</p>
      <table cellpadding="0" cellspacing="0" width="100%">
        ${data.conversation.map(m => `
        <tr>
          <td style="padding:10px 0;vertical-align:top;border-bottom:1px solid #e8e6de;">
            <p style="margin:0 0 4px;font-family:${sans};font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${m.role === "Tom's assistant" ? "#1a1a17" : "#6b685f"};">${m.role === "Tom's assistant" ? "[ TA ]" : "[ Visitor ]"}</p>
            <p style="margin:0;font-family:${sans};font-size:14px;color:#1a1a17;line-height:1.6;">${esc(m.text)}</p>
          </td>
        </tr>`).join("")}
      </table>
    </td></tr>` : ""}

    <!-- Footer -->
    <tr><td style="padding-top:40px;border-top:1px solid #d4d2ca;margin-top:32px;">
      <p style="margin:0;font-family:${sans};font-size:11px;color:#6b685f;letter-spacing:0.05em;">helloimtom.dev — automated via chatbot</p>
    </td></tr>

  </table>
  </td></tr>
</table>
</body>
</html>`
}

function buildSimpleEmail(data: {
  name: string
  email: string
  company?: string
  message: string
  project?: string
}) {
  return `Name: ${data.name}
Email: ${data.email}
Company: ${data.company || "—"}
Project type: ${data.project || "—"}

${data.message}`
}

// Subject lines are headers: strip anything that isn't plain printable text.
const subjectSafe = (v: string) => v.replace(/[\r\n\t]+/g, " ").slice(0, 120)

function pickBrief(body: Record<string, unknown>) {
  return {
    stage: str(body.stage), goal: str(body.goal), scope: str(body.scope), selling: str(body.selling),
    design: str(body.design), timeline: str(body.timeline), budget: str(body.budget), context: str(body.context),
  }
}

function pickConversation(v: unknown): Array<{ role: string; text: string }> | undefined {
  if (!Array.isArray(v)) return undefined
  return v.slice(0, MAX_TURNS).map((m) => {
    const o = (m && typeof m === "object" ? m : {}) as Record<string, unknown>
    return { role: str(o.role, 40), text: str(o.text, 2000) }
  })
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })

  // Abandoned chat — visitor left without leaving contact details. Informational only.
  if (body.incomplete) {
    const brief = pickBrief(body)
    const { error } = await resend.emails.send({
      from: "helloimtom.dev <onboarding@resend.dev>",
      to: TO,
      subject: subjectSafe(`Unfinished chat${brief.goal && brief.goal !== "—" ? ` — ${brief.goal}` : ""}`),
      html: buildChatEmail({
        name: "—", contact: "—",
        ...brief,
        conversation: pickConversation(body.conversation), incomplete: true,
      }),
    })
    if (error) { console.error("[contact] resend:", error); return NextResponse.json({ error: "Email failed" }, { status: 500 }) }
    return NextResponse.json({ ok: true })
  }

  // Chatbot flow (has 'name' + 'contact' + qualify fields)
  if (body.contact !== undefined && body.goal !== undefined) {
    const name = str(body.name, 120)
    const contact = str(body.contact, 254)
    if (!name || !contact) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 422 })
    }
    const brief = pickBrief(body)
    const { error } = await resend.emails.send({
      from: "helloimtom.dev <onboarding@resend.dev>",
      to: TO,
      replyTo: isEmail(contact) ? contact : undefined,
      subject: subjectSafe(`New inquiry — ${brief.goal || "project"} — ${name}`),
      html: buildChatEmail({ name, contact, ...brief, conversation: pickConversation(body.conversation) }),
    })
    if (error) { console.error("[contact] resend:", error); return NextResponse.json({ error: "Email failed" }, { status: 500 }) }
    return NextResponse.json({ ok: true })
  }

  // Legacy simple form fallback (plain-text email)
  const name = str(body.name, 120)
  const email = str(body.email, 254)
  const message = str(body.message, MAX_MESSAGE)
  const company = str(body.company, 120)
  const project = str(body.project, 120)
  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 422 })
  }
  if (!isEmail(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 422 })
  }
  const { error } = await resend.emails.send({
    from: "Portfolio Contact <onboarding@resend.dev>",
    to: TO,
    replyTo: email,
    subject: subjectSafe(`New inquiry — ${project || "General"} — ${name}`),
    text: buildSimpleEmail({ name, email, company, message, project }),
  })
  if (error) { console.error("[contact] resend:", error); return NextResponse.json({ error: "Email failed" }, { status: 500 }) }
  return NextResponse.json({ ok: true })
}
