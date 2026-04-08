import { TableCell, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/money"
import { cn } from "@/lib/utils"

export function IncomeExpenseNetFooter({
  aggregates,
  currency,
  columnCount,
  showBreakdown = true,
}: {
  aggregates: { totalIncome: number; totalExpense: number; net: number }
  currency?: string | null
  columnCount: number
  showBreakdown?: boolean
}) {
  return (
    <TableRow>
      <TableCell colSpan={columnCount}>
        <span className="text-muted-foreground">
          {showBreakdown && (
            <>
              {"Income: "}
              <span className="font-medium text-success">
                {formatCurrency(aggregates.totalIncome, currency)}
              </span>
              {" · Expense: "}
              <span className="font-medium text-destructive">
                {formatCurrency(aggregates.totalExpense, currency)}
              </span>
              {" · "}
            </>
          )}
          {"Net: "}
          <span
            className={cn(
              "font-medium",
              aggregates.net >= 0 ? "text-success" : "text-destructive"
            )}
          >
            {formatCurrency(aggregates.net, currency)}
          </span>
        </span>
      </TableCell>
    </TableRow>
  )
}
