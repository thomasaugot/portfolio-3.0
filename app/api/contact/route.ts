import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const TO = "thomas.augot@gmail.com"

const sans = "-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif"

function buildChatEmail(data: {
  name: string
  contact: string
  goal: string
  stack: string
  timeline: string
  budget: string
  context: string
  conversation?: Array<{ role: string; text: string }>
}) {
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:10px 16px;font-family:${sans};font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#6b685f;width:110px;vertical-align:top;border-bottom:1px solid #e8e6de;">${label}</td>
      <td style="padding:10px 16px;font-family:${sans};font-size:14px;color:#1a1a17;border-bottom:1px solid #e8e6de;">${value || "—"}</td>
    </tr>`

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
            <span style="display:inline-block;font-family:${sans};font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#1a1a17;background:#d4ff3a;padding:4px 10px;">New inquiry</span>
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- Divider -->
    <tr><td style="padding-bottom:32px;"><div style="height:2px;background-color:#1a1a17;">&nbsp;</div></td></tr>

    <!-- From -->
    <tr><td style="padding-bottom:32px;">
      <p style="margin:0 0 6px;font-family:${sans};font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#6b685f;">From</p>
      <p style="margin:0 0 4px;font-family:${sans};font-size:28px;font-weight:700;letter-spacing:-0.04em;color:#1a1a17;line-height:1;">${data.name}</p>
      <p style="margin:0;font-family:${sans};font-size:14px;color:#6b685f;">${data.contact}</p>
    </td></tr>

    <!-- Project brief -->
    <tr><td style="padding-bottom:8px;">
      <p style="margin:0 0 12px;font-family:${sans};font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#6b685f;">Project brief</p>
      <table cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #1a1a17;border-collapse:collapse;">
        ${row("Goal", data.goal)}
        ${row("Stack", data.stack)}
        ${row("Timeline", data.timeline)}
        ${row("Budget", data.budget)}
        ${row("Context", data.context)}
      </table>
    </td></tr>

    <!-- Reply CTA -->
    <tr><td style="padding:28px 0;">
      <a href="mailto:${data.contact}" style="display:inline-block;font-family:${sans};font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#1a1a17;text-decoration:none;background:#d4ff3a;padding:12px 24px;border:2px solid #1a1a17;">Reply to ${data.name} →</a>
    </td></tr>

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
            <p style="margin:0;font-family:${sans};font-size:14px;color:#1a1a17;line-height:1.6;">${m.text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
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

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })

  // Chatbot flow (has 'name' + 'contact' + qualify fields)
  if (body.contact !== undefined && body.goal !== undefined) {
    const { name, contact, goal, stack, timeline, budget, context, conversation } = body
    if (!name || !contact) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 422 })
    }
    const { error } = await resend.emails.send({
      from: "helloimtom.dev <onboarding@resend.dev>",
      to: TO,
      replyTo: contact.includes("@") ? contact : undefined,
      subject: `New inquiry — ${goal || "project"} — ${name}`,
      html: buildChatEmail({ name, contact, goal, stack, timeline, budget, context, conversation }),
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  // Legacy simple form fallback
  const { name, email, company, message, project } = body
  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 422 })
  }
  const { error } = await resend.emails.send({
    from: "Portfolio Contact <onboarding@resend.dev>",
    to: TO,
    replyTo: email,
    subject: `New inquiry — ${project || "General"} — ${name}`,
    text: buildSimpleEmail({ name, email, company, message, project }),
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
