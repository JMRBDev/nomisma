import type { OverviewRecentTransactionRecord } from "@/components/dashboard/overview/overview-shared"
import { CategoryNameCell } from "@/components/dashboard/category-name-cell"

export function OverviewRecentTransactionDescription({
  transaction,
}: {
  transaction: OverviewRecentTransactionRecord
}) {
  return (
    <div className="space-y-1">
      <p className="font-medium">{transaction.description}</p>
      <div className="text-xs text-muted-foreground">
        {transaction.categoryName ? (
          <CategoryNameCell
            name={transaction.categoryName}
            icon={transaction.categoryIcon}
            color={transaction.categoryColor}
          />
        ) : (
          "Transfer"
        )}
      </div>
    </div>
  )
}
