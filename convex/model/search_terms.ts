export type TransactionSearchResult = {
  id: string
  title: string
  type: "income" | "expense" | "transfer"
  date: string
  accountName: string | null
  accountMissing: boolean
  categoryName: string | null
  categoryDisplayState: "named" | "deleted" | "uncategorized" | "none"
}

export type AccountSearchResult = {
  id: string
  title: string
  type: "checking" | "savings" | "cash" | "wallet"
  archived: boolean
}

export type BudgetSearchResult = {
  id: string
  title: string | null
  month: string
  isTotal: boolean
  categoryMissing: boolean
}

export type RecurringSearchResult = {
  id: string
  title: string
  frequency: "daily" | "weekly" | "monthly" | "yearly"
  accountName: string | null
  accountMissing: boolean
  categoryName: string | null
  categoryMissing: boolean
}

export const ACCOUNT_RESULT_LIMIT = 5
export const BUDGET_RESULT_LIMIT = 5
export const RECURRING_RESULT_LIMIT = 5
export const BUDGET_TOTAL_SEARCH_TERMS = [
  "total",
  "total spending",
  "gasto total",
]
export const DELETED_CATEGORY_SEARCH_TERMS = [
  "deleted category",
  "deleted",
  "categoria eliminada",
  "categoría eliminada",
  "eliminada",
]
export const ARCHIVED_SEARCH_TERMS = ["archived", "archivado", "archivada"]

export const ACCOUNT_TYPE_SEARCH_TERMS = {
  checking: ["checking", "current account", "cuenta corriente"],
  savings: ["savings", "savings account", "ahorros", "cuenta de ahorros"],
  cash: ["cash", "efectivo"],
  wallet: ["wallet", "digital wallet", "billetera", "monedero"],
} as const

export const RECURRING_FREQUENCY_SEARCH_TERMS = {
  daily: ["daily", "diario"],
  weekly: ["weekly", "semanal"],
  monthly: ["monthly", "mensual"],
  yearly: ["yearly", "annual", "anual"],
} as const

export function getMonthSearchTerms(month: string) {
  const [year, monthIndex] = month.split("-").map(Number)
  const date = new Date(Date.UTC(year, monthIndex - 1, 1))

  return ["en-US", "es-ES"].flatMap((locale) => [
    new Intl.DateTimeFormat(locale, {
      month: "long",
    }).format(date),
    new Intl.DateTimeFormat(locale, {
      month: "short",
    }).format(date),
    new Intl.DateTimeFormat(locale, {
      month: "long",
      year: "numeric",
    }).format(date),
    new Intl.DateTimeFormat(locale, {
      month: "short",
      year: "numeric",
    }).format(date),
  ])
}

export function normalizeSearchQuery(value: string) {
  return value.trim().toLowerCase()
}

export function matchesSearch(value: string | null | undefined, query: string) {
  return value?.toLowerCase().includes(query) ?? false
}

export function matchesSearchTerms(
  values: ReadonlyArray<string | null | undefined>,
  query: string
) {
  return values.some((value) => matchesSearch(value, query))
}
