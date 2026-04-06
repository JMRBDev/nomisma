import type { AccountRecord } from "@/components/dashboard/accounts/accounts-shared"
import { AccountsEmptyState } from "@/components/dashboard/accounts/accounts-empty-state"
import { AccountsTable } from "@/components/dashboard/accounts/accounts-table"
import { DashboardSummaryCard } from "@/components/dashboard/dashboard-summary-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/money"

interface AccountsContentProps {
  isLoading: boolean
  activeAccounts: Array<AccountRecord>
  archivedAccounts: Array<AccountRecord>
  currency: string | undefined
  totalBalance: number
  includedBalance: number
  hasAnyAccounts: boolean
  pendingArchiveId: AccountRecord["_id"] | null
  onAddAccount: () => void
  onEdit: (account: AccountRecord) => void
  onToggleArchived: (accountId: AccountRecord["_id"], archived: boolean) => void
}

export function AccountsContent({
  isLoading,
  activeAccounts,
  archivedAccounts,
  currency,
  totalBalance,
  includedBalance,
  hasAnyAccounts,
  pendingArchiveId,
  onAddAccount,
  onEdit,
  onToggleArchived,
}: AccountsContentProps) {
  if (isLoading || hasAnyAccounts) {
    return (
      <>
        <div className="grid gap-4 md:grid-cols-2">
          <DashboardSummaryCard
            loading={isLoading}
            title="Active balance"
            value={formatCurrency(totalBalance, currency)}
            description={`${activeAccounts.length} active account${activeAccounts.length === 1 ? "" : "s"}`}
          />
          <DashboardSummaryCard
            loading={isLoading}
            title="Included in totals"
            value={formatCurrency(includedBalance, currency)}
            description="Balances that count toward dashboard totals"
          />
        </div>

        {isLoading ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Active accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-3/4" />
              </div>
            </CardContent>
          </Card>
        ) : activeAccounts.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Active accounts</CardTitle>
            </CardHeader>

            <CardContent>
              <AccountsTable
                accounts={activeAccounts}
                currency={currency}
                archived={false}
                pendingAccountId={pendingArchiveId}
                onEdit={onEdit}
                onToggleArchived={onToggleArchived}
              />
            </CardContent>
          </Card>
        ) : (
          <AccountsEmptyState
            hasArchivedAccounts={archivedAccounts.length > 0}
            onAddAccount={onAddAccount}
          />
        )}

        {!isLoading && archivedAccounts.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Archived accounts</CardTitle>
            </CardHeader>

            <CardContent>
              <AccountsTable
                accounts={archivedAccounts}
                currency={currency}
                archived
                pendingAccountId={pendingArchiveId}
                onEdit={onEdit}
                onToggleArchived={onToggleArchived}
              />
            </CardContent>
          </Card>
        ) : null}
      </>
    )
  }

  return (
    <AccountsEmptyState
      hasArchivedAccounts={false}
      onAddAccount={onAddAccount}
    />
  )
}
