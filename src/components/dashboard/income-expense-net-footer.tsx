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
              <span className="font-medium text-emerald-400">
                {formatCurrency(aggregates.totalIncome, currency)}
              </span>
              {" · Expense: "}
              <span className="font-medium text-rose-300">
                {formatCurrency(aggregates.totalExpense, currency)}
              </span>
              {" · "}
            </>
          )}
          {"Net: "}
          <span
            className={cn(
              "font-medium",
              aggregates.net >= 0 ? "text-emerald-400" : "text-rose-300"
            )}
          >
            {formatCurrency(aggregates.net, currency)}
          </span>
        </span>
      </TableCell>
    </TableRow>
  )
}
