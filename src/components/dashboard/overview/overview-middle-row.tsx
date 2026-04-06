import { Link } from "@tanstack/react-router"
import {
  ArrowRightIcon,
  FunnelIcon,
  PiggyBankIcon,
  RepeatIcon,
} from "lucide-react"
import type { OverviewData } from "@/components/dashboard/overview/overview-shared"
import { FilteredResultsEmptyState } from "@/components/filtered-results-empty-state"
import { OverviewPanelCard } from "@/components/dashboard/overview/overview-panel-card"
import { OverviewTopSpendingCategoriesList } from "@/components/dashboard/overview/overview-top-spending-categories-list"
import { OverviewUpcomingRecurringTable } from "@/components/dashboard/overview/overview-upcoming-recurring-table"
import { Button } from "@/components/ui/button"

interface OverviewMiddleRowProps {
  isLoading: boolean
  data: OverviewData
  currency: string | undefined
  hasDateFilter: boolean
  filterLabel: string
}

export function OverviewMiddleRow({
  isLoading,
  data,
  currency,
  hasDateFilter,
  filterLabel,
}: OverviewMiddleRowProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <OverviewPanelCard
        loading={isLoading}
        title="Top spending categories"
        description={
          hasDateFilter
            ? `Where posted expense money went in ${filterLabel}.`
            : "Where most of your posted expense money is going."
        }
        action={
          <Button asChild size="sm" variant="outline">
            <Link to="/dashboard/transactions" search={(previous) => previous}>
              View transactions
              <ArrowRightIcon />
            </Link>
          </Button>
        }
      >
        {!isLoading &&
          (data.overview.topSpendingCategories.length > 0 ? (
            <OverviewTopSpendingCategoriesList
              categories={data.overview.topSpendingCategories}
              totalExpenses={data.overview.expenses}
              currency={currency}
            />
          ) : (
            <FilteredResultsEmptyState
              title={
                hasDateFilter
                  ? "No expense activity in this date filter"
                  : "No expense activity yet"
              }
              description={
                hasDateFilter
                  ? "Try a wider date range to see where spending is concentrated."
                  : "Posted expense categories will start ranking here once you record spending."
              }
              icon={hasDateFilter ? FunnelIcon : PiggyBankIcon}
            />
          ))}
      </OverviewPanelCard>

      <OverviewPanelCard
        loading={isLoading}
        title="Upcoming recurring"
        description="The next recurring items scheduled to hit your accounts."
        action={
          <Button asChild size="sm" variant="outline">
            <Link to="/dashboard/recurring" search={(previous) => previous}>
              View recurring
              <ArrowRightIcon />
            </Link>
          </Button>
        }
      >
        {!isLoading &&
          (data.overview.upcomingRecurring.length > 0 ? (
            <OverviewUpcomingRecurringTable
              recurringItems={data.overview.upcomingRecurring}
              currency={currency}
            />
          ) : (
            <FilteredResultsEmptyState
              title="No recurring items yet"
              description="Add recurring income or bills so future cash movement is visible here."
              icon={RepeatIcon}
            />
          ))}
      </OverviewPanelCard>
    </div>
  )
}
