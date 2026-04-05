import { Button } from "@/components/ui/button"
import { FilteredResultsEmptyState } from "@/components/filtered-results-empty-state"
import { GuidedEmptyState } from "@/components/guided-empty-state"
import { WalletCardsIcon } from "lucide-react"

export function AccountsEmptyState({
  hasArchivedAccounts,
  onAddAccount,
}: {
  hasArchivedAccounts: boolean
  onAddAccount: () => void
}) {
  if (hasArchivedAccounts) {
    return (
      <FilteredResultsEmptyState
        title="No active accounts"
        description="Restore an archived account or add a new one to keep tracking where your money lives."
        icon={WalletCardsIcon}
        action={
          <div className="flex justify-center px-6 pb-6">
            <Button onClick={onAddAccount}>Add account</Button>
          </div>
        }
      />
    )
  }

  return (
    <GuidedEmptyState
      title="Add your first account"
      description="Create the cash, bank, or wallet accounts you use so balances and transaction history have a real home."
      icon={<WalletCardsIcon className="size-5" />}
      action={<Button onClick={onAddAccount}>Add account</Button>}
    />
  )
}
