import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { BarChart3Icon } from "lucide-react"
import { incomeExpensesChartConfig } from "./overview-chart-config"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { formatCurrency, formatDateLabel } from "@/lib/money"
import { FilteredResultsEmptyState } from "@/components/filtered-results-empty-state"
import { getLocale } from "@/lib/i18n-client"
import { m } from "@/lib/i18n-client"
import { toCalendarLocale } from "@/lib/i18n"

function formatPeriodLabel(period: string, isSingleMonth: boolean): string {
  const locale = toCalendarLocale(getLocale())
  if (isSingleMonth) {
    const [year, month, day] = period.split("-").map(Number)
    return new Intl.DateTimeFormat(locale, {
      month: "numeric",
      day: "numeric",
    }).format(new Date(year, month - 1, day))
  }
  const [year, month] = period.split("-").map(Number)
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, 1))
}

export function OverviewIncomeVsExpensesChart({
  data,
  currency,
  isSingleMonth,
}: {
  data: Array<{ period: string; income: number; expenses: number }>
  currency?: string | null
  isSingleMonth: boolean
}) {
  if (data.length === 0) {
    return (
      <FilteredResultsEmptyState
        title={m.overview_charts_comparison_empty_title()}
        description={m.overview_charts_comparison_empty_description()}
        icon={BarChart3Icon}
      />
    )
  }

  return (
    <ChartContainer
      config={incomeExpensesChartConfig}
      className="h-62.5 w-full"
    >
      <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="period"
          tickFormatter={(v: string) => formatPeriodLabel(v, isSingleMonth)}
          tickLine={false}
          axisLine={false}
          fontSize={12}
        />
        <YAxis
          tickFormatter={(v: number) => formatCurrency(v, currency, true)}
          tickLine={false}
          axisLine={false}
          fontSize={12}
          width={65}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => formatCurrency(Number(value), currency)}
              labelFormatter={(label) =>
                isSingleMonth
                  ? formatDateLabel(String(label))
                  : formatPeriodLabel(String(label), isSingleMonth)
              }
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="income"
          fill="var(--color-income)"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="expenses"
          fill="var(--color-expenses)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  )
}
