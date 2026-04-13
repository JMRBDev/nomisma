import { resolveRouteScope } from "./actions-helpers"
import {
  actionDefinitions,
  actionIntentPattern,
  informationalPattern,
  routeFallbackDomains,
  transactionQuestionPattern,
} from "./actions-constants"
import {
  getMessageText,
  getReferencedActions,
  hasActiveToolFlow,
  inferDomains,
  uniqueActions,
} from "./actions-utils"
import type {
  ActionDomain,
  AiActionDefinition,
  AssistantTurnPlan,
  RouteScope,
} from "./actions-types"
import type { FrontendHints } from "@/lib/ai-actions/shared"
import type { UIMessage } from "ai"

function selectIntentActions(
  domains: Array<ActionDomain>,
  routeScope: RouteScope | null
) {
  let selected = actionDefinitions

  if (domains.length > 0) {
    selected = selected.filter((action) =>
      action.domains.some((domain) => domains.includes(domain))
    )
  }

  if (routeScope) {
    const inRoute = selected.filter((action) =>
      action.routeScopes?.includes(routeScope)
    )

    if (inRoute.length > 0) {
      selected = inRoute
    }
  }

  if (selected.length > 0) {
    return selected
  }

  if (routeScope) {
    const fallback = actionDefinitions.filter((action) =>
      action.routeScopes?.includes(routeScope)
    )

    if (fallback.length > 0) {
      return fallback
    }
  }

  if (domains.length > 0 && routeScope) {
    const fallbackDomains = routeFallbackDomains[routeScope]
    return actionDefinitions.filter((action) =>
      action.domains.some((domain) => fallbackDomains.includes(domain))
    )
  }

  return actionDefinitions
}

function buildContextFromActions(actions: Array<AiActionDefinition>) {
  const contextFields = new Set(
    actions.flatMap((action) => action.contextFields)
  )

  return {
    includeAccounts: contextFields.has("accounts"),
    includeBudgets: contextFields.has("budgets"),
    includeCategories: contextFields.has("categories"),
    includeRecentTransactions: contextFields.has("transactions"),
    includeRecurringRules: contextFields.has("recurringRules"),
  }
}

function buildAnswerContextPlan(
  text: string,
  domains: Array<ActionDomain>,
  hints: FrontendHints
) {
  const includeBudgets = domains.includes("budget")
  const includeSelectedTransactions = (hints.selectedIds?.length ?? 0) > 0

  return {
    includeAccounts: domains.includes("account"),
    includeBudgets,
    includeCategories: domains.includes("category") || includeBudgets,
    includeRecentTransactions:
      domains.includes("transaction") &&
      (!includeSelectedTransactions || transactionQuestionPattern.test(text)),
    includeRecurringRules: domains.includes("recurring"),
  }
}

export function planAssistantTurn(
  messages: Array<UIMessage>,
  hints: FrontendHints
): AssistantTurnPlan {
  const routeScope = resolveRouteScope(hints.route)
  const recentMessages = messages.slice(-4)
  const lastUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user")
  const text = (lastUserMessage ? getMessageText(lastUserMessage) : "").trim()
  const domains = inferDomains(text)
  const activeToolFlow = hasActiveToolFlow(recentMessages)
  const hasActionVerb = text !== "" && actionIntentPattern.test(text)
  const isInformational = informationalPattern.test(text)
  const hasDomainContext = domains.length > 0
  const mode =
    activeToolFlow || (hasActionVerb && !isInformational) ? "action" : "answer"

  const referencedActions = getReferencedActions(recentMessages)
  const domainFallbackActions =
    !hasActionVerb && hasDomainContext && !isInformational
      ? selectIntentActions(domains, routeScope)
      : []
  const intentActions =
    mode === "action" ? selectIntentActions(domains, routeScope) : []
  const actions =
    intentActions.length > 0 ||
    referencedActions.length > 0 ||
    domainFallbackActions.length > 0
      ? uniqueActions([
          ...intentActions,
          ...referencedActions,
          ...domainFallbackActions,
        ])
      : []

  return {
    actions,
    context:
      actions.length > 0
        ? buildContextFromActions(actions)
        : buildAnswerContextPlan(text, domains, hints),
    keepRecentToolMessageCount: activeToolFlow ? 4 : mode === "action" ? 2 : 0,
    lastUserText: text,
    mode,
  }
}
