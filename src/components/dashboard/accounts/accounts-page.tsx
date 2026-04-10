import { useSuspenseQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { useConvexMutation } from "@convex-dev/react-query"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"
import { api } from "../../../../convex/_generated/api"
import type { AccountRecord } from "@/components/dashboard/accounts/accounts-shared"
import { resolveAccountAppearance } from "@/components/dashboard/accounts/accounts-shared"
import { AccountFormDialog } from "@/components/dashboard/accounts/account-form-dialog"
import { AccountsContent } from "@/components/dashboard/accounts/accounts-content"
import { DashboardPageActions } from "@/components/dashboard/dashboard-page-actions"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { DashboardPageSection } from "@/components/dashboard/dashboard-page-section"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import { Button } from "@/components/ui/button"
import { useAccountCreator } from "@/hooks/use-account-creator"
import { useAccountEditor } from "@/hooks/use-account-editor"
import { getAccountsPageDataQueryOptions } from "@/lib/dashboard-query-options"
import { m } from "@/lib/i18n-client"

export function AccountsPage() {
  const { data } = useSuspenseQuery(getAccountsPageDataQueryOptions())
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
      ...resolveAccountAppearance(a),
    }),
  })

  const active = data.accounts.active
  const archived = data.accounts.archived
  const currency = data.settings?.baseCurrency
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
        error instanceof Error ? error.message : m.accounts_update_error()
      )
      setConfirmArchiveId(null)
    } finally {
      setPendingArchiveId(null)
    }
  }

  return (
    <DashboardPageSection>
      <DashboardPageHeader
        title={m.nav_accounts()}
        action={
          <DashboardPageActions>
            <Button onClick={() => creator.openDialog()}>
              {m.accounts_add_account()}
              <PlusIcon />
            </Button>
          </DashboardPageActions>
        }
      />
      <AccountsContent
        activeAccounts={active}
        archivedAccounts={archived}
        currency={currency}
        totalBalance={totalBalance}
        includedBalance={includedBalance}
        hasAnyAccounts={hasAny}
        pendingArchiveId={pendingArchiveId}
        onAddAccount={() => creator.openDialog()}
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
            ? m.accounts_archive_title()
            : m.accounts_restore_title()
        }
        description={
          confirmArchiveId?.archived
            ? m.accounts_archive_description()
            : m.accounts_restore_description()
        }
        confirmLabel={
          confirmArchiveId?.archived
            ? m.accounts_archive_confirm()
            : m.accounts_restore_confirm()
        }
        onConfirm={handleArchiveConfirm}
        pending={pendingArchiveId !== null}
      />
    </DashboardPageSection>
  )
}
