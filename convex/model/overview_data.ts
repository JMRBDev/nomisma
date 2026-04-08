import { buildBudgetStatuses } from "./read_models_budgets"
import { buildRecurringItems } from "./read_models_recurring"
import { buildMappedTransactions } from "./read_models_transactions"
import { resolveSelectedDateRange } from "./overview_comparison"
import {
  getBudgetsByUserIdMonth,
  getRecentTransactionsByUserId,
  getTransactionsByUserIdDateRange,
  getTransactionsByUserIdMonth,
  getTransactionsByUserIdQuery,
} from "./overview_queries"
import {
  getAccountsByUserId,
  getCategoriesByUserId,
  getRecurringRulesByUserId,
  getResolvedSettings,
  requireUser,
} from "./queries"
import { getCalendarMonthRange, getCurrentCalendarMonth, toDayKey } from "./dates"
import { applyTransactionToBalances } from "./balances"
import type { Id } from "../_generated/dataModel"
import type { QueryCtx } from "../_generated/server"

export async function fetchOverviewData(
  ctx: QueryCtx,
  args: {
    startDate?: string
    endDate?: string
    today?: string
    currentMonth?: string
  }
) {
  const user = await requireUser(ctx)
  const now = new Date()
  const today = args.today ?? toDayKey(now)
  const currentMonth = args.currentMonth ?? getCurrentCalendarMonth(now)
  const currentMonthRange = getCalendarMonthRange(currentMonth)
  const selectedDateRange = resolveSelectedDateRange({
    startDate: args.startDate,
    endDate: args.endDate,
    defaultDateRange: currentMonthRange,
  })
  const selectedRangeMatchesCurrentMonth =
    selectedDateRange.startDate === currentMonthRange.start &&
    selectedDateRange.endDate === currentMonthRange.end
  const currentMonthTransactionsPromise = getTransactionsByUserIdMonth(
    ctx,
    user._id,
    currentMonth
  )
  const selectedRangeTransactionsPromise = selectedRangeMatchesCurrentMonth
    ? currentMonthTransactionsPromise
    : getTransactionsByUserIdDateRange(
        ctx,
        user._id,
        selectedDateRange.startDate,
        selectedDateRange.endDate
      )
  const recentTransactionsPromise = selectedDateRange.isFiltered
    ? selectedRangeTransactionsPromise
    : getRecentTransactionsByUserId(ctx, user._id, 8)
  const [
    { settings, settingsDoc },
    accounts,
    categories,
    selectedRangeTransactions,
    currentMonthTransactions,
    recentTransactions,
    currentMonthBudgets,
    recurringRules,
  ] = await Promise.all([
    getResolvedSettings(ctx, user._id),
    getAccountsByUserId(ctx, user._id),
    getCategoriesByUserId(ctx, user._id),
    selectedRangeTransactionsPromise,
    currentMonthTransactionsPromise,
    recentTransactionsPromise,
    getBudgetsByUserIdMonth(ctx, user._id, currentMonth),
    getRecurringRulesByUserId(ctx, user._id),
  ])
  const balances = new Map<Id<"accounts">, number>(
    accounts.map((account) => [account._id, account.openingBalance])
  )
  let uncategorizedCount = 0
  for await (const transaction of getTransactionsByUserIdQuery(ctx, user._id)) {
    if (transaction.status !== "posted") continue
    applyTransactionToBalances(balances, transaction)
    if (transaction.type !== "transfer" && !transaction.categoryId) {
      uncategorizedCount += 1
    }
  }
  const dashboardTransactions = buildMappedTransactions(
    accounts,
    categories,
    selectedRangeTransactions
  )
  const currentMonthDashboardTransactions = selectedRangeMatchesCurrentMonth
    ? dashboardTransactions
    : buildMappedTransactions(accounts, categories, currentMonthTransactions)
  const recentDashboardTransactions = selectedDateRange.isFiltered
    ? dashboardTransactions.slice(0, 8)
    : buildMappedTransactions(accounts, categories, recentTransactions)
  const recurring = buildRecurringItems(
    recurringRules,
    accounts,
    categories,
    today
  )
  const budgetsView = buildBudgetStatuses(
    currentMonthBudgets,
    categories,
    currentMonthDashboardTransactions,
    currentMonth
  )
  const postedTransactions = dashboardTransactions.filter(
    (transaction) => transaction.status === "posted"
  )
  const income = postedTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0)
  const expenses = postedTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0)
  const currentMoney = accounts
    .filter((account) => !account.archived && account.includeInTotals)
    .reduce(
      (total, account) =>
        total + (balances.get(account._id) ?? account.openingBalance),
      0
    )
  const hasAccounts = accounts.some((account) => !account.archived)
  return {
    settings,
    settingsDoc,
    currentMonth,
    selectedDateRange,
    dashboardTransactions,
    recentTransactions: recentDashboardTransactions,
    recurring,
    budgetsView,
    income,
    expenses,
    currentMoney,
    hasAccounts,
    uncategorizedCount,
    today,
  }
}
