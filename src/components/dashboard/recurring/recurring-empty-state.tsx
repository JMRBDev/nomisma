import { PlusIcon, RepeatIcon } from "lucide-react"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { t } from "@/lib/i18n"

export function RecurringEmptyState({
  onAddRecurring,
}: {
  onAddRecurring: () => void
}) {
  return (
    <Empty className="border-border/60 bg-card/70">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <RepeatIcon className="size-5" />
        </EmptyMedia>
        <EmptyTitle>{t("recurring_empty_title")}</EmptyTitle>
        <EmptyDescription>{t("recurring_empty_description")}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onAddRecurring}>
          {t("recurring_add_item")}
          <PlusIcon />
        </Button>
      </EmptyContent>
    </Empty>
  )
}
