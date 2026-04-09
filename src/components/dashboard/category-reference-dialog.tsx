import type { useCategoryReferenceActions } from "@/hooks/use-category-reference-actions"
import { CategoryFormDialog } from "@/components/dashboard/transactions/category-form-dialog"
import { m } from "@/paraglide/messages"

export function CategoryReferenceDialog({
  categoryActions,
  description,
}: {
  categoryActions: ReturnType<typeof useCategoryReferenceActions>
  description: string
}) {
  return (
    <CategoryFormDialog
      open={categoryActions.manager.dialog.dialogOpen}
      onOpenChange={categoryActions.manager.dialog.handleDialogOpenChange}
      onSubmit={categoryActions.manager.dialog.handleSubmit}
      values={categoryActions.manager.dialog.values}
      errors={categoryActions.manager.dialog.errors}
      formError={categoryActions.manager.dialog.formError}
      pending={categoryActions.manager.dialog.pending}
      isEditing={categoryActions.manager.dialog.isEditing}
      title={m.categories_finish_setup_title()}
      description={description}
      submitLabel={m.categories_create_and_select()}
      onValueChange={categoryActions.manager.dialog.handleValueChange}
    />
  )
}
