import type {
  BudgetCategoryOption,
  BudgetFieldErrors,
  BudgetFormValues,
} from "@/components/dashboard/budgets/budgets-shared"
import { BudgetFormFields } from "@/components/dashboard/budgets/budget-form-fields"
import { DashboardFormActions } from "@/components/dashboard/dashboard-form-actions"
import { DashboardFormDialog } from "@/components/dashboard/dashboard-form-dialog"
import { Button } from "@/components/ui/button"

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
  onValueChange,
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
  onValueChange: (name: keyof BudgetFormValues, value: string) => void
}) {
  return (
    <DashboardFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Edit budget" : "Add budget"}
      description={`Set a spending limit for ${monthLabel}. Saving the same target again updates this month's budget.`}
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <BudgetFormFields
          values={values}
          errors={errors}
          categoryOptions={categoryOptions}
          onValueChange={onValueChange}
        />

        {formError ? (
          <p className="text-sm text-destructive">{formError}</p>
        ) : null}

        <DashboardFormActions
          pending={pending}
          submitLabel={editing ? "Save changes" : "Save budget"}
          secondaryAction={
            editing && onDelete ? (
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
                disabled={pending}
              >
                Delete budget
              </Button>
            ) : null
          }
        />
      </form>
    </DashboardFormDialog>
  )
}
