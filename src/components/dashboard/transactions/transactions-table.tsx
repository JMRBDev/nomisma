import { useMemo } from "react"
import type { TransactionRecord } from "@/components/dashboard/transactions/transactions-shared"
import type { DashboardTableColumn } from "@/components/dashboard/dashboard-table-columns"
import { DashboardTable } from "@/components/dashboard/dashboard-table"
import { IncomeExpenseNetFooter } from "@/components/dashboard/income-expense-net-footer"
import { TransactionsTableRow } from "@/components/dashboard/transactions/transactions-table-row"
import { useDataTable } from "@/hooks/use-data-table"

const SORT_ACCESSORS: Record<
  string,
  (row: TransactionRecord) => string | number
> = {
  date: (row) => row.date,
  description: (row) => row.description.toLowerCase(),
  accountName: (row) => row.accountName.toLowerCase(),
  categoryName: (row) => (row.categoryName ?? "Transfer").toLowerCase(),
  type: (row) => row.type,
  status: (row) => row.status,
  amount: (row) => {
    if (row.type === "income") return row.amount
    if (row.type === "expense") return -row.amount
    return 0
  },
}

const COLUMN_VISIBILITY_STORAGE_KEY = "nomisma-table-columns:transactions"

const COLUMNS: Array<DashboardTableColumn> = [
  { id: "date", column: "date", header: "Date", alwaysVisible: true },
  {
    id: "description",
    column: "description",
    header: "Description",
    alwaysVisible: true,
  },
  { id: "accountName", column: "accountName", header: "Account" },
  { id: "categoryName", column: "categoryName", header: "Category" },
  { id: "type", column: "type", header: "Type" },
  { id: "status", column: "status", header: "Status" },
  {
    id: "amount",
    column: "amount",
    header: "Amount",
    className: "text-right",
    alwaysVisible: true,
  },
  {
    id: "actions",
    header: "Actions",
    className: "text-right",
    alwaysVisible: true,
  },
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
    columns: COLUMNS,
    columnVisibilityStorageKey: COLUMN_VISIBILITY_STORAGE_KEY,
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
      footer={
        <IncomeExpenseNetFooter
          aggregates={aggregates}
          currency={currency}
          columnCount={table.visibleColumns.length}
        />
      }
    >
      {table.data.map((transaction) => (
        <TransactionsTableRow
          key={transaction._id}
          transaction={transaction}
          currency={currency}
          isColumnVisible={table.isColumnVisible}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </DashboardTable>
  )
}
