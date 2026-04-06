import { useMemo } from "react"
import type { OverviewUpcomingRecurringRecord } from "@/components/dashboard/overview/overview-shared"
import { getRecurringStatusLabel } from "@/components/dashboard/recurring/recurring-shared"
import { useDataTable } from "@/hooks/use-data-table"
import { DataTableHead } from "@/components/ui/data-table-head"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  formatCurrency,
  formatDateLabel,
  formatSignedAmount,
  getRecurringTone,
  getTransactionTone,
} from "@/lib/money"
import { cn } from "@/lib/utils"

const RECURRING_SORT_ACCESSORS: Record<
  string,
  (row: OverviewUpcomingRecurringRecord) => string | number
> = {
  nextDueDate: (row) => row.nextDueDate,
  description: (row) => row.description.toLowerCase(),
  frequency: (row) => row.frequency,
  amount: (row) => {
    if (row.type === "income") return row.amount
    return -row.amount
  },
}

export function OverviewUpcomingRecurringTable({
  recurringItems,
  currency,
}: {
  recurringItems: Array<OverviewUpcomingRecurringRecord>
  currency?: string | null
}) {
  const table = useDataTable({
    data: recurringItems,
    sortAccessors: RECURRING_SORT_ACCESSORS,
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
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <DataTableHead
              column="nextDueDate"
              sort={table.sort}
              onSort={table.toggleSort}
            >
              Next due
            </DataTableHead>
            <DataTableHead
              column="description"
              sort={table.sort}
              onSort={table.toggleSort}
            >
              Description
            </DataTableHead>
            <DataTableHead
              column="frequency"
              sort={table.sort}
              onSort={table.toggleSort}
            >
              Schedule
            </DataTableHead>
            <DataTableHead
              column="amount"
              sort={table.sort}
              onSort={table.toggleSort}
              className="text-right"
            >
              Amount
            </DataTableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
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
                    variant={
                      item.status === "overdue" ? "destructive" : "outline"
                    }
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
        </TableBody>
        {table.allSortedData.length > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>
                <span className="text-muted-foreground">
                  Net:{" "}
                  <span
                    className={cn(
                      "font-medium",
                      aggregates.net >= 0 ? "text-emerald-400" : "text-rose-300"
                    )}
                  >
                    {formatCurrency(aggregates.net, currency)}
                  </span>
                </span>
              </TableCell>
              <TableCell />
            </TableRow>
          </TableFooter>
        )}
      </Table>

      <DataTablePagination
        page={table.page}
        pageSize={table.pageSize}
        pageSizeOptions={table.pageSizeOptions}
        totalPages={table.totalPages}
        totalItems={table.totalItems}
        onPageChange={table.setPage}
        onPageSizeChange={table.setPageSize}
      />
    </div>
  )
}
