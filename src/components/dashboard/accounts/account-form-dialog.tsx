import type {
  AccountFieldErrors,
  AccountFormValues,
} from "@/components/dashboard/accounts/accounts-shared"
import { AccountFormFields } from "@/components/dashboard/accounts/account-form-fields"
import { DashboardFormActions } from "@/components/dashboard/dashboard-form-actions"
import { DashboardFormDialog } from "@/components/dashboard/dashboard-form-dialog"
import { m } from "@/paraglide/messages"

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
        (editing ? m.accounts_form_edit_title() : m.accounts_add_account())
      }
      description={
        description ??
        m.accounts_form_description()
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
            (editing ? m.settings_save_changes() : m.accounts_form_save())
          }
          pendingLabel={m.common_saving()}
        />
      </form>
    </DashboardFormDialog>
  )
}
