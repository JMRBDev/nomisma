import { useState } from "react"
import { toast } from "sonner"

type UseDeleteConfirmationOptions<TId> = {
  onConfirm: (id: TId) => Promise<unknown>
  successMessage?: string
  errorMessage?: string
}

export function useDeleteConfirmation<TId>({
  onConfirm,
  errorMessage = "Unable to delete. Please try again.",
}: UseDeleteConfirmationOptions<TId>) {
  const [pendingId, setPendingId] = useState<TId | null>(null)

  const requestDelete = (id: TId) => {
    setPendingId(id)
  }

  const confirmDelete = async () => {
    if (!pendingId) return

    try {
      await onConfirm(pendingId)
      setPendingId(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : errorMessage)
      setPendingId(null)
    }
  }

  const cancelDelete = () => {
    setPendingId(null)
  }

  return {
    pendingId,
    requestDelete,
    confirmDelete,
    cancelDelete,
    dialogProps: {
      open: pendingId !== null,
      onOpenChange: (open: boolean) => {
        if (!open) cancelDelete()
      },
      onConfirm: confirmDelete,
      pending: pendingId !== null,
    },
  }
}
