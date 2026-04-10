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
import { m } from "@/lib/i18n-client"

export function TransactionsEmptyState({
  hasFilters,
  onAddTransaction,
  onClearFilters,
  title = m.transactions_empty_title(),
  description = m.transactions_empty_description(),
  actionLabel = m.transactions_add_transaction(),
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
        title={m.transactions_empty_filtered_title()}
        description={m.transactions_empty_filtered_description()}
        action={
          <Button variant="outline" onClick={onClearFilters}>
            {m.common_clear_filters()}
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
