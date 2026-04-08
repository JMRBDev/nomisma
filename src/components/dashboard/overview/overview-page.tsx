import { Link, getRouteApi } from "@tanstack/react-router"
import { ArrowRightIcon, CheckCircle2Icon, FunnelIcon, ReceiptTextIcon, RepeatIcon } from "lucide-react"
import { OverviewAlerts } from "@/components/dashboard/overview/overview-alerts"
import { OverviewChartsRow } from "@/components/dashboard/overview/overview-charts-row"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { DashboardPageSection } from "@/components/dashboard/dashboard-page-section"
import { FilteredResultsEmptyState } from "@/components/filtered-results-empty-state"
import { OverviewPanelCard } from "@/components/dashboard/overview/overview-panel-card"
import { OverviewSummaryCards } from "@/components/dashboard/overview/overview-summary-cards"
import { RecurringTable } from "@/components/dashboard/recurring/recurring-table"
import { TransactionsTable } from "@/components/dashboard/transactions/transactions-table"
import { Button } from "@/components/ui/button"
import { useDateFilter } from "@/hooks/use-date-filter"

const overviewRouteApi = getRouteApi("/_authenticated/dashboard/")

export function OverviewPage() {
  const { hasDateFilter, filterLabel, dateFilter } = useDateFilter()
  const activityLabel = hasDateFilter ? filterLabel : "the current month"
  const data = overviewRouteApi.useLoaderData()
  const currency = data.settings?.baseCurrency
  const isSingleMonth =
    !hasDateFilter ||
    dateFilter.fromDate.slice(0, 7) === dateFilter.toDate.slice(0, 7)
  return (
    <DashboardPageSection>
      <DashboardPageHeader title="Overview" />
      <OverviewSummaryCards
        currentMoney={data.overview.currentMoney}
        income={data.overview.income}
        expenses={data.overview.expenses}
        net={data.overview.net}
        hasAccounts={data.hasAccounts}
        currency={currency}
        activityLabel={activityLabel}
      />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,1fr)]">
        <OverviewPanelCard
          title="Recent transactions"
          description={
            hasDateFilter
              ? `Transactions recorded in ${filterLabel}.`
              : "Your latest income, expenses, and transfers."
          }
          action={
            <Button asChild size="sm" variant="outline">
              <Link to="/dashboard/transactions" search={(previous) => previous}>
                View all
                <ArrowRightIcon />
              </Link>
            </Button>
          }
        >
          {data.overview.recentTransactions.length > 0 ? (
            <TransactionsTable
              transactions={data.overview.recentTransactions}
              currency={currency}
              columnVisibilityStorageKey="nomisma-table-columns:overview-recent-transactions"
              defaultPageSize={5}
              showBreakdown={false}
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
                    <Link to="/dashboard/transactions" search={(previous) => previous}>
                      Open transactions
                      <ArrowRightIcon />
                    </Link>
                  </Button>
                )
              }
            />
          )}
        </OverviewPanelCard>
        <div className="grid gap-4">
          <OverviewPanelCard
            title="Alerts"
            description="Things that need attention or are worth checking."
          >
            {data.overview.alerts.length > 0 ? (
              <OverviewAlerts alerts={data.overview.alerts} />
            ) : (
              <FilteredResultsEmptyState
                title="No alerts right now"
                description="Your dashboard is clear. New budget or recurring issues will show up here."
                icon={CheckCircle2Icon}
              />
            )}
          </OverviewPanelCard>
          <OverviewPanelCard
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
            {data.overview.upcomingRecurring.length > 0 ? (
              <RecurringTable
                recurringItems={data.overview.upcomingRecurring}
                currency={currency}
                columnVisibilityStorageKey="nomisma-table-columns:overview-upcoming-recurring"
                defaultPageSize={5}
              />
            ) : (
              <FilteredResultsEmptyState
                title="No recurring items yet"
                description="Add recurring income or bills so future cash movement is visible here."
                icon={RepeatIcon}
              />
            )}
          </OverviewPanelCard>
        </div>
      </div>
      <OverviewChartsRow
        data={data}
        currency={currency}
        hasDateFilter={hasDateFilter}
        filterLabel={filterLabel}
        isSingleMonth={isSingleMonth}
      />
    </DashboardPageSection>
  )
}
