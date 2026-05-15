"use client"
import { ParticleHeading } from "@/components/ui/ParticleHeading"

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
    <section id="process" className="py-[clamp(80px,12vh,160px)] border-t border-border">
      <div className="shell">
        <div className="grid grid-cols-[1fr_2fr] gap-(--gutter) mb-14 items-end max-[720px]:grid-cols-1 max-[720px]:gap-4">
          <span className="font-mono text-[12px] text-text-subtle">{t("sections.process_meta")}</span>
          <ParticleHeading className="font-display font-semibold tracking-tight text-[clamp(2.5rem,5.4vw,5.5rem)] leading-[0.95]">{t("sections.process_title")}</ParticleHeading>
        </div>

        <div className="border-t border-border">
          {steps.map((step) => (
            <div key={step.n} className="proc-row">
              <span className="proc-num text-[13px] text-text-subtle">{step.n}</span>
              <h3 className="proc-title font-display text-[clamp(20px,2.4vw,32px)] font-semibold tracking-[-0.02em] text-text">{step.t}</h3>
              <p className="proc-desc text-text-muted text-[16px] leading-[1.6]">{step.d}</p>
              <span className="proc-time text-[12px] text-text-subtle tracking-wider">{step.time}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
