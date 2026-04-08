import { useRef } from "react"
import { useConvexMutation } from "@convex-dev/react-query"
import { useRouter } from "@tanstack/react-router"
import { api } from "../../convex/_generated/api"
import { useCategoryManager } from "@/hooks/use-category-manager"

export function useCategoryReferenceActions() {
  const router = useRouter()
  const toggleCategoryArchived = useConvexMutation(
    api.categories.toggleCategoryArchived
  )
  const onSelectRef = useRef<(categoryId: string) => void>(() => {})

  const manager = useCategoryManager({
    onCreateSuccess: async (categoryId) => {
      await router.invalidate()
      onSelectRef.current(categoryId)
    },
  })

  const handleCreateCategory = (
    name: string,
    onSelect: (categoryId: string) => void
  ) => {
    onSelectRef.current = onSelect
    manager.dialog.openCreateDialog({
      name,
    })
  }

  const handleUnarchiveCategory = async (
    categoryId: string,
    onSelect: (categoryId: string) => void
  ) => {
    await toggleCategoryArchived({
      categoryId:
        categoryId as Parameters<typeof toggleCategoryArchived>[0]["categoryId"],
      archived: false,
    })
    await router.invalidate()
    onSelect(categoryId)
  }

  return {
    manager,
    handleCreateCategory,
    handleUnarchiveCategory,
  }
}
