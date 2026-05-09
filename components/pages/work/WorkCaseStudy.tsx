"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"
import { usePageReady } from "@/hooks/usePageReady"

interface WorkItem {
  n: string
  client: string
  tag: string
  type: string
  year: string
  role: string
  stack: string
  body: string
  link: string
  slug: string
  href?: string
}

const GALLERY: Record<string, { desktop: string[]; mobile: string[] }> = {
  "binter-montajes-app": {
    desktop: [
      "/assets/images/portfolio/binter-montajes/desktop/desktop-1.webp",
      "/assets/images/portfolio/binter-montajes/desktop/desktop-2.webp",
      "/assets/images/portfolio/binter-montajes/desktop/desktop-3.webp",
      "/assets/images/portfolio/binter-montajes/desktop/desktop-4.webp",
      "/assets/images/portfolio/binter-montajes/desktop/desktop-5.webp",
    ],
    mobile: [
      "/assets/images/portfolio/binter-montajes/mobile/mobile-1.webp",
      "/assets/images/portfolio/binter-montajes/mobile/mobile-2.webp",
      "/assets/images/portfolio/binter-montajes/mobile/mobile-3.webp",
      "/assets/images/portfolio/binter-montajes/mobile/mobile-4.webp",
      "/assets/images/portfolio/binter-montajes/mobile/mobile-5.webp",
    ],
  },
  "dosxdosgrupoimagen-web": {
    desktop: [
      "/assets/images/portfolio/dosxdos-web/desktop/desktop-1.png",
      "/assets/images/portfolio/dosxdos-web/desktop/desktop-2.png",
      "/assets/images/portfolio/dosxdos-web/desktop/desktop-3.png",
      "/assets/images/portfolio/dosxdos-web/desktop/desktop-4.png",
      "/assets/images/portfolio/dosxdos-web/desktop/desktop-5.png",
    ],
    mobile: [
      "/assets/images/portfolio/dosxdos-web/mobile/mobile-1.png",
      "/assets/images/portfolio/dosxdos-web/mobile/mobile-2.png",
      "/assets/images/portfolio/dosxdos-web/mobile/mobile-3.png",
      "/assets/images/portfolio/dosxdos-web/mobile/mobile-4.png",
    ],
  },
  "dosxdos-montadores-app": {
    desktop: [],
    mobile: [
      "/assets/images/portfolio/dosxdos-montadores/mobile/mobile-1.webp",
      "/assets/images/portfolio/dosxdos-montadores/mobile/mobile-2.webp",
      "/assets/images/portfolio/dosxdos-montadores/mobile/mobile-3.webp",
      "/assets/images/portfolio/dosxdos-montadores/mobile/mobile-4.webp",
      "/assets/images/portfolio/dosxdos-montadores/mobile/mobile-5.webp",
    ],
  },
  "energia-solar-canarias": {
    desktop: [
      "/assets/images/portfolio/energia-solar-canarias/desktop/desktop-1.png",
      "/assets/images/portfolio/energia-solar-canarias/desktop/desktop-2.png",
      "/assets/images/portfolio/energia-solar-canarias/desktop/desktop-3.png",
      "/assets/images/portfolio/energia-solar-canarias/desktop/desktop-4.png",
      "/assets/images/portfolio/energia-solar-canarias/desktop/desktop-5.png",
    ],
    mobile: [
      "/assets/images/portfolio/energia-solar-canarias/mobile/mobile-1.png",
      "/assets/images/portfolio/energia-solar-canarias/mobile/mobile-2.png",
      "/assets/images/portfolio/energia-solar-canarias/mobile/mobile-3.png",
      "/assets/images/portfolio/energia-solar-canarias/mobile/mobile-4.png",
    ],
  },
  "galaga-agency-website": {
    desktop: [
      "/assets/images/portfolio/galaga-agency/desktop/desktop-1.png",
      "/assets/images/portfolio/galaga-agency/desktop/desktop-2.png",
      "/assets/images/portfolio/galaga-agency/desktop/desktop-3.png",
      "/assets/images/portfolio/galaga-agency/desktop/desktop-4.png",
      "/assets/images/portfolio/galaga-agency/desktop/desktop-5.png",
    ],
    mobile: [
      "/assets/images/portfolio/galaga-agency/mobile/mobile-1.png",
      "/assets/images/portfolio/galaga-agency/mobile/mobile-2.png",
      "/assets/images/portfolio/galaga-agency/mobile/mobile-3.png",
      "/assets/images/portfolio/galaga-agency/mobile/mobile-4.png",
    ],
  },
  "reloj-laboral-galaga": {
    desktop: [
      "/assets/images/portfolio/reloj-laboral-galaga/desktop/desktop-1.png",
      "/assets/images/portfolio/reloj-laboral-galaga/desktop/desktop-2.png",
      "/assets/images/portfolio/reloj-laboral-galaga/desktop/desktop-3.png",
      "/assets/images/portfolio/reloj-laboral-galaga/desktop/desktop-4.png",
      "/assets/images/portfolio/reloj-laboral-galaga/desktop/desktop-5.png",
    ],
    mobile: [
      "/assets/images/portfolio/reloj-laboral-galaga/mobile/mobile-1.png",
      "/assets/images/portfolio/reloj-laboral-galaga/mobile/mobile-2.png",
      "/assets/images/portfolio/reloj-laboral-galaga/mobile/mobile-3.png",
      "/assets/images/portfolio/reloj-laboral-galaga/mobile/mobile-4.png",
    ],
  },
  "areco-web": {
    desktop: [
      "/assets/images/portfolio/areco/desktop/desktop-1.webp",
      "/assets/images/portfolio/areco/desktop/desktop-2.webp",
      "/assets/images/portfolio/areco/desktop/desktop-3.webp",
    ],
    mobile: [
      "/assets/images/portfolio/areco/mobile/mobile-1.webp",
      "/assets/images/portfolio/areco/mobile/mobile-2.webp",
      "/assets/images/portfolio/areco/mobile/mobile-3.webp",
      "/assets/images/portfolio/areco/mobile/mobile-4.webp",
    ],
  },
  "charpente-menuiserie-durand": {
    desktop: [
      "/assets/images/portfolio/charpente-menuiserie-durand/desktop/desktop-1.png",
      "/assets/images/portfolio/charpente-menuiserie-durand/desktop/desktop-2.png",
      "/assets/images/portfolio/charpente-menuiserie-durand/desktop/desktop-3.png",
      "/assets/images/portfolio/charpente-menuiserie-durand/desktop/desktop-4.png",
    ],
    mobile: [
      "/assets/images/portfolio/charpente-menuiserie-durand/mobile/mobile-1.png",
      "/assets/images/portfolio/charpente-menuiserie-durand/mobile/mobile-2.png",
      "/assets/images/portfolio/charpente-menuiserie-durand/mobile/mobile-3.png",
    ],
  },
  "adelante-business-consulting": {
    desktop: [
      "/assets/images/portfolio/adelante/desktop/desktop-1.webp",
      "/assets/images/portfolio/adelante/desktop/desktop-2.webp",
      "/assets/images/portfolio/adelante/desktop/desktop-3.webp",
    ],
    mobile: [
      "/assets/images/portfolio/adelante/mobile/mobile-1.webp",
      "/assets/images/portfolio/adelante/mobile/mobile-2.webp",
      "/assets/images/portfolio/adelante/mobile/mobile-3.webp",
    ],
  },
}

