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
import { m } from "@/lib/i18n-client"

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
        title={m.accounts_no_active_title()}
        description={m.accounts_no_active_description()}
        icon={WalletCardsIcon}
        action={
          <div className="flex justify-center px-6 pb-6">
            <Button onClick={onAddAccount}>{m.accounts_add_account()}</Button>
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
        <EmptyTitle>{m.accounts_first_empty_title()}</EmptyTitle>
        <EmptyDescription>
          {m.accounts_first_empty_description()}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onAddAccount}>{m.accounts_add_account()}</Button>
      </EmptyContent>
    </Empty>
  )
}
