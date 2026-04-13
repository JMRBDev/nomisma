import { APP_LOCALES, DEFAULT_APP_LOCALE } from "../../shared/i18n"
import type { AppLocale } from "../../shared/i18n"

export const appLocales = APP_LOCALES
export type { AppLocale } from "../../shared/i18n"
export const defaultAppLocale = DEFAULT_APP_LOCALE
export const localeCookieName = "nomisma-app-locale"

export function isAppLocale(
  value: string | null | undefined
): value is AppLocale {
  return typeof value === "string" && appLocales.includes(value as AppLocale)
}

export function normalizeAppLocale(value: string | null | undefined) {
  if (!value) {
    return null
  }

  const normalized = value.trim().toLowerCase()

  if (isAppLocale(normalized)) {
    return normalized
  }

  const language = normalized.split("-")[0]
  return isAppLocale(language) ? language : null
}

export function parseCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) {
    return null
  }

  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rawValue] = part.trim().split("=")

    if (rawName !== name) {
      continue
    }

    const value = rawValue.join("=")

    try {
      return decodeURIComponent(value)
    } catch {
      return value
    }
  }

  return null
}

export function resolveLocaleFromAcceptLanguage(
  header: string | null | undefined
) {
  if (!header) {
    return defaultAppLocale
  }

  const values = header
    .split(",")
    .map((part) => part.split(";")[0]?.trim())
    .filter(Boolean)

  for (const value of values) {
    const locale = normalizeAppLocale(value)

    if (locale) {
      return locale
    }
  }

  return defaultAppLocale
}

export function resolveLocaleFromRequest(request: Request) {
  const cookieLocale = normalizeAppLocale(
    parseCookieValue(request.headers.get("cookie"), localeCookieName)
  )

  if (cookieLocale) {
    return cookieLocale
  }

  return resolveLocaleFromAcceptLanguage(request.headers.get("accept-language"))
}

export function buildLocaleCookieValue(locale: AppLocale) {
  return `${localeCookieName}=${encodeURIComponent(locale)}; path=/; max-age=31536000; samesite=lax`
}

export function getLocaleRedirectPath(pathname: string) {
  const segments = pathname.split("/")
  const locale = normalizeAppLocale(segments[1])

  if (!locale) {
    return null
  }

  const nextSegments = segments.slice(2)
  const nextPathname = `/${nextSegments.join("/")}`.replace(/\/+/g, "/")

  return {
    locale,
    pathname:
      nextPathname === "/" ? nextPathname : nextPathname.replace(/\/$/, ""),
  }
}

export function toCalendarLocale(locale: AppLocale): string {
  return locale === "es" ? "es-ES" : "en-US"
}
