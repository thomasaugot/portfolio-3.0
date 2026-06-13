You are writing a Medium article for a developer audience on behalf of Thomas Augot — a full-stack developer who writes practical — hands-on — experience-driven technical content.

Topic: How to protect an AI-powered chatbot from bot abuse without ruining the user experience

Working title: [Leave blank — suggest one]

Key angle / main argument: The moment you ship an AI chat feature, you've created an open billing target. A layered defence — cheap synchronous checks first, expensive ones last — stops automated abuse without adding any friction for real users. The stack: IP rate limiting, honeypot field, Cloudflare Turnstile invisible mode, message count cap, input length cap. Each layer is simple on its own. Together they cover almost every attack vector a script will throw at a personal site or small product.

Personal context to include: I shipped a Gemini-powered qualifying chatbot on my portfolio site. It asks potential clients five questions then routes them to a contact form. After deploying I realised the endpoint was completely open — any script could hammer it and run up my API bill with zero effort. I added protection in layers, starting with what costs nothing and ending with Cloudflare Turnstile. Adding Turnstile's invisible mode also forced me to write a proper privacy policy and a GDPR cookie consent modal — both things I'd been putting off. The project ended up more complete than I planned, which is usually how it goes.

Related previous articles to reference:
https://medium.com/@thomasaugot/how-i-got-my-next-js-portfolio-to-score-100-on-lighthouse-accessibility-0405c3582f3a?postPublishedType=initial
https://medium.com/@thomasaugot/optimizing-gsap-animations-in-next-js-15-best-practices-for-initialization-and-cleanup-2ebaba7d0232
https://medium.com/@thomasaugot/make-your-website-multilingual-with-react-i18next-4b247bb651a0

Supporting material:

The examples below use Next.js App Router and Google Gemini, but every concept is framework and model-agnostic. The same patterns work with OpenAI, Anthropic, or any other API you're paying per token for.

--- LAYER 1: IP rate limiting ---

Keep a sliding window counter per IP in memory. Fast, free, zero dependencies.

```ts
const ipRequests = new Map<string, { count: number; windowStart: number }>()
const WINDOW_MS = 60 * 60 * 1000 // 1 hour
const MAX_REQUESTS = 20

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

const ip =
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
  req.headers.get("x-real-ip") ??
  "unknown"

if (isRateLimited(ip)) return new Response("rate_limit", { status: 429 })
```

Limitation to name: in-memory means it resets on every server restart and doesn't share state across multiple serverless instances. For production scale, swap the Map for Redis or a KV store. For a personal site with a single instance, it's fine.

--- LAYER 2: Honeypot field ---

A hidden input that humans never see or touch. Bots fill it. If it has a value, reject the request silently.

```tsx
// In your React component — visually hidden but present in the DOM:
<input
  type="text"
  name="website"
  autoComplete="off"
  tabIndex={-1}
  aria-hidden="true"
  onChange={e => { honeypotRef.current = e.target.value }}
  className="absolute opacity-0 pointer-events-none w-0 h-0"
/>

// Client-side guard before fetch:
if (honeypotRef.current) return

// Sent in the request body:
body: JSON.stringify({ messages, _hp: honeypotRef.current })
```

```ts
// Server-side check:
const { messages, _hp } = await req.json()
if (_hp) return new Response("bad_request", { status: 400 })
```

Do not use type="hidden" or display:none. Bots look for input fields in the DOM — they need to be able to find and fill this one. CSS opacity and pointer-events hide it from humans without removing it from the document.

--- LAYER 3: Cloudflare Turnstile (invisible CAPTCHA) ---

Turnstile runs a silent browser analysis when the page loads and produces a token. You verify that token server-side before touching your AI API.

```tsx
// Client — install @marsidev/react-turnstile, then:
const turnstileToken = useRef<string | null>(null)

<Turnstile
  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
  onSuccess={token => { turnstileToken.current = token }}
  onExpire={() => { turnstileToken.current = null }}
  options={{ appearance: "execute" }}
  className="hidden"
/>

// Include the token in every request:
body: JSON.stringify({ messages, _hp: honeypotRef.current, _ts: turnstileToken.current })
```

