import { PencilIcon, Trash2Icon } from "lucide-react"
import { useMemo } from "react"
import type { TransactionRecord } from "@/components/dashboard/transactions/transactions-shared"
import { DashboardIconButton } from "@/components/dashboard/dashboard-icon-button"
import { DashboardTableActions } from "@/components/dashboard/dashboard-table-actions"
import { useDataTable } from "@/hooks/use-data-table"
import { DataTableHead } from "@/components/ui/data-table-head"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
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
  (row: TransactionRecord) => string | number
> = {
  date: (row) => row.date,
  description: (row) => row.description.toLowerCase(),
  accountName: (row) => row.accountName.toLowerCase(),
  categoryName: (row) => (row.categoryName ?? "Transfer").toLowerCase(),
  amount: (row) => {
    if (row.type === "income") return row.amount
    if (row.type === "expense") return -row.amount
    return 0
  },
  status: (row) => `${row.type}-${row.status}`,
}

export function TransactionsTable({
  transactions,
  currency,
  onEdit,
  onDelete,
}: {
  transactions: Array<TransactionRecord>
  currency?: string | null
  onEdit: (transaction: TransactionRecord) => void
  onDelete: (transactionId: TransactionRecord["_id"]) => void
}) {
  const table = useDataTable({
    data: transactions,
    sortAccessors: TRANSACTION_SORT_ACCESSORS,
    defaultSort: { column: "date", direction: "desc" },
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
              column="categoryName"
              sort={table.sort}
              onSort={table.toggleSort}
            >
              Category
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
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {table.data.map((transaction) => (
            <TableRow key={transaction._id}>
              <TableCell>{formatDateLabel(transaction.date)}</TableCell>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-medium">{transaction.description}</p>
                  {transaction.note ? (
                    <p className="text-xs text-muted-foreground">
                      {transaction.note}
                    </p>
                  ) : null}
                </div>
              </TableCell>
              <TableCell>
                {transaction.accountName}
                {transaction.toAccountName
                  ? ` → ${transaction.toAccountName}`
                  : ""}
              </TableCell>
              <TableCell>{transaction.categoryName ?? "Transfer"}</TableCell>
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
                className={`text-right font-medium ${getTransactionTone(transaction.type)}`}
              >
                {formatSignedAmount(
                  transaction.amount,
                  currency,
                  transaction.type
                )}
              </TableCell>
              <TableCell>
                <DashboardTableActions>
                  <DashboardIconButton
                    onClick={() => onEdit(transaction)}
                    aria-label="Edit transaction"
                  >
                    <PencilIcon />
                  </DashboardIconButton>
                  <DashboardIconButton
                    onClick={() => onDelete(transaction._id)}
                    aria-label="Delete transaction"
                  >
                    <Trash2Icon />
                  </DashboardIconButton>
                </DashboardTableActions>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        {table.allSortedData.length > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5}>
                <span className="text-muted-foreground">
                  Income:{" "}
                  <span className="font-medium text-emerald-400">
                    {formatCurrency(aggregates.totalIncome, currency)}
                  </span>
                  {" · "}Expense:{" "}
                  <span className="font-medium text-rose-300">
                    {formatCurrency(aggregates.totalExpense, currency)}
                  </span>
                  {" · "}Net:{" "}
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
              <TableCell colSpan={2} />
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
