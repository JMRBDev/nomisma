import {
  buildAccountSummaries,
  buildBudgetStatuses,
  buildMappedTransactions,
  buildRecurringItems,
} from "./readModels"
import {
  addDays,
  getAccountsByUserId,
  getBudgetsByUserId,
  getCategoriesByUserId,
  getCurrentCalendarMonth,
  getCurrentCalendarMonthRange,
  getRecurringRulesByUserId,
  getResolvedSettings,
  getTransactionsByUserId,
  inRange,
  requireUser,
  toDayKey,
} from "./shared"
import type { Id } from "../_generated/dataModel"
import type { QueryCtx } from "../_generated/server"

function buildTopSpendingCategories(
  transactions: ReturnType<typeof buildMappedTransactions>,
  dateRange: { startDate: string; endDate: string }
) {
  const spendByCategory = new Map<
    string,
    { amount: number; categoryId: Id<"categories">; categoryName: string }
  >()

  for (const transaction of transactions) {
    if (
      transaction.status !== "posted" ||
      transaction.type !== "expense" ||
      !transaction.categoryId ||
      !inRange(transaction.date, dateRange.startDate, dateRange.endDate)
    ) {
      continue
    }

    const categoryName = transaction.categoryName ?? "Uncategorized"
    const existing = spendByCategory.get(transaction.categoryId)
    if (existing) {
      existing.amount += transaction.amount
      continue
    }

    spendByCategory.set(transaction.categoryId, {
      amount: transaction.amount,
      categoryId: transaction.categoryId,
      categoryName,
    })
  }

  return [...spendByCategory.values()]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
}

type DashboardTransactions = ReturnType<typeof buildMappedTransactions>

function buildDailySpending(
  transactions: DashboardTransactions,
  dateRange: { startDate: string; endDate: string }
): Array<{ date: string; amount: number }> {
  const dailyMap = new Map<string, number>()
  let current = dateRange.startDate
  while (current <= dateRange.endDate) {
    dailyMap.set(current, 0)
    current = addDays(current, 1)
  }
  for (const t of transactions) {
    if (
      t.status !== "posted" ||
      t.type !== "expense" ||
      !inRange(t.date, dateRange.startDate, dateRange.endDate)
    ) {
      continue
    }
    dailyMap.set(t.date, (dailyMap.get(t.date) ?? 0) + t.amount)
  }
  return [...dailyMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date, amount }))
}

function buildIncomeExpensesComparison(
  transactions: DashboardTransactions,
  dateRange: { startDate: string; endDate: string }
): Array<{ period: string; income: number; expenses: number }> {
  const sameMonth =
    dateRange.startDate.slice(0, 7) === dateRange.endDate.slice(0, 7)
  const periodMap = new Map<string, { income: number; expenses: number }>()

  if (sameMonth) {
    let weekStart = dateRange.startDate
    while (weekStart <= dateRange.endDate) {
      periodMap.set(weekStart, { income: 0, expenses: 0 })
      weekStart = addDays(weekStart, 7)
    }
  } else {
    let [year, month] = dateRange.startDate.slice(0, 7).split("-").map(Number)
    const endMonth = dateRange.endDate.slice(0, 7)
    let current = `${year}-${String(month).padStart(2, "0")}`
    while (current <= endMonth) {
      periodMap.set(current, { income: 0, expenses: 0 })
      const next = new Date(Date.UTC(year, month, 1))
      year = next.getUTCFullYear()
      month = next.getUTCMonth() + 1
      current = `${year}-${String(month).padStart(2, "0")}`
    }
  }

  for (const t of transactions) {
    if (
      t.status !== "posted" ||
      !inRange(t.date, dateRange.startDate, dateRange.endDate)
    ) {
      continue
    }
    let key: string
    if (sameMonth) {
      const diffMs =
        new Date(`${t.date}T00:00:00Z`).getTime() -
        new Date(`${dateRange.startDate}T00:00:00Z`).getTime()
      const diffDays = Math.round(diffMs / 86400000)
      key = addDays(dateRange.startDate, Math.floor(diffDays / 7) * 7)
    } else {
      key = t.date.slice(0, 7)
    }
    const entry = periodMap.get(key)
    if (!entry) continue
    if (t.type === "income") entry.income += t.amount
    if (t.type === "expense") entry.expenses += t.amount
  }

  return [...periodMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, data]) => ({ period, ...data }))
}

