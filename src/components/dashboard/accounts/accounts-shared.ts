import type { useAccountsPageData } from "@/hooks/use-money-dashboard"
import { accountTypeOptions } from "@/lib/money"

type AccountsData = NonNullable<ReturnType<typeof useAccountsPageData>["data"]>

export type AccountRecord = AccountsData["accounts"]["active"][number]
export type AccountType = (typeof accountTypeOptions)[number]["value"]

export type AccountFormValues = {
  name: string
  type: AccountType
  openingBalance: string
  includeInTotals: boolean
  color: string
}

export type AccountFieldErrors = Partial<
  Record<"name" | "openingBalance", string>
>

export const DEFAULT_ACCOUNT_VALUES: AccountFormValues = {
  name: "",
  type: "checking",
  openingBalance: "0",
  includeInTotals: true,
  color: "",
}

export function getAccountTypeLabel(type: AccountType) {
  return (
    accountTypeOptions.find((option) => option.value === type)?.label ??
    "Account"
  )
}

export function validateAccountValues(
  values: AccountFormValues
): AccountFieldErrors {
  const errors: AccountFieldErrors = {}
  const openingBalance = Number(values.openingBalance || "0")

  if (!values.name.trim()) {
    errors.name = "Account name is required."
  }

  if (!Number.isFinite(openingBalance)) {
    errors.openingBalance = "Opening balance must be a valid number."
  } else if (openingBalance < 0) {
    errors.openingBalance = "Opening balance cannot be negative."
  }

  return errors
}

export function buildAccountPayload(values: AccountFormValues) {
  return {
    name: values.name.trim(),
    type: values.type,
    openingBalance: Number(values.openingBalance || "0"),
    includeInTotals: values.includeInTotals,
    color: values.color.trim() || undefined,
  }
}
