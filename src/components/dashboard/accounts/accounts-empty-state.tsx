import { WalletCardsIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FilteredResultsEmptyState } from "@/components/filtered-results-empty-state"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

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
    <Empty className="border-border/60 bg-card/70">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <WalletCardsIcon className="size-5" />
        </EmptyMedia>
        <EmptyTitle>Add your first account</EmptyTitle>
        <EmptyDescription>
          Create the cash, bank, or wallet accounts you use so balances and
          transaction history have a real home.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onAddAccount}>Add account</Button>
      </EmptyContent>
    </Empty>
  )
}
