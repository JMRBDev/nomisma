export const APP_LOCALES = ["en", "es"] as const

export type AppLocale = (typeof APP_LOCALES)[number]

export const DEFAULT_APP_LOCALE: AppLocale = "en"
