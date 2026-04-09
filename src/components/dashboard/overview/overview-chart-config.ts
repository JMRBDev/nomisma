import type { ChartConfig } from "@/components/ui/chart"
import { m } from "@/paraglide/messages"

export const spendingChartConfig = {
  amount: {
    label: m.overview_summary_expenses_title(),
    color: "#fb7185",
  },
} satisfies ChartConfig

export const incomeExpensesChartConfig = {
  income: {
    label: m.overview_summary_income_title(),
    color: "var(--color-success)",
  },
  expenses: {
    label: m.overview_summary_expenses_title(),
    color: "#fb7185",
  },
} satisfies ChartConfig

export const CATEGORY_COLORS = [
  "#fb7185",
  "#34d399",
  "#60a5fa",
  "#fbbf24",
  "#a78bfa",
  "#94a3b8",
]
