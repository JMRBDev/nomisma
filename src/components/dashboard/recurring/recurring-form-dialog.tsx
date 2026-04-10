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
import { t } from "@/lib/i18n"

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
  categoryOptions,
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
  categoryOptions: Array<RecurringCategoryOption>
  allCategoryOptions: Array<RecurringCategoryOption>
  onValueChange: (name: keyof RecurringFormValues, value: string) => void
  onTypeChange: (value: RecurringType) => void
  onCreateAccount: (name: string) => void
  onUnarchiveAccount: (accountId: string) => void
  onCreateCategory: (name: string) => void
  onUnarchiveCategory: (categoryId: string) => void
}) {
  const resolvedCategoryOptions = getCategoryOptions(values.type, categoryOptions)

  return (
    <DashboardFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        editing ? t("recurring_form_edit_title") : t("recurring_add_item")
      }
      description={t("recurring_form_description")}
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <RecurringFormFields
          values={values}
          errors={errors}
          accountOptions={accountOptions}
          allAccountOptions={allAccountOptions}
          categoryOptions={categoryOptions}
          allCategoryOptions={allCategoryOptions}
          onValueChange={onValueChange}
          onTypeChange={onTypeChange}
          onCreateAccount={onCreateAccount}
          onUnarchiveAccount={onUnarchiveAccount}
          onCreateCategory={onCreateCategory}
          onUnarchiveCategory={onUnarchiveCategory}
        />

        {resolvedCategoryOptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("recurring_form_create_category_hint")}
          </p>
        ) : null}

        <DashboardFormActions
          pending={pending}
          formError={formError}
          submitLabel={
            editing
              ? t("recurring_form_update_submit")
              : t("recurring_form_save_submit")
          }
        />
      </form>
    </DashboardFormDialog>
  )
}
