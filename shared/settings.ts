import { DEFAULT_APP_LOCALE, type AppLocale } from "./i18n"

export type WeekStartsOnPreference = "sunday" | "monday"

export type UserSettingsLike = {
  baseCurrency?: string | null
  weekStartsOn?: WeekStartsOnPreference | null
  locale?: AppLocale | null
}

export const DEFAULT_BASE_CURRENCY = "EUR"
export const DEFAULT_WEEK_STARTS_ON: WeekStartsOnPreference = "monday"
export const DEFAULT_LOCALE: AppLocale = DEFAULT_APP_LOCALE

export function resolveUserSettings(
  settings?: UserSettingsLike | null
): {
  baseCurrency: string
  locale: AppLocale
  weekStartsOn: WeekStartsOnPreference
} {
  return {
    baseCurrency: settings?.baseCurrency ?? DEFAULT_BASE_CURRENCY,
    locale: settings?.locale ?? DEFAULT_LOCALE,
    weekStartsOn: settings?.weekStartsOn ?? DEFAULT_WEEK_STARTS_ON,
  }
}
