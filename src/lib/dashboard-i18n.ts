import {
  formatCurrency,
  formatDateLabel,
  formatMonthLabel,
  getAccountTypeLabel,
  getRecurringFrequencyLabel,
  getTransactionTypeLabel,
} from "@/lib/money"
import { m } from "@/paraglide/messages"

export function getAccountDisplayName(name?: string | null) {
  return name ?? m.common_unknown_account()
}

export function getBudgetCategoryLabel(input: {
  categoryId?: string
  categoryName?: string | null
  categoryMissing?: boolean
}) {
  if (input.categoryId === undefined) {
    return m.budgets_total_spending()
  }

  return input.categoryName ?? m.common_deleted_category()
}

export function getRecurringCategoryLabel(input: {
  categoryName?: string | null
  categoryMissing?: boolean
}) {
  return input.categoryName ??
    (input.categoryMissing ? m.common_deleted_category() : m.common_unknown_category())
}

export function getTransactionCategoryLabel(input: {
  categoryName?: string | null
  categoryDisplayState: "named" | "deleted" | "uncategorized" | "none"
}) {
  if (input.categoryDisplayState === "named") {
    return input.categoryName ?? m.common_uncategorized()
  }

  if (input.categoryDisplayState === "deleted") {
    return m.common_deleted_category()
  }

  if (input.categoryDisplayState === "uncategorized") {
    return m.common_uncategorized()
  }

  return undefined
}

export function getOverviewCategoryLabel(input: {
  labelKind: "category" | "deleted" | "uncategorized" | "other"
  categoryName?: string | null
}) {
  if (input.labelKind === "category") {
    return input.categoryName ?? m.common_deleted_category()
  }

  if (input.labelKind === "deleted") {
    return m.common_deleted_category()
  }

  if (input.labelKind === "uncategorized") {
    return m.common_uncategorized()
  }

  return m.common_other()
}

export function getOverviewAlertCopy(
  alert: {
    alertType:
      | "budgetOver"
      | "budgetNear"
      | "recurringDueSoon"
      | "cashflow"
      | "uncategorizedTransactions"
      | "firstAccount"
    categoryName?: string | null
    isTotal?: boolean
    categoryMissing?: boolean
    remaining?: number
    count?: number
  },
  currency?: string | null
) {
  if (alert.alertType === "budgetOver") {
    const category = getBudgetCategoryLabel({
      categoryId: alert.isTotal ? undefined : "category",
      categoryName: alert.categoryName,
      categoryMissing: alert.categoryMissing,
    })
    return {
      title: m.overview_alert_budget_over_title({ category }),
      description: m.overview_alert_budget_over_description({
        remaining: formatCurrency(alert.remaining ?? 0, currency),
      }),
    }
  }

  if (alert.alertType === "budgetNear") {
    const category = getBudgetCategoryLabel({
      categoryId: alert.isTotal ? undefined : "category",
      categoryName: alert.categoryName,
      categoryMissing: alert.categoryMissing,
    })
    return {
      title: m.overview_alert_budget_near_title({ category }),
      description: m.overview_alert_budget_near_description({
        remaining: formatCurrency(alert.remaining ?? 0, currency),
      }),
    }
  }

  if (alert.alertType === "recurringDueSoon") {
    return {
      title: m.overview_alert_recurring_title(),
      description: m.overview_alert_recurring_description(),
    }
  }

  if (alert.alertType === "cashflow") {
    return {
      title: m.overview_alert_cashflow_title(),
      description: m.overview_alert_cashflow_description(),
    }
  }

  if (alert.alertType === "uncategorizedTransactions") {
    return {
      title: m.overview_alert_uncategorized_title(),
      description: m.overview_alert_uncategorized_description({
        count: alert.count ?? 0,
      }),
    }
  }

  return {
    title: m.overview_alert_first_account_title(),
    description: m.overview_alert_first_account_description(),
  }
}

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
    ? m.search_account_subtitle_archived({ type })
    : m.search_account_subtitle({ type })
}

export function getSearchBudgetTitle(result: {
  title?: string | null
  isTotal: boolean
}) {
  if (result.isTotal) {
    return m.budgets_total_spending()
  }

  return result.title ?? m.common_deleted_category()
}

export function getSearchBudgetSubtitle(result: { month: string }) {
  return m.search_budget_subtitle({
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
