import type {
  AccountFieldErrors,
  AccountFormValues,
} from "@/components/dashboard/accounts/accounts-shared"
import { AccountFormFields } from "@/components/dashboard/accounts/account-form-fields"
import { DashboardFormActions } from "@/components/dashboard/dashboard-form-actions"
import { DashboardFormDialog } from "@/components/dashboard/dashboard-form-dialog"

export function AccountFormDialog({
  open,
  onOpenChange,
  onSubmit,
  values,
  errors,
  formError,
  pending,
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
      title="Add account"
      description="Set the starting balance and whether this account should count toward your headline dashboard totals."
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <AccountFormFields
          values={values}
          errors={errors}
          onValueChange={onValueChange}
          onIncludeInTotalsChange={onIncludeInTotalsChange}
        />

        <DashboardFormActions
          pending={pending}
          formError={formError}
          submitLabel="Save account"
          pendingLabel="Saving..."
        />
      </form>
    </DashboardFormDialog>
  )
}
