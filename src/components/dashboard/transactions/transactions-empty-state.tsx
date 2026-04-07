import { PlusIcon, ReceiptTextIcon } from "lucide-react"
import { FilteredResultsEmptyState } from "@/components/filtered-results-empty-state"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
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
    <Empty className="border-border/60 bg-card/70">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ReceiptTextIcon className="size-5" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onAddTransaction}>
          {actionLabel}
          <PlusIcon />
        </Button>
      </EmptyContent>
    </Empty>
  )
}
