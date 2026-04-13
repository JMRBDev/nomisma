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
import {
  buildBudgetPayload,
  createBudgetDefaults,
  createBudgetFormValues,
  validateBudgetValues,
} from "@/components/dashboard/budgets/budgets-shared"
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
import { t } from "@/lib/i18n"

export function BudgetsPage() {
  const calendarContext = useCalendarContext()
  const { data } = useSuspenseQuery(
    getBudgetsPageDataQueryOptions(calendarContext)
  )
  const upsertBudget = useConvexMutation(api.budgets.upsertBudget)
  const deleteBudgetMutation = useConvexMutation(api.budgets.deleteBudget)
  const [pendingBudgetId, setPendingBudgetId] = useState<string | null>(null)
  const categoryActions = useCategoryReferenceActions()
  const dialog = useFormDialog({
    createDefaults: () => createBudgetDefaults(data.categories.active),
    createFormValues: createBudgetFormValues,
    validate: (values) => validateBudgetValues(values, data.categories.active),
    onSubmit: (values) =>
      upsertBudget(buildBudgetPayload(values, data.budgets.currentMonth)),
  })
  const deleteConfirmation = useDeleteConfirmation<BudgetRecord["_id"]>({
    onConfirm: async (id) => {
      setPendingBudgetId(id)
      try {
        await deleteBudgetMutation({ budgetId: id })
        dialog.editingEntity?._id === id && dialog.handleDialogOpenChange(false)
      } finally {
        setPendingBudgetId(null)
      }
    },
    errorMessage: t("budgets_delete_error"),
  })
  return (
    <DashboardPageSection>
      <DashboardPageHeader
        title={t("nav_budgets")}
        action={
          <DashboardPageActions>
            <Button onClick={() => dialog.openCreateDialog()}>
              {t("budgets_add_budget")}
              <PlusIcon />
            </Button>
          </DashboardPageActions>
        }
      />
      {data.budgets.items.length > 0 ? (
        <>
          <BudgetsSummaryCards
            budgets={data.budgets.items}
            data={data}
            currency={data.settings.baseCurrency}
            monthLabel={formatMonthLabel(data.budgets.currentMonth)}
            overBudgetCount={
              data.budgets.items.filter((b) => b.status === "over").length
            }
            nearBudgetCount={
              data.budgets.items.filter((b) => b.status === "near").length
            }
          />
          <Card>
            <CardContent>
              <BudgetsTable
                budgets={data.budgets.items}
                currency={data.settings.baseCurrency}
                pendingBudgetId={pendingBudgetId}
                onEdit={dialog.openEditDialog}
                onDelete={deleteConfirmation.requestDelete}
              />
            </CardContent>
          </Card>
        </>
      ) : (
        <BudgetsEmptyState
          monthLabel={formatMonthLabel(data.budgets.currentMonth)}
          onAddBudget={dialog.openCreateDialog}
        />
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
        monthLabel={formatMonthLabel(data.budgets.currentMonth)}
        values={dialog.values}
        errors={dialog.errors}
        formError={dialog.formError}
        pending={
          dialog.pending ||
          (dialog.editingEntity && pendingBudgetId === dialog.editingEntity._id)
        }
        categoryOptions={data.categories.active}
        allCategoryOptions={data.categories.all}
        onValueChange={dialog.handleValueChange}
        onCreateCategory={(name) =>
          categoryActions.handleCreateCategory(name, (categoryId) =>
            dialog.handleValueChange("categoryId", categoryId)
          )
        }
        onUnarchiveCategory={(categoryId) =>
          categoryActions.handleUnarchiveCategory(
            categoryId,
            (nextCategoryId) =>
              dialog.handleValueChange("categoryId", nextCategoryId)
          )
        }
      />
      <CategoryReferenceDialog
        categoryActions={categoryActions}
        description={t("budgets_category_reference_description")}
      />
      <DeleteConfirmDialog
        {...deleteConfirmation.dialogProps}
        title={t("budgets_delete_title")}
        description={t("budgets_delete_description")}
      />
    </DashboardPageSection>
  )
}
