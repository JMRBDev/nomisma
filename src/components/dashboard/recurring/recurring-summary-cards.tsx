import type { RecurringRecord } from "@/components/dashboard/recurring/recurring-shared"
import { DashboardSummaryCard } from "@/components/dashboard/dashboard-summary-card"
import { canConfirmRecurringItem } from "@/components/dashboard/recurring/recurring-shared"
import { formatDateLabel, getRecurringFrequencyLabel  } from "@/lib/money"
import { t } from "@/lib/i18n"

interface RecurringSummaryCardsProps {
  recurringItems: Array<RecurringRecord>
  overdueCount: number
  dueSoonCount: number
  today: string
}

export function RecurringSummaryCards({
  recurringItems,
  overdueCount,
  dueSoonCount,
  today,
}: RecurringSummaryCardsProps) {
  const activeIncomeCount = recurringItems.filter(
    (item) => item.type === "income"
  ).length
  const activeExpenseCount = recurringItems.length - activeIncomeCount
  const dueNowCount = recurringItems.filter((item) =>
    canConfirmRecurringItem(item, today)
  ).length
  const nextItem = recurringItems[0]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <DashboardSummaryCard
        title={t("recurring_summary_active_title")}
        value={recurringItems.length.toString()}
        description={t("recurring_summary_active_description", {
          expenses: activeExpenseCount,
          income: activeIncomeCount,
        })}
      />
      <DashboardSummaryCard
        title={t("recurring_summary_due_now_title")}
        value={dueNowCount.toString()}
        description={t("recurring_summary_due_now_description", {
          overdue: overdueCount,
          dueSoon: dueSoonCount,
        })}
        toneClassName={dueNowCount > 0 ? "text-destructive" : undefined}
      />
      <DashboardSummaryCard
        title={t("recurring_summary_next_title")}
        value={
          recurringItems.length > 0 ? formatDateLabel(nextItem.nextDueDate) : ""
        }
        description={
          recurringItems.length > 0
            ? `${nextItem.description} \u2022 ${getRecurringFrequencyLabel(nextItem.frequency)}`
            : ""
        }
      />
    </div>
  )
}
