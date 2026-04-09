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
import { m } from "@/paraglide/messages"

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
        <EmptyTitle>{m.recurring_empty_title()}</EmptyTitle>
        <EmptyDescription>
          {m.recurring_empty_description()}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onAddRecurring}>
          {m.recurring_add_item()}
          <PlusIcon />
        </Button>
      </EmptyContent>
    </Empty>
  )
}
