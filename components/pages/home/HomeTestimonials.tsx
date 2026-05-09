"use client"

import { useTranslations } from "next-intl"

interface Testimonial {
  q: string
  name: string
  role: string
}

export function HomeTestimonials() {
  const t = useTranslations("home")
  const testimonials = t.raw("testimonials") as Testimonial[]

  return (
    <section className="page-section">
      <div className="shell">
        <div className="section-head">
          <span className="section-head-meta">{t("sections.testimonials_meta")}</span>
          <h2 className="section-head-title">{t("sections.testimonials_title")}</h2>
        </div>

        <div className="grid grid-cols-3 border-t border-l border-border max-[900px]:grid-cols-1">
          {testimonials.map((item, idx) => (
            <div key={idx} className="p-8 border-r border-b border-border flex flex-col gap-5 transition-colors duration-300 hover:bg-surface">
              <p className="font-display text-[18px] font-medium tracking-[-0.01em] leading-[1.35] flex-1 text-text">
                <span className="font-serif text-[56px] text-primary leading-0 align-[-16px] mr-1.5 italic">&ldquo;</span>
                {item.q}
              </p>
              <div className="flex gap-3 items-center pt-4 border-t border-border">
                <div className="w-9 h-9 bg-surface-2 border border-border-2 flex items-center justify-center text-[12px] text-primary font-semibold shrink-0">
                  {String.fromCharCode(65 + idx)}
                </div>
                <div>
                  <p className="text-[13px] text-text">{item.name}</p>
                  <p className="text-[11px] text-text-subtle mt-0.5">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
