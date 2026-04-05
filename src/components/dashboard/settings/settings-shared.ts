export type SettingsFormValues = {
  baseCurrency: string
  weekStartsOn: WeekStartsOnPreference
}

export type WeekStartsOnPreference = "sunday" | "monday"

export const defaultCurrencyOptions = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "CAD", label: "Canadian Dollar (CAD)" },
  { value: "AUD", label: "Australian Dollar (AUD)" },
  { value: "MXN", label: "Mexican Peso (MXN)" },
]

export const weekStartsOnOptions = [
  { value: "sunday", label: "Sunday" },
  { value: "monday", label: "Monday" },
] as const

export function createSettingsFormValues(
  settings?: {
    baseCurrency?: string | null
    weekStartsOn?: WeekStartsOnPreference | null
  } | null
): SettingsFormValues {
  return {
    baseCurrency: settings?.baseCurrency ?? "USD",
    weekStartsOn: settings?.weekStartsOn ?? "sunday",
  }
}

export function toWeekStartsOnDayIndex(
  value: WeekStartsOnPreference | null | undefined
) {
  return value === "monday" ? 1 : 0
}
