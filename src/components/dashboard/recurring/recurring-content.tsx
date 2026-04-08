import { FunnelIcon, ShapesIcon, WalletCardsIcon } from "lucide-react"
import type { RecurringRecord } from "@/components/dashboard/recurring/recurring-shared"
import { FilteredResultsEmptyState } from "@/components/filtered-results-empty-state"
import { PrerequisiteEmptyState } from "@/components/prerequisite-empty-state"
import { RecurringEmptyState } from "@/components/dashboard/recurring/recurring-empty-state"
import { RecurringSummaryCards } from "@/components/dashboard/recurring/recurring-summary-cards"
import { RecurringTable } from "@/components/dashboard/recurring/recurring-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface RecurringContentProps {
  hasRecurringItems: boolean
  recurringItems: Array<RecurringRecord>
  overdueCount: number
  dueSoonCount: number
  visibleRecurringItems: Array<RecurringRecord>
  currency: string | undefined
  pendingRuleId: RecurringRecord["_id"] | null
  today: string
  hasDateFilter: boolean
  filterLabel: string
  hasAccounts: boolean
  hasCategoryOptions: boolean
  onConfirm: (ruleId: RecurringRecord["_id"]) => Promise<void>
  onEdit: (rule: RecurringRecord) => void
  onToggle: (ruleId: RecurringRecord["_id"], active: boolean) => Promise<void>
  onClearDateFilter: () => void
  onAddRecurring: () => void
}

export function RecurringContent({
  hasRecurringItems,
  recurringItems,
  overdueCount,
  dueSoonCount,
  visibleRecurringItems,
  currency,
  pendingRuleId,
  today,
  hasDateFilter,
  filterLabel,
  hasAccounts,
  hasCategoryOptions,
  onConfirm,
  onEdit,
  onToggle,
  onClearDateFilter,
  onAddRecurring,
}: RecurringContentProps) {
  if (hasRecurringItems) {
    return (
      <>
        <RecurringSummaryCards
          recurringItems={recurringItems}
          overdueCount={overdueCount}
          dueSoonCount={dueSoonCount}
          today={today}
        />
        <Card>
          <CardContent>
            {visibleRecurringItems.length > 0 ? (
              <RecurringTable
                recurringItems={visibleRecurringItems}
                currency={currency}
                pendingRuleId={pendingRuleId}
                today={today}
                onConfirm={onConfirm}
                onEdit={onEdit}
                onToggle={onToggle}
              />
            ) : hasDateFilter ? (
              <FilteredResultsEmptyState
                icon={FunnelIcon}
                title="No recurring items in this date range"
                description={`Pick another day or range in the header to inspect recurring items due during ${filterLabel}.`}
                action={
                  <Button variant="outline" onClick={onClearDateFilter}>
                    Clear date filter
                  </Button>
                }
              />
            ) : null}
          </CardContent>
        </Card>
      </>
    )
  }

  if (!hasAccounts) {
    return (
      <PrerequisiteEmptyState
        icon={<WalletCardsIcon className="size-5" />}
        title="Add an account before scheduling recurring items"
        description="Recurring bills and paychecks need an account so every future money movement points somewhere real."
        ctaLabel="Create an account"
        ctaTo="/dashboard/accounts"
      />
    )
  }

  if (!hasCategoryOptions) {
    return (
      <PrerequisiteEmptyState
        icon={<ShapesIcon className="size-5" />}
        title="Create a category before adding recurring items"
        description="Recurring rules need income or expense categories so upcoming paychecks and bills stay organized when you confirm them."
        ctaLabel="Manage categories"
        ctaTo="/dashboard/settings"
      />
    )
  }

  return <RecurringEmptyState onAddRecurring={onAddRecurring} />
}
