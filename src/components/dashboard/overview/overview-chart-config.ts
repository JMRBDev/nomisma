import type { ChartConfig } from "@/components/ui/chart"
import { t } from "@/lib/i18n"

export const spendingChartConfig = {
  amount: {
    label: t("overview_summary_expenses_title"),
    color: "#fb7185",
  },
} satisfies ChartConfig

export const incomeExpensesChartConfig = {
  income: {
    label: t("overview_summary_income_title"),
    color: "var(--color-success)",
  },
  expenses: {
    label: t("overview_summary_expenses_title"),
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
