import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { spendingChartConfig } from "./overview-chart-config"
import { formatCurrency } from "@/lib/money"
import { FilteredResultsEmptyState } from "@/components/filtered-results-empty-state"
import { TrendingUpIcon } from "lucide-react"

export function OverviewSpendingChart({
  data,
  currency,
}: {
  data: Array<{ date: string; amount: number }>
  currency?: string | null
}) {
  if (data.length === 0) {
    return (
      <FilteredResultsEmptyState
        title="No spending data"
        description="Start recording expenses to see your spending trends over time."
        icon={TrendingUpIcon}
      />
    )
  }

  return (
    <ChartContainer config={spendingChartConfig} className="h-62.5 w-full">
      <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(v: string) => {
            const parts = v.split("-")
            return `${parts[1]}/${parts[2]}`
          }}
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
              labelFormatter={(label) => {
                const [y, m, d] = String(label).split("-")
                return `${m}/${d}/${y}`
              }}
            />
          }
        />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="var(--color-amount)"
          fill="var(--color-amount)"
          fillOpacity={0.15}
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  )
}
