import { getRouteApi } from "@tanstack/react-router"
import { useMemo } from "react"
import { PlusIcon, TagIcon } from "lucide-react"
import type { CategoryTableRow } from "@/components/dashboard/transactions/categories-table"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoryFormDialog } from "@/components/dashboard/transactions/category-form-dialog"
import { CategoriesTable } from "@/components/dashboard/transactions/categories-table"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { useCategoryManager } from "@/hooks/use-category-manager"

const transactionsRouteApi = getRouteApi(
  "/_authenticated/dashboard/transactions"
)

type PageData = ReturnType<typeof transactionsRouteApi.useLoaderData>

export function CategoriesSection({
  data,
}: {
  data: PageData
}) {
  const { dialog: categoryDialog, toggleCategoryArchived } =
    useCategoryManager()

  const categoryRows = useMemo<Array<CategoryTableRow>>(() => {
    const txCounts = new Map<string, number>()
    for (const tx of data.transactions) {
      if (tx.categoryId) {
        txCounts.set(tx.categoryId, (txCounts.get(tx.categoryId) ?? 0) + 1)
      }
    }
    return data.categories.all.map((cat: PageData["categories"]["all"][number]) => ({
      _id: cat._id,
      name: cat.name,
      kind: cat.kind,
      color: cat.color,
      icon: cat.icon,
      archived: cat.archived,
      transactionCount: txCounts.get(cat._id) ?? 0,
    }))
  }, [data])

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Categories
          </CardTitle>

          <CardAction>
            <Button
              size="sm"
              variant="outline"
              onClick={categoryDialog.openCreateDialog}
            >
              Add category
              <PlusIcon />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {categoryRows.length === 0 ? (
            <Empty className="border-border/60 bg-card/70">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <TagIcon className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Add your first category</EmptyTitle>
                <EmptyDescription>
                  Create income and expense categories to organize your
                  transactions and budgets.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={categoryDialog.openCreateDialog}>
                  Add category
                  <PlusIcon />
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <CategoriesTable
              categories={categoryRows}
              onEdit={(category) => {
                const source = data.categories.all.find(
                  (item: PageData["categories"]["all"][number]) =>
                    item._id === category._id
                )
                if (source) {
                  categoryDialog.openEditDialog(source)
                }
              }}
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
