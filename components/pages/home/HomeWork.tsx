"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"

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
  featured?: boolean
}

const MOCKUPS: Record<string, {
  kind: "web" | "mobile"
  desktop?: string
  mobile?: string
  mobile2?: string
}> = {
  "binter-montajes-app": {
    kind: "web",
    desktop: "/assets/images/portfolio/binter-montajes/desktop/desktop-1.webp",
    mobile:  "/assets/images/portfolio/binter-montajes/mobile/mobile-1.webp",
  },
  "dosxdosgrupoimagen-web": {
    kind: "web",
    desktop: "/assets/images/portfolio/dosxdos-web/desktop/desktop-1.png",
    mobile:  "/assets/images/portfolio/dosxdos-web/mobile/mobile-1.png",
  },
  "dosxdos-montadores-app": {
    kind: "mobile",
    mobile:  "/assets/images/portfolio/dosxdos-montadores/mobile/mobile-1.webp",
    mobile2: "/assets/images/portfolio/dosxdos-montadores/mobile/mobile-2.webp",
  },
}

function WebMockup({ desktop, mobile }: { desktop: string; mobile: string }) {
  return (
    <div className="mockup-scene">
      <div className="mockup-laptop">
        <div className="mockup-laptop-bar">
          <span className="mockup-dot" />
          <span className="mockup-dot" />
          <span className="mockup-dot" />
        </div>
        <div className="mockup-laptop-screen">
          <Image src={desktop} alt="" fill sizes="(max-width: 900px) 80vw, 40vw" className="mockup-img" />
        </div>
        <div className="mockup-laptop-base" />
        <div className="mockup-laptop-stand" />
      </div>
      <div className="mockup-phone mockup-phone-overlay">
        <div className="mockup-phone-notch" />
        <div className="mockup-phone-screen">
          <Image src={mobile} alt="" fill sizes="120px" className="mockup-img" />
        </div>
        <div className="mockup-phone-home" />
      </div>
    </div>
  )
}

function MobileMockup({ mobile, mobile2 }: { mobile: string; mobile2?: string }) {
  return (
    <div className="mockup-scene mockup-scene-duo">
      <div className="mockup-phone mockup-phone-static mockup-phone-back">
        <div className="mockup-phone-notch" />
        <div className="mockup-phone-screen">
          <Image src={mobile2 ?? mobile} alt="" fill sizes="140px" className="mockup-img" />
        </div>
        <div className="mockup-phone-home" />
      </div>
      <div className="mockup-phone mockup-phone-static mockup-phone-front">
        <div className="mockup-phone-notch" />
        <div className="mockup-phone-screen">
          <Image src={mobile} alt="" fill sizes="140px" className="mockup-img" />
        </div>
        <div className="mockup-phone-home" />
      </div>
    </div>
  )
}

export function HomeWork() {
  const t = useTranslations("home")
  const work = (t.raw("work") as WorkItem[]).filter((w) => w.featured)

  return (
    <section id="work" className="page-section">
      <div className="shell">
        <div className="section-head">
          <span className="section-head-meta">{t("sections.work_meta")}</span>
          <h2 className="section-head-title">{t("sections.work_title")}</h2>
        </div>

        {work.map((item) => {
          const mockup = MOCKUPS[item.slug]
          return (
            <div key={item.n} className="case-card">
              <div className="case-meta">
                <span className="case-num">{item.n}</span>
                <h3 className="case-title">{item.client}</h3>
                <p className="case-tag">{item.tag}</p>
                <p className="case-body">{item.body}</p>

                <div className="case-meta-grid">
                  {([
                    ["Type", item.type],
                    ["Year", item.year],
                    ["Role", item.role],
                    ["Stack", item.stack],
                  ] as [string, string][]).map(([k, v]) => (
                    <div key={k} className="case-meta-item">
                      <span className="case-meta-key">{k}</span>
                      <span className="case-meta-val">{v}</span>
                    </div>
                  ))}
                </div>

                <a href={`/work/${item.slug}`} className="case-link">
                  {item.link}
                </a>
                {item.href && (
                  <a href={item.href} target="_blank" rel="noopener noreferrer" className="case-link">
                    Live site ↗
                  </a>
                )}
              </div>

              <div className="case-visual">
                {mockup?.kind === "web" && mockup.desktop && mockup.mobile ? (
                  <WebMockup desktop={mockup.desktop} mobile={mockup.mobile} />
                ) : mockup?.kind === "mobile" && mockup.mobile ? (
                  <MobileMockup mobile={mockup.mobile} mobile2={mockup.mobile2} />
                ) : (
                  <div className="case-visual-empty">
                    <span>{item.n} · {item.type}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        <div className="pt-12 border-t border-border mt-16 text-center">
          <a href="/work" className="case-link">View selected work →</a>
        </div>
      </div>
    </section>
  )
}
