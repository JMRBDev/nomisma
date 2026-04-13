import { ConvexHttpClient } from "convex/browser"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { getToken } from "@/lib/auth-server"
import {
  BROWSER_LOCALE_COOKIE_NAME,
  BROWSER_TIME_ZONE_COOKIE_NAME,
  resolveBrowserCalendarContext,
} from "@/lib/browser-calendar"
import { resolveLocaleFromRequest } from "@/lib/i18n"
import { AI_DEBUG_LOGGING_ENABLED as AI_SERVER_DEBUG_LOGGING_ENABLED } from "@/lib/ai-chat/logger"

const convexUrl = process.env.VITE_CONVEX_URL
if (!convexUrl) {
  throw new Error("VITE_CONVEX_URL is not set")
}

const openRouterApiKey = process.env.OPENROUTER_API_KEY
const openRouterPrimaryModelId = process.env.OPENROUTER_MODEL?.trim()
const openRouterFallbackModelId =
  process.env.OPENROUTER_FALLBACK_MODEL?.trim() || undefined
const openRouterFastModelId =
  process.env.OPENROUTER_FAST_MODEL?.trim() || undefined

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
  if (!openRouterPrimaryModelId) {
    throw new Error("OPENROUTER_MODEL must be set.")
  }

  if (AI_SERVER_DEBUG_LOGGING_ENABLED) {
    console.info(`[AI][MODEL] Primary model: ${openRouterPrimaryModelId}`)
  }
  return getOpenRouter()(openRouterPrimaryModelId)
}

export function getAssistantFallbackModel() {
  if (AI_SERVER_DEBUG_LOGGING_ENABLED && openRouterFallbackModelId) {
    console.info(`[AI][MODEL] Fallback model: ${openRouterFallbackModelId}`)
  }
  return openRouterFallbackModelId
    ? getOpenRouter()(openRouterFallbackModelId)
    : null
}

export function getAssistantFastModel() {
  if (AI_SERVER_DEBUG_LOGGING_ENABLED && openRouterFastModelId) {
    console.info(`[AI][MODEL] Fast model: ${openRouterFastModelId}`)
  }
  return openRouterFastModelId ? getOpenRouter()(openRouterFastModelId) : null
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
