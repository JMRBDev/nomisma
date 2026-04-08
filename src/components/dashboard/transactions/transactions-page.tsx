import { useSuspenseQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { useConvexMutation } from "@convex-dev/react-query"
import { PlusIcon } from "lucide-react"
import { api } from "../../../../convex/_generated/api"
import type { TransactionFilterValues, TransactionRecord } from "@/components/dashboard/transactions/transactions-shared"
import { DEFAULT_FILTER_VALUES, countActiveFilters } from "@/components/dashboard/transactions/transactions-shared"
import { useTransactionSearchFilter } from "@/components/dashboard/transactions/transactions-page-shared"
import { DashboardFilterButton } from "@/components/dashboard/dashboard-filter-button"
import { DashboardPageActions } from "@/components/dashboard/dashboard-page-actions"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { DashboardPageSection } from "@/components/dashboard/dashboard-page-section"
import { TransactionFiltersSheet } from "@/components/dashboard/transactions/transaction-filters-sheet"
import { TransactionFormDialog } from "@/components/dashboard/transactions/transaction-form-dialog"
import { TransactionsContent } from "@/components/dashboard/transactions/transactions-content"
import { CategoriesSection } from "@/components/dashboard/transactions/categories-section"
import { AccountReferenceDialog } from "@/components/dashboard/account-reference-dialog"
import { CategoryReferenceDialog } from "@/components/dashboard/category-reference-dialog"
import { useTransactionEditor } from "@/hooks/use-transaction-editor"
import { Button } from "@/components/ui/button"
import { useDateFilter } from "@/hooks/use-date-filter"
import { useDeleteConfirmation } from "@/hooks/use-delete-confirmation"
import { useTransactionReferenceHandlers } from "@/hooks/use-transaction-reference-handlers"
import { getTransactionsPageDataQueryOptions } from "@/lib/dashboard-query-options"

export function TransactionsPage() {
  const { hasDateFilter, filterLabel, dateRange } = useDateFilter()
  const { data } = useSuspenseQuery(getTransactionsPageDataQueryOptions())
  const createTx = useConvexMutation(api.transactions.createTransaction)
  const updateTx = useConvexMutation(api.transactions.updateTransaction)
  const deleteTx = useConvexMutation(api.transactions.deleteTransaction)
  const [filtersSheetOpen, setFiltersSheetOpen] = useState(false)
  const [filters, setFilters] = useState(DEFAULT_FILTER_VALUES)
  const accountOptions = data.accounts.active
  const allAccountOptions = [...data.accounts.active, ...data.accounts.archived]
  const allCategoryOptions = data.categories.all
  const incomeCategoryOptions = data.categories.activeIncome
  const expenseCategoryOptions = data.categories.activeExpense
  const transactionEditor = useTransactionEditor({
    accountOptions,
    incomeCategoryOptions,
    expenseCategoryOptions,
    onCreateTransaction: (payload) => createTx(payload),
    onUpdateTransaction: (id, payload) =>
      updateTx({ transactionId: id, ...payload }),
    onDeleteTransaction: (id) => deleteTx({ transactionId: id }),
  })
  const transactionReferences = useTransactionReferenceHandlers(transactionEditor)
  const deleteConfirmation = useDeleteConfirmation<TransactionRecord["_id"]>({
    onConfirm: (id) => deleteTx({ transactionId: id }),
    errorMessage: "Unable to delete the transaction.",
  })
  const searchFilter = useTransactionSearchFilter({
    dateRange,
    filters,
    hasDateFilter,
    transactions: data.transactions,
  })
  const filterCount = useMemo(() => countActiveFilters(filters), [filters])
  const hasActiveFilters = filterCount > 0 || searchFilter.hasSearchFilters
  const handleFilterChange = (
    name: keyof TransactionFilterValues,
    value: string
  ) => setFilters((current) => ({ ...current, [name]: value }))
  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTER_VALUES)
    searchFilter.clearSearchFilters()
  }

  return (
    <DashboardPageSection>
      <DashboardPageHeader
        title="Transactions"
        action={
          <DashboardPageActions>
            <DashboardFilterButton
              activeCount={filterCount}
              onClick={() => setFiltersSheetOpen((open) => !open)}
            />
            <Button onClick={() => transactionEditor.openCreateDialog()}>
              Add transaction
              <PlusIcon />
            </Button>
          </DashboardPageActions>
        }
      />
      <TransactionsContent
        accountOptions={accountOptions}
        filteredTransactions={searchFilter.filteredTransactions}
        currency={data.settings?.baseCurrency}
        hasActiveFilters={hasActiveFilters}
        hasDateFilter={hasDateFilter}
        filterLabel={filterLabel}
        onClearFilters={handleClearFilters}
        onAddTransaction={transactionEditor.openCreateDialog}
        onEditTransaction={transactionEditor.openEditDialog}
        onDeleteTransaction={deleteConfirmation.requestDelete}
        deleteDialogProps={deleteConfirmation.dialogProps}
      />
      <CategoriesSection data={data} />
      <TransactionFiltersSheet
        open={filtersSheetOpen}
        onOpenChange={setFiltersSheetOpen}
        values={filters}
        onChange={handleFilterChange}
        onReset={() => setFilters(DEFAULT_FILTER_VALUES)}
        activeFilterCount={filterCount}
        matchCount={searchFilter.filteredTransactions.length}
        accountOptions={accountOptions}
        categoryOptions={allCategoryOptions}
      />
      <TransactionFormDialog
        open={transactionEditor.dialogOpen}
        onOpenChange={transactionEditor.handleDialogOpenChange}
        onSubmit={transactionEditor.handleSubmit}
        onStartNew={transactionEditor.openCreateDialog}
        editing={transactionEditor.isEditing}
        values={transactionEditor.values}
        errors={transactionEditor.errors}
        formError={transactionEditor.formError}
        pending={transactionEditor.pending}
        accountOptions={accountOptions}
        allAccountOptions={allAccountOptions}
        incomeCategoryOptions={incomeCategoryOptions}
        expenseCategoryOptions={expenseCategoryOptions}
        allCategoryOptions={allCategoryOptions}
        onValueChange={transactionEditor.handleValueChange}
        onTypeChange={transactionEditor.handleTypeChange}
        onAccountChange={transactionEditor.handleAccountChange}
        onCreateAccount={transactionReferences.handleCreateAccount}
        onUnarchiveAccount={transactionReferences.handleUnarchiveAccount}
        onCreateCategory={transactionReferences.handleCreateCategory}
        onUnarchiveCategory={transactionReferences.handleUnarchiveCategory}
      />
      <AccountReferenceDialog
        accountActions={transactionReferences.accountActions}
        description="Save this account and it will be selected in the transaction form."
      />
      <CategoryReferenceDialog
        categoryActions={transactionReferences.categoryActions}
        description="Save this category and it will be selected in the transaction form."
      />
    </DashboardPageSection>
  )
}
