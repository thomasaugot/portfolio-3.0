"use client"

import { useTranslations } from "next-intl"

interface ProcessStep {
  n: string
  t: string
  d: string
  time: string
}

export function HomeProcess() {
  const t = useTranslations("home")
  const steps = t.raw("process") as ProcessStep[]

  return (
    <section id="process" className="page-section">
      <div className="shell">
        <div className="section-head">
          <span className="section-head-meta">{t("sections.process_meta")}</span>
          <h2 className="section-head-title">{t("sections.process_title")}</h2>
        </div>

        <div className="border-t border-border">
          {steps.map((step) => (
            <div key={step.n} className="proc-row">
              <span className="text-[13px] text-text-subtle">{step.n}</span>
              <h3 className="font-display text-[clamp(22px,2.4vw,32px)] font-semibold tracking-[-0.02em] text-text">{step.t}</h3>
              <p className="text-text-muted text-[14px] max-w-135 leading-[1.6]">{step.d}</p>
              <span className="text-[12px] text-text-subtle text-right tracking-wider max-[720px]:text-left">{step.time}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
