import { Link } from "@tanstack/react-router"
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  FunnelIcon,
  ReceiptTextIcon,
} from "lucide-react"
import { OverviewAlerts } from "@/components/dashboard/overview/overview-alerts"
import { OverviewChartsRow } from "@/components/dashboard/overview/overview-charts-row"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { DashboardPageSection } from "@/components/dashboard/dashboard-page-section"
import { FilteredResultsEmptyState } from "@/components/filtered-results-empty-state"
import { OverviewMiddleRow } from "@/components/dashboard/overview/overview-middle-row"
import { OverviewPanelCard } from "@/components/dashboard/overview/overview-panel-card"
import { OverviewRecentTransactionsTable } from "@/components/dashboard/overview/overview-recent-transactions-table"
import { OverviewSummaryCards } from "@/components/dashboard/overview/overview-summary-cards"
import { Button } from "@/components/ui/button"
import { useOverviewData } from "@/hooks/use-money-dashboard"
import { useDateFilter } from "@/hooks/use-date-filter"

export function OverviewPage() {
  const { hasDateFilter, filterLabel, dateRange, dateFilter } = useDateFilter()
  const activityLabel = hasDateFilter ? filterLabel : "the current month"
  const { data } = useOverviewData(dateRange)
  const isLoading = !data
  const currency = data?.settings?.baseCurrency
  const isSingleMonth =
    !hasDateFilter ||
    dateFilter.fromDate.slice(0, 7) === dateFilter.toDate.slice(0, 7)
  return (
    <DashboardPageSection>
      <DashboardPageHeader title="Overview" />
      <OverviewSummaryCards
        loading={isLoading}
        currentMoney={data?.overview.currentMoney}
        income={data?.overview.income}
        expenses={data?.overview.expenses}
        net={data?.overview.net}
        hasAccounts={data?.hasAccounts}
        currency={currency}
        activityLabel={activityLabel}
      />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <OverviewPanelCard
          loading={isLoading}
          title="Recent transactions"
          description={
            hasDateFilter
              ? `Transactions recorded in ${filterLabel}.`
              : "Your latest income, expenses, and transfers."
          }
          action={
            <Button asChild size="sm" variant="outline">
              <Link
                to="/dashboard/transactions"
                search={(previous) => previous}
              >
                View all
                <ArrowRightIcon />
              </Link>
            </Button>
          }
        >
          {!isLoading &&
            (data.overview.recentTransactions.length > 0 ? (
              <OverviewRecentTransactionsTable
                transactions={data.overview.recentTransactions}
                currency={currency}
              />
            ) : (
              <FilteredResultsEmptyState
                title={
                  hasDateFilter
                    ? "No transactions in this date filter"
                    : "No transactions yet"
                }
                description={
                  hasDateFilter
                    ? "Pick another day or range from the header to inspect a different slice of activity."
                    : "Add your first transaction to build a usable activity history."
                }
                icon={hasDateFilter ? FunnelIcon : ReceiptTextIcon}
                action={
                  hasDateFilter ? null : (
                    <Button asChild>
                      <Link
                        to="/dashboard/transactions"
                        search={(previous) => previous}
                      >
                        Open transactions
                        <ArrowRightIcon />
                      </Link>
                    </Button>
                  )
                }
              />
            ))}
        </OverviewPanelCard>
        <div className="grid gap-4">
          <OverviewPanelCard
            loading={isLoading}
            title="Alerts"
            description="Things that need attention or are worth checking."
          >
            {!isLoading &&
              (data.overview.alerts.length > 0 ? (
                <OverviewAlerts alerts={data.overview.alerts} />
              ) : (
                <FilteredResultsEmptyState
                  title="No alerts right now"
                  description="Your dashboard is clear. New budget or recurring issues will show up here."
                  icon={CheckCircle2Icon}
                />
              ))}
          </OverviewPanelCard>
        </div>
      </div>
      <OverviewMiddleRow
        isLoading={isLoading}
        data={data!}
        currency={currency}
        hasDateFilter={hasDateFilter}
        filterLabel={filterLabel}
      />
      <OverviewChartsRow
        isLoading={isLoading}
        data={data!}
        currency={currency}
        hasDateFilter={hasDateFilter}
        filterLabel={filterLabel}
        isSingleMonth={isSingleMonth}
      />
    </DashboardPageSection>
  )
}
