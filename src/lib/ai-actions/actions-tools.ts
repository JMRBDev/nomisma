/* eslint-disable max-lines */
import { tool } from "ai"
import { resolveRouteScope } from "./actions-helpers"
import { actionDefinitions } from "./actions-constants"
import { toTitleFromSegment, toToolSegment } from "./actions-utils"
import type { AiActionDefinition, PlannerContext } from "./actions-types"
import type { FrontendHints } from "@/lib/ai-actions/shared"
import type { AiLogger } from "@/lib/ai-chat/logger"

function getPrepareToolName(actionKey: string) {
  return `prepare${toToolSegment(actionKey)}`
}

function getApplyToolName(actionKey: string) {
  return `apply${toToolSegment(actionKey)}`
}

function createPrepareActionTool(
  action: AiActionDefinition,
  context: PlannerContext,
  log: AiLogger
) {
  const toolName = getPrepareToolName(action.key)
  return tool({
    description: `Prepare ${action.title.toLowerCase()} using the user's request before applying it.`,
    inputSchema: action.generatedInputSchema,
    execute: (input) => {
      const start = Date.now()
      log.step("TOOL_EXEC", `${toolName} called`, { input })
      const result = action.normalize(context, input as Record<string, unknown>)

      if (result.type === "ready") {
        log.timing("TOOL_EXEC", start, `${toolName} → ready`)
        log.info("TOOL_RESULT", `${toolName} result: ready`, {
          actionKey: action.key,
          summary: result.summary,
          normalizedInputKeys: Object.keys(result.normalizedInput),
        })
        return {
          state: "ready" as const,
          actionKey: action.key,
          actionTitle: action.title,
          summary: result.summary,
          normalizedInput: result.normalizedInput,
        }
      }

      if (result.type === "clarify") {
        log.timing("TOOL_EXEC", start, `${toolName} → clarify`)
        log.info("TOOL_RESULT", `${toolName} result: clarify`, {
          actionKey: action.key,
          question: result.question,
          missingFields: result.missingFields,
          optionCount: result.options?.length ?? 0,
        })
        return {
          state: "clarify" as const,
          actionKey: action.key,
          actionTitle: action.title,
          question: result.question,
          missingFields: result.missingFields ?? [],
          options: result.options ?? [],
        }
      }

      log.timing("TOOL_EXEC", start, `${toolName} → no_match`)
      log.info("TOOL_RESULT", `${toolName} result: no_match`, {
        actionKey: action.key,
        reason: result.reason,
      })
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
  client: Parameters<AiActionDefinition["execute"]>[0],
  log: AiLogger
) {
  const toolName = getApplyToolName(action.key)
  return tool({
    description: `${action.title} after the user has approved the exact normalized input.`,
    inputSchema: action.normalizedInputSchema,
    needsApproval: true,
    execute: (input) => {
      const start = Date.now()
      log.step("TOOL_EXEC", `${toolName} called — executing mutation`, {
        inputKeys: Object.keys(input as object),
      })
      const result = action.execute(client, input as Record<string, unknown>)
      result.then(
        (res) => {
          log.timing("TOOL_EXEC", start, `${toolName} → success`)
          log.info("TOOL_RESULT", `${toolName} execution succeeded`, {
            message: res.message,
          })
        },
        (err) => {
          log.timing("TOOL_EXEC", start, `${toolName} → error`)
          log.error("TOOL_RESULT", `${toolName} execution failed`, {
            error: err instanceof Error ? err.message : String(err),
          })
        }
      )
      return result
    },
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
  actions: Array<AiActionDefinition> = actionDefinitions,
  log: AiLogger
) {
  const eligibleActions = getEligibleActions(context, hints, actions)
  log.info("TOOLS", "Creating tools from eligible actions", {
    inputActions: actions.map((a) => a.key),
    eligibleActions: eligibleActions.map((a) => a.key),
  })

  return Object.fromEntries(
    eligibleActions.flatMap((action) => [
      [
        getPrepareToolName(action.key),
        createPrepareActionTool(action, context, log),
      ],
      [
        getApplyToolName(action.key),
        createApplyActionTool(action, client, log),
      ],
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
