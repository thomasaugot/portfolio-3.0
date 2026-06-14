"use client"
import { useState, useRef, useEffect, Fragment } from "react"
import { createPortal } from "react-dom"
import { TechTag } from "@/components/ui/TechTag"

const GLOSSARY_EN: Record<string, string> = {
  "RAG":            "Retrieval-Augmented Generation — the AI answers using your own data (docs, products, knowledge base) instead of just what it was trained on.",
  "LLM":            "Large Language Model — the AI model itself (GPT-4, Gemini, Claude…). The engine that reads and generates text.",
  "LangChain":      "A framework for connecting AI models to your data, APIs and tools. Used to build AI agents and pipelines.",
  "SSL":            "The encryption layer that puts the padlock in your browser bar and makes your site HTTPS.",
  "DNS":            "Domain Name System — the internet's phonebook. Translates domain names like yoursite.com into server addresses.",
  "CI/CD":          "Continuous Integration / Continuous Deployment — automated pipelines that test and ship your code every time you push a change.",
  "CDN":            "Content Delivery Network — a network of servers worldwide that delivers your site faster by serving files from the location closest to each visitor.",
  "Docker":         "A tool that packages your app and all its dependencies into a container, so it runs the same way on any server.",
  "OTA":            "Over-The-Air updates — push app updates to users' phones without requiring them to download a new version from the store.",
  "WebGL":          "A browser API for GPU-accelerated 3D graphics — used for interactive 3D scenes and visual effects directly in the browser.",
  "GSAP":           "GreenSock Animation Platform — the industry-standard JavaScript library for high-performance web animations.",
  "Three.js":       "A JavaScript library that makes it easy to create and display 3D graphics in the browser using WebGL.",
  "Core Web Vitals":"Google's set of performance metrics (loading speed, interactivity, visual stability) that directly affect your search ranking.",
  "Lighthouse":     "Google's automated tool that audits your site for performance, accessibility, SEO and best practices — scores out of 100.",
  "GA4":            "Google Analytics 4 — Google's analytics platform. Tracks who visits your site, where they come from, and what they do.",
  "GTM":            "Google Tag Manager — lets you add and manage tracking scripts (analytics, ads, heatmaps) without touching the codebase.",
  "CMS":            "Content Management System — a tool that lets non-technical people edit text, images and pages on a site without touching the code.",
  "GROQ":           "Graph-Relational Object Queries — Sanity's query language for fetching content. Think SQL, but for structured content.",
  "Portable Text":  "Sanity's format for rich text — structured content that can be rendered in any format (web, mobile, email) without losing formatting.",
  "Supabase":       "An open-source Firebase alternative — provides a Postgres database, authentication, file storage and real-time subscriptions out of the box.",
  "Firebase":       "Google's backend-as-a-service — real-time database, authentication, hosting and cloud functions without managing servers.",
  "auth":           "Authentication — the system that verifies who a user is (login, signup, sessions, OAuth with Google/GitHub…).",
  "Postgres":       "PostgreSQL — a powerful, open-source relational database. One of the most reliable and widely used databases in production.",
}