function buildCategoryBreakdown(
  transactions: DashboardTransactions,
  dateRange: { startDate: string; endDate: string }
): Array<{ categoryName: string; amount: number; percentage: number }> {
  const categoryMap = new Map<
    string,
    { categoryName: string; amount: number }
  >()
  for (const t of transactions) {
    if (
      t.status !== "posted" ||
      t.type !== "expense" ||
      !inRange(t.date, dateRange.startDate, dateRange.endDate)
    ) {
      continue
    }
    const name = t.categoryName ?? "Uncategorized"
    const existing = categoryMap.get(name)
    if (existing) {
      existing.amount += t.amount
    } else {
      categoryMap.set(name, { categoryName: name, amount: t.amount })
    }
  }
  const sorted = [...categoryMap.values()].sort((a, b) => b.amount - a.amount)
  const totalExpenses = sorted.reduce((sum, c) => sum + c.amount, 0)
  if (totalExpenses === 0) return []
  const top = sorted.slice(0, 5)
  const otherAmount = sorted.slice(5).reduce((sum, c) => sum + c.amount, 0)
  if (otherAmount > 0) {
    top.push({ categoryName: "Other", amount: otherAmount })
  }
  return top.map((item) => ({
    ...item,
    percentage: Math.round((item.amount / totalExpenses) * 100),
  }))
}

function resolveSelectedDateRange(args: {
  startDate?: string
  endDate?: string
  defaultDateRange: { start: string; end: string }
}) {
  if (args.startDate && args.endDate) {
    return args.startDate <= args.endDate
      ? {
          startDate: args.startDate,
          endDate: args.endDate,
          isFiltered: true,
        }
      : {
          startDate: args.endDate,
          endDate: args.startDate,
          isFiltered: true,
        }
  }

  return {
    startDate: args.defaultDateRange.start,
    endDate: args.defaultDateRange.end,
    isFiltered: false,
  }
}

