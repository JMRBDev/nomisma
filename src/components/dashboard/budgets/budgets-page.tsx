import { useSuspenseQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useConvexMutation } from "@convex-dev/react-query"
import { PlusIcon } from "lucide-react"
import { api } from "../../../../convex/_generated/api"
import type { BudgetRecord } from "@/components/dashboard/budgets/budgets-shared"
import { BudgetFormDialog } from "@/components/dashboard/budgets/budget-form-dialog"
import { BudgetsEmptyState } from "@/components/dashboard/budgets/budgets-empty-state"
import { BudgetsSummaryCards } from "@/components/dashboard/budgets/budgets-summary-cards"
import { BudgetsTable } from "@/components/dashboard/budgets/budgets-table"
import { CategoryReferenceDialog } from "@/components/dashboard/category-reference-dialog"
import { buildBudgetPayload, createBudgetDefaults, createBudgetFormValues, validateBudgetValues } from "@/components/dashboard/budgets/budgets-shared"
import { DashboardPageActions } from "@/components/dashboard/dashboard-page-actions"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { DashboardPageSection } from "@/components/dashboard/dashboard-page-section"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useFormDialog } from "@/hooks/use-form-dialog"
import { formatMonthLabel } from "@/lib/money"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import { useCalendarContext } from "@/hooks/use-calendar-context"
import { useCategoryReferenceActions } from "@/hooks/use-category-reference-actions"
import { useDeleteConfirmation } from "@/hooks/use-delete-confirmation"
import { getBudgetsPageDataQueryOptions } from "@/lib/dashboard-query-options"

export function BudgetsPage() {
  const calendarContext = useCalendarContext()
  const { data } = useSuspenseQuery(
    getBudgetsPageDataQueryOptions(calendarContext)
  )
  const upsertBudget = useConvexMutation(api.budgets.upsertBudget)
  const deleteBudgetMutation = useConvexMutation(api.budgets.deleteBudget)
  const [pendingBudgetId, setPendingBudgetId] = useState<BudgetRecord["_id"] | null>(null)
  const categoryActions = useCategoryReferenceActions()
  const dialog = useFormDialog({
    createDefaults: () => {
      const categoryOptions = data.categories.active
      return createBudgetDefaults(categoryOptions)
    },
    createFormValues: createBudgetFormValues,
    validate: (values) => validateBudgetValues(values, data.categories.active),
    onSubmit: async (values) => {
      await upsertBudget(buildBudgetPayload(values, data.budgets.currentMonth))
    },
  })
  const deleteConfirmation = useDeleteConfirmation<BudgetRecord["_id"]>({
    onConfirm: async (id) => {
      setPendingBudgetId(id)
      try {
        await deleteBudgetMutation({ budgetId: id })
        if (dialog.editingEntity?._id === id) {
          dialog.handleDialogOpenChange(false)
        }
      } finally {
        setPendingBudgetId(null)
      }
    },
    errorMessage: "Unable to delete the budget.",
  })
  const categoryOptions = data.categories.active
  const allCategoryOptions = data.categories.all
  const budgets = data.budgets.items
  const currency = data.settings?.baseCurrency
  const monthLabel = formatMonthLabel(data.budgets.currentMonth)
  const overBudgetCount = budgets.filter((b) => b.status === "over").length
  const nearBudgetCount = budgets.filter((b) => b.status === "near").length
  return (
    <DashboardPageSection>
      <DashboardPageHeader
        title="Budgets"
        action={
          <DashboardPageActions>
            <Button onClick={() => dialog.openCreateDialog()}>
              Add budget
              <PlusIcon />
            </Button>
          </DashboardPageActions>
        }
      />
      {budgets.length > 0 ? (
        <>
          <BudgetsSummaryCards
            budgets={budgets}
            data={data}
            currency={currency}
            monthLabel={monthLabel}
            overBudgetCount={overBudgetCount}
            nearBudgetCount={nearBudgetCount}
          />
          <Card>
            <CardContent>
              <BudgetsTable
                budgets={budgets}
                currency={currency}
                pendingBudgetId={pendingBudgetId}
                onEdit={dialog.openEditDialog}
                onDelete={deleteConfirmation.requestDelete}
              />
            </CardContent>
          </Card>
        </>
      ) : (
        <BudgetsEmptyState monthLabel={monthLabel} onAddBudget={dialog.openCreateDialog} />
      )}
      <BudgetFormDialog
        open={dialog.dialogOpen}
        onOpenChange={dialog.handleDialogOpenChange}
        onSubmit={dialog.handleSubmit}
        onDelete={
          dialog.editingEntity
            ? () => deleteConfirmation.requestDelete(dialog.editingEntity!._id)
            : undefined
        }
        editing={dialog.isEditing}
        monthLabel={monthLabel}
        values={dialog.values}
        errors={dialog.errors}
        formError={dialog.formError}
        pending={
          dialog.pending ||
          (dialog.editingEntity
            ? pendingBudgetId === dialog.editingEntity._id
            : false)
        }
        categoryOptions={categoryOptions}
        allCategoryOptions={allCategoryOptions}
        onValueChange={dialog.handleValueChange}
        onCreateCategory={(name) =>
          categoryActions.handleCreateCategory(name, (categoryId) =>
            dialog.handleValueChange("categoryId", categoryId)
          )
        }
        onUnarchiveCategory={(categoryId) =>
          categoryActions.handleUnarchiveCategory(categoryId, (nextCategoryId) =>
            dialog.handleValueChange("categoryId", nextCategoryId)
          )
        }
      />
      <CategoryReferenceDialog
        categoryActions={categoryActions}
        description="Save this category and it will be selected in the budget form."
      />
      <DeleteConfirmDialog
        {...deleteConfirmation.dialogProps}
        title="Delete this budget?"
        description="This action cannot be undone. The budget will be permanently removed."
      />
    </DashboardPageSection>
  )
}
