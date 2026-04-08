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
  editing = false,
  accountOptions,
  allAccountOptions,
  incomeCategoryOptions,
  expenseCategoryOptions,
  allCategoryOptions,
  onValueChange,
  onTypeChange,
  onCreateAccount,
  onUnarchiveAccount,
  onCreateCategory,
  onUnarchiveCategory,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  values: RecurringFormValues
  errors: RecurringFieldErrors
  formError: string
  pending: boolean
  editing?: boolean
  accountOptions: Array<RecurringAccountOption>
  allAccountOptions: Array<RecurringAccountOption>
  incomeCategoryOptions: Array<RecurringCategoryOption>
  expenseCategoryOptions: Array<RecurringCategoryOption>
  allCategoryOptions: Array<RecurringCategoryOption>
  onValueChange: (name: keyof RecurringFormValues, value: string) => void
  onTypeChange: (value: RecurringType) => void
  onCreateAccount: (name: string) => void
  onUnarchiveAccount: (accountId: string) => void
  onCreateCategory: (name: string) => void
  onUnarchiveCategory: (categoryId: string) => void
}) {
  const categoryOptions = getCategoryOptions(
    values.type,
    incomeCategoryOptions,
    expenseCategoryOptions
  )

  return (
    <DashboardFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Edit recurring item" : "Add recurring item"}
      description="Schedule future income or expenses so due dates stay visible before you need to record the actual transaction."
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <RecurringFormFields
          values={values}
          errors={errors}
          accountOptions={accountOptions}
          allAccountOptions={allAccountOptions}
          incomeCategoryOptions={incomeCategoryOptions}
          expenseCategoryOptions={expenseCategoryOptions}
          allCategoryOptions={allCategoryOptions}
          onValueChange={onValueChange}
          onTypeChange={onTypeChange}
          onCreateAccount={onCreateAccount}
          onUnarchiveAccount={onUnarchiveAccount}
          onCreateCategory={onCreateCategory}
          onUnarchiveCategory={onUnarchiveCategory}
        />

        {categoryOptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You can create a {values.type} category directly from the category
            field if you need a new one.
          </p>
        ) : null}

        <DashboardFormActions
          pending={pending}
          formError={formError}
          submitLabel={
            editing ? "Update recurring item" : "Save recurring item"
          }
        />
      </form>
    </DashboardFormDialog>
  )
}
