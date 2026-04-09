import {
  APP_LOCALES,
  DEFAULT_APP_LOCALE,
  type AppLocale,
} from "../../shared/i18n"

export const appLocales = APP_LOCALES
export type { AppLocale } from "../../shared/i18n"
export const defaultAppLocale = DEFAULT_APP_LOCALE
export const localeCookieName = "PARAGLIDE_LOCALE"

type UrlPattern = {
  pattern: string
  localized: [AppLocale, string][]
}

function createLocalizedPath(pattern: string, locale: AppLocale) {
  return pattern === "/" ? `/${locale}` : `/${locale}${pattern}`
}

export const i18nUrlPatterns = ["/", "/:path(.*)?"].map((pattern) => ({
  pattern,
  localized: appLocales.map(
    (locale) =>
      [locale, createLocalizedPath(pattern, locale)] satisfies [
        AppLocale,
        string,
      ],
  ),
})) satisfies UrlPattern[]

export function shouldHandleI18n(pathname: string) {
  if (pathname.startsWith("/api/")) {
    return false
  }

  if (pathname.startsWith("/@") || pathname.startsWith("/_")) {
    return false
  }

  return !/\.[a-zA-Z0-9]+$/.test(pathname)
}

export function toCalendarLocale(locale: AppLocale): string {
  return locale === "es" ? "es-ES" : "en-US"
}
