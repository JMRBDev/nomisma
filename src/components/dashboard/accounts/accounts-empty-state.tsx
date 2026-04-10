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
import { t } from "@/lib/i18n"

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
        title={t("accounts_no_active_title")}
        description={t("accounts_no_active_description")}
        icon={WalletCardsIcon}
        action={
          <div className="flex justify-center px-6 pb-6">
            <Button onClick={onAddAccount}>{t("accounts_add_account")}</Button>
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
        <EmptyTitle>{t("accounts_first_empty_title")}</EmptyTitle>
        <EmptyDescription>
          {t("accounts_first_empty_description")}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onAddAccount}>{t("accounts_add_account")}</Button>
      </EmptyContent>
    </Empty>
  )
}
