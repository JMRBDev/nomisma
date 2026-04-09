import type {
  BudgetCategoryOption,
  BudgetFieldErrors,
  BudgetFormValues,
} from "@/components/dashboard/budgets/budgets-shared"
import type { CategoryOption } from "@/components/dashboard/transactions/transactions-shared"
import { BudgetFormFields } from "@/components/dashboard/budgets/budget-form-fields"
import { DashboardFormActions } from "@/components/dashboard/dashboard-form-actions"
import { DashboardFormDialog } from "@/components/dashboard/dashboard-form-dialog"
import { Button } from "@/components/ui/button"
import { m } from "@/paraglide/messages"

export function BudgetFormDialog({
  open,
  onOpenChange,
  onSubmit,
  onDelete,
  editing,
  monthLabel,
  values,
  errors,
  formError,
  pending,
  categoryOptions,
  allCategoryOptions,
  onValueChange,
  onCreateCategory,
  onUnarchiveCategory,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onDelete?: () => void
  editing: boolean
  monthLabel: string
  values: BudgetFormValues
  errors: BudgetFieldErrors
  formError: string
  pending: boolean
  categoryOptions: Array<BudgetCategoryOption>
  allCategoryOptions: Array<CategoryOption>
  onValueChange: (name: keyof BudgetFormValues, value: string) => void
  onCreateCategory: (name: string) => void
  onUnarchiveCategory: (categoryId: string) => void
}) {
  return (
    <DashboardFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? m.budgets_form_edit_title() : m.budgets_add_budget()}
      description={m.budgets_form_description({ month: monthLabel })}
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <BudgetFormFields
          values={values}
          errors={errors}
          categoryOptions={categoryOptions}
          allCategoryOptions={allCategoryOptions}
          onValueChange={onValueChange}
          onCreateCategory={onCreateCategory}
          onUnarchiveCategory={onUnarchiveCategory}
        />

        <DashboardFormActions
          pending={pending}
          formError={formError}
          submitLabel={
            editing ? m.settings_save_changes() : m.budgets_form_save()
          }
          secondaryAction={
            editing && onDelete ? (
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
                disabled={pending}
              >
                {m.budgets_form_delete()}
              </Button>
            ) : null
          }
        />
      </form>
    </DashboardFormDialog>
  )
}
