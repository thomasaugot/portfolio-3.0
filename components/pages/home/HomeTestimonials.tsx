"use client"
import { ParticleHeading } from "@/components/ui/ParticleHeading"
import { useTranslations } from "next-intl"
import { testimonials } from "@/data/testimonials"

export function HomeTestimonials() {
  const t = useTranslations("home")

  return (
    <section className="py-[clamp(80px,12vh,160px)] border-t border-border">
      <div className="shell">
        <div className="grid grid-cols-[1fr_2fr] gap-(--gutter) mb-14 items-end max-[720px]:grid-cols-1 max-[720px]:gap-4">
          <span className="font-mono text-[12px] text-text-subtle">{t("sections.testimonials_meta")}</span>
          <ParticleHeading className="font-display font-semibold tracking-tight text-[clamp(2.5rem,5.4vw,5.5rem)] leading-[0.95]">{t("sections.testimonials_title")}</ParticleHeading>
        </div>

        <div className="grid grid-cols-2 border-t border-l border-border max-[720px]:grid-cols-1">
          {testimonials.map((item, idx) => (
            <div key={idx} className="p-8 border-r border-b border-border flex flex-col gap-5 transition-colors duration-300 hover:bg-surface">
              <p className="font-display text-[18px] font-medium tracking-[-0.01em] leading-[1.35] flex-1 text-text">
                <span className="font-serif text-[56px] text-primary leading-0 align-[-16px] mr-1.5 italic" aria-hidden="true">&ldquo;</span>
                {item.q}
              </p>
              <div className="pt-4 border-t border-border">
                <p className="text-[16px] text-text">{item.name}</p>
                <p className="text-[11px] text-text-subtle mt-0.5">{item.role} · {item.company}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