```ts
// Server-side verification:
const { messages, _hp, _ts } = await req.json()

if (!_ts) return new Response("missing_captcha", { status: 403 })

const tsRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    secret: process.env.TURNSTILE_SECRET_KEY,
    response: _ts,
  }),
})
const { success } = await tsRes.json()
if (!success) return new Response("invalid_captcha", { status: 403 })
```

Cloudflare's invisible mode requires you to reference the Turnstile Privacy Addendum in your privacy policy. It also means you need a cookie consent mechanism if you're targeting EU users. That's not optional — factor it into your timeline.

--- LAYERS 4 & 5: Message count and input length caps ---

```ts
const MAX_MESSAGES = 15
const MAX_INPUT_LENGTH = 2000

if (!Array.isArray(messages) || messages.length > MAX_MESSAGES) {
  return new Response("too_many_messages", { status: 400 })
}

const lastMessage = messages[messages.length - 1]
if (!lastMessage?.content || lastMessage.content.length > MAX_INPUT_LENGTH) {
  return new Response("input_too_long", { status: 400 })
}
```

These stop prompt injection through oversized payloads and limit how much context a single session can accumulate — both cost and quality issues.

--- The order matters ---

In the POST handler, checks run in this sequence:
1. API key present
2. IP rate limit (synchronous, in-memory)
3. Parse body
4. Honeypot check (synchronous)
5. Turnstile verification (one network call to Cloudflare)
6. Message count cap (synchronous)
7. Input length cap (synchronous)
8. Call the AI API

The Turnstile verification is the only async check before the AI call, and it only runs if the free checks all passed. You never pay for a Gemini/OpenAI token unless the request cleared every layer before it.

---

Write the article following ALL of these rules:

Voice and tone
- Write in first person — personal — honest — direct
- Start with a short — real admission or moment of doubt — never with a generic introduction
- Sound like a developer writing for other developers — not a content marketer writing about developers
- Be helpful without being preachy — the goal is always to save the reader time — not to lecture them
- Avoid presumptuousness — never imply the reader is doing it wrong or that I am so good — share what worked for you and why
- Confidence comes from specificity — not from assertive language
- Use "I" naturally — use "you" sparingly and only when directly addressing the reader's situation
- The article should feel like a conversation with a senior developer who figured something out and wants to share it clearly

Structure
- Open with a hook — a personal moment — a real number — a counterintuitive statement
- Include a brief section explaining what the article covers and why it matters
- Use H2 headers for major sections — H3 for subsections where needed
- End with a short — personal closing paragraph — not a generic "I hope this helps"
- Add a resources section at the end if linking to docs — tools — or related articles

Punctuation and formatting style
- Use comas between related phrases instead of hyphens, like this "," not like this "-"
- Lists are acceptable only when genuinely enumerable — not as a lazy substitute for prose
- Code blocks for every code example — no inline code for anything longer than a variable name
- Keep paragraphs short — two to four sentences at most
- No bullet point summaries at the end — no "key takeaways" boxes — no padding

Technical content
- Every claim should come with a code example — a real-world scenario — or a direct explanation of why it works
- Explain the why — not just the what — readers can read the docs themselves
- If something is a common mistake — say so directly — name it
- Point out subtle distinctions when they matter
- Mention known limitations or edge cases where relevant — do not oversell solutions

What to avoid
- Do not start with "In today's world of..." or any generic scene-setting opener
- Do not use the phrase "it's worth noting" — "as mentioned" — "simply" — "just" — or "easy"
- Do not pad the article with section recaps or transition sentences that restate what was just said
- Do not end with "feel free to reach out" or similar generic closings
- Do not add emojis
- Do not use passive voice where active voice is clearer

Length
- Aim for a 6 to 10 minute read — approximately 1500 to 2500 words
- Every sentence should earn its place — cut anything that doesn't add information or rhythm
