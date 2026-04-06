import { buildAccountSummaries } from "./read_models_accounts"
import { buildBudgetStatuses } from "./read_models_budgets"
import { buildRecurringItems } from "./read_models_recurring"
import { buildMappedTransactions } from "./read_models_transactions"
import { resolveSelectedDateRange } from "./overview_comparison"
import {
  getAccountsByUserId,
  getBudgetsByUserId,
  getCategoriesByUserId,
  getRecurringRulesByUserId,
  getResolvedSettings,
  getTransactionsByUserId,
  requireUser,
} from "./queries"
import {
  getCurrentCalendarMonth,
  getCurrentCalendarMonthRange,
  inRange,
  toDayKey,
} from "./dates"
import type { QueryCtx } from "../_generated/server"

export async function fetchOverviewData(
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
  const selectedDateRange = resolveSelectedDateRange({
    startDate: args.startDate,
    endDate: args.endDate,
    defaultDateRange: getCurrentCalendarMonthRange(now),
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

  const posted = dashboardTransactions.filter(
    (t) =>
      t.status === "posted" &&
      inRange(t.date, selectedDateRange.startDate, selectedDateRange.endDate)
  )
  const income = posted
    .filter((t) => t.type === "income")
    .reduce((total, t) => total + t.amount, 0)
  const expenses = posted
    .filter((t) => t.type === "expense")
    .reduce((total, t) => total + t.amount, 0)
  const currentMoney = accountSummaries
    .filter((a) => !a.archived && a.includeInTotals)
    .reduce((total, a) => total + a.currentBalance, 0)
  const hasAccounts = accountSummaries.some((a) => !a.archived)
  const uncategorizedCount = dashboardTransactions.filter(
    (t) => t.type !== "transfer" && t.status === "posted" && !t.categoryId
  ).length

  return {
    settings,
    settingsDoc,
    currentMonth,
    selectedDateRange,
    dashboardTransactions,
    accountSummaries,
    recurring,
    budgetsView,
    accounts,
    categories,
    income,
    expenses,
    currentMoney,
    hasAccounts,
    uncategorizedCount,
    today,
  }
}
