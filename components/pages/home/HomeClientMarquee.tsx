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
  "Materia Prima",
]

const ClientItem = ({ name }: { name: string }) => (
  <span className="font-display text-subheading font-semibold tracking-[-0.02em] text-text-muted whitespace-nowrap inline-flex items-center gap-3 transition-colors">
    {name}
    <span className="w-1.5 h-1.5 bg-primary inline-block shrink-0" aria-hidden="true" />
  </span>
)

export function HomeClientMarquee() {
  const t = useTranslations("home")

  return (
    <div className="border-y border-border py-[18px] flex items-center overflow-hidden">
      <span className="shrink-0 pr-6 pl-(--gutter) text-caption font-mono text-text-subtle tracking-[0.15em] uppercase border-r border-border whitespace-nowrap">{t("trusted_label")}</span>
      <div
        className="flex flex-1 overflow-hidden mask-[linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]"
        aria-label="Client list"
        role="marquee"
      >
        <div className="flex gap-14 shrink-0 pr-14 animate-[scroll-x_var(--marquee-dur,38s)_linear_infinite]">
          {CLIENTS.map((name, idx) => <ClientItem key={idx} name={name} />)}
        </div>
        <div className="flex gap-14 shrink-0 pr-14 animate-[scroll-x_var(--marquee-dur,38s)_linear_infinite]" aria-hidden="true">
          {CLIENTS.map((name, idx) => <ClientItem key={idx} name={name} />)}
        </div>
      </div>
    </div>
  )
}
