/* eslint-disable max-lines */
import {
  convertToModelMessages,
  pruneMessages,
  stepCountIs,
  streamText,
  tool,
  validateUIMessages,
} from "ai"
import { z } from "zod"
import { api } from "../../../convex/_generated/api"
import type { ToolSet, UIMessage } from "ai"
import type { ConvexHttpClient } from "convex/browser"
import type {
  AssistantContextPlan,
  AssistantTurnPlan,
  PlannerContext,
} from "@/lib/ai-actions/actions"
import type { FrontendHints } from "@/lib/ai-actions/shared"
import {
  createTools,
  getChatToolTitle,
  planAssistantTurn,
} from "@/lib/ai-actions/actions"
import {
  createAuthedConvexServerClient,
  getAssistantFallbackModel,
  getAssistantFastModel,
  getAssistantModel,
  resolveAiRequestContext,
} from "@/lib/ai-actions/server"
import { FrontendHintsSchema } from "@/lib/ai-actions/shared"

const ChatRequestSchema = z.object({
  messages: z.array(z.custom<UIMessage>()),
  context: FrontendHintsSchema.optional().default({}),
})

const RECENT_MESSAGE_LIMIT = 10
const MEMORY_LINE_LIMIT = 8
const MEMORY_LINE_LENGTH = 200
const RECENT_TRANSACTION_LIMIT = 12

function toErrorMessage(error: unknown) {
  if (typeof error === "string") {
    return error
  }

  if (error instanceof Error) {
    return error.message
  }

  return "Something went wrong."
}