function buildOverviewAlerts(args: {
  budgetStatuses: ReturnType<typeof buildBudgetStatuses>["items"]
  currentMoney: number
  recurringItems: ReturnType<typeof buildRecurringItems>["all"]
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

export async function getOverviewData(
  ctx: QueryCtx,
  args: { startDate?: string; endDate?: string }
) {
  const user = await requireUser(ctx)
  const now = new Date()
  const today = toDayKey(now)
  const [
    { settings, settingsDoc },
    accounts,
    categories,
    transactions,
    budgets,
    recurringRules,
  ] = await Promise.all([
    getResolvedSettings(ctx, user._id),
    getAccountsByUserId(ctx, user._id),
    getCategoriesByUserId(ctx, user._id),
    getTransactionsByUserId(ctx, user._id),
    getBudgetsByUserId(ctx, user._id),
    getRecurringRulesByUserId(ctx, user._id),
  ])

  const currentMonth = getCurrentCalendarMonth(now)
  const defaultDateRange = getCurrentCalendarMonthRange(now)
  const selectedDateRange = resolveSelectedDateRange({
    startDate: args.startDate,
    endDate: args.endDate,
    defaultDateRange,
  })
  const dashboardTransactions = buildMappedTransactions(
    accounts,
    categories,
    transactions
  )
  const accountSummaries = buildAccountSummaries(
    accounts,
    transactions,
    dashboardTransactions
  )
  const recurring = buildRecurringItems(
    recurringRules,
    accounts,
    categories,
    today
  )
  const budgetsView = buildBudgetStatuses(
    budgets,
    categories,
    dashboardTransactions,
    currentMonth
  )

  const postedTransactionsInReportingPeriod = dashboardTransactions.filter(
    (transaction) =>
      transaction.status === "posted" &&
      inRange(
        transaction.date,
        selectedDateRange.startDate,
        selectedDateRange.endDate
      )
  )

  const income = postedTransactionsInReportingPeriod
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0)

  const expenses = postedTransactionsInReportingPeriod
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0)

  const currentMoney = accountSummaries
    .filter((account) => !account.archived && account.includeInTotals)
    .reduce((total, account) => total + account.currentBalance, 0)
  const hasAccounts = accountSummaries.some((account) => !account.archived)

  const uncategorizedCount = dashboardTransactions.filter(
    (transaction) =>
      transaction.type !== "transfer" &&
      transaction.status === "posted" &&
      !transaction.categoryId
  ).length

  return {
    settings,
    currentMonth,
    hasAccounts,
    overview: {
      currentMoney,
      income,
      expenses,
      net: income - expenses,
      budgetRemaining: budgetsView.budgetRemaining,
      topSpendingCategories: buildTopSpendingCategories(
        dashboardTransactions,
        selectedDateRange
      ),
      alerts: buildOverviewAlerts({
        budgetStatuses: budgetsView.items,
        currentMoney,
        recurringItems: recurring.all,
        uncategorizedCount,
        hasAccounts,
        hasSettings: Boolean(settingsDoc),
        today,
      }),
      recentTransactions: selectedDateRange.isFiltered
        ? dashboardTransactions
            .filter((transaction) =>
              inRange(
                transaction.date,
                selectedDateRange.startDate,
                selectedDateRange.endDate
              )
            )
            .slice(0, 8)
        : dashboardTransactions.slice(0, 8),
      upcomingRecurring: recurring.all.slice(0, 8),
      dailySpending: buildDailySpending(
        dashboardTransactions,
        selectedDateRange
      ),
      incomeExpensesComparison: buildIncomeExpensesComparison(
        dashboardTransactions,
        selectedDateRange
      ),
      categoryBreakdown: buildCategoryBreakdown(
        dashboardTransactions,
        selectedDateRange
      ),
    },
    onboarding: {
      completedCount: [
        Boolean(settingsDoc),
        accountSummaries.length > 0,
        dashboardTransactions.length > 0,
        categories.length > 0,
        budgetsView.items.length > 0,
        recurring.all.length > 0,
      ].filter(Boolean).length,
      totalCount: 6,
      steps: [
        {
          id: "currency",
          title: "Choose your currency",
          description:
            "Set the base currency used across balances and budgets.",
          completed: Boolean(settingsDoc),
          href: "/dashboard/settings",
        },
        {
          id: "account",
          title: "Add your first account",
          description:
            "Start with the account or cash balance you use the most.",
          completed: accountSummaries.length > 0,
          href: "/dashboard/accounts",
        },
        {
          id: "transaction",
          title: "Add a recent transaction",
          description:
            "Record one recent income or expense to start tracking activity.",
          completed: dashboardTransactions.length > 0,
          href: "/dashboard/transactions",
        },
        {
          id: "categories",
          title: "Create your categories",
          description:
            "Add the income and expense categories you actually use.",
          completed: categories.length > 0,
          href: "/dashboard/transactions",
        },
        {
          id: "budget",
          title: "Create a budget",
          description:
            "Set a spending limit for the month or for a key category.",
          completed: budgetsView.items.length > 0,
          href: "/dashboard/budgets",
        },
        {
          id: "recurring",
          title: "Add a recurring item",
          description: "Track the next fixed bill or income that is due.",
          completed: recurring.all.length > 0,
          href: "/dashboard/recurring",
        },
      ],
    },
  }
}
