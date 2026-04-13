import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  validateUIMessages,
} from "ai"
import { z } from "zod"
import { api } from "../../../convex/_generated/api"
import type { ConvexHttpClient } from "convex/browser"
import type { UIMessage } from "ai"
import type { FrontendHints } from "@/lib/ai-actions/shared"
import type { PlannerContext } from "@/lib/ai-actions/actions"
import { createTools } from "@/lib/ai-actions/actions"
import { FrontendHintsSchema } from "@/lib/ai-actions/shared"
import {
  createAuthedConvexServerClient,
  getAssistantModel,
  resolveAiRequestContext,
} from "@/lib/ai-actions/server"

const ChatRequestSchema = z.object({
  messages: z.array(z.custom<UIMessage>()),
  context: FrontendHintsSchema.optional().default({}),
})

function toErrorMessage(error: unknown) {
  if (typeof error === "string") {
    return error
  }

  if (error instanceof Error) {
    return error.message
  }

  return "Something went wrong."
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
  hints: FrontendHints
): Promise<PlannerContext> {
  const { locale, calendarContext } = resolveAiRequestContext(request)
  const plannerContext = await client.query(api.aiActions.getPlannerContext, {
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
  hints: FrontendHints
) {
  return JSON.stringify(
    {
      currentDate: context.today,
      currentMonth: context.currentMonth,
      locale: context.locale,
      baseCurrency: context.settings?.baseCurrency ?? null,
      route: hints.route ?? null,
      accounts: context.accounts.map((account) => ({
        id: account.id,
        name: account.name,
        type: account.type,
        archived: account.archived,
        includeInTotals: account.includeInTotals,
      })),
      selectedTransactions: context.selectedTransactions,
      currentMonthBudgets: context.budgets
        .filter((budget) => budget.month === context.currentMonth)
        .slice(0, 12),
      categories: context.categories.map((category) => ({
        id: category.id,
        name: category.name,
        archived: category.archived,
      })),
      recurringRules: context.recurringRules
        .filter((rule) => rule.active)
        .slice(0, 25),
      recentTransactions: context.recentTransactions.slice(0, 25),
    },
    null,
    2
  )
}

export async function chatWithAssistant(request: Request) {
  try {
    const client = await requireClient()
    const body = ChatRequestSchema.parse(await request.json())
    const context = await getAssistantContext(client, request, body.context)
    const tools = createTools(client, context, body.context) as Record<
      string,
      any
    >
    const validatedMessages = await validateUIMessages({
      messages: body.messages,
      tools,
    })

    const result = streamText({
      model: getAssistantModel(),
      messages: await convertToModelMessages(validatedMessages),
      tools,
      stopWhen: stepCountIs(6),
      system: [
        "You are Nomisma's built-in finance assistant.",
        "Behave like a smart, calm operator inside the app, not a generic chatbot.",
        "The route and selected entities are hints, not hard limits.",
        "Answer directly when the user is asking a question.",
        "When the user wants to modify data, use the matching prepare tool first.",
        "If a prepare tool returns clarify, ask only for the missing detail in natural language.",
        "If a prepare tool returns ready and the user is asking for the change to happen, call the matching apply tool immediately.",
        "Apply tools require user approval before they execute.",
        "Never invent IDs, categories, accounts, budgets, or transactions.",
        "If approval is denied, do not retry the same write automatically.",
        "Keep replies concise and specific to the user's finances.",
        `App context:\n${buildAssistantContextPrompt(context, body.context)}`,
      ].join("\n\n"),
    })

    return result.toUIMessageStreamResponse({
      originalMessages: validatedMessages,
      onError: toErrorMessage,
    })
  } catch (error) {
    return new Response(toErrorMessage(error), {
      status: 400,
    })
  }
}
