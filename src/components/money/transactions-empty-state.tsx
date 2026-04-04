import { PlusIcon, ReceiptTextIcon } from "lucide-react"
import { GuidedEmptyState } from "@/components/money/money-ui"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export function TransactionsEmptyState({
  hasFilters,
  onAddTransaction,
  onClearFilters,
}: {
  hasFilters: boolean
  onAddTransaction: () => void
  onClearFilters: () => void
}) {
  if (hasFilters) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ReceiptTextIcon />
          </EmptyMedia>
          <EmptyTitle>No transactions match these filters</EmptyTitle>
          <EmptyDescription>
            Clear the current filters or adjust the date range to bring results
            back.
          </EmptyDescription>
        </EmptyHeader>
        <Button variant="outline" onClick={onClearFilters}>
          Clear filters
        </Button>
      </Empty>
    )
  }

  return (
    <GuidedEmptyState
      title="No transactions yet"
      description="Add your first income, expense, or transfer to start building a reliable activity history."
      icon={<ReceiptTextIcon className="size-5" />}
      action={
        <Button onClick={onAddTransaction}>
          Add transaction
          <PlusIcon />
        </Button>
      }
    />
  )
}
