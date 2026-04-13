import { formatCurrency } from "@/lib/money"
import { t } from "@/lib/i18n"

export function getAccountDisplayName(name?: string | null) {
  return name ?? t("common_unknown_account")
}

export function getBudgetCategoryLabel(input: {
  categoryId?: string
  categoryName?: string | null
  categoryMissing?: boolean
}) {
  if (input.categoryId === undefined) {
    return t("budgets_total_spending")
  }

  return input.categoryName ?? t("common_deleted_category")
}

export function getRecurringCategoryLabel(input: {
  categoryName?: string | null
  categoryMissing?: boolean
}) {
  return (
    input.categoryName ??
    (input.categoryMissing
      ? t("common_deleted_category")
      : t("common_unknown_category"))
  )
}

export function getTransactionCategoryLabel(input: {
  categoryName?: string | null
  categoryDisplayState: "named" | "deleted" | "uncategorized" | "none"
}) {
  if (input.categoryDisplayState === "named") {
    return input.categoryName ?? t("common_uncategorized")
  }

  if (input.categoryDisplayState === "deleted") {
    return t("common_deleted_category")
  }

  if (input.categoryDisplayState === "uncategorized") {
    return t("common_uncategorized")
  }

  return undefined
}

export function getOverviewCategoryLabel(input: {
  labelKind: "category" | "deleted" | "uncategorized" | "other"
  categoryName?: string | null
}) {
  if (input.labelKind === "category") {
    return input.categoryName ?? t("common_deleted_category")
  }

  if (input.labelKind === "deleted") {
    return t("common_deleted_category")
  }

  if (input.labelKind === "uncategorized") {
    return t("common_uncategorized")
  }

  return t("common_other")
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
      title: t("overview_alert_budget_over_title", { category }),
      description: t("overview_alert_budget_over_description", {
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
      title: t("overview_alert_budget_near_title", { category }),
      description: t("overview_alert_budget_near_description", {
        remaining: formatCurrency(alert.remaining ?? 0, currency),
      }),
    }
  }

  if (alert.alertType === "recurringDueSoon") {
    return {
      title: t("overview_alert_recurring_title"),
      description: t("overview_alert_recurring_description"),
    }
  }

  if (alert.alertType === "cashflow") {
    return {
      title: t("overview_alert_cashflow_title"),
      description: t("overview_alert_cashflow_description"),
    }
  }

  if (alert.alertType === "uncategorizedTransactions") {
    return {
      title: t("overview_alert_uncategorized_title"),
      description: t("overview_alert_uncategorized_description", {
        count: alert.count ?? 0,
      }),
    }
  }

  return {
    title: t("overview_alert_first_account_title"),
    description: t("overview_alert_first_account_description"),
  }
}

export {
  getSearchAccountSubtitle,
  getSearchBudgetSubtitle,
  getSearchBudgetTitle,
  getSearchRecurringSubtitle,
  getSearchTransactionSubtitle,
} from "./dashboard-i18n-search"
