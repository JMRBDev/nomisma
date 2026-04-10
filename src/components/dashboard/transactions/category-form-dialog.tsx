import type {
  CategoryFieldErrors,
  CategoryFormValues,
} from "@/components/dashboard/transactions/categories-shared"
import { AppearancePicker } from "@/components/appearance-picker"
import { DashboardFormActions } from "@/components/dashboard/dashboard-form-actions"
import { DashboardFormDialog } from "@/components/dashboard/dashboard-form-dialog"
import {
  CATEGORY_ICON_MAP,
  CATEGORY_ICON_OPTIONS,
} from "@/components/dashboard/transactions/categories-shared"
import { FormErrorMessage } from "@/components/form-error-message"
import {
  Field,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { m } from "@/lib/i18n-client"

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
  onValueChange: (name: keyof CategoryFormValues, value: string) => void
}) {
  return (
    <DashboardFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        title ??
        (isEditing ? m.categories_form_edit_title() : m.categories_add())
      }
      description={
        description ??
        (isEditing
          ? m.categories_form_edit_description()
          : m.categories_form_create_description())
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <Field>
          <FieldLabel htmlFor="category-name">
            <FieldTitle>{m.account_form_name_and_appearance()}</FieldTitle>
          </FieldLabel>

          <div className="flex gap-2 items-center">
            <AppearancePicker
              colorValue={values.color}
              iconValue={values.icon}
              onColorChange={(value) => onValueChange("color", value)}
              onIconChange={(value) => onValueChange("icon", value)}
              icons={CATEGORY_ICON_OPTIONS}
              iconMap={CATEGORY_ICON_MAP}
              entityName="category"
            />
            <Input
              id="category-name"
              placeholder={m.categories_form_placeholder()}
              value={values.name}
              onChange={(event) => onValueChange("name", event.target.value)}
            />
          </div>
          <FormErrorMessage error={errors.name} />
        </Field>

        <DashboardFormActions
          pending={pending}
          formError={formError}
          submitLabel={
            submitLabel ??
            (isEditing ? m.settings_save_changes() : m.categories_create())
          }
          pendingLabel={m.common_saving()}
        />
      </form>
    </DashboardFormDialog>
  )
}
