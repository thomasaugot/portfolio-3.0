import Image from "next/image"
import { WorkPageClient } from "@/components/pages/work/WorkPageClient"

interface Project {
  n: string
  slug: string
  client: string
  tag: string
  type: string
  year: string
  cover: string
  domain: string
  kind: "web" | "mobile"
  href?: string
}

const PROJECTS: Project[] = [
  {
    n: "W/01",
    slug: "binter-montajes-app",
    client: "Binter Canarias",
    tag: "Field operations platform",
    type: "Full-stack · PWA",
    year: "2025",
    cover: "/assets/images/portfolio/binter-montajes/desktop/desktop-1.webp",
    domain: "binter-montajes.app",
    kind: "web",
  },
  {
    n: "W/02",
    slug: "dosxdosgrupoimagen-web",
    client: "Dos × Dos Grupo Imagen",
    tag: "Corporate site & admin panel",
    type: "Marketing site + CMS",
    year: "2024",
    cover: "/assets/images/portfolio/dosxdos-web/desktop/desktop-1.png",
    domain: "dospordosgrupoimagen.com",
    kind: "web",
    href: "https://www.dospordosgrupoimagen.com/",
  },
  {
    n: "W/03",
    slug: "dosxdos-montadores-app",
    client: "Dos × Dos Grupo Imagen",
    tag: "Field-worker native app",
    type: "React Native · iOS & Android",
    year: "2025",
    cover: "/assets/images/portfolio/dosxdos-montadores/mobile/mobile-1.webp",
    domain: "",
    kind: "mobile",
  },
  {
    n: "W/04",
    slug: "energia-solar-canarias",
    client: "Energía Solar Canarias",
    tag: "Solar monitoring CRM",
    type: "Full-stack platform · Mobile",
    year: "2025",
    cover: "/assets/images/portfolio/energia-solar-canarias/desktop/desktop-1.png",
    domain: "energiasolarcanarias.com",
    kind: "web",
    href: "https://app.energiasolarcanarias.com/",
  },
  {
    n: "W/05",
    slug: "galaga-agency-website",
    client: "Galaga Agency",
    tag: "Agency website 2.0",
    type: "Marketing site",
    year: "2025",
    cover: "/assets/images/portfolio/galaga-agency/desktop/desktop-1.png",
    domain: "galagaagency.com",
    kind: "web",
    href: "https://galagaagency.com/",
  },
  {
    n: "W/06",
    slug: "reloj-laboral-galaga",
    client: "Galaga Agency",
    tag: "Digital time-tracking system",
    type: "Full-stack platform",
    year: "2025",
    cover: "/assets/images/portfolio/reloj-laboral-galaga/desktop/desktop-1.png",
    domain: "reloj-laboral.app",
    kind: "web",
  },
  {
    n: "W/07",
    slug: "areco-web",
    client: "ARECO",
    tag: "Spanish market landing site",
    type: "Marketing site · CMS",
    year: "2025",
    cover: "/assets/images/portfolio/areco/desktop/desktop-1.webp",
    domain: "areco-nextjs.galagaagency.com",
    kind: "web",
    href: "https://areco-nextjs.galagaagency.com",
  },
  {
    n: "W/08",
    slug: "charpente-menuiserie-durand",
    client: "Charpente Menuiserie Durand",
    tag: "Business website",
    type: "Marketing site",
    year: "2024",
    cover: "/assets/images/portfolio/charpente-menuiserie-durand/desktop/desktop-1.png",
    domain: "cmdurand.com",
    kind: "web",
    href: "https://cmdurand-2-0.vercel.app/",
  },
  {
    n: "W/09",
    slug: "adelante-business-consulting",
    client: "Adelante Business Consulting",
    tag: "Consulting website",
    type: "Business website · WordPress",
    year: "2026",
    cover: "/assets/images/portfolio/adelante/desktop/desktop-1.webp",
    domain: "adelante-bc.com",
    kind: "web",
    href: "https://adelante-bc.com/",
  },
]

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "fr" }, { locale: "es" }]
}

export const metadata = {
  title: "Work — Thomas Augot",
  description: "Selected projects — from full-stack platforms to corporate websites.",
}

export default function WorkIndexPage() {
  return (
    <WorkPageClient>
      <div className="pt-[120px] pb-20">
        <div className="shell">
          <div className="pb-12 border-b border-border mb-16">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-[12px] tracking-[0.08em] uppercase text-text-muted no-underline mb-8 transition-colors duration-150 hover:text-primary"
            >
              ← Home
            </a>
            <p className="text-[11px] tracking-[0.12em] uppercase text-primary mb-4">[ 04 / WORK ]</p>
            <h1 className="font-display text-[clamp(36px,6vw,72px)] font-semibold tracking-[-0.03em] leading-[0.95] text-text mb-5">
              Selected work.
            </h1>
            <p className="text-[16px] text-text-muted max-w-[540px] leading-[1.6]">
              9 products shipped — platforms, apps, sites. Three years of real clients, real constraints, real production.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-0.5 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
            {PROJECTS.map((p) => (
              <a
                key={p.slug}
                href={`/work/${p.slug}`}
                className="group relative flex flex-col bg-surface border border-border no-underline text-inherit transition-[background,border-color] duration-150 hover:bg-surface-2 hover:border-primary overflow-hidden min-h-[340px]"
              >
                <span className="absolute top-6 right-6 text-[16px] text-text-subtle opacity-0 transition-[opacity,color] duration-150 group-hover:opacity-100 group-hover:text-primary z-10">
                  ↗
                </span>

                {p.kind === "mobile" ? (
                  <div className="flex justify-center pt-4 pb-0 px-6">
                    <div className="work-card-phone">
                      <div className="mockup-phone-notch" />
                      <div className="work-card-phone-screen">
                        <Image
                          src={p.cover}
                          alt={p.client}
                          fill
                          className="object-cover object-top"
                          sizes="(max-width: 560px) 50vw, (max-width: 900px) 25vw, 17vw"
                        />
                      </div>
                      <div className="mockup-phone-home" />
                    </div>
                  </div>
                ) : (
                  <div className="work-card-chrome">
                    <div className="work-card-chrome-bar" data-url={p.domain}>
                      <span className="mockup-dot" />
                      <span className="mockup-dot" />
                      <span className="mockup-dot" />
                    </div>
                    <div className="work-card-chrome-screen">
                      <Image
                        src={p.cover}
                        alt={p.client}
                        fill
                        className="object-cover object-top"
                        sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw"
                      />
                    </div>
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1">
                  <span className="text-[11px] tracking-[0.12em] text-primary mb-2">{p.n}</span>
                  <p className="font-display text-[17px] font-semibold tracking-[-0.02em] text-text mb-1.5 leading-[1.2]">
                    {p.client}
                  </p>
                  <p className="text-[13px] text-text-muted mb-3 leading-[1.4]">{p.tag}</p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-auto pt-4 border-t border-border">
                    <span className="text-[10px] tracking-[0.06em] uppercase px-2 py-0.5 border border-border text-text-subtle rounded-[2px]">
                      {p.type}
                    </span>
                    <span className="text-[11px] text-text-subtle ml-auto">{p.year}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </WorkPageClient>
  )
}
