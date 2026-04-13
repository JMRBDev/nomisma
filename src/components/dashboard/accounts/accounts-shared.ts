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
import type { IconOption } from "@/components/picker-shared"
import type { AccountTypeValue } from "@/lib/money"
import { COLOR_OPTIONS } from "@/components/picker-shared"
import { getAccountTypeLabel as getAccountTypeLabelFromLocale } from "@/lib/money"
import { t } from "@/lib/i18n"
import { pickRandomItem } from "@/lib/random"

const accountsRouteApi = getRouteApi("/_authenticated/dashboard/accounts")

type AccountsData = ReturnType<typeof accountsRouteApi.useLoaderData>

export type AccountRecord = AccountsData["accounts"]["active"][number]
export type AccountType = AccountTypeValue

export const ACCOUNT_ICON_OPTIONS: Array<IconOption> = [
  {
    name: "piggy-bank",
    label: t("accounts_icon_savings"),
    icon: PiggyBankIcon,
  },
  { name: "credit-card", label: t("accounts_icon_card"), icon: CreditCardIcon },
  { name: "landmark", label: t("accounts_icon_bank"), icon: LandmarkIcon },
  { name: "hand-coins", label: t("accounts_icon_cash"), icon: HandCoinsIcon },
  { name: "wallet", label: t("accounts_icon_wallet"), icon: WalletIcon },
  {
    name: "receipt-text",
    label: t("accounts_icon_bills"),
    icon: ReceiptTextIcon,
  },
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
  Record<"name" | "openingBalance" | "color" | "icon", string>
>

export function createRandomAccountAppearance() {
  return {
    color: pickRandomItem(COLOR_OPTIONS).value,
    icon: pickRandomItem(ACCOUNT_ICON_OPTIONS).name,
  }
}

export function resolveAccountAppearance(values: {
  color?: string | null
  icon?: string | null
}) {
  const defaults = createRandomAccountAppearance()

  return {
    color: values.color?.trim() || defaults.color,
    icon: values.icon?.trim() || defaults.icon,
  }
}

export function createDefaultAccountValues(): AccountFormValues {
  return {
    name: "",
    type: "checking",
    openingBalance: "0",
    includeInTotals: true,
    ...createRandomAccountAppearance(),
  }
}

export function getAccountTypeLabel(type: AccountType) {
  return getAccountTypeLabelFromLocale(type)
}

export function validateAccountValues(
  values: AccountFormValues
): AccountFieldErrors {
  const errors: AccountFieldErrors = {}
  const openingBalance = Number(values.openingBalance || "0")

  if (!values.name.trim()) {
    errors.name = t("accounts_error_name_required")
  }

  if (!Number.isFinite(openingBalance)) {
    errors.openingBalance = t("accounts_error_opening_balance_number")
  } else if (openingBalance < 0) {
    errors.openingBalance = t("accounts_error_opening_balance_negative")
  }

  if (!values.color.trim()) {
    errors.color = t("accounts_error_color_required")
  }

  if (!values.icon.trim()) {
    errors.icon = t("accounts_error_icon_required")
  }

  return errors
}

export function buildAccountPayload(values: AccountFormValues) {
  const appearance = resolveAccountAppearance(values)

  return {
    name: values.name.trim(),
    type: values.type,
    openingBalance: Number(values.openingBalance || "0"),
    includeInTotals: values.includeInTotals,
    color: appearance.color,
    icon: appearance.icon,
  }
}
