"use client"

import { useTranslationContext } from "@/contexts/TranslationContext"
import type { Language } from "@/config/i18n.config"

const LOCALES: Language[] = ["en", "fr", "es"]

interface Props {
  /** Extra classes for the container (e.g. layout tweaks per context). */
  className?: string
  /** Called after a language is selected — e.g. to close the mobile menu. */
  onSelect?: () => void
}

export function LanguageToggle({ className = "", onSelect }: Props) {
  const { language, changeLanguage } = useTranslationContext()

  return (
    <div
      className={`lang-toggle inline-flex border border-border-2 text-[11px] tracking-[0.08em]${className ? ` ${className}` : ""}`}
      role="group"
      aria-label="Language selector"
    >
      {LOCALES.map((lang) => (
        <button
          key={lang}
          onClick={() => { changeLanguage(lang); onSelect?.() }}
          className={[
            "bg-transparent border-0 text-text-muted py-[7px] px-[9px] font-mono text-[11px] cursor-pointer",
            "transition-[color,background] duration-fast ease-out keyboard-focus-ring",
            language === lang ? "active" : "hover:text-text",
          ].join(" ")}
          aria-current={language === lang ? "true" : undefined}
          aria-label={`Switch to ${lang.toUpperCase()}`}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
