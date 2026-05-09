"use client"

const SOCIALS = [
  {
    key: "medium",
    label: "Medium",
    handle: "@thomasaugot",
    desc: "Essays on building products, learning to code after a career change, and shipping things that last.",
    href: "https://medium.com/@thomasaugot",
    cta: "Read my writing →",
    featured: true,
  },
  {
    key: "github",
    label: "GitHub",
    handle: "thomasaugot",
    desc: "Open source repos, side projects, and the code behind what I ship.",
    href: "https://github.com/thomasaugot",
    cta: "See the code →",
    featured: false,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    handle: "in/thomasaugot",
    desc: "Work history, recommendations, and professional updates.",
    href: "https://linkedin.com/in/thomasaugot",
    cta: "Connect →",
    featured: false,
  },
]

export function HomeSocials() {
  return (
    <section className="page-section">
      <div className="shell">
        <div className="section-head">
          <span className="section-head-meta">[ FIND ME ]</span>
          <h2 className="section-head-title">On the internet.</h2>
        </div>

        <div className="grid gap-0.5 grid-cols-[2fr_1fr_1fr] max-[700px]:grid-cols-1">
          {SOCIALS.map((s) => (
            <a
              key={s.key}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex flex-col gap-3 p-7 border border-border no-underline text-inherit transition-[background,border-color] duration-150 hover:bg-surface-2 hover:border-primary${s.featured ? " bg-surface-2" : " bg-surface"}`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-display text-[22px] font-semibold tracking-[-0.02em] text-text">{s.label}</span>
                <span className="font-mono text-[11px] text-primary tracking-[0.04em]">{s.handle}</span>
              </div>
              <p className="text-[14px] text-text-muted leading-[1.55] flex-1 m-0">{s.desc}</p>
              <span className="font-mono text-[12px] text-text-subtle tracking-[0.04em] transition-colors duration-150 group-hover:text-primary">{s.cta}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
