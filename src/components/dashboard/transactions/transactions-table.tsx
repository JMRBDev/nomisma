import { useMemo } from "react"
import { PencilIcon, Trash2Icon } from "lucide-react"
import type { TransactionRecord } from "@/components/dashboard/transactions/transactions-shared"
import { DashboardTable } from "@/components/dashboard/dashboard-table"
import { DashboardIconButton } from "@/components/dashboard/dashboard-icon-button"
import { DashboardTableActions } from "@/components/dashboard/dashboard-table-actions"
import { IncomeExpenseNetFooter } from "@/components/dashboard/income-expense-net-footer"
import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"
import { useDataTable } from "@/hooks/use-data-table"
import {
  formatDateLabel,
  formatSignedAmount,
  getTransactionTone,
} from "@/lib/money"

const SORT_ACCESSORS: Record<
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

const COLUMNS = [
  { column: "date", header: "Date" },
  { column: "description", header: "Description" },
  { column: "accountName", header: "Account" },
  { column: "categoryName", header: "Category" },
  { column: "status", header: "Status" },
  { column: "amount", header: "Amount", className: "text-right" },
  { header: "Actions", className: "text-right" },
]

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
    sortAccessors: SORT_ACCESSORS,
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
    <DashboardTable
      table={table}
      columns={COLUMNS}
      footer={
        <IncomeExpenseNetFooter
          aggregates={aggregates}
          currency={currency}
          labelColSpan={5}
          trailingColSpan={2}
        />
      }
    >
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
            {transaction.toAccountName ? ` → ${transaction.toAccountName}` : ""}
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
            {formatSignedAmount(transaction.amount, currency, transaction.type)}
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
    </DashboardTable>
  )
}
