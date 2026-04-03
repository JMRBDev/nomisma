import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useConvexMutation } from "@convex-dev/react-query"
import { PlusIcon, Trash2Icon } from "lucide-react"
import { api } from "../../../../convex/_generated/api"
import type { Id } from "../../../../convex/_generated/dataModel"
import {
  DashboardPageHeader,
  GuidedEmptyState,
  MetricCard,
  SectionCard,
} from "@/components/money/money-ui"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Progress } from "@/components/ui/progress"
import { useBudgetsPageData } from "@/hooks/use-money-dashboard"
import {
  currentMonthInputValue,
  formatCurrency,
  formatMonthLabel,
  getBudgetTone,
} from "@/lib/money"

export const Route = createFileRoute("/_authenticated/dashboard/budgets")({
  staticData: {
    breadcrumb: "Budgets",
  },
  component: BudgetsPage,
})

function BudgetsPage() {
  const { data } = useBudgetsPageData()
  const upsertBudget = useConvexMutation(api.budgets.upsertBudget)
  const deleteBudget = useConvexMutation(api.budgets.deleteBudget)
  const [month, setMonth] = useState(currentMonthInputValue())
  const [categoryId, setCategoryId] = useState("")
  const [limitAmount, setLimitAmount] = useState("0")
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  if (!data) {
    return <section className="min-h-[calc(100vh-12rem)]" />
  }

  const currency = data.settings?.baseCurrency
  const totalRemaining = data.budgets.totalPlanned - data.budgets.totalSpent

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPending(true)
    setError("")

    try {
      await upsertBudget({
        month,
        categoryId: categoryId ? (categoryId as Id<"categories">) : undefined,
        limitAmount: Number(limitAmount || "0"),
      })
      setCategoryId("")
      setLimitAmount("0")
      setBudgetDialogOpen(false)
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to save the budget."
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="space-y-6">
      <DashboardPageHeader
        eyebrow="Limits"
        title="Budgets"
        description="Set one total monthly limit and add category budgets for the areas that matter most. Budgets only react to posted expenses."
        action={
          <Button onClick={() => setBudgetDialogOpen(true)}>
            Add budget
            <PlusIcon />
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Planned this month"
          value={formatCurrency(data.budgets.totalPlanned, currency)}
          note={formatMonthLabel(data.budgets.currentMonth)}
        />
        <MetricCard
          label="Spent this month"
          value={formatCurrency(data.budgets.totalSpent, currency)}
          note="Posted expenses"
        />
        <MetricCard
          label="Remaining"
          value={formatCurrency(totalRemaining, currency)}
          note="Across the current budget view"
        />
      </div>

      <SectionCard
        title="Current month budgets"
        description="Use one total spending target or mix it with category limits for tighter control."
      >
        {data.budgets.items.length === 0 ? (
          <GuidedEmptyState
            title="No budgets yet"
            description="Create a monthly limit so the overview can tell you how much room is left."
            icon={<Trash2Icon className="size-5" />}
            action={
              <Button onClick={() => setBudgetDialogOpen(true)}>
                Create your first budget
                <PlusIcon />
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {data.budgets.items.map((budget) => (
              <div
                key={budget._id}
                className="rounded-[2rem] border border-border/60 bg-background/40 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-medium">{budget.categoryName}</p>
                    <p className="text-sm text-muted-foreground">
                      Limit {formatCurrency(budget.limitAmount, currency)}
                    </p>
                  </div>
                  <Button
                    size="icon-sm"
                    variant="outline"
                    onClick={() => void deleteBudget({ budgetId: budget._id })}
                    aria-label="Delete budget"
                  >
                    <Trash2Icon />
                  </Button>
                </div>

                <div className="mt-5 space-y-2">
                  <Progress value={Math.min(budget.progress * 100, 100)} />
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">
                      Spent {formatCurrency(budget.spent, currency)}
                    </span>
                    <span className={getBudgetTone(budget.status)}>
                      {budget.remaining >= 0
                        ? `${formatCurrency(budget.remaining, currency)} left`
                        : `${formatCurrency(Math.abs(budget.remaining), currency)} over`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create or update a budget</DialogTitle>
            <DialogDescription>
              Saving the same month and category again updates the existing
              limit.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="budget-month">
                  <FieldTitle>Month</FieldTitle>
                </FieldLabel>
                <Input
                  id="budget-month"
                  type="month"
                  value={month}
                  onChange={(event) => setMonth(event.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="budget-category">
                  <FieldTitle>Category</FieldTitle>
                </FieldLabel>
                <NativeSelect
                  id="budget-category"
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                >
                  <NativeSelectOption value="">
                    Total monthly spending
                  </NativeSelectOption>
                  {data.categories.activeExpense.map((category) => (
                    <NativeSelectOption key={category._id} value={category._id}>
                      {category.name}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>

              <Field>
                <FieldLabel htmlFor="budget-limit">
                  <FieldTitle>Limit amount</FieldTitle>
                </FieldLabel>
                <Input
                  id="budget-limit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={limitAmount}
                  onChange={(event) => setLimitAmount(event.target.value)}
                />
              </Field>
            </FieldGroup>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Saving..." : "Save budget"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
