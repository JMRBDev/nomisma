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
  getRecurringRulesByUserId,
  getReportingPeriod,
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
  reportingPeriod: { start: string; end: string }
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
      !inRange(transaction.date, reportingPeriod.start, reportingPeriod.end)
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
      description: "Set your currency and reporting month before you rely on totals.",
    })
  }

  return alerts
}

export async function getOverviewData(ctx: QueryCtx) {
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
  const reportingPeriod = getReportingPeriod(now, settings?.monthStartsOn ?? 1)
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
      inRange(transaction.date, reportingPeriod.start, reportingPeriod.end)
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
        reportingPeriod
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
      recentTransactions: dashboardTransactions.slice(0, 8),
      upcomingRecurring: recurring.all.slice(0, 8),
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
          description: "Add the income and expense categories you actually use.",
          completed: categories.length > 0,
          href: "/dashboard/settings",
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
