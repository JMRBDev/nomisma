import { useMemo } from "react"
import type { TransactionRecord } from "@/components/dashboard/transactions/transactions-shared"
import type { DashboardTableColumn } from "@/components/dashboard/dashboard-table-columns"
import { DashboardTable } from "@/components/dashboard/dashboard-table"
import { IncomeExpenseNetFooter } from "@/components/dashboard/income-expense-net-footer"
import { TransactionsTableRow } from "@/components/dashboard/transactions/transactions-table-row"
import { useDataTable } from "@/hooks/use-data-table"
import {
  getAccountDisplayName,
  getTransactionCategoryLabel,
} from "@/lib/dashboard-i18n"
import { m } from "@/lib/i18n-client"

const SORT_ACCESSORS: Record<
  string,
  (row: TransactionRecord) => string | number
> = {
  date: (row) => row.date,
  description: (row) => row.description.toLowerCase(),
  accountName: (row) => getAccountDisplayName(row.accountName).toLowerCase(),
  categoryName: (row) =>
    (getTransactionCategoryLabel(row) ?? m.transaction_type_transfer()).toLowerCase(),
  type: (row) => row.type,
  status: (row) => row.status,
  amount: (row) => {
    if (row.type === "income") return row.amount
    if (row.type === "expense") return -row.amount
    return 0
  },
}

const COLUMN_VISIBILITY_STORAGE_KEY = "nomisma-table-columns:transactions"

const BASE_COLUMNS: Array<DashboardTableColumn> = [
  { id: "date", column: "date", header: m.common_date(), alwaysVisible: true },
  {
    id: "description",
    column: "description",
    header: m.common_description(),
    alwaysVisible: true,
  },
  { id: "accountName", column: "accountName", header: m.common_account() },
  { id: "categoryName", column: "categoryName", header: m.common_category() },
  { id: "type", column: "type", header: m.common_type() },
  { id: "status", column: "status", header: m.common_status() },
  {
    id: "amount",
    column: "amount",
    header: m.common_amount(),
    className: "text-right",
    alwaysVisible: true,
  },
]

const ACTIONS_COLUMN: DashboardTableColumn = {
  id: "actions",
  header: m.common_actions(),
  className: "text-right",
  alwaysVisible: true,
}

export function TransactionsTable({
  transactions,
  currency,
  onEdit,
  onDelete,
  columnVisibilityStorageKey = COLUMN_VISIBILITY_STORAGE_KEY,
  defaultPageSize,
  showBreakdown = true,
}: {
  transactions: Array<TransactionRecord>
  currency?: string | null
  onEdit?: (transaction: TransactionRecord) => void
  onDelete?: (transactionId: TransactionRecord["_id"]) => void
  columnVisibilityStorageKey?: string
  defaultPageSize?: number
  showBreakdown?: boolean
}) {
  const showActions = Boolean(onEdit && onDelete)
  const columns = showActions
    ? [...BASE_COLUMNS, ACTIONS_COLUMN]
    : BASE_COLUMNS

  const table = useDataTable({
    data: transactions,
    columns,
    columnVisibilityStorageKey,
    sortAccessors: SORT_ACCESSORS,
    defaultSort: { column: "date", direction: "desc" },
    defaultPageSize,
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
          showBreakdown={showBreakdown}
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
