import type {
  CategoryFieldErrors,
  CategoryFormValues,
} from "@/components/dashboard/transactions/categories-shared"
import { ColorPicker } from "@/components/color-picker"
import { DashboardFormActions } from "@/components/dashboard/dashboard-form-actions"
import { DashboardFormDialog } from "@/components/dashboard/dashboard-form-dialog"
import { CATEGORY_ICON_OPTIONS } from "@/components/dashboard/transactions/categories-shared"
import { FormErrorMessage } from "@/components/form-error-message"
import { IconPicker } from "@/components/icon-picker"
import {
  Field,
  FieldDescription,
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
  title,
  description,
  submitLabel,
  kindDisabled,
  onValueChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  values: CategoryFormValues
  errors: CategoryFieldErrors
  formError: string
  pending: boolean
  isEditing: boolean
  title?: string
  description?: string
  submitLabel?: string
  kindDisabled?: boolean
  onValueChange: (name: keyof CategoryFormValues, value: string) => void
}) {
  return (
    <DashboardFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title ?? (isEditing ? "Edit category" : "Add category")}
      description={
        description ??
        (isEditing
          ? "Update this category."
          : "Create a new category to group your transactions.")
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
              <FormErrorMessage error={errors.name} />
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
                disabled={kindDisabled ?? isEditing}
              >
                {categoryKindOptions.map((option) => (
                  <NativeSelectOption key={option.value} value={option.value}>
                    {option.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldTitle>Color</FieldTitle>
              <FieldDescription>Choose a category color.</FieldDescription>
              <ColorPicker
                value={values.color}
                onChange={(value) => onValueChange("color", value)}
                entityName="category"
              />
              <FormErrorMessage error={errors.color} />
            </Field>

            <Field>
              <FieldTitle>Icon</FieldTitle>
              <FieldDescription>Choose a category icon.</FieldDescription>
              <IconPicker
                value={values.icon}
                onChange={(value) => onValueChange("icon", value)}
                icons={CATEGORY_ICON_OPTIONS}
                colorValue={values.color}
                entityName="category"
              />
              <FormErrorMessage error={errors.icon} />
            </Field>
          </div>
        </FieldGroup>

        <DashboardFormActions
          pending={pending}
          formError={formError}
          submitLabel={
            submitLabel ?? (isEditing ? "Save changes" : "Create category")
          }
          pendingLabel="Saving..."
        />
      </form>
    </DashboardFormDialog>
  )
}
