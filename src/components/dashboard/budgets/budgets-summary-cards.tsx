import type { BudgetRecord } from "@/components/dashboard/budgets/budgets-shared"
import { DashboardSummaryCard } from "@/components/dashboard/dashboard-summary-card"
import { formatCurrency } from "@/lib/money"
import { m } from "@/paraglide/messages"

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
        title={m.budgets_summary_planned_title()}
        value={formatCurrency(data.budgets.totalPlanned, currency)}
        description={m.budgets_summary_planned_description({
          count: budgets.length,
          month: monthLabel,
        })}
      />
      <DashboardSummaryCard
        title={m.budgets_summary_spent_title()}
        value={formatCurrency(data.budgets.totalSpent, currency)}
        description={m.budgets_summary_spent_description({ month: monthLabel })}
      />
      <DashboardSummaryCard
        title={m.budgets_summary_remaining_title()}
        value={
          data.budgets.budgetRemaining === null
            ? m.budgets_summary_no_limit()
            : formatCurrency(data.budgets.budgetRemaining, currency)
        }
        description={m.budgets_summary_remaining_description({
          over: overBudgetCount,
          near: nearBudgetCount,
        })}
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
