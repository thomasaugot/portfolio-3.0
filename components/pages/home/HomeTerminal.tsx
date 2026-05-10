"use client"

import { useEffect, useRef, useState } from "react"
import { useAppReadyContext } from "@/contexts/AppReadyContext"

const LINES = [
  { type: "prompt", text: "whoami" },
  { type: "out", text: "thomas_augot  # fullstack dev · las palmas, ES" },
  { type: "blank", text: "" },
  { type: "prompt", text: "cat stack.json" },
  { type: "key", text: "{" },
  { type: "pair", key: "  \"frontend\"", value: " [\"Next.js\", \"React\", \"TypeScript\"]," },
  { type: "pair", key: "  \"backend\"", value: " [\"Node.js\", \"PostgreSQL\", \"Docker\"]," },
  { type: "pair", key: "  \"mobile\"", value: " [\"React Native\", \"Expo\"]," },
  { type: "pair", key: "  \"animation\"", value: " [\"GSAP\", \"Three.js\"]" },
  { type: "key", text: "}" },
  { type: "blank", text: "" },
  { type: "prompt", text: "git log --oneline -5" },
  { type: "ok", text: "a9f3c1e feat: binter field-ops PWA · BLE + offline sync ✓" },
  { type: "ok", text: "b2e8d4f feat: dosxdos CMS + labour time tracker ✓" },
  { type: "ok", text: "c7a1f9b feat: energia solar canarias — full launch ✓" },
  { type: "ok", text: "d4c2e8a feat: galaga agency site · i18n, 3 locales ✓" },
  { type: "ok", text: "e9f7b3c fix: montadores offline sync + push notifs ✓" },
  { type: "blank", text: "" },
  { type: "prompt", text: "curl -s api/status | jq" },
  { type: "key", text: "{" },
  { type: "pair", key: "  \"open\"", value: " true," },
  { type: "pair", key: "  \"reply_in\"", value: " \"< 24h\"," },
  { type: "pair", key: "  \"tz\"", value: " \"Europe/Madrid\"," },
  { type: "pair", key: "  \"rate\"", value: " \"let's talk\"" },
  { type: "key", text: "}" },
  { type: "blank", text: "" },
]

export function HomeTerminal() {
  const { loaderGone } = useAppReadyContext()
  const [visibleCount, setVisibleCount] = useState(0)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loaderGone) return
    let i = 0
    const interval = setInterval(() => {
      i++
      setVisibleCount(i)
      if (i >= LINES.length) clearInterval(interval)
      if (bodyRef.current) {
        bodyRef.current.scrollTop = bodyRef.current.scrollHeight
      }
    }, 80)
    return () => clearInterval(interval)
  }, [loaderGone])

  return (
    <div className="terminal flex-1" aria-label="Code terminal — decorative" role="img">
      {/* Title bar */}
      <div className="flex items-center gap-2 py-2.5 px-3.5 border-b border-border bg-surface-2 shrink-0" aria-hidden="true">
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        <span className="flex-1 text-center text-[11px] text-text-subtle tracking-[0.05em]">thomas@las-palmas — ~/work</span>
        <div className="flex">
          <span className="text-[11px] text-text-subtle px-2 py-1 border border-transparent">bash</span>
          <span className="text-[11px] text-text px-2 py-1 border border-border-2 bg-bg">node</span>
        </div>
      </div>

      {/* Body */}
      <div ref={bodyRef} className="flex-1 px-[18px] pt-[18px] overflow-hidden relative">
        {LINES.map((line, idx) => {
          const shown = idx < visibleCount
          const isAnimating = visibleCount < LINES.length
          const isCurrentLast = idx === visibleCount - 1
          const h = shown ? "" : " invisible"

          if (line.type === "blank") return <div key={idx} className={`whitespace-pre min-h-[1.5em]${h}`} />
          if (line.type === "prompt") return (
            <div key={idx} className={`whitespace-pre min-h-[1.5em]${h}`}>
              <span className="text-primary">❯ </span>
              <span className="text-text">{line.text}</span>
              {isCurrentLast && isAnimating && <span className="term-cursor" />}
            </div>
          )
          if (line.type === "pair") return (
            <div key={idx} className={`whitespace-pre min-h-[1.5em]${h}`}>
              <span className="text-primary">{(line as { key: string; value: string }).key}</span>
              <span className="text-text-muted">:</span>
              <span className="text-(--color-str)">{(line as { key: string; value: string }).value}</span>
            </div>
          )
          if (line.type === "ok") return <div key={idx} className={`whitespace-pre min-h-[1.5em] text-ok${h}`}>{line.text}</div>
          if (line.type === "key") return <div key={idx} className={`whitespace-pre min-h-[1.5em] text-primary${h}`}>{line.text}</div>
          if (line.type === "str") return <div key={idx} className={`whitespace-pre min-h-[1.5em] text-(--color-str)${h}`}>{line.text}</div>
          return <div key={idx} className={`whitespace-pre min-h-[1.5em] text-text-muted${h}`}>{line.text}</div>
        })}
        {/* always rendered so height stays constant; visible only when animation finishes */}
        <div className={`whitespace-pre min-h-[1.5em]${visibleCount >= LINES.length ? "" : " invisible"}`}>
          <span className="text-primary">❯ </span>
          <span className="term-cursor" />
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border py-2 px-3.5 flex justify-between items-center text-[11px] text-text-subtle bg-surface-2 shrink-0">
        <div className="flex gap-3.5">
          <span><span className="text-primary">main</span></span>
          <span>node v22.3.0</span>
          <span>npm 10.x</span>
        </div>
        <span>UTF-8</span>
      </div>
    </div>
  )
}
