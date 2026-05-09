"use client"
import { ParticleHeading } from "@/components/ui/ParticleHeading"

import { useTranslations } from "next-intl"
import { IconArrowOut } from "@/components/ui/Icons"

interface Service {
  n: string
  t: string
  d: string
  tags: string[]
}

export function HomeServices() {
  const t = useTranslations("home")
  const services = t.raw("services") as Service[]

  return (
    <section id="services" className="py-[clamp(80px,12vh,160px)] border-t border-border">
      <div className="shell">
        <div className="grid grid-cols-[1fr_2fr] gap-(--gutter) mb-14 items-end max-[720px]:grid-cols-1 max-[720px]:gap-4">
          <span className="font-mono text-[12px] text-text-subtle">{t("sections.services_meta")}</span>
          <ParticleHeading className="font-display font-semibold tracking-tight text-[clamp(2.5rem,5.4vw,5.5rem)] leading-[0.95]">{t("sections.services_title")}</ParticleHeading>
        </div>

        <div className="grid grid-cols-2 border-t border-l border-border max-[720px]:grid-cols-1">
          {services.map((svc) => (
            <div key={svc.n} className="service-card">
              <div className="flex justify-between text-[11px] text-text-subtle mb-6">
                <span>{svc.n}</span>
                <span className="arrow-icon"><IconArrowOut size={14} /></span>
              </div>
              <h3 className="font-display text-[28px] font-semibold tracking-[-0.02em] mb-3.5 text-text">{svc.t}</h3>
              <p className="text-text-muted mb-6 flex-1 max-w-110 text-[14px] leading-[1.6]">{svc.d}</p>
              <div className="flex flex-wrap gap-1.5">
                {svc.tags.map((tag) => (
                  <span key={tag} className="tag-chip">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
