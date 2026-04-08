import { useMemo } from "react"
import type { OverviewUpcomingRecurringRecord } from "@/components/dashboard/overview/overview-shared"
import type { DashboardTableColumn } from "@/components/dashboard/dashboard-table-columns"
import { getRecurringStatusLabel } from "@/components/dashboard/recurring/recurring-shared"
import { DashboardTable } from "@/components/dashboard/dashboard-table"
import { IncomeExpenseNetFooter } from "@/components/dashboard/income-expense-net-footer"
import { TableCell, TableRow } from "@/components/ui/table"
import { useDataTable } from "@/hooks/use-data-table"
import {
  capitalizeFirstLetter,
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
  status: (row) => row.status,
  amount: (row) => (row.type === "income" ? row.amount : -row.amount),
}

const COLUMN_VISIBILITY_STORAGE_KEY =
  "nomisma-table-columns:overview-upcoming-recurring"

const COLUMNS: Array<DashboardTableColumn> = [
  {
    id: "nextDueDate",
    column: "nextDueDate",
    header: "Next due",
    alwaysVisible: true,
  },
  {
    id: "description",
    column: "description",
    header: "Description",
    alwaysVisible: true,
  },
  { id: "frequency", column: "frequency", header: "Frequency" },
  { id: "status", column: "status", header: "Status" },
  {
    id: "amount",
    column: "amount",
    header: "Amount",
    className: "text-right",
    alwaysVisible: true,
  },
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
    columns: COLUMNS,
    columnVisibilityStorageKey: COLUMN_VISIBILITY_STORAGE_KEY,
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
      footer={
        <IncomeExpenseNetFooter
          aggregates={aggregates}
          currency={currency}
          columnCount={table.visibleColumns.length}
          showBreakdown={false}
        />
      }
    >
      {table.data.map((item) => (
        <TableRow key={item._id}>
          {table.isColumnVisible("nextDueDate") && (
            <TableCell>
              <p className={cn("font-medium", getRecurringTone(item.status))}>
                {formatDateLabel(item.nextDueDate)}
              </p>
            </TableCell>
          )}
          {table.isColumnVisible("description") && (
            <TableCell>
              <div className="space-y-1">
                <p className="font-medium">{item.description}</p>
                <p className="text-xs text-muted-foreground">
                  {item.accountName} • {item.categoryName}
                </p>
              </div>
            </TableCell>
          )}
          {table.isColumnVisible("frequency") && (
            <TableCell>{capitalizeFirstLetter(item.frequency)}</TableCell>
          )}
          {table.isColumnVisible("status") && (
            <TableCell>
              <span className={cn(getRecurringTone(item.status))}>
                {getRecurringStatusLabel(item.status)}
              </span>
            </TableCell>
          )}
          {table.isColumnVisible("amount") && (
            <TableCell
              className={cn(
                "text-right font-medium",
                getTransactionTone(item.type)
              )}
            >
              {formatSignedAmount(item.amount, currency, item.type)}
            </TableCell>
          )}
        </TableRow>
      ))}
    </DashboardTable>
  )
}
