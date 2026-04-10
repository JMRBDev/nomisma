import { ConvexHttpClient } from "convex/browser"
import { api } from "../../convex/_generated/api"
import type { AppLocale } from "@/lib/i18n"
import {
  defaultAppLocale,
  localeCookieName,
  normalizeAppLocale,
  parseCookieValue,
  resolveLocaleFromAcceptLanguage,
} from "@/lib/i18n"

type RequestLocaleStore = {
  locale: AppLocale
}

type LocaleStore = {
  getStore: () => RequestLocaleStore | undefined
}

function getLocaleStore() {
  return (globalThis as {
    __nomismaLocaleStore?: LocaleStore
  }).__nomismaLocaleStore
}

export function getRequestLocale() {
  return getLocaleStore()?.getStore()?.locale ?? defaultAppLocale
}

export function setRequestLocale(locale: AppLocale) {
  const store = getLocaleStore()?.getStore()

  if (store) {
    store.locale = locale
  }
}

export async function resolveAuthenticatedRequestLocale(token: string) {
  const convexUrl = process.env.VITE_CONVEX_URL

  if (!convexUrl) {
    throw new Error("VITE_CONVEX_URL is not set")
  }

  const client = new ConvexHttpClient(convexUrl, {
    auth: token,
    logger: false,
  })
  const userSettings = await client.query(api.settings.getUserSettings, {})
  return normalizeAppLocale(userSettings.savedLocale) ?? null
}

export function resolvePreferredRequestLocale(input: {
  savedLocale?: string | null
  cookieLocale?: string | null
  acceptLanguage?: string | null
}) {
  const savedLocale = normalizeAppLocale(input.savedLocale)

  if (savedLocale) {
    return savedLocale
  }

  const cookieLocale = normalizeAppLocale(input.cookieLocale)

  if (cookieLocale) {
    return cookieLocale
  }

  return resolveLocaleFromAcceptLanguage(input.acceptLanguage)
}

export async function resolveRequestLocaleWithAuth(
  request: Request,
  token?: string | null
) {
  const savedLocale = token
    ? await resolveAuthenticatedRequestLocale(token)
    : null

  return resolvePreferredRequestLocale({
    savedLocale,
    cookieLocale: parseCookieValue(
      request.headers.get("cookie"),
      localeCookieName
    ),
    acceptLanguage: request.headers.get("accept-language"),
  })
}
