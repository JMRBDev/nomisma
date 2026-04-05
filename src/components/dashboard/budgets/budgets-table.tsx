import { PencilIcon, Trash2Icon } from "lucide-react"
import type { BudgetRecord } from "@/components/dashboard/budgets/budgets-shared"
import { DashboardIconButton } from "@/components/dashboard/dashboard-icon-button"
import { DashboardTableActions } from "@/components/dashboard/dashboard-table-actions"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { formatCurrency, getBudgetTone } from "@/lib/money"

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
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Budget</TableHead>
          <TableHead className="text-right">Planned</TableHead>
          <TableHead className="text-right">Spent</TableHead>
          <TableHead className="text-right">Remaining</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {budgets.map((budget) => {
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
    </Table>
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
