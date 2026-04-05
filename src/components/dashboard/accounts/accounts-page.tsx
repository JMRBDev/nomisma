import { useMemo, useState } from "react"
import { useConvexMutation } from "@convex-dev/react-query"
import { PlusIcon } from "lucide-react"
import { api } from "../../../../convex/_generated/api"
import { AccountFormDialog } from "@/components/dashboard/accounts/account-form-dialog"
import { AccountsEmptyState } from "@/components/dashboard/accounts/accounts-empty-state"
import type { AccountRecord } from "@/components/dashboard/accounts/accounts-shared"
import { AccountsTable } from "@/components/dashboard/accounts/accounts-table"
import { DashboardPageActions } from "@/components/dashboard/dashboard-page-actions"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { DashboardPageSection } from "@/components/dashboard/dashboard-page-section"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAccountsPageData } from "@/hooks/use-money-dashboard"
import { useAccountCreator } from "@/hooks/use-account-creator"
import { formatCurrency } from "@/lib/money"

export function AccountsPage() {
  const { data } = useAccountsPageData()
  const createAccount = useConvexMutation(api.accounts.createAccount)
  const toggleAccountArchived = useConvexMutation(
    api.accounts.toggleAccountArchived
  )
  const [pendingArchiveId, setPendingArchiveId] = useState<
    AccountRecord["_id"] | null
  >(null)

  const accountCreator = useAccountCreator({
    onCreateAccount: (payload) => createAccount(payload),
  })

  const activeAccounts = data?.accounts.active ?? []
  const archivedAccounts = data?.accounts.archived ?? []
  const currency = data?.settings?.baseCurrency
  const totalBalance = useMemo(
    () =>
      activeAccounts.reduce(
        (total, account) => total + account.currentBalance,
        0
      ),
    [activeAccounts]
  )
  const includedBalance = useMemo(
    () =>
      activeAccounts.reduce(
        (total, account) =>
          account.includeInTotals ? total + account.currentBalance : total,
        0
      ),
    [activeAccounts]
  )
  const excludedBalance = totalBalance - includedBalance
  const excludedAccountsCount = activeAccounts.filter(
    (account) => !account.includeInTotals
  ).length
  const hasAnyAccounts =
    activeAccounts.length > 0 || archivedAccounts.length > 0

  const handleToggleArchived = async (
    accountId: AccountRecord["_id"],
    archived: boolean
  ) => {
    setPendingArchiveId(accountId)

    try {
      await toggleAccountArchived({
        accountId,
        archived,
      })
    } finally {
      setPendingArchiveId(null)
    }
  }

  if (!data) {
    return <section className="min-h-[calc(100vh-12rem)]" />
  }

  return (
    <DashboardPageSection>
      <DashboardPageHeader
        title="Accounts"
        action={
          <DashboardPageActions>
            <Button onClick={accountCreator.openDialog}>
              Add account
              <PlusIcon />
            </Button>
          </DashboardPageActions>
        }
      />

      {hasAnyAccounts ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <AccountSummaryCard
              title="Active balance"
              value={formatCurrency(totalBalance, currency)}
              description={`${activeAccounts.length} active account${activeAccounts.length === 1 ? "" : "s"}`}
            />
            <AccountSummaryCard
              title="Included in totals"
              value={formatCurrency(includedBalance, currency)}
              description="Balances that count toward dashboard totals"
            />
            <AccountSummaryCard
              title="Excluded from totals"
              value={formatCurrency(excludedBalance, currency)}
              description={`${excludedAccountsCount} active account${excludedAccountsCount === 1 ? "" : "s"} kept out of totals`}
            />
          </div>

          {activeAccounts.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Active accounts</CardTitle>
              </CardHeader>

              <CardContent>
                <AccountsTable
                  accounts={activeAccounts}
                  currency={currency}
                  archived={false}
                  pendingAccountId={pendingArchiveId}
                  onToggleArchived={handleToggleArchived}
                />
              </CardContent>
            </Card>
          ) : (
            <AccountsEmptyState
              hasArchivedAccounts={archivedAccounts.length > 0}
              onAddAccount={accountCreator.openDialog}
            />
          )}

          {archivedAccounts.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Archived accounts</CardTitle>
              </CardHeader>

              <CardContent>
                <AccountsTable
                  accounts={archivedAccounts}
                  currency={currency}
                  archived
                  pendingAccountId={pendingArchiveId}
                  onToggleArchived={handleToggleArchived}
                />
              </CardContent>
            </Card>
          ) : null}
        </>
      ) : (
        <AccountsEmptyState
          hasArchivedAccounts={false}
          onAddAccount={accountCreator.openDialog}
        />
      )}

      <AccountFormDialog
        open={accountCreator.dialogOpen}
        onOpenChange={accountCreator.handleDialogOpenChange}
        onSubmit={accountCreator.handleSubmit}
        values={accountCreator.values}
        errors={accountCreator.errors}
        formError={accountCreator.formError}
        pending={accountCreator.pending}
        onValueChange={accountCreator.handleValueChange}
        onIncludeInTotalsChange={accountCreator.handleIncludeInTotalsChange}
      />
    </DashboardPageSection>
  )
}

function AccountSummaryCard({
  title,
  value,
  description,
}: {
  title: string
  value: string
  description: string
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="font-heading text-2xl leading-none font-medium">
          {value}
        </p>
      </CardContent>
    </Card>
  )
}
