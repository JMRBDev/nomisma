import type { OverviewData } from "@/components/dashboard/overview/overview-shared"
import { OverviewCategoryBreakdownChart } from "@/components/dashboard/overview/overview-category-breakdown-chart"
import { OverviewIncomeVsExpensesChart } from "@/components/dashboard/overview/overview-income-vs-expenses-chart"
import { OverviewPanelCard } from "@/components/dashboard/overview/overview-panel-card"
import { OverviewSpendingChart } from "@/components/dashboard/overview/overview-spending-chart"
import { m } from "@/paraglide/messages"

interface OverviewChartsRowProps {
  data: OverviewData
  currency: string | undefined
  hasDateFilter: boolean
  filterLabel: string
  isSingleMonth: boolean
}

export function OverviewChartsRow({
  data,
  currency,
  hasDateFilter,
  filterLabel,
  isSingleMonth,
}: OverviewChartsRowProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,1fr)]">
      <OverviewPanelCard
        title={m.overview_charts_spending_title()}
        description={
          hasDateFilter
            ? m.overview_charts_spending_description_filtered({
                filter: filterLabel,
              })
            : m.overview_charts_spending_description_default()
        }
      >
        <OverviewSpendingChart
          data={data.overview.dailySpending}
          currency={currency}
        />
      </OverviewPanelCard>
      <div className="grid gap-4">
        <OverviewPanelCard
          title={m.overview_charts_comparison_title()}
          description={
            isSingleMonth
              ? m.overview_charts_comparison_description_weekly()
              : m.overview_charts_comparison_description_monthly()
          }
        >
          <OverviewIncomeVsExpensesChart
            data={data.overview.incomeExpensesComparison}
            currency={currency}
            isSingleMonth={isSingleMonth}
          />
        </OverviewPanelCard>

        <OverviewPanelCard
          title={m.overview_charts_breakdown_title()}
          description={m.overview_charts_breakdown_description()}
        >
          <OverviewCategoryBreakdownChart
            data={data.overview.categoryBreakdown}
            currency={currency}
          />
        </OverviewPanelCard>
      </div>
    </div>
  )
}
