import { Pie, PieChart } from "recharts"
import { PieChartIcon } from "lucide-react"
import { CATEGORY_COLORS } from "./overview-chart-config"
import type { ChartConfig } from "@/components/ui/chart"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { getOverviewCategoryLabel } from "@/lib/dashboard-i18n"
import { formatCurrency } from "@/lib/money"
import { FilteredResultsEmptyState } from "@/components/filtered-results-empty-state"
import { t } from "@/lib/i18n"

export function OverviewCategoryBreakdownChart({
  data,
  currency,
}: {
  data: Array<{
    labelKind: "category" | "deleted" | "uncategorized" | "other"
    categoryName: string | null
    amount: number
    percentage: number
  }>
  currency?: string | null
}) {
  if (data.length === 0) {
    return (
      <FilteredResultsEmptyState
        title={t("overview_charts_breakdown_empty_title")}
        description={t("overview_charts_breakdown_empty_description")}
        icon={PieChartIcon}
      />
    )
  }

  const config = data.reduce<ChartConfig>((acc, item, index) => {
    acc[`cat-${index}`] = {
      label: getOverviewCategoryLabel(item),
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
        />
      </PieChart>
    </ChartContainer>
  )
}
