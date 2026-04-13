import { ConvexHttpClient } from "convex/browser"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { getToken } from "@/lib/auth-server"
import {
  BROWSER_LOCALE_COOKIE_NAME,
  BROWSER_TIME_ZONE_COOKIE_NAME,
  resolveBrowserCalendarContext,
} from "@/lib/browser-calendar"
import { resolveLocaleFromRequest } from "@/lib/i18n"

const convexUrl = process.env.VITE_CONVEX_URL
if (!convexUrl) {
  throw new Error("VITE_CONVEX_URL is not set")
}

const openRouterApiKey = process.env.OPENROUTER_API_KEY
const openRouterModelId = process.env.OPENROUTER_MODEL ?? "openrouter/free"

function getCookieValue(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie")

  if (!cookieHeader) {
    return undefined
  }

  for (const cookie of cookieHeader.split(";")) {
    const [rawName, ...rest] = cookie.trim().split("=")

    if (rawName !== name) {
      continue
    }

    return decodeURIComponent(rest.join("="))
  }

  return undefined
}

export async function createAuthedConvexServerClient() {
  const token = await getToken()

  if (!token) {
    return null
  }

  const client = new ConvexHttpClient(convexUrl as string)
  client.setAuth(token)
  return client
}

function getOpenRouter() {
  if (!openRouterApiKey) {
    throw new Error("OPENROUTER_API_KEY is not set")
  }

  return createOpenRouter({
    apiKey: openRouterApiKey,
  })
}

export function getAssistantModel() {
  return getOpenRouter()(openRouterModelId)
}

export function resolveAiRequestContext(request: Request) {
  const locale = resolveLocaleFromRequest(request)
  const calendarContext = resolveBrowserCalendarContext({
    timeZone: getCookieValue(request, BROWSER_TIME_ZONE_COOKIE_NAME),
    locale:
      getCookieValue(request, BROWSER_LOCALE_COOKIE_NAME) ??
      request.headers.get("accept-language"),
  })

  return {
    locale,
    calendarContext,
  }
}
