import { useMemo, useState } from "react"
import { useConvexMutation } from "@convex-dev/react-query"
import { PlusIcon } from "lucide-react"
import { api } from "../../../../convex/_generated/api"
import type {
  TransactionFilterValues,
  TransactionRecord,
} from "@/components/dashboard/transactions/transactions-shared"
import {
  DEFAULT_FILTER_VALUES,
  countActiveFilters,
} from "@/components/dashboard/transactions/transactions-shared"
import { useTransactionSearchFilter } from "@/components/dashboard/transactions/transactions-page-shared"
import { DashboardFilterButton } from "@/components/dashboard/dashboard-filter-button"
import { DashboardPageActions } from "@/components/dashboard/dashboard-page-actions"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { DashboardPageSection } from "@/components/dashboard/dashboard-page-section"
import { TransactionFiltersSheet } from "@/components/dashboard/transactions/transaction-filters-sheet"
import { TransactionFormDialog } from "@/components/dashboard/transactions/transaction-form-dialog"
import { TransactionsContent } from "@/components/dashboard/transactions/transactions-content"
import { CategoriesSection } from "@/components/dashboard/transactions/categories-section"
import { useTransactionEditor } from "@/hooks/use-transaction-editor"
import { Button } from "@/components/ui/button"
import { useTransactionsPageData } from "@/hooks/use-money-dashboard"
import { useDateFilter } from "@/hooks/use-date-filter"
import { useDeleteConfirmation } from "@/hooks/use-delete-confirmation"

export function TransactionsPage() {
  const { hasDateFilter, filterLabel, dateRange } = useDateFilter()
  const { data } = useTransactionsPageData()
  const createTx = useConvexMutation(api.transactions.createTransaction)
  const updateTx = useConvexMutation(api.transactions.updateTransaction)
  const deleteTx = useConvexMutation(api.transactions.deleteTransaction)
  const [filtersSheetOpen, setFiltersSheetOpen] = useState(false)
  const [filters, setFilters] = useState(DEFAULT_FILTER_VALUES)
  const accountOptions = data?.accounts.active ?? []
  const allCategoryOptions = data?.categories.all ?? []
  const incomeCategoryOptions = data?.categories.activeIncome ?? []
  const expenseCategoryOptions = data?.categories.activeExpense ?? []
  const transactionEditor = useTransactionEditor({
    accountOptions,
    incomeCategoryOptions,
    expenseCategoryOptions,
    onCreateTransaction: (payload) => createTx(payload),
    onUpdateTransaction: (id, payload) =>
      updateTx({ transactionId: id, ...payload }),
    onDeleteTransaction: (id) => deleteTx({ transactionId: id }),
  })
  const deleteConfirmation = useDeleteConfirmation<TransactionRecord["_id"]>({
    onConfirm: (id) => deleteTx({ transactionId: id }),
    errorMessage: "Unable to delete the transaction.",
  })
  const searchFilter = useTransactionSearchFilter({
    dateRange,
    filters,
    hasDateFilter,
    transactions: data?.transactions ?? [],
  })
  const filterCount = useMemo(() => countActiveFilters(filters), [filters])
  const hasActiveFilters = filterCount > 0 || searchFilter.hasSearchFilters
  const isLoading = !data
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
            <Button
              onClick={transactionEditor.openCreateDialog}
              disabled={isLoading || accountOptions.length === 0}
            >
              Add transaction
              <PlusIcon />
            </Button>
          </DashboardPageActions>
        }
      />
      <TransactionsContent
        isLoading={isLoading}
        accountOptions={accountOptions}
        filteredTransactions={searchFilter.filteredTransactions}
        currency={data?.settings?.baseCurrency}
        hasActiveFilters={hasActiveFilters}
        hasDateFilter={hasDateFilter}
        filterLabel={filterLabel}
        onClearFilters={handleClearFilters}
        onAddTransaction={transactionEditor.openCreateDialog}
        onEditTransaction={transactionEditor.openEditDialog}
        onDeleteTransaction={deleteConfirmation.requestDelete}
        deleteDialogProps={deleteConfirmation.dialogProps}
      />
      <CategoriesSection isLoading={isLoading} data={data} />
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
        incomeCategoryOptions={incomeCategoryOptions}
        expenseCategoryOptions={expenseCategoryOptions}
        onValueChange={transactionEditor.handleValueChange}
        onTypeChange={transactionEditor.handleTypeChange}
        onAccountChange={transactionEditor.handleAccountChange}
      />
    </DashboardPageSection>
  )
}
