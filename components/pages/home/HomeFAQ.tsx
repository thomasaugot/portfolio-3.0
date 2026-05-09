"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

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
    <section className="page-section">
      <div className="shell">
        <div className="section-head">
          <span className="section-head-meta">{t("sections.faq_meta")}</span>
          <h2 className="section-head-title">{t("sections.faq_title")}</h2>
        </div>

        <div className="proc-list">
          {faq.map((item, idx) => {
            const isOpen = openIdx === idx
            return (
              <div
                key={idx}
                className={`faq-row keyboard-focus-ring${isOpen ? " open" : ""}`}
                onClick={() => toggle(idx)}
                role="button"
                tabIndex={0}
                aria-expanded={isOpen}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") toggle(idx) }}
              >
                <div className="faq-inner">
                  <span className="faq-num">{String(idx + 1).padStart(2, "0")}</span>
                  <p className="faq-q">{item.q}</p>
                  <span className="faq-indicator">+</span>
                </div>
                {isOpen && <p className="faq-a">{item.a}</p>}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
