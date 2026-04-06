import { useMemo } from "react"
import type { OverviewUpcomingRecurringRecord } from "@/components/dashboard/overview/overview-shared"
import { getRecurringStatusLabel } from "@/components/dashboard/recurring/recurring-shared"
import { DashboardTable } from "@/components/dashboard/dashboard-table"
import { IncomeExpenseNetFooter } from "@/components/dashboard/income-expense-net-footer"
import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"
import { useDataTable } from "@/hooks/use-data-table"
import {
  formatDateLabel,
  formatSignedAmount,
  getRecurringTone,
  getTransactionTone,
} from "@/lib/money"
import { cn } from "@/lib/utils"

const SORT_ACCESSORS: Record<
  string,
  (row: OverviewUpcomingRecurringRecord) => string | number
> = {
  nextDueDate: (row) => row.nextDueDate,
  description: (row) => row.description.toLowerCase(),
  frequency: (row) => row.frequency,
  amount: (row) => (row.type === "income" ? row.amount : -row.amount),
}

const COLUMNS = [
  { column: "nextDueDate", header: "Next due" },
  { column: "description", header: "Description" },
  { column: "frequency", header: "Schedule" },
  { column: "amount", header: "Amount", className: "text-right" },
]

export function OverviewUpcomingRecurringTable({
  recurringItems,
  currency,
}: {
  recurringItems: Array<OverviewUpcomingRecurringRecord>
  currency?: string | null
}) {
  const table = useDataTable({
    data: recurringItems,
    sortAccessors: SORT_ACCESSORS,
    defaultSort: { column: "nextDueDate", direction: "asc" },
    defaultPageSize: 5,
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
          labelColSpan={3}
          showBreakdown={false}
        />
      }
    >
      {table.data.map((item) => (
        <TableRow key={item._id}>
          <TableCell>
            <p className={cn("font-medium", getRecurringTone(item.status))}>
              {formatDateLabel(item.nextDueDate)}
            </p>
          </TableCell>
          <TableCell>
            <div className="space-y-1">
              <p className="font-medium">{item.description}</p>
              <p className="text-xs text-muted-foreground">
                {item.accountName} • {item.categoryName}
              </p>
            </div>
          </TableCell>
          <TableCell>
            <div className="flex gap-2">
              <Badge variant="outline">{item.frequency}</Badge>
              <Badge
                variant={item.status === "overdue" ? "destructive" : "outline"}
                className={cn(
                  item.status !== "overdue" && getRecurringTone(item.status)
                )}
              >
                {getRecurringStatusLabel(item.status)}
              </Badge>
            </div>
          </TableCell>
          <TableCell
            className={cn(
              "text-right font-medium",
              getTransactionTone(item.type)
            )}
          >
            {formatSignedAmount(item.amount, currency, item.type)}
          </TableCell>
        </TableRow>
      ))}
    </DashboardTable>
  )
}
