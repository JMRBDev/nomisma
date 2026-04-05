import { useMemo, useState } from "react"
import { useConvexMutation } from "@convex-dev/react-query"
import { getRouteApi, useNavigate } from "@tanstack/react-router"
import {
  FunnelIcon,
  PlusIcon,
  ShapesIcon,
  WalletCardsIcon,
} from "lucide-react"
import { api } from "../../../../convex/_generated/api"
import type {
  RecurringFieldErrors,
  RecurringFormValues,
  RecurringRecord,
  RecurringType,
} from "@/components/dashboard/recurring/recurring-shared"
import { DashboardPageActions } from "@/components/dashboard/dashboard-page-actions"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { DashboardPageSection } from "@/components/dashboard/dashboard-page-section"
import { FilteredResultsEmptyState } from "@/components/filtered-results-empty-state"
import {
  getOverviewDateFilterLabel,
  getOverviewDateFilterQuery,
  hasOverviewDateFilter,
  resolveOverviewDateFilterValues,
} from "@/components/dashboard/overview/overview-date-filter"
import { RecurringEmptyState } from "@/components/dashboard/recurring/recurring-empty-state"
import { RecurringFormDialog } from "@/components/dashboard/recurring/recurring-form-dialog"
import {
  buildRecurringPayload,
  canConfirmRecurringItem,
  createRecurringDefaults,
  getCategoryOptions,
  resolveValidOption,
  validateRecurringValues,
} from "@/components/dashboard/recurring/recurring-shared"
import { RecurringTable } from "@/components/dashboard/recurring/recurring-table"
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

const dashboardRouteApi = getRouteApi("/_authenticated/dashboard")

export function RecurringPage() {
  const navigate = useNavigate()
  const search = dashboardRouteApi.useSearch()
  const dateFilter = resolveOverviewDateFilterValues(search)
  const hasDateFilter = hasOverviewDateFilter(dateFilter)
  const filterLabel = getOverviewDateFilterLabel(dateFilter)
  const dateRange = useMemo(
    () => getOverviewDateFilterQuery(dateFilter),
    [dateFilter.fromDate, dateFilter.toDate]
  )
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
  const visibleRecurringItems = recurringItems.filter((item) => {
    if (dateRange.startDate && item.nextDueDate < dateRange.startDate) {
      return false
    }

    if (dateRange.endDate && item.nextDueDate > dateRange.endDate) {
      return false
    }

    return true
  })
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
  const handleClearDateFilter = () => {
    void navigate({
      to: ".",
      search: (previous) => ({
        ...previous,
        from: undefined,
        to: undefined,
      }),
    })
  }

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
              value={formatDateLabel(nextItem.nextDueDate)}
              description={`${nextItem.description} • ${nextItem.frequency}`}
            />
          </div>

          <Card>
            <CardContent>
              {visibleRecurringItems.length > 0 ? (
                <RecurringTable
                  recurringItems={visibleRecurringItems}
                  currency={currency}
                  pendingRuleId={pendingRuleId}
                  today={today}
                  onConfirm={handleConfirm}
                />
              ) : hasDateFilter ? (
                <FilteredResultsEmptyState
                  icon={FunnelIcon}
                  title="No recurring items in this date range"
                  description={`Pick another day or range in the header to inspect recurring items due during ${filterLabel}.`}
                  action={
                    <Button variant="outline" onClick={handleClearDateFilter}>
                      Clear date filter
                    </Button>
                  }
                />
              ) : null}
            </CardContent>
          </Card>
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
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex items-end">
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
