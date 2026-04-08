import type { BudgetRecord } from "@/components/dashboard/budgets/budgets-shared"
import { DashboardSummaryCard } from "@/components/dashboard/dashboard-summary-card"
import { formatCurrency } from "@/lib/money"

interface BudgetsSummaryCardsProps {
  budgets: Array<BudgetRecord>
  data: {
    budgets: {
      totalPlanned: number
      totalSpent: number
      budgetRemaining: number | null
      currentMonth: string
      items: Array<BudgetRecord>
    }
    settings?: { baseCurrency?: string } | null
  }
  currency: string | undefined
  monthLabel: string
  overBudgetCount: number
  nearBudgetCount: number
}

export function BudgetsSummaryCards({
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
        title="Planned this month"
        value={formatCurrency(data.budgets.totalPlanned, currency)}
        description={`${budgets.length} budget${budgets.length === 1 ? "" : "s"} in ${monthLabel}`}
      />
      <DashboardSummaryCard
        title="Posted spending"
        value={formatCurrency(data.budgets.totalSpent, currency)}
        description={`Tracked posted expenses for ${monthLabel}`}
      />
      <DashboardSummaryCard
        title="Remaining"
        value={
          data.budgets.budgetRemaining === null
            ? "No limit set"
            : formatCurrency(data.budgets.budgetRemaining, currency)
        }
        description={`${overBudgetCount} over budget, ${nearBudgetCount} close to the limit`}
        toneClassName={
          data.budgets.budgetRemaining === null
            ? undefined
            : data.budgets.budgetRemaining < 0
              ? "text-destructive"
              : "text-success"
        }
      />
    </div>
  )
}
