"use client"

import { useTranslations } from "next-intl"

const CLIENTS = [
  "Galaga Agency",
  "Dos × Dos Grupo Imagen",
  "Binter Canarias",
  "Energía Solar Canarias",
  "ARECO España",
  "Adelante Business Consulting",
  "Charpente Menuiserie Durand",
  "Osly Solutions",
  "Frigate",
]

const ClientItem = ({ name }: { name: string }) => (
  <span className="font-display text-[22px] font-semibold tracking-[-0.02em] text-text-muted whitespace-nowrap inline-flex items-center gap-3 transition-colors">
    {name}
    <span className="w-1.5 h-1.5 bg-primary inline-block shrink-0" aria-hidden="true" />
  </span>
)

export function HomeClientMarquee() {
  const t = useTranslations("home")

  return (
    <div className="border-y border-border py-[18px] flex items-center overflow-hidden">
      <span className="shrink-0 pr-6 pl-(--gutter) font-mono text-[11px] text-text-subtle tracking-[0.15em] uppercase border-r border-border whitespace-nowrap">{t("trusted_label")}</span>
      <div className="marquee">
        <div className="marquee-track">
          {CLIENTS.map((name, idx) => <ClientItem key={idx} name={name} />)}
        </div>
        <div className="marquee-track">
          {CLIENTS.map((name, idx) => <ClientItem key={idx} name={name} />)}
        </div>
      </div>
    </div>
  )
}
