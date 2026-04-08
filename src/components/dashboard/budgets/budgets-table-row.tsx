import { PencilIcon, Trash2Icon } from "lucide-react"
import type { BudgetRecord } from "@/components/dashboard/budgets/budgets-shared"
import { CategoryTableValue } from "@/components/dashboard/category-table-value"
import { getBudgetStatusLabel } from "@/components/dashboard/budgets/budgets-shared"
import { DashboardTableActions } from "@/components/dashboard/dashboard-table-actions"
import { TableCell, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { formatCurrency, getBudgetTone } from "@/lib/money"

export function BudgetsTableRow({
  budget,
  currency,
  pending,
  isColumnVisible,
  onEdit,
  onDelete,
}: {
  budget: BudgetRecord
  currency?: string | null
  pending: boolean
  isColumnVisible: (columnId: string) => boolean
  onEdit: (budget: BudgetRecord) => void
  onDelete: (budgetId: BudgetRecord["_id"]) => void
}) {
  const progressValue = Math.min(budget.progress * 100, 100)
  return (
    <TableRow>
      {isColumnVisible("categoryName") && (
        <TableCell>
          <div className="min-w-56 space-y-2">
            <div className="space-y-1">
              <div className="font-medium">
                <CategoryTableValue
                  name={budget.categoryName}
                  icon={budget.categoryIcon}
                  color={budget.categoryColor}
                />
              </div>
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
                    budget.status === "healthy" && "bg-success"
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
      )}
      {isColumnVisible("limitAmount") && (
        <TableCell className="text-right font-medium">
          {formatCurrency(budget.limitAmount, currency)}
        </TableCell>
      )}
      {isColumnVisible("spent") && (
        <TableCell className="text-right">
          {formatCurrency(budget.spent, currency)}
        </TableCell>
      )}
      {isColumnVisible("remaining") && (
        <TableCell
          className={cn("text-right font-medium", getBudgetTone(budget.status))}
        >
          {formatCurrency(budget.remaining, currency)}
        </TableCell>
      )}
      {isColumnVisible("status") && (
        <TableCell>
          <span className={cn(getBudgetTone(budget.status))}>
            {getBudgetStatusLabel(budget.status)}
          </span>
        </TableCell>
      )}
      {isColumnVisible("actions") && (
        <TableCell>
          <DashboardTableActions
            actions={[
              {
                id: "edit",
                label: "Edit",
                icon: PencilIcon,
                disabled: pending,
                onSelect: () => onEdit(budget),
              },
              {
                id: "delete",
                label: "Delete",
                icon: Trash2Icon,
                disabled: pending,
                variant: "destructive",
                onSelect: () => onDelete(budget._id),
              },
            ]}
          />
        </TableCell>
      )}
    </TableRow>
  )
}
