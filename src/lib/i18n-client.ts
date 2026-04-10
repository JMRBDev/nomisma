import { dictionaries } from "@/lib/i18n-messages.generated"
import {
  defaultAppLocale,
  buildLocaleCookieValue,
  type AppLocale,
} from "@/lib/i18n"

type MessageValue = string | number | boolean | null | undefined
type MessageParams = Record<string, MessageValue>
type MessageFn = (params?: MessageParams) => string

let currentLocale: AppLocale = defaultAppLocale

function getServerLocale() {
  const locale = (
    globalThis as {
      __nomismaLocaleStore?: {
        getStore(): { locale: AppLocale } | undefined
      }
    }
  ).__nomismaLocaleStore?.getStore()?.locale

  return locale ?? defaultAppLocale
}

function getActiveLocale() {
  return typeof window === "undefined" ? getServerLocale() : currentLocale
}

export function setI18nLocale(locale: AppLocale) {
  currentLocale = locale
}

export function getI18nLocale(): AppLocale {
  return getActiveLocale()
}

export function getLocale() {
  return getActiveLocale()
}

type SetLocaleOptions = {
  reload?: boolean
}

export async function setLocale(locale: AppLocale, options?: SetLocaleOptions) {
  currentLocale = locale
  if (typeof document !== "undefined") {
    document.documentElement.lang = locale
    const cookieValue = buildLocaleCookieValue(locale)
    document.cookie = cookieValue
    window.dispatchEvent(
      new CustomEvent("nomisma:locale-change", { detail: locale })
    )

    if (options?.reload !== false) {
      window.location.reload()
    }
  }
}

function formatMessage(locale: AppLocale, key: string, params?: MessageParams) {
  const dict =
    (dictionaries[locale] as Record<string, string>) ??
    (dictionaries[defaultAppLocale] as Record<string, string>)
  const template =
    dict[key] ??
    (dictionaries[defaultAppLocale] as Record<string, string>)?.[key] ??
    key

  if (!params) {
    return template
  }

  return template.replace(/\{(\w+)\}/g, (_match: string, name: string) => {
    const value = params[name]
    return value == null ? "" : String(value)
  })
}

export const m = new Proxy(
  {},
  {
    get(_target, property) {
      const key = String(property)
      const message: MessageFn = (params) =>
        formatMessage(getActiveLocale(), key, params)
      return message
    },
  }
) as Record<string, MessageFn>
