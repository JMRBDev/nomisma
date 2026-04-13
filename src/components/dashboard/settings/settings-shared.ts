import { resolveUserSettings } from "../../../../shared/settings"
import type {
  UserSettingsLike,
  WeekStartsOnPreference,
} from "../../../../shared/settings"
import type { AppLocale } from "../../../../shared/i18n"
import { getCurrencyOptions } from "@/lib/currency"
import { t } from "@/lib/i18n"

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
    { value: "sunday", label: t("week_start_sunday") },
    { value: "monday", label: t("week_start_monday") },
  ] as const
}

export function getLocaleOptions() {
  return [
    { value: "en", label: t("locale_english") },
    { value: "es", label: t("locale_spanish") },
  ] as const
}

export function createSettingsFormValues(
  settings?: UserSettingsLike | null,
  locale?: AppLocale
): SettingsFormValues {
  return {
    ...resolveUserSettings(settings),
    locale: locale ?? "en",
  }
}

export function toWeekStartsOnDayIndex(
  value: WeekStartsOnPreference | null | undefined
) {
  return value === "monday" ? 1 : 0
}
