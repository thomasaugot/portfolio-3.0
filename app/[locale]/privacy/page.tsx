import type { Metadata } from "next"
import { buildMetadata, type Locale } from "@/lib/seo"
import { appConfig } from "@/config/app.config"
import { ParticleHeading } from "@/components/ui/ParticleHeading"
import { PageReadyMarker } from "@/components/blog/PageReadyMarker"
import { Shell } from "@/components/layout/Shell"

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "fr" }, { locale: "es" }]
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const safe: Locale = (["en", "fr", "es"] as const).includes(locale as Locale) ? (locale as Locale) : "en"
  return buildMetadata({
    locale: safe,
    title: safe === "fr" ? "Politique de confidentialité" : safe === "es" ? "Política de privacidad" : "Privacy Policy",
    description: safe === "fr"
      ? "Comment helloimtom.dev collecte et utilise vos données."
      : safe === "es"
      ? "Cómo helloimtom.dev recopila y usa tus datos."
      : "How helloimtom.dev collects and uses your data.",
    path: "/privacy",
  })
}

const CONTENT: Record<Locale, {
  eyebrow: string
  title: string
  updated: string
  sections: Array<{ heading: string; body: Array<{ text: string; href?: string }> }>
}> = {
  en: {
    eyebrow: "[ LEGAL ]",
    title: "Privacy Policy.",
    updated: "Last updated: June 2026",
    sections: [
      {
        heading: "Who I am",
        body: [
          { text: `This site is operated by Thomas Augot, a freelance full-stack developer based in Las Palmas de Gran Canaria, Spain. Contact: ${appConfig.email}` },
        ],
      },
      {
        heading: "What data I collect",
        body: [
          { text: "When you use the contact chatbot or submit the contact form, I collect your name, email address or phone number, and the content of your message. This is used solely to respond to your enquiry." },
          { text: "I do not sell, share, or use this data for marketing purposes." },
        ],
      },
      {
        heading: "Cloudflare Turnstile",
        body: [
          { text: "This site uses Cloudflare Turnstile, an invisible bot-detection service, to protect the chatbot from automated abuse. Turnstile analyses browser signals (user agent, interaction patterns, IP address) to determine whether a visitor is human — without showing a CAPTCHA or storing personally identifiable information." },
          { text: "Cloudflare Privacy Policy →", href: "https://www.cloudflare.com/privacypolicy/" },
          { text: "Turnstile Privacy Addendum →", href: "https://www.cloudflare.com/turnstile-privacy-addendum/" },
        ],
      },
      {
        heading: "Analytics",
        body: [
          { text: "This site uses Google Analytics 4 to understand how visitors interact with it (pages viewed, session duration, country). No personally identifiable information is collected. IP addresses are anonymised by Google before storage." },
        ],
      },
      {
        heading: "Cookies",
        body: [
          { text: "This site uses minimal cookies: a theme preference cookie (local, no tracking) and cookies set by Cloudflare Turnstile and Google Analytics for their respective functions. No advertising or tracking cookies are used." },
        ],
      },
      {
        heading: "Your rights",
        body: [
          { text: `Under GDPR you have the right to access, correct, or delete any personal data I hold about you. To exercise these rights, contact me at ${appConfig.email}.` },
        ],
      },
      {
        heading: "Changes",
        body: [
          { text: "This policy may be updated occasionally. The date at the top of this page reflects the latest revision." },
        ],
      },
    ],
  },
  fr: {
    eyebrow: "[ LÉGAL ]",
    title: "Confidentialité.",
    updated: "Dernière mise à jour : juin 2026",
    sections: [
      {
        heading: "Qui je suis",
        body: [
          { text: `Ce site est géré par Thomas Augot, développeur full-stack freelance basé à Las Palmas de Gran Canaria, Espagne. Contact : ${appConfig.email}` },
        ],
      },
      {
        heading: "Données collectées",
        body: [
          { text: "Lorsque vous utilisez le chatbot de contact ou soumettez le formulaire, je collecte votre nom, votre adresse e-mail ou numéro de téléphone, et le contenu de votre message. Ces données sont utilisées uniquement pour répondre à votre demande." },
          { text: "Je ne vends, ne partage ni n'utilise ces données à des fins commerciales." },
        ],
      },
      {
        heading: "Cloudflare Turnstile",
        body: [
          { text: "Ce site utilise Cloudflare Turnstile, un service invisible de détection de bots, pour protéger le chatbot contre les abus automatisés. Turnstile analyse des signaux techniques pour déterminer si le visiteur est humain, sans afficher de CAPTCHA ni stocker d'informations personnelles identifiables." },
          { text: "Politique de confidentialité Cloudflare →", href: "https://www.cloudflare.com/privacypolicy/" },
          { text: "Addendum de confidentialité Turnstile →", href: "https://www.cloudflare.com/turnstile-privacy-addendum/" },
        ],
      },
      {
        heading: "Analyses",
        body: [
          { text: "Ce site utilise Google Analytics 4 pour comprendre comment les visiteurs interagissent avec lui. Aucune information personnelle identifiable n'est collectée. Les adresses IP sont anonymisées par Google avant stockage." },
        ],
      },
      {
        heading: "Cookies",
        body: [
          { text: "Ce site utilise des cookies minimaux : un cookie de préférence de thème (local, sans suivi) et des cookies de Cloudflare Turnstile et Google Analytics. Aucun cookie publicitaire ou de suivi tiers n'est utilisé." },
        ],
      },
      {
        heading: "Vos droits",
        body: [
          { text: `Conformément au RGPD, vous avez le droit d'accéder, de corriger ou de supprimer toute donnée personnelle que je détiens. Contactez-moi à ${appConfig.email}.` },
        ],
      },
      {
        heading: "Modifications",
        body: [
          { text: "Cette politique peut être mise à jour occasionnellement. La date en haut de cette page indique la dernière révision." },
        ],
      },
    ],
  },
  es: {
    eyebrow: "[ LEGAL ]",
    title: "Privacidad.",
    updated: "Última actualización: junio de 2026",
    sections: [
      {
        heading: "Quién soy",
        body: [
          { text: `Este sitio está gestionado por Thomas Augot, desarrollador full-stack freelance con base en Las Palmas de Gran Canaria, España. Contacto: ${appConfig.email}` },
        ],
      },
      {
        heading: "Datos que recopilo",
        body: [
          { text: "Cuando usas el chatbot de contacto o envías el formulario, recopilo tu nombre, dirección de correo electrónico o número de teléfono, y el contenido de tu mensaje. Estos datos se usan únicamente para responder a tu consulta." },
          { text: "No vendo, comparto ni uso estos datos con fines de marketing." },
        ],
      },
      {
        heading: "Cloudflare Turnstile",
        body: [
          { text: "Este sitio usa Cloudflare Turnstile, un servicio invisible de detección de bots, para proteger el chatbot del abuso automatizado. Turnstile analiza señales del navegador para determinar si el visitante es humano, sin mostrar un CAPTCHA ni almacenar información personal identificable." },
          { text: "Política de privacidad de Cloudflare →", href: "https://www.cloudflare.com/privacypolicy/" },
          { text: "Adenda de privacidad de Turnstile →", href: "https://www.cloudflare.com/turnstile-privacy-addendum/" },
        ],
      },
      {
        heading: "Analíticas",
        body: [
          { text: "Este sitio usa Google Analytics 4 para entender cómo interactúan los visitantes con él. No se recopila información personal identificable. Las direcciones IP son anonimizadas por Google antes de su almacenamiento." },
        ],
      },
      {
        heading: "Cookies",
        body: [
          { text: "Este sitio usa cookies mínimas: una cookie de preferencia de tema (local, sin rastreo) y cookies de Cloudflare Turnstile y Google Analytics. No se usan cookies publicitarias ni de rastreo de terceros." },
        ],
      },
      {
        heading: "Tus derechos",
        body: [
          { text: `Bajo el RGPD tienes derecho a acceder, corregir o eliminar cualquier dato personal que yo tenga sobre ti. Contáctame en ${appConfig.email}.` },
        ],
      },
      {
        heading: "Cambios",
        body: [
          { text: "Esta política puede actualizarse ocasionalmente. La fecha en la parte superior de esta página refleja la última revisión." },
        ],
      },
    ],
  },
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const safe: Locale = (["en", "fr", "es"] as const).includes(locale as Locale) ? (locale as Locale) : "en"
  const c = CONTENT[safe]

  return (
    <section className="pt-40 pb-[clamp(80px,12vh,160px)]">
      <Shell>
        <PageReadyMarker />

        <span className="text-caption font-mono text-text-subtle block mb-10">{c.eyebrow}</span>

        <ParticleHeading as="h1" className="font-display font-semibold tracking-tight text-[clamp(2.5rem,5.4vw,5.5rem)] leading-[0.95] mb-6">
          {c.title}
        </ParticleHeading>

        <p className="text-caption font-mono text-text-subtle mb-16">{c.updated}</p>

        <div className="border-t border-border max-w-3xl">
          {c.sections.map((section) => (
            <div key={section.heading} className="grid grid-cols-[200px_1fr] max-[640px]:grid-cols-1 gap-8 border-b border-border py-10">
              <h2 className="text-caption font-mono text-text-subtle tracking-widest uppercase pt-1">
                {section.heading}
              </h2>
              <div className="flex flex-col gap-3">
                {section.body.map((item, i) =>
                  item.href ? (
                    <a
                      key={i}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-body text-primary font-mono text-sm no-underline transition-opacity duration-150 hover:opacity-70 keyboard-focus-ring"
                    >
                      {item.text}
                    </a>
                  ) : (
                    <p key={i} className="text-body text-text-muted leading-[1.7]">{item.text}</p>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </Shell>
    </section>
  )
}
