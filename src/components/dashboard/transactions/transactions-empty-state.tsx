import { PlusIcon, ReceiptTextIcon } from "lucide-react"
import { FilteredResultsEmptyState } from "@/components/filtered-results-empty-state"
import { GuidedEmptyState } from "@/components/guided-empty-state"
import { Button } from "@/components/ui/button"

export function TransactionsEmptyState({
  hasFilters,
  onAddTransaction,
  onClearFilters,
  title = "No transactions yet",
  description = "Add your first income, expense, or transfer to start building a reliable activity history.",
  actionLabel = "Add transaction",
}: {
  hasFilters: boolean
  onAddTransaction: () => void
  onClearFilters: () => void
  title?: string
  description?: string
  actionLabel?: string
}) {
  if (hasFilters) {
    return (
      <FilteredResultsEmptyState
        icon={ReceiptTextIcon}
        title="No transactions match these filters"
        description="Clear the current filters or adjust the date range to bring results back."
        action={
          <Button variant="outline" onClick={onClearFilters}>
            Clear filters
          </Button>
        }
      />
    )
  }

  return (
    <GuidedEmptyState
      title={title}
      description={description}
      icon={<ReceiptTextIcon className="size-5" />}
      action={
        <Button onClick={onAddTransaction}>
          {actionLabel}
          <PlusIcon />
        </Button>
      }
    />
  )
}
