import type { ChartConfig } from "@/components/ui/chart"

export const spendingChartConfig = {
  amount: {
    label: "Expenses",
    color: "#fb7185",
  },
} satisfies ChartConfig

export const incomeExpensesChartConfig = {
  income: {
    label: "Income",
    color: "var(--color-success)",
  },
  expenses: {
    label: "Expenses",
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
