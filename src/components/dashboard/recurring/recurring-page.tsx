import { useRef, useState } from "react"
import { useConvexMutation } from "@convex-dev/react-query"
import { useNavigate } from "@tanstack/react-router"
import { FunnelIcon, PlusIcon, ShapesIcon, WalletCardsIcon } from "lucide-react"
import { api } from "../../../../convex/_generated/api"
import type { Id } from "../../../../convex/_generated/dataModel"
import type {
  RecurringRecord,
  RecurringType,
} from "@/components/dashboard/recurring/recurring-shared"
import { DashboardPageActions } from "@/components/dashboard/dashboard-page-actions"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { DashboardPageSection } from "@/components/dashboard/dashboard-page-section"
import { DashboardSummaryCard } from "@/components/dashboard/dashboard-summary-card"
import { FilteredResultsEmptyState } from "@/components/filtered-results-empty-state"
import { RecurringEmptyState } from "@/components/dashboard/recurring/recurring-empty-state"
import { RecurringFormDialog } from "@/components/dashboard/recurring/recurring-form-dialog"
import {
  buildRecurringPayload,
  canConfirmRecurringItem,
  createRecurringDefaults,
  createRecurringFormValues,
  validateRecurringValues,
} from "@/components/dashboard/recurring/recurring-shared"
import { RecurringTable } from "@/components/dashboard/recurring/recurring-table"
import { GuidedEmptyState } from "@/components/guided-empty-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useFormDialog } from "@/hooks/use-form-dialog"
import { useRecurringPageData } from "@/hooks/use-money-dashboard"
import { formatDateLabel, todayInputValue } from "@/lib/money"
import { useDateFilter } from "@/hooks/use-date-filter"
import { resolveCategoryOnTypeChange } from "@/lib/form-helpers"

