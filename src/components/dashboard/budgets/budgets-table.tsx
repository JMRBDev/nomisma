import { useMemo } from "react"
import type { BudgetRecord } from "@/components/dashboard/budgets/budgets-shared"
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

const COLUMNS = [
  { column: "categoryName", header: "Budget" },
  { column: "limitAmount", header: "Planned", className: "text-right" },
  { column: "spent", header: "Spent", className: "text-right" },
  { column: "remaining", header: "Remaining", className: "text-right" },
  { column: "status", header: "Status" },
  { header: "Actions", className: "text-right" },
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
      columns={COLUMNS}
      footer={
        <TableRow>
          <TableCell>
            <span className="text-muted-foreground">
              Total ({table.allSortedData.length} budget
              {table.allSortedData.length !== 1 ? "s" : ""})
            </span>
          </TableCell>
          <TableCell className="text-right font-medium">
            {formatCurrency(aggregates.totalPlanned, currency)}
          </TableCell>
          <TableCell className="text-right font-medium">
            {formatCurrency(aggregates.totalSpent, currency)}
          </TableCell>
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
          <TableCell colSpan={2} />
        </TableRow>
      }
    >
      {table.data.map((budget) => (
        <BudgetsTableRow
          key={budget._id}
          budget={budget}
          currency={currency}
          pending={pendingBudgetId === budget._id}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </DashboardTable>
  )
}
