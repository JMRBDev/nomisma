import { tool } from "ai"
import { resolveRouteScope } from "./actions-helpers"
import { actionDefinitions } from "./actions-constants"
import { toTitleFromSegment, toToolSegment } from "./actions-utils"
import type { AiActionDefinition, PlannerContext } from "./actions-types"
import type { FrontendHints } from "@/lib/ai-actions/shared"

function getPrepareToolName(actionKey: string) {
  return `prepare${toToolSegment(actionKey)}`
}

function getApplyToolName(actionKey: string) {
  return `apply${toToolSegment(actionKey)}`
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
