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
        <EmptyTitle>No recurring items yet</EmptyTitle>
        <EmptyDescription>
          Add your regular bills or expected income so upcoming money movements
          stay visible before they hit your account history.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onAddRecurring}>
          Add recurring item
          <PlusIcon />
        </Button>
      </EmptyContent>
    </Empty>
  )
}
