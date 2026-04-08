import type { OverviewData } from "@/components/dashboard/overview/overview-shared"
import { OverviewCategoryBreakdownChart } from "@/components/dashboard/overview/overview-category-breakdown-chart"
import { OverviewIncomeVsExpensesChart } from "@/components/dashboard/overview/overview-income-vs-expenses-chart"
import { OverviewPanelCard } from "@/components/dashboard/overview/overview-panel-card"
import { OverviewSpendingChart } from "@/components/dashboard/overview/overview-spending-chart"

interface OverviewChartsRowProps {
  isLoading: boolean
  data: OverviewData
  currency: string | undefined
  hasDateFilter: boolean
  filterLabel: string
  isSingleMonth: boolean
}

export function OverviewChartsRow({
  isLoading,
  data,
  currency,
  hasDateFilter,
  filterLabel,
  isSingleMonth,
}: OverviewChartsRowProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,1fr)]">
      <OverviewPanelCard
        loading={isLoading}
        title="Spending over time"
        description={
          hasDateFilter
            ? `Daily expense totals for ${filterLabel}.`
            : "Daily expense totals for the current month."
        }
      >
        {!isLoading && (
          <OverviewSpendingChart
            data={data.overview.dailySpending}
            currency={currency}
          />
        )}
      </OverviewPanelCard>
      <div className="grid gap-4">
        <OverviewPanelCard
          loading={isLoading}
          title="Income vs expenses"
          description={
            isSingleMonth
              ? "Weekly income and expense comparison."
              : "Monthly income and expense comparison."
          }
        >
          {!isLoading && (
            <OverviewIncomeVsExpensesChart
              data={data.overview.incomeExpensesComparison}
              currency={currency}
              isSingleMonth={isSingleMonth}
            />
          )}
        </OverviewPanelCard>

        <OverviewPanelCard
          loading={isLoading}
          title="Expense breakdown"
          description="How your posted expenses are distributed by category."
        >
          {!isLoading && (
            <OverviewCategoryBreakdownChart
              data={data.overview.categoryBreakdown}
              currency={currency}
            />
          )}
        </OverviewPanelCard>
      </div>
    </div>
  )
}
