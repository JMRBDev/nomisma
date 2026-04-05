import type { OverviewTopSpendingCategory } from "@/components/dashboard/overview/overview-shared"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/money"

export function OverviewTopSpendingCategoriesList({
  categories,
  totalExpenses,
  currency,
}: {
  categories: Array<OverviewTopSpendingCategory>
  totalExpenses: number
  currency?: string | null
}) {
  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const share =
          totalExpenses > 0 ? (category.amount / totalExpenses) * 100 : 0

        return (
          <div key={category.categoryId} className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="font-medium">{category.categoryName}</p>
                <p className="text-sm text-muted-foreground">
                  {Math.round(share)}% of posted expense spending
                </p>
              </div>
              <p className="font-medium">
                {formatCurrency(category.amount, currency)}
              </p>
            </div>
            <Progress value={Math.min(share, 100)} />
          </div>
        )
      })}
    </div>
  )
}