const GLOSSARY_FR: Record<string, string> = {
  "RAG":            "Retrieval-Augmented Generation — l'IA répond en utilisant vos propres données (docs, produits, base de connaissances) au lieu de ce sur quoi elle a été entraînée.",
  "LLM":            "Large Language Model — le modèle d'IA lui-même (GPT-4, Gemini, Claude…). Le moteur qui lit et génère du texte.",
  "LangChain":      "Un framework pour connecter des modèles d'IA à vos données, APIs et outils. Utilisé pour construire des agents et pipelines IA.",
  "SSL":            "La couche de chiffrement qui affiche le cadenas dans votre navigateur et rend votre site en HTTPS.",
  "DNS":            "Domain Name System — l'annuaire d'internet. Traduit les noms de domaine comme votresite.com en adresses de serveur.",
  "CI/CD":          "Intégration / Déploiement Continu — des pipelines automatisés qui testent et livrent votre code à chaque modification.",
  "CDN":            "Réseau de distribution de contenu — un réseau de serveurs mondial qui accélère votre site en servant les fichiers depuis le serveur le plus proche de chaque visiteur.",
  "Docker":         "Un outil qui emballe votre application et toutes ses dépendances dans un conteneur, pour qu'elle fonctionne de la même façon sur n'importe quel serveur.",
  "OTA":            "Mises à jour Over-The-Air — envoyez des mises à jour de l'app sur les téléphones des utilisateurs sans qu'ils aient besoin de télécharger une nouvelle version depuis le store.",
  "WebGL":          "Une API navigateur pour la 3D accélérée par GPU — utilisée pour les scènes 3D interactives et effets visuels directement dans le navigateur.",
  "GSAP":           "GreenSock Animation Platform — la bibliothèque JavaScript de référence pour les animations web haute performance.",
  "Three.js":       "Une bibliothèque JavaScript pour créer et afficher facilement des graphiques 3D dans le navigateur via WebGL.",
  "Core Web Vitals":"Les métriques de performance de Google (vitesse de chargement, interactivité, stabilité visuelle) qui influencent directement votre référencement.",
  "Lighthouse":     "L'outil d'audit automatique de Google qui évalue votre site sur la performance, l'accessibilité, le SEO et les bonnes pratiques — sur 100 points.",
  "GA4":            "Google Analytics 4 — la plateforme d'analyse de Google. Suit qui visite votre site, d'où ils viennent, et ce qu'ils font.",
  "GTM":            "Google Tag Manager — permet d'ajouter et gérer des scripts de tracking (analytics, pub, heatmaps) sans toucher au code.",
  "CMS":            "Système de Gestion de Contenu — un outil qui permet aux personnes non-techniques de modifier les textes, images et pages d'un site sans toucher au code.",
  "GROQ":           "Le langage de requête de Sanity pour récupérer du contenu. Pensez SQL, mais pour du contenu structuré.",
  "Portable Text":  "Le format de texte riche de Sanity — du contenu structuré qui peut être rendu dans n'importe quel format (web, mobile, email) sans perte de mise en forme.",
  "Supabase":       "Une alternative open-source à Firebase — fournit une base de données Postgres, authentification, stockage de fichiers et abonnements temps réel clé en main.",
  "Firebase":       "Le backend-as-a-service de Google — base de données temps réel, authentification, hébergement et fonctions cloud sans gérer de serveurs.",
  "auth":           "Authentification — le système qui vérifie qui est l'utilisateur (connexion, inscription, sessions, OAuth avec Google/GitHub…).",
  "Postgres":       "PostgreSQL — une base de données relationnelle open-source puissante. L'une des plus fiables et des plus utilisées en production.",
}

const GLOSSARY_ES: Record<string, string> = {
  "RAG":            "Retrieval-Augmented Generation — la IA responde usando tus propios datos (docs, productos, base de conocimiento) en lugar de solo lo que aprendió en su entrenamiento.",
  "LLM":            "Large Language Model — el modelo de IA en sí (GPT-4, Gemini, Claude…). El motor que lee y genera texto.",
  "LangChain":      "Un framework para conectar modelos de IA con tus datos, APIs y herramientas. Se usa para construir agentes y pipelines de IA.",
  "SSL":            "La capa de cifrado que pone el candado en tu navegador y hace que tu sitio sea HTTPS.",
  "DNS":            "Domain Name System — el directorio de internet. Traduce nombres de dominio como tusitiio.com en direcciones de servidor.",
  "CI/CD":          "Integración / Despliegue Continuo — pipelines automatizados que prueban y despliegan tu código cada vez que haces un cambio.",
  "CDN":            "Red de Distribución de Contenido — una red de servidores mundial que acelera tu sitio sirviendo archivos desde el servidor más cercano a cada visitante.",
  "Docker":         "Una herramienta que empaqueta tu app y todas sus dependencias en un contenedor, para que funcione igual en cualquier servidor.",
  "OTA":            "Actualizaciones Over-The-Air — envía actualizaciones de la app a los teléfonos de los usuarios sin que tengan que descargar una nueva versión de la tienda.",
  "WebGL":          "Una API del navegador para gráficos 3D acelerados por GPU — usada para escenas 3D interactivas y efectos visuales directamente en el navegador.",
  "GSAP":           "GreenSock Animation Platform — la biblioteca JavaScript de referencia para animaciones web de alto rendimiento.",
  "Three.js":       "Una biblioteca JavaScript para crear y mostrar gráficos 3D fácilmente en el navegador usando WebGL.",
  "Core Web Vitals":"Las métricas de rendimiento de Google (velocidad de carga, interactividad, estabilidad visual) que afectan directamente tu posicionamiento en búsquedas.",
  "Lighthouse":     "La herramienta de auditoría automática de Google que evalúa tu sitio en rendimiento, accesibilidad, SEO y buenas prácticas — sobre 100 puntos.",
  "GA4":            "Google Analytics 4 — la plataforma de análisis de Google. Rastrea quién visita tu sitio, de dónde vienen y qué hacen.",
  "GTM":            "Google Tag Manager — permite añadir y gestionar scripts de seguimiento (analytics, anuncios, heatmaps) sin tocar el código.",
  "CMS":            "Sistema de Gestión de Contenido — una herramienta que permite a personas no técnicas editar textos, imágenes y páginas del sitio sin tocar el código.",
  "GROQ":           "El lenguaje de consulta de Sanity para obtener contenido. Piensa en SQL, pero para contenido estructurado.",
  "Portable Text":  "El formato de texto enriquecido de Sanity — contenido estructurado que se puede renderizar en cualquier formato (web, móvil, email) sin perder el formato.",
  "Supabase":       "Una alternativa open-source a Firebase — proporciona base de datos Postgres, autenticación, almacenamiento y suscripciones en tiempo real listas para usar.",
  "Firebase":       "El backend-as-a-service de Google — base de datos en tiempo real, autenticación, hosting y funciones cloud sin gestionar servidores.",
  "auth":           "Autenticación — el sistema que verifica quién es el usuario (login, registro, sesiones, OAuth con Google/GitHub…).",
  "Postgres":       "PostgreSQL — una potente base de datos relacional open-source. Una de las más fiables y usadas en producción.",
}

