import { ReceiptTextIcon } from "lucide-react"
import type { TransactionRecord } from "@/components/dashboard/transactions/transactions-shared"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import { FilteredResultsEmptyState } from "@/components/filtered-results-empty-state"
import { PrerequisiteEmptyState } from "@/components/prerequisite-empty-state"
import { TransactionsEmptyState } from "@/components/dashboard/transactions/transactions-empty-state"
import { TransactionsTable } from "@/components/dashboard/transactions/transactions-table"
import { t } from "@/lib/i18n"

type TransactionsContentProps = {
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
  if (accountOptions.length === 0) {
    return (
      <PrerequisiteEmptyState
        icon={<ReceiptTextIcon className="size-5" />}
        title={t("transactions_prerequisite_title")}
        description={t("transactions_prerequisite_description")}
        ctaLabel={t("accounts_add_account")}
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
                    ? t("transactions_empty_date_range_title")
                    : t("transactions_empty_filtered_title")
                }
                description={
                  hasDateFilter
                    ? t("transactions_empty_date_range_description", {
                        filter: filterLabel,
                      })
                    : t("transactions_empty_header_description")
                }
                action={
                  <Button variant="outline" onClick={onClearFilters}>
                    {t("common_clear_filters")}
                  </Button>
                }
              />
            ) : (
              <TransactionsEmptyState
                hasFilters={false}
                onAddTransaction={onAddTransaction}
                onClearFilters={onClearFilters}
                title={t("transactions_empty_title")}
                description={t("transactions_empty_description")}
                actionLabel={t("transactions_add_transaction")}
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
        title={t("transactions_delete_title")}
        description={t("transactions_delete_description")}
      />
    </>
  )
}
