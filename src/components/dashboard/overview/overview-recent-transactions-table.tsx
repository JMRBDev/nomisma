import { useMemo } from "react"
import type { OverviewRecentTransactionRecord } from "@/components/dashboard/overview/overview-shared"
import type { DashboardTableColumn } from "@/components/dashboard/dashboard-table-columns"
import { AccountNameCell } from "@/components/dashboard/account-name-cell"
import { DashboardTable } from "@/components/dashboard/dashboard-table"
import { IncomeExpenseNetFooter } from "@/components/dashboard/income-expense-net-footer"
import { TableCell, TableRow } from "@/components/ui/table"
import { useDataTable } from "@/hooks/use-data-table"
import {
  capitalizeFirstLetter,
  formatDateLabel,
  formatSignedAmount,
  getTransactionTone,
} from "@/lib/money"
import { cn } from "@/lib/utils"

const SORT_ACCESSORS: Record<
  string,
  (row: OverviewRecentTransactionRecord) => string | number
> = {
  date: (row) => row.date,
  description: (row) => row.description.toLowerCase(),
  accountName: (row) => row.accountName.toLowerCase(),
  type: (row) => row.type,
  status: (row) => row.status,
  amount: (row) => {
    if (row.type === "income") return row.amount
    if (row.type === "expense") return -row.amount
    return 0
  },
}

const COLUMN_VISIBILITY_STORAGE_KEY =
  "nomisma-table-columns:overview-recent-transactions"

const COLUMNS: Array<DashboardTableColumn> = [
  { id: "date", column: "date", header: "Date", alwaysVisible: true },
  {
    id: "description",
    column: "description",
    header: "Description",
    alwaysVisible: true,
  },
  { id: "accountName", column: "accountName", header: "Account" },
  { id: "type", column: "type", header: "Type" },
  { id: "status", column: "status", header: "Status" },
  {
    id: "amount",
    column: "amount",
    header: "Amount",
    className: "text-right",
    alwaysVisible: true,
  },
]

export function OverviewRecentTransactionsTable({
  transactions,
  currency,
}: {
  transactions: Array<OverviewRecentTransactionRecord>
  currency?: string | null
}) {
  const table = useDataTable({
    data: transactions,
    columns: COLUMNS,
    columnVisibilityStorageKey: COLUMN_VISIBILITY_STORAGE_KEY,
    sortAccessors: SORT_ACCESSORS,
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
      {table.data.map((transaction) => (
        <TableRow key={transaction._id}>
          {table.isColumnVisible("date") && (
            <TableCell>
              <span className="text-muted-foreground">
                {formatDateLabel(transaction.date)}
              </span>
            </TableCell>
          )}
          {table.isColumnVisible("description") && (
            <TableCell>
              <div className="space-y-1">
                <p className="font-medium">{transaction.description}</p>
                <p className="text-xs text-muted-foreground">
                  {transaction.categoryName ?? "Transfer"}
                </p>
              </div>
            </TableCell>
          )}
          {table.isColumnVisible("accountName") && (
            <TableCell>
              <AccountNameCell
                name={transaction.accountName}
                icon={transaction.accountIcon}
                color={transaction.accountColor}
              />
            </TableCell>
          )}
          {table.isColumnVisible("type") && (
            <TableCell>
              <span className={cn(getTransactionTone(transaction.type))}>
                {capitalizeFirstLetter(transaction.type)}
              </span>
            </TableCell>
          )}
          {table.isColumnVisible("status") && (
            <TableCell>
              <span className="text-muted-foreground">
                {capitalizeFirstLetter(transaction.status)}
              </span>
            </TableCell>
          )}
          {table.isColumnVisible("amount") && (
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
          )}
        </TableRow>
      ))}
    </DashboardTable>
  )
}
