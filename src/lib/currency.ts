import { getLocale } from "@/lib/i18n-client"
import { toCalendarLocale } from "@/lib/i18n"

export const CURRENCY_OPTIONS = [
  { value: "USD", fallbackLabel: "US Dollar", locale: "en-US" },
  { value: "EUR", fallbackLabel: "Euro", locale: "de-DE" },
  { value: "GBP", fallbackLabel: "British Pound", locale: "en-GB" },
  { value: "CAD", fallbackLabel: "Canadian Dollar", locale: "en-CA" },
  { value: "AUD", fallbackLabel: "Australian Dollar", locale: "en-AU" },
  { value: "MXN", fallbackLabel: "Mexican Peso", locale: "es-MX" },
  { value: "COP", fallbackLabel: "Colombian Peso", locale: "es-CO" },
] as const

const currencyLocaleMap: Record<string, string> = {}
for (const c of CURRENCY_OPTIONS) {
  currencyLocaleMap[c.value] = c.locale
}

export function getCurrencyLocale(currency: string): string {
  return currencyLocaleMap[currency] ?? "en-US"
}

export function getCurrencyOptions() {
  const displayNames = new Intl.DisplayNames(toCalendarLocale(getLocale()), {
    type: "currency",
  })

  return CURRENCY_OPTIONS.map((option) => ({
    value: option.value,
    label: `${displayNames.of(option.value) ?? option.fallbackLabel} (${option.value})`,
  }))
}
