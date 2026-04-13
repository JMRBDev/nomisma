import type { RouteScope } from "./actions-types"

export function normalizeText(value: string) {
  return value.trim().toLowerCase()
}

export function formatCurrency(
  value: number,
  currency: string | null | undefined,
  locale: string
) {
  if (!currency) {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatMonth(month: string, locale: string) {
  const date = new Date(`${month}-01T00:00:00.000Z`)
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

export function resolveMonth(month: unknown, fallback: string) {
  if (typeof month !== "string" || month.trim() === "") return fallback
  const normalized = month.trim()
  return /^\d{4}-\d{2}$/.test(normalized) ? normalized : null
}

export function resolveAmount(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0)
    return value
  if (typeof value !== "string") return null
  const normalized = value.replace(",", ".")
  const match = normalized.match(/-?\d+(?:\.\d+)?/)
  if (!match) return null
  const parsed = Number(match[0])
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

export function resolveNonNegativeAmount(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return value
  }

  if (typeof value !== "string") {
    return null
  }

  const normalized = value.replace(",", ".")
  const match = normalized.match(/-?\d+(?:\.\d+)?/)

  if (!match) {
    return null
  }

  const parsed = Number(match[0])
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

export function resolveDate(value: unknown, fallback?: string) {
  if (typeof value !== "string" || value.trim() === "") {
    return fallback ?? null
  }

  const normalized = value.trim()
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : null
}

export function resolveRouteScope(route?: string): RouteScope | null {
  if (!route) return null
  if (route.includes("/accounts")) return "accounts"
  if (route.includes("/transactions")) return "transactions"
  if (route.includes("/budgets")) return "budgets"
  if (route.includes("/recurring")) return "recurring"
  if (route.includes("/dashboard")) return "overview"
  return null
}
