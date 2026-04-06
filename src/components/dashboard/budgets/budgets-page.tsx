import { useState } from "react"
import { useConvexMutation } from "@convex-dev/react-query"
import { PlusIcon } from "lucide-react"
import { api } from "../../../../convex/_generated/api"
import type { BudgetRecord } from "@/components/dashboard/budgets/budgets-shared"
import { BudgetFormDialog } from "@/components/dashboard/budgets/budget-form-dialog"
import { BudgetsEmptyState } from "@/components/dashboard/budgets/budgets-empty-state"
import { BudgetsTable } from "@/components/dashboard/budgets/budgets-table"
import {
  buildBudgetPayload,
  createBudgetDefaults,
  createBudgetFormValues,
  validateBudgetValues,
} from "@/components/dashboard/budgets/budgets-shared"
import { DashboardPageActions } from "@/components/dashboard/dashboard-page-actions"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { DashboardPageSection } from "@/components/dashboard/dashboard-page-section"
import { DashboardSummaryCard } from "@/components/dashboard/dashboard-summary-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useFormDialog } from "@/hooks/use-form-dialog"
import { useBudgetsPageData } from "@/hooks/use-money-dashboard"
import { formatCurrency, formatMonthLabel } from "@/lib/money"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import { useDeleteConfirmation } from "@/hooks/use-delete-confirmation"

export function BudgetsPage() {
  const { data } = useBudgetsPageData()
  const upsertBudget = useConvexMutation(api.budgets.upsertBudget)
  const deleteBudgetMutation = useConvexMutation(api.budgets.deleteBudget)
  const [pendingBudgetId, setPendingBudgetId] = useState<
    BudgetRecord["_id"] | null
  >(null)

  const dialog = useFormDialog({
    createDefaults: () => {
      const categoryOptions = data?.categories.activeExpense ?? []
      return createBudgetDefaults(categoryOptions)
    },
    createFormValues: createBudgetFormValues,
    validate: (values) =>
      validateBudgetValues(values, data?.categories.activeExpense ?? []),
    onSubmit: async (values) => {
      if (!data) return
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

  const isLoading = !data
  const categoryOptions = data?.categories.activeExpense ?? []
  const budgets = data?.budgets.items ?? []
  const currency = data?.settings?.baseCurrency
  const monthLabel = data ? formatMonthLabel(data.budgets.currentMonth) : ""
  const overBudgetCount = budgets.filter(
    (budget) => budget.status === "over"
  ).length
  const nearBudgetCount = budgets.filter(
    (budget) => budget.status === "near"
  ).length

  return (
    <DashboardPageSection>
      <DashboardPageHeader
        title="Budgets"
        action={
          <DashboardPageActions>
            <Button onClick={dialog.openCreateDialog} disabled={isLoading}>
              Add budget
              <PlusIcon />
            </Button>
          </DashboardPageActions>
        }
      />

      {isLoading || budgets.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <DashboardSummaryCard
              loading={isLoading}
              title="Planned this month"
              value={
                data ? formatCurrency(data.budgets.totalPlanned, currency) : ""
              }
              description={
                data
                  ? `${budgets.length} budget${budgets.length === 1 ? "" : "s"} in ${monthLabel}`
                  : ""
              }
            />
            <DashboardSummaryCard
              loading={isLoading}
              title="Posted spending"
              value={
                data ? formatCurrency(data.budgets.totalSpent, currency) : ""
              }
              description={
                data ? `Tracked posted expenses for ${monthLabel}` : ""
              }
            />
            <DashboardSummaryCard
              loading={isLoading}
              title="Remaining"
              value={
                data
                  ? data.budgets.budgetRemaining === null
                    ? "No limit set"
                    : formatCurrency(data.budgets.budgetRemaining, currency)
                  : ""
              }
              description={
                data
                  ? `${overBudgetCount} over budget, ${nearBudgetCount} close to the limit`
                  : ""
              }
              toneClassName={
                data
                  ? data.budgets.budgetRemaining === null
                    ? undefined
                    : data.budgets.budgetRemaining < 0
                      ? "text-destructive"
                      : "text-emerald-400"
                  : undefined
              }
            />
          </div>

          <Card>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-3/4" />
                </div>
              ) : (
                <BudgetsTable
                  budgets={budgets}
                  currency={currency}
                  pendingBudgetId={pendingBudgetId}
                  onEdit={dialog.openEditDialog}
                  onDelete={deleteConfirmation.requestDelete}
                />
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <BudgetsEmptyState
          monthLabel={monthLabel}
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
        onValueChange={dialog.handleValueChange}
      />

      <DeleteConfirmDialog
        {...deleteConfirmation.dialogProps}
        title="Delete this budget?"
        description="This action cannot be undone. The budget will be permanently removed."
      />
    </DashboardPageSection>
  )
}
