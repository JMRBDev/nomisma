import type { AppLocale } from "../../../../shared/i18n"
import { getCurrencyOptions } from "@/lib/currency"
import { m } from "@/lib/i18n-client"
import {
  resolveUserSettings,
  type UserSettingsLike,
  type WeekStartsOnPreference,
} from "../../../../shared/settings"

export type SettingsFormValues = {
  baseCurrency: string
  locale: AppLocale
  weekStartsOn: WeekStartsOnPreference
}

export type { WeekStartsOnPreference } from "../../../../shared/settings"

export function getDefaultCurrencyOptions() {
  return getCurrencyOptions()
}

export function getWeekStartsOnOptions() {
  return [
    { value: "sunday", label: m.week_start_sunday() },
    { value: "monday", label: m.week_start_monday() },
  ] as const
}

export function getLocaleOptions() {
  return [
    { value: "en", label: m.locale_english() },
    { value: "es", label: m.locale_spanish() },
  ] as const
}

export function createSettingsFormValues(
  settings?: UserSettingsLike | null
): SettingsFormValues {
  return resolveUserSettings(settings)
}

export function toWeekStartsOnDayIndex(
  value: WeekStartsOnPreference | null | undefined
) {
  return value === "monday" ? 1 : 0
}
