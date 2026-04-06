import {
  buildCategoryBreakdown,
  buildDailySpending,
  buildTopSpendingCategories,
} from "./overview-spending"
import { buildIncomeExpensesComparison } from "./overview-comparison"
import { buildOverviewAlerts } from "./overview-alerts"
import { buildOnboarding } from "./overview-onboarding"
import { fetchOverviewData } from "./overview-data"
import { inRange } from "./dates"
import type { QueryCtx } from "../_generated/server"

export async function getOverviewData(
  ctx: QueryCtx,
  args: { startDate?: string; endDate?: string }
) {
  const d = await fetchOverviewData(ctx, args)
  return {
    settings: d.settings,
    currentMonth: d.currentMonth,
    hasAccounts: d.hasAccounts,
    overview: {
      currentMoney: d.currentMoney,
      income: d.income,
      expenses: d.expenses,
      net: d.income - d.expenses,
      budgetRemaining: d.budgetsView.budgetRemaining,
      topSpendingCategories: buildTopSpendingCategories(
        d.dashboardTransactions,
        d.selectedDateRange
      ),
      alerts: buildOverviewAlerts({
        budgetStatuses: d.budgetsView.items,
        currentMoney: d.currentMoney,
        recurringItems: d.recurring.all,
        uncategorizedCount: d.uncategorizedCount,
        hasAccounts: d.hasAccounts,
        hasSettings: Boolean(d.settingsDoc),
        today: d.today,
      }),
      recentTransactions: d.selectedDateRange.isFiltered
        ? d.dashboardTransactions
            .filter((t) =>
              inRange(
                t.date,
                d.selectedDateRange.startDate,
                d.selectedDateRange.endDate
              )
            )
            .slice(0, 8)
        : d.dashboardTransactions.slice(0, 8),
      upcomingRecurring: d.recurring.all.slice(0, 8),
      dailySpending: buildDailySpending(
        d.dashboardTransactions,
        d.selectedDateRange
      ),
      incomeExpensesComparison: buildIncomeExpensesComparison(
        d.dashboardTransactions,
        d.selectedDateRange
      ),
      categoryBreakdown: buildCategoryBreakdown(
        d.dashboardTransactions,
        d.selectedDateRange
      ),
    },
    onboarding: buildOnboarding({
      hasSettings: Boolean(d.settingsDoc),
      accountCount: d.accountSummaries.length,
      transactionCount: d.dashboardTransactions.length,
      categoryCount: d.categories.length,
      budgetCount: d.budgetsView.items.length,
      recurringCount: d.recurring.all.length,
    }),
  }
}
