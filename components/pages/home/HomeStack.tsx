"use client"
import { ParticleHeading } from "@/components/ui/ParticleHeading"
import { TechTag } from "@/components/ui/TechTag"
import { useTranslations } from "next-intl"
import { Shell } from "@/components/layout/Shell"
import { WireOutline } from "@/components/ui/WireOutline"

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


  return (
    <section id="stack" className="section-rule py-[clamp(80px,12vh,160px)]">
      <Shell>
        <div data-anim="section-head" className="grid grid-cols-[1fr_2fr] gap-(--gutter) mb-14 items-end max-[720px]:grid-cols-1 max-[720px]:gap-4">
          <span data-anim="section-meta" className="font-mono text-[12px] text-text-subtle">{t("sections.stack_meta")}</span>
          <ParticleHeading className="font-display font-semibold tracking-tight text-[clamp(2.5rem,5.4vw,5.5rem)] leading-[0.95]">{t("sections.stack_title")}</ParticleHeading>
        </div>

        <div className="grid grid-cols-2 gap-12 items-start max-[720px]:grid-cols-1 max-[720px]:gap-8">
          <div>
            {stack.buckets.map((bucket) => (
              <div key={bucket.label} data-anim="stack-bucket" className="border-t border-border pt-4 mb-6">
                <p className="text-[11px] text-text-subtle tracking-[0.12em] uppercase mb-4">{bucket.label}</p>
                <div className="flex flex-wrap gap-2 pb-1 pr-1">
                  {bucket.tags.map((tag, i) => (
                    <TechTag key={`${bucket.label}-${i}`} tag={tag} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-0 border border-border">
            {stack.metrics.map((m, idx) => (
              <div key={m.lbl} data-anim="metric-card" className={`relative card-hover py-7 px-6 border-r border-b border-border${idx % 2 === 1 ? " border-r-0" : ""}${idx >= stack.metrics.length - 2 ? " border-b-0" : ""}`}>
                <WireOutline />
                <div className="font-display text-[clamp(40px,5vw,72px)] font-semibold tracking-[-0.04em] leading-none text-text">
                  <span data-anim="metric-num" data-value={m.n}>{m.n}</span><span className="text-primary">{m.u}</span>
                </div>
                <p className="text-[11px] text-text-subtle tracking-widest uppercase mt-2">{m.lbl}</p>
              </div>
            ))}
          </div>
        </div>
      </Shell>
    </section>
  )
}
