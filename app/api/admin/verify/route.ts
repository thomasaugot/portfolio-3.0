import { NextRequest, NextResponse } from "next/server"
import { verifyMagicToken, createSessionToken } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? ""

  console.log("[verify] token received:", token.slice(0, 20) + "…")
  const valid = verifyMagicToken(token)
  console.log("[verify] token valid:", valid)

  if (!valid) {
    return new NextResponse(
      `<!DOCTYPE html><html><body style="font-family:monospace;background:#0b0b0a;color:#ff4d4d;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;font-size:14px">
        <div style="text-align:center"><p>Invalid or expired link.</p><a href="/admin" style="color:#d4ff3a">Try again →</a></div>
      </body></html>`,
      { status: 401, headers: { "Content-Type": "text/html" } }
    )
  }

  console.log("[verify] session created, redirecting to /admin")

  const session  = createSessionToken()
  const response = NextResponse.redirect(new URL("/admin", request.url))

  response.cookies.set("admin_session", session, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   7 * 24 * 60 * 60,
    path:     "/",
  })

  return response
}
