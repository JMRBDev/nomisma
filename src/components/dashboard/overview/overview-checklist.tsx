import { Link } from "@tanstack/react-router"
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  CircleDashedIcon,
} from "lucide-react"
import type { OverviewOnboardingStep } from "@/components/dashboard/overview/overview-shared"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export function OverviewChecklist({
  completedCount,
  totalCount,
  steps,
}: {
  completedCount: number
  totalCount: number
  steps: Array<OverviewOnboardingStep>
}) {
  const checklistProgress = Math.round((completedCount / totalCount) * 100)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{checklistProgress}%</span>
        </div>
        <Progress value={checklistProgress} />
      </div>

      <div className="space-y-3">
        {steps.map((step) => (
          <OverviewChecklistItem key={step.id} step={step} />
        ))}
      </div>
    </div>
  )
}

function OverviewChecklistItem({ step }: { step: OverviewOnboardingStep }) {
  return (
    <div className="flex items-start gap-3 rounded-3xl border border-border/60 p-4">
      <div className="pt-0.5">
        {step.completed ? (
          <CheckCircle2Icon className="size-4 text-emerald-400" />
        ) : (
          <CircleDashedIcon className="size-4 text-muted-foreground" />
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-medium">{step.title}</p>
        <p className="text-sm text-muted-foreground">{step.description}</p>
      </div>

      {step.completed ? (
        <Badge variant="outline">Done</Badge>
      ) : (
        <Button asChild size="sm" variant="outline">
          <Link to={step.href}>
            Open
            <ArrowRightIcon />
          </Link>
        </Button>
      )}
    </div>
  )
}
