import { createFileRoute } from "@tanstack/react-router"
import { createAiLogger } from "@/lib/ai-chat/logger"
import { chatWithAssistant } from "@/lib/ai-chat/service"

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: ({ request }) => {
        const log = createAiLogger()
        log.step("API", "POST /api/chat received", {
          url: request.url,
          method: request.method,
          contentType: request.headers.get("content-type"),
        })
        return chatWithAssistant(request, log)
      },
    },
  },
})
