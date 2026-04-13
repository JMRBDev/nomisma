import { accountArchiveDefinition } from "./action-account-archive"
import { accountCreateDefinition } from "./action-account"
import { budgetAdjustDefinition, budgetCreateDefinition } from "./action-budget"
import {
  categoryCreateDefinition,
  categoryUpdateDefinition,
} from "./action-category"
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
import { categorizeDefinition } from "./action-categorize"
import type {
  ActionDomain,
  AiActionDefinition,
  RouteScope,
} from "./actions-types"

export const chatToolTitleOverrides: Record<string, string> = {
  AccountArchive: "Archive account",
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

export const actionDefinitions: Array<AiActionDefinition> = [
  transactionCreateDefinition,
  transactionUpdateDefinition,
  transactionDeleteDefinition,
  transactionAutocategorizeDefinition,
  categorizeDefinition,
  accountCreateDefinition,
  accountArchiveDefinition,
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

export const routeFallbackDomains: Record<RouteScope, Array<ActionDomain>> = {
  overview: ["transaction", "account", "budget", "recurring"],
  accounts: ["account", "transaction"],
  transactions: ["transaction", "category", "recurring"],
  budgets: ["budget", "category"],
  recurring: ["recurring", "transaction", "category"],
}

export const actionIntentPattern =
  /\b(add|adjust|archive|auto-?categorize|categorize|change|close|confirm|create|delete|edit|make|mark|move|pause|remove|rename|reopen|restore|resume|save|transfer|update)\b/i

export const informationalPattern =
  /^\s*(explain|how|list|show|summarize|tell me|what|when|where|which|who|why)\b/i

export const transactionQuestionPattern =
  /\b(expense|expenses|income|latest|last|pay(?:ment)?|paid|recent|spent|spend|transaction|transactions|transfer)\b/i
