"use client"
import { ParticleHeading } from "@/components/ui/ParticleHeading"

import { useTranslations, useLocale } from "next-intl"
import { WebMockup, MobileMockup } from "@/components/ui/ProjectMockup"
import { TransitionLink } from "@/components/ui/TransitionLink"
import { Shell } from "@/components/layout/Shell"
import { TechTag } from "@/components/ui/TechTag"

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
  "materia-prima": {
    kind: "web",
    desktop: "/assets/images/portfolio/materia-prima/desktop/desktop-1.webp",
    mobile:  "/assets/images/portfolio/materia-prima/mobile/mobile-1.webp",
  },
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
      <Shell>
        <div data-anim="section-head" className="grid grid-cols-[1fr_2fr] gap-gutter mb-14 items-end max-[720px]:grid-cols-1 max-[720px]:gap-4">
          <span className="text-caption font-mono text-text-subtle">{t("sections.work_meta")}</span>
          <ParticleHeading className="font-display font-semibold tracking-tight text-[clamp(2.5rem,5.4vw,5.5rem)] leading-[0.95]">{t("sections.work_title")}</ParticleHeading>
        </div>

        {work.map((item) => {
          const mockup = MOCKUPS[item.slug]
          return (
            <div key={item.n} data-anim="case-card" className="grid grid-cols-[1fr_1.2fr] gap-12 py-16 border-t border-b border-border items-start max-[900px]:grid-cols-1 max-[900px]:gap-6">
              <div className="flex flex-col gap-4.5 py-3">
                <span className="text-caption text-text-subtle tracking-widest">{item.n}</span>
                <h3 className="font-display font-semibold text-[clamp(32px,4vw,56px)] tracking-[-0.03em] leading-none text-text">{item.client}</h3>
                <p className="text-body text-text-muted max-w-95 leading-[1.6]">{item.tag}</p>
                <p className="text-body text-text-muted leading-[1.6]">{item.body}</p>

                {/* Meta — type / year / role */}
                <div className="grid grid-cols-3 gap-x-6 gap-y-5 mt-auto pt-6 border-t border-border">
                  {([
                    ["Type", item.type],
                    ["Year", item.year],
                    ["Role", item.role],
                  ] as [string, string][]).map(([k, v]) => (
                    <div key={k}>
                      <span className="text-caption font-mono text-text-subtle tracking-[0.12em] uppercase block mb-1">{k}</span>
                      <span className="text-body text-text leading-[1.4]">{v}</span>
                    </div>
                  ))}
                </div>

                {/* Stack — chip grid */}
                <div className="border-t border-border pt-6">
                  <span className="text-caption font-mono text-text-subtle tracking-[0.12em] uppercase block mb-3">Stack</span>
                  <div className="flex flex-wrap gap-2 pb-1 pr-1">
                    {item.stack.split(/\s*·\s*|\s*,\s*/).filter(Boolean).map((tech) => (
                      <TechTag key={tech} tag={tech} />
                    ))}
                  </div>
                </div>

                <TransitionLink
                  href={`/${locale}/work/${item.slug}`}
                  aria-label={`${item.link} — ${item.client}`}
                  className="text-body inline-flex items-center gap-1.5 text-primary no-underline transition-opacity hover:opacity-75 keyboard-focus-ring"
                >
                  {item.link}
                </TransitionLink>
                {item.href && (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${item.client} live site (opens in new tab)`}
                    className="text-body inline-flex items-center gap-1.5 text-primary no-underline transition-opacity hover:opacity-75 keyboard-focus-ring"
                  >
                    Live site ↗<span className="sr-only"> (opens in new tab)</span>
                  </a>
                )}
              </div>

              <div
                className={[
                  "shadow-lg relative bg-surface-2 border border-border overflow-hidden cursor-pointer",
                  "transition-[transform] duration-500 ease-snappy hover:-translate-y-1",
                  mockup?.kind === "mobile" ? "aspect-3/4" : "aspect-5/3",
                  "min-[900px]:aspect-4/3",
                  "after:content-[''] after:absolute after:inset-0 after:pointer-events-none",
                  "after:bg-[repeating-linear-gradient(45deg,rgba(212,255,58,0.007)_0_12px,transparent_12px_24px)]",
                ].join(" ")}
              >
                {mockup?.kind === "web" && mockup.desktop && mockup.mobile ? (
                  <WebMockup desktop={mockup.desktop} mobile={mockup.mobile} />
                ) : mockup?.kind === "mobile" && mockup.mobile ? (
                  <MobileMockup mobile={mockup.mobile} mobile2={mockup.mobile2} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-caption font-mono text-text-subtle tracking-widest">
                    <span>{item.n} · {item.type}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        <div className="pt-12 border-t border-border mt-16 text-center">
          <TransitionLink href={`/${locale}/work`} className="text-body inline-flex items-center gap-1.5 text-primary no-underline transition-opacity hover:opacity-75">{t("work_ui.view_all")}</TransitionLink>
        </div>
      </Shell>
    </section>
  )
}
