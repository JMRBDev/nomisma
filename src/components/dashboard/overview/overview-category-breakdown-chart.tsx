import { Cell, Pie, PieChart } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { CATEGORY_COLORS } from "./overview-chart-config"
import { formatCurrency } from "@/lib/money"
import { FilteredResultsEmptyState } from "@/components/filtered-results-empty-state"
import { PieChartIcon } from "lucide-react"
import type { ChartConfig } from "@/components/ui/chart"

export function OverviewCategoryBreakdownChart({
  data,
  currency,
}: {
  data: Array<{ categoryName: string; amount: number; percentage: number }>
  currency?: string | null
}) {
  if (data.length === 0) {
    return (
      <FilteredResultsEmptyState
        title="No category data"
        description="Record expenses with categories to see the breakdown."
        icon={PieChartIcon}
      />
    )
  }

  const config = data.reduce<ChartConfig>((acc, item, index) => {
    acc[`cat-${index}`] = {
      label: item.categoryName,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }
    return acc
  }, {})

  const chartData = data.map((item, index) => ({
    ...item,
    key: `cat-${index}`,
    fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }))

  return (
    <ChartContainer config={config} className="h-62.5 w-full">
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => formatCurrency(Number(value), currency)}
              nameKey="key"
            />
          }
        />
        <ChartLegend content={<ChartLegendContent nameKey="key" />} />
        <Pie
          data={chartData}
          dataKey="amount"
          nameKey="key"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={2}
        >
          {chartData.map((entry) => (
            <Cell key={entry.categoryName} fill={entry.fill} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}
