import { useState } from "react"
import { useConvexMutation } from "@convex-dev/react-query"
import { PlusIcon } from "lucide-react"
import { api } from "../../../../convex/_generated/api"
import { BudgetFormDialog } from "@/components/dashboard/budgets/budget-form-dialog"
import { BudgetsEmptyState } from "@/components/dashboard/budgets/budgets-empty-state"
import type {
  BudgetFieldErrors,
  BudgetFormValues,
  BudgetRecord,
} from "@/components/dashboard/budgets/budgets-shared"
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
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useBudgetsPageData } from "@/hooks/use-money-dashboard"
import { cn } from "@/lib/utils"
import { formatCurrency, formatMonthLabel } from "@/lib/money"

export function BudgetsPage() {
  const { data } = useBudgetsPageData()
  const upsertBudget = useConvexMutation(api.budgets.upsertBudget)
  const deleteBudget = useConvexMutation(api.budgets.deleteBudget)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<BudgetRecord | null>(null)
  const [values, setValues] = useState<BudgetFormValues>({
    categoryId: "total",
    limitAmount: "0",
  })
  const [errors, setErrors] = useState<BudgetFieldErrors>({})
  const [formError, setFormError] = useState("")
  const [pending, setPending] = useState(false)
  const [pendingBudgetId, setPendingBudgetId] = useState<
    BudgetRecord["_id"] | null
  >(null)

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

  const resetDialogState = () => {
    setErrors({})
    setFormError("")
    setPending(false)
  }

  const openCreateDialog = () => {
    setEditingBudget(null)
    setValues(createBudgetDefaults(categoryOptions))
    resetDialogState()
    setDialogOpen(true)
  }

  const openEditDialog = (budget: BudgetRecord) => {
    setEditingBudget(budget)
    setValues(createBudgetFormValues(budget))
    resetDialogState()
    setDialogOpen(true)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)

    if (!open) {
      setEditingBudget(null)
      resetDialogState()
    }
  }

  const handleValueChange = (name: keyof BudgetFormValues, value: string) => {
    setValues((current) => ({
      ...current,
      [name]: value,
    }))
    setErrors((current) => ({
      ...current,
      [name]: undefined,
    }))
    setFormError("")
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors = validateBudgetValues(values, categoryOptions)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setPending(true)
    setFormError("")

    try {
      await upsertBudget(buildBudgetPayload(values, data.budgets.currentMonth))
      setDialogOpen(false)
      setEditingBudget(null)
      setValues(createBudgetDefaults(categoryOptions))
      setErrors({})
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Could not save this budget."
      )
    } finally {
      setPending(false)
    }
  }

  const handleDelete = async (budgetId: BudgetRecord["_id"]) => {
    setPendingBudgetId(budgetId)

    try {
      await deleteBudget({ budgetId })
      if (editingBudget?._id === budgetId) {
        setDialogOpen(false)
        setEditingBudget(null)
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
            <Button onClick={openCreateDialog}>
              Add budget
              <PlusIcon />
            </Button>
          </DashboardPageActions>
        }
      />

      {budgets.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <BudgetSummaryCard
              title="Planned this month"
              value={formatCurrency(data.budgets.totalPlanned, currency)}
              description={`${budgets.length} budget${budgets.length === 1 ? "" : "s"} in ${monthLabel}`}
            />
            <BudgetSummaryCard
              title="Posted spending"
              value={formatCurrency(data.budgets.totalSpent, currency)}
              description={`Tracked posted expenses for ${monthLabel}`}
            />
            <BudgetSummaryCard
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

          <BudgetsTable
            budgets={budgets}
            currency={currency}
            pendingBudgetId={pendingBudgetId}
            onEdit={openEditDialog}
            onDelete={handleDelete}
          />
        </>
      ) : (
        <BudgetsEmptyState
          monthLabel={monthLabel}
          onAddBudget={openCreateDialog}
        />
      )}

      <BudgetFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        onSubmit={handleSubmit}
        onDelete={
          editingBudget ? () => handleDelete(editingBudget._id) : undefined
        }
        editing={editingBudget !== null}
        monthLabel={monthLabel}
        values={values}
        errors={errors}
        formError={formError}
        pending={
          pending ||
          (editingBudget ? pendingBudgetId === editingBudget._id : false)
        }
        categoryOptions={categoryOptions}
        onValueChange={handleValueChange}
      />
    </DashboardPageSection>
  )
}

function BudgetSummaryCard({
  title,
  value,
  description,
  toneClassName,
}: {
  title: string
  value: string
  description: string
  toneClassName?: string
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p
          className={cn(
            "font-heading text-2xl leading-none font-medium",
            toneClassName
          )}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  )
}
