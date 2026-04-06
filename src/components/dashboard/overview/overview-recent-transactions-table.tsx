import { useMemo } from "react"
import type { OverviewRecentTransactionRecord } from "@/components/dashboard/overview/overview-shared"
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
  getTransactionTone,
} from "@/lib/money"
import { cn } from "@/lib/utils"

const TRANSACTION_SORT_ACCESSORS: Record<
  string,
  (row: OverviewRecentTransactionRecord) => string | number
> = {
  date: (row) => row.date,
  description: (row) => row.description.toLowerCase(),
  accountName: (row) => row.accountName.toLowerCase(),
  status: (row) => `${row.type}-${row.status}`,
  amount: (row) => {
    if (row.type === "income") return row.amount
    if (row.type === "expense") return -row.amount
    return 0
  },
}

export function OverviewRecentTransactionsTable({
  transactions,
  currency,
}: {
  transactions: Array<OverviewRecentTransactionRecord>
  currency?: string | null
}) {
  const table = useDataTable({
    data: transactions,
    sortAccessors: TRANSACTION_SORT_ACCESSORS,
    defaultSort: { column: "date", direction: "desc" },
    defaultPageSize: 5,
  })

  const aggregates = useMemo(() => {
    let totalIncome = 0
    let totalExpense = 0
    for (const t of table.allSortedData) {
      if (t.type === "income") totalIncome += t.amount
      else if (t.type === "expense") totalExpense += t.amount
    }
    return { totalIncome, totalExpense, net: totalIncome - totalExpense }
  }, [table.allSortedData])

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <DataTableHead
              column="date"
              sort={table.sort}
              onSort={table.toggleSort}
            >
              Date
            </DataTableHead>
            <DataTableHead
              column="description"
              sort={table.sort}
              onSort={table.toggleSort}
            >
              Description
            </DataTableHead>
            <DataTableHead
              column="accountName"
              sort={table.sort}
              onSort={table.toggleSort}
            >
              Account
            </DataTableHead>
            <DataTableHead
              column="status"
              sort={table.sort}
              onSort={table.toggleSort}
            >
              Status
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
          {table.data.map((transaction) => (
            <TableRow key={transaction._id}>
              <TableCell>{formatDateLabel(transaction.date)}</TableCell>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {transaction.categoryName ?? "Transfer"}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                {transaction.accountName}
                {transaction.toAccountName
                  ? ` → ${transaction.toAccountName}`
                  : ""}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Badge variant="outline">{transaction.type}</Badge>
                  <Badge
                    variant={
                      transaction.status === "posted" ? "default" : "outline"
                    }
                  >
                    {transaction.status}
                  </Badge>
                </div>
              </TableCell>
              <TableCell
                className={cn(
                  "text-right font-medium",
                  getTransactionTone(transaction.type)
                )}
              >
                {formatSignedAmount(
                  transaction.amount,
                  currency,
                  transaction.type
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        {table.allSortedData.length > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4}>
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
