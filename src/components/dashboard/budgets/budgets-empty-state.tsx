import { PiggyBankIcon, PlusIcon } from "lucide-react"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"

export function BudgetsEmptyState({
  monthLabel,
  onAddBudget,
}: {
  monthLabel: string
  onAddBudget: () => void
}) {
  return (
    <Empty className="border-border/60 bg-card/70">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <PiggyBankIcon className="size-5" />
        </EmptyMedia>
        <EmptyTitle>No budgets for this month yet</EmptyTitle>
        <EmptyDescription>
          Set a limit for {monthLabel} to keep total spending or a specific
          category in view before the month gets away from you.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onAddBudget}>
          Add budget
          <PlusIcon />
        </Button>
      </EmptyContent>
    </Empty>
  )
}
