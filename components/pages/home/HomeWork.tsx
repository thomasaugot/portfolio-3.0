"use client"
import { ParticleHeading } from "@/components/ui/ParticleHeading"

import { useTranslations, useLocale } from "next-intl"
import { WebMockup, MobileMockup } from "@/components/ui/ProjectMockup"

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


export function HomeWork() {
  const t = useTranslations("home")
  const locale = useLocale()
  const work = (t.raw("work") as WorkItem[]).filter((w) => w.featured)

  return (
    <section id="work" className="py-[clamp(80px,12vh,160px)] border-t border-border">
      <div className="shell">
        <div className="grid grid-cols-[1fr_2fr] gap-(--gutter) mb-14 items-end max-[720px]:grid-cols-1 max-[720px]:gap-4">
          <span className="font-mono text-[12px] text-text-subtle">{t("sections.work_meta")}</span>
          <ParticleHeading className="font-display font-semibold tracking-tight text-[clamp(2.5rem,5.4vw,5.5rem)] leading-[0.95]">{t("sections.work_title")}</ParticleHeading>
        </div>

        {work.map((item) => {
          const mockup = MOCKUPS[item.slug]
          return (
            <div key={item.n} className="grid grid-cols-[1fr_1.2fr] gap-12 py-16 border-t border-border items-start last:border-b max-[900px]:grid-cols-1 max-[900px]:gap-6">
              <div className="flex flex-col gap-[18px] py-3">
                <span className="text-[12px] text-text-subtle tracking-[0.1em]">{item.n}</span>
                <h3 className="font-display font-semibold text-[clamp(32px,4vw,56px)] tracking-[-0.03em] leading-none text-text">{item.client}</h3>
                <p className="text-text-muted text-[14px] max-w-[380px] leading-[1.6]">{item.tag}</p>
                <p className="text-text-muted text-[14px] leading-[1.6]">{item.body}</p>

                <div className="grid grid-cols-2 gap-3.5 mt-auto pt-6 border-t border-border">
                  {([
                    ["Type", item.type],
                    ["Year", item.year],
                    ["Role", item.role],
                    ["Stack", item.stack],
                  ] as [string, string][]).map(([k, v]) => (
                    <div key={k}>
                      <span className="text-[11px] text-text-subtle tracking-[0.08em] uppercase block">{k}</span>
                      <span className="text-[13px] text-text mt-1 block">{v}</span>
                    </div>
                  ))}
                </div>

                <a href={`/${locale}/work/${item.slug}`} className="inline-flex items-center gap-1.5 text-primary no-underline text-[13px] transition-opacity hover:opacity-75">
                  {item.link}
                </a>
                {item.href && (
                  <a href={item.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary no-underline text-[13px] transition-opacity hover:opacity-75">
                    Live site ↗
                  </a>
                )}
              </div>

              <div className="case-visual" data-kind={mockup?.kind}>
                {mockup?.kind === "web" && mockup.desktop && mockup.mobile ? (
                  <WebMockup desktop={mockup.desktop} mobile={mockup.mobile} />
                ) : mockup?.kind === "mobile" && mockup.mobile ? (
                  <MobileMockup mobile={mockup.mobile} mobile2={mockup.mobile2} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-mono text-[11px] text-text-subtle tracking-[0.1em]">
                    <span>{item.n} · {item.type}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        <div className="pt-12 border-t border-border mt-16 text-center">
          <a href={`/${locale}/work`} className="inline-flex items-center gap-1.5 text-primary no-underline text-[13px] transition-opacity hover:opacity-75">View selected work →</a>
        </div>
      </div>
    </section>
  )
}
