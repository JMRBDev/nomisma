import { tool } from "ai"
import { accountCreateDefinition } from "./action-account"
import { budgetAdjustDefinition, budgetCreateDefinition } from "./action-budget"
import {
  categoryCreateDefinition,
  categoryUpdateDefinition,
} from "./action-category"
import { categorizeDefinition } from "./action-categorize"
import { resolveRouteScope } from "./actions-helpers"
import {
  recurringCreateDefinition,
  recurringMarkDefinition,
} from "./action-recurring"
import {
  recurringConfirmDefinition,
  recurringCreateRuleDefinition,
  recurringPauseDefinition,
  recurringResumeDefinition,
  recurringUpdateDefinition,
} from "./action-recurring-rule"
import {
  transactionAutocategorizeDefinition,
  transactionCreateDefinition,
  transactionDeleteDefinition,
  transactionUpdateDefinition,
} from "./action-transaction"
import type { UIMessage } from "ai"
import type {
  ActionDomain,
  AiActionDefinition,
  PlannerContext,
  RouteScope,
} from "./actions-types"
import type { FrontendHints } from "@/lib/ai-actions/shared"

export type { AiActionDefinition, PlannerContext } from "./actions-types"

export type AssistantContextPlan = {
  includeAccounts: boolean
  includeBudgets: boolean
  includeCategories: boolean
  includeRecentTransactions: boolean
  includeRecurringRules: boolean
}

export type AssistantTurnPlan = {
  actions: Array<AiActionDefinition>
  context: AssistantContextPlan
  keepRecentToolMessageCount: number
  lastUserText: string
  mode: "action" | "answer"
}

const chatToolTitleOverrides: Record<string, string> = {
  AccountCreate: "Create account",
  BudgetCreate: "Create budget",
  BudgetAdjust: "Adjust budget",
  CategoryCreate: "Create category",
  CategoryUpdate: "Update category",
  RecurringConfirmDue: "Confirm recurring item",
  RecurringCreate: "Create recurring item",
  RecurringPause: "Pause recurring item",
  RecurringResume: "Resume recurring item",
  RecurringUpdate: "Update recurring item",
  TransactionCategorize: "Categorize transactions",
  TransactionAutocategorizeUncategorized:
    "Auto-categorize uncategorized transactions",
  TransactionCreate: "Create transaction",
  TransactionDelete: "Delete transaction",
  ReminderCreateFromTransaction: "Create reminder from transaction",
  TransactionMarkRecurring: "Mark transaction as recurring",
  TransactionUpdate: "Update transaction",
}

const actionDefinitions: Array<AiActionDefinition> = [
  transactionCreateDefinition,
  transactionUpdateDefinition,
  transactionDeleteDefinition,
  transactionAutocategorizeDefinition,
  categorizeDefinition,
  accountCreateDefinition,
  categoryCreateDefinition,
  categoryUpdateDefinition,
  budgetCreateDefinition,
  budgetAdjustDefinition,
  recurringCreateRuleDefinition,
  recurringUpdateDefinition,
  recurringPauseDefinition,
  recurringResumeDefinition,
  recurringConfirmDefinition,
  recurringCreateDefinition,
  recurringMarkDefinition,
]

const routeFallbackDomains: Record<RouteScope, Array<ActionDomain>> = {
  overview: ["transaction", "account", "budget", "recurring"],
  accounts: ["account", "transaction"],
  transactions: ["transaction", "category", "recurring"],
  budgets: ["budget", "category"],
  recurring: ["recurring", "transaction", "category"],
}

const actionIntentPattern =
  /\b(add|adjust|auto-?categorize|categorize|change|confirm|create|delete|edit|make|mark|move|pause|remove|rename|resume|save|transfer|update)\b/i
const informationalPattern =
  /^\s*(explain|how|list|show|summarize|tell me|what|when|where|which|who|why)\b/i
const transactionQuestionPattern =
  /\b(expense|expenses|income|latest|last|pay(?:ment)?|paid|recent|spent|spend|transaction|transactions|transfer)\b/i

function toToolSegment(actionKey: string) {
  return actionKey
    .split(".")
    .flatMap((part) => part.split("_"))
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("")
}

function toTitleFromSegment(segment: string) {
  const override = chatToolTitleOverrides[segment]

  if (override) {
    return override
  }

  return segment
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace(/^./, (value) => value.toUpperCase())
}

function getPrepareToolName(actionKey: string) {
  return `prepare${toToolSegment(actionKey)}`
}

function getApplyToolName(actionKey: string) {
  return `apply${toToolSegment(actionKey)}`
}

function getMessageText(message: UIMessage) {
  return message.parts
    .filter(
      (part): part is { type: "text"; text: string } => part.type === "text"
    )
    .map((part) => part.text)
    .join("\n")
    .trim()
}

function isToolPart(
  part: UIMessage["parts"][number]
): part is Extract<UIMessage["parts"][number], { type: `tool-${string}` }> {
  return typeof part.type === "string" && part.type.startsWith("tool-")
}

function hasActiveToolFlow(messages: Array<UIMessage>) {
  return messages.some((message) =>
    message.parts.some(
      (part) =>
        isToolPart(part) &&
        (part.state === "approval-requested" ||
          part.state === "approval-responded" ||
          part.state === "input-available" ||
          part.state === "input-streaming")
    )
  )
}

