import { DashboardFormActions } from "@/components/dashboard/dashboard-form-actions"
import { DashboardFormDialog } from "@/components/dashboard/dashboard-form-dialog"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

const categoryKindOptions = [
  { label: "Expense", value: "expense" },
  { label: "Income", value: "income" },
]

export function CategoryFormDialog({
  open,
  onOpenChange,
  onSubmit,
  values,
  errors,
  formError,
  pending,
  isEditing,
  onValueChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  values: { name: string; kind: "income" | "expense" }
  errors: { name?: string }
  formError: string
  pending: boolean
  isEditing: boolean
  onValueChange: (name: "name" | "kind", value: string) => void
}) {
  return (
    <DashboardFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit category" : "Add category"}
      description={
        isEditing
          ? "Update this category."
          : "Create a new category to group your transactions."
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="category-name">
                <FieldTitle>Name</FieldTitle>
              </FieldLabel>
              <Input
                id="category-name"
                placeholder="e.g. Groceries, Salary"
                value={values.name}
                onChange={(event) => onValueChange("name", event.target.value)}
              />
              {errors.name ? (
                <p className="text-sm text-destructive">{errors.name}</p>
              ) : null}
            </Field>

            <Field>
              <FieldLabel htmlFor="category-kind">
                <FieldTitle>Type</FieldTitle>
              </FieldLabel>
              <NativeSelect
                id="category-kind"
                value={values.kind}
                onChange={(event) =>
                  onValueChange(
                    "kind",
                    event.target.value as "income" | "expense"
                  )
                }
                disabled={isEditing}
              >
                {categoryKindOptions.map((option) => (
                  <NativeSelectOption key={option.value} value={option.value}>
                    {option.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
          </div>
        </FieldGroup>

        <DashboardFormActions
          pending={pending}
          formError={formError}
          submitLabel={isEditing ? "Save changes" : "Create category"}
          pendingLabel="Saving..."
        />
      </form>
    </DashboardFormDialog>
  )
}
