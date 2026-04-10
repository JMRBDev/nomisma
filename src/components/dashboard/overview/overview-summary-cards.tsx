import {
  PiggyBankIcon,
  ReceiptTextIcon,
  TargetIcon,
  WalletCardsIcon,
} from "lucide-react"
import { OverviewMetricCard } from "@/components/dashboard/overview/overview-metric-card"
import { formatCurrency } from "@/lib/money"
import { m } from "@/lib/i18n-client"

export function OverviewSummaryCards({
  currentMoney = 0,
  income = 0,
  expenses = 0,
  net = 0,
  hasAccounts = false,
  currency,
  activityLabel = "the current month",
}: {
  currentMoney?: number
  income?: number
  expenses?: number
  net?: number
  hasAccounts?: boolean
  currency?: string | null
  activityLabel?: string
}) {
  const netToneClassName = net < 0 ? "text-destructive" : "text-success"

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <OverviewMetricCard
        title={m.overview_summary_total_title()}
        value={formatCurrency(currentMoney, currency)}
        description={
          hasAccounts
            ? m.overview_summary_total_description()
            : m.overview_summary_total_empty_description()
        }
        icon={<WalletCardsIcon className="size-4" />}
      />
      <OverviewMetricCard
        title={m.overview_summary_income_title()}
        value={formatCurrency(income, currency)}
        description={m.overview_summary_income_description({
          activity: activityLabel,
        })}
        icon={<PiggyBankIcon className="size-4" />}
        valueClassName="text-success"
      />
      <OverviewMetricCard
        title={m.overview_summary_expenses_title()}
        value={formatCurrency(expenses, currency)}
        description={m.overview_summary_expenses_description({
          activity: activityLabel,
        })}
        icon={<ReceiptTextIcon className="size-4" />}
        valueClassName="text-destructive"
      />
      <OverviewMetricCard
        title={m.overview_summary_net_title()}
        value={formatCurrency(net, currency)}
        description={m.overview_summary_net_description({
          activity: activityLabel,
        })}
        icon={<TargetIcon className="size-4" />}
        valueClassName={netToneClassName}
      />
    </div>
  )
}
