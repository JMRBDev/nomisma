import { Link } from "@tanstack/react-router"
import { ArrowRightIcon, FunnelIcon, ReceiptTextIcon } from "lucide-react"
import type { TransactionRecord } from "@/components/dashboard/transactions/transactions-shared"
import { FilteredResultsEmptyState } from "@/components/filtered-results-empty-state"
import { OverviewPanelCard } from "@/components/dashboard/overview/overview-panel-card"
import { TransactionsTable } from "@/components/dashboard/transactions/transactions-table"
import { Button } from "@/components/ui/button"
import { t } from "@/lib/i18n"

export function OverviewRecentTransactionsPanel({
  recentTransactions,
  currency,
  hasDateFilter,
  filterLabel,
}: {
  recentTransactions: Array<TransactionRecord>
  currency: string
  hasDateFilter: boolean
  filterLabel: string
}) {
  return (
    <OverviewPanelCard
      title={t("overview_recent_transactions_title")}
      description={
        hasDateFilter
          ? t("overview_recent_transactions_filtered", { filter: filterLabel })
          : t("overview_recent_transactions_description")
      }
      action={
        <Button asChild size="sm" variant="outline">
          <Link to="/dashboard/transactions" search={(previous) => previous}>
            {t("common_view_all")}
            <ArrowRightIcon />
          </Link>
        </Button>
      }
    >
      {recentTransactions.length > 0 ? (
        <TransactionsTable
          transactions={recentTransactions}
          currency={currency}
          columnVisibilityStorageKey="nomisma-table-columns:overview-recent-transactions"
          defaultPageSize={5}
          showBreakdown={false}
        />
      ) : (
        <FilteredResultsEmptyState
          title={
            hasDateFilter
              ? t("overview_no_transactions_filtered_title")
              : t("overview_no_transactions_title")
          }
          description={
            hasDateFilter
              ? t("overview_no_transactions_filtered_description")
              : t("overview_no_transactions_description")
          }
          icon={hasDateFilter ? FunnelIcon : ReceiptTextIcon}
          action={
            hasDateFilter ? null : (
              <Button asChild>
                <Link
                  to="/dashboard/transactions"
                  search={(previous) => previous}
                >
                  {t("overview_open_transactions")}
                  <ArrowRightIcon />
                </Link>
              </Button>
            )
          }
        />
      )}
    </OverviewPanelCard>
  )
}
