import type { UIMessage } from "ai"

export type MessagePart = UIMessage["parts"][number]
export type ToolPart = Extract<MessagePart, { type: `tool-${string}` }>

export function getCurrentFrontendHints() {
  if (typeof window === "undefined") {
    return {}
  }

  const location = new URL(window.location.href)
  const transactionId = location.searchParams.get("transactionId")

  return {
    route: location.pathname,
    selectedIds: transactionId ? [transactionId] : [],
  }
}

export function getMessageText(message: UIMessage) {
  const texts = message.parts
    .filter(
      (part): part is { type: "text"; text: string } => part.type === "text"
    )
    .map((part) => part.text)

  if (texts.length === 0) return ""

  return texts
    .reduce((acc: Array<string>, text, i) => {
      if (i === 0) {
        acc.push(text)
        return acc
      }

      const prev = acc[acc.length - 1]
      const prevEndsWithSpace = /\s$/.test(prev)
      const currentStartsWithSpace = /^\s/.test(text)

      if (!prevEndsWithSpace && !currentStartsWithSpace) {
        acc[acc.length - 1] = prev + " " + text
      } else {
        acc.push(text)
      }

      return acc
    }, [])
    .join("\n\n")
    .trim()
}

export function isToolPart(part: MessagePart): part is ToolPart {
  return typeof part.type === "string" && part.type.startsWith("tool-")
}

export function isApplyToolPart(part: ToolPart) {
  return part.type.startsWith("tool-apply")
}

function formatToolValue(value: unknown) {
  if (value === null || value === undefined) {
    return "—"
  }

  if (Array.isArray(value)) {
    return value.join(", ")
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false"
  }

  if (typeof value === "object") {
    return JSON.stringify(value)
  }

  return String(value)
}

export function getToolSummary(part: ToolPart) {
  if (!part.input) {
    return null
  }

  const input = part.input as Record<string, unknown>
  const values = Object.entries(input)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}: ${formatToolValue(value)}`)

  return values.join("\n")
}

export function getMutationSuccessMessages(message: UIMessage) {
  return message.parts
    .filter(isToolPart)
    .filter(
      (part) => isApplyToolPart(part) && part.state === "output-available"
    )
    .map((part) => {
      if (
        "output" in part &&
        part.output &&
        typeof part.output === "object" &&
        "message" in part.output
      ) {
        return String(part.output.message)
      }

      return null
    })
    .filter((value): value is string => Boolean(value))
}
