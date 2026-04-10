import type {
  AccountFieldErrors,
  AccountFormValues,
} from "@/components/dashboard/accounts/accounts-shared"
import { AccountFormFields } from "@/components/dashboard/accounts/account-form-fields"
import { DashboardFormActions } from "@/components/dashboard/dashboard-form-actions"
import { DashboardFormDialog } from "@/components/dashboard/dashboard-form-dialog"
import { t } from "@/lib/i18n"

export function AccountFormDialog({
  open,
  onOpenChange,
  onSubmit,
  values,
  errors,
  formError,
  pending,
  editing = false,
  title,
  description,
  submitLabel,
  onValueChange,
  onIncludeInTotalsChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  values: AccountFormValues
  errors: AccountFieldErrors
  formError: string
  pending: boolean
  editing?: boolean
  title?: string
  description?: string
  submitLabel?: string
  onValueChange: (
    name: keyof Omit<AccountFormValues, "includeInTotals">,
    value: string
  ) => void
  onIncludeInTotalsChange: (checked: boolean) => void
}) {
  return (
    <DashboardFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        title ??
        (editing ? t("accounts_form_edit_title") : t("accounts_add_account"))
      }
      description={
        description ??
        t("accounts_form_description")
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <AccountFormFields
          values={values}
          errors={errors}
          onValueChange={onValueChange}
          onIncludeInTotalsChange={onIncludeInTotalsChange}
          editing={editing}
        />

        <DashboardFormActions
          pending={pending}
          formError={formError}
          submitLabel={
            submitLabel ??
            (editing ? t("settings_save_changes") : t("accounts_form_save"))
          }
          pendingLabel={t("common_saving")}
        />
      </form>
    </DashboardFormDialog>
  )
}
