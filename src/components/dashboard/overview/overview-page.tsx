import { useMemo } from "react"
import { Link, getRouteApi } from "@tanstack/react-router"
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  FunnelIcon,
  PiggyBankIcon,
  ReceiptTextIcon,
  RepeatIcon,
} from "lucide-react"
import {
  getOverviewDateFilterLabel,
  getOverviewDateFilterQuery,
  hasOverviewDateFilter,
  resolveOverviewDateFilterValues,
} from "@/components/dashboard/overview/overview-date-filter"
import { OverviewAlerts } from "@/components/dashboard/overview/overview-alerts"
import { OverviewChecklist } from "@/components/dashboard/overview/overview-checklist"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { DashboardPageSection } from "@/components/dashboard/dashboard-page-section"
import { FilteredResultsEmptyState } from "@/components/filtered-results-empty-state"
import { OverviewPanelCard } from "@/components/dashboard/overview/overview-panel-card"
import { OverviewRecentTransactionsTable } from "@/components/dashboard/overview/overview-recent-transactions-table"
import { OverviewSummaryCards } from "@/components/dashboard/overview/overview-summary-cards"
import { OverviewTopSpendingCategoriesList } from "@/components/dashboard/overview/overview-top-spending-categories-list"
import { OverviewUpcomingRecurringTable } from "@/components/dashboard/overview/overview-upcoming-recurring-table"
import { Button } from "@/components/ui/button"
import { useOverviewData } from "@/hooks/use-money-dashboard"

const dashboardRouteApi = getRouteApi("/_authenticated/dashboard")

export function OverviewPage() {
  const search = dashboardRouteApi.useSearch()
  const dateFilter = resolveOverviewDateFilterValues(search)
  const hasDateFilter = hasOverviewDateFilter(dateFilter)
  const filterLabel = getOverviewDateFilterLabel(dateFilter)
  const activityLabel = hasDateFilter ? filterLabel : "the current month"
  const queryArgs = useMemo(
    () => getOverviewDateFilterQuery(dateFilter),
    [dateFilter.fromDate, dateFilter.toDate]
  )
  const { data } = useOverviewData(queryArgs)

  if (!data) {
    return <section className="min-h-[calc(100vh-12rem)]" />
  }

  const currency = data.settings?.baseCurrency

  return (
    <DashboardPageSection>
      <DashboardPageHeader title="Overview" />

      <OverviewSummaryCards
        currentMoney={data.overview.currentMoney}
        income={data.overview.income}
        expenses={data.overview.expenses}
        net={data.overview.net}
        budgetRemaining={data.overview.budgetRemaining}
        hasAccounts={data.hasAccounts}
        currentMonth={data.currentMonth}
        currency={currency}
        activityLabel={activityLabel}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <OverviewPanelCard
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
          {data.overview.recentTransactions.length > 0 ? (
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

          {data.onboarding.completedCount < data.onboarding.totalCount ? (
            <OverviewPanelCard
              title="Setup checklist"
              description={`${data.onboarding.completedCount} of ${data.onboarding.totalCount} setup steps completed.`}
            >
              <OverviewChecklist
                completedCount={data.onboarding.completedCount}
                totalCount={data.onboarding.totalCount}
                steps={data.onboarding.steps}
              />
            </OverviewPanelCard>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <OverviewPanelCard
          title="Top spending categories"
          description={
            hasDateFilter
              ? `Where posted expense money went in ${filterLabel}.`
              : "Where most of your posted expense money is going."
          }
          action={
            <Button asChild size="sm" variant="outline">
              <Link
                to="/dashboard/transactions"
                search={(previous) => previous}
              >
                View transactions
                <ArrowRightIcon />
              </Link>
            </Button>
          }
        >
          {data.overview.topSpendingCategories.length > 0 ? (
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
          )}
        </OverviewPanelCard>
      </div>
    </DashboardPageSection>
  )
}
