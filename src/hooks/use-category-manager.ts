import { useConvexMutation } from "@convex-dev/react-query"
import { api } from "../../convex/_generated/api"
import type { CategoryTableRow } from "@/components/dashboard/transactions/categories-table"
import { useFormDialog } from "@/hooks/use-form-dialog"

type CategoryFormValues = {
  name: string
  kind: "income" | "expense"
}

type CategoryFieldErrors = Partial<Record<"name", string>>

function validate(values: CategoryFormValues): CategoryFieldErrors {
  const errors: CategoryFieldErrors = {}
  if (!values.name.trim()) {
    errors.name = "Category name is required."
  }
  return errors
}

export function useCategoryManager() {
  const createCategory = useConvexMutation(api.categories.createCategory)
  const updateCategory = useConvexMutation(api.categories.updateCategory)
  const toggleCategoryArchived = useConvexMutation(
    api.categories.toggleCategoryArchived
  )

  const dialog = useFormDialog<
    CategoryFormValues,
    CategoryFieldErrors,
    CategoryTableRow
  >({
    createDefaults: () => ({ name: "", kind: "expense" }),
    createFormValues: (category) => ({
      name: category.name,
      kind: category.kind,
    }),
    validate,
    onSubmit: async (values) => {
      if (dialog.isEditing && dialog.editingEntity) {
        await updateCategory({
          categoryId: dialog.editingEntity._id,
          name: values.name,
        })
      } else {
        await createCategory({
          kind: values.kind,
          name: values.name,
        })
      }
    },
  })

  return {
    dialog,
    toggleCategoryArchived,
  }
}
