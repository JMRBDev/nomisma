import { ConvexHttpClient } from "convex/browser"
import { api } from "../../convex/_generated/api"
import {
  defaultAppLocale,
  localeCookieName,
  normalizeAppLocale,
  parseCookieValue,
  resolveLocaleFromAcceptLanguage,
  type AppLocale,
} from "@/lib/i18n"

type RequestLocaleStore = {
  locale: AppLocale
}

type LocaleStore = {
  getStore(): RequestLocaleStore | undefined
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

export async function resolveRequestLocaleWithAuth(request: Request, token?: string | null) {
  const cookieLocale = normalizeAppLocale(
    parseCookieValue(request.headers.get("cookie"), localeCookieName),
  )

  if (cookieLocale) {
    return cookieLocale
  }

  if (token) {
    const savedLocale = await resolveAuthenticatedRequestLocale(token)

    if (savedLocale) {
      return savedLocale
    }
  }

  return resolveLocaleFromAcceptLanguage(request.headers.get("accept-language"))
}
