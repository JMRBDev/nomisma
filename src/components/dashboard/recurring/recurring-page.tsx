import { useState } from "react"
import { useConvexMutation } from "@convex-dev/react-query"
import { PlusIcon, ShapesIcon, WalletCardsIcon } from "lucide-react"
import { api } from "../../../../convex/_generated/api"
import { DashboardPageActions } from "@/components/dashboard/dashboard-page-actions"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { DashboardPageSection } from "@/components/dashboard/dashboard-page-section"
import { RecurringEmptyState } from "@/components/dashboard/recurring/recurring-empty-state"
import { RecurringFormDialog } from "@/components/dashboard/recurring/recurring-form-dialog"
import { RecurringTable } from "@/components/dashboard/recurring/recurring-table"
import type {
  RecurringFieldErrors,
  RecurringFormValues,
  RecurringRecord,
  RecurringType,
} from "@/components/dashboard/recurring/recurring-shared"
import {
  buildRecurringPayload,
  canConfirmRecurringItem,
  createRecurringDefaults,
  getCategoryOptions,
  resolveValidOption,
  validateRecurringValues,
} from "@/components/dashboard/recurring/recurring-shared"
import { GuidedEmptyState } from "@/components/guided-empty-state"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useRecurringPageData } from "@/hooks/use-money-dashboard"
import { formatDateLabel, todayInputValue } from "@/lib/money"
import { cn } from "@/lib/utils"

export function RecurringPage() {
  const { data } = useRecurringPageData()
  const createRecurringRule = useConvexMutation(
    api.recurring.createRecurringRule
  )
  const confirmRecurringRule = useConvexMutation(
    api.recurring.confirmRecurringRule
  )
  const [dialogOpen, setDialogOpen] = useState(false)
  const [values, setValues] = useState<RecurringFormValues>(
    createRecurringDefaults([], [], [])
  )
  const [errors, setErrors] = useState<RecurringFieldErrors>({})
  const [formError, setFormError] = useState("")
  const [pending, setPending] = useState(false)
  const [pendingRuleId, setPendingRuleId] = useState<
    RecurringRecord["_id"] | null
  >(null)

  if (!data) {
    return <section className="min-h-[calc(100vh-12rem)]" />
  }

  const accountOptions = data.accounts.active
  const incomeCategoryOptions = data.categories.activeIncome
  const expenseCategoryOptions = data.categories.activeExpense
  const recurringItems = data.recurring.all
  const currency = data.settings?.baseCurrency
  const today = todayInputValue()
  const hasRecurringItems = recurringItems.length > 0
  const hasCategoryOptions =
    incomeCategoryOptions.length > 0 || expenseCategoryOptions.length > 0
  const createDisabled = accountOptions.length === 0 || !hasCategoryOptions
  const activeIncomeCount = recurringItems.filter(
    (item) => item.type === "income"
  ).length
  const activeExpenseCount = recurringItems.length - activeIncomeCount
  const dueNowCount = recurringItems.filter((item) =>
    canConfirmRecurringItem(item, today)
  ).length
  const nextItem = recurringItems[0] ?? null

  const resetDialogState = () => {
    setErrors({})
    setFormError("")
    setPending(false)
  }

  const openCreateDialog = () => {
    setValues(
      createRecurringDefaults(
        accountOptions,
        incomeCategoryOptions,
        expenseCategoryOptions
      )
    )
    resetDialogState()
    setDialogOpen(true)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)

    if (!open) {
      resetDialogState()
    }
  }

  const handleValueChange = (
    name: keyof RecurringFormValues,
    value: string
  ) => {
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

  const handleTypeChange = (value: RecurringType) => {
    const nextCategoryOptions = getCategoryOptions(
      value,
      incomeCategoryOptions,
      expenseCategoryOptions
    )

    setValues((current) => ({
      ...current,
      type: value,
      categoryId: resolveValidOption(current.categoryId, nextCategoryOptions),
    }))
    setErrors((current) => ({
      ...current,
      categoryId: undefined,
    }))
    setFormError("")
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors = validateRecurringValues(values, {
      accountOptions,
      incomeCategoryOptions,
      expenseCategoryOptions,
    })
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setPending(true)
    setFormError("")

    try {
      await createRecurringRule(
        buildRecurringPayload(values, {
          accountOptions,
          incomeCategoryOptions,
          expenseCategoryOptions,
        })
      )
      setDialogOpen(false)
      setValues(
        createRecurringDefaults(
          accountOptions,
          incomeCategoryOptions,
          expenseCategoryOptions
        )
      )
      setErrors({})
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Could not save this recurring item."
      )
    } finally {
      setPending(false)
    }
  }

  const handleConfirm = async (ruleId: RecurringRecord["_id"]) => {
    setPendingRuleId(ruleId)

    try {
      await confirmRecurringRule({ ruleId })
    } finally {
      setPendingRuleId(null)
    }
  }

  return (
    <DashboardPageSection>
      <DashboardPageHeader
        title="Recurring"
        action={
          <DashboardPageActions>
            <Button onClick={openCreateDialog} disabled={createDisabled}>
              Add recurring item
              <PlusIcon />
            </Button>
          </DashboardPageActions>
        }
      />

      {hasRecurringItems ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <RecurringSummaryCard
              title="Active schedules"
              value={recurringItems.length.toString()}
              description={`${activeExpenseCount} expense item${activeExpenseCount === 1 ? "" : "s"}, ${activeIncomeCount} income item${activeIncomeCount === 1 ? "" : "s"}`}
            />
            <RecurringSummaryCard
              title="Due now"
              value={dueNowCount.toString()}
              description={`${data.recurring.overdue.length} overdue, ${data.recurring.dueSoon.length} due within 7 days`}
              toneClassName={dueNowCount > 0 ? "text-destructive" : undefined}
            />
            <RecurringSummaryCard
              title="Next scheduled"
              value={
                nextItem ? formatDateLabel(nextItem.nextDueDate) : "Nothing due"
              }
              description={
                nextItem
                  ? `${nextItem.description} • ${nextItem.frequency}`
                  : "No active recurring items"
              }
            />
          </div>

          <RecurringTable
            recurringItems={recurringItems}
            currency={currency}
            pendingRuleId={pendingRuleId}
            today={today}
            onConfirm={handleConfirm}
          />
        </>
      ) : accountOptions.length === 0 ? (
        <GuidedEmptyState
          title="Add an account before scheduling recurring items"
          description="Recurring bills and paychecks need an account so every future money movement points somewhere real."
          ctaLabel="Create an account"
          ctaTo="/dashboard/accounts"
          icon={<WalletCardsIcon className="size-5" />}
        />
      ) : !hasCategoryOptions ? (
        <GuidedEmptyState
          title="Create a category before adding recurring items"
          description="Recurring rules need income or expense categories so upcoming paychecks and bills stay organized when you confirm them."
          ctaLabel="Manage categories"
          ctaTo="/dashboard/settings"
          icon={<ShapesIcon className="size-5" />}
        />
      ) : (
        <RecurringEmptyState onAddRecurring={openCreateDialog} />
      )}

      <RecurringFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        onSubmit={handleSubmit}
        values={values}
        errors={errors}
        formError={formError}
        pending={pending}
        accountOptions={accountOptions}
        incomeCategoryOptions={incomeCategoryOptions}
        expenseCategoryOptions={expenseCategoryOptions}
        onValueChange={handleValueChange}
        onTypeChange={handleTypeChange}
      />
    </DashboardPageSection>
  )
}

function RecurringSummaryCard({
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
