import { Suspense, lazy } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { ArrowRightIcon, CheckCircle2Icon, FunnelIcon, ReceiptTextIcon, RepeatIcon } from "lucide-react"
import { OverviewAlerts } from "@/components/dashboard/overview/overview-alerts"
import { OverviewChartsRowFallback } from "@/components/dashboard/overview/overview-charts-row-fallback"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { DashboardPageSection } from "@/components/dashboard/dashboard-page-section"
import { FilteredResultsEmptyState } from "@/components/filtered-results-empty-state"
import { OverviewPanelCard } from "@/components/dashboard/overview/overview-panel-card"
import { OverviewSummaryCards } from "@/components/dashboard/overview/overview-summary-cards"
import { RecurringTable } from "@/components/dashboard/recurring/recurring-table"
import { TransactionsTable } from "@/components/dashboard/transactions/transactions-table"
import { Button } from "@/components/ui/button"
import { useCalendarContext } from "@/hooks/use-calendar-context"
import { useDateFilter } from "@/hooks/use-date-filter"
import { getOverviewDataQueryOptions } from "@/lib/dashboard-query-options"
import { m } from "@/paraglide/messages"

const LazyOverviewChartsRow = lazy(async () => ({
  default: (await import("@/components/dashboard/overview/overview-charts-row"))
    .OverviewChartsRow,
}))

export function OverviewPage() {
  const calendarContext = useCalendarContext()
  const { hasDateFilter, filterLabel, dateFilter, dateRange } = useDateFilter()
  const activityLabel = hasDateFilter
    ? filterLabel
    : m.overview_activity_current_month()
  const { data } = useSuspenseQuery(
    getOverviewDataQueryOptions(calendarContext, dateRange)
  )
  const currency = data.settings?.baseCurrency
  const isSingleMonth =
    !hasDateFilter ||
    dateFilter.fromDate.slice(0, 7) === dateFilter.toDate.slice(0, 7)
  return (
    <DashboardPageSection>
      <DashboardPageHeader title={m.nav_overview()} />
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
          title={m.overview_recent_transactions_title()}
          description={
            hasDateFilter
              ? m.overview_recent_transactions_filtered({
                  filter: filterLabel,
                })
              : m.overview_recent_transactions_description()
          }
          action={
            <Button asChild size="sm" variant="outline">
              <Link to="/dashboard/transactions" search={(previous) => previous}>
                {m.common_view_all()}
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
                  ? m.overview_no_transactions_filtered_title()
                  : m.overview_no_transactions_title()
              }
              description={
                hasDateFilter
                  ? m.overview_no_transactions_filtered_description()
                  : m.overview_no_transactions_description()
              }
              icon={hasDateFilter ? FunnelIcon : ReceiptTextIcon}
              action={
                hasDateFilter ? null : (
                  <Button asChild>
                    <Link to="/dashboard/transactions" search={(previous) => previous}>
                      {m.overview_open_transactions()}
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
            title={m.overview_alerts_title()}
            description={m.overview_alerts_description()}
          >
            {data.overview.alerts.length > 0 ? (
              <OverviewAlerts alerts={data.overview.alerts} currency={currency} />
            ) : (
              <FilteredResultsEmptyState
                title={m.overview_no_alerts_title()}
                description={m.overview_no_alerts_description()}
                icon={CheckCircle2Icon}
              />
            )}
          </OverviewPanelCard>
          <OverviewPanelCard
            title={m.overview_upcoming_recurring_title()}
            description={m.overview_upcoming_recurring_description()}
            action={
              <Button asChild size="sm" variant="outline">
                <Link to="/dashboard/recurring" search={(previous) => previous}>
                  {m.overview_view_recurring()}
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
                title={m.overview_no_recurring_title()}
                description={m.overview_no_recurring_description()}
                icon={RepeatIcon}
              />
            )}
          </OverviewPanelCard>
        </div>
      </div>
      <Suspense fallback={<OverviewChartsRowFallback />}>
        <LazyOverviewChartsRow
          data={data}
          currency={currency}
          hasDateFilter={hasDateFilter}
          filterLabel={filterLabel}
          isSingleMonth={isSingleMonth}
        />
      </Suspense>
    </DashboardPageSection>
  )
}
