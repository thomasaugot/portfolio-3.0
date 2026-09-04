"use client"
import { ParticleHeading } from "@/components/ui/ParticleHeading"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Shell } from "@/components/layout/Shell"

interface FAQItem {
  q: string
  a: string
}

export function HomeFAQ() {
  const t = useTranslations("home")
  const faq = t.raw("faq") as FAQItem[]
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  const toggle = (idx: number) => setOpenIdx(openIdx === idx ? null : idx)

  return (
    <section className="section-rule py-[clamp(80px,12vh,160px)]">
      <Shell>
        <div data-anim="section-head" className="grid grid-cols-[1fr_2fr] gap-gutter mb-14 items-end max-[720px]:grid-cols-1 max-[720px]:gap-4">
          <span data-anim="section-meta" className="font-mono text-[12px] text-text-subtle">{t("sections.faq_meta")}</span>
          <ParticleHeading className="font-display font-semibold tracking-tight text-[clamp(2.5rem,5.4vw,5.5rem)] leading-[0.95]">{t("sections.faq_title")}</ParticleHeading>
        </div>

        <div>
          {faq.map((item, idx) => {
            const isOpen = openIdx === idx
            const answerId = `faq-answer-${idx}`
            const questionId = `faq-question-${idx}`
            return (
              <div key={idx} data-anim="faq-row" className="border-b border-border">
                <button
                  id={questionId}
                  type="button"
                  className="w-full text-left cursor-pointer pt-5 transition-[padding-left,padding-bottom] duration-300 hover:pl-3 keyboard-focus-ring bg-transparent border-0"
                  style={{ paddingBottom: isOpen ? "28px" : "20px" }}
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                >
                  <div className="grid grid-cols-[60px_1fr_32px] gap-6 items-start max-[600px]:grid-cols-[40px_1fr_28px] max-[600px]:gap-3">
                    <span className="text-[11px] text-text-subtle tracking-[0.08em] pt-1.5" aria-hidden="true">{String(idx + 1).padStart(2, "0")}</span>
                    <p className="font-display text-[clamp(18px,1.8vw,24px)] font-medium tracking-[-0.01em] leading-[1.3] text-text">{item.q}</p>
                    <span className={`font-mono text-primary text-[18px] text-right block leading-none pt-1 transition-transform duration-300${isOpen ? " rotate-45" : ""}`} aria-hidden="true">+</span>
                  </div>
                </button>
                <div
                  id={answerId}
                  role="region"
                  aria-labelledby={questionId}
                  style={{
                    display: "grid",
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                    transition: "grid-template-rows 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  <div style={{ overflow: "hidden" }}>
                    <p className="pl-[84px] pt-4 pb-6 text-text-muted text-[16px] leading-[1.7] max-[600px]:pl-[52px]">{item.a}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Shell>
    </section>
  )
}
