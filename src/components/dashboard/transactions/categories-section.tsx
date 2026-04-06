import { useMemo } from "react"
import { PlusIcon, TagIcon } from "lucide-react"
import type { CategoryTableRow } from "@/components/dashboard/transactions/categories-table"
import type { useTransactionsPageData } from "@/hooks/use-money-dashboard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CategoriesTable } from "@/components/dashboard/transactions/categories-table"
import { CategoryFormDialog } from "@/components/dashboard/transactions/category-form-dialog"
import { GuidedEmptyState } from "@/components/guided-empty-state"
import { useCategoryManager } from "@/hooks/use-category-manager"

type PageData = NonNullable<ReturnType<typeof useTransactionsPageData>["data"]>

export function CategoriesSection({
  isLoading,
  data,
}: {
  isLoading: boolean
  data: PageData | undefined
}) {
  const { dialog: categoryDialog, toggleCategoryArchived } =
    useCategoryManager()

  const categoryRows = useMemo<Array<CategoryTableRow>>(() => {
    if (!data) return []
    const txCounts = new Map<string, number>()
    for (const tx of data.transactions) {
      if (tx.categoryId) {
        txCounts.set(tx.categoryId, (txCounts.get(tx.categoryId) ?? 0) + 1)
      }
    }
    return data.categories.all.map((cat) => ({
      _id: cat._id,
      name: cat.name,
      kind: cat.kind,
      archived: cat.archived,
      transactionCount: txCounts.get(cat._id) ?? 0,
    }))
  }, [data])

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-2xl">
            Categories
            <Button
              size="sm"
              variant="outline"
              onClick={categoryDialog.openCreateDialog}
              disabled={isLoading}
            >
              Add category
              <PlusIcon />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : categoryRows.length === 0 ? (
            <GuidedEmptyState
              title="Add your first category"
              description="Create income and expense categories to organize your transactions and budgets."
              icon={<TagIcon className="size-5" />}
              action={
                <Button onClick={categoryDialog.openCreateDialog}>
                  Add category
                  <PlusIcon />
                </Button>
              }
            />
          ) : (
            <CategoriesTable
              categories={categoryRows}
              onEdit={categoryDialog.openEditDialog}
              onToggleArchived={(categoryId, archived) =>
                toggleCategoryArchived({ categoryId, archived })
              }
            />
          )}
        </CardContent>
      </Card>

      <CategoryFormDialog
        open={categoryDialog.dialogOpen}
        onOpenChange={categoryDialog.handleDialogOpenChange}
        onSubmit={categoryDialog.handleSubmit}
        values={categoryDialog.values}
        errors={categoryDialog.errors}
        formError={categoryDialog.formError}
        pending={categoryDialog.pending}
        isEditing={categoryDialog.isEditing}
        onValueChange={categoryDialog.handleValueChange}
      />
    </>
  )
}
