import crypto from "crypto"

function secret(): string {
  if (!process.env.ADMIN_SECRET) throw new Error("ADMIN_SECRET is not set")
  return process.env.ADMIN_SECRET
}

function hmacEq(a: string, b: string): boolean {
  const ba = Buffer.from(a, "hex")
  const bb = Buffer.from(b, "hex")
  if (ba.length !== bb.length) return false
  return crypto.timingSafeEqual(ba, bb)
}

// ── Magic link token ───────────────────────────────────────────────────
// Self-verifying: HMAC(secret, "magic:<exp>").<exp>
// No storage needed — expires in 15 min.

export function createMagicToken(): string {
  const exp = Date.now() + 15 * 60 * 1000
  const sig = crypto.createHmac("sha256", secret()).update(`magic:${exp}`).digest("hex")
  return `${sig}.${exp}`
}

export function verifyMagicToken(token: string): boolean {
  try {
    const dot = token.lastIndexOf(".")
    const sig = token.slice(0, dot)
    const exp = parseInt(token.slice(dot + 1), 10)
    if (!exp || Date.now() > exp) return false
    const expected = crypto.createHmac("sha256", secret()).update(`magic:${exp}`).digest("hex")
    return hmacEq(sig, expected)
  } catch {
    return false
  }
}

// ── Session token ──────────────────────────────────────────────────────
// Self-verifying: HMAC(secret, "session:<iat>").<iat>
// Stored as httpOnly cookie, valid for 7 days.

export function createSessionToken(): string {
  const iat = Date.now()
  const sig = crypto.createHmac("sha256", secret()).update(`session:${iat}`).digest("hex")
  return `${sig}.${iat}`
}

export function verifySession(token: string): boolean {
  try {
    const dot = token.lastIndexOf(".")
    const sig = token.slice(0, dot)
    const iat = parseInt(token.slice(dot + 1), 10)
    if (!iat || Date.now() > iat + 7 * 24 * 60 * 60 * 1000) return false
    const expected = crypto.createHmac("sha256", secret()).update(`session:${iat}`).digest("hex")
    return hmacEq(sig, expected)
  } catch {
    return false
  }
}
