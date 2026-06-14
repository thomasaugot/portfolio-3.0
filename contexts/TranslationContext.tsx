"use client"

import {
  createContext, useContext, useCallback, useMemo, type ReactNode
} from "react"
import { useRouter, usePathname } from "next/navigation"
import type { Language } from "@/config/i18n.config"
import { routeTranslations } from "@/config/i18n.config"

interface TranslationContextValue {
  language: Language
  changeLanguage: (lang: Language) => void
  toggleLanguage: () => void
}

const TranslationContext = createContext<TranslationContextValue | null>(null)

const LOCALES: Language[] = ["en", "fr", "es"]

export function TranslationProvider({
  locale,
  children,
}: {
  locale: Language
  children: ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  const changeLanguage = useCallback(
    (lang: Language) => {
      if (lang === locale) return
      const translations = routeTranslations[lang] ?? {}
      const reverseMap = Object.fromEntries(
        Object.entries(routeTranslations[locale] ?? {}).map(([canonical, translated]) => [
          translated,
          canonical,
        ])
      )
      const segments = pathname.split("/").filter(Boolean)
      const hasLocale = LOCALES.includes(segments[0] as Language)
      const pathWithoutLocale = hasLocale ? "/" + segments.slice(1).join("/") : pathname
      const slug = pathWithoutLocale.split("/").filter(Boolean)[0] ?? ""
      const canonical = reverseMap[slug] ?? slug
      const translated = translations[canonical] ?? canonical
      const newPath = `/${lang}${translated ? `/${translated}` : ""}`
      window.history.replaceState(null, "", newPath)
      router.push(newPath)
      document.documentElement.lang = lang
      localStorage.setItem("preferred-language", lang)
    },
    [locale, pathname, router]
  )

  const toggleLanguage = useCallback(() => {
    const idx = LOCALES.indexOf(locale)
    changeLanguage(LOCALES[(idx + 1) % LOCALES.length])
  }, [locale, changeLanguage])

  const value = useMemo(
    () => ({ language: locale, changeLanguage, toggleLanguage }),
    [locale, changeLanguage, toggleLanguage]
  )

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslationContext() {
  const ctx = useContext(TranslationContext)
  if (!ctx) throw new Error("useTranslationContext must be used inside TranslationProvider")
  return ctx
}
