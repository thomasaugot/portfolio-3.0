"use client"
import { ParticleHeading } from "@/components/ui/ParticleHeading"
import { TechTag } from "@/components/ui/TechTag"
import { useTranslations } from "next-intl"
import { IconArrowOut } from "@/components/ui/Icons"
import { Shell } from "@/components/layout/Shell"

interface Service {
  n: string
  t: string
  d: string
  tags: string[]
}

export function HomeServices() {
  const t = useTranslations("home")
  const services = t.raw("services") as Service[]
  const cols = 2

  return (
    <section id="services" className="py-[clamp(80px,12vh,160px)] border-t border-border">
      <Shell>
        <div className="grid grid-cols-[1fr_2fr] gap-(--gutter) mb-14 items-end max-[720px]:grid-cols-1 max-[720px]:gap-4">
          <span className="font-mono text-[12px] text-text-subtle">{t("sections.services_meta")}</span>
          <ParticleHeading className="font-display font-semibold tracking-tight text-[clamp(2.5rem,5.4vw,5.5rem)] leading-[0.95]">{t("sections.services_title")}</ParticleHeading>
        </div>

        <div className="grid grid-cols-2 gap-0 border border-border max-[720px]:grid-cols-1 shadow-lg">
          {services.map((svc, idx) => {
            const isLastCol = (idx + 1) % cols === 0
            const isLastRow = idx >= services.length - cols
            return (
              <div
                key={svc.n}
                className={[
                  "service-card",
                  isLastCol ? "border-r-0" : "",
                  isLastRow ? "border-b-0" : "",
                ].join(" ")}
              >
                <div className="flex justify-between text-[11px] text-text-subtle mb-6">
                  <span>{svc.n}</span>
                  <span className="arrow-icon"><IconArrowOut size={14} /></span>
                </div>
                <h3 className="font-display text-[28px] font-semibold tracking-[-0.02em] mb-3.5 text-text">{svc.t}</h3>
                <p className="text-text-muted mb-6 flex-1 max-w-110 text-[16px] leading-[1.6]">{svc.d}</p>
                <div className="flex flex-wrap gap-2 pb-1 pr-1">
                  {svc.tags.map((tag) => (
                    <TechTag key={tag} tag={tag} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </Shell>
    </section>
  )
}
