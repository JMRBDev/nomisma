import { useSuspenseQuery } from "@tanstack/react-query"
import { PlusIcon } from "lucide-react"
import { AccountReferenceDialog } from "@/components/dashboard/account-reference-dialog"
import { CategoryReferenceDialog } from "@/components/dashboard/category-reference-dialog"
import { DashboardPageActions } from "@/components/dashboard/dashboard-page-actions"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { DashboardPageSection } from "@/components/dashboard/dashboard-page-section"
import { RecurringContent } from "@/components/dashboard/recurring/recurring-content"
import { RecurringFormDialog } from "@/components/dashboard/recurring/recurring-form-dialog"
import { useRecurringDialog } from "@/components/dashboard/recurring/use-recurring-dialog"
import { Button } from "@/components/ui/button"
import { useAccountReferenceActions } from "@/hooks/use-account-reference-actions"
import { useCalendarContext } from "@/hooks/use-calendar-context"
import { useCategoryReferenceActions } from "@/hooks/use-category-reference-actions"
import { useDateFilter } from "@/hooks/use-date-filter"
import { getRecurringPageDataQueryOptions } from "@/lib/dashboard-query-options"
import { m } from "@/lib/i18n-client"

export function RecurringPage() {
  const { hasDateFilter, filterLabel, dateRange } = useDateFilter()
  const calendarContext = useCalendarContext()
  const { data } = useSuspenseQuery(
    getRecurringPageDataQueryOptions(calendarContext)
  )
  const {
    dialog,
    pendingRuleId,
    accountOptions,
    categoryOptions,
    handleClearDateFilter,
    handleTypeChange,
    handleConfirm,
    handleEdit,
    handleToggle,
    handleDialogClose,
  } = useRecurringDialog(data)
  const allAccountOptions = [...data.accounts.active, ...data.accounts.archived]
  const allCategoryOptions = data.categories.all
  const accountActions = useAccountReferenceActions()
  const categoryActions = useCategoryReferenceActions()

  const recurringItems = data.recurring.all
  const visibleRecurringItems = recurringItems.filter((item) => {
    if (dateRange.startDate && item.nextDueDate < dateRange.startDate)
      return false
    if (dateRange.endDate && item.nextDueDate > dateRange.endDate) return false
    return true
  })
  const currency = data.settings?.baseCurrency
  const today = calendarContext.today
  const hasRecurringItems = recurringItems.length > 0

  return (
    <DashboardPageSection>
      <DashboardPageHeader
        title={m.nav_recurring()}
        action={
          <DashboardPageActions>
            <Button onClick={() => dialog.openCreateDialog()}>
              {m.recurring_add_item()}
              <PlusIcon />
            </Button>
          </DashboardPageActions>
        }
      />
      <RecurringContent
        hasRecurringItems={hasRecurringItems}
        recurringItems={recurringItems}
        overdueCount={data.recurring.overdue.length}
        dueSoonCount={data.recurring.dueSoon.length}
        visibleRecurringItems={visibleRecurringItems}
        currency={currency}
        pendingRuleId={pendingRuleId}
        today={today}
        hasDateFilter={hasDateFilter}
        filterLabel={filterLabel}
        hasAccounts={accountOptions.length > 0}
        hasCategoryOptions={categoryOptions.length > 0}
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
        allAccountOptions={allAccountOptions}
        categoryOptions={categoryOptions}
        allCategoryOptions={allCategoryOptions}
        onValueChange={dialog.handleValueChange}
        onTypeChange={handleTypeChange}
        onCreateAccount={(name) =>
          accountActions.handleCreateAccount(name, (accountId) =>
            dialog.handleValueChange("accountId", accountId)
          )
        }
        onUnarchiveAccount={(accountId) =>
          accountActions.handleUnarchiveAccount(accountId, (nextAccountId) =>
            dialog.handleValueChange("accountId", nextAccountId)
          )
        }
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
      <AccountReferenceDialog
        accountActions={accountActions}
        description={m.recurring_account_reference_description()}
      />
      <CategoryReferenceDialog
        categoryActions={categoryActions}
        description={m.recurring_category_reference_description()}
      />
    </DashboardPageSection>
  )
}
