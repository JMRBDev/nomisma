/* eslint-disable max-lines */
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
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
import type { AiLogger } from "@/lib/ai-chat/logger"
import {
  createTools,
  getChatToolTitle,
  planAssistantTurn,
} from "@/lib/ai-actions/actions"
import {
  getActionByToolPartType,
  toToolSegment,
} from "@/lib/ai-actions/actions-utils"
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
  route: z.string().trim().min(1).optional(),
  selectedIds: z.array(z.string().trim().min(1)).max(20).optional(),
})

const RECENT_MESSAGE_LIMIT = 10
const MEMORY_LINE_LIMIT = 8
const MEMORY_LINE_LENGTH = 200
const RECENT_TRANSACTION_LIMIT = 12
const ACTIVE_TOOL_FLOW_MESSAGE_LIMIT = 6
const AFFIRMATIVE_REPLY_PATTERN =
  /^\s*(?:y|yes|yep|yeah|sure|ok|okay|please do|do it|go ahead|confirm|sounds good|fine)\b/i
const NEGATIVE_REPLY_PATTERN =
  /^\s*(?:n|no|nope|don't|do not|cancel|stop|never mind)\b/i

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
      "state" in part.output
    ) {
      const toolOutputState = part.output.state

      if (
        toolOutputState === "ready" &&
        "summary" in part.output &&
        typeof part.output.summary === "string"
      ) {
        return part.output.summary
      }

      if (
        toolOutputState === "clarify" &&
        "question" in part.output &&
        typeof part.output.question === "string"
      ) {
        return part.output.question
      }

      if (
        toolOutputState === "no_match" &&
        "reason" in part.output &&
        typeof part.output.reason === "string"
      ) {
        return part.output.reason
      }
    }

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

async function requireClient(log: AiLogger) {
  const start = Date.now()
  const client = await createAuthedConvexServerClient()

  if (!client) {
    log.error("AUTH", "No authenticated client — user is not signed in")
    throw new Error("You must be signed in to use the assistant.")
  }

  log.timing("requireClient", start, "Authenticated Convex client created")
  return client
}

