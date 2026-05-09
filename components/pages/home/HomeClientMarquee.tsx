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

const TRACK = [...CLIENTS, ...CLIENTS]

export function HomeClientMarquee() {
  const t = useTranslations("home")

  return (
    <div className="marquee-strip">
      <span className="marquee-strip-label">{t("trusted_label")}</span>
      <div className="marquee">
        <div className="marquee-track">
          {TRACK.map((name, idx) => (
            <span key={idx} className="marquee-client-name">
              {name}
              <span className="marquee-client-dot" aria-hidden="true" />
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
