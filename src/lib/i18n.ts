export {
  appLocales,
  buildLocaleCookieValue,
  defaultAppLocale,
  getLocaleRedirectPath,
  isAppLocale,
  localeCookieName,
  normalizeAppLocale,
  parseCookieValue,
  resolveLocaleFromAcceptLanguage,
  resolveLocaleFromRequest,
  toCalendarLocale,
} from "@/lib/i18n-locale"
export type { AppLocale } from "@/lib/i18n-locale"

export {
  getLocale,
  setLocale,
  t,
} from "@/lib/i18n-runtime"
export type { TranslationKey } from "@/lib/i18n-types.generated"
