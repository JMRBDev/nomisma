import type {
  RecurringAccountOption,
  RecurringCategoryOption,
  RecurringFieldErrors,
  RecurringFormValues,
  RecurringType,
} from "@/components/dashboard/recurring/recurring-shared"
import { RecurringFormFields } from "@/components/dashboard/recurring/recurring-form-fields"
import { DashboardFormActions } from "@/components/dashboard/dashboard-form-actions"
import { DashboardFormDialog } from "@/components/dashboard/dashboard-form-dialog"
import { getCategoryOptions } from "@/components/dashboard/recurring/recurring-shared"

export function RecurringFormDialog({
  open,
  onOpenChange,
  onSubmit,
  values,
  errors,
  formError,
  pending,
  accountOptions,
  incomeCategoryOptions,
  expenseCategoryOptions,
  onValueChange,
  onTypeChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  values: RecurringFormValues
  errors: RecurringFieldErrors
  formError: string
  pending: boolean
  accountOptions: Array<RecurringAccountOption>
  incomeCategoryOptions: Array<RecurringCategoryOption>
  expenseCategoryOptions: Array<RecurringCategoryOption>
  onValueChange: (name: keyof RecurringFormValues, value: string) => void
  onTypeChange: (value: RecurringType) => void
}) {
  const categoryOptions = getCategoryOptions(
    values.type,
    incomeCategoryOptions,
    expenseCategoryOptions
  )
  const submitDisabled =
    accountOptions.length === 0 || categoryOptions.length === 0

  return (
    <DashboardFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add recurring item"
      description="Schedule future income or expenses so due dates stay visible before you need to record the actual transaction."
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <RecurringFormFields
          values={values}
          errors={errors}
          accountOptions={accountOptions}
          incomeCategoryOptions={incomeCategoryOptions}
          expenseCategoryOptions={expenseCategoryOptions}
          onValueChange={onValueChange}
          onTypeChange={onTypeChange}
        />

        {categoryOptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Create at least one {values.type} category in Settings before saving
            this recurring item.
          </p>
        ) : null}

        <DashboardFormActions
          pending={pending}
          formError={formError}
          disabled={submitDisabled}
          submitLabel="Save recurring item"
        />
      </form>
    </DashboardFormDialog>
  )
}
