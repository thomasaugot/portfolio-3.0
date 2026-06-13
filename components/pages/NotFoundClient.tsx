"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Shell } from "@/components/layout/Shell"
import { Button } from "@/components/ui/Button"

type Suggested = { label: string; href: string; desc: string }

type Copy = {
  eyebrow: string
  title_a: string
  title_b: string
  title_c: string
  sub: string
  terminal_user: string
  terminal_path: string
  log_1_cmd: string
  log_1_out: string
  log_2_cmd: string
  log_2_out: string
  log_3_cmd: string
  log_3_out: string
  log_4_cmd: string
  trace_heading: string
  trace_1: string
  trace_2: string
  trace_3: string
  trace_4: string
  trace_at: string
  back_home: string
  view_work: string
  report: string
  report_subject: string
  suggested_heading: string
  routes_word: (n: number) => string
  suggested: Suggested[]
}

const COPY: Record<"en" | "fr" | "es", Copy> = {
  en: {
    eyebrow: "[ ERR / 404 ]",
    title_a: "This page",
    title_b: "doesn't exist",
    title_c: "— at least not here.",
    sub: "The URL is wrong, the page moved, or it never shipped. Either way, nothing to render. Try one of the routes below — or head back home.",
    terminal_user: "thomas@las-palmas",
    terminal_path: "~/site",
    log_1_cmd: "curl -I $REQUEST_URL",
    log_1_out: "HTTP/2 404 Not Found",
    log_2_cmd: "git log --grep=\"$PATH\" --oneline",
    log_2_out: "(no matches)",
    log_3_cmd: "echo \"What happened?\"",
    log_3_out: "Page not found. Could be a typo, a stale link, or a route that never made it past staging.",
    log_4_cmd: "ls suggested/",
    trace_heading: "Stack trace",
    trace_1: "Error: Route not registered",
    trace_2: "  at Router.match (next/dist/server/router.ts)",
    trace_3: "  at handleRequest (next/dist/server/next-server.ts)",
    trace_4: "  at <unknown>",
    trace_at: "  at request ",
    back_home: "Back home",
    view_work: "View work",
    report: "Report this link",
    report_subject: "Broken link on helloimtom.dev",
    suggested_heading: "Suggested routes",
    routes_word: (n) => (n === 1 ? "route" : "routes"),
    suggested: [
      { label: "Home", href: "/", desc: "The landing page — services, work, contact." },
      { label: "Work", href: "/work", desc: "Shipped projects, case studies, code." },
      { label: "Contact", href: "/#contact", desc: "Hire me, ask a question, say hi." },
    ],
  },
  fr: {
    eyebrow: "[ ERR / 404 ]",
    title_a: "Cette page",
    title_b: "n'existe pas",
    title_c: "— en tout cas, pas ici.",
    sub: "L'URL est fausse, la page a bougé, ou elle n'a jamais été livrée. Rien à afficher. Essayez une des routes ci-dessous — ou retournez à l'accueil.",
    terminal_user: "thomas@las-palmas",
    terminal_path: "~/site",
    log_1_cmd: "curl -I $REQUEST_URL",
    log_1_out: "HTTP/2 404 Not Found",
    log_2_cmd: "git log --grep=\"$PATH\" --oneline",
    log_2_out: "(aucun résultat)",
    log_3_cmd: "echo \"Que s'est-il passé ?\"",
    log_3_out: "Page introuvable. Faute de frappe, lien périmé, ou route qui n'a jamais quitté la staging.",
    log_4_cmd: "ls suggested/",
    trace_heading: "Trace d'erreur",
    trace_1: "Error: Route not registered",
    trace_2: "  at Router.match (next/dist/server/router.ts)",
    trace_3: "  at handleRequest (next/dist/server/next-server.ts)",
    trace_4: "  at <unknown>",
    trace_at: "  at requête ",
    back_home: "Retour à l'accueil",
    view_work: "Voir les projets",
    report: "Signaler ce lien",
    report_subject: "Lien cassé sur helloimtom.dev",
    suggested_heading: "Routes suggérées",
    routes_word: () => "routes",
    suggested: [
      { label: "Accueil", href: "/", desc: "La page d'accueil — services, projets, contact." },
      { label: "Projets", href: "/work", desc: "Projets livrés, études de cas, code." },
      { label: "Contact", href: "/#contact", desc: "Recrutez-moi, posez une question, dites bonjour." },
    ],
  },
  es: {
    eyebrow: "[ ERR / 404 ]",
    title_a: "Esta página",
    title_b: "no existe",
    title_c: "— al menos no aquí.",
    sub: "La URL es incorrecta, la página se movió, o nunca llegó a producción. Nada que renderizar. Prueba una de las rutas de abajo — o vuelve al inicio.",
    terminal_user: "thomas@las-palmas",
    terminal_path: "~/site",
    log_1_cmd: "curl -I $REQUEST_URL",
    log_1_out: "HTTP/2 404 Not Found",
    log_2_cmd: "git log --grep=\"$PATH\" --oneline",
    log_2_out: "(sin resultados)",
    log_3_cmd: "echo \"¿Qué pasó?\"",
    log_3_out: "Página no encontrada. Puede ser un typo, un enlace caducado, o una ruta que nunca salió de staging.",
    log_4_cmd: "ls suggested/",
    trace_heading: "Stack trace",
    trace_1: "Error: Route not registered",
    trace_2: "  at Router.match (next/dist/server/router.ts)",
    trace_3: "  at handleRequest (next/dist/server/next-server.ts)",
    trace_4: "  at <unknown>",
    trace_at: "  at petición ",
    back_home: "Volver al inicio",
    view_work: "Ver proyectos",
    report: "Reportar este enlace",
    report_subject: "Enlace roto en helloimtom.dev",
    suggested_heading: "Rutas sugeridas",
    routes_word: () => "rutas",
    suggested: [
      { label: "Inicio", href: "/", desc: "La página de inicio — servicios, proyectos, contacto." },
      { label: "Proyectos", href: "/work", desc: "Proyectos entregados, casos de estudio, código." },
      { label: "Contacto", href: "/#contact", desc: "Contratame, pregunta algo, saluda." },
    ],
  },
}

