"use client"
import { ParticleHeading } from "@/components/ui/ParticleHeading"
import { useTranslations } from "next-intl"
import { testimonials } from "@/data/testimonials"
import { Shell } from "@/components/layout/Shell"

export function HomeTestimonials() {
  const t = useTranslations("home")
  const cols = 2
  const total = testimonials.length
  const lastRowStart = total - (total % cols || cols)

  return (
    <section className="py-[clamp(80px,12vh,160px)] border-t border-border">
      <Shell>
        <div className="grid grid-cols-[1fr_2fr] gap-(--gutter) mb-14 items-end max-[720px]:grid-cols-1 max-[720px]:gap-4">
          <span className="font-mono text-[12px] text-text-subtle">{t("sections.testimonials_meta")}</span>
          <ParticleHeading className="font-display font-semibold tracking-tight text-[clamp(2.5rem,5.4vw,5.5rem)] leading-[0.95]">{t("sections.testimonials_title")}</ParticleHeading>
        </div>

        <div className="grid grid-cols-2 border border-border max-[720px]:grid-cols-1">
          {testimonials.map((item, idx) => {
            const isLastCol = (idx + 1) % cols === 0
            const isLastRow = idx >= lastRowStart
            return (
              <div
                key={idx}
                data-anim="testi-card"
                className={[
                  "card-hover p-8 border-r border-b border-border flex flex-col gap-5",
                  isLastCol ? "border-r-0" : "",
                  isLastRow ? "border-b-0" : "",
                ].join(" ")}
              >
                <p className="text-body leading-normal flex-1 text-text">
                  <span className="font-serif text-[56px] text-primary leading-0 align-[-16px] mr-1.5 italic" aria-hidden="true">&ldquo;</span>
                  {item.q}
                </p>
                <div className="pt-4 border-t border-border">
                  <p className="text-[16px] text-text">{item.name}</p>
                  <p className="text-[11px] text-text-subtle mt-0.5">{item.role} · {item.company}</p>
                </div>
              </div>
            )
          })}
        </div>
      </Shell>
    </section>
  )
}
