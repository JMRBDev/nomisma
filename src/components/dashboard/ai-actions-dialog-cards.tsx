import { getToolSummary } from "./ai-actions-dialog-helpers"
import type { ToolPart } from "./ai-actions-dialog-helpers"
import { Button } from "@/components/ui/button"
import { getChatToolTitle } from "@/lib/ai-actions/actions"
import { t } from "@/lib/i18n"

export function ApprovalCard({
  part,
  onApprove,
  onDeny,
}: {
  part: ToolPart
  onApprove: (approvalId: string) => void
  onDeny: (approvalId: string) => void
}) {
  const summary = getToolSummary(part)
  const approvalId = part.approval?.id

  if (!approvalId) {
    return null
  }

  return (
    <div className="space-y-2.5 rounded-xl border bg-background/80 px-3.5 py-3">
      <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {getChatToolTitle(part.type)}
      </div>
      {summary ? (
        <pre className="overflow-x-auto rounded-lg bg-muted/60 px-3 py-2.5 text-xs whitespace-pre-wrap text-foreground">
          {summary}
        </pre>
      ) : null}
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="outline" onClick={() => onDeny(approvalId)}>
          {t("ai_deny")}
        </Button>
        <Button size="sm" onClick={() => onApprove(approvalId)}>
          {t("ai_approve")}
        </Button>
      </div>
    </div>
  )
}

export function ToolResultCard({ part }: { part: ToolPart }) {
  const isError = part.state === "output-error"
  const outputMessage =
    !isError &&
    part.output &&
    typeof part.output === "object" &&
    "message" in part.output
      ? String(part.output.message)
      : null

  if (!isError && !outputMessage) {
    return null
  }

  return (
    <div
      className={
        isError
          ? "rounded-xl border border-destructive/30 bg-destructive/5 px-3.5 py-2.5 text-sm"
          : "rounded-xl border border-success/30 bg-success/5 px-3.5 py-2.5 text-sm"
      }
    >
      <div className="font-medium">{getChatToolTitle(part.type)}</div>
      <div className="mt-0.5 text-muted-foreground">
        {isError ? part.errorText : outputMessage}
      </div>
    </div>
  )
}