async function getAssistantContext(
  client: ConvexHttpClient,
  request: Request,
  hints: FrontendHints,
  plan: AssistantContextPlan,
  log: AiLogger
): Promise<PlannerContext> {
  const start = Date.now()
  const { locale, calendarContext } = resolveAiRequestContext(request)
  log.step("CONTEXT", "Fetching planner context from Convex", {
    locale,
    today: calendarContext.today,
    currentMonth: calendarContext.currentMonth,
    includeAccounts: plan.includeAccounts,
    includeBudgets: plan.includeBudgets,
    includeCategories: plan.includeCategories,
    includeRecentTransactions: plan.includeRecentTransactions,
    includeRecurringRules: plan.includeRecurringRules,
    selectedIds: hints.selectedIds,
  })

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

  log.timing("CONTEXT", start, "Planner context fetched")
  log.debug("CONTEXT", "Planner context details", {
    accounts: plannerContext.accounts.length,
    categories: plannerContext.categories.length,
    budgets: plannerContext.budgets.length,
    recurringRules: plannerContext.recurringRules.length,
    recentTransactions: plannerContext.recentTransactions.length,
    selectedTransactions: plannerContext.selectedTransactions.length,
    settingsBaseCurrency: plannerContext.settings.baseCurrency,
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
    "If no matching tool is available for the user's request, respond in plain natural language. Never output raw JSON, code blocks, or fake tool calls. Do NOT invent tool names or output tool-call-like JSON.",
    "If you do not have a tool that matches the user's request, just reply in plain text explaining what you can do.",
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
  turnPlan: AssistantTurnPlan,
  log: AiLogger
) {
  const fastModel = turnPlan.mode === "answer" ? getAssistantFastModel() : null
  const primaryModel = getAssistantModel()
  const fallbackModel = getAssistantFallbackModel()

  const models = fastModel
    ? [fastModel, primaryModel, fallbackModel].filter(Boolean)
    : fallbackModel
      ? [primaryModel, fallbackModel]
      : [primaryModel]

  log.step("MODEL", "Streaming response", {
    mode: turnPlan.mode,
    modelCascade: models.map(
      (m) => (m as { modelId?: string }).modelId ?? "unknown"
    ),
    toolCount: Object.keys(parameters.tools).length,
    messageCount: parameters.messages.length,
  })

  let lastError: unknown

  for (const model of models) {
    const modelId = (model as { modelId?: string }).modelId ?? "unknown"
    try {
      log.info("MODEL", `Attempting model: ${modelId}`)
      const result = streamText({
        ...parameters,
        model: model!,
      })
      log.info("MODEL", `Successfully started stream with model: ${modelId}`)
      return result
    } catch (error) {
      lastError = error
      log.warn("MODEL", `Model ${modelId} failed, trying next`, {
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  log.error("MODEL", "All models failed", {
    error: lastError instanceof Error ? lastError.message : String(lastError),
  })
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

function createToolCallId() {
  return `tool_${Math.random().toString(36).slice(2, 12)}`
}

function createApprovalId() {
  return `approval_${Math.random().toString(36).slice(2, 12)}`
}

function getApplyToolName(actionKey: string) {
  return `apply${toToolSegment(actionKey)}`
}

function getLatestPreparedReadyAction(messages: Array<UIMessage>) {
  for (const message of [...messages].reverse()) {
    if (message.role !== "assistant") {
      continue
    }

    for (const part of [...message.parts].reverse()) {
      if (!isToolPart(part) || !part.type.startsWith("tool-prepare")) {
        continue
      }

      const toolPart = part

      if (
        toolPart.state !== "output-available" ||
        typeof toolPart.output !== "object" ||
        toolPart.output === null ||
        !("state" in toolPart.output) ||
        toolPart.output.state !== "ready" ||
        !("normalizedInput" in toolPart.output)
      ) {
        continue
      }

      const action = getActionByToolPartType(toolPart.type)
      const normalizedInput = toolPart.output.normalizedInput

      if (!action || typeof normalizedInput !== "object" || normalizedInput === null) {
        continue
      }

      return {
        action,
        normalizedInput: normalizedInput as Record<string, unknown>,
      }
    }
  }

  return null
}

function getLatestApplyApproval(messages: Array<UIMessage>) {
  for (const message of [...messages].reverse()) {
    if (message.role !== "assistant") {
      continue
    }

    for (const part of [...message.parts].reverse()) {
      if (!isToolPart(part) || !part.type.startsWith("tool-apply")) {
        continue
      }

      const toolPart = part

      if (toolPart.state !== "approval-responded") {
        continue
      }

      const action = getActionByToolPartType(toolPart.type)

      if (!action) {
        continue
      }

      return {
        action,
        input: toolPart.input as Record<string, unknown>,
        toolCallId: toolPart.toolCallId,
        approved: toolPart.approval.approved,
        reason: toolPart.approval.reason,
      }
    }
  }

  return null
}

function hasRecentApplyAttempt(
  messages: Array<UIMessage>,
  actionKey: string
) {
  const applyToolName = getApplyToolName(actionKey)

  return messages.some((message) =>
    message.parts.some(
      (part) => {
        if (!isToolPart(part) || !part.type.startsWith("tool-apply")) {
          return false
        }

        return (
          part.type === `tool-${applyToolName}` &&
          (part.state === "approval-requested" ||
            part.state === "approval-responded" ||
            part.state === "output-available")
        )
      }
    )
  )
}

function createDirectToolResponse(
  bodyMessages: Array<UIMessage>,
  execute: Parameters<typeof createUIMessageStream>[0]["execute"]
) {
  const stream = createUIMessageStream({
    originalMessages: bodyMessages,
    onError: toErrorMessage,
    execute,
  })

  return createUIMessageStreamResponse({ stream })
}

function maybeHandlePreparedActionConfirmation(
  messages: Array<UIMessage>,
  lastUserText: string,
  log: AiLogger
) {
  if (!AFFIRMATIVE_REPLY_PATTERN.test(lastUserText)) {
    return null
  }

  const recentMessages = messages.slice(-ACTIVE_TOOL_FLOW_MESSAGE_LIMIT)
  const preparedAction = getLatestPreparedReadyAction(recentMessages)

  if (!preparedAction) {
    return null
  }

  if (hasRecentApplyAttempt(recentMessages, preparedAction.action.key)) {
    return null
  }

  const toolCallId = createToolCallId()
  const approvalId = createApprovalId()
  const toolName = getApplyToolName(preparedAction.action.key)

  log.info("FAST_PATH", "Creating approval request from prepared action", {
    actionKey: preparedAction.action.key,
    toolName,
  })

  return createDirectToolResponse(messages, ({ writer }) => {
    writer.write({
      type: "tool-input-available",
      toolCallId,
      toolName,
      input: preparedAction.normalizedInput,
    })
    writer.write({
      type: "tool-approval-request",
      toolCallId,
      approvalId,
    })
  })
}

function maybeHandlePreparedActionCancellation(
  messages: Array<UIMessage>,
  lastUserText: string,
  log: AiLogger
) {
  if (!NEGATIVE_REPLY_PATTERN.test(lastUserText)) {
    return null
  }

  const recentMessages = messages.slice(-ACTIVE_TOOL_FLOW_MESSAGE_LIMIT)
  const preparedAction = getLatestPreparedReadyAction(recentMessages)

  if (!preparedAction) {
    return null
  }

  log.info("FAST_PATH", "Cancelling prepared action from user reply", {
    actionKey: preparedAction.action.key,
  })

  return createDirectToolResponse(messages, ({ writer }) => {
    const textId = createToolCallId()
    writer.write({ type: "text-start", id: textId })
    writer.write({
      type: "text-delta",
      id: textId,
      delta: "Okay, I won't make that change.",
    })
    writer.write({ type: "text-end", id: textId })
  })
}

async function maybeHandleApplyApprovalResponse(
  client: ConvexHttpClient,
  messages: Array<UIMessage>,
  log: AiLogger
) {
  const recentMessages = messages.slice(-ACTIVE_TOOL_FLOW_MESSAGE_LIMIT)
  const approval = getLatestApplyApproval(recentMessages)

  if (!approval) {
    return null
  }

  if (!approval.approved) {
    log.info("FAST_PATH", "Approval denied for apply tool", {
      actionKey: approval.action.key,
    })

    return createDirectToolResponse(messages, ({ writer }) => {
      const textId = createToolCallId()
      writer.write({ type: "text-start", id: textId })
      writer.write({
        type: "text-delta",
        id: textId,
        delta: approval.reason?.trim() || "Okay, I won't make that change.",
      })
      writer.write({ type: "text-end", id: textId })
    })
  }

  log.info("FAST_PATH", "Executing approved apply tool directly", {
    actionKey: approval.action.key,
    toolCallId: approval.toolCallId,
  })

  try {
    const result = await approval.action.execute(client, approval.input)

    return createDirectToolResponse(messages, ({ writer }) => {
      writer.write({
        type: "tool-input-available",
        toolCallId: approval.toolCallId,
        toolName: getApplyToolName(approval.action.key),
        input: approval.input,
      })
      writer.write({
        type: "tool-output-available",
        toolCallId: approval.toolCallId,
        output: result,
      })
    })
  } catch (error) {
    return createDirectToolResponse(messages, ({ writer }) => {
      writer.write({
        type: "tool-input-available",
        toolCallId: approval.toolCallId,
        toolName: getApplyToolName(approval.action.key),
        input: approval.input,
      })
      writer.write({
        type: "tool-output-error",
        toolCallId: approval.toolCallId,
        errorText: toErrorMessage(error),
      })
    })
  }
}

export async function chatWithAssistant(request: Request, log: AiLogger) {
  const totalStart = Date.now()
  try {
    log.step("START", "Beginning chatWithAssistant pipeline")

    log.step("AUTH", "Creating authenticated Convex client")
    const client = await requireClient(log)

    log.step("PARSE", "Parsing and validating request body")
    const bodyParseStart = Date.now()
    const body = ChatRequestSchema.parse(await request.json())
    const requestContext = FrontendHintsSchema.parse({
      route: body.route,
      selectedIds: body.selectedIds,
      ...body.context,
    })
    log.timing(
      "PARSE",
      bodyParseStart,
      `Parsed ${body.messages.length} messages`
    )
    log.debug("PARSE", "Frontend hints", {
      route: requestContext.route ?? null,
      selectedIds: requestContext.selectedIds?.length ?? 0,
    })

    const lastUserMessage = [...body.messages]
      .reverse()
      .find((message) => message.role === "user")
    const lastUserText = lastUserMessage ? getMessageText(lastUserMessage) : ""

    const directApplyResponse = await maybeHandleApplyApprovalResponse(
      client,
      body.messages,
      log
    )

    if (directApplyResponse) {
      log.step("DONE", "Returning direct apply response")
      log.timing("TOTAL", totalStart, "Handled approved tool without model")
      return directApplyResponse
    }

    const directApprovalRequest = maybeHandlePreparedActionConfirmation(
      body.messages,
      lastUserText,
      log
    )

    if (directApprovalRequest) {
      log.step("DONE", "Returning direct approval request response")
      log.timing("TOTAL", totalStart, "Handled confirmation without model")
      return directApprovalRequest
    }

    const directCancellationResponse = maybeHandlePreparedActionCancellation(
      body.messages,
      lastUserText,
      log
    )

    if (directCancellationResponse) {
      log.step("DONE", "Returning direct cancellation response")
      log.timing("TOTAL", totalStart, "Handled cancellation without model")
      return directCancellationResponse
    }

    log.step("PLAN", "Planning assistant turn")
    const planStart = Date.now()
    const turnPlan = planAssistantTurn(body.messages, requestContext, log)
    log.timing("PLAN", planStart, "Turn planning complete")
    log.info("PLAN", "Turn plan result", {
      mode: turnPlan.mode,
      lastUserText: turnPlan.lastUserText.slice(0, 100),
      actionCount: turnPlan.actions.length,
      actionKeys: turnPlan.actions.map((a) => a.key),
      keepRecentToolMessageCount: turnPlan.keepRecentToolMessageCount,
      contextPlan: turnPlan.context,
    })

    const shouldExcludeHeavy =
      turnPlan.mode === "answer" &&
      turnPlan.actions.length === 0 &&
      !turnPlan.context.includeRecentTransactions

    log.step("CONTEXT", "Fetching assistant context data")
    const context = await getAssistantContext(
      client,
      request,
      requestContext,
      turnPlan.context,
      log
    )

    log.step("TOOLS", "Creating action tools")
    const toolsStart = Date.now()
    const actionTools: ToolSet = turnPlan.actions.length
      ? (createTools(
          client,
          context,
          requestContext,
          turnPlan.actions,
          log
        ) as ToolSet)
      : {}

    if (shouldExcludeHeavy) {
      log.info(
        "TOOLS",
        "Adding lookupTransactions tool (answer mode, no heavy context)"
      )
      const lookupTool = createLookupTransactionsTool(context)
      if (lookupTool) {
        actionTools.lookupTransactions = lookupTool
      }
    }

    const toolNames = Object.keys(actionTools)
    log.timing("TOOLS", toolsStart, `Created ${toolNames.length} tools`)
    log.info("TOOLS", "Available tools", { tools: toolNames })

    log.step("MESSAGES", "Preparing messages for model")
    const messagesStart = Date.now()
    const preparedConversation = prepareMessagesForModel(
      body.messages,
      turnPlan.keepRecentToolMessageCount
    )
    log.debug("MESSAGES", "Prepared conversation", {
      totalInputMessages: body.messages.length,
      preparedMessages: preparedConversation.messages.length,
      hasMemory: preparedConversation.memory !== null,
      memoryLength: preparedConversation.memory?.length ?? 0,
    })

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
    log.timing(
      "MESSAGES",
      messagesStart,
      `Final model messages: ${modelMessages.length}`
    )
    log.debug("MESSAGES", "Model message roles", {
      roles: modelMessages.map((m) => m.role),
    })

    const maxSteps = turnPlan.mode === "action" ? 4 : 2
    log.info("CONFIG", "Stream configuration", {
      maxSteps,
      shouldExcludeHeavy,
      mode: turnPlan.mode,
    })

    log.step("STREAM", "Starting assistant response stream")
    const systemPrompt = buildSystemPrompt(
      context,
      requestContext,
      preparedConversation.memory,
      shouldExcludeHeavy
    )
    log.debug("STREAM", "System prompt length", {
      systemPromptLength: systemPrompt.length,
    })

    const result = streamAssistantResponse(
      {
        messages: modelMessages,
        stopWhen: stepCountIs(maxSteps),
        system: systemPrompt,
        tools: actionTools,
      },
      turnPlan,
      log
    )

    log.step("DONE", "Returning UI message stream response")
    log.timing("TOTAL", totalStart, "Full chatWithAssistant pipeline")
    return result.toUIMessageStreamResponse({
      originalMessages: body.messages,
      onError: toErrorMessage,
    })
  } catch (error) {
    log.error("ERROR", "chatWithAssistant failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    log.timing("TOTAL", totalStart, "Pipeline failed")
    return new Response(toErrorMessage(error), {
      status: 400,
    })
  }
}
