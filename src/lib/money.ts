import { getLocale, toCalendarLocale } from "@/lib/i18n"
import {
  formatDayKeyLabel,
  formatMonthKeyLabel,
  toDayKey,
  toMonthKey,
} from "@/lib/date-keys"

export const APP_NAME = "Nomisma"

export const APP_TAGLINE = "Your money, clarified"

export const accountTypeValues = [
  "checking",
  "savings",
  "cash",
  "wallet",
] as const

export type AccountTypeValue = (typeof accountTypeValues)[number]

export const transactionTypeValues = ["expense", "income", "transfer"] as const

export type TransactionTypeValue = (typeof transactionTypeValues)[number]

export const transactionStatusValues = ["posted", "planned"] as const

export type TransactionStatusValue = (typeof transactionStatusValues)[number]

export const recurringFrequencyValues = [
  "daily",
  "weekly",
  "monthly",
  "yearly",
] as const

export type RecurringFrequencyValue = (typeof recurringFrequencyValues)[number]

export {
  getAccountTypeLabel,
  getAccountTypeOptions,
  getTransactionTypeLabel,
  getTransactionTypeOptions,
  getTransactionStatusLabel,
  getTransactionStatusOptions,
  getRecurringFrequencyLabel,
  getRecurringFrequencyOptions,
} from "./money-labels"

export function formatCurrency(
  value: number,
  currency?: string | null,
  compact = false
) {
  const locale = toCalendarLocale(getLocale())
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
  return formatMonthKeyLabel(month)
}

export function formatDateLabel(date: string) {
  return formatDayKeyLabel(date)
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

export function todayInputValue(
  referenceDate: Date = new Date(),
  timeZone?: string
) {
  return toDayKey(referenceDate, timeZone)
}

export function currentMonthInputValue(
  referenceDate: Date = new Date(),
  timeZone?: string
) {
  return toMonthKey(referenceDate, timeZone)
}
