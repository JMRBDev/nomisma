import type { BudgetRecord } from "@/components/dashboard/budgets/budgets-shared"
import { DashboardSummaryCard } from "@/components/dashboard/dashboard-summary-card"
import { formatCurrency } from "@/lib/money"

interface BudgetsSummaryCardsProps {
  isLoading: boolean
  budgets: Array<BudgetRecord>
  data:
    | {
        budgets: {
          totalPlanned: number
          totalSpent: number
          budgetRemaining: number | null
          currentMonth: string
          items: Array<BudgetRecord>
        }
        settings?: { baseCurrency?: string } | null
      }
    | undefined
  currency: string | undefined
  monthLabel: string
  overBudgetCount: number
  nearBudgetCount: number
}

export function BudgetsSummaryCards({
  isLoading,
  budgets,
  data,
  currency,
  monthLabel,
  overBudgetCount,
  nearBudgetCount,
}: BudgetsSummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <DashboardSummaryCard
        loading={isLoading}
        title="Planned this month"
        value={data ? formatCurrency(data.budgets.totalPlanned, currency) : ""}
        description={
          data
            ? `${budgets.length} budget${budgets.length === 1 ? "" : "s"} in ${monthLabel}`
            : ""
        }
      />
      <DashboardSummaryCard
        loading={isLoading}
        title="Posted spending"
        value={data ? formatCurrency(data.budgets.totalSpent, currency) : ""}
        description={data ? `Tracked posted expenses for ${monthLabel}` : ""}
      />
      <DashboardSummaryCard
        loading={isLoading}
        title="Remaining"
        value={
          data
            ? data.budgets.budgetRemaining === null
              ? "No limit set"
              : formatCurrency(data.budgets.budgetRemaining, currency)
            : ""
        }
        description={
          data
            ? `${overBudgetCount} over budget, ${nearBudgetCount} close to the limit`
            : ""
        }
        toneClassName={
          data
            ? data.budgets.budgetRemaining === null
              ? undefined
              : data.budgets.budgetRemaining < 0
                ? "text-destructive"
                : "text-success"
            : undefined
        }
      />
    </div>
  )
}
