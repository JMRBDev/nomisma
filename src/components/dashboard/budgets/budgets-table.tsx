import { PencilIcon, Trash2Icon } from "lucide-react"
import { useMemo } from "react"
import type { BudgetRecord } from "@/components/dashboard/budgets/budgets-shared"
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
import { cn } from "@/lib/utils"
import { formatCurrency, getBudgetTone } from "@/lib/money"

const BUDGET_SORT_ACCESSORS: Record<
  string,
  (row: BudgetRecord) => string | number
> = {
  categoryName: (row) => row.categoryName.toLowerCase(),
  limitAmount: (row) => row.limitAmount,
  spent: (row) => row.spent,
  remaining: (row) => row.remaining,
  status: (row) => row.status,
}

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
    sortAccessors: BUDGET_SORT_ACCESSORS,
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
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <DataTableHead
              column="categoryName"
              sort={table.sort}
              onSort={table.toggleSort}
            >
              Budget
            </DataTableHead>
            <DataTableHead
              column="limitAmount"
              sort={table.sort}
              onSort={table.toggleSort}
              className="text-right"
            >
              Planned
            </DataTableHead>
            <DataTableHead
              column="spent"
              sort={table.sort}
              onSort={table.toggleSort}
              className="text-right"
            >
              Spent
            </DataTableHead>
            <DataTableHead
              column="remaining"
              sort={table.sort}
              onSort={table.toggleSort}
              className="text-right"
            >
              Remaining
            </DataTableHead>
            <DataTableHead
              column="status"
              sort={table.sort}
              onSort={table.toggleSort}
            >
              Status
            </DataTableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {table.data.map((budget) => {
            const pending = pendingBudgetId === budget._id
            const progressValue = Math.min(budget.progress * 100, 100)

            return (
              <TableRow key={budget._id}>
                <TableCell>
                  <div className="min-w-56 space-y-2">
                    <div className="space-y-1">
                      <p className="font-medium">{budget.categoryName}</p>
                      <p className="text-xs text-muted-foreground">
                        {budget.categoryId
                          ? "Expense category"
                          : "Overall monthly spending cap"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full transition-[width]",
                            budget.status === "over" && "bg-destructive",
                            budget.status === "near" && "bg-amber-400",
                            budget.status === "healthy" && "bg-emerald-400"
                          )}
                          style={{ width: `${progressValue}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(budget.progress * 100)}% used
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(budget.limitAmount, currency)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(budget.spent, currency)}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-medium",
                    getBudgetTone(budget.status)
                  )}
                >
                  {formatCurrency(budget.remaining, currency)}
                </TableCell>
                <TableCell>
                  <Badge variant={getBudgetBadgeVariant(budget.status)}>
                    {getBudgetStatusLabel(budget.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DashboardTableActions>
                    <DashboardIconButton
                      onClick={() => onEdit(budget)}
                      aria-label="Edit budget"
                      disabled={pending}
                    >
                      <PencilIcon />
                    </DashboardIconButton>
                    <DashboardIconButton
                      onClick={() => onDelete(budget._id)}
                      aria-label="Delete budget"
                      disabled={pending}
                    >
                      <Trash2Icon />
                    </DashboardIconButton>
                  </DashboardTableActions>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
        {table.allSortedData.length > 0 && (
          <TableFooter>
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

function getBudgetStatusLabel(status: BudgetRecord["status"]) {
  if (status === "over") return "Over budget"
  if (status === "near") return "Close to limit"
  return "Healthy"
}

function getBudgetBadgeVariant(status: BudgetRecord["status"]) {
  if (status === "over") return "destructive" as const
  if (status === "near") return "secondary" as const
  return "outline" as const
}
