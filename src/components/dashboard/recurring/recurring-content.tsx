import { FunnelIcon, ShapesIcon, WalletCardsIcon } from "lucide-react"
import type { RecurringRecord } from "@/components/dashboard/recurring/recurring-shared"
import { FilteredResultsEmptyState } from "@/components/filtered-results-empty-state"
import { PrerequisiteEmptyState } from "@/components/prerequisite-empty-state"
import { RecurringEmptyState } from "@/components/dashboard/recurring/recurring-empty-state"
import { RecurringSummaryCards } from "@/components/dashboard/recurring/recurring-summary-cards"
import { RecurringTable } from "@/components/dashboard/recurring/recurring-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { m } from "@/paraglide/messages"

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
                title={m.recurring_empty_date_range_title()}
                description={m.recurring_empty_date_range_description({
                  filter: filterLabel,
                })}
                action={
                  <Button variant="outline" onClick={onClearDateFilter}>
                    {m.recurring_clear_date_filter()}
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
        title={m.recurring_prerequisite_account_title()}
        description={m.recurring_prerequisite_account_description()}
        ctaLabel={m.accounts_add_account()}
        ctaTo="/dashboard/accounts"
      />
    )
  }

  if (!hasCategoryOptions) {
    return (
      <PrerequisiteEmptyState
        icon={<ShapesIcon className="size-5" />}
        title={m.recurring_prerequisite_category_title()}
        description={m.recurring_prerequisite_category_description()}
        ctaLabel={m.recurring_manage_categories()}
        ctaTo="/dashboard/settings"
      />
    )
  }

  return <RecurringEmptyState onAddRecurring={onAddRecurring} />
}
