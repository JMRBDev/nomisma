import { addDays } from "./dates"

type OverviewAlert =
  | {
      kind: "destructive" | "default"
      alertType: "budgetOver" | "budgetNear"
      isTotal: boolean
      categoryName: string | null
      categoryMissing: boolean
      remaining: number
    }
  | {
      kind: "destructive" | "default"
      alertType: "recurringDueSoon" | "cashflow" | "firstAccount"
    }
  | {
      kind: "default"
      alertType: "uncategorizedTransactions"
      count: number
    }

export function buildOverviewAlerts(args: {
  budgetStatuses: Array<{
    status: string
    categoryName: string | null
    isTotal?: boolean
    categoryMissing?: boolean
    remaining: number
  }>
  currentMoney: number
  recurringItems: Array<{
    status: string
    type: string
    nextDueDate: string
    amount: number
  }>
  uncategorizedCount: number
  hasAccounts: boolean
  today: string
}) {
  const alerts: Array<OverviewAlert> = [
    ...args.budgetStatuses
      .filter((budget) => budget.status === "over")
      .map((budget) => ({
        kind: "destructive" as const,
        alertType: "budgetOver" as const,
        isTotal: budget.isTotal ?? false,
        categoryName: budget.categoryName,
        categoryMissing: budget.categoryMissing ?? false,
        remaining: Math.abs(budget.remaining),
      })),
    ...args.budgetStatuses
      .filter((budget) => budget.status === "near")
      .map((budget) => ({
        kind: "default" as const,
        alertType: "budgetNear" as const,
        isTotal: budget.isTotal ?? false,
        categoryName: budget.categoryName,
        categoryMissing: budget.categoryMissing ?? false,
        remaining: Math.max(budget.remaining, 0),
      })),
  ]

  if (args.recurringItems.some((item) => item.status === "dueSoon")) {
    alerts.push({
      kind: "default" as const,
      alertType: "recurringDueSoon" as const,
    })
  }

  const upcomingExpenseTotal = args.recurringItems
    .filter(
      (rule) =>
        rule.type === "expense" && rule.nextDueDate <= addDays(args.today, 30)
    )
    .reduce((total, rule) => total + rule.amount, 0)

  if (args.currentMoney < upcomingExpenseTotal && upcomingExpenseTotal > 0) {
    alerts.push({
      kind: "destructive" as const,
      alertType: "cashflow" as const,
    })
  }

  if (args.uncategorizedCount > 0) {
    alerts.push({
      kind: "default" as const,
      alertType: "uncategorizedTransactions" as const,
      count: args.uncategorizedCount,
    })
  }

  if (!args.hasAccounts) {
    alerts.unshift({
      kind: "default" as const,
      alertType: "firstAccount" as const,
    })
  }

  return alerts
}
