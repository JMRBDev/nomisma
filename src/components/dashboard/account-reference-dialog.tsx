import type { useAccountReferenceActions } from "@/hooks/use-account-reference-actions"
import { AccountFormDialog } from "@/components/dashboard/accounts/account-form-dialog"
import { t } from "@/lib/i18n"

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
      title={t("accounts_finish_setup_title")}
      description={description}
      submitLabel={t("accounts_create_and_select")}
      onValueChange={accountActions.creator.handleValueChange}
      onIncludeInTotalsChange={
        accountActions.creator.handleIncludeInTotalsChange
      }
    />
  )
}
