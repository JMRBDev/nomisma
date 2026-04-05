import { useMemo, useState } from "react"
import { useConvexMutation } from "@convex-dev/react-query"
import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { PlusIcon, ReceiptTextIcon } from "lucide-react"
import { api } from "../../../../convex/_generated/api"
import type { TransactionFilterValues } from "@/components/dashboard/transactions/transactions-shared"
import { DashboardFilterButton } from "@/components/dashboard/dashboard-filter-button"
import { DashboardPageActions } from "@/components/dashboard/dashboard-page-actions"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { DashboardPageSection } from "@/components/dashboard/dashboard-page-section"
import { FilteredResultsEmptyState } from "@/components/filtered-results-empty-state"
import { GuidedEmptyState } from "@/components/guided-empty-state"
import { TransactionFiltersSheet } from "@/components/dashboard/transactions/transaction-filters-sheet"
import { TransactionFormDialog } from "@/components/dashboard/transactions/transaction-form-dialog"
import {
  getOverviewDateFilterLabel,
  getOverviewDateFilterQuery,
  hasOverviewDateFilter,
  resolveOverviewDateFilterValues,
} from "@/components/dashboard/overview/overview-date-filter"
import {
  DEFAULT_FILTER_VALUES,
  countActiveFilters,
  filterTransactions,
} from "@/components/dashboard/transactions/transactions-shared"
import { TransactionsEmptyState } from "@/components/dashboard/transactions/transactions-empty-state"
import { TransactionsTable } from "@/components/dashboard/transactions/transactions-table"
import { useTransactionEditor } from "@/hooks/use-transaction-editor"
import { Button } from "@/components/ui/button"
import { useTransactionsPageData } from "@/hooks/use-money-dashboard"
import { Card, CardContent } from "@/components/ui/card"

const dashboardRouteApi = getRouteApi("/_authenticated/dashboard")

export function TransactionsPage() {
  const navigate = useNavigate()
  const search = dashboardRouteApi.useSearch()
  const dateFilter = resolveOverviewDateFilterValues(search)
  const hasDateFilter = hasOverviewDateFilter(dateFilter)
  const filterLabel = getOverviewDateFilterLabel(dateFilter)
  const dateRange = useMemo(
    () => getOverviewDateFilterQuery(dateFilter),
    [dateFilter.fromDate, dateFilter.toDate]
  )
  const { data } = useTransactionsPageData()
  const createTransaction = useConvexMutation(
    api.transactions.createTransaction
  )
  const updateTransaction = useConvexMutation(
    api.transactions.updateTransaction
  )
  const deleteTransaction = useConvexMutation(
    api.transactions.deleteTransaction
  )
  const [filtersSheetOpen, setFiltersSheetOpen] = useState(false)
  const [filters, setFilters] = useState<TransactionFilterValues>(
    DEFAULT_FILTER_VALUES
  )
  const accountOptions = data?.accounts.active ?? []
  const allCategoryOptions = data?.categories.all ?? []
  const incomeCategoryOptions = data?.categories.activeIncome ?? []
  const expenseCategoryOptions = data?.categories.activeExpense ?? []

  const transactionEditor = useTransactionEditor({
    accountOptions,
    incomeCategoryOptions,
    expenseCategoryOptions,
    onCreateTransaction: (payload) => createTransaction(payload),
    onUpdateTransaction: (transactionId, payload) =>
      updateTransaction({
        transactionId,
        ...payload,
      }),
    onDeleteTransaction: (transactionId) =>
      deleteTransaction({ transactionId }),
  })

  const filteredTransactions = useMemo(
    () =>
      filterTransactions(
        (data?.transactions ?? []).filter((transaction) => {
          if (dateRange.startDate && transaction.date < dateRange.startDate) {
            return false
          }

          if (dateRange.endDate && transaction.date > dateRange.endDate) {
            return false
          }

          return true
        }),
        filters
      ),
    [data?.transactions, dateRange.endDate, dateRange.startDate, filters]
  )
  const activeFilterCount = useMemo(
    () => countActiveFilters(filters),
    [filters]
  )
  const hasActiveFilters = activeFilterCount > 0 || hasDateFilter

  const handleFilterChange = (
    name: keyof TransactionFilterValues,
    value: string
  ) => {
    setFilters((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTER_VALUES)

    if (!hasDateFilter) {
      return
    }

    void navigate({
      to: ".",
      search: (previous) => ({
        ...previous,
        from: undefined,
        to: undefined,
      }),
    })
  }

  if (!data) {
    return <section className="min-h-[calc(100vh-12rem)]" />
  }

  return (
    <DashboardPageSection>
      <DashboardPageHeader
        title="Transactions"
        action={
          <DashboardPageActions>
            <DashboardFilterButton
              activeCount={activeFilterCount}
              onClick={() => setFiltersSheetOpen((open) => !open)}
            />
            <Button
              onClick={transactionEditor.openCreateDialog}
              disabled={accountOptions.length === 0}
            >
              Add transaction
              <PlusIcon />
            </Button>
          </DashboardPageActions>
        }
      />

      {accountOptions.length === 0 ? (
        <GuidedEmptyState
          title="Add an account before recording transactions"
          description="Transactions need an account because every movement starts from somewhere real."
          ctaLabel="Create an account"
          ctaTo="/dashboard/accounts"
          icon={<ReceiptTextIcon className="size-5" />}
        />
      ) : (
        <Card>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              hasActiveFilters ? (
                <FilteredResultsEmptyState
                  icon={ReceiptTextIcon}
                  title={
                    hasDateFilter
                      ? "No transactions in this date range"
                      : "No transactions match these filters"
                  }
                  description={
                    hasDateFilter
                      ? `Clear the current filters or adjust ${filterLabel} in the header to bring results back.`
                      : "Clear the current filters or adjust the header date range to bring results back."
                  }
                  action={
                    <Button variant="outline" onClick={handleClearFilters}>
                      Clear filters
                    </Button>
                  }
                />
              ) : (
                <TransactionsEmptyState
                  hasFilters={false}
                  onAddTransaction={transactionEditor.openCreateDialog}
                  onClearFilters={handleClearFilters}
                  title="No transactions yet"
                  description="Add your first income, expense, or transfer to start building a reliable activity history."
                  actionLabel="Add transaction"
                />
              )
            ) : (
              <TransactionsTable
                transactions={filteredTransactions}
                currency={data.settings?.baseCurrency}
                onEdit={transactionEditor.openEditDialog}
                onDelete={transactionEditor.deleteTransaction}
              />
            )}
          </CardContent>
        </Card>
      )}

      <TransactionFiltersSheet
        open={filtersSheetOpen}
        onOpenChange={setFiltersSheetOpen}
        values={filters}
        onChange={handleFilterChange}
        onReset={() => setFilters(DEFAULT_FILTER_VALUES)}
        activeFilterCount={activeFilterCount}
        matchCount={filteredTransactions.length}
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
