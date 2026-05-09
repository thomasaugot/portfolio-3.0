"use client"

import { useEffect, useRef, useState } from "react"

const LINES = [
  { type: "prompt", text: "whoami" },
  { type: "out", text: "thomas_augot  # fullstack dev" },
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
  { type: "ok", text: "a9f3c1e feat: shipped binter tracker ✓" },
  { type: "ok", text: "b2e8d4f feat: dosxdos cms integration ✓" },
  { type: "ok", text: "c7a1f9b fix: offline sync montadores app ✓" },
  { type: "ok", text: "d4c2e8a feat: areco website launch ✓" },
  { type: "ok", text: "e9f7b3c feat: reloj laboral full-stack ✓" },
  { type: "blank", text: "" },
  { type: "prompt", text: "curl -s api/availability | jq .status" },
  { type: "str", text: "\"open_for_projects\"" },
  { type: "blank", text: "" },
  { type: "prompt", text: "_" },
]

export function HomeTerminal() {
  const [visibleCount, setVisibleCount] = useState(0)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
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
  }, [])

  return (
    <div className="terminal">
      {/* Title bar */}
      <div className="term-bar">
        <span className="term-dot term-dot-red" />
        <span className="term-dot term-dot-amber" />
        <span className="term-dot term-dot-green" />
        <span className="term-title">thomas@las-palmas — ~/work</span>
        <div className="flex">
          <span className="term-tab">bash</span>
          <span className="term-tab term-tab-active">node</span>
        </div>
      </div>

      {/* Body */}
      <div ref={bodyRef} className="term-body">
        {LINES.slice(0, visibleCount).map((line, idx) => {
          if (line.type === "blank") return <div key={idx} className="term-line" />
          if (line.type === "prompt") return (
            <div key={idx} className="term-line">
              <span className="term-prompt">❯ </span>
              <span className="term-cmd">{line.text}</span>
              {idx === visibleCount - 1 && <span className="term-cursor" />}
            </div>
          )
          if (line.type === "pair") return (
            <div key={idx} className="term-line">
              <span className="term-key">{(line as { key: string; value: string }).key}</span>
              <span className="term-out">:</span>
              <span className="term-str">{(line as { key: string; value: string }).value}</span>
            </div>
          )
          if (line.type === "ok") return <div key={idx} className="term-line term-ok">{line.text}</div>
          if (line.type === "key") return <div key={idx} className="term-line term-key">{line.text}</div>
          if (line.type === "str") return <div key={idx} className="term-line term-str">{line.text}</div>
          return <div key={idx} className="term-line term-out">{line.text}</div>
        })}
        {visibleCount >= LINES.length && (
          <div className="term-line">
            <span className="term-prompt">❯ </span>
            <span className="term-cursor" />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="term-foot">
        <div style={{ display: "flex", gap: "14px" }}>
          <span><span className="term-branch">main</span></span>
          <span>node v22.3.0</span>
          <span>npm 10.x</span>
        </div>
        <span>UTF-8</span>
      </div>
    </div>
  )
}
