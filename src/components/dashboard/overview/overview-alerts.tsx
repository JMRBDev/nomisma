import { CircleAlertIcon } from "lucide-react"
import type { OverviewAlertRecord } from "@/components/dashboard/overview/overview-shared"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getOverviewAlertCopy } from "@/lib/dashboard-i18n"

export function OverviewAlerts({
  alerts,
  currency,
}: {
  alerts: Array<OverviewAlertRecord>
  currency?: string | null
}) {
  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => {
        const copy = getOverviewAlertCopy(alert, currency)

        return (
          <Alert key={`${alert.alertType}-${index}`} variant={alert.kind}>
            <CircleAlertIcon />
            <AlertTitle>{copy.title}</AlertTitle>
            <AlertDescription>{copy.description}</AlertDescription>
          </Alert>
        )
      })}
    </div>
  )
}
