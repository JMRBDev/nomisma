import { useMemo } from "react"
import type { BudgetRecord } from "@/components/dashboard/budgets/budgets-shared"
import type { DashboardTableColumn } from "@/components/dashboard/dashboard-table-columns"
import { DashboardTable } from "@/components/dashboard/dashboard-table"
import { BudgetsTableRow } from "@/components/dashboard/budgets/budgets-table-row"
import { TableCell, TableRow } from "@/components/ui/table"
import { useDataTable } from "@/hooks/use-data-table"
import { getBudgetCategoryLabel } from "@/lib/dashboard-i18n"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/money"
import { m } from "@/lib/i18n-client"

const SORT_ACCESSORS: Record<string, (row: BudgetRecord) => string | number> = {
  categoryName: (row) => getBudgetCategoryLabel(row).toLowerCase(),
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
    header: m.budgets_table_target(),
    alwaysVisible: true,
  },
  {
    id: "limitAmount",
    column: "limitAmount",
    header: m.budgets_table_planned(),
    className: "text-right",
  },
  {
    id: "spent",
    column: "spent",
    header: m.budgets_table_spent(),
    className: "text-right",
  },
  {
    id: "remaining",
    column: "remaining",
    header: m.budgets_table_remaining(),
    className: "text-right",
    alwaysVisible: true,
  },
  { id: "status", column: "status", header: m.common_status() },
  {
    id: "actions",
    header: m.common_actions(),
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
              {m.budgets_table_total({
                count: table.allSortedData.length,
              })}
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
                aggregates.totalRemaining < 0 ? "text-destructive" : "text-success"
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
