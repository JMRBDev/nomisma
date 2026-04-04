import { useMemo, useState } from "react"
import { FilterIcon, PlusIcon, ReceiptTextIcon } from "lucide-react"
import type { TransactionFilterValues } from "@/components/money/transactions-shared"
import {
  DashboardPageHeader,
  GuidedEmptyState,
  SectionCard,
} from "@/components/money/money-ui"
import { TransactionFiltersSheet } from "@/components/money/transaction-filters-sheet"
import { TransactionFormDialog } from "@/components/money/transaction-form-dialog"
import { TransactionsEmptyState } from "@/components/money/transactions-empty-state"
import {
  DEFAULT_FILTER_VALUES,
  countActiveFilters,
  filterTransactions,
} from "@/components/money/transactions-shared"
import { TransactionsTable } from "@/components/money/transactions-table"
import { useTransactionEditor } from "@/components/money/use-transaction-editor"
import { Button } from "@/components/ui/button"
import { useTransactionsPageData } from "@/hooks/use-money-dashboard"

export function TransactionsPage() {
  const { data } = useTransactionsPageData()
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
  })

  const filteredTransactions = useMemo(
    () => filterTransactions(data?.transactions ?? [], filters),
    [data?.transactions, filters]
  )
  const activeFilterCount = useMemo(
    () => countActiveFilters(filters),
    [filters]
  )

  if (!data) {
    return <section className="min-h-[calc(100vh-12rem)]" />
  }

  const handleFilterChange = (
    name: keyof TransactionFilterValues,
    value: string
  ) => {
    setFilters((current) => ({
      ...current,
      [name]: value,
    }))
  }

  return (
    <section className="space-y-6">
      <DashboardPageHeader
        title="Transactions"
        action={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setFiltersSheetOpen((open) => !open)}
              variant={activeFilterCount > 0 ? "secondary" : "outline"}
            >
              {activeFilterCount || null}
              <FilterIcon />
            </Button>

            <Button
              onClick={transactionEditor.openCreateDialog}
              disabled={accountOptions.length === 0}
            >
              Add transaction
              <PlusIcon />
            </Button>
          </div>
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
        <SectionCard
          title="Activity"
          description="Review every posted or planned money movement without jumping between screens."
        >
          {filteredTransactions.length === 0 ? (
            <TransactionsEmptyState
              hasFilters={activeFilterCount > 0}
              onAddTransaction={transactionEditor.openCreateDialog}
              onClearFilters={() => setFilters(DEFAULT_FILTER_VALUES)}
            />
          ) : (
            <TransactionsTable
              transactions={filteredTransactions}
              currency={data.settings?.baseCurrency}
              onEdit={transactionEditor.openEditDialog}
              onDelete={transactionEditor.deleteTransaction}
            />
          )}
        </SectionCard>
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
    </section>
  )
}
