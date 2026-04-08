import { CURRENCY_OPTIONS } from "@/lib/currency"
import {
  resolveUserSettings,
  type UserSettingsLike,
  type WeekStartsOnPreference,
} from "../../../../shared/settings"

export type SettingsFormValues = {
  baseCurrency: string
  weekStartsOn: WeekStartsOnPreference
}

export type { WeekStartsOnPreference } from "../../../../shared/settings"

export const defaultCurrencyOptions = CURRENCY_OPTIONS

export const weekStartsOnOptions = [
  { value: "sunday", label: "Sunday" },
  { value: "monday", label: "Monday" },
] as const

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