interface Props {
  slug: string
}

export function WorkCaseStudy({ slug }: Props) {
  usePageReady()
  const t = useTranslations("home")
  const work = t.raw("work") as WorkItem[]
  const item = work.find((w) => w.slug === slug)
  const gallery = GALLERY[slug]

  if (!item || !gallery) return null

  const isMobileOnly = gallery.desktop.length === 0

  return (
    <div className="case-study">
      {/* Header */}
      <div className="case-study-hero">
        <div className="shell">
          <a href="/#work" className="case-back">← Work</a>
          <div className="case-study-head">
            <span className="case-num">{item.n}</span>
            <h1 className="case-study-title">{item.client}</h1>
            <p className="case-study-tag">{item.tag}</p>
          </div>
          <div className="case-study-meta">
            {([
              ["Type",  item.type],
              ["Year",  item.year],
              ["Role",  item.role],
              ["Stack", item.stack],
            ] as [string, string][]).map(([k, v]) => (
              <div key={k} className="case-study-meta-item">
                <span className="case-meta-key">{k}</span>
                <span className="case-meta-val">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="shell">
        <p className="case-study-body">{item.body}</p>

        {/* Desktop gallery */}
        {gallery.desktop.length > 0 && (
          <div className="case-study-section">
            <span className="case-study-section-label">Desktop</span>
            <div className="case-gallery-desktop">
              {gallery.desktop.map((src, i) => (
                <div key={i} className="case-gallery-desktop-img">
                  <Image src={src} alt={`${item.client} desktop ${i + 1}`} fill className="mockup-img" sizes="(max-width: 900px) 100vw, 80vw" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mobile gallery */}
        {gallery.mobile.length > 0 && (
          <div className="case-study-section">
            <span className="case-study-section-label">{isMobileOnly ? "Screens" : "Mobile"}</span>
            <div className={`case-gallery-mobile${isMobileOnly ? " case-gallery-mobile-only" : ""}`}>
              {gallery.mobile.map((src, i) => (
                <div key={i} className="case-gallery-mobile-img">
                  <Image src={src} alt={`${item.client} mobile ${i + 1}`} fill className="mockup-img" sizes="(max-width: 600px) 45vw, 200px" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
