import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const TO = "thomas.augot@gmail.com"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })

  const { name, email, company, message, project } = body

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 422 })
  }

  const { error } = await resend.emails.send({
    from: "Portfolio Contact <onboarding@resend.dev>",
    to: TO,
    replyTo: email,
    subject: `New inquiry — ${project || "General"} — ${name}`,
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      `Company: ${company || "—"}`,
      `Project type: ${project || "—"}`,
      "",
      message,
    ].join("\n"),
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