function detectLocale(pathname: string): "en" | "fr" | "es" {
  const first = pathname.split("/").filter(Boolean)[0]
  if (first === "fr") return "fr"
  if (first === "es") return "es"
  return "en"
}

export function NotFoundClient() {
  const pathname = usePathname() || "/"
  const locale = detectLocale(pathname)
  const t = COPY[locale]
  const requestPath = pathname

  const lines = useMemo(
    () => [
      { kind: "prompt", text: t.log_1_cmd.replace("$REQUEST_URL", requestPath) },
      { kind: "err",    text: t.log_1_out },
      { kind: "blank",  text: "" },
      { kind: "prompt", text: t.log_2_cmd.replace("$PATH", requestPath) },
      { kind: "muted",  text: t.log_2_out },
      { kind: "blank",  text: "" },
      { kind: "prompt", text: t.log_3_cmd },
      { kind: "out",    text: t.log_3_out },
      { kind: "blank",  text: "" },
      { kind: "prompt", text: t.log_4_cmd },
      ...t.suggested.map((s) => ({
        kind: "ls" as const,
        text: s.label.toLowerCase().replace(/\s+/g, "-") + "/",
      })),
      { kind: "blank", text: "" },
    ],
    [t, requestPath]
  )

  const [visible, setVisible] = useState(0)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      i++
      setVisible(i)
      if (i >= lines.length) clearInterval(id)
      if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }, 90)
    return () => clearInterval(id)
  }, [lines.length])

  return (
    <section className="relative overflow-x-clip min-h-svh flex flex-col justify-center pt-[clamp(80px,10vh,130px)] pb-[clamp(40px,6vh,80px)]">
      <Shell className=" flex flex-col gap-12">
        <div className="grid grid-cols-[1fr_1fr] gap-14 items-stretch max-[900px]:grid-cols-1">

          {/* Left: title + sub + CTAs */}
          <div className="flex flex-col justify-between gap-8">
            <span className="text-eyebrow">{t.eyebrow}</span>

            <div
              aria-hidden="true"
              className="font-display font-black leading-[0.85] tracking-[-0.06em] text-[clamp(120px,22vw,260px)] text-primary select-none"
            >
              404
            </div>

            <h1 className="font-display font-semibold text-[clamp(34px,4.8vw,72px)] leading-[0.92] tracking-[-0.045em] flex flex-col">
              <span>{t.title_a}</span>
              <span className="text-primary">{t.title_b}</span>
              <span className="text-serif-italic text-text-muted text-[0.7em]">{t.title_c}</span>
            </h1>

            <p className="text-body text-text-muted leading-[1.55] max-w-[52ch]">{t.sub}</p>

            <div className="flex gap-3 items-center flex-wrap">
              <Button href="/" variant="filled">
                {t.back_home}
                <span aria-hidden="true">→</span>
              </Button>
              <Button href="/work" variant="ghost">
                {t.view_work} <span aria-hidden="true">→</span>
              </Button>
              <a
                href={`mailto:thomas.augot@gmail.com?subject=${encodeURIComponent(t.report_subject)}&body=${encodeURIComponent(requestPath)}`}
                className="text-caption font-mono text-text-muted hover:text-primary keyboard-focus-ring"
              >
                {t.report}
              </a>
            </div>
          </div>

          {/* Right: terminal */}
          <div className="flex flex-col max-[900px]:hidden">
            <div className="flex-1 flex flex-col font-mono text-[16px] relative overflow-hidden bg-surface border border-border shadow-(--shadow-terminal) before:content-[''] before:absolute before:inset-0 before:pointer-events-none before:bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.012)_0_1px,transparent_1px_3px)]" aria-label="404 terminal — decorative" role="img">
              <div className="flex items-center gap-2 py-2.5 px-3.5 border-b border-border bg-surface-2 shrink-0" aria-hidden="true">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                <span className="flex-1 text-center text-caption text-text-subtle tracking-wider">
                  {t.terminal_user} — {t.terminal_path}
                </span>
                <div className="flex">
                  <span className="text-caption text-text-subtle px-2 py-1 border border-transparent">bash</span>
                  <span className="text-caption text-text px-2 py-1 border border-border-2 bg-bg">node</span>
                </div>
              </div>

              <div ref={bodyRef} className="flex-1 px-4.5 pt-4.5 overflow-hidden relative">
                {lines.map((line, idx) => {
                  const shown = idx < visible
                  const isAnimating = visible < lines.length
                  const isCurrentLast = idx === visible - 1
                  const h = shown ? "" : " invisible"

                  if (line.kind === "blank") return <div key={idx} className={`whitespace-pre min-h-[1.5em]${h}`} />
                  if (line.kind === "prompt") return (
                    <div key={idx} className={`whitespace-pre min-h-[1.5em]${h}`}>
                      <span className="text-primary">❯ </span>
                      <span className="text-text">{line.text}</span>
                      {isCurrentLast && isAnimating && <span className="inline-block w-2 h-[1em] bg-primary align-[-2px] animate-[blink_1s_steps(2)_infinite] ml-0.5" />}
                    </div>
                  )
                  if (line.kind === "err") return (
                    <div key={idx} className={`whitespace-pre min-h-[1.5em] text-(--color-error)${h}`}>{line.text}</div>
                  )
                  if (line.kind === "muted") return (
                    <div key={idx} className={`whitespace-pre min-h-[1.5em] text-text-subtle${h}`}>{line.text}</div>
                  )
                  if (line.kind === "ls") return (
                    <div key={idx} className={`whitespace-pre min-h-[1.5em] text-(--color-str)${h}`}>{line.text}</div>
                  )
                  return (
                    <div key={idx} className={`whitespace-pre min-h-[1.5em] text-text-muted${h}`}>{line.text}</div>
                  )
                })}
                <div className={`whitespace-pre min-h-[1.5em]${visible >= lines.length ? "" : " invisible"}`}>
                  <span className="text-primary">❯ </span>
                  <span className="inline-block w-2 h-[1em] bg-primary align-[-2px] animate-[blink_1s_steps(2)_infinite] ml-0.5" />
                </div>
              </div>

              <div className="border-t border-border py-2 px-3.5 flex justify-between items-center text-caption text-text-subtle bg-surface-2 shrink-0">
                <div className="flex gap-3.5">
                  <span><span className="text-primary">main</span></span>
                  <span>exit 404</span>
                  <span>{requestPath}</span>
                </div>
                <span>UTF-8</span>
              </div>
            </div>
          </div>
        </div>

        {/* Suggested routes */}
        <div className="flex flex-col gap-5">
          <div className="flex items-baseline justify-between border-t border-border pt-5">
            <span className="text-caption text-text-subtle uppercase tracking-[0.12em]">
              {t.suggested_heading}
            </span>
            <span className="text-caption font-mono text-text-subtle">
              {t.suggested.length} {t.routes_word(t.suggested.length)}
            </span>
          </div>

          <ul className="grid grid-cols-3 gap-4 max-[800px]:grid-cols-1">
            {t.suggested.map((s, i) => (
              <li key={s.href}>
                <Link
                  href={s.href}
                  className="group block border border-border p-5 hover:border-primary transition-colors keyboard-focus-ring h-full"
                >
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-caption font-mono text-text-subtle tracking-[0.1em]">
                      0{i + 1}
                    </span>
                    <span className="text-caption font-mono text-text-subtle group-hover:text-primary transition-colors">
                      {s.href}
                    </span>
                  </div>
                  <div className="font-display text-subheading tracking-[-0.02em] mb-2 group-hover:text-primary transition-colors">
                    {s.label}
                  </div>
                  <p className="text-body text-text-muted leading-[1.5]">{s.desc}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Stack trace */}
        <div className="flex flex-col gap-3">
          <div className="border-t border-border pt-5">
            <span className="text-caption text-text-subtle uppercase tracking-[0.12em]">
              {t.trace_heading}
            </span>
          </div>
          <pre className="text-caption font-mono leading-[1.7] text-text-muted whitespace-pre-wrap break-all">
            <span className="text-(--color-error)">{t.trace_1}</span>{"\n"}
            <span className="text-text-subtle">{t.trace_2}</span>{"\n"}
            <span className="text-text-subtle">{t.trace_3}</span>{"\n"}
            <span className="text-text-subtle">{t.trace_4}</span>{"\n"}
            <span className="text-text-subtle">{t.trace_at}</span>
            <span className="text-(--color-str)">{requestPath}</span>
          </pre>
        </div>
      </Shell>
    </section>
  )
}
