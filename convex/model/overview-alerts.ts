import { addDays } from "./dates"

export function buildOverviewAlerts(args: {
  budgetStatuses: Array<{
    status: string
    categoryName: string
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
  hasSettings: boolean
  today: string
}) {
  const alerts = [
    ...args.budgetStatuses
      .filter((budget) => budget.status === "over")
      .map((budget) => ({
        kind: "destructive" as const,
        title: `${budget.categoryName} is over budget`,
        description: `You are ${Math.abs(budget.remaining).toFixed(2)} over the limit this month.`,
      })),
    ...args.budgetStatuses
      .filter((budget) => budget.status === "near")
      .map((budget) => ({
        kind: "default" as const,
        title: `${budget.categoryName} is close to its limit`,
        description: `Only ${Math.max(budget.remaining, 0).toFixed(2)} is left in this budget.`,
      })),
  ]

  if (args.recurringItems.some((item) => item.status === "dueSoon")) {
    alerts.push({
      kind: "default" as const,
      title: "Upcoming recurring payments",
      description:
        "You have recurring money movements due within the next 7 days.",
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
      title: "Upcoming bills are higher than available money",
      description:
        "Your included account balances are lower than the next 30 days of recurring expenses.",
    })
  }

  if (args.uncategorizedCount > 0) {
    alerts.push({
      kind: "default" as const,
      title: "Some posted transactions need a category",
      description: `${args.uncategorizedCount} transactions are missing a category.`,
    })
  }

  if (!args.hasAccounts) {
    alerts.unshift({
      kind: "default" as const,
      title: "Add your first account",
      description: "Start with the place where your money lives today.",
    })
  }

  if (!args.hasSettings) {
    alerts.unshift({
      kind: "default" as const,
      title: "Choose your base currency",
      description: "Set your currency before you rely on totals.",
    })
  }

  return alerts
}
