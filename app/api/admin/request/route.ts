import { NextResponse } from "next/server"
import { createMagicToken } from "@/lib/admin-auth"

const ADMIN_EMAIL = "thomas.augot@gmail.com"

export async function POST() {
  const token   = createMagicToken()
  const base    = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
  const link    = `${base}/api/admin/verify?token=${encodeURIComponent(token)}`

  const res = await fetch("https://api.resend.com/emails", {
    method:  "POST",
    headers: {
      Authorization:  `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from:    "Admin <onboarding@resend.dev>",
      to:      ADMIN_EMAIL,
      subject: "Admin access link - helloimtom.dev",
      html: `
        <div style="font-family:monospace;background:#0b0b0a;color:#f4f1e8;padding:40px;max-width:480px;margin:0 auto">
          <p style="color:#d4ff3a;font-size:11px;letter-spacing:.15em;text-transform:uppercase;margin:0 0 24px">helloimtom.dev — Admin</p>
          <h2 style="font-size:20px;font-weight:600;margin:0 0 12px;color:#f4f1e8">Access link requested</h2>
          <p style="color:#a3a097;font-size:14px;margin:0 0 32px">Click below to sign in. Valid for <strong style="color:#f4f1e8">15 minutes</strong>.</p>
          <a href="${link}" style="display:inline-block;background:#d4ff3a;color:#000;padding:14px 28px;font-weight:700;font-size:13px;letter-spacing:.05em;text-decoration:none">
            Access admin →
          </a>
          <p style="color:#6b685f;font-size:11px;margin-top:32px">If you didn't request this, ignore this email.</p>
        </div>
      `,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error("[admin/request] Resend error:", body)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