export function RecurringPage() {
  const navigate = useNavigate()
  const { hasDateFilter, filterLabel, dateRange } = useDateFilter()
  const { data } = useRecurringPageData()
  const createRecurringRule = useConvexMutation(
    api.recurring.createRecurringRule
  )
  const updateRecurringRule = useConvexMutation(
    api.recurring.updateRecurringRule
  )
  const toggleRecurringRule = useConvexMutation(
    api.recurring.toggleRecurringRule
  )
  const confirmRecurringRule = useConvexMutation(
    api.recurring.confirmRecurringRule
  )
  const editingRuleIdRef = useRef<Id<"recurringRules"> | null>(null)
  const [pendingRuleId, setPendingRuleId] = useState<
    RecurringRecord["_id"] | null
  >(null)

  const getEditorOptions = () => ({
    accountOptions: data?.accounts.active ?? [],
    incomeCategoryOptions: data?.categories.activeIncome ?? [],
    expenseCategoryOptions: data?.categories.activeExpense ?? [],
  })

  const dialog = useFormDialog({
    createDefaults: () =>
      createRecurringDefaults(
        data?.accounts.active ?? [],
        data?.categories.activeIncome ?? [],
        data?.categories.activeExpense ?? []
      ),
    createFormValues: createRecurringFormValues,
    validate: (values) => validateRecurringValues(values, getEditorOptions()),
    onSubmit: async (values) => {
      if (!data) return
      const payload = buildRecurringPayload(values, {
        accountOptions: data.accounts.active,
        incomeCategoryOptions: data.categories.activeIncome,
        expenseCategoryOptions: data.categories.activeExpense,
      })
      const editingId = editingRuleIdRef.current
      if (editingId) {
        await updateRecurringRule({ ruleId: editingId, ...payload })
      } else {
        await createRecurringRule(payload)
      }
    },
  })

  const isLoading = !data
  const accountOptions = data?.accounts.active ?? []
  const incomeCategoryOptions = data?.categories.activeIncome ?? []
  const expenseCategoryOptions = data?.categories.activeExpense ?? []
  const recurringItems = data?.recurring.all ?? []
  const visibleRecurringItems = recurringItems.filter((item) => {
    if (dateRange.startDate && item.nextDueDate < dateRange.startDate) {
      return false
    }

    if (dateRange.endDate && item.nextDueDate > dateRange.endDate) {
      return false
    }

    return true
  })
  const currency = data?.settings?.baseCurrency
  const today = todayInputValue()
  const hasRecurringItems = !isLoading && recurringItems.length > 0
  const hasCategoryOptions =
    incomeCategoryOptions.length > 0 || expenseCategoryOptions.length > 0
  const createDisabled =
    isLoading || accountOptions.length === 0 || !hasCategoryOptions
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

  const handleTypeChange = (value: RecurringType) => {
    dialog.setValues((current) => ({
      ...current,
      type: value,
      categoryId: resolveCategoryOnTypeChange(
        current.categoryId,
        value,
        incomeCategoryOptions,
        expenseCategoryOptions
      ),
    }))
  }

  const handleConfirm = async (ruleId: RecurringRecord["_id"]) => {
    setPendingRuleId(ruleId)

    try {
      await confirmRecurringRule({ ruleId })
    } finally {
      setPendingRuleId(null)
    }
  }

  const handleEdit = (rule: RecurringRecord) => {
    editingRuleIdRef.current = rule._id
    dialog.openEditDialog(rule)
  }

  const handleToggle = async (
    ruleId: RecurringRecord["_id"],
    active: boolean
  ) => {
    await toggleRecurringRule({ ruleId, active })
  }

  const handleDialogClose = (open: boolean) => {
    dialog.handleDialogOpenChange(open)
    if (!open) editingRuleIdRef.current = null
  }

  return (
    <DashboardPageSection>
      <DashboardPageHeader
        title="Recurring"
        action={
          <DashboardPageActions>
            <Button onClick={dialog.openCreateDialog} disabled={createDisabled}>
              Add recurring item
              <PlusIcon />
            </Button>
          </DashboardPageActions>
        }
      />

      {isLoading || hasRecurringItems ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <DashboardSummaryCard
              loading={isLoading}
              title="Active schedules"
              value={recurringItems.length.toString()}
              description={`${activeExpenseCount} expense item${activeExpenseCount === 1 ? "" : "s"}, ${activeIncomeCount} income item${activeIncomeCount === 1 ? "" : "s"}`}
            />
            <DashboardSummaryCard
              loading={isLoading}
              title="Due now"
              value={dueNowCount.toString()}
              description={
                data
                  ? `${data.recurring.overdue.length} overdue, ${data.recurring.dueSoon.length} due within 7 days`
                  : ""
              }
              toneClassName={dueNowCount > 0 ? "text-destructive" : undefined}
            />
            <DashboardSummaryCard
              loading={isLoading}
              title="Next scheduled"
              value={nextItem ? formatDateLabel(nextItem.nextDueDate) : ""}
              description={
                nextItem
                  ? `${nextItem.description} • ${nextItem.frequency}`
                  : ""
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
              ) : visibleRecurringItems.length > 0 ? (
                <RecurringTable
                  recurringItems={visibleRecurringItems}
                  currency={currency}
                  pendingRuleId={pendingRuleId}
                  today={today}
                  onConfirm={handleConfirm}
                  onEdit={handleEdit}
                  onToggle={handleToggle}
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
        <RecurringEmptyState onAddRecurring={dialog.openCreateDialog} />
      )}

      <RecurringFormDialog
        open={dialog.dialogOpen}
        onOpenChange={handleDialogClose}
        onSubmit={dialog.handleSubmit}
        values={dialog.values}
        errors={dialog.errors}
        formError={dialog.formError}
        pending={dialog.pending}
        editing={dialog.isEditing}
        accountOptions={accountOptions}
        incomeCategoryOptions={incomeCategoryOptions}
        expenseCategoryOptions={expenseCategoryOptions}
        onValueChange={dialog.handleValueChange}
        onTypeChange={handleTypeChange}
      />
    </DashboardPageSection>
  )
}
