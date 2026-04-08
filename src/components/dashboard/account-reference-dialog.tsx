import type { useAccountReferenceActions } from "@/hooks/use-account-reference-actions"
import { AccountFormDialog } from "@/components/dashboard/accounts/account-form-dialog"

export function AccountReferenceDialog({
  accountActions,
  description,
}: {
  accountActions: ReturnType<typeof useAccountReferenceActions>
  description: string
}) {
  return (
    <AccountFormDialog
      open={accountActions.creator.dialogOpen}
      onOpenChange={accountActions.creator.handleDialogOpenChange}
      onSubmit={accountActions.creator.handleSubmit}
      values={accountActions.creator.values}
      errors={accountActions.creator.errors}
      formError={accountActions.creator.formError}
      pending={accountActions.creator.pending}
      title="Finish account setup"
      description={description}
      submitLabel="Create and select account"
      onValueChange={accountActions.creator.handleValueChange}
      onIncludeInTotalsChange={accountActions.creator.handleIncludeInTotalsChange}
    />
  )
}
