import type { AccountRecord } from "@/components/dashboard/accounts/accounts-shared"
import { AccountsEmptyState } from "@/components/dashboard/accounts/accounts-empty-state"
import { AccountsTable } from "@/components/dashboard/accounts/accounts-table"
import { DashboardSummaryCard } from "@/components/dashboard/dashboard-summary-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/money"

interface AccountsContentProps {
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
  if (hasAnyAccounts) {
    return (
      <>
        <div className="grid gap-4 md:grid-cols-2">
          <DashboardSummaryCard
            title="Active balance"
            value={formatCurrency(totalBalance, currency)}
            description={`${activeAccounts.length} active account${activeAccounts.length === 1 ? "" : "s"}`}
          />
          <DashboardSummaryCard
            title="Included in totals"
            value={formatCurrency(includedBalance, currency)}
            description="Balances that count toward dashboard totals"
          />
        </div>

        {activeAccounts.length > 0 ? (
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

        {archivedAccounts.length > 0 ? (
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
