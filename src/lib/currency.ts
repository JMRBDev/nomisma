export const CURRENCY_OPTIONS = [
  { value: "USD", label: "US Dollar (USD)", locale: "en-US" },
  { value: "EUR", label: "Euro (EUR)", locale: "de-DE" },
  { value: "GBP", label: "British Pound (GBP)", locale: "en-GB" },
  { value: "CAD", label: "Canadian Dollar (CAD)", locale: "en-CA" },
  { value: "AUD", label: "Australian Dollar (AUD)", locale: "en-AU" },
  { value: "MXN", label: "Mexican Peso (MXN)", locale: "es-MX" },
  { value: "COP", label: "Colombian Peso (COP)", locale: "es-CO" },
] as const

const currencyLocaleMap: Record<string, string> = {}
for (const c of CURRENCY_OPTIONS) {
  currencyLocaleMap[c.value] = c.locale
}

export function getCurrencyLocale(currency: string): string {
  return currencyLocaleMap[currency] ?? "en-US"
}
