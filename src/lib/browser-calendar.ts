import { getCurrentCalendarContext } from "@/lib/date-keys"

export const BROWSER_TIME_ZONE_COOKIE_NAME = "nomisma-time-zone"
export const BROWSER_LOCALE_COOKIE_NAME = "nomisma-locale"
const BROWSER_CALENDAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365
const DEFAULT_BROWSER_TIME_ZONE = "UTC"
const DEFAULT_BROWSER_LOCALE = "en-US"

export type BrowserCalendarContext = ReturnType<
  typeof resolveBrowserCalendarContext
>

function normalizeTimeZone(value?: string | null) {
  if (!value) {
    return DEFAULT_BROWSER_TIME_ZONE
  }

  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: value,
    }).resolvedOptions().timeZone
  } catch {
    return DEFAULT_BROWSER_TIME_ZONE
  }
}

function normalizeLocale(value?: string | null) {
  const candidate = value?.split(",")[0]?.split(";")[0]?.trim()

  if (!candidate) {
    return DEFAULT_BROWSER_LOCALE
  }

  try {
    return Intl.getCanonicalLocales(candidate)[0] ?? DEFAULT_BROWSER_LOCALE
  } catch {
    return DEFAULT_BROWSER_LOCALE
  }
}

export function resolveBrowserCalendarContext(input?: {
  timeZone?: string | null
  locale?: string | null
  referenceDate?: Date
}) {
  const timeZone = normalizeTimeZone(input?.timeZone)
  const locale = normalizeLocale(input?.locale)
  const calendar = getCurrentCalendarContext(
    input?.referenceDate ?? new Date(),
    timeZone
  )

  return {
    timeZone,
    locale,
    ...calendar,
  }
}

export function detectBrowserCalendarPreferences() {
  const { timeZone, locale } = Intl.DateTimeFormat().resolvedOptions()

  return {
    timeZone: normalizeTimeZone(timeZone),
    locale: normalizeLocale(locale),
  }
}

function buildCookieValue(name: string, value: string) {
  return `${name}=${encodeURIComponent(value)}; path=/; max-age=${BROWSER_CALENDAR_COOKIE_MAX_AGE}; samesite=lax`
}

export function writeBrowserCalendarCookies(input: {
  timeZone: string
  locale: string
}) {
  const nextTimeZone = normalizeTimeZone(input.timeZone)
  const nextLocale = normalizeLocale(input.locale)
  const existingCookies = document.cookie
  const hasTimeZoneCookie = existingCookies.includes(
    `${BROWSER_TIME_ZONE_COOKIE_NAME}=${encodeURIComponent(nextTimeZone)}`
  )
  const hasLocaleCookie = existingCookies.includes(
    `${BROWSER_LOCALE_COOKIE_NAME}=${encodeURIComponent(nextLocale)}`
  )

  if (!hasTimeZoneCookie) {
    document.cookie = buildCookieValue(BROWSER_TIME_ZONE_COOKIE_NAME, nextTimeZone)
  }

  if (!hasLocaleCookie) {
    document.cookie = buildCookieValue(BROWSER_LOCALE_COOKIE_NAME, nextLocale)
  }

  return !hasTimeZoneCookie || !hasLocaleCookie
}

export function getBrowserCalendarBootstrapScript() {
  return `(function(){try{var r=Intl.DateTimeFormat().resolvedOptions();var tz=r.timeZone||"";var locale=r.locale||navigator.language||"";if(tz){document.cookie="${BROWSER_TIME_ZONE_COOKIE_NAME}="+encodeURIComponent(tz)+"; path=/; max-age=${BROWSER_CALENDAR_COOKIE_MAX_AGE}; samesite=lax"}if(locale){document.cookie="${BROWSER_LOCALE_COOKIE_NAME}="+encodeURIComponent(locale)+"; path=/; max-age=${BROWSER_CALENDAR_COOKIE_MAX_AGE}; samesite=lax"}}catch(e){}})()`
}
