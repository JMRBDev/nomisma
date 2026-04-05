import { PiggyBankIcon, PlusIcon } from "lucide-react"
import { GuidedEmptyState } from "@/components/guided-empty-state"
import { Button } from "@/components/ui/button"

export function BudgetsEmptyState({
  monthLabel,
  onAddBudget,
}: {
  monthLabel: string
  onAddBudget: () => void
}) {
  return (
    <GuidedEmptyState
      title="No budgets for this month yet"
      description={`Set a limit for ${monthLabel} to keep total spending or a specific category in view before the month gets away from you.`}
      icon={<PiggyBankIcon className="size-5" />}
      action={
        <Button onClick={onAddBudget}>
          Add budget
          <PlusIcon />
        </Button>
      }
    />
  )
}
