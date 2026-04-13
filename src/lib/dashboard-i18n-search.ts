import {
  formatDateLabel,
  formatMonthLabel,
  getAccountTypeLabel,
  getRecurringFrequencyLabel,
  getTransactionTypeLabel,
} from "@/lib/money"
import { t } from "@/lib/i18n"
import {
  getAccountDisplayName,
  getRecurringCategoryLabel,
  getTransactionCategoryLabel,
} from "@/lib/dashboard-i18n"

export function getSearchTransactionSubtitle(result: {
  type: "income" | "expense" | "transfer"
  date: string
  accountName?: string | null
  categoryName?: string | null
  categoryDisplayState: "named" | "deleted" | "uncategorized" | "none"
}) {
  const category = getTransactionCategoryLabel(result)

  return [
    getTransactionTypeLabel(result.type),
    formatDateLabel(result.date),
    getAccountDisplayName(result.accountName),
    category,
  ]
    .filter(Boolean)
    .join(" • ")
}

export function getSearchAccountSubtitle(result: {
  type: "checking" | "savings" | "cash" | "wallet"
  archived: boolean
}) {
  const type = getAccountTypeLabel(result.type)

  return result.archived
    ? t("search_account_subtitle_archived", { type })
    : t("search_account_subtitle", { type })
}

export function getSearchBudgetTitle(result: {
  title?: string | null
  isTotal: boolean
}) {
  if (result.isTotal) {
    return t("budgets_total_spending")
  }

  return result.title ?? t("common_deleted_category")
}

export function getSearchBudgetSubtitle(result: { month: string }) {
  return t("search_budget_subtitle", {
    month: formatMonthLabel(result.month),
  })
}

export function getSearchRecurringSubtitle(result: {
  frequency: "daily" | "weekly" | "monthly" | "yearly"
  accountName?: string | null
  categoryName?: string | null
}) {
  return [
    getRecurringFrequencyLabel(result.frequency),
    getRecurringCategoryLabel(result),
    getAccountDisplayName(result.accountName),
  ].join(" • ")
}
