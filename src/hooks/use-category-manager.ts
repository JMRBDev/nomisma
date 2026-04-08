import { useConvexMutation } from "@convex-dev/react-query"
import { api } from "../../convex/_generated/api"
import type {
  CategoryFieldErrors,
  CategoryFormValues,
  CategoryRecord,
} from "@/components/dashboard/transactions/categories-shared"
import {
  buildCategoryPayload,
  createDefaultCategoryValues,
  resolveCategoryAppearance,
  validateCategoryValues,
} from "@/components/dashboard/transactions/categories-shared"
import { useFormDialog } from "@/hooks/use-form-dialog"

export function useCategoryManager({
  onCreateSuccess,
}: {
  onCreateSuccess?: (categoryId: string) => Promise<unknown> | unknown
} = {}) {
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
    createDefaults: createDefaultCategoryValues,
    createFormValues: (category) => ({
      name: category.name,
      kind: category.kind,
      ...resolveCategoryAppearance(category),
    }),
    validate: validateCategoryValues,
    onSubmit: async (values) => {
      const payload = buildCategoryPayload(values)

      if (dialog.isEditing && dialog.editingEntity) {
        await updateCategory({
          categoryId: dialog.editingEntity._id,
          name: payload.name,
          color: payload.color,
          icon: payload.icon,
        })
      } else {
        return createCategory(payload)
      }
    },
    onSubmitSuccess: async (result) => {
      if (!dialog.isEditing && typeof result === "string") {
        await onCreateSuccess?.(result)
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
