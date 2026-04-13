export type WeekStartsOnPreference = "sunday" | "monday"

export type UserSettingsLike = {
  baseCurrency?: string | null
  weekStartsOn?: WeekStartsOnPreference | null
}

export const DEFAULT_BASE_CURRENCY = "EUR"
export const DEFAULT_WEEK_STARTS_ON: WeekStartsOnPreference = "monday"

export function resolveUserSettings(settings?: UserSettingsLike | null): {
  baseCurrency: string
  weekStartsOn: WeekStartsOnPreference
} {
  return {
    baseCurrency: settings?.baseCurrency ?? DEFAULT_BASE_CURRENCY,
    weekStartsOn: settings?.weekStartsOn ?? DEFAULT_WEEK_STARTS_ON,
  }
}
