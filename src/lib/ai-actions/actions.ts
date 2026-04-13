/* eslint-disable max-lines */
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
import type { AiActionDefinition, PlannerContext } from "./actions-types"
import type { FrontendHints } from "@/lib/ai-actions/shared"

export type { AiActionDefinition, PlannerContext } from "./actions-types"

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

function getEligibleActions(context: PlannerContext, hints: FrontendHints) {
  const routeScope = resolveRouteScope(hints.route)

  return [...actionDefinitions]
    .filter(
      (action) =>
        !action.requiresTransactions || context.recentTransactions.length > 0
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
  hints: FrontendHints
) {
  return Object.fromEntries(
    getEligibleActions(context, hints).flatMap((action) => [
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
