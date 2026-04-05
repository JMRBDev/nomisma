import { PlusIcon, RepeatIcon } from "lucide-react"
import { GuidedEmptyState } from "@/components/guided-empty-state"
import { Button } from "@/components/ui/button"

export function RecurringEmptyState({
  onAddRecurring,
}: {
  onAddRecurring: () => void
}) {
  return (
    <GuidedEmptyState
      title="No recurring items yet"
      description="Add your regular bills or expected income so upcoming money movements stay visible before they hit your account history."
      icon={<RepeatIcon className="size-5" />}
      action={
        <Button onClick={onAddRecurring}>
          Add recurring item
          <PlusIcon />
        </Button>
      }
    />
  )
}
