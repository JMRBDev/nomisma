import { actionDefinitions, chatToolTitleOverrides } from "./actions-constants"
import type { UIMessage } from "ai"
import type { ActionDomain, AiActionDefinition } from "./actions-types"

export function toToolSegment(actionKey: string) {
  return actionKey
    .split(".")
    .flatMap((part) => part.split("_"))
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("")
}

export function toTitleFromSegment(segment: string) {
  const override = chatToolTitleOverrides[segment]

  if (override) {
    return override
  }

  return segment
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace(/^./, (value) => value.toUpperCase())
}

export function getMessageText(message: UIMessage) {
  return message.parts
    .filter(
      (part): part is { type: "text"; text: string } => part.type === "text"
    )
    .map((part) => part.text)
    .join("\n\n")
    .trim()
}

export function isToolPart(
  part: UIMessage["parts"][number]
): part is Extract<UIMessage["parts"][number], { type: `tool-${string}` }> {
  return typeof part.type === "string" && part.type.startsWith("tool-")
}

function isPrepareToolPart(
  part: Extract<UIMessage["parts"][number], { type: `tool-${string}` }>
) {
  return part.type.startsWith("tool-prepare")
}

function isApplyToolPart(
  part: Extract<UIMessage["parts"][number], { type: `tool-${string}` }>
) {
  return part.type.startsWith("tool-apply")
}

export function hasActiveToolFlow(messages: Array<UIMessage>) {
  return messages.some((message) =>
    message.parts.some(
      (part) => {
        if (!isToolPart(part)) {
          return false
        }

        if (
          isApplyToolPart(part) &&
          (part.state === "approval-requested" ||
            part.state === "approval-responded")
        ) {
          return true
        }

        if (
          isPrepareToolPart(part) &&
          (part.state === "input-available" ||
            part.state === "input-streaming")
        ) {
          return true
        }

        if (
          isPrepareToolPart(part) &&
          part.state === "output-available" &&
          typeof part.output === "object" &&
          part.output !== null &&
          "state" in part.output
        ) {
          const toolState = part.output.state
          return toolState === "ready" || toolState === "clarify"
        }

        return false
      }
    )
  )
}

export function inferDomains(text: string) {
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

export function uniqueActions(actions: Array<AiActionDefinition>) {
  const actionsByKey = new Map(actions.map((action) => [action.key, action]))
  return [...actionsByKey.values()]
}

export function getActionByToolPartType(partType: string) {
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

export function getReferencedActions(messages: Array<UIMessage>) {
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
