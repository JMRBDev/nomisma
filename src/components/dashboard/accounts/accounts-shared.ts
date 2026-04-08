import {
  CreditCardIcon,
  HandCoinsIcon,
  LandmarkIcon,
  PiggyBankIcon,
  ReceiptTextIcon,
  WalletIcon,
} from "lucide-react"
import { getRouteApi } from "@tanstack/react-router"
import type { LucideIcon } from "lucide-react"
import type { IconOption } from "@/components/icon-picker"
import { accountTypeOptions } from "@/lib/money"

const accountsRouteApi = getRouteApi("/_authenticated/dashboard/accounts")

type AccountsData = ReturnType<typeof accountsRouteApi.useLoaderData>

export type AccountRecord = AccountsData["accounts"]["active"][number]
export type AccountType = (typeof accountTypeOptions)[number]["value"]

export const ACCOUNT_ICON_OPTIONS: Array<IconOption> = [
  { name: "piggy-bank", label: "Savings", icon: PiggyBankIcon },
  { name: "credit-card", label: "Card", icon: CreditCardIcon },
  { name: "landmark", label: "Bank", icon: LandmarkIcon },
  { name: "hand-coins", label: "Cash", icon: HandCoinsIcon },
  { name: "wallet", label: "Wallet", icon: WalletIcon },
  { name: "receipt-text", label: "Bills", icon: ReceiptTextIcon },
]

export const ACCOUNT_ICON_MAP = ACCOUNT_ICON_OPTIONS.reduce<
  Record<string, LucideIcon>
>((map, option) => {
  map[option.name] = option.icon
  return map
}, {})

export type AccountFormValues = {
  name: string
  type: AccountType
  openingBalance: string
  includeInTotals: boolean
  color: string
  icon: string
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
  icon: "",
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
    icon: values.icon.trim() || undefined,
  }
}
