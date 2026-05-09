"use client"

import { useState } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { TravelGlobe } from "@/components/pages/home/TravelGlobe"

interface Fact { k: string; v: string }
interface TripPin { yr: string; place: string }
interface About {
  lede1: string; lede_accent: string; lede2: string
  lede_italic: string; lede3: string; body: string
  facts: Fact[]; trip: TripPin[]
}

export function HomeAbout() {
  const t = useTranslations("home")
  const about = t.raw("about") as About
  const [hoveredPin, setHoveredPin] = useState<{ city: string; country: string } | null>(null)

  return (
    <section id="about" className="py-[clamp(80px,12vh,160px)] border-t border-border">
      <div className="shell">
        <div className="section-head">
          <span className="section-head-meta">{t("sections.about_meta")}</span>
          <h2 className="section-head-title">{t("sections.about_title")}</h2>
        </div>

        <div className="grid grid-cols-2 gap-12 max-[900px]:grid-cols-1">
          {/* Left — portrait + lede + body + trip pins */}
          <div>
            <div className="relative w-20 h-20 flex-shrink-0 border border-border-2 overflow-hidden mb-6">
              <Image
                src="/assets/images/portrait.webp"
                alt="Thomas Augot"
                fill
                className="object-cover object-top"
                sizes="80px"
              />
            </div>

            <p className="font-display text-[clamp(24px,2.6vw,36px)] font-medium tracking-[-0.02em] leading-[1.2] mb-6">
              {about.lede1}
              <span className="text-primary">{about.lede_accent}</span>
              {about.lede2}
              <span className="text-serif-italic text-text-muted">{about.lede_italic}</span>
              {about.lede3}
            </p>

            <p className="text-text-muted text-[15px] leading-[1.7] max-w-[540px] mb-8">{about.body}</p>

            <p className="text-[11px] text-text-subtle tracking-[0.12em] uppercase mb-4">Places I&apos;ve lived</p>
            <div className="grid grid-cols-4 gap-3 max-[600px]:grid-cols-2">
              {about.trip.map((pin, idx) => (
                <div
                  key={idx}
                  className="border border-border p-3.5 text-[11px] text-text-muted relative overflow-hidden transition-[border-color,color] duration-300 hover:border-primary hover:text-text"
                >
                  <div className="font-display text-[22px] font-semibold tracking-[-0.02em] text-text">{pin.yr}</div>
                  <div className="mt-1 tracking-[0.05em]">{pin.place}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — globe + facts */}
          <div>
            <div className="globe-wrap">
              <div className="globe-meta">
                <span>geo · pins / arcs</span>
                <span className="globe-meta-val">
                  {hoveredPin ? `${hoveredPin.city} · ${hoveredPin.country}` : "drag to rotate"}
                </span>
              </div>
              <TravelGlobe onHover={setHoveredPin} />
              <div className="globe-legend">
                <span><span className="globe-dot" /> career stop</span>
                <span><span className="globe-arc" /> path travelled</span>
              </div>
            </div>

            <div className="flex flex-col border-t border-border">
              {about.facts.map((f) => (
                <div key={f.k} className="py-[18px] border-b border-border grid grid-cols-[1fr_2fr] gap-6 items-baseline">
                  <span className="text-text-subtle text-[12px] tracking-[0.05em]">{f.k}</span>
                  <span className="text-[14px] text-text">{f.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
