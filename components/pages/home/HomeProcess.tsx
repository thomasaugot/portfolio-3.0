"use client"
import { ParticleHeading } from "@/components/ui/ParticleHeading"
import { useTranslations } from "next-intl"
import { Shell } from "@/components/layout/Shell"

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
      <Shell>
        <div data-anim="section-head" className="grid grid-cols-[1fr_2fr] gap-gutter mb-14 items-end max-[720px]:grid-cols-1 max-[720px]:gap-4">
          <span className="text-caption font-mono text-text-subtle">{t("sections.process_meta")}</span>
          <ParticleHeading className="font-display font-semibold tracking-tight text-[clamp(2.5rem,5.4vw,5.5rem)] leading-[0.95]">{t("sections.process_title")}</ParticleHeading>
        </div>

        <div className="border border-border">
          {steps.map((step, idx) => (
            <div key={step.n} data-anim="proc-row" className={`proc-row border-r border-b border-border${idx === steps.length - 1 ? " border-b-0" : ""}`}>
              <span className="proc-num text-caption text-text-subtle">{step.n}</span>
              <h3 className="proc-title text-heading font-semibold tracking-[-0.02em] text-text">{step.t}</h3>
              <p className="proc-desc text-body text-text-muted leading-[1.6]">{step.d}</p>
              <span className="proc-time text-caption text-text-subtle tracking-wider">{step.time}</span>
            </div>
          ))}
        </div>
      </Shell>
    </section>
  )
}
