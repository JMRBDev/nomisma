import { format } from "date-fns"
import { getCurrencyLocale } from "@/lib/currency"

export const APP_NAME = "Nomisma"

export const APP_TAGLINE = "Your money, clarified"

export const accountTypeOptions = [
  { label: "Checking", value: "checking" },
  { label: "Savings", value: "savings" },
  { label: "Cash", value: "cash" },
  { label: "Digital wallet", value: "wallet" },
] as const

export const transactionTypeOptions = [
  { label: "Expense", value: "expense" },
  { label: "Income", value: "income" },
  { label: "Transfer", value: "transfer" },
] as const

export const transactionStatusOptions = [
  { label: "Posted", value: "posted" },
  { label: "Planned", value: "planned" },
] as const

export const recurringFrequencyOptions = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
] as const

export function formatCurrency(
  value: number,
  currency?: string | null,
  compact = false
) {
  const locale = currency ? getCurrencyLocale(currency) : "en-US"
  const notation = compact ? "compact" : "standard"

  if (!currency) {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      notation,
    }).format(value)
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
    notation,
  }).format(value)
}

export function formatSignedAmount(
  value: number,
  currency: string | null | undefined,
  type: "income" | "expense" | "transfer"
) {
  if (type === "income") return `+${formatCurrency(value, currency)}`
  return `-${formatCurrency(value, currency)}`
}

export function formatMonthLabel(month: string) {
  return format(new Date(`${month}-01T00:00:00Z`), "LLLL yyyy")
}

export function formatDateLabel(date: string) {
  return format(new Date(`${date}T00:00:00Z`), "MMM d, yyyy")
}

export function toAmountInput(value: number) {
  return Number.isFinite(value) ? value.toString() : ""
}

export function getBudgetTone(status: string) {
  if (status === "over") return "text-destructive"
  if (status === "near") return "text-amber-400"
  return "text-success"
}

export function getTransactionTone(type: "income" | "expense" | "transfer") {
  if (type === "income") return "text-success"
  if (type === "expense") return "text-destructive"
  return "text-sky-300"
}

export function getRecurringTone(status: string) {
  if (status === "overdue") return "text-destructive"
  if (status === "dueSoon") return "text-amber-400"
  return "text-muted-foreground"
}

export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function todayInputValue() {
  return new Date().toISOString().slice(0, 10)
}

export function currentMonthInputValue() {
  return new Date().toISOString().slice(0, 7)
}
