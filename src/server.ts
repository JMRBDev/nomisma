import { AsyncLocalStorage } from "node:async_hooks"
import handler from "@tanstack/react-start/server-entry"
import {
  buildLocaleCookieValue,
  getLocaleRedirectPath,
  resolveLocaleFromRequest,
  type AppLocale,
} from "@/lib/i18n"

type RequestLocaleStore = {
  locale: AppLocale
}

const localeStore = new AsyncLocalStorage<RequestLocaleStore>()

;(globalThis as { __nomismaLocaleStore?: typeof localeStore }).__nomismaLocaleStore =
  localeStore

export default {
  fetch(request: Request) {
    const url = new URL(request.url)
    const localeRedirect = getLocaleRedirectPath(url.pathname)

    if (localeRedirect) {
      url.pathname = localeRedirect.pathname

      return new Response(null, {
        status: 308,
        headers: {
          location: url.toString(),
          "set-cookie": buildLocaleCookieValue(localeRedirect.locale),
        },
      })
    }

    const locale = resolveLocaleFromRequest(request)
    return localeStore.run({ locale }, () => handler.fetch(request))
  },
}
