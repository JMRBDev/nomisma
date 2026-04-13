import { useEffect } from "react"
import { BotIcon, LoaderIcon } from "lucide-react"
import { ApprovalCard, ToolResultCard } from "./ai-actions-dialog-cards"
import {
  getMessageText,
  isApplyToolPart,
  isToolPart,
} from "./ai-actions-dialog-helpers"
import type { RefObject } from "react"
import type { UIMessage } from "ai"
import { MarkdownText } from "@/components/ui/markdown-text"
import { t } from "@/lib/i18n"

export function DashboardAiChatMessages({
  messages,
  error,
  status,
  scrollContainerRef,
  onScroll,
  scrollToBottom,
  addToolApprovalResponse,
}: {
  messages: Array<UIMessage>
  error: Error | undefined
  status: "submitted" | "streaming" | "ready" | "error"
  scrollContainerRef: RefObject<HTMLDivElement | null>
  onScroll: () => void
  scrollToBottom: () => void
  addToolApprovalResponse: (args: { id: string; approved: boolean }) => void
}) {
  const isBusy = status === "submitted" || status === "streaming"

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  return (
    <div
      ref={scrollContainerRef}
      onScroll={onScroll}
      className="flex-1 space-y-3 overflow-y-auto px-5 py-4"
    >
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-muted">
            <BotIcon className="size-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">{t("ai_welcome")}</p>
        </div>
      ) : null}

      {messages.map((message) => {
        const text = getMessageText(message)
        const isAssistant = message.role === "assistant"
        const bubbleClassName = isAssistant
          ? "mr-10 rounded-2xl border bg-muted/40"
          : "ml-10 rounded-2xl bg-foreground text-background"

        return (
          <div key={message.id} className="space-y-2">
            <div className={`px-3.5 py-2.5 text-sm ${bubbleClassName}`}>
              {text ? (
                isAssistant ? (
                  <MarkdownText content={text} />
                ) : (
                  <div className="wrap-break-word whitespace-pre-wrap">
                    {text}
                  </div>
                )
              ) : isAssistant ? (
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <LoaderIcon className="size-3 animate-spin" />
                  {status === "submitted"
                    ? t("ai_connecting")
                    : t("ai_thinking")}
                </span>
              ) : (
                " "
              )}
            </div>

            {isAssistant
              ? message.parts.filter(isToolPart).map((part) => {
                  if (
                    isApplyToolPart(part) &&
                    part.state === "approval-requested"
                  ) {
                    return (
                      <ApprovalCard
                        key={part.toolCallId}
                        part={part}
                        onApprove={(approvalId) => {
                          void addToolApprovalResponse({
                            id: approvalId,
                            approved: true,
                          })
                        }}
                        onDeny={(approvalId) => {
                          void addToolApprovalResponse({
                            id: approvalId,
                            approved: false,
                          })
                        }}
                      />
                    )
                  }

                  if (
                    (isApplyToolPart(part) &&
                      part.state === "output-available") ||
                    part.state === "output-error"
                  ) {
                    return <ToolResultCard key={part.toolCallId} part={part} />
                  }

                  return null
                })
              : null}
          </div>
        )
      })}

      {isBusy &&
      messages.length > 0 &&
      messages[messages.length - 1].role !== "assistant" ? (
        <div className="mr-10 rounded-2xl border bg-muted/40 px-3.5 py-2.5 text-sm">
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <LoaderIcon className="size-3 animate-spin" />
            {status === "submitted" ? t("ai_connecting") : t("ai_thinking")}
          </span>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-3.5 py-2.5 text-sm">
          {error.message}
        </div>
      ) : null}
    </div>
  )
}
