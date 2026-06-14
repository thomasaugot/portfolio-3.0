import { SITE_URL, SITE_NAME, type Locale } from "@/lib/seo"
import { appConfig } from "@/config/app.config"

type Props = { locale: Locale }

// One <script type="application/ld+json"> per entity.
// Server component — renders inline at request/build time.
export function JsonLd({ locale }: Props) {
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    "name": SITE_NAME,
    "url": SITE_URL,
    "image": `${SITE_URL}/og-image.jpg`,
    "jobTitle": "Full-stack Developer",
    "description":
      "Full-stack developer (React, Next.js, Node) building web and mobile apps end-to-end. Available for hire in the Canary Islands, Spain, and France.",
    "email": `mailto:${appConfig.email}`,
    "sameAs": [
      appConfig.linkedin,
      appConfig.github,
      appConfig.twitter,
      appConfig.medium,
      appConfig.instagram,
    ],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Las Palmas de Gran Canaria",
      "addressRegion": "Canarias",
      "addressCountry": "ES",
    },
    "knowsAbout": [
      "React", "Next.js", "TypeScript", "Node.js", "PostgreSQL",
      "React Native", "Tailwind CSS", "GSAP", "Three.js", "Docker", "AWS",
      "Full-stack development", "Web development", "Mobile app development",
    ],
    "knowsLanguage": [
      { "@type": "Language", "name": "French", "alternateName": "fr" },
      { "@type": "Language", "name": "English", "alternateName": "en" },
      { "@type": "Language", "name": "Spanish", "alternateName": "es" },
    ],
  }

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    "url": SITE_URL,
    "name": SITE_NAME,
    "description": "Thomas Augot — full-stack developer for hire.",
    "publisher": { "@id": `${SITE_URL}/#person` },
    "inLanguage": ["en-US", "fr-FR", "es-ES"],
  }

  const professionalService = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE_URL}/#service`,
    "name": SITE_NAME,
    "url": SITE_URL,
    "image": `${SITE_URL}/og-image.jpg`,
    "provider": { "@id": `${SITE_URL}/#person` },
    "priceRange": "€€",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Las Palmas de Gran Canaria",
      "addressRegion": "Canarias",
      "addressCountry": "ES",
    },
    "areaServed": [
      { "@type": "AdministrativeArea", "name": "Canary Islands" },
      { "@type": "Country", "name": "Spain" },
      { "@type": "Country", "name": "France" },
      { "@type": "City", "name": "Nantes" },
      { "@type": "City", "name": "Las Palmas de Gran Canaria" },
    ],
    "serviceType": [
      "Full-stack web development",
      "Next.js development",
      "React development",
      "Mobile app development (React Native)",
      "API and backend development",
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(professionalService) }} />
      <meta name="thomas-locale" content={locale} />
    </>
  )
}
