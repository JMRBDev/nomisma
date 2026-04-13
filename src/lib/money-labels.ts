import type {
  AccountTypeValue,
  RecurringFrequencyValue,
  TransactionStatusValue,
  TransactionTypeValue,
} from "@/lib/money"
import { t } from "@/lib/i18n"
import {
  accountTypeValues,
  recurringFrequencyValues,
  transactionStatusValues,
  transactionTypeValues,
} from "@/lib/money"

export function getAccountTypeLabel(value: AccountTypeValue) {
  switch (value) {
    case "savings":
      return t("account_type_savings")
    case "cash":
      return t("account_type_cash")
    case "wallet":
      return t("account_type_wallet")
    default:
      return t("account_type_checking")
  }
}

export function getAccountTypeOptions() {
  return accountTypeValues.map((value) => ({
    value,
    label: getAccountTypeLabel(value),
  }))
}

export function getTransactionTypeLabel(value: TransactionTypeValue) {
  switch (value) {
    case "income":
      return t("transaction_type_income")
    case "transfer":
      return t("transaction_type_transfer")
    default:
      return t("transaction_type_expense")
  }
}

export function getTransactionTypeOptions() {
  return transactionTypeValues.map((value) => ({
    value,
    label: getTransactionTypeLabel(value),
  }))
}

export function getTransactionStatusLabel(value: TransactionStatusValue) {
  return value === "planned"
    ? t("transaction_status_planned")
    : t("transaction_status_posted")
}

export function getTransactionStatusOptions() {
  return transactionStatusValues.map((value) => ({
    value,
    label: getTransactionStatusLabel(value),
  }))
}

export function getRecurringFrequencyLabel(value: RecurringFrequencyValue) {
  switch (value) {
    case "weekly":
      return t("recurring_frequency_weekly")
    case "monthly":
      return t("recurring_frequency_monthly")
    case "yearly":
      return t("recurring_frequency_yearly")
    default:
      return t("recurring_frequency_daily")
  }
}

export function getRecurringFrequencyOptions() {
  return recurringFrequencyValues.map((value) => ({
    value,
    label: getRecurringFrequencyLabel(value),
  }))
}
