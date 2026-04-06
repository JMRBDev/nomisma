import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { incomeExpensesChartConfig } from "./overview-chart-config"
import { formatCurrency } from "@/lib/money"
import { FilteredResultsEmptyState } from "@/components/filtered-results-empty-state"
import { BarChart3Icon } from "lucide-react"

function formatPeriodLabel(period: string, isSingleMonth: boolean): string {
  if (isSingleMonth) {
    const parts = period.split("-")
    return `${parts[1]}/${parts[2]}`
  }
  const [y, m] = period.split("-")
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]
  return `${months[parseInt(m) - 1]} ${y}`
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
        title="No comparison data"
        description="Record income and expenses to see how they compare."
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
                formatPeriodLabel(String(label), isSingleMonth)
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
