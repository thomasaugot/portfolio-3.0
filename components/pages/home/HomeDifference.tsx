"use client"
import { ParticleHeading } from "@/components/ui/ParticleHeading"
import { useTranslations } from "next-intl"
import { Shell } from "@/components/layout/Shell"
import { WireOutline } from "@/components/ui/WireOutline"

interface Card { n: string; t: string; d: string }

export function HomeDifference() {
  const t = useTranslations("home")
  const cards = t.raw("difference") as Card[]

  return (
    <section id="difference" className="section-rule py-[clamp(80px,12vh,160px)]">
      <Shell>
        <div data-anim="section-head" className="grid grid-cols-[1fr_2fr] gap-gutter mb-14 items-end max-[720px]:grid-cols-1 max-[720px]:gap-4">
          <span data-anim="section-meta" className="text-caption font-mono text-text-subtle">{t("sections.difference_meta")}</span>
          <ParticleHeading className="font-display font-semibold tracking-tight text-[clamp(2.5rem,5.4vw,5.5rem)] leading-[0.95]">{t("sections.difference_title")}</ParticleHeading>
        </div>

        <div className="grid grid-cols-3 gap-0 border border-border max-[900px]:grid-cols-1">
          {cards.map((card, idx) => (
            <div
              key={card.n}
              data-anim="diff-card"
              className={[
                "relative card-hover p-9 border-r border-b border-border flex flex-col min-h-75 max-[900px]:border-r-0",
                (idx + 1) % 3 === 0 ? "border-r-0" : "",       // last col on desktop
                idx === cards.length - 1 ? "border-b-0" : "",  // last card overall
              ].join(" ")}
            >
              <WireOutline />
              <span className="text-caption font-mono text-text-subtle mb-6">{card.n}</span>
              <h3 className="font-display text-[26px] font-semibold tracking-[-0.02em] mb-3.5 text-text">{card.t}</h3>
              <p className="text-text-muted text-[16px] leading-[1.6]">{card.d}</p>
            </div>
          ))}
        </div>
      </Shell>
    </section>
  )
}
