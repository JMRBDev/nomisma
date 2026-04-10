import type { AppLocale } from "@/lib/i18n"
import {
  defaultAppLocale,
  resolveLocaleFromRequest,
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

export function resolveRequestLocale(request: Request) {
  return resolveLocaleFromRequest(request)
}
