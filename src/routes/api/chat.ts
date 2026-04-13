import { createFileRoute } from "@tanstack/react-router"
import { chatWithAssistant } from "@/lib/ai-chat/service"

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: ({ request }) => chatWithAssistant(request),
    },
  },
})
