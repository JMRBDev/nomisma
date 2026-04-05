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
import { useFormDialog } from "@/hooks/use-form-dialog"
import { useBudgetsPageData } from "@/hooks/use-money-dashboard"
import { formatCurrency, formatMonthLabel } from "@/lib/money"

export function BudgetsPage() {
  const { data } = useBudgetsPageData()
  const upsertBudget = useConvexMutation(api.budgets.upsertBudget)
  const deleteBudget = useConvexMutation(api.budgets.deleteBudget)
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

  if (!data) {
    return <section className="min-h-[calc(100vh-12rem)]" />
  }

  const categoryOptions = data.categories.activeExpense
  const budgets = data.budgets.items
  const currency = data.settings?.baseCurrency
  const monthLabel = formatMonthLabel(data.budgets.currentMonth)
  const overBudgetCount = budgets.filter(
    (budget) => budget.status === "over"
  ).length
  const nearBudgetCount = budgets.filter(
    (budget) => budget.status === "near"
  ).length

  const handleDelete = async (budgetId: BudgetRecord["_id"]) => {
    setPendingBudgetId(budgetId)

    try {
      await deleteBudget({ budgetId })
      if (dialog.editingEntity?._id === budgetId) {
        dialog.handleDialogOpenChange(false)
      }
    } finally {
      setPendingBudgetId(null)
    }
  }

  return (
    <DashboardPageSection>
      <DashboardPageHeader
        title="Budgets"
        action={
          <DashboardPageActions>
            <Button onClick={dialog.openCreateDialog}>
              Add budget
              <PlusIcon />
            </Button>
          </DashboardPageActions>
        }
      />

      {budgets.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <DashboardSummaryCard
              title="Planned this month"
              value={formatCurrency(data.budgets.totalPlanned, currency)}
              description={`${budgets.length} budget${budgets.length === 1 ? "" : "s"} in ${monthLabel}`}
            />
            <DashboardSummaryCard
              title="Posted spending"
              value={formatCurrency(data.budgets.totalSpent, currency)}
              description={`Tracked posted expenses for ${monthLabel}`}
            />
            <DashboardSummaryCard
              title="Remaining"
              value={
                data.budgets.budgetRemaining === null
                  ? "No limit set"
                  : formatCurrency(data.budgets.budgetRemaining, currency)
              }
              description={`${overBudgetCount} over budget, ${nearBudgetCount} close to the limit`}
              toneClassName={
                data.budgets.budgetRemaining === null
                  ? undefined
                  : data.budgets.budgetRemaining < 0
                    ? "text-destructive"
                    : "text-emerald-400"
              }
            />
          </div>

          <Card>
            <CardContent>
              <BudgetsTable
                budgets={budgets}
                currency={currency}
                pendingBudgetId={pendingBudgetId}
                onEdit={dialog.openEditDialog}
                onDelete={handleDelete}
              />
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
            ? () => handleDelete(dialog.editingEntity!._id)
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
    </DashboardPageSection>
  )
}
