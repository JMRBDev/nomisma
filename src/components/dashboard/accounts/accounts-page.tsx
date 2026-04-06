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
import { useAccountEditor } from "@/hooks/use-account-editor"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"

export function AccountsPage() {
  const { data } = useAccountsPageData()
  const createAccount = useConvexMutation(api.accounts.createAccount)
  const updateAccount = useConvexMutation(api.accounts.updateAccount)
  const toggleArchived = useConvexMutation(api.accounts.toggleAccountArchived)
  const [pendingArchiveId, setPendingArchiveId] = useState<
    AccountRecord["_id"] | null
  >(null)
  const [confirmArchiveId, setConfirmArchiveId] = useState<{
    id: AccountRecord["_id"]
    archived: boolean
  } | null>(null)

  const creator = useAccountCreator({
    onCreateAccount: (p) => createAccount(p),
  })
  const editor = useAccountEditor({
    onUpdateAccount: (id, p) => updateAccount({ accountId: id, ...p }),
    createFormValues: (a) => ({
      name: a.name,
      type: a.type,
      openingBalance: a.openingBalance.toString(),
      includeInTotals: a.includeInTotals,
      color: a.color ?? "",
      icon: a.icon ?? "",
    }),
  })

  const active = data?.accounts.active ?? []
  const archived = data?.accounts.archived ?? []
  const currency = data?.settings?.baseCurrency
  const totalBalance = useMemo(
    () => active.reduce((s, a) => s + a.currentBalance, 0),
    [active]
  )
  const includedBalance = useMemo(
    () =>
      active.reduce(
        (s, a) => (a.includeInTotals ? s + a.currentBalance : s),
        0
      ),
    [active]
  )
  const hasAny = active.length > 0 || archived.length > 0
  const isLoading = !data

  const handleArchiveConfirm = async () => {
    if (!confirmArchiveId) return
    setPendingArchiveId(confirmArchiveId.id)
    try {
      await toggleArchived({
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

  return (
    <DashboardPageSection>
      <DashboardPageHeader
        title="Accounts"
        action={
          <DashboardPageActions>
            <Button onClick={creator.openDialog} disabled={isLoading}>
              Add account
              <PlusIcon />
            </Button>
          </DashboardPageActions>
        }
      />
      <AccountsContent
        isLoading={isLoading}
        activeAccounts={active}
        archivedAccounts={archived}
        currency={currency}
        totalBalance={totalBalance}
        includedBalance={includedBalance}
        hasAnyAccounts={hasAny}
        pendingArchiveId={pendingArchiveId}
        onAddAccount={creator.openDialog}
        onEdit={(a) => editor.openEditDialog(a)}
        onToggleArchived={(id, a) => setConfirmArchiveId({ id, archived: a })}
      />
      <AccountFormDialog
        open={creator.dialogOpen}
        onOpenChange={creator.handleDialogOpenChange}
        onSubmit={creator.handleSubmit}
        values={creator.values}
        errors={creator.errors}
        formError={creator.formError}
        pending={creator.pending}
        onValueChange={creator.handleValueChange}
        onIncludeInTotalsChange={creator.handleIncludeInTotalsChange}
      />
      <AccountFormDialog
        open={editor.dialogOpen}
        onOpenChange={editor.handleDialogOpenChange}
        onSubmit={editor.handleSubmit}
        values={editor.values}
        errors={editor.errors}
        formError={editor.formError}
        pending={editor.pending}
        editing
        onValueChange={editor.handleValueChange}
        onIncludeInTotalsChange={editor.handleIncludeInTotalsChange}
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
