import { CircleAlertIcon } from "lucide-react"
import type { OverviewAlertRecord } from "@/components/dashboard/overview/overview-shared"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function OverviewAlerts({
  alerts,
}: {
  alerts: Array<OverviewAlertRecord>
}) {
  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => (
        <Alert key={`${alert.title}-${index}`} variant={alert.kind}>
          <CircleAlertIcon />
          <AlertTitle>{alert.title}</AlertTitle>
          <AlertDescription>{alert.description}</AlertDescription>
        </Alert>
      ))}
    </div>
  )
}
