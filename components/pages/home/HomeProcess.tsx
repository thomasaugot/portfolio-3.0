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
    <section id="process" className="section-rule py-[clamp(80px,12vh,160px)]">
      <Shell>
        <div data-anim="section-head" className="grid grid-cols-[1fr_2fr] gap-gutter mb-14 items-end max-[720px]:grid-cols-1 max-[720px]:gap-4">
          <span data-anim="section-meta" className="text-caption font-mono text-text-subtle">{t("sections.process_meta")}</span>
          <ParticleHeading className="font-display font-semibold tracking-tight text-[clamp(2.5rem,5.4vw,5.5rem)] leading-[0.95]">{t("sections.process_title")}</ParticleHeading>
        </div>

        <div data-anim="proc-list" className="relative border border-border">
          {/* Lime rail that grows down the list as you scroll; step numbers light up as it passes */}
          <span data-anim="proc-rail" aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-[1] h-full w-[3px] origin-top scale-y-0 bg-primary" />
          {steps.map((step, idx) => (
            <div key={step.n} data-anim="proc-row" className={`proc-row border-r border-b border-border${idx === steps.length - 1 ? " border-b-0" : ""}`}>
              <span data-anim="proc-num" className="proc-num text-caption text-text-subtle">{step.n}</span>
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
