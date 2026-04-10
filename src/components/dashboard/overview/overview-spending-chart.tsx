import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { TrendingUpIcon } from "lucide-react"
import { spendingChartConfig } from "./overview-chart-config"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { formatCurrency, formatDateLabel } from "@/lib/money"
import { FilteredResultsEmptyState } from "@/components/filtered-results-empty-state"
import { getLocale } from "@/lib/i18n-client"
import { m } from "@/lib/i18n-client"
import { toCalendarLocale } from "@/lib/i18n"

export function OverviewSpendingChart({
  data,
  currency,
}: {
  data: Array<{ date: string; amount: number }>
  currency?: string | null
}) {
  const locale = toCalendarLocale(getLocale())
  const shortDateFormatter = new Intl.DateTimeFormat(locale, {
    month: "numeric",
    day: "numeric",
  })

  const formatShortDate = (value: string) => {
    const [year, month, day] = value.split("-").map(Number)
    return shortDateFormatter.format(new Date(year, month - 1, day))
  }

  if (data.length === 0) {
    return (
      <FilteredResultsEmptyState
        title={m.overview_charts_spending_empty_title()}
        description={m.overview_charts_spending_empty_description()}
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
          tickFormatter={formatShortDate}
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
              labelFormatter={(label) => formatDateLabel(String(label))}
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
