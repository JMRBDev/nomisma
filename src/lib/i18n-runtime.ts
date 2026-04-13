import type { AppLocale } from "@/lib/i18n-locale"
import type { TranslationKey } from "@/lib/i18n-types.generated"
import { buildLocaleCookieValue, defaultAppLocale } from "@/lib/i18n-locale"

type TranslationValue = string | number | boolean | null | undefined
type TranslationParams = Record<string, TranslationValue>
type Translator = (key: TranslationKey, params?: TranslationParams) => string
type TranslationEntry = Record<string, string>

type LocaleModule = {
  default: Record<string, string>
}

type RequestLocaleStore = {
  locale: AppLocale
}

type LocaleStore = {
  getStore: () => RequestLocaleStore | undefined
}

const localeModules = import.meta.glob<LocaleModule>("/i18n/*/*.json", {
  eager: true,
})

const dictionaries = buildDictionaries(localeModules)

let currentLocale: AppLocale = defaultAppLocale

function buildDictionaries(modules: Record<string, LocaleModule>) {
  const nextDictionaries: Partial<Record<AppLocale, TranslationEntry>> = {}

  for (const [filePath, module] of Object.entries(modules)) {
    const match = filePath.match(/\/i18n\/([^/]+)\/([^/]+)\.json$/)

    if (!match) {
      continue
    }

    const [, locale, namespace] = match
    const existingEntries = nextDictionaries[locale as AppLocale] ?? {}
    const scopedEntries = Object.fromEntries(
      Object.entries(module.default).map(([key, value]) => [
        `${namespace}_${key}`,
        value,
      ])
    )

    nextDictionaries[locale as AppLocale] = {
      ...existingEntries,
      ...scopedEntries,
    }
  }

  return nextDictionaries as Record<AppLocale, TranslationEntry>
}

function getLocaleStore() {
  return (
    globalThis as {
      __nomismaLocaleStore?: LocaleStore
    }
  ).__nomismaLocaleStore
}

function getActiveLocale() {
  if (typeof window === "undefined") {
    return getLocaleStore()?.getStore()?.locale ?? defaultAppLocale
  }

  return currentLocale
}

function getDictionary(locale: AppLocale) {
  return dictionaries[locale]
}

function formatTranslation(
  key: TranslationKey,
  locale: AppLocale,
  params?: TranslationParams
) {
  const template = getDictionary(locale)[key]

  if (!params) {
    return template
  }

  return template.replace(/\{([^}]+)\}/g, (_match, name: string) => {
    const value = params[name]
    return value == null ? "" : String(value)
  })
}

export function getLocale() {
  return getActiveLocale()
}

export function syncLocale(locale: AppLocale) {
  currentLocale = locale
}

export function setLocale(
  locale: AppLocale,
  options?: {
    reload?: boolean
  }
) {
  syncLocale(locale)

  if (typeof document === "undefined") {
    return
  }

  document.documentElement.lang = locale
  document.cookie = buildLocaleCookieValue(locale)

  if (options?.reload) {
    window.location.reload()
  }
}

export function t(key: TranslationKey, params?: TranslationParams) {
  return formatTranslation(key, getActiveLocale(), params)
}

export function createTranslator(locale: AppLocale) {
  return ((key: TranslationKey, params?: TranslationParams) =>
    formatTranslation(key, locale, params)) satisfies Translator
}
