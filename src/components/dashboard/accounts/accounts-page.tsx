import { useMemo, useState } from "react"
import { useConvexMutation } from "@convex-dev/react-query"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"
import { api } from "../../../../convex/_generated/api"
import type { AccountRecord } from "@/components/dashboard/accounts/accounts-shared"
import { AccountFormDialog } from "@/components/dashboard/accounts/account-form-dialog"
import { AccountsContent } from "@/components/dashboard/accounts/accounts-content"
import { DashboardPageActions } from "@/components/dashboard/dashboard-page-actions"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { DashboardPageSection } from "@/components/dashboard/dashboard-page-section"
import { Button } from "@/components/ui/button"
import { useAccountsPageData } from "@/hooks/use-money-dashboard"
import { useAccountCreator } from "@/hooks/use-account-creator"
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
    onCreateAccount: async (payload) => {
      await createAccount(payload)
    },
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
  const isLoading = !data

  return (
    <DashboardPageSection>
      <DashboardPageHeader
        title="Accounts"
        action={
          <DashboardPageActions>
            <Button onClick={accountCreator.openDialog} disabled={isLoading}>
              Add account
              <PlusIcon />
            </Button>
          </DashboardPageActions>
        }
      />
      <AccountsContent
        isLoading={isLoading}
        activeAccounts={activeAccounts}
        archivedAccounts={archivedAccounts}
        currency={currency}
        totalBalance={totalBalance}
        includedBalance={includedBalance}
        excludedBalance={excludedBalance}
        excludedAccountsCount={excludedAccountsCount}
        hasAnyAccounts={hasAnyAccounts}
        pendingArchiveId={pendingArchiveId}
        onAddAccount={accountCreator.openDialog}
        onToggleArchived={handleArchiveRequest}
      />
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
