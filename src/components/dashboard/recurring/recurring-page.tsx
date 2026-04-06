import { PlusIcon } from "lucide-react"
import { DashboardPageActions } from "@/components/dashboard/dashboard-page-actions"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { DashboardPageSection } from "@/components/dashboard/dashboard-page-section"
import { RecurringContent } from "@/components/dashboard/recurring/recurring-content"
import { RecurringFormDialog } from "@/components/dashboard/recurring/recurring-form-dialog"
import { useRecurringDialog } from "@/components/dashboard/recurring/use-recurring-dialog"
import { Button } from "@/components/ui/button"
import { useRecurringPageData } from "@/hooks/use-money-dashboard"
import { todayInputValue } from "@/lib/money"
import { useDateFilter } from "@/hooks/use-date-filter"

export function RecurringPage() {
  const { hasDateFilter, filterLabel, dateRange } = useDateFilter()
  const { data } = useRecurringPageData()
  const {
    dialog,
    pendingRuleId,
    accountOptions,
    incomeCategoryOptions,
    expenseCategoryOptions,
    handleClearDateFilter,
    handleTypeChange,
    handleConfirm,
    handleEdit,
    handleToggle,
    handleDialogClose,
  } = useRecurringDialog(data)

  const isLoading = !data
  const recurringItems = data?.recurring.all ?? []
  const visibleRecurringItems = recurringItems.filter((item) => {
    if (dateRange.startDate && item.nextDueDate < dateRange.startDate)
      return false
    if (dateRange.endDate && item.nextDueDate > dateRange.endDate) return false
    return true
  })
  const currency = data?.settings?.baseCurrency
  const today = todayInputValue()
  const hasRecurringItems = !isLoading && recurringItems.length > 0
  const hasCategoryOptions =
    incomeCategoryOptions.length > 0 || expenseCategoryOptions.length > 0
  const createDisabled =
    isLoading || accountOptions.length === 0 || !hasCategoryOptions

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
      <RecurringContent
        isLoading={isLoading}
        hasRecurringItems={hasRecurringItems}
        recurringItems={recurringItems}
        overdueCount={data?.recurring.overdue.length ?? 0}
        dueSoonCount={data?.recurring.dueSoon.length ?? 0}
        visibleRecurringItems={visibleRecurringItems}
        currency={currency}
        pendingRuleId={pendingRuleId}
        today={today}
        hasDateFilter={hasDateFilter}
        filterLabel={filterLabel}
        hasAccounts={accountOptions.length > 0}
        hasCategoryOptions={hasCategoryOptions}
        onConfirm={handleConfirm}
        onEdit={handleEdit}
        onToggle={handleToggle}
        onClearDateFilter={handleClearDateFilter}
        onAddRecurring={dialog.openCreateDialog}
      />
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
