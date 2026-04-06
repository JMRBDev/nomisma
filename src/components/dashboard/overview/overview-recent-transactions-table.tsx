import { useMemo } from "react"
import type { OverviewRecentTransactionRecord } from "@/components/dashboard/overview/overview-shared"
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

const COLUMNS = [
  { column: "date", header: "Date" },
  { column: "description", header: "Description" },
  { column: "accountName", header: "Account" },
  { column: "type", header: "Type" },
  { column: "status", header: "Status" },
  { column: "amount", header: "Amount", className: "text-right" },
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
      columns={COLUMNS}
      footer={
        <IncomeExpenseNetFooter
          aggregates={aggregates}
          currency={currency}
          labelColSpan={5}
          showBreakdown={false}
        />
      }
    >
      {table.data.map((transaction) => (
        <TableRow key={transaction._id}>
          <TableCell>
            <span className="text-muted-foreground">
              {formatDateLabel(transaction.date)}
            </span>
          </TableCell>
          <TableCell>
            <div className="space-y-1">
              <p className="font-medium">{transaction.description}</p>
              <p className="text-xs text-muted-foreground">
                {transaction.categoryName ?? "Transfer"}
              </p>
            </div>
          </TableCell>
          <TableCell>
            <AccountNameCell
              name={transaction.accountName}
              icon={transaction.accountIcon}
              color={transaction.accountColor}
            />
          </TableCell>
          <TableCell>
            <span className={cn(getTransactionTone(transaction.type))}>
              {capitalizeFirstLetter(transaction.type)}
            </span>
          </TableCell>
          <TableCell>
            <span className="text-muted-foreground">
              {capitalizeFirstLetter(transaction.status)}
            </span>
          </TableCell>
          <TableCell
            className={cn(
              "text-right font-medium",
              getTransactionTone(transaction.type)
            )}
          >
            {formatSignedAmount(transaction.amount, currency, transaction.type)}
          </TableCell>
        </TableRow>
      ))}
    </DashboardTable>
  )
}
