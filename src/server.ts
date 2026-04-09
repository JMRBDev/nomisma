import handler from "@tanstack/react-start/server-entry"
import { paraglideMiddleware } from "@/paraglide/server"
import { shouldHandleI18n } from "@/lib/i18n"

export default {
  async fetch(request: Request) {
    const { pathname } = new URL(request.url)

    if (!shouldHandleI18n(pathname)) {
      return handler.fetch(request)
    }

    return paraglideMiddleware(request, () => handler.fetch(request))
  },
}
