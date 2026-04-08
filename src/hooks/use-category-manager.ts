import { useConvexMutation } from "@convex-dev/react-query"
import { api } from "../../convex/_generated/api"
import type {
  CategoryFieldErrors,
  CategoryFormValues,
  CategoryRecord,
} from "@/components/dashboard/transactions/categories-shared"
import {
  DEFAULT_CATEGORY_VALUES,
  buildCategoryPayload,
  validateCategoryValues,
} from "@/components/dashboard/transactions/categories-shared"
import { useFormDialog } from "@/hooks/use-form-dialog"

export function useCategoryManager() {
  const createCategory = useConvexMutation(api.categories.createCategory)
  const updateCategory = useConvexMutation(api.categories.updateCategory)
  const toggleCategoryArchived = useConvexMutation(
    api.categories.toggleCategoryArchived
  )

  const dialog = useFormDialog<
    CategoryFormValues,
    CategoryFieldErrors,
    CategoryRecord
  >({
    createDefaults: () => ({ ...DEFAULT_CATEGORY_VALUES }),
    createFormValues: (category) => ({
      name: category.name,
      kind: category.kind,
      color: category.color ?? "",
      icon: category.icon ?? "",
    }),
    validate: validateCategoryValues,
    onSubmit: async (values) => {
      if (dialog.isEditing && dialog.editingEntity) {
        await updateCategory({
          categoryId: dialog.editingEntity._id,
          name: values.name.trim(),
          color: values.color.trim() || undefined,
          icon: values.icon.trim() || undefined,
        })
      } else {
        await createCategory(buildCategoryPayload(values))
      }
    },
    onValueChange: (name, value, { setValues, setErrors, setFormError }) => {
      setValues((current) => ({
        ...current,
        [name]: value,
      }))
      setErrors({})
      setFormError("")
    },
  })

  return {
    dialog,
    toggleCategoryArchived,
  }
}
