import { useMemo, useState } from "react"
import { useConvexMutation } from "@convex-dev/react-query"
import { PlusIcon, ReceiptTextIcon } from "lucide-react"
import { api } from "../../../../convex/_generated/api"
import type { TransactionFilterValues } from "@/components/dashboard/transactions/transactions-shared"
import { DashboardFilterButton } from "@/components/dashboard/dashboard-filter-button"
import { DashboardPageActions } from "@/components/dashboard/dashboard-page-actions"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { DashboardPageSection } from "@/components/dashboard/dashboard-page-section"
import { GuidedEmptyState } from "@/components/guided-empty-state"
import { TransactionFiltersSheet } from "@/components/dashboard/transactions/transaction-filters-sheet"
import { TransactionFormDialog } from "@/components/dashboard/transactions/transaction-form-dialog"
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

export function TransactionsPage() {
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
    () => filterTransactions(data?.transactions ?? [], filters),
    [data?.transactions, filters]
  )
  const activeFilterCount = useMemo(
    () => countActiveFilters(filters),
    [filters]
  )

  const handleFilterChange = (
    name: keyof TransactionFilterValues,
    value: string
  ) => {
    setFilters((current) => ({
      ...current,
      [name]: value,
    }))
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
        <>
          {filteredTransactions.length === 0 ? (
            <TransactionsEmptyState
              hasFilters={activeFilterCount > 0}
              onAddTransaction={transactionEditor.openCreateDialog}
              onClearFilters={() => setFilters(DEFAULT_FILTER_VALUES)}
              title="No transactions yet"
              description="Add your first income, expense, or transfer to start building a reliable activity history."
              actionLabel="Add transaction"
            />
          ) : (
            <TransactionsTable
              transactions={filteredTransactions}
              currency={data.settings?.baseCurrency}
              onEdit={transactionEditor.openEditDialog}
              onDelete={transactionEditor.deleteTransaction}
            />
          )}
        </>
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