const GLOSSARIES: Record<string, Record<string, string>> = {
  en: GLOSSARY_EN,
  fr: GLOSSARY_FR,
  es: GLOSSARY_ES,
}

export const GLOSSARY = GLOSSARY_EN

const JARGON_KEYS = Object.keys(GLOSSARY_EN).sort((a, b) => b.length - a.length)

interface TermProps { term: string; def: string; locale?: string }

function InlineTerm({ term, def }: TermProps) {
  const [open,    setOpen]    = useState(false)
  const [mounted, setMounted] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const popRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  function reposition() {
    const btn = btnRef.current
    const pop = popRef.current
    if (!btn || !pop) return
    const r  = btn.getBoundingClientRect()
    const vw = window.innerWidth
    const pw = Math.min(300, vw * 0.88)
    let left = r.left + r.width / 2 - pw / 2
    const top = r.top < 220
      ? r.bottom + 10 + window.scrollY
      : r.top - 10 + window.scrollY - pop.offsetHeight
    if (left + pw > vw - 12) left = vw - pw - 12
    if (left < 12)           left = 12
    pop.style.top   = `${top}px`
    pop.style.left  = `${left}px`
    pop.style.width = `${pw}px`
  }

  useEffect(() => {
    if (!open) return
    reposition()
    const onKey  = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    window.addEventListener("scroll", reposition, { passive: true })
    window.addEventListener("resize", reposition)
    return () => {
      document.removeEventListener("keydown",   onKey)
      window.removeEventListener("scroll", reposition)
      window.removeEventListener("resize", reposition)
    }
  }, [open])

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onMouseEnter={() => { setOpen(true);  setTimeout(reposition, 0) }}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className={[
          "inline-flex items-center gap-1 relative whitespace-nowrap align-baseline cursor-help vertical-align-baseline",
          "bg-[color-mix(in_oklch,var(--color-primary)_10%,transparent)]",
          "border border-[color-mix(in_oklch,var(--color-primary)_30%,transparent)] rounded",
          "px-[7px] py-px font-mono text-[0.88em] font-medium text-text",
          "transition-[background,border-color] duration-[150ms] ease",
          "hover:bg-[color-mix(in_oklch,var(--color-primary)_20%,transparent)]",
          "hover:border-[color-mix(in_oklch,var(--color-primary)_60%,transparent)]",
          "keyboard-focus-ring",
        ].join(" ")}
      >
        {term}
        <span className={[
          "hidden group-hover:inline-flex items-center justify-center",
          "w-[13px] h-[13px] rounded-full bg-text-subtle text-bg",
          "text-[9px] font-bold leading-none shrink-0",
        ].join(" ")}>?</span>
      </button>

      {mounted && createPortal(
        <div
          ref={popRef}
          aria-hidden={!open}
          className={[
            "absolute z-[200] bg-surface border border-border p-[14px_16px] shadow-md pointer-events-none",
            "opacity-0 translate-y-1 transition-[opacity,transform] duration-[180ms] ease-out",
            open ? "opacity-100 translate-y-0 pointer-events-auto" : "",
          ].join(" ")}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[11px] font-bold tracking-[0.1em] uppercase text-primary">{term}</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="bg-none border-none cursor-pointer text-[16px] text-text-subtle leading-none pl-2 hover:text-text transition-colors duration-[150ms] keyboard-focus-ring"
              aria-label="Close"
            >×</button>
          </div>
          <p className="text-[14px] leading-[1.6] text-text-muted">
            {def.includes(" — ") ? def.split(" — ").slice(1).join(" — ") : def}
          </p>
        </div>,
        document.body
      )}
    </>
  )
}

export function renderWithJargon(text: string, locale = "en"): React.ReactNode {
  const glossary = GLOSSARIES[locale] ?? GLOSSARY_EN
  const pattern = new RegExp(`(${JARGON_KEYS.map(k => k.replace(/[./]/g, "\\$&")).join("|")})`, "g")
  const parts = text.split(pattern)
  return parts.map((part, i) =>
    glossary[part]
      ? <InlineTerm key={i} term={part} def={glossary[part]} locale={locale} />
      : <Fragment key={i}>{part}</Fragment>
  )
}

export function JargonTag({ tag }: { tag: string }) {
  return <TechTag tag={tag} />
}
