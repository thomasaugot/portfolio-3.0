"use client"

import { useTranslations } from "next-intl"

interface Bucket {
  label: string
  tags: string[]
}

interface Metric {
  n: string
  u: string
  lbl: string
}

interface Stack {
  buckets: Bucket[]
  metrics: Metric[]
}

export function HomeStack() {
  const t = useTranslations("home")
  const stack = t.raw("stack") as Stack

  const primaryTags = ["Next.js", "React", "TypeScript", "Node.js", "PostgreSQL", "React Native"]

  return (
    <section id="stack" className="page-section">
      <div className="shell">
        <div className="section-head">
          <span className="section-head-meta">{t("sections.stack_meta")}</span>
          <h2 className="section-head-title">{t("sections.stack_title")}</h2>
        </div>

        <div className="grid grid-cols-2 gap-12 items-start max-[720px]:grid-cols-1 max-[720px]:gap-8">
          <div>
            {stack.buckets.map((bucket) => (
              <div key={bucket.label} className="border-t border-border pt-4 mb-6">
                <p className="text-[11px] text-text-subtle tracking-[0.12em] uppercase mb-4">{bucket.label}</p>
                <div className="flex flex-wrap gap-2">
                  {bucket.tags.map((tag) => (
                    <span key={tag} className={`stack-tag${primaryTags.includes(tag) ? " primary" : ""}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="metrics-grid">
            {stack.metrics.map((m) => (
              <div key={m.lbl} className="metric-card">
                <div className="font-display text-[clamp(40px,5vw,72px)] font-semibold tracking-[-0.04em] leading-none text-text">
                  {m.n}<span className="text-primary">{m.u}</span>
                </div>
                <p className="text-[11px] text-text-subtle tracking-widest uppercase mt-2">{m.lbl}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
