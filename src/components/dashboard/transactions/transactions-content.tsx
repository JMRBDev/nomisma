import { ReceiptTextIcon } from "lucide-react"
import type { TransactionRecord } from "@/components/dashboard/transactions/transactions-shared"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import { FilteredResultsEmptyState } from "@/components/filtered-results-empty-state"
import { PrerequisiteEmptyState } from "@/components/prerequisite-empty-state"
import { TransactionsEmptyState } from "@/components/dashboard/transactions/transactions-empty-state"
import { TransactionsTable } from "@/components/dashboard/transactions/transactions-table"

type TransactionsContentProps = {
  isLoading: boolean
  accountOptions: Array<unknown>
  filteredTransactions: Array<TransactionRecord>
  currency: string | undefined
  hasActiveFilters: boolean
  hasDateFilter: boolean
  filterLabel: string
  onClearFilters: () => void
  onAddTransaction: () => void
  onEditTransaction: (transaction: TransactionRecord) => void
  onDeleteTransaction: (id: TransactionRecord["_id"]) => void
  deleteDialogProps: {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    pending: boolean
  }
}

export function TransactionsContent({
  isLoading,
  accountOptions,
  filteredTransactions,
  currency,
  hasActiveFilters,
  hasDateFilter,
  filterLabel,
  onClearFilters,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  deleteDialogProps,
}: TransactionsContentProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-3/4" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (accountOptions.length === 0) {
    return (
      <PrerequisiteEmptyState
        icon={<ReceiptTextIcon className="size-5" />}
        title="Add an account before recording transactions"
        description="Transactions need an account because every movement starts from somewhere real."
        ctaLabel="Create an account"
        ctaTo="/dashboard/accounts"
      />
    )
  }

  return (
    <>
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
                  <Button variant="outline" onClick={onClearFilters}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <TransactionsEmptyState
                hasFilters={false}
                onAddTransaction={onAddTransaction}
                onClearFilters={onClearFilters}
                title="No transactions yet"
                description="Add your first income, expense, or transfer to start building a reliable activity history."
                actionLabel="Add transaction"
              />
            )
          ) : (
            <TransactionsTable
              transactions={filteredTransactions}
              currency={currency}
              onEdit={onEditTransaction}
              onDelete={onDeleteTransaction}
            />
          )}
        </CardContent>
      </Card>
      <DeleteConfirmDialog
        {...deleteDialogProps}
        title="Delete this transaction?"
        description="This action cannot be undone. The transaction will be permanently removed."
      />
    </>
  )
}
