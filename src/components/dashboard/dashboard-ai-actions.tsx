/* eslint-disable max-lines */
import { useCallback, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useChat } from "@ai-sdk/react"
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithApprovalResponses,
} from "ai"
import { ArrowUpIcon, BotIcon, SquareIcon } from "lucide-react"
import { toast } from "sonner"
import {
  getCurrentFrontendHints,
  getMutationSuccessMessages,
  invalidateDashboardQueries,
} from "./ai-actions-dialog-helpers"
import { DashboardAiChatMessages } from "./ai-actions-dialog-messages"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { t } from "@/lib/i18n"

const AI_CLIENT_DEBUG_LOGGING_ENABLED = import.meta.env.DEV

function logAiClientDebug(message: string, data?: unknown) {
  if (!AI_CLIENT_DEBUG_LOGGING_ENABLED) {
    return
  }

  if (data === undefined) {
    console.info(`[AI][CLIENT] ${message}`)
    return
  }

  console.info(`[AI][CLIENT] ${message}`, data)
}

export function DashboardAiActions() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const isNearBottomRef = useRef(true)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  const {
    messages,
    sendMessage,
    status,
    stop,
    error,
    addToolApprovalResponse,
  } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: () => {
        const hints = getCurrentFrontendHints()
        logAiClientDebug("Sending request with hints", {
          route: hints.route,
          selectedIds: hints.selectedIds?.length ?? 0,
        })
        return { context: hints }
      },
    }),
    sendAutomaticallyWhen: (message) => {
      const result =
        lastAssistantMessageIsCompleteWithApprovalResponses(message)
      if (result) {
        logAiClientDebug("Auto-sending after approval responses")
      }
      return result
    },
    onFinish: async ({ message, isAbort, isError }) => {
      logAiClientDebug("onFinish", {
        isAbort,
        isError,
        messageParts: message.parts.length,
        partTypes: message.parts.map((p) => p.type),
      })
      if (isAbort || isError) return
      const successMessages = getMutationSuccessMessages(message)
      if (successMessages.length === 0) return
      logAiClientDebug("Mutation success messages", successMessages)
      toast.success(successMessages[successMessages.length - 1])
      await invalidateDashboardQueries(queryClient)
    },
    onError: (err) => {
      console.error("[AI][CLIENT] useChat error", {
        message: err.message,
      })
    },
  })
  const isBusy = status === "submitted" || status === "streaming"
  const scrollToBottom = useCallback(() => {
    const container = scrollContainerRef.current
    if (container && isNearBottomRef.current)
      container.scrollTop = container.scrollHeight
  }, [])
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return
    isNearBottomRef.current =
      container.scrollHeight - container.scrollTop - container.clientHeight < 60
  }, [])
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isBusy) stop()
    setOpen(nextOpen)
  }
  const handleSubmit = async () => {
    const trimmedInput = input.trim()
    if (!trimmedInput || isBusy) return
    logAiClientDebug("Sending message", {
      textLength: trimmedInput.length,
      currentMessageCount: messages.length,
    })
    setInput("")
    isNearBottomRef.current = true
    await sendMessage({ text: trimmedInput })
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        aria-label={t("ai_open")}
      >
        <BotIcon className="size-4" />
        <span className="hidden sm:inline">{t("ai_open")}</span>
      </Button>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          side="right"
          className="flex w-full flex-col p-0 sm:max-w-lg"
        >
          <SheetHeader className="px-5 pt-5 pb-3">
            <SheetTitle className="flex items-center gap-2 text-base">
              <BotIcon className="size-4" />
              {t("ai_title")}
            </SheetTitle>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col">
            <DashboardAiChatMessages
              messages={messages}
              error={error}
              status={status}
              scrollContainerRef={scrollContainerRef}
              onScroll={handleScroll}
              scrollToBottom={scrollToBottom}
              addToolApprovalResponse={addToolApprovalResponse}
            />
          </div>
          <div className="border-t px-5 py-4">
            <div className="flex items-end gap-2">
              <Textarea
                rows={1}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault()
                    void handleSubmit()
                  }
                }}
                placeholder={t("ai_prompt_placeholder")}
                className="max-h-32 min-h-9 resize-none py-2.5"
              />
              {isBusy ? (
                <Button
                  size="icon"
                  variant="outline"
                  className="size-9 shrink-0"
                  onClick={stop}
                >
                  <SquareIcon className="size-3.5" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  className="size-9 shrink-0"
                  disabled={!input.trim()}
                  onClick={() => void handleSubmit()}
                >
                  <ArrowUpIcon className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