function truncateText(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value
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

function summarizeToolPart(
  part: Extract<UIMessage["parts"][number], { type: `tool-${string}` }>
) {
  const title = getChatToolTitle(part.type)

  if (part.state === "approval-requested") {
    return `${title} is awaiting approval.`
  }

  if (part.state === "approval-responded") {
    return `${title} was ${part.approval.approved ? "approved" : "denied"}.`
  }

  if (part.state === "output-available") {
    if (
      typeof part.output === "object" &&
      part.output !== null &&
      "message" in part.output
    ) {
      return String(part.output.message)
    }

    return `${title} completed.`
  }

  if (part.state === "output-error") {
    return `${title} failed: ${part.errorText}`
  }

  if (part.state === "output-denied") {
    return `${title} was denied.`
  }

  if (part.state === "input-available") {
    return `${title} was prepared.`
  }

  return null
}

function summarizeMessage(message: UIMessage) {
  const text = getMessageText(message)

  if (text) {
    return `${message.role === "user" ? "User" : "Assistant"}: ${truncateText(text, MEMORY_LINE_LENGTH)}`
  }

  const toolSummaries = message.parts
    .filter(isToolPart)
    .map(summarizeToolPart)
    .filter((value): value is string => Boolean(value))

  if (toolSummaries.length === 0) {
    return null
  }

  return `${message.role === "user" ? "User" : "Assistant"}: ${truncateText(toolSummaries.join(" "), MEMORY_LINE_LENGTH)}`
}

function buildConversationMemory(messages: Array<UIMessage>) {
  const lines = messages
    .map(summarizeMessage)
    .filter((value): value is string => Boolean(value))
    .slice(-MEMORY_LINE_LIMIT)

  return lines.length > 0 ? lines.join("\n") : null
}

function pruneMessageForModel(message: UIMessage, keepToolParts: boolean) {
  if (keepToolParts) {
    return message
  }

  const summary = summarizeMessage(message)

  if (!summary) {
    return null
  }

  return {
    ...message,
    parts: [
      {
        type: "text" as const,
        text:
          message.role === "assistant"
            ? summary.replace(/^Assistant:\s*/, "")
            : summary.replace(/^User:\s*/, ""),
      },
    ],
  } satisfies UIMessage
}

function prepareMessagesForModel(
  messages: Array<UIMessage>,
  keepRecentToolMessageCount: number
) {
  const recentMessages = messages.slice(-RECENT_MESSAGE_LIMIT)
  const memory = buildConversationMemory(
    messages.slice(0, -RECENT_MESSAGE_LIMIT)
  )
  const toolMessageStartIndex =
    keepRecentToolMessageCount > 0
      ? Math.max(recentMessages.length - keepRecentToolMessageCount, 0)
      : recentMessages.length

  const preparedMessages = recentMessages
    .map((message, index) =>
      pruneMessageForModel(message, index >= toolMessageStartIndex)
    )
    .filter((message): message is UIMessage => Boolean(message))

  return {
    memory,
    messages: preparedMessages,
  }
}

async function requireClient() {
  const client = await createAuthedConvexServerClient()

  if (!client) {
    throw new Error("You must be signed in to use the assistant.")
  }

  return client
}

async function getAssistantContext(
  client: ConvexHttpClient,
  request: Request,
  hints: FrontendHints,
  plan: AssistantContextPlan
): Promise<PlannerContext> {
  const { locale, calendarContext } = resolveAiRequestContext(request)
  const plannerContext = await client.query(api.aiActions.getPlannerContext, {
    currentMonth: calendarContext.currentMonth,
    includeAccounts: plan.includeAccounts,
    includeBudgets: plan.includeBudgets,
    includeCategories: plan.includeCategories,
    includeRecentTransactions: plan.includeRecentTransactions,
    includeRecurringRules: plan.includeRecurringRules,
    recentTransactionsLimit: RECENT_TRANSACTION_LIMIT,
    selectedIds: hints.selectedIds,
  })

  return {
    ...plannerContext,
    locale,
    today: calendarContext.today,
    currentMonth: calendarContext.currentMonth,
  }
}

function buildAssistantContextPrompt(
  context: PlannerContext,
  hints: FrontendHints,
  excludeHeavyContext: boolean
) {
  const promptContext: Record<string, unknown> = {
    currentDate: context.today,
    currentMonth: context.currentMonth,
    locale: context.locale,
    baseCurrency: context.settings?.baseCurrency ?? null,
    route: hints.route ?? null,
  }

  if (context.accounts.length > 0) {
    promptContext.accounts = context.accounts.map((account) => ({
      id: account.id,
      name: account.name,
      type: account.type,
      archived: account.archived,
      includeInTotals: account.includeInTotals,
    }))
  }

  if (context.categories.length > 0) {
    promptContext.categories = context.categories.map((category) => ({
      id: category.id,
      name: category.name,
      archived: category.archived,
    }))
  }

  if (context.budgets.length > 0) {
    const categoryNameById = new Map(
      context.categories.map((category) => [category.id, category.name])
    )

    promptContext.currentMonthBudgets = context.budgets
      .slice(0, 12)
      .map((budget) => ({
        id: budget.id,
        month: budget.month,
        categoryId: budget.categoryId,
        categoryName: budget.categoryId
          ? (categoryNameById.get(budget.categoryId) ?? null)
          : "Total",
        limitAmount: budget.limitAmount,
      }))
  }

  if (context.recurringRules.length > 0) {
    promptContext.activeRecurringRules = context.recurringRules.slice(0, 12)
  }

  if (!excludeHeavyContext) {
    if (context.selectedTransactions.length > 0) {
      promptContext.selectedTransactions = context.selectedTransactions
    }

    if (context.recentTransactions.length > 0) {
      promptContext.recentTransactions = context.recentTransactions
    }
  }

  return JSON.stringify(promptContext, null, 2)
}

function buildSystemPrompt(
  context: PlannerContext,
  hints: FrontendHints,
  sessionMemory: string | null,
  excludeHeavyContext: boolean
) {
  const parts = [
    "You are Nomisma's built-in finance assistant.",
    "Behave like a smart, calm operator inside the app, not a generic chatbot.",
    "The route and selected entities are hints, not hard limits.",
    "Answer directly when the user is asking a question.",
    "When the user wants to modify data, use the matching prepare tool first.",
    "If a prepare tool returns clarify, ask only for the missing detail in natural language.",
    "If a prepare tool returns ready and the user is asking for the change to happen, call the matching apply tool immediately.",
    "Apply tools require user approval before they execute.",
    "Never invent IDs, categories, accounts, budgets, or transactions.",
    "If no matching tool is available for the user's request, respond in plain natural language. Never output raw JSON, code blocks, or fake tool calls.",
    "If approval is denied, do not retry the same write automatically.",
    "Keep replies concise and specific to the user's finances.",
  ]

  if (excludeHeavyContext) {
    parts.push(
      "Use the lookupTransactions tool when you need details about recent or specific transactions."
    )
  }

  if (sessionMemory) {
    parts.push(`Earlier conversation summary:\n${sessionMemory}`)
  }

  parts.push(
    `App context:\n${buildAssistantContextPrompt(context, hints, excludeHeavyContext)}`
  )

  return parts.join("\n\n")
}

function streamAssistantResponse(
  parameters: {
    messages: NonNullable<Parameters<typeof streamText>[0]["messages"]>
    stopWhen: Parameters<typeof streamText>[0]["stopWhen"]
    system: NonNullable<Parameters<typeof streamText>[0]["system"]>
    tools: ToolSet
  },
  turnPlan: AssistantTurnPlan
) {
  const fastModel = turnPlan.mode === "answer" ? getAssistantFastModel() : null
  const primaryModel = getAssistantModel()
  const fallbackModel = getAssistantFallbackModel()

  const models = fastModel
    ? [fastModel, primaryModel, fallbackModel].filter(Boolean)
    : fallbackModel
      ? [primaryModel, fallbackModel]
      : [primaryModel]

  let lastError: unknown

  for (const model of models) {
    try {
      return streamText({
        ...parameters,
        model: model!,
      })
    } catch (error) {
      lastError = error
    }
  }

  throw lastError ?? new Error("No assistant model is configured.")
}

function createLookupTransactionsTool(context: PlannerContext) {
  const transactions = [
    ...context.selectedTransactions,
    ...context.recentTransactions.filter(
      (rt) => !context.selectedTransactions.some((st) => st.id === rt.id)
    ),
  ]

  if (transactions.length === 0) {
    return null
  }

  return tool({
    description:
      "Look up recent or selected transactions. Returns transaction details including amount, category, account, date, and note.",
    inputSchema: z.object({
      query: z
        .string()
        .optional()
        .describe("Optional text filter to narrow down transactions"),
    }),
    execute: (input) => {
      let results = transactions

      if (input.query) {
        const lowerQuery = input.query.toLowerCase()
        results = results.filter(
          (tx) =>
            (tx.note && tx.note.toLowerCase().includes(lowerQuery)) ||
            (tx.categoryName &&
              tx.categoryName.toLowerCase().includes(lowerQuery)) ||
            (tx.accountName &&
              tx.accountName.toLowerCase().includes(lowerQuery))
        )
      }

      return {
        transactions: results.slice(0, 10).map((tx) => ({
          id: tx.id,
          amount: tx.amount,
          date: tx.date,
          note: tx.note ?? null,
          categoryName: tx.categoryName ?? null,
          accountName: tx.accountName ?? null,
          type: tx.type,
          status: tx.status,
        })),
        total: results.length,
      }
    },
  })
}

export async function chatWithAssistant(request: Request) {
  try {
    const client = await requireClient()
    const body = ChatRequestSchema.parse(await request.json())
    const turnPlan = planAssistantTurn(body.messages, body.context)

    const shouldExcludeHeavy =
      turnPlan.mode === "answer" &&
      turnPlan.actions.length === 0 &&
      !turnPlan.context.includeRecentTransactions

    const context = await getAssistantContext(
      client,
      request,
      body.context,
      turnPlan.context
    )

    const actionTools: ToolSet = turnPlan.actions.length
      ? (createTools(
          client,
          context,
          body.context,
          turnPlan.actions
        ) as ToolSet)
      : {}

    if (shouldExcludeHeavy) {
      const lookupTool = createLookupTransactionsTool(context)
      if (lookupTool) {
        actionTools.lookupTransactions = lookupTool
      }
    }

    const preparedConversation = prepareMessagesForModel(
      body.messages,
      turnPlan.keepRecentToolMessageCount
    )
    const validationTools = actionTools as NonNullable<
      Parameters<typeof validateUIMessages>[0]["tools"]
    >
    const validatedMessages = await validateUIMessages({
      messages: preparedConversation.messages,
      tools: validationTools,
    })
    const modelMessages = pruneMessages({
      messages: await convertToModelMessages(validatedMessages),
      reasoning: "before-last-message",
      toolCalls:
        turnPlan.keepRecentToolMessageCount > 0
          ? "before-last-2-messages"
          : "all",
    })

    const maxSteps = turnPlan.mode === "action" ? 4 : 2

    const result = streamAssistantResponse(
      {
        messages: modelMessages,
        stopWhen: stepCountIs(maxSteps),
        system: buildSystemPrompt(
          context,
          body.context,
          preparedConversation.memory,
          shouldExcludeHeavy
        ),
        tools: actionTools,
      },
      turnPlan
    )

    return result.toUIMessageStreamResponse({
      originalMessages: body.messages,
      onError: toErrorMessage,
    })
  } catch (error) {
    return new Response(toErrorMessage(error), {
      status: 400,
    })
  }
}
