import { useRef } from "react"
import { useConvexMutation } from "@convex-dev/react-query"
import { useRouter } from "@tanstack/react-router"
import { api } from "../../convex/_generated/api"
import { useAccountCreator } from "@/hooks/use-account-creator"

export function useAccountReferenceActions() {
  const router = useRouter()
  const createAccount = useConvexMutation(api.accounts.createAccount)
  const toggleAccountArchived = useConvexMutation(
    api.accounts.toggleAccountArchived
  )
  const onSelectRef = useRef<(accountId: string) => void>(() => {})

  const creator = useAccountCreator({
    onCreateAccount: (payload) => createAccount(payload),
    onCreateSuccess: async (accountId) => {
      await router.invalidate()
      onSelectRef.current(accountId)
    },
  })

  const handleCreateAccount = (
    name: string,
    onSelect: (accountId: string) => void
  ) => {
    onSelectRef.current = onSelect
    creator.openDialog({ name })
  }

  const handleUnarchiveAccount = async (
    accountId: string,
    onSelect: (accountId: string) => void
  ) => {
    await toggleAccountArchived({
      accountId: accountId as Parameters<typeof toggleAccountArchived>[0]["accountId"],
      archived: false,
    })
    await router.invalidate()
    onSelect(accountId)
  }

  return {
    creator,
    handleCreateAccount,
    handleUnarchiveAccount,
  }
}

