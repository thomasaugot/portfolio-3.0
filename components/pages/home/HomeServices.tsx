"use client"

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
    <section id="services" className="page-section">
      <div className="shell">
        <div className="section-head">
          <span className="section-head-meta">{t("sections.services_meta")}</span>
          <h2 className="section-head-title">{t("sections.services_title")}</h2>
        </div>

        <div className="services-grid">
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
