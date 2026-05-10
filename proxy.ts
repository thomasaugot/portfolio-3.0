import { NextRequest, NextResponse } from "next/server"
import { routing } from "./i18n/routing"
import { routeTranslations } from "./config/i18n.config"
import type { Language } from "./config/i18n.config"

export const config = {
  matcher: ["/((?!_next|api|admin|favicon.ico|assets).*)"],
}

function withLocaleHeader(response: NextResponse, locale: string): NextResponse {
  response.headers.set("x-next-intl-locale", locale)
  return response
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const defaultLocale = routing.defaultLocale
  const locales = routing.locales as readonly string[]

  const segments = pathname.split("/").filter(Boolean)
  const firstSegment = segments[0]
  const hasLocalePrefix = locales.includes(firstSegment)
  const locale = hasLocalePrefix ? firstSegment : defaultLocale
  const rest = hasLocalePrefix ? "/" + segments.slice(1).join("/") : pathname

  const translations = routeTranslations[locale as Language] ?? {}
  const reverseMap = Object.fromEntries(
    Object.entries(translations).map(([canonical, translated]) => [translated, canonical])
  )
  const slug = rest.split("/").filter(Boolean)[0] ?? ""
  const canonicalSlug = reverseMap[slug] ?? slug
  const canonicalPath = slug ? rest.replace(slug, canonicalSlug) : rest

  const internalUrl = request.nextUrl.clone()
  internalUrl.pathname = `/${locale}${canonicalPath === "/" ? "" : canonicalPath}`

  const response = NextResponse.rewrite(internalUrl)
  return withLocaleHeader(response, locale)
}
