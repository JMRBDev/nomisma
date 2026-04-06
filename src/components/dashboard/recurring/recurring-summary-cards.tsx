import type { RecurringRecord } from "@/components/dashboard/recurring/recurring-shared"
import { DashboardSummaryCard } from "@/components/dashboard/dashboard-summary-card"
import { canConfirmRecurringItem } from "@/components/dashboard/recurring/recurring-shared"
import { formatDateLabel } from "@/lib/money"

interface RecurringSummaryCardsProps {
  isLoading: boolean
  recurringItems: Array<RecurringRecord>
  overdueCount: number
  dueSoonCount: number
  today: string
}

export function RecurringSummaryCards({
  isLoading,
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
        loading={isLoading}
        title="Active schedules"
        value={recurringItems.length.toString()}
        description={`${activeExpenseCount} expense item${activeExpenseCount === 1 ? "" : "s"}, ${activeIncomeCount} income item${activeIncomeCount === 1 ? "" : "s"}`}
      />
      <DashboardSummaryCard
        loading={isLoading}
        title="Due now"
        value={dueNowCount.toString()}
        description={`${overdueCount} overdue, ${dueSoonCount} due within 7 days`}
        toneClassName={dueNowCount > 0 ? "text-destructive" : undefined}
      />
      <DashboardSummaryCard
        loading={isLoading}
        title="Next scheduled"
        value={
          recurringItems.length > 0 ? formatDateLabel(nextItem.nextDueDate) : ""
        }
        description={
          recurringItems.length > 0
            ? `${nextItem.description} \u2022 ${nextItem.frequency}`
            : ""
        }
      />
    </div>
  )
}