function inferDomains(text: string) {
  const normalized = text.toLowerCase()
  const domains = new Set<ActionDomain>()

  if (/\b(account|accounts|cash|checking|savings|wallet)\b/.test(normalized)) {
    domains.add("account")
  }

  if (/\b(budget|budgets|limit|limits)\b/.test(normalized)) {
    domains.add("budget")
  }

  if (
    /\b(category|categories)\b/.test(normalized) &&
    !/\b(categorize|autocategorize|auto-categorize)\b/.test(normalized)
  ) {
    domains.add("category")
  }

  if (
    /\b(recurring|reminder|repeat|subscription|subscriptions|due)\b/.test(
      normalized
    )
  ) {
    domains.add("recurring")
  }

  if (
    /\b(auto-?categorize|categorize|deposit|expense|expenses|income|paid|pay(?:ment)?|spent|spend|transaction|transactions|transfer)\b/.test(
      normalized
    )
  ) {
    domains.add("transaction")
  }

  return [...domains]
}

function uniqueActions(actions: Array<AiActionDefinition>) {
  const actionsByKey = new Map(actions.map((action) => [action.key, action]))
  return [...actionsByKey.values()]
}

function getActionByToolPartType(partType: string) {
  const match = partType.match(/^tool-(?:prepare|apply)(.+)$/)

  if (!match) {
    return null
  }

  const segment = match[1]
  return (
    actionDefinitions.find((action) => toToolSegment(action.key) === segment) ??
    null
  )
}

function getReferencedActions(messages: Array<UIMessage>) {
  return uniqueActions(
    messages.flatMap((message) =>
      message.parts.flatMap((part) => {
        if (!isToolPart(part)) {
          return []
        }

        const action = getActionByToolPartType(part.type)
        return action ? [action] : []
      })
    )
  )
}

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
): AssistantContextPlan {
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
  const mode =
    activeToolFlow ||
    (text !== "" &&
      actionIntentPattern.test(text) &&
      !informationalPattern.test(text))
      ? "action"
      : "answer"

  const referencedActions = getReferencedActions(recentMessages)
  const intentActions =
    mode === "action" ? selectIntentActions(domains, routeScope) : []
  const actions =
    intentActions.length > 0 || referencedActions.length > 0
      ? uniqueActions([...intentActions, ...referencedActions])
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

function createPrepareActionTool(
  action: AiActionDefinition,
  context: PlannerContext
) {
  return tool({
    description: `Prepare ${action.title.toLowerCase()} using the user's request before applying it.`,
    inputSchema: action.generatedInputSchema,
    execute: (input) => {
      const result = action.normalize(context, input as Record<string, unknown>)

      if (result.type === "ready") {
        return {
          state: "ready" as const,
          actionKey: action.key,
          actionTitle: action.title,
          summary: result.summary,
          normalizedInput: result.normalizedInput,
        }
      }

      if (result.type === "clarify") {
        return {
          state: "clarify" as const,
          actionKey: action.key,
          actionTitle: action.title,
          question: result.question,
          missingFields: result.missingFields ?? [],
          options: result.options ?? [],
        }
      }

      return {
        state: "no_match" as const,
        actionKey: action.key,
        actionTitle: action.title,
        reason: result.reason,
      }
    },
  })
}

function createApplyActionTool(
  action: AiActionDefinition,
  client: Parameters<AiActionDefinition["execute"]>[0]
) {
  return tool({
    description: `${action.title} after the user has approved the exact normalized input.`,
    inputSchema: action.normalizedInputSchema,
    needsApproval: true,
    execute: (input) =>
      action.execute(client, input as Record<string, unknown>),
  })
}

function getEligibleActions(
  context: PlannerContext,
  hints: FrontendHints,
  actions: Array<AiActionDefinition>
) {
  const routeScope = resolveRouteScope(hints.route)

  return [...actions]
    .filter(
      (action) =>
        !action.requiresTransactions ||
        context.selectedTransactions.length > 0 ||
        context.recentTransactions.length > 0
    )
    .sort((left, right) => {
      const leftInScope = routeScope
        ? Number(left.routeScopes?.includes(routeScope) ?? false)
        : 0
      const rightInScope = routeScope
        ? Number(right.routeScopes?.includes(routeScope) ?? false)
        : 0

      return rightInScope - leftInScope
    })
}

export function createTools(
  client: Parameters<AiActionDefinition["execute"]>[0],
  context: PlannerContext,
  hints: FrontendHints,
  actions: Array<AiActionDefinition> = actionDefinitions
) {
  return Object.fromEntries(
    getEligibleActions(context, hints, actions).flatMap((action) => [
      [
        getPrepareToolName(action.key),
        createPrepareActionTool(action, context),
      ],
      [getApplyToolName(action.key), createApplyActionTool(action, client)],
    ])
  )
}

export function getChatToolTitle(partType: string) {
  const match = partType.match(/^tool-(?:prepare|apply)(.+)$/)

  if (!match) {
    return "Pending action"
  }

  return toTitleFromSegment(match[1])
}
