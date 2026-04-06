import {
  PiggyBankIcon,
  ReceiptTextIcon,
  TargetIcon,
  WalletCardsIcon,
} from "lucide-react"
import { OverviewMetricCard } from "@/components/dashboard/overview/overview-metric-card"
import { formatCurrency, formatMonthLabel, getBudgetTone } from "@/lib/money"

export function OverviewSummaryCards({
  currentMoney = 0,
  income = 0,
  expenses = 0,
  net = 0,
  budgetRemaining = null,
  hasAccounts = false,
  currentMonth = "",
  currency,
  activityLabel = "the current month",
  loading,
}: {
  currentMoney?: number
  income?: number
  expenses?: number
  net?: number
  budgetRemaining?: number | null
  hasAccounts?: boolean
  currentMonth?: string
  currency?: string | null
  activityLabel?: string
  loading?: boolean
}) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <OverviewMetricCard key={i} title="" loading />
        ))}
      </div>
    )
  }

  const monthLabel = formatMonthLabel(currentMonth)
  const netToneClassName = net < 0 ? "text-destructive" : "text-emerald-400"
  const budgetRemainingLabel =
    budgetRemaining === null
      ? "No limit set"
      : formatCurrency(budgetRemaining, currency)
  const budgetRemainingToneClassName =
    budgetRemaining === null
      ? undefined
      : getBudgetTone(
          budgetRemaining < 0
            ? "over"
            : budgetRemaining === 0
              ? "near"
              : "healthy"
        )

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <OverviewMetricCard
        title="Current money"
        value={formatCurrency(currentMoney, currency)}
        description={
          hasAccounts
            ? "Included balances across active accounts"
            : "Add your first account to start tracking balances"
        }
        icon={<WalletCardsIcon className="size-4" />}
      />
      <OverviewMetricCard
        title="Income"
        value={formatCurrency(income, currency)}
        description={`Posted income in ${activityLabel}`}
        icon={<PiggyBankIcon className="size-4" />}
        valueClassName="text-emerald-400"
      />
      <OverviewMetricCard
        title="Expenses"
        value={formatCurrency(expenses, currency)}
        description={`Posted spending in ${activityLabel}`}
        icon={<ReceiptTextIcon className="size-4" />}
        valueClassName="text-rose-300"
      />
      <OverviewMetricCard
        title="Net"
        value={formatCurrency(net, currency)}
        description={`Income minus expenses in ${activityLabel}`}
        icon={<TargetIcon className="size-4" />}
        valueClassName={netToneClassName}
      />
      <OverviewMetricCard
        title="Budget remaining"
        value={budgetRemainingLabel}
        description={`Available budget space for ${monthLabel}`}
        icon={<TargetIcon className="size-4" />}
        valueClassName={budgetRemainingToneClassName}
      />
    </div>
  )
}
