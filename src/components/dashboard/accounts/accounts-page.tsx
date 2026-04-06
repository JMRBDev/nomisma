import { useMemo, useState } from "react"
import { useConvexMutation } from "@convex-dev/react-query"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"
import { api } from "../../../../convex/_generated/api"
import type { AccountRecord } from "@/components/dashboard/accounts/accounts-shared"
import { AccountFormDialog } from "@/components/dashboard/accounts/account-form-dialog"
import { AccountsEmptyState } from "@/components/dashboard/accounts/accounts-empty-state"
import { AccountsTable } from "@/components/dashboard/accounts/accounts-table"
import { DashboardPageActions } from "@/components/dashboard/dashboard-page-actions"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { DashboardPageSection } from "@/components/dashboard/dashboard-page-section"
import { DashboardSummaryCard } from "@/components/dashboard/dashboard-summary-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAccountsPageData } from "@/hooks/use-money-dashboard"
import { useAccountCreator } from "@/hooks/use-account-creator"
import { formatCurrency } from "@/lib/money"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"

export function AccountsPage() {
  const { data } = useAccountsPageData()
  const createAccount = useConvexMutation(api.accounts.createAccount)
  const toggleAccountArchived = useConvexMutation(
    api.accounts.toggleAccountArchived
  )
  const [pendingArchiveId, setPendingArchiveId] = useState<
    AccountRecord["_id"] | null
  >(null)
  const [confirmArchiveId, setConfirmArchiveId] = useState<{
    id: AccountRecord["_id"]
    archived: boolean
  } | null>(null)

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

  const handleArchiveRequest = (
    accountId: AccountRecord["_id"],
    archived: boolean
  ) => {
    setConfirmArchiveId({ id: accountId, archived })
  }

  const handleArchiveConfirm = async () => {
    if (!confirmArchiveId) return

    setPendingArchiveId(confirmArchiveId.id)

    try {
      await toggleAccountArchived({
        accountId: confirmArchiveId.id,
        archived: confirmArchiveId.archived,
      })
      setConfirmArchiveId(null)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update the account."
      )
      setConfirmArchiveId(null)
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
            <DashboardSummaryCard
              title="Excluded from totals"
              value={formatCurrency(excludedBalance, currency)}
              description={`${excludedAccountsCount} active account${excludedAccountsCount === 1 ? "" : "s"} kept out of totals`}
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
                  onToggleArchived={handleArchiveRequest}
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
                <CardTitle className="text-2xl">Archived accounts</CardTitle>
              </CardHeader>

              <CardContent>
                <AccountsTable
                  accounts={archivedAccounts}
                  currency={currency}
                  archived
                  pendingAccountId={pendingArchiveId}
                  onToggleArchived={handleArchiveRequest}
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

      <DeleteConfirmDialog
        open={confirmArchiveId !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmArchiveId(null)
        }}
        title={
          confirmArchiveId?.archived
            ? "Archive this account?"
            : "Restore this account?"
        }
        description={
          confirmArchiveId?.archived
            ? "Archived accounts are hidden from the dashboard. You can restore them at any time."
            : "This account will be added back to your active accounts and included in totals."
        }
        confirmLabel={confirmArchiveId?.archived ? "Archive" : "Restore"}
        onConfirm={handleArchiveConfirm}
        pending={pendingArchiveId !== null}
      />
    </DashboardPageSection>
  )
}
