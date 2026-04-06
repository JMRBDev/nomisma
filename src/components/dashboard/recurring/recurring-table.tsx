import { useMemo } from "react"
import type { RecurringRecord } from "@/components/dashboard/recurring/recurring-shared"
import { DashboardTable } from "@/components/dashboard/dashboard-table"
import { IncomeExpenseNetFooter } from "@/components/dashboard/income-expense-net-footer"
import { RecurringTableRow } from "@/components/dashboard/recurring/recurring-table-row"
import { useDataTable } from "@/hooks/use-data-table"

const SORT_ACCESSORS: Record<
  string,
  (row: RecurringRecord) => string | number
> = {
  nextDueDate: (row) => row.nextDueDate,
  description: (row) => row.description.toLowerCase(),
  accountName: (row) => row.accountName.toLowerCase(),
  categoryName: (row) => row.categoryName.toLowerCase(),
  frequency: (row) => row.frequency,
  status: (row) => row.status,
  amount: (row) => (row.type === "income" ? row.amount : -row.amount),
}

const COLUMNS = [
  { column: "nextDueDate", header: "Next due" },
  { column: "description", header: "Description" },
  { column: "accountName", header: "Account" },
  { column: "categoryName", header: "Category" },
  { column: "frequency", header: "Schedule" },
  { column: "status", header: "Status" },
  { column: "amount", header: "Amount", className: "text-right" },
  { header: "Actions", className: "text-right" },
]

export function RecurringTable({
  recurringItems,
  currency,
  pendingRuleId,
  today,
  onConfirm,
  onEdit,
  onToggle,
}: {
  recurringItems: Array<RecurringRecord>
  currency?: string | null
  pendingRuleId: RecurringRecord["_id"] | null
  today: string
  onConfirm: (ruleId: RecurringRecord["_id"]) => void
  onEdit: (rule: RecurringRecord) => void
  onToggle: (ruleId: RecurringRecord["_id"], active: boolean) => void
}) {
  const table = useDataTable({
    data: recurringItems,
    sortAccessors: SORT_ACCESSORS,
    defaultSort: { column: "nextDueDate", direction: "asc" },
  })

  const aggregates = useMemo(() => {
    let totalIncome = 0
    let totalExpense = 0
    for (const item of table.allSortedData) {
      if (item.type === "income") totalIncome += item.amount
      else totalExpense += item.amount
    }
    return { totalIncome, totalExpense, net: totalIncome - totalExpense }
  }, [table.allSortedData])

  return (
    <DashboardTable
      table={table}
      columns={COLUMNS}
      footer={
        <IncomeExpenseNetFooter
          aggregates={aggregates}
          currency={currency}
          labelColSpan={6}
          trailingColSpan={2}
        />
      }
    >
      {table.data.map((item) => (
        <RecurringTableRow
          key={item._id}
          item={item}
          currency={currency}
          pendingRuleId={pendingRuleId}
          today={today}
          onConfirm={onConfirm}
          onEdit={onEdit}
          onToggle={onToggle}
        />
      ))}
    </DashboardTable>
  )
}
