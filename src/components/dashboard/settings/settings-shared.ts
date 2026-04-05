export type SettingsFormValues = {
  baseCurrency: string
}

export const defaultCurrencyOptions = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "CAD", label: "Canadian Dollar (CAD)" },
  { value: "AUD", label: "Australian Dollar (AUD)" },
  { value: "MXN", label: "Mexican Peso (MXN)" },
]

export function createSettingsFormValues(
  settings?: {
    baseCurrency?: string | null
  } | null
): SettingsFormValues {
  return {
    baseCurrency: settings?.baseCurrency ?? "USD",
  }
}
