import type { AccountRecord } from "@/components/dashboard/accounts/accounts-shared"
import { AccountsEmptyState } from "@/components/dashboard/accounts/accounts-empty-state"
import { AccountsTable } from "@/components/dashboard/accounts/accounts-table"
import { DashboardSummaryCard } from "@/components/dashboard/dashboard-summary-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/money"
import { m } from "@/paraglide/messages"

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
            title={m.accounts_summary_active_balance_title()}
            value={formatCurrency(totalBalance, currency)}
            description={m.accounts_summary_active_balance_description({
              count: activeAccounts.length,
            })}
          />
          <DashboardSummaryCard
            title={m.accounts_summary_included_title()}
            value={formatCurrency(includedBalance, currency)}
            description={m.accounts_summary_included_description()}
          />
        </div>

        {activeAccounts.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {m.accounts_active_section_title()}
              </CardTitle>
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
              <CardTitle className="text-2xl">
                {m.accounts_archived_section_title()}
              </CardTitle>
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
