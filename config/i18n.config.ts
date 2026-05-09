export const locales = ["en", "fr", "es"] as const
export type Language = (typeof locales)[number]
export const defaultLocale: Language = "en"

export const routeTranslations: Record<Language, Record<string, string>> = {
  en: {},
  fr: {},
  es: {},
}
