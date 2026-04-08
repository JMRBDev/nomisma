import { useMemo } from "react"
import type { BudgetRecord } from "@/components/dashboard/budgets/budgets-shared"
import type { DashboardTableColumn } from "@/components/dashboard/dashboard-table-columns"
import { DashboardTable } from "@/components/dashboard/dashboard-table"
import { BudgetsTableRow } from "@/components/dashboard/budgets/budgets-table-row"
import { TableCell, TableRow } from "@/components/ui/table"
import { useDataTable } from "@/hooks/use-data-table"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/money"

const SORT_ACCESSORS: Record<string, (row: BudgetRecord) => string | number> = {
  categoryName: (row) => row.categoryName.toLowerCase(),
  limitAmount: (row) => row.limitAmount,
  spent: (row) => row.spent,
  remaining: (row) => row.remaining,
  status: (row) => row.status,
}

const COLUMN_VISIBILITY_STORAGE_KEY = "nomisma-table-columns:budgets"

const COLUMNS: Array<DashboardTableColumn> = [
  {
    id: "categoryName",
    column: "categoryName",
    header: "Budget",
    alwaysVisible: true,
  },
  {
    id: "limitAmount",
    column: "limitAmount",
    header: "Planned",
    className: "text-right",
  },
  { id: "spent", column: "spent", header: "Spent", className: "text-right" },
  {
    id: "remaining",
    column: "remaining",
    header: "Remaining",
    className: "text-right",
    alwaysVisible: true,
  },
  { id: "status", column: "status", header: "Status" },
  {
    id: "actions",
    header: "Actions",
    className: "text-right",
    alwaysVisible: true,
  },
]

export function BudgetsTable({
  budgets,
  currency,
  pendingBudgetId,
  onEdit,
  onDelete,
}: {
  budgets: Array<BudgetRecord>
  currency?: string | null
  pendingBudgetId: BudgetRecord["_id"] | null
  onEdit: (budget: BudgetRecord) => void
  onDelete: (budgetId: BudgetRecord["_id"]) => void
}) {
  const table = useDataTable({
    data: budgets,
    columns: COLUMNS,
    columnVisibilityStorageKey: COLUMN_VISIBILITY_STORAGE_KEY,
    sortAccessors: SORT_ACCESSORS,
  })

  const aggregates = useMemo(() => {
    const totalPlanned = table.allSortedData.reduce(
      (sum, b) => sum + b.limitAmount,
      0
    )
    const totalSpent = table.allSortedData.reduce((sum, b) => sum + b.spent, 0)
    const totalRemaining = table.allSortedData.reduce(
      (sum, b) => sum + b.remaining,
      0
    )
    return { totalPlanned, totalSpent, totalRemaining }
  }, [table.allSortedData])

  return (
    <DashboardTable
      table={table}
      footer={
        <TableRow>
          <TableCell>
            <span className="text-muted-foreground">
              Total ({table.allSortedData.length} budget
              {table.allSortedData.length !== 1 ? "s" : ""})
            </span>
          </TableCell>
          {table.isColumnVisible("limitAmount") && (
            <TableCell className="text-right font-medium">
              {formatCurrency(aggregates.totalPlanned, currency)}
            </TableCell>
          )}
          {table.isColumnVisible("spent") && (
            <TableCell className="text-right font-medium">
              {formatCurrency(aggregates.totalSpent, currency)}
            </TableCell>
          )}
          {table.isColumnVisible("remaining") && (
            <TableCell
              className={cn(
                "text-right font-medium",
                aggregates.totalRemaining < 0
                  ? "text-destructive"
                  : "text-emerald-400"
              )}
            >
              {formatCurrency(aggregates.totalRemaining, currency)}
            </TableCell>
          )}
          {table.isColumnVisible("status") && <TableCell />}
          {table.isColumnVisible("actions") && <TableCell />}
        </TableRow>
      }
    >
      {table.data.map((budget) => (
        <BudgetsTableRow
          key={budget._id}
          budget={budget}
          currency={currency}
          pending={pendingBudgetId === budget._id}
          isColumnVisible={table.isColumnVisible}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </DashboardTable>
  )
}
