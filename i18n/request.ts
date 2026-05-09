import { getRequestConfig } from "next-intl/server"
import { routing } from "./routing"
import type { Language } from "@/config/i18n.config"

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = (await requestLocale) as Language
  if (!locale || !(routing.locales as readonly string[]).includes(locale)) {
    locale = routing.defaultLocale as Language
  }

  const [common, home] = await Promise.all([
    import(`../locales/${locale}/common.json`),
    import(`../locales/${locale}/home.json`),
  ])

  return {
    locale,
    messages: {
      ...common.default,
      home: home.default,
    },
  }
})
